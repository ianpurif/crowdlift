"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, X, XCircle } from "lucide-react";
import { getStellarExpertTxUrl } from "@/lib/stellar";

export type ToastType = "success" | "error" | "info" | "loading";
export interface ToastItem { id: string; type: ToastType; title: string; message: string; txHash?: string; duration?: number; }
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
  const dismissToast = useCallback((id: string) => setToasts((current) => current.filter((item) => item.id !== id)), []);
  const showToast = useCallback(({ type, title, message, txHash, duration = 4000 }: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [...current, { id, type, title, message, txHash, duration }]);
    if (type !== "loading" && duration > 0) window.setTimeout(() => dismissToast(id), duration);
    return id;
  }, [dismissToast]);

  const toast = useMemo(() => ({
    success: (title: string, message = "", txHash?: string) => showToast({ type: "success", title, message, txHash, duration: 5000 }),
    error: (title: string, message = "") => showToast({ type: "error", title, message, duration: 6000 }),
    info: (title: string, message = "") => showToast({ type: "info", title, message, duration: 4000 }),
    loading: (title: string, message = "") => showToast({ type: "loading", title, message, duration: 0 }),
  }), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, toast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        {toasts.map((item) => (
          <div className={`toast-item toast-${item.type}`} key={item.id} role={item.type === "error" ? "alert" : "status"}>
            <span className="toast-icon">{item.type === "success" ? <CheckCircle2 /> : item.type === "error" ? <XCircle /> : item.type === "loading" ? <Loader2 className="animate-spin" /> : <AlertCircle />}</span>
            <div><strong>{item.title}</strong>{item.message && <p>{item.message}</p>}{item.txHash && <a href={getStellarExpertTxUrl(item.txHash)} target="_blank" rel="noreferrer">View transaction <ExternalLink size={12} /></a>}</div>
            <button type="button" onClick={() => dismissToast(item.id)} aria-label={`Dismiss ${item.title}`}><X size={15} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
