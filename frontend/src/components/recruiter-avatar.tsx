"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function RecruiterAvatar({
  label,
  subtitle,
  size = "lg",
  speaking,
  /** 0–1 intensity for voice-reactive ring (AI TTS rhythm). */
  voiceLevel = 0,
}: {
  label: string;
  subtitle?: string;
  size?: "md" | "lg" | "xl";
  speaking?: boolean;
  voiceLevel?: number;
}) {
  const initials = label
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const box =
    size === "xl"
      ? "size-32 text-2xl md:size-44 md:text-[1.65rem]"
      : size === "lg"
        ? "size-28 text-xl md:size-36 md:text-2xl"
        : "size-20 text-lg md:size-24 md:text-xl";

  const level = speaking ? Math.max(0.12, Math.min(1, voiceLevel)) : 0;

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative isolate flex items-center justify-center">
        {speaking ? (
          <>
            <motion.div
              className="pointer-events-none absolute -inset-[10px] rounded-full border-2 border-[oklch(0.7_0.19_286/0.65)] shadow-[0_0_24px_-4px_oklch(0.6_0.22_286/0.45)] md:-inset-[12px]"
              aria-hidden
              animate={{
                scale: [1, 1.04 + level * 0.06, 1],
                opacity: [0.75, 0.35 + level * 0.35, 0.75],
              }}
              transition={{
                duration: 0.42 + (1 - level) * 0.12,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="pointer-events-none absolute -inset-[20px] rounded-full border border-[oklch(0.75_0.14_320/0.35)] md:-inset-[24px]"
              aria-hidden
              animate={{
                scale: [1, 1.08 + level * 0.07, 1],
                opacity: [0.4, 0.12 + level * 0.25, 0.4],
              }}
              transition={{
                duration: 0.65 + (1 - level) * 0.15,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.08,
              }}
            />
            <motion.div
              className="pointer-events-none absolute -inset-[34px] rounded-full border border-white/15 md:-inset-[40px]"
              aria-hidden
              animate={{
                scale: [1, 1.12 + level * 0.05, 1],
                opacity: [0.22, 0.06, 0.22],
              }}
              transition={{
                duration: 0.85,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.15,
              }}
            />
          </>
        ) : null}

        <motion.div
          className={cn(
            "relative z-10 flex items-center justify-center rounded-full border border-white/15 bg-black/40 font-display font-semibold tracking-tight text-primary-foreground hm-ring-glow dark:bg-black/55",
            box,
          )}
          animate={
            speaking
              ? {
                  scale: [1, 1.02 + level * 0.025, 1],
                  boxShadow: [
                    "0 0 0 0 transparent",
                    `0 0 ${32 + level * 28}px -10px var(--hm-glow-mid)`,
                    "0 0 0 0 transparent",
                  ],
                }
              : { scale: 1 }
          }
          transition={{
            duration: 1.2 + (1 - level) * 0.4,
            repeat: speaking ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <span
            className="relative z-10 hm-text-neon drop-shadow-[0_0_18px_var(--hm-glow-mid)]"
            aria-hidden
          >
            {initials || "AI"}
          </span>
          <div
            className="pointer-events-none absolute inset-2 rounded-full opacity-90 blur-xl dark:opacity-100"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, var(--hm-neon-from), transparent 55%), radial-gradient(circle at 78% 78%, var(--hm-neon-to), transparent 55%)",
            }}
          />
        </motion.div>
      </div>
      <div className="text-center">
        <p className="font-display text-sm font-semibold tracking-tight text-foreground">
          {label}
        </p>
        {subtitle ? (
          <p className="mt-1 max-w-[14rem] text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
