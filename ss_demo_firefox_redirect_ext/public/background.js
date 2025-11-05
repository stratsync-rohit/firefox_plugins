chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "open_popup") {
    chrome.windows.create({
      url: chrome.runtime.getURL("dist/index.html"),
      type: "popup",
      width:1200,
      height: 200
    });
  }
});
