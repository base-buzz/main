"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      // Register service worker
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered: ", registration);
          })
          .catch((registrationError) => {
            console.log(
              "Service Worker registration failed: ",
              registrationError,
            );
          });
      }
    }

    // Check for app installation prompt (mobile only)
    let deferredPrompt: any;

    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;

      // Show the install button or UI element if needed
      if (typeof localStorage !== "undefined") {
        if (!localStorage.getItem("pwaInstallPromptShown")) {
          // You could show a custom install button here
          localStorage.setItem("pwaInstallPromptShown", "true");
        }
      }
    });

    // Handle app installed event
    window.addEventListener("appinstalled", () => {
      console.log("PWA was installed");

      // Clear the deferredPrompt
      deferredPrompt = null;
    });
  }, []);

  // This component doesn't render anything
  return null;
}
