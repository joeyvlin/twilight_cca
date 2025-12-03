import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useBidSubmittedEvent, useBidExitedEvent } from "./useAuctionContract";
import { auctionContractConfig } from "../config/contract";
import { formatEther, Address } from "viem";
import { BID_QUERY_CONFIG } from "../config/constants";
import { useIndexerUserBids } from "./useIndexer";
import { useIndexerHealth } from "./useIndexer";

// Type definitions
interface StoredBid {
  bidId: string;
  status: "active" | "exited" | "unknown";
  lastValidated?: number;
  exitedBlock?: string;
}

interface BidData {
  id: string;
  budget: number;
  maxPrice: number;
  bidId: bigint;
  owner: Address;
  amountQ96: bigint;
  tokensFilled: bigint;
  startBlock: bigint;
  exitedBlock: bigint;
}

/**
 * Convert Q96 price to ETH with proper precision
 */
function convertQ96ToEth(priceQ96: bigint): number {
  if (priceQ96 === 0n) return 0;
  
  const q96Divisor = 2n ** 96n;
  const oneEthInWei = BigInt(1e18);
  
  // Multiply by 1e18 first to preserve precision, then divide
  const numerator = priceQ96 * oneEthInWei;
  const priceInWei = numerator / q96Divisor;
  
  // Convert wei to ETH
  return parseFloat(formatEther(priceInWei));
}

/**
 * Hook to track and fetch all bids for the connected user
 * Stores ALL bids (active + exited) but filters for display
 * Persists bid IDs to localStorage for persistence across refreshes
 */
