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

// Component to fetch and display a single bid
// Component to fetch and display a single bid
function BidItem({ bidId }: { bidId: bigint }) {
  const themeClasses = useThemeClasses();
  const { bidData, isLoading, error } = useBidData(bidId);

  // Debug logging
  useEffect(() => {
    console.log("BidItem Debug:", {
      bidId: bidId.toString(),
      isLoading,
      error: error?.message,
      bidData,
    });
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
          Budget
        </label>
        <div className="text-sm sm:text-base font-semibold">
          {bidData.budget.toFixed(4)} ETH
        </div>
      </div>
      <div>
        <label className="text-xs sm:text-sm text-gray-400 mb-1 block">
          Max. Price
        </label>
        <div className="text-sm sm:text-base font-semibold">
          {bidData.maxPrice.toFixed(6)} ETH
        </div>
      </div>
    </div>
  );
}

function ActiveBids() {
  const themeClasses = useThemeClasses();
  const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  const { address, isConnected } = useWeb3();
  const { bidIds } = useUserBids();

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
  const { tickSpacing, floorPrice, isLoadingPriceParams } = useContract();
  const { submitBid, isPending, isConfirming, isSuccess, error } =
    useSubmitBid();

  const [budget, setBudget] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      setSubmitError(err?.message || "Failed to submit bid. Please try again.");
    }
  };

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setBudget("");
        setMaxPrice("");
        setSubmitError(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

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

          {isSuccess && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg text-sm text-green-200">
              Bid submitted successfully! 🎉
            </div>
          )}

          <button
            onClick={handleSubmitBid}
            disabled={
              !isConnected ||
              isPending ||
              isConfirming ||
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
              : isSuccess
              ? "Bid Submitted!"
              : "Place Bid"}
          </button>

          {error && (
            <div className="text-xs text-red-400 mt-2">
              Transaction error: {error.message}
            </div>
          )}
        </div>
      </div>

      <ActiveBids />
    </div>
  );
}
