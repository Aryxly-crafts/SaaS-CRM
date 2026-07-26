"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";

const TABS = ["Lead Quality", "By Status", "By Source"] as const;

// Tabbed table header with an animated underline, like the reference's
// Lead Quality / Day on Day / Week on Week tabs.
export function TableTabs({ count }: { count: number }) {
  const [active, setActive] = useState<string>(TABS[0]);

  return (
    <div className="border-line flex items-center gap-1 border-b px-2">
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => setActive(tab)}
            aria-selected={isActive}
            role="tab"
            className={`relative cursor-pointer px-2.5 py-2.5 text-[12.5px] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none ${
              isActive ? "text-ink font-medium" : "text-ink-subtle hover:text-ink-muted"
            }`}
          >
            {tab}
            {isActive && (
              <motion.span
                layoutId="table-tab-underline"
                className="bg-accent absolute right-2 -bottom-px left-2 h-[2px] rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
              />
            )}
          </button>
        );
      })}

      <span className="text-ink-subtle tabular ml-1 text-[11px]">
        {count > 0 ? `${count} total` : ""}
      </span>

      <button
        type="button"
        aria-label="Table settings"
        className="text-ink-subtle hover:text-ink hover:bg-surface-muted ml-auto mr-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-colors"
      >
        <SlidersHorizontal size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}
