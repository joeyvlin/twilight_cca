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
 * Hook to calculate time until auction starts based on contract startBlock
 */
export function useAuctionCountdown() {
  const { startBlock, currentBlock, isLoading } = useContract();
  const [countdown, setCountdown] = useState<Countdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (isLoading || !startBlock || !currentBlock) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateCountdown = () => {
      // Calculate blocks remaining until start
      const blocksRemaining =
        startBlock > currentBlock ? startBlock - currentBlock : 0n;

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
  }, [startBlock, currentBlock, isLoading]);

  return {
    countdown,
    isBeforeStart:
      startBlock && currentBlock ? currentBlock < startBlock : false,
    blocksRemaining:
      startBlock && currentBlock && startBlock > currentBlock
        ? startBlock - currentBlock
        : 0n,
  };
}
