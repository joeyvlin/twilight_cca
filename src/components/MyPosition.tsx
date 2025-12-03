import { Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
// import { useTilt } from '../hooks/useTilt';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { useAccount } from "wagmi";
import { useIndexerUserTokenAllocations } from "../hooks/useIndexer";
import { useClearingPriceWithFallback } from "../hooks/useClearingPriceWithFallback";
import { useEthUsdPrice } from "../hooks/useEthUsdPrice";
import { formatEther } from "viem";
import { useMemo, useState } from "react";

interface MyPositionProps {
  auctionState?: 'pre-auction' | 'auction-live' | 'post-auction';
}

export function MyPosition({ 
  auctionState
}: MyPositionProps) {
  const themeClasses = useThemeClasses();
  // const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  const { address } = useAccount();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get exited bid allocations from indexer
  const {
    allocations: exitedAllocations,
    totalAllocated: exitedTotal,
    isLoading: loadingExited,
    error: exitedError,
  } = useIndexerUserTokenAllocations(address);

  // Get clearing price and ETH/USD price for estimated value calculation
  const { clearingPriceEth, isLoading: isLoadingClearingPrice } = useClearingPriceWithFallback();
  const ethUsdPrice = useEthUsdPrice(240000); // Update every 4 minutes (240000ms)

  const totalExited = exitedTotal || 0n;
  const hasExitedAllocations = exitedAllocations.length > 0;

  // Calculate estimated value: totalAllocation * clearingPrice * ethUsdPrice
  const estimatedValue = useMemo(() => {
    // If no tokens allocated, show $0.00
    if (!totalExited || totalExited === 0n) {
      return 0;
    }

    // If missing price data, return null to show "Calculating..."
    if (!clearingPriceEth || !ethUsdPrice) {
      return null;
    }

    // totalExited is in wei (1e18), clearingPriceEth is in ETH per token, ethUsdPrice is USD per ETH
    // Value = (tokens in ETH) * (price per token in ETH) * (ETH to USD)
    const tokensInEth = Number(totalExited) / 1e18;
    const valueInUsd = tokensInEth * clearingPriceEth * ethUsdPrice;
    
    return valueInUsd;
  }, [totalExited, clearingPriceEth, ethUsdPrice]);

  // Determine if we're still loading price data
  const isLoadingPriceData = isLoadingClearingPrice || ethUsdPrice === null;

  // Get summary for collapsed state
  const getSummary = () => {
    if (!address) {
      return "Connect wallet to see your position";
    }
    if (loadingExited) {
      return "Loading...";
    }
    if (totalExited > 0n) {
      const tokens = formatEther(totalExited);
      const value = estimatedValue !== null && estimatedValue > 0
        ? `$${estimatedValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "Calculating...";
      return `${tokens} tokens • ${value}`;
    }
    return "No allocations yet";
  };

  return (
    <div
      // ref={tiltRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg overflow-hidden"
      // style={{ transformStyle: "preserve-3d" }}
    >
      {/* Header - Always visible and clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 md:p-6 flex items-center justify-between gap-2 hover:bg-gray-800/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Briefcase
            className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
          />
          <h2 className="text-lg sm:text-xl font-normal font-body text-gray-300">
            My Position
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <span className="text-xs sm:text-sm text-gray-500 font-monoDisplay">
              {getSummary()}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp
              className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent} transition-transform`}
            />
          ) : (
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent} transition-transform`}
            />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      {isExpanded && (
        <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4 sm:space-y-6">
            {/* Token Allocation Section */}
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                Token Allocation
              </div>
              {!address ? (
                <div className="text-gray-500 text-sm">Connect wallet to see your token allocations</div>
              ) : loadingExited ? (
                <div className="text-gray-500 text-sm">Loading allocations...</div>
              ) : exitedError ? (
                <div className="text-red-400 text-sm">Error loading allocations: {exitedError.message}</div>
              ) : (
                <div className="space-y-3">
                  {/* Total Allocation */}
                  <div className="text-xl sm:text-2xl font-bold">
                    <span className={themeClasses.textAccent}>
                      {formatEther(totalExited)}
                    </span>
                    <span className="text-base sm:text-lg text-gray-400 ml-1 sm:ml-2">
                      tokens
                    </span>
                  </div>

                  {/* Exited Bids Section */}
                  {hasExitedAllocations && (
                    <div className="pt-2 border-t border-gray-700">
                      <div className="text-xs text-gray-400 mb-2">Allocation History</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {exitedAllocations.slice(0, 5).map((alloc) => (
                          <div
                            key={alloc.id}
                            className="text-sm text-gray-300 flex justify-between"
                          >
                            <span>Bid #{alloc.bidId}</span>
                            <span className={themeClasses.textAccent}>
                              {formatEther(BigInt(alloc.tokensFilled))} tokens
                            </span>
                          </div>
                        ))}
                        {exitedAllocations.length > 5 && (
                          <div className="text-xs text-gray-500 text-center pt-1">
                            +{exitedAllocations.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* No Allocations Message */}
                  {!hasExitedAllocations && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      No token allocations yet. Submit a bid to start receiving tokens!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Estimated Value Section */}
            <div>
              <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                Estimated Value
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                {!address ? (
                  <span className="text-gray-500">—</span>
                ) : estimatedValue !== null ? (
                  <span className={themeClasses.textAccent}>
                    $
                    {estimatedValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                ) : isLoadingPriceData ? (
                  <span className="text-gray-500">Calculating...</span>
                ) : (
                  <span className="text-gray-500">$0.00</span>
                )}
              </div>
              {estimatedValue !== null && estimatedValue > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Based on current clearing price
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}