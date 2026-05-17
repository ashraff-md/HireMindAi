"use client";

/* eslint-disable react-hooks/set-state-in-effect -- RMS loop drives smoothed UI level from MediaStream */
import { useEffect, useState } from "react";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Smoothed RMS (0–1) from `stream` while `active`.
 * When `stream` is null, level stays at 0.
 */
export function useMicLevel(active: boolean, stream: MediaStream | null): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!active || !stream) {
      setLevel(0);
      return;
    }

    let raf = 0;
    let ctx: AudioContext | null = null;

    ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    src.connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);

    let smooth = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = (buf[i]! - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / buf.length);
      const instant = clamp01(rms * 4.2);
      smooth += (instant - smooth) * 0.35;
      setLevel(smooth);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      void ctx?.close();
      setLevel(0);
    };
  }, [active, stream]);

  return level;
}
