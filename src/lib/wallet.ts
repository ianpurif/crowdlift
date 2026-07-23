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
 */
export function initWalletKit(): typeof StellarWalletsKit {
  if (!initialized) {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: [new FreighterModule(), new xBullModule()],
    });
    initialized = true;
  }
  return StellarWalletsKit;
}

/**
 * Get list of available wallet options.
 */
export function getAvailableWallets(): { id: string; name: string }[] {
  return [
    { id: FREIGHTER_ID, name: "Freighter" },
    { id: XBULL_ID, name: "xBull" },
  ];
}

export { FREIGHTER_ID, XBULL_ID };
