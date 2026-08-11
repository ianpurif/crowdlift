import type { Metadata } from "next";
import "./globals.css";
import { WalletProviderWrapper } from "./providers";

export const metadata: Metadata = {
  title: "CrowdLift — Transparent crowdfunding on Stellar",
  description: "Fund community-led ideas with transparent, on-chain contributions on Stellar Testnet.",
  keywords: ["Stellar", "crowdfunding", "Soroban", "XLM", "blockchain", "dApp"],
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><WalletProviderWrapper>{children}</WalletProviderWrapper></body>
    </html>
  );
}
