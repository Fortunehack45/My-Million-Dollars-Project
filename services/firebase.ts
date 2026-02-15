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
  orderBy,
  limit,
  getDocs,
  arrayUnion
} from 'firebase/firestore';
import { User, LeaderboardEntry } from '../types';

// Your web app's Firebase configuration for Argus Protocol
const firebaseConfig = {
  apiKey: "AIzaSyDmi5prKatt_Z-d2-YCMmw344KbzYZv15E",
  authDomain: "argus-protocol.firebaseapp.com",
  projectId: "argus-protocol",
  storageBucket: "argus-protocol.firebasestorage.app",
  messagingSenderId: "803748553158",
  appId: "1:803748553158:web:c1547b3ddfa148eb4b92c7",
  measurementId: "G-6EVXT8DJMK"
};

// Initialize Firebase
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

export const signInWithGoogle = async (): Promise<User | null> => {
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
        points: 50, // Starting bonus
        miningActive: false,
        miningStartTime: null,
        referralCode: 'ARG-' + fbUser.uid.substring(0, 5).toUpperCase(),
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
  await firebaseSignOut(auth);
};

export const startMiningSession = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { 
    miningActive: true, 
    miningStartTime: Date.now() 
  });
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
    await updateDoc(userRef, {
      points: increment(-cost),
      ownedNFT: true
    });
    return true;
  }
  return false;
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

export { auth, db };