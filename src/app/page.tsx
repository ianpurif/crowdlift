"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@/contexts/WalletContext";
import WalletButton from "@/components/WalletButton";
import CampaignCard from "@/components/CampaignCard";
import DonationForm from "@/components/DonationForm";
import TransactionStatus from "@/components/TransactionStatus";
import ActivityFeed from "@/components/ActivityFeed";
import {
  getGoal,
  getTotalRaised,
  getContribution,
  buildDonateTransaction,
  submitTransaction,
  fetchDonationEvents,
} from "@/lib/contract";
import { xlmToStroops, stroopsToXlm } from "@/lib/stellar";
import { getKit } from "@/lib/wallet";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import type { TransactionInfo, DonationEvent } from "@/types";
import { Sparkles, ExternalLink } from "lucide-react";

const CAMPAIGN_TITLE = "CrowdLift Community Fund";
const CAMPAIGN_DESCRIPTION =
  "Help us build the future of decentralized community funding on Stellar. Every contribution brings us closer to empowering creators, innovators, and changemakers worldwide.";

export default function HomePage() {
  const { address, isConnected, refreshBalance } = useWallet();

  // Campaign data
  const [goal, setGoal] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  // Transaction
  const [transaction, setTransaction] = useState<TransactionInfo>({
    state: "idle",
  });

  // Events
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const latestLedgerRef = useRef(0);

  // Fetch campaign data
  const fetchCampaignData = useCallback(async () => {
    try {
      const [goalVal, raisedVal] = await Promise.all([
        getGoal(),
        getTotalRaised(),
      ]);
      setGoal(goalVal);
      setTotalRaised(raisedVal);
    } catch (error) {
      console.error("Failed to fetch campaign data:", error);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, []);

  // Fetch user contribution
  const fetchContribution = useCallback(async () => {
    if (!address) {
      setContribution(0);
      return;
    }
    try {
      const val = await getContribution(address);
      setContribution(val);
    } catch (error) {
      console.error("Failed to fetch contribution:", error);
    }
  }, [address]);

  // Fetch donation events
  const fetchEvents = useCallback(async () => {
    try {
      const { events: newEvents, latestLedger } = await fetchDonationEvents(
        latestLedgerRef.current || undefined
      );

      if (newEvents.length > 0) {
        setEvents((prev) => {
          const existingIds = new Set(prev.map((e) => e.id));
          const unique = newEvents.filter((e) => !existingIds.has(e.id));
          return [...unique, ...prev].slice(0, 50);
        });

        // Also refresh campaign data when new events arrive
        fetchCampaignData();
      }

      if (latestLedger > 0) {
        latestLedgerRef.current = latestLedger;
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [fetchCampaignData]);

  // Initial data load
  useEffect(() => {
    fetchCampaignData();
    fetchEvents();
  }, [fetchCampaignData, fetchEvents]);

  // Fetch contribution when address changes
  useEffect(() => {
    fetchContribution();
  }, [fetchContribution]);

  // Poll for new events every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Handle donation
  const handleDonate = async (amountXlm: number) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setTransaction({ state: "pending" });

    try {
      // Build transaction
      const amountStroops = xlmToStroops(amountXlm);
      const tx = await buildDonateTransaction(address, amountStroops);

      // Sign with wallet (v2.5 static API)
      getKit(); // ensure initialized
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), {
        networkPassphrase: "Test SDF Network ; September 2015",
        address,
      });

      // Submit
      const result = await submitTransaction(signedTxXdr);

      setTransaction({
        state: "success",
        hash: result.hash,
      });

      // Refresh data
      await Promise.all([
        fetchCampaignData(),
        fetchContribution(),
        fetchEvents(),
        refreshBalance(),
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Transaction failed";

      // Handle specific error types
      let userMessage = errorMessage;

      if (
        errorMessage.toLowerCase().includes("reject") ||
        errorMessage.toLowerCase().includes("cancel") ||
        errorMessage.toLowerCase().includes("denied")
      ) {
        userMessage = "Transaction was rejected in your wallet.";
      } else if (
        errorMessage.toLowerCase().includes("insufficient") ||
        errorMessage.toLowerCase().includes("underfunded")
      ) {
        userMessage = "Insufficient XLM balance for this transaction.";
      } else if (
        errorMessage.toLowerCase().includes("simulation failed") ||
        errorMessage.toLowerCase().includes("contract")
      ) {
        userMessage = "Contract error: " + errorMessage;
      } else if (
        errorMessage.toLowerCase().includes("network") ||
        errorMessage.toLowerCase().includes("timeout")
      ) {
        userMessage = "Network error. Please check your connection and try again.";
      }

      setTransaction({
        state: "failed",
        error: userMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">
              CrowdLift
            </span>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left column: Campaign + Donation */}
          <div className="space-y-6 lg:col-span-3">
            <CampaignCard
              title={CAMPAIGN_TITLE}
              description={CAMPAIGN_DESCRIPTION}
              goalStroops={goal}
              totalRaisedStroops={totalRaised}
              isLoading={isLoadingCampaign}
            />

            {/* Your contribution */}
            {isConnected && contribution > 0 && (
              <div className="rounded-2xl border border-accent-light bg-accent-light/30 px-5 py-4">
                <p className="text-sm text-text-secondary">
                  Your total contribution
                </p>
                <p className="text-lg font-bold text-accent">
                  {stroopsToXlm(contribution).toFixed(2)} XLM
                </p>
              </div>
            )}

            <DonationForm
              onDonate={handleDonate}
              isPending={transaction.state === "pending"}
            />

            {/* Transaction status */}
            {transaction.state !== "idle" && (
              <TransactionStatus
                transaction={transaction}
                onDismiss={() => setTransaction({ state: "idle" })}
              />
            )}
          </div>

          {/* Right column: Activity */}
          <div className="lg:col-span-2">
            <ActivityFeed events={events} isLoading={isLoadingEvents} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-text-secondary">
              Built on Stellar Testnet. This is a demo application.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-text-secondary hover:text-accent transition-colors"
              >
                Stellar Expert
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-accent transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
