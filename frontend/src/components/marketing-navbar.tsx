"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { HmGradientBorder } from "@/components/hm-gradient-border";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

function AuthButtons() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const authReady = useAuthStore((s) => s.authReady);

  async function signOut() {
    const sb = createSupabaseBrowserClient();
    if (sb) {
      await sb.auth.signOut();
    }
    useAuthStore.getState().signOutLocal();
    router.push("/");
    router.refresh();
  }

  if (!authReady) {
    return (
      <>
        <div className="hidden h-8 w-[4.75rem] animate-pulse rounded-md bg-muted/60 sm:inline-block" aria-hidden />
        <div className="h-8 w-[6.75rem] animate-pulse rounded-xl bg-muted/60 md:w-[8.75rem]" aria-hidden />
      </>
    );
  }

  if (userId) {
    return (
      <>
        <Link
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hidden text-muted-foreground sm:inline-flex",
          )}
        >
          Dashboard
        </Link>
        <HmGradientBorder rounded="rounded-xl" className="inline-flex">
          <Button
            type="button"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-xl border-0 bg-gradient-to-r from-[#a855f7] to-[#3b82f6] px-5 text-white shadow-[0_0_32px_-14px_var(--hm-glow-mid)] hover:opacity-95",
            )}
            onClick={() => void signOut()}
          >
            Sign out
          </Button>
        </HmGradientBorder>
      </>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "hidden text-muted-foreground sm:inline-flex",
        )}
      >
        sign in
      </Link>
      <HmGradientBorder rounded="rounded-xl" className="inline-flex">
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-xl bg-gradient-to-r from-[#a855f7] to-[#3b82f6] px-5 text-white shadow-[0_0_32px_-14px_var(--hm-glow-mid)] hover:opacity-95",
          )}
        >
          Get Started
        </Link>
      </HmGradientBorder>
    </>
  );
}

export function MarketingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/65 backdrop-blur-2xl dark:bg-background/55">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        <Link href="/" className="justify-self-start font-display text-lg font-semibold tracking-tight">
          HireMind<span className="hm-text-neon"> AI</span>
        </Link>

        <nav className="hidden items-center justify-center gap-8 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 justify-self-end md:gap-3">
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
