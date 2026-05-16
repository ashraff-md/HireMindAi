"use client";

import Link from "next/link";

import { useAuthStore } from "@/stores/auth-store";

export function FooterAccountLinks() {
  const userId = useAuthStore((s) => s.userId);
  const authReady = useAuthStore((s) => s.authReady);

  if (!authReady) {
    return (
      <>
        <li className="h-5 w-20 animate-pulse rounded bg-muted/50" aria-hidden />
        <li className="h-5 w-24 animate-pulse rounded bg-muted/50" aria-hidden />
        <li className="h-5 w-16 animate-pulse rounded bg-muted/50" aria-hidden />
      </>
    );
  }

  if (userId) {
    return (
      <>
        <li>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/profile" className="hover:text-foreground">
            Profile
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link href="/login" className="hover:text-foreground">
          Login
        </Link>
      </li>
      <li>
        <Link href="/register" className="hover:text-foreground">
          Register
        </Link>
      </li>
      <li>
        <Link href="/profile" className="hover:text-foreground">
          Profile
        </Link>
      </li>
    </>
  );
}
