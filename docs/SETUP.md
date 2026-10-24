# ActionOS V1 handover

## 1. What changed
The mounted app now reads and writes Supabase records instead of the old localStorage demo snapshot. It retains the navy/neutral styling, local images, local fonts, and reusable dialogs. The real routes include authentication, introduction/profile setup, discovery, creation, initiative details and workspace, organisation/partner workflows, notifications, and database-authorized administration. `/` opens the real app; `/demo` opens the isolated presentation prototype.

## 2. Database
Applied to the existing **Action os** project, ref `zpxoiwyqvccmgrzvvttu`:

- Identity and taxonomy: `profiles`, `profile_preferences`, `admin_users`, `causes`, `skills`, `sdgs`.
- Organisations: `organisations`, `organisation_members`, `organisation_verification_requests`, `organisation_needs`.
- Initiatives: `initiatives`, `initiative_roles`, `initiative_members`, `role_applications`, `initiative_partners`, `initiative_validations`, `initiative_stakeholders`, `initiative_tasks`, `initiative_permissions`, `initiative_resources`, `initiative_metrics`, `initiative_evidence`, `initiative_attendance`.
- Independent outcomes: `impact_verification_requests`, `impact_verifications`.
- Community: `impact_posts`, `comments`, `saved_initiatives`, `follows`, `notifications`, `reports`, `moderation_actions`.

32 public tables, all with RLS. Migrations are versioned under `supabase/migrations`. Actual project types are in `src/lib/database.types.ts`.

## 3. Authorization
All table writes from anonymous/authenticated clients are revoked. `actionos_mutate` is a security-invoker wrapper around an explicitly authorized transactional operation in the unexposed `actionos_private` schema. Privileged functions use an empty search path, have PUBLIC execution revoked, and check the current authenticated, non-suspended account. User metadata does not confer administrator or partner authority.

Public reads respect visibility and moderation. Applications, preferences, validation responses, team planning, private evidence, organisation verification documents and moderation history have separate owner/member/partner/admin rules. Roles are locked before filling slots. The database checks stage transitions, readiness, mandatory safeguarding permissions, accepted verification partners and independent reviewers. Submitted/verified metric definitions cannot be edited to rewrite history.

## 4. Files
Private buckets: `avatars` (2 MB), `organisation-logos` (2 MB), `impact-post-media` (5 MB), `initiative-evidence` (10 MB), `organisation-verification` (10 MB). Bucket MIME allowlists reject executable formats. Upload paths include the authenticated uploader and relevant initiative/organisation. Read access is checked before issuing a two-minute signed URL. Uploaded evidence cannot be overwritten. Failed metadata saves may leave an orphan file; an administrator cleanup process is still needed before broad production use.

## 5. Run locally
From this `actionos` directory:

```powershell
npm ci
npm run dev
```

Current address: **http://localhost:3000/**. Sign up at **http://localhost:3000/signup**. The launcher selects the next free port if needed and prints it. Restart after changing environment settings.

```powershell
npm test
npm run typecheck
npm run build
npm run test:live
```

`npm test` runs genuine SQL authorization/lifecycle tests in embedded PostgreSQL with minimal Auth/Storage schema stubs. `test:live` checks the configured remote public endpoints without creating data. `supabase/tests/live-smoke.sql` is an additional transaction-only test for the real Supabase SQL editor; it rolls back its fixtures. None of these substitute for email delivery and browser testing.

## 6. Environment and Auth setup
`.env.local` is configured locally and ignored by Git. Only these two client settings are required:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://zpxoiwyqvccmgrzvvttu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your publishable key>
```

No service-role key or external AI key is in the app. In Supabase Authentication → URL Configuration, the production Site URL is `https://unmutedactionos.vercel.app`, with these redirect URLs allowed:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/callback?next=/reset-password`

Add the corresponding production callback URLs for `https://unmutedactionos.vercel.app`, including the reset-password query. Local Supabase configuration already contains them. Email signup is enabled on the hosted project. Google is disabled there, and its button is therefore hidden. Configure SMTP/rate limits and abuse protections before an external launch.

## 7. Development examples
Taxonomy is included in the migration. No pretend users, fixed passwords, or fake verified outcomes are automatically installed. For optional examples, sign up a real development account and finish its profile, then in the SQL editor run:

```sql
select set_config('actionos.seed_lead_id', 'YOUR_DEVELOPMENT_PROFILE_UUID', false);
```

Run `supabase/seed-development.sql` in the same SQL session. It creates four clearly labelled private drafts and real role records. Re-running skips existing examples. They still require human validation before publication. It does not alter existing real initiatives.

## 8. First administrator
Sign up and complete the intended administrator's profile. The project owner then runs this in the Supabase SQL editor, replacing the username:

```sql
insert into public.admin_users(user_id)
select id from public.profiles where username = 'YOUR_ADMIN_USERNAME'
on conflict (user_id) do nothing;
```

Refresh the app and open `/admin`. No user is automatically promoted, and the browser cannot grant admin status. To revoke, the project owner deletes that specific `admin_users` row in the dashboard.

## 9. Organisation verification
A signed-in representative creates an organisation and becomes its owner. A manager submits an official contact/reference and optional private document. An independent platform administrator records Verified or Rejected with notes and an audit record. Only verified organisations can publish verified needs. A verified organisation must separately accept an initiative's Verification Partner invitation before it can assess an outcome. A participating user cannot verify their own initiative.

## 10. Deterministic assistance
`RulesEngineProvider` separates reported observations, assumptions, open questions and suggested stakeholders/SDGs. Suggestions remain editable and are labelled “ActionOS suggests.” Staffing is `ceil(participants / (capacity per volunteer × sessions))`. Matching uses cause 30, skill 25, availability 15, city/mode 15, urgency 10 and experience 5, with explanations. Readiness is computed by the database with weights 20/20/20/15/10/10/5 and hard blockers.

## 11. Future language-model integration
`ActionOSIntelligenceProvider` in `src/lib/intelligence.ts` is the replacement boundary. `FutureLLMProvider` describes a future reviewed implementation but calls no service. Keep generation advisory: do not let a model approve partners, set verification badges or bypass database checks.

## 12. Deliberately excluded capabilities
No payments, direct messages, automatic authority approval, external AI API, was added. Deployment details are recorded in RELEASE.md. The earlier presentation prototype is independently mounted at /demo (with /demo2 compatibility) and keeps its original browser-local sample data. It is not a fallback for the real app.

## 13. Remaining limitations
This is a working local V1 implementation with tested database workflows, not a completed production certification. Outstanding work includes full interactive browser verification (blocked by the browser tool's URL policy), delivery/recovery email tests, real upload/signed-download integration tests, public contributor portfolio aggregates, a following-specific feed, and a first-time tooltip system. Workspace collections currently use bounded fetches (100–200 records); platform counters cap at 1,000 and say so. Live activity is initially empty. No claim is made that all 97 brief sections are complete.

The latest Supabase security advisor reports only disabled compromised-password screening; no database access warnings were reported. Its performance advisor reported informational [unused indexes](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index), expected on a new database without traffic; foreign-key indexes were retained. Before launch, add operational monitoring, file cleanup, rate limiting/abuse handling, retention policy, and a full multi-account browser acceptance run.

## 14. Localhost URL
**http://localhost:3000/** — connected to the user's existing Action os Supabase project.
