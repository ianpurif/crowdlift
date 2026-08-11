import { ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/BrandMark";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <BrandMark inverse />
          <p className="footer-note">Transparent crowdfunding powered by Soroban smart contracts on Stellar Testnet.</p>
        </div>
        <div className="footer-links" aria-label="Network resources">
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">
            Stellar Expert <ArrowUpRight size={14} />
          </a>
          <a href="https://developers.stellar.org/docs/build/smart-contracts" target="_blank" rel="noreferrer">
            Soroban documentation <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="footer-legal">
          <span>Testnet demonstration</span>
          <span>© {new Date().getFullYear()} CrowdLift</span>
        </div>
      </div>
    </footer>
  );
}
