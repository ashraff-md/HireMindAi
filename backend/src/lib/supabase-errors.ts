/** Maps Supabase / Postgres client errors to API responses for the interview routes. */

export const SCHEMA_MISSING_HINT =
  "Supabase is missing HireMind tables. Open Supabase Dashboard → SQL Editor, paste the full contents of supabase/BUNDLE_all_migrations.sql from this repo, click Run, then wait ~1 minute and reload this page.";

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

export function isDatabaseSchemaMissingError(err: unknown): boolean {
  const { code, message } = unwrap(err);
  const msg = (message ?? "").toLowerCase();

  if (code === "PGRST205" || code === "42P01" || code === "42704") {
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

export function interviewStartErrorResponse(err: unknown): {
  status: number;
  body: { error: string; hint: string };
} | null {
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
