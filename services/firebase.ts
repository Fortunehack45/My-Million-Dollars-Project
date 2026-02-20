
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  limit,
  getDocs,
  arrayUnion,
  orderBy,
  onSnapshot,
  runTransaction,
  deleteDoc,
  persistentLocalCache,
  persistentMultipleTabManager,
  getAggregateFromServer,
  sum,
  count
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp
} from 'firebase/database';
import {
  User,
  Task,
  LeaderboardEntry,
  NetworkStats,
  LandingConfig,
  LegalConfig,
  AboutConfig,
  WhitepaperConfig,
  ArchitecturePageConfig,
  TokenomicsConfig,
  CareersConfig,
  ContactConfig
} from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDmi5prKatt_Z-d2-YCMmw344KbzYZv15E",
  authDomain: "argus-protocol.firebaseapp.com",
  projectId: "argus-protocol",
  storageBucket: "argus-protocol.firebasestorage.app",
  messagingSenderId: "803748553158",
  appId: "1:803748553158:web:c1547b3ddfa148eb4b92c7",
  measurementId: "G-6EVXT8DJMK"
};

// Initialize using named import
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore with forced long polling to bypass WebSocket restrictions common in some environments.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const rtdb = getDatabase(app);

export const TOTAL_SUPPLY = 1000000000;
export const ADMIN_EMAIL = "fortunedomination@gmail.com";
export const BASE_MINING_RATE = 0.06; // ARG per hour
export const REFERRAL_BOOST = 0.1; // ARG per hour per user
export const MAX_REFERRALS = 20;
export const REFERRAL_BONUS_POINTS = 0.5;
export const CURRENT_ARG_PRICE = 4.20; // Constant for valuation logic
export const DEFAULT_MAX_USERS_CAP = 500000; // Hard cap default

// Protocol Constants for Calculations
export const GENESIS_TIMESTAMP = 1704067200000; // Jan 1, 2024 00:00:00 UTC
export const AVG_BLOCK_TIME_MS = 400; // 400ms per block (GhostDAG speed)

export const calculateCurrentBlockHeight = (): number => {
  const now = Date.now();
  return Math.floor((now - GENESIS_TIMESTAMP) / AVG_BLOCK_TIME_MS);
};

