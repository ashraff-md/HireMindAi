"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  HelpCircle,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { displayNameFromEmail } from "@/lib/display-name";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

type NavCtx = { pathname: string; hash: string };

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  hash?: string;
  isActive: (ctx: NavCtx) => boolean;
};

const SIDEBAR_NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    isActive: ({ pathname, hash }) =>
      pathname === "/dashboard" && hash !== "#recent-interviews",
  },
  {
    label: "Interviews",
    href: "/interview/setup",
    icon: Mic2,
    isActive: ({ pathname }) => pathname.startsWith("/interview"),
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    isActive: ({ pathname }) => pathname === "/analytics",
  },
  {
    label: "History",
    href: "/dashboard",
    hash: "#recent-interviews",
    icon: History,
    isActive: ({ pathname, hash }) => pathname === "/dashboard" && hash === "#recent-interviews",
  },
  {
    label: "Settings",
    href: "/profile",
    icon: Settings,
    isActive: ({ pathname }) => pathname === "/profile",
  },
];

function useRouteHash() {
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return hash;
}

function SidebarProfileChip() {
  const email = useAuthStore((s) => s.email);
  const plan = useAuthStore((s) => s.plan);

  const name = displayNameFromEmail(email);
  const initials = (() => {
    const words = name.split(/\s+/).filter(Boolean);
    if (!email) return name.slice(0, 2).toUpperCase();
    if (words.length >= 2) {
      return `${words[0]?.[0] ?? ""}${words[words.length - 1]?.[0] ?? ""}`.toUpperCase();
    }
    return words[0]?.slice(0, 2).toUpperCase() ?? "?";
  })();

  return (
    <div className="mb-8 flex gap-3 rounded-2xl border border-sidebar-border/80 bg-sidebar-accent/50 px-3 py-3">
      <div
        aria-hidden
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--hm-neon-from)] to-[var(--hm-neon-to)] text-xs font-semibold uppercase text-white shadow-lg shadow-purple-950/35"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display font-semibold leading-tight">{name}</p>
        <p className="truncate text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/55">
          {plan === "premium" ? "Premium member" : "Free member"}
        </p>
      </div>
    </div>
  );
}

function NavLinks({
  onItemClick,
  ctx,
}: {
  onItemClick?: () => void;
  ctx: NavCtx;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {SIDEBAR_NAV.map(({ label, href, icon: Icon, hash: hrefHash, isActive }) => {
        const active = isActive(ctx);
        const to = hrefHash ? `${href}${hrefHash}` : href;

        return (
          <Link
            key={`${href}-${hrefHash ?? "-"}`}
            href={to}
            onClick={() => onItemClick?.()}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium tracking-tight transition-colors",
              active
                ? "border-l-[3px] border-l-primary bg-primary/12 py-2.5 pl-[9px] text-sidebar-accent-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] dark:border-l-[var(--hm-neon-from)] dark:bg-purple-600/22 dark:text-sidebar-accent-foreground"
                : "border-l-[3px] border-l-transparent py-2.5 pl-[9px] text-sidebar-foreground/70 hover:bg-sidebar-accent/85 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0 opacity-85" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarExtras({ onLogout }: { onLogout: () => void }) {
  return (
    <div className={cn("mt-auto space-y-3 border-t border-sidebar-border pt-6")}>
      <Link
        href="/interview/setup"
        className={cn(
          buttonVariants({ size: "default" }),
          "flex h-11 w-full rounded-xl items-center justify-center border-0 bg-gradient-to-r from-[var(--hm-neon-from)] to-[var(--hm-neon-to)] text-[15px] font-semibold text-primary-foreground shadow-[0_0_48px_-16px_var(--hm-glow-mid)] hover:opacity-[0.94]",
        )}
      >
        Start Interview
      </Link>
      <Link
        href="/#about"
        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      >
        <HelpCircle className="size-4 opacity-85" aria-hidden />
        Help
      </Link>
      <div className="flex items-center gap-2 pt-2">
        <ThemeToggle />
        <Button variant="outline" size="sm" className="flex-1 rounded-xl gap-2" type="button" onClick={onLogout}>
          <LogOut className="size-3.5 shrink-0" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hash = useRouteHash();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    const sb = createSupabaseBrowserClient();
    if (sb) {
      await sb.auth.signOut();
    }
    useAuthStore.getState().signOutLocal();
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  }

  const navCtx: NavCtx = { pathname, hash };

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="relative hidden w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 backdrop-blur-xl md:flex">
        <Link
          href="/dashboard"
          className="mb-6 px-1 font-display text-lg font-semibold tracking-tight text-sidebar-foreground"
        >
          HireMind<span className="hm-text-neon"> AI</span>
        </Link>
        <SidebarProfileChip />
        <NavLinks ctx={navCtx} />
        <SidebarExtras onLogout={() => void logout()} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-background/75 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-sm md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={<Button variant="outline" size="icon-sm" type="button" />}>
              <Menu className="size-4" />
              <span className="sr-only">Open navigation</span>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex w-[min(100vw-2rem,300px)] flex-col gap-0 border-white/10 bg-sidebar p-0"
            >
              <SheetHeader className="border-b border-sidebar-border p-4 text-left">
                <SheetTitle className="font-display text-lg">Navigate</SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col gap-0 overflow-y-auto p-4">
                <SidebarProfileChip />
                <NavLinks ctx={navCtx} onItemClick={() => setMobileOpen(false)} />
              </div>
              <div className="shrink-0 border-t border-sidebar-border p-4 pb-6">
                <SidebarExtras onLogout={() => void logout()} />
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="font-display text-base font-semibold">
            HireMind<span className="hm-text-neon"> AI</span>
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
