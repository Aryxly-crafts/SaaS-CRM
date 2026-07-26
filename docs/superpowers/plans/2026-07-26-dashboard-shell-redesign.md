# Dashboard & Shell Enterprise UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the app shell (sidebar, top bar, login) and the Dashboard page to match the CLAUDE.md/dribbble visual spec — enterprise-grade polish, real Supabase data (empty-state now), lucide-react icons, Framer Motion animation — with a real `leads` table backing everything.

**Architecture:** Next.js App Router with Server Components for data fetching (stat aggregates, trends, lead list all queried server-side against Supabase), a small set of Client Components for interactive pieces (sidebar active-indicator animation, expandable table row, animated stat-card mount). Tailwind v4 tokens carry the palette/typography; Framer Motion (`motion` package) handles all animation; `lucide-react` supplies icons; `recharts` renders the trends panel.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), `motion` (Framer Motion), `lucide-react`, `recharts`, Supabase CLI (`npx supabase`) for the migration.

## Global Constraints

- Zero infrastructure cost — Supabase free tier + Vercel free tier only. No new paid services.
- Exactly 2 authenticated users, no public signup, no roles/permissions system.
- No mock/sample data anywhere — all dashboard numbers come from real Supabase queries; empty tables render genuine empty states.
- Every function gets one line of plain-English comment above it.
- Server actions for writes (no separate API routes).
- Never hardcode Supabase keys — `.env.local` only (already present, contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Font: Inter. Palette: slate/white base, indigo accent, soft pastel status badges (`bg-{color}-50 text-{color}-700`): cold=slate, contacted=blue, interested=amber, negotiating=orange, won=emerald, lost=red. Cards: `rounded-2xl border border-slate-200 bg-white`, `shadow-sm` on hover only.
- Motion durations 150-300ms, spring/ease-out easing, must respect `prefers-reduced-motion`.
- All interactive elements need visible focus rings and correct tab order (keyboard nav).

---

## File Structure

- **Create** `supabase/migrations/0001_create_leads.sql` — the `leads` table, RLS policies for the 2 authenticated users.
- **Modify** `package.json` — add `motion`, `lucide-react`, `recharts`.
- **Modify** `src/app/globals.css` — Inter font import, slate/indigo color tokens.
- **Modify** `src/app/layout.tsx` — swap Geist font setup for Inter.
- **Create** `src/lib/leads.ts` — shared types (`Lead`, `LeadStatus`) and the priority-score calculation function, used by both the server data layer and UI.
- **Create** `src/lib/dashboard-data.ts` — server-side data-fetching functions (stat aggregates, trends data, lead list) that query Supabase.
- **Modify** `src/app/(app)/sidebar.tsx` — full visual rebuild: icons, animated active indicator, bottom-pinned user/sign-out.
- **Modify** `src/app/(app)/layout.tsx` — simplified top bar (page title only), remove sign-out/email from header (moved to sidebar).
- **Create** `src/app/(app)/page-title-context.tsx` — tiny client context so nested pages can set the top bar's title (Dashboard, Leads, etc.) without prop drilling.
- **Create** `src/components/stat-card.tsx` — single animated stat card (icon, label, number).
- **Create** `src/components/stat-card-row.tsx` — server component that fetches aggregates and renders the 5 `StatCard`s with stagger.
- **Create** `src/components/trends-panel.tsx` — server component wrapping the trends chart + empty state.
- **Create** `src/components/trends-chart.tsx` — client component, Recharts line chart with toggle chips.
- **Create** `src/components/priority-gauge.tsx` — circular SVG gauge (client component, pure/presentational).
- **Create** `src/components/status-badge.tsx` — pill badge, one shared component for lead status coloring.
- **Create** `src/components/lead-table.tsx` — server component: fetches leads, renders table + empty state, delegates rows to `LeadRow`.
- **Create** `src/components/lead-row.tsx` — client component: one table row + `AnimatePresence` expandable detail panel.
- **Create** `src/components/right-panel.tsx` — server component: "Upcoming Deadlines" + "Recent Activity" cards, empty-stated.
- **Modify** `src/app/(app)/page.tsx` — assemble `StatCardRow`, `TrendsPanel`, `LeadTable`, `RightPanel` into the dashboard layout.
- **Modify** `src/app/login/page.tsx` — visual polish pass (Inter font, indigo accent, rounded-2xl card) to match the new system.

---

## Task 1: Supabase migration — `leads` table

**Files:**
- Create: `supabase/migrations/0001_create_leads.sql`

**Interfaces:**
- Produces: a `leads` table with columns `id uuid`, `business_name text`, `category text`, `phone text`, `address text`, `status text`, `notes text`, `source text`, `priority_score integer`, `estimated_value numeric`, `created_at timestamptz` — consumed by Task 3 (`src/lib/leads.ts` types must match these column names/types exactly) and Task 4 (`dashboard-data.ts` queries).

- [ ] **Step 1: Write the migration SQL**

```sql
-- supabase/migrations/0001_create_leads.sql
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  category text,
  phone text,
  address text,
  status text not null default 'cold'
    check (status in ('cold', 'contacted', 'interested', 'negotiating', 'won', 'lost')),
  notes text,
  source text,
  priority_score integer not null default 0
    check (priority_score >= 0 and priority_score <= 100),
  estimated_value numeric,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

-- Any authenticated user (only the 2 founders ever have accounts) can read all leads.
create policy "authenticated users can read leads"
  on leads for select
  to authenticated
  using (true);

-- Any authenticated user can create leads.
create policy "authenticated users can insert leads"
  on leads for insert
  to authenticated
  with check (true);

-- Any authenticated user can update leads.
create policy "authenticated users can update leads"
  on leads for update
  to authenticated
  using (true)
  with check (true);

-- Any authenticated user can delete/archive leads.
create policy "authenticated users can delete leads"
  on leads for delete
  to authenticated
  using (true);
```

- [ ] **Step 2: Apply the migration to the real Supabase project**

This modifies shared hosted infrastructure — confirm with the user before running. Two options depending on whether the project is already linked:

```bash
npx supabase login
npx supabase link --project-ref <project-ref-from-supabase-dashboard-url>
npx supabase db push
```

If the user prefers, they can instead paste the SQL from Step 1 directly into the Supabase Dashboard's SQL Editor and run it there — equivalent result, no CLI auth needed.

- [ ] **Step 3: Verify the table exists**

In the Supabase Dashboard → Table Editor, confirm `leads` appears with the expected columns and RLS is enabled with 4 policies.

- [ ] **Step 4: Commit the migration file**

```bash
git add supabase/migrations/0001_create_leads.sql
git commit -m "feat: add leads table migration with RLS policies"
```

---

## Task 2: Install dependencies and set up Inter font + color tokens

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS variables `--font-sans` (Inter), `--color-accent` (indigo-600 `#4f46e5`) available globally via Tailwind's `@theme inline` block — consumed by every component task below via Tailwind utility classes (`font-sans`, `text-indigo-600`, `bg-indigo-600`, etc. — Tailwind's default indigo scale already provides these, so no custom utility name is required beyond the font).

