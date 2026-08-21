"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Smartphone, Download, CheckCircle2, Share, MoreVertical } from "lucide-react";
import { Card, Button } from "@/components/ui";
import { triggerInstallPrompt, getDeferredInstallPrompt } from "@/components/pwa-register";

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getStandaloneSnapshot() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

function getIosSnapshot() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) && !(window as unknown as { MSStream?: boolean }).MSStream;
}


export function PwaInstallCard() {
  const isStandalone = useSyncExternalStore(subscribeStandalone, getStandaloneSnapshot, () => false);
  const isIOS = useSyncExternalStore(() => () => {}, getIosSnapshot, () => false);
  const [canInstall, setCanInstall] = useState(() => !!getDeferredInstallPrompt());
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleAvailable = () => setCanInstall(true);
    const handleInstalled = () => {
      setInstalled(true);
      setCanInstall(false);
    };

    window.addEventListener("pwa-install-available", handleAvailable);
    window.addEventListener("pwa-installed", handleInstalled);

    return () => {
      window.removeEventListener("pwa-install-available", handleAvailable);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);


  const handleInstallClick = async () => {
    const success = await triggerInstallPrompt();
    if (success) {
      setInstalled(true);
    }
  };


  return (
    <Card className="overflow-hidden">
      <div className="border-line flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Smartphone size={15} className="text-accent" />
          <h3 className="text-ink text-[13px] font-semibold">Mobile App &amp; PWA</h3>
        </div>
        {isStandalone || installed ? (
          <span className="bg-positive-soft text-positive flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
            <CheckCircle2 size={12} /> App Installed
          </span>
        ) : (
          <span className="bg-surface-muted text-ink-subtle rounded px-2 py-0.5 text-[11px]">
            Ready to Install
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-surface-muted border-line flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border p-1.5 shadow-sm">
            <Image
              src="/icons/icon-192.png"
              alt="Aryxly App"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-ink text-[14px] font-medium">Aryxly Tracker Mobile</h4>
            <p className="text-ink-muted text-[12px] leading-relaxed">
              Install Aryxly on your phone for a full-screen, fast standalone app experience with offline resilience.
            </p>
          </div>
        </div>

        {/* Action Button if install prompt is active */}
        {canInstall && !isStandalone && (
          <div className="mt-3.5 pt-3 border-t border-line">
            <Button
              variant="primary"
              onClick={handleInstallClick}
              className="w-full sm:w-auto"
            >
              <Download size={15} /> Install on this Device
            </Button>
          </div>
        )}

        {/* Step-by-step instructions for Android & iOS */}
        {!isStandalone && !installed && (
          <div className="bg-surface-muted border-line mt-3 rounded-lg border p-3 text-[12px] text-ink-muted">
            <p className="font-semibold text-ink text-[11.5px] uppercase tracking-wider mb-2">
              How to Install on Mobile:
            </p>
            <div className="flex items-start gap-2 mb-2">
              <span className="bg-surface border border-line flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-accent flex-shrink-0">
                <MoreVertical size={11} />
              </span>
              <span>
                <strong>Android (Chrome / Edge):</strong> Tap menu (<strong>⋮</strong>) &rarr; tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
              </span>
            </div>

            {isIOS && (
              <div className="flex items-start gap-2">
                <span className="bg-surface border border-line flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-accent flex-shrink-0">
                  <Share size={11} />
                </span>
                <span>
                  <strong>iOS (Safari):</strong> Tap the <strong>Share</strong> button &rarr; tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

