"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Loader2, LockKeyhole, Wallet } from "lucide-react";
import CampaignForm from "@/components/CampaignForm";
import { useToast } from "@/contexts/ToastContext";
import { useWallet } from "@/contexts/WalletContext";
import { submitTransaction } from "@/lib/contract";
import { buildCreateCampaignTransaction, getCreatorCampaigns, isCampaignRegistryConfigured } from "@/lib/registry";
import { truncateAddress } from "@/lib/stellar";
import { signContractTransaction } from "@/lib/wallet";
import type { CampaignDraft } from "@/types";

const initialDraft: CampaignDraft = { title: "", description: "", category: "Community", goalXlm: 0 };

export default function NewCampaignPage() {
  const router = useRouter();
  const { address, isConnected, isConnecting, connect } = useWallet();
  const { toast, dismissToast } = useToast();
  const [draft, setDraft] = useState(initialDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!isConnected || !address) { await connect(); return; }
    if (!isCampaignRegistryConfigured()) { setError("Campaign publishing is not configured."); return; }
    if (!draft.title.trim() || !draft.description.trim() || draft.goalXlm <= 0) { setError("Complete the title, story, and funding goal."); return; }

    setSubmitting(true);
    const toastId = toast.loading("Publishing campaign", "Review and approve the campaign in your wallet.");
    try {
      const transaction = await buildCreateCampaignTransaction(address, { ...draft, title: draft.title.trim(), description: draft.description.trim() });
      const signed = await signContractTransaction(transaction, address);
      const result = await submitTransaction(signed);
      const returned = result.returnValue as { id?: bigint | number } | undefined;
      let id = returned?.id ? Number(returned.id) : 0;
      if (!id) {
        const owned = await getCreatorCampaigns(address);
        id = owned.at(-1)?.onChainId || 0;
      }
      dismissToast(toastId);
      toast.success("Campaign published", "Your wallet now owns this campaign record.", result.hash);
      router.push(id ? `/campaigns/registry-${id}` : "/dashboard");
    } catch (reason) {
      dismissToast(toastId);
      const message = reason instanceof Error ? reason.message : "The campaign could not be published.";
      setError(message);
      toast.error("Campaign not published", message);
    } finally { setSubmitting(false); }
  };

  return (
    <main className="shell route-main create-route">
      <Link className="route-back" href="/campaigns"><ArrowLeft size={14} /> Back to campaigns</Link>
      <div className="create-layout">
        <section>
          <div className="route-heading"><div><p className="eyebrow">Publish with your wallet</p><h1>Start a campaign</h1><p>Your campaign details and wallet ownership are written to the public registry.</p></div></div>
          <form className="campaign-form" onSubmit={submit}>
            <CampaignForm value={draft} onChange={setDraft} disabled={submitting} idPrefix="create" />
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-actions"><Link className="button-secondary" href="/campaigns">Cancel</Link><button className="button-primary" type="submit" disabled={submitting}>{submitting ? <><Loader2 size={16} className="animate-spin" /> Publishing…</> : isConnected ? <>Publish campaign <ArrowRight size={16} /></> : <><Wallet size={16} /> Connect wallet</>}</button></div>
          </form>
        </section>

        <aside className="creation-aside">
          <p className="eyebrow">Campaign ownership</p>
          <div className="identity-check"><span>{isConnected ? <Check size={18} /> : <Wallet size={18} />}</span><div><strong>{isConnected ? truncateAddress(address) : "Wallet not connected"}</strong><p>{isConnected ? "This address will own and manage the campaign." : "Connect the wallet that should own the campaign."}</p></div></div>
          <ul><li><LockKeyhole size={15} /><span><strong>No admin account</strong>Your wallet signature controls campaign changes.</span></li><li><Check size={15} /><span><strong>Direct contributions</strong>Funds move to your wallet when supporters contribute.</span></li><li><Check size={15} /><span><strong>Public record</strong>Ownership, content, totals, and status remain verifiable.</span></li></ul>
          {!isConnected && <button className="button-secondary" type="button" onClick={connect} disabled={isConnecting}>{isConnecting ? "Connecting…" : "Connect wallet"}</button>}
        </aside>
      </div>
    </main>
  );
}