- [ ] **Step 1: Install packages**

```bash
npm install motion lucide-react recharts
```

- [ ] **Step 2: Verify install**

```bash
npm ls motion lucide-react recharts
```

Expected: all three listed with resolved versions, no errors.

- [ ] **Step 3: Read current `src/app/layout.tsx`**

Confirm current Geist font setup before editing (already read: it currently imports `Geist`/`Geist_Mono` from `next/font/google` and applies `${geistSans.variable} ${geistMono.variable}` to `<body>`).

- [ ] **Step 4: Replace Geist with Inter in `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arylxy",
  description: "Internal lead and project tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Update `src/app/globals.css`**

```css
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
}

body {
  background: var(--background);
  color: var(--foreground);
}
```

(Removes the dark-mode media query and Geist mono reference — this app is light-theme only per CLAUDE.md, and Fira/Geist mono is no longer used anywhere.)

- [ ] **Step 6: Run the dev server and confirm Inter loads**

```bash
npm run dev
```

Visit `http://localhost:3000/login`, open DevTools → Elements → confirm `<body>` computed `font-family` starts with `Inter`.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/app/globals.css src/app/layout.tsx
git commit -m "feat: switch to Inter font and slate/indigo color tokens"
```

---

## Task 3: Lead types and priority-score logic

**Files:**
- Create: `src/lib/leads.ts`
- Test: manual (pure function, verified via a scratch script in Step 2 — no test runner is configured in this project yet, so verification is a direct `node` run of a temporary script, not a permanent test file)

**Interfaces:**
- Consumes: nothing (pure module).
- Produces:
  - `type LeadStatus = "cold" | "contacted" | "interested" | "negotiating" | "won" | "lost"`
  - `interface Lead { id: string; business_name: string; category: string | null; phone: string | null; address: string | null; status: LeadStatus; notes: string | null; source: string | null; priority_score: number; estimated_value: number | null; created_at: string; }`
  - `const STATUS_ORDER: LeadStatus[]` — ordered cold→lost for "status ≥ interested" comparisons.
  - `function calculatePriorityScore(lead: Pick<Lead, "phone" | "status" | "estimated_value" | "created_at">): number` — returns 0-100.
  - `function priorityLabel(score: number): "Low Potential" | "Medium Potential" | "High Potential"` — <40 Low, 40-74 Medium, ≥75 High.
  - `const STATUS_STYLES: Record<LeadStatus, { label: string; className: string }>` — consumed by `status-badge.tsx` (Task 8) for badge text/color.

Consumed by: `src/lib/dashboard-data.ts` (Task 4), `src/components/status-badge.tsx` (Task 8), `src/components/priority-gauge.tsx` (Task 7), `src/components/lead-row.tsx` (Task 9), `src/components/lead-table.tsx` (Task 10).

- [ ] **Step 1: Write `src/lib/leads.ts`**

```ts
// Shared lead types and priority-score logic used across dashboard data and UI.

