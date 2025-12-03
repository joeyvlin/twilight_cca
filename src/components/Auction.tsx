import { Gavel, HandCoins, Users } from 'lucide-react';
// import { useTilt } from '../hooks/useTilt';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { useClearingPriceWithFallback } from "../hooks/useClearingPriceWithFallback";

interface AuctionProps {
  countdown1: { days: number; hours: number; minutes: number; seconds: number }; 
  countdown2: { days: number; hours: number; minutes: number; seconds: number };
  formatTime: (time: {
    hours: number;
    minutes: number;
    seconds: number;
  }) => string;
  currentBlock?: number;
  totalBlocks?: number;
  lastClearingPrice?: number;
  allocatedTokens?: number;
  totalTokens?: number;
  allocatedPercentage?: number;
  // Add floorPrice prop
  floorPrice?: number;
  // Add ethUsdPrice prop
  ethUsdPrice?: number | null;
  // Add Total Bids and Active Bidders props
  totalBids?: number | string;
  activeBidders?: number;
  isLoadingBidders?: boolean;
}

export function Auction({ 
  countdown1, 
  countdown2, 
  formatTime,
  currentBlock = 12547,
  totalBlocks = 12600,
  lastClearingPrice = 589.42,
  allocatedTokens = 2500000,
  totalTokens = 5000000,
  allocatedPercentage = 50,
  // Default floor price if not provided
  floorPrice = 0.00001,
  ethUsdPrice = null,
  totalBids = 0,
  activeBidders = 0,
  isLoadingBidders = false,
}: AuctionProps) {
  const themeClasses = useThemeClasses();
  
  // Use the fallback hook - prefers indexer, falls back to RPC
  const { clearingPriceEth: displayPrice, source } = useClearingPriceWithFallback();
  
  // Determine price label based on source and availability
  const priceLabel = displayPrice && displayPrice > 0 
    ? "Last Clearing Price" 
    : (lastClearingPrice > 0 ? "Last Clearing Price" : "Floor Price");
  
  // Use displayPrice from hook, fallback to prop if needed
  const finalDisplayPrice = displayPrice ?? lastClearingPrice ?? floorPrice;

  // Format countdown for display
  const formatCountdown = (cd: { days: number; hours: number; minutes: number; seconds: number }) => {
    if (cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0) {
      return "00:00:00";
    }
    if (cd.days > 0) {
      return `${cd.days}d ${String(cd.hours).padStart(2, "0")}:${String(cd.minutes).padStart(2, "0")}:${String(cd.seconds).padStart(2, "0")}`;
    }
    return formatTime(cd);
  };

  return (
    <div className="h-full rounded-2xl p-[2px] bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 sm:p-4 md:p-5 h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Gavel
              className={`w-3 h-3 sm:w-4 sm:h-4 ${themeClasses.textAccent}`}
            />
            <h2 className={`text-lg sm:text-xl font-normal font-body text-gray-300`}>
              Twilight Real-Time Auction
            </h2>
          </div>
          <span className="px-1.5 sm:px-2 py-0.5 bg-green-500 text-xs font-monoDisplay font-semibold rounded-full uppercase">
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 grid-rows-3 gap-3 sm:gap-4 md:gap-5 flex-1 auto-rows-fr">
          {/* Current Block */}
          <div
            id="current-block"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Current Block
            </div>
            <div className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}>
              {currentBlock !== undefined &&
              totalBlocks !== undefined &&
              totalBlocks > 0 ? (
                <>
                  {currentBlock.toLocaleString()} /{" "}
                  {totalBlocks.toLocaleString()}
                </>
              ) : (
                <span className="text-gray-500">Loading...</span>
              )}
            </div>
          </div>

          {/* Last Clearing Price */}
          <div
            id="clearing-price"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 flex items-center gap-1">
              {priceLabel}
              {source === 'indexer' && (
                <span className="text-[8px] text-gray-600 opacity-40" title="Data from indexer">●</span>
              )}
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {finalDisplayPrice > 0 ? (
                <div className="flex flex-col">
                  <span>{finalDisplayPrice.toFixed(6)} ETH</span>
                  {ethUsdPrice !== null && ethUsdPrice !== undefined && (
                    <span className="font-body text-xs sm:text-sm text-gray-400 mt-1">
                      ${(finalDisplayPrice * ethUsdPrice >= 1000
                        ? `${((finalDisplayPrice * ethUsdPrice) / 1000).toFixed(2)}K`
                        : (finalDisplayPrice * ethUsdPrice).toFixed(2))}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500">Loading...</span>
              )}
            </div>
          </div>

          {/* Merged: Block Ends In & Auction Ends In */}
          <div
            id="countdowns"
            className={`col-span-2 border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors cursor-pointer`}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  Block Ends In
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-bold ${themeClasses.textAccent}`}
                >
                  {formatCountdown(countdown1)}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-l border-gray-700">
                <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  Auction Ends In
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-bold ${themeClasses.textAccent}`}
                >
                  {formatCountdown(countdown2)}
                </div>
              </div>
            </div>
          </div>

          {/* Total Bids & Active Bidders */}
          <div
            id="bids-bidders"
            className={`col-span-2 border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors cursor-pointer`}
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                  <HandCoins
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${themeClasses.textAccent}`}
                  />
                  <div className="text-xs sm:text-sm text-gray-400">
                    Total Bids
                  </div>
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-bold ${themeClasses.textAccent}`}
                >
                  {totalBids}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center border-l border-gray-700">
                <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                  <Users
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${themeClasses.textAccent}`}
                  />
                  <div className="text-xs sm:text-sm text-gray-400">
                    Active Bidders
                  </div>
                </div>
                <div
                  className={`text-base sm:text-lg md:text-xl font-bold ${themeClasses.textAccent}`}
                >
                  {isLoadingBidders ? (
                    <span className="text-gray-500">Loading...</span>
                  ) : (
                    activeBidders.toLocaleString()
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Allocated Tokens */}
          <div
            id="tokens-allocated"
            className={`col-span-2 border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Allocated Tokens
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {Math.ceil(allocatedTokens / 10 ** 18).toLocaleString()} /{" "}
              {(totalTokens / 1000000 / 10 ** 18).toFixed(1)}M (
              {allocatedPercentage.toFixed(6)}%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

