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
  runTransaction
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
  const isOfflineForDatabase = { state: 'offline', last_changed: serverTimestamp() };
  const isOnlineForDatabase = { state: 'online', last_changed: serverTimestamp() };
  const connectedRef = ref(rtdb, '.info/connected');
  onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) return;
    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
      set(userStatusDatabaseRef, isOnlineForDatabase);
    });
  });
};

export const subscribeToOnlineUsers = (callback: (onlineCount: number) => void) => {
  const statusRef = ref(rtdb, 'status');
  return onValue(statusRef, (snapshot) => {
    const statuses = snapshot.val() || {};
    const onlineCount = Object.values(statuses).filter((s: any) => s.state === 'online').length;
    callback(onlineCount);
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
  const statsRef = doc(db, 'global_stats', 'network');
  
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
    role: fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user'
  };

  await runTransaction(db, async (transaction) => {
    // 1. Check Username Uniqueness Atomically
    const nameSnap = await transaction.get(nameRef);
    if (nameSnap.exists()) {
      throw new Error("USERNAME_TAKEN");
    }

    // 2. Check if user already exists (Safety)
    const existingUserSnap = await transaction.get(userRef);
    if (existingUserSnap.exists()) {
      return; // Already established
    }

    // 3. Write Profile and Username Registry
    transaction.set(userRef, newUser);
    transaction.set(nameRef, { uid: fbUser.uid, claimedAt: Date.now() });
    
    // 4. Update global stats (Force create if missing)
    transaction.set(statsRef, { 
      totalUsers: increment(1), 
      totalMined: increment(5.0),
      activeNodes: increment(0)
    }, { merge: true });

    // 5. Handle Referrals with Cap (20 Max)
    if (referrerUid) {
      const referrerRef = doc(db, 'users', referrerUid);
      const referrerSnap = await transaction.get(referrerRef);
      if (referrerSnap.exists()) {
        const refData = referrerSnap.data() as User;
        if (refData.referralCount < MAX_REFERRALS) {
          transaction.update(referrerRef, { 
            referralCount: increment(1), 
            points: increment(REFERRAL_BONUS_POINTS) 
          });
          transaction.update(statsRef, { totalMined: increment(REFERRAL_BONUS_POINTS) });
        }
      }
    }
  });

  return newUser;
};

export const startMiningSession = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { miningActive: true, miningStartTime: Date.now() });
  await updateDoc(statsRef, { activeNodes: increment(1) });
};

export const claimPoints = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(amount), miningActive: false, miningStartTime: null });
  await updateDoc(statsRef, { totalMined: increment(amount), activeNodes: increment(-1) });
};

export const completeTask = async (uid: string, taskId: string, points: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, { points: increment(points), completedTasks: arrayUnion(taskId) });
  await updateDoc(statsRef, { totalMined: increment(points) });
};

export const fetchTasks = async (): Promise<Task[]> => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as Task);
};

export const getAllUsers = async (): Promise<User[]> => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(doc => doc.data() as User);
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
