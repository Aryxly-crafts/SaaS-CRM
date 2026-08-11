// Shared types and display helpers for clients, projects, payments,
// and documents.

export type ProjectStatus = "active" | "completed" | "on_hold";
export type PaymentType = "advance" | "final" | "other";
export type DocumentType = "agreement" | "sow" | "invoice";

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

export const PROJECT_STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  active: { label: "ACTIVE", className: "bg-[#e8f0fb] text-[#2569b9]" },
  completed: { label: "COMPLETED", className: "bg-[#e6f0ec] text-[#3d7a5c]" },
  on_hold: { label: "ON HOLD", className: "bg-[#edeff3] text-[#555663]" },
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  advance: "Advance",
  final: "Final",
  other: "Other",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  agreement: "Agreement",
  sow: "SOW",
  invoice: "Invoice",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Formats a nullable amount as currency, or an em dash when unset.
export function money(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : currency.format(value);
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
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