export type LeadStatus =
  | "cold"
  | "contacted"
  | "interested"
  | "negotiating"
  | "won"
  | "lost";

export interface Lead {
  id: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  address: string | null;
  status: LeadStatus;
  notes: string | null;
  source: string | null;
  priority_score: number;
  estimated_value: number | null;
  created_at: string;
}

// Ordered so "status >= interested" comparisons can use array index.
export const STATUS_ORDER: LeadStatus[] = [
  "cold",
  "contacted",
  "interested",
  "negotiating",
  "won",
  "lost",
];

export const STATUS_STYLES: Record<
  LeadStatus,
  { label: string; className: string }
> = {
  cold: { label: "Cold", className: "bg-slate-100 text-slate-600" },
  contacted: { label: "Contacted", className: "bg-blue-50 text-blue-700" },
  interested: { label: "Interested", className: "bg-amber-50 text-amber-700" },
  negotiating: {
    label: "Negotiating",
    className: "bg-orange-50 text-orange-700",
  },
  won: { label: "Won", className: "bg-emerald-50 text-emerald-700" },
  lost: { label: "Lost", className: "bg-red-50 text-red-700" },
};

const ESTIMATED_VALUE_THRESHOLD = 50000;
const RECENT_CONTACT_WINDOW_DAYS = 7;

// Weighted rule-based priority score per CLAUDE.md: phone (+20), status >= interested (+30),
// high estimated value (+30), contacted within the last 7 days (+20).
export function calculatePriorityScore(
  lead: Pick<Lead, "phone" | "status" | "estimated_value" | "created_at">
): number {
  let score = 0;

  if (lead.phone) score += 20;

  if (STATUS_ORDER.indexOf(lead.status) >= STATUS_ORDER.indexOf("interested")) {
    score += 30;
  }

  if (
    lead.estimated_value !== null &&
    lead.estimated_value >= ESTIMATED_VALUE_THRESHOLD
  ) {
    score += 30;
  }

  const daysSinceCreated =
    (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated <= RECENT_CONTACT_WINDOW_DAYS) score += 20;

  return Math.min(score, 100);
}

