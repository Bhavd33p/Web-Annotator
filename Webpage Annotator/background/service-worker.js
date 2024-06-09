chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    if(message.type == "CHANGE_PROPERTIES"){
        console.log(message.type);
        chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
            chrome.tabs.sendMessage(tabs[0].id, message);
        });
    }
});

chrome.commands.onCommand.addListener((command)=>{
  if(command === "textMarker"){
    const className = "text-marker";
    chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id, {type: "SHORTCUT", className});
    });
  }
  else{
    const className = command;
    chrome.tabs.query({active:true, currentWindow:true}, (tabs)=>{
      chrome.tabs.sendMessage(tabs[0].id,  {type: "SHORTCUT", className});
    });
  }
})