export type Account = "Student" | "Contributor" | "Partner";
export type Profile = {
  causes: string[];
  skills: string[];
  contributions: string[];
  hours: string;
  days: string;
  location: string;
  mode: string;
};
export type Initiative = {
  id: string;
  title: string;
  cause: string;
  sdg: string;
  description: string;
  goal: string;
  metric: string;
  location: string;
  mode: string;
  hours: string;
  skills: string[];
  days: string;
  filled: number;
  total: number;
  roles: string[];
  stage: string;
  verified: boolean;
  image: string;
  partner: string;
  urgent?: boolean;
  fresh?: boolean;
};
export type Update = {
  id: string;
  initiative: string;
  text: string;
  role: string;
  outcome: string;
  photo: string;
};
export type Need = {
  id: string;
  organisation: string;
  need: string;
  outcome: string;
  support: string;
  roles: string;
};
export type State = {
  version: number;
  account: Account;
  profile: Profile;
  onboarded: boolean;
  joined: Record<string, string>;
  saved: string[];
  created: boolean;
  validated: boolean;
  refined: string;
  observation: string;
  observationDetails: Record<string, string>;
  createStep: number;
  verification:
    "unsubmitted" | "pending" | "verified" | "partial" | "clarification";
  verificationNote: string;
  verifiedKg: number;
  checks: boolean[];
  permissions: boolean[];
  resources: boolean[];
  partners: boolean[];
  tasks: number[];
  updates: Update[];
  needs: Need[];
  suggestion: string;
  metric: string;
};
export const causes = [
  "Children & Education",
  "Environment",
  "Animal Welfare",
  "Health",
  "Gender Equality",
  "Accessibility",
  "Community Development",
  "Poverty / Livelihoods",
  "Technology for Good",
];
export const skills = [
  "Public Speaking",
  "Teaching",
  "Design",
  "Photography",
  "Video Editing",
  "Research",
  "Outreach",
  "Fundraising",
  "Event Management",
  "Logistics",
  "Coding / Technology",
  "Writing",
  "Social Media",
];
export const refinedProblem =
  "Participating temples lack a consistent system for segregating floral waste and directing it towards responsible processing.";
export const observation =
  "I've noticed that a lot of flowers from temples are discarded every day, and I want to work on what happens to this waste.";
