"use client";

import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Heart, AlertCircle, Wallet, Loader2 } from "lucide-react";

interface DonationFormProps {
  onDonate: (amountXlm: number) => Promise<void>;
  isPending: boolean;
}

export default function DonationForm({ onDonate, isPending }: DonationFormProps) {
  const { isConnected, balance, connect } = useWallet();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If wallet is not connected, open wallet connect modal immediately
    if (!isConnected) {
      await connect();
      return;
    }

    if (!amount || amount.trim() === "") {
      setError("Please enter the amount of XLM you wish to donate.");
      return;
    }

    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
      setError("Please enter a valid numeric XLM amount.");
      return;
    }

    if (numAmount <= 0) {
      setError("Donation amount must be greater than 0 XLM.");
      return;
    }

    if (numAmount < 0.0000001) {
      setError("Minimum donation amount is 0.0000001 XLM (1 stroop).");
      return;
    }

    const balanceNum = parseFloat(balance || "0");
    if (balanceNum > 0 && numAmount > balanceNum - 0.5) {
      setError(
        `Insufficient XLM balance. Available: ${balanceNum.toFixed(2)} XLM. Please keep at least 0.5 XLM reserved for Stellar transaction fees and base account reserve.`
      );
      return;
    }

    try {
      await onDonate(numAmount);
      setAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Donation transaction failed.";
      setError(msg);
    }
  };

  return (
    <div className="apple-card p-6 sm:p-10 animate-fade-in-up">
      <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
        Make a Contribution
      </h2>
      <p className="mt-1 text-sm text-[#64748B]">
        Select a preset amount or enter your custom XLM donation amount below.
      </p>

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Preset Amount Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {presetAmounts.map((preset) => {
            const isSelected = amount === preset.toString();
            return (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setAmount(preset.toString());
                  setError(null);
                }}
                className={`py-3.5 px-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-[#2563EB]/20 scale-[1.02]"
                    : "bg-[#F8FAFC] text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB]/40 hover:bg-white"
                }`}
              >
                {preset} XLM
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="relative mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder="Custom amount (e.g. 15.5)"
            step="any"
            min="0"
            className="apple-input w-full py-4 px-5 pr-20 text-base font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#64748B] bg-[#E2E8F0]/60 px-2.5 py-1 rounded-lg">
            XLM
          </div>
        </div>

        {/* Error Feedback Box */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#FEE2E2] border border-[#DC2626]/20 p-4 text-xs font-medium text-[#DC2626] animate-fade-in-up">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isPending}
          className="apple-button-primary mt-5 flex w-full items-center justify-center gap-2 py-4 px-6 text-base font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Confirming on Stellar Network…</span>
            </>
          ) : isConnected ? (
            <>
              <Heart size={18} fill="currentColor" />
              <span>Donate {amount ? `${amount} XLM` : "XLM"} Now</span>
            </>
          ) : (
            <>
              <Wallet size={18} />
              <span>Connect Wallet to Donate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
