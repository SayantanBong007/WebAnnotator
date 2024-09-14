chrome.runtime.onInstalled.addListener(() => {
  console.log("Web Annotator installed.");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveAnnotation") {
    console.log("Saving annotations for URL:", request.url);
    console.log("Annotations to save:", request.annotations);
    chrome.storage.local.set({ [request.url]: request.annotations }, () => {
      console.log("Annotations saved.");
      sendResponse({ status: "success" });
    });
    return true; // Make sure to return true to indicate that sendResponse will be called asynchronously
  } else if (request.action === "getAnnotations") {
    console.log("Getting annotations for URL:", request.url);
    chrome.storage.local.get([request.url], (result) => {
      console.log("Annotations retrieved:", result[request.url]);
      sendResponse({ annotations: result[request.url] || [] });
    });
    return true; // Similarly, return true here as well
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-highlighter") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "toggleHighlighter" });
      });
    }
  });
});