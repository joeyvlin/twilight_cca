import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useWatchContractEvent,
} from "wagmi";
import {
  auctionContractConfig,
  stateLensContractConfig,
} from "../config/contract";
import { Address } from "viem";

// ============================================
// BASE HOOK
// ============================================
export function useAuctionContract() {
  return {
    contractConfig: auctionContractConfig,
  };
}

// ============================================
// READING AUCTION STATE
// ============================================

// Read clearing price
export function useClearingPrice() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "clearingPrice",
  });

  return {
    clearingPrice: data,
    isLoading,
    error,
    refetch,
  };
}

// Read currency raised
export function useCurrencyRaised() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "currencyRaised",
  });

  return {
    currencyRaised: data,
    isLoading,
    error,
    refetch,
  };
}

// Read total cleared tokens
export function useTotalCleared() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "totalCleared",
  });

  return {
    totalCleared: data,
    isLoading,
    error,
    refetch,
  };
}

// Read if auction is graduated
export function useIsGraduated() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "isGraduated",
  });

  return {
    isGraduated: data,
    isLoading,
    error,
    refetch,
  };
}

// Read latest checkpoint
export function useLatestCheckpoint() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "latestCheckpoint",
  });

  return {
    checkpoint: data,
    isLoading,
    error,
    refetch,
  };
}

// Read auction blocks
export function useAuctionBlocks() {
  const startBlock = useReadContract({
    ...auctionContractConfig,
    functionName: "startBlock",
  });

  const endBlock = useReadContract({
    ...auctionContractConfig,
    functionName: "endBlock",
  });

  const claimBlock = useReadContract({
    ...auctionContractConfig,
    functionName: "claimBlock",
  });

  const lastCheckpointedBlock = useReadContract({
    ...auctionContractConfig,
    functionName: "lastCheckpointedBlock",
  });

  return {
    startBlock: startBlock.data,
    endBlock: endBlock.data,
    claimBlock: claimBlock.data,
    lastCheckpointedBlock: lastCheckpointedBlock.data,
    isLoading:
      startBlock.isLoading ||
      endBlock.isLoading ||
      claimBlock.isLoading ||
      lastCheckpointedBlock.isLoading,
    error:
      startBlock.error ||
      endBlock.error ||
      claimBlock.error ||
      lastCheckpointedBlock.error,
    refetch: () => {
      startBlock.refetch();
      endBlock.refetch();
      claimBlock.refetch();
      lastCheckpointedBlock.refetch();
    },
  };
}

// Read floor price and tick spacing
export function useAuctionPriceParams() {
  const floorPrice = useReadContract({
    ...auctionContractConfig,
    functionName: "floorPrice",
  });

  const tickSpacing = useReadContract({
    ...auctionContractConfig,
    functionName: "tickSpacing",
  });

  const nextActiveTickPrice = useReadContract({
    ...auctionContractConfig,
    functionName: "nextActiveTickPrice",
  });

  return {
    floorPrice: floorPrice.data,
    tickSpacing: tickSpacing.data,
    nextActiveTickPrice: nextActiveTickPrice.data,
    isLoading:
      floorPrice.isLoading ||
      tickSpacing.isLoading ||
      nextActiveTickPrice.isLoading,
    error: floorPrice.error || tickSpacing.error || nextActiveTickPrice.error,
    refetch: () => {
      floorPrice.refetch();
      tickSpacing.refetch();
      nextActiveTickPrice.refetch();
    },
  };
}

// Read token and currency info
export function useAuctionTokenInfo() {
  const token = useReadContract({
    ...auctionContractConfig,
    functionName: "token",
  });

  const currency = useReadContract({
    ...auctionContractConfig,
    functionName: "currency",
  });

  const totalSupply = useReadContract({
    ...auctionContractConfig,
    functionName: "totalSupply",
  });

  return {
    token: token.data,
    currency: currency.data,
    totalSupply: totalSupply.data,
    isLoading: token.isLoading || currency.isLoading || totalSupply.isLoading,
    error: token.error || currency.error || totalSupply.error,
    refetch: () => {
      token.refetch();
      currency.refetch();
      totalSupply.refetch();
    },
  };
}

// ============================================
// READING BID INFORMATION
// ============================================

// Read next bid ID
export function useNextBidId() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "nextBidId",
  });

  return {
    nextBidId: data,
    isLoading,
    error,
    refetch,
  };
}

// Read a specific bid
export function useBid(bidId?: bigint) {
  const { data, isLoading, error, refetch } = useReadContract({
    ...auctionContractConfig,
    functionName: "bids",
    args: bidId !== undefined ? [bidId] : undefined,
    query: {
      enabled: bidId !== undefined,
    },
  });

  return {
    bid: data,
    isLoading,
    error,
    refetch,
  };
}

// Read all bids for a user (helper hook - you'll need to track bid IDs)
export function useUserBids(userAddress?: Address) {
  // Note: This requires knowing the bid IDs. You might want to track them via events
  // or use a different approach. This is a placeholder structure.
  return {
    bids: [],
    isLoading: false,
    error: null,
    refetch: () => {},
  };
}

// ============================================
// STATE LENS HOOK
// ============================================

// Use the State Lens to get all auction state in one call
export function useAuctionState() {
  const { data, isLoading, error, refetch } = useReadContract({
    ...stateLensContractConfig,
    functionName: "state",
    args: [auctionContractConfig.address],
  });

  return {
    state: data,
    isLoading,
    error,
    refetch,
  };
}

