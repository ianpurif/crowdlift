"use client";

import { ArrowUpRight, CircleDollarSign, FilePenLine, Pause, Play, Radio, Rocket } from "lucide-react";
import type { CampaignActivity } from "@/types";
import { getStellarExpertTxUrl, stroopsToXlm, truncateAddress } from "@/lib/stellar";

interface ActivityFeedProps {
  events: CampaignActivity[];
  isLoading: boolean;
  hasRecordedFunding: boolean;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp);
}

function eventPresentation(event: CampaignActivity) {
  if (event.type === "created") return { icon: <Rocket size={15} />, label: "Campaign created", detail: "Published on-chain" };
  if (event.type === "updated") return { icon: <FilePenLine size={15} />, label: "Campaign updated", detail: "Campaign details changed" };
  if (event.type === "status") return event.active
    ? { icon: <Play size={15} />, label: "Campaign reopened", detail: "Contributions enabled" }
    : { icon: <Pause size={15} />, label: "Campaign paused", detail: "Contributions paused" };
  return {
    icon: <CircleDollarSign size={15} />,
    label: "Contribution confirmed",
    detail: `+${stroopsToXlm(event.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`,
  };
}

export default function ActivityFeed({ events, isLoading, hasRecordedFunding }: ActivityFeedProps) {
  return (
    <section id="activity" className="activity-section" aria-labelledby="activity-title">
      <div className="activity-heading">
        <div><p className="eyebrow">Public campaign record</p><h2 id="activity-title">Activity History</h2></div>
        <span className="sync-status"><Radio size={13} /> Contract events</span>
      </div>

      <div className="activity-table" role="region" aria-label="Campaign transaction history" tabIndex={0}>
        <div className="activity-row activity-header" aria-hidden="true"><span>Activity</span><span>Wallet</span><span>Date</span><span>Details</span><span>Verify</span></div>
        {isLoading && events.length === 0 && [1, 2, 3].map((item) => <div className="activity-row" key={item}><i className="skeleton activity-skeleton" /></div>)}
        {!isLoading && events.length === 0 && (
          <div className="activity-empty">
            <strong>{hasRecordedFunding ? "No events returned for the current ledger window" : "No transaction history available yet"}</strong>
            <p>{hasRecordedFunding ? "The campaign total is on-chain, but the current RPC event window did not return its individual transactions." : "Confirmed campaign transactions will appear here with a direct explorer link."}</p>
          </div>
        )}
        {events.map((event) => {
          const presentation = eventPresentation(event);
          return (
            <div className="activity-row" key={event.id}>
              <span className="activity-kind"><i>{presentation.icon}</i><strong>{presentation.label}</strong></span>
              <span className="supporter-address"><code>{truncateAddress(event.actor)}</code></span>
              <time dateTime={new Date(event.timestamp).toISOString()}>{formatDate(event.timestamp)}</time>
              <strong>{presentation.detail}</strong>
              <a className="activity-verify" href={getStellarExpertTxUrl(event.txHash)} target="_blank" rel="noreferrer" aria-label={`Verify ${presentation.label.toLowerCase()} on the blockchain explorer`}>Verify <ArrowUpRight size={14} /></a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
