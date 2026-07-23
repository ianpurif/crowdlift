"use client";

import React from "react";
import { stroopsToXlm } from "@/lib/stellar";
import { Target, TrendingUp, Sparkles } from "lucide-react";

interface CampaignCardProps {
  title: string;
  description: string;
  goalStroops: number;
  totalRaisedStroops: number;
  isLoading: boolean;
}

export default function CampaignCard({
  title,
  description,
  goalStroops,
  totalRaisedStroops,
  isLoading,
}: CampaignCardProps) {
  const goalXlm = stroopsToXlm(goalStroops);
  const raisedXlm = stroopsToXlm(totalRaisedStroops);
  const percentage = goalXlm > 0 ? Math.min((raisedXlm / goalXlm) * 100, 100) : 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-light px-2.5 py-0.5 text-[11px] font-bold text-accent uppercase tracking-wider">
          <Sparkles size={11} />
          Active Campaign
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-bold text-text-primary tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {description}
      </p>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/80 bg-bg p-4 transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <TrendingUp size={14} className="text-accent" />
            <span>Amount Raised</span>
          </div>
          <div className="mt-1.5 text-2xl font-bold text-text-primary tracking-tight">
            {isLoading ? (
              <span className="inline-block h-7 w-24 animate-subtle-pulse rounded-md bg-border/60" />
            ) : (
              `${raisedXlm.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })} XLM`
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-bg p-4 transition-all">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Target size={14} className="text-text-secondary" />
            <span>Funding Goal</span>
          </div>
          <div className="mt-1.5 text-2xl font-bold text-text-primary tracking-tight">
            {isLoading ? (
              <span className="inline-block h-7 w-24 animate-subtle-pulse rounded-md bg-border/60" />
            ) : (
              `${goalXlm.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })} XLM`
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
          <span>Campaign Progress</span>
          <span className="font-bold text-text-primary">
            {isLoading ? "—" : `${percentage.toFixed(1)}%`}
          </span>
        </div>

        <div className="mt-2.5 h-3.5 w-full overflow-hidden rounded-full bg-border/60 p-0.5">
          {!isLoading && (
            <div
              className="h-full rounded-full bg-accent animate-progress transition-all duration-700 ease-out"
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
