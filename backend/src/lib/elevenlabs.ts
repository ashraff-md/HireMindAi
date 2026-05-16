async function elevenLabsTtsMp3(params: {
  apiKey: string;
  voiceId: string;
  text: string;
  modelId: string;
}): Promise<Buffer> {
  const voice = encodeURIComponent(params.voiceId.trim());
  const url =
    `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": params.apiKey.trim(),
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: params.text.trim(),
      model_id: params.modelId.trim(),
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`ElevenLabs HTTP ${resp.status}: ${text || resp.statusText}`);
  }

  return Buffer.from(await resp.arrayBuffer());
}

export async function elevenLabsSpeakToMp3(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not set.");
  }

  const voiceId =
    process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
  const modelId =
    process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";

  return elevenLabsTtsMp3({
    apiKey,
    voiceId,
    modelId,
    text,
  });
}