export function useUserBids() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [allBids, setAllBids] = useState<StoredBid[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const validationInProgressRef = useRef<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Check indexer health
  const { isHealthy: isIndexerHealthy } = useIndexerHealth();
  
  // Get bids from indexer (primary source)
  const {
    activeBidIds: indexerActiveBidIds,
    isLoading: isLoadingIndexer,
    error: indexerError,
  } = useIndexerUserBids(address, 120000); // Poll every 2 minutes (was 90 seconds)
  
  // Determine if we should use indexer
  const useIndexer = Boolean(isIndexerHealthy && !indexerError);
  
  // Get active bid IDs - prefer indexer, fallback to localStorage
  const activeBidIds = useMemo(() => {
    if (useIndexer) {
      // Temporarily remove filter to see if bid ID 0 is the issue
      // return indexerActiveBidIds.filter((bidId) => bidId > 0n);
      return indexerActiveBidIds; // Show all bids including ID 0
    }
    // Fallback to localStorage validation logic
    return allBids
      .filter((bid) => bid.status === "active")
      .map((bid) => BigInt(bid.bidId))
      // .filter((bidId) => bidId > 0n) // Temporarily remove filter
      .slice(0, 10);
  }, [useIndexer, indexerActiveBidIds, allBids]);

  // Load and validate bids from localStorage ONLY when indexer is unavailable
  useEffect(() => {
    // Skip localStorage logic if indexer is available
    if (useIndexer) {
      setAllBids([]); // Clear localStorage bids when using indexer
      return;
    }
    
    // Fallback: Use localStorage with validation (existing logic)
    validationInProgressRef.current = false;
    if (!address || !publicClient) {
      setAllBids([]);
      return;
    }
    if (validationInProgressRef.current) {
      return;
    }

    validationInProgressRef.current = true;
    const loadAndValidateBids = async () => {
      setIsValidating(true);
      const storageKey = `userBids_${address.toLowerCase()}`;
      const stored = localStorage.getItem(storageKey);

      if (!stored) {
        setAllBids([]);
        setIsValidating(false);
        validationInProgressRef.current = false;
        return;
      }

      try {
        const storedBids: StoredBid[] = JSON.parse(stored);
        
        // Only validate bids that haven't been validated recently
        const VALIDATION_CACHE_TIME = 15 * 60 * 1000; // 15 minutes
        const now = Date.now();

        const bidsToValidate = storedBids.filter((bid) => {
          if (bid.status === "exited") {
            return false;
          }
          return (
            !bid.lastValidated ||
            now - bid.lastValidated > VALIDATION_CACHE_TIME
          );
        });

        const recentlyValidated = storedBids.filter(
          (bid) =>
            bid.lastValidated &&
            now - bid.lastValidated <= VALIDATION_CACHE_TIME
        );

        // Validate bids against contract (RPC calls - only in fallback scenario)
        const validationResults: StoredBid[] = await Promise.all(
          bidsToValidate.map(
            async (storedBid: StoredBid): Promise<StoredBid> => {
              const bidId = BigInt(storedBid.bidId);
              try {
                const bidData = await publicClient.readContract({
                  ...auctionContractConfig,
                  functionName: "bids",
                  args: [bidId],
                });

                if (!bidData) {
                  return {
                    ...storedBid,
                    status: "unknown" as const,
                    lastValidated: now,
                  };
                }

                let exitedBlock: bigint;
                if (Array.isArray(bidData)) {
                  exitedBlock = bidData[2];
                } else {
                  exitedBlock = bidData.exitedBlock ?? 0n;
                }

                const status: "active" | "exited" =
                  exitedBlock === 0n ? "active" : "exited";
                return {
                  ...storedBid,
                  status,
                  exitedBlock: exitedBlock.toString(),
                  lastValidated: now,
                };
              } catch (error) {
                console.error(
                  `Error validating bid ${storedBid.bidId}:`,
                  error
                );
                return {
                  ...storedBid,
                  status: "unknown" as const,
                  lastValidated: now,
                };
              }
            }
          )
        );

        const allValidatedBids = [...validationResults, ...recentlyValidated];
        setAllBids(allValidatedBids);
        
        // Update localStorage with validated bids
        localStorage.setItem(
          `userBids_${address.toLowerCase()}`,
          JSON.stringify(allValidatedBids)
        );
      } catch (e) {
        console.error("Error loading/validating stored bids:", e);
        setAllBids([]);
      } finally {
        setIsValidating(false);
        validationInProgressRef.current = false;
      }
    };

    loadAndValidateBids();
  }, [address, publicClient, refreshTrigger, useIndexer]); // Add useIndexer dependency

  // Remove event listeners when using indexer (indexer handles events)
  // Keep them for fallback scenario
  useBidSubmittedEvent((logs) => {
    if (!address || useIndexer) return; // Skip if using indexer
    
    logs.forEach((log: any) => {
      const logOwner = log.args?.owner;
      const logBidId = log.args?.id;
      if (logOwner?.toLowerCase() === address.toLowerCase()) {
        const bidId = logBidId?.toString();
        setAllBids((prev) => {
          const exists = prev.some((bid) => bid.bidId === bidId);
          if (!exists) {
            return [
              ...prev,
              { bidId, status: "active" as const, lastValidated: Date.now() },
            ];
          }
          return prev;
        });
      }
    });
  });

  useBidExitedEvent((logs) => {
    if (!address || useIndexer) return; // Skip if using indexer
    
    logs.forEach((log: any) => {
      const bidId = log.args.bidId.toString();
      setAllBids((prev) =>
        prev.map((bid) =>
          bid.bidId === bidId
            ? { ...bid, status: "exited" as const, lastValidated: Date.now() }
            : bid
        )
      );
    });
  });

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    bidIds: activeBidIds,
    allBids: useIndexer ? [] : allBids, // Return empty when using indexer
    activeBids: useIndexer ? [] : allBids.filter((b) => b.status === "active"),
    exitedBids: useIndexer ? [] : allBids.filter((b) => b.status === "exited"),
    isLoading: useIndexer ? isLoadingIndexer : isValidating,
    address,
    refetch,
    // Add source indicator
    source: useIndexer ? "indexer" : "localStorage",
    // Add flag to indicate if we should skip exit check
    skipExitCheck: useIndexer ? true : undefined, // When using indexer, skip exit check
    // Add debug info
    debug: {
      isIndexerHealthy,
      indexerError: indexerError?.message,
      indexerActiveBidIdsCount: indexerActiveBidIds.length,
      localStorageBidIdsCount: allBids.filter((b) => b.status === "active").length,
    },
  };
}


