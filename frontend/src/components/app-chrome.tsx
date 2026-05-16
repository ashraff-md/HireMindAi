"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { SiteFooter } from "@/components/site-footer";

function isMarketingRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (isMarketingRoute(pathname)) {
    return (
      <>
        <MarketingNavbar />
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">
          {children}
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppShell>{children}</AppShell>
      <SiteFooter />
    </div>
  );
}
