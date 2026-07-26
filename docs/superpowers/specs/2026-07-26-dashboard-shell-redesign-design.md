# Dashboard & Shell Enterprise UI/UX Redesign

## Context

The app shell (sidebar, top bar, login) and the dashboard page currently exist
only as functional placeholders — plain gray Tailwind defaults, no icons, no
animation, an empty dashboard body. CLAUDE.md specifies a detailed visual
direction based on a dribbble SaaS marketing dashboard reference
(`/design-reference/dashboard-reference.png`, screenshot pending) that has
not yet been implemented. This pass brings the shell and dashboard up to that
spec, at enterprise-grade polish, using real (currently empty) Supabase data
— no mock/sample data.

## Visual System

- **Font**: Inter, replacing the current Arial fallback in `globals.css`.
- **Palette**: neutral slate/white base (`slate-50` app background, `white`
  cards, `slate-200` borders), single indigo brand accent for primary actions
  and active nav state. Status badges use soft pastel tints
  (`bg-{color}-50 text-{color}-700`), never filled buttons:
  - cold = slate, contacted = blue, interested = amber, negotiating =
    orange, won = emerald, lost = red.
- **Cards**: `rounded-2xl border border-slate-200 bg-white`, no heavy
  shadows — `shadow-sm` only, appearing on hover.
- **Icons**: `lucide-react`, one consistent line-icon style throughout
  (sidebar nav, stat cards, action buttons, empty states).
- **Motion**: `motion` (Framer Motion). Stat cards stagger in (30-50ms per
  item) on mount. Table rows expand/collapse via `AnimatePresence` height+
  fade. Buttons/cards get subtle scale (0.97-1) press feedback. All
  durations 150-300ms, spring or ease-out easing, respecting
  `prefers-reduced-motion`.

## Layout

Three-column shell, matching the dribbble reference structure:

1. **Sidebar** (fixed, ~240px, `slate-50`/white, right border) — Arylxy
   wordmark, nav items (Dashboard, Leads, Projects, Payments, Documents,
   Settings) each with a lucide icon, active item has a filled indigo pill
   background with a layout-animated indicator (shared-element style slide
   between items). User email + sign-out button pinned at the bottom of the
   sidebar (moved from the current top-right header placement).
2. **Top bar** — page title only (no search bar; not part of the current
   manual workflow this app replaces, so it stays out per CLAUDE.md's
   minimalism constraint).
3. **Main column**:
   - **Stat-card row** (5 cards, real Supabase aggregate queries, will read
     0/empty now): Active Leads, Won This Month, Revenue Collected, Pending
     Payments, Overdue Projects. Icon + label + number, no fabricated trend
     arrows (no history exists yet to compute a trend from).
   - **Trends panel** — line chart shell (Recharts) with toggle chips
     (Revenue / Leads Won), empty/zero state: flat gridline baseline plus a
     centered message ("No trend data yet — this fills in as leads convert
     and payments come in"). Real query wiring now; genuinely empty result
     renders this state.
   - **Lead table** ("Lead Quality" equivalent) — columns: Date, Business
     Name, Phone, Category, Status (badge), Priority Score. Empty state:
     centered illustration/icon + "No leads yet" + primary CTA ("Add your
     first lead" — button present, wired to a not-yet-built form is out of
     scope; CTA can link to a placeholder or be visually present/disabled
     per implementation plan). Expandable row behavior fully implemented
     per CLAUDE.md spec (Category/Source/Est. Value/Notes log/circular
     Priority gauge/Convert-to-Client/Add-Note/Archive actions) so it is
     ready the moment real leads exist — exercised via at least one manual
     test row during implementation, not just empty-state screenshots.
4. **Right panel** (fixed, ~300px) — "Upcoming Deadlines" and "Recent
   Activity" cards, both real-data-driven, both empty-state styled for now.

## Data

Create a `leads` table migration in Supabase matching the CLAUDE.md schema
exactly: `id, business_name, category, phone, address, status, notes,
source, priority_score, estimated_value, created_at`. Dashboard stat cards,
trends panel, and lead table all query this real table server-side (Server
Components / server actions) — they will show genuine empty states because
no rows exist yet, not mocked empty states.

Priority score gauge logic per CLAUDE.md: has phone (+20), status ≥
interested (+30), estimated value above threshold (+30), contacted within
7 days (+20) → circular gauge, Low/Medium/High Potential label.

## Out of scope for this pass

- Trends chart real historical data (needs weeks of real leads/payments to
  be meaningful — the panel is wired and empty-stated, not deferred
  entirely, per user direction).
- "Add lead" form / full CRUD flows for leads — this pass is the dashboard
  shell and read surface; write flows are a separate vertical slice.
- Projects, Payments, Documents, Settings pages — sidebar links exist and
  route, but pages remain placeholders until their own slices.

## Testing

- Verify Supabase migration applies cleanly and RLS allows the 2
  authenticated users read/write.
- Manually insert one test lead row to verify: stat cards update, table
  renders it correctly, badge color matches status, expandable row opens
  smoothly with correct data and gauge value, then remove the test row
  before calling the slice done (dashboard should end in genuine empty
  state).
- Check `prefers-reduced-motion` disables/shortens animations.
- Check keyboard nav (tab order, focus rings) through sidebar, stat cards,
  table row expand toggle.
