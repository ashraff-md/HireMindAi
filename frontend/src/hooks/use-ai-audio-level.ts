"use client";

import { useEffect, useState } from "react";

/**
 * Synthetic 0–1 envelope while the AI “speaking” phase is active (matches TTS rhythm without Web Audio).
 */
export function useSyntheticAiVoiceLevel(aiSpeaking: boolean): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!aiSpeaking) {
      setLevel(0);
      return;
    }

    let raf = 0;
    const t0 = performance.now();
    const loop = (t: number) => {
      const x = (t - t0) / 1000;
      const syllable =
        0.45 +
        0.5 *
          Math.pow(0.5 + 0.5 * Math.sin(x * 13.2), 1.85) *
          (0.85 + 0.15 * Math.sin(x * 41));
      setLevel(Math.min(1, Math.max(0.08, syllable)));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [aiSpeaking]);

  return level;
}
