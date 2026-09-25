# CampusCare

CampusCare is a mobile-first campus incident response dashboard. The current phase uses Supabase for persistent incidents, responder profiles, and Realtime synchronization.

## Project Structure

```
.
├── public/
│   ├── app.js            # Live data queries, Realtime handlers, and UI state
│   ├── index.html        # Dashboard shell and report form
│   ├── styles.css         # Responsive dashboard styles
│   └── supabaseClient.js  # Browser Supabase client configuration
├── server.js              # Static development server
├── src/
│   └── supabaseClient.js  # Node-side Supabase client bridge
├── test/
│   └── index.test.js      # Starter smoke tests
├── .env.example          # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- npm (or pnpm)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the browser client:

   ```bash
   # edit public/supabaseClient.js
   ```

   Replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with the public values from Supabase Project Settings > API. The anon key is intended for browser use; never expose a service-role key.

3. In Supabase, create `incidents` and `responders` tables with Realtime enabled. The frontend expects `incidents.created_at`, `incidents.status`, `incidents.assigned_responder_id`, and responder fields including `id`, `name`, `type`, `role`, and `availability`.

   If the existing `incidents` table was created without `type`, `reporter_id`, `threat_score`, or `assigned_responder_id`, run [supabase/migrations/20260925_campuscare_incidents.sql](supabase/migrations/20260925_campuscare_incidents.sql) in the Supabase SQL Editor. If that migration was already run partially, run the follow-up [supabase/migrations/20260925_campuscare_history_score.sql](supabase/migrations/20260925_campuscare_history_score.sql). The follow-up also permits authenticated cleanup of legacy rows that predate `reporter_id`; new reports remain protected by ownership.

4. Enable Email authentication in Supabase Authentication > Providers. The app provides email/password sign-in, account creation, session restoration, and sign-out from the account button in the dashboard. Supabase Auth persists the browser session and automatically authenticates the Realtime client.

## Scripts

- `npm start` — Run the application
- `npm run dev` — Run the application in watch mode (auto-restarts on file changes)
- `npm test` — Run the test suite
- `npm run test:watch` — Run tests in watch mode

## Next Steps

The app is intentionally frontend-first. The browser autonomously classifies each report using the deterministic matrix in `public/app.js`: critical matches start at 100 points, high at 75, medium at 50, low at 25, unknown text defaults to 20, and multiple matches receive a +25 bonus up to 150. The resulting `threat_points` and `priority_reason` are stored when the schema supports them; the browser subscribes to row changes through Supabase Realtime. Report submission, deletion, assignment, and status changes require an authenticated Supabase session.

## License

MIT
