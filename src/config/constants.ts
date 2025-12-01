/**
 * Contract query configuration
 * Sepolia block time is ~12 seconds
 */
// Frequently changing data (clearing price, currency raised, blocks)
export const CONTRACT_QUERY_CONFIG = {
  refetchInterval: 60000, // 1 minute
  staleTime: 50000, // 50 seconds
  retry: 2,
  retryDelay: 1000,
} as const;

// Rarely changing data (floor price, tick spacing, token addresses)
export const STATIC_QUERY_CONFIG = {
  refetchInterval: false, // Disable auto-refetch
  staleTime: Infinity, // Never consider stale
  retry: 1,
  retryDelay: 1000,
} as const;

// Bid data - fetch once, manual refetch only
export const BID_QUERY_CONFIG = {
  refetchInterval: false, // Disable auto-refetch
  staleTime: 300000, // 5 minutes
  retry: 1,
  retryDelay: 1000,
} as const;

// Block number - more frequent
export const BLOCK_QUERY_CONFIG = {
  refetchInterval: 30000, // 30 seconds
  staleTime: 20000, // 20 seconds
  retry: 2,
  retryDelay: 1000,
} as const;

/**
 * Block time in milliseconds (Sepolia)
 */
export const BLOCK_TIME_MS = 12000;

/**
 * Number of blocks to wait before considering data stale
 */
export const STALE_BLOCK_COUNT = 1;

/**
 * Auction Configuration
 * Static parameters for the auction display
 * Update these values to match your auction design
 */
export const AUCTION_CONFIG = {
  // Token Information
  tokens: {
    total: 5000000, // Total tokens in auction
    available: 5000000, // Tokens available (might be less than total if some are reserved)
    percentage: 5, // Percentage of total supply
    decimals: 18, // Token decimals
  },

  // Auction Duration
  duration: {
    blocks: 3600, // Total auction length in blocks (300 + 3200 + 100)
    epochs: 3, // Number of epochs
    blockTimeSeconds: 12, // Block time (Sepolia)
    // Epoch configuration: blocks per epoch
    epochsConfig: [
      { epoch: 1, blocks: 300 }, // Epoch 1: 300 blocks
      { epoch: 2, blocks: 3200 }, // Epoch 2: 3200 blocks
      { epoch: 3, blocks: 100 }, // Epoch 3: 100 blocks
    ],
  },

  // Formatting helpers
  formatTokens: (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    } else if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toLocaleString();
  },

  formatEpochs: (epochs: number): string => {
    return `${epochs} ${epochs === 1 ? "epoch" : "epochs"}`;
  },
} as const;

