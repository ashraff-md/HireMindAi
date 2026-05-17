import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 py-16">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Checkout canceled</h1>
        <p className="text-muted-foreground">
          You left the payment flow. When online checkout is available, you can retry from Upgrade.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/upgrade" className={cn(buttonVariants(), "rounded-xl")}>
          Back to upgrade
        </Link>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
