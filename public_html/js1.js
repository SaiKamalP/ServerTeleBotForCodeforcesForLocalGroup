function getColor(x){
    if(x<1200){
        return 'rgb(128,128,128)';
    }
    if(x<1400){
        return 'rgb(0,128,0)';
    }
    if(x<1600){
        return 'rgb(3,168,158)';
    }
    if(x<1900){
        return 'rgb(0,0,255)';

    }
    if(x<2100){
        return 'rgb(170,0,170)';

    }
    if(x<2300){
        return 'rgb(254,152,12)';

    }
    if(x<2400){
        return 'rgb(255,141,36)';

    }
    if(x<2600){
        return 'rgba(255,0,0,255)';

    }
    return 'rgb(239,35,36)';
}
function getLevel(x){
    if(x<1200){
        return "Newbie";
    }
    if(x<1400){
        return 'Pupil';
    }
    if(x<1600){
        return 'Specialist';
    }
    if(x<1900){
        return 'Expert';

    }
    if(x<2100){
        return 'Candidate Master';

    }
    if(x<2300){
        return 'Master';

    }
    if(x<2400){
        return 'International Master';

    }
    if(x<2600){
        return 'Grandmaster';

    }
    if(x<3000){
        return 'International Grandmaster';

    }
    return 'Legendary Grandmaster';
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