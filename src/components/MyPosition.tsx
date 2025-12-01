import { Briefcase } from 'lucide-react';
import { useTilt } from '../hooks/useTilt';
import { useThemeClasses } from '../hooks/useThemeClasses';

interface MyPositionProps {
  auctionState?: 'pre-auction' | 'auction-live' | 'post-auction';
  tokenBalance?: number;
  averageEntryPrice?: number;
  estimatedValue?: number;
}


export function MyPosition({ 
  auctionState, 
  tokenBalance = 25.4, 
  averageEntryPrice = 562.89, 
  estimatedValue = 14297.41 
}: MyPositionProps) {
  const themeClasses = useThemeClasses();
  const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });

  const showPlaceholder =
    auctionState === "pre-auction" || auctionState === "auction-live" || auctionState === "post-auction" || !auctionState;
  return (
    <div
      ref={tiltRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6 h-fit"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Briefcase
          className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
        />
        <h2 className="text-lg sm:text-xl font-semibold">My Position</h2>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
            Token Balance
          </div>
          <div className="text-xl sm:text-2xl font-bold">
            {showPlaceholder ? (
              <span className="text-gray-500">—</span>
            ) : (
              <>
                <span className={themeClasses.textAccent}>{tokenBalance}</span>
                <span className="text-base sm:text-lg text-gray-400 ml-1 sm:ml-2">
                  mBTC
                </span>
              </>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
            Average Entry Price
          </div>
          <div className="text-xl sm:text-2xl font-bold">
            {showPlaceholder ? (
              <span className="text-gray-500">—</span>
            ) : (
              <span>${averageEntryPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
            Estimated Value
          </div>
          <div className="text-xl sm:text-2xl font-bold">
            {showPlaceholder ? (
              <span className="text-gray-500">—</span>
            ) : (
              <span className={themeClasses.textAccent}>
                $
                {estimatedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}