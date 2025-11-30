import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useBidSubmittedEvent,
  useBidExitedEvent,
  useBid,
} from "./useAuctionContract";

/**
 * Hook to track and fetch all bids for the connected user
 * Note: This requires tracking bid IDs from events
 */
export function useUserBids() {
  const { address } = useAccount();
  const [bidIds, setBidIds] = useState<bigint[]>([]);

  // Listen for new bids
  useBidSubmittedEvent((logs) => {
    if (!address) return;
    logs.forEach((log: any) => {
      if (log.args.owner?.toLowerCase() === address.toLowerCase()) {
        const bidId = log.args.id;
        setBidIds((prev) => {
          if (!prev.includes(bidId)) {
            return [...prev, bidId];
          }
          return prev;
        });
      }
    });
  });

  // Listen for bid exits
  useBidExitedEvent((logs) => {
    if (!address) return;
    logs.forEach((log: any) => {
      const bidId = log.args.bidId;
      setBidIds((prev) => prev.filter((id) => id !== bidId));
    });
  });

  // Fetch all bid data
  const bids = bidIds.map((bidId) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { bid, isLoading, error } = useBid(bidId);
    return { bidId, bid, isLoading, error };
  });

  return {
    bidIds,
    bids,
    isLoading: bids.some((b) => b.isLoading),
  };
}
