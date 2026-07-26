"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal, Trash2, Loader2 } from "lucide-react";

export interface RowMenuItem {
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

// Row overflow menu with a confirming delete. Items only fire callbacks —
// any dialog they open must be owned by the parent row, not this menu,
// so it survives the menu unmounting.
export function RowMenu({
  label,
  items = [],
  onDelete,
  deleteLabel = "Delete",
  deletePrompt = "Delete permanently?",
}: {
  label: string;
  items?: RowMenuItem[];
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  deletePrompt?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setConfirming(false);
  };

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-ink-subtle hover:text-ink hover:bg-surface-muted flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MoreHorizontal size={15} strokeWidth={1.75} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={close} />
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="bg-surface border-line absolute top-8 right-0 z-20 w-[176px] overflow-hidden rounded-[10px] border py-1 shadow-[var(--elevation-popover)]"
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    close();
                    item.onSelect();
                  }}
                  className={`flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors ${
                    item.danger
                      ? "text-[#b02a2a] hover:bg-[#fbeaea]"
                      : "text-ink-muted hover:text-ink hover:bg-surface-muted"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}

              {onDelete && (
                <>
                  {items.length > 0 && <div className="bg-line my-1 h-px" />}
                  {confirming ? (
                    <div className="px-3 py-1.5">
                      <p className="text-ink-muted mb-1.5 text-[11.5px]">
                        {deletePrompt}
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            startTransition(async () => {
                              await onDelete();
                              close();
                            })
                          }
                          className="cursor-pointer rounded-md bg-[#b02a2a] px-2 py-1 text-[11.5px] font-medium text-white"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirming(false)}
                          className="border-line text-ink-muted cursor-pointer rounded-md border px-2 py-1 text-[11.5px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => setConfirming(true)}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] text-[#b02a2a] transition-colors hover:bg-[#fbeaea]"
                    >
                      <Trash2 size={13} strokeWidth={1.75} />
                      {deleteLabel}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
