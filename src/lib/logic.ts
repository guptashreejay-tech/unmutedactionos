import { Initiative, Profile, State } from "./data";
export function match(profile: Profile, project: Initiative) {
  const reasons: string[] = [];
  let score = 12;
  if (profile.causes.includes(project.cause)) {
    score += 25;
    reasons.push(
      `${project.cause === "Children & Education" ? "Education" : project.cause} interest`,
    );
  }
  const common = project.skills.filter((s) => profile.skills.includes(s));
  score += Math.round((common.length / project.skills.length) * 20);
  common.forEach((s) => reasons.push(`${s} skill`));
  if (
    profile.days === project.days ||
    profile.days === "Flexible" ||
    project.days === "Flexible"
  ) {
    score += 15;
    reasons.push(
      `${profile.days === "Weekends" ? "Weekend" : profile.days} availability`,
    );
  }
  if (profile.location.toLowerCase() === project.location.toLowerCase()) {
    score += 10;
    reasons.push(`Based in ${project.location}`);
  }
  if (profile.hours === project.hours || profile.hours === "5+ hours/week") {
    score += 5;
    reasons.push("Fits your time commitment");
  }
  if (
    profile.mode === project.mode ||
    profile.mode === "Hybrid" ||
    project.mode === "Hybrid"
  ) {
    score += 5;
    reasons.push(`${project.mode} contribution`);
  }
  return { score: Math.min(99, score), reasons };
}
export function teamCount(state: State, project: Initiative) {
  return (
    project.filled +
    (state.joined[project.id] && project.id !== "digital" ? 1 : 0)
  );
}
const roleSkills: Record<string, string[]> = {
  "Outreach Volunteer": ["Public Speaking", "Outreach"],
  "Field Volunteer": ["Research", "Logistics"],
  "Documentation Volunteer": ["Photography", "Research", "Writing"],
  "Workshop Facilitator": ["Public Speaking", "Teaching"],
  "Content Volunteer": ["Design", "Writing"],
  "Field Mapping": ["Research", "Logistics"],
  Research: ["Research"],
  Collection: ["Logistics", "Outreach"],
  Sorting: ["Event Management", "Logistics"],
  "Partner Liaison": ["Public Speaking", "Outreach"],
};
export function roleMatch(profile: Profile, project: Initiative, role: string) {
  return match(profile, {
    ...project,
    skills: roleSkills[role] || project.skills,
  });
}
export function recommendedRole(profile: Profile, project: Initiative) {
  return [...project.roles].sort(
    (a, b) =>
      roleMatch(profile, project, b).score -
      roleMatch(profile, project, a).score,
  )[0];
}
export function readiness(state: State) {
  const team = 19 + (state.joined.ripple ? 1 : 0);
  const parts = [
    { name: "Need validation", value: state.validated ? 100 : 0, weight: 20 },
    {
      name: "Partners",
      value: Math.round((state.partners.filter(Boolean).length / 3) * 100),
      weight: 20,
    },
    { name: "Team", value: Math.round((team / 30) * 100), weight: 20 },
    {
      name: "Permissions",
      value: state.permissions.filter(Boolean).length * 20,
      weight: 15,
    },
    {
      name: "Resources",
      // Bins, gloves, transport, storage, records: seeded secured resources total 72%.
      value: state.resources.reduce(
        (sum, secured, i) => sum + (secured ? [25, 20, 14, 27, 14][i] : 0),
        0,
      ),
      weight: 10,
    },
    { name: "Execution plan", value: 100, weight: 15 },
  ];
  const preparation = Math.round(
    parts.reduce((n, p) => n + (p.value * p.weight) / 100, 0),
  );
  const critical =
    !state.validated ||
    state.partners.some((p) => !p) ||
    state.permissions.some((p) => !p) ||
    !state.metric.trim();
  const blockers = [
    ...(!state.validated ? ["Community need has not been validated"] : []),
    ...(state.partners.some((p) => !p)
      ? [`${state.partners.filter((p) => !p).length} required partner missing`]
      : []),
    `${30 - team} team positions unfilled`,
    ...(state.permissions.some((p) => !p)
      ? [`${state.permissions.filter((p) => !p).length} permission pending`]
      : []),
    ...(!state.metric.trim() ? ["Impact metric missing"] : []),
  ];
  return {
    score: critical ? Math.min(74, preparation) : preparation,
    preparation,
    parts,
    blockers,
    ready: !critical && team >= 24 && state.resources.every(Boolean),
  };
}
