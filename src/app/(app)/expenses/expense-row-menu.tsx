"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { RowMenu } from "@/components/row-menu";
import type { Expense } from "@/lib/records";
import type { ProjectWithClient } from "@/lib/records-data";
import { ExpenseForm } from "./expense-form";
import { deleteExpense } from "./actions";

// Row actions for an expense: edit or delete.
export function ExpenseRowMenu({
  expense,
  projects,
  workspaceMode,
}: {
  expense: Expense;
  projects: ProjectWithClient[];
  workspaceMode: "personal" | "team";
}) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <RowMenu
        label="Expense actions"
        onDelete={() => deleteExpense(expense.id)}
        deleteLabel="Delete expense"
        items={[
          {
            label: "Edit expense",
            icon: <Pencil size={13} strokeWidth={1.75} />,
            onSelect: () => setEditing(true),
          },
        ]}
      />

      <ExpenseForm
        projects={projects}
        workspaceMode={workspaceMode}
        expense={expense}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  );
}
