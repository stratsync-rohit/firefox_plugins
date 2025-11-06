// import React, { useState, useEffect, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import ChatWindow from "./components/ChatWindow";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [user, setUser] = useState<any>(null);
//   const [isSigningIn, setIsSigningIn] = useState(false);
//   const [showLogin, setShowLogin] = useState(true);
//   const [showUnauthorized, setShowUnauthorized] = useState(false);

//   const isChromeIdentityAvailable = () =>
//     typeof window !== "undefined" && !!(window.chrome && chrome.identity);

//   const updateUI = useCallback(
//     async (showOverlay = false): Promise<boolean> => {
//       if (!isChromeIdentityAvailable()) {
//         console.warn("chrome.identity is not available in this environment.");
//         setIsLoggedIn(false);
//         setUser(null);
//         setShowLogin(true);
//         return false;
//       }

//       try {
//         return await new Promise<boolean>((resolve) => {
//           chrome.identity.getAuthToken(
//             { interactive: false },
//             async (token) => {
//               console.log("Retrieved token (silent):", token);

//               if (chrome.runtime.lastError || !token) {
//                 setIsLoggedIn(false);
//                 setUser(null);
//                 setShowLogin(true);
//                 resolve(false);
//                 return;
//               }

//               try {
//                 const res = await fetch(
//                   "https://www.googleapis.com/oauth2/v2/userinfo",
//                   {
//                     headers: { Authorization: "Bearer " + token },
//                   }
//                 );

//                 if (res.ok) {
//                   const data = await res.json();

//                   const email: string | undefined =
//                     data && data.email
//                       ? String(data.email).toLowerCase()
//                       : undefined;
//                   const allowed = !!email && email.endsWith("@stratsync.ai");

//                   if (allowed) {
//                     setUser(data);
//                     setIsLoggedIn(true);
//                     setShowLogin(false);
//                     setShowUnauthorized(false);
//                     resolve(true);
//                   } else {
//                     console.warn("Unauthorized email domain:", email);

//                     setIsLoggedIn(false);
//                     setUser(null);
//                     setShowLogin(false);
//                     setShowUnauthorized(true);

//                     try {
//                       if (token) {
//                         fetch(
//                           "https://accounts.google.com/o/oauth2/revoke?token=" +
//                             String(token)
//                         ).catch(() => {});
//                         try {
//                           chrome.identity.removeCachedAuthToken(
//                             { token: String(token) },
//                             () => {}
//                           );
//                         } catch (e) {
//                           console.error("Error removing cached auth token:");
//                         }
//                       }
//                     } catch (e) {
//                       console.error("Error during token cleanup:");
//                     }

//                     resolve(false);
//                   }
//                 } else {
//                   console.error(
//                     "Failed to fetch userinfo:",
//                     res.status,
//                     await res.text()
//                   );
//                   setIsLoggedIn(false);
//                   setUser(null);
//                   setShowLogin(true);
//                   resolve(false);
//                 }
//               } catch (err) {
//                 console.error("Network error fetching userinfo:", err);
//                 setIsLoggedIn(false);
//                 setUser(null);
//                 setShowLogin(true);
//                 resolve(false);
//               }
//             }
//           );
//         });
//       } catch (err) {
//         console.error("updateUI error:", err);
//         setIsLoggedIn(false);
//         setUser(null);
//         setShowLogin(true);
//         return false;
//       }
//     },
//     []
//   );

//   const handleGoogleLogin = () => {
//     console.log("Initiating Google login...");
//     if (!isChromeIdentityAvailable()) {
//       toast.error("Sign-in not available: chrome.identity not detected.");
//       return;
//     }

//     setIsSigningIn(true);
//     chrome.identity.getAuthToken({ interactive: true }, async (token) => {
//       const err = chrome.runtime && chrome.runtime.lastError;
//       const errMsg =
//         err && err.message ? String(err.message).toLowerCase() : "";

//       const isUserCancel =
//         errMsg.includes("user") &&
//         (errMsg.includes("cancel") ||
//           errMsg.includes("did not approve") ||
//           errMsg.includes("denied") ||
//           errMsg.includes("did not authorize"));

//       if (err || !token) {
//         console.error("Login failed:", err || "no token received");

//         if (!isUserCancel) {
//           toast.error(
//             err
//               ? `Login failed: ${err.message}`
//               : "Login failed: No token received"
//           );
//         } else {
//           console.info("Login cancelled by user.");
//         }

