export interface WalletState {
  address: string;
  balance: string;
  isConnected: boolean;
  walletName: string;
}

export interface CampaignData {
  goal: number;
  totalRaised: number;
  title: string;
  description: string;
}

export interface CampaignRecord {
  id: string;
  onChainId?: number;
  source: "legacy" | "registry";
  creator: string;
  token?: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  raised: number;
  active: boolean;
  createdLedger?: number;
}

export interface CampaignDraft {
  title: string;
  description: string;
  category: string;
  goalXlm: number;
}

export type TransactionState = 'idle' | 'pending' | 'success' | 'failed';

export interface TransactionInfo {
  state: TransactionState;
  hash?: string;
  error?: string;
}

export type CampaignActivityType = "created" | "updated" | "status" | "contribution";

export interface CampaignActivity {
  id: string;
  type: CampaignActivityType;
  actor: string;
  amount?: number;
  totalRaised?: number;
  active?: boolean;
  timestamp: number;
  ledger: number;
  txHash: string;
}

export interface ContractError {
  code: string;
  message: string;
}
