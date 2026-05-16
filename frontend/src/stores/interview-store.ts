"use client";

import { create } from "zustand";

import type {
  ChatMessage,
  FeedbackResponse,
  InterviewPhase,
} from "@/lib/types";

function rid() {
  return crypto.randomUUID();
}

export type InterviewMetaPayload = {
  role: string;
  interviewType: string;
  personalityId: string;
  personalityLabel: string;
  difficultyId: string;
  difficultyLabel: string;
};

export type InterviewSlice = InterviewMetaPayload & {
  interviewId: string | null;
  maxUserAnswers: number | null;
  messages: ChatMessage[];
  phase: InterviewPhase;
  elapsedSeconds: number;
  currentQuestion: string | null;
  /** True when AI is not live (mock pipeline or local fallback). */
  backendMockBanner: boolean;
  /** True when last API turn used non-ElevenLabs audio fallback. */
  voiceFallback: boolean;
  /** True when signed-in but interview API was unreachable (local fallback). */
  clientApiFallback: boolean;
  /** True when backend returned 5xx (logged-in flow still shows practice fallback). */
  clientServerError: boolean;
  /** Last API error.hint from JSON (e.g. run SQL bundle). */
  serverErrorHint: string | null;
  feedback: FeedbackResponse | null;
  resetSession: () => void;
  setMeta: (payload: InterviewMetaPayload) => void;
  setInterviewId: (id: string | null) => void;
  setMaxUserAnswers: (n: number | null) => void;
  setPhase: (p: InterviewPhase) => void;
  tick: () => void;
  resetTimer: () => void;
  setBackendMockBanner: (v: boolean) => void;
  setVoiceFallback: (v: boolean) => void;
  setClientApiFallback: (v: boolean) => void;
  setClientServerError: (v: boolean) => void;
  setServerErrorHint: (v: string | null) => void;
  pushMessage: (role: "ai" | "user", text: string) => void;
  setCurrentQuestion: (q: string | null) => void;
  setFeedback: (f: FeedbackResponse | null) => void;
};

const emptyMeta = (): InterviewMetaPayload => ({
  role: "",
  interviewType: "",
  personalityId: "",
  personalityLabel: "",
  difficultyId: "",
  difficultyLabel: "",
});

export const useInterviewStore = create<InterviewSlice>((set, get) => ({
  ...emptyMeta(),
  interviewId: null,
  maxUserAnswers: null,
  messages: [],
  phase: "idle",
  elapsedSeconds: 0,
  currentQuestion: null,
  backendMockBanner: false,
  voiceFallback: false,
  clientApiFallback: false,
  clientServerError: false,
  serverErrorHint: null,
  feedback: null,
  resetSession: () =>
    set({
      ...emptyMeta(),
      interviewId: null,
      maxUserAnswers: null,
      messages: [],
      phase: "idle",
      elapsedSeconds: 0,
      currentQuestion: null,
      backendMockBanner: false,
      voiceFallback: false,
      clientApiFallback: false,
      clientServerError: false,
      serverErrorHint: null,
      feedback: null,
    }),
  setMeta: (payload) => set({ ...payload }),
  setInterviewId: (interviewId) => set({ interviewId }),
  setMaxUserAnswers: (maxUserAnswers) => set({ maxUserAnswers }),
  setPhase: (phase) => set({ phase }),
  tick: () => set({ elapsedSeconds: get().elapsedSeconds + 1 }),
  resetTimer: () => set({ elapsedSeconds: 0 }),
  setBackendMockBanner: (backendMockBanner) => set({ backendMockBanner }),
  setVoiceFallback: (voiceFallback) => set({ voiceFallback }),
  setClientApiFallback: (clientApiFallback) => set({ clientApiFallback }),
  setClientServerError: (clientServerError) => set({ clientServerError }),
  setServerErrorHint: (serverErrorHint) => set({ serverErrorHint }),
  pushMessage: (role, text) =>
    set({
      messages: [
        ...get().messages,
        { id: rid(), role, text, createdAt: Date.now() },
      ],
    }),
  setCurrentQuestion: (currentQuestion) => set({ currentQuestion }),
  setFeedback: (feedback) => set({ feedback }),
}));