//         setIsSigningIn(false);
//         return;
//       }

//       try {
//         const allowed = await updateUI(true);
//         setIsSigningIn(false);
//         if (allowed) {
//           toast.success("Signed in successfully!", { autoClose: 2000 });
//         } else {
//           toast.error("Unauthorized Access!");
//         }
//       } catch (e) {
//         setIsSigningIn(false);
//         toast.error("Login error");
//       }
//     });
//   };

//   const handleSignOut = useCallback(() => {
//     if (!isChromeIdentityAvailable()) {
//       setIsLoggedIn(false);
//       setUser(null);
//       setShowLogin(true);
//       toast.info("Signed out (local).");
//       return;
//     }

//     chrome.identity.getAuthToken({ interactive: false }, (token) => {
//       if (token) {
//         const t = String(token);

//         fetch("https://accounts.google.com/o/oauth2/revoke?token=" + t)
//           .then(() => {
//             chrome.identity.removeCachedAuthToken({ token: t }, () => {
//               setIsLoggedIn(false);
//               setUser(null);
//               setShowLogin(true);
//               toast.info("Signed out successfully");
//             });
//           })
//           .catch((err) => {
//             console.warn("Revoke failed, still removing cached token:", err);
//             chrome.identity.removeCachedAuthToken({ token: t }, () => {
//               setIsLoggedIn(false);
//               setUser(null);
//               setShowLogin(true);
//               toast.info("Signed out (partial).");
//             });
//           });
//       } else {
//         setIsLoggedIn(false);
//         setUser(null);
//         setShowLogin(true);
//         toast.info("Signed out");
//       }
//     });
//   }, []);

//   useEffect(() => {
//     updateUI();

//     function messageHandler(
//       message: any,
//       _sender: chrome.runtime.MessageSender,
//       sendResponse?: (response?: any) => void
//     ): boolean | void {
//       if (message === "logout") {
//         handleSignOut();

//         try {
//           sendResponse && sendResponse({ ok: true });
//         } catch (e) {}
//         return true;
//       }
//       return false;
//     }

//     if (
//       typeof chrome !== "undefined" &&
//       chrome.runtime &&
//       chrome.runtime.onMessage
//     ) {
//       chrome.runtime.onMessage.addListener(messageHandler);
//     }

//     return () => {
//       if (
//         typeof chrome !== "undefined" &&
//         chrome.runtime &&
//         chrome.runtime.onMessage
//       ) {
//         try {
//           chrome.runtime.onMessage.removeListener(messageHandler);
//         } catch (e) {
//           console.error("Error removing listener");
//         }
//       }
//     };
//   }, [updateUI, handleSignOut]);

//   return (
//     <div className="relative w-full h-full overflow-hidden">
//       <ToastContainer
//         position="top-right"
//         autoClose={1500}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         pauseOnHover
//         draggable
//       />
//       <div
//         className={`transition-all duration-300 ${
//           showLogin || showUnauthorized ? "blur-sm pointer-events-none" : ""
//         }`}
//       >
//         <ChatWindow />
//       </div>

//       {(showLogin || showUnauthorized) && (
//         <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
//       )}

