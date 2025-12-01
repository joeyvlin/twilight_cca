import { useState, useEffect, useMemo, useCallback } from "react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { useBidSubmittedEvent, useBidExitedEvent } from "./useAuctionContract";
import { auctionContractConfig } from "../config/contract";
import { formatEther } from "viem"; // Fixed: Import from viem
import { formatPrice } from "../utils/formatting";
import { Address } from "viem";
import { useRef } from "react";
import { BID_QUERY_CONFIG } from "../config/constants";
interface BidData {
  id: string;
  budget: number; // In ETH
  maxPrice: number; // In ETH per token
  bidId: bigint;
  owner: Address;
  amountQ96: bigint;
  tokensFilled: bigint;
  startBlock: bigint;
  exitedBlock: bigint;
}

interface StoredBid {
  bidId: string;
  status: "active" | "exited" | "unknown";
  exitedBlock?: string;
  lastValidated?: number; // timestamp
}

/**
 * Helper function to validate if a bid is still active
 * Checks if the bid exists and is not exited
 */
async function validateBid(
  bidId: bigint,
  publicClient: any
): Promise<boolean> {
  try {
    const bidData = await publicClient.readContract({
      ...auctionContractConfig,
      functionName: "bids",
      args: [bidId],
    });

    // Check if bid data exists
    if (!bidData) return false;

    // Extract exitedBlock from bid data
    let exitedBlock: bigint;
    if (Array.isArray(bidData)) {
      exitedBlock = bidData[2]; // exitedBlock is at index 2 in tuple
    } else {
      exitedBlock = bidData.exitedBlock ?? 0n;
    }

    // Bid is active if exitedBlock is 0
    return exitedBlock === 0n;
  } catch (error) {
    console.error(`Error validating bid ${bidId.toString()}:`, error);
    return false; // Consider invalid if we can't fetch it
  }
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
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Refresh trigger for Active bids
  // Get only active bids for display
  const activeBidIds = useMemo(() => {
    return allBids
      .filter((bid) => bid.status === "active")
      .map((bid) => BigInt(bid.bidId))
      .slice(0, 10);
  }, [allBids]);

  // Load and validate bids for address when it changes

  useEffect(() => {
    // Reset the ref at the start - allows refresh to work
    validationInProgressRef.current = false;
    if (!address || !publicClient) {
      setAllBids([]);
      return;
    }
    // Only skip if we're already validating (but allow refresh to bypass)
    if (validationInProgressRef.current) {
      return;
    }

    validationInProgressRef.current = true;
    const loadAndValidateBids = async () => {
      setIsValidating(true);
      const storageKey = `userBids_${address.toLowerCase()}`;
      const stored = localStorage.getItem(storageKey);

      // Debug logging
      console.log("🔍 useUserBids - Loading bids:", {
        address: address.toLowerCase(),
        storageKey,
        hasStoredData: !!stored,
        storedValue: stored,
      });

      if (!stored) {
        console.log("⚠️ useUserBids - No stored bids found in localStorage");
        setAllBids([]);
        setIsValidating(false);
        validationInProgressRef.current = false;
        return;
      }

      try {
        const storedBids: StoredBid[] = JSON.parse(stored);
        console.log("✅ useUserBids - Loaded from localStorage:", {
          totalBids: storedBids.length,
          bids: storedBids,
        });
        // Only validate bids that haven't been validated in the last 5 minutes
        const VALIDATION_CACHE_TIME = 15 * 60 * 1000; // 15 minutes
        const now = Date.now();

        const bidsToValidate = storedBids.filter((bid) => {
          // Skip validation if bid is already marked as exited
          if (bid.status === "exited") {
            return false;
          }
          // Only validate active/unknown bids that haven't been validated recently
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

        if (process.env.NODE_ENV === "development") {
          console.log(
            `Validating ${bidsToValidate.length} bids (${recentlyValidated.length} cached)...`
          );
        }

        // Only validate bids that need validation
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

                // Extract exitedBlock
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

        // Combine validated and cached bids
        const allValidatedBids = [...validationResults, ...recentlyValidated];

        setAllBids(allValidatedBids);
        console.log("📊 useUserBids - Final state:", {
          allBids: allValidatedBids,
          activeBids: allValidatedBids.filter((b) => b.status === "active"),
          activeBidIds: allValidatedBids
            .filter((b) => b.status === "active")
            .map((b) => BigInt(b.bidId)),
        });
        // Update localStorage with validated bids
        localStorage.setItem(
          `userBids_${address.toLowerCase()}`,
          JSON.stringify(allValidatedBids)
        );

        const activeCount = allValidatedBids.filter(
          (b) => b.status === "active"
        ).length;
        const exitedCount = allValidatedBids.filter(
          (b) => b.status === "exited"
        ).length;

        if (process.env.NODE_ENV === "development") {
          console.log(
            `Validated: ${activeCount} active, ${exitedCount} exited`
          );
        }
      } catch (e) {
        console.error("Error loading/validating stored bids:", e);
        setAllBids([]);
      } finally {
        setIsValidating(false);
      }
      validationInProgressRef.current = false;
    };

    loadAndValidateBids();
  }, [address, publicClient, refreshTrigger]);

  // Save to localStorage whenever allBids change (from events)
  // Never remove localStorage - it's meant to persist data across refreshes
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      address &&
      !isValidating &&
      allBids.length > 0
    ) {
      localStorage.setItem(
        `userBids_${address.toLowerCase()}`,
        JSON.stringify(allBids)
      );
      console.log("💾 useUserBids - Saved to localStorage:", allBids);
    }
    // Note: We intentionally don't remove localStorage when allBids is empty
    // because localStorage is meant to persist data across page refreshes
    // The data will be loaded on next page load
  }, [allBids, address, isValidating]);

  // Listen for new bids
  // Listen for new bids
  useBidSubmittedEvent((logs) => {
    console.log("🔔 BidSubmitted event received:", logs);

    if (!address) {
      console.log("⚠️ No address, skipping bid tracking");
      return;
    }

    logs.forEach((log: any) => {
      const logOwner = log.args?.owner;
      const logBidId = log.args?.id;

      console.log("📋 Processing log:", {
        logOwner,
        userAddress: address,
        matches: logOwner?.toLowerCase() === address.toLowerCase(),
        bidId: logBidId?.toString(),
      });

      if (logOwner?.toLowerCase() === address.toLowerCase()) {
        const bidId = logBidId?.toString();
        console.log("✅ Bid belongs to user! Bid ID:", bidId);

        setAllBids((prev) => {
          // Check if bidId already exists
          const exists = prev.some((bid) => bid.bidId === bidId);
          if (!exists) {
            console.log("➕ Adding new bid ID:", bidId);
            const newBid = {
              bidId,
              status: "active" as const,
              lastValidated: Date.now(),
            };
            console.log("💾 New bid to add:", newBid);
            return [...prev, newBid];
          } else {
            console.log("⏭️ Bid ID already exists:", bidId);
          }
          return prev;
        });
      } else {
        console.log(
          "❌ Bid doesn't belong to user. Owner:",
          logOwner,
          "User:",
          address
        );
      }
    });
  });

  // Listen for bid exits
  useBidExitedEvent((logs) => {
    if (!address) return;
    logs.forEach((log: any) => {
      const bidId = log.args.bidId.toString();
      if (process.env.NODE_ENV === "development") {
        console.log("BidExited event:", { bidId, log });
      }
      setAllBids((prev) => {
        return prev.map((bid) =>
          bid.bidId === bidId
            ? { ...bid, status: "exited" as const, lastValidated: Date.now() }
            : bid
        );
      });
    });
  });
  // Function to manually trigger a reload from localStorage
  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);
  return {
    bidIds: activeBidIds, // Active bids for display
    allBids, // All bids with metadata
    activeBids: allBids.filter((b) => b.status === "active"),
    exitedBids: allBids.filter((b) => b.status === "exited"),
    isLoading: isValidating,
    address,
    refetch,
  };
}


/**
 * Hook to fetch a single bid's data
 */
export function useBidData(bidId: bigint | undefined) {
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
  // Convert contract bid data to display format
  const bidData: BidData | null = useMemo(() => {
    if (!data || !bidId) return null;

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

    // Check if bid is exited (exitedBlock > 0 means it's exited)
    if (exitedBlock > 0n) {
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

    console.log("Bid conversion debug:", {
      bidId: bidId.toString(),
      amountQ96: amountQ96.toString(),
      budget,
      isInWei: amountQ96 < BigInt(1e30),
    });

    // Convert maxPrice from Q96 to ETH per token
    const maxPriceEth = parseFloat(formatPrice(maxPrice));
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
  }, [data, bidId]);

  return {
    bidData,
    isLoading,
    error,
  };
}
