"use client";

import {
  StellarWalletsKit,
  Networks,
} from "@creit-tech/stellar-wallets-kit";
import { FreighterModule, FREIGHTER_ID } from "@creit-tech/stellar-wallets-kit/modules/freighter";
import { xBullModule, XBULL_ID } from "@creit-tech/stellar-wallets-kit/modules/xbull";

let initialized = false;

/**
 * Initialize StellarWalletsKit with Freighter and xBull modules.
 * Uses the v2.5 static API.
 */
export function initWalletKit(): void {
  if (initialized) return;

  StellarWalletsKit.init({
    network: Networks.TESTNET,
    modules: [new FreighterModule(), new xBullModule()],
  });

  initialized = true;
}

/**
 * Get the StellarWalletsKit static class (ensures initialization first).
 */
export function getKit(): typeof StellarWalletsKit {
  initWalletKit();
  return StellarWalletsKit;
}

/**
 * Get list of available wallet module IDs and names.
 */
export function getAvailableWallets(): { id: string; name: string }[] {
  return [
    { id: FREIGHTER_ID, name: "Freighter" },
    { id: XBULL_ID, name: "xBull" },
  ];
}

/**
 * Reset initialization state (for disconnect/reconnect).
 */
export function resetWalletKit(): void {
  initialized = false;
}

export { FREIGHTER_ID, XBULL_ID };
