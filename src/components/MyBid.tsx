import { HandCoins } from "lucide-react";
import { useState, useEffect } from "react";
import { useTilt } from "../hooks/useTilt";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useSubmitBid } from "../hooks/useAuctionContract";
import { useWeb3 } from "../contexts/Web3Context";
import { useContract } from "../contexts/ContractContext";
import { useUserBids, useBidData } from "../hooks/useUserBids";
import { parseEther } from "viem";


interface MyBidProps {
  activeBids?: Array<{ id: string; budget: number; maxPrice: number }>; // Keep for backward compatibility, but won't be used
}

/**
 * Parse error and return user-friendly message
 */
function parseError(error: any): string {
  if (!error) return "An unknown error occurred";

  // Check for user rejection errors
  const errorMessage = error?.message?.toLowerCase() || "";
  const errorCode = error?.code || error?.shortMessage || "";

  // User rejected transaction in MetaMask
  if (
    errorCode === 4001 ||
    errorCode === "ACTION_REJECTED" ||
    errorMessage.includes("user rejected") ||
    errorMessage.includes("user denied") ||
    errorMessage.includes("rejected") ||
    errorMessage.includes("denied transaction")
  ) {
    return "Transaction was cancelled. No changes were made.";
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Insufficient funds
  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("balance") ||
    errorCode === "INSUFFICIENT_FUNDS"
  ) {
    return "Insufficient funds. Please check your wallet balance.";
  }

  // Gas estimation errors
  if (errorMessage.includes("gas") || errorMessage.includes("execution reverted")) {
    return "Transaction failed. Please check your bid parameters and try again.";
  }

  // Return original message if it's short and readable, otherwise generic message
  const originalMessage = error?.message || error?.shortMessage || "";
  if (originalMessage && originalMessage.length < 100) {
    return originalMessage;
  }

  return "Transaction failed. Please try again.";
}
/**
 * Get Etherscan URL for a transaction hash on Sepolia
 */
function getEtherscanUrl(txHash: string): string {
  return `https://sepolia.etherscan.io/tx/${txHash}`;
}

// Component to fetch and display a single bid
// Component to fetch and display a single bid
function BidItem({ bidId }: { bidId: bigint }) {
  const themeClasses = useThemeClasses();
  const { bidData, isLoading, error } = useBidData(bidId);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("BidItem Debug:", {
        bidId: bidId.toString(),
        isLoading,
        error: error?.message,
        bidData,
      });
    }
  }, [bidId, isLoading, error, bidData]);

  if (isLoading) {
    return (
      <div className="flex justify-between items-center gap-4 pb-3 border-b border-gray-700">
        <div className="text-xs text-gray-500">Loading bid data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-between items-center gap-4 pb-3 border-b border-gray-700">
        <div className="text-xs text-red-400">
          Error loading bid: {error.message}
        </div>
      </div>
    );
  }

  if (!bidData) {
    return (
      <div className="flex justify-between items-center gap-4 pb-3 border-b border-gray-700">
        <div className="text-xs text-yellow-400">
          Bid #{bidId.toString()} - No data available (may be exited or invalid)
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center gap-4 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
      <div>
        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">
          Bid Amount (ETH)
        </label>
        <div className="text-sm sm:text-base font-semibold">
          {bidData.budget.toFixed(4)} 
        </div>
      </div>
      <div>
        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">
          Max. Price (ETH)
        </label>
        <div className="text-sm sm:text-base font-semibold">
          {bidData.maxPrice.toFixed(6)} 
        </div>
      </div>
    </div>
  );
}

