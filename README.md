# ActionOS — by UNMUTED

Turn intention into coordinated, partner-verified impact. ActionOS connects people, community needs and organisations through a shared workflow: observe → validate → plan → act → verify.

## Explore

- **Main app:** [unmutedactionos.vercel.app](https://unmutedactionos.vercel.app) — real Supabase accounts, database records and private file storage.
- **Presentation demo:** [unmutedactionos.vercel.app/demo](https://unmutedactionos.vercel.app/demo) — an interactive, browser-local prototype with clearly labelled sample data. No account is required. See the [presentation guide](docs/PROTOTYPE.md).

The demo does not write to the real database. `/demo2` remains a compatibility route for earlier presentation links.

## Features

- Discover initiatives, roles, organisation needs and community updates.
- Create an initiative from an observation, record independent validation and develop an editable blueprint.
- Coordinate roles, applications, partners, tasks, permissions, resources, evidence and metrics.
- Require readiness checks before execution and independent partner review before verified outcomes.
- Maintain profiles, organisation teams, notifications and moderation workflows.
- Explain deterministic matching and staffing suggestions without paid AI APIs.

## Stack and architecture

Next.js App Router, React, TypeScript and Supabase. Vercel serves the frontend and server routes; Supabase hosts PostgreSQL, authentication and private storage. SQL migrations and generated database types are included.

All 32 public tables have row-level security. Writes use checked transactional operations; the browser never receives a service-role key. Organisation authority and outcome verification require independent review. The prototype's simulated identities and badges are isolated from those real workflows.

## Run locally

Use Node.js 24 and npm. Copy `.env.example` to `.env.local`, then supply your own Supabase URL and **publishable** key. Apply the migrations to your own Supabase project if you are making a separate installation.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000` for the main app or `http://localhost:3000/demo` for the presentation prototype. The prototype also runs without Supabase settings.

## Checks

```sh
npm test
npm run typecheck
npm run build
npm run test:live
```

`npm test` covers matching, readiness, optional profile images and SQL lifecycle/authorization boundaries using embedded PostgreSQL. `test:live` checks your configured Supabase API and running website without creating records. Set `TEST_URL` to check a deployed website. `supabase/tests/live-smoke.sql` tests a real database inside a rolled-back transaction.

The optional Playwright presentation suite is `npm run test:e2e` and requires Chrome. Automated test results are not a claim that every email, browser and multi-account journey has been manually verified.

## Deployment and security

Import this repository into Vercel as a Next.js project. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the deployment's environment settings. Configure the Supabase Site URL and exact `/auth/callback` redirect URLs for the deployed domain, including `?next=/reset-password`.

Environment files, credentials, screenshots, build output and local artifacts are excluded from Git. Only `.env.example` with empty values is included. Never add a database password, access token or service-role key to browser code or a `NEXT_PUBLIC_` variable.

See [setup, administration and limitations](docs/SETUP.md) and the [release verification record](docs/RELEASE.md). This is an ideathon V1; operational hardening and the documented remaining product features are ongoing.
