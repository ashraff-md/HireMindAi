"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { HmCard } from "@/components/hm-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export default function UpgradePage() {
  const router = useRouter();
  const authReady = useAuthStore((s) => s.authReady);
  const userId = useAuthStore((s) => s.userId);
  const plan = useAuthStore((s) => s.plan);

  useEffect(() => {
    if (!authReady) return;
    if (!userId && isSupabaseBrowserConfigured()) {
      router.replace(`/login?next=${encodeURIComponent("/upgrade")}`);
    }
  }, [authReady, userId, router]);

  if (!authReady || !userId) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-6 py-16">
        <p className="text-center text-muted-foreground">Checking session…</p>
      </div>
    );
  }

  if (plan === "premium") {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-12">
        <HmCard className="gap-6 p-8">
          <CardHeader className="p-0">
            <Badge variant="secondary" className="w-fit rounded-full">
              Premium
            </Badge>
            <CardTitle className="font-display text-2xl">You are on Premium</CardTitle>
            <CardDescription>
              Resume upload, extended interviews, and history are unlocked for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }), "inline-flex rounded-xl")}
            >
              Back to dashboard
            </Link>
          </CardContent>
        </HmCard>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 py-12">
      <HmCard className="gap-6 p-8">
        <CardHeader className="space-y-2 p-0">
          <CardTitle className="font-display text-2xl">Upgrade to Premium</CardTitle>
          <CardDescription>
            Online checkout is not wired yet — the payment gateway is <strong>to be implemented</strong>.
            When it ships, you will complete purchase here and your plan will update automatically after
            the payment provider confirms success.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="rounded-xl border border-border/80 bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Included in Premium</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Resume PDF upload and AI extraction</li>
              <li>Deeper interviews, more turns, extra personas</li>
              <li>History, recordings, analytics, and full feedback PDFs</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">
            For development, you can still set <code className="text-[11px]">plan_type</code> to{" "}
            <code className="text-[11px]">premium</code> on your user row in Supabase to try premium
            features.
          </p>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex h-9 w-full items-center justify-center rounded-xl",
            )}
          >
            Back to dashboard
          </Link>
        </CardContent>
      </HmCard>
    </div>
  );
}
