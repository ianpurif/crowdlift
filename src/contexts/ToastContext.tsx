"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getStellarExpertTxUrl } from "@/lib/stellar";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  X,
} from "lucide-react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  txHash?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => string;
  dismissToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string, txHash?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    loading: (title: string, message?: string) => string;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, txHash, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newToast: ToastItem = { id, type, title, message, txHash, duration };

      setToasts((prev) => [...prev, newToast]);

      if (type !== "loading" && duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = {
    success: (title: string, message = "", txHash?: string) =>
      showToast({ type: "success", title, message, txHash, duration: 5000 }),
    error: (title: string, message = "") =>
      showToast({ type: "error", title, message, duration: 6000 }),
    info: (title: string, message = "") =>
      showToast({ type: "info", title, message, duration: 4000 }),
    loading: (title: string, message = "") =>
      showToast({ type: "loading", title, message, duration: 0 }),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all animate-fade-in-up ${
              t.type === "success"
                ? "bg-white border-[#16A34A]/40 text-[#0F172A]"
                : t.type === "error"
                  ? "bg-white border-[#DC2626]/40 text-[#0F172A]"
                  : t.type === "loading"
                    ? "bg-white border-[#2563EB]/40 text-[#0F172A]"
                    : "bg-white border-[#E2E8F0] text-[#0F172A]"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Toast Icon */}
              <div className="mt-0.5 shrink-0">
                {t.type === "success" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16A34A]/10 text-[#16A34A]">
                    <CheckCircle2 size={18} />
                  </div>
                )}
                {t.type === "error" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#DC2626]/10 text-[#DC2626]">
                    <XCircle size={18} />
                  </div>
                )}
                {t.type === "loading" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <Loader2 size={18} className="animate-spin" />
                  </div>
                )}
                {t.type === "info" && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
                    <AlertCircle size={18} />
                  </div>
                )}
              </div>

              {/* Toast Content */}
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#0F172A]">{t.title}</h4>
                {t.message && (
                  <p className="mt-0.5 text-xs text-[#64748B] leading-relaxed">
                    {t.message}
                  </p>
                )}

                {/* Optional Explorer Link */}
                {t.txHash && (
                  <div className="mt-2">
                    <a
                      href={getStellarExpertTxUrl(t.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2563EB] hover:underline"
                    >
                      <span>View on Stellar Expert</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => dismissToast(t.id)}
                className="text-[#64748B] hover:text-[#0F172A] p-0.5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
