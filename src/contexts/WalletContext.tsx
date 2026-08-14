"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { initWalletKit, getAvailableWallets } from "@/lib/wallet";
import { fetchXlmBalance } from "@/lib/stellar";

const STORAGE_CONNECTED = "crowdlift_wallet_connected";
const STORAGE_WALLET_ID = "crowdlift_wallet_id";

interface WalletContextType {
  address: string;
  balance: string;
  isConnected: boolean;
  walletName: string;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  switchWallet: (walletId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
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

  const availableWallets = useMemo(() => getAvailableWallets(), []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    try {
      const bal = await fetchXlmBalance(address);
      setBalance(bal);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  }, [address]);

  // Connect via authModal (opens the wallet selection modal with all supported wallets)
  const connect = useCallback(async (): Promise<string | null> => {
    setIsConnecting(true);
    setError(null);

    try {
      const Kit = initWalletKit();

      // Open multi-wallet modal
      const res = await Kit.authModal();

      if (res && res.address) {
        setAddress(res.address);
        setIsConnected(true);

        let activeId = "freighter";
        let activeName = "Wallet";
        try {
          const mod = Kit.selectedModule;
          if (mod) {
            activeId = mod.productId || "freighter";
            const found = availableWallets.find((w) => w.id === mod.productId);
            activeName = found?.name || mod.productName || "Wallet";
          }
        } catch {
          // Default
        }
        setWalletName(activeName);

        // Save session for auto-reconnection on page refresh
        try {
          localStorage.setItem(STORAGE_CONNECTED, "true");
          localStorage.setItem(STORAGE_WALLET_ID, activeId);
        } catch {
          // Ignore storage errors
        }

        const bal = await fetchXlmBalance(res.address);
        setBalance(bal);
        return res.address;
      }
      return null;
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
            ? String((err as { message: unknown }).message)
            : String(err || "");

      if (
        rawMessage.includes("closed the modal") ||
        rawMessage.includes("User closed")
      ) {
        setError(null);
      } else if (
        rawMessage.toLowerCase().includes("reject") ||
        rawMessage.toLowerCase().includes("denied") ||
        rawMessage.toLowerCase().includes("cancel")
      ) {
        setError("Wallet connection request was cancelled.");
      } else if (
        rawMessage.toLowerCase().includes("not installed") ||
        rawMessage.toLowerCase().includes("not connected") ||
        rawMessage.toLowerCase().includes("not available") ||
        rawMessage.toLowerCase().includes("not found")
      ) {
        setError("Selected wallet extension was not found. Please install the browser extension.");
      } else {
        setError(rawMessage || "Failed to connect wallet.");
      }

      setIsConnected(false);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [availableWallets]);

  // Switch to a specific wallet
  const switchWallet = useCallback(
    async (walletId: string) => {
      setIsConnecting(true);
      setError(null);

      try {
        const Kit = initWalletKit();
        Kit.setWallet(walletId);

        const wallet = availableWallets.find((w) => w.id === walletId);
        const name = wallet?.name || walletId;
        setWalletName(name);

        const { address: addr } = await Kit.fetchAddress();
        if (addr) {
          setAddress(addr);
          setIsConnected(true);

          try {
            localStorage.setItem(STORAGE_CONNECTED, "true");
            localStorage.setItem(STORAGE_WALLET_ID, walletId);
          } catch {
            // Ignore
          }

          const bal = await fetchXlmBalance(addr);
          setBalance(bal);
        }
      } catch (err: unknown) {
        const rawMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" && err !== null && "message" in err
              ? String((err as { message: unknown }).message)
              : String(err || "");

        if (
          rawMessage.toLowerCase().includes("not installed") ||
          rawMessage.toLowerCase().includes("not connected") ||
          rawMessage.toLowerCase().includes("not available")
        ) {
          setError(`Selected wallet (${walletId}) extension is not installed.`);
        } else {
          setError(rawMessage || `Failed to switch wallet.`);
        }
      } finally {
        setIsConnecting(false);
      }
    },
    [availableWallets]
  );

  // Disconnect & clear session
  const disconnect = useCallback(() => {
    try {
      StellarWalletsKit.disconnect();
    } catch {
      // Ignore
    }

    try {
      localStorage.removeItem(STORAGE_CONNECTED);
      localStorage.removeItem(STORAGE_WALLET_ID);
    } catch {
      // Ignore
    }

    setAddress("");
    setBalance("0");
    setIsConnected(false);
    setWalletName("");
    setError(null);
  }, []);

  // Auto-reconnect wallet session on page refresh
  useEffect(() => {
    try {
      const isSavedConnected = localStorage.getItem(STORAGE_CONNECTED) === "true";
      const savedWalletId = localStorage.getItem(STORAGE_WALLET_ID);

      if (isSavedConnected && savedWalletId) {
        const restoreSession = async () => {
          try {
            const Kit = initWalletKit();
            Kit.setWallet(savedWalletId);
            const { address: addr } = await Kit.fetchAddress();
            if (addr) {
              setAddress(addr);
              setIsConnected(true);
              const found = availableWallets.find((w) => w.id === savedWalletId);
              setWalletName(found?.name || savedWalletId);
              const bal = await fetchXlmBalance(addr);
              setBalance(bal);
            }
          } catch (err) {
            console.log("Auto-reconnect session expired or unavailable:", err);
            localStorage.removeItem(STORAGE_CONNECTED);
            localStorage.removeItem(STORAGE_WALLET_ID);
          }
        };

        restoreSession();
      }
    } catch {
      // Storage access error
    }
  }, [availableWallets]);

  // Periodically refresh balance
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(refreshBalance, 20000);
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
        clearError,
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
