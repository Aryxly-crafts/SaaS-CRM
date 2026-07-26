"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Plus, Archive, ArrowUpRight } from "lucide-react";
import type { Lead } from "@/lib/leads";
import { StatusBadge } from "./status-badge";
import { PriorityGauge } from "./priority-gauge";

const rowDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// One field in the expanded detail grid.
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 text-[12px]">
      <span className="text-ink-subtle w-[132px] flex-shrink-0">{label}</span>
      <span className="text-ink min-w-0">{children}</span>
    </div>
  );
}

// A lead row that expands into full detail, mirroring the reference's
// expanded "Designhub" row.
export function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((v) => !v);

  return (
    <>
      <tr
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        className={`border-line hover:bg-surface-muted cursor-pointer border-b text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]/40 ${
          expanded ? "bg-surface-muted" : ""
        }`}
      >
        <td className="text-ink-muted relative py-2.5 pr-3 pl-4 whitespace-nowrap">
          {expanded && (
            <motion.span
              layoutId={`row-marker-${lead.id}`}
              className="bg-accent absolute top-0 bottom-0 left-0 w-[2px]"
            />
          )}
          {rowDate.format(new Date(lead.created_at))}
        </td>
        <td className="text-ink px-3 py-2.5 font-medium">{lead.business_name}</td>
        <td className="text-ink-muted tabular px-3 py-2.5 whitespace-nowrap">
          {lead.phone ?? "—"}
        </td>
        <td className="text-ink-muted px-3 py-2.5">{lead.category ?? "—"}</td>
        <td className="px-3 py-2.5">
          <StatusBadge status={lead.status} />
        </td>
        <td className="text-ink tabular px-3 py-2.5 font-medium">
          {lead.priority_score}
        </td>
        <td className="w-8 py-2.5 pr-4 text-right">
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-ink-subtle inline-block"
          >
            <ChevronDown size={15} strokeWidth={1.75} />
          </motion.span>
        </td>
      </tr>

      <AnimatePresence initial={false}>
        {expanded && (
          <tr>
            <td colSpan={7} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="border-accent bg-surface-muted border-l-2 px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="flex min-w-[280px] flex-1 flex-col gap-2">
                      <DetailRow label="Services Required">
                        {lead.category ? (
                          <span className="border-line bg-surface inline-flex rounded-md border px-1.5 py-0.5 text-[11px]">
                            {lead.category}
                          </span>
                        ) : (
                          <span className="text-ink-subtle">Not set</span>
                        )}
                      </DetailRow>
                      <DetailRow label="Referrer Source">
                        {lead.source ?? (
                          <span className="text-ink-subtle">Not set</span>
                        )}
                      </DetailRow>
                      <DetailRow label="Potential Revenue">
                        {lead.estimated_value ? (
                          <span className="tabular font-medium">
                            ${lead.estimated_value.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-ink-subtle">Not set</span>
                        )}
                      </DetailRow>
                      <DetailRow label="Address">
                        {lead.address ?? (
                          <span className="text-ink-subtle">Not set</span>
                        )}
                      </DetailRow>
                    </div>

                    <div className="min-w-[220px] flex-1">
                      <p className="text-ink mb-1 text-[12px] font-medium">
                        Notes
                      </p>
                      <p className="text-ink-muted text-[12px] leading-relaxed">
                        {lead.notes ?? "No notes yet."}
                      </p>
                      <button
                        type="button"
                        className="text-ink-muted hover:text-ink mt-2 flex cursor-pointer items-center gap-1 text-[11.5px] transition-colors"
                      >
                        <Plus size={12} strokeWidth={2} />
                        New Note
                      </button>
                    </div>

                    <PriorityGauge score={lead.priority_score} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="bg-accent hover:bg-accent-hover flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium text-white transition-colors"
                    >
                      Convert to Client
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="border-line bg-surface text-ink-muted hover:text-ink cursor-pointer rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                    >
                      Add Note
                    </button>
                    <button
                      type="button"
                      className="border-line bg-surface text-ink-muted hover:text-ink ml-auto flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors"
                    >
                      <Archive size={13} strokeWidth={1.75} />
                      Archive Lead
                    </button>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
