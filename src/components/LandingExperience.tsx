import Link from "next/link";
import { ArrowRight, Check, Fingerprint, LockKeyhole, Radio, WalletCards } from "lucide-react";

export default function LandingExperience() {
  return (
    <main>
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Community capital, owned by communities</p>
            <h1 id="hero-title">Give good ideas <br />the lift they need.</h1>
            <p className="hero-deck">Create a campaign with your wallet, receive support directly, and keep every funding record publicly verifiable.</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/campaigns">Explore campaigns <ArrowRight size={16} /></Link>
              <Link className="text-link" href="/campaigns/new">Start your own <ArrowRight size={15} /></Link>
            </div>
            <div className="trust-line" aria-label="Platform assurances">
              <span><Check size={14} /> Wallet-owned</span><span><Check size={14} /> Direct settlement</span><span><Check size={14} /> Publicly verifiable</span>
            </div>
          </div>

          <div className="ownership-visual" aria-label="How a CrowdLift campaign works">
            <div className="ownership-top"><span>Your wallet</span><Fingerprint size={25} /></div>
            <div className="ownership-title"><small>Campaign identity</small><strong>You create it.<br />You own it.</strong></div>
            <div className="ownership-flow">
              <div><span>01</span><p>Publish campaign</p></div><i /><div><span>02</span><p>Receive support</p></div><i /><div><span>03</span><p>Manage on-chain</p></div>
            </div>
            <div className="ownership-bottom"><span>No platform custody</span><LockKeyhole size={18} /></div>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="CrowdLift product principles">
        <div className="shell proof-grid">
          <p>Built for clarity at every step</p>
          <div><WalletCards size={20} /><span><strong>Your wallet is your account</strong>No separate platform identity to maintain.</span></div>
          <div><LockKeyhole size={20} /><span><strong>Funds move directly</strong>Support flows from contributor to creator.</span></div>
          <div><Radio size={20} /><span><strong>Records stay public</strong>Campaign state lives in the contract.</span></div>
        </div>
      </section>

      <section className="process-section shell" aria-labelledby="process-title">
        <div className="section-intro"><p className="eyebrow">A shorter path from idea to impact</p><h2 id="process-title">Crowdfunding without the black box.</h2><p>CrowdLift replaces platform accounts and private campaign databases with wallet authorization and public contract state.</p></div>
        <ol className="process-list">
          <li><span>01</span><div><h3>Connect your wallet</h3><p>Your public wallet address becomes your campaign identity and management key.</p></div></li>
          <li><span>02</span><div><h3>Publish on-chain</h3><p>Campaign details, goals, ownership, and status are written to the registry contract.</p></div></li>
          <li><span>03</span><div><h3>Receive support directly</h3><p>Contributions are authorized by supporters and transferred to the creator wallet.</p></div></li>
        </ol>
      </section>

      <section className="home-cta"><div className="shell"><p className="eyebrow">Ready when you are</p><h2>Turn your idea into a public campaign.</h2><Link className="button-primary" href="/campaigns/new">Create a campaign <ArrowRight size={16} /></Link></div></section>
    </main>
  );
}
