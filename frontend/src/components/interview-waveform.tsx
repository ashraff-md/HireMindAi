"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function jitter01(i: number, seed: number) {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Blur amplitude samples horizontally — reads closer to messenger voice strips. */
function blurHorizontal(samples: Float32Array, len: number) {
  if (len < 3) return;
  const tmp = Float32Array.from(samples);
  for (let i = 1; i < len - 1; i++) {
    samples[i] = clamp(
      tmp[i] * 0.78 + tmp[i - 1] * 0.11 + tmp[i + 1] * 0.11,
      0.015,
      1,
    );
  }
}

/** WhatsApp-like mm:ss (always floor seconds for stability). */
function formatMmSs(totalSec: number) {
  const sec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const presets = {
  compact: {
    bars: 32,
    outerClass: "h-28",
    stripH: 36,
    bubblePad: "px-3 py-2.5",
  },
  comfortable: {
    bars: 42,
    outerClass: "h-36",
    stripH: 44,
    bubblePad: "px-4 py-3",
  },
  cinema: {
    bars: 54,
    outerClass:
      "min-h-[132px] sm:min-h-[160px] py-8 sm:py-10 [--strip-h:52px]",
    stripH: 52,
    bubblePad: "px-4 py-3 sm:px-5 sm:py-3.5",
  },
} as const;

export function InterviewWaveform({
  active,
  variant = "ai",
  size = "comfortable",
  className,
  whatsappBubble = false,
  elapsedSeconds,
  micLevel,
}: {
  active: boolean;
  variant?: "ai" | "user";
  size?: keyof typeof presets;
  className?: string;
  /** Chat-style capsule with timer — like WhatsApp voice recording chrome. */
  whatsappBubble?: boolean;
  /** Session duration for the capsule timer (left side). */
  elapsedSeconds?: number;
  /** Optional live microphone RMS (0–1) from Web Audio; blends with simulation. */
  micLevel?: number;
}) {
  const p = presets[size];
  const micRef = useRef(micLevel ?? 0);
  micRef.current = micLevel ?? 0;

  /** Flat bar fills like WhatsApp (no gradients on individual bars). */
  const barClass =
    variant === "ai"
      ? "rounded-full bg-[oklch(0.73_0.18_287)] shadow-none"
      : "rounded-full bg-[oklch(0.78_0.15_164)] shadow-none";

  const capsuleClass =
    "rounded-[calc(var(--radius-2xl,1rem)*1.6)] border border-white/[0.08] bg-[#26353d]/[0.96] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

  const n = p.bars;
  const histRef = useRef<Float32Array | null>(null);
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  /** Smoothed instantaneous level (voice envelope). */
  const levelRef = useRef(active ? 0.35 : 0.06);
  /** Syllable phase for simulated speech bursts (seeded once in effect). */
  const wordPhaseRef = useRef(0);
  const phaseSeededRef = useRef(false);

  /** Pixel height comes from preset or CSS variable (cinema can override via class). */
  const stripPx = size === "cinema" ? undefined : p.stripH;
  const stripStyle =
    stripPx !== undefined ? ({ height: stripPx } as const) : { height: "var(--strip-h, 52px)" as const };

  useEffect(() => {
    if (!phaseSeededRef.current) {
      wordPhaseRef.current = Math.random() * Math.PI * 2;
      phaseSeededRef.current = true;
    }

    if (!histRef.current || histRef.current.length !== n) {
      histRef.current = new Float32Array(n).fill(0.1);
      for (let i = 0; i < n; i++) histRef.current[i] = 0.08 + jitter01(i, 42) * 0.06;
    }

    const hist = histRef.current;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyHist = (): void => {
      for (let i = 0; i < n; i++) {
        const el = barsRef.current[i];
        if (!el) continue;
        const v = clamp(hist[i], 0.04, 1);
        /** Minimum “floor” amplitude so it reads like WhatsApp even at low RMS. */
        const floor = active ? 0.08 : 0.045;
        const span = active ? 0.92 : 0.32;
        const pct = clamp(floor + v * span, 0.06, 1);
        el.style.height = `${(pct * 100).toFixed(2)}%`;
        el.style.opacity = active ? String(clamp(0.35 + v * 0.65, 0.42, 1)) : String(clamp(0.35 + v * 0.3, 0.28, 0.72));
      }
    };

    if (reduceMotion) {
      applyHist();
      const id = window.setInterval(() => {
        wordPhaseRef.current += 0.07;
        const target = active
          ? clamp(0.35 + jitter01(0, wordPhaseRef.current) * 0.45 + Math.sin(wordPhaseRef.current * 3) * 0.08, 0.05, 0.96)
          : 0.08;
        levelRef.current += (target - levelRef.current) * 0.12;
        for (let i = 0; i < n - 1; i++) hist[i] = hist[i + 1];
        hist[n - 1] = clamp(levelRef.current, 0.05, 0.94);
        blurHorizontal(hist, n);
        applyHist();
      }, active ? 150 : 400);
      return () => window.clearInterval(id);
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now: number): void => {
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      wordPhaseRef.current += dt * (active ? 3.8 : 0.95);

      if (active) {
        /** Simulated RMS / mic envelope (replace with analyser RMS later). */
        const chatter = jitter01(Math.floor(now * 0.00177) % 60, wordPhaseRef.current);
        let targetEnv = 0.28 + 0.48 * Math.pow(0.5 + 0.5 * Math.sin(wordPhaseRef.current * 2.05), 2.05);
        if (chatter > 0.73) targetEnv *= 1.18;
        if (Math.sin(wordPhaseRef.current * 6.21) > 0.74) targetEnv *= 0.34;
        const burst = jitter01(Math.floor(wordPhaseRef.current * 4) % 10, now * 1e-4) * (active ? 0.07 : 0);
        targetEnv = clamp(targetEnv + burst - 0.02, 0.08, 0.94);
        levelRef.current += (targetEnv - levelRef.current) * clamp(22 * dt * 0.045 + 0.18, 0.12, 0.52);
      } else {
        levelRef.current += (0.06 + Math.sin(now * 0.0019) * 0.025 - levelRef.current) * 0.08;
      }

      /** “Compress” louder peaks visually like mobile recorders */
      let sample = Math.pow(clamp(levelRef.current, 0, 1), 0.78);
      const live = micRef.current;
      if (live > 0.004) {
        sample = Math.max(sample, clamp(live * 0.92 + 0.06, 0, 1));
      }
      sample = clamp(sample, active ? 0.03 : 0.02, 1);

      for (let i = 0; i < n - 1; i++) {
        hist[i] = hist[i + 1];
      }
      hist[n - 1] = sample;

      blurHorizontal(hist, n);

      if (!active) {
        for (let i = 0; i < n; i++) {
          hist[i] = clamp(
            hist[i] * 0.984 + (0.04 + jitter01(i, now * 2e-4) * 0.02),
            0.035,
            0.92,
          );
        }
      }

      applyHist();
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, n]);

  const bars = Array.from({ length: n }, (_, i) => i);

  const innerWave = (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 items-end justify-center gap-[2px]",
        "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
      )}
      style={stripStyle}
      aria-hidden
    >
      {bars.map((i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className={cn(barClass, "max-w-[3.5px] min-h-[14%] min-w-[2px] flex-1")}
          style={{
            height: "12%",
          }}
        />
      ))}
    </div>
  );

  return (
    <div
        className={cn(
        "relative flex min-w-0 justify-center overflow-hidden pr-px",
        whatsappBubble && "items-center",
        whatsappBubble ? cn(p.outerClass, p.bubblePad, capsuleClass) : p.outerClass,
        /** Hero / large panel surface when not using chat bubble chrome */
        !whatsappBubble &&
          size === "cinema" &&
          "rounded-2xl border border-white/10 bg-black/25 px-6 py-10 backdrop-blur-md max-md:backdrop-blur-sm dark:bg-black/45",
        className,
      )}
    >
      <div className={cn("flex w-full items-center gap-3", whatsappBubble ? "" : "h-full justify-center px-4")}>
        {whatsappBubble ? (
          <span className="w-[3.05rem] shrink-0 pt-px tabular-nums text-[15px] font-normal leading-none tracking-tight text-white/90 antialiased">
            {elapsedSeconds !== undefined ? formatMmSs(elapsedSeconds) : "0:00"}
          </span>
        ) : null}
        {whatsappBubble ? (
          innerWave
        ) : (
          <div className="flex min-h-0 w-full justify-center">{innerWave}</div>
        )}
        {whatsappBubble ? <span className="w-[3.05rem] shrink-0" aria-hidden /> : null}
      </div>
    </div>
  );
}
