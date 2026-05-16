import { randomUUID } from "node:crypto";

import { elevenLabsSpeakToMp3 } from "@/lib/elevenlabs";
import { MOCK_AUDIO_PATH, shouldUseVoiceMock } from "@/lib/mock";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function synthesizeInterviewVoice(args: {
  interviewId: string;
  question: string;
}): Promise<{ audioUrl: string; usedVoiceMock: boolean }> {
  if (shouldUseVoiceMock()) {
    const base = process.env.PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
    const path = MOCK_AUDIO_PATH;
    const url = base ? `${base}${path}` : path;

    return { audioUrl: url, usedVoiceMock: true };
  }

  const supabase = getSupabaseAdmin();
  const mp3 = await elevenLabsSpeakToMp3(args.question);

  const objectPath = `${args.interviewId}/${randomUUID()}.mp3`;
  const { error: uploadError } = await supabase.storage
    .from("interview-audio")
    .upload(objectPath, mp3, {
      contentType: "audio/mpeg",
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data, error } = await supabase.storage
    .from("interview-audio")
    .createSignedUrl(objectPath, 60 * 60);

  if (error || !data?.signedUrl) {
    throw error ?? new Error("Failed to generate signed URL.");
  }

  return { audioUrl: data.signedUrl, usedVoiceMock: false };
}