/**
 * Hook to fetch a single bid's data
 * @param bidId - The bid ID to fetch
 * @param skipExitCheck - If true, skip checking exitedBlock (use when bid is from indexer)
 */
export function useBidData(bidId: bigint | undefined, skipExitCheck = false) {
  const { data, isLoading, error } = useReadContract({
    ...auctionContractConfig,
    functionName: "bids",
    args: bidId !== undefined ? [bidId] : undefined,
    query: {
      ...BID_QUERY_CONFIG,
      enabled: bidId !== undefined,
    },
  });

  // Convert contract bid data to display format
  const bidData: BidData | null = useMemo(() => {
    if (!data || bidId === undefined) return null;

    let startBlock: bigint;
    let startCumulativeMps: number;
    let exitedBlock: bigint;
    let maxPrice: bigint;
    let owner: Address;
    let amountQ96: bigint;
    let tokensFilled: bigint;

    // Use unknown first, then check the structure
    const rawData = data as unknown;

    if (Array.isArray(rawData)) {
      // Handle tuple format
      const tuple = rawData as [
        bigint,
        number,
        bigint,
        bigint,
        Address,
        bigint,
        bigint
      ];
      [
        startBlock,
        startCumulativeMps,
        exitedBlock,
        maxPrice,
        owner,
        amountQ96,
        tokensFilled,
      ] = tuple;
    } else {
      // Handle object format
      const bidObj = rawData as {
        startBlock?: bigint;
        startCumulativeMps?: number;
        exitedBlock?: bigint;
        maxPrice?: bigint;
        owner?: Address;
        amountQ96?: bigint;
        amount?: bigint;
        tokensFilled?: bigint;
      };

      startBlock = bidObj.startBlock ?? 0n;
      startCumulativeMps = bidObj.startCumulativeMps ?? 0;
      exitedBlock = bidObj.exitedBlock ?? 0n;
      maxPrice = bidObj.maxPrice ?? 0n;
      owner = (bidObj.owner ?? "0x0") as Address;
      amountQ96 = bidObj.amountQ96 ?? bidObj.amount ?? 0n;
      tokensFilled = bidObj.tokensFilled ?? 0n;
    }

    // Check if bid is exited (only if not skipping check)
    // When using indexer, we trust that activeBidIds are truly active
    // The indexer already filters out exited bids by checking BidExited events
    if (!skipExitCheck && exitedBlock > 0n) {
      return null; // Don't show exited bids
    }

    // Convert amountQ96 to ETH
    // amountQ96 is in Q96 format: (amount in wei * 2^96) / 1e18
    // To get back: amount in wei = (amountQ96 * 1e18) / 2^96
    // Then: amount in ETH = amount in wei / 1e18
    let budget: number;

    if (amountQ96 < BigInt(1e30)) {
      // Likely already in wei format
      budget = parseFloat(formatEther(amountQ96));
    } else {
      // Likely in Q96 format: convert back to wei, then to ETH
      const q96Divisor = 2n ** 96n;
      // amount in wei = (amountQ96 * 1e18) / 2^96
      const amountInWei = (amountQ96) / q96Divisor;
      // Convert wei to ETH
      budget = parseFloat(formatEther(amountInWei));
    }

    // Convert maxPrice from Q96 to ETH per token
    // Use improved conversion function for better precision
    const maxPriceEth = convertQ96ToEth(maxPrice);
    
    // Add validation: if maxPrice is 0, it might be invalid
    if (maxPrice === 0n) {
      console.warn(`⚠️ Bid ${bidId.toString()} has maxPrice = 0, this might be invalid`);
    }
    
    return {
      id: bidId.toString(),
      budget,
      maxPrice: maxPriceEth,
      bidId,
      owner,
      amountQ96,
      tokensFilled,
      startBlock,
      exitedBlock,
    };
  }, [data, bidId, skipExitCheck]); // Add skipExitCheck to dependencies

  return {
    bidData,
    isLoading,
    error,
  };
}
