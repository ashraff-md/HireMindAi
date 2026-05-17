"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { hydratePlanFromSupabase } from "@/lib/plan-hydration";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export default function PaymentCompletePage() {
  const userId = useAuthStore((s) => s.userId);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    if (!authReady || !userId) return;
    void hydratePlanFromSupabase(userId);
  }, [authReady, userId]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 py-16">
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Payment complete</h1>
        <p className="text-muted-foreground">
          When a payment gateway is connected, this page will confirm checkout and refresh your plan.
          Until then, you can use the app as usual — premium features follow your account&apos;s{" "}
          <code className="text-xs">plan_type</code> in Supabase.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className={cn(buttonVariants(), "rounded-xl")}>
          Go to dashboard
        </Link>
        <Link
          href="/upgrade"
          className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}
        >
          Check plan status
        </Link>
      </div>
    </div>
  );
}
