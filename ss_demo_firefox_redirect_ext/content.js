
(function () {
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


  if (document.readyState === "complete" || document.readyState === "interactive") {
    ensureButton();
  } else {
    window.addEventListener("DOMContentLoaded", ensureButton);
    window.addEventListener("load", ensureButton);
  }

  // Watch for SPA navigation on YouTube
  (function hookHistory() {
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
    window.addEventListener("locationchange", () => setTimeout(ensureButton, 200));
  })();

  
  const obs = new MutationObserver(() => ensureButton());
  obs.observe(document.documentElement || document, { childList: true, subtree: true });
})();
