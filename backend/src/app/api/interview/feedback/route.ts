import { hiremindJson } from "@/lib/hiremind-response";
import { geminiQuotaErrorResponse } from "@/lib/interview-api-errors";
import { InterviewFeedbackSchema } from "@/lib/schemas";
import { shouldUseMockAi } from "@/lib/mock";
import {
  interviewFailureHint,
  interviewStartErrorResponse,
} from "@/lib/supabase-errors";
import { completeInterviewFeedback } from "@/services/interview.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = InterviewFeedbackSchema.safeParse(body);

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await completeInterviewFeedback({
      interviewId: parsed.data.interviewId,
    });

    return hiremindJson(
      {
        score: data.score,
        communicationScore: data.communication_score,
        technicalScore: data.technical_score,
        confidenceScore: data.confidence_score,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        suggestions: data.suggestions,
        feedbackTier: data.feedbackTier,
      },
      { mock: shouldUseMockAi() },
    );
  } catch (err) {
    if (String(err instanceof Error ? err.message : err).includes("not found")) {
      return hiremindJson({ error: "interview_not_found" }, { status: 404 });
    }

    console.error(err);

    const schema = interviewStartErrorResponse(err);
    if (schema) {
      return hiremindJson(schema.body, { status: schema.status });
    }
    const quota = geminiQuotaErrorResponse(err);
    if (quota) {
      return hiremindJson(quota.body, { status: quota.status });
    }
    const hint = interviewFailureHint(err);
    return hiremindJson(
      {
        error: "interview_feedback_failed",
        ...(hint ? { hint } : {}),
      },
      { status: 500 },
    );
  }
}
