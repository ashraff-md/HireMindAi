"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProfileSlice = {
  name: string;
  skills: string;
  education: string;
  targetRole: string;
  patch: (p: Partial<Omit<ProfileSlice, "patch">>) => void;
};

export const useProfileStore = create<ProfileSlice>()(
  persist(
    (set) => ({
      name: "",
      skills: "",
      education: "",
      targetRole: "",
      patch: (p) => set((s) => ({ ...s, ...p })),
    }),
    {
      name: "hiremind-profile-v1",
      partialize: (s) => ({
        name: s.name,
        skills: s.skills,
        education: s.education,
        targetRole: s.targetRole,
      }),
    },
  ),
);
