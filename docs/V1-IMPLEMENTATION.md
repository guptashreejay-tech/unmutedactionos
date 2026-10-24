# V1 implementation record

## Repository assessment
The existing Next.js app has a useful navy/neutral design system, responsive cards, clear project tabs, accessible dialogs, and a full rehearsed journey. Its data layer is a single browser localStorage snapshot; every project workflow is coupled to Project Ripple and the account switcher grants privileges locally. Seeded partner replies and verification cannot be promoted to production authorization.

Preserve the stylesheet, local assets, UI primitives and journey vocabulary. Replace the mounted application with database-backed feature components in the existing Next.js project. The original source is independently mounted at /demo2 at your request. Main-app routes never use demo state.

## Implementation sequence
1. Inspected project “Action os” (`zpxoiwyqvccmgrzvvttu`). The connection recovered after the user refreshed it. The public schema and buckets were empty. Applied the V1, integrity-guard and member/discovery migrations to this existing project. No replacement project was created.
2. Prepare reproducible migrations with normalized ownership/membership, RLS, private Storage and transactional lifecycle operations. Test SQL against embedded PostgreSQL while remote connection is unavailable.
3. Add Supabase session/auth, typed repository services, public landing and protected application shell.
4. Wire onboarding, deterministic discovery, editable observation → validation → blueprint, joining/applications, workspace, execution, evidence and partner verification.
5. Wire organisations, needs, social updates/comments/follows/saves, notifications, settings and admin moderation.
6. Generate database types; test authorization boundaries, UI journeys and production build; document remaining external setup precisely.

## Verification results — 24 October 2026
- Production build and TypeScript passed.
- 13 automated tests passed (PostgreSQL authorization/lifecycle and deterministic suggestions).
- A live, transaction-only Supabase smoke test passed the complete draft → validation → team → readiness → execution → independent verification → completion flow. It checked cross-user access and private Storage policies and rolled back all fixtures.
- Live public API reads, email Auth configuration, anonymous-write denial, private-bucket denial and localhost health passed.
- Generated TypeScript types from the actual project schema.
- Supabase security advisor: no findings after both migrations. Performance advisor: informational unused-index findings on the new empty database; retain the foreign-key indexes until real workload evidence warrants changes.
- Browser verification was blocked by the browser tool's URL policy when it tried to bind an existing localhost error tab. No alternate browser automation was used to bypass that restriction. Visual and interactive browser verification, email delivery/recovery, and actual signed file transfer remain unverified.
- No persistent synthetic users or fake verified outcomes were added to the live project.

## Security approach
Only publishable credentials in the app. Session identity comes from Supabase Auth. Admin and organisation permissions come from database memberships, never user metadata. Direct table writes are revoked; narrowly authorized transactional mutations live in a private schema and are reached through a security-invoker RPC wrapper. Every mutation checks the authenticated, non-suspended actor. Read policies are specific to public visibility, ownership, team membership, accepted partners or admin status. Private documents and evidence require matching Storage policies and short-lived signed URLs.