// --- DEFAULT CMS CONTENT ---
export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  hero: {
    isVisible: true,
    title: "Decentralized Compute Layer",
    subtitle: "We are the high-speed rail for the multi-chain economy. Provide the most resilient, automated, and high-throughput backbone for DeFi and RWA tokenization.",
    ctaPrimary: "Deploy Validator Node",
    ctaSecondary: "Read Whitepaper"
  },
  socials: {
    twitter: "https://twitter.com/ArgusProtocol",
    discord: "https://discord.gg/argus",
    github: "https://github.com/argus-labs"
  },
  partners: {
    isVisible: true,
    title: "Powering the Fortune 500 of Web3",
    items: ['SEQUOIA_COMPUTE', 'ANDREESSEN_CLOUD', 'BINANCE_LABS', 'COINBASE_VENTURES', 'POLYCHAIN_CAPITAL']
  },
  architecture: {
    isVisible: true,
    title: "The Global Truth Layer",
    description: "Where every packet of data meets its decentralized destination. Argus acts as the primary layer of trust for the internet.",
    layers: [
      { title: 'Resilient Backbone', desc: 'Zero-touch infrastructure eliminating technical barriers.' },
      { title: 'RWA Integration', desc: 'High-throughput pipes for Real-World Asset tokenization.' },
      { title: 'Automated Logic', desc: 'AI-driven predictive scaling across 50+ chains.' }
    ]
  },
  features: {
    isVisible: true,
    title: "Zero-Touch Decentralization",
    description: "Making Web3 deployment as boring (and reliable) as a light switch.",
    items: [
      { title: "Institutional Grade", desc: "Hardware designed for the Fortune 500 running core logic.", icon: 'ShieldCheck' },
      { title: "Predictive Scaling", desc: "AI-driven allocation ensuring 99.999% uptime.", icon: 'Cpu' },
      { title: "One-Click Deploy", desc: "Seamless deployment across 50+ blockchain networks.", icon: 'Globe' }
    ]
  },
  roadmap: {
    isVisible: true,
    title: "The Argus Trajectory",
    description: "Building the universal standard for decentralized computing.",
    phases: [
      {
        phase: "01",
        title: "Genesis Epoch",
        period: "Q1 2025",
        status: "LIVE",
        desc: "Initial network bootstrapping and validator onboarding.",
        features: ["Validator Registry Contract", "Proof-of-Uptime Consensus Alpha", "Incentivized Testnet Launch"]
      },
      {
        phase: "02",
        title: "Expansion Layer",
        period: "Q3 2025",
        status: "UPCOMING",
        desc: "Scaling node topology and introducing smart contract execution.",
        features: ["EVM Compatibility Layer", "Cross-Region Sharding", "Public Stress Testing"]
      },
      {
        phase: "03",
        title: "Mainnet Singularity",
        period: "Q1 2026",
        status: "LOCKED",
        desc: "Full decentralization and governance handover.",
        features: ["Token Generation Event (TGE)", "DAO Governance Module", "Global Compute Marketplace"]
      }
    ]
  },
  faq: {
    isVisible: true,
    title: "Protocol FAQ",
    items: [
      { q: "What is Argus Protocol?", a: "Argus is the high-speed rail for the multi-chain economy, providing zero-touch infrastructure for DeFi and RWA tokenization." },
      { q: "How are rewards calculated?", a: "Rewards are based on uptime proofs and referral topology. The base rate is 0.06 ARG/hr, with multipliers for verified referral connections." },
      { q: "Is the testnet incentivized?", a: "Yes. Points earned during the Genesis Epoch will be converted to mainnet ARG tokens at TGE based on a vesting schedule." },
      { q: "Can I run multiple nodes?", a: "During Phase 1, we limit one validator ID per KYC/Identity to ensure fair distribution and network decentralization." }
    ]
  },
  cta: {
    isVisible: true,
    title: "Secure the Genesis Block",
    description: "Join the network powering the next generation of decentralized finance. Early participation ensures maximum allocation.",
    buttonText: "Initialize Node"
  },
  footer: {
    isVisible: true,
    title: "Argus Protocol",
    description: "Powering the uptime of the global digital economy.",
    copyright: "© 2026 ARGUS LABS.",
    links: {}
  }
};

export const DEFAULT_LEGAL_CONFIG: { terms: LegalConfig, privacy: LegalConfig } = {
  terms: {
    title: "Terms of Service",
    lastUpdated: "January 1, 2025",
    sections: [
      { heading: "1. Use of Service", content: "You agree to use the service only for lawful purposes. You must not use the service to distribute malware, engage in illegal financial activities, or attack the network infrastructure." },
      { heading: "2. No Financial Advice", content: "The ARG token and associated mining rewards are utility tokens for network participation. Nothing on this website constitutes financial advice. The value of cryptographic tokens is highly volatile." },
      { heading: "3. Limitation of Liability", content: "Argus Labs is not liable for any damages arising from the use or inability to use the service, including but not limited to loss of funds, data, or profits." }
    ]
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "January 1, 2025",
    sections: [
      { heading: "1. Data Collection", content: "We prioritize user anonymity. We do not collect personal identifying information (PII) unless explicitly provided (e.g., email for newsletter). Network interaction data (wallet addresses, transactions) is public on the blockchain." },
      { heading: "2. Cookies & Analytics", content: "We use local storage for session management. We may use anonymous analytics to improve service performance." },
      { heading: "3. Third Party Services", content: "Our authentication (Google Auth) is handled by Firebase. Please refer to Google's privacy policy for details on how they handle your login data." }
    ]
  }
};

