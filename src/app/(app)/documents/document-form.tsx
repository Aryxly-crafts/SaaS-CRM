"use client";

import { useState, useTransition } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, SelectField } from "@/components/ui";
import type { ProjectWithClient } from "@/lib/records-data";
import { uploadDocument } from "./actions";

const TYPE_OPTIONS = [
  { value: "agreement", label: "Agreement" },
  { value: "sow", label: "Scope of work" },
  { value: "invoice", label: "Invoice" },
];

// Upload dialog for attaching a file to a project.
export function DocumentForm({ projects }: { projects: ProjectWithClient[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Uploads the chosen file and records it.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        await uploadDocument(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  };

  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: `${project.client_name} — ${project.title}`,
  }));

  return (
    <>
      <Button
        variant="primary"
        type="button"
        onClick={() => setOpen(true)}
        disabled={projects.length === 0}
      >
        <Upload size={14} strokeWidth={2} />
        Upload Document
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload document"
        description="Attach an agreement, SOW, or invoice to a project."
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          <SelectField
            label="Project"
            name="project_id"
            options={projectOptions}
            defaultValue={projectOptions[0]?.value}
            required
          />

          <SelectField
            label="Document type"
            name="type"
            options={TYPE_OPTIONS}
            defaultValue="agreement"
          />

          <div>
            <label
              htmlFor="file"
              className="text-ink mb-1.5 block text-[12.5px] font-medium"
            >
              File
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="border-line bg-surface-muted text-ink-muted file:bg-surface file:border-line file:text-ink w-full cursor-pointer rounded-[10px] border px-3 py-2 text-[12.5px] file:mr-3 file:cursor-pointer file:rounded-md file:border file:px-2 file:py-1 file:text-[12px]"
            />
            <p className="text-ink-subtle mt-1 text-[11.5px]">
              PDF, Word, or image. Stored privately in Supabase.
            </p>
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
              Upload
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
