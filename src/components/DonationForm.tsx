"use client";

import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Heart, AlertCircle } from "lucide-react";

interface DonationFormProps {
  onDonate: (amountXlm: number) => Promise<void>;
  isPending: boolean;
}

export default function DonationForm({ onDonate, isPending }: DonationFormProps) {
  const { isConnected, balance } = useWallet();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const presetAmounts = [10, 25, 50, 100];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError("Please connect your wallet first.");
      return;
    }

    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      setError("Please enter a valid donation amount.");
      return;
    }

    if (numAmount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (numAmount < 0.0000001) {
      setError("Amount is too small. Minimum is 0.0000001 XLM.");
      return;
    }

    const balanceNum = parseFloat(balance);
    // Reserve 1 XLM for fees and minimum balance
    if (numAmount > balanceNum - 1) {
      setError(
        `Insufficient balance. You have ${balanceNum.toFixed(2)} XLM (1 XLM reserved for fees).`
      );
      return;
    }

    try {
      await onDonate(numAmount);
      setAmount("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Donation failed";
      setError(msg);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold text-text-primary">Make a Donation</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Support this campaign with XLM on Stellar Testnet.
      </p>

      <form onSubmit={handleSubmit} className="mt-5">
        {/* Preset amounts */}
        <div className="flex gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset.toString());
                setError(null);
              }}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                amount === preset.toString()
                  ? "border-accent bg-accent-light text-accent"
                  : "border-border bg-bg text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {preset} XLM
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div className="relative mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            placeholder="Enter amount"
            step="any"
            min="0"
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 pr-16 text-sm text-text-primary placeholder-text-secondary outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent-light"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary">
            XLM
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-error-light px-3 py-2 text-xs text-error animate-fade-in">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || !isConnected}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Processing…
            </>
          ) : (
            <>
              <Heart size={16} />
              {isConnected ? "Donate" : "Connect Wallet to Donate"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
