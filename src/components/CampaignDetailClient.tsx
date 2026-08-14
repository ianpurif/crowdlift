"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import ActivityFeed from "@/components/ActivityFeed";
import CampaignCard from "@/components/CampaignCard";
import DonationForm from "@/components/DonationForm";
import TransactionStatus from "@/components/TransactionStatus";
import { useToast } from "@/contexts/ToastContext";
import { useWallet } from "@/contexts/WalletContext";
import { buildDonateTransaction, fetchLegacyCampaignActivity, getContribution, getLegacyCampaign, submitTransaction } from "@/lib/contract";
import { buildRegistryContributionTransaction, getRegistryCampaign, getRegistryCampaignActivity, getRegistryContribution } from "@/lib/registry";
import { signContractTransaction } from "@/lib/wallet";
import { xlmToStroops } from "@/lib/stellar";
import type { CampaignActivity, CampaignRecord, TransactionInfo } from "@/types";

export default function CampaignDetailClient({ campaignId }: { campaignId: string }) {
  const { address, isConnected, refreshBalance } = useWallet();
  const { toast, dismissToast } = useToast();
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [contribution, setContribution] = useState(0);
  const [events, setEvents] = useState<CampaignActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState<TransactionInfo>({ state: "idle" });

  const isLegacy = campaignId === "legacy";
  const registryId = isLegacy ? 0 : Number(campaignId.replace("registry-", ""));

  const loadCampaign = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!isLegacy && (!Number.isInteger(registryId) || registryId < 1)) throw new Error("Campaign not found.");
      const record = isLegacy ? await getLegacyCampaign() : await getRegistryCampaign(registryId);
      if (!record) throw new Error("Campaign not found.");
      setCampaign(record);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Campaign could not be loaded."); }
    finally { setLoading(false); }
  }, [isLegacy, registryId]);

  useEffect(() => { void loadCampaign(); }, [loadCampaign]);

  useEffect(() => {
    if (!campaign) return;
    let cancelled = false;
    setActivityLoading(true);
    const loadSecondaryData = async () => {
      const [support, activity] = await Promise.all([
        address
          ? (isLegacy ? getContribution(address) : getRegistryContribution(registryId, address)).catch(() => 0)
          : Promise.resolve(0),
        isLegacy
          ? fetchLegacyCampaignActivity().then((result) => result.events)
          : getRegistryCampaignActivity(registryId, campaign.createdLedger),
      ]);
      if (!cancelled) {
        setContribution(support);
        setEvents(activity);
        setActivityLoading(false);
      }
    };
    void loadSecondaryData();
    return () => { cancelled = true; };
  }, [address, campaign, isLegacy, registryId]);

  const donate = async (amountXlm: number) => {
    if (!isConnected || !address || !campaign) { toast.error("Wallet disconnected", "Connect your wallet before contributing."); return; }
    if (!campaign.active) { toast.error("Campaign paused", "This campaign is not currently accepting contributions."); return; }
    setTransaction({ state: "pending" });
    const toastId = toast.loading("Preparing contribution", `Preparing ${amountXlm} XLM for wallet approval.`);
    try {
      const pending = isLegacy ? await buildDonateTransaction(address, xlmToStroops(amountXlm)) : await buildRegistryContributionTransaction(address, registryId, xlmToStroops(amountXlm));
      const signed = await signContractTransaction(pending, address);
      const result = await submitTransaction(signed);
      dismissToast(toastId);
      toast.success("Contribution confirmed", `${amountXlm} XLM was added to the campaign.`, result.hash);
      setTransaction({ state: "success", hash: result.hash });
      await Promise.all([loadCampaign(), refreshBalance()]);
    } catch (reason) {
      dismissToast(toastId);
      const message = reason instanceof Error ? reason.message : "The contribution could not be completed.";
      setTransaction({ state: "failed", error: message });
      toast.error("Contribution failed", message);
      throw reason;
    }
  };

  if (loading) return <main className="shell route-main"><div className="route-loading"><Loader2 className="animate-spin" /> Loading campaign…</div></main>;
  if (error || !campaign) return <main className="shell route-main"><div className="route-error"><strong>Campaign unavailable</strong><p>{error}</p><Link className="button-secondary" href="/campaigns">Back to campaigns</Link></div></main>;

  return (
    <main className="shell route-main campaign-detail-route">
      <Link className="route-back" href="/campaigns"><ArrowLeft size={14} /> All campaigns</Link>
      <div className="campaign-layout"><div className="campaign-primary"><CampaignCard campaign={campaign} /><TransactionStatus transaction={transaction} onDismiss={() => setTransaction({ state: "idle" })} />{contribution > 0 && <div className="supporter-record"><span className="supporter-record-icon" aria-hidden="true"><CheckCircle2 size={17} /></span><div><span>Your recorded support</span><strong>{(contribution / 10_000_000).toFixed(2)} XLM</strong></div><small>Linked to this wallet</small></div>}</div><DonationForm onDonate={donate} isPending={transaction.state === "pending"} /></div>
      <ActivityFeed events={events} isLoading={activityLoading} hasRecordedFunding={campaign.raised > 0} />
    </main>
  );
}
