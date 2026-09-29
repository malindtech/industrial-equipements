"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { DemoRole } from "@/types/domain";

type RoleState = {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
};

const storage =
  typeof window !== "undefined"
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: "sales",
      setRole: (role) => set({ role }),
    }),
    { name: "equipment-demo-role", storage }
  )
);

export const roleLabels: Record<DemoRole, string> = {
  sales: "Sales",
  operations: "Operations",
  finance: "Finance",
};
