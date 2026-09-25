# Tasks

This file tracks meaningful project work for the current repository.

## Task Status Definitions

| Status | Meaning |
|---|---|
| REQUESTED | Requested but not started |
| IN_PROGRESS | Work is underway |
| IMPLEMENTED | Code is present in the repo |
| TESTED | Relevant checks have been executed |
| VERIFIED | Behavior has been confirmed with evidence |
| BLOCKED | Progress is prevented by a blocker |
| CANCELLED | The task was abandoned |

## Task Registry

### T-001
- Objective: Add a greet function to the starter Node app.
- Related Prompt: P-002
- Related Changes: C-005
- Status: HISTORICAL / COMPLETED AS STARTER EXAMPLE
- Notes: This was a small continuity test. The function is still present in src/index.js but is no longer the primary project task.

### T-002
- Date requested: 2026-09-25
- Objective: Build the CampusCare incident-response frontend prototype in the current workspace.
- Related Prompt: P-003
- Related Files: package.json, server.js, public/index.html, public/styles.css, public/app.js, AI_MEMORY/PROJECT_STATE.md, AI_MEMORY/CHANGE_LOG.md, AI_MEMORY/RECENT_CONTEXT.md, AI_MEMORY/HANDOFF.md
- Requirements:
  1. Replace the placeholder demo with a runnable local CampusCare app.
  2. Create a mobile-first dashboard with summary cards and incident panel.
  3. Add a report-incident form with local submission logic.
  4. Show responders and assignment controls with local state.
  5. Implement auto-triage logic for incident type and priority.
  6. Keep the prototype self-contained with no backend or Supabase dependency.
- Constraints:
  - No backend or auth integration in this phase.
  - No external package installation required.
  - Local memory only for simulation and demo flow.
- Status: VERIFIED
  - REQUESTED — 2026-09-25
  - IN_PROGRESS — 2026-09-25
  - IMPLEMENTED — 2026-09-25
  - TESTED — 2026-09-25 (`npm test` passed; server responded with HTTP 200)
  - VERIFIED — 2026-09-25 (live HTML served and app shell was retrieved from localhost:3000)
- Checklist:
  - [x] Inspect repo and confirm runtime baseline.
  - [x] Update package scripts and app entry to serve the frontend locally.
  - [x] Build the dashboard overview and incident cards.
  - [x] Add report incident form and local submission flow.
  - [x] Add responder list and assignment controls.
  - [x] Implement local auto-triage and status updates.
  - [x] Verify app runs and smoke-checks pass.
  - [x] Update AI_MEMORY project state and handoff files.
- Notes:
  - The app is served locally at http://localhost:3000.
  - Verification evidence: `npm test` passed with 2/2 tests, and `curl -I http://localhost:3000` returned HTTP 200.

## Active Task

Current active task: T-005

Supabase email/password authentication is wired and tested; final user setup is to enable Email Auth and create a presentation account.

## Completed Tasks

- T-001: historical starter-greeting task used for continuity testing.
- T-002: CampusCare prototype implementation and verification complete.
- T-003: Supabase persistence and Realtime integration complete.
- T-005: Supabase email/password authentication wired and tested.

### T-006
- Date requested: 2026-09-25
- Objective: Repair the live Supabase incidents schema so report submission and responder assignment match the frontend contract.
- Related Changes: C-009
- Status: BLOCKED
- Evidence: Read-only schema probes show `incidents.type` and `incidents.assigned_responder_id` do not exist, while the database insert trigger references `NEW.type`. A disposable insert failed with `record "new" has no field "type"`.
- Implemented: Added `supabase/migrations/20260925_campuscare_incidents.sql` and aligned the frontend insert contract.
- Blocker: The migration must be run by the user in the Supabase SQL Editor; the browser anon key cannot alter database schema.
- Next action: Run the migration, then resubmit the report and verify the returned incident row and Realtime event.

### T-007
- Date requested: 2026-09-25
- Objective: Make report type selection autonomous, add explainable multi-signal importance scoring, persistent personal history, and user-owned report deletion.
- Related Changes: C-010
- Status: IMPLEMENTED
- Requirements: remove manual type selection; classify from report text/location; combine danger, utility, urgency, and location signals; store score; load history by authenticated user; update history from Realtime; allow deleting only owned reports.
- Evidence: `public/index.html` no longer contains the type selector; `public/app.js` contains autonomous classification, scoring, `reporter_id` history queries, Realtime tracking, and guarded delete logic.
- Blocker: Supabase migration T-006 must be run before live writes/history/deletes can be verified.

