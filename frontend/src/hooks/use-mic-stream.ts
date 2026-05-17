"use client";

/* eslint-disable react-hooks/set-state-in-effect -- MediaStream lifecycle must sync with React state */
import { useEffect, useState } from "react";

/** Single shared microphone stream for the live interview session (level + optional recording). */
export function useMicStream(want: boolean): MediaStream | null {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!want) {
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
      return;
    }

    let cancelled = false;
    let acquired: MediaStream | null = null;

    void navigator.mediaDevices.getUserMedia({ audio: true }).then((ms) => {
      if (cancelled) {
        ms.getTracks().forEach((t) => t.stop());
        return;
      }
      acquired = ms;
      setStream(ms);
    });

    return () => {
      cancelled = true;
      acquired?.getTracks().forEach((t) => t.stop());
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });
    };
  }, [want]);

  return stream;
}
