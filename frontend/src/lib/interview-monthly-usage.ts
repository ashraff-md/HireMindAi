"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

export type InterviewMonthlyUsage = {
  plan: string;
  usedThisUtcMonth: number;
  freeMonthlyLimit: number;
  remainingFreeThisMonth: number | null;
};

export async function fetchInterviewMonthlyUsage(): Promise<InterviewMonthlyUsage | null> {
  const sb = createSupabaseBrowserClient();
  if (!sb) {
    return null;
  }
  const { data: sess } = await sb.auth.getSession();
  const tok = sess.session?.access_token;
  if (!tok) {
    return null;
  }
  const base = apiBase();
  const path = "/api/interview/monthly-usage";
  const url = base ? `${base}${path}` : path;
  const res = await fetch(url, {
    headers: { authorization: `Bearer ${tok}` },
  });
  if (!res.ok) {
    return null;
  }
  return (await res.json()) as InterviewMonthlyUsage;
}
