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
      className={`animate-fade-in rounded-2xl border p-5 shadow-sm ${
        isPending
          ? "border-accent-light bg-accent-light/30"
          : isSuccess
            ? "border-success-light bg-success-light/50"
            : "border-error-light bg-error-light/50"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {isPending && (
            <Loader2
              size={20}
              className="mt-0.5 animate-spin text-accent"
            />
          )}
          {isSuccess && (
            <CheckCircle2 size={20} className="mt-0.5 text-success" />
          )}
          {isFailed && (
            <XCircle size={20} className="mt-0.5 text-error" />
          )}

          {/* Content */}
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {isPending && "Transaction Pending"}
              {isSuccess && "Donation Successful"}
              {isFailed && "Transaction Failed"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {isPending &&
                "Your donation is being processed on the Stellar network…"}
              {isSuccess && "Thank you for your contribution!"}
              {isFailed &&
                (transaction.error || "Something went wrong. Please try again.")}
            </p>

            {/* Transaction hash link */}
            {transaction.hash && (
              <a
                href={getStellarExpertTxUrl(transaction.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
              >
                View on Stellar Expert
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Dismiss */}
        {!isPending && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-bg hover:text-text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
