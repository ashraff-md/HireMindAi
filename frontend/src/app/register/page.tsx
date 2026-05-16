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

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const sb = createSupabaseBrowserClient();
    if (!sb) {
      setError("Supabase is not configured. Add public URL + anon key first.");
      return;
    }

    setLoading(true);
    const { data, error: signErr } = await sb.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signErr) {
      setError(signErr.message);
      return;
    }

    if (data.session?.user) {
      useAuthStore.getState().setAuth(
        data.session.user.id,
        data.session.user.email ?? null,
      );
      useAuthStore.getState().setAuthReady(true);
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setInfo(
      "Check your email to confirm this address, then return here to sign in.",
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <HmCard className="gap-6 p-6">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Signing up provisions a real <code className="text-xs">user id</code>{" "}
            for live interview APIs (see database trigger on{" "}
            <code className="text-xs">public.users</code>).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!supabaseConfigured ? (
            <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">
              Configure Supabase keys in{" "}
              <code className="text-xs">frontend/.env.local</code> before
              registering.
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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            {info ? (
              <p className="text-sm text-muted-foreground" role="status">
                {info}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </HmCard>
    </div>
  );
}
