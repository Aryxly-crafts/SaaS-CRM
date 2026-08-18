"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Field, SelectField, TextareaField } from "@/components/ui";
import type { Expense, ExpenseCategory, EntryType } from "@/lib/records";
import {
  EXPENSE_CATEGORY_LABELS,
  TEAM_CATEGORIES,
  PERSONAL_CATEGORIES,
} from "@/lib/records";
import type { ProjectWithClient } from "@/lib/records-data";
import { createExpense, updateExpense } from "./actions";

// Create/edit dialog for an expense. Renders its own trigger when uncontrolled.
export function ExpenseForm({
  projects,
  workspaceMode,
  expense,
  open: controlledOpen,
  onOpenChange,
}: {
  projects: ProjectWithClient[];
  workspaceMode: "personal" | "team";
  expense?: Expense;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (next: boolean) => {
    if (isControlled) onOpenChange?.(next);
    else setUncontrolledOpen(next);
  };

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const editing = Boolean(expense);

  // Submits the form through the matching server action.
  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) await updateExpense(formData);
        else await createExpense(formData);
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  };

  const categories = workspaceMode === "team" ? TEAM_CATEGORIES : PERSONAL_CATEGORIES;
  const categoryOptions = categories.map((cat: ExpenseCategory) => ({
    value: cat,
    label: EXPENSE_CATEGORY_LABELS[cat],
  }));

  const entryTypeOptions = [
    { value: "expense" as EntryType, label: "Expense" },
    { value: "income" as EntryType, label: "Income" },
  ];

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: `${p.client_name} — ${p.title}`,
  }));

  return (
    <>
      {!isControlled && (
        <Button
          variant="primary"
          type="button"
          onClick={() => setOpen(true)}
        >
          <Plus size={14} strokeWidth={2.25} />
          {workspaceMode === "team" ? "Add Expense" : "Add Entry"}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit expense" : "Add expense"}
        description={
          editing
            ? "Update this expense entry."
            : workspaceMode === "team"
              ? "Log a project cost or business expense."
              : "Record a personal income or expense."
        }
      >
        <form action={onSubmit} className="flex flex-col gap-3">
          {editing && <input type="hidden" name="id" value={expense!.id} />}

          <Field
            label="Title"
            name="title"
            required
            defaultValue={expense?.title ?? ""}
            placeholder="e.g. Vercel Hosting — MCB"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Amount"
              name="amount"
              inputMode="numeric"
              required
              defaultValue={expense?.amount ?? ""}
              placeholder="5000"
            />
            <SelectField
              label="Type"
              name="entry_type"
              options={entryTypeOptions}
              defaultValue={expense?.entry_type ?? "expense"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SelectField
              label="Category"
              name="category"
              options={categoryOptions}
              defaultValue={expense?.category ?? categoryOptions[0]?.value}
            />
            <Field
              label="Date"
              name="date"
              type="date"
              defaultValue={expense?.date ?? new Date().toISOString().slice(0, 10)}
            />
          </div>

          {/* Only show project select in team workspace */}
          {workspaceMode === "team" && projects.length > 0 && (
            <SelectField
              label="Project (optional)"
              name="project_id"
              options={[
                { value: "", label: "— No project —" },
                ...projectOptions,
              ]}
              defaultValue={expense?.project_id ?? ""}
            />
          )}

          <TextareaField
            label="Notes"
            name="notes"
            defaultValue={expense?.notes ?? ""}
            placeholder="Optional notes…"
          />

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
              {editing ? "Save changes" : "Save expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
