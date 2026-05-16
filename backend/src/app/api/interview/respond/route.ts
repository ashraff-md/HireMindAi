import { hiremindJson } from "@/lib/hiremind-response";
import { InterviewRespondSchema } from "@/lib/schemas";
import { shouldUseVoiceMock } from "@/lib/mock";
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
      },
      { mock: shouldUseVoiceMock() },
    );
  } catch (err) {
    if (String(err instanceof Error ? err.message : err).includes("not found")) {
      return hiremindJson({ error: "interview_not_found" }, { status: 404 });
    }

    console.error(err);

    return hiremindJson({ error: "interview_respond_failed" }, { status: 500 });
  }
}
