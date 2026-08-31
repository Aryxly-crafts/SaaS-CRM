"use client";

import { useEffect } from "react";

// One-time cleanup: unregisters the old service worker still cached in
// visitors' browsers from before PWA support was removed, and clears the
// caches it created — otherwise it keeps intercepting requests indefinitely.
export function SwCleanup() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }, []);

  return null;
}
