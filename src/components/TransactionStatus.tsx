"use client";

import { CheckCircle2, CircleAlert, ExternalLink, Loader2, X } from "lucide-react";
import type { TransactionInfo } from "@/types";
import { getStellarExpertTxUrl } from "@/lib/stellar";

interface TransactionStatusProps { transaction: TransactionInfo; onDismiss: () => void; }

export default function TransactionStatus({ transaction, onDismiss }: TransactionStatusProps) {
  if (transaction.state === "idle") return null;
  const pending = transaction.state === "pending";
  const success = transaction.state === "success";

  return (
    <div className={`transaction-status transaction-${transaction.state}`} role={pending ? "status" : "alert"}>
      <span className="transaction-icon">{pending ? <Loader2 className="animate-spin" /> : success ? <CheckCircle2 /> : <CircleAlert />}</span>
      <div>
        <strong>{pending ? "Awaiting network confirmation" : success ? "Contribution confirmed" : "Contribution not completed"}</strong>
        <p>{pending ? "Keep this page open while Stellar processes the signed transaction." : success ? "The campaign total and activity record are being refreshed." : transaction.error}</p>
        {transaction.hash && <a href={getStellarExpertTxUrl(transaction.hash)} target="_blank" rel="noreferrer">View transaction <ExternalLink size={13} /></a>}
      </div>
      {!pending && <button type="button" onClick={onDismiss} aria-label="Dismiss transaction status"><X size={16} /></button>}
    </div>
  );
}
