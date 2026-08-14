import type { Metadata } from "next";
import AppHeader from "@/components/AppHeader";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";
import { WalletProviderWrapper } from "./providers";

export const metadata: Metadata = {
  title: "CrowdLift — Open crowdfunding on Stellar",
  description: "Create and support wallet-owned campaigns with public, on-chain funding records.",
  keywords: ["Stellar", "crowdfunding", "Soroban", "XLM", "blockchain"],
  icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><WalletProviderWrapper><a className="skip-link" href="#main-content">Skip to main content</a><AppHeader /><div id="main-content" tabIndex={-1}>{children}</div><SiteFooter /></WalletProviderWrapper></body>
    </html>
  );
}
