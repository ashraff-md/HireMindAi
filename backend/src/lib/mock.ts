/** Place `/mock-interviewer.mp3` in `public/` for local playback without ElevenLabs, or serve your own CDN URL via `PUBLIC_APP_URL` + relative path logic in clients. */

import type { InterviewSegment } from "./prompts";
import type { FeedbackTier, StructuredFeedback } from "./schemas";

export const MOCK_AUDIO_PATH = "/mock-interviewer.mp3";

export function isTruthyEnv(flag?: string): boolean {
  return flag?.toLowerCase() === "true" || flag === "1";
}

export function shouldUseMockAi(): boolean {
  if (isTruthyEnv(process.env.USE_MOCK_AI)) {
    return true;
  }

  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();
  return !key;
}

export function shouldUseVoiceMock(): boolean {
  return !process.env.ELEVENLABS_API_KEY?.trim();
}

const PREMIUM_FOLLOW_SEGMENTS = [
  "technical",
  "project",
  "problem",
  "behavioral",
] as const satisfies readonly InterviewSegment[];

/** `userMessagesAfterAnswer` = count of USER rows after the latest answer insert. */
export function segmentForPremiumTurn(
  userMessagesAfterAnswer: number,
): InterviewSegment {
  if (userMessagesAfterAnswer < 1) return "generic";
  const i = userMessagesAfterAnswer - 1;
  return PREMIUM_FOLLOW_SEGMENTS[
    Math.min(i, PREMIUM_FOLLOW_SEGMENTS.length - 1)
  ]!;
}

export function segmentForFreeTurn(userMessagesAfterAnswer: number): InterviewSegment {
  if (userMessagesAfterAnswer <= 1) return "generic";
  return "generic";
}

export function pickMockInterviewQuestion(
  userTurnIndex: number,
  role: string,
  segment: InterviewSegment,
  depth: "basic" | "advanced",
): string {
  const baseRole = role.trim() || "this role";

  if (segment === "intro" || userTurnIndex === 0) {
    return depth === "basic"
      ? `Welcome — tell me about yourself and what drew you to ${baseRole}.`
      : `Thanks for joining today. Walk me through your background and what excites you most about "${baseRole}" specifically.`;
  }

  const advancedBank: Record<string, string> = {
    technical: `You mentioned hands-on work in ${baseRole} — what is one technical decision you would defend even if the team pushed back?`,
    project: `Pick a recent project relevant to ${baseRole}. What constraint shaped your architecture the most?`,
    problem: `Describe a messy, ambiguous problem you had to untangle. How did you pick what to solve first?`,
    behavioral: `Under time pressure, how do you communicate trade-offs to stakeholders without losing trust?`,
    generic: `What do you consider your strongest contribution in a team setting — and where do you still want to grow?`,
  };

  const basicBank: Record<string, string> = {
    technical: `What are your core technical strengths for ${baseRole}?`,
    project: `Tell me about a project you're proud of in a few sentences.`,
    problem: `How do you approach solving problems when you don't have full information yet?`,
    behavioral: `What's one strength you lean on when interviews get tough?`,
    generic: `What are your top strengths — and one area you're improving?`,
  };

  const bank = depth === "basic" ? basicBank : advancedBank;
  const key = segment in bank ? segment : ("generic" as const);
  return bank[key] ?? bank.generic!;
}

export function mockInterviewFeedback(
  role: string,
  tier: FeedbackTier,
): StructuredFeedback {
  void role;

  const full: StructuredFeedback = {
    communication_score: 72,
    technical_score: 68,
    confidence_score: 70,
    strengths: [
      "Clear story structure when describing past work.",
      "Uses concrete outcomes instead of vague claims.",
      "Demonstrates openness to coaching and iteration.",
    ],
    weaknesses: [
      "Answers could tighten up with more explicit metrics.",
      "Some technical explanations stayed at the surface.",
      "Limited reflection on failures or close calls.",
    ],
    suggestions: [
      "Use STAR (Situation, Task, Action, Result) framing for Behavioral answers.",
      "Add benchmarks (latency/throughput/accuracy) wherever possible.",
      "End each answer by linking your experience directly to the JD.",
    ],
  };

  if (tier === "full") {
    return full;
  }

  return {
    communication_score: full.communication_score,
    technical_score: full.technical_score,
    confidence_score: full.confidence_score,
    strengths: full.strengths.slice(0, 2),
    weaknesses: full.weaknesses.slice(0, 1),
    suggestions: full.suggestions.slice(0, 2),
  };
}
