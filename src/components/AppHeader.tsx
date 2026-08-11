"use client";

import BrandMark from "@/components/BrandMark";
import WalletButton from "@/components/WalletButton";

export default function AppHeader() {
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <a href="#top" className="brand-link" aria-label="CrowdLift home">
          <BrandMark />
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#campaign">Discover</a>
          <a href="#how-it-works">How it works</a>
          <a href="#activity">Activity</a>
          <a href="#dashboard">Dashboard</a>
        </nav>
        <div className="header-actions">
          <span className="network-label"><i /> Stellar Testnet</span>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
