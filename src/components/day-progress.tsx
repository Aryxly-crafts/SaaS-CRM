"use client";

import { motion, useReducedMotion } from "motion/react";

// One segment per committed call, filling left to right as the day is worked.
// A segmented strip beats a percentage bar here because the unit is a real thing
// you did — a phone call — so the eye can count what is left without arithmetic.
export function DayProgress({
  done,
  target,
  remaining,
  personal,
}: {
  done: number;
  target: number;
  remaining: number;
  personal: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const met = done >= target;
  const segments = Math.max(target, done);
  const left = Math.max(target - done, 0);

  return (
    <section
      aria-label={`Calls today: ${done} of ${target}`}
      className="border-line bg-surface rounded-[14px] border p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p className="text-ink text-display-lg tabular">
          {done}
          <span className="text-ink-subtle text-headline-sm">/{target}</span>
        </p>
        <p className="text-ink-muted text-body-md">
          {met ? "Target met — anything now is a bonus." : `${left} more to finish the day.`}
        </p>
      </div>

      {/* Segments are decorative: the numbers above already carry the meaning. */}
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: segments }, (_, i) => {
          const filled = i < done;
          const bonus = i >= target;
          return (
            <motion.span
              key={i}
              initial={reduceMotion ? false : { scaleY: 0.4, opacity: 0.35 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.24, ease: "easeOut", delay: reduceMotion ? 0 : i * 0.02 }}
              className={`h-2.5 flex-1 rounded-full ${
                filled ? (bonus ? "bg-positive" : "bg-accent") : "bg-surface-muted"
              }`}
            />
          );
        })}
      </div>

      <p className="text-ink-subtle mt-3 text-[12px]">
        {remaining > 0
          ? `${remaining} lead${remaining === 1 ? "" : "s"} waiting to be called.`
          : personal
            ? "Scraped leads land in the Team workspace, not Personal."
            : "No leads waiting. Send more across from the scraper."}
      </p>
    </section>
  );
}
