import { Gavel } from 'lucide-react';
import { useTilt } from '../hooks/useTilt';
import { useThemeClasses } from '../hooks/useThemeClasses';
import ElectricBorder from './ElectricBorder';

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
}: AuctionProps) {
  const themeClasses = useThemeClasses();
  const block1Tilt = useTilt({ maxTilt: 6, scale: 1.03 });
  const block2Tilt = useTilt({ maxTilt: 6, scale: 1.03 });
  const block3Tilt = useTilt({ maxTilt: 6, scale: 1.03 });
  const block4Tilt = useTilt({ maxTilt: 6, scale: 1.03 });
  const block5Tilt = useTilt({ maxTilt: 6, scale: 1.03 });

  return (
    <ElectricBorder
      color="#7df9ff"
      speed={0.75}
      chaos={0.375}
      thickness={1.5}
      style={{ borderRadius: 16 }}
      className="h-full"
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-3 sm:p-4 md:p-5 h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Gavel
              className={`w-3 h-3 sm:w-4 sm:h-4 ${themeClasses.textAccent}`}
            />
            <h2 className="text-lg sm:text-xl font-semibold">
              Twilight Real-Time Auction
            </h2>
          </div>
          <span className="px-1.5 sm:px-2 py-0.5 bg-green-500 text-xs font-semibold rounded-full uppercase">
            Live
          </span>
        </div>

        <div className="grid grid-cols-2 grid-rows-3 gap-3 sm:gap-4 md:gap-5 flex-1 auto-rows-fr">
          <div
            ref={block1Tilt}
            id="current-block"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Current Block
            </div>
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {currentBlock !== undefined &&
              totalBlocks !== undefined &&
              totalBlocks > 0 ? (
                <>
                  #{currentBlock.toLocaleString()} /{" "}
                  {totalBlocks.toLocaleString()}
                </>
              ) : (
                <span className="text-gray-500">Loading...</span>
              )}
            </div>
          </div>
          <div
            ref={block2Tilt}
            id="clearing-price"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Last Clearing Price
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {lastClearingPrice > 0 ? (
                `${lastClearingPrice.toFixed(6)} ETH`
              ) : (
                <span className="text-gray-500">No price yet</span>
              )}
            </div>
          </div>
          <div
            ref={block3Tilt}
            id="block-ends"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Block Ends In
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {countdown1.days === 0 &&
              countdown1.hours === 0 &&
              countdown1.minutes === 0 &&
              countdown1.seconds === 0 ? (
                <span className="text-gray-500">00:00:00</span>
              ) : countdown1.days > 0 ? (
                `${countdown1.days}d ${String(countdown1.hours).padStart(
                  2,
                  "0"
                )}:${String(countdown1.minutes).padStart(2, "0")}:${String(
                  countdown1.seconds
                ).padStart(2, "0")}`
              ) : (
                formatTime(countdown1)
              )}
            </div>
          </div>
          <div
            ref={block4Tilt}
            id="auction-ends"
            className={`border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:p-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Auction Ends In
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {countdown2.days === 0 &&
              countdown2.hours === 0 &&
              countdown2.minutes === 0 &&
              countdown2.seconds === 0 ? (
                <span className="text-gray-500">00:00:00</span>
              ) : countdown2.days > 0 ? (
                `${countdown2.days}d ${String(countdown2.hours).padStart(
                  2,
                  "0"
                )}:${String(countdown2.minutes).padStart(2, "0")}:${String(
                  countdown2.seconds
                ).padStart(2, "0")}`
              ) : (
                formatTime(countdown2)
              )}
            </div>
          </div>
          <div
            ref={block5Tilt}
            id="tokens-allocated"
            className={`col-span-2 border border-gray-700 rounded-lg px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent} transition-colors flex flex-col items-center justify-center text-center cursor-pointer`}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
              Allocated Tokens
            </div>
            <div
              className={`text-lg sm:text-xl md:text-2xl font-bold ${themeClasses.textAccent}`}
            >
              {(allocatedTokens / 1000000).toFixed(1)}M /{" "}
              {(totalTokens / 1000000).toFixed(1)}M ({allocatedPercentage}%)
            </div>
          </div>
        </div>
      </div>
    </ElectricBorder>
  );
}

