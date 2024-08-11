const fs=require('node:fs/promises');
const path=require('path');

const SCRIPT_DIR=__dirname;

const MAX_CONTESTS_IN_DB=100;
const INFORMED_CONTESTS_FILE=path.join(SCRIPT_DIR,'databaseFiles/informedContests.json');
const STANDINGS_INFORMED_CONTESTS_FILE=path.join(SCRIPT_DIR,'databaseFiles/standingsInformedContests.json');
const RATING_CHANGES_INFORMED_CONTESTS_FILE=path.join(SCRIPT_DIR,'databaseFiles/ratingChangesInformedContests.json');

async function getInformedContestIds(){
    let result=await fs.readFile(INFORMED_CONTESTS_FILE, { encoding: 'utf8' });
    return JSON.parse(result);
};

async function updateInformedContestIds(newInformedContests,alreadyInformedContests) {
    let finalListToSave=newInformedContests;
    for(let i=0;i<alreadyInformedContests.length;i++){
        if(finalListToSave.length<MAX_CONTESTS_IN_DB){
            finalListToSave.push(alreadyInformedContests[i]);
        }
        else{
            break;
        }
    }
    await fs.writeFile(INFORMED_CONTESTS_FILE,JSON.stringify(finalListToSave));
}

async function getStandingsInformedContestIds(){
    let result=await fs.readFile(STANDINGS_INFORMED_CONTESTS_FILE, { encoding: 'utf8' });
    return JSON.parse(result);
};

async function updateStandingsInformedContestIds(newInformedContests,alreadyInformedContests) {
    let finalListToSave=newInformedContests;
    for(let i=0;i<alreadyInformedContests.length;i++){
        if(finalListToSave.length<MAX_CONTESTS_IN_DB){
            finalListToSave.push(alreadyInformedContests[i]);
        }
        else{
            break;
        }
    }
    await fs.writeFile(STANDINGS_INFORMED_CONTESTS_FILE,JSON.stringify(finalListToSave));
}

async function getRatingsChangesInformedContestIds(){
    let result=await fs.readFile(RATING_CHANGES_INFORMED_CONTESTS_FILE, { encoding: 'utf8' });
    return JSON.parse(result);
};

async function updateRatingChangesInformedContestIds(newInformedContests,alreadyInformedContests) {
    let finalListToSave=newInformedContests;
    for(let i=0;i<alreadyInformedContests.length;i++){
        if(finalListToSave.length<MAX_CONTESTS_IN_DB){
            finalListToSave.push(alreadyInformedContests[i]);
        }
        else{
            break;
        }
    }
    await fs.writeFile(RATING_CHANGES_INFORMED_CONTESTS_FILE,JSON.stringify(finalListToSave));
}



module.exports={
    getInformedContestIds:getInformedContestIds,
    updateInformedContestIds: updateInformedContestIds,

    getStandingsInformedContestIds:getStandingsInformedContestIds,
    updateStandingsInformedContestIds:updateStandingsInformedContestIds,

    getRatingsChangesInformedContestIds:getRatingsChangesInformedContestIds,
    updateRatingChangesInformedContestIds:updateRatingChangesInformedContestIds
};