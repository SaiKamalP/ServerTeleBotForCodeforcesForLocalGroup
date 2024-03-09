const ContestType={
    DIV1:"Div. 1",
    DIV2:"Div. 2",
    DIV3:"Div. 3",
    DIV4:"Div. 4",
    EDUCATIONAL:"Educational",
    MISC:"Misc",
};

function determineContestType(contestName){
    if(contestName.includes(ContestType.EDUCATIONAL)) return ContestType.EDUCATIONAL;
    if(contestName.includes(ContestType.DIV4)) return ContestType.DIV4;
    if(contestName.includes(ContestType.DIV3)) return ContestType.DIV3;
    if(contestName.includes(ContestType.DIV2)) return ContestType.DIV2;
    if(contestName.includes(ContestType.DIV1)) return ContestType.DIV1;
    return ContestType.MISC;
}

async function getUpcomingContests() {
    try{
        let upcomingContests=[];

        let response=await fetch("https://codeforces.com/api/contest.list");
        response=await response.json();
        let data=response.result;

        for(let i=0;i<data.length;i++){
            let contest=data[i];

            if(contest.phase!="BEFORE") break; // As all contest from here would be already running or finished

            upcomingContests.push({
                "id" : contest.id,
                "type" : determineContestType(contest.name),
                "name": contest.name,
                "startTime" : contest.startTimeSeconds,
                "relativeTime" : contest.relativeTimeSeconds
            });
        }

        return upcomingContests;
    }
    catch(error){
        console.log("Couldn't fetch contests list");
        console.log(error);
        return [];
    }
    
}

module.exports={
    ContestType: ContestType,
    getUpcomingContests: getUpcomingContests
};
