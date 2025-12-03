// src/hooks/useIndexer.ts

import { useState, useEffect, useCallback } from "react";
import {
  getLatestClearingPrice,
  getUserBids,
  getUserBidExits,
  getTotalBidsCount,
  getAllBids,
  getLatestCheckpoint,
  checkIndexerHealth,
  getAllTokenAllocations,
  getUserTokenAllocations,
  getTotalTokensAllocated,
} from "../services/indexer";
import { Address } from "viem";
import type {
  BidSubmitted,
  BidExited,
  ClearingPriceUpdated,
  CheckpointUpdated,
} from "../types/indexer";
import { getRecentBids } from "../services/indexer";
import { getUniqueBiddersCount } from "../services/indexer";

/**
 * Hook to get latest clearing price from indexer
 */
export function useIndexerClearingPrice(refreshInterval = 120000) { // Increased to 2 minutes
  const [clearingPrice, setClearingPrice] =
    useState<ClearingPriceUpdated | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchClearingPrice = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLatestClearingPrice();
      setClearingPrice(data);
      setBackoffMultiplier(1); // Reset backoff on success
      setIsRateLimited(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch clearing price");
      setError(error);
      
      // If rate limited, increase backoff and pause polling
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setIsRateLimited(true);
        setBackoffMultiplier((prev) => Math.min(prev * 2, 16)); // Max 16x backoff (32 minutes)
        console.warn("Rate limited, backing off clearing price fetch");
      } else {
        console.error("Error fetching clearing price from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClearingPrice();
    
    // Don't poll if rate limited - wait for manual retry or longer backoff
    if (isRateLimited) {
      const backoffTime = refreshInterval * backoffMultiplier;
      const timeout = setTimeout(() => {
        setIsRateLimited(false);
        fetchClearingPrice();
      }, backoffTime);
      return () => clearTimeout(timeout);
    }
    
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchClearingPrice, actualInterval);
    return () => clearInterval(interval);
  }, [fetchClearingPrice, refreshInterval, backoffMultiplier, isRateLimited]);

  return {
    clearingPrice,
    isLoading,
    error,
    refetch: fetchClearingPrice,
  };
}

/**
 * Hook to get user bids from indexer with polling support
 */
