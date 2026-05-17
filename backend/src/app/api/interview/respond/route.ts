import { hiremindJson } from "@/lib/hiremind-response";
import { geminiQuotaErrorResponse } from "@/lib/interview-api-errors";
import { InterviewRespondSchema } from "@/lib/schemas";
import { shouldUseMockAi } from "@/lib/mock";
import {
  interviewFailureHint,
  interviewStartErrorResponse,
} from "@/lib/supabase-errors";
import { respondInterviewOrchestration } from "@/services/interview.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = InterviewRespondSchema.safeParse(body);

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await respondInterviewOrchestration({
      interviewId: parsed.data.interviewId,
      answerText: parsed.data.answer,
    });

    return hiremindJson(
      {
        nextQuestion: data.nextQuestion,
        audioUrl: data.audioUrl,
        interviewId: data.interviewId,
        done: data.done,
        effectivePlan: data.effectivePlan,
        voiceFallback: data.voiceFallback,
      },
      { mock: shouldUseMockAi() },
    );
  } catch (err) {
    const msg = String(err instanceof Error ? err.message : err);
    if (msg.includes("not found")) {
      return hiremindJson({ error: "interview_not_found" }, { status: 404 });
    }
    if (msg.includes("turn limit")) {
      return hiremindJson({ error: "interview_turn_limit" }, { status: 400 });
    }

    console.error(err);

    const schema = interviewStartErrorResponse(err);
    if (schema) {
      return hiremindJson(schema.body, { status: schema.status });
    }
    const quota = geminiQuotaErrorResponse(err);
    if (quota) {
      return hiremindJson(quota.body, {
        status: quota.status,
        headers: quota.headers,
      });
    }
    const hint = interviewFailureHint(err);
    return hiremindJson(
      {
        error: "interview_respond_failed",
        ...(hint ? { hint } : {}),
      },
      { status: 500 },
    );
  }
}
