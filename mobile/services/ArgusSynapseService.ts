

import {
    db,
    rtdb,
} from './firebase';
import {
    doc,
    updateDoc,
    increment,
    onSnapshot,
    query,
    collection,
    where,
    orderBy,
    limit,
    getDocs,
    runTransaction,
    setDoc,
    arrayUnion
} from 'firebase/firestore';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { User, Task, NetworkStats, WalletTx } from '../types';
import {
    BASE_MINING_RATE,
    REFERRAL_BOOST,
    MAX_REFERRALS,
    REFERRAL_BONUS_POINTS
} from '../constants';
import { ethers } from 'ethers';
import { bech32 } from 'bech32';

// Static helper class
export class ArgusSynapseService {
    /** Generates a bech32 ARG address from a Firebase UID */
    static generateAddress(uid: string): string {
        try {
            const words = bech32.toWords(Buffer.from(uid.slice(0, 20).padEnd(20, '0')));
            return bech32.encode('arg', words);
        } catch {
            return 'arg1' + uid.slice(0, 20).toLowerCase();
        }
    }

    static isValidAddress(address: string): boolean {
        return typeof address === 'string' && address.startsWith('arg1');
    }
}

class ArgusSynapseServiceInstance {
    subscribeToProfile(uid: string, callback: (user: User | null) => void) {
        return onSnapshot(doc(db, 'users', uid), (snapshot) => {
            callback(snapshot.exists() ? (snapshot.data() as User) : null);
        });
    }

    setupPresence(uid: string) {
        const statusRef = ref(rtdb, `status/${uid}`);
        const offline = { state: 'offline', last_changed: serverTimestamp(), uid };
        const online = { state: 'online', last_changed: serverTimestamp(), uid };
        onValue(ref(rtdb, '.info/connected'), (snapshot) => {
            if (snapshot.val() === false) return;
            onDisconnect(statusRef).set(offline).then(() => set(statusRef, online));
        });
    }

    async startMining(uid: string) {
        const userRef = doc(db, 'users', uid);
        const statsRef = doc(db, 'global_stats', 'network');
        await updateDoc(userRef, { miningActive: true, miningStartTime: Date.now() });
        try { await updateDoc(statsRef, { activeNodes: increment(1) }); } catch { }
    }

    async stopMiningAndClaim(uid: string, amount: number) {
        const userRef = doc(db, 'users', uid);
        const statsRef = doc(db, 'global_stats', 'network');
        await updateDoc(userRef, { points: increment(amount), miningActive: false, miningStartTime: null });
        try { await updateDoc(statsRef, { totalMined: increment(amount), activeNodes: increment(-1) }); } catch { }
    }

    subscribeToTasks(callback: (tasks: Task[]) => void) {
        const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const now = Date.now();
            const allTasks = snapshot.docs.map(d => d.data() as Task);
            callback(allTasks.filter(t => !t.expiresAt || t.expiresAt > now));
        });
    }

    async completeSocialTask(uid: string, taskId: string, points: number) {
        await updateDoc(doc(db, 'users', uid), { points: increment(points), completedTasks: arrayUnion(taskId) });
        try { await updateDoc(doc(db, 'global_stats', 'network'), { totalMined: increment(points) }); } catch { }
    }

    subscribeToNetworkStats(callback: (stats: NetworkStats) => void) {
        return onSnapshot(doc(db, 'global_stats', 'network'), (snapshot) => {
            if (snapshot.exists()) callback(snapshot.data() as NetworkStats);
        });
    }

    async transferARG(params: {
        senderUid: string; senderAddress: string; recipientAddress: string;
        amount: number; gasFee: number; txHash: string;
    }) {
        const { senderUid, senderAddress, recipientAddress, amount, gasFee, txHash } = params;
        const totalDebit = amount + gasFee;

        const recipientSearch = await getDocs(
            query(collection(db, 'users'), where('argAddress', '==', recipientAddress), limit(1))
        );
        const recipientUid = recipientSearch.empty ? null : recipientSearch.docs[0].id;

        const senderRef = doc(db, 'users', senderUid);
        const txRef = doc(collection(db, 'wallet_transactions'));

        await runTransaction(db, async (transaction) => {
            const senderSnap = await transaction.get(senderRef);
            if (!senderSnap.exists()) throw new Error('Operator profile not found');
            const senderData = senderSnap.data() as User;
            if (senderData.points < totalDebit) throw new Error('Insufficient credits');
            transaction.update(senderRef, { points: increment(-totalDebit) });
            if (recipientUid) transaction.update(doc(db, 'users', recipientUid), { points: increment(amount) });
            transaction.set(txRef, {
                id: txRef.id, uid: senderUid, fromUid: senderUid, toUid: recipientUid || null,
                chain: 'ARG', type: 'SEND', amount: String(amount), from: senderAddress,
                to: recipientAddress, status: 'CONFIRMED', txHash,
                createdAt: Date.now(), participants: [senderAddress, recipientAddress], gasFee,
            });
        });
    }
}

export const argusSynapse = new ArgusSynapseServiceInstance();