export function useIndexerUserBids(userAddress?: Address, refreshInterval = 120000) { // Increased to 2 minutes
  const [bids, setBids] = useState<BidSubmitted[]>([]);
  const [exits, setExits] = useState<BidExited[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchUserBids = useCallback(async () => {
    if (!userAddress) {
      setBids([]);
      setExits([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [userBids, userExits] = await Promise.all([
        getUserBids(userAddress),
        getUserBidExits(userAddress),
      ]);
      setBids(userBids);
      setExits(userExits);
      setBackoffMultiplier(1);
      setIsRateLimited(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch user bids");
      setError(error);
      
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setIsRateLimited(true);
        setBackoffMultiplier((prev) => Math.min(prev * 2, 16));
        console.warn("Rate limited, backing off user bids fetch");
      } else {
        console.error("Error fetching user bids from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchUserBids();
    
    if (isRateLimited || !userAddress) {
      if (isRateLimited) {
        const backoffTime = refreshInterval * backoffMultiplier;
        const timeout = setTimeout(() => {
          setIsRateLimited(false);
          fetchUserBids();
        }, backoffTime);
        return () => clearTimeout(timeout);
      }
      return;
    }
    
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchUserBids, actualInterval);
    return () => clearInterval(interval);
  }, [fetchUserBids, refreshInterval, backoffMultiplier, isRateLimited, userAddress]);

  // Get active bid IDs (bids that haven't been exited)
  const activeBidIds = bids
    .filter((bid) => {
      const bidId = BigInt(bid.event_id);
      return !exits.some((exit) => BigInt(exit.bidId) === bidId);
    })
    .map((bid) => BigInt(bid.event_id));

  return {
    bids,
    exits,
    activeBidIds,
    isLoading,
    error,
    refetch: fetchUserBids,
  };
}

/**
 * Hook to get total bids count from indexer
 */
export function useIndexerTotalBids(refreshInterval = 120000) { // Changed from 30000 to 120000 (2 minutes)
  const [totalBids, setTotalBids] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);

  const fetchTotalBids = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const count = await getTotalBidsCount();
      setTotalBids(count);
      setBackoffMultiplier(1); // Reset backoff on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch total bids");
      setError(error);
      
      // If rate limited, increase backoff
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setBackoffMultiplier((prev) => Math.min(prev * 2, 8)); // Max 8x backoff
        console.warn("Rate limited, backing off total bids fetch");
      } else {
        console.error("Error fetching total bids from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotalBids();
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchTotalBids, actualInterval);
    return () => clearInterval(interval);
  }, [fetchTotalBids, refreshInterval, backoffMultiplier]);

  return {
    totalBids,
    isLoading,
    error,
    refetch: fetchTotalBids,
  };
}

/**
 * Hook to calculate total bids amount (sum of all submitted bid amounts)
 * This is different from currencyRaised - this is what users have committed,
 * not what has been spent to acquire tokens
 */
export function useIndexerTotalBidsAmount(refreshInterval = 180000) { // Changed to 3 minutes
  const [totalBidsAmount, setTotalBidsAmount] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchTotalBidsAmount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allBids = await getAllBids();
      
      // Sum all bid amounts (amount is in wei, use directly)
      const total = allBids.reduce((sum, bid) => {
        const amountInWei = BigInt(bid.amount);
        return sum + amountInWei;
      }, 0n);
      
      setTotalBidsAmount(total);
      setBackoffMultiplier(1);
      setIsRateLimited(false);
    } catch (err) {
      const error = err instanceof Error
        ? err
        : new Error("Failed to fetch total bids amount");
      setError(error);
      
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setIsRateLimited(true);
        setBackoffMultiplier((prev) => Math.min(prev * 2, 16));
        console.warn("Rate limited, backing off total bids amount fetch");
      } else {
        console.error("Error fetching total bids amount from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotalBidsAmount();
    
    if (isRateLimited) {
      const backoffTime = refreshInterval * backoffMultiplier;
      const timeout = setTimeout(() => {
        setIsRateLimited(false);
        fetchTotalBidsAmount();
      }, backoffTime);
      return () => clearTimeout(timeout);
    }
    
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchTotalBidsAmount, actualInterval);
    return () => clearInterval(interval);
  }, [fetchTotalBidsAmount, refreshInterval, backoffMultiplier, isRateLimited]);

  return {
    totalBidsAmount,
    isLoading,
    error,
    refetch: fetchTotalBidsAmount,
  };
}

/**
 * Hook to get latest checkpoint from indexer
 */
export function useIndexerLatestCheckpoint(refreshInterval = 180000) { // Increased to 3 minutes
  const [checkpoint, setCheckpoint] = useState<CheckpointUpdated | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchCheckpoint = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLatestCheckpoint();
      setCheckpoint(data);
      setBackoffMultiplier(1);
      setIsRateLimited(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch checkpoint");
      setError(error);
      
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setIsRateLimited(true);
        setBackoffMultiplier((prev) => Math.min(prev * 2, 16));
        console.warn("Rate limited, backing off checkpoint fetch");
      } else {
        console.error("Error fetching checkpoint from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCheckpoint();
    
    if (isRateLimited) {
      const backoffTime = refreshInterval * backoffMultiplier;
      const timeout = setTimeout(() => {
        setIsRateLimited(false);
        fetchCheckpoint();
      }, backoffTime);
      return () => clearTimeout(timeout);
    }
    
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchCheckpoint, actualInterval);
    return () => clearInterval(interval);
  }, [fetchCheckpoint, refreshInterval, backoffMultiplier, isRateLimited]);

  return {
    checkpoint,
    isLoading,
    error,
    refetch: fetchCheckpoint,
  };
}

/**
 * Hook to check if indexer is available
 */
export function useIndexerHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    const healthy = await checkIndexerHealth();
    setIsHealthy(healthy);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
    // Check health every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    isChecking,
    checkHealth,
  };
}

/**
 * Hook to get token allocations for a specific user (from exited bids)
 */
