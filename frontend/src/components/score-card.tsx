"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function ScoreCard({
  label,
  score,
  accentClassName,
  delay = 0,
}: {
  label: string;
  score: number;
  accentClassName?: string;
  delay?: number;
}) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/15 bg-card/70 p-5 shadow-xl backdrop-blur-2xl hm-panel-glow dark:border-white/10",
        accentClassName,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,var(--hm-neon-from),transparent_68%)] opacity-35 blur-2xl"
      />
      <div className="relative flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <div className="flex items-end gap-2">
          <span className="font-display text-4xl font-semibold tabular-nums">{clamped}</span>
          <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted/80">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--hm-neon-from)] via-[var(--hm-neon-via)] to-[var(--hm-neon-to)] shadow-[0_0_18px_-4px_var(--hm-glow-mid)]"
            initial={{ width: 0 }}
            animate={{ width: `${clamped}%` }}
            transition={{ delay: delay + 0.1, duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}
