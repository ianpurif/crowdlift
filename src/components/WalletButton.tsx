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
  X,
  Loader2,
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
    clearError,
    availableWallets,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSwitchWallet = async (walletId: string) => {
    setIsOpen(false);
    await switchWallet(walletId);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60 shadow-sm"
        >
          {isConnecting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Wallet size={16} />
          )}
          <span>{isConnecting ? "Connecting…" : "Connect Wallet"}</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-accent/40 hover:bg-bg shadow-sm"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">
            <Wallet size={14} />
          </div>
          <div className="text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary font-medium">
                {walletName}
              </span>
              <span className="h-1 w-1 rounded-full bg-success" />
            </div>
            <div className="font-semibold text-text-primary">
              {truncateAddress(address)}
            </div>
          </div>
          <div className="h-4 w-px bg-border my-auto" />
          <span className="text-xs font-semibold text-accent bg-accent-light px-2 py-1 rounded-md">
            {parseFloat(balance).toFixed(2)} XLM
          </span>
          <ChevronDown
            size={14}
            className={`text-text-secondary transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Menu dropdown */}
      {isConnected && isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 animate-fade-in rounded-xl border border-border bg-card p-1.5 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-border/60">
            <p className="text-xs text-text-secondary">Connected Address</p>
            <p className="text-xs font-mono font-medium text-text-primary truncate mt-0.5">
              {address}
            </p>
          </div>

          <button
            onClick={handleCopyAddress}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-bg mt-1"
          >
            {copied ? (
              <Check size={14} className="text-success" />
            ) : (
              <Copy size={14} className="text-text-secondary" />
            )}
            <span>{copied ? "Address Copied!" : "Copy Full Address"}</span>
          </button>

          <div className="border-t border-border/60 my-1" />

          <div className="px-3 py-1 text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Switch Wallet
          </div>
          {availableWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSwitchWallet(w.id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-bg"
            >
              <div className="flex items-center gap-2">
                <ArrowLeftRight size={14} className="text-text-secondary" />
                <span>{w.name}</span>
              </div>
              {walletName === w.name && (
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          ))}

          <div className="border-t border-border/60 my-1" />

          <button
            onClick={() => {
              setIsOpen(false);
              disconnect();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-error transition-colors hover:bg-error-light"
          >
            <LogOut size={14} />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      )}

      {/* Error alert toast */}
      {error && (
        <div className="absolute right-0 top-full mt-3 w-80 animate-fade-in rounded-xl border border-error/20 bg-error-light p-3.5 shadow-md z-50">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-error">Wallet Notice</p>
                <p className="text-xs text-error/90 leading-relaxed mt-0.5">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-error/60 hover:text-error rounded p-0.5"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
