"use client";

import React from "react";
import { stroopsToXlm } from "@/lib/stellar";
import { Target, TrendingUp } from "lucide-react";

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
      <h2 className="text-xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        {description}
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-bg p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <TrendingUp size={14} />
            Raised
          </div>
          <div className="mt-1 text-xl font-bold text-text-primary">
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-subtle-pulse rounded bg-border" />
            ) : (
              `${raisedXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`
            )}
          </div>
        </div>
        <div className="rounded-xl bg-bg p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <Target size={14} />
            Goal
          </div>
          <div className="mt-1 text-xl font-bold text-text-primary">
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-subtle-pulse rounded bg-border" />
            ) : (
              `${goalXlm.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span className="font-semibold text-text-primary">
            {isLoading ? "—" : `${percentage.toFixed(1)}%`}
          </span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-accent-light">
          {!isLoading && (
            <div
              className="h-full rounded-full bg-accent animate-progress transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
