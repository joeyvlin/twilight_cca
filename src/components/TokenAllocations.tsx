import { useAccount } from "wagmi";
import { useUserBids } from "../hooks/useUserBids";
import { useBidData } from "../hooks/useUserBids";
import { useIndexerUserTokenAllocations } from "../hooks/useIndexer";
import { formatEther } from "viem";
import { useThemeClasses } from "../hooks/useThemeClasses";
/**
 * Component to display token allocations for active bids
 * Reads tokensFilled from contract for each active bid
 */
function ActiveBidAllocation({ bidId, skipExitCheck }: { bidId: bigint; skipExitCheck?: boolean }) {
  const themeClasses = useThemeClasses();
  const { bidData } = useBidData(bidId, skipExitCheck);

  if (!bidData || bidData.tokensFilled === 0n) {
    return null;
  }

  return (
    <div className="text-sm text-gray-300 flex justify-between items-center py-1">
      <span>Bid #{bidId.toString()}</span>
      <span className={`font-semibold ${themeClasses.textAccent}`}>
        {formatEther(bidData.tokensFilled)} tokens
      </span>
    </div>
  );
}

/**
 * Component to display token allocations for a user
 * Combines:
 * - Exited bids from indexer (BidExited events)
 * - Active bids from contract (bids(bidId).tokensFilled)
 */
export function TokenAllocations() {
  const { address } = useAccount();
  const themeClasses = useThemeClasses();
  const { bidIds, skipExitCheck } = useUserBids();

  // Get exited bid allocations from indexer
  const {
    allocations: exitedAllocations,
    totalAllocated: exitedTotal,
    isLoading: loadingExited,
    error: exitedError,
  } = useIndexerUserTokenAllocations(address);

  const totalExited = exitedTotal || 0n;
  const hasExitedAllocations = exitedAllocations.length > 0;
  const hasActiveBids = bidIds.length > 0;

  return (
    <div
      className={`border border-gray-700 rounded-lg px-4 py-5 bg-gradient-to-r from-gray-800/50 to-transparent ${themeClasses.hoverBorderAccent}`}
    >
      <h3
        className={`text-lg font-semibold mb-4 ${themeClasses.textAccent} font-body text-gray-300`}
      >
        Your Token Allocations
      </h3>

      {!address ? (
        <p className="text-gray-400 text-sm">
          Connect wallet to see your token allocations
        </p>
      ) : loadingExited ? (
        <p className="text-gray-400 text-sm">Loading allocations...</p>
      ) : exitedError ? (
        <p className="text-red-400 text-sm">
          Error loading allocations: {exitedError.message}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Exited Bids Section */}
          {hasExitedAllocations && (
            <div>
              <div className="text-xs text-gray-400 mb-2">From Exited Bids</div>
              <div
                className={`text-xl font-bold ${themeClasses.textAccent} mb-3`}
              >
                {formatEther(totalExited)} tokens
              </div>

              {exitedAllocations.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">
                    Allocation History
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {exitedAllocations.slice(0, 10).map((alloc) => (
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
                    {exitedAllocations.length > 10 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        +{exitedAllocations.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Bids Section */}
          {hasActiveBids && (
            <div
              className={
                hasExitedAllocations ? "pt-4 border-t border-gray-700" : ""
              }
            >
              <div className="text-xs text-gray-400 mb-2">From Active Bids</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {bidIds.map((bidId: bigint) => (
                  <ActiveBidAllocation key={bidId.toString()} bidId={bidId} skipExitCheck={skipExitCheck} />
                ))}
                {bidIds.length === 0 && (
                  <div className="text-sm text-gray-500 italic">
                    No allocations yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Allocations Message */}
          {!hasExitedAllocations && !hasActiveBids && (
            <div className="text-sm text-gray-500 text-center py-4">
              No token allocations yet. Submit a bid to start receiving tokens!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
