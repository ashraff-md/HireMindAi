/** Maps interview orchestration failures (e.g. Gemini) to HTTP responses. */

export const GEMINI_QUOTA_HINT =
  "Gemini returned 429 (quota or rate limit). Try: (1) Wait for the quota window to reset or enable billing in Google AI Studio / Google Cloud; (2) In backend/.env.local set GEMINI_MODEL=gemini-1.5-flash (separate limits from gemini-2.0-flash); (3) For local-only practice, set USE_MOCK_AI=true. See https://ai.google.dev/gemini-api/docs/rate-limits";

function blob(err: unknown): string {
  if (!err) return "";
  if (err instanceof Error) {
    return `${err.message}\n${err.stack ?? ""}`;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function isGeminiQuotaError(err: unknown): boolean {
  const s = blob(err);
  const sl = s.toLowerCase();
  const fromGemini =
    sl.includes("googlegenerativeai") ||
    sl.includes("generativelanguage.googleapis.com") ||
    sl.includes("@google/generative-ai");

  if (!fromGemini) {
    return false;
  }

  return (
    sl.includes("429") ||
    sl.includes("too many requests") ||
    sl.includes("quota") ||
    sl.includes("rate limit") ||
    sl.includes("resource_exhausted")
  );
}

export function geminiQuotaErrorResponse(err: unknown): {
  status: number;
  body: { error: string; hint: string };
} | null {
  if (!isGeminiQuotaError(err)) {
    return null;
  }
  return {
    status: 503,
    body: {
      error: "gemini_quota_exceeded",
      hint: GEMINI_QUOTA_HINT,
    },
  };
}
