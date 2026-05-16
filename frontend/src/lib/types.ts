export type InterviewMode = "free" | "premium";

export type InterviewPhase =
  | "idle"
  | "ai_speaking"
  | "listening"
  | "user_speaking"
  | "thinking";

export interface ChatMessage {
  id: string;
  role: "ai" | "user";
  text: string;
  createdAt: number;
}

export type FeedbackTier = "basic" | "full";

export interface StartInterviewResponse {
  interviewId: string;
  question: string;
  audioUrl: string;
  mock?: boolean;
  /** True when TTS used placeholder/mock audio (e.g. missing ElevenLabs). */
  voiceFallback?: boolean;
  /** Signed-in client could not reach backend; local fallback transcript flow. */
  clientFallback?: boolean;
  /** Backend returned 5xx — check server logs, env, and DB (e.g. migrations). */
  serverError?: boolean;
  /** Optional detail from API JSON (e.g. schema missing hint). */
  serverHint?: string;
  effectivePlan?: InterviewMode;
  maxUserAnswers?: number;
}

export interface RespondInterviewResponse {
  interviewId: string;
  nextQuestion: string;
  audioUrl: string;
  done?: boolean;
  voiceFallback?: boolean;
  clientFallback?: boolean;
  serverError?: boolean;
  serverHint?: string;
  effectivePlan?: InterviewMode;
  mock?: boolean;
}

export interface FeedbackResponse {
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  mock?: boolean;
  clientFallback?: boolean;
  serverError?: boolean;
  serverHint?: string;
  feedbackTier?: FeedbackTier;
}
