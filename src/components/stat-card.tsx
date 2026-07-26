"use client";

import { motion } from "motion/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatDelta {
  value: string;
  direction: "up" | "down" | "flat";
}

// Single stat tile: label, value, and a delta chip when history exists.
export function StatCard({
  label,
  value,
  delta,
  index,
}: {
  label: string;
  value: string | number;
  delta?: StatDelta;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.04, ease: "easeOut" }}
      className="border-line hover:shadow-[var(--elevation-card-hover)] flex flex-col gap-1.5 rounded-[14px] border px-4 py-3.5 transition-shadow"
    >
      <p className="text-ink-muted truncate text-[12px]">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-ink tabular text-[19px] leading-none font-semibold tracking-tight">
          {value}
        </span>
        {delta ? (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-medium ${
              delta.direction === "up"
                ? "text-positive"
                : delta.direction === "down"
                  ? "text-accent"
                  : "text-ink-subtle"
            }`}
          >
            {delta.direction === "up" && (
              <ArrowUpRight size={12} strokeWidth={2.25} />
            )}
            {delta.direction === "down" && (
              <ArrowDownRight size={12} strokeWidth={2.25} />
            )}
            {delta.value}
          </span>
        ) : (
          <span className="text-ink-subtle text-[11px]">—</span>
        )}
      </div>
    </motion.div>
  );
}
