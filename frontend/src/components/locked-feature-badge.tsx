import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LockedFeatureBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border-[var(--hm-neon-from)]/45 bg-[var(--hm-neon-from)]/12 text-foreground backdrop-blur-md dark:bg-[var(--hm-neon-from)]/18",
        className,
      )}
    >
      <Lock className="size-3 text-[var(--hm-neon-from)]" />
      Premium
    </Badge>
  );
}
