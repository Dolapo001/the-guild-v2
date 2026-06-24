"use client";

import { useEffect } from "react";
import { toast } from "sonner";

/**
 * Registers the service worker so the app meets PWA installability criteria
 * and works offline. Mounted once from the root layout.
 * Includes seamless OTA (over-the-air) update detection for new deployments.
 */
export function PWARegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    // Detect when a new service worker takes over, and reload the page
    // so the user gets the fresh deployment instantly.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    const onLoad = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Listen for new service worker installation
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // A new version is available and installed!
              // Prompt the user to update their app via a persistent toast
              toast("Update available", {
                description: "A new version of The Guild is ready.",
                action: {
                  label: "Update Now",
                  onClick: () => {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                  },
                },
                duration: Infinity, // don't auto-dismiss
              });
            }
          });
        });

      } catch (err) {
        console.warn("SW registration failed:", err);
      }
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