export const DEFAULT_ABOUT_CONFIG: AboutConfig = {
  title: "Building the Foundation",
  subtitle: "Argus Labs is a decentralized collective of engineers, cryptographers, and system architects. We are obsessed with uptime.",
  mission: { title: "Our Mission", desc: "To eliminate the technical barrier to entry for blockchain participation through 'Zero-Touch' infrastructure." },
  vision: { title: "Our Vision", desc: "A future where Argus Protocol acts as the primary layer of trust for the internet, running on indestructible nodes." },
  collective: { title: "The Collective", desc: "Distributed across 12 timezones. No headquarters. Governed by code and consensus." },
  partners: ['SEQUOIA_COMPUTE', 'ANDREESSEN_CLOUD', 'BINANCE_LABS', 'COINBASE_VENTURES', 'POLYCHAIN_CAPITAL']
};

export const DEFAULT_WHITEPAPER_CONFIG: WhitepaperConfig = {
  title: "Argus Protocol Whitepaper",
  subtitle: "\"A specialized compute layer for the sovereign internet.\"",
  version: "v1.0",
  sections: [
    { title: "1. Abstract", content: "The current landscape of decentralized networks suffers from a trilemma of scalability, security, and decentralization. Argus Protocol introduces a novel 'Proof-of-Uptime' consensus mechanism combined with GhostDAG topology to solve this. By decoupling execution from consensus and utilizing institutional-grade hardware requirements, Argus achieves 400,000 TPS without compromising on trustlessness." },
    { title: "2. Introduction", content: "As Real World Assets (RWAs) move on-chain, the need for deterministic, high-frequency infrastructure becomes critical. Existing monolithic blockchains cannot handle the throughput required by global financial markets (NASDAQ, NYSE). Argus positions itself as the 'High-Speed Rail' connecting these markets to Web3." },
    { title: "3. Technical Architecture", content: "Unlike traditional blockchains that discard orphan blocks, GhostDAG includes them in the ledger, ordering them topologically. This allows for parallel block production and utilizes the full bandwidth of the network. A custom implementation of WASM designed for parallel transaction execution. State access is sharded by account address, allowing non-conflicting transactions to execute simultaneously on different CPU cores." },
    { title: "4. Tokenomics (ARG)", content: "The ARG token serves as gas, security staking, and governance voting weight. Total Supply: 1,000,000,000 ARG. Distribution: 40% Mining/Staking, 20% Investors, 20% Team (4yr Vest), 20% Ecosystem Fund." },
    { title: "5. Conclusion", content: "Argus is not just another L1; it is a specialized execution environment for high-value data. By prioritizing uptime and performance, we create the necessary foundation for the next decade of crypto adoption." }
  ]
};

export const DEFAULT_ARCHITECTURE_CONFIG: ArchitecturePageConfig = {
  heroTitle: "The Global Truth Layer",
  heroSubtitle: "Argus decouples consensus from execution using a novel BlockDAG topology. Linear scalability with atomic composability for institutional finance.",
  layers: [
    { title: 'GhostDAG Consensus', desc: 'Non-linear block ordering allowing parallel block creation without orphans.', stat: '400k TPS' },
    { title: 'Hyper-Sharding', desc: 'Dynamic state partitioning based on account access patterns.', stat: 'Dynamic Shards' },
    { title: 'ArgusVM', desc: 'Parallelized WASM execution environment with EVM transpiler.', stat: '< 400ms Latency' }
  ],
  features: [
    { title: "Mempool Encryption", desc: "Transactions are encrypted until ordering is finalized to prevent MEV exploitation." },
    { title: "Stake Slashing", desc: "Validators signing conflicting blocks are automatically penalized by the protocol." },
    { title: "Global Sharding", desc: "Network automatically partitions state as node count increases." }
  ]
};