// ============================================
// WRITING - SUBMIT BID
// ============================================

export function useSubmitBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const submitBid = async (
    maxPrice: bigint,
    amount: bigint, // amount in wei (for ETH) or token units
    owner: Address,
    hookData: `0x${string}` = "0x",
    value?: bigint // ETH value if currency is ETH
  ) => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "submitBid",
        args: [maxPrice, amount, owner, hookData],
        value, // Only needed if currency is ETH
      });
    } catch (err) {
      console.error("Error submitting bid:", err);
      throw err;
    }
  };

  return {
    submitBid,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// WRITING - EXIT BID
// ============================================

export function useExitBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const exitBid = async (bidId: bigint) => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "exitBid",
        args: [bidId],
      });
    } catch (err) {
      console.error("Error exiting bid:", err);
      throw err;
    }
  };

  return {
    exitBid,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// WRITING - EXIT PARTIALLY FILLED BID
// ============================================

export function useExitPartiallyFilledBid() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const exitPartiallyFilledBid = async (
    bidId: bigint,
    lastFullyFilledCheckpointBlock: bigint,
    outbidBlock: bigint
  ) => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "exitPartiallyFilledBid",
        args: [bidId, lastFullyFilledCheckpointBlock, outbidBlock],
      });
    } catch (err) {
      console.error("Error exiting partially filled bid:", err);
      throw err;
    }
  };

  return {
    exitPartiallyFilledBid,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// WRITING - CLAIM TOKENS
// ============================================

export function useClaimTokens() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimTokens = async (bidId: bigint) => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "claimTokens",
        args: [bidId],
      });
    } catch (err) {
      console.error("Error claiming tokens:", err);
      throw err;
    }
  };

  return {
    claimTokens,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// WRITING - BATCH CLAIM TOKENS
// ============================================

export function useClaimTokensBatch() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const claimTokensBatch = async (owner: Address, bidIds: bigint[]) => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "claimTokensBatch",
        args: [owner, bidIds],
      });
    } catch (err) {
      console.error("Error batch claiming tokens:", err);
      throw err;
    }
  };

  return {
    claimTokensBatch,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// WRITING - CHECKPOINT
// ============================================

export function useCheckpoint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const checkpoint = async () => {
    try {
      await writeContract({
        ...auctionContractConfig,
        functionName: "checkpoint",
      });
    } catch (err) {
      console.error("Error checkpointing:", err);
      throw err;
    }
  };

  return {
    checkpoint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ============================================
// EVENT WATCHING
// ============================================

export function useBidSubmittedEvent(onLogs?: (logs: any[]) => void) {
  useWatchContractEvent({
    ...auctionContractConfig,
    eventName: "BidSubmitted",
    onLogs(logs) {
      console.log("New bid submitted:", logs);
      onLogs?.(logs);
    },
  });
}

export function useCheckpointUpdatedEvent(onLogs?: (logs: any[]) => void) {
  useWatchContractEvent({
    ...auctionContractConfig,
    eventName: "CheckpointUpdated",
    onLogs(logs) {
      console.log("Checkpoint updated:", logs);
      onLogs?.(logs);
    },
  });
}

export function useClearingPriceUpdatedEvent(onLogs?: (logs: any[]) => void) {
  useWatchContractEvent({
    ...auctionContractConfig,
    eventName: "ClearingPriceUpdated",
    onLogs(logs) {
      console.log("Clearing price updated:", logs);
      onLogs?.(logs);
    },
  });
}

export function useBidExitedEvent(onLogs?: (logs: any[]) => void) {
  useWatchContractEvent({
    ...auctionContractConfig,
    eventName: "BidExited",
    onLogs(logs) {
      console.log("Bid exited:", logs);
      onLogs?.(logs);
    },
  });
}

export function useTokensClaimedEvent(onLogs?: (logs: any[]) => void) {
  useWatchContractEvent({
    ...auctionContractConfig,
    eventName: "TokensClaimed",
    onLogs(logs) {
      console.log("Tokens claimed:", logs);
      onLogs?.(logs);
    },
  });
}

// ============================================
// COMPOSITE HOOKS - Multiple reads combined
// ============================================

// Get comprehensive auction info
export function useAuctionInfo() {
  const clearingPrice = useClearingPrice();
  const currencyRaised = useCurrencyRaised();
  const totalCleared = useTotalCleared();
  const isGraduated = useIsGraduated();
  const blocks = useAuctionBlocks();

  return {
    clearingPrice: clearingPrice.clearingPrice,
    currencyRaised: currencyRaised.currencyRaised,
    totalCleared: totalCleared.totalCleared,
    isGraduated: isGraduated.isGraduated,
    ...blocks,
    isLoading:
      clearingPrice.isLoading ||
      currencyRaised.isLoading ||
      totalCleared.isLoading ||
      isGraduated.isLoading ||
      blocks.isLoading,
    error:
      clearingPrice.error ||
      currencyRaised.error ||
      totalCleared.error ||
      isGraduated.error ||
      blocks.error,
    refetch: () => {
      clearingPrice.refetch();
      currencyRaised.refetch();
      totalCleared.refetch();
      isGraduated.refetch();
      blocks.refetch();
    },
  };
}
