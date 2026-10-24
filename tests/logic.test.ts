import { test } from "node:test";
import assert from "node:assert/strict";
import { freshState, initiatives } from "../src/lib/data";
import {
  match,
  readiness,
  teamCount,
  recommendedRole,
  roleMatch,
} from "../src/lib/logic";
test("matching is deterministic and responds to profile compatibility", () => {
  const s = freshState();
  assert.equal(match(s.profile, initiatives[0]).score, 92);
  assert.equal(
    match(s.profile, initiatives[0]).score,
    match(s.profile, initiatives[0]).score,
  );
  assert.ok(
    match(
      {
        ...s.profile,
        causes: [],
        skills: [],
        days: "Weekdays",
        location: "Delhi",
        mode: "Online",
        hours: "1–2 hours/week",
      },
      initiatives[0],
    ).score < 30,
  );
  assert.ok(
    match(s.profile, initiatives[0]).reasons.includes("Outreach skill"),
  );
});
test("joining increments the overall team exactly once", () => {
  const s = freshState();
  assert.equal(teamCount(s, initiatives[0]), 19);
  s.joined.ripple = "Outreach Volunteer";
  assert.equal(teamCount(s, initiatives[0]), 20);
  s.joined.ripple = "Outreach Volunteer";
  assert.equal(teamCount(s, initiatives[0]), 20);
});
test("critical blockers cap readiness regardless of a good preparation score", () => {
  const s = freshState();
  assert.equal(readiness(s).score, 74);
  assert.equal(readiness(s).ready, false);
  assert.equal(readiness(s).preparation, 80);
  s.partners = [true, true, true];
  s.permissions = [true, true, true, true, true];
  assert.ok(readiness(s).score > 74);
  assert.equal(readiness(s).ready, false);
  s.metric = "";
  assert.ok(readiness(s).blockers.includes("Impact metric missing"));
  assert.equal(readiness(s).score, 74);
});
test("readiness breakdown updates when requirements change", () => {
  const s = freshState();
  s.permissions[4] = true;
  assert.equal(
    readiness(s).parts.find((p) => p.name === "Permissions")?.value,
    100,
  );
  s.validated = false;
  assert.equal(readiness(s).parts[0].value, 0);
  assert.ok(
    readiness(s).blockers.includes("Community need has not been validated"),
  );
});
test("role suggestions change when relevant skills change", () => {
  const s = freshState();
  assert.equal(
    recommendedRole(s.profile, initiatives[0]),
    "Outreach Volunteer",
  );
  assert.equal(
    roleMatch(s.profile, initiatives[0], "Outreach Volunteer").score,
    92,
  );
  s.profile.skills = ["Photography", "Research", "Writing"];
  assert.equal(
    recommendedRole(s.profile, initiatives[0]),
    "Documentation Volunteer",
  );
});
test("no secured resources means zero resource readiness", () => {
  const s = freshState();
  s.resources = [false, false, false, false, false];
  assert.equal(
    readiness(s).parts.find((p) => p.name === "Resources")?.value,
    0,
  );
  s.resources = [true, true, true, true, true];
  assert.equal(
    readiness(s).parts.find((p) => p.name === "Resources")?.value,
    100,
  );
});