export const DEFAULT_TOKENOMICS_CONFIG: TokenomicsConfig = {
  title: "Economic Architecture",
  subtitle: "A deflationary utility model designed for long-term network security and validator incentives. Powered by the ARG token.",
  totalSupply: "1,000,000,000",
  circulatingSupply: "145,000,000",
  distribution: [
    { label: "Mining / Staking Rewards", percentage: 40, color: "bg-emerald-500", value: "400M ARG" },
    { label: "Ecosystem Fund", percentage: 20, color: "bg-primary", value: "200M ARG" },
    { label: "Core Contributors", percentage: 15, color: "bg-zinc-100", value: "150M ARG" },
    { label: "Early Backers", percentage: 15, color: "bg-zinc-500", value: "150M ARG" },
    { label: "Public Sale", percentage: 10, color: "bg-amber-500", value: "100M ARG" },
  ],
  utility: [
    { title: "Gas Metering", desc: "Pay for compute cycles and storage on the GhostDAG.", icon: "Zap" },
    { title: "Validator Staking", desc: "Lock ARG to secure the network and earn yield.", icon: "Lock" },
    { title: "Governance", desc: "Vote on protocol upgrades and parameter changes.", icon: "ShieldCheck" }
  ],
  schedule: [
    { phase: "Genesis", date: "Q1 2025", allocation: "10%", action: "TGE Unlock" },
    { phase: "Cliff", date: "Q3 2025", allocation: "0%", action: "Locked" },
    { phase: "Vesting Linear", date: "Q1 2026", allocation: "5%", action: "Monthly Unlock" }
  ]
};

export const DEFAULT_CAREERS_CONFIG: CareersConfig = {
  title: "Join the Collective",
  subtitle: "We are building the operating system for the decentralized web. We need engineers, cryptographers, and system architects who are obsessed with uptime.",
  positions: [
    { title: "Distributed Systems Engineer", department: "Core Protocol", location: "Remote (Global)", type: "Full-time", description: "Design and implement the consensus engine powering GhostDAG. Rust/Go expertise required." },
    { title: "Senior Cryptographer", department: "Research", location: "Remote", type: "Full-time", description: "Research and implement ZK-proofs for privacy-preserving transactions." },
    { title: "Developer Relations Lead", department: "Growth", location: "New York / Remote", type: "Full-time", description: "Build the bridge between the protocol and the developer community." }
  ]
};

export const DEFAULT_CONTACT_CONFIG: ContactConfig = {
  title: "Contact Protocol",
  subtitle: "Our communication channels are open. For partnership inquiries, technical support, or press requests, please use the channels below.",
  email: "hello@argus.network",
  address: "Decentralized Autonomous Org.\nZug, Switzerland",
  supportHours: "24/7 Node Operations"
};

export const setupPresence = (uid: string) => {
  const userStatusDatabaseRef = ref(rtdb, `/status/${uid}`);
  const isOfflineForDatabase = { state: 'offline', last_changed: serverTimestamp(), uid };
  const isOnlineForDatabase = { state: 'online', last_changed: serverTimestamp(), uid };

  const connectedRef = ref(rtdb, '.info/connected');

  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) return;
    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
      set(userStatusDatabaseRef, isOnlineForDatabase);
    });
  }, (error) => {
    console.warn("Presence Setup Error:", error);
  });
};

export const manualOffline = async (uid: string) => {
  const userStatusDatabaseRef = ref(rtdb, `/status/${uid}`);
  await set(userStatusDatabaseRef, {
    state: 'offline',
    last_changed: serverTimestamp(),
    uid
  });
};

export const subscribeToOnlineUsers = (callback: (onlineUids: string[]) => void) => {
  const statusRef = ref(rtdb, 'status');
  return onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val() || {};
    const onlineUids = Object.keys(statuses)
      .filter((key) => statuses[key].state === 'online')
      .map((key) => statuses[key].uid);
    callback(onlineUids);
  }, (error) => {
    console.warn("Online Users Subscription Error:", error);
    callback([]);
  });
};

