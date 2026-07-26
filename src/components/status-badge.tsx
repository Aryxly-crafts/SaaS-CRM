import { STATUS_STYLES, type LeadStatus } from "@/lib/leads";

// Pill-shaped status indicator with a soft background tint per status.
export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
