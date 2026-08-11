"use client";

import { CheckCircle2, Code2, ExternalLink, ShieldCheck } from "lucide-react";
import { stroopsToXlm } from "@/lib/stellar";

interface CampaignCardProps {
  title: string;
  description: string;
  goalStroops: number;
  totalRaisedStroops: number;
  isLoading: boolean;
}

export default function CampaignCard({ title, description, goalStroops, totalRaisedStroops, isLoading }: CampaignCardProps) {
  const goalXlm = stroopsToXlm(goalStroops);
  const raisedXlm = stroopsToXlm(totalRaisedStroops);
  const percentage = goalXlm > 0 ? Math.min((raisedXlm / goalXlm) * 100, 100) : 0;

  return (
    <article className="campaign-detail">
      <div className="campaign-visual" aria-label="CrowdLift Community Fund campaign artwork">
        <div className="campaign-visual-copy"><Code2 size={23} /><span>Community<br />code fund</span></div>
        <span className="campaign-shape campaign-shape-a" />
        <span className="campaign-shape campaign-shape-b" />
        <span className="campaign-shape campaign-shape-c" />
      </div>

      <div className="campaign-content">
        <div className="campaign-kicker"><span>Technology</span><span>Stellar ecosystem</span></div>
        <h2>{title}</h2>
        <p className="campaign-description">{description}</p>

        <div className="campaign-finance">
          <div className="raised-total">
            <span>Raised to date</span>
            {isLoading ? <i className="skeleton" /> : <strong>{raisedXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} <small>XLM</small></strong>}
          </div>
          <div className="funding-percentage">
            <strong>{isLoading ? "—" : `${percentage.toFixed(1)}%`}</strong>
            <span>of {goalXlm.toLocaleString()} XLM goal</span>
          </div>
        </div>
        <div className="campaign-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentage)}>
          <span style={{ width: `${percentage}%` }} />
        </div>

        <div className="campaign-story">
          <h3>Why this fund exists</h3>
          <p>Open-source tools become public infrastructure when maintainers have the time and resources to keep building. This campaign demonstrates a direct, inspectable way to rally support around that work.</p>
        </div>

        <dl className="campaign-assurances">
          <div><dt><ShieldCheck size={16} /> Funding record</dt><dd>Stored by the Soroban campaign contract</dd></div>
          <div><dt><CheckCircle2 size={16} /> Contribution proof</dt><dd>Linked to the signing Stellar account</dd></div>
        </dl>

        <a className="contract-link" href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer">
          Review activity on Stellar Expert <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
