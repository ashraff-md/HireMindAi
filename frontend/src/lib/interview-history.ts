import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export type InterviewHistoryEntry = {
  id: string;
  role: string;
  mode: string;
  score: number | null;
  created_at: string;
  personality_id: string | null;
  user_recording_object_path: string | null;
  feedback: FeedbackRow | null;
};

export type FeedbackRow = {
  interview_id: string;
  communication_score: number;
  technical_score: number;
  confidence_score: number;
  strengths: unknown;
  weaknesses: unknown;
  suggestions: unknown;
};

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export function feedbackRowToModel(
  row: FeedbackRow,
  interviewScore: number | null,
) {
  const communicationScore = Number(row.communication_score);
  const technicalScore = Number(row.technical_score);
  const confidenceScore = Number(row.confidence_score);
  const fromInterview =
    interviewScore != null && Number.isFinite(Number(interviewScore))
      ? Math.round(Number(interviewScore))
      : Math.round((communicationScore + technicalScore + confidenceScore) / 3);

  return {
    score: fromInterview,
    communicationScore,
    technicalScore,
    confidenceScore,
    strengths: asStringArray(row.strengths),
    weaknesses: asStringArray(row.weaknesses),
    suggestions: asStringArray(row.suggestions),
  };
}

export async function fetchMyInterviewsWithFeedback(): Promise<
  InterviewHistoryEntry[]
> {
  const sb = createSupabaseBrowserClient();
  if (!sb) return [];

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return [];

  const { data: interviews, error: ivErr } = await sb
    .from("interviews")
    .select(
      "id, role, mode, score, created_at, personality_id, user_recording_object_path",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (ivErr || !interviews?.length) {
    return [];
  }

  const rows = interviews as Omit<InterviewHistoryEntry, "feedback">[];
  const ids = rows.map((r) => r.id);

  const { data: feedbacks, error: fErr } = await sb
    .from("feedback")
    .select(
      "interview_id, communication_score, technical_score, confidence_score, strengths, weaknesses, suggestions",
    )
    .in("interview_id", ids);

  if (fErr) {
    return rows.map((r) => ({ ...r, feedback: null }));
  }

  const fList = (feedbacks ?? []) as FeedbackRow[];
  const fMap = new Map(fList.map((f) => [f.interview_id, f]));

  return rows.map((r) => ({
    ...r,
    feedback: fMap.get(r.id) ?? null,
  }));
}

export function formatInterviewHistoryDate(iso: string): string {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}
