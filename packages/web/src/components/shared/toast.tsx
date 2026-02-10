"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "default" | "success" | "error";

export type Toast = {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
};

type ToastInput = Omit<Toast, "id"> & { durationMs?: number };

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return value;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();
    const durationMs = toast.durationMs ?? 3500;

    setToasts((prev) => [...prev, { id, title: toast.title, message: toast.message, variant: toast.variant }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, []);

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  );
}

function variantClasses(variant: ToastVariant): { shell: string; title: string } {
  switch (variant) {
    case "success":
      return { shell: "border-emerald-500/30 bg-emerald-500/10", title: "text-emerald-100" };
    case "error":
      return { shell: "border-rose-500/30 bg-rose-500/10", title: "text-rose-100" };
    default:
      return { shell: "border-neutral-800 bg-neutral-950/90", title: "text-white" };
  }
}

function Toaster({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] px-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-end gap-2">
        {toasts.map((t) => {
          const classes = variantClasses(t.variant);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto w-full sm:w-[420px] rounded-2xl border ${classes.shell} p-4 shadow-lg backdrop-blur`}
              role="status"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${classes.title}`}>{t.title}</p>
                  {t.message && <p className="mt-1 text-xs text-neutral-300">{t.message}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => onDismiss(t.id)}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-1 text-xs text-neutral-200 hover:border-neutral-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

