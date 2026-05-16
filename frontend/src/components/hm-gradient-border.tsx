import type * as React from "react";

import { cn } from "@/lib/utils";

/** 1px luminous gradient ring via padded gradient background. */
export function HmGradientBorder({
  className,
  children,
  rounded = "rounded-3xl",
}: {
  className?: string;
  children: React.ReactNode;
  rounded?: string;
}) {
  return (
    <div
      className={cn(
        "p-[1px]",
        rounded,
        "bg-[linear-gradient(135deg,var(--hm-neon-from),var(--hm-neon-via)_45%,var(--hm-neon-to))]",
        className,
      )}
    >
      <div className={cn("bg-background/92 backdrop-blur-xl dark:bg-background/88", rounded)}>
        {children}
      </div>
    </div>
  );
}
