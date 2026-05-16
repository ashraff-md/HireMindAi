export const JOB_ROLES = [
  "Frontend Developer",
  "Product Manager",
  "UX Researcher",
  "Software Engineer",
  "Senior Frontend Engineer",
  "Backend Engineer",
  "Full-stack Engineer",
  "Product Engineer",
  "Machine Learning Engineer",
  "Engineering Manager",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

/** Quick presets under the role search — must exist in JOB_ROLES. */
export const PRESET_JOB_CHIPS: readonly JobRole[] = [
  "Frontend Developer",
  "Product Manager",
  "UX Researcher",
];

export const INTERVIEW_PERSONALITIES = [
  {
    id: "corporate_hr" as const,
    label: "Professional",
    tone: "Direct, efficient, and corporate-standard feedback.",
    previewName: "Sera",
    previewSubtitle: "Professional tier evaluator",
    empathyPct: 35,
    technicalPct: 95,
  },
  {
    id: "friendly" as const,
    label: "Friendly",
    tone: "Encouraging, conversational, and mentorship focused.",
    previewName: "Mara",
    previewSubtitle: "Supportive onboarding coach",
    empathyPct: 82,
    technicalPct: 64,
  },
  {
    id: "stress" as const,
    label: "Harsh",
    tone: "Strict evaluation, high pressure, and zero tolerance.",
    previewName: "Viktor",
    previewSubtitle: "Exec-bar execution reviewer",
    empathyPct: 22,
    technicalPct: 96,
  },
] as const;

export type PersonalityId = (typeof INTERVIEW_PERSONALITIES)[number]["id"];

export const DIFFICULTIES = [
  { id: "junior", label: "Junior", hint: "Foundations & growth mindset." },
  { id: "mid", label: "Mid-Level", hint: "Ownership across ambiguous scopes." },
  { id: "senior", label: "Senior", hint: "Systems thinking & stakeholder glue." },
  { id: "lead", label: "Lead", hint: "Org-scale trade-offs & ambiguity." },
] as const;

export function personalityById(id: string) {
  return INTERVIEW_PERSONALITIES.find((p) => p.id === id) ?? INTERVIEW_PERSONALITIES[0];
}

export function difficultyById(id: string) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}
