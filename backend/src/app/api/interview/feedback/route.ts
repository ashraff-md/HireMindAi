import { hiremindJson } from "@/lib/hiremind-response";
import { InterviewFeedbackSchema } from "@/lib/schemas";
import { shouldUseMockAi } from "@/lib/mock";
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
      },
      { mock: shouldUseMockAi() },
    );
  } catch (err) {
    if (String(err instanceof Error ? err.message : err).includes("not found")) {
      return hiremindJson({ error: "interview_not_found" }, { status: 404 });
    }

    console.error(err);

    return hiremindJson({ error: "interview_feedback_failed" }, { status: 500 });
  }
}
