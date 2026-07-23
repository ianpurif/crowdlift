"use client";

import React, { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Heart, AlertCircle, Wallet } from "lucide-react";

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

    // If not connected, trigger wallet connect immediately!
    if (!isConnected) {
      await connect();
      return;
    }

    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      setError("Please enter a valid XLM amount.");
      return;
    }

    if (numAmount <= 0) {
      setError("Donation amount must be greater than zero.");
      return;
    }

    if (numAmount < 0.0000001) {
      setError("Minimum donation amount is 0.0000001 XLM.");
      return;
    }

    const balanceNum = parseFloat(balance || "0");
    // Require 1 XLM reserved for base reserve & tx fees
    if (balanceNum > 0 && numAmount > balanceNum - 0.5) {
      setError(
        `Insufficient XLM balance. Available: ${balanceNum.toFixed(2)} XLM (reserve required for fees).`
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Support Campaign</h3>
          <p className="mt-1 text-xs text-text-secondary">
            Directly donate XLM via Soroban smart contract on Stellar Testnet.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5">
        {/* Quick select presets */}
        <div className="grid grid-cols-4 gap-2">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setAmount(preset.toString());
                setError(null);
              }}
              className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                amount === preset.toString()
                  ? "border-accent bg-accent-light text-accent shadow-sm"
                  : "border-border bg-bg text-text-secondary hover:border-accent/40 hover:text-text-primary"
              }`}
            >
              {preset} XLM
            </button>
          ))}
        </div>

        {/* Custom input */}
        <div className="relative mt-3.5">
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
            className="w-full rounded-xl border border-border bg-bg px-4 py-3 pr-16 text-sm text-text-primary placeholder-text-secondary outline-none transition-all focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent-light"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-secondary bg-border/40 px-2 py-1 rounded">
            XLM
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-error-light border border-error/20 p-3 text-xs text-error animate-fade-in">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 px-6 text-sm font-semibold text-white transition-all hover:bg-accent-hover active:scale-[0.99] disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  d="M4 12a8 8 0 018-8"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <span>Processing Donation…</span>
            </>
          ) : isConnected ? (
            <>
              <Heart size={16} fill="currentColor" />
              <span>Donate {amount ? `${amount} XLM` : "XLM"}</span>
            </>
          ) : (
            <>
              <Wallet size={16} />
              <span>Connect Wallet to Donate</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
