# Scraper → CRM Pipeline + Today's Calls

**Date:** 2026-08-18
**Status:** Approved
**Repos touched:** `SaaS-CRM` (this repo), `scrapper-maps` (dashboard)

## Problem

Leads are moved from the Maps Scraper into the CRM by copying JSON between two
browser tabs. The human is the transport layer. The CRM's ingest endpoint and
realtime channel already work — the scraper simply never calls them.

Second, subtler problem: both apps now edit lead `status`, `notes` and
follow-ups. Two sources of truth for the same lead is how this decays into
distrust and abandonment.

## Core decision: ownership boundary

> **Scraper = discovery. CRM = working the lead.**
> Once a lead is pushed, the scraper stops owning it.

Pushed rows become read-only in the scraper, show an "In CRM" badge, and are
excluded from the scraper's default queue. One lead, one owner, always.

## Core decision: target the expensive action

The daily target counts **leads contacted**, never leads imported. Importing is
one click and costs nothing; measuring it would manufacture fake progress.
Selecting 10 leads is a commitment to 10 calls.

## Architecture

Two separate Supabase projects, so this is a cross-project HTTP push — not a
shared table.

| | Project | Role |
|---|---|---|
| CRM | `wrrkbrtdiqitygkpdeau` | System of record for worked leads |
| Scraper | `ftvlbeiqempsjwmnlxza` | Discovery + push ledger |

```
Scraper dashboard
  select rows → "Send to CRM"
       ↓ server action (service_role, server-only)
  POST /api/leads/ingest   [x-api-key: INGEST_API_KEY]
       ↓
  CRM Supabase INSERT
       ↓ postgres_changes (already live)
  CRM RealtimeListener → toast + router.refresh()
       ↓
  Today's Calls view
```

## Field mapping

Both `leads` tables share the same six-value status enum, so status carries over
unchanged. The scraper's richer fields have no column in the CRM, so rather than
migrating the CRM schema they are folded into `notes` as an outreach hook —
preserving the opener ("4.8★ · 87 reviews") at zero schema cost.

| Scraper | CRM | Note |
|---|---|---|
| `business_name` | `business_name` | direct |
| `category` | `category` | direct |
| `phone` | `phone` | direct; dedupe key on both sides |
| `address`,`city`,`region`,`country` | `address` | composed, deduped parts |
| `status` | `status` | identical enums |
| `notes` | `notes` | prefixed with hook line |
| `rating`,`reviews_count`,`listing_url`,`email`,`track` | `notes` | hook line |
| — | `source` | `"Maps Scraper"` |
| — | `priority_score` | computed CRM-side |
| — | `workspace_type` | chosen at push time |

## Changes

### Scraper (`scrapper-maps/dashboard`)
1. Migration `004_crm_push.sql` — `crm_pushed_at timestamptz`, partial index.
2. `lib/crm.ts` — maps a scraper lead to the ingest payload and POSTs it.
   Server-only; the CRM key never reaches the browser.
3. `app/actions.ts` — `pushToCrm(ids, workspace)`; stamps `crm_pushed_at` only
   for rows the CRM confirms it inserted.
4. Selection UI — checkbox column, select-all (indeterminate), sticky action bar
   with live count, workspace choice, and result feedback.
5. `LeadRow` — pushed rows show "In CRM", stage editor disabled.
6. Default list hides pushed leads; `?pushed=1` reveals them.

### CRM (`SaaS-CRM`)
7. **Set `INGEST_API_KEY`.** Currently unset, so `/api/leads/ingest` skips auth
   entirely while sending `Access-Control-Allow-Origin: *` — anyone who knows
   the URL can write to the database. Fix regardless of the rest.
8. Fix ingest dedupe: the existing-rows query has no `limit`, so PostgREST caps
   it at 1000 and dedupe silently degrades as the table grows.
9. Batch the ingest insert — currently one awaited round trip per lead.
10. **Today's Calls** view — leads pushed today, one number: contacted vs target.
    Visual is *depletion* (a list that empties), not accumulation.

## Non-goals

- No settings UI for the target; a constant is enough for two users.
- No CRM schema migration.
- No back-sync CRM → scraper. The boundary is one-way by design.
- No streaks, badges, or gamification.

## Risks

- **Partial push failure** — CRM inserts 7 of 10. Only confirmed rows are
  stamped, so the rest stay pushable. Ingest already dedupes on re-push.
- **Env drift** — `INGEST_API_KEY` must match in both deploys or every push
  401s. Fail loudly at the call site, never silently.
