export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  points: number;
  miningActive: boolean;
  miningStartTime: number | null;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  completedTasks: string[];
  ownedNFT: boolean;
  role?: 'admin' | 'user'; // Admin role support
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: 'twitter' | 'discord' | 'telegram' | 'youtube' | 'web';
  link: string;
  actionLabel: string;
  createdAt?: number;
  timerSeconds?: number; // Optional countdown timer in seconds
}

export interface NetworkStats {
  totalMined: number;
  totalUsers: number;
  activeNodes: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  points: number;
  rank: number;
}