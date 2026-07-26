"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField, TextareaField } from "@/components/ui";
import { STATUS_ORDER, STATUS_STYLES, type Lead } from "@/lib/leads";
import { createLead, updateLead } from "./actions";

const STATUS_OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_STYLES[status].label.charAt(0) +
    STATUS_STYLES[status].label.slice(1).toLowerCase(),
}));

// Create/edit dialog for a lead. Renders its own "New Lead" trigger unless
// the parent drives it via `open`/`onOpenChange`.
export function LeadForm({
  lead,
  open: controlledOpen,
  onOpenChange,
}: {
  lead?: Lead;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  // Routes open/close to the parent when controlled, local state otherwise.
  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(lead);

  // Submits the form through the matching server action.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) await updateLead(formData);
        else await createLead(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <>
      {!isControlled && (
        <Button variant="primary" type="button" onClick={() => setOpen(true)}>
          <Plus size={14} strokeWidth={2.25} />
          New Lead
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit lead" : "New lead"}
        description={
          editing
            ? "Update the details for this lead."
            : "Add a lead to start tracking it in the pipeline."
        }
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          {editing && <input type="hidden" name="id" value={lead!.id} />}
          {editing && (
            <input type="hidden" name="created_at" value={lead!.created_at} />
          )}

          <Field
            label="Business name"
            name="business_name"
            required
            defaultValue={lead?.business_name ?? ""}
            placeholder="Acme Interiors"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Category"
              name="category"
              defaultValue={lead?.category ?? ""}
              placeholder="Web Development"
            />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              defaultValue={lead?.phone ?? ""}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Status"
              name="status"
              options={STATUS_OPTIONS}
              defaultValue={lead?.status ?? "cold"}
            />
            <Field
              label="Estimated value"
              name="estimated_value"
              inputMode="numeric"
              defaultValue={lead?.estimated_value ?? ""}
              placeholder="50000"
            />
          </div>

          <Field
            label="Source"
            name="source"
            defaultValue={lead?.source ?? ""}
            placeholder="Referral, walk-in, cold call…"
          />

          <Field
            label="Address"
            name="address"
            defaultValue={lead?.address ?? ""}
            placeholder="City or full address"
          />

          <TextareaField
            label="Notes"
            name="notes"
            defaultValue={lead?.notes ?? ""}
            placeholder="Context, next steps, what they asked for…"
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
              {editing ? "Save changes" : "Create lead"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
