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

export type TransactionState = 'idle' | 'pending' | 'success' | 'failed';

export interface TransactionInfo {
  state: TransactionState;
  hash?: string;
  error?: string;
}

export interface DonationEvent {
  id: string;
  donor: string;
  amount: number;
  totalRaised: number;
  timestamp: number;
  txHash?: string;
}

export interface ContractError {
  code: string;
  message: string;
}
