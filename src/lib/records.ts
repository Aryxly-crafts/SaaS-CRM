// Shared types and display helpers for clients, projects, payments,
// documents, and expenses.

export type ProjectStatus = "active" | "completed" | "on_hold";
export type PaymentType = "advance" | "final" | "other";
export type DocumentType = "agreement" | "sow" | "invoice";
export type EntryType = "income" | "expense";
export type ExpenseCategory =
  | "hosting"
  | "domain"
  | "software"
  | "contractor"
  | "marketing"
  | "tools"
  | "travel"
  | "payout"
  | "living"
  | "food"
  | "transport"
  | "subscriptions"
  | "education"
  | "health"
  | "savings"
  | "miscellaneous";

import { WorkspaceType } from "@/lib/leads";

export interface Client {
  id: string;
  lead_id: string | null;
  legal_name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  total_value: number | null;
  advance_amount: number | null;
  advance_paid: boolean;
  final_amount: number | null;
  final_paid: boolean;
  start_date: string | null;
  deadline: string | null;
  status: ProjectStatus;
  created_at: string;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
}

export interface Payment {
  id: string;
  project_id: string;
  amount: number;
  type: PaymentType;
  paid_date: string | null;
  created_at: string;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
}

export interface DocumentRecord {
  id: string;
  project_id: string;
  type: DocumentType;
  file_url: string;
  file_name: string | null;
  created_at: string;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
}

export interface Expense {
  id: string;
  project_id: string | null;
  title: string;
  amount: number;
  category: ExpenseCategory;
  entry_type: EntryType;
  date: string;
  notes: string | null;
  user_id?: string | null;
  workspace_type?: WorkspaceType;
  created_at: string;
}

export const PROJECT_STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: { label: "ACTIVE", className: "bg-info-soft text-[#0284c7]" },
  completed: { label: "COMPLETED", className: "bg-positive-soft text-positive" },
  on_hold: { label: "ON HOLD", className: "bg-[#f1f5f9] text-[#64748b]" },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: "Advance",
  final: "Final",
  other: "Other",
};

// Pill-style badges for payment types — Stitch uses colored pills.
export const PAYMENT_TYPE_STYLES: Record<
  PaymentType,
  { label: string; className: string }
> = {
  advance: { label: "ADVANCE", className: "bg-info-soft text-[#0284c7]" },
  final: { label: "FINAL", className: "bg-positive-soft text-positive" },
  other: { label: "OTHER", className: "bg-[#f1f5f9] text-[#64748b]" },
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  agreement: "Agreement",
  sow: "SOW",
  invoice: "Invoice",
};

// Expense category labels and badge colours for the expense tracker.
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  hosting: "Hosting",
  domain: "Domain",
  software: "Software",
  contractor: "Contractor",
  marketing: "Marketing",
  tools: "Tools",
  travel: "Travel",
  payout: "Founder Payout",
  living: "Living",
  food: "Food",
  transport: "Transport",
  subscriptions: "Subscriptions",
  education: "Education",
  health: "Health",
  savings: "Savings",
  miscellaneous: "Misc",
};

export const EXPENSE_CATEGORY_STYLES: Record<
  ExpenseCategory,
  { className: string }
> = {
  hosting: { className: "bg-info-soft text-[#0284c7]" },
  domain: { className: "bg-[#fae8ff] text-[#a21caf]" },
  software: { className: "bg-[#ede9fe] text-[#7c3aed]" },
  contractor: { className: "bg-warning-soft text-[#d97706]" },
  marketing: { className: "bg-[#fce7f3] text-[#db2777]" },
  tools: { className: "bg-[#f1f5f9] text-[#64748b]" },
  travel: { className: "bg-[#ecfdf5] text-[#059669]" },
  payout: { className: "bg-positive-soft text-positive font-semibold" },
  living: { className: "bg-[#fff7ed] text-[#ea580c]" },
  food: { className: "bg-[#fef9c3] text-[#ca8a04]" },
  transport: { className: "bg-[#e0f2fe] text-[#0369a1]" },
  subscriptions: { className: "bg-[#ede9fe] text-[#7c3aed]" },
  education: { className: "bg-info-soft text-[#0284c7]" },
  health: { className: "bg-danger-soft text-danger" },
  savings: { className: "bg-positive-soft text-positive" },
  miscellaneous: { className: "bg-[#f1f5f9] text-[#64748b]" },
};

// Team-relevant expense categories.
export const TEAM_CATEGORIES: ExpenseCategory[] = [
  "hosting",
  "domain",
  "software",
  "contractor",
  "marketing",
  "tools",
  "travel",
  "payout",
  "miscellaneous",
];

// Personal-relevant expense categories.
export const PERSONAL_CATEGORIES: ExpenseCategory[] = [
  "living",
  "food",
  "transport",
  "subscriptions",
  "tools",
  "education",
  "health",
  "savings",
  "miscellaneous",
];

// INR currency formatter — Indian numbering (lakhs/crores).
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

// Formats a nullable amount as ₹ currency, or an em dash when unset.
export function money(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : currency.format(value);
}

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Formats a nullable date string, or an em dash when unset.
export function shortDate(value: string | null | undefined): string {
  return value ? dateFormat.format(new Date(value)) : "—";
}

// True when a project's deadline has passed and it isn't finished.
export function isOverdue(project: Pick<Project, "deadline" | "status">) {
  if (!project.deadline || project.status === "completed") return false;
  return new Date(project.deadline).getTime() < Date.now();
}
