import { STATUS_STYLES, type LeadStatus } from "@/lib/leads";

// Pill status tag — soft tinted background, uppercase label, like the
// reference's NEEDS REVIEW / GOOD / NEUTRAL tags.
export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-[5px] px-1.5 py-[3px] text-[10px] font-semibold tracking-[0.04em] ${className}`}
    >
      {label}
    </span>
  );
}
