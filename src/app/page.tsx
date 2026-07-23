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
import { initWalletKit } from "@/lib/wallet";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import type { TransactionInfo, DonationEvent } from "@/types";
import { Rocket, ShieldCheck, HeartHandshake } from "lucide-react";

const CAMPAIGN_TITLE = "CrowdLift Community Fund";
const CAMPAIGN_DESCRIPTION =
  "Empowering open-source innovation and community projects on Stellar Testnet. Donate XLM directly to our Soroban smart contract to help fund the next generation of decentralized tools.";

export default function HomePage() {
  const { address, isConnected, refreshBalance } = useWallet();

  // Campaign state
  const [goal, setGoal] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  // Transaction state
  const [transaction, setTransaction] = useState<TransactionInfo>({
    state: "idle",
  });

  // Donation events
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const latestLedgerRef = useRef(0);

  // Fetch contract campaign metrics
  const fetchCampaignData = useCallback(async () => {
    try {
      const [goalVal, raisedVal] = await Promise.all([
        getGoal(),
        getTotalRaised(),
      ]);
      setGoal(goalVal);
      setTotalRaised(raisedVal);
    } catch (error) {
      console.error("Failed to read contract state:", error);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, []);

  // Fetch individual donor contribution
  const fetchContribution = useCallback(async () => {
    if (!address) {
      setContribution(0);
      return;
    }
    try {
      const val = await getContribution(address);
      setContribution(val);
    } catch (error) {
      console.error("Failed to read user contribution:", error);
    }
  }, [address]);

  // Fetch contract donation events
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

  // Initial load
  useEffect(() => {
    fetchCampaignData();
    fetchEvents();
  }, [fetchCampaignData, fetchEvents]);

  // Refresh contribution when address updates
  useEffect(() => {
    fetchContribution();
  }, [fetchContribution]);

  // Event polling loop (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Main donation handler
  const handleDonate = async (amountXlm: number) => {
    if (!isConnected || !address) {
      throw new Error("Wallet is disconnected");
    }

    setTransaction({ state: "pending" });

    try {
      const amountStroops = xlmToStroops(amountXlm);

      // Build & simulate transaction with footprint
      const tx = await buildDonateTransaction(address, amountStroops);

      // Sign transaction using wallet extension
      initWalletKit();
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(tx.toXDR(), {
        networkPassphrase: "Test SDF Network ; September 2015",
        address,
      });

      // Submit to network
      const result = await submitTransaction(signedTxXdr);

      setTransaction({
        state: "success",
        hash: result.hash,
      });

      // Synchronize state
      await Promise.all([
        fetchCampaignData(),
        fetchContribution(),
        fetchEvents(),
        refreshBalance(),
      ]);
    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error ? error.message : String(error || "");

      let userMessage = rawMessage;

      if (
        rawMessage.toLowerCase().includes("reject") ||
        rawMessage.toLowerCase().includes("cancel") ||
        rawMessage.toLowerCase().includes("denied")
      ) {
        userMessage = "Transaction was cancelled in your wallet.";
      } else if (
        rawMessage.toLowerCase().includes("insufficient") ||
        rawMessage.toLowerCase().includes("underfunded")
      ) {
        userMessage = "Insufficient XLM balance to complete transaction.";
      } else if (
        rawMessage.toLowerCase().includes("simulation failed") ||
        rawMessage.toLowerCase().includes("contract")
      ) {
        userMessage = `Contract call failed: ${rawMessage}`;
      } else if (
        rawMessage.toLowerCase().includes("network") ||
        rawMessage.toLowerCase().includes("timeout")
      ) {
        userMessage = "Network timeout. Please check Stellar Testnet status.";
      }

      setTransaction({
        state: "failed",
        error: userMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary selection:bg-accent-light selection:text-accent">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
              <Rocket size={18} />
            </div>
            <div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                CrowdLift
              </span>
              <span className="ml-2 text-[10px] font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full uppercase tracking-wide">
                Testnet
              </span>
            </div>
          </div>

          <WalletButton />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Main Campaign Column */}
          <div className="space-y-6 lg:col-span-3">
            <CampaignCard
              title={CAMPAIGN_TITLE}
              description={CAMPAIGN_DESCRIPTION}
              goalStroops={goal}
              totalRaisedStroops={totalRaised}
              isLoading={isLoadingCampaign}
            />

            {/* Donor Contribution Highlight */}
            {isConnected && contribution > 0 && (
              <div className="rounded-2xl border border-accent/20 bg-accent-light/40 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                    <HeartHandshake size={16} />
                    <span>Your Contributions</span>
                  </div>
                  <span className="text-xs font-bold text-accent bg-card px-2.5 py-1 rounded-full border border-accent/20">
                    Donor Verified
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-text-primary">
                    {stroopsToXlm(contribution).toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">
                    XLM Contributed
                  </span>
                </div>
              </div>
            )}

            {/* Donation Form */}
            <DonationForm
              onDonate={handleDonate}
              isPending={transaction.state === "pending"}
            />

            {/* Transaction Alert Feedback */}
            {transaction.state !== "idle" && (
              <TransactionStatus
                transaction={transaction}
                onDismiss={() => setTransaction({ state: "idle" })}
              />
            )}
          </div>

          {/* Activity Feed Column */}
          <div className="lg:col-span-2">
            <ActivityFeed events={events} isLoading={isLoadingEvents} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-text-secondary sm:flex-row">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-success" />
              <span>
                Powered by Soroban Smart Contracts on Stellar Testnet
              </span>
            </div>
            <div className="flex items-center gap-4 font-medium">
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Stellar Expert
              </a>
              <a
                href="https://soroban.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors"
              >
                Soroban Docs
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
