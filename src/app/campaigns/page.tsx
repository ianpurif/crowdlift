"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Plus, Search } from "lucide-react";
import CampaignListCard from "@/components/CampaignListCard";
import { getLegacyCampaign } from "@/lib/contract";
import { getRegistryCampaigns } from "@/lib/registry";
import type { CampaignRecord } from "@/types";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [legacy, created] = await Promise.all([getLegacyCampaign(), getRegistryCampaigns()]);
      setCampaigns([...(legacy ? [legacy] : []), ...created].reverse());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Campaigns could not be loaded.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadCampaigns(), 0); return () => window.clearTimeout(timer); }, [loadCampaigns]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return campaigns;
    return campaigns.filter((campaign) => `${campaign.title} ${campaign.description} ${campaign.category}`.toLowerCase().includes(normalized));
  }, [campaigns, query]);

  return (
    <main className="shell route-main">
      <div className="route-heading campaigns-heading">
        <div><p className="eyebrow">Explore what people are building</p><h1>Campaigns</h1><p>Every campaign has a public owner, goal, funding total, and status.</p></div>
        <Link className="button-primary" href="/campaigns/new"><Plus size={16} /> Start a campaign</Link>
      </div>

      <div className="campaign-toolbar">
        <label><Search size={16} /><span className="sr-only">Search campaigns</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, category, or purpose" /></label>
        <span>{filtered.length} {filtered.length === 1 ? "campaign" : "campaigns"}</span>
      </div>

      {loading ? <div className="route-loading"><Loader2 className="animate-spin" /><span>Loading public campaign records…</span></div> : error ? (
        <div className="route-error"><strong>Campaigns are temporarily unavailable</strong><p>{error}</p><button className="button-secondary" onClick={() => void loadCampaigns()}>Try again</button></div>
      ) : filtered.length === 0 ? (
        <div className="route-empty"><h2>{query ? "No campaigns match your search" : "Be the first to publish a campaign"}</h2><p>{query ? "Try a broader title or category." : "Create a wallet-owned campaign and it will appear here."}</p><Link href="/campaigns/new">Create a campaign <ArrowRight size={15} /></Link></div>
      ) : <div className="campaign-list-grid">{filtered.map((campaign) => <CampaignListCard key={campaign.id} campaign={campaign} />)}</div>}
    </main>
  );
}
