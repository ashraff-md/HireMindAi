"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Mic2,
  User,
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
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const nav: Array<{ href: string; label: string; icon: LucideIcon; hash?: string }> =
  [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/interview/setup", label: "Interview", icon: Mic2 },
    { href: "/profile", label: "Profile", icon: User },
    {
      href: "/dashboard",
      label: "Reports",
      icon: BarChart3,
      hash: "#analytics",
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

function NavLinks({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const hash = useRouteHash();

  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon, hash: hrefHash }) => {
        let active = false;
        if (href === "/dashboard" && hrefHash === "#analytics") {
          active = pathname === "/dashboard" && hash === "#analytics";
        } else if (href === "/dashboard") {
          active = pathname === "/dashboard" && hash !== "#analytics";
        } else {
          active = pathname === href;
        }

        return (
          <Link
            key={`${href}-${hrefHash ?? ""}`}
            href={hrefHash ? `${href}${hrefHash}` : href}
            onClick={() => onItemClick?.()}
            className={cn(
              buttonVariants({
                variant: active ? "secondary" : "ghost",
                size: "sm",
              }),
              "justify-start gap-2",
            )}
          >
            <Icon className="size-4 opacity-80" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const email = useAuthStore((s) => s.email);
  const plan = useAuthStore((s) => s.plan);
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

  return (
    <div className="flex min-h-[calc(100dvh-0px)] flex-1 flex-col md:flex-row">
      <aside className="relative hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 px-3 py-6 backdrop-blur-xl md:flex">
        <Link
          href="/dashboard"
          className="mb-8 px-2 font-display text-lg font-semibold tracking-tight"
        >
          HireMind<span className="hm-text-neon"> AI</span>
        </Link>
        <NavLinks />
        <div className="mt-auto space-y-3 border-t border-sidebar-border pt-6">
          <div className="px-2 text-xs text-muted-foreground">
            <p className="truncate font-medium text-foreground">{email ?? "Guest"}</p>
            <p className="uppercase">{plan}</p>
          </div>
          <div className="flex items-center gap-2 px-1">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              type="button"
              onClick={() => void logout()}
            >
              <LogOut className="mr-1 size-3.5 shrink-0" />
              Log out
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-background/75 px-4 py-3 backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-sm md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger>
              <Button variant="outline" size="icon-sm" type="button">
                <Menu className="size-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100vw-2rem,320px)] gap-0 border-white/10 bg-sidebar p-0"
            >
              <SheetHeader className="border-b border-sidebar-border p-4 text-left">
                <SheetTitle className="font-display text-lg">Navigate</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <NavLinks onItemClick={() => setMobileOpen(false)} />
              </div>
              <div className="border-t border-sidebar-border p-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => void logout()}
                >
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="font-display text-base font-semibold">
            HireMind<span className="hm-text-neon"> AI</span>
          </Link>
          <ThemeToggle />
        </div>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
