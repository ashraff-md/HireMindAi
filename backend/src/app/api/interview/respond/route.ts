import { hiremindJson } from "@/lib/hiremind-response";
import { InterviewRespondSchema } from "@/lib/schemas";
import { shouldUseMockAi } from "@/lib/mock";
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

    return hiremindJson({ error: "interview_respond_failed" }, { status: 500 });
  }
}
