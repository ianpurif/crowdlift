"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/contexts/ToastContext";
import CampaignCard from "@/components/CampaignCard";
import DonationForm from "@/components/DonationForm";
import ActivityFeed from "@/components/ActivityFeed";
import AppHeader from "@/components/AppHeader";
import LandingExperience from "@/components/LandingExperience";
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
import { Heart, ShieldCheck, ExternalLink } from "lucide-react";

const CAMPAIGN_TITLE = "CrowdLift Community Fund";
const CAMPAIGN_DESCRIPTION =
  "Empowering open-source innovation and community projects on Stellar Testnet. Donate XLM directly to our Soroban smart contract to help fund the next generation of decentralized tools.";

export default function HomePage() {
  const { address, isConnected, refreshBalance } = useWallet();
  const { toast, dismissToast, showToast } = useToast();

  // Campaign state
  const [goal, setGoal] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  // Transaction state
  const [transaction, setTransaction] = useState<TransactionInfo>({
    state: "idle",
  });

  // Event stream state
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const latestLedgerRef = useRef(0);

  // Fetch campaign metrics from Soroban contract
  const fetchCampaignData = useCallback(async () => {
    try {
      const [goalVal, raisedVal] = await Promise.all([
        getGoal(),
        getTotalRaised(),
      ]);
      setGoal(goalVal);
      setTotalRaised(raisedVal);
    } catch (error) {
      console.error("Failed to read campaign data:", error);
    } finally {
      setIsLoadingCampaign(false);
    }
  }, []);

  // Fetch donor contribution
  const fetchContribution = useCallback(async () => {
    if (!address) {
      setContribution(0);
      return;
    }
    try {
      const val = await getContribution(address);
      setContribution(val);
    } catch (error) {
      console.error("Failed to read donor contribution:", error);
    }
  }, [address]);

  // Fetch donation events from Soroban contract
  const fetchEvents = useCallback(async () => {
    try {
      const { events: fetchedEvents, latestLedger } = await fetchDonationEvents(
        latestLedgerRef.current ? latestLedgerRef.current : undefined,
      );

      if (fetchedEvents.length > 0) {
        setEvents((prev) => {
          const map = new Map<string, DonationEvent>();
          prev.forEach((e) => map.set(e.id, e));
          fetchedEvents.forEach((e) => map.set(e.id, e));
          const combined = Array.from(map.values()).sort(
            (a, b) => b.timestamp - a.timestamp,
          );
          return combined.slice(0, 50);
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

  // Initial mount load
  useEffect(() => {
    fetchCampaignData();
    fetchEvents();
  }, [fetchCampaignData, fetchEvents]);

  // Fetch contribution when connected address changes
  useEffect(() => {
    fetchContribution();
  }, [fetchContribution]);

  // Auto-sync contract events (polling loop every 10s)
  useEffect(() => {
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Main donation handler
  const handleDonate = async (amountXlm: number) => {
    if (!isConnected || !address) {
      toast.error("Wallet Disconnected", "Please connect your wallet first.");
      return;
    }

    setTransaction({ state: "pending" });

    // Show loading toast
    const toastId = showToast({
      type: "loading",
      title: "Processing Donation…",
      message: `Submitting ${amountXlm} XLM transaction to Stellar Testnet.`,
    });

    try {
      const amountStroops = xlmToStroops(amountXlm);

      // Build & simulate transaction with footprint
      const tx = await buildDonateTransaction(address, amountStroops);

      // Sign transaction via wallet extension
      initWalletKit();
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(
        tx.toXDR(),
        {
          networkPassphrase: "Test SDF Network ; September 2015",
          address,
        },
      );

      // Submit to network
      const result = await submitTransaction(signedTxXdr);

      // Dismiss loading toast
      dismissToast(toastId);

      // Show success toast
      toast.success(
        "Donation Confirmed!",
        `Thank you! Your donation of ${amountXlm} XLM was successfully executed on-chain.`,
        result.hash,
      );

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
      dismissToast(toastId);

      const rawMessage =
        error instanceof Error ? error.message : String(error || "");

      let userMessage = rawMessage;

      if (
        rawMessage.toLowerCase().includes("reject") ||
        rawMessage.toLowerCase().includes("cancel") ||
        rawMessage.toLowerCase().includes("denied")
      ) {
        userMessage =
          "Transaction cancelled. You declined the signature request in your wallet.";
      } else if (
        rawMessage.toLowerCase().includes("insufficient") ||
        rawMessage.toLowerCase().includes("underfunded")
      ) {
        userMessage =
          "Transaction failed. Insufficient XLM in your wallet for donation and network fees.";
      } else if (
        rawMessage.toLowerCase().includes("simulation failed") ||
        rawMessage.toLowerCase().includes("contract")
      ) {
        userMessage = `Soroban Contract Error: ${rawMessage.replace(/^Error:\s*/i, "")}`;
      } else if (
        rawMessage.toLowerCase().includes("network") ||
        rawMessage.toLowerCase().includes("timeout") ||
        rawMessage.toLowerCase().includes("fetch")
      ) {
        userMessage =
          "Network Issue: Unable to reach Stellar Testnet RPC. Please try again.";
      }

      toast.error("Donation Failed", userMessage);

      setTransaction({
        state: "failed",
        error: userMessage,
      });
    }
  };

  return (
    <div id="top" className="min-h-screen">
      <AppHeader />

      <LandingExperience
        goalStroops={goal}
        totalRaisedStroops={totalRaised}
        isLoading={isLoadingCampaign}
      />

      {/* Main 2-Column Responsive Layout */}
      <main id="campaign" className="mx-auto max-w-6xl px-4 sm:px-6 py-16 scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <CampaignCard
              title={CAMPAIGN_TITLE}
              description={CAMPAIGN_DESCRIPTION}
              goalStroops={goal}
              totalRaisedStroops={totalRaised}
              isLoading={isLoadingCampaign}
            />

            {/* Donor Contribution Highlight */}
            {isConnected && contribution > 0 && (
              <div className="apple-card p-6 sm:p-8 border-[#2563EB]/20 bg-[#DBEAFE]/30 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
                    <Heart size={16} fill="currentColor" />
                    <span>Your Contribution</span>
                  </div>
                  <span className="text-xs font-bold text-[#2563EB] bg-white px-3 py-1 rounded-full border border-[#2563EB]/20">
                    Verified Supporter
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#0F172A]">
                    {stroopsToXlm(contribution).toFixed(2)}
                  </span>
                  <span className="text-sm font-semibold text-[#64748B]">
                    XLM Donated
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Donation Form */}
            <DonationForm
              onDonate={handleDonate}
              isPending={transaction.state === "pending"}
            />

            {/* Activity Feed */}
            <ActivityFeed events={events} isLoading={isLoadingEvents} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#E2E8F0] bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/icon.png"
                alt="CrowdLift Logo"
                className="h-7 w-7 rounded-xl object-cover border border-[#E2E8F0]"
              />
              <span className="text-sm font-extrabold text-[#0F172A]">
                CrowdLift
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-[#64748B]">
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563EB] transition-colors flex items-center gap-1"
              >
                <span>Stellar Expert Explorer</span>
                <ExternalLink size={12} />
              </a>
              <span>•</span>
              <a
                href="https://soroban.stellar.org"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#2563EB] transition-colors flex items-center gap-1"
              >
                <span>Soroban Docs</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-[#E2E8F0]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck size={14} className="text-[#16A34A]" />
              <span>Powered by Soroban Smart Contracts on Stellar Testnet</span>
            </div>
            <p className="font-medium text-[#64748B]">
              &copy; {new Date().getFullYear()} CrowdLift Technologies. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
