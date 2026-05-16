import { hiremindJson } from "@/lib/hiremind-response";
import { InterviewStartSchema } from "@/lib/schemas";
import { shouldUseVoiceMock } from "@/lib/mock";
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
    });

    return hiremindJson(
      {
        interviewId: data.interviewId,
        question: data.question,
        audioUrl: data.audioUrl,
      },
      { mock: shouldUseVoiceMock() },
    );
  } catch (err) {
    console.error(err);
    return hiremindJson({ error: "interview_start_failed" }, { status: 500 });
  }
}
