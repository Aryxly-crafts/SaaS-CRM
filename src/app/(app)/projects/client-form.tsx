"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field } from "@/components/ui";
import { createClientRecord } from "./actions";

// Dialog for adding a client that didn't come through the lead pipeline.
export function ClientForm() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Creates the client record.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await createClientRecord(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <UserPlus size={14} strokeWidth={2} />
        New Client
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New client"
        description="Add a client directly, without converting a lead."
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          <Field
            label="Legal name"
            name="legal_name"
            required
            placeholder="Acme Interiors Pvt Ltd"
          />
          <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
          <Field label="Address" name="address" placeholder="City or full address" />

          {error && (
            <p role="alert" className="text-[12px] text-danger">
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
              Create client
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
