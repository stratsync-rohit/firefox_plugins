
console.log("Service worker loaded.");


function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("Background worker installed.");
});

/**
 * 
 * @param {Object} options 
 * @returns {Promise<string>}
 */
function getAuthTokenAsync(options = { interactive: false }) {
  return new Promise((resolve, reject) => {
    if (!chrome.identity || !chrome.identity.getAuthToken) {
      return reject(new Error("chrome.identity API not available"));
    }
    chrome.identity.getAuthToken(options, (token) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(token);
    });
  });
}

/**
 * Helper: remove cached token
 * @param {string} token
 * @returns {Promise<void>}
 */
function removeCachedTokenAsync(token: string): Promise<void> {
  return new Promise<void>((resolve) => {
    if (!chrome.identity || !chrome.identity.removeCachedAuthToken) {
     
      return resolve();
    }
    chrome.identity.removeCachedAuthToken({ token }, () => {
      resolve();
    });
  });
}

/**
 * Try to revoke token at Google OAuth endpoint (best-effort).
 * @param {string} token
 * @returns {Promise<void>}
 */
async function revokeTokenAtGoogle(token?: string): Promise<void> {
  if (!token) return;
  try {
   
    const r = await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${encodeURIComponent(token)}`, {
      method: "POST",
     
    });
    if (!r.ok) {
      console.warn("Google token revoke returned non-OK:", r.status, await r.text().catch(() => ""));
    } else {
      console.log("Token revoked at Google.");
    }
  } catch (err: unknown) {
    console.warn("Failed to revoke token at Google (ignored):", getErrorMessage(err));
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
 
  if (msg && msg.type === "login") {
    (async () => {
      if (!chrome.identity || !chrome.identity.getAuthToken) {
        sendResponse({ error: "chrome.identity API not available" });
        return;
      }

      try {
      
        const token = await getAuthTokenAsync({ interactive: true });

        if (!token) {
          sendResponse({ error: "No auth token returned" });
          return;
        }

  
        let user = null;
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            user = await res.json();
          } else {
            console.warn("Userinfo fetch non-ok:", res.status, await res.text().catch(() => ""));
          }
        } catch (err) {
          console.warn("Failed to fetch userinfo:", err);
        }

     
        try {
          const email = user && user.email ? String(user.email).toLowerCase() : "";
          const allowed = !!email && email.endsWith("@stratsync.ai");

          if (!allowed) {
            console.warn("Background: unauthorized email domain:", email);
           
            try {
              await revokeTokenAtGoogle(String(token));
            } catch (e) {
              console.warn("Error revoking token at Google");
            }
            try {
              await removeCachedTokenAsync(String(token));
            } catch (e) {
              console.warn("Error removing cached token");
            }

            sendResponse({ error: "unauthorized", reason: "email domain not allowed" });
            return;
          }

          sendResponse({ accessToken: token, user });
        } catch (err: unknown) {
          console.warn("Background: error during domain check:", err);
          sendResponse({ error: "internal_error", details: String(err) });
        }
      } catch (err: unknown) {
        console.error("Login flow error:", err);
     
        const message = getErrorMessage(err);
        sendResponse({ error: message });
      }
    })();

 
    return true;
  }


  if (msg && msg.type === "logout") {
    (async () => {
      if (!chrome.identity || !chrome.identity.getAuthToken) {
        sendResponse({ loggedOut: true, note: "chrome.identity not available" });
        return;
      }

      try {
        const token = await getAuthTokenAsync({ interactive: false }).catch(() => null);
        const t = token ? String(token) : "";

        if (t) {
       
          await revokeTokenAtGoogle(t);
         
          await removeCachedTokenAsync(t);
          console.log("Token removed and revoked (if possible).");
          sendResponse({ loggedOut: true });
        } else {
      
          sendResponse({ loggedOut: true });
        }
      } catch (err: unknown) {
        console.warn("Logout flow error (attempting to clean up):", err);
      
        try {
          const maybeToken = (await getAuthTokenAsync({ interactive: false }).catch(() => null)) || "";
          if (maybeToken) await removeCachedTokenAsync(String(maybeToken));
        } catch (e) {
      
        }
        sendResponse({ loggedOut: true, error: getErrorMessage(err) });
      }
    })();

   
    return true;
  }

  return false;
});
