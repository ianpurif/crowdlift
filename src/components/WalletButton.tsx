"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, ChevronDown, Copy, Loader2, LogOut, Wallet } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress } from "@/lib/stellar";

export default function WalletButton() {
  const { address, balance, isConnected, walletName, isConnecting, error, connect, disconnect, switchWallet, clearError, availableWallets } = useWallet();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setIsOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, []);

  useEffect(() => {
    if (!error) return;
    toast.error("Wallet notice", error);
    clearError();
  }, [clearError, error, toast]);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.info("Address copied", "The full Stellar account address is on your clipboard.");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const disconnectWallet = () => {
    setIsOpen(false);
    disconnect();
    toast.info("Wallet disconnected", "This browser session is no longer connected.");
  };

  return (
    <div className="wallet-control" ref={dropdownRef}>
      {!isConnected ? (
        <button className="wallet-connect" type="button" onClick={connect} disabled={isConnecting}>
          {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Wallet size={15} />}
          <span>{isConnecting ? "Connecting…" : "Connect wallet"}</span>
        </button>
      ) : (
        <button className="wallet-trigger" type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="menu">
          <i aria-hidden="true" />
          <span className="wallet-address">{truncateAddress(address)}</span>
          <span className="wallet-balance">{Number(balance).toFixed(2)} XLM</span>
          <ChevronDown size={13} aria-hidden="true" />
        </button>
      )}

      {isConnected && isOpen && (
        <div className="wallet-menu" role="menu">
          <div className="wallet-summary">
            <span>{walletName || "Stellar wallet"}</span>
            <strong>{Number(balance).toFixed(2)} XLM</strong>
            <code>{address}</code>
          </div>
          <button type="button" role="menuitem" onClick={copyAddress}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Address copied" : "Copy account address"}</button>
          <p>Switch wallet</p>
          {availableWallets.map((wallet) => (
            <button type="button" role="menuitem" key={wallet.id} onClick={async () => { setIsOpen(false); await switchWallet(wallet.id); }}>
              <ArrowLeftRight size={14} /><span>{wallet.name}</span>{walletName === wallet.name && <i aria-label="Current wallet" />}
            </button>
          ))}
          <button className="wallet-disconnect" type="button" role="menuitem" onClick={disconnectWallet}><LogOut size={14} />Disconnect</button>
        </div>
      )}
    </div>
  );
}
