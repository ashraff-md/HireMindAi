export const JOB_ROLES = [
  "Software Engineer",
  "Senior Frontend Engineer",
  "Backend Engineer",
  "Full-stack Engineer",
  "Product Engineer",
  "Machine Learning Engineer",
  "Engineering Manager",
  "Product Manager",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export const INTERVIEW_PERSONALITIES = [
  {
    id: "corporate_hr",
    label: "Corporate HR",
    tone: "Structured, compliance-aware, behavioral depth.",
  },
  {
    id: "startup_founder",
    label: "Startup Founder",
    tone: "Fast-paced, ownership-focused, bias to shipping.",
  },
  {
    id: "technical_lead",
    label: "Technical Lead",
    tone: "Architecture trade-offs, pragmatism, code smell radar.",
  },
  {
    id: "friendly",
    label: "Friendly interviewer",
    tone: "Warm rapport-building before drilling specifics.",
  },
  {
    id: "stress",
    label: "Stress interviewer",
    tone: "Compressed timelines, interruptions, resilience checks.",
  },
] as const;

export const DIFFICULTIES = [
  { id: "junior", label: "Junior", hint: "Foundations & growth mindset." },
  { id: "mid", label: "Mid", hint: "Ownership across ambiguous scopes." },
  { id: "senior", label: "Senior", hint: "Systems thinking & stakeholder glue." },
] as const;

export function personalityById(id: string) {
  return INTERVIEW_PERSONALITIES.find((p) => p.id === id) ?? INTERVIEW_PERSONALITIES[0];
}

export function difficultyById(id: string) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
