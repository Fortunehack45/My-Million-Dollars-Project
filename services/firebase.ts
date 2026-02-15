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
  onSnapshot
} from 'firebase/firestore';
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

// Total supply defined by the protocol
export const TOTAL_SUPPLY = 1000000000;

export const getUserData = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
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
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  return null;
};

export const createInitialProfile = async (
  fbUser: FirebaseUser, 
  username: string, 
  referrerUid: string | null
): Promise<User> => {
  const userRef = doc(db, 'users', fbUser.uid);
  const statsRef = doc(db, 'global_stats', 'network');
  
  const newUser: User = {
    uid: fbUser.uid,
    displayName: username,
    email: fbUser.email,
    photoURL: fbUser.photoURL,
    points: 50,
    miningActive: false,
    miningStartTime: null,
    referralCode: 'ARG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    referredBy: referrerUid,
    referralCount: 0,
    completedTasks: [],
    ownedNFT: false,
    role: 'user'
  };

  await setDoc(userRef, newUser);
  
  // Update Global Stats
  await updateDoc(statsRef, { 
    totalUsers: increment(1),
    totalMined: increment(50) 
  }).catch(async () => {
    // If doc doesn't exist, create it
    await setDoc(statsRef, { totalUsers: 1, totalMined: 50, activeNodes: 0 });
  });

  if (referrerUid) {
    const referrerRef = doc(db, 'users', referrerUid);
    await updateDoc(referrerRef, {
      referralCount: increment(1),
      points: increment(25)
    });
    await updateDoc(statsRef, { totalMined: increment(25) });
  }

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
  await updateDoc(userRef, {
    points: increment(amount),
    miningActive: false,
    miningStartTime: null
  });
  await updateDoc(statsRef, { 
    totalMined: increment(amount),
    activeNodes: increment(-1)
  });
};

export const completeTask = async (uid: string, taskId: string, points: number) => {
  const userRef = doc(db, 'users', uid);
  const statsRef = doc(db, 'global_stats', 'network');
  await updateDoc(userRef, {
    points: increment(points),
    completedTasks: arrayUnion(taskId)
  });
  await updateDoc(statsRef, { 
    totalMined: increment(points)
  });
};

export const mintNFT = async (uid: string, cost: number): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      points: increment(-cost),
      ownedNFT: true
    });
    return true;
  } catch (error) {
    console.error("Error minting NFT:", error);
    return false;
  }
};

export const addNewTask = async (task: Omit<Task, 'id'>) => {
  const taskRef = doc(collection(db, 'tasks'));
  await setDoc(taskRef, { ...task, id: taskRef.id, createdAt: Date.now() });
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
    if (snapshot.exists()) {
      callback(snapshot.data() as NetworkStats);
    }
  });
};

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  const q = query(collection(db, "users"), orderBy("points", "desc"), limit(10));
  const querySnapshot = await getDocs(q);
  const leaderboard: LeaderboardEntry[] = [];
  let rank = 1;
  querySnapshot.forEach((doc) => {
    const data = doc.data() as User;
    leaderboard.push({
      uid: data.uid,
      displayName: data.displayName || "Node_Operator",
      points: data.points,
      rank: rank++
    });
  });
  return leaderboard;
};

export const logout = async () => {
  await firebaseSignOut(auth);
};
