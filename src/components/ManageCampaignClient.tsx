"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Pause, Play, Save } from "lucide-react";
import CampaignForm from "@/components/CampaignForm";
import { useToast } from "@/contexts/ToastContext";
import { useWallet } from "@/contexts/WalletContext";
import { submitTransaction } from "@/lib/contract";
import { buildSetCampaignActiveTransaction, buildUpdateCampaignTransaction, getRegistryCampaign } from "@/lib/registry";
import { stroopsToXlm, truncateAddress } from "@/lib/stellar";
import { signContractTransaction } from "@/lib/wallet";
import type { CampaignDraft, CampaignRecord } from "@/types";

export default function ManageCampaignClient({ id }: { id: number }) {
  const { address, isConnected, connect } = useWallet();
  const { toast, dismissToast } = useToast();
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [draft, setDraft] = useState<CampaignDraft>({ title: "", description: "", category: "Community", goalXlm: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const value = await getRegistryCampaign(id);
      if (!value) throw new Error("Campaign not found.");
      setCampaign(value);
      setDraft({ title: value.title, description: value.description, category: value.category, goalXlm: stroopsToXlm(value.goal) });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Campaign could not be loaded."); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

  const runTransaction = async (kind: "save" | "status") => {
    if (!address || !campaign) { await connect(); return; }
    setSaving(true); setError("");
    const toastId = toast.loading(kind === "save" ? "Saving campaign" : "Updating campaign status", "Approve the change in your wallet.");
    try {
      const transaction = kind === "save" ? await buildUpdateCampaignTransaction(address, id, draft) : await buildSetCampaignActiveTransaction(address, id, !campaign.active);
      const signed = await signContractTransaction(transaction, address);
      const result = await submitTransaction(signed);
      dismissToast(toastId);
      toast.success(kind === "save" ? "Campaign updated" : campaign.active ? "Campaign paused" : "Campaign reopened", "The public campaign record has been updated.", result.hash);
      await load();
    } catch (reason) {
      dismissToast(toastId);
      const message = reason instanceof Error ? reason.message : "The campaign could not be updated.";
      setError(message); toast.error("Update failed", message);
    } finally { setSaving(false); }
  };

  if (loading) return <main className="shell route-main"><div className="route-loading"><Loader2 className="animate-spin" /> Loading campaign controls…</div></main>;
  if (error && !campaign) return <main className="shell route-main"><div className="route-error"><strong>Campaign unavailable</strong><p>{error}</p><Link href="/dashboard" className="button-secondary">Back to dashboard</Link></div></main>;
  if (!isConnected) return <main className="shell route-main"><div className="dashboard-gate"><div><h2>Connect the owner wallet</h2><p>Campaign management requires a signature from the wallet that created it.</p></div><button className="button-primary" onClick={connect}>Connect wallet</button></div></main>;
  if (!campaign || campaign.creator !== address) return <main className="shell route-main"><div className="route-error"><strong>Owner wallet required</strong><p>This campaign belongs to {campaign ? truncateAddress(campaign.creator) : "another wallet"}. Connect that wallet to manage it.</p><Link href="/dashboard" className="button-secondary">Back to dashboard</Link></div></main>;

  return (
    <main className="shell route-main manage-route">
      <Link className="route-back" href="/dashboard"><ArrowLeft size={14} /> Back to dashboard</Link>
      <div className="manage-heading"><div><p className="eyebrow">Campaign #{id}</p><h1>Manage campaign</h1><p>Changes require your wallet signature and update the public contract record.</p></div><span className={campaign.active ? "status-open" : "status-paused"}>{campaign.active ? "Open" : "Paused"}</span></div>
      <div className="manage-layout">
        <form className="campaign-form" onSubmit={(event) => { event.preventDefault(); void runTransaction("save"); }}><CampaignForm value={draft} onChange={setDraft} disabled={saving} idPrefix="manage" />{error && <p className="form-error" role="alert">{error}</p>}<div className="form-actions"><button className="button-primary" type="submit" disabled={saving}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save changes</button></div></form>
        <aside className="manage-aside"><p className="eyebrow">Campaign controls</p><h2>{campaign.active ? "Pause contributions" : "Reopen contributions"}</h2><p>{campaign.active ? "Pausing keeps the public campaign record available but prevents new contributions." : "Reopening allows supporters to contribute again."}</p><button className="button-secondary" type="button" onClick={() => void runTransaction("status")} disabled={saving}>{campaign.active ? <><Pause size={15} /> Pause campaign</> : <><Play size={15} /> Reopen campaign</>}</button><div><Check size={15} /><span><strong>Owner verified</strong>{truncateAddress(address)}</span></div></aside>
      </div>
    </main>
  );
}
