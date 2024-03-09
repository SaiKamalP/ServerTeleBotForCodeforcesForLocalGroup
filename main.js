const db=require('./databaseManager');
const codeforces=require('./codeforces');
const telegram=require('./telegram');

const CONTEST_TYPES_TO_INCLUDE=[codeforces.ContestType.EDUCATIONAL,
                                codeforces.ContestType.DIV2,
                                codeforces.ContestType.DIV3,
                                codeforces.ContestType.DIV4];

// Ensure we don't inform about the contest too early
const INFORM_CONTEST_BEFORE_SECONDS=26*60*60; // 26 Hrs

//Inform upcoming contests
codeforces.getUpcomingContests().then(async contestList=>{
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

   
});

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