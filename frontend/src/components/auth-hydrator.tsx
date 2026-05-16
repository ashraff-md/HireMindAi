"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
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

/** Serialize hydrates: avoids parallel / Strict Mode duplicate fetches before sessionStorage is set. */
let hydrateChain: Promise<void> = Promise.resolve();

async function hydratePlan(userId: string) {
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
    useAuthStore.getState().setPlan(pt);
  }
}

function queueHydratePlan(userId: string) {
  hydrateChain = hydrateChain
    .then(() => hydratePlan(userId))
    .catch(() => undefined);
}

/** Keeps Zustand auth slice aligned with Supabase session on the client. */
export function AuthHydrator() {
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      useAuthStore.getState().setAuthReady(true);
      return;
    }

    const applySession = (session: Session | null) => {
      useAuthStore.getState().setAuth(
        session?.user.id ?? null,
        session?.user.email ?? null,
      );
      useAuthStore.getState().setAuthReady(true);
    };

    void sb.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const userId = useAuthStore((s) => s.userId);
  const authReady = useAuthStore((s) => s.authReady);

  useEffect(() => {
    if (!authReady || !userId) {
      return;
    }
    queueHydratePlan(userId);
  }, [authReady, userId]);

  return null;
}
