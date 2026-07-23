"use client";

import React from "react";
import { getStellarExpertTxUrl } from "@/lib/stellar";
import type { TransactionInfo } from "@/types";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  X,
} from "lucide-react";

interface TransactionStatusProps {
  transaction: TransactionInfo;
  onDismiss: () => void;
}

export default function TransactionStatus({
  transaction,
  onDismiss,
}: TransactionStatusProps) {
  if (transaction.state === "idle") return null;

  const isPending = transaction.state === "pending";
  const isSuccess = transaction.state === "success";
  const isFailed = transaction.state === "failed";

  return (
    <div
      className={`animate-fade-in rounded-2xl border p-5 shadow-sm transition-all ${
        isPending
          ? "border-accent/30 bg-accent-light/40"
          : isSuccess
            ? "border-success/30 bg-success-light/60"
            : "border-error/30 bg-error-light/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          {/* Status Icon */}
          <div className="mt-0.5 shrink-0">
            {isPending && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Loader2 size={20} className="animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
                <CheckCircle2 size={20} />
              </div>
            )}
            {isFailed && (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-error/10 text-error">
                <XCircle size={20} />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              {isPending && "Transaction Pending"}
              {isSuccess && "Donation Successful!"}
              {isFailed && "Transaction Failed"}
            </h4>
            <p className="mt-1 text-xs text-text-secondary leading-relaxed">
              {isPending &&
                "Your donation transaction is being simulated and submitted to Stellar Testnet…"}
              {isSuccess &&
                "Your XLM donation has been confirmed on-chain by the Soroban smart contract."}
              {isFailed &&
                (transaction.error ||
                  "The transaction could not be completed. Please try again.")}
            </p>

            {/* Explorer link */}
            {transaction.hash && (
              <div className="mt-3">
                <a
                  href={getStellarExpertTxUrl(transaction.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card border border-border px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:border-accent"
                >
                  <span>View on Stellar Expert Explorer</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {!isPending && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-card hover:text-text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
