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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!isConnected) { await connect(); return; }

    const numAmount = Number(amount);
    if (!amount || !Number.isFinite(numAmount)) { setError("Enter a valid XLM amount."); return; }
    if (numAmount < 0.0000001) { setError("The minimum contribution is 0.0000001 XLM (one stroop)."); return; }

    const balanceNum = Number(balance || "0");
    if (balanceNum > 0 && numAmount > balanceNum - 0.5) {
      setError(`This exceeds your available balance. Keep at least 0.5 XLM for network fees and the account reserve.`);
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
              <button key={preset} type="button" aria-pressed={amount === String(preset)} onClick={() => { setAmount(String(preset)); setError(null); }}>
                {preset}<small>XLM</small>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="amount-field">
          <span>Contribution amount</span>
          <span className="amount-input-wrap">
            <input className="field" type="number" inputMode="decimal" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} placeholder="0.00" min="0.0000001" step="any" aria-describedby="amount-help" />
            <strong>XLM</strong>
          </span>
        </label>

        <div id="amount-help" className="balance-line">
          <span>Available balance</span><strong>{isConnected ? `${Number(balance).toFixed(2)} XLM` : "Connect to view"}</strong>
        </div>

        {error && <p className="form-error" role="alert"><AlertCircle size={15} />{error}</p>}

        <button className="button-primary contribution-submit" type="submit" disabled={isPending}>
          {isPending ? <><Loader2 size={17} className="animate-spin" /> Confirming on Stellar…</> : isConnected ? <>Review contribution <ArrowRight size={17} /></> : <><Wallet size={17} /> Connect wallet to continue</>}
        </button>

        <p className="signature-note"><LockKeyhole size={14} /> CrowdLift cannot sign or approve transactions for you.</p>
      </form>
    </aside>
  );
}
