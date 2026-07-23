"use client";

import React from "react";
import { truncateAddress, stroopsToXlm } from "@/lib/stellar";
import type { DonationEvent } from "@/types";
import { Activity, User, Clock, HeartHandshake } from "lucide-react";

interface ActivityFeedProps {
  events: DonationEvent[];
  isLoading: boolean;
}

export default function ActivityFeed({ events, isLoading }: ActivityFeedProps) {
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="apple-card p-6 sm:p-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB]">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">
              Recent Donations
            </h3>
            <p className="text-xs text-[#64748B]">Live Soroban Event Stream</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#16A34A]">
          <span className="h-2 w-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      <div className="mt-6 max-h-[235px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
        {isLoading && events.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]"
              />
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="py-8 text-center rounded-2xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] px-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
              <HeartHandshake size={20} />
            </div>
            <h4 className="mt-2 text-xs font-bold text-[#0F172A]">
              Be the First Supporter
            </h4>
            <p className="mt-1 text-[11px] text-[#64748B] max-w-xs mx-auto leading-relaxed">
              No donations recorded on-chain yet. Donate XLM above to start the campaign feed!
            </p>
          </div>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] transition-all hover:border-[#2563EB]/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB]/10 text-[#2563EB] font-bold">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-mono font-bold text-[#0F172A] truncate">
                  {truncateAddress(event.donor)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-0.5">
                  <Clock size={10} />
                  <span>{formatTime(event.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs font-extrabold text-[#2563EB]">
                +{stroopsToXlm(event.amount).toFixed(2)} XLM
              </div>
              <div className="text-[10px] font-semibold text-[#16A34A] uppercase tracking-wider">
                Confirmed
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
