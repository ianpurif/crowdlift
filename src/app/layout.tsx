import type { Metadata } from "next";
import "./globals.css";
import { WalletProviderWrapper } from "./providers";

export const metadata: Metadata = {
  title: "CrowdLift — Stellar Crowdfunding",
  description:
    "A decentralized crowdfunding platform built on Stellar Testnet. Support community projects with XLM donations.",
  keywords: ["Stellar", "crowdfunding", "Soroban", "XLM", "blockchain", "dApp"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </body>
    </html>
  );
}