export const initiatives: Initiative[] = [
  {
    id: "ripple",
    title: "Project Ripple",
    cause: "Environment",
    sdg: "12",
    description:
      "Give yesterday’s flowers a better tomorrow. Help five local temples turn floral waste into a responsible circular system.",
    goal: "Pilot a flower-waste segregation and verified-processing system across 5 collection points.",
    metric: "Kilograms of floral waste reaching verified processing.",
    location: "Bengaluru",
    mode: "In-person",
    hours: "3–5 hours/week",
    skills: ["Public Speaking", "Outreach", "Research"],
    days: "Weekends",
    filled: 19,
    total: 30,
    roles: ["Field Volunteer", "Outreach Volunteer", "Documentation Volunteer"],
    stage: "Building team",
    verified: true,
    image: "flowers",
    partner: "Circular Bengaluru",
    urgent: true,
  },
  {
    id: "digital",
    title: "Digital Skills Saturdays",
    cause: "Children & Education",
    sdg: "4",
    description:
      "A little digital confidence goes a long way. Help young learners build skills for an increasingly online world.",
    goal: "Run a six-week digital literacy programme.",
    metric:
      "% of participants independently completing 5 predefined digital tasks at final assessment.",
    location: "Bengaluru",
    mode: "Hybrid",
    hours: "3–5 hours/week",
    skills: ["Public Speaking", "Teaching", "Research"],
    days: "Weekends",
    filled: 9,
    total: 14,
    roles: [
      "Workshop Facilitator",
      "Content Volunteer",
      "Documentation Volunteer",
    ],
    stage: "Executing",
    verified: true,
    image: "education",
    partner: "Stand N Stride Foundation",
  },
  {
    id: "animals",
    title: "Community Animal Care Drive",
    cause: "Animal Welfare",
    sdg: "15",
    description:
      "Support community animals with a neighbourhood care and awareness drive, guided by local animal-welfare volunteers.",
    goal: "Support a vet-led care drive in 3 neighbourhoods.",
    metric: "Animals receiving care recorded by the veterinary partner.",
    location: "Bengaluru",
    mode: "In-person",
    hours: "1–2 hours/week",
    skills: ["Outreach", "Photography"],
    days: "Weekends",
    filled: 8,
    total: 16,
    roles: ["Field Volunteer", "Outreach Volunteer", "Documentation Volunteer"],
    stage: "Recruiting",
    verified: true,
    image: "animals",
    partner: "Community Paws",
    urgent: true,
  },
  {
    id: "access",
    title: "Neighbourhood Accessibility Audit",
    cause: "Accessibility",
    sdg: "10 / 11",
    description:
      "Map the everyday barriers that get overlooked. Work alongside residents to make shared spaces more accessible.",
    goal: "Document access barriers on 10 local streets with residents.",
    metric: "Barriers validated by residents and submitted to civic partners.",
    location: "Bengaluru",
    mode: "Hybrid",
    hours: "1–2 hours/week",
    skills: ["Research", "Writing"],
    days: "Flexible",
    filled: 6,
    total: 10,
    roles: ["Field Mapping", "Research", "Documentation Volunteer"],
    stage: "Validation",
    verified: false,
    image: "access",
    partner: "Resident access collective",
    fresh: true,
  },
  {
    id: "books",
    title: "Community Book Project",
    cause: "Children & Education",
    sdg: "4",
    description:
      "Find a new chapter for well-loved books. Build a community reading corner with books children actually want to read.",
    goal: "Set up a curated community reading corner for 60 children.",
    metric: "Children regularly borrowing books after 4 weeks.",
    location: "Mysuru",
    mode: "Hybrid",
    hours: "1–2 hours/week",
    skills: ["Outreach", "Event Management"],
    days: "Flexible",
    filled: 5,
    total: 12,
    roles: ["Collection", "Sorting", "Outreach Volunteer", "Partner Liaison"],
    stage: "Building team",
    verified: true,
    image: "books",
    partner: "Neighbourhood Learning Collective",
    fresh: true,
  },
];
export const roleData = [
  {
    name: "Project Lead",
    filled: 1,
    total: 1,
    skills: "Leadership · Event Management",
    purpose: "Own the plan and keep the team aligned.",
    time: "4 hrs/week",
  },
  {
    name: "Partner Liaison",
    filled: 1,
    total: 1,
    skills: "Outreach · Communication",
    purpose: "Coordinate temples and processing partners.",
    time: "3 hrs/week",
  },
  {
    name: "Operations",
    filled: 3,
    total: 3,
    skills: "Logistics · Organising",
    purpose: "Manage transport and five collection points.",
    time: "3 hrs/week",
  },
  {
    name: "Field Volunteer",
    filled: 12,
    total: 20,
    skills: "On-ground coordination",
    purpose: "Collection support, segregation and basic recording.",
    time: "1 orientation + Saturday pilot",
  },
  {
    name: "Outreach Volunteer",
    filled: 1,
    total: 3,
    skills: "Public Speaking · Outreach",
    purpose:
      "Volunteer outreach, community communication and stakeholder follow-up.",
    time: "3 hrs/week",
  },
  {
    name: "Documentation Volunteer",
    filled: 1,
    total: 2,
    skills: "Research · Photography",
    purpose: "Maintain collection records and consent-led documentation.",
    time: "2 hrs/week",
  },
];
export const permissionNames = [
  "Temple permission",
  "Processing confirmation",
  "Volunteer consent",
  "Photography consent",
  "Transport confirmation",
];
export const resourceNames = [
  "Collection bins",
  "Protective gloves",
  "Transport",
  "Storage",
  "Documentation materials",
];
export const partnerNames = [
  "Temple representative",
  "Verified processing partner",
  "Community / NGO partner",
];
export const timeline = [
  "Validation",
  "Partnership setup",
  "Recruitment",
  "Preparation",
  "Pilot",
  "Measurement",
  "Verification",
];
export function freshState(): State {
  return {
    version: 1,
    account: "Student",
    profile: {
      causes: ["Environment", "Children & Education"],
      skills: ["Public Speaking", "Outreach", "Research"],
      contributions: ["Outreach", "Research"],
      hours: "3–5 hours/week",
      days: "Weekends",
      location: "Bengaluru",
      mode: "Hybrid",
    },
    onboarded: false,
    joined: { digital: "Workshop Facilitator" },
    saved: [],
    created: false,
    validated: true,
    refined: refinedProblem,
    observation,
    observationDetails: {
      where: "Neighbourhood temples in Bengaluru",
      who: "Temple staff, waste handlers and nearby residents",
      spoken: "Informally, with temple staff",
      organisation: "Circular Bengaluru",
      time: "3–5 hours/week",
      team: "3 friends are interested",
      resources: "Access to 5 temples, volunteers and a shared vehicle",
    },
    createStep: 0,
    verification: "unsubmitted",
    verificationNote: "",
    verifiedKg: 87,
    checks: [true, true, true, true, true],
    permissions: [true, true, true, true, false],
    resources: [true, true, false, true, false],
    partners: [true, true, false],
    tasks: [2, 1, 0, 0],
    updates: [],
    needs: [],
    suggestion: "pending",
    metric: initiatives[0].metric,
  };
}
