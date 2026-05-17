/**
 * Plays interviewer audio (signed URL / asset) when available; otherwise reads
 * the question aloud via the Web Speech API so the recruiter always speaks.
 */

function waitForSpeechVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      resolve();
      return;
    }
    const done = () => resolve();
    window.speechSynthesis.onvoiceschanged = done;
    window.setTimeout(done, 400);
  });
}

/**
 * Speak `text` with browser TTS; resolves when finished, errored, or timed out.
 */
export async function speakRecruiterText(text: string): Promise<void> {
  const t = text.trim();
  if (!t || typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }

  await waitForSpeechVoices();

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    try {
      window.speechSynthesis.cancel();
      const ut = new SpeechSynthesisUtterance(t);
      ut.lang = "en-US";
      ut.rate = 0.94;
      ut.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang?.startsWith("en") && /Google|Microsoft|Samantha/i.test(v.name)) ??
        voices.find((v) => v.lang?.startsWith("en-US")) ??
        voices.find((v) => v.lang?.startsWith("en"));
      if (preferred) {
        ut.voice = preferred;
      }
      ut.onend = finish;
      ut.onerror = finish;
      window.speechSynthesis.speak(ut);
      const maxMs = Math.min(240_000, t.length * 90 + 12_000);
      window.setTimeout(finish, maxMs);
    } catch {
      finish();
    }
  });
}

/** Returns true when playback fires `ended`, false on error / play() rejection / safety cap. */
async function tryPlayAudioUrl(url: string): Promise<boolean> {
  const u = url.trim();
  if (!u) {
    return false;
  }

  try {
    const audio = new Audio(u);
    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (v: boolean) => {
        if (settled) return;
        settled = true;
        resolve(v);
      };

      audio.addEventListener("ended", () => finish(true), { once: true });
      audio.addEventListener("error", () => finish(false), { once: true });

      void audio.play().then(
        () => undefined,
        () => finish(false),
      );

      window.setTimeout(() => finish(false), 20 * 60 * 1000);
    });
  } catch {
    return false;
  }
}

/**
 * If `voiceFallback` is true (placeholder / mock MP3), speak the question text only.
 * Otherwise try `audioUrl`; on failure or empty URL, use browser TTS for `text`.
 */
export async function playRecruiterQuestionAudio(args: {
  audioUrl: string;
  text: string;
  voiceFallback?: boolean;
}): Promise<void> {
  const text = args.text.trim();
  if (args.voiceFallback && text) {
    await speakRecruiterText(text);
    return;
  }

  const url = args.audioUrl?.trim() ?? "";
  if (url) {
    const ok = await tryPlayAudioUrl(url);
    if (ok) {
      return;
    }
  }

  if (text) {
    await speakRecruiterText(text);
  }
}
