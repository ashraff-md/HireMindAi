import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  feedbackSystemPrompt,
  feedbackUserPrompt,
  followUpUserPrompt,
  firstQuestionUserPrompt,
  recruiterInterviewSystemPrompt,
  resumeParsingSystemPrompt,
  resumeParsingUserPrompt,
  type InterviewSegment,
  type PersonalityId,
  type PromptDepth,
} from "./prompts";
import {
  type FeedbackTier,
  ResumeProfileSchema,
  StructuredFeedbackSchema,
} from "./schemas";
import {
  mockInterviewFeedback,
  pickMockInterviewQuestion,
  shouldUseMockAi,
} from "./mock";

function getGeminiApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim();

  if (!key) {
    throw new Error("GEMINI_API_KEY (or GOOGLE_AI_API_KEY) is not set.");
  }

  return key;
}

/** For advanced use (e.g. custom tooling). */
export function getGeminiClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getGeminiApiKey());
}

function geminiModelId(): string {
  // 1.5-flash often has more generous free-tier limits than 2.0-flash; override with GEMINI_MODEL.
  return process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
}

function jsonOnlyInstruction() {
  return "Respond with JSON ONLY. No markdown fences.";
}

/** Strip optional ```json fences if the model adds them despite responseMimeType. */
function stripJsonFence(s: string): string {
  const t = s.trim();
  const m = /^```(?:json)?\s*([\s\S]*?)\s*```$/im.exec(t);
  if (m?.[1]) return m[1].trim();
  return t;
}

async function generateGeminiJson(args: {
  systemInstruction: string;
  userText: string;
  temperature: number;
}): Promise<string> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: geminiModelId(),
    systemInstruction: args.systemInstruction,
    generationConfig: {
      temperature: args.temperature,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(args.userText);
  const raw = result.response.text()?.trim() ?? "{}";
  return stripJsonFence(raw);
}

export async function aiFirstInterviewQuestion(input: {
  role: string;
  depth: PromptDepth;
  personalityId: PersonalityId;
  profileContext?: string | null;
}) {
  if (shouldUseMockAi()) {
    return pickMockInterviewQuestion(
      0,
      input.role,
      "intro",
      input.depth,
    );
  }

  const system = recruiterInterviewSystemPrompt({
    depth: input.depth,
    personalityId: input.personalityId,
  });

  const systemInstruction = [
    system,
    `${jsonOnlyInstruction()} Shape: {\"question\": string}.`,
  ].join("\n\n");

  const userText = firstQuestionUserPrompt({
    role: input.role,
    depth: input.depth,
    profileContext: input.profileContext,
  });

  const raw = await generateGeminiJson({
    systemInstruction,
    userText,
    temperature: 0.6,
  });

  const parsedUnknown: unknown = JSON.parse(raw);
  const question = (parsedUnknown as { question?: unknown }).question;

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("AI returned invalid first question payload.");
  }

  return question.trim();
}

export async function aiFollowUpInterviewQuestion(input: {
  history: string;
  depth: PromptDepth;
  segment: InterviewSegment;
  personalityId: PersonalityId;
}) {
  if (shouldUseMockAi()) {
    const depth = Math.max(0, (input.history.match(/USER:/g) ?? []).length);
    const roleGuess = extractRoleGuess(input.history);

    return pickMockInterviewQuestion(
      depth,
      roleGuess,
      input.segment,
      input.depth,
    );
  }

  const system = recruiterInterviewSystemPrompt({
    depth: input.depth,
    personalityId: input.personalityId,
  });

  const systemInstruction = [
    system,
    `${jsonOnlyInstruction()} Shape: {\"question\": string}.`,
  ].join("\n\n");

  const userText = followUpUserPrompt({
    history: input.history,
    depth: input.depth,
    segment: input.segment,
  });

  const raw = await generateGeminiJson({
    systemInstruction,
    userText,
    temperature: 0.6,
  });

  const parsedUnknown: unknown = JSON.parse(raw);
  const question = (parsedUnknown as { question?: unknown }).question;

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("AI returned invalid follow-up question payload.");
  }

  return question.trim();
}

function extractRoleGuess(history: string, roleHint?: string): string {
  const hint = roleHint?.trim();
  if (hint?.length) {
    return hint;
  }

  const m = /^AI:.*applied for "([^"]+)"/m.exec(history);
  const role = m?.[1]?.trim();

  return role?.length ? role : "your target role";
}

export async function aiEvaluateInterview(
  history: string,
  roleHint: string | undefined,
  tier: FeedbackTier,
) {
  if (shouldUseMockAi()) {
    return mockInterviewFeedback(extractRoleGuess(history, roleHint), tier);
  }

  const systemInstruction = [
    feedbackSystemPrompt,
    `${jsonOnlyInstruction()} Strictly conform to StructuredFeedback schema fields.`,
  ].join("\n\n");

  const userText = feedbackUserPrompt(history, tier);

  const raw = await generateGeminiJson({
    systemInstruction,
    userText,
    temperature: 0.2,
  });

  const parsedUnknown: unknown = JSON.parse(raw);
  const parsed = StructuredFeedbackSchema.safeParse(parsedUnknown);

  if (!parsed.success) {
    throw new Error("AI feedback JSON validation failed.");
  }

  const v = parsed.data;
  const clampScore = (n: number) =>
    Math.min(100, Math.max(1, Math.round(Number(n))));

  return {
    communication_score: clampScore(v.communication_score),
    technical_score: clampScore(v.technical_score),
    confidence_score: clampScore(v.confidence_score),
    strengths: v.strengths,
    weaknesses: v.weaknesses,
    suggestions: v.suggestions,
  };
}

export async function aiParseResume(resumeText: string) {
  if (shouldUseMockAi()) {
    return ResumeProfileSchema.parse({
      skills: [],
      education: [],
      experience: [],
      projects: [],
      target_role: null,
    });
  }

  const systemInstruction = [
    resumeParsingSystemPrompt,
    jsonOnlyInstruction(),
  ].join("\n\n");

  const userText = resumeParsingUserPrompt(resumeText.slice(0, 24_000));

  const raw = await generateGeminiJson({
    systemInstruction,
    userText,
    temperature: 0,
  });

  const parsedUnknown: unknown = JSON.parse(raw);

  const parsed = ResumeProfileSchema.safeParse(parsedUnknown);

  if (!parsed.success) {
    throw new Error("AI resume parsing JSON validation failed.");
  }

  return parsed.data;
}
