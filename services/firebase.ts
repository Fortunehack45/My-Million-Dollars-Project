import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
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
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { User, LeaderboardEntry } from '../types';

// Environment variables for production deployment
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID
};

// If no API Key is provided, default to Mock Mode for instant preview/deployment capability
const isMockMode = !firebaseConfig.apiKey || firebaseConfig.apiKey === "demo-key";
const app = !isMockMode ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

const MOCK_STORAGE_KEY = 'nexus_mock_user';

const getMockUser = (): User | null => {
  const data = localStorage.getItem(MOCK_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

const setMockUser = (user: User) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(user));
};

export const signInWithGoogle = async (): Promise<User | null> => {
  if (isMockMode) {
    const mockUser: User = getMockUser() || {
      uid: 'node-operator-001',
      displayName: 'Nexus Operator',
      email: 'operator@nexus.node',
      photoURL: 'https://ui-avatars.com/api/?name=Nexus+Operator&background=111114&color=F43F5E',
      points: 250,
      miningActive: false,
      miningStartTime: null,
      referralCode: 'NEX-GENESIS',
      referredBy: null,
      referralCount: 0,
      completedTasks: [],
      ownedNFT: false
    };
    if (!getMockUser()) setMockUser(mockUser);
    return mockUser;
  }

  if (!auth || !db) throw new Error("Firebase configuration missing or invalid.");
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const fbUser = result.user;
    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as User;
    } else {
      const newUser: User = {
        uid: fbUser.uid,
        displayName: fbUser.displayName,
        email: fbUser.email,
        photoURL: fbUser.photoURL,
        points: 50,
        miningActive: false,
        miningStartTime: null,
        referralCode: 'NEX-' + fbUser.uid.substring(0, 5).toUpperCase(),
        referredBy: null,
        referralCount: 0,
        completedTasks: [],
        ownedNFT: false
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.error("Authentication Service Error:", error);
    throw error;
  }
};

export const logout = async () => {
  if (isMockMode) {
    localStorage.removeItem(MOCK_STORAGE_KEY);
    window.location.reload();
    return;
  }
  if (auth) await firebaseSignOut(auth);
};

export const startMiningSession = async (uid: string) => {
  if (isMockMode) {
    const user = getMockUser();
    if (user) {
      user.miningActive = true;
      user.miningStartTime = Date.now();
      setMockUser(user);
    }
    return;
  }
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { miningActive: true, miningStartTime: Date.now() });
};

export const claimPoints = async (uid: string, amount: number) => {
  if (isMockMode) {
    const user = getMockUser();
    if (user) {
      user.points += amount;
      user.miningActive = false;
      user.miningStartTime = null;
      setMockUser(user);
    }
    return;
  }
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    points: increment(amount),
    miningActive: false,
    miningStartTime: null
  });
};

export const completeTask = async (uid: string, taskId: string, reward: number) => {
  if (isMockMode) {
    const user = getMockUser();
    if (user && !user.completedTasks.includes(taskId)) {
      user.completedTasks.push(taskId);
      user.points += reward;
      setMockUser(user);
    }
    return;
  }
  if (!db) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    completedTasks: arrayUnion(taskId),
    points: increment(reward)
  });
};

export const mintNFT = async (uid: string, cost: number) => {
  if (isMockMode) {
    const user = getMockUser();
    if (user && user.points >= cost && !user.ownedNFT) {
      user.points -= cost;
      user.ownedNFT = true;
      setMockUser(user);
      return true;
    }
    return false;
  }
  if (!db) return false;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    points: increment(-cost),
    ownedNFT: true
  });
  return true;
};

const arrayUnion = (val: string) => [val]; 

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  if (isMockMode) {
    return Array.from({ length: 10 }).map((_, i) => ({
      uid: `mock-${i}`,
      displayName: `Operator_${1000 + i}`,
      points: 8500 - (i * 600),
      rank: i + 1
    }));
  }
  if (!db) return [];
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

export { auth };