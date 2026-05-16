"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function HmGlowOrb({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "min-h-[280px] min-w-[280px]" : size === "md" ? "min-h-[180px] min-w-[180px]" : "min-h-[120px] min-w-[120px]";

  return (
    <motion.div
      aria-hidden
      className={cn(
        "pointer-events-none rounded-full opacity-70 blur-3xl",
        dim,
        "bg-[radial-gradient(circle_at_30%_30%,var(--hm-neon-from),transparent_62%),radial-gradient(circle_at_70%_70%,var(--hm-neon-to),transparent_58%)]",
        className,
      )}
      animate={{ scale: [1, 1.06, 1], opacity: [0.55, 0.75, 0.55] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
