const db=require('./databaseManager');
const codeforces=require('./codeforces');
const telegram=require('./telegram');
const fs=require('node:fs/promises');
const { default: puppeteer } = require('puppeteer');

const CONTEST_TYPES_TO_INCLUDE=[codeforces.ContestType.EDUCATIONAL,
                                codeforces.ContestType.DIV2,
                                codeforces.ContestType.DIV3,
                                codeforces.ContestType.DIV4];

// Ensure we don't inform about the contest too early
const INFORM_CONTEST_BEFORE_SECONDS=26*60*60; // 26 Hrs

async function main(){
    await updateContests();
    await new Promise(r => setTimeout(r, 2000));
    await updateStandings();
    await new Promise(r => setTimeout(r, 2000));
    await updateRatingChanges();
}
main();

// Informs new contests
async function updateContests(){
    const contestList=await codeforces.getUpcomingContests();

    let newInformedContestIds=[];
    let informedContestIds=await db.getInformedContestIds();
    for(let i=0;i<contestList.length;i++){
        let contest=contestList[i];
        if(!informedContestIds.includes(contest.id) && CONTEST_TYPES_TO_INCLUDE.includes(contest.type) && -contest.relativeTime<INFORM_CONTEST_BEFORE_SECONDS){
            try{
                let result=await informContest(contest.id,contest.name,contest.startTime);
                if(result){
                    console.log("Informed contest "+contest.id);
                    newInformedContestIds.push(contest.id);
                }
                else{
                    console.log("Failed to inform contest "+contest.id);
                }
            }
            catch(error){
                console.log("Something went wrong");
            };
        }
    }
    if(newInformedContestIds.length>0){
        await db.updateInformedContestIds(newInformedContestIds,informedContestIds);
    }
}

// Informs standings
async function updateStandings(){
    const contestList=await codeforces.getPastContests();

    const informedContests=await db.getInformedContestIds();
    const standingsInformedContests=await db.getStandingsInformedContestIds();
    let newStandingsInformedContestIds=[];
    for(let i=0;i<contestList.length;i++){
        let contest=contestList[i];
        
        // Skip when contest was never informed or contest standings were already informed
        if(!informedContests.includes(contest.id) || standingsInformedContests.includes(contest.id)) continue;
        
        let result=await postStandings(contest.id);

        if(result){
            console.log("Informed contest standings " + contest.id);
            newStandingsInformedContestIds.push(contest.id);
        }
        else{
            console.log("Failed to inform contest standings " + contest.id);
        }

    }
    if(newStandingsInformedContestIds.length>0){
        await db.updateStandingsInformedContestIds(newStandingsInformedContestIds, standingsInformedContests);
    }

}

// Informs rating changes
async function updateRatingChanges(){
    const contestList = await codeforces.getPastContests();

    const informedContests=await db.getInformedContestIds();
    const standingsInformedContests=await db.getStandingsInformedContestIds();
    const ratingChangesInformedContests=await db.getRatingsChangesInformedContestIds();
    let newRatingChangesInformedContestIds=[];
    for(let i=0;i<contestList.length;i++){
        let contest=contestList[i];
        
        // Skip when contest or its standings were never informed or contest ratings changes were already informed
        if(!informedContests.includes(contest.id) || !standingsInformedContests.includes(contest.id) || ratingChangesInformedContests.includes(contest.id)) continue;
        
        let result=await postRatingChanges(contest.id);

        if(result){
            console.log("Informed contest standings " + contest.id);
            newRatingChangesInformedContestIds.push(contest.id);
        }
        else{
            console.log("Failed to inform contest standings " + contest.id);
        }

    }
    if(newRatingChangesInformedContestIds.length>0){
        await db.updateRatingChangesInformedContestIds(newRatingChangesInformedContestIds, ratingChangesInformedContests);
    }
}

async function informContest(contestId,contestName,contestStartTime){
    let message=contestName+"\n";
    message+="https://codeforces.com/contests/"+contestId+"\n";
    message+="At "+getTimeString(contestStartTime)+" on "+getDateString(contestStartTime)+".";
    let result=await telegram.sendMessage(message);
    return result;
}

function getTimeString(time){
    const date = new Date(time*1000);
    const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

    return formattedTime;
}

function getDateString(time){
    const date = new Date(time*1000);   
    const day = date.getUTCDate().toString().padStart(2, '0'); // Get the day and pad with leading zeros if necessary
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Get the month (zero-based) and add 1, then pad with leading zeros if necessary
    const year = date.getUTCFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}


const USER_HANDLES_FILE=__dirname+"/databaseFiles/codeforcesHandles.json";

