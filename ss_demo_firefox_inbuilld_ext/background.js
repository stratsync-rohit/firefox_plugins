
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'PING') {
    sendResponse({ pong: true });
  }

  return false;
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "logout") {
    chrome.identity.getAuthToken({interactive: false}, function(token) {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          console.log("AuthToken removed");
          sendResponse({ loggedOut: true });
        });
      } else sendResponse({ loggedOut: true });
    });
    return true;
  }
});
