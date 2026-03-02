
import { ethers } from 'ethers';

const ALCHEMY_API_KEY = process.env.EXPO_PUBLIC_ALCHEMY_API_KEY as string | undefined;

const balanceCache = new Map<string, { balance: string; expiresAt: number }>();
const CACHE_TTL_MS = 30_000;

function getProvider(): ethers.JsonRpcProvider | null {
    if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === 'your_alchemy_api_key_here') {
        return null;
    }
    return new ethers.JsonRpcProvider(
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    );
}

export class EthereumService {
    /** Derives a deterministic 0x Ethereum address from the user's Firebase UID */
    static generateAddress(uid: string): string {
        const wallet = new ethers.Wallet(ethers.id(uid));
        return wallet.address;
    }

    /** Fetches the live ETH balance for the given address */
    static async getBalance(address: string): Promise<string> {
        if (!address) return '0.0000';
        const cached = balanceCache.get(address);
        if (cached && Date.now() < cached.expiresAt) return cached.balance;
        const provider = getProvider();
        if (!provider) return '0.0000';
        try {
            const rawBalance = await provider.getBalance(address);
            const formatted = parseFloat(ethers.formatEther(rawBalance)).toFixed(6);
            balanceCache.set(address, { balance: formatted, expiresAt: Date.now() + CACHE_TTL_MS });
            return formatted;
        } catch {
            return '0.0000';
        }
    }

    /** Validates an Ethereum address format */
    static isValidAddress(address: string): boolean {
        return ethers.isAddress(address);
    }
}
