import { getSupabaseAdmin } from "@/lib/supabase";
import {
  normalizePersonalityId,
  type PersonalityId,
  type PromptDepth,
} from "@/lib/prompts";
import type { FeedbackTier, StructuredFeedback } from "@/lib/schemas";
import { segmentForFreeTurn, segmentForPremiumTurn } from "@/lib/mock";
import {
  aiEvaluateInterview,
  aiFirstInterviewQuestion,
  aiFollowUpInterviewQuestion,
} from "@/services/ai.service";

import { synthesizeInterviewVoice } from "./voice.service";

/**
 * Ensures public.users has a row for this auth user (interviews.user_id FK).
 * Missed trigger / old accounts / partial restores otherwise break interview start.
 */
async function ensurePublicUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: existing, error: selErr } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (selErr) {
    throw selErr;
  }
  if (existing) {
    return;
  }

  const { data: authData, error: authErr } =
    await supabase.auth.admin.getUserById(userId);

  if (authErr || !authData?.user) {
    throw authErr ?? new Error("auth_user_not_found");
  }

  const u = authData.user;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const metaName =
    (typeof meta.name === "string" && meta.name.trim()) ||
    (typeof meta.full_name === "string" && meta.full_name.trim()) ||
    "";
  const name =
    metaName ||
    (u.email ? u.email.split("@")[0] : "") ||
    "User";

  const { error: insErr } = await supabase.from("users").insert({
    id: u.id,
    name,
    email: u.email ?? "",
    plan_type: "free",
  });

  if (insErr) {
    if ((insErr as { code?: string }).code === "23505") {
      return;
    }
    throw insErr;
  }
}

function formatTranscript(
  msgs: Array<{ speaker: "AI" | "USER"; message: string }>,
) {
  return msgs
    .map((m) => `${m.speaker === "AI" ? "AI" : "USER"}: ${m.message}`)
    .join("\n");
}

async function insertInterviewMessage(args: {
  interviewId: string;
  speaker: "AI" | "USER";
  message: string;
}) {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("interview_messages").insert({
    interview_id: args.interviewId,
    speaker: args.speaker,
    message: args.message,
    posted_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

type InterviewRow = {
  id: string;
  role: string;
  user_id: string;
  mode: string;
  personality_id: string | null;
};

async function fetchInterview(interviewId: string): Promise<InterviewRow | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("interviews")
    .select("id, role, user_id, mode, personality_id")
    .eq("id", interviewId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as InterviewRow | null;
}

async function fetchMessages(interviewId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("interview_messages")
    .select("speaker, message, posted_at")
    .eq("interview_id", interviewId)
    .order("posted_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    data?.map((m) => ({
      speaker: m.speaker as "AI" | "USER",
      message: m.message,
      posted_at: m.posted_at,
    })) ?? []
  );
}

async function resolvePlan(userId: string): Promise<"free" | "premium"> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("plan_type")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.plan_type === "premium" ? "premium" : "free";
}

function maxUserAnswers(plan: "free" | "premium"): number {
  return plan === "premium" ? 5 : 3;
}

