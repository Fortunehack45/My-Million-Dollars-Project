
import { ethers } from 'ethers';

/**
 * EthereumService
 * Real Ethereum mainnet integration using Alchemy as the JSON-RPC provider.
 *
 * Configuration:
 *   Set VITE_ALCHEMY_API_KEY in your .env file.
 *   Get a free key at: https://alchemy.com → Create App → Ethereum → Mainnet
 */

// ─── Provider ─────────────────────────────────────────
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined;

// Build provider lazily so module loads even when key is not yet set
function getProvider(): ethers.JsonRpcProvider | null {
    if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY === 'your_alchemy_api_key_here') {
        console.warn('[EthereumService] VITE_ALCHEMY_API_KEY not set — ETH balance will show 0.00');
        return null;
    }
    return new ethers.JsonRpcProvider(
        `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
    );
}

// Simple in-memory cache to avoid hammering the RPC on every re-render
const balanceCache = new Map<string, { balance: string; expiresAt: number }>();
const CACHE_TTL_MS = 30_000; // 30 s

export class EthereumService {

    /**
     * Derives a deterministic 0x Ethereum address from the user's Firebase UID.
     * This is a convenience address for display — the user doesn't hold the
     * private key unless a proper HD wallet / Metamask integration is added.
     */
    static generateAddress(uid: string): string {
        const wallet = new ethers.Wallet(ethers.id(uid));
        return wallet.address;
    }

    /**
     * Fetches the live ETH balance for the given address from Alchemy.
     * - Falls back to "0.00" if no API key is configured OR on any network error.
     * - Results are cached for 30 seconds to minimise RPC calls.
     *
     * @param address  A valid 0x Ethereum address
     * @returns        Human-readable balance string, e.g. "1.2345"
     */
    static async getBalance(address: string): Promise<string> {
        if (!address) return '0.00';

        // Check cache first
        const cached = balanceCache.get(address);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.balance;
        }

        const provider = getProvider();
        if (!provider) return '0.00';

        try {
            const rawBalance = await provider.getBalance(address);
            const formatted = parseFloat(ethers.formatEther(rawBalance)).toFixed(6);
            balanceCache.set(address, { balance: formatted, expiresAt: Date.now() + CACHE_TTL_MS });
            return formatted;
        } catch (err) {
            console.warn('[EthereumService] getBalance failed:', err);
            return '0.00';
        }
    }

    /**
     * Returns true if the Alchemy API key is configured and non-placeholder.
     */
    static isProviderConfigured(): boolean {
        return !!ALCHEMY_API_KEY && ALCHEMY_API_KEY !== 'your_alchemy_api_key_here';
    }

    /**
     * Validates an Ethereum address format (EIP-55 checksum-aware).
     */
    static isValidAddress(address: string): boolean {
        return ethers.isAddress(address);
    }
}
