import { z } from "zod";

export type FeedbackTier = "basic" | "full";

export const InterviewStartSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().min(1).max(200),
  mode: z.enum(["free", "premium"]).optional().default("free"),
  personalityId: z.string().min(1).max(64).optional(),
});

export const InterviewRespondSchema = z.object({
  interviewId: z.string().uuid(),
  answer: z.string().min(1).max(20_000),
});

export const InterviewFeedbackSchema = z.object({
  interviewId: z.string().uuid(),
});

export const PayHereInitSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().optional(),
});

export const ResumeProfileSchema = z.object({
  skills: z.array(z.string()),
  education: z.array(z.string()),
  experience: z.array(z.string()),
  projects: z.array(z.string()),
  target_role: z.string().nullable().optional(),
});

export type ResumeProfileParsed = z.infer<typeof ResumeProfileSchema>;

export const StructuredFeedbackSchema = z.object({
  communication_score: z.number(),
  technical_score: z.number(),
  confidence_score: z.number(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type StructuredFeedback = z.infer<typeof StructuredFeedbackSchema>;
