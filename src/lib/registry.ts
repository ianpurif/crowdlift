"use client";

import * as StellarSdk from "@stellar/stellar-sdk";
import { getNetworkPassphrase, getSorobanServer } from "@/lib/stellar";
import type { CampaignDraft, CampaignRecord } from "@/types";

const REGISTRY_ID =
  process.env.NEXT_PUBLIC_CAMPAIGN_REGISTRY_ID ||
  "CC5TW6SNJVV7FQ2FMDCWW2Y2AW66AK564QBLCMUZLLSV3NHWSEYHM6YK";
const NATIVE_TOKEN_ID =
  process.env.NEXT_PUBLIC_NATIVE_TOKEN_CONTRACT_ID ||
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const READ_ACCOUNT = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

type NativeCampaign = {
  id: bigint | number;
  creator: StellarSdk.Address | string;
  token: StellarSdk.Address | string;
  title: string;
  description: string;
  category: string;
  goal: bigint | number;
  raised: bigint | number;
  active: boolean;
  created_ledger: number;
};

export function isCampaignRegistryConfigured() {
  return Boolean(REGISTRY_ID && NATIVE_TOKEN_ID);
}

function contract() {
  if (!REGISTRY_ID) throw new Error("Campaign creation is not configured yet.");
  return new StellarSdk.Contract(REGISTRY_ID);
}

function address(value: StellarSdk.Address | string) {
  return typeof value === "string" ? value : value.toString();
}

function decodeCampaign(value: NativeCampaign): CampaignRecord {
  const id = Number(value.id);
  return {
    id: `registry-${id}`,
    onChainId: id,
    source: "registry",
    creator: address(value.creator),
    token: address(value.token),
    title: value.title,
    description: value.description,
    category: value.category,
    goal: Number(value.goal),
    raised: Number(value.raised),
    active: value.active,
    createdLedger: Number(value.created_ledger),
  };
}

async function read(method: string, ...args: StellarSdk.xdr.ScVal[]) {
  const transaction = new StellarSdk.TransactionBuilder(new StellarSdk.Account(READ_ACCOUNT, "0"), {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  }).addOperation(contract().call(method, ...args)).setTimeout(30).build();
  const result = await getSorobanServer().simulateTransaction(transaction);
  if (!StellarSdk.rpc.Api.isSimulationSuccess(result) || !result.result) throw new Error(`Unable to read ${method}.`);
  return StellarSdk.scValToNative(result.result.retval);
}

async function buildWrite(source: string, method: string, ...args: StellarSdk.xdr.ScVal[]) {
  const server = getSorobanServer();
  const sourceAccount = await server.getAccount(source);
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  }).addOperation(contract().call(method, ...args)).setTimeout(60).build();
  const simulation = await server.simulateTransaction(transaction);
  if (StellarSdk.rpc.Api.isSimulationError(simulation)) throw new Error(`Contract simulation failed: ${simulation.error}`);
  return StellarSdk.rpc.assembleTransaction(transaction, simulation).build();
}

export async function getRegistryCampaigns(): Promise<CampaignRecord[]> {
  if (!isCampaignRegistryConfigured()) return [];
  const values = await read(
    "list_campaigns",
    StellarSdk.nativeToScVal(1, { type: "u64" }),
    StellarSdk.nativeToScVal(50, { type: "u32" }),
  ) as NativeCampaign[];
  return values.map(decodeCampaign);
}

export async function getRegistryCampaign(id: number): Promise<CampaignRecord | null> {
  if (!isCampaignRegistryConfigured()) return null;
  const value = await read("get_campaign", StellarSdk.nativeToScVal(id, { type: "u64" })) as NativeCampaign | null;
  return value ? decodeCampaign(value) : null;
}

export async function getCreatorCampaigns(creator: string): Promise<CampaignRecord[]> {
  if (!isCampaignRegistryConfigured()) return [];
  const ids = await read("get_creator_campaigns", new StellarSdk.Address(creator).toScVal()) as Array<bigint | number>;
  const campaigns = await Promise.all(ids.map((id) => getRegistryCampaign(Number(id))));
  return campaigns.filter((campaign): campaign is CampaignRecord => Boolean(campaign));
}

export async function getRegistryContribution(id: number, donor: string): Promise<number> {
  if (!isCampaignRegistryConfigured()) return 0;
  return Number(await read(
    "get_contribution",
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    new StellarSdk.Address(donor).toScVal(),
  ));
}

export function buildCreateCampaignTransaction(creator: string, draft: CampaignDraft) {
  if (!NATIVE_TOKEN_ID) throw new Error("Campaign funding asset is not configured.");
  return buildWrite(
    creator,
    "create_campaign",
    new StellarSdk.Address(creator).toScVal(),
    new StellarSdk.Address(NATIVE_TOKEN_ID).toScVal(),
    StellarSdk.nativeToScVal(draft.title, { type: "string" }),
    StellarSdk.nativeToScVal(draft.description, { type: "string" }),
    StellarSdk.nativeToScVal(draft.category, { type: "string" }),
    StellarSdk.nativeToScVal(BigInt(Math.round(draft.goalXlm * 10_000_000)), { type: "i128" }),
  );
}

export function buildUpdateCampaignTransaction(creator: string, id: number, draft: CampaignDraft) {
  return buildWrite(
    creator,
    "update_campaign",
    new StellarSdk.Address(creator).toScVal(),
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.nativeToScVal(draft.title, { type: "string" }),
    StellarSdk.nativeToScVal(draft.description, { type: "string" }),
    StellarSdk.nativeToScVal(draft.category, { type: "string" }),
    StellarSdk.nativeToScVal(BigInt(Math.round(draft.goalXlm * 10_000_000)), { type: "i128" }),
  );
}

export function buildSetCampaignActiveTransaction(creator: string, id: number, active: boolean) {
  return buildWrite(
    creator,
    "set_active",
    new StellarSdk.Address(creator).toScVal(),
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.nativeToScVal(active),
  );
}

export function buildRegistryContributionTransaction(donor: string, id: number, amountStroops: bigint) {
  return buildWrite(
    donor,
    "contribute",
    new StellarSdk.Address(donor).toScVal(),
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.nativeToScVal(amountStroops, { type: "i128" }),
  );
}
