import { create } from "zustand";

type Toast = { id: number; message: string; tone: "success" | "error" };

type ToastStore = {
  toasts: Toast[];
  notify: (message: string, tone?: Toast["tone"]) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  notify: (message, tone = "success") => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    window.setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
    }, 3600);
  },
}));
