"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { PlanTier } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";

/** After a missing-table / REST 404, skip further plan reads until tab session ends or DB is fixed. */
const USERS_PLAN_BLOCK = "hm_block_users_plan";

function usersTableLikelyMissing(error: {
  code?: string;
  message?: string;
  status?: number;
}): boolean {
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  const st = error.status;

  return (
    code === "PGRST205" ||
    st === 404 ||
    msg.includes("schema cache") ||
    (msg.includes("relation") && msg.includes("does not exist")) ||
    (msg.includes("404") && msg.includes("not found"))
  );
}

export async function hydratePlanFromSupabase(userId: string): Promise<void> {
  if (
    typeof window !== "undefined" &&
    sessionStorage.getItem(USERS_PLAN_BLOCK) === "1"
  ) {
    return;
  }

  const sb = createSupabaseBrowserClient();
  if (!sb) return;

  const { data, error } = await sb
    .from("users")
    .select("plan_type")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (usersTableLikelyMissing(error)) {
      sessionStorage.setItem(USERS_PLAN_BLOCK, "1");
    }
    return;
  }

  sessionStorage.removeItem(USERS_PLAN_BLOCK);

  if (!data) return;

  const pt = data.plan_type as string | undefined;
  if (pt === "premium" || pt === "free") {
    useAuthStore.getState().setPlan(pt as PlanTier);
  }
}
