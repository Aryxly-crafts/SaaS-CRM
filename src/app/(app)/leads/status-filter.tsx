"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { STATUS_ORDER, STATUS_STYLES, type LeadStatus } from "@/lib/leads";

// Status filter chips with an animated active indicator.
export function StatusFilter({
  active,
  counts,
  total,
}: {
  active: LeadStatus | null;
  counts: Record<string, number>;
  total: number;
}) {
  const chips: { key: string; href: string; label: string; count: number }[] = [
    { key: "all", href: "/leads", label: "All", count: total },
    ...STATUS_ORDER.map((status) => ({
      key: status,
      href: `/leads?status=${status}`,
      label:
        STATUS_STYLES[status].label.charAt(0) +
        STATUS_STYLES[status].label.slice(1).toLowerCase(),
      count: counts[status] ?? 0,
    })),
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => {
        const isActive = chip.key === (active ?? "all");
        return (
          <Link
            key={chip.key}
            href={chip.href}
            className={`relative rounded-full px-2.5 py-1 text-[12px] transition-colors ${
              isActive ? "text-white" : "text-ink-muted hover:text-ink"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="status-filter-pill"
                className="bg-accent absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="relative z-10">
              {chip.label}
              <span className={isActive ? "opacity-80" : "text-ink-subtle"}>
                {" "}
                {chip.count}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
