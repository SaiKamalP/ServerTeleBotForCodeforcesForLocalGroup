const fs=require("fs");
const TelegramBot=require('node-telegram-bot-api');

let token="jfdshkjhfdsahv9df9uv8dasuoifdu9fdu9fuds90fd"; //Replace with your token
let pre="https://api.telegram.org/bot"+token+"/";
let chatId=-9480329043;  //Replace with your chatId.

async function executeCommand(x){
    await new Promise(pause=>setTimeout(pause,1000));
    let response=await fetch(x);
    return response;
}

async function sendMessage(x){
    let method="sendMessage?"
    const params = new URLSearchParams({
        chat_id:chatId,
        text:x
    });
    let post=params.toString();
    let final=pre+method+post;
    try{
        let response=await executeCommand(final);
        response=await response.json();
        if(response['ok']==true){
            return true;
        }
        else {
            console.log(response);
            return false;
        }
    }
    catch(error){
        console.log(error);
        return false;
    }
}

async function sendImage(imagePath,captionMessage=""){
    const bot=new TelegramBot(token);
    try{
        await bot.sendPhoto(chatId,fs.readFileSync(imagePath),{caption:captionMessage});
        return true;
    }
    catch(error){
        console.log(error);
        return false;
    }
    
   
}

module.exports={
    sendMessage:sendMessage,
    sendImage:sendImage
}

  
  