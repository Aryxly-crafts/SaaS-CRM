import { Receipt } from "lucide-react";
import { SetPageTitle } from "../page-title-context";
import { getExpenses, getExpenseSummary, getProjects } from "@/lib/records-data";
import { getWorkspaceContext } from "@/lib/workspace";
import { getBudgets, getProjectBudgetMetrics, getCategoryBudgetMetrics, getPersonalSavingsMetric } from "@/lib/budgets";
import { getFinancialAIInsights } from "@/lib/ai-insights";
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
import { BudgetModal } from "./budget-modal";
import { AIAdvisorCard } from "./ai-advisor-card";
import { ExpenseAnalytics } from "./expense-analytics";

// Expense tracker & PowerBI AI financial intelligence dashboard.
export default async function ExpensesPage() {
  const ctx = await getWorkspaceContext();
  const isTeam = ctx.mode === "team";

  const [expenses, summary, projects, budgets] = await Promise.all([
    getExpenses(),
    getExpenseSummary(),
    getProjects(),
    getBudgets(),
  ]);

  const [projectMetrics, categoryMetrics, savingsMetric, aiInsightRecord] = await Promise.all([
    getProjectBudgetMetrics(projects, expenses),
    getCategoryBudgetMetrics(expenses),
    getPersonalSavingsMetric(summary.totalIncome, summary.totalExpenses),
    getFinancialAIInsights(projects, expenses, summary.totalIncome, summary.totalExpenses),
  ]);

  // Dynamic stat cards tailored to workspace mode
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
          label: "Net Margin",
          value: money(summary.netCashflow),
          accent: summary.netCashflow >= 0 ? ("positive" as const) : ("danger" as const),
        },
        {
          label: "Top Cost Center",
          value: summary.topCategory
            ? EXPENSE_CATEGORY_LABELS[summary.topCategory as ExpenseCategory]
            : "—",
        },
      ]
    : [
        {
          label: "Total Income",
          value: money(summary.totalIncome),
          accent: "positive" as const,
        },
        {
          label: "Total Expenses",
          value: money(summary.totalExpenses),
          accent: "danger" as const,
        },
        {
          label: "Net Savings",
          value: money(summary.netCashflow),
          accent: summary.netCashflow >= 0 ? ("positive" as const) : ("danger" as const),
        },
        {
          label: "Top Spending Area",
          value: summary.topCategory
            ? EXPENSE_CATEGORY_LABELS[summary.topCategory as ExpenseCategory]
            : "—",
        },
      ];

  return (
    <>
      <SetPageTitle title={isTeam ? "Team Expense Intelligence" : "Personal Expense & Savings Tracker"} />
      <PageHeader
        title={isTeam ? "Team Expense Intelligence" : "Personal Expense & Savings Tracker"}
        description={`${summary.entryCount} ${summary.entryCount === 1 ? "entry" : "entries"} recorded this cycle`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <BudgetModal budgets={budgets} projects={projects} isTeam={isTeam} />
            {isTeam && <FounderPayoutModal projects={projects} />}
            <ExpenseForm projects={projects} workspaceMode={ctx.mode} />
          </div>
        }
      />

      {/* Top Stat Summary Grid */}
      <div className="border-line mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border bg-[var(--line)] shadow-xs sm:grid-cols-4">
        {statCards.map((card, index) => (
          <div key={card.label} className="bg-surface">
            <StatCard {...card} index={index} />
          </div>
        ))}
      </div>

      {/* AI Advisory Panel */}
      <AIAdvisorCard insightRecord={aiInsightRecord} isTeam={isTeam} />

      {/* PowerBI-Style Visual Analytics Panel */}
      <ExpenseAnalytics
        isTeam={isTeam}
        projectMetrics={projectMetrics}
        categoryMetrics={categoryMetrics}
        savingsMetric={savingsMetric}
        expenses={expenses}
      />

      {/* Detailed Expenses Ledger */}
      <Card className="overflow-hidden shadow-xs">
        <div className="border-line flex items-center justify-between border-b px-4 py-3 bg-surface">
          <div>
            <h3 className="text-ink text-[13.5px] font-bold">Transaction History</h3>
            <p className="text-ink-muted text-[11.5px]">Complete log of inflows and outflows.</p>
          </div>
          <span className="text-ink-subtle text-[11.5px] tabular font-medium">
            {expenses.length} Records
          </span>
        </div>

        {expenses.length === 0 ? (
          <EmptyState
            icon={<Receipt size={17} strokeWidth={1.75} />}
            title="No expenses logged yet"
            description={
              isTeam
                ? "Add a business expense or project cost to begin tracking project margins and budget alignment."
                : "Record your personal income and expenses to track your cashflow and savings goal."
            }
            action={<ExpenseForm projects={projects} workspaceMode={ctx.mode} />}
          />
        ) : (
          <div className="scroll-hidden overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-line bg-surface-muted/60 border-b text-left">
                  {["Date", "Title", "Category", ...(isTeam ? ["Project"] : []), "Amount", "Notes"].map(
                    (column) => (
                      <th
                        key={column}
                        className="text-ink-subtle px-3 py-2 text-label-md whitespace-nowrap uppercase first:pl-4"
                      >
                        {column}
                      </th>
                    )
                  )}
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
                      className="border-line hover:bg-surface-muted/50 border-b text-data-tabular transition-colors last:border-b-0"
                    >
                      <td className="text-ink-muted tabular py-2.5 pr-3 pl-4 whitespace-nowrap">
                        {shortDate(expense.date)}
                      </td>
                      <td className="text-ink px-3 py-2.5 font-medium">{expense.title}</td>
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
                        className={`tabular px-3 py-2.5 font-semibold whitespace-nowrap ${
                          isIncome ? "text-positive" : "text-danger"
                        }`}
                      >
                        {isIncome ? "+" : "−"}{money(Number(expense.amount))}
                      </td>
                      <td className="text-ink-muted max-w-[200px] truncate px-3 py-2.5">
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
