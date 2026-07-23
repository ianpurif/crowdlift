"use client";

import React, { useState } from "react";
import { getStellarExpertTxUrl, truncateAddress } from "@/lib/stellar";
import type { TransactionInfo } from "@/types";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  X,
  ShieldAlert,
} from "lucide-react";

interface TransactionStatusProps {
  transaction: TransactionInfo;
  onDismiss: () => void;
}

export default function TransactionStatus({
  transaction,
  onDismiss,
}: TransactionStatusProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  if (transaction.state === "idle") return null;

  const isPending = transaction.state === "pending";
  const isSuccess = transaction.state === "success";
  const isFailed = transaction.state === "failed";

  const handleCopyHash = async () => {
    if (!transaction.hash) return;
    try {
      await navigator.clipboard.writeText(transaction.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`apple-card p-6 animate-fade-in-up border transition-all ${
        isPending
          ? "border-[#2563EB]/40 bg-[#DBEAFE]/30"
          : isSuccess
            ? "border-[#16A34A]/40 bg-[#DCFCE7]/40"
            : "border-[#DC2626]/40 bg-[#FEE2E2]/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Status Icon */}
          <div className="mt-0.5 shrink-0">
            {isPending && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2563EB]/10 text-[#2563EB]">
                <Loader2 size={22} className="animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#16A34A]/10 text-[#16A34A]">
                <CheckCircle2 size={22} />
              </div>
            )}
            {isFailed && (
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DC2626]/10 text-[#DC2626]">
                <XCircle size={22} />
              </div>
            )}
          </div>

          {/* Message & Actions */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#0F172A]">
              {isPending && "Transaction Processing…"}
              {isSuccess && "Donation Confirmed on Stellar!"}
              {isFailed && "Transaction Unable to Complete"}
            </h3>

            <p className="mt-1 text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {isPending &&
                "Simulating footprint & awaiting signature from your Stellar wallet extension. Please check your wallet popup."}
              {isSuccess &&
                "Thank you! Your donation was successfully executed on-chain and recorded by the Soroban smart contract."}
              {isFailed &&
                (transaction.error ||
                  "The transaction failed during execution. Please check your balance and wallet network connection.")}
            </p>

            {/* Additional failure tips */}
            {isFailed && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/70 border border-[#DC2626]/20 p-2.5 text-xs text-[#DC2626]">
                <ShieldAlert size={14} className="shrink-0" />
                <span>
                  Tip: Ensure your wallet network is set to <strong>Stellar Testnet</strong> and you have sufficient XLM for transaction fees.
                </span>
              </div>
            )}

            {/* Transaction Hash & Explorer Links */}
            {transaction.hash && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <a
                  href={getStellarExpertTxUrl(transaction.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E2E8F0] px-3.5 py-2 text-xs font-semibold text-[#2563EB] transition-all hover:border-[#2563EB] shadow-sm"
                >
                  <span>View on Stellar Expert Explorer</span>
                  <ExternalLink size={13} />
                </a>

                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#0F172A] transition-all hover:bg-[#F8FAFC] shadow-sm cursor-pointer"
                >
                  {copiedHash ? (
                    <>
                      <Check size={13} className="text-[#16A34A]" />
                      <span className="text-[#16A34A]">Hash Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} className="text-[#64748B]" />
                      <span>Copy Tx Hash ({truncateAddress(transaction.hash)})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {!isPending && (
          <button
            onClick={onDismiss}
            className="rounded-xl p-1.5 text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A] cursor-pointer"
            title="Dismiss notice"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
