import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { stroopsToXlm, truncateAddress } from "@/lib/stellar";
import type { CampaignRecord } from "@/types";

export default function CampaignListCard({ campaign }: { campaign: CampaignRecord }) {
  const raised = stroopsToXlm(campaign.raised);
  const goal = stroopsToXlm(campaign.goal);
  const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  return (
    <article className={`campaign-list-card campaign-tone-${(campaign.onChainId || 0) % 3}`}>
      <Link className="campaign-list-art" href={`/campaigns/${campaign.id}`} aria-label={`View ${campaign.title}`}>
        <span>{campaign.category}</span><strong>{campaign.title.slice(0, 2).toUpperCase()}</strong>
      </Link>
      <div className="campaign-list-body">
        <div className="campaign-list-meta"><span>{campaign.category}</span><span>{campaign.active ? "Open" : "Paused"}</span></div>
        <h2><Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link></h2>
        <p>{campaign.description}</p>
        <div className="campaign-list-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="campaign-list-stats">
          <div><strong>{raised.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong><small>XLM raised</small></div>
          <div><strong>{progress.toFixed(0)}%</strong><small>of goal</small></div>
          <Link href={`/campaigns/${campaign.id}`} aria-label={`Open ${campaign.title}`}><ArrowUpRight size={18} /></Link>
        </div>
        <div className="campaign-owner"><span>By</span><code>{campaign.source === "legacy" ? "CrowdLift" : truncateAddress(campaign.creator)}</code></div>
      </div>
    </article>
  );
}
