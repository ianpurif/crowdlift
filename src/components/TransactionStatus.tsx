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
      className={`apple-card p-6 animate-fade-in-up border ${
        isPending
          ? "border-[#2563EB]/30 bg-[#DBEAFE]/40"
          : isSuccess
            ? "border-[#16A34A]/30 bg-[#DCFCE7]/60"
            : "border-[#DC2626]/30 bg-[#FEE2E2]/60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-0.5 shrink-0">
            {isPending && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A]">
                <CheckCircle2 size={24} />
              </div>
            )}
            {isFailed && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DC2626]/10 text-[#DC2626]">
                <XCircle size={24} />
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              {isPending && "Transaction Pending…"}
              {isSuccess && "Donation Confirmed!"}
              {isFailed && "Transaction Failed"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {isPending &&
                "Simulating footprint and submitting transaction to Stellar Testnet…"}
              {isSuccess &&
                "Thank you! Your donation was recorded on-chain by the Soroban contract."}
              {isFailed &&
                (transaction.error ||
                  "The transaction could not be processed. Please check your account and try again.")}
            </p>

            {/* Stellar Expert Link */}
            {transaction.hash && (
              <div className="mt-4">
                <a
                  href={getStellarExpertTxUrl(transaction.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#E2E8F0] px-4 py-2 text-xs font-semibold text-[#2563EB] transition-all hover:border-[#2563EB] shadow-sm"
                >
                  <span>View Transaction on Stellar Expert</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {!isPending && (
          <button
            onClick={onDismiss}
            className="rounded-xl p-1.5 text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A] cursor-pointer"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