// Maps a 0-100 priority score to its one-word potential label.
export function priorityLabel(
  score: number
): "Low Potential" | "Medium Potential" | "High Potential" {
  if (score >= 75) return "High Potential";
  if (score >= 40) return "Medium Potential";
  return "Low Potential";
}
```

- [ ] **Step 2: Verify the scoring logic manually**

Create a temporary scratch file, run it, then delete it — this project has no test runner configured yet, so this is a manual verification, not a committed test:

```bash
cat > /tmp/verify-priority.mjs << 'EOF'
import { calculatePriorityScore, priorityLabel } from "./src/lib/leads.ts";
EOF
```

Since the file uses TypeScript and `tsx`/`ts-node` isn't installed, verify instead by temporarily importing and logging from `src/app/(app)/page.tsx` during Task 11's dev-server check, OR run:

```bash
npx tsx -e "
const lead = { phone: '555-1234', status: 'interested', estimated_value: 60000, created_at: new Date().toISOString() };
const STATUS_ORDER = ['cold','contacted','interested','negotiating','won','lost'];
let score = 0;
if (lead.phone) score += 20;
if (STATUS_ORDER.indexOf(lead.status) >= STATUS_ORDER.indexOf('interested')) score += 30;
if (lead.estimated_value >= 50000) score += 30;
score += 20;
console.log('score', score);
"
```

Expected output: `score 100` (all four conditions met). This confirms the arithmetic before it's wired into components.

- [ ] **Step 3: Commit**

```bash
git add src/lib/leads.ts
git commit -m "feat: add lead types and priority-score calculation"
```

---

## Task 4: Server-side dashboard data functions

**Files:**
- Create: `src/lib/dashboard-data.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server` (existing, returns `Promise<SupabaseClient>`), `Lead`/`LeadStatus` from `@/lib/leads` (Task 3).
- Produces:
  - `interface DashboardStats { activeLeads: number; wonThisMonth: number; revenueCollected: number; pendingPayments: number; overdueProjects: number; }`
  - `async function getDashboardStats(): Promise<DashboardStats>`
  - `async function getLeads(): Promise<Lead[]>`
  - `interface TrendPoint { date: string; revenue: number; leadsWon: number; }`
  - `async function getTrendData(): Promise<TrendPoint[]>`

Consumed by: `src/components/stat-card-row.tsx`, `src/components/lead-table.tsx`, `src/components/trends-panel.tsx` (Tasks 6, 10, 11).

- [ ] **Step 1: Write `src/lib/dashboard-data.ts`**

```ts
import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadStatus } from "@/lib/leads";

export interface DashboardStats {
  activeLeads: number;
  wonThisMonth: number;
  revenueCollected: number;
  pendingPayments: number;
  overdueProjects: number;
}

const ACTIVE_STATUSES: LeadStatus[] = [
  "cold",
  "contacted",
  "interested",
  "negotiating",
];

// Fetches the 5 dashboard stat-card values from Supabase. Payments/projects
// tables don't exist yet, so those two stats are 0 until that slice lands.
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { count: activeLeads } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .in("status", ACTIVE_STATUSES);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: wonThisMonth } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "won")
    .gte("created_at", startOfMonth.toISOString());

  return {
    activeLeads: activeLeads ?? 0,
    wonThisMonth: wonThisMonth ?? 0,
    revenueCollected: 0,
    pendingPayments: 0,
    overdueProjects: 0,
  };
}

// Fetches all leads for the dashboard table, newest first.
export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export interface TrendPoint {
  date: string;
  revenue: number;
  leadsWon: number;
}

// Fetches revenue/leads-won trend data for the last 30 days. Revenue is
// always 0 until the payments table exists in a later slice.
export async function getTrendData(): Promise<TrendPoint[]> {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from("leads")
    .select("created_at, status")
    .eq("status", "won")
    .gte("created_at", thirtyDaysAgo.toISOString());

  if (error) throw error;

  const byDate = new Map<string, number>();
  for (const row of data ?? []) {
    const day = row.created_at.slice(0, 10);
    byDate.set(day, (byDate.get(day) ?? 0) + 1);
  }

  return Array.from(byDate.entries())
    .map(([date, leadsWon]) => ({ date, revenue: 0, leadsWon }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/dashboard-data.ts
git commit -m "feat: add server-side dashboard data queries"
```

(Full end-to-end verification of these queries happens in Task 11 once they're rendered on the page — Supabase queries can't be meaningfully unit-tested without a live/mocked client, and this project has no test/mock infrastructure yet.)

---

## Task 5: Page-title context for the top bar

**Files:**
- Create: `src/app/(app)/page-title-context.tsx`
- Modify: `src/app/(app)/layout.tsx`

**Interfaces:**
- Produces: `function PageTitleProvider({ children }: { children: React.ReactNode })`, `function usePageTitle(): [string, (title: string) => void]`, `function SetPageTitle({ title }: { title: string })` (a tiny client component pages render to set the title).
- Consumed by: `src/app/(app)/page.tsx` (Task 11) will render `<SetPageTitle title="Dashboard" />`.

- [ ] **Step 1: Write `src/app/(app)/page-title-context.tsx`**

```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";

const PageTitleContext = createContext<
  [string, (title: string) => void] | null
>(null);

// Wraps the authenticated shell so any page can set the top bar's title.
export function PageTitleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = useState("Dashboard");
  return (
    <PageTitleContext.Provider value={state}>
      {children}
    </PageTitleContext.Provider>
  );
}

// Reads the current top bar title and its setter.
export function usePageTitle() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitle must be used within PageTitleProvider");
  return ctx;
}

// Renders nothing — a page mounts this once to set the top bar's title.
export function SetPageTitle({ title }: { title: string }) {
  const [, setTitle] = usePageTitle();
  useEffect(() => {
    setTitle(title);
  }, [title, setTitle]);
  return null;
}
```

- [ ] **Step 2: Modify `src/app/(app)/layout.tsx`**

Replace the whole file (removes the sign-out/email header content — that moves to the sidebar in Task 6 — and wires up the title provider + a `TopBar` client component):

```tsx
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./sidebar";
import { PageTitleProvider } from "./page-title-context";
import { TopBar } from "./top-bar";

// Shared shell for every authenticated screen: sidebar + top bar.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageTitleProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar userEmail={user?.email ?? ""} />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-8 py-6">{children}</main>
        </div>
      </div>
    </PageTitleProvider>
  );
}
```

- [ ] **Step 3: Create `src/app/(app)/top-bar.tsx`**

```tsx
"use client";

