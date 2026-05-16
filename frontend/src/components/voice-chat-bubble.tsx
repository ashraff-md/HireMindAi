"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function VoiceChatBubble({
  role,
  text,
}: {
  role: "ai" | "user";
  text: string;
}) {
  const ai = role === "ai";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className={cn(
        "flex w-full",
        ai ? "justify-start" : "justify-end",
      )}
    >
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed backdrop-blur-xl md:max-w-[78%]",
          "border shadow-lg hm-ring-glow",
          ai
            ? "rounded-bl-md border-[var(--hm-neon-from)]/25 bg-black/35 text-foreground dark:bg-black/55"
            : "rounded-br-md border-emerald-500/35 bg-emerald-500/[0.12] text-foreground dark:bg-emerald-500/10",
        )}
      >
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {ai ? "HireMind AI" : "You"}
        </div>
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </motion.div>
  );
}
