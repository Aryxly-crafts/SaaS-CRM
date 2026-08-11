// Shared lead types and priority-score logic used across dashboard data and UI.

export type LeadStatus =
  | "cold"
  | "contacted"
  | "interested"
  | "negotiating"
  | "won"
  | "lost";

export type WorkspaceType = "personal" | "team";

export interface Lead {
  id: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  address: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  priority_score: number;
  estimated_value: number | null;
  created_at: string;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
}

// Ordered so "status >= interested" comparisons can use array index.
export const STATUS_ORDER: LeadStatus[] = [
  "cold",
  "contacted",
  "interested",
  "negotiating",
  "won",
  "lost",
];

export const STATUS_STYLES: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  cold: { label: "COLD", className: "bg-[#edeff3] text-[#555663]" },
  contacted: { label: "CONTACTED", className: "bg-[#e8f0fb] text-[#2569b9]" },
  interested: { label: "INTERESTED", className: "bg-[#e6f0ec] text-[#3d7a5c]" },
  negotiating: {
    label: "NEGOTIATING",
    className: "bg-[#2f7eda] text-white",
  },
  won: { label: "WON", className: "bg-[#3d7a5c] text-white" },
  lost: { label: "LOST", className: "bg-[#f7e9e9] text-[#b04545]" },
};

const ESTIMATED_VALUE_THRESHOLD = 50000;
const RECENT_CONTACT_WINDOW_DAYS = 7;

// Weighted rule-based priority score per CLAUDE.md: phone (+20), status >= interested (+30),
// high estimated value (+30), contacted within the last 7 days (+20).
export function calculatePriorityScore(
  lead: Pick<Lead, "phone" | "status" | "estimated_value" | "created_at">
): number {
  let score = 0;

  if (lead.phone) score += 20;

  if (STATUS_ORDER.indexOf(lead.status) >= STATUS_ORDER.indexOf("interested")) {
    score += 30;
  }

  if (
    lead.estimated_value !== null &&
    lead.estimated_value >= ESTIMATED_VALUE_THRESHOLD
  ) {
    score += 30;
  }

  const daysSinceCreated =
    (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= RECENT_CONTACT_WINDOW_DAYS) score += 20;

  return Math.min(score, 100);
}

// Maps a 0-100 priority score to its one-word potential label.
export function priorityLabel(
  score: number
): "Low Potential" | "Medium Potential" | "High Potential" {
  if (score >= 75) return "High Potential";
  if (score >= 40) return "Medium Potential";
  return "Low Potential";
}
