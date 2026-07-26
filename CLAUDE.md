# Arylxy Internal — Lead & Project Tracker

## What this is
An internal-only tool for Arylxy (2 users: Akshith, Yashashwini) to track
leads, clients, projects, payments, and generated documents. This is NOT
a public product — no public signup, no marketing site, no SEO concerns.
It replaces manual lead/project tracking currently done in chat and notes.

## Hard constraints
- Zero infrastructure cost. Supabase free tier + Vercel free tier only.
- Exactly 2 authenticated users (the founders). No public registration,
  no roles/permissions system — a single shared authenticated view is fine.
- Keep it minimal. Every screen should map to something we currently do
  by hand. Do not add features we haven't asked for.

## Data model
- **leads**: id, business_name, category, phone, address, status
  (cold/contacted/interested/negotiating/won/lost), notes, source,
  priority_score (0-100, manual or rule-based), estimated_value, created_at
- **clients**: id, lead_id (nullable), legal_name, phone, address
- **projects**: id, client_id, title, total_value, advance_amount,
  advance_paid (bool), final_amount, final_paid (bool), start_date,
  deadline, status (active/completed/on_hold)
- **payments**: id, project_id, amount, type (advance/final/other), paid_date
- **documents**: id, project_id, type (agreement/sow/invoice), file_url,
  created_at

## UI / UX Design Direction

**Visual reference:** SaaS Marketing Dashboard Concept —
https://dribbble.com/shots/26386815-SaaS-Marketing-Dashboard-Design-Concept
Save a screenshot of this into `/design-reference/dashboard-reference.png`
in the repo and point Claude Code at it directly when building UI — visual
references work far better than describing style in words alone.

**Overall style:** Light theme, generous white space, rounded cards with
subtle borders (no heavy shadows), clean sans-serif typography, colored
status badges (not filled buttons) for state indicators. Calm, low-noise,
data-dense but not cluttered — the reference achieves density through
clear grouping and whitespace, not through cramming.

**Layout structure:**
- **Left sidebar** — simplified from the reference (which has SEO/Paid Ads/
  Social Media sections we don't need). Ours is short:
  - Leads
  - Projects
  - Payments
  - Documents
  - Settings
- **Top stat-card row** — mirrors the reference's Traffic/ROI/Conversions/
  Expenses/CTR/CPA row, but with our own metrics:
  - Active Leads
  - Won This Month
  - Revenue Collected
  - Pending Payments
  - Overdue Projects
- **Trends chart** (optional, later phase) — line chart of revenue and
  leads-won over time, styled like the reference's Trends panel with
  toggleable series.
- **Lead table** — the core screen, styled directly after the reference's
  "Lead Quality" table:
  - Columns: Date, Business Name, Phone, Category, Status (colored badge),
    Priority Score
  - Status badges use the same visual pattern as the reference's
    `NEEDS REVIEW` / `GOOD` / `NEUTRAL` tags — pill-shaped, soft background
    color per status (e.g. cold = grey, contacted = blue, interested =
    yellow, negotiating = orange, won = green, lost = red).
  - **Expandable row** on click — mirrors the reference's "Designhub" expanded
    row exactly in structure:
    - Services Required → **Category / Services Needed**
    - Referrer Source → **Source** (walk-in, referral, cold call, etc.)
    - Potential Revenue → **Estimated Project Value**
    - Note (with timestamp) → **Notes log**, editable, timestamped
    - Lead Score / AI Score gauge (circular, e.g. "85 High Potential") →
      **Priority Score gauge**, same circular visual, manually set or
      rule-derived (see below)
    - Action buttons: reference has "View Campaign" / "Assign to Team" /
      "Archive Lead" → ours: **"Convert to Client"** / **"Add Note"** /
      **"Archive Lead"**
- **Right panel** (optional, later phase) — reference shows Instagram/X.com
  follower stats; replace with **"Upcoming Deadlines"** and **"Recent
  Activity"** panels — more useful for our actual workflow than social
  metrics.

**Priority Score gauge logic (simple, no real AI needed):**
A basic weighted rule is enough to start — e.g. has phone number (+20),
status = interested or further (+30), estimated value above a threshold
(+30), recent contact within 7 days (+20). Render as the same circular
gauge style as the reference, with a one-word label (Low/Medium/High
Potential) beneath the number.

**Do NOT carry over from the reference:**
- Google Analytics / Google Ads / Meta Ads / Social Platforms sidebar items
- Social media follower/engagement panels
- Any multi-integration or marketing-specific metrics

## Conventions
- Next.js App Router, Supabase JS client, Tailwind for styling.
- Use the `frontend-design` skill to guide spacing, typography, and color
  choices consistent with the reference image above.
- Server actions for all writes (no separate API routes needed at this scale).
- Every function gets one line of plain-English comment above it.
- Write the smallest amount of code that fully works. No speculative
  abstraction, no unused config, no placeholder files.

## How to work
- Build one vertical slice per session, fully working, before moving on.
- Never hardcode Supabase keys — `.env.local` only.
- Before implementing anything non-trivial, state the approach in 3-5
  lines and wait for go-ahead.
- After each slice: run it, show it working, then stop and wait.
