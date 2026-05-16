import type {
  FeedbackResponse,
  InterviewMode,
  RespondInterviewResponse,
  StartInterviewResponse,
} from "@/lib/types";

const DEMO_INTERVIEW_ID = "00000000-0000-4000-8000-000000000001";

let mockAnswerCount = 0;
let mockPlan: InterviewMode = "free";
let mockMaxAnswers = 3;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Deterministic mock interview flow when auth or backend is unavailable.
 */
export async function mockStartInterview(input: {
  role: string;
  mode?: InterviewMode;
}): Promise<StartInterviewResponse> {
  mockPlan = input.mode === "premium" ? "premium" : "free";
  mockMaxAnswers = mockPlan === "premium" ? 5 : 3;
  mockAnswerCount = 0;
  await delay(600);

  return {
    interviewId: DEMO_INTERVIEW_ID,
    question: `Tell me about yourself and what draws you to ${input.role.trim() || "this role"}.`,
    audioUrl: "",
    mock: true,
    effectivePlan: mockPlan,
    maxUserAnswers: mockMaxAnswers,
  };
}

export async function mockSendAnswer(input: {
  interviewId: string;
  answer: string;
}): Promise<RespondInterviewResponse> {
  void input.answer;
  await delay(700);
  mockAnswerCount += 1;

  if (mockAnswerCount >= mockMaxAnswers) {
    return {
      interviewId: input.interviewId,
      nextQuestion: "",
      audioUrl: "",
      done: true,
      effectivePlan: mockPlan,
      mock: true,
    };
  }

  const freeFollow = [
    "What do you consider your core strengths for this role?",
    "How do you approach learning something new under a tight deadline?",
  ];

  const premiumFollow = [
    "Walk me through a technical decision you'd revisit if you could.",
    "Describe a system or feature you owned end-to-end — what trade-offs did you make?",
    "Tell me about a time stakeholders disagreed; how did you align them?",
    "How do you balance speed and quality when delivery pressure spikes?",
  ];

  const bank = mockPlan === "premium" ? premiumFollow : freeFollow;
  const idx = mockAnswerCount - 1;

  return {
    interviewId: input.interviewId,
    nextQuestion: bank[idx % bank.length] ?? bank[0]!,
    audioUrl: "",
    done: false,
    effectivePlan: mockPlan,
    mock: true,
  };
}

export async function mockGetFeedback(input: {
  interviewId: string;
}): Promise<FeedbackResponse> {
  void input.interviewId;
  await delay(800);

  const tier = mockPlan === "premium" ? "full" : "basic";

  const strengths =
    tier === "full"
      ? [
          "Structured narratives with clear outcomes.",
          "Sounds credible when grounding answers in specifics.",
          "Open tone that invites follow-up dialogue.",
        ]
      : [
          "Clear, approachable tone.",
          "You connected examples to the role naturally.",
        ];

  const weaknesses =
    tier === "full"
      ? [
          "Could quantify impact more consistently.",
          "Technical depth varied across answers.",
          "A few transitions felt rushed under time pressure.",
        ]
      : ["Could add more metrics to strengthen credibility."];

  const suggestions =
    tier === "full"
      ? [
          "Use STAR framing for behavioral prompts.",
          "Add metrics (latency, adoption, accuracy) wherever possible.",
          "Pause briefly to outline your structure before answering.",
        ]
      : [
          "Practice one crisp closing line per answer.",
          "Prepare two quantified wins you can drop in quickly.",
        ];

  return {
    score: tier === "full" ? 73 : 68,
    communicationScore: tier === "full" ? 76 : 71,
    technicalScore: tier === "full" ? 70 : 65,
    confidenceScore: tier === "full" ? 72 : 68,
    strengths,
    weaknesses,
    suggestions,
    mock: true,
    feedbackTier: tier,
  };
}