export const getUserData = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data() as User;
  return null;
};

// REAL-TIME USER LISTENER (For AuthContext)
// This ensures that if admin deletes the user from DB, the app knows instantly
export const subscribeToUserProfile = (uid: string, callback: (user: User | null) => void) => {
  return onSnapshot(doc(db, 'users', uid), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as User);
    } else {
      callback(null); // User deleted or doesn't exist
    }
  }, (error) => {
    console.error("Profile Subscription Error:", error);
    callback(null);
  });
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const validateReferralCode = async (code: string): Promise<string | null> => {
  if (!code) return null;
  const q = query(collection(db, "users"), where("referralCode", "==", code.toUpperCase()), limit(1));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) return querySnapshot.docs[0].id;
  return null;
};

export const checkUsernameTaken = async (username: string): Promise<boolean> => {
  const nameRef = doc(db, 'usernames', username.toLowerCase());
  const nameSnap = await getDoc(nameRef);
  return nameSnap.exists();
};

export const createInitialProfile = async (fbUser: FirebaseUser, username: string, referrerUid: string | null): Promise<User> => {
  const userRef = doc(db, 'users', fbUser.uid);
  const nameRef = doc(db, 'usernames', username.toLowerCase());

  const newUser: User = {
    uid: fbUser.uid,
    displayName: username,
    email: fbUser.email,
    photoURL: fbUser.photoURL,
    points: 5.0,
    miningActive: false,
    miningStartTime: null,
    referralCode: 'ARG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    referredBy: referrerUid,
    referralCount: 0,
    completedTasks: [],
    ownedNFT: false,
    role: fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    createdAt: Date.now()
  };

  await runTransaction(db, async (transaction) => {
    const nameSnap = await transaction.get(nameRef);
    const existingUserSnap = await transaction.get(userRef);
    if (nameSnap.exists()) throw new Error("USERNAME_TAKEN");
    if (!existingUserSnap.exists()) {
      transaction.set(userRef, newUser);
      transaction.set(nameRef, { uid: fbUser.uid, claimedAt: Date.now() });
    }
  });

  try {
    const statsRef = doc(db, 'global_stats', 'network');
    await setDoc(statsRef, {
      totalUsers: increment(1),
      totalMined: increment(5.0),
      activeNodes: increment(0)
    }, { merge: true });
  } catch (e) {
    console.warn("Global stats update skipped.");
  }

  return newUser;
};

export const getNetworkStats = async (): Promise<NetworkStats | null> => {
  const statsRef = doc(db, 'global_stats', 'network');
  const snap = await getDoc(statsRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      maxUsersCap: DEFAULT_MAX_USERS_CAP,
      ...data
    } as NetworkStats;
  }
  return null;
};

export const updateNetworkCap = async (newCap: number) => {
  const statsRef = doc(db, 'global_stats', 'network');
  await setDoc(statsRef, { maxUsersCap: newCap }, { merge: true });
};

// --- STATS RECALCULATION SERVICE ---
// Used by Admin Panel to fix drifts caused by manual DB edits
export const recalculateNetworkStats = async () => {
  try {
    const usersColl = collection(db, 'users');
    const snapshot = await getAggregateFromServer(usersColl, {
      totalUsers: count(),
      totalMined: sum('points')
    });

    const statsRef = doc(db, 'global_stats', 'network');
    await setDoc(statsRef, {
      totalUsers: snapshot.data().totalUsers,
      totalMined: snapshot.data().totalMined
    }, { merge: true });

    return true;
  } catch (e) {
    console.error("Failed to recalculate stats:", e);
    return false;
  }
};

