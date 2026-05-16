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

export interface StartInterviewResponse {
  interviewId: string;
  question: string;
  audioUrl: string;
  mock?: boolean;
}

export interface RespondInterviewResponse {
  interviewId: string;
  nextQuestion: string;
  audioUrl: string;
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
}
