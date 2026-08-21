"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

// Dialog shell: scrim, focus trap on open, Escape to close, spring entrance.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, select, textarea")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Only mounts once a client interaction opens it, so there is no DOM to
  // portal into on the server and no hydration mismatch.
  if (!open) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center overflow-y-auto p-0 sm:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2a2b33]/45 backdrop-blur-[2px]"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="bg-surface border-line relative z-10 my-0 sm:my-auto max-h-[90vh] sm:max-h-[85vh] w-full max-w-full sm:max-w-[460px] overflow-y-auto rounded-t-[22px] sm:rounded-[18px] border-t sm:border p-5 sm:p-6 shadow-[var(--elevation-popover)]"
            style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
          >
            {/* Mobile Drag Indicator */}
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-ink text-[16px] sm:text-[15px] font-semibold tracking-tight">
                  {title}
                </h2>
                {description && (
                  <p className="text-ink-muted mt-0.5 text-[12.5px]">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="text-ink-subtle hover:text-ink hover:bg-surface-muted -mt-1 -mr-1 flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <X size={17} strokeWidth={2} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

