
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
  registrationIP?: string;  // For admin duplicate/VPN detection
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
  email: string;
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

export interface LandingConfig {
  hero: LandingSection & { ctaPrimary: string; ctaSecondary: string };
  socials: { twitter: string; discord: string; github: string };
  partners: LandingSection & { items: string[] };
  architecture: LandingSection & { layers: Array<{ title: string, desc: string }> };
  features: LandingSection & { items: Array<{ title: string, desc: string, icon: string }> };
  roadmap: LandingSection & { phases: Array<{ phase: string, title: string, period: string, status: string, desc: string, features: string[] }> };
  faq: LandingSection & { items: Array<{ q: string, a: string }> };
  cta: LandingSection & { buttonText: string };
  footer: LandingSection & { copyright: string, links: any };
}

export interface LegalConfig {
  title: string;
  lastUpdated: string;
  sections: Array<{ heading: string; content: string }>;
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
  sections: Array<{ title: string; content: string }>;
}

export interface ArchitecturePageConfig {
  heroTitle: string;
  heroSubtitle: string;
  layers: Array<{ title: string; desc: string; stat: string }>;
  features: Array<{ title: string; desc: string }>;
}

export interface TokenomicsItem {
  label: string;
  percentage: number;
  color: string;
  value: string;
}

export interface TokenomicsConfig {
  title: string;
  subtitle: string;
  totalSupply: string;
  circulatingSupply: string;
  distribution: TokenomicsItem[];
  utility: Array<{ title: string; desc: string; icon: string }>;
  schedule: Array<{ phase: string; date: string; allocation: string; action: string }>;
}

export interface JobPosition {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export interface CareersConfig {
  title: string;
  subtitle: string;
  positions: JobPosition[];
}

export interface ContactConfig {
  title: string;
  subtitle: string;
  email: string;
  address: string;
  supportHours: string;
}