async function postStandings(contestId){
    try{
        let contestStandings=await fetch("https://codeforces.com/api/contest.standings?contestId="+contestId);
        contestStandings=await contestStandings.json();

        if(contestStandings.status!='OK') return false;
        
        let userHandles=await fs.readFile(USER_HANDLES_FILE, { encoding: 'utf8' });
        userHandles=JSON.parse(userHandles).handles;

        let handlesQ="";
        userHandles.forEach(handle => {
            handlesQ+=handle+";";
        });
        let userDetails=await fetch("https://codeforces.com/api/user.info?handles="+handlesQ);
        userDetails=await userDetails.json();

        if(userDetails.status!='OK') return false;

        await createStandingsImage(userHandles,userDetails,contestStandings);

        const response=await postStandingsImage();
        return response;
    }
    catch(error){
        console.log(error);
        return false;
    }
}

async function createStandingsImage(handles,userDetails,contestStandings){
    const browser=await puppeteer.launch();
    const page=await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor:2 });
    await page.goto('file://'+__dirname+'/public_html/index.html');
    await page.evaluate((handles,userDetails,contestStandings)=>{
        let data=contestStandings;
        if(data.status=="OK"){
            var handleDetails;
                if(userDetails.status=="OK"){
                    handleDetails=userDetails.result;
                    data=data.result;   
                    if(data.contest.relativeTimeSeconds>=data.contest.durationSeconds){
                        const standingsDisplay=document.getElementById("standings-outer");
                        standingsDisplay.querySelector('.standings-contest-name').textContent=data.contest.name;
                        
                        const standingsTopBar=standingsDisplay.querySelector('.standings-container').querySelector('.standings-top-container');
                        data.problems.forEach(problem => {
                            const problemTag=document.createElement("div");
                            problemTag.className="standings-top-problem-tag dynamic-tag";
                            const ptag=document.createElement("p");
                            ptag.className="p-tag";
                            ptag.textContent=problem.index;
                            problemTag.appendChild(ptag);
                            standingsTopBar.appendChild(problemTag);
                        });

                        const contestentDisplayTemplate=document.getElementById("standings-individual-template");
                        const contestentDisplayContainer=document.getElementById("standings-container");
                        var cnt=0;
                        data.rows.forEach(content => {
                            var contentHandle=content.party.members[0].handle;
                            var fnd=false;
                            var ind=0;
                            handles.forEach(handle => {
                                if(contentHandle==handle){
                                    fnd=true;                          
                                }
                                if(!fnd) {
                                    ind++;  
                                }  
                            });
                            if(fnd){
                                cnt++;
                                const contestentDisplay=contestentDisplayTemplate.cloneNode(true);
                                if(cnt%2==0){
                                    contestentDisplay.style.background='rgb(240,240,240)';
                                }
                                contestentDisplay.className="standings-individual-outer dynamic-standings";
                                contestentDisplay.querySelector(".standings-individual-rank").querySelector("p")
                                .textContent=cnt +"("+content.rank+")";

                                contestentDisplay.querySelector(".standings-individual-handle").querySelector("p")
                                .textContent=content.party.members[0].handle;
                                if(handleDetails[ind].hasOwnProperty("rating")){
                                    contestentDisplay.querySelector(".standings-individual-handle")
                                    .style.color=getColor(handleDetails[ind].rating);
                                }
                                
                                contestentDisplay.querySelector('.standings-individual-points').querySelector('p')
                                .textContent=content.points;
                                content.problemResults.forEach(pData=>{
                                    var pointsDiv=document.createElement("div");
                                    pointsDiv.className="standings-individual-problem-status";
                                    var pointsP=document.createElement("p");
                                    if(pData.points>0){
                                        pointsP.textContent="+"+pData.points;
                                    }
                                    else{
                                        if(pData.rejectedAttemptCount>0){
                                            pointsP.textContent="-"+pData.rejectedAttemptCount;
                                            pointsDiv.style.color='red';
                                        }
                                        else{
                                            pointsP.textContent="0";
                                            pointsDiv.style.color='grey';

                                        }

                                    }
                                    pointsDiv.appendChild(pointsP);
                                    contestentDisplay.appendChild(pointsDiv);
                                });
                                contestentDisplayContainer.appendChild(contestentDisplay);

                            }
                        });
                    }
                    else{
                        alert("Cant post standings of the selected contest");
                    }
                    //------------------
                }
                else{
                    console.log(userDetails);
                    throw new Error('Failed To fetch user details');

                }
        }         
       
    },handles,userDetails,contestStandings);
    content=await page.$(".standings-outer");
    await content.screenshot({ path: __dirname+'/standings.png' });
    await page.close();
    await browser.close();
}

