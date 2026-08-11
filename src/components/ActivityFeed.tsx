"use client";

import { ArrowUpRight, Radio } from "lucide-react";
import type { DonationEvent } from "@/types";
import { getStellarExpertTxUrl, stroopsToXlm, truncateAddress } from "@/lib/stellar";

interface ActivityFeedProps { events: DonationEvent[]; isLoading: boolean; hasRecordedFunding: boolean; }

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(timestamp);
}

export default function ActivityFeed({ events, isLoading, hasRecordedFunding }: ActivityFeedProps) {
  return (
    <section id="activity" className="activity-section" aria-labelledby="activity-title">
      <div className="activity-heading">
        <div><p className="eyebrow">Public campaign record</p><h2 id="activity-title">Recent activity</h2></div>
        <span className="sync-status"><Radio size={13} /> Syncs every 10 seconds</span>
      </div>

      <div className="activity-table" role="region" aria-label="Recent campaign contributions" tabIndex={0}>
        <div className="activity-row activity-header" aria-hidden="true"><span>Supporter</span><span>Date</span><span>Status</span><span>Amount</span><span /></div>
        {isLoading && events.length === 0 && [1,2,3].map((item) => <div className="activity-row" key={item}><i className="skeleton activity-skeleton" /></div>)}
        {!isLoading && events.length === 0 && (
          <div className="activity-empty">
            <strong>{hasRecordedFunding ? "No recent events in this ledger window" : "No contributions recorded yet"}</strong>
            <p>{hasRecordedFunding ? "The campaign total is recorded on-chain, but no individual events were returned for the current activity window." : "The first confirmed contribution will appear here after it is published by the contract."}</p>
          </div>
        )}
        {events.map((event) => (
          <div className="activity-row" key={event.id}>
            <span className="supporter-address"><i>{event.donor.slice(0, 2)}</i>{truncateAddress(event.donor)}</span>
            <time dateTime={new Date(event.timestamp).toISOString()}>{formatDate(event.timestamp)}</time>
            <span className="confirmed-status"><i /> Confirmed</span>
            <strong>+{stroopsToXlm(event.amount).toFixed(2)} XLM</strong>
            {event.txHash ? <a href={getStellarExpertTxUrl(event.txHash)} target="_blank" rel="noreferrer" aria-label="View transaction on Stellar Expert"><ArrowUpRight size={15} /></a> : <span />}
          </div>
        ))}
      </div>
    </section>
  );
}
