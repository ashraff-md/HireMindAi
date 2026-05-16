"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function RecruiterAvatar({
  label,
  subtitle,
  size = "lg",
  speaking,
}: {
  label: string;
  subtitle?: string;
  size?: "md" | "lg" | "xl";
  speaking?: boolean;
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

  return (
    <div className="relative flex flex-col items-center gap-3">
      <motion.div
        className={cn(
          "relative flex items-center justify-center rounded-full border border-white/15 bg-black/40 font-display font-semibold tracking-tight text-primary-foreground hm-ring-glow dark:bg-black/55",
          box,
        )}
        animate={
          speaking
            ? { scale: [1, 1.04, 1], boxShadow: ["0 0 0 0 transparent", "0 0 48px -8px var(--hm-glow-mid)", "0 0 0 0 transparent"] }
            : { scale: 1 }
        }
        transition={{ duration: 1.8, repeat: speaking ? Infinity : 0, ease: "easeInOut" }}
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
