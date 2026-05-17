"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Logged-in users go to checkout prep page; guests register then return to /upgrade. */
export function PremiumCtaLink({ children, className }: Props) {
  const userId = useAuthStore((s) => s.userId);
  const href = userId
    ? "/upgrade"
    : `/register?next=${encodeURIComponent("/upgrade")}`;

  return (
    <Link href={href} className={cn(className)}>
      {children}
    </Link>
  );
}
