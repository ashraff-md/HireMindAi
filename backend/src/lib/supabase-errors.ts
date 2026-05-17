/** Maps Supabase / Postgres client errors to API responses for the interview routes. */

import { InterviewMonthlyLimitError } from "@/lib/interview-quota";

export const SCHEMA_MISSING_HINT =
  "Supabase is missing HireMind tables. In Dashboard → SQL Editor, run supabase/BUNDLE_all_migrations.sql (full app) or supabase/MINIMAL_interview_only.sql (interviews only). Wait ~1 minute for the API schema cache, restart the backend, clear sessionStorage key hm_block_users_plan if you had 404s, then hard-refresh.";

type ErrShape = { code?: string; message?: string; cause?: unknown };

function unwrap(err: unknown): ErrShape {
  if (!err || typeof err !== "object") {
    return {};
  }
  const o = err as ErrShape;
  const code = typeof o.code === "string" ? o.code : undefined;
  const message = typeof o.message === "string" ? o.message : undefined;
  if (o.cause) {
    const inner = unwrap(o.cause);
    return {
      code: code ?? inner.code,
      message: message ?? inner.message,
    };
  }
  return { code, message };
}

/** HTTP-ish metadata some layers attach to Supabase errors. */
function errorStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const o = err as { status?: unknown; statusCode?: unknown };
  const a =
    typeof o.status === "number"
      ? o.status
      : typeof o.statusCode === "number"
        ? o.statusCode
        : undefined;
  return a;
}

function schemaMissingHeuristics(
  code: string,
  message: string,
  status: number | undefined,
): boolean {
  const msg = message.toLowerCase();

  if (code === "PGRST205" || code === "42P01" || code === "42704") {
    return true;
  }

  if (status === 404 && (msg.includes("users") || msg === "")) {
    return true;
  }

  if (msg.includes("schema cache") && msg.includes("could not find")) {
    return true;
  }

  if (msg.includes("relation") && msg.includes("does not exist")) {
    return true;
  }

  return false;
}

export function isDatabaseSchemaMissingError(err: unknown): boolean {
  const { code, message } = unwrap(err);
  const status = errorStatus(err);

  if (schemaMissingHeuristics(code ?? "", message ?? "", status)) {
    return true;
  }

  try {
    const blob = JSON.stringify(err).toLowerCase();
    if (
      blob.includes("pgrst205") ||
      blob.includes("42p01") ||
      (blob.includes("does not exist") && blob.includes("relation"))
    ) {
      return true;
    }
  } catch {
    /* circular structure */
  }

  const flat = String(err).toLowerCase();
  if (flat.includes("pgrst205") || flat.includes("42p01")) {
    return true;
  }
  return false;
}

/** Safe to show in API JSON so the UI can surface backend failures (local / self-hosted). */
export function interviewFailureHint(err: unknown): string | undefined {
  if (!(err instanceof Error)) {
    return undefined;
  }
  const m = err.message.trim();
  if (!m) {
    return undefined;
  }
  return m.length > 480 ? `${m.slice(0, 477)}…` : m;
}

export function interviewStartErrorResponse(err: unknown): {
  status: number;
  body: { error: string; hint: string };
} | null {
  if (err instanceof InterviewMonthlyLimitError) {
    return {
      status: 403,
      body: {
        error: err.code,
        hint: err.message,
      },
    };
  }
  if (isDatabaseSchemaMissingError(err)) {
    return {
      status: 503,
      body: {
        error: "database_schema_missing",
        hint: SCHEMA_MISSING_HINT,
      },
    };
  }
  return null;
}
