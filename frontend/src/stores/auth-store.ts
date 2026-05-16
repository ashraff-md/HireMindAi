"use client";

import { create } from "zustand";

export type PlanTier = "free" | "premium";

export type AuthState = {
  userId: string | null;
  email: string | null;
  plan: PlanTier;
  /** False until first Supabase session probe completes (or instantly true without Supabase). */
  authReady: boolean;
  setAuth: (userId: string | null, email: string | null) => void;
  setPlan: (plan: PlanTier) => void;
  setAuthReady: (ready: boolean) => void;
  signOutLocal: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  email: null,
  plan: "free",
  authReady: false,
  setAuth: (userId, email) => set({ userId, email }),
  setPlan: (plan) => set({ plan }),
  setAuthReady: (authReady) => set({ authReady }),
  signOutLocal: () =>
    set({ userId: null, email: null, plan: "free", authReady: true }),
}));
