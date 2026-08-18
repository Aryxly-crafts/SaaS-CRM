"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Phone, Check, RotateCcw, MapPin, Undo2 } from "lucide-react";
import { markContacted, undoContacted } from "@/app/(app)/today/actions";
import type { Lead } from "@/lib/leads";

// The day's call list. Rows leave as they are called, so progress is something
// you watch happen rather than a number you read.
export function CallQueue({ leads }: { leads: Lead[] }) {
  const reduceMotion = useReducedMotion();
  // Optimistically hidden ids, so a row leaves the instant it is called rather
  // than after the server round trip.
  const [called, setCalled] = useState<Set<string>>(new Set());
  const [lastCalled, setLastCalled] = useState<Lead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = leads.filter((lead) => !called.has(lead.id));

  // Logs a call and removes the row, restoring it if the write fails.
  const logCall = (lead: Lead) => {
    setError(null);
    setCalled((prev) => new Set(prev).add(lead.id));
    setLastCalled(lead);

    startTransition(async () => {
      const res = await markContacted(lead.id);
      if (!res.ok) {
        setCalled((prev) => {
          const next = new Set(prev);
          next.delete(lead.id);
          return next;
        });
        setLastCalled(null);
        setError(res.error);
      }
    });
  };

  // Returns the most recent call to the queue.
  const undo = () => {
    const lead = lastCalled;
    if (!lead) return;
    setError(null);
    setLastCalled(null);
    setCalled((prev) => {
      const next = new Set(prev);
      next.delete(lead.id);
      return next;
    });

    startTransition(async () => {
      const res = await undoContacted(lead.id);
      if (!res.ok) setError(res.error);
    });
  };

  if (visible.length === 0) {
    return (
      <div className="border-line bg-surface rounded-[14px] border p-10 text-center">
        <span className="bg-positive-soft text-positive mx-auto flex h-11 w-11 items-center justify-center rounded-full">
          <Check size={22} strokeWidth={2.25} />
        </span>
        <p className="text-ink text-headline-sm mt-3">Queue cleared.</p>
        <p className="text-ink-muted text-body-md mt-1">
          Every lead in the list has been called. Send more across from the scraper.
        </p>
        {lastCalled && (
          <button
            type="button"
            onClick={undo}
            className="text-accent hover:text-accent-hover mt-4 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
          >
            <Undo2 size={14} strokeWidth={2} />
            Undo last call
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="text-danger bg-danger-soft rounded-lg px-3 py-2 text-[12.5px]">
          {error}
        </p>
      )}

      {lastCalled && (
        <div className="border-line bg-surface-muted flex items-center gap-2 rounded-lg border px-3 py-2">
          <p className="text-ink-muted min-w-0 flex-1 truncate text-[12.5px]">
            Logged <span className="text-ink font-medium">{lastCalled.business_name}</span>.
          </p>
          <button
            type="button"
            onClick={undo}
            className="text-accent hover:text-accent-hover flex cursor-pointer items-center gap-1 text-[12.5px] font-medium focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
          >
            <RotateCcw size={13} strokeWidth={2} />
            Undo
          </button>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((lead) => (
            <motion.li
              key={lead.id}
              layout={!reduceMotion}
              initial={false}
              exit={
                reduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, x: 28, transition: { duration: 0.18, ease: "easeIn" } }
              }
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="border-line bg-surface flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[12px] border p-3.5 sm:flex-nowrap"
            >
              <div className="min-w-0 flex-1">
                <p className="text-ink truncate text-[14px] font-medium">{lead.business_name}</p>
                <p className="text-ink-subtle mt-0.5 flex items-center gap-1.5 truncate text-[12px]">
                  {lead.category ?? "Uncategorised"}
                  {lead.address && (
                    <>
                      <MapPin size={11} strokeWidth={2} className="flex-shrink-0" />
                      <span className="truncate">{lead.address}</span>
                    </>
                  )}
                </p>
              </div>

              {/* The call itself is the point, so dialling is the prominent action
                  and on a phone this opens the dialler directly. */}
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="border-line text-ink hover:border-accent hover:text-accent tabular flex h-11 flex-shrink-0 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
                >
                  <Phone size={14} strokeWidth={2} />
                  {lead.phone}
                </a>
              ) : (
                <span className="text-ink-subtle flex h-11 flex-shrink-0 items-center text-[12.5px]">
                  No phone number
                </span>
              )}

              <button
                type="button"
                onClick={() => logCall(lead)}
                className="bg-accent hover:bg-accent-hover flex h-11 flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-4 text-[13px] font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none"
              >
                <Check size={15} strokeWidth={2.25} />
                Called
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