//       {/* Login Screen */}
//       <AnimatePresence>
//         {showLogin && !isLoggedIn && (
//           <motion.div
//             className="absolute inset-0 flex items-center justify-center z-20 p-4"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//           >
//             <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border border-gray-100">
//               <h2 className="text-2xl font-semibold text-gray-800 mb-6">
//                 Welcome to StratSync
//               </h2>
//               <p className="text-gray-500 mb-8">
//                 Sign in to continue to your AI co-pilot for customer success and
//                 growth.
//               </p>
//               <button
//                 onClick={handleGoogleLogin}
//                 disabled={isSigningIn}
//                 className={`flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg transition font-medium shadow-sm ${
//                   isSigningIn
//                     ? "opacity-50 cursor-not-allowed"
//                     : "hover:bg-gray-100"
//                 }`}
//               >
//                 {isSigningIn ? (
//                   <>
//                     <svg
//                       className="w-5 h-5 animate-spin text-gray-600"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                       ></path>
//                     </svg>
//                     Signing in...
//                   </>
//                 ) : (
//                   <>
//                     <img
//                       src="https://www.svgrepo.com/show/475656/google-color.svg"
//                       alt="Google logo"
//                       className="w-5 h-5"
//                     />
//                     Login with Google
//                   </>
//                 )}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {showUnauthorized && !isLoggedIn && (
//           <motion.div
//             className="absolute inset-0 flex items-center justify-center z-20 p-4"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             exit={{ opacity: 0, scale: 0.9 }}
//           >
//             <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border">
//               <h2 className="text-2xl font-semibold text-red-600 mb-4">
//                 Unauthorized Access!
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Please contact the StratSync team for assistance.
//               </p>
//               <button
//                 onClick={() => {
//                   setShowUnauthorized(false);
//                   setShowLogin(true);
//                 }}
//                 className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
//               >
//                 Go Back to Login
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* {isLoggedIn && user && (
//         <div className="absolute top-4 right-4 bg-gray-100 p-4 rounded-xl shadow-md flex items-center gap-3">
//           <img
//             src={user.picture}
//             alt="User"
//             className="w-10 h-10 rounded-full"
//           />
//           <div>
//             <p className="font-semibold text-gray-800">{user.name}</p>
//             <p className="text-gray-500 text-sm">{user.email}</p>
//           </div>
//           <button
//             onClick={handleSignOut}
//             className="ml-4 bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200 transition text-sm"
//           >
//             Sign out
//           </button>
//         </div>
//       )} */}
//     </div>
//   );
// }



import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * CONFIG - set these
 */
const CLIENT_ID = "788327203829-c8mqq2d18q4a101g57983ghout7i1a7i.apps.googleusercontent.com";
const SCOPE = "openid email profile";

/* ---------- small compatibility helpers ---------- */
const browserAPI: any = (window as any).browser || (window as any).chrome || {};
const hasIdentityAPI = () =>
  !!(browserAPI && browserAPI.identity && typeof browserAPI.identity.launchWebAuthFlow === "function");

function storageGet(keys: string | string[]) {
  return new Promise<any>((resolve) => {
    if (!browserAPI.storage || !browserAPI.storage.local) return resolve({});
    browserAPI.storage.local.get(keys, (res: any) => resolve(res || {}));
  });
}
function storageSet(obj: any) {
  return new Promise<void>((resolve) => {
    if (!browserAPI.storage || !browserAPI.storage.local) return resolve();
    browserAPI.storage.local.set(obj, () => resolve());
  });
}
function storageRemove(keys: string | string[]) {
  return new Promise<void>((resolve) => {
    if (!browserAPI.storage || !browserAPI.storage.local) return resolve();
    browserAPI.storage.local.remove(keys, () => resolve());
  });
}

/* ---------- React Component ---------- */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  /* Check stored token and fetch userinfo (silent) */
  const updateUI = useCallback(async (showOverlay = false): Promise<boolean> => {
    try {
      const { oauthToken } = await storageGet("oauthToken");
      if (!oauthToken) {
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(true);
        return false;
      }

      // validate token by fetching userinfo
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: "Bearer " + oauthToken },
      });

      if (!res.ok) {
        console.warn("userinfo fetch failed:", res.status);
        // token invalid or expired
        await storageRemove(["oauthToken", "oauthTokenExpiry"]);
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(true);
        return false;
      }

      const data = await res.json();
      const email: string | undefined = data && data.email ? String(data.email).toLowerCase() : undefined;
      const allowed = !!email && email.endsWith("@stratsync.ai");

      if (allowed) {
        setUser(data);
        setIsLoggedIn(true);
        setShowLogin(false);
        setShowUnauthorized(false);
        return true;
      } else {
        // unauthorized domain: revoke & cleanup
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(oauthToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }).catch(() => {});
        } catch (e) {}
        await storageRemove(["oauthToken", "oauthTokenExpiry"]);
        setIsLoggedIn(false);
        setUser(null);
        setShowLogin(false);
        setShowUnauthorized(true);
        return false;
      }
    } catch (err) {
      console.error("updateUI error:", err);
      setIsLoggedIn(false);
      setUser(null);
      setShowLogin(true);
      return false;
    }
  }, []);

  /* Implicit (token) flow login - no backend */
  const handleGoogleLogin = useCallback(async () => {
    if (!hasIdentityAPI()) {
      toast.error("Sign-in not available in this environment.");
      return;
    }

    setIsSigningIn(true);
    try {
      const redirectUri =
        typeof browserAPI.identity.getRedirectURL === "function"
          ? browserAPI.identity.getRedirectURL()
          : `${location.origin}/`;

      const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${encodeURIComponent(CLIENT_ID)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(SCOPE)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&prompt=consent`;

      // opens the auth window and returns final redirect URL (with fragment)
      const responseUrl: string = await browserAPI.identity.launchWebAuthFlow({
        interactive: true,
        url: authUrl,
      });

      // responseUrl example:
      // https://.../callback#access_token=ya29.a0Af...&token_type=Bearer&expires_in=3599
      const hash = responseUrl.split("#")[1] || "";
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const expiresIn = Number(params.get("expires_in") || 3600);

      if (!accessToken) {
        throw new Error("No access token received from Google.");
      }

      // store token and expiry
      const expiryMs = Date.now() + expiresIn * 1000;
      await storageSet({ oauthToken: accessToken, oauthTokenExpiry: expiryMs });

      // fetch userinfo and update UI
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) {
        throw new Error("Failed to fetch userinfo");
      }

      const userData = await userRes.json();
      const email: string | undefined = userData?.email?.toLowerCase();
      const allowed = !!email && email.endsWith("@stratsync.ai");

      if (allowed) {
        setUser(userData);
        setIsLoggedIn(true);
        setShowLogin(false);
        setShowUnauthorized(false);
        toast.success("Signed in successfully!", { autoClose: 2000 });
      } else {
        // unauthorized domain: cleanup
        await storageRemove(["oauthToken", "oauthTokenExpiry"]);
        setShowLogin(false);
        setShowUnauthorized(true);
        toast.error("Unauthorized Access!");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err?.message || "Login failed");
    } finally {
      setIsSigningIn(false);
    }
  }, [updateUI]);

  /* Logout - revoke & clear tokens */
  const handleSignOut = useCallback(async () => {
    try {
      const { oauthToken } = await storageGet(["oauthToken"]);
      if (oauthToken) {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(oauthToken)}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
        } catch (e) {
          console.warn("Revoke failed (client-side):", e);
        }

        // Chrome-only: remove cached token if available
        if (browserAPI && browserAPI.identity && typeof browserAPI.identity.removeCachedAuthToken === "function") {
          try {
            browserAPI.identity.removeCachedAuthToken({ token: oauthToken }, () => {});
          } catch (e) {}
        }
      }
      await storageRemove(["oauthToken", "oauthTokenExpiry"]);
    } catch (e) {
      console.warn("Signout cleanup error:", e);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setShowLogin(true);
      toast.info("Signed out");
    }
  }, []);

  /* message listener for logout from background */
  useEffect(() => {
    // On mount, try to use saved token
    (async () => {
      // if token expired, clear it
      const { oauthTokenExpiry } = await storageGet(["oauthTokenExpiry"]);
      if (oauthTokenExpiry && Date.now() > oauthTokenExpiry) {
        await storageRemove(["oauthToken", "oauthTokenExpiry"]);
      }
      updateUI();
    })();

    function messageHandler(message: any, _sender: any, sendResponse?: (res?: any) => void) {
      if (message === "logout") {
        handleSignOut();
        try {
          sendResponse && sendResponse({ ok: true });
        } catch (e) {}
        return true;
      }
      return false;
    }

    if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
      browserAPI.runtime.onMessage.addListener(messageHandler);
    }

    return () => {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
        try {
          browserAPI.runtime.onMessage.removeListener(messageHandler);
        } catch (e) {
          console.error("Error removing listener");
        }
      }
    };
  }, [updateUI, handleSignOut]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <div
        className={`transition-all duration-300 ${
          showLogin || showUnauthorized ? "blur-sm pointer-events-none" : ""
        }`}
      >
        <ChatWindow />
      </div>

      {(showLogin || showUnauthorized) && (
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      )}

      {/* Login Screen */}
      <AnimatePresence>
        {showLogin && !isLoggedIn && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Welcome to StratSync
              </h2>
              <p className="text-gray-500 mb-8">
                Sign in to continue to your AI co-pilot for customer success and
                growth.
              </p>
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className={`flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-lg transition font-medium shadow-sm ${
                  isSigningIn ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                }`}
              >
                {isSigningIn ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5" />
                    Login with Google
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnauthorized && !isLoggedIn && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center border">
              <h2 className="text-2xl font-semibold text-red-600 mb-4">
                Unauthorized Access!
              </h2>
              <p className="text-gray-600 mb-6">
                Please contact the StratSync team for assistance.
              </p>
              <button
                onClick={() => {
                  setShowUnauthorized(false);
                  setShowLogin(true);
                }}
                className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition font-medium shadow-sm"
              >
                Go Back to Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
