import { geminiQuotaErrorResponse } from "@/lib/interview-api-errors";
import { hiremindJson } from "@/lib/hiremind-response";
import { InterviewStartSchema } from "@/lib/schemas";
import { shouldUseMockAi } from "@/lib/mock";
import {
  interviewFailureHint,
  interviewStartErrorResponse,
} from "@/lib/supabase-errors";
import { startInterviewOrchestration } from "@/services/interview.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = InterviewStartSchema.safeParse(body);

    if (!parsed.success) {
      return hiremindJson(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await startInterviewOrchestration({
      userId: parsed.data.userId,
      role: parsed.data.role,
      mode: parsed.data.mode,
      personalityId: parsed.data.personalityId,
    });

    return hiremindJson(
      {
        interviewId: data.interviewId,
        question: data.question,
        audioUrl: data.audioUrl,
        effectivePlan: data.effectivePlan,
        maxUserAnswers: data.maxUserAnswers,
        voiceFallback: data.voiceFallback,
      },
      { mock: shouldUseMockAi() },
    );
  } catch (err) {
    console.error(err);
    const mapped = interviewStartErrorResponse(err);
    if (mapped) {
      return hiremindJson(mapped.body, { status: mapped.status });
    }
    const quota = geminiQuotaErrorResponse(err);
    if (quota) {
      return hiremindJson(quota.body, { status: quota.status });
    }
    const hint = interviewFailureHint(err);
    return hiremindJson(
      {
        error: "interview_start_failed",
        ...(hint ? { hint } : {}),
      },
      { status: 500 },
    );
  }
}
