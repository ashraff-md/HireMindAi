"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { HmCard } from "@/components/hm-card";
import { OAuthButtonsRow } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  createSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/client";
import { sanitizeInternalReturnPath } from "@/lib/sanitize-internal-path";
import { useAuthStore } from "@/stores/auth-store";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useAuthStore((s) => s.userId);
  const authReady = useAuthStore((s) => s.authReady);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const rawNext = searchParams.get("next");
  const returnPath = sanitizeInternalReturnPath(rawNext) ?? "/dashboard";

  const supabaseConfigured = isSupabaseBrowserConfigured();

  const safeNextRegister = sanitizeInternalReturnPath(rawNext);
  const registerHref = safeNextRegister
    ? `/register?next=${encodeURIComponent(safeNextRegister)}`
    : "/register";

  useEffect(() => {
    if (!authReady || !userId) return;
    router.replace(returnPath);
  }, [authReady, userId, router, returnPath]);

  if (authReady && userId) {
    return <LoginLoading />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase environment variables are not configured for this build.");
      return;
    }

    setLoading(true);
    const {
      data: { session },
      error: signErr,
    } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signErr) {
      setError(signErr.message);
      return;
    }

    if (!session?.user) {
      setError(
        "Signed in but no active session returned. Confirm your email if required, then try again.",
      );
      return;
    }

    useAuthStore
      .getState()
      .setAuth(session.user.id, session.user.email ?? null);
    useAuthStore.getState().setAuthReady(true);
    router.replace(returnPath);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <HmCard className="gap-6 p-6">
        <CardHeader className="justify-items-center pb-1 text-center">
          <CardTitle className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Sign in
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!supabaseConfigured ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-50">
              Add <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (or{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
              ) to <code className="text-xs">frontend/.env.local</code>, or{" "}
              <Link href="/interview/setup" className="font-medium underline-offset-4 hover:underline">
                continue as a guest → interview setup
              </Link>
              .
            </p>
          ) : null}
          <OAuthButtonsRow disabled={loading} redirectPath={returnPath} />
          <div className="flex items-center gap-3 py-5">
            <Separator className="flex-1" />
            <span className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Or continue with email
            </span>
            <Separator className="flex-1" />
          </div>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Continue"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href={registerHref} className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </HmCard>
    </div>
  );
}

function LoginLoading() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse">
      <HmCard className="gap-6 p-6">
        <CardHeader className="justify-items-center pb-4 text-center">
          <CardTitle className="font-display text-2xl">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[200px]" />
      </HmCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
