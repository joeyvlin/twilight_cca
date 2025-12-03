import { HandCoins } from "lucide-react";
import { useState, useEffect } from "react";
// import { useTilt } from "../hooks/useTilt";
import { useThemeClasses } from "../hooks/useThemeClasses";
import { useSubmitBid } from "../hooks/useAuctionContract";
import { useWeb3 } from "../contexts/Web3Context";
import { useContract } from "../contexts/ContractContext";
import { useUserBids, useBidData } from "../hooks/useUserBids";
import { parseEther } from "viem";
import { toast } from "sonner";
import { useEthUsdPrice } from "../hooks/useEthUsdPrice";
import { formatEther } from "viem";
import { useClearingPriceWithFallback } from "../hooks/useClearingPriceWithFallback";


interface MyBidProps {
  activeBids?: Array<{ id: string; budget: number; maxPrice: number }>; // Keep for backward compatibility, but won't be used
}

/**
 * Parse error and return user-friendly message
 */
function parseError(error: any): string {
  // Debug log to see the actual error structure
  console.log("⚠️ parseError received:", error);

  if (!error) return "An unknown error occurred";

  // 1. Check for standard Error object message
  const errorMessage = (
    error?.message || 
    error?.shortMessage || 
    error?.details || 
    (typeof error === 'string' ? error : "")
  ).toLowerCase();

  const errorCode = error?.code || error?.cause?.code;

  console.log("⚠️ Parsed error details:", { errorMessage, errorCode });

  // 2. User rejected transaction (MetaMask specific patterns)
  if (
    errorCode === 4001 ||
    errorCode === "ACTION_REJECTED" ||
    errorMessage.includes("user rejected") ||
    errorMessage.includes("user denied") ||
    errorMessage.includes("rejected") ||
    errorMessage.includes("denied transaction") ||
    errorMessage.includes("user canceled")
  ) {
    return "Transaction was cancelled. No changes were made.";
  }

  // 3. Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // 4. Insufficient funds
  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("balance") ||
    errorCode === "INSUFFICIENT_FUNDS"
  ) {
    return "Insufficient funds. Please check your wallet balance.";
  }

  // 5. Gas estimation errors / Reverts
  if (errorMessage.includes("gas") || errorMessage.includes("execution reverted")) {
    return "Transaction failed. Please check your bid parameters and try again.";
  }

  // 6. Return original message if it's short and readable
  const originalMessage = error?.shortMessage || error?.message || "";
  if (originalMessage && originalMessage.length < 150) {
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
function BidItem({ bidId, ethUsdPrice, skipExitCheck }: { bidId: bigint; ethUsdPrice?: number | null; skipExitCheck?: boolean }) {
  const themeClasses = useThemeClasses();
  const { bidData, isLoading, error } = useBidData(bidId, skipExitCheck);

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
    <div className="flex flex-col gap-3 pb-3 border-b border-gray-700 last:border-0 last:pb-0">
      {/* Top row: Bid Amount and Max Price */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <label className="text-xs sm:text-sm text-gray-400 mb-1 block font-monoDisplay">
            Bid Amount (ETH)
          </label>
          <div className="text-sm sm:text-base font-semibold">
            {bidData.budget.toFixed(4)} 
          </div>
          {ethUsdPrice !== null && ethUsdPrice !== undefined && (
            <div className="text-xs text-gray-400 mt-0.5">
              ≈ ${(bidData.budget * ethUsdPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          )}
        </div>
        <div>
          <label className="text-xs sm:text-sm text-gray-400 mb-1 block font-monoDisplay">
            Max. Price (ETH)
          </label>
          <div className="text-sm sm:text-base font-semibold">
            {bidData.maxPrice.toFixed(6)} 
          </div>
          {ethUsdPrice !== null && ethUsdPrice !== undefined && (
            <div className="text-xs text-gray-400 mt-0.5">
              ≈ ${(bidData.maxPrice * ethUsdPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Tokens Allocated (if any) */}
      {bidData.tokensFilled > 0n && (
        <div className="pt-2 border-t border-gray-700">
          <label className="text-xs sm:text-sm text-gray-400 mb-1 block font-monoDisplay">
            Tokens Allocated
          </label>
          <div className={`text-sm sm:text-base font-semibold ${themeClasses.textAccent}`}>
            {formatEther(bidData.tokensFilled)} tokens
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveBids({ bidIds, source, skipExitCheck }: { bidIds: bigint[]; source?: string; skipExitCheck?: boolean }) {
  const themeClasses = useThemeClasses();
  const { address, isConnected } = useWeb3();
  const ethUsdPrice = useEthUsdPrice();
  
  return (
    <div
      // ref={tiltRef}
      className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6"
      // style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <HandCoins
          className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
        />
        <h2 className="text-lg sm:text-xl font-normal font-body text-gray-300">Active Bids</h2>
        {bidIds.length > 0 && (
          <span className="text-xs sm:text-sm text-gray-400">
            ({bidIds.length})
          </span>
        )}
        {/* Add source indicator */}
        {source === 'indexer' && (
          <span className="text-[8px] text-gray-600 opacity-40" title="Data from indexer">●</span>
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
            <BidItem key={bidId.toString()} bidId={bidId} ethUsdPrice={ethUsdPrice} skipExitCheck={skipExitCheck} />
          ))}
        </div>
      )}
    </div>
  );
}

export function MyBid({ activeBids: _activeBids }: MyBidProps) {
  const themeClasses = useThemeClasses();
  // const tiltRef = useTilt({ maxTilt: 5, scale: 1.02 });
  const { address, isConnected } = useWeb3();
  const { tickSpacing, floorPrice, isLoadingPriceParams, nextBidId } =
    useContract();
  const { submitBid, isPending, isConfirming, isSuccess, error, hash } =
    useSubmitBid();
  const { bidIds, refetch: refetchBids, source, skipExitCheck } = useUserBids();
  const ethUsdPrice = useEthUsdPrice();
  const { clearingPriceEth } = useClearingPriceWithFallback();

  const [budget, setBudget] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [_txHash, setTxHash] = useState<string>("");
  
  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      // Store the hash so it persists
      if (hash) {
        setTxHash(hash);
        console.log("💾 Stored transaction hash:", hash);
      }
      
      // Show success toast
      toast.success("Bid submitted successfully!", {
        description: hash ? (
          <a
            href={getEtherscanUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-200"
          >
            View on Etherscan
          </a>
        ) : undefined,
        duration: 5000,
      });

      // Clear form
      setBudget("");
      setMaxPrice("");
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
    if (isSuccess && (budget || maxPrice)) {
      // setShowSuccess(false); // This is now handled by toast
    }
  }, [budget, maxPrice, isSuccess]);
  // Clear errors when user starts a new transaction attempt
  useEffect(() => {
    if (isPending) {
      // setSubmitError(null); // This is now handled by toast
    }
  }, [isPending]);

  // Clear errors when user starts typing (optional - provides immediate feedback)
  useEffect(() => {
    if (error && (budget || maxPrice)) {
      // Clear error immediately when user starts editing
      // setSubmitError(null); // This is now handled by toast
    }
  }, [budget, maxPrice, error]);
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
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (isLoadingPriceParams || !tickSpacing) {
      toast.info("Loading contract parameters. Please wait...");
      return;
    }

    const budgetNum = parseFloat(budget);
    const maxPriceNum = parseFloat(maxPrice);

    if (!budget || isNaN(budgetNum) || budgetNum <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    if (!maxPrice || isNaN(maxPriceNum) || maxPriceNum <= 0) {
      toast.error("Please enter a valid maximum price");
      return;
    }

    // Validate price is not below floor price
    if (floorPrice) {
      const floorPriceEth = Number(floorPrice) / Number(2n ** 96n);
      if (maxPriceNum < floorPriceEth) {
        toast.error(`Price must be at least ${floorPriceEth.toFixed(6)} ETH (floor price)`);
        return;
      }
    }

    const toastId = toast.loading("Preparing transaction...");

    try {
      // Convert budget to wei (ETH amount)
      const amountInWei = parseEther(budget);

      // Convert max price to Q96 format, aligned to tickSpacing
      const maxPriceQ96 = convertPriceToTickSpacing(maxPriceNum);

      // Submit the bid
      await submitBid(
        maxPriceQ96,
        amountInWei,
        address,
        "0x00" as const, // Empty hook data
        amountInWei // ETH value to send
      );
      
      // Dismiss loading toast (success handled in useEffect)
      toast.dismiss(toastId);
      
    } catch (err: any) {
      console.error("❌ Error in handleSubmitBid catch block:", err);
      
      // Force dismissal of the loading toast first
      toast.dismiss(toastId);

      // Optional: Clear inputs on error/cancellation
      setBudget("");
      setMaxPrice("");

      const friendlyError = parseError(err);
      
      // Show error toast explicitly
      toast.error(friendlyError, {
        duration: 5000, // Keep it visible longer
      });
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
        // Trigger RecentBids refetch via custom event
        window.dispatchEvent(new CustomEvent("bidSubmitted"));
      }
    };

    addBidFromNextBidId();
  }, [isSuccess, address, nextBidId]);

  /**
   * Handle budget input change with validation
   */
  const handleBudgetChange = (value: string) => {
    // Allow empty string for clearing
    if (value === "") {
      setBudget("");
      return;
    }

    // Reject if contains any minus signs or other invalid characters
    if (value.includes("-") || value.includes("+") || value.includes("e") || value.includes("E")) {
      return; // Don't update if contains invalid characters
    }

    // Allow only numbers and single decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return; // Don't update if multiple decimal points
    }

    // Ensure the sanitized value matches what user typed (prevents "1--" becoming "1")
    if (numericValue !== value.replace(/[^0-9.-]/g, "").replace(/-/g, "")) {
      return; // Reject if original had invalid characters
    }

    // Parse and check if negative (shouldn't happen now, but double-check)
    const numValue = parseFloat(numericValue);
    if (isNaN(numValue) || numValue < 0) {
      return; // Don't allow invalid or negative numbers
    }

    setBudget(numericValue);
  };

  /**
   * Handle max price input change with validation
   */
  const handleMaxPriceChange = (value: string) => {
    // Allow empty string for clearing
    if (value === "") {
      setMaxPrice("");
      return;
    }

    // Reject if contains any minus signs or other invalid characters
    if (value.includes("-") || value.includes("+") || value.includes("e") || value.includes("E")) {
      return; // Don't update if contains invalid characters
    }

    // Allow only numbers and single decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    
    // Prevent multiple decimal points
    const parts = numericValue.split(".");
    if (parts.length > 2) {
      return; // Don't update if multiple decimal points
    }

    // Ensure the sanitized value matches what user typed (prevents "1--" becoming "1")
    if (numericValue !== value.replace(/[^0-9.-]/g, "").replace(/-/g, "")) {
      return; // Reject if original had invalid characters
    }

    // Parse and validate
    const numValue = parseFloat(numericValue);
    
    // Don't allow invalid or negative numbers
    if (isNaN(numValue) || numValue < 0) {
      return;
    }

    // Get minimum allowed price (clearing price or floor price)
    let minPrice: number | null = null;
    
    if (clearingPriceEth !== null && clearingPriceEth > 0) {
      minPrice = clearingPriceEth;
    } else if (floorPrice) {
      minPrice = Number(floorPrice) / Number(2n ** 96n);
    }

    // If we have a minimum price and user entered value below it, don't update
    if (minPrice !== null && numValue > 0 && numValue < minPrice) {
      // Show error toast
      toast.error(`Price must be at least ${minPrice.toFixed(6)} ETH`, {
        duration: 3000,
      });
      return; // Don't update the input
    }

    setMaxPrice(numericValue);
  };

  return (
    // UI Improvement: Changed lg:grid-cols-2 to xl:grid-cols-1 (stacking) 
    // and 2xl:grid-cols-2 to prevent cramping on standard laptops.
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6">
      <div
        // ref={tiltRef}
        className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-4 sm:p-5 md:p-6"
        // style={{ transformStyle: "preserve-3d" }}
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <HandCoins
            className={`w-4 h-4 sm:w-5 sm:h-5 ${themeClasses.textAccent}`}
          />
          <h2 className="text-lg sm:text-xl font-normal font-body text-gray-300">My Bid</h2>
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
            <label className="font-monoDisplay text-xs sm:text-sm text-gray-400 mb-1 block">
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
                onChange={(e) => handleBudgetChange(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent minus, plus, and 'e'/'E' keys
                  if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
                disabled={
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                }
                // UI Improvement: text-base on mobile (prevent iOS zoom), text-sm on sm+
                className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pl-7 sm:pl-8 text-base sm:text-sm focus:outline-none ${
                  !isConnected ||
                  isPending ||
                  isConfirming ||
                  isLoadingPriceParams
                    ? "opacity-50 cursor-not-allowed"
                    : themeClasses.focusBorderAccent
                } transition-colors`}
              />
            </div>
            {budget && !isNaN(parseFloat(budget)) && parseFloat(budget) > 0 && ethUsdPrice !== null && (
              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                ≈ ${(parseFloat(budget) * ethUsdPrice).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            )}
          </div>

          <div>
            <label className="font-monoDisplay text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2 block">
              Maximum Price Limit (ETH per token)
            </label>
            {clearingPriceEth !== null && clearingPriceEth > 0 ? (
              <div className="text-xs text-gray-500 mb-1">
                Current clearing price: {clearingPriceEth.toFixed(6)} ETH (minimum required)
              </div>
            ) : floorPrice != null && floorPrice > 0n ? (
              <div className="text-xs text-gray-500 mb-1">
                Floor price: {(Number(floorPrice) / Number(2n ** 96n)).toFixed(6)} ETH (minimum required)
              </div>
            ) : null}
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base">
                Ξ
              </span>
              <input
                type="number"
                step="0.000001"
                min={clearingPriceEth !== null && clearingPriceEth > 0 
                  ? clearingPriceEth.toFixed(6) 
                  : floorPrice 
                    ? (Number(floorPrice) / Number(2n ** 96n)).toFixed(6)
                    : "0"}
                placeholder="0.0"
                value={maxPrice}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent minus, plus, and 'e'/'E' keys
                  if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                    e.preventDefault();
                  }
                }}
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
            {maxPrice && !isNaN(parseFloat(maxPrice)) && parseFloat(maxPrice) > 0 && ethUsdPrice !== null && (
              <div className="text-xs sm:text-sm text-gray-400 mt-1">
                ≈ ${(parseFloat(maxPrice) * ethUsdPrice).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
            )}
          </div>

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
              ? "Check Wallet..."
              : isConfirming
              ? "Confirming..."
              : "Place Bid"}
          </button>

          {/* Handle wagmi error prop - only show if not already shown */}
          {error && (
             // You can keep this as a fallback or rely on the toast in catch block
             <div className="hidden">{/* Error handled by toast */}</div>
          )}
        </div>
      </div>

      <ActiveBids bidIds={bidIds} source={source} skipExitCheck={skipExitCheck} />
    </div>
  );
}
