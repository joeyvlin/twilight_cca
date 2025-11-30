import { useContract } from "../contexts/ContractContext";
import { useWeb3 } from "../contexts/Web3Context";
import { formatPrice, formatBigInt, blocksToTime } from "../utils/formatting";

export function ContractTest() {
  const contract = useContract();
  const { isConnected, isCorrectNetwork } = useWeb3();

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md z-50 shadow-2xl">
      <h3 className="text-lg font-bold mb-3 text-cyan-400">
        Contract Connection Test
      </h3>

      {/* Connection Status */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            Wallet: {isConnected ? "Connected" : "Not Connected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isCorrectNetwork ? "bg-green-500" : "bg-yellow-500"
            }`}
          />
          <span className="text-sm">
            Network: {isCorrectNetwork ? "Sepolia ✓" : "Wrong Network"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              contract.isConfigValid ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            Config: {contract.isConfigValid ? "Valid" : "Invalid"}
          </span>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="mb-4 space-y-1 text-xs">
        <div>
          <span className="text-gray-400">Auction:</span>{" "}
          <span className="text-cyan-300 font-mono">
            {contract.auctionAddress.slice(0, 10)}...
          </span>
        </div>
        <div>
          <span className="text-gray-400">State Lens:</span>{" "}
          <span className="text-cyan-300 font-mono">
            {contract.stateLensAddress.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* Loading States */}
      <div className="mb-4 space-y-1 text-xs">
        <div className="text-gray-400">Loading States:</div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>
            Core:{" "}
            <span
              className={
                contract.isLoading ? "text-yellow-400" : "text-green-400"
              }
            >
              {contract.isLoading ? "Loading..." : "Ready"}
            </span>
          </div>
          <div>
            State:{" "}
            <span
              className={
                contract.isLoadingState ? "text-yellow-400" : "text-green-400"
              }
            >
              {contract.isLoadingState ? "Loading..." : "Ready"}
            </span>
          </div>
          <div>
            Blocks:{" "}
            <span
              className={
                contract.isLoadingBlocks ? "text-yellow-400" : "text-green-400"
              }
            >
              {contract.isLoadingBlocks ? "Loading..." : "Ready"}
            </span>
          </div>
          <div>
            Tokens:{" "}
            <span
              className={
                contract.isLoadingTokenInfo
                  ? "text-yellow-400"
                  : "text-green-400"
              }
            >
              {contract.isLoadingTokenInfo ? "Loading..." : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* Contract Data */}
      <div className="mb-4 space-y-2 text-xs">
        <div className="text-gray-400 font-semibold">Contract Data:</div>
        <div className="space-y-1 pl-2 border-l-2 border-gray-700">
          <div>
            <span className="text-gray-500">Current Block:</span>{" "}
            <span className="text-white font-mono">
              {contract.currentBlock?.toString() || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Start Block:</span>{" "}
            <span className="text-white font-mono">
              {contract.startBlock?.toString() || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">End Block:</span>{" "}
            <span className="text-white font-mono">
              {contract.endBlock?.toString() || "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Blocks Remaining:</span>{" "}
            <span className="text-cyan-300 font-mono">
              {contract.blocksRemaining?.toString() || "N/A"}
            </span>
            {contract.blocksRemaining !== undefined &&
              contract.blocksRemaining !== null && (
                <span className="text-gray-500 ml-1">
                  ({blocksToTime(contract.blocksRemaining)})
                </span>
              )}
          </div>
          <div>
            <span className="text-gray-500">Clearing Price:</span>{" "}
            <span className="text-cyan-300 font-mono">
              {formatPrice(contract.clearingPrice)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Currency Raised:</span>{" "}
            <span className="text-cyan-300 font-mono">
              {formatBigInt(contract.currencyRaised)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Cleared:</span>{" "}
            <span className="text-cyan-300 font-mono">
              {formatBigInt(contract.totalCleared)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Total Supply:</span>{" "}
            <span className="text-cyan-300 font-mono">
              {formatBigInt(contract.totalSupply)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Is Graduated:</span>{" "}
            <span
              className={
                contract.isGraduated ? "text-green-400" : "text-yellow-400"
              }
            >
              {contract.isGraduated
                ? "Yes"
                : contract.isGraduated === false
                ? "No"
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Auction Active:</span>{" "}
            <span
              className={
                contract.isAuctionActive ? "text-green-400" : "text-red-400"
              }
            >
              {contract.isAuctionActive
                ? "Yes"
                : contract.isAuctionActive === false
                ? "No"
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Progress:</span>{" "}
            <span className="text-cyan-300">
              {contract.progressPercentage?.toFixed(2) || "0"}%
            </span>
          </div>
        </div>
      </div>

      {/* Errors */}
      {Object.values(contract.errors).some((err) => err) && (
        <div className="mb-4 space-y-1 text-xs">
          <div className="text-red-400 font-semibold">Errors:</div>
          <div className="space-y-1 pl-2 border-l-2 border-red-700">
            {contract.errors.clearingPrice && (
              <div className="text-red-300">
                Clearing Price: {contract.errors.clearingPrice.message}
              </div>
            )}
            {contract.errors.currencyRaised && (
              <div className="text-red-300">
                Currency Raised: {contract.errors.currencyRaised.message}
              </div>
            )}
            {contract.errors.stateLens && (
              <div className="text-red-300">
                State Lens: {contract.errors.stateLens.message}
              </div>
            )}
            {contract.errors.blocks && (
              <div className="text-red-300">
                Blocks: {contract.errors.blocks.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* State Lens Data (if available) */}
      {contract.auctionState && (
        <div className="mb-4 space-y-1 text-xs">
          <div className="text-green-400 font-semibold">State Lens Data:</div>
          <div className="space-y-1 pl-2 border-l-2 border-green-700">
            <div>
              <span className="text-gray-500">Currency Raised:</span>{" "}
              <span className="text-green-300">
                {formatBigInt(contract.auctionState.currencyRaised)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Total Cleared:</span>{" "}
              <span className="text-green-300">
                {formatBigInt(contract.auctionState.totalCleared)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Is Graduated:</span>{" "}
              <span
                className={
                  contract.auctionState.isGraduated
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {contract.auctionState.isGraduated ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => contract.refetch()}
          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs rounded transition-colors"
        >
          Refetch
        </button>
        <button
          onClick={() => contract.refetchState()}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
        >
          Refetch State
        </button>
      </div>
    </div>
  );
}
