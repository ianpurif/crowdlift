"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2, LockKeyhole, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

interface DonationFormProps {
  onDonate: (amountXlm: number) => Promise<void>;
  isPending: boolean;
}

export default function DonationForm({ onDonate, isPending }: DonationFormProps) {
  const { isConnected, balance, connect } = useWallet();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const presetAmounts = [10, 25, 50, 100];
  const spendableBalance = Math.max(0, Number(balance || "0") - 1);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!isConnected) { await connect(); return; }

    const numAmount = Number(amount);
    if (!amount || !Number.isFinite(numAmount)) { setError("Enter a valid XLM amount."); return; }
    if (numAmount < 0.0000001) { setError("The minimum contribution is 0.0000001 XLM (one stroop)."); return; }
    if ((amount.split(".")[1]?.length || 0) > 7) { setError("XLM supports up to 7 decimal places."); return; }
    if (numAmount > spendableBalance) {
      setError("This exceeds your spendable balance after keeping 1 XLM available.");
      return;
    }

    try { await onDonate(numAmount); setAmount(""); }
    catch (err) { setError(err instanceof Error ? err.message : "The contribution could not be completed."); }
  };

  return (
    <aside className="contribution-panel" aria-labelledby="contribution-title">
      <div className="contribution-heading">
        <p className="eyebrow">Support this campaign</p>
        <h2 id="contribution-title">Make a contribution</h2>
        <p>Choose an amount. You’ll review and sign the transaction in your connected wallet.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="amount-presets">
          <legend>Quick amounts</legend>
          <div>
            {presetAmounts.map((preset) => (
              <button key={preset} type="button" disabled={isPending || (isConnected && preset > spendableBalance)} aria-pressed={amount === String(preset)} onClick={() => { setAmount(String(preset)); setError(null); }}>
                {preset}<small>XLM</small>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="amount-field">
          <span>Contribution amount</span>
          <span className="amount-input-wrap">
            <input className="field" type="number" inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="0.00" min="0.0000001" max={isConnected ? spendableBalance : undefined} step="0.0000001" aria-describedby="amount-help" />
            <strong>XLM</strong>
          </span>
        </label>

        <div id="amount-help" className="balance-line">
          <span>Spendable balance</span><strong>{isConnected ? `${spendableBalance.toFixed(2)} XLM` : "Connect to view"}</strong>
        </div>

        {error && <p className="form-error" role="alert"><AlertCircle size={15} />{error}</p>}

        <button className="button-primary contribution-submit" type="submit" disabled={isPending || (isConnected && spendableBalance <= 0)}>
          {isPending ? <><Loader2 size={17} className="animate-spin" /> Confirming on Stellar…</> : isConnected ? <>Review contribution <ArrowRight size={17} /></> : <><Wallet size={17} /> Connect wallet to continue</>}
        </button>

        <p className="signature-note"><LockKeyhole size={14} /> CrowdLift cannot sign or approve transactions for you.</p>
      </form>
    </aside>
  );
}
