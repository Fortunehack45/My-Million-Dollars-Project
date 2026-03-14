
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
  role?: 'admin' | 'user';
  createdAt?: number;
  registrationIP?: string;
  argAddress?: string;
  ethAddress?: string;
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
  verificationWaitTime?: number; // Seconds user waits (hidden)
  expiresAt?: number; // Timestamp when task disappears
}

export interface ContactMessage {
  id: string;
  uid?: string | null; // Null if submitted anonymously
  name: string;
  email?: string;
  payload: string;
  createdAt: number;
  status: 'pending' | 'resolved';
}

export interface NetworkStats {
  totalMined: number;
  totalUsers: number;
  activeNodes: number;
  maxUsersCap?: number;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  points: number;
  rank: number;
}

// --- CMS Types ---

export interface LandingSection {
  isVisible: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  [key: string]: any;
}

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

export interface FooterConfig extends LandingSection {
  description: string;
  copyright: string;
  statusText: string;
  columns: FooterColumn[];
}

export interface LandingConfig {
  hero: LandingSection & { ctaPrimary: string; ctaSecondary: string };
  socials: { twitter: string; discord: string; github: string };
  partners: LandingSection & { items: Array<string | { label: string, isVisible?: boolean }> };
  architecture: LandingSection & { layers: Array<{ title: string, desc: string, isVisible?: boolean }> };
  features: LandingSection & { items: Array<{ title: string, desc: string, icon: string, isVisible?: boolean }> };
  roadmap: LandingSection & { phases: Array<{ phase: string, title: string, period: string, status: string, desc: string, features: string[], isVisible?: boolean }> };
  faq: LandingSection & { items: Array<{ q: string, a: string, isVisible?: boolean }> };
  cta: LandingSection & { buttonText: string };
  footer: FooterConfig;
}

export interface LegalConfig {
  title: string;
  lastUpdated: string;
  sections: Array<{
    heading: string;
    content: string; // rich text/html
    isVisible?: boolean;
    subsections?: Array<{ heading: string; content: string; isVisible?: boolean }>;
  }>;
}

export interface AboutConfig {
  title: string;
  subtitle: string;
  mission: { title: string; desc: string };
  vision: { title: string; desc: string };
  collective: { title: string; desc: string };
  partners: string[];
}

export interface WhitepaperConfig {
  title: string;
  subtitle: string;
  version: string;
  sections: Array<{
    title: string;
    content: string; // rich text/html
    isVisible?: boolean;
    subsections?: Array<{ title: string; content: string; isVisible?: boolean }>;
  }>;
}

export interface ArchitecturePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  layers: Array<{ title: string; desc: string; stat: string, isVisible?: boolean }>;
  features: Array<{ title: string; desc: string, isVisible?: boolean }>;
}

export interface TokenomicsItem {
  label: string;
  percentage: number;
  color: string;
  value: string;
  isVisible?: boolean;
}

export interface TokenomicsConfig {
  title: string;
  subtitle: string;
  totalSupply: string;
  circulatingSupply: string;
  distribution: TokenomicsItem[];
  utility: Array<{ title: string, desc: string, icon: string, isVisible?: boolean }>;
  schedule: Array<{ phase: string, date: string, allocation: string, action: string, isVisible?: boolean }>;
  sections?: Array<{ title: string, content: string, isVisible?: boolean }>;
}

export interface JobPosition {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  isVisible?: boolean;
}

export interface CareersConfig {
  title: string;
  subtitle: string;
  positions: JobPosition[];
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  address: string;
  supportHours: string;
}

export interface WalletTx {
  id: string;
  uid: string;
  chain: 'ARG' | 'ETH';
  type: 'SEND' | 'RECEIVE';
  amount: string;
  to: string;
  from: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  txHash: string;
  createdAt: number;
  participants: string[]; // [senderAddress, receiverAddress]
  gasFee: number;
  fromUid: string;
  toUid?: string;
}

// --- Launchpad Types ---

export interface LaunchpadCoin {
  address: string; // Contract address on Argus
  name: string;
  ticker: string;
  description: string;
  iconUrl: string;
  totalSupply: number;
  circulatingSupply: number;
  liquidity: number; // in AGR
  creatorWallet: string;
  commissionRate: number; // percentage fee for creator on buy
  socials: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  riskScore: number;
  volume24h: number;
  priceChange24h: number;
  marketCap: number; // total valuation in AGR
  price: number; // current price in AGR
  isBoosted: boolean;
  boostExpiry?: number;
  createdAt: number;
}

export interface LaunchpadTrade {
  id: string;
  coinAddress: string;
  walletAddress: string;
  socialHandle?: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  timestamp: number;
  txHash: string;
}

export interface PriceAlert {
  id: string;
  userWallet: string;
  coinAddress: string;
  targetPrice: number;
  direction: 'ABOVE' | 'BELOW';
  triggered: boolean;
  createdAt: number;
}

export interface WatchlistEntry {
  userWallet: string;
  coinAddress: string;
  addedAt: number;
}

export interface CoinBoost {
  coinAddress: string;
  boostedBy: string;
  amount: number;
  expiresAt: number;
  tier: 'BASIC' | 'PREMIUM' | 'ELITE';
}

export interface LaunchpadStats {
  volume1m: number;
  volume5m: number;
  volume1h: number;
  volume6h: number;
  volume24h: number;
  txnsCount: number;
  priceHigh24h: number;
  priceLow24h: number;
  holdersCount: number;
  buyersCount: number;
  sellersCount: number;
}
