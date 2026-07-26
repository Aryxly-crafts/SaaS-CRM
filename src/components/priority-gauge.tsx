"use client";

import { priorityLabel } from "@/lib/leads";

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Circular 0-100 gauge with a one-word potential label beneath it.
export function PriorityGauge({ score }: { score: number }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color =
    score >= 75 ? "#059669" : score >= 40 ? "#d97706" : "#64748b";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 400ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-900">
          {score}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">
        {priorityLabel(score)}
      </span>
    </div>
  );
}
