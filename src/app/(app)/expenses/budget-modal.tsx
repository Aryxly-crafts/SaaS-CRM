"use client";

import { useState, useTransition } from "react";
import { Sliders, Target, FolderKanban, Tag, Check, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button, Input } from "@/components/ui";
import { saveBudget, deleteBudget } from "./budget-actions";
import type { Budget, Project, ExpenseCategory } from "@/lib/records";
import { EXPENSE_CATEGORY_LABELS, TEAM_CATEGORIES, PERSONAL_CATEGORIES } from "@/lib/records";

interface BudgetModalProps {
  budgets: Budget[];
  projects: Project[];
  isTeam: boolean;
}

// Modal dialog for managing project cost budgets, category caps, and savings goals.
export function BudgetModal({ budgets, projects, isTeam }: BudgetModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "categories" | "savings">(
    isTeam ? "projects" : "savings"
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const categories = isTeam ? TEAM_CATEGORIES : PERSONAL_CATEGORIES;
  const savingsBudget = budgets.find((b) => b.scope === "savings");

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveBudget(form);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to save budget");
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteBudget(id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to remove budget");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-ink-muted hover:text-ink bg-surface hover:bg-surface-muted border-line flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium shadow-2xs transition-all"
      >
        <Sliders size={13} strokeWidth={2} />
        Manage Budgets & Goals
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Budget & Goal Settings">
        <div className="flex flex-col gap-4">
          {/* Scope Selector Tabs */}
          <div className="bg-surface-muted border-line flex rounded-lg border p-1">
            {isTeam && (
              <button
                type="button"
                onClick={() => setActiveTab("projects")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-all ${
                  activeTab === "projects" ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                }`}
              >
                <FolderKanban size={13} />
                Project Budgets
              </button>
            )}

            {!isTeam && (
              <button
                type="button"
                onClick={() => setActiveTab("savings")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-all ${
                  activeTab === "savings" ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"
                }`}
              >
                <Target size={13} />
                Savings Goal
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("categories")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-[12px] font-medium transition-all ${
                activeTab === "categories" ? "bg-surface text-ink shadow-xs" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Tag size={13} />
              Category Limits
            </button>
          </div>

          {error && (
            <p className="bg-danger-soft text-danger border-danger/20 rounded-md border p-2 text-[12px]">
              {error}
            </p>
          )}

          {/* 1. Project Cost Budgets Tab (Team) */}
          {activeTab === "projects" && isTeam && (
            <div className="flex flex-col gap-4">
              <p className="text-ink-muted text-[12px]">
                Define maximum planned cost budgets per project to protect your net deal margins.
              </p>
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                {projects.map((p) => {
                  const existing = budgets.find((b) => b.scope === "project" && b.project_id === p.id);
                  return (
                    <form
                      key={p.id}
                      onSubmit={handleSave}
                      className="border-line bg-surface-muted/50 flex items-center justify-between gap-3 rounded-lg border p-2.5"
                    >
                      <input type="hidden" name="scope" value="project" />
                      <input type="hidden" name="project_id" value={p.id} />
                      <div className="min-w-0 flex-1">
                        <p className="text-ink text-[12.5px] font-semibold truncate">{p.title}</p>
                        <p className="text-ink-muted text-[11px] tabular">
                          Contract Value: ₹{Number(p.total_value || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          name="amount"
                          type="number"
                          defaultValue={existing ? existing.amount : Math.round(Number(p.total_value || 0) * 0.3)}
                          placeholder="Max Cost (₹)"
                          className="w-28 text-[12px]"
                        />
                        <Button type="submit" disabled={isPending} className="px-2.5 py-1 text-[12px]">
                          <Check size={12} />
                        </Button>
                      </div>
                    </form>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Personal Savings Goal Tab (Personal) */}
          {activeTab === "savings" && !isTeam && (
            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <input type="hidden" name="scope" value="savings" />
              <p className="text-ink-muted text-[12px]">
                Set your target net savings for the month. AI will monitor your progress and advise on burn rate.
              </p>
              <div>
                <label className="text-ink text-[12px] font-medium">Monthly Savings Target (₹)</label>
                <Input
                  name="amount"
                  type="number"
                  defaultValue={savingsBudget ? savingsBudget.amount : 30000}
                  placeholder="50000"
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={isPending} className="mt-2">
                Save Target
              </Button>
            </form>
          )}

          {/* 3. Category Limits Tab */}
          {activeTab === "categories" && (
            <div className="flex flex-col gap-4">
              <p className="text-ink-muted text-[12px]">
                Set monthly spending limits for expense categories.
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {categories.map((cat) => {
                  const existing = budgets.find((b) => b.scope === "category" && b.category === cat);
                  return (
                    <form
                      key={cat}
                      onSubmit={handleSave}
                      className="border-line bg-surface-muted/50 flex items-center justify-between gap-3 rounded-lg border p-2"
                    >
                      <input type="hidden" name="scope" value="category" />
                      <input type="hidden" name="category" value={cat} />
                      <span className="text-ink text-[12.5px] font-medium capitalize">
                        {EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat}
                      </span>
                      <div className="flex items-center gap-2">
                        <Input
                          name="amount"
                          type="number"
                          defaultValue={existing ? existing.amount : ""}
                          placeholder="Monthly cap (₹)"
                          className="w-28 text-[12px]"
                        />
                        <Button type="submit" disabled={isPending} className="px-2.5 py-1 text-[12px]">
                          <Check size={12} />
                        </Button>
                        {existing && (
                          <button
                            type="button"
                            onClick={() => handleDelete(existing.id)}
                            className="text-ink-subtle hover:text-danger p-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </form>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
