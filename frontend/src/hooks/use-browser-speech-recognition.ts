"use client";

import { useCallback, useEffect, useRef } from "react";

export function getSpeechRecognitionCtor():
  | (new () => SpeechRecognition)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type UseBrowserSpeechRecognitionOptions = {
  /** When false, recognition is stopped. */
  enabled: boolean;
  lang?: string;
  /** Final text is cumulative committed transcription; interim includes preview tail. */
  onText: (text: string, meta: { isFinal: boolean }) => void;
};

/**
 * Browser SpeechRecognition (Chrome/Edge). Stops when disabled; restarts on recoverable end.
 */
export function useBrowserSpeechRecognition({
  enabled,
  lang,
  onText,
}: UseBrowserSpeechRecognitionOptions) {
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const committedRef = useRef("");

  const ctor = getSpeechRecognitionCtor();
  const supported = ctor !== null;

  useEffect(() => {
    committedRef.current = "";
  }, [enabled]);

  useEffect(() => {
    if (!ctor || !supported) return;

    let rec: SpeechRecognition | null = null;
    let stopped = false;

    const start = () => {
      if (stopped || !enabledRef.current) return;
      try {
        rec?.start();
      } catch {
        /* already running */
      }
    };

    const stop = () => {
      try {
        rec?.stop();
      } catch {
        /* */
      }
    };

    if (!enabled) {
      stop();
      return () => {
        stopped = true;
      };
    }

    rec = new ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang?.trim() || (typeof navigator !== "undefined" ? navigator.language : "en-US");

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      let interim = "";
      let committed = committedRef.current;

      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const result = ev.results[i];
        if (!result?.[0]) continue;
        const t = result[0].transcript.trim();
        if (!t) continue;
        if (result.isFinal) {
          committed = committed ? `${committed} ${t}`.trim() : t;
          committedRef.current = committed;
          onTextRef.current(committed, { isFinal: true });
        } else {
          interim = t;
        }
      }

      if (interim) {
        onTextRef.current(
          committed ? `${committed} ${interim}`.trim() : interim,
          { isFinal: false },
        );
      } else if (committed) {
        onTextRef.current(committed, { isFinal: false });
      }
    };

    rec.onerror = () => {
      /* no-speech and other recoverable events — browser may end session */
    };

    rec.onend = () => {
      if (stopped) return;
      if (enabledRef.current) {
        window.setTimeout(start, 120);
      }
    };

    start();

    return () => {
      stopped = true;
      stop();
      rec = null;
    };
  }, [ctor, supported, enabled, lang]);

  const resetTranscript = useCallback(() => {
    committedRef.current = "";
  }, []);

  return { supported, resetTranscript } as const;
}
