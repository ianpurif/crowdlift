"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Copy, Loader2, Radio, ShieldCheck, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { stroopsToXlm, truncateAddress } from "@/lib/stellar";
import type { DonationEvent } from "@/types";

interface SupporterDashboardProps {
  contributionStroops: number;
  totalRaisedStroops: number;
  goalStroops: number;
  events: DonationEvent[];
  isLoading: boolean;
}

export default function SupporterDashboard({ contributionStroops, totalRaisedStroops, goalStroops, events, isLoading }: SupporterDashboardProps) {
  const { address, balance, isConnected, isConnecting, walletName, connect } = useWallet();
  const [copied, setCopied] = useState(false);
  const contribution = stroopsToXlm(contributionStroops);
  const totalRaised = stroopsToXlm(totalRaisedStroops);
  const goal = stroopsToXlm(goalStroops);
  const share = totalRaised > 0 ? (contribution / totalRaised) * 100 : 0;
  const personalEvents = useMemo(() => events.filter((event) => event.donor === address), [address, events]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="dashboard" className="dashboard-section" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div><p className="eyebrow">Supporter workspace</p><h2 id="dashboard-title">Your CrowdLift</h2></div>
        <p>A focused view of your wallet, campaign position, and confirmed support—without pretending Testnet activity is real financial value.</p>
      </div>

      {!isConnected ? (
        <div className="dashboard-gate">
          <div className="gate-icon"><Wallet size={25} /></div>
          <div><h3>Connect to see your support record</h3><p>CrowdLift reads the public contribution total associated with your Stellar account. No password or custody required.</p></div>
          <button className="button-primary" type="button" onClick={connect} disabled={isConnecting}>
            {isConnecting ? <><Loader2 size={16} className="animate-spin" /> Connecting…</> : <>Connect wallet <ArrowUpRight size={16} /></>}
          </button>
        </div>
      ) : (
        <div className="dashboard-layout">
          <div className="dashboard-main">
            <div className="metric-row">
              <div><span>Wallet balance</span><strong>{Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>XLM</small></strong><p>Stellar Testnet balance</p></div>
              <div><span>Your support</span><strong>{contribution.toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>XLM</small></strong><p>{share.toFixed(1)}% of current funding</p></div>
              <div><span>Confirmations</span><strong>{personalEvents.length}</strong><p>Events in this session window</p></div>
            </div>

            <div className="dashboard-block">
              <div className="block-heading"><div><span>Campaign position</span><h3>CrowdLift Community Fund</h3></div><a href="#campaign">View campaign <ArrowUpRight size={14} /></a></div>
              <div className="position-bar"><span style={{ width: `${goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0}%` }} /></div>
              <dl className="position-details">
                <div><dt>Campaign raised</dt><dd>{isLoading ? "—" : `${totalRaised.toFixed(2)} XLM`}</dd></div>
                <div><dt>Funding goal</dt><dd>{isLoading ? "—" : `${goal.toFixed(0)} XLM`}</dd></div>
                <div><dt>Your on-chain total</dt><dd>{contribution.toFixed(2)} XLM</dd></div>
              </dl>
            </div>

            <div className="dashboard-block personal-activity">
              <div className="block-heading"><div><span>Account activity</span><h3>Your recent confirmations</h3></div></div>
              {personalEvents.length === 0 ? <p className="personal-empty">No contribution event from this wallet is present in the current ledger window.</p> : (
                <ul>{personalEvents.slice(0, 4).map((event) => <li key={event.id}><span><Check size={13} /> Confirmed</span><time>{new Date(event.timestamp).toLocaleDateString()}</time><strong>{stroopsToXlm(event.amount).toFixed(2)} XLM</strong></li>)}</ul>
              )}
            </div>
          </div>

          <aside className="account-panel">
            <p className="eyebrow">Connected account</p>
            <div className="account-avatar">{address.slice(0, 2)}</div>
            <h3>{walletName || "Stellar wallet"}</h3>
            <p className="account-address">{truncateAddress(address)}</p>
            <button type="button" onClick={copyAddress}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy full address"}</button>
            <a href={`https://stellar.expert/explorer/testnet/account/${address}`} target="_blank" rel="noreferrer">Open account in explorer <ArrowUpRight size={14} /></a>
            <div className="account-divider" />
            <div className="account-safety"><ShieldCheck size={18} /><span><strong>Non-custodial access</strong>CrowdLift reads your public account and asks your wallet to sign.</span></div>
            <div className="account-safety"><Radio size={18} /><span><strong>Testnet connected</strong>Assets shown here have no real-world value.</span></div>
          </aside>
        </div>
      )}

      <a className="back-to-campaign" href="#campaign">Back to campaign <ArrowDown size={14} /></a>
    </section>
  );
}
