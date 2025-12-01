import { useEffect, useState } from "react";
import { useContract } from "../contexts/ContractContext";
import { BLOCK_TIME_MS } from "../config/constants";

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Hook to calculate time until auction ends based on contract endBlock
 * Returns zero countdown if pre-auction or post-auction
 */
export function useAuctionEndCountdown() {
  const { endBlock, currentBlock, isAuctionActive, isLoading } = useContract();
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
      !endBlock ||
      !currentBlock ||
      !isAuctionActive ||
      currentBlock > endBlock
    ) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => {
      // Calculate blocks remaining until end
      const blocksRemaining =
        endBlock > currentBlock ? endBlock - currentBlock : 0n;

      if (blocksRemaining === 0n) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      // Convert blocks to milliseconds
      const millisecondsRemaining = Number(blocksRemaining) * BLOCK_TIME_MS;

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
  }, [endBlock, currentBlock, isAuctionActive, isLoading]);

  return {
    countdown,
    blocksRemaining:
      endBlock && currentBlock && endBlock > currentBlock && isAuctionActive
        ? endBlock - currentBlock
        : 0n,
  };
}