async function postStandingsImage(){
    return await telegram.sendImage(__dirname+"/standings.png");
    
}

async function postRatingChanges(contestId){
    try{
        let ratingChanges=await fetch("https://codeforces.com/api/contest.ratingChanges?contestId="+contestId);
        ratingChanges=await ratingChanges.json();

        if(ratingChanges.status!='OK') return false;
        
        let userHandles=await fs.readFile(USER_HANDLES_FILE, { encoding: 'utf8' });
        userHandles=JSON.parse(userHandles).handles;

        let handlesQ="";
        userHandles.forEach(handle => {
            handlesQ+=handle+";";
        });
        let userDetails=await fetch("https://codeforces.com/api/user.info?handles="+handlesQ);
        userDetails=await userDetails.json();

        if(userDetails.status!='OK') return false;

        await createRatingChangesImage(userHandles,ratingChanges);

        const response=await postRatingChangesImage();
        return response;
    }
    catch(error){
        console.log(error);
        return false;
    }
}

let congratulationsCaption="";
async function createRatingChangesImage(handles,contestRatingChanges){
    const browser=await puppeteer.launch();
    const page=await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor:2 });
    await page.goto('file://'+__dirname+'/public_html/index.html');
    let captionMessage="";
    const evaluation=await page.evaluate((handles,contestRatingChanges)=>{
        let data=contestRatingChanges;
        data=data.result;
        var cnt=0;
        const ratingChangesTemplate=document.getElementById("ratingChange-individual-template");
        const ratingChangesContainer=document.getElementById("ratingChanges-container");
        document.getElementById("ratingChanges-outer").querySelector(".ratingChanges-contest-name")
        .querySelector("p").textContent=data[0].contestName;
        var congratulationsCaption="";
        data.forEach(party=>{
            var fnd=false;
            handles.forEach(handle=>{
                if(handle==party.handle){
                    fnd=true;
                }
            });
            if(fnd){
                cnt+=1;
                const ratingChangeNew=ratingChangesTemplate.cloneNode(true);
                if(cnt%2==0){
                    ratingChangeNew.style.background='rgb(240,240,240)';
                }
                ratingChangeNew.className="ratingChange-individual-outer dynamic-ratingChanges-element";
                ratingChangeNew.querySelector(".standings-individual-rank").querySelector("p")
                .textContent=cnt+"("+party.rank+")";

                ratingChangeNew.querySelector(".standings-individual-handle").querySelector("p")
                .textContent=party.handle;
                ratingChangeNew.querySelector(".standings-individual-handle").style.color=getColor(party.oldRating);

                ratingChangeNew.querySelector(".ratingChange-individual-delta").querySelector("p")
                .textContent="+"+(party.newRating-party.oldRating);
                if(party.newRating-party.oldRating<=0){
                    ratingChangeNew.querySelector(".ratingChange-individual-delta").querySelector("p")
                .textContent=party.newRating-party.oldRating;
                    ratingChangeNew.querySelector(".ratingChange-individual-delta").style.color='rgb(255,0,0)';
                }

                ratingChangeNew.querySelector(".ratingChange-individual-from").querySelector("p")
                .textContent=party.oldRating;
                ratingChangeNew.querySelector(".ratingChange-individual-from").style.color=getColor(party.oldRating);

                ratingChangeNew.querySelector(".ratingChange-individual-to").querySelector("p")
                .textContent=party.newRating;
                ratingChangeNew.querySelector(".ratingChange-individual-to").style.color=getColor(party.newRating);
                
                if(getColor(party.oldRating)!=getColor(party.newRating)){
                    ratingChangeNew.querySelector(".ratingChange-individual-comment").querySelector("p")
                    .textContent="Became "+getLevel(party.newRating);
                    ratingChangeNew.querySelector(".ratingChange-individual-comment")
                    .style.color=getColor(party.newRating);
                    if(party.newRating>party.oldRating){
                        congratulationsCaption+="Congratulations to "+party.handle+" for becoming "+getLevel(party.newRating)+"\n\n";
                    }
                }

                ratingChangesContainer.appendChild(ratingChangeNew);
            }
        });

        return{
            caption:congratulationsCaption
        };

    },handles,contestRatingChanges);
    congratulationsCaption=evaluation.caption;
    content=await page.$(".ratingChanges-outer");
    await content.screenshot({ path: __dirname+'/ratingChanges.png' });
    await page.close();
    await browser.close();
}

async function postRatingChangesImage(){
    return await telegram.sendImage(__dirname+"/ratingChanges.png",congratulationsCaption);
    
}