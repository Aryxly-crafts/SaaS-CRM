"use client";

import { motion } from "motion/react";
import { priorityLabel } from "@/lib/leads";

const RADIUS = 30;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Circular priority gauge, matching the reference's AI-score dial.
export function PriorityGauge({ score }: { score: number }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color = score >= 75 ? "#f0512b" : score >= 40 ? "#d99a2b" : "#9a938c";

  return (
    <div className="flex flex-shrink-0 flex-col items-center gap-1">
      <div className="relative h-[76px] w-[76px]">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
          <circle
            cx="38"
            cy="38"
            r={RADIUS}
            fill="none"
            stroke="#eae7e3"
            strokeWidth="4"
          />
          <motion.circle
            cx="38"
            cy="38"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-ink tabular text-[17px] leading-none font-semibold">
            {score}
          </span>
          <span className="text-ink-subtle mt-0.5 text-[8px] tracking-[0.06em] uppercase">
            Score
          </span>
        </div>
      </div>
      <span className="text-ink-muted text-[11px]">{priorityLabel(score)}</span>
    </div>
  );
}
