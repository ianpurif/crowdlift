"use client";

import { WalletProvider } from "@/contexts/WalletContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { ReactNode } from "react";

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <WalletProvider>{children}</WalletProvider>
    </ToastProvider>
  );
}
