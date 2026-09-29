"use client";

import { create } from "zustand";

type Toast = { id: string; message: string; tone: "success" | "error" | "info" };

type UiState = {
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  pushToast: (message, tone = "info") =>
    set((s) => {
      const id = Math.random().toString(36).slice(2);
      setTimeout(() => {
        set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) }));
      }, 4500);
      return { toasts: [{ id, message, tone }, ...s.toasts].slice(0, 4) };
    }),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
