"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HmCard } from "@/components/hm-card";
import { OAuthButtonsRow } from "@/components/oauth-buttons";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase environment variables are not configured for this build.");
      return;
    }

    setLoading(true);
    const { error: signErr } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signErr) {
      setError(signErr.message);
      return;
    }

    const { data: sessionData } = await sb.auth.getSession();
    useAuthStore
      .getState()
      .setAuth(
        sessionData.session?.user.id ?? null,
        sessionData.session?.user.email ?? null,
      );
    useAuthStore.getState().setAuthReady(true);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <HmCard className="gap-6 p-6">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use Supabase email login. Guests can still run a full mock interview
            without an account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!supabaseConfigured ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-950 dark:text-amber-50">
              Add <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to{" "}
              <code className="text-xs">frontend/.env.local</code>, or continue
              as a guest from the landing page → interview.
            </p>
          ) : null}
          <OAuthButtonsRow disabled={loading} />
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
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </HmCard>
    </div>
  );
}
