import { useEffect, useState } from "react";
import { useContract } from "../contexts/ContractContext";
import { BLOCK_TIME_MS, AUCTION_CONFIG } from "../config/constants";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Hook to calculate time until current epoch ends
 * Uses epoch configuration from constants
 */
export function useBlockEndCountdown() {
  const { currentBlock, startBlock, isAuctionActive, isLoading } =
    useContract();
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Return zero if not auction-live, loading, or missing data
    if (
      isLoading ||
      !currentBlock ||
      !startBlock ||
      !isAuctionActive ||
      currentBlock < startBlock
    ) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => {
      // Calculate blocks elapsed in current auction
      const blocksElapsed =
        currentBlock >= startBlock ? Number(currentBlock - startBlock) : 0;

      // Get epoch configuration
      const epochsConfig = AUCTION_CONFIG.duration.epochsConfig;

      // Determine which epoch we're in and calculate blocks remaining
      let cumulativeBlocks = 0;
      let currentEpochIndex = -1;
      let blocksRemainingInEpoch = 0;

      for (let i = 0; i < epochsConfig.length; i++) {
        const epochBlocks = epochsConfig[i].blocks;
        const epochStart = cumulativeBlocks;
        const epochEnd = cumulativeBlocks + epochBlocks;

        if (blocksElapsed >= epochStart && blocksElapsed < epochEnd) {
          // We're in this epoch
          currentEpochIndex = i;
          blocksRemainingInEpoch = epochEnd - blocksElapsed;
          break;
        }

        cumulativeBlocks += epochBlocks;
      }

      // If we've passed all epochs, show zero
      if (currentEpochIndex === -1 || blocksRemainingInEpoch <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Convert blocks to milliseconds
      const millisecondsRemaining = blocksRemainingInEpoch * BLOCK_TIME_MS;

      // Calculate time components
      const days = Math.floor(millisecondsRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (millisecondsRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (millisecondsRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((millisecondsRemaining % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [currentBlock, startBlock, isAuctionActive, isLoading]);

  return {
    countdown,
    blocksRemaining: 0n, // Can be calculated if needed
  };
}
