# eyedeaz Agency PWA

Performance-first agency website and installable PWA built with React, Vite, Express, and Supabase.

## What this project is

- Premium agency positioning site
- Real lead capture flow backed by Supabase
- Offline-capable PWA shell with install prompt
- Production-minded frontend and backend separation

## Architecture

1. `src/` contains the React frontend.
2. `server/` contains the API layer and security middleware.
3. `supabase/migrations/` contains the lead table migration.
4. `public/offline.html` is the offline fallback used by the service worker.

## Environment

Copy `.env.example` to `.env.local` or your preferred environment file and set:

- `PORT`
- `ALLOWED_ORIGINS`
- `SESSION_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_LEADS_TABLE`
- `LEAD_WEBHOOK_URL` (optional)
- `GEMINI_API_KEY` (optional)
- `GEMINI_MODEL_TEXT` (optional)

## Local development

1. Install dependencies:
   `npm install`
2. Apply the Supabase migration in `supabase/migrations/001_create_leads.sql`
3. Start the app:
   `npm run dev`

The local server runs the frontend and API layer together on `http://localhost:3000`.

## Quality checks

- `npm run validate:restricted`
- `npm run test`
- `npm run build`

## Restricted environments

Some sandboxed or locked-down environments block `esbuild` subprocess execution and cause Vite or Vitest to fail with `spawn EPERM`. In those environments, use the fallback validation path:

- `npm run validate:restricted`

This runs:

- `npm run lint`
- `npm run typecheck`

Use CI for the full validation path:

- `npm run test`
- `npm run build`

If `vite build` or `vitest` fail locally with `spawn EPERM`, the recommended workflow is:

1. Run `npm run validate:restricted` locally
2. Push your branch
3. Let GitHub Actions run the full Vite/Vitest/build pipeline

## Production notes

- Deploy the frontend build output to your host of choice.
- Run the Express API with the same environment variables in production.
- Set `ALLOWED_ORIGINS` to your real domain.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Rotate `SESSION_SECRET` and Gemini credentials outside the repo.
