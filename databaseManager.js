const fs=require('node:fs/promises');
const path=require('path');

const SCRIPT_DIR=__dirname;

const MAX_CONTESTS_IN_DB=10;
const INFORMED_CONTESTS_FILE=path.join(SCRIPT_DIR,'informedContests.json');

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
module.exports={
    getInformedContestIds:getInformedContestIds,
    updateInformedContestIds: updateInformedContestIds
};