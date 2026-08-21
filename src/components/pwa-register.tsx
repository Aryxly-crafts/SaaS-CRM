"use client";

import { useEffect, useState } from "react";

// BeforeInstallPromptEvent interface for PWA install prompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to hold the deferred install prompt for user-triggered installation
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function getDeferredInstallPrompt() {
  return deferredPrompt;
}

export function triggerInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    return Promise.resolve(false);
  }
  return deferredPrompt.prompt().then(() => {
    return deferredPrompt!.userChoice.then((choiceResult) => {
      const accepted = choiceResult.outcome === "accepted";
      if (accepted) {
        deferredPrompt = null;
      }
      return accepted;
    });
  });
}

export function PwaRegister() {
  const [, setCanInstall] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("PWA ServiceWorker registration successful:", registration.scope);
          })
          .catch((err) => {
            console.warn("PWA ServiceWorker registration failed:", err);
          });
      });
    }

    // 2. Listen for BeforeInstallPromptEvent on Android / Chromium
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
      window.dispatchEvent(new CustomEvent("pwa-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 3. Listen for app installed event
    const handleAppInstalled = () => {
      deferredPrompt = null;
      setCanInstall(false);
      window.dispatchEvent(new CustomEvent("pwa-installed"));
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
