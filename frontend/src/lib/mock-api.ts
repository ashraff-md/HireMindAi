import type {
  FeedbackResponse,
  RespondInterviewResponse,
  StartInterviewResponse,
} from "@/lib/types";

const DEMO_INTERVIEW_ID = "00000000-0000-4000-8000-000000000001";

let mockTurn = 0;

/**
 * Deterministic mock interview flow for demos when auth or backend is unavailable.
 */
export async function mockStartInterview(input: {
  role: string;
  mode?: string;
}): Promise<StartInterviewResponse> {
  void input.mode;
  mockTurn = 0;
  await delay(600);

  return {
    interviewId: DEMO_INTERVIEW_ID,
    question: `Tell me about yourself and what draws you to ${input.role.trim() || "this role"}.`,
    audioUrl: "",
    mock: true,
  };
}

export async function mockSendAnswer(input: {
  interviewId: string;
  answer: string;
}): Promise<RespondInterviewResponse> {
  void input.interviewId;
  void input.answer;
  await delay(700);
  mockTurn += 1;

  const followUps = [
    "Walk me through a technical decision you’d revisit if you could.",
    "How do you prioritize when deadlines and quality pull in opposite directions?",
    "Describe how you collaborated across teams to ship something meaningful.",
  ];

  return {
    interviewId: DEMO_INTERVIEW_ID,
    nextQuestion: followUps[(mockTurn - 1) % followUps.length] ?? followUps[0]!,
    audioUrl: "",
    mock: true,
  };
}

export async function mockGetFeedback(input: {
  interviewId: string;
}): Promise<FeedbackResponse> {
  void input.interviewId;
  await delay(800);

  return {
    score: 73,
    communicationScore: 76,
    technicalScore: 70,
    confidenceScore: 72,
    strengths: [
      "Structured narratives with clear outcomes.",
      "Sounds credible when grounding answers in specifics.",
      "Open tone that invites follow-up dialogue.",
    ],
    weaknesses: [
      "Could quantify impact more consistently.",
      "Technical depth varied across answers.",
      "A few transitions felt rushed under time pressure.",
    ],
    suggestions: [
      "Use STAR framing for behavioral prompts.",
      "Add metrics (latency, adoption, accuracy) wherever possible.",
      "Pause briefly to outline your structure before answering.",
    ],
    mock: true,
  };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
