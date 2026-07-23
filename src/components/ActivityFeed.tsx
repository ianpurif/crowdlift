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
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Activity size={15} />
          </div>
          <h3 className="text-base font-bold text-text-primary">Live Activity</h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Auto-syncing
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        {isLoading && events.length === 0 && (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 animate-subtle-pulse rounded-xl bg-bg border border-border/40"
              />
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="py-10 text-center rounded-xl border border-dashed border-border/80 bg-bg/50 px-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-border/40 text-text-secondary">
              <HeartHandshake size={20} />
            </div>
            <p className="mt-3 text-xs font-semibold text-text-primary">
              No Donations Yet
            </p>
            <p className="mt-1 text-xs text-text-secondary max-w-xs mx-auto">
              Be the first supporter to donate XLM to this campaign!
            </p>
          </div>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg p-3 transition-all hover:border-accent/30 animate-fade-in"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-light text-accent font-semibold">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-semibold text-text-primary truncate">
                  {truncateAddress(event.donor)}
                </span>
                <span className="text-xs font-bold text-accent shrink-0">
                  +{stroopsToXlm(event.amount).toFixed(2)} XLM
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-secondary mt-0.5">
                <span>Donated to campaign</span>
                <div className="flex items-center gap-1 shrink-0">
                  <Clock size={10} />
                  <span>{formatTime(event.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
