"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import WalletButton from "@/components/WalletButton";

const links = [
  { href: "/campaigns", label: "Campaigns" },
  { href: "/campaigns/new", label: "Start a campaign" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function AppHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (href: string) => href === "/campaigns"
    ? pathname.startsWith("/campaigns") && pathname !== "/campaigns/new"
    : href === "/dashboard" ? pathname.startsWith("/dashboard") : pathname === href;

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="shell site-header-inner">
        <Link href="/" className="brand-link" aria-label="CrowdLift home"><BrandMark /></Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>{link.label}</Link>)}
        </nav>
        <div className="header-actions">
          <WalletButton />
          <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-controls="mobile-navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav shell" aria-label="Mobile navigation">{links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>)}</nav>}
    </header>
  );
}
