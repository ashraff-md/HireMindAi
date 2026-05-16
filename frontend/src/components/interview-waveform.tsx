"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const presets = {
  compact: { bars: 28, gap: "gap-[3px]", barW: "w-[3px]", h: "h-24", barH: 72 },
  comfortable: {
    bars: 36,
    gap: "gap-1",
    barW: "w-[3px]",
    h: "h-32",
    barH: 92,
  },
  cinema: {
    bars: 52,
    gap: "gap-1",
    barW: "w-1",
    h: "min-h-[220px] h-[28vw] max-h-[380px]",
    barH: 280,
  },
} as const;

export function InterviewWaveform({
  active,
  variant = "ai",
  size = "comfortable",
  className,
}: {
  active: boolean;
  variant?: "ai" | "user";
  size?: keyof typeof presets;
  className?: string;
}) {
  const tint =
    variant === "ai"
      ? "bg-gradient-to-t from-[var(--hm-neon-from)] via-[var(--hm-neon-via)] to-[var(--hm-neon-to)] shadow-[0_0_14px_-2px_var(--hm-glow-mid)]"
      : "bg-gradient-to-t from-emerald-400/90 via-cyan-400/85 to-sky-400/70 shadow-[0_0_12px_-4px_oklch(0.72_0.18_165/0.45)]";

  const p = presets[size];
  const bars = Array.from({ length: p.bars }, (_, i) => i);

  return (
    <div
      className={cn(
        "flex items-end justify-center px-2",
        p.gap,
        p.h,
        size === "cinema" &&
          "rounded-2xl border border-white/10 bg-black/25 px-4 py-6 backdrop-blur-md max-md:backdrop-blur-sm dark:bg-black/45",
        className,
      )}
    >
      {bars.map((i) => (
        <motion.div
          key={i}
          className={cn(
            "origin-bottom rounded-full",
            p.barW,
            tint,
            size === "cinema" && "opacity-95",
          )}
          style={{ height: p.barH }}
          animate={{
            scaleY: active ? [0.38, 1, 0.52, 0.88, 0.42] : [0.14, 0.22, 0.17],
          }}
          transition={{
            duration: active ? 1.05 + (i % 6) * 0.05 : 2.5,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * (size === "cinema" ? 0.018 : 0.025),
          }}
        />
      ))}
    </div>
  );
}