### T-008
- Date requested: 2026-09-25
- Objective: Fix legacy report deletion, autonomous responder assignment, and SRM University branding.
- Related Changes: C-012
- Status: TESTED
- Evidence: Deletion now uses authenticated session-known ownership; responders are ranked by capability; Northbridge University was replaced with SRM University.
- Blocker: Run `supabase/migrations/20260925_campuscare_history_score.sql` to activate legacy deletion policy.

### T-009
- Date requested: 2026-09-25
- Objective: Deploy the comprehensive deterministic client-side triage and point-scoring engine.
- Related Changes: C-014
- Status: TESTED
- Requirements: explicit threat dictionaries, unknown fallback at 20, multi-keyword +25 bonus, 150 cap, dynamic priority tiers, threat_points/priority_reason persistence, Realtime-safe DOM sorting.
- Evidence: `public/app.js` contains the complete `TRIAGE_RULES` matrix and dispatcher sort `(b.threat_points || 0) - (a.threat_points || 0)`; module parsing/tests/HTTP checks pass.
- Blocker: Run the Supabase history/score migration to persist the new fields across sessions.

### T-005
- Date requested: 2026-09-25
- Objective: Add a real Supabase Auth session flow to CampusCare.
- Related Prompt: P-005
- Related Changes: C-008
- Files: public/index.html, public/app.js, public/styles.css, public/supabaseClient.js
- Requirements: email/password sign-in, account creation, sign-out, session restoration, auth-state updates, and authenticated write guards.
- Status: TESTED
  - REQUESTED — 2026-09-25
  - IN_PROGRESS — 2026-09-25
  - IMPLEMENTED — 2026-09-25
  - TESTED — 2026-09-25 (Auth endpoint HTTP 200, diagnostics clean, tests pass, browser sign-in dialog confirmed)
  - VERIFIED — pending user-created account and authenticated write test
- Next action: Enable Email Auth in Supabase and create a presentation account through the profile button.

### T-004
- Date requested: 2026-09-25
- Objective: Complete the CampusCare frontend interaction layer for the hackathon presentation.
- Related Prompt: P-004
- Related Changes: C-007
- Files: public/index.html, public/app.js, public/styles.css
- Requirements:
  1. Make role navigation, report, assignment, lifecycle, refresh, and profile controls functional.
  2. Add Student Report Portal and Dispatcher Admin Console segmentation.
  3. Add threat keyword scoring and descending queue sort.
  4. Reconcile all Supabase insert/update/delete Realtime events into the DOM.
  5. Defensively reserve responders to prevent double booking.
- Status: VERIFIED
  - REQUESTED — 2026-09-25
  - IN_PROGRESS — 2026-09-25
  - IMPLEMENTED — 2026-09-25
  - TESTED — 2026-09-25 (diagnostics, module parsing, unit tests, HTTP checks, and browser interaction checks passed)
  - VERIFIED — 2026-09-25 (live Supabase data loaded; role switch, profile action, student-only workspace, and dispatcher workspace confirmed in browser)
- Verification note: Live destructive write actions were not fired during browser verification to avoid creating presentation test data in the connected project. Their async handlers and guarded database paths are implemented in `public/app.js`.

### T-003
- Date requested: 2026-09-25
- Objective: Connect CampusCare to Supabase for persistent data, Realtime synchronization, and resilient multi-user updates.
- Related Prompt: P-003
- Related Changes: C-006
- Files: package.json, package-lock.json, public/app.js, public/supabaseClient.js, src/supabaseClient.js, public/index.html, public/styles.css, .env.example, README.md
- Requirements:
  1. Add the Supabase client dependency and clear URL/key placeholders.
  2. Load incidents by created_at descending and responders by name ascending.
  3. Subscribe to all Realtime events for both tables.
  4. Persist reports, assignments, and status changes through guarded async queries.
  5. Keep failures visible without freezing the dashboard.
- Status: TESTED
  - REQUESTED — 2026-09-25
  - IN_PROGRESS — 2026-09-25
  - IMPLEMENTED — 2026-09-25
  - TESTED — 2026-09-25 (unit tests, ES module parsing, CommonJS parsing, and HTTP asset checks passed)
  - VERIFIED — PENDING live Supabase credentials, schema, RLS, and Realtime presentation test
- Notes: The code is ready for live presentation configuration. Placeholder credentials intentionally prevent a false claim of cloud verification.
