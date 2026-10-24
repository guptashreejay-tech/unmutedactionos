# ACTIONOS — by UNMUTED

A complete, local ideathon prototype: discover a meaningful role, validate a community need, organise the work, and let partners verify the outcome.

## Run it

Open PowerShell in this folder:

```powershell
cd unmutedactionos
npm install
npm run dev
```

Open **http://localhost:3000/demo**. Keep the terminal running during your presentation.

If port 3000 is occupied, the launcher selects the next available port and prints the correct URL. If ActionOS is already running on that port, it prints that existing URL. Local storage belongs to a browser and port; changing either gives you a fresh demo.

After installation, the app works with the internet disconnected. Photos, fonts, data, matching and state are local. No keys, sign-in, hosting or external backend are required. The external UNMUTED link naturally needs internet access.

## Your 2–3 minute presentation path

1. **Home** — show the personalised feed and the 92% match on Project Ripple.
2. **Impact Profile** — show Aarav’s causes, skills, availability and portfolio. The “Edit interests & skills” button opens the five-step onboarding flow.
3. **Create initiative** — the flower-waste observation is prefilled. Click **Continue**, then **Validate the need**.
4. **Validate before you build** — explain how the partner refines “collect flowers” into a segregation and processing problem. Click **Accept refined problem**.
5. **Blueprint** — show the goal and 100 kg target. Open **Partners**, then **Team roles**. Expand **Why are 20 field volunteers needed?**
6. **Return to feed** — switch “Viewing as” to **Contributor**. Open Project Ripple. Click the large **Join Role** button, then **Join initiative**. The team grows from 19 to 20 and Outreach from 1 to 2.
7. **Open Workspace** — show **74% ready**, the remaining partner, ten vacancies, and the pending permission. All eight tabs contain working sample data.
8. **Execution Mode** — move to the clearly labelled later pilot-day sample, with 87 kg recorded and 19 contributors. Inspect evidence if desired, then **Submit for verification**.
9. Switch to **Partner** — click **Verify Impact**. The verified result is 87 kg, not the 100 kg aspiration. Partial verification and clarification are also supported.
10. **View my Impact Portfolio** — return to Student and show verified projects increasing from 2 to 3. The Ripple post now carries the partner-confirmed outcome.

Use **Demo guide** in the sidebar for direct access to each stage. Use **Reset demo** in the footer to restore the original rehearsal state. Reset is scoped to ActionOS’s storage key; it does not clear other browser data.

## Other working interactions

- Search, save, unsave and filter five initiatives by cause, SDG, location, mode, time, skills, stage and role.
- Change the Impact Profile and see deterministic matching scores and reasons change.
- Join open roles, with duplicate joins prevented.
- Accept, edit or dismiss the logistics suggestion; edit the success metric.
- Toggle partner commitments, permissions and resources; readiness recalculates.
- Move tasks between To do, In progress and Complete.
- Open sample collection records, receipt, photo placeholders and attendance.
- Add a portfolio update with an optional local image (up to 1.5 MB).
- Post a verified partner need and see it in Home and Discover.
- Refresh any route without losing saved rehearsal changes.

## Demo model

This is an honest simulation, not an authenticated production service. People, partner responses, evidence and historical portfolio counts are seeded demonstration data. Partner switching is intentionally open for presentation. AI does not verify anything and no AI API is called.

The creation flow is the curated Project Ripple scenario. The four other discovery records are intentionally lighter than the full Ripple workflow. Planning and pilot-day screens are distinct timeline snapshots so the rehearsal can show readiness blockers and the later measured result without pretending blockers were automatically resolved.

Role slots use a coherent 30-person roster: lead 1, liaison 1, operations 3, field 20, outreach 3, documentation 2. Initial occupancy is 19, including 12 field volunteers and 1 outreach volunteer. That leaves 8 field, 2 outreach and 1 documentation places.

Readiness uses the requested weights: need 20%, partners 20%, team 20%, permissions 15%, resources 10%, plan 15%. Those example inputs yield **80% preparation**. To preserve the requested **74% readiness** while keeping the arithmetic transparent, the demo caps readiness at 74% while a critical need, partner, permission or metric is missing. “How is readiness calculated?” explains this in the UI. Execution also requires at least 24 team members and all resources. Resource weights are bins 25%, gloves 20%, transport 14%, storage 27%, documentation 14%.

## Verification

```powershell
npm run typecheck
npm test
npm run build
# With the dev server running, using the installed Google Chrome:
npm run test:e2e
```

The browser suite covers the full presentation path, localStorage, reset, onboarding, search filters, saves, partner needs, alternate verification decisions, all routes, mobile overflow, console errors on the presentation path, and blocked external requests. Desktop target: 1366 × 768; mobile: 390 × 844. Screenshots are in `screenshots/`.

For an optional prebuilt local run: `npm run build`, then `npm start` (port 3000 must be free). Development mode is the default launcher with automatic port selection.

## Project structure

- `src/lib/data.ts`: typed mock records and initial state.
- `src/lib/logic.ts`: deterministic initiative and role matching, team counts and readiness.
- `src/components/ActionApp.tsx`: app shell, navigation, persisted state, account switcher and reset.
- `src/components/Community.tsx`: feed, discovery, onboarding and portfolio.
- `src/components/Initiative.tsx`: observe → validate → blueprint, roles and joining.
- `src/components/Workspace.tsx`: readiness, execution, evidence, partner portal and verification.
- `src/components/ui.tsx`: shared interface components and accessible modal.
- `src/app/globals.css`: responsive design system.
- `public/`: local image and font assets.

Built with Next.js, TypeScript, React, Lucide icons and plain CSS. Nothing has been deployed.

## Asset credits

Locally bundled cover photos: [flowers](https://images.unsplash.com/photo-1490750967868-88aa4486c946), [learning](https://images.unsplash.com/photo-1503676260728-1c00da094a0b), [dogs](https://images.unsplash.com/photo-1548199973-03cce0bbc87b), via Unsplash. These are illustrative cover photos, not evidence of actual projects. Site evidence photos are explicitly marked placeholders.

DM Sans is bundled locally under the SIL Open Font License. Lucide icons use the ISC license. Project and organisation names are demo content supplied for this prototype.

