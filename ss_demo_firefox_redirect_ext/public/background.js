// background-wrapper.js (MV2 version)
console.log("Background script loaded — StratSync ready");

chrome.browserAction.onClicked.addListener(function (tab) {
  console.log("Action clicked — creating window");

  const width = 400;
  const height = 600;
  const left = Math.round((screen.availWidth - width) / 2);
  const top = Math.round((screen.availHeight - height) / 4);

  chrome.windows.create(
    {
      url: chrome.runtime.getURL("dist/index.html"),
      type: "popup",
      width: width,
      height: height,
      left: left,
      top: top
    },
    function (newWindow) {
      if (chrome.runtime.lastError) {
        console.error("Create window error:", chrome.runtime.lastError.message);
      } else {
        console.log("Window opened:", newWindow && newWindow.id);
      }
    }
  );
});
