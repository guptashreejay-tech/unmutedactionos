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

## Deployment result — 25 October 2026

- Vercel production deployment `dpl_CpF1aVXRbTQxdC4z5iiHTVL8xgGc` is READY.
- Main app: https://unmutedactionos.vercel.app/
- Presentation prototype: https://unmutedactionos.vercel.app/demo
- Public source: https://github.com/guptashreejay-tech/unmutedactionos
- Application release commit: `5a91fe4` (subsequent changes document verification and improve the check script).
- Main page, prototype, prototype discovery, login and backend health returned HTTP 200 without Vercel sign-in.
- Live Supabase API and access-denial checks passed with the deployed website as the health target.
- Browser smoke checks confirmed the main feed loads from Supabase, the real sign-in form renders, and the prototype journey through role joining, workspace tabs, evidence submission, partner verification and reset works. Both inspected browser consoles had no errors.
- The inspected main-app browser console had no errors. Vercel's available five-minute runtime-error scan returned zero records; this is a point-in-time check, not continuous monitoring.
- Source scan found no credential patterns, private keys, connection passwords, actual publishable keys or personal filesystem paths in tracked files. `.env.local`, `.vercel/`, screenshots and generated output are excluded.

Full browser acceptance with real accounts, email delivery/recovery and physical private-file transfers remain unverified. No paid monitoring integration or continuous-deployment Git integration was enabled; deploy updated source with the Vercel CLI after running checks.
