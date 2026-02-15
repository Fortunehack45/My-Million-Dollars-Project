import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
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
  deleteDoc
} from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  onDisconnect, 
  serverTimestamp 
} from 'firebase/database';
import { User, Task, LeaderboardEntry, NetworkStats } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyDmi5prKatt_Z-d2-YCMmw344KbzYZv15E",
  authDomain: "argus-protocol.firebaseapp.com",
  projectId: "argus-protocol",
  storageBucket: "argus-protocol.firebasestorage.app",
  messagingSenderId: "803748553158",
  appId: "1:803748553158:web:c1547b3ddfa148eb4b92c7",
  measurementId: "G-6EVXT8DJMK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export const TOTAL_SUPPLY = 1000000000;
export const ADMIN_EMAIL = "fortunedomination@gmail.com";
export const BASE_MINING_RATE = 0.06; // NEX per hour
export const REFERRAL_BOOST = 0.1; // NEX per hour per user
export const MAX_REFERRALS = 20;
export const REFERRAL_BONUS_POINTS = 0.5;

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
  });
};

export const subscribeToOnlineUsers = (callback: (onlineUids: string[]) => void) => {
  const statusRef = ref(rtdb, 'status');
  return onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val() || {};
    const onlineUids = Object.values(statuses)
      .filter((s: any) => s.state === 'online')
      .map((s: any) => s.uid);
    callback(onlineUids);
  });
};

export const getUserData = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data() as User;
  return null;
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
    referralCode: 'NEX-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    referredBy: referrerUid,
    referralCount: 0,
    completedTasks: [],
    ownedNFT: false,
    role: fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
    createdAt: Date.now()
  };

  // 1. Critical Transaction: Identity Creation
  // We only write to the user's own document and the username reservation.
  await runTransaction(db, async (transaction) => {
    const nameSnap = await transaction.get(nameRef);
    const existingUserSnap = await transaction.get(userRef);

    if (nameSnap.exists()) {
      throw new Error("USERNAME_TAKEN");
    }

    if (existingUserSnap.exists()) {
      return; 
    }

    transaction.set(userRef, newUser);
    transaction.set(nameRef, { uid: fbUser.uid, claimedAt: Date.now() });
  });

  // 2. Best-Effort Global Stats Update
  try {
    const statsRef = doc(db, 'global_stats', 'network');
    await setDoc(statsRef, { 
      totalUsers: increment(1), 
      totalMined: increment(5.0),
      activeNodes: increment(0)
    }, { merge: true });
  } catch (e) {
    console.warn("Global stats update skipped (permission/network issue).");
  }

  // Note: We DO NOT update the referrer here. 
  // The referrer will "pull" their new referral count when they next login via `syncReferralStats`.
  
  return newUser;
};

// New Function: Self-healing referral sync
// Call this on dashboard load to ensure user gets points for anyone who used their code
export const syncReferralStats = async (uid: string, currentReferralCount: number, currentPoints: number) => {
  try {
    // Query actual number of users who claim this user as their referrer
    const q = query(collection(db, "users"), where("referredBy", "==", uid));
    const snapshot = await getDocs(q);
    const realCount = snapshot.size;

    // Only update if we found more referrals than currently recorded
    if (realCount > currentReferralCount) {
      const userRef = doc(db, 'users', uid);
      
      // Calculate how many NEW referrals we need to reward
      // We cap the *rewardable* count at MAX_REFERRALS, but we track the *total* count accurately
      const previousRewardable = Math.min(currentReferralCount, MAX_REFERRALS);
      const newRewardable = Math.min(realCount, MAX_REFERRALS);
      const rewardableDiff = Math.max(0, newRewardable - previousRewardable);
      
      const pointsToAdd = rewardableDiff * REFERRAL_BONUS_POINTS;

      await updateDoc(userRef, {
        referralCount: realCount,
        points: increment(pointsToAdd)
      });

      // Update global stats if we added points
      if (pointsToAdd > 0) {
        const statsRef = doc(db, 'global_stats', 'network');
        try { await updateDoc(statsRef, { totalMined: increment(pointsToAdd) }); } catch(e) {}
      }

      console.log(`Synced referrals: Found ${realCount}, was ${currentReferralCount}. Added ${pointsToAdd} points.`);
      
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
  try { await updateDoc(statsRef, { activeNodes: increment(1) }); } catch(e) {}
};

export const claimPoints = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(amount), miningActive: false, miningStartTime: null });
  try { await updateDoc(statsRef, { totalMined: increment(amount), activeNodes: increment(-1) }); } catch(e) {}
};

export const completeTask = async (uid: string, taskId: string, points: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(points), completedTasks: arrayUnion(taskId) });
  try { await updateDoc(statsRef, { totalMined: increment(points) }); } catch(e) {}
};

export const fetchTasks = async (): Promise<Task[]> => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Task);
};

export const subscribeToTasks = (callback: (tasks: Task[]) => void) => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => doc.data() as Task);
    callback(tasks);
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(doc => doc.data() as User);
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('points', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map(doc => doc.data() as User);
    callback(users);
  });
};

export const subscribeToNetworkStats = (callback: (stats: NetworkStats) => void) => {
  return onSnapshot(doc(db, 'global_stats', 'network'), (snapshot) => {
    if (snapshot.exists()) callback(snapshot.data() as NetworkStats);
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

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
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
      if (data.points < cost) throw new Error("Insufficient NEX credits");
      transaction.update(userRef, { points: increment(-cost), ownedNFT: true });
    });
    return true;
  } catch (e) {
    console.error("NFT_MINT_FAILURE:", e);
    return false;
  }
};

export const logout = async () => {
  await firebaseSignOut(auth);
};