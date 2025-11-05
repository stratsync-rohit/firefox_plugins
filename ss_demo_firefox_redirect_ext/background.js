
chrome.action.onClicked.addListener((tab) => {
  console.log("action clicked — creating window");
  chrome.windows.create({
    url: chrome.runtime.getURL("dist/index.html"),
    type: "popup",
    width: 400,
    height: 600,
    left: Math.round((screen.availWidth - 400) / 2),
    top: Math.round((screen.availHeight - 600) / 4)
  }, (newWindow) => {
    if (chrome.runtime.lastError) {
      console.error("create window error:", chrome.runtime.lastError.message);
    } else {
      console.log("window opened:", newWindow && newWindow.id);
    }
  });
});
