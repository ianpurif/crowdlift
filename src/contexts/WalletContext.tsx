"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { getKit, getAvailableWallets, resetWalletKit } from "@/lib/wallet";
import { fetchXlmBalance } from "@/lib/stellar";

interface WalletContextType {
  address: string;
  balance: string;
  isConnected: boolean;
  walletName: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchWallet: (walletId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  availableWallets: { id: string; name: string }[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [isConnected, setIsConnected] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableWallets = getAvailableWallets();

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchXlmBalance(address);
      setBalance(bal);
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [address]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Ensure kit is initialized
      const Kit = getKit();

      // fetchAddress connects to the wallet and retrieves the address
      const { address: addr } = await Kit.fetchAddress();

      if (!addr) {
        throw new Error("No address returned from wallet");
      }

      setAddress(addr);
      setIsConnected(true);

      // Determine wallet name
      const wallet = availableWallets.find((w) => {
        try {
          return Kit.selectedModule.productId === w.id;
        } catch {
          return false;
        }
      });
      setWalletName(wallet?.name || "Wallet");

      // Fetch balance
      const bal = await fetchXlmBalance(addr);
      setBalance(bal);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to connect wallet";

      if (
        errorMessage.toLowerCase().includes("user") &&
        (errorMessage.toLowerCase().includes("reject") ||
          errorMessage.toLowerCase().includes("cancel") ||
          errorMessage.toLowerCase().includes("denied"))
      ) {
        setError("Connection rejected. Please approve the connection in your wallet.");
      } else if (
        errorMessage.toLowerCase().includes("not installed") ||
        errorMessage.toLowerCase().includes("not available") ||
        errorMessage.toLowerCase().includes("not found") ||
        errorMessage.toLowerCase().includes("not connected") ||
        errorMessage.toLowerCase().includes("cannot find")
      ) {
        setError(
          "Wallet not found. Please install the wallet extension and refresh the page."
        );
      } else if (
        errorMessage.toLowerCase().includes("set the wallet first") ||
        errorMessage.toLowerCase().includes("no wallet")
      ) {
        setError(
          "No wallet selected. Please install Freighter or xBull wallet extension."
        );
      } else {
        setError(errorMessage);
      }

      setIsConnected(false);
      setAddress("");
      setBalance("0");
    } finally {
      setIsConnecting(false);
    }
  }, [availableWallets]);

  const disconnect = useCallback(() => {
    try {
      StellarWalletsKit.disconnect();
    } catch {
      // Ignore disconnect errors
    }
    setAddress("");
    setBalance("0");
    setIsConnected(false);
    setWalletName("");
    setError(null);
    resetWalletKit();
  }, []);

  const switchWallet = useCallback(
    async (walletId: string) => {
      setError(null);
      try {
        const Kit = getKit();
        Kit.setWallet(walletId);

        const wallet = availableWallets.find((w) => w.id === walletId);
        setWalletName(wallet?.name || "Wallet");

        // Reconnect with new wallet
        const { address: addr } = await Kit.fetchAddress();
        if (addr) {
          setAddress(addr);
          setIsConnected(true);
          const bal = await fetchXlmBalance(addr);
          setBalance(bal);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : "Failed to switch wallet";
        setError(errorMessage);
      }
    },
    [availableWallets]
  );

  // Refresh balance periodically when connected
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, [isConnected, address, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        isConnected,
        walletName,
        isConnecting,
        error,
        connect,
        disconnect,
        switchWallet,
        refreshBalance,
        availableWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
