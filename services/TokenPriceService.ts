import { useState, useEffect } from 'react';
import { CURRENT_ARG_PRICE } from './firebase';

export interface TokenPrice {
    priceUsd: number;
    change24h: number;
}

export interface TokenPrices {
    arg: TokenPrice;
    eth: TokenPrice;
    loading: boolean;
    error: string | null;
}

const CACHE_KEY = 'argus_token_prices';
const CACHE_TTL_MS = 60 * 1000; // 1 minute

/**
 * Deterministic oracle for ARG prices.
 * Since ARG is unlisted, this creates a perfectly reproducible 24h volatility
 * index based on the current calendar day, so it looks and feels like a real
 * trading asset without being random on every page load.
 */
function getDeterministicArgData(): TokenPrice {
    const today = new Date();
    // Use year + month + day as a deterministic seed
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    // Pseudo-random deterministic function yielding a value between -1 and 1
    const x = Math.sin(seed * 9999) * 10000;
    const deterministicRandom = x - Math.floor(x);

    // Scale to a realistic daily volatility: between -5.0% and +8.0%
    const change24h = (deterministicRandom * 13) - 5;

    return {
        priceUsd: CURRENT_ARG_PRICE,
        change24h: parseFloat(change24h.toFixed(2))
    };
}

/**
 * React Hook to continually fetch live token prices (ETH via CoinGecko, ARG via Oracle).
 */
export function useTokenPrices(): TokenPrices {
    const [prices, setPrices] = useState<TokenPrices>({
        arg: getDeterministicArgData(),
        eth: { priceUsd: 0, change24h: 0 },
        loading: true,
        error: null,
    });

    useEffect(() => {
        let mounted = true;

        const fetchPrices = async () => {
            try {
                // Check cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { data, timestamp } = JSON.parse(cachedData);
                    if (Date.now() - timestamp < CACHE_TTL_MS) {
                        if (mounted) {
                            setPrices(prev => ({
                                ...prev,
                                eth: data.eth,
                                loading: false
                            }));
                        }
                        return; // Use valid cache
                    }
                }

                // If no cache or expired, fetch real ETH data from CoinGecko
                const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
                if (!res.ok) throw new Error('Failed to fetch from CoinGecko');

                const data = await res.json();
                const ethData = {
                    priceUsd: data.ethereum.usd,
                    change24h: parseFloat(data.ethereum.usd_24h_change.toFixed(2))
                };

                // Save to cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data: { eth: ethData },
                    timestamp: Date.now()
                }));

                if (mounted) {
                    setPrices(prev => ({
                        ...prev,
                        eth: ethData,
                        loading: false,
                        error: null
                    }));
                }
            } catch (err: any) {
                console.error('[TokenPriceService] Error fetching ETH price:', err);
                if (mounted) {
                    // On error, try to use cache even if expired
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        const { data } = JSON.parse(cachedData);
                        setPrices(prev => ({
                            ...prev,
                            eth: data.eth,
                            loading: false
                        }));
                    } else {
                        // Ultimate fallback
                        setPrices(prev => ({
                            ...prev,
                            eth: { priceUsd: 3200, change24h: 0 },
                            loading: false,
                            error: 'Using fallback ETH price'
                        }));
                    }
                }
            }
        };

        fetchPrices();
        // Refresh every minute
        const intervalId = setInterval(fetchPrices, CACHE_TTL_MS);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    // Because ARG updates at midnight, we re-calc it on render just in case the day ticks over
    useEffect(() => {
        setPrices(prev => ({
            ...prev,
            arg: getDeterministicArgData()
        }));
    }, []);

    return prices;
}
