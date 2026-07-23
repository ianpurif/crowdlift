"use client";

import React from "react";
import { truncateAddress, stroopsToXlm } from "@/lib/stellar";
import type { DonationEvent } from "@/types";
import { Activity, User, Clock } from "lucide-react";

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
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-accent" />
        <h3 className="text-lg font-bold text-text-primary">Recent Activity</h3>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading && events.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-subtle-pulse rounded-xl bg-bg"
              />
            ))}
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="py-8 text-center">
            <Activity
              size={32}
              className="mx-auto text-border"
            />
            <p className="mt-3 text-sm text-text-secondary">
              No donations yet. Be the first to contribute!
            </p>
          </div>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center gap-3 rounded-xl bg-bg px-4 py-3 animate-fade-in"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-light">
              <User size={14} className="text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-text-primary">
                  {stroopsToXlm(event.amount).toFixed(2)} XLM
                </span>
                <div className="flex items-center gap-1 text-xs text-text-secondary">
                  <Clock size={10} />
                  {formatTime(event.timestamp)}
                </div>
              </div>
              <p className="text-xs text-text-secondary">
                from {truncateAddress(event.donor)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
