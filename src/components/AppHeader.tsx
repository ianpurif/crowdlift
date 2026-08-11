"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import WalletButton from "@/components/WalletButton";

const links = [
  { href: "#campaign", label: "Discover" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#activity", label: "Activity" },
  { href: "#dashboard", label: "Dashboard" },
];

export default function AppHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <a href="#top" className="brand-link" aria-label="CrowdLift home"><BrandMark /></a>
        <nav className="desktop-nav" aria-label="Primary navigation">{links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}</nav>
        <div className="header-actions"><span className="network-label"><i /> Stellar Testnet</span><WalletButton /><button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
      {menuOpen && <nav className="mobile-nav shell" aria-label="Mobile navigation">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}</nav>}
    </header>
  );
}