export function useIndexerUserTokenAllocations(userAddress?: Address, refreshInterval = 30000) {
  const [allocations, setAllocations] = useState<BidExited[]>([]);
  const [totalAllocated, setTotalAllocated] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAllocations = useCallback(async () => {
    if (!userAddress) {
      setAllocations([]);
      setTotalAllocated(0n);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userAllocations = await getUserTokenAllocations(userAddress);
      setAllocations(userAllocations);
      
      // Calculate total tokens allocated to this user from exited bids
      const total = userAllocations.reduce((sum, exit) => {
        return sum + BigInt(exit.tokensFilled);
      }, 0n);
      setTotalAllocated(total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user token allocations'));
      console.error('Error fetching user token allocations from indexer:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchAllocations();
    const interval = setInterval(fetchAllocations, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchAllocations, refreshInterval]);

  return {
    allocations,
    totalAllocated,
    isLoading,
    error,
    refetch: fetchAllocations,
  };
}

/**
 * Hook to get total tokens allocated across all users
 */
export function useIndexerTotalTokensAllocated(refreshInterval = 30000) {
  const [totalAllocated, setTotalAllocated] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalAllocated = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const total = await getTotalTokensAllocated();
      setTotalAllocated(total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch total tokens allocated'));
      console.error('Error fetching total tokens allocated from indexer:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTotalAllocated();
    const interval = setInterval(fetchTotalAllocated, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchTotalAllocated, refreshInterval]);

  return {
    totalAllocated,
    isLoading,
    error,
    refetch: fetchTotalAllocated,
  };
}

/**
 * Hook to get recent bids from all users
 */
export function useRecentBids(limit: number = 10, refreshInterval = 90000) {
  const [bids, setBids] = useState<BidSubmitted[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Track retry attempts

  const fetchRecentBids = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const recentBids = await getRecentBids(limit);
      setBids(recentBids);
      setBackoffMultiplier(1); // Reset backoff on success
      setHasLoadedOnce(true); // Mark as successfully loaded
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch recent bids");
      
      // Increment retry count
      setRetryCount((prev) => prev + 1);
      
      // If rate limited, increase backoff
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setBackoffMultiplier((prev) => Math.min(prev * 2, 8));
        console.warn("Rate limited, backing off recent bids fetch");
        // Don't set error for rate limits if we have data
        if (!hasLoadedOnce && retryCount >= 2) {
          // Only show error after 2 retry attempts
          setError(error);
        }
      } else {
        console.error("Error fetching recent bids from indexer:", err);
        // Only set error if we've never loaded successfully AND retried at least twice
        // This prevents showing errors on transient network issues
        if (!hasLoadedOnce && retryCount >= 2) {
          setError(error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit, hasLoadedOnce, retryCount]);

  useEffect(() => {
    fetchRecentBids();
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchRecentBids, actualInterval);
    return () => clearInterval(interval);
  }, [fetchRecentBids, refreshInterval, backoffMultiplier]);

  return {
    bids,
    isLoading,
    error: hasLoadedOnce ? null : error, // Only show error if we've never loaded
    refetch: fetchRecentBids,
  };
}

/**
 * Hook to get count of unique bidders
 */
export function useIndexerUniqueBidders(refreshInterval = 120000) {
  const [uniqueBidders, setUniqueBidders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [backoffMultiplier, setBackoffMultiplier] = useState(1);

  const fetchUniqueBidders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const count = await getUniqueBiddersCount();
      setUniqueBidders(count);
      setBackoffMultiplier(1); // Reset backoff on success
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to fetch unique bidders");
      setError(error);
      
      // If rate limited, increase backoff
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        setBackoffMultiplier((prev) => Math.min(prev * 2, 8));
        console.warn("Rate limited, backing off unique bidders fetch");
      } else {
        console.error("Error fetching unique bidders from indexer:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUniqueBidders();
    const actualInterval = refreshInterval * backoffMultiplier;
    const interval = setInterval(fetchUniqueBidders, actualInterval);
    return () => clearInterval(interval);
  }, [fetchUniqueBidders, refreshInterval, backoffMultiplier]);

  return {
    uniqueBidders,
    isLoading,
    error,
    refetch: fetchUniqueBidders,
  };
}
