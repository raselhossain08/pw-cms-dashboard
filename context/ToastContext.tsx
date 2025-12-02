"use client";
import React from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "loading";
  duration?: number;
};

const ToastContext = React.createContext<
  | {
      toasts: Toast[];
      push: (t: Omit<Toast, "id">) => string;
      remove: (id: string) => void;
    }
  | undefined
>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const counterRef = React.useRef(0);

  function push(t: Omit<Toast, "id">) {
    counterRef.current += 1;
    const id = `t_${counterRef.current.toString(36)}`;
    setToasts((arr) => [...arr, { ...t, id }]);
    const autoDuration = t.type === "loading" ? 0 : t.duration ?? 4000;
    if (autoDuration > 0) setTimeout(() => remove(id), autoDuration);
    return id;
  }

  function remove(id: string) {
    setToasts((arr) => arr.filter((x) => x.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
