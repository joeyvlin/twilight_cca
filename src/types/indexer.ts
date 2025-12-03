// src/types/indexer.ts

export interface BidSubmitted {
  id: string;
  event_id: string;
  owner: string;
  price: string; // BigInt as string
  amount: string; // BigInt as string
}

export interface BidExited {
  id: string;
  bidId: string; // BigInt as string
  owner: string;
  tokensFilled: string; // BigInt as string
  currencyRefunded: string; // BigInt as string
}

export interface ClearingPriceUpdated {
  id: string;
  blockNumber: string; // BigInt as string
  clearingPrice: string; // BigInt as string
}

export interface CheckpointUpdated {
  id: string;
  blockNumber: string; // BigInt as string
  clearingPrice: string; // BigInt as string
  cumulativeMps: string; // BigInt as string
}

export interface AuctionStepRecorded {
  id: string;
  startBlock: string; // BigInt as string
  endBlock: string; // BigInt as string
  mps: string; // BigInt as string
}

export interface NextActiveTickUpdated {
  id: string;
  price: string; // BigInt as string
}

export interface TokensClaimed {
  id: string;
  bidId: string; // BigInt as string
  owner: string;
  tokensFilled: string; // BigInt as string
}

export interface CurrencySwept {
  id: string;
  fundsRecipient: string;
  currencyAmount: string; // BigInt as string
}

export interface TokensReceived {
  id: string;
  totalSupply: string; // BigInt as string
}
