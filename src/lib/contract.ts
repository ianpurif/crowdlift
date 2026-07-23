"use client";

import * as StellarSdk from "@stellar/stellar-sdk";
import { getSorobanServer, getNetworkPassphrase } from "./stellar";
import type { DonationEvent } from "@/types";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "";

function getContract(): StellarSdk.Contract {
  if (!CONTRACT_ID) {
    throw new Error("Contract ID not configured. Set NEXT_PUBLIC_CONTRACT_ID in .env.local");
  }
  return new StellarSdk.Contract(CONTRACT_ID);
}

/**
 * Read the campaign goal from the contract.
 */
export async function getGoal(): Promise<number> {
  const server = getSorobanServer();
  const contract = getContract();

  const account = new StellarSdk.Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0"
  );

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call("get_goal"))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationSuccess(result) && result.result) {
    const scVal = result.result.retval;
    return Number(StellarSdk.scValToNative(scVal));
  }

  return 0;
}

/**
 * Read the total amount raised from the contract.
 */
export async function getTotalRaised(): Promise<number> {
  const server = getSorobanServer();
  const contract = getContract();

  const account = new StellarSdk.Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0"
  );

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call("get_total_raised"))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationSuccess(result) && result.result) {
    const scVal = result.result.retval;
    return Number(StellarSdk.scValToNative(scVal));
  }

  return 0;
}

/**
 * Read a donor's contribution from the contract.
 */
export async function getContribution(donorAddress: string): Promise<number> {
  const server = getSorobanServer();
  const contract = getContract();

  const account = new StellarSdk.Account(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    "0"
  );

  const donorScVal = new StellarSdk.Address(donorAddress).toScVal();

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call("get_contribution", donorScVal))
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationSuccess(result) && result.result) {
    const scVal = result.result.retval;
    return Number(StellarSdk.scValToNative(scVal));
  }

  return 0;
}

/**
 * Build and prepare a donate transaction for wallet signing.
 */
export async function buildDonateTransaction(
  donorAddress: string,
  amountStroops: bigint
): Promise<StellarSdk.Transaction> {
  const server = getSorobanServer();
  const contract = getContract();

  const account = await server.getAccount(donorAddress);

  const donorScVal = new StellarSdk.Address(donorAddress).toScVal();
  const amountScVal = StellarSdk.nativeToScVal(amountStroops, { type: "i128" });

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call("donate", donorScVal, amountScVal))
    .setTimeout(60)
    .build();

  // Simulate to get the proper footprint and fees
  const simulated = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simulated)) {
    throw new Error(
      `Simulation failed: ${(simulated as StellarSdk.rpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  // Assemble the transaction with simulation results
  const assembled = StellarSdk.rpc.assembleTransaction(tx, simulated).build();
  return assembled;
}

/**
 * Submit a signed transaction to the network and wait for confirmation.
 */
export async function submitTransaction(
  signedXdr: string
): Promise<{ hash: string; success: boolean }> {
  const server = getSorobanServer();

  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    getNetworkPassphrase()
  );

  const sendResponse = await server.sendTransaction(tx);

  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${sendResponse.status}`);
  }

  // Poll for result
  const hash = sendResponse.hash;
  let getResponse: StellarSdk.rpc.Api.GetTransactionResponse;
  let attempts = 0;
  const maxAttempts = 30;

  do {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    getResponse = await server.getTransaction(hash);
    attempts++;
  } while (
    getResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < maxAttempts
  );

  if (getResponse.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) {
    return { hash, success: true };
  }

  throw new Error(
    `Transaction failed with status: ${getResponse.status}`
  );
}

/**
 * Fetch recent donation events from the contract.
 */
export async function fetchDonationEvents(
  startLedger?: number
): Promise<{ events: DonationEvent[]; latestLedger: number }> {
  if (!CONTRACT_ID) return { events: [], latestLedger: 0 };

  const server = getSorobanServer();

  try {
    const latestLedgerResponse = await server.getLatestLedger();
    const currentLedger = latestLedgerResponse.sequence;

    // Look back ~10,000 ledgers (~14 hours of Stellar Testnet history)
    const from = startLedger || Math.max(1, currentLedger - 10000);

    const topicDonate = StellarSdk.xdr.ScVal.scvSymbol("donate").toXDR("base64");

    const eventsResponse = await server.getEvents({
      startLedger: from,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
          topics: [[topicDonate]],
        },
      ],
      limit: 50,
    });

    const events: DonationEvent[] = (eventsResponse.events || []).map(
      (event, index) => {
        let donor = "Unknown";
        let amount = 0;
        let totalRaised = 0;

        try {
          if (event.value) {
            const decoded = StellarSdk.scValToNative(event.value);
            if (Array.isArray(decoded)) {
              donor = decoded[0]?.toString() || "Unknown";
              amount = Number(decoded[1] || 0);
              totalRaised = Number(decoded[2] || 0);
            }
          }
        } catch {
          // Event parsing fallback
        }

        const timestamp = event.ledgerClosedAt
          ? new Date(event.ledgerClosedAt).getTime()
          : Date.now() - index * 1000;

        return {
          id: event.id || `event-${index}-${Date.now()}`,
          donor,
          amount,
          totalRaised,
          timestamp,
          txHash: event.txHash,
        };
      }
    );

    // Sort newest first
    events.sort((a, b) => b.timestamp - a.timestamp);

    return { events, latestLedger: currentLedger };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return { events: [], latestLedger: startLedger || 0 };
  }
}
