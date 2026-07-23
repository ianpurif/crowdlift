"use client";

import { WalletProvider } from "@/contexts/WalletContext";
import type { ReactNode } from "react";

export function WalletProviderWrapper({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
