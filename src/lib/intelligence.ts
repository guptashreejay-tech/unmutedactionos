import type { Row } from "./database.types";
export type Observation = {
  observation: string;
  affected: string;
  city: string;
  frequency: string;
  existing: string;
  assumptions: string;
  unknowns: string;
  outcome: string;
  cause: string;
};
export type Structured = {
  known: string[];
  assumptions: string[];
  questions: string[];
  stakeholders: string[];
  sdg: number;
  reasoning: string;
};
export interface ActionOSIntelligenceProvider {
  structure(input: Observation): Structured;
  staffing(
    target: number,
    capacity: number,
    sessions: number,
  ): { count: number; explanation: string };
  match(
    profile: Row<"profiles">,
    preferences: Row<"profile_preferences">,
    project: Row<"initiatives">,
    roles: Row<"initiative_roles">[],
  ): { score: number; reasons: string[] };
}
export class RulesEngineProvider implements ActionOSIntelligenceProvider {
  structure(o: Observation): Structured {
    const sdgs: Record<string, number> = {
      environment: 12,
      education: 4,
      animals: 15,
      inclusion: 10,
      community: 11,
      health: 3,
      food: 2,
    };
    return {
      known: [
        o.observation,
        `Reported affected group: ${o.affected}`,
        `Reported location: ${o.city}; frequency: ${o.frequency}`,
        `Existing response: ${o.existing || "Not yet researched"}`,
      ],
      assumptions: [
        o.assumptions ||
          "The reported problem represents a wider community need.",
      ],
      questions: [
        o.unknowns || "What do affected people say they need?",
        "What evidence would show a meaningful change?",
        "Which permissions and safeguarding measures are required?",
      ],
      stakeholders: [
        "Affected community",
        "Local implementing organisation",
        "Independent verification partner",
      ],
      sdg: sdgs[o.cause] ?? 11,
      reasoning: `Suggested from the ${o.cause} cause category. Confirm relevance with your partner; observations are not validated facts.`,
    };
  }
  staffing(target: number, capacity: number, sessions: number) {
    const count = Math.ceil(target / Math.max(1, capacity * sessions));
    return {
      count,
      explanation: `${target} participants ÷ (${capacity} participants per volunteer × ${sessions} sessions) = ${count} volunteers, rounded up. Edit this estimate for your actual workload.`,
    };
  }
  match(
    p: Row<"profiles">,
    a: Row<"profile_preferences">,
    i: Row<"initiatives">,
    roles: Row<"initiative_roles">[],
  ) {
    let score = 0;
    const reasons: string[] = [];
    if (p.causes.includes(i.cause)) {
      score += 30;
      reasons.push("Cause matches your interests (+30)");
    }
    const open = roles.filter((r) => r.positions_filled < r.positions_required);
    if (open.some((r) => r.skills.some((s) => p.skills.includes(s)))) {
      score += 25;
      reasons.push("Your skills match an open role (+25)");
    }
    if (
      open.some(
        (r) =>
          r.commitment_hours <= a.hours &&
          (r.schedule === a.days || r.schedule === "Flexible"),
      )
    ) {
      score += 15;
      reasons.push("Fits your hours and schedule (+15)");
    }
    if (
      i.mode === "Online" ||
      (i.city.toLowerCase() === p.city.toLowerCase() &&
        (i.mode === a.mode || a.mode === "Hybrid" || i.mode === "Hybrid"))
    ) {
      score += 15;
      reasons.push("Fits your city or remote preference (+15)");
    }
    if (i.urgent) {
      score += 10;
      reasons.push("The team needs help urgently (+10)");
    }
    if (
      open.some(
        (r) =>
          r.experience_level === "Beginner" ||
          r.experience_level === p.experience_level,
      )
    ) {
      score += 5;
      reasons.push("Fits your experience (+5)");
    }
    return { score, reasons };
  }
}
// A future provider must implement this contract; no external model or API is enabled.
export interface FutureLLMProvider extends ActionOSIntelligenceProvider {
  readonly requiresHumanReview: true;
}
export const intelligence: ActionOSIntelligenceProvider =
  new RulesEngineProvider();
