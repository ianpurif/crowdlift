import { ArrowDown, ArrowRight, Check, LockKeyhole, Radio, WalletCards } from "lucide-react";
import { stroopsToXlm } from "@/lib/stellar";

interface LandingExperienceProps {
  goalStroops: number;
  totalRaisedStroops: number;
  isLoading: boolean;
}

export default function LandingExperience({ goalStroops, totalRaisedStroops, isLoading }: LandingExperienceProps) {
  const goal = stroopsToXlm(goalStroops);
  const raised = stroopsToXlm(totalRaisedStroops);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <>
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Community capital, made visible</p>
            <h1 id="hero-title">Give good ideas<br />the lift they need.</h1>
            <p className="hero-deck">
              CrowdLift helps communities fund meaningful work with wallet-signed contributions and a public record on Stellar.
            </p>
            <div className="hero-actions">
              <a className="button-primary" href="#campaign">Explore the campaign <ArrowDown size={16} /></a>
              <a className="text-link" href="#how-it-works">See how it works <ArrowRight size={15} /></a>
            </div>
            <div className="trust-line" aria-label="Platform assurances">
              <span><Check size={14} /> Wallet-authorized</span>
              <span><Check size={14} /> Contract-recorded</span>
              <span><Check size={14} /> Publicly verifiable</span>
            </div>
          </div>

          <div className="funding-brief" aria-label="Featured campaign funding snapshot">
            <div className="funding-art" aria-hidden="true">
              <span className="art-orbit art-orbit-one" />
              <span className="art-orbit art-orbit-two" />
              <span className="art-core">CL</span>
              <span className="art-caption">Open source<br />moves us forward.</span>
            </div>
            <div className="funding-brief-body">
              <div className="brief-meta"><span>Featured campaign</span><span>Technology</span></div>
              <h2>CrowdLift Community Fund</h2>
              <div className="brief-progress" aria-label={`${progress.toFixed(0)}% funded`}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <div className="brief-totals">
                <div><strong>{isLoading ? "—" : raised.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong><small>XLM raised</small></div>
                <div><strong>{isLoading ? "—" : goal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong><small>XLM goal</small></div>
                <a href="#campaign" aria-label="Open featured campaign"><ArrowRight size={20} /></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="CrowdLift product principles">
        <div className="shell proof-grid">
          <p>Built for clarity at every step</p>
          <div><WalletCards size={20} /><span><strong>You stay in control</strong>Connect and approve from your wallet.</span></div>
          <div><LockKeyhole size={20} /><span><strong>Rules live in code</strong>Contributions call the campaign contract.</span></div>
          <div><Radio size={20} /><span><strong>Activity stays visible</strong>Donation events update from the ledger.</span></div>
        </div>
      </section>

      <section id="how-it-works" className="process-section shell" aria-labelledby="process-title">
        <div className="section-intro">
          <p className="eyebrow">A shorter path from intent to impact</p>
          <h2 id="process-title">Funding without the black box.</h2>
          <p>Every contribution follows a simple, inspectable route. No hidden hand-offs, and no ambiguous transaction status.</p>
        </div>
        <ol className="process-list">
          <li><span>01</span><div><h3>Choose your amount</h3><p>Review the campaign goal, progress, and public activity before committing.</p></div></li>
          <li><span>02</span><div><h3>Approve in your wallet</h3><p>The transaction is prepared for Stellar Testnet and requires your signature.</p></div></li>
          <li><span>03</span><div><h3>Verify on the ledger</h3><p>Confirmation includes a transaction reference you can inspect independently.</p></div></li>
        </ol>
      </section>

      <aside className="testnet-disclosure">
        <div className="shell">
          <strong>Testnet environment</strong>
          <p>CrowdLift currently demonstrates the complete contribution experience using Stellar Testnet XLM. Testnet assets have no real-world monetary value.</p>
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">Open network explorer <ArrowRight size={14} /></a>
        </div>
      </aside>
    </>
  );
}
