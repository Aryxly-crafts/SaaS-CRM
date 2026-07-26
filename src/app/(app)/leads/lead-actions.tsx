"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MoreHorizontal, Pencil, Trash2, UserPlus, Loader2 } from "lucide-react";
import type { Lead } from "@/lib/leads";
import { deleteLead, convertLeadToClient } from "./actions";
import { LeadForm } from "./lead-form";

// Row action menu: edit, convert to client, delete (with confirmation).
export function LeadActions({ lead }: { lead: Lead }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  // Runs a server action and closes the menu when it settles.
  const run = (fn: () => Promise<void>) =>
    startTransition(async () => {
      await fn();
      setMenuOpen(false);
      setConfirming(false);
    });

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-label={`Actions for ${lead.business_name}`}
        onClick={() => setMenuOpen((v) => !v)}
        className="text-ink-subtle hover:text-ink hover:bg-surface-muted flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
      >
        {pending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <MoreHorizontal size={15} strokeWidth={1.75} />
        )}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setMenuOpen(false);
                setConfirming(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="bg-surface border-line absolute top-8 right-0 z-20 w-[168px] overflow-hidden rounded-[10px] border py-1 shadow-[var(--elevation-popover)]"
            >
              <LeadForm
                lead={lead}
                trigger={
                  <button
                    type="button"
                    className="text-ink-muted hover:text-ink hover:bg-surface-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors"
                  >
                    <Pencil size={13} strokeWidth={1.75} />
                    Edit lead
                  </button>
                }
              />

              <button
                type="button"
                onClick={() => run(() => convertLeadToClient(lead.id))}
                className="text-ink-muted hover:text-ink hover:bg-surface-muted flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] transition-colors"
              >
                <UserPlus size={13} strokeWidth={1.75} />
                Convert to client
              </button>

              <div className="bg-line my-1 h-px" />

              {confirming ? (
                <div className="px-3 py-1.5">
                  <p className="text-ink-muted mb-1.5 text-[11.5px]">
                    Delete permanently?
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => run(() => deleteLead(lead.id))}
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
                  onClick={() => setConfirming(true)}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-1.5 text-left text-[12.5px] text-[#b02a2a] transition-colors hover:bg-[#fbeaea]"
                >
                  <Trash2 size={13} strokeWidth={1.75} />
                  Delete lead
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
