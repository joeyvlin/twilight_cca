import { useMemo } from "react";
import { useIndexerClearingPrice } from "./useIndexer";
import { useIndexerHealth } from "./useIndexer";
import { useContract } from "../contexts/ContractContext";
import { formatEther } from "viem";

/**
 * Convert Q96 price to ETH with proper precision (same as RecentBids)
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
 * Hook that provides clearing price from indexer (preferred) or StateLens/RPC (fallback)
 */
export function useClearingPriceWithFallback() {
  const { isHealthy: isIndexerHealthy } = useIndexerHealth();
  const { clearingPrice: indexerClearingPrice, isLoading: isLoadingIndexer } = useIndexerClearingPrice();
  const contract = useContract();
  
  const clearingPrice = useMemo(() => {
    // Prefer indexer if healthy and has data
    if (isIndexerHealthy && indexerClearingPrice) {
      return BigInt(indexerClearingPrice.clearingPrice);
    }
    // Fallback to contract (from StateLens checkpoint or RPC)
    return contract.clearingPrice;
  }, [isIndexerHealthy, indexerClearingPrice, contract.clearingPrice]);
  
  const clearingPriceEth = useMemo(() => {
    if (!clearingPrice || clearingPrice === 0n) return null;
    // Use improved conversion function for better precision
    return convertQ96ToEth(clearingPrice);
  }, [clearingPrice]);
  
  // Simplified loading logic:
  // - If indexer has data, use it immediately (don't wait for StateLens)
  // - If indexer is loading and we have no data, show loading
  // - If indexer finished but has no data, check StateLens
  const isLoading = useMemo(() => {
    // If indexer has data, we're done loading
    if (isIndexerHealthy && indexerClearingPrice) {
      return false;
    }
    
    // If indexer is healthy but still loading, wait for it
    if (isIndexerHealthy && isLoadingIndexer) {
      return true;
    }
    
    // Indexer finished but no data - check StateLens
    if (isIndexerHealthy && !indexerClearingPrice && !isLoadingIndexer) {
      // If StateLens is loading, wait for it
      if (contract.isLoadingState) {
        return true;
      }
      // StateLens finished - check if we have data from contract
      return !contract.clearingPrice && contract.isLoading;
    }
    
    // Indexer is unhealthy - check StateLens and RPC
    if (contract.isLoadingState) {
      return true;
    }
    
    // StateLens finished, check RPC
    if (!contract.clearingPrice && contract.isLoading) {
      return true;
    }
    
    return false;
  }, [
    isIndexerHealthy,
    isLoadingIndexer,
    indexerClearingPrice,
    contract.isLoadingState,
    contract.clearingPrice,
    contract.isLoading,
  ]);
  
  return {
    clearingPrice,
    clearingPriceEth,
    isLoading,
    source: isIndexerHealthy && indexerClearingPrice ? 'indexer' : (contract.auctionState?.checkpoint ? 'statelens' : 'rpc'),
  };
}
