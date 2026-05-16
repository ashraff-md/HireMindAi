"use client";

import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

/** Keeps Zustand auth slice aligned with Supabase session on the client. */
export function AuthHydrator() {
  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    if (!sb) {
      useAuthStore.getState().setAuthReady(true);
      return;
    }

    void sb.auth.getSession().then(({ data: { session } }) => {
      useAuthStore.getState().setAuth(
        session?.user.id ?? null,
        session?.user.email ?? null,
      );
      useAuthStore.getState().setAuthReady(true);
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setAuth(
        session?.user.id ?? null,
        session?.user.email ?? null,
      );
      useAuthStore.getState().setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
