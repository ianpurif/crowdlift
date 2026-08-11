"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Loader2, Plus, Settings2, Wallet } from "lucide-react";
import CampaignListCard from "@/components/CampaignListCard";
import { useWallet } from "@/contexts/WalletContext";
import { getContribution } from "@/lib/contract";
import { getCreatorCampaigns } from "@/lib/registry";
import { stroopsToXlm, truncateAddress } from "@/lib/stellar";
import type { CampaignRecord } from "@/types";

export default function DashboardClient() {
  const { address, balance, isConnected, isConnecting, connect } = useWallet();
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [supported, setSupported] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!address) { setCampaigns([]); setSupported(0); return; }
    setLoading(true);
    setError("");
    try {
      const [owned, legacySupport] = await Promise.all([getCreatorCampaigns(address), getContribution(address)]);
      setCampaigns(owned);
      setSupported(legacySupport);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Your dashboard could not be loaded."); }
    finally { setLoading(false); }
  }, [address]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);
  const totalRaised = campaigns.reduce((total, campaign) => total + campaign.raised, 0);

  return (
    <main className="shell route-main dashboard-route">
      <div className="route-heading dashboard-heading"><div><p className="eyebrow">Wallet workspace</p><h1>Dashboard</h1><p>Create, review, and manage every campaign owned by your connected wallet.</p></div>{isConnected && <Link className="button-primary" href="/campaigns/new"><Plus size={16} /> New campaign</Link>}</div>

      {!isConnected ? (
        <section className="dashboard-gate"><div className="gate-icon"><Wallet size={25} /></div><div><h2>Connect your campaign wallet</h2><p>Your public wallet address is the account key used to find campaigns you own and contributions associated with you.</p></div><button className="button-primary" onClick={connect} disabled={isConnecting}>{isConnecting ? <><Loader2 size={15} className="animate-spin" /> Connecting…</> : <>Connect wallet <ArrowUpRight size={15} /></>}</button></section>
      ) : (
        <>
          <section className="dashboard-summary">
            <div><span>Connected wallet</span><strong>{truncateAddress(address)}</strong><p>Your campaign identity</p></div>
            <div><span>Wallet balance</span><strong>{Number(balance).toFixed(2)} <small>XLM</small></strong><p>Available in this wallet</p></div>
            <div><span>Campaigns owned</span><strong>{campaigns.length}</strong><p>Published from this wallet</p></div>
            <div><span>Raised across campaigns</span><strong>{stroopsToXlm(totalRaised).toFixed(2)} <small>XLM</small></strong><p>Directly settled to you</p></div>
          </section>

          {supported > 0 && <section className="dashboard-support"><div><span>Your support record</span><strong>{stroopsToXlm(supported).toFixed(2)} XLM</strong></div><Link href="/campaigns/legacy">View supported campaign <ArrowRight size={14} /></Link></section>}

          <section className="owned-campaigns">
            <div className="section-row"><div><p className="eyebrow">Owned by {truncateAddress(address)}</p><h2>Your campaigns</h2></div></div>
            {loading ? <div className="route-loading"><Loader2 className="animate-spin" /> Loading your campaigns…</div> : error ? <div className="route-error"><strong>Dashboard unavailable</strong><p>{error}</p></div> : campaigns.length === 0 ? (
              <div className="route-empty"><h3>No campaigns from this wallet yet</h3><p>Publish your first campaign and manage it here using the same wallet.</p><Link href="/campaigns/new">Start a campaign <ArrowRight size={15} /></Link></div>
            ) : <div className="owned-list">{campaigns.map((campaign) => <div className="owned-item" key={campaign.id}><CampaignListCard campaign={campaign} /><Link className="manage-link" href={`/dashboard/campaigns/${campaign.onChainId}`}><Settings2 size={15} /> Manage campaign</Link></div>)}</div>}
          </section>
        </>
      )}
    </main>
  );
}