export const syncReferralStats = async (uid: string, currentReferralCount: number, currentPoints: number) => {
  try {
    const q = query(collection(db, "users"), where("referredBy", "==", uid));
    const snapshot = await getDocs(q);
    const realCount = snapshot.size;
    if (realCount > currentReferralCount) {
      const userRef = doc(db, 'users', uid);
      const previousRewardable = Math.min(currentReferralCount, MAX_REFERRALS);
      const newRewardable = Math.min(realCount, MAX_REFERRALS);
      const rewardableDiff = Math.max(0, newRewardable - previousRewardable);
      const pointsToAdd = rewardableDiff * REFERRAL_BONUS_POINTS;
      await updateDoc(userRef, {
        referralCount: realCount,
        points: increment(pointsToAdd)
      });
      if (pointsToAdd > 0) {
        const statsRef = doc(db, 'global_stats', 'network');
        try { await updateDoc(statsRef, { totalMined: increment(pointsToAdd) }); } catch (e) { }
      }
      return { referralCount: realCount, points: currentPoints + pointsToAdd };
    }
  } catch (error) {
    console.error("Referral Sync Failed:", error);
  }
  return null;
};

export const startMiningSession = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { miningActive: true, miningStartTime: Date.now() });
  try { await updateDoc(statsRef, { activeNodes: increment(1) }); } catch (e) { }
};

export const claimPoints = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(amount), miningActive: false, miningStartTime: null });
  try { await updateDoc(statsRef, { totalMined: increment(amount), activeNodes: increment(-1) }); } catch (e) { }
};

export const completeTask = async (uid: string, taskId: string, points: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(points), completedTasks: arrayUnion(taskId) });
  // Ensure social task earnings are added to global supply
  try { await updateDoc(statsRef, { totalMined: increment(points) }); } catch (e) { }
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const allTasks = snapshot.docs.map(doc => doc.data() as Task);
    // Client-side filtering for expired tasks to ensure clean display
    const now = Date.now();
    const visibleTasks = allTasks.filter(t => !t.expiresAt || t.expiresAt > now);
    callback(visibleTasks);
  }, (error) => {
    console.warn("Tasks Subscription Error:", error);
    callback([]);
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as User);
    callback(users);
  }, (error) => {
    console.warn("Users Subscription Error:", error);
    callback([]);
  });
};

export const subscribeToNetworkStats = (callback: (stats: NetworkStats) => void) => {
  return onSnapshot(doc(db, 'global_stats', 'network'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({
        maxUsersCap: DEFAULT_MAX_USERS_CAP,
        ...data
      } as NetworkStats);
    } else {
      // Return actual initial state if DB is fresh
      callback({ totalMined: 0, totalUsers: 0, activeNodes: 0, maxUsersCap: DEFAULT_MAX_USERS_CAP });
    }
  }, (error) => {
    console.warn("Stats Subscription Error:", error);
    callback({ totalMined: 0, totalUsers: 0, activeNodes: 0, maxUsersCap: DEFAULT_MAX_USERS_CAP });
  });
};

export const addNewTask = async (task: Omit<Task, 'id'>) => {
  const taskRef = doc(collection(db, 'tasks'));
  await setDoc(taskRef, { ...task, id: taskRef.id, createdAt: Date.now() });
};

export const deleteTask = async (taskId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};

// --- REAL-TIME LEADERBOARD ---
export const subscribeToLeaderboard = (callback: (entries: LeaderboardEntry[]) => void) => {
  const q = query(collection(db, "users"), orderBy("points", "desc"), limit(25));
  return onSnapshot(q, (snapshot) => {
    const leaderboard: LeaderboardEntry[] = [];
    let rank = 1;
    snapshot.forEach((doc) => {
      const data = doc.data() as User;
      leaderboard.push({
        uid: data.uid,
        displayName: data.displayName || "Node_Operator",
        points: data.points,
        rank: rank++
      });
    });
    callback(leaderboard);
  }, (error) => {
    console.warn("Leaderboard Subscription Error:", error);
    callback([]);
  });
};

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  // Keeping for backward compatibility or one-off fetches, but recommending subscribeToLeaderboard
  const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  let rank = 1;
  querySnapshot.forEach((doc) => {
    const data = doc.data() as User;
    leaderboard.push({ uid: data.uid, displayName: data.displayName || "Node_Operator", points: data.points, rank: rank++ });
  });
  return leaderboard;
};

