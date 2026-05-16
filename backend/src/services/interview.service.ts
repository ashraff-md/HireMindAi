import { getSupabaseAdmin } from "@/lib/supabase";
import type { StructuredFeedback } from "@/lib/schemas";
import {
  aiEvaluateInterview,
  aiFirstInterviewQuestion,
  aiFollowUpInterviewQuestion,
} from "@/services/ai.service";

import { synthesizeInterviewVoice } from "./voice.service";

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

async function fetchInterview(interviewId: string) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("interviews")
    .select("id, role")
    .eq("id", interviewId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
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

export async function startInterviewOrchestration(input: {
  userId: string;
  role: string;
  mode: "free" | "premium";
}) {
  const supabase = getSupabaseAdmin();

  const { data: interviewRow, error: interviewError } = await supabase
    .from("interviews")
    .insert({
      user_id: input.userId,
      role: input.role,
      mode: input.mode,
    })
    .select("id")
    .single();

  if (interviewError || !interviewRow?.id) {
    throw interviewError ?? new Error("Failed to create interview.");
  }

  const questionText = await aiFirstInterviewQuestion(input.role);

  await insertInterviewMessage({
    interviewId: interviewRow.id,
    speaker: "AI",
    message: questionText,
  });

  const { audioUrl } = await synthesizeInterviewVoice({
    interviewId: interviewRow.id,
    question: questionText,
  });

  return { interviewId: interviewRow.id, question: questionText, audioUrl };
}

export async function respondInterviewOrchestration(input: {
  interviewId: string;
  answerText: string;
}) {
  const interview = await fetchInterview(input.interviewId);

  if (!interview?.id) {
    throw new Error("Interview not found.");
  }

  await insertInterviewMessage({
    interviewId: input.interviewId,
    speaker: "USER",
    message: input.answerText,
  });

  const msgs = await fetchMessages(input.interviewId);
  const transcript = formatTranscript(msgs.map((m) => ({
    speaker: m.speaker,
    message: m.message,
  })));

  const nextQuestion = await aiFollowUpInterviewQuestion(transcript);

  await insertInterviewMessage({
    interviewId: input.interviewId,
    speaker: "AI",
    message: nextQuestion,
  });

  const { audioUrl } = await synthesizeInterviewVoice({
    interviewId: input.interviewId,
    question: nextQuestion,
  });

  return {
    interviewId: input.interviewId,
    nextQuestion,
    audioUrl,
  };
}

export async function completeInterviewFeedback(input: {
  interviewId: string;
}): Promise<StructuredFeedback & { score: number }> {
  const interview = await fetchInterview(input.interviewId);

  if (!interview?.id) {
    throw new Error("Interview not found.");
  }

  const msgs = await fetchMessages(input.interviewId);
  const transcript = formatTranscript(msgs.map((m) => ({
    speaker: m.speaker,
    message: m.message,
  })));

  const feedback = await aiEvaluateInterview(transcript, interview.role);
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

  return { ...feedback, score };
}
