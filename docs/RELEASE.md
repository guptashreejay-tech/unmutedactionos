# Release verification — 24 October 2026

## Release layout
- Main app at `/`; presentation prototype at `/demo`.
- Next.js frontend and server routes target Vercel.
- Supabase hosts the connected database, authentication and private storage.

## Completed checks
- 23 automated tests passed, including SQL lifecycle and authorization boundaries, prototype matching/readiness, and optional-image onboarding.
- TypeScript check and optimized production build passed.
- Production dependency audit: zero vulnerabilities.
- Live Supabase lifecycle, independent verification, cross-user row security and private storage checks passed; transaction fixtures were rolled back.
- Live reads, Auth settings, anonymous-write rejection, private-bucket rejection and local production server health passed.
- Production Site URL and exact confirmation/recovery callbacks configured in Supabase.

## Acceptance limits
Email delivery and recovery with a real mailbox, physical file transfer and the complete multi-account browser journey still require acceptance testing. The database tests validate permissions and state transitions, but do not substitute for those checks. Compromised-password screening remains disabled in Supabase. See SETUP.md for product and operational limitations.

Deployment verification and source-publication results are recorded as the release completes.
