# Project State

# Project State

## Current Stage

This repository is currently presentation-ready for the CampusCare hackathon frontend.

The app has been rebuilt from the placeholder greeting demo into a mobile-first campus safety dashboard with role-segmented student/dispatcher views, incident reporting, personal session history, threat scoring, responder assignment protection, persistent Supabase queries, and Realtime synchronization.

## Repository

- Project directory: /Users/sairuthwikreddyvangala/Documents/trae_projects/Hackthon_project
- Project name: campuscare-prototype
- Runtime: Node.js, CommonJS
- Entry point: server.js
- Static frontend: public/
- Verified run target: http://localhost:3000
- Supabase package: @supabase/supabase-js
- Current presentation status: ready
- Authentication: Supabase email/password flow wired; account creation requires Email provider enabled in the project

## Implemented Components

- server.js: static file server for the web app
- public/index.html: role tabs, student report/history view, dispatcher queue/roster/threat view
- public/styles.css: mobile-first dark theme and responsive dashboard styling
- public/app.js: role switching, session history, threat scoring, Realtime DOM updates, assignment protection, and report/status actions
- public/supabaseClient.js: browser Supabase client and configured project connection
- src/supabaseClient.js: Node-side Supabase client bridge
- package.json: local app startup scripts for Node server
- public/index.html: role tabs, student report/history view, dispatcher queue/roster/threat view

## Architecture

The prototype is a single-page dashboard. Browser state is populated from Supabase and reconciled through two Realtime channels. Browser-side JavaScript renders incidents, assigns responders, and persists incident status transitions.

## Integrations

Supabase REST, Realtime, and Auth are integrated through @supabase/supabase-js. The app uses the anon public key, restores browser sessions, listens for auth state changes, and requires an authenticated session for writes. Database RLS and triggers remain responsible for authorization and server-side priority/reason evaluation.

## Testing

Verified commands and outcomes:

- `npm test` passed: 2 tests passed, 0 failed.
- Browser ES module syntax checks passed for public/app.js and public/supabaseClient.js.
- CommonJS syntax check passed for src/supabaseClient.js.
- HTTP checks returned 200 for `/`, `/app.js`, and `/supabaseClient.js` while the app was running.
- Live cloud verification is pending because public/supabaseClient.js still contains placeholders.
- Supabase Auth settings endpoint returned HTTP 200; no test account was created during verification.
- Current database blocker: the live `incidents` table lacks `type` and `assigned_responder_id`, but its insert trigger references `NEW.type`; report writes remain blocked until the supplied migration is run.
- Autonomous reporting: manual type selection removed; classification uses text/location signals and threat score is stored in `threat_score`.
- Personal history: authenticated `reporter_id` query plus Realtime tracking and owned-report deletion implemented.

## Known Issues / Blockers

No code blocker is recorded. The connected project responds successfully and exposes the expected incidents/responders tables.

## Important Constraints

- Must remain runnable from this repo with the static Node server.
- No authentication flow is implemented; Supabase RLS governs the public client.
- Email/password authentication must be enabled in Supabase Auth provider settings.
- Supabase owns persistence and Realtime updates once configured.
- Incident insert sends only type, location, and description; database triggers should calculate priority and reason.
- Schema repair migration: `supabase/migrations/20260925_campuscare_incidents.sql`

## Last Verified

Verified on 2026-09-25 after live Supabase reads and browser interaction checks. Write handlers were reviewed and guarded but not fired against the connected presentation database.
