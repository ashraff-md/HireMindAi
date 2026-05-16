export type PromptDepth = "basic" | "advanced";

export type InterviewSegment =
  | "intro"
  | "technical"
  | "project"
  | "problem"
  | "behavioral"
  | "generic";

export type PersonalityId = "corporate_hr" | "friendly" | "stress";

const DEFAULT_PERSONALITY: PersonalityId = "corporate_hr";

export function normalizePersonalityId(id: string | undefined): PersonalityId {
  if (id === "friendly" || id === "stress" || id === "corporate_hr") {
    return id;
  }
  return DEFAULT_PERSONALITY;
}

export function personalityDirective(id: PersonalityId): string {
  switch (id) {
    case "friendly":
      return "Tone: warm, encouraging, mentorship-oriented; keep pressure low.";
    case "stress":
      return "Tone: demanding executive interviewer; tighter pacing, challenge vague answers.";
    case "corporate_hr":
    default:
      return "Tone: professional, neutral corporate HR; structured and fair.";
  }
}

export function recruiterInterviewSystemPrompt(args: {
  depth: PromptDepth;
  personalityId: PersonalityId;
}): string {
  const base =
    args.depth === "basic"
      ? `You are a concise interviewer. Ask one clear question per turn.
Keep follow-ups lighter and more generic — suitable for a short free-tier practice session.
Do not assume resume details the candidate has not stated.`
      : `You are a senior technical interviewer and recruiter.
Conduct a conversational interview focused on role fit, behavioral depth, and pragmatic technical judgement.
Prefer one focused question per turn; probe deeper when answers stay shallow.`;

  return `${base}\n${personalityDirective(args.personalityId)}`;
}

export function firstQuestionUserPrompt(input: {
  role: string;
  depth: PromptDepth;
  profileContext?: string | null;
}): string {
  const ctx =
    input.depth === "advanced" && input.profileContext?.trim()
      ? `\nCandidate background (from profile; use only as hints, do not quote verbatim):\n${input.profileContext.trim()}\n`
      : "";

  const intro =
    input.depth === "basic"
      ? "Ask a welcoming INTRODUCTION question for this role (tell me about yourself / why this role)."
      : "Ask a strong INTRODUCTION question tailored to the role and any background hints provided.";

  return `The candidate applied for "${input.role}".${ctx}\n${intro}`;
}

export function followUpUserPrompt(input: {
  history: string;
  depth: PromptDepth;
  segment: InterviewSegment;
}): string {
  const segmentHint =
    input.segment === "generic"
      ? "Ask the next appropriate practice question."
      : input.segment === "intro"
        ? "This should not happen for follow-ups; treat as generic next step."
        : ({
            technical:
              "Focus this question on TECHNICAL foundations relevant to what they shared.",
            project:
              "Focus on PROJECT / experience depth — specifics, trade-offs, their role.",
            problem:
              "Focus on PROBLEM-SOLVING under ambiguity or constraints.",
            behavioral:
              "Focus on BEHAVIORAL / confidence / collaboration under pressure.",
          }[input.segment] ?? "Ask the single best next question.");

  const depth =
    input.depth === "basic"
      ? "Keep it shorter and less probing than a senior loop — still relevant."
      : "Be specific to their prior answers; challenge shallow spots when needed.";

  return `Interview transcript so far:\n${input.history}\n${segmentHint}\n${depth}\nAsk the SINGLE best next interview question (succinct).`;
}

export const feedbackSystemPrompt = `You are evaluating a simulated interview transcript.
Return concise, constructive feedback as JSON ONLY (no prose), matching these rules:
Scores are integers between 1 and 100.
Arrays must contain plain strings unless otherwise specified.
Tone: recruiter-grade, pragmatic, actionable.`;

export function feedbackUserPrompt(
  history: string,
  tier: "basic" | "full",
): string {
  const cap =
    tier === "basic"
      ? `Keep strengths to at most 2 items, weaknesses to at most 1 short note, suggestions to at most 2 practical tips.
Arrays can be shorter if needed.`
      : "";

  return `Transcript:\n${history}\n${cap}\nReturn JSON shaped exactly like:
{
  "communication_score": number,
  "technical_score": number,
  "confidence_score": number,
  "strengths": string[],
  "weaknesses": string[],
  "suggestions": string[]
}`;
}

export const resumeParsingSystemPrompt = `You extract structured resume facts from unstructured text.

Return JSON ONLY shaped exactly like:
{
  "skills": string[],
  "education": string[],
  "experience": string[],
  "projects": string[],
  "target_role": string | null
}

Rules:
- Keep items short (one bullet per array entry).
- Deduplicate.
- Infer target_role ONLY if confidently implied; otherwise null.`;

export function resumeParsingUserPrompt(resumeText: string) {
  return `Resume text:\n"""${resumeText}"""`;
}
