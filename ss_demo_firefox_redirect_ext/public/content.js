
(() => {
  const BTN_ID = "stratsync-floating-btn";

  function createButton() {
   
    return null;
  }

  
  function ensureButton() {
    try {
      createButton();
    } catch (err) {
    
      console.warn("StratSync: ensureButton failed", err);
    }
  }


  function hookHistoryEvents() {
    const push = history.pushState;
    const replace = history.replaceState;
    history.pushState = function () {
      const res = push.apply(this, arguments);
      window.dispatchEvent(new Event("locationchange"));
      return res;
    };
    history.replaceState = function () {
      const res = replace.apply(this, arguments);
      window.dispatchEvent(new Event("locationchange"));
      return res;
    };
    window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")));
    window.addEventListener("locationchange", () => {
     
      setTimeout(ensureButton, 250);
    });
  }

  
  function observeDOM() {
    const observer = new MutationObserver(() => ensureButton());
    observer.observe(document.documentElement || document, { childList: true, subtree: true });
  }

  // start
  ensureButton();
  hookHistoryEvents();
  observeDOM();
})();
