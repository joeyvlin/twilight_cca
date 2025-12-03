// src/components/IndexerTest.tsx

import { useIndexerClearingPrice } from "../hooks/useIndexer";
import { useIndexerTotalBidsAmount } from "../hooks/useIndexer";
import { useIndexerUserBids } from "../hooks/useIndexer";
import { useIndexerLatestCheckpoint } from "../hooks/useIndexer";
import { useIndexerHealth } from "../hooks/useIndexer";
import { useIndexerUserTokenAllocations, useIndexerTotalTokensAllocated } from "../hooks/useIndexer";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

export function IndexerTest() {
  const { address } = useAccount();

  // Test all hooks
  const {
    clearingPrice,
    isLoading: loadingClearingPrice,
    error: clearingPriceError,
  } = useIndexerClearingPrice();
  const {
    totalBidsAmount,
    isLoading: loadingTotalBidsAmount,
    error: totalBidsAmountError,
  } = useIndexerTotalBidsAmount();
  const {
    bids: userBids,
    exits: userExits,
    activeBidIds,
    isLoading: loadingUserBids,
    error: userBidsError,
  } = useIndexerUserBids(address);
  const {
    checkpoint,
    isLoading: loadingCheckpoint,
    error: checkpointError,
  } = useIndexerLatestCheckpoint();
  const { isHealthy, isChecking } = useIndexerHealth();
  
  // Token allocation hooks
  const {
    allocations: userTokenAllocations,
    totalAllocated: userTotalAllocated,
    isLoading: loadingUserAllocations,
    error: userAllocationsError,
  } = useIndexerUserTokenAllocations(address);
  
  const {
    totalAllocated: globalTotalAllocated,
    isLoading: loadingGlobalAllocated,
    error: globalAllocatedError,
  } = useIndexerTotalTokensAllocated();

  return (
    <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Indexer Hook Tests</h2>

      {/* Health Check */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Indexer Health
        </h3>
        <p className="text-gray-300">
          Status:{" "}
          {isChecking
            ? "Checking..."
            : isHealthy
            ? "✅ Healthy"
            : "❌ Unhealthy"}
        </p>
      </div>

      {/* Clearing Price */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Latest Clearing Price
        </h3>
        {loadingClearingPrice ? (
          <p className="text-gray-400">Loading...</p>
        ) : clearingPriceError ? (
          <p className="text-red-400">Error: {clearingPriceError.message}</p>
        ) : clearingPrice ? (
          <div className="text-gray-300">
            <p>Block: {clearingPrice.blockNumber}</p>
            <p>Price: {clearingPrice.clearingPrice}</p>
          </div>
        ) : (
          <p className="text-gray-400">No data</p>
        )}
      </div>

      {/* Total Bids Amount (Sum of all submitted bids) */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Total Bids Amount (Committed)
        </h3>
        {loadingTotalBidsAmount ? (
          <p className="text-gray-400">Loading...</p>
        ) : totalBidsAmountError ? (
          <p className="text-red-400">Error: {totalBidsAmountError.message}</p>
        ) : (
          <p className="text-gray-300">
            {totalBidsAmount.toString()} wei ({Number(totalBidsAmount) / 1e18} ETH)
          </p>
        )}
      </div>

      {/* Currency Raised - Note: This should come from contract, not indexer */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Currency Raised (Actual Spent)
        </h3>
        <p className="text-gray-400 text-sm">
          Note: This should be fetched from contract.currencyRaised (RPC call)
        </p>
        <p className="text-gray-300 mt-2">
          When MPS = 0, this should be 0 (no tokens allocated yet)
        </p>
      </div>

      {/* Latest Checkpoint */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Latest Checkpoint
        </h3>
        {loadingCheckpoint ? (
          <p className="text-gray-400">Loading...</p>
        ) : checkpointError ? (
          <p className="text-red-400">Error: {checkpointError.message}</p>
        ) : checkpoint ? (
          <div className="text-gray-300">
            <p>Block: {checkpoint.blockNumber}</p>
            <p>Clearing Price: {checkpoint.clearingPrice}</p>
            <p>Cumulative MPS: {checkpoint.cumulativeMps}</p>
          </div>
        ) : (
          <p className="text-gray-400">No data</p>
        )}
      </div>

      {/* User Bids */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">User Bids</h3>
        {!address ? (
          <p className="text-gray-400">Connect wallet to see your bids</p>
        ) : (
          <div className="text-gray-300 mb-2">
            <p className="text-xs text-gray-500">Searching for address: {address}</p>
            {loadingUserBids ? (
              <p className="text-gray-400">Loading...</p>
            ) : userBidsError ? (
              <p className="text-red-400">Error: {userBidsError.message}</p>
            ) : (
              <div className="text-gray-300">
                <p>Total Bids: {userBids.length}</p>
                <p>Active Bid IDs: {activeBidIds.length}</p>
                <p>Exits: {userExits.length}</p>
                <div className="mt-2">
                  <p className="font-semibold">Bids:</p>
                  {userBids.slice(0, 5).map((bid, idx) => (
                    <div key={idx} className="text-sm ml-4">
                      ID: {bid.event_id}, Amount: {bid.amount}, Price: {bid.price}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Token Allocations */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Your Token Allocations (Exited Bids)
        </h3>
        {!address ? (
          <p className="text-gray-400">Connect wallet to see your allocations</p>
        ) : loadingUserAllocations ? (
          <p className="text-gray-400">Loading...</p>
        ) : userAllocationsError ? (
          <p className="text-red-400">Error: {userAllocationsError.message}</p>
        ) : (
          <div className="text-gray-300">
            <p className="text-lg font-semibold mb-2">
              Total Allocated: {formatEther(userTotalAllocated)} tokens
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Number of Exited Bids with Allocations: {userTokenAllocations.length}
            </p>
            {userTokenAllocations.length > 0 ? (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-400 font-semibold">Allocation Details:</p>
                {userTokenAllocations.slice(0, 10).map((alloc) => (
                  <div key={alloc.id} className="text-sm ml-4 flex justify-between">
                    <span>Bid #{alloc.bidId}</span>
                    <span className="text-green-400">
                      {formatEther(BigInt(alloc.tokensFilled))} tokens
                    </span>
                  </div>
                ))}
                {userTokenAllocations.length > 10 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    +{userTokenAllocations.length - 10} more allocations
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No token allocations from exited bids yet
              </p>
            )}
            <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-700">
              Note: This shows allocations from exited bids only. Active bid allocations are tracked via contract reads.
            </p>
          </div>
        )}
      </div>

      {/* Total Tokens Allocated Globally */}
      <div className="mb-4 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2 text-white">
          Total Tokens Allocated (All Users)
        </h3>
        {loadingGlobalAllocated ? (
          <p className="text-gray-400">Loading...</p>
        ) : globalAllocatedError ? (
          <p className="text-red-400">Error: {globalAllocatedError.message}</p>
        ) : (
          <div className="text-gray-300">
            <p className="text-lg font-semibold">
              {formatEther(globalTotalAllocated)} tokens
            </p>
            <p className="text-sm text-gray-400 mt-1">
              ({globalTotalAllocated.toString()} wei)
            </p>
            <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-700">
              Note: This is the sum of tokensFilled from all BidExited events. Active bid allocations are not included here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
