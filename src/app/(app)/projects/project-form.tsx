"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField } from "@/components/ui";
import type { Client, Project } from "@/lib/records";
import { createProject, updateProject } from "./actions";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On hold" },
];

// Create/edit dialog for a project.
export function ProjectForm({
  clients,
  project,
  trigger,
}: {
  clients: Client[];
  project?: Project;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(project);

  // Submits the form through the matching server action.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) await updateProject(formData);
        else await createProject(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.legal_name,
  }));

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button variant="primary" type="button" disabled={clients.length === 0}>
            <Plus size={14} strokeWidth={2.25} />
            New Project
          </Button>
        )}
      </span>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit project" : "New project"}
        description={
          editing
            ? "Update scope, value, and delivery dates."
            : "Track a project against one of your clients."
        }
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          {editing && <input type="hidden" name="id" value={project!.id} />}

          <SelectField
            label="Client"
            name="client_id"
            options={clientOptions}
            defaultValue={project?.client_id ?? clientOptions[0]?.value}
            required
          />

          <Field
            label="Project title"
            name="title"
            required
            defaultValue={project?.title ?? ""}
            placeholder="Brand identity refresh"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Total value"
              name="total_value"
              inputMode="numeric"
              defaultValue={project?.total_value ?? ""}
              placeholder="150000"
            />
            <SelectField
              label="Status"
              name="status"
              options={STATUS_OPTIONS}
              defaultValue={project?.status ?? "active"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Advance amount"
              name="advance_amount"
              inputMode="numeric"
              defaultValue={project?.advance_amount ?? ""}
              placeholder="50000"
            />
            <Field
              label="Final amount"
              name="final_amount"
              inputMode="numeric"
              defaultValue={project?.final_amount ?? ""}
              placeholder="100000"
            />
          </div>

          <div className="flex gap-4">
            <label className="text-ink flex cursor-pointer items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                name="advance_paid"
                defaultChecked={project?.advance_paid}
                className="accent-[var(--accent)]"
              />
              Advance paid
            </label>
            <label className="text-ink flex cursor-pointer items-center gap-2 text-[12.5px]">
              <input
                type="checkbox"
                name="final_paid"
                defaultChecked={project?.final_paid}
                className="accent-[var(--accent)]"
              />
              Final paid
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Start date"
              name="start_date"
              type="date"
              defaultValue={project?.start_date ?? ""}
            />
            <Field
              label="Deadline"
              name="deadline"
              type="date"
              defaultValue={project?.deadline ?? ""}
            />
          </div>

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
              {editing ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
