import { Receipt } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getExpenses, getExpenseSummary, getProjects } from "@/lib/records-data";
import { getWorkspaceContext } from "@/lib/workspace";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_STYLES,
  money,
  shortDate,
  type ExpenseCategory,
} from "@/lib/records";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { StatCard } from "@/components/stat-card";
import { ExpenseForm } from "./expense-form";
import { ExpenseRowMenu } from "./expense-row-menu";
import { FounderPayoutModal } from "./payout-modal";

// Expense tracker — adapts between Team and Personal workspace modes.
export default async function ExpensesPage() {
  const ctx = await getWorkspaceContext();
  const isTeam = ctx.mode === "team";

  const [expenses, summary, projects] = await Promise.all([
    getExpenses(),
    getExpenseSummary(),
    getProjects(),
  ]);

  // Build stat cards based on workspace mode.
  const statCards = isTeam
    ? [
        {
          label: "Total Revenue",
          value: money(summary.totalIncome),
          accent: "positive" as const,
        },
        {
          label: "Total Expenses",
          value: money(summary.totalExpenses),
          accent: "danger" as const,
        },
        {
          label: "Net Profit",
          value: money(summary.netCashflow),
          accent: summary.netCashflow >= 0 ? ("positive" as const) : ("danger" as const),
        },
        {
          label: "Top Category",
          value: summary.topCategory
            ? EXPENSE_CATEGORY_LABELS[summary.topCategory as ExpenseCategory]
            : "—",
        },
      ]
    : [
        {
          label: "Income This Month",
          value: money(summary.totalIncome),
          accent: "positive" as const,
        },
        {
          label: "Expenses",
          value: money(summary.totalExpenses),
          accent: "danger" as const,
        },
        {
          label: "Net Savings",
          value: money(summary.netCashflow),
          accent: summary.netCashflow >= 0 ? ("positive" as const) : ("danger" as const),
        },
        {
          label: "Biggest Spend",
          value: summary.topCategory
            ? EXPENSE_CATEGORY_LABELS[summary.topCategory as ExpenseCategory]
            : "—",
        },
      ];

  return (
    <>
      <SetPageTitle title={isTeam ? "Team Expenses" : "My Expenses"} />
      <PageHeader
        title={isTeam ? "Team Expenses" : "My Expenses"}
        description={`${summary.entryCount} ${summary.entryCount === 1 ? "entry" : "entries"} this month`}
        action={
          <div className="flex items-center gap-2">
            {isTeam && <FounderPayoutModal projects={projects} />}
            <ExpenseForm projects={projects} workspaceMode={ctx.mode} />
          </div>
        }
      />

      {/* Summary stat cards */}
      <div className="border-line mb-4 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border bg-[var(--line)] sm:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.label} className="bg-surface">
            <StatCard {...card} index={index} />
          </div>
        ))}
      </div>

      {/* Expenses table */}
      <Card className="overflow-hidden">
        {expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={17} strokeWidth={1.75} />}
            title="No expenses yet"
            description={
              isTeam
                ? "Add a business expense or project cost to start tracking your margins."
                : "Record your income and expenses to track your personal cash flow."
            }
            action={
              <ExpenseForm projects={projects} workspaceMode={ctx.mode} />
            }
          />
        ) : (
          <div className="scroll-hidden overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted border-b text-left">
                  {[
                    "Date",
                    "Title",
                    "Category",
                    ...(isTeam ? ["Project"] : []),
                    "Amount",
                    "Notes",
                  ].map((column) => (
                    <th
                      key={column}
                      className="text-ink-subtle px-3 py-2 text-label-md whitespace-nowrap uppercase first:pl-4"
                    >
                      {column}
                    </th>
                  ))}
                  <th className="w-10 pr-3" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => {
                  const isIncome = expense.entry_type === "income";
                  const catStyle =
                    EXPENSE_CATEGORY_STYLES[expense.category as ExpenseCategory] ??
                    EXPENSE_CATEGORY_STYLES.miscellaneous;

                  return (
                    <tr
                      key={expense.id}
                      className="border-line hover:bg-surface-muted border-b text-data-tabular transition-colors last:border-b-0"
                    >
                      <td className="text-ink-muted tabular py-2.5 pr-3 pl-4 whitespace-nowrap">
                        {shortDate(expense.date)}
                      </td>
                      <td className="text-ink px-3 py-2.5 font-medium">
                        {expense.title}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-[0.04em] ${catStyle.className}`}
                        >
                          {EXPENSE_CATEGORY_LABELS[expense.category as ExpenseCategory] ?? expense.category}
                        </span>
                      </td>
                      {isTeam && (
                        <td className="text-ink-muted px-3 py-2.5">
                          {expense.project_title ?? "—"}
                        </td>
                      )}
                      <td
                        className={`tabular px-3 py-2.5 font-medium whitespace-nowrap ${
                          isIncome ? "text-positive" : "text-danger"
                        }`}
                      >
                        {isIncome ? "+" : "−"}{money(Number(expense.amount))}
                      </td>
                      <td className="text-ink-muted max-w-[180px] truncate px-3 py-2.5">
                        {expense.notes ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3">
                        <ExpenseRowMenu
                          expense={expense}
                          projects={projects}
                          workspaceMode={ctx.mode}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
