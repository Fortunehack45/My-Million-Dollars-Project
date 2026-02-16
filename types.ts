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
  createdAt?: number;
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
  partners: LandingSection & { items: string[] };
  architecture: LandingSection & { layers: Array<{title: string, desc: string}> };
  features: LandingSection & { items: Array<{title: string, desc: string, icon: string}> };
  roadmap: LandingSection & { phases: Array<{phase: string, title: string, period: string, status: string, desc: string, features: string[]}> };
  faq: LandingSection & { items: Array<{q: string, a: string}> };
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