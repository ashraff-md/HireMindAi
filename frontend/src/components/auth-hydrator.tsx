"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

async function hydratePlan(userId: string) {
  const sb = createSupabaseBrowserClient();
  if (!sb) return;

  const { data, error } = await sb
    .from("users")
    .select("plan_type")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    const code = error.code ?? "";
    const msg = (error.message ?? "").toLowerCase();
    if (code === "PGRST205" || msg.includes("schema cache")) {
      return;
    }
    return;
  }

  if (!data) return;

  const pt = data.plan_type as string | undefined;
  if (pt === "premium" || pt === "free") {
    useAuthStore.getState().setPlan(pt);
  }
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
    void hydratePlan(userId);
  }, [authReady, userId]);

  return null;
}
