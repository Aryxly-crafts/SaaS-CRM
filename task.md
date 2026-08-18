# Task Tracker — CRM Redesign + Expense Tracker

## Phase 1: Design System Update (CSS + Font)
- [x] Update `globals.css` with Stitch design tokens
- [x] Switch font to Chivo in `layout.tsx`
- [x] Update status & priority styles to match Stitch soft-fill palette

## Phase 2: Sidebar & Navigation Redesign
- [x] Restyle sidebar to match Stitch (left-accent active state, '+ New Entry' CTA, Expenses link)
- [x] Restyle top bar (headline-sm title, centered search bar, help icon, notifications)

## Phase 3: Dashboard Redesign
- [x] Update dashboard page with subtitle, INR (₹) formatting
- [x] Restyle stat cards to Stitch design with danger/positive accenting
- [x] Restyle trends chart
- [x] Restyle lead table + expanded rows with ₹ Indian numbering
- [x] Restyle right panel (deadlines + activity) with Stitch border radius

## Phase 4: Leads Page Redesign
- [x] Restyle leads page table and badges
- [x] Format estimated value as ₹ (INR)

## Phase 5: Projects & Payments Redesign
- [x] Restyle projects page status badges and overdue indicator
- [x] Restyle payments page with pill-shaped ADVANCE/FINAL/OTHER badges

## Phase 6: Expense Tracker — Database & Types
- [x] Create migration `0005_create_expenses.sql` with workspace RLS
- [x] Add Expense types & category badges to `records.ts`
- [x] Add `getExpenses()` and `getExpenseSummary()` to `records-data.ts`

## Phase 7: Expense Tracker — Pages
- [x] Create `expenses/page.tsx` with dynamic Team vs Personal workspace views
- [x] Create `expenses/actions.ts` with workspace-scoped server actions
- [x] Create `expenses/expense-form.tsx` matching Stitch Add Expense modal
- [x] Create `expenses/expense-row-menu.tsx` for row edit/delete
- [x] Create `expenses/loading.tsx` skeleton
- [x] Update `settings/page.tsx` with Expenses total count