async function fetchProfileBlurb(userId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("skills, education, experience, target_role, resume_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const parts: string[] = [];
  const skills = data.skills as unknown;
  const education = data.education as unknown;
  const experience = data.experience as unknown;

  if (Array.isArray(skills) && skills.length) {
    parts.push(`Skills: ${skills.slice(0, 12).join(", ")}`);
  }
  if (Array.isArray(education) && education.length) {
    parts.push(`Education: ${education.slice(0, 4).join("; ")}`);
  }
  if (Array.isArray(experience) && experience.length) {
    parts.push(`Experience: ${experience.slice(0, 6).join("; ")}`);
  }
  if (data.target_role && String(data.target_role).trim()) {
    parts.push(`Target role (profile): ${String(data.target_role).trim()}`);
  }
  if (data.resume_url && String(data.resume_url).trim()) {
    parts.push("(Resume on file — reference in general terms only.)");
  }

  const blurb = parts.join("\n").trim();
  return blurb.length ? blurb : null;
}

function personalityForInterview(
  row: InterviewRow,
  plan: "free" | "premium",
): PersonalityId {
  if (plan === "free") {
    return "corporate_hr";
  }
  return normalizePersonalityId(row.personality_id ?? undefined);
}

export async function startInterviewOrchestration(input: {
  userId: string;
  role: string;
  mode: "free" | "premium";
  personalityId?: string;
}) {
  void input.mode;
  await ensurePublicUser(input.userId);
  const supabase = getSupabaseAdmin();
  const plan = await resolvePlan(input.userId);
  const interviewMode = plan;
  const depth: PromptDepth = plan === "premium" ? "advanced" : "basic";
  const personalityId: PersonalityId =
    plan === "premium"
      ? normalizePersonalityId(input.personalityId)
      : "corporate_hr";

  const profileContext =
    plan === "premium" ? await fetchProfileBlurb(input.userId) : null;

  const { data: interviewRow, error: interviewError } = await supabase
    .from("interviews")
    .insert({
      user_id: input.userId,
      role: input.role,
      mode: interviewMode,
      personality_id: plan === "premium" ? personalityId : null,
    })
    .select("id")
    .single();

  if (interviewError || !interviewRow?.id) {
    throw interviewError ?? new Error("Failed to create interview.");
  }

  const questionText = await aiFirstInterviewQuestion({
    role: input.role,
    depth,
    personalityId,
    profileContext,
  });

  await insertInterviewMessage({
    interviewId: interviewRow.id,
    speaker: "AI",
    message: questionText,
  });

  const { audioUrl, usedVoiceMock } = await synthesizeInterviewVoice({
    interviewId: interviewRow.id,
    question: questionText,
  });

  return {
    interviewId: interviewRow.id,
    question: questionText,
    audioUrl,
    voiceFallback: usedVoiceMock,
    effectivePlan: plan,
    maxUserAnswers: maxUserAnswers(plan),
  };
}

export async function respondInterviewOrchestration(input: {
  interviewId: string;
  answerText: string;
}): Promise<{
  interviewId: string;
  nextQuestion: string;
  audioUrl: string;
  done: boolean;
  effectivePlan: "free" | "premium";
  voiceFallback?: boolean;
}> {
  const interview = await fetchInterview(input.interviewId);

  if (!interview?.id) {
    throw new Error("Interview not found.");
  }

  const plan = await resolvePlan(interview.user_id);
  const max = maxUserAnswers(plan);
  const depth: PromptDepth = plan === "premium" ? "advanced" : "basic";

  const msgsBefore = await fetchMessages(input.interviewId);
  const userBefore = msgsBefore.filter((m) => m.speaker === "USER").length;

  if (userBefore >= max) {
    throw new Error("Interview turn limit reached.");
  }

  await insertInterviewMessage({
    interviewId: input.interviewId,
    speaker: "USER",
    message: input.answerText,
  });

  const userAfter = userBefore + 1;

  if (userAfter >= max) {
    return {
      interviewId: input.interviewId,
      nextQuestion: "",
      audioUrl: "",
      done: true,
      effectivePlan: plan,
      voiceFallback: false,
    };
  }

  const msgs = await fetchMessages(input.interviewId);
  const transcript = formatTranscript(
    msgs.map((m) => ({
      speaker: m.speaker,
      message: m.message,
    })),
  );

  const personalityId = personalityForInterview(interview, plan);

  const segment =
    plan === "premium"
      ? segmentForPremiumTurn(userAfter)
      : segmentForFreeTurn(userAfter);

  const nextQuestion = await aiFollowUpInterviewQuestion({
    history: transcript,
    depth,
    segment,
    personalityId,
  });

  await insertInterviewMessage({
    interviewId: input.interviewId,
    speaker: "AI",
    message: nextQuestion,
  });

  const { audioUrl, usedVoiceMock } = await synthesizeInterviewVoice({
    interviewId: input.interviewId,
    question: nextQuestion,
  });

  return {
    interviewId: input.interviewId,
    nextQuestion,
    audioUrl,
    done: false,
    effectivePlan: plan,
    voiceFallback: usedVoiceMock,
  };
}

export async function completeInterviewFeedback(input: {
  interviewId: string;
}): Promise<StructuredFeedback & { score: number; feedbackTier: FeedbackTier }> {
  const interview = await fetchInterview(input.interviewId);

  if (!interview?.id) {
    throw new Error("Interview not found.");
  }

  const plan = await resolvePlan(interview.user_id);
  const feedbackTier: FeedbackTier = plan === "premium" ? "full" : "basic";

  const msgs = await fetchMessages(input.interviewId);
  const transcript = formatTranscript(
    msgs.map((m) => ({
      speaker: m.speaker,
      message: m.message,
    })),
  );

  const feedback = await aiEvaluateInterview(
    transcript,
    interview.role,
    feedbackTier,
  );
  const score = Math.round(
    (feedback.communication_score +
      feedback.technical_score +
      feedback.confidence_score) /
      3,
  );

  const supabase = getSupabaseAdmin();

  const { error: fbError } = await supabase.from("feedback").upsert(
    {
      interview_id: interview.id,
      communication_score: feedback.communication_score,
      technical_score: feedback.technical_score,
      confidence_score: feedback.confidence_score,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      suggestions: feedback.suggestions,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "interview_id",
    },
  );

  if (fbError) {
    throw fbError;
  }

  const { error: interviewErr } = await supabase
    .from("interviews")
    .update({ score })
    .eq("id", interview.id);

  if (interviewErr) {
    throw interviewErr;
  }

  return { ...feedback, score, feedbackTier };
}
