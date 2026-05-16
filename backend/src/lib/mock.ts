/** Place `/mock-interviewer.mp3` in `public/` for local playback without ElevenLabs, or serve your own CDN URL via `PUBLIC_APP_URL` + relative path logic in clients. */

export const MOCK_AUDIO_PATH = "/mock-interviewer.mp3";

export function isTruthyEnv(flag?: string): boolean {
  return flag?.toLowerCase() === "true" || flag === "1";
}

export function shouldUseMockAi(): boolean {
  if (isTruthyEnv(process.env.USE_MOCK_AI)) {
    return true;
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  return !key;
}

export function shouldUseVoiceMock(): boolean {
  return (
    shouldUseMockAi() || !process.env.ELEVENLABS_API_KEY?.trim()
  );
}


export function pickMockInterviewQuestion(depth: number, role: string): string {
  const baseRole = role.trim() || "this role";

  const questions = [
    `Walk me through your background and why you applied for ${baseRole}.`,
    `Tell me about a complex problem you solved that is relevant to ${baseRole}.`,
    `How do you prioritize trade-offs between velocity and quality when delivery pressure is high?`,
    `Describe how you collaborated with teammates or stakeholders to ship something end-to-end.`,
    `How do you keep your skills sharp and stay aligned with evolving expectations for ${baseRole}?`,
  ];

  return questions[depth % questions.length] ?? questions[0]!;
}

export function mockInterviewFeedback(role: string) {
  void role;

  return {
    communication_score: 72,
    technical_score: 68,
    confidence_score: 70,
    strengths: [
      "Clear story structure when describing past work.",
      "Uses concrete outcomes instead of vague claims.",
      "Demonstrates openness to coaching and iteration.",
    ],
    weaknesses: [
      "Answers could tighten up with more explicit metrics.",
      "Some technical explanations stayed at the surface.",
      "Limited reflection on failures or close calls.",
    ],
    suggestions: [
      "Use STAR (Situation, Task, Action, Result) framing for Behavioral answers.",
      "Add benchmarks (latency/throughput/accuracy) wherever possible.",
      "End each answer by linking your experience directly to the JD.",
    ],
  };
}
