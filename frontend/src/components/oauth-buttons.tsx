"use client";

import type { SVGProps } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function GoogleGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GithubGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.72 1.26 3.38.96.11-.75.41-1.26.74-1.55-2.56-.29-5.26-1.28-5.26-5.71 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.91-.39c.99 0 1.98.13 2.91.39 2.21-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.12 3.06.75.8 1.19 1.83 1.19 3.09 0 4.45-2.7 5.41-5.28 5.69.42.36.79 1.08.79 2.18 0 1.57-.02 2.84-.02 3.23 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
      />
    </svg>
  );
}

function LinkedInGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

async function signIn(provider: "google" | "github" | "linkedin_oidc") {
  const sb = createSupabaseBrowserClient();
  if (!sb) {
    return;
  }

  await sb.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
}

export function OAuthButtonsRow({ disabled }: { disabled?: boolean }) {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
  const blocked = disabled || !configured;
  const configureHint = !configured ? "Configure OAuth in Supabase" : undefined;

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={blocked}
        title={blocked ? configureHint : undefined}
        onClick={() => void signIn("google")}
      >
        <GoogleGlyph className="size-4" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={blocked}
        title={blocked ? configureHint : undefined}
        onClick={() => void signIn("github")}
      >
        <GithubGlyph className="size-4" />
        GitHub
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2"
        disabled={blocked}
        title={blocked ? configureHint : undefined}
        onClick={() => void signIn("linkedin_oidc")}
      >
        <LinkedInGlyph className="size-4" />
        LinkedIn
      </Button>
    </div>
  );
}
