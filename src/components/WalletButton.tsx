"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { truncateAddress } from "@/lib/stellar";
import {
  Wallet,
  ChevronDown,
  LogOut,
  ArrowLeftRight,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function WalletButton() {
  const {
    address,
    balance,
    isConnected,
    walletName,
    isConnecting,
    error,
    connect,
    disconnect,
    switchWallet,
    availableWallets,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchWallet = async (walletId: string) => {
    setIsOpen(false);
    await switchWallet(walletId);
  };

  if (!isConnected) {
    return (
      <div>
        <button
          onClick={connect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ cursor: isConnecting ? "wait" : "pointer" }}
        >
          <Wallet size={16} />
          {isConnecting ? "Connecting…" : "Connect Wallet"}
        </button>
        {error && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-error-light px-3 py-2 text-xs text-error">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-light">
          <Wallet size={12} className="text-accent" />
        </div>
        <div className="text-left">
          <div className="text-xs text-text-secondary">{walletName}</div>
          <div className="font-semibold">{truncateAddress(address)}</div>
        </div>
        <span className="ml-1 text-xs text-text-secondary">
          {parseFloat(balance).toFixed(2)} XLM
        </span>
        <ChevronDown
          size={14}
          className={`text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 animate-fade-in rounded-xl border border-border bg-card p-2 shadow-lg z-50">
          {/* Copy address */}
          <button
            onClick={handleCopyAddress}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg"
          >
            {copied ? (
              <Check size={16} className="text-success" />
            ) : (
              <Copy size={16} className="text-text-secondary" />
            )}
            {copied ? "Copied!" : "Copy Address"}
          </button>

          {/* Switch wallet */}
          <div className="border-t border-border my-1" />
          <div className="px-3 py-1.5 text-xs font-medium text-text-secondary">
            Switch Wallet
          </div>
          {availableWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSwitchWallet(w.id)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-text-primary transition-colors hover:bg-bg"
            >
              <ArrowLeftRight size={16} className="text-text-secondary" />
              {w.name}
            </button>
          ))}

          {/* Disconnect */}
          <div className="border-t border-border my-1" />
          <button
            onClick={() => {
              setIsOpen(false);
              disconnect();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-error transition-colors hover:bg-error-light"
          >
            <LogOut size={16} />
            Disconnect
          </button>
        </div>
      )}

      {error && (
        <div className="absolute right-0 top-full mt-14 flex items-start gap-2 rounded-lg bg-error-light px-3 py-2 text-xs text-error w-64 z-40">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
