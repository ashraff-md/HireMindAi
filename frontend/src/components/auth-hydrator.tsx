"use client";

import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hydratePlanFromSupabase } from "@/lib/plan-hydration";
import { useAuthStore } from "@/stores/auth-store";

/** Serialize hydrates: avoids parallel / Strict Mode duplicate fetches before sessionStorage is set. */
let hydrateChain: Promise<void> = Promise.resolve();

function queueHydratePlan(userId: string) {
  hydrateChain = hydrateChain
    .then(() => hydratePlanFromSupabase(userId))
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
