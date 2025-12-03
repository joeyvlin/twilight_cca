// src/services/indexer.ts
import {
  BidSubmitted,
  BidExited,
  ClearingPriceUpdated,
  CheckpointUpdated,
  AuctionStepRecorded,
} from "../types/indexer";

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL || "http://localhost:8080";

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

async function graphqlQuery<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(`${INDEXER_URL}/v1/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const result: GraphQLResponse<T> = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(
        `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`
      );
    }

    return result.data;
  } catch (error) {
    console.error("Indexer query error:", error);
    throw error;
  }
}

/**
 * Get the latest clearing price from indexer
 */
export async function getLatestClearingPrice(): Promise<ClearingPriceUpdated | null> {
  const query = `
    query LatestClearingPrice {
      TwilightCCADemo_ClearingPriceUpdated(
        limit: 1
        order_by: { blockNumber: desc }
      ) {
        id
        blockNumber
        clearingPrice
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_ClearingPriceUpdated: ClearingPriceUpdated[];
  }>(query);

  return result.TwilightCCADemo_ClearingPriceUpdated[0] || null;
}

/**
 * Get all bids submitted by a specific user
 */
export async function getUserBids(owner: string): Promise<BidSubmitted[]> {
  // Try with lowercase first, but also check if we need to handle checksummed addresses
  const query = `
    query UserBids($owner: String!) {
      TwilightCCADemo_BidSubmitted(
        where: { owner: { _eq: $owner } }
        order_by: { event_id: desc }
      ) {
        id
        event_id
        owner
        price
        amount
      }
    }
  `;

  // Try lowercase first
  let result = await graphqlQuery<{
    TwilightCCADemo_BidSubmitted: BidSubmitted[];
  }>(query, { owner: owner.toLowerCase() });

  // If no results and address is checksummed, try original case
  if (result.TwilightCCADemo_BidSubmitted.length === 0 && owner !== owner.toLowerCase()) {
    result = await graphqlQuery<{
      TwilightCCADemo_BidSubmitted: BidSubmitted[];
    }>(query, { owner });
  }

  return result.TwilightCCADemo_BidSubmitted || [];
}

/**
 * Get all bid exits for a specific user
 */
export async function getUserBidExits(owner: string): Promise<BidExited[]> {
  const query = `
    query UserBidExits($owner: String!) {
      TwilightCCADemo_BidExited(
        where: { owner: { _eq: $owner } }
        order_by: { bidId: asc }
      ) {
        id
        bidId
        owner
        tokensFilled
        currencyRefunded
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidExited: BidExited[];
  }>(query, { owner: owner.toLowerCase() });

  return result.TwilightCCADemo_BidExited || [];
}

/**
 * Get total count of bids
 */
export async function getTotalBidsCount(): Promise<number> {
  // Since aggregate might not be available, fetch all and count
  const query = `
    query TotalBids {
      TwilightCCADemo_BidSubmitted {
        id
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidSubmitted: { id: string }[];
  }>(query);

  return result.TwilightCCADemo_BidSubmitted?.length || 0;
}

/**
 * Get all bids (for calculating currency raised)
 */
export async function getAllBids(): Promise<BidSubmitted[]> {
  const query = `
    query AllBids {
      TwilightCCADemo_BidSubmitted(
        order_by: { event_id: desc }
      ) {
        id
        event_id
        owner
        price
        amount
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidSubmitted: BidSubmitted[];
  }>(query);

  return result.TwilightCCADemo_BidSubmitted || [];
}

/**
 * Get the most recent bids from all users
 */
export async function getRecentBids(limit: number = 10): Promise<BidSubmitted[]> {
  const query = `
    query RecentBids($limit: Int!) {
      TwilightCCADemo_BidSubmitted(
        limit: $limit
        order_by: { event_id: desc }
      ) {
        id
        event_id
        owner
        price
        amount
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidSubmitted: BidSubmitted[];
  }>(query, { limit });

  return result.TwilightCCADemo_BidSubmitted || [];
}

/**
 * Get latest checkpoint
 */
export async function getLatestCheckpoint(): Promise<CheckpointUpdated | null> {
  const query = `
    query LatestCheckpoint {
      TwilightCCADemo_CheckpointUpdated(
        limit: 1
        order_by: { blockNumber: desc }
      ) {
        id
        blockNumber
        clearingPrice
        cumulativeMps
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_CheckpointUpdated: CheckpointUpdated[];
  }>(query);

  return result.TwilightCCADemo_CheckpointUpdated[0] || null;
}

/**
 * Get all auction steps
 */
export async function getAuctionSteps(): Promise<AuctionStepRecorded[]> {
  const query = `
    query AuctionSteps {
      TwilightCCADemo_AuctionStepRecorded(
        order_by: { startBlock: desc }
      ) {
        id
        startBlock
        endBlock
        mps
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_AuctionStepRecorded: AuctionStepRecorded[];
  }>(query);

  return result.TwilightCCADemo_AuctionStepRecorded || [];
}

/**
 * Check if indexer is available
 */
export async function checkIndexerHealth(): Promise<boolean> {
  try {
    const query = `
      query HealthCheck {
        __schema {
          types {
            name
          }
        }
      }
    `;
    await graphqlQuery(query);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all bid exits that resulted in token allocations (tokensFilled > 0)
 */
export async function getAllTokenAllocations(): Promise<BidExited[]> {
  const query = `
    query AllTokenAllocations {
      TwilightCCADemo_BidExited(
        where: { tokensFilled: { _gt: "0" } }
        order_by: { bidId: desc }
      ) {
        id
        bidId
        owner
        tokensFilled
        currencyRefunded
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidExited: BidExited[];
  }>(query);

  return result.TwilightCCADemo_BidExited || [];
}

/**
 * Get token allocations for a specific user (from exited bids)
 */
export async function getUserTokenAllocations(owner: string): Promise<BidExited[]> {
  const query = `
    query UserTokenAllocations($owner: String!) {
      TwilightCCADemo_BidExited(
        where: { 
          owner: { _eq: $owner }
          tokensFilled: { _gt: "0" }
        }
        order_by: { bidId: desc }
      ) {
        id
        bidId
        owner
        tokensFilled
        currencyRefunded
      }
    }
  `;

  // Try lowercase first
  let result = await graphqlQuery<{
    TwilightCCADemo_BidExited: BidExited[];
  }>(query, { owner: owner.toLowerCase() });

  // If no results and address is checksummed, try original case
  if (result.TwilightCCADemo_BidExited.length === 0 && owner !== owner.toLowerCase()) {
    result = await graphqlQuery<{
      TwilightCCADemo_BidExited: BidExited[];
    }>(query, { owner });
  }

  return result.TwilightCCADemo_BidExited || [];
}

/**
 * Get total tokens allocated across all users (sum of all tokensFilled from BidExited events)
 */
export async function getTotalTokensAllocated(): Promise<bigint> {
  const allocations = await getAllTokenAllocations();
  
  const total = allocations.reduce((sum, exit) => {
    return sum + BigInt(exit.tokensFilled);
  }, 0n);
  
  return total;
}

/**
 * Get count of unique bidders (distinct owners who have submitted bids)
 */
export async function getUniqueBiddersCount(): Promise<number> {
  const query = `
    query UniqueBidders {
      TwilightCCADemo_BidSubmitted {
        owner
      }
    }
  `;

  const result = await graphqlQuery<{
    TwilightCCADemo_BidSubmitted: { owner: string }[];
  }>(query);

  // Count unique owners
  const uniqueOwners = new Set(
    result.TwilightCCADemo_BidSubmitted.map((bid) => bid.owner.toLowerCase())
  );

  return uniqueOwners.size;
}
