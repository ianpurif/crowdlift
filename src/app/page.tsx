"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import ActivityFeed from "@/components/ActivityFeed";
import AppHeader from "@/components/AppHeader";
import CampaignCard from "@/components/CampaignCard";
import DonationForm from "@/components/DonationForm";
import LandingExperience from "@/components/LandingExperience";
import SiteFooter from "@/components/SiteFooter";
import TransactionStatus from "@/components/TransactionStatus";
import { useToast } from "@/contexts/ToastContext";
import { useWallet } from "@/contexts/WalletContext";
import { buildDonateTransaction, fetchDonationEvents, getContribution, getGoal, getTotalRaised, submitTransaction } from "@/lib/contract";
import { initWalletKit } from "@/lib/wallet";
import { stroopsToXlm, xlmToStroops } from "@/lib/stellar";
import type { DonationEvent, TransactionInfo } from "@/types";

const CAMPAIGN_TITLE = "CrowdLift Community Fund";
const CAMPAIGN_DESCRIPTION = "Empowering open-source innovation and community projects on Stellar Testnet. Donate XLM directly to our Soroban smart contract to help fund the next generation of decentralized tools.";

export default function HomePage() {
  const { address, isConnected, refreshBalance } = useWallet();
  const { toast, dismissToast, showToast } = useToast();
  const [goal, setGoal] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);
  const [transaction, setTransaction] = useState<TransactionInfo>({ state: "idle" });
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const latestLedgerRef = useRef(0);

  const fetchCampaignData = useCallback(async () => {
    try {
      const [goalValue, raisedValue] = await Promise.all([getGoal(), getTotalRaised()]);
      setGoal(goalValue);
      setTotalRaised(raisedValue);
    } catch (error) {
      console.error("Failed to read campaign data:", error);
    } finally { setIsLoadingCampaign(false); }
  }, []);

  const fetchContribution = useCallback(async () => {
    if (!address) { setContribution(0); return; }
    try { setContribution(await getContribution(address)); }
    catch (error) { console.error("Failed to read donor contribution:", error); }
  }, [address]);

  const fetchEvents = useCallback(async () => {
    try {
      const result = await fetchDonationEvents(latestLedgerRef.current || undefined);
      if (result.events.length > 0) {
        setEvents((previous) => {
          const combined = new Map(previous.map((event) => [event.id, event]));
          result.events.forEach((event) => combined.set(event.id, event));
          return Array.from(combined.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
        });
        void fetchCampaignData();
      }
      if (result.latestLedger > 0) latestLedgerRef.current = result.latestLedger;
    } catch (error) { console.error("Failed to fetch events:", error); }
    finally { setIsLoadingEvents(false); }
  }, [fetchCampaignData]);

  useEffect(() => { void fetchCampaignData(); void fetchEvents(); }, [fetchCampaignData, fetchEvents]);
  useEffect(() => { void fetchContribution(); }, [fetchContribution]);
  useEffect(() => {
    const interval = window.setInterval(() => void fetchEvents(), 10000);
    return () => window.clearInterval(interval);
  }, [fetchEvents]);

  const handleDonate = async (amountXlm: number) => {
    if (!isConnected || !address) { toast.error("Wallet disconnected", "Connect your wallet before contributing."); return; }
    setTransaction({ state: "pending" });
    const toastId = showToast({ type: "loading", title: "Preparing contribution", message: `Submitting ${amountXlm} XLM to Stellar Testnet.` });

    try {
      const transactionToSign = await buildDonateTransaction(address, xlmToStroops(amountXlm));
      initWalletKit();
      const { signedTxXdr } = await StellarWalletsKit.signTransaction(transactionToSign.toXDR(), {
        networkPassphrase: "Test SDF Network ; September 2015",
        address,
      });
      const result = await submitTransaction(signedTxXdr);
      dismissToast(toastId);
      toast.success("Contribution confirmed", `${amountXlm} XLM was recorded on Stellar Testnet.`, result.hash);
      setTransaction({ state: "success", hash: result.hash });
      await Promise.all([fetchCampaignData(), fetchContribution(), fetchEvents(), refreshBalance()]);
    } catch (error) {
      dismissToast(toastId);
      const rawMessage = error instanceof Error ? error.message : String(error || "");
      const normalized = rawMessage.toLowerCase();
      let userMessage = rawMessage;
      if (normalized.includes("reject") || normalized.includes("cancel") || normalized.includes("denied")) userMessage = "The signature request was cancelled in your wallet.";
      else if (normalized.includes("insufficient") || normalized.includes("underfunded")) userMessage = "Your wallet does not have enough XLM for this contribution and network fees.";
      else if (normalized.includes("simulation failed") || normalized.includes("contract")) userMessage = `The contract could not prepare this contribution: ${rawMessage.replace(/^Error:\s*/i, "")}`;
      else if (normalized.includes("network") || normalized.includes("timeout") || normalized.includes("fetch")) userMessage = "Stellar Testnet could not be reached. Please try again.";
      toast.error("Contribution failed", userMessage);
      setTransaction({ state: "failed", error: userMessage });
      throw error;
    }
  };

  return (
    <div id="top" className="min-h-screen">
      <AppHeader />
      <LandingExperience goalStroops={goal} totalRaisedStroops={totalRaised} isLoading={isLoadingCampaign} />

      <main id="campaign" className="shell product-main">
        <div className="campaign-section-heading">
          <div><p className="eyebrow">Live campaign</p><h2>Back work worth building.</h2></div>
          <p>Review the funding record, understand the goal, and contribute directly from a supported Stellar wallet.</p>
        </div>

        <div className="campaign-layout">
          <div className="campaign-primary">
            <CampaignCard title={CAMPAIGN_TITLE} description={CAMPAIGN_DESCRIPTION} goalStroops={goal} totalRaisedStroops={totalRaised} isLoading={isLoadingCampaign} />
            <TransactionStatus transaction={transaction} onDismiss={() => setTransaction({ state: "idle" })} />
            {isConnected && contribution > 0 && (
              <div className="supporter-record">
                <Heart size={18} fill="currentColor" />
                <div><span>Your recorded support</span><strong>{stroopsToXlm(contribution).toFixed(2)} XLM</strong></div>
                <small>Linked to this wallet</small>
              </div>
            )}
          </div>
          <DonationForm onDonate={handleDonate} isPending={transaction.state === "pending"} />
        </div>

        <ActivityFeed events={events} isLoading={isLoadingEvents} />
      </main>
      <SiteFooter />
    </div>
  );
}
