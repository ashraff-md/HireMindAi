"use client";

import { motion } from "framer-motion";

export function AmbientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -left-[15%] top-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--hm-neon-from),transparent_68%)] opacity-35 blur-3xl dark:opacity-45"
        animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[8%] h-80 w-80 rounded-full bg-[radial-gradient(circle,var(--hm-neon-to),transparent_68%)] opacity-30 blur-3xl dark:opacity-42"
        animate={{ x: [0, -20, 0], y: [0, 22, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[35%] top-[55%] h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--hm-neon-via),transparent_65%)] opacity-25 blur-3xl dark:opacity-38"
        animate={{ scale: [1, 1.12, 1], opacity: [0.22, 0.38, 0.22] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