export const mintNFT = async (uid: string, cost: number): Promise<boolean> => {
  const userRef = doc(db, 'users', uid);
  try {
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("Operator profile not found");
      const data = userSnap.data() as User;
      if (data.points < cost) throw new Error("Insufficient ARG credits");
      transaction.update(userRef, { points: increment(-cost), ownedNFT: true });
    });
    return true;
  } catch (e) {
    console.error("NFT_MINT_FAILURE:", e);
    return false;
  }
};

export const logout = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      await Promise.race([
        manualOffline(currentUser.uid),
        new Promise(resolve => setTimeout(resolve, 800))
      ]);
    } catch (e) { }
  }
  await firebaseSignOut(auth);
};

// --- CMS SERVICES ---

export const subscribeToLandingConfig = (callback: (config: LandingConfig) => void) => {
  return onSnapshot(doc(db, 'site_content', 'landing'), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({ ...DEFAULT_LANDING_CONFIG, ...data } as LandingConfig);
    } else {
      callback(DEFAULT_LANDING_CONFIG);
    }
  }, (error) => {
    console.warn("CMS Landing Error:", error);
    callback(DEFAULT_LANDING_CONFIG);
  });
};

export const updateLandingConfig = async (config: LandingConfig) => {
  await setDoc(doc(db, 'site_content', 'landing'), config, { merge: true });
};

export const subscribeToContent = <T>(docId: string, defaultData: T, callback: (data: T) => void) => {
  return onSnapshot(doc(db, 'site_content', docId), (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback({ ...defaultData, ...data } as T);
    } else {
      callback(defaultData);
    }
  }, (error) => {
    console.warn(`CMS Error [${docId}]:`, error);
    callback(defaultData);
  });
};

export const updateContent = async (docId: string, data: any) => {
  await setDoc(doc(db, 'site_content', docId), data, { merge: true });
};

// --- ADMINISTRATIVE USER ACTIONS ---

export const deleteUserAction = async (uid: string, username: string) => {
  const userRef = doc(db, 'users', uid);
  const nameRef = doc(db, 'usernames', username.toLowerCase());
  const statsRef = doc(db, 'global_stats', 'network');

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data() as User;

    transaction.delete(userRef);
    transaction.delete(nameRef);
    transaction.update(statsRef, {
      totalUsers: increment(-1),
      totalMined: increment(-userData.points),
      activeNodes: userData.miningActive ? increment(-1) : increment(0)
    });
  });
};

export const updateUserRoleAction = async (uid: string, role: 'admin' | 'user') => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
};

export const adjustUserPointsAction = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');

  await runTransaction(db, async (transaction) => {
    transaction.update(userRef, { points: increment(amount) });
    transaction.update(statsRef, { totalMined: increment(amount) });
  });
};

// --- IP CAPTURE FOR ANTI-FRAUD ---
// Fetches the user's public IP and saves it to their Firestore profile.
// Used by AdminPanel to detect duplicate accounts / VPN registrations.
export const saveUserRegistrationIP = async (uid: string): Promise<void> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    if (!ip) return;
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { registrationIP: ip });
  } catch (e) {
    // Silently fail — IP capture is best-effort only
    console.warn('IP capture skipped:', e);
  }
};

// Subscribe to live validator count (online users via RTDB presence)
export const subscribeToLiveValidators = (callback: (count: number) => void) => {
  return subscribeToOnlineUsers((uids) => {
    callback(Math.max(1, uids.length));
  });
};
