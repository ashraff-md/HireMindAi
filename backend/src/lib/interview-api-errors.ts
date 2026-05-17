/** Maps interview orchestration failures (e.g. Gemini) to HTTP responses. */

export const GEMINI_QUOTA_HINT =
  "Gemini returned 429 (quota or rate limit). Try: (1) Wait until the window resets (see retry_after_seconds if present) or enable billing in Google AI Studio; (2) In backend/.env.local use GEMINI_MODEL=gemini-1.5-flash — gemini-2.5-flash free tier is very tight (often ~20 requests/day per model); (3) For offline practice set USE_MOCK_AI=true. See https://ai.google.dev/gemini-api/docs/rate-limits";

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

/** Parse suggested backoff from Google API error text, when present. */
export function parseGeminiRetryAfterSeconds(err: unknown): number | undefined {
  const s = blob(err);
  const m = /please retry in ([\d.]+)\s*s/i.exec(s);
  if (!m?.[1]) {
    return undefined;
  }
  const n = Math.ceil(parseFloat(m[1]));
  if (!Number.isFinite(n) || n < 1 || n > 86_400) {
    return undefined;
  }
  return n;
}

export function geminiQuotaErrorResponse(err: unknown): {
  status: number;
  body: {
    error: string;
    hint: string;
    retry_after_seconds?: number;
  };
  headers?: Record<string, string>;
} | null {
  if (!isGeminiQuotaError(err)) {
    return null;
  }
  const retryAfter = parseGeminiRetryAfterSeconds(err);
  const headers: Record<string, string> = {};
  if (retryAfter != null) {
    headers["Retry-After"] = String(retryAfter);
  }
  return {
    status: 429,
    body: {
      error: "gemini_quota_exceeded",
      hint: GEMINI_QUOTA_HINT,
      ...(retryAfter != null ? { retry_after_seconds: retryAfter } : {}),
    },
    ...(Object.keys(headers).length ? { headers } : {}),
  };
}
