import type * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Glass neon panel shared across HireMind surfaces. */
export function HmCard({
  className,
  ...props
}: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn(
        "border-border/80 bg-card/80 shadow-xl backdrop-blur-xl hm-ring-glow dark:bg-card/70 dark:border-white/12",
        className,
      )}
      {...props}
    />
  );
}
