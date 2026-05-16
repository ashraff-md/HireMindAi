import OpenAI from "openai";

import {
  feedbackSystemPrompt,
  feedbackUserPrompt,
  followUpUserPrompt,
  firstQuestionUserPrompt,
  recruiterInterviewSystemPrompt,
  resumeParsingSystemPrompt,
  resumeParsingUserPrompt,
} from "./prompts";
import { ResumeProfileSchema, StructuredFeedbackSchema } from "./schemas";
import {
  mockInterviewFeedback,
  pickMockInterviewQuestion,
  shouldUseMockAi,
} from "./mock";

export function getOpenAiClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY?.trim();

  if (!key) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  return new OpenAI({ apiKey: key });
}

function model(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

function jsonOnlyInstruction() {
  return "Respond with JSON ONLY. No markdown fences.";
}

export async function aiFirstInterviewQuestion(role: string) {
  if (shouldUseMockAi()) {
    return pickMockInterviewQuestion(0, role);
  }

  const openai = getOpenAiClient();
  const msg = await openai.chat.completions.create({
    model: model(),
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: recruiterInterviewSystemPrompt },
      {
        role: "system",
        content:
          `${jsonOnlyInstruction()} Shape: {\"question\": string}.`,
      },
      { role: "user", content: firstQuestionUserPrompt(role) },
    ],
  });

  const raw = msg.choices[0]?.message?.content?.trim() ?? "{}";
  const parsedUnknown: unknown = JSON.parse(raw);
  const question = (parsedUnknown as { question?: unknown }).question;

  if (typeof question !== "string" || question.trim().length === 0) {
    throw new Error("AI returned invalid first question payload.");
  }

  return question.trim();
}

export async function aiFollowUpInterviewQuestion(history: string) {
  if (shouldUseMockAi()) {
    const depth = Math.max(0, (history.match(/USER:/g) ?? []).length);
    const roleGuess = extractRoleGuess(history);

    return pickMockInterviewQuestion(depth, roleGuess);
  }

  const openai = getOpenAiClient();
  const msg = await openai.chat.completions.create({
    model: model(),
    temperature: 0.6,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: recruiterInterviewSystemPrompt },
      {
        role: "system",
        content:
          `${jsonOnlyInstruction()} Shape: {\"question\": string}.`,
      },
      { role: "user", content: followUpUserPrompt(history) },
    ],
  });

  const raw = msg.choices[0]?.message?.content?.trim() ?? "{}";
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

export async function aiEvaluateInterview(history: string, roleHint?: string) {
  if (shouldUseMockAi()) {
    return mockInterviewFeedback(extractRoleGuess(history, roleHint));
  }

  const openai = getOpenAiClient();

  const msg = await openai.chat.completions.create({
    model: model(),
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: feedbackSystemPrompt },
      {
        role: "system",
        content:
          `${jsonOnlyInstruction()} Strictly conform to StructuredFeedback schema fields.`,
      },
      { role: "user", content: feedbackUserPrompt(history) },
    ],
  });

  const raw = msg.choices[0]?.message?.content?.trim() ?? "{}";
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

  const openai = getOpenAiClient();

  const msg = await openai.chat.completions.create({
    model: model(),
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: resumeParsingSystemPrompt },
      { role: "system", content: jsonOnlyInstruction() },
      {
        role: "user",
        content: resumeParsingUserPrompt(resumeText.slice(0, 24_000)),
      },
    ],
  });

  const raw = msg.choices[0]?.message?.content?.trim() ?? "{}";
  const parsedUnknown: unknown = JSON.parse(raw);

  const parsed = ResumeProfileSchema.safeParse(parsedUnknown);

  if (!parsed.success) {
    throw new Error("AI resume parsing JSON validation failed.");
  }

  return parsed.data;
}
