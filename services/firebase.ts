
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
  orderBy
} from 'firebase/firestore';
import { User, LeaderboardEntry } from '../types';

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
const auth = getAuth(app);
const db = getFirestore(app);

export const getUserData = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};

// Only performs the login, doesn't create the profile yet
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
    return querySnapshot.docs[0].id; // Return the UID of the referrer
  }
  return null;
};

export const createInitialProfile = async (
  fbUser: FirebaseUser, 
  username: string, 
  referrerUid: string | null
): Promise<User> => {
  const userRef = doc(db, 'users', fbUser.uid);
  
  const newUser: User = {
    uid: fbUser.uid,
    displayName: username,
    email: fbUser.email,
    photoURL: fbUser.photoURL,
    points: 50, // Welcome bonus
    miningActive: false,
    miningStartTime: null,
    referralCode: 'ARG-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
    referredBy: referrerUid,
    referralCount: 0,
    completedTasks: [],
    ownedNFT: false
  };

  await setDoc(userRef, newUser);

  // If referred by someone, increment their count
  if (referrerUid) {
    const referrerRef = doc(db, 'users', referrerUid);
    await updateDoc(referrerRef, {
      referralCount: increment(1),
      points: increment(25) // Referrer bonus
    });
  }

  return newUser;
};

export const logout = async () => {
  await firebaseSignOut(auth);
};

export const startMiningSession = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { miningActive: true, miningStartTime: Date.now() });
};

export const claimPoints = async (uid: string, amount: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    points: increment(amount),
    miningActive: false,
    miningStartTime: null
  });
};

export const completeTask = async (uid: string, taskId: string, reward: number) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    completedTasks: arrayUnion(taskId),
    points: increment(reward)
  });
};

export const mintNFT = async (uid: string, cost: number) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists() && userSnap.data().points >= cost) {
    await updateDoc(userRef, { points: increment(-cost), ownedNFT: true });
    return true;
  }
  return false;
};

export const getLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  // Added orderBy to the query
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

export { auth, db };
