import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { useAccount, useReadContract, useBlockNumber } from "wagmi";
import {
  auctionContractConfig,
  stateLensContractConfig,
} from "../config/contract";
import { CONTRACT_QUERY_CONFIG, BLOCK_QUERY_CONFIG, BID_QUERY_CONFIG, STATIC_QUERY_CONFIG } from "../config/constants";
import { validateContractConfig } from "../utils/contractValidation";
import { Address } from "viem";

// ============================================
// TYPES
// ============================================

export interface Checkpoint {
  clearingPrice: bigint;
  currencyRaisedAtClearingPriceQ96_X7: bigint;
  cumulativeMpsPerPrice: bigint;
  cumulativeMps: number;
  prev: bigint;
  next: bigint;
}

export interface Bid {
  startBlock: bigint;
  startCumulativeMps: number;
  exitedBlock: bigint;
  maxPrice: bigint;
  owner: Address;
  amountQ96: bigint;
  tokensFilled: bigint;
}

export interface AuctionState {
  checkpoint: Checkpoint;
  currencyRaised: bigint;
  totalCleared: bigint;
  isGraduated: boolean;
}

export interface ContractContextType {
  // Contract addresses
  auctionAddress: Address;
  stateLensAddress: Address;
  isConfigValid: boolean;

  // Account
  address?: Address;
  isConnected: boolean;

  // Current block
  currentBlock?: bigint;

  // Auction state (from individual calls)
  clearingPrice?: bigint;
  currencyRaised?: bigint;
  totalCleared?: bigint;
  isGraduated?: boolean;

  // Blocks
  startBlock?: bigint;
  endBlock?: bigint;
  claimBlock?: bigint;
  lastCheckpointedBlock?: bigint;

  // Computed block values
  blocksRemaining?: bigint;
  blocksElapsed?: bigint;
  isAuctionActive?: boolean;
  isAuctionEnded?: boolean;
  isAuctionStarted?: boolean;
  progressPercentage?: number;

  // Price parameters
  floorPrice?: bigint;
  tickSpacing?: bigint;
  nextActiveTickPrice?: bigint;

  // Token info
  token?: Address;
  currency?: Address;
  totalSupply?: bigint;

  // Latest checkpoint
  latestCheckpoint?: Checkpoint;

  // Next bid ID
  nextBidId?: bigint;

  // State Lens (all data in one call - preferred)
  auctionState?: AuctionState;

  // Loading states
  isLoading: boolean;
  isLoadingState: boolean;
  isLoadingBlocks: boolean;
  isLoadingPriceParams: boolean;
  isLoadingTokenInfo: boolean;
    
  // Error states
  errors: {
    clearingPrice?: Error | null;
    currencyRaised?: Error | null;
    totalCleared?: Error | null;
    isGraduated?: Error | null;
    stateLens?: Error | null;
    blocks?: Error | null;
    // Add missing error fields
    floorPrice?: Error | null;
    tickSpacing?: Error | null;
    nextActiveTickPrice?: Error | null;
    token?: Error | null;
    currency?: Error | null;
    totalSupply?: Error | null;
    checkpoint?: Error | null;
    nextBidId?: Error | null;
  };

  // Refetch functions
  refetch: () => void;
  refetchState: () => void;
  refetchBlocks: () => void;
  refetchPriceParams: () => void;
  refetchTokenInfo: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(
  undefined
);

// ============================================
// PROVIDER
// ============================================

export function ContractProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { data: currentBlock } = useBlockNumber({
    watch: true,
    query: BLOCK_QUERY_CONFIG,
  });

  // Validate contract configuration on mount
  const isConfigValid = useMemo(() => {
    return validateContractConfig(
      auctionContractConfig.address,
      stateLensContractConfig.address
    );
  }, []);

  // Log validation warnings in development
  useEffect(() => {
    if (!isConfigValid && process.env.NODE_ENV === "development") {
      console.warn("Contract configuration validation failed");
    }
  }, [isConfigValid]);

