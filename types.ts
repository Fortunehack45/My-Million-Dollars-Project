export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  points: number;
  miningActive: boolean;
  miningStartTime: number | null; // Timestamp
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  completedTasks: string[]; // Array of Task IDs
  ownedNFT: boolean; // Flag for Genesis NFT ownership
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: 'twitter' | 'discord' | 'telegram' | 'youtube' | 'web';
  link: string;
  actionLabel: string;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  points: number;
  rank: number;
}