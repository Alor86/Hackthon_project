# Recent Context

## Purpose

This file is a compact, short-term memory of the most recent meaningful project events. It exists so that an AI taking over the project can quickly understand what happened immediately before the current point, without needing to read the entire historical log files (CHANGE_LOG, PROMPT_LOG) or the full TASKS registry.

**This is short-term context, not authoritative project state.** If anything in this file conflicts with `AI_MEMORY/PROJECT_STATE.md`, `AI_MEMORY/TASKS.md`, the actual repository code/tests, or Git history, those higher-authority sources are correct and this file should be corrected to match.

---

## Context Rules

1. **Record only recent, meaningful project events.** Old, settled facts that are already captured in the authoritative memory files should not be kept here indefinitely.
2. **Include only information that may affect the next AI's immediate work.** If a piece of context does not change what the next agent should do next, it probably does not belong here.
3. **Keep the file compact.** A new AI should be able to read it in under a minute.
4. **Prefer concise factual statements.** Short bullets and short sentences. No narrative.
5. **Do not copy entire conversations.** This file is not a transcript.
6. **Do not duplicate entire entries from TASKS.md, CHANGE_LOG.md, or PROMPT_LOG.md.** Summarize the relevant recent portion and cross-reference the IDs instead.
7. **Cross-reference task / prompt / change IDs when useful.** Use `T-NNN`, `P-NNN`, and `C-NNN` so the AI can look up authoritative detail if needed.
8. **Remove or summarize obsolete context** when it is no longer useful. This file rolls forward; it is not a permanent archive.
9. **Never store secrets.** Same rule as every memory file: no API keys, tokens, passwords, credentials, or env-var values.
10. **If this file conflicts with PROJECT_STATE.md or the actual repository, this file must be corrected.** The repository and PROJECT_STATE.md are always more authoritative.
11. **Do not preserve temporary thoughts** merely because they occurred recently. Only record facts, decisions, blockers, and outcomes.
12. **Preserve these when they materially affect continuation:** recent decisions, blockers (and unblock events), test results, implementation progress on active items, and the concrete next action.

---

# Recent Context

## Current Context

- Supabase integration is implemented in `public/app.js`, `public/supabaseClient.js`, and `src/supabaseClient.js`.
- The app fetches incidents/responders, subscribes to all Realtime events for both tables, inserts reports, updates assignments in parallel, and persists status changes.
- Local verification evidence: `npm test` passed (2/2); browser and Node syntax checks passed; `/`, `/app.js`, and `/supabaseClient.js` returned HTTP 200.
- Placeholder Supabase credentials remain intentionally unchanged. Live cloud verification is pending configuration, schema, RLS, and Realtime setup.
- Completion pass verified in browser: live responders loaded, role tabs switched DOM views, profile action showed feedback, and student mode hid dispatcher metrics.
- Current status: presentation-ready. Insert, assignment, and status handlers are implemented and guarded; no destructive live write was issued during verification.
- Supabase Auth is now wired with email/password sign-in, sign-up, sign-out, session restoration, and authenticated write guards. Auth settings endpoint returned HTTP 200; no account was created by the agent.
- Report submission diagnosis: live REST probes show `incidents.type` and `incidents.assigned_responder_id` are missing, while the database trigger references `NEW.type`; the attempted disposable insert failed for that schema mismatch.
- Added `supabase/migrations/20260925_campuscare_incidents.sql` to repair the columns and Realtime publication.
- Live schema recheck: `type` and `assigned_responder_id` now return HTTP 200, but `reporter_id` and `threat_score` still return HTTP 400. Added follow-up migration `supabase/migrations/20260925_campuscare_history_score.sql`.
- Report submission now retries with the legacy supported payload when Supabase rejects missing `reporter_id` or `threat_score`, so the current partially migrated schema can still accept reports.
- Triage scoring upgrade: `TRIAGE_RULES` now covers critical/high/medium/low dictionaries, defaults unknown text to 20, adds +25 for multiple matches, caps at 150, emits `threat_points`/`priority_reason`, and sorts the dispatcher queue by points descending.
- Removed manual incident type selection. Reports are now autonomously classified from description/location and scored using danger, utility, urgency, and location signals.
- Added authenticated persistent history by `reporter_id`, Realtime history tracking, and delete-own-report behavior.
- Fixed legacy report deletion by allowing known session-owned rows to delete by ID; the follow-up migration includes cleanup policy for legacy rows without `reporter_id`.
- Fixed autonomous responder assignment by ranking capabilities from responder name, role, and type. Updated campus branding to SRM University.

## Immediate Next Action

Run the history/score follow-up migration in the Supabase SQL Editor, then sign in and test fire, stolen, leak, and random descriptions at http://localhost:3000.
