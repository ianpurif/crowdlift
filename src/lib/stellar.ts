"use client";

import * as StellarSdk from "@stellar/stellar-sdk";

const SOROBAN_RPC_URL =
  process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || StellarSdk.Networks.TESTNET;

// Soroban RPC server instance
export function getSorobanServer(): StellarSdk.rpc.Server {
  return new StellarSdk.rpc.Server(SOROBAN_RPC_URL);
}

// Horizon server for balance queries
export function getHorizonUrl(): string {
  return HORIZON_URL;
}

export function getNetworkPassphrase(): string {
  return NETWORK_PASSPHRASE;
}

/**
 * Fetch native XLM balance for a Stellar address using Horizon REST API.
 */
export async function fetchXlmBalance(address: string): Promise<string> {
  try {
    const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
    if (!response.ok) {
      if (response.status === 404) return "0";
      throw new Error(`Horizon error: ${response.status}`);
    }
    const data = await response.json();
    const nativeBalance = data.balances?.find(
      (b: { asset_type: string; balance: string }) => b.asset_type === "native"
    );
    return nativeBalance?.balance || "0";
  } catch (error) {
    console.error("Failed to fetch XLM balance:", error);
    return "0";
  }
}

/**
 * Convert XLM to stroops (1 XLM = 10,000,000 stroops).
 */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

/**
 * Convert stroops to XLM.
 */
export function stroopsToXlm(stroops: bigint | number): number {
  return Number(stroops) / 10_000_000;
}

/**
 * Truncate a Stellar address for display.
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Build Stellar Expert testnet URL for a transaction hash.
 */
export function getStellarExpertTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}
