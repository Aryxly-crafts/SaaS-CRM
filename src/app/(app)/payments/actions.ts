"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentType } from "@/lib/records";

// Reads an optional text field, treating blank input as null.
function text(form: FormData, key: string): string | null {
  const value = form.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

// Revalidates every screen whose numbers depend on payments.
function revalidatePaymentViews() {
  revalidatePath("/payments");
  revalidatePath("/projects");
  revalidatePath("/");
}

// Builds the payment column values shared by create and update.
function paymentFields(form: FormData) {
  const rawAmount = text(form, "amount");
  const amount = Number((rawAmount ?? "").replace(/,/g, ""));

  return {
    project_id: text(form, "project_id") ?? "",
    amount,
    type: (text(form, "type") ?? "other") as PaymentType,
    paid_date: text(form, "paid_date"),
  };
}

// Records a payment against a project.
export async function createPayment(form: FormData) {
  const fields = paymentFields(form);
  if (!fields.project_id) throw new Error("Pick a project for this payment");
  if (!Number.isFinite(fields.amount) || fields.amount <= 0) {
    throw new Error("Enter a payment amount greater than zero");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("payments").insert(fields);
  if (error) throw error;

  revalidatePaymentViews();
}

// Updates an existing payment.
export async function updatePayment(form: FormData) {
  const id = form.get("id");
  if (typeof id !== "string") throw new Error("Missing payment id");

  const fields = paymentFields(form);
  if (!fields.project_id) throw new Error("Pick a project for this payment");
  if (!Number.isFinite(fields.amount) || fields.amount <= 0) {
    throw new Error("Enter a payment amount greater than zero");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("payments").update(fields).eq("id", id);
  if (error) throw error;

  revalidatePaymentViews();
}

// Deletes a payment record.
export async function deletePayment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;

  revalidatePaymentViews();
}
