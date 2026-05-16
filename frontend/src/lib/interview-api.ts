"use client";

import type {
  FeedbackResponse,
  InterviewMode,
  RespondInterviewResponse,
  StartInterviewResponse,
} from "@/lib/types";
import {
  mockGetFeedback,
  mockSendAnswer,
  mockStartInterview,
} from "@/lib/mock-api";
import { useAuthStore } from "@/stores/auth-store";

function forceMock(): boolean {
  const v = process.env.NEXT_PUBLIC_FORCE_MOCK_API?.toLowerCase();
  return v === "true" || v === "1";
}

function apiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  return explicit;
}

async function postJson<T>(
  path: string,
  body: unknown,
): Promise<{ data: T; mock?: boolean }> {
  const base = apiBase();
  const url = base ? `${base}${path}` : path;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const mockHeader = res.headers.get("x-hiremind-mock") === "true";

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${errBody || res.statusText}`);
  }

  const data = (await res.json()) as T;
  return { data, mock: mockHeader };
}

export async function startInterviewApi(args: {
  role: string;
  mode: InterviewMode;
  userId: string | null;
}): Promise<StartInterviewResponse> {
  if (forceMock() || !args.userId) {
    const m = await mockStartInterview({ role: args.role, mode: args.mode });
    return m;
  }

  try {
    const { data, mock } = await postJson<StartInterviewResponse>(
      "/api/interview/start",
      {
        userId: args.userId,
        role: args.role,
        mode: args.mode,
      },
    );
    return { ...data, mock };
  } catch {
    return mockStartInterview({ role: args.role, mode: args.mode });
  }
}

export async function respondInterviewApi(args: {
  interviewId: string;
  answer: string;
  userId: string | null;
}): Promise<RespondInterviewResponse> {
  if (forceMock() || !args.userId) {
    return mockSendAnswer({
      interviewId: args.interviewId,
      answer: args.answer,
    });
  }

  try {
    const { data, mock } = await postJson<RespondInterviewResponse>(
      "/api/interview/respond",
      {
        interviewId: args.interviewId,
        answer: args.answer,
      },
    );
    return { ...data, mock };
  } catch {
    return mockSendAnswer({
      interviewId: args.interviewId,
      answer: args.answer,
    });
  }
}

export async function feedbackInterviewApi(args: {
  interviewId: string;
  userId: string | null;
}): Promise<FeedbackResponse> {
  if (forceMock() || !args.userId) {
    return mockGetFeedback({ interviewId: args.interviewId });
  }

  try {
    const { data, mock } = await postJson<FeedbackResponse>(
      "/api/interview/feedback",
      {
        interviewId: args.interviewId,
      },
    );
    return { ...data, mock };
  } catch {
    return mockGetFeedback({ interviewId: args.interviewId });
  }
}

/** Resolved auth id for interview calls (reads client store). */
export function getInterviewUserId(): string | null {
  return useAuthStore.getState().userId;
}
