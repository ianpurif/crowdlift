"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useToast } from "@/contexts/ToastContext";
import { truncateAddress } from "@/lib/stellar";
import {
  Wallet,
  ChevronDown,
  LogOut,
  ArrowLeftRight,
  Copy,
  Check,
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
    availableWallets,
  } = useWallet();

  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
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

  // Display error as Toast when error updates
  useEffect(() => {
    if (error) {
      toast.error("Wallet Notice", error);
    }
  }, [error, toast]);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.info("Address Copied", "Full account address copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSwitchWallet = async (walletId: string) => {
    setIsOpen(false);
    await switchWallet(walletId);
  };

  const handleDisconnect = () => {
    setIsOpen(false);
    disconnect();
    toast.info("Wallet Disconnected", "Your session has been disconnected.");
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="apple-button-primary px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
          className="inline-flex items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] transition-all hover:bg-[#F8FAFC] shadow-sm cursor-pointer"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB]/10 text-[#2563EB]">
            <Wallet size={13} />
          </div>
          <div className="text-left leading-tight">
            <span className="font-semibold text-[#0F172A]">
              {truncateAddress(address)}
            </span>
          </div>
          <span className="text-xs font-bold text-[#2563EB] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full">
            {parseFloat(balance).toFixed(2)} XLM
          </span>
          <ChevronDown
            size={14}
            className={`text-[#64748B] transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Menu dropdown */}
      {isConnected && isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 animate-fade-in-up rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-xl z-50">
          <div className="px-3 py-2.5 border-b border-[#E2E8F0]/70 bg-[#F8FAFC] rounded-xl mb-1">
            <div className="flex items-center justify-between text-xs text-[#64748B] mb-0.5">
              <span>Wallet Connected</span>
              <span className="font-semibold text-[#2563EB]">{walletName}</span>
            </div>
            <p className="text-xs font-mono font-bold text-[#0F172A] truncate">
              {address}
            </p>
          </div>

          <button
            onClick={handleCopyAddress}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] cursor-pointer"
          >
            {copied ? (
              <Check size={15} className="text-[#16A34A]" />
            ) : (
              <Copy size={15} className="text-[#64748B]" />
            )}
            <span>{copied ? "Address Copied!" : "Copy Account Address"}</span>
          </button>

          <div className="border-t border-[#E2E8F0]/70 my-1" />

          <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
            Switch Wallet Extension
          </div>
          {availableWallets.map((w) => (
            <button
              key={w.id}
              onClick={() => handleSwitchWallet(w.id)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight size={14} className="text-[#64748B]" />
                <span>{w.name} Wallet</span>
              </div>
              {walletName === w.name && (
                <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
              )}
            </button>
          ))}

          <div className="border-t border-[#E2E8F0]/70 my-1" />

          <button
            onClick={handleDisconnect}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#DC2626] transition-colors hover:bg-[#FEE2E2] cursor-pointer"
          >
            <LogOut size={15} />
            <span>Disconnect Wallet</span>
          </button>
        </div>
      )}
    </div>
  );
}
