
export const TOTAL_SUPPLY = 2000000000;
export const ADMIN_EMAIL = "fortunedomination@gmail.com";
export const BASE_MINING_RATE = 0.06; // ARG per hour
export const REFERRAL_BOOST = 0.1; // ARG per hour per user
export const MAX_REFERRALS = 20;
export const REFERRAL_BONUS_POINTS = 0.5;
export const CURRENT_ARG_PRICE = 0.5;
export const DEFAULT_MAX_USERS_CAP = 500000;

export const GENESIS_TIMESTAMP = 1704067200000; // Jan 1, 2024
export const AVG_BLOCK_TIME_MS = 400;

export const GAS_FEE_ARG = 0.001;

export const calculateCurrentBlockHeight = (): number => {
  const now = Date.now();
  return Math.floor((now - GENESIS_TIMESTAMP) / AVG_BLOCK_TIME_MS);
};
