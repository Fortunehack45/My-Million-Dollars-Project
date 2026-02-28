
import { bech32 } from 'bech32';
import { ethers } from 'ethers';

/**
 * ArgusSynapseService
 * Argus Protocol address generation and validation layer.
 * All ledger writes go through Firestore (transferARG in firebase.ts).
 * No direct gateway calls — no localhost dependencies.
 */

export interface ArgusTransaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    timestamp: number;
    status: 'PENDING' | 'CONFIRMED' | 'FAILED';
    blueScore?: number;
}

export class ArgusSynapseService {
    private static PREFIX = 'arg';

    /**
     * Generates a unique Argus address starting with 'arg...' using Bech32.
     * Deterministic: same UID always produces the same address.
     */
    static generateAddress(publicKey: string): string {
        const data = ethers.getBytes(ethers.id(publicKey)).slice(0, 20);
        const words = bech32.toWords(data);
        return bech32.encode(this.PREFIX, words);
    }

    /**
     * Validates an Argus address (must have 'arg' prefix and valid Bech32 encoding).
     */
    static isValidAddress(address: string): boolean {
        try {
            const decoded = bech32.decode(address);
            return decoded.prefix === this.PREFIX;
        } catch {
            return false;
        }
    }
}