function ActiveBids({ bidIds }: { bidIds: bigint[] }) {
  const themeClasses = useThemeClasses();
  const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  const { address, isConnected } = useWeb3();
  // const { bidIds } = useUserBids();

  return (
    <div
      ref={tiltRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <HandCoins
          className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
        />
        <h2 className="text-lg sm:text-xl font-semibold">Active Bids</h2>
        {bidIds.length > 0 && (
          <span className="text-xs sm:text-sm text-gray-400">
            ({bidIds.length})
          </span>
        )}
      </div>

      {!isConnected || !address ? (
        <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
          Connect wallet to see your bids
        </div>
      ) : bidIds.length === 0 ? (
        <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
          No active bids
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {bidIds.map((bidId) => (
            <BidItem key={bidId.toString()} bidId={bidId} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MyBid({ activeBids }: MyBidProps) {
  const themeClasses = useThemeClasses();
  const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  const { address, isConnected } = useWeb3();
  const { tickSpacing, floorPrice, isLoadingPriceParams, nextBidId } =
    useContract();
  const { submitBid, isPending, isConfirming, isSuccess, error, hash } =
    useSubmitBid();
  const { bidIds, refetch: refetchBids } = useUserBids();

  const [budget, setBudget] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string>("");
  // Clear errors when user starts typing or when transaction state resets
  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setSubmitError(null);
      }, 3000); // Auto-clear after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  // // Clear errors when transaction succeeds
  // useEffect(() => {
  //   if (isSuccess) {
  //     setSubmitError(null);
  //   }
  // }, [isSuccess]);
  // Clear form fields after successful submission
  // Handle success state and clear form after delay
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      setSubmitError(null);

      // Store the hash so it persists even if wagmi resets it
      if (hash) {
        setTxHash(hash);
        console.log("💾 Stored transaction hash:", hash);
      }
      // Clear form and hide success message after 3 seconds
      const timer = setTimeout(() => {
        setBudget("");
        setMaxPrice("");
        setShowSuccess(false);
      }, 3000); // Show success for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash]);
  // Store hash when it becomes available (even before success)
  useEffect(() => {
    if (hash) {
      console.log("🔗 Transaction hash available:", hash);
      setTxHash(hash);
    }
  }, [hash]);
  // Clear success message when user starts entering new bid
  useEffect(() => {
    if (showSuccess && (budget || maxPrice)) {
      setShowSuccess(false);
    }
  }, [budget, maxPrice, showSuccess]);
  // Clear errors when user starts a new transaction attempt
  useEffect(() => {
    if (isPending) {
      setSubmitError(null);
    }
  }, [isPending]);

  // Clear errors when user starts typing (optional - provides immediate feedback)
  useEffect(() => {
    if (submitError && (budget || maxPrice)) {
      // Clear error immediately when user starts editing
      setSubmitError(null);
    }
  }, [budget, maxPrice]);
  /**
   * Convert ETH price to Q96 format, aligned to tickSpacing
   * tickSpacing defines the minimum price increment in Q96 format
   */
  const convertPriceToTickSpacing = (priceInEth: number): bigint => {
    if (!tickSpacing) {
      throw new Error(
        "Tick spacing not available. Please wait for contract data to load."
      );
    }

    // Convert price in ETH to Q96 format
    // Price in Q96 = (price in wei * 2^96) / 1e18
    const priceInWei = BigInt(Math.floor(priceInEth * 1e18));
    const q96Multiplier = 2n ** 96n;
    const priceQ96 = (priceInWei * q96Multiplier) / BigInt(1e18);

    // Round to nearest tick based on tickSpacing
    // tickSpacing is in Q96 format, so we divide by tickSpacing, round, then multiply back
    const tick = priceQ96 / tickSpacing;
    const roundedPriceQ96 = tick * tickSpacing;

    return roundedPriceQ96;
  };

  const handleSubmitBid = async () => {
    setTxHash("");
    setShowSuccess(false);
    if (!isConnected || !address) {
      setSubmitError("Please connect your wallet first");
      return;
    }

    if (isLoadingPriceParams || !tickSpacing) {
      setSubmitError("Loading contract parameters. Please wait...");
      return;
    }

    const budgetNum = parseFloat(budget);
    const maxPriceNum = parseFloat(maxPrice);

    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      setSubmitError("Please enter a valid budget amount");
      return;
    }

    if (!maxPrice || isNaN(maxPriceNum) || maxPriceNum <= 0) {
      setSubmitError("Please enter a valid maximum price");
      return;
    }

    // Validate price is not below floor price
    if (floorPrice) {
      const floorPriceEth = Number(floorPrice) / Number(2n ** 96n);
      if (maxPriceNum < floorPriceEth) {
        setSubmitError(
          `Price must be at least ${floorPriceEth.toFixed(6)} ETH (floor price)`
        );
        return;
      }
    }

    setSubmitError(null);

    try {
      // Convert budget to wei (ETH amount) - this is correct
      const amountInWei = parseEther(budget);

      // Convert max price to Q96 format, aligned to tickSpacing
      const maxPriceQ96 = convertPriceToTickSpacing(maxPriceNum);

      console.log("Submitting bid:", {
        budget: budgetNum,
        maxPrice: maxPriceNum,
        amountInWei: amountInWei.toString(),
        maxPriceQ96: maxPriceQ96.toString(),
        tickSpacing: tickSpacing.toString(),
      });

      // Submit the bid
      await submitBid(
        maxPriceQ96,
        amountInWei,
        address,
        "0x00" as const, // Empty hook data
        amountInWei // ETH value to send
      );
    } catch (err: any) {
      console.error("Error submitting bid:", err);
      const friendlyError = parseError(err);
      setSubmitError(friendlyError);
    }
  };

  // Reset form on success
  // After successful bid submission
  // Extract bid ID using nextBidId after successful submission
  // Extract bid ID using nextBidId after successful submission
  useEffect(() => {
    const addBidFromNextBidId = async () => {
      if (isSuccess && address) {
        console.log(
          "✅ Bid submitted successfully, waiting for contract update..."
        );

        // Wait for the transaction to be mined and contract to update
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased to 5 seconds

        // Refetch nextBidId to get the updated value
        // Note: We need to get the current nextBidId value
        // Since we can't directly refetch here, we'll use the value from context
        // But it might not be updated yet, so we'll try a different approach

        if (nextBidId && nextBidId > 0n) {
          // The bid ID should be nextBidId - 1 (since it increments after submission)
          const bidId = (nextBidId - 1n).toString();

          console.log(
            "📝 Adding bid ID from nextBidId:",
            bidId,
            "Current nextBidId:",
            nextBidId.toString()
          );

          const stored = localStorage.getItem(
            `userBids_${address.toLowerCase()}`
          );
          const existingBids = stored ? JSON.parse(stored) : [];

          const newBid = {
            bidId,
            status: "active" as const,
            lastValidated: Date.now(),
          };

          const exists = existingBids.some((b: any) => b.bidId === bidId);
          if (!exists) {
            const updatedBids = [...existingBids, newBid];
            localStorage.setItem(
              `userBids_${address.toLowerCase()}`,
              JSON.stringify(updatedBids)
            );
            console.log("💾 Added bid to localStorage:", newBid);
            console.log("💾 Updated bids array:", updatedBids);
            console.log("💾 Storage key:", `userBids_${address.toLowerCase()}`);

            // Verify it was saved
            const verify = localStorage.getItem(
              `userBids_${address.toLowerCase()}`
            );
            console.log("✅ Verification - localStorage now contains:", verify);
            // Refresh to show the new bid
            refetchBids();
          } else {
            console.log("⏭️ Bid already exists in storage");
          }
        } else {
          console.log("⚠️ nextBidId not available yet, will retry...");
          // Could add retry logic here if needed
        }
      }
    };

    addBidFromNextBidId();
  }, [isSuccess, address, nextBidId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div
        ref={tiltRef}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <HandCoins
            className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
          />
          <h2 className="text-lg sm:text-xl font-semibold">My Bid</h2>
        </div>

        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg text-sm text-yellow-200">
            Please connect your wallet to place a bid
          </div>
        )}

        {isLoadingPriceParams && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg text-sm text-blue-200">
            Loading contract parameters...
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">
              Bid Amount (ETH)
            </label>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                Ξ
              </span>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="0.0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                disabled={
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                }
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pl-7 sm:pl-8 text-sm sm:text-base focus:outline-none ${
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                    ? "opacity-50 cursor-not-allowed"
                    : themeClasses.focusBorderAccent
                } transition-colors`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">
              Maximum Price Limit (ETH per token)
            </label>
            {floorPrice != null && floorPrice > 0n && (
              <div className="text-xs text-gray-500 mb-1">
                Floor price:{" "}
                {(Number(floorPrice) / Number(2n ** 96n)).toFixed(6)} ETH
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                Ξ
              </span>
              <input
                type="number"
                step="0.000001"
                min="0"
                placeholder="0.0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                disabled={
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                }
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pl-7 sm:pl-8 text-sm sm:text-base focus:outline-none ${
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                    ? "opacity-50 cursor-not-allowed"
                    : themeClasses.focusBorderAccent
                } transition-colors`}
              />
            </div>
          </div>

          {submitError && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-sm text-red-200">
              {submitError}
            </div>
          )}

          {showSuccess && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg text-sm text-green-200">
              <div className="flex items-center justify-between gap-2">
                <span>Bid submitted successfully! 🎉</span>
                {(txHash || hash) && (
                  <a
                    href={getEtherscanUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline text-xs flex items-center gap-1"
                  >
                    View on Etherscan
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmitBid}
            disabled={
              !isConnected ||
              isPending ||
              isConfirming ||
              showSuccess ||
              !budget ||
              !maxPrice ||
              isLoadingPriceParams ||
              !tickSpacing
            }
            className={`w-full ${
              !isConnected ||
              isPending ||
              isConfirming ||
              !budget ||
              !maxPrice ||
              isLoadingPriceParams ||
              !tickSpacing
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : `${themeClasses.bgAccent} ${themeClasses.textAccentHover} ${themeClasses.hoverBgAccentHover}`
            } font-semibold py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base`}
          >
            {isLoadingPriceParams
              ? "Loading..."
              : isPending
              ? "Preparing transaction..."
              : isConfirming
              ? "Confirming..."
              : showSuccess
              ? "Bid Submitted!"
              : "Place Bid"}
          </button>

          {/* Handle wagmi error prop - only show if not already shown in submitError */}
          {error && !submitError && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg text-sm text-red-200 mt-2">
              {parseError(error)}
            </div>
          )}
        </div>
      </div>

      <ActiveBids bidIds={bidIds} />
    </div>
  );
}
