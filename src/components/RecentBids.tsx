import { Clock } from "lucide-react";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useRecentBids, useIndexerLatestCheckpoint } from "../hooks/useIndexer";
import { useEthUsdPrice } from "../hooks/useEthUsdPrice";
import { formatEther } from "viem";
import { useEffect, useRef } from "react";

/**
 * Convert Q96 price to ETH with proper precision
 * Q96 format: price = (priceInWei * 2^96) / 1e18
 * To convert back: priceInETH = (priceQ96 * 1e18) / 2^96 / 1e18
 */
function convertQ96ToEth(priceQ96: bigint): number {
  if (priceQ96 === 0n) return 0;
  
  const q96Divisor = 2n ** 96n;
  const oneEthInWei = BigInt(1e18);
  
  // Multiply by 1e18 first to preserve precision, then divide
  // priceInETH = (priceQ96 * 1e18) / 2^96 / 1e18
  const numerator = priceQ96 * oneEthInWei;
  const priceInWei = numerator / q96Divisor;
  
  // Convert wei to ETH
  return parseFloat(formatEther(priceInWei));
}

/**
 * Component to display a single recent bid
 */
function RecentBidItem({ bid, ethUsdPrice }: { bid: any; ethUsdPrice: number | null }) {
  // Convert price and amount from Q96 format to ETH
  const priceBigInt = BigInt(bid.price);
  const amountBigInt = BigInt(bid.amount);
  
  // Convert amount (in wei or Q96) to ETH
  let bidAmountEth: number;
  if (amountBigInt < BigInt(1e30)) {
    bidAmountEth = parseFloat(formatEther(amountBigInt));
  } else {
    const q96Divisor = 2n ** 96n;
    const amountInWei = amountBigInt / q96Divisor;
    bidAmountEth = parseFloat(formatEther(amountInWei));
  }
  
  // Convert max price from Q96 to ETH using improved precision
  const maxPriceEth = convertQ96ToEth(priceBigInt);
  
  // Calculate USD amounts
  const bidAmountUsd = ethUsdPrice ? bidAmountEth * ethUsdPrice : null;
  const maxPriceUsd = ethUsdPrice && maxPriceEth > 0 ? maxPriceEth * ethUsdPrice : null;

  return (
    <div className="flex justify-between items-center gap-6 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
      <div className="text-sm sm:text-base font-monoDisplay text-gray-300">
        Bid #{bid.event_id}
      </div>
      <div className="flex gap-8 sm:gap-12 flex-1 justify-end">
        <div className="text-right min-w-[100px]">
          <label className="text-xs text-gray-500 mb-1 block font-monoDisplay">
            Amount
          </label>
          <div className="text-base sm:text-lg font-semibold text-gray-200">
            {bidAmountUsd !== null ? (
              `$${bidAmountUsd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </div>
        </div>
        <div className="text-right min-w-[120px]">
          <label className="text-xs text-gray-500 mb-1 block font-monoDisplay">
            Max Price
          </label>
          <div className="text-base sm:text-lg font-semibold text-gray-200">
            {maxPriceUsd !== null && maxPriceUsd > 0 ? (
              `$${maxPriceUsd.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : maxPriceEth === 0 ? (
              <span className="text-gray-500">$0.00</span>
            ) : (
              <span className="text-gray-500">Loading...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Component to display recent bids from all users
 */
export function RecentBids({ limit = 10 }: { limit?: number }) {
  const themeClasses = useThemeClasses();
  const { bids, isLoading, error, refetch } = useRecentBids(limit, 60000); // Refresh every 60 seconds
  const ethUsdPrice = useEthUsdPrice();
  
  // Monitor checkpoint updates from indexer (checkpoint is called on every bid submission)
  // Poll checkpoint more frequently (15 seconds) to detect new bids quickly
  const { checkpoint } = useIndexerLatestCheckpoint(15000); // 15 seconds polling
  const previousBlockNumberRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Initial fetch on mount
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      refetch();
    }
  }, [refetch]);

  // Listen for custom event to trigger refetch (when current user submits bid)
  useEffect(() => {
    const handleBidSubmitted = () => {
      setTimeout(() => {
        refetch();
      }, 3000);
    };

    window.addEventListener('bidSubmitted', handleBidSubmitted);
    return () => window.removeEventListener('bidSubmitted', handleBidSubmitted);
  }, [refetch]);

  // Detect checkpoint changes (means a new bid was submitted)
  useEffect(() => {
    if (checkpoint && checkpoint.blockNumber) {
      const currentBlockNumber = checkpoint.blockNumber;
      
      if (previousBlockNumberRef.current !== null && 
          previousBlockNumberRef.current !== currentBlockNumber) {
        setTimeout(() => {
          refetch();
        }, 2000);
      }
      
      previousBlockNumberRef.current = currentBlockNumber;
    }
  }, [checkpoint, refetch]);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Clock
          className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
        />
        <h2 className="text-lg sm:text-xl font-normal font-body text-gray-300">
          Recent Bids
        </h2>
        {bids.length > 0 && (
          <span className="text-xs sm:text-sm text-gray-400">
            ({bids.length})
          </span>
        )}
      </div>

      {isLoading && bids.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
          Loading recent bids...
        </div>
      ) : error && bids.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-400 text-center py-4">
          Loading bids... Please wait
        </div>
      ) : bids.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
          No bids yet
        </div>
      ) : (
        <>
          {error && (
            <div className="text-xs text-yellow-500 text-center mb-2 px-2">
              Showing last known data. Refreshing...
            </div>
          )}
          <div className="space-y-3 sm:space-y-4">
            {bids.map((bid) => (
              <RecentBidItem
                key={bid.id}
                bid={bid}
                ethUsdPrice={ethUsdPrice}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
