import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><BrandMark inverse /><p className="footer-note">Wallet-owned campaigns with public funding records and direct settlement.</p></div>
        <div className="footer-links" aria-label="Product links">
          <Link href="/campaigns">Explore campaigns</Link>
          <Link href="/campaigns/new">Start a campaign</Link>
          <a href="https://stellar.expert/explorer" target="_blank" rel="noreferrer">Network explorer <ArrowUpRight size={14} /></a>
        </div>
        <div className="footer-legal"><span>Open, non-custodial funding</span><span>© {new Date().getFullYear()} CrowdLift</span></div>
      </div>
    </footer>
  );
}
