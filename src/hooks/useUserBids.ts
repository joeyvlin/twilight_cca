import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { useBidSubmittedEvent, useBidExitedEvent } from "./useAuctionContract";
import { auctionContractConfig } from "../config/contract";
import { formatEther } from "viem"; // Fixed: Import from viem
import { formatPrice } from "../utils/formatting";
import { Address } from "viem";

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

/**
 * Hook to track and fetch all bids for the connected user
 * Tracks bid IDs from events and fetches their data
 */
export function useUserBids() {
  const { address } = useAccount();
  const [bidIds, setBidIds] = useState<bigint[]>([]);

  // Listen for new bids
  useBidSubmittedEvent((logs) => {
    if (!address) return;
    logs.forEach((log: any) => {
      if (log.args.owner?.toLowerCase() === address.toLowerCase()) {
        const bidId = log.args.id;
        setBidIds((prev) => {
          // Check if bidId already exists
          if (!prev.some((id) => id === bidId)) {
            return [...prev, bidId];
          }
          return prev;
        });
      }
    });
  });

  // Listen for bid exits
  useBidExitedEvent((logs) => {
    if (!address) return;
    logs.forEach((log: any) => {
      const bidId = log.args.bidId;
      setBidIds((prev) => prev.filter((id) => id !== bidId));
    });
  });

  // Fetch bid data for all tracked bid IDs
  // Note: We can't use hooks in a loop, so we'll fetch them individually
  // For now, we'll limit to the first 10 bids to avoid too many requests
  const activeBidIds = bidIds.slice(0, 10);

  return {
    bidIds: activeBidIds,
    isLoading: false, // Individual loading states handled in component
    address,
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
    const budget = parseFloat(formatEther(amountQ96));

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
