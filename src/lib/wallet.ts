"use client";

import {
  StellarWalletsKit,
  Networks,
} from "@creit-tech/stellar-wallets-kit";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";

let initialized = false;

/**
 * Initialize StellarWalletsKit with all default modules (Freighter, xBull, Albedo, Lobstr, Rabet, Hana, Klever, etc.).
 */
export function initWalletKit(): typeof StellarWalletsKit {
  if (!initialized) {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
    initialized = true;
  }
  return StellarWalletsKit;
}

/**
 * Get list of available supported wallets.
 */
export function getAvailableWallets(): { id: string; name: string }[] {
  return [
    { id: "freighter", name: "Freighter" },
    { id: "xbull", name: "xBull" },
    { id: "albedo", name: "Albedo" },
    { id: "lobstr", name: "Lobstr" },
    { id: "rabet", name: "Rabet" },
    { id: "hana", name: "Hana" },
  ];
}
