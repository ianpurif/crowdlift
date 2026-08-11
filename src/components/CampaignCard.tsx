"use client";

import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { stroopsToXlm, truncateAddress } from "@/lib/stellar";
import type { CampaignRecord } from "@/types";

export default function CampaignCard({ campaign }: { campaign: CampaignRecord }) {
  const goalXlm = stroopsToXlm(campaign.goal);
  const raisedXlm = stroopsToXlm(campaign.raised);
  const percentage = goalXlm > 0 ? Math.min((raisedXlm / goalXlm) * 100, 100) : 0;

  return (
    <article className="campaign-detail">
      <div className={`campaign-visual campaign-tone-${(campaign.onChainId || 0) % 3}`} aria-label={`${campaign.title} campaign artwork`}>
        <div className="campaign-visual-copy"><span>{campaign.category}<br />campaign</span></div>
        <span className="campaign-shape campaign-shape-a" /><span className="campaign-shape campaign-shape-b" /><span className="campaign-shape campaign-shape-c">{campaign.title.slice(0, 2).toUpperCase()}</span>
      </div>
      <div className="campaign-content">
        <div className="campaign-kicker"><span>{campaign.category}</span><span>{campaign.active ? "Accepting contributions" : "Paused by creator"}</span></div>
        <h1>{campaign.title}</h1>
        <p className="campaign-description">{campaign.description}</p>
        <div className="campaign-owner-line"><span>Campaign owner</span><code>{campaign.source === "legacy" ? "Original CrowdLift contract" : truncateAddress(campaign.creator)}</code></div>
        <div className="campaign-finance"><div className="raised-total"><span>Raised to date</span><strong>{raisedXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>XLM</small></strong></div><div className="funding-percentage"><strong>{percentage.toFixed(1)}%</strong><span>of {goalXlm.toLocaleString()} XLM goal</span></div></div>
        <div className="campaign-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentage)}><span style={{ width: `${percentage}%` }} /></div>
        <dl className="campaign-assurances"><div><dt><ShieldCheck size={16} /> Wallet-authorized</dt><dd>{campaign.source === "registry" ? "Only the creator wallet can update or pause this campaign" : "Contributions require the supporter wallet’s approval"}</dd></div><div><dt><CheckCircle2 size={16} /> Direct settlement</dt><dd>Contract logic sends each contribution to the campaign owner</dd></div></dl>
        <a className="contract-link" href="https://stellar.expert/explorer" target="_blank" rel="noreferrer">Review public network activity <ExternalLink size={14} /></a>
      </div>
    </article>
  );
}
