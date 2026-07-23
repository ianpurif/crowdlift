"use client";

import React from "react";
import { stroopsToXlm } from "@/lib/stellar";
import { Sparkles, TrendingUp, Target } from "lucide-react";

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
  const percentage =
    goalXlm > 0 ? Math.min((raisedXlm / goalXlm) * 100, 100) : 0;

  return (
    <div className="apple-card p-6 sm:p-10 animate-fade-in-up">
      {/* Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#64748B]">Stellar</span>
      </div>

      {/* Main Campaign Info */}
      <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
        {title}
      </h1>
      <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#64748B]">
        {description}
      </p>

      {/* Big Raised Metrics */}
      <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
              Total Raised
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                {isLoading ? (
                  <span className="inline-block h-10 w-36 animate-pulse rounded-xl bg-[#E2E8F0]/60" />
                ) : (
                  `${raisedXlm.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })} XLM`
                )}
              </span>
              <span className="text-sm font-semibold text-[#64748B]">
                of {goalXlm.toLocaleString()} XLM goal
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-2 text-right">
            <div className="text-xs text-[#64748B] font-medium">Funded</div>
            <div className="text-lg font-bold text-[#2563EB]">
              {isLoading ? "—" : `${percentage.toFixed(1)}%`}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="h-4.5 w-full overflow-hidden rounded-full bg-[#F1F5F9] p-1 border border-[#E2E8F0]/50">
            {!isLoading && (
              <div
                className="h-full rounded-full bg-[#2563EB] animate-progress transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            )}
          </div>
        </div>

        {/* Metric Pills */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">
                Raised So Far
              </div>
              <div className="text-sm font-bold text-[#0F172A]">
                {isLoading ? "..." : `${raisedXlm.toFixed(2)} XLM`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A]/5 text-[#0F172A]">
              <Target size={18} />
            </div>
            <div>
              <div className="text-xs text-[#64748B] font-medium">
                Target Goal
              </div>
              <div className="text-sm font-bold text-[#0F172A]">
                {isLoading ? "..." : `${goalXlm.toFixed(0)} XLM`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
