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

class ApiHttpError extends Error {
  readonly status: number;
  readonly hint?: string;
  /** Machine-readable `error` field from JSON body, when present. */
  readonly apiError?: string;

  constructor(
    message: string,
    status: number,
    hint?: string,
    apiError?: string,
  ) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.hint = hint;
    this.apiError = apiError;
  }
}

function isHttpServerError(e: unknown): e is ApiHttpError {
  return e instanceof ApiHttpError && e.status >= 500;
}

function getApiErrorHint(e: unknown): string | undefined {
  return isHttpServerError(e) ? e.hint : undefined;
}

function throwIfGeminiQuotaExceeded(e: unknown): void {
  if (
    e instanceof ApiHttpError &&
    e.status === 429 &&
    e.apiError === "gemini_quota_exceeded"
  ) {
    throw new Error(
      e.hint?.trim() ||
        "Gemini quota exceeded. Wait and retry, set GEMINI_MODEL=gemini-1.5-flash, or USE_MOCK_AI=true.",
    );
  }
}

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
    let hint: string | undefined;
    let apiError: string | undefined;
    try {
      const j = JSON.parse(errBody) as { hint?: string; error?: string };
      if (typeof j.hint === "string" && j.hint.trim()) {
        hint = j.hint.trim();
      }
      if (typeof j.error === "string" && j.error.trim()) {
        apiError = j.error.trim();
      }
    } catch {
      /* plain text body */
    }
    throw new ApiHttpError(
      `API ${res.status}: ${errBody || res.statusText}`,
      res.status,
      hint,
      apiError,
    );
  }

  const data = (await res.json()) as T;
  return { data, mock: mockHeader };
}

export async function startInterviewApi(args: {
  role: string;
  mode: InterviewMode;
  userId: string | null;
  personalityId?: string | null;
}): Promise<StartInterviewResponse> {
  if (forceMock() || !args.userId) {
    return mockStartInterview({ role: args.role, mode: args.mode });
  }

  try {
    const { data, mock } = await postJson<StartInterviewResponse>(
      "/api/interview/start",
      {
        userId: args.userId,
        role: args.role,
        mode: args.mode,
        personalityId: args.personalityId?.trim() || undefined,
      },
    );
    return {
      ...data,
      mock,
      voiceFallback: data.voiceFallback,
    };
  } catch (e) {
    if (
      e instanceof ApiHttpError &&
      e.status === 403 &&
      e.apiError === "interview_monthly_limit"
    ) {
      throw new Error(
        e.hint?.trim() || "You have reached your free monthly interview limit.",
      );
    }
    throwIfGeminiQuotaExceeded(e);
    const m = await mockStartInterview({ role: args.role, mode: args.mode });
    if (isHttpServerError(e)) {
      return {
        ...m,
        serverError: true,
        serverHint: getApiErrorHint(e),
      };
    }
    return { ...m, clientFallback: true };
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
    return {
      ...data,
      mock,
      voiceFallback: data.voiceFallback,
    };
  } catch (e) {
    throwIfGeminiQuotaExceeded(e);
    const m = await mockSendAnswer({
      interviewId: args.interviewId,
      answer: args.answer,
    });
    if (isHttpServerError(e)) {
      return {
        ...m,
        serverError: true,
        serverHint: getApiErrorHint(e),
      };
    }
    return { ...m, clientFallback: true };
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
  } catch (e) {
    throwIfGeminiQuotaExceeded(e);
    const m = await mockGetFeedback({ interviewId: args.interviewId });
    if (isHttpServerError(e)) {
      return {
        ...m,
        serverError: true,
        serverHint: getApiErrorHint(e),
      };
    }
    return { ...m, clientFallback: true };
  }
}

/** Resolved auth id for interview calls (reads client store). */
export function getInterviewUserId(): string | null {
  return useAuthStore.getState().userId;
}