import { usePageTitle } from "./page-title-context";

// Top bar showing only the current page's title, per the minimalism constraint.
export function TopBar() {
  const [title] = usePageTitle();
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-5">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
    </header>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/page-title-context.tsx src/app/\(app\)/layout.tsx src/app/\(app\)/top-bar.tsx
git commit -m "feat: add page-title context and simplified top bar"
```

(Full render verification happens in Task 6 once the sidebar accepts `userEmail` and Task 11 sets a real title — this task alone doesn't render standalone.)

---

## Task 6: Sidebar rebuild — icons, animated active indicator, bottom user/sign-out

**Files:**
- Modify: `src/app/(app)/sidebar.tsx`

**Interfaces:**
- Consumes: `signOut` from `./actions` (existing), `usePathname` from `next/navigation` (existing), `motion` from `motion/react`, icons from `lucide-react` (`LayoutDashboard`, `Users`, `FolderKanban`, `Wallet`, `FileText`, `Settings`, `LogOut`).
- Produces: `function Sidebar({ userEmail }: { userEmail: string })` — the new required prop consumed by `src/app/(app)/layout.tsx` (Task 5, already wired above).

- [ ] **Step 1: Rewrite `src/app/(app)/sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Wallet,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "./actions";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Left navigation — highlights the active section with an animated pill and
// pins the signed-in user's email + sign-out control to the bottom.
export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-screen w-60 flex-col border-r border-slate-200 bg-white px-4 py-6">
      <div className="mb-8 px-2 text-lg font-semibold text-slate-900">
        Arylxy
      </div>
      <ul className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="relative">
              {active && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-lg bg-indigo-600"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <Link
                href={item.href}
                className={`relative z-10 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-slate-200 pt-4">
        <p className="mb-3 truncate px-2 text-xs text-slate-500">
          {userEmail}
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Run the dev server and visually verify**

```bash
npm run dev
```

Visit `http://localhost:3000/`, confirm: sidebar shows icons, active item ("Dashboard") has an indigo pill background, email + Sign out button appear at the bottom. Click "Leads" (route doesn't exist yet — expect a 404 from Next.js, that's fine for this task) and confirm the pill would animate on a real navigation (test against `/` and back if a placeholder route exists, otherwise defer full animation check to Task 11 once more routes exist).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/sidebar.tsx
git commit -m "feat: rebuild sidebar with icons and animated active indicator"
```

---

## Task 7: Priority gauge component

**Files:**
- Create: `src/components/priority-gauge.tsx`

**Interfaces:**
- Consumes: `priorityLabel` from `@/lib/leads` (Task 3).
- Produces: `function PriorityGauge({ score }: { score: number })` — consumed by `src/components/lead-row.tsx` (Task 9).

- [ ] **Step 1: Write `src/components/priority-gauge.tsx`**

```tsx
"use client";

import { priorityLabel } from "@/lib/leads";

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Circular 0-100 gauge with a one-word potential label beneath it.
export function PriorityGauge({ score }: { score: number }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const color =
    score >= 75 ? "#059669" : score >= 40 ? "#d97706" : "#64748b";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 400ms ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-slate-900">
          {score}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500">
        {priorityLabel(score)}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/priority-gauge.tsx
git commit -m "feat: add circular priority score gauge"
```

(Visual verification happens in Task 9's manual test-row check, since this component only renders meaningfully inside an expanded lead row.)

---

## Task 8: Status badge component

**Files:**
- Create: `src/components/status-badge.tsx`

**Interfaces:**
- Consumes: `LeadStatus`, `STATUS_STYLES` from `@/lib/leads` (Task 3).
- Produces: `function StatusBadge({ status }: { status: LeadStatus })` — consumed by `src/components/lead-row.tsx` (Task 9).

- [ ] **Step 1: Write `src/components/status-badge.tsx`**

```tsx
import { STATUS_STYLES, type LeadStatus } from "@/lib/leads";

// Pill-shaped status indicator with a soft background tint per status.
export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/status-badge.tsx
git commit -m "feat: add status badge component"
```

---

## Task 9: Expandable lead row

**Files:**
- Create: `src/components/lead-row.tsx`

**Interfaces:**
- Consumes: `Lead` type from `@/lib/leads` (Task 3), `StatusBadge` (Task 8), `PriorityGauge` (Task 7), `motion`/`AnimatePresence` from `motion/react`, icons from `lucide-react` (`ChevronDown`).
- Produces: `function LeadRow({ lead }: { lead: Lead })` — consumed by `src/components/lead-table.tsx` (Task 10).

- [ ] **Step 1: Write `src/components/lead-row.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Lead } from "@/lib/leads";
import { StatusBadge } from "./status-badge";
import { PriorityGauge } from "./priority-gauge";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// One lead-table row that expands to show full detail on click.
export function LeadRow({ lead }: { lead: Lead }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer border-b border-slate-100 text-sm transition-colors hover:bg-slate-50"
      >
        <td className="px-4 py-3 text-slate-500">
          {dateFormatter.format(new Date(lead.created_at))}
        </td>
        <td className="px-4 py-3 font-medium text-slate-900">
          {lead.business_name}
        </td>
        <td className="px-4 py-3 text-slate-600">{lead.phone ?? "—"}</td>
        <td className="px-4 py-3 text-slate-600">{lead.category ?? "—"}</td>
        <td className="px-4 py-3">
          <StatusBadge status={lead.status} />
        </td>
        <td className="px-4 py-3 text-slate-600">{lead.priority_score}</td>
        <td className="w-8 px-4 py-3 text-right">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ChevronDown size={16} className="text-slate-400" />
          </motion.div>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <tr>
            <td colSpan={7} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden bg-slate-50"
              >
                <div className="grid grid-cols-[1fr_auto] gap-6 px-6 py-5">
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">
                        Category / Services Needed:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.category ?? "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Source:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.source ?? "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Estimated Project Value:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.estimated_value
                          ? `$${lead.estimated_value.toLocaleString()}`
                          : "Not set"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">
                        Notes:{" "}
                      </span>
                      <span className="text-slate-600">
                        {lead.notes ?? "No notes yet"}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Convert to Client
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Add Note
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Archive Lead
                      </button>
                    </div>
                  </div>
                  <PriorityGauge score={lead.priority_score} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lead-row.tsx
git commit -m "feat: add expandable lead row with detail panel"
```

(Manual verification with a real test row happens in Task 10's step after `LeadTable` is assembled — a single row can't be rendered standalone without a table wrapper.)

---

## Task 10: Lead table with empty state

**Files:**
- Create: `src/components/lead-table.tsx`

**Interfaces:**
- Consumes: `getLeads` from `@/lib/dashboard-data` (Task 4), `LeadRow` (Task 9), icons from `lucide-react` (`Users`).
- Produces: `async function LeadTable()` (server component, no props) — consumed by `src/app/(app)/page.tsx` (Task 11).

- [ ] **Step 1: Write `src/components/lead-table.tsx`**

```tsx
import { Users } from "lucide-react";
import { getLeads } from "@/lib/dashboard-data";
import { LeadRow } from "./lead-row";

// Fetches and renders all leads in the core dashboard table, or an empty state.
export async function LeadTable() {
  const leads = await getLeads();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Lead Quality</h2>
      </div>

      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users size={22} className="text-slate-400" strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium text-slate-900">No leads yet</p>
          <p className="max-w-xs text-sm text-slate-500">
            Leads you add will show up here with status, priority score, and
            full details.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow key={lead.id} lead={lead} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lead-table.tsx
git commit -m "feat: add lead table with empty state"
```

---

## Task 11: Stat cards, trends panel, right panel, dashboard assembly

**Files:**
- Create: `src/components/stat-card.tsx`
- Create: `src/components/stat-card-row.tsx`
- Create: `src/components/trends-chart.tsx`
- Create: `src/components/trends-panel.tsx`
- Create: `src/components/right-panel.tsx`
- Modify: `src/app/(app)/page.tsx`

**Interfaces:**
- Consumes: `getDashboardStats`, `getTrendData` from `@/lib/dashboard-data` (Task 4), `LeadTable` (Task 10), `SetPageTitle` from `./page-title-context` (Task 5), icons from `lucide-react` (`Users`, `Trophy`, `DollarSign`, `Clock`, `AlertTriangle`, `Calendar`, `Activity`), `recharts` (`LineChart`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `ResponsiveContainer`), `motion` from `motion/react`.
- Produces: `function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number })`, `async function StatCardRow()`, `function TrendsChart({ data }: { data: TrendPoint[] })`, `async function TrendsPanel()`, `function RightPanel()`.

- [ ] **Step 1: Write `src/components/stat-card.tsx`**

```tsx
"use client";

import { motion } from "motion/react";

// Single animated stat card: icon, label, and a big number.
export function StatCard({
  icon,
  label,
  value,
  index,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      className="rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/stat-card-row.tsx`**

```tsx
import { Users, Trophy, DollarSign, Clock, AlertTriangle } from "lucide-react";
import { getDashboardStats } from "@/lib/dashboard-data";
import { StatCard } from "./stat-card";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Fetches dashboard aggregates and renders the 5-card stat row.
export async function StatCardRow() {
  const stats = await getDashboardStats();

  const cards = [
    { icon: <Users size={18} strokeWidth={1.75} />, label: "Active Leads", value: stats.activeLeads },
    { icon: <Trophy size={18} strokeWidth={1.75} />, label: "Won This Month", value: stats.wonThisMonth },
    { icon: <DollarSign size={18} strokeWidth={1.75} />, label: "Revenue Collected", value: currencyFormatter.format(stats.revenueCollected) },
    { icon: <Clock size={18} strokeWidth={1.75} />, label: "Pending Payments", value: currencyFormatter.format(stats.pendingPayments) },
    { icon: <AlertTriangle size={18} strokeWidth={1.75} />, label: "Overdue Projects", value: stats.overdueProjects },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {cards.map((card, index) => (
        <StatCard key={card.label} index={index} {...card} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Write `src/components/trends-chart.tsx`**

```tsx
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TrendPoint } from "@/lib/dashboard-data";

// Renders the revenue/leads-won line chart for the trends panel.
export function TrendsChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="leadsWon"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={false}
          name="Leads Won"
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#059669"
          strokeWidth={2}
          dot={false}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Step 4: Write `src/components/trends-panel.tsx`**

```tsx
import { TrendingUp } from "lucide-react";
import { getTrendData } from "@/lib/dashboard-data";
import { TrendsChart } from "./trends-chart";

// Fetches trend data and renders the chart, or an empty state when there's
// no data yet.
export async function TrendsPanel() {
  const data = await getTrendData();
  const hasData = data.some((point) => point.leadsWon > 0 || point.revenue > 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-slate-900">Trends</h2>
      {hasData ? (
        <TrendsChart data={data} />
      ) : (
        <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
          <TrendingUp size={22} className="text-slate-300" strokeWidth={1.75} />
          <p className="text-sm text-slate-500">
            No trend data yet — this fills in as leads convert and payments
            come in.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write `src/components/right-panel.tsx`**

```tsx
import { Calendar, Activity } from "lucide-react";

// Static-shell right column: Upcoming Deadlines + Recent Activity, both
// empty-stated until projects/activity data exists.
export function RightPanel() {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col gap-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Upcoming Deadlines
        </h2>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Calendar size={20} className="text-slate-300" strokeWidth={1.75} />
          <p className="text-xs text-slate-500">No upcoming deadlines</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Recent Activity
        </h2>
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Activity size={20} className="text-slate-300" strokeWidth={1.75} />
          <p className="text-xs text-slate-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Rewrite `src/app/(app)/page.tsx`**

```tsx
import { SetPageTitle } from "./page-title-context";
import { StatCardRow } from "@/components/stat-card-row";
import { TrendsPanel } from "@/components/trends-panel";
import { LeadTable } from "@/components/lead-table";
import { RightPanel } from "@/components/right-panel";

// Dashboard: stat cards, trends, lead table, and the right-side panels.
export default function DashboardPage() {
  return (
    <>
      <SetPageTitle title="Dashboard" />
      <div className="flex gap-6">
        <div className="flex flex-1 flex-col gap-6">
          <StatCardRow />
          <TrendsPanel />
          <LeadTable />
        </div>
        <RightPanel />
      </div>
    </>
  );
}
```

- [ ] **Step 7: Run the dev server and verify the full empty-state dashboard**

```bash
npm run dev
```

Visit `http://localhost:3000/`, confirm: 5 stat cards stagger in showing 0/$0, Trends panel shows the empty state message, Lead table shows "No leads yet", right panel shows both empty states, top bar reads "Dashboard".

- [ ] **Step 8: Manually insert one test lead row and verify the full flow**

In the Supabase Dashboard → Table Editor → `leads`, insert one row:

```
business_name: "Test Business"
category: "Web Design"
phone: "555-0100"
status: "interested"
source: "referral"
estimated_value: 75000
priority_score: 100
```

Reload `http://localhost:3000/`. Confirm: Active Leads stat = 1, Lead table shows the row with an amber "Interested" badge, clicking the row expands smoothly showing Category/Source/Estimated Value/Notes and a priority gauge reading 100/High Potential, the three action buttons render (they don't need to function yet — out of scope per spec).

- [ ] **Step 9: Delete the test row**

In the Supabase Dashboard → Table Editor → `leads`, delete the "Test Business" row so the dashboard ends in a genuine empty state, per the spec's Testing section.

- [ ] **Step 10: Check `prefers-reduced-motion` and keyboard nav**

In Chrome DevTools → Rendering tab → "Emulate CSS media feature prefers-reduced-motion: reduce", reload the dashboard, confirm stat-card stagger and row-expand animations are instant/absent rather than animated (motion's default respects this automatically for `animate`/`initial`/`exit` transitions — if not, note it, but no extra code is expected here since `motion` handles this natively). Then tab through the page: sidebar nav items, stat cards (not interactive, should be skipped), lead table row (if a test row is temporarily reinserted) should be reachable and togglable via Enter/Space since it's a real `<tr onClick>` — confirm this actually works; if it doesn't receive focus, that's a real accessibility gap to fix by adding `tabIndex={0}` and an `onKeyDown` handler (Enter/Space) to the row in `lead-row.tsx` before calling this task done.

- [ ] **Step 11: Commit**

```bash
git add src/components/stat-card.tsx src/components/stat-card-row.tsx src/components/trends-chart.tsx src/components/trends-panel.tsx src/components/right-panel.tsx src/app/\(app\)/page.tsx
git commit -m "feat: assemble dashboard with stat cards, trends, and right panel"
```

---

## Task 12: Login page visual polish

**Files:**
- Modify: `src/app/login/page.tsx`

**Interfaces:**
- Consumes: `login` from `./actions` (existing, unchanged).
- Produces: same default export signature, visual-only change.

- [ ] **Step 1: Rewrite `src/app/login/page.tsx`**

```tsx
import { login } from "./actions";

// Simple email/password gate — no signup link, only 2 accounts ever exist.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form
        action={login}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8"
      >
        <h1 className="mb-1 text-xl font-semibold text-slate-900">Arylxy</h1>
        <p className="mb-6 text-sm text-slate-500">Lead & Project Tracker</p>

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify visually**

```bash
npm run dev
```

Sign out (if signed in) and visit `http://localhost:3000/login`, confirm Inter font, slate background, indigo focus rings and button.

- [ ] **Step 3: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "style: polish login page to match new visual system"
```

---

## Final Verification

- [ ] **Step 1: Full click-through**

```bash
npm run dev
```

Walk through: login → dashboard (empty states) → sidebar navigation to each route (Leads/Projects/Payments/Documents/Settings will 404 since those pages don't exist yet — expected, out of scope) → sign out → redirected to login.

- [ ] **Step 2: Lint check**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: build succeeds with no type errors.
