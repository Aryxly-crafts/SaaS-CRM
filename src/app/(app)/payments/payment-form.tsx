"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField } from "@/components/ui";
import type { Payment } from "@/lib/records";
import type { ProjectWithClient } from "@/lib/records-data";
import { createPayment, updatePayment } from "./actions";

const TYPE_OPTIONS = [
  { value: "advance", label: "Advance" },
  { value: "final", label: "Final" },
  { value: "other", label: "Other" },
];

// Create/edit dialog for a payment.
export function PaymentForm({
  projects,
  payment,
  trigger,
}: {
  projects: ProjectWithClient[];
  payment?: Payment;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(payment);

  // Submits the form through the matching server action.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) await updatePayment(formData);
        else await createPayment(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: `${project.client_name} — ${project.title}`,
  }));

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button
            variant="primary"
            type="button"
            disabled={projects.length === 0}
          >
            <Plus size={14} strokeWidth={2.25} />
            Record Payment
          </Button>
        )}
      </span>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit payment" : "Record payment"}
        description={
          editing
            ? "Update this payment record."
            : "Log money received against a project."
        }
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          {editing && <input type="hidden" name="id" value={payment!.id} />}

          <SelectField
            label="Project"
            name="project_id"
            options={projectOptions}
            defaultValue={payment?.project_id ?? projectOptions[0]?.value}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Amount"
              name="amount"
              inputMode="numeric"
              required
              defaultValue={payment?.amount ?? ""}
              placeholder="50000"
            />
            <SelectField
              label="Type"
              name="type"
              options={TYPE_OPTIONS}
              defaultValue={payment?.type ?? "advance"}
            />
          </div>

          <Field
            label="Paid date"
            name="paid_date"
            type="date"
            defaultValue={payment?.paid_date ?? new Date().toISOString().slice(0, 10)}
          />

          {error && (
            <p role="alert" className="text-[12px] text-[#b02a2a]">
              {error}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-2">
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={pending}>
              {pending && (
                <Loader2 size={13} strokeWidth={2.25} className="animate-spin" />
              )}
              {editing ? "Save changes" : "Record payment"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
