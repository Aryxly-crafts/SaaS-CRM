"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Lead } from "@/lib/leads";
import { StatusBadge } from "./status-badge";
import { PriorityGauge } from "./priority-gauge";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// One lead-table row that expands to show full detail on click or Enter/Space.
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
        className="cursor-pointer border-b border-slate-100 text-sm transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500"
      >
        <td className="px-4 py-3 text-slate-500">
          {dateFormatter.format(new Date(lead.created_at))}
        </td>
        <td className="px-4 py-3 font-medium text-slate-900">
          {lead.business_name}
        </td>
        <td className="px-4 py-3 text-slate-600">{lead.phone ?? "—"}</td>
        <td className="px-4 py-3 text-slate-600">{lead.category ?? "—"}</td>
        <td className="px-4 py-3">
          <StatusBadge status={lead.status} />
        </td>
        <td className="px-4 py-3 text-slate-600">{lead.priority_score}</td>
        <td className="w-8 px-4 py-3 text-right">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronDown size={16} className="text-slate-400" />
          </motion.div>
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
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden bg-slate-50"
              >
                <div className="grid grid-cols-[1fr_auto] gap-6 px-6 py-5">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">
                        Category / Services Needed:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.category ?? "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Source:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.source ?? "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Estimated Project Value:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.estimated_value
                          ? `$${lead.estimated_value.toLocaleString()}`
                          : "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Notes:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.notes ?? "No notes yet"}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Convert to Client
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Add Note
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Archive Lead
                      </button>
                    </div>
                  </div>
                  <PriorityGauge score={lead.priority_score} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