  // ============================================
  // STATE LENS (Preferred - single call for bulk data)
  // ============================================
  const {
    data: auctionStateRaw,
    isLoading: isLoadingState,
    error: stateError,
    refetch: refetchState,
  } = useReadContract({
    ...stateLensContractConfig,
    functionName: "state",
    args: [auctionContractConfig.address],
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled:
        isConfigValid &&
        stateLensContractConfig.address !==
          "0x0000000000000000000000000000000000000000",
    },
  });

  // Type assertion for auction state
  const auctionState = auctionStateRaw as AuctionState | undefined;
  // ============================================
  // INDIVIDUAL CONTRACT READS
  // ============================================

  // Core auction state
  const {
    data: clearingPrice,
    isLoading: isLoadingClearingPrice,
    error: clearingPriceError,
    refetch: refetchClearingPrice,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "clearingPrice",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: currencyRaised,
    isLoading: isLoadingCurrencyRaised,
    error: currencyRaisedError,
    refetch: refetchCurrencyRaised,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "currencyRaised",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid && !auctionState,
    },
  });

  const {
    data: totalCleared,
    isLoading: isLoadingTotalCleared,
    error: totalClearedError,
    refetch: refetchTotalCleared,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "totalCleared",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid && !auctionState,
    },
  });

  const {
    data: isGraduated,
    isLoading: isLoadingGraduated,
    error: isGraduatedError,
    refetch: refetchGraduated,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "isGraduated",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid && !auctionState,
    },
  });

  // Blocks
  const {
    data: startBlock,
    isLoading: isLoadingStartBlock,
    error: startBlockError,
    refetch: refetchStartBlock,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "startBlock",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: endBlock,
    isLoading: isLoadingEndBlock,
    error: endBlockError,
    refetch: refetchEndBlock,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "endBlock",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: claimBlock,
    isLoading: isLoadingClaimBlock,
    error: claimBlockError,
    refetch: refetchClaimBlock,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "claimBlock",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: lastCheckpointedBlock,
    isLoading: isLoadingLastCheckpointedBlock,
    error: lastCheckpointedBlockError,
    refetch: refetchLastCheckpointedBlock,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "lastCheckpointedBlock",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  // Price parameters
  const {
    data: floorPrice,
    isLoading: isLoadingFloorPrice,
    error: floorPriceError,
    refetch: refetchFloorPrice,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "floorPrice",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: tickSpacing,
    isLoading: isLoadingTickSpacing,
    error: tickSpacingError,
    refetch: refetchTickSpacing,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "tickSpacing",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: nextActiveTickPrice,
    isLoading: isLoadingNextActiveTickPrice,
    error: nextActiveTickPriceError,
    refetch: refetchNextActiveTickPrice,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "nextActiveTickPrice",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  // Token info
  const {
    data: token,
    isLoading: isLoadingToken,
    error: tokenError,
    refetch: refetchToken,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "token",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: currency,
    isLoading: isLoadingCurrency,
    error: currencyError,
    refetch: refetchCurrency,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "currency",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  const {
    data: totalSupply,
    isLoading: isLoadingTotalSupply,
    error: totalSupplyError,
    refetch: refetchTotalSupply,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "totalSupply",
    query: {
      ...STATIC_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  // Latest checkpoint
  const {
    data: latestCheckpoint,
    isLoading: isLoadingCheckpoint,
    error: checkpointError,
    refetch: refetchCheckpoint,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "latestCheckpoint",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  // Next bid ID
  const {
    data: nextBidId,
    isLoading: isLoadingNextBidId,
    error: nextBidIdError,
    refetch: refetchNextBidId,
  } = useReadContract({
    ...auctionContractConfig,
    functionName: "nextBidId",
    query: {
      ...CONTRACT_QUERY_CONFIG,
      enabled: isConfigValid,
    },
  });

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const computedValues = useMemo(() => {
    if (!startBlock || !endBlock || !currentBlock) {
      return {
        blocksRemaining: undefined,
        blocksElapsed: undefined,
        isAuctionActive: undefined,
        isAuctionEnded: undefined,
        isAuctionStarted: undefined,
        progressPercentage: undefined,
      };
    }

    const blocksElapsed =
      currentBlock >= startBlock ? currentBlock - startBlock : 0n;

    const blocksRemaining =
      endBlock > currentBlock ? endBlock - currentBlock : 0n;

    const isAuctionStarted = currentBlock >= startBlock;
    const isAuctionEnded = currentBlock > endBlock;
    const isAuctionActive = isAuctionStarted && !isAuctionEnded;

    const totalBlocks = endBlock - startBlock;
    const progressPercentage =
      totalBlocks > 0n && isAuctionActive
        ? Number((blocksElapsed * 10000n) / totalBlocks) / 100
        : isAuctionEnded
        ? 100
        : 0;

    return {
      blocksRemaining,
      blocksElapsed,
      isAuctionActive,
      isAuctionEnded,
      isAuctionStarted,
      progressPercentage,
    };
  }, [startBlock, endBlock, currentBlock]);

  // ============================================
  // LOADING STATES
  // ============================================

  const isLoading =
    isLoadingClearingPrice ||
    (isLoadingState ? false : isLoadingCurrencyRaised) || // Skip if State Lens is loading
    (isLoadingState ? false : isLoadingTotalCleared) ||
    (isLoadingState ? false : isLoadingGraduated) ||
    isLoadingNextBidId ||
    isLoadingCheckpoint;

  const isLoadingBlocks =
    isLoadingStartBlock ||
    isLoadingEndBlock ||
    isLoadingClaimBlock ||
    isLoadingLastCheckpointedBlock;

  const isLoadingPriceParams =
    isLoadingFloorPrice || isLoadingTickSpacing || isLoadingNextActiveTickPrice;

  const isLoadingTokenInfo =
    isLoadingToken || isLoadingCurrency || isLoadingTotalSupply;

  // ============================================
  // ERROR AGGREGATION
  // ============================================

  const errors = useMemo(
    () => ({
      clearingPrice: clearingPriceError,
      currencyRaised: currencyRaisedError,
      totalCleared: totalClearedError,
      isGraduated: isGraduatedError,
      stateLens: stateError,
      blocks:
        startBlockError ||
        endBlockError ||
        claimBlockError ||
        lastCheckpointedBlockError,
      // Add missing errors
      floorPrice: floorPriceError,
      tickSpacing: tickSpacingError,
      nextActiveTickPrice: nextActiveTickPriceError,
      token: tokenError,
      currency: currencyError,
      totalSupply: totalSupplyError,
      checkpoint: checkpointError,
      nextBidId: nextBidIdError,
    }),
    [
      clearingPriceError,
      currencyRaisedError,
      totalClearedError,
      isGraduatedError,
      stateError,
      startBlockError,
      endBlockError,
      claimBlockError,
      lastCheckpointedBlockError,
      // Add missing error dependencies
      floorPriceError,
      tickSpacingError,
      nextActiveTickPriceError,
      tokenError,
      currencyError,
      totalSupplyError,
      checkpointError,
      nextBidIdError,
    ]
  );

  // ============================================
  // REFETCH FUNCTIONS
  // ============================================

  const refetch = () => {
    refetchClearingPrice();
    refetchCurrencyRaised();
    refetchTotalCleared();
    refetchGraduated();
    refetchNextBidId();
    refetchCheckpoint();
  };

  const refetchBlocks = () => {
    refetchStartBlock();
    refetchEndBlock();
    refetchClaimBlock();
    refetchLastCheckpointedBlock();
  };

  const refetchPriceParams = () => {
    refetchFloorPrice();
    refetchTickSpacing();
    refetchNextActiveTickPrice();
  };

  const refetchTokenInfo = () => {
    refetchToken();
    refetchCurrency();
    refetchTotalSupply();
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: ContractContextType = {
    // Addresses
    auctionAddress: auctionContractConfig.address,
    stateLensAddress: stateLensContractConfig.address,
    isConfigValid,

    // Account
    address,
    isConnected,

    // Current block
    currentBlock: currentBlock ? BigInt(currentBlock.toString()) : undefined,

    // Auction state
    clearingPrice: clearingPrice as bigint | undefined,
    currencyRaised:
      auctionState?.currencyRaised ?? (currencyRaised as bigint | undefined),
    totalCleared:
      auctionState?.totalCleared ?? (totalCleared as bigint | undefined),
    isGraduated:
      auctionState?.isGraduated ?? (isGraduated as boolean | undefined),

    // Blocks
    startBlock: startBlock as bigint | undefined,
    endBlock: endBlock as bigint | undefined,
    claimBlock: claimBlock as bigint | undefined,
    lastCheckpointedBlock: lastCheckpointedBlock as bigint | undefined,

    // Computed values
    ...computedValues,

    // Price parameters
    floorPrice: floorPrice as bigint | undefined,
    tickSpacing: tickSpacing as bigint | undefined,
    nextActiveTickPrice: nextActiveTickPrice as bigint | undefined,

    // Token info
    token: token as Address | undefined,
    currency: currency as Address | undefined,
    totalSupply: totalSupply as bigint | undefined,

    // Latest checkpoint
    latestCheckpoint: latestCheckpoint as Checkpoint | undefined,

    // Next bid ID
    nextBidId: nextBidId as bigint | undefined,

    // State Lens
    auctionState: auctionState as AuctionState | undefined,

    // Loading states
    isLoading,
    isLoadingState,
    isLoadingBlocks,
    isLoadingPriceParams,
    isLoadingTokenInfo,

    // Errors
    errors,

    // Refetch functions
    refetch,
    refetchState,
    refetchBlocks,
    refetchPriceParams,
    refetchTokenInfo,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useContract() {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error("useContract must be used within ContractProvider");
  }
  return context;
}
