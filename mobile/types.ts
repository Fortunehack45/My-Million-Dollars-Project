
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  points: number;
  referralCode: string;
  referralCount: number;
  referredBy?: string | null;
  completedTasks: string[];
  miningActive: boolean;
  miningStartTime?: number | null;
  argAddress: string;
  ethAddress: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  link: string;
  icon?: string;
  expiresAt?: number | null;
  verificationWaitTime?: number;
  createdAt?: number;
}

export interface NetworkStats {
  totalMined: number;
  totalUsers: number;
  activeNodes: number;
  maxUsersCap?: number;
}

export interface WalletTx {
  id: string;
  uid?: string;
  fromUid?: string;
  toUid?: string | null;
  chain: 'ARG' | 'ETH';
  type?: string;
  amount: string | number;
  from?: string;
  to?: string;
  status: string;
  txHash?: string;
  gasFee?: number;
  createdAt: number;
  participants?: string[];
}
