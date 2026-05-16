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
  messages: ChatMessage[];
  phase: InterviewPhase;
  elapsedSeconds: number;
  currentQuestion: string | null;
  backendMockBanner: boolean;
  feedback: FeedbackResponse | null;
  resetSession: () => void;
  setMeta: (payload: InterviewMetaPayload) => void;
  setInterviewId: (id: string | null) => void;
  setPhase: (p: InterviewPhase) => void;
  tick: () => void;
  resetTimer: () => void;
  setBackendMockBanner: (v: boolean) => void;
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
  messages: [],
  phase: "idle",
  elapsedSeconds: 0,
  currentQuestion: null,
  backendMockBanner: false,
  feedback: null,
  resetSession: () =>
    set({
      ...emptyMeta(),
      interviewId: null,
      messages: [],
      phase: "idle",
      elapsedSeconds: 0,
      currentQuestion: null,
      backendMockBanner: false,
      feedback: null,
    }),
  setMeta: (payload) => set({ ...payload }),
  setInterviewId: (interviewId) => set({ interviewId }),
  setPhase: (phase) => set({ phase }),
  tick: () => set({ elapsedSeconds: get().elapsedSeconds + 1 }),
  resetTimer: () => set({ elapsedSeconds: 0 }),
  setBackendMockBanner: (backendMockBanner) => set({ backendMockBanner }),
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
