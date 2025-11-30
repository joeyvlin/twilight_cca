import { Address } from "viem";

// ============================================
// CONTRACT 1: Auction Contract
// ============================================
export const AUCTION_CONTRACT_ADDRESS = (import.meta.env
  .VITE_AUCTION_CONTRACT_ADDRESS ||
  "0xBDeAD023f07810666014CEd1f8f9F71f80EA0b74") as Address;

export const AUCTION_CONTRACT_ABI = [
  // Events
  {
    type: "event",
    name: "BidSubmitted",
    inputs: [
      { name: "id", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "price", type: "uint256" },
      { name: "amount", type: "uint128" },
    ],
  },
  {
    type: "event",
    name: "CheckpointUpdated",
    inputs: [
      { name: "blockNumber", type: "uint256" },
      { name: "clearingPrice", type: "uint256" },
      { name: "cumulativeMps", type: "uint24" },
    ],
  },
  {
    type: "event",
    name: "ClearingPriceUpdated",
    inputs: [
      { name: "blockNumber", type: "uint256" },
      { name: "clearingPrice", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "BidExited",
    inputs: [
      { name: "bidId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "tokensFilled", type: "uint256" },
      { name: "currencyRefunded", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TokensClaimed",
    inputs: [
      { name: "bidId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "tokensFilled", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "TokensReceived",
    inputs: [{ name: "totalSupply", type: "uint256" }],
  },

  // Main Functions
  {
    type: "function",
    name: "submitBid",
    inputs: [
      { name: "maxPrice", type: "uint256" },
      { name: "amount", type: "uint128" },
      { name: "owner", type: "address" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [{ name: "bidId", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "submitBid",
    inputs: [
      { name: "maxPrice", type: "uint256" },
      { name: "amount", type: "uint128" },
      { name: "owner", type: "address" },
      { name: "prevTickPrice", type: "uint256" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [{ name: "bidId", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "checkpoint",
    inputs: [],
    outputs: [
      {
        name: "_checkpoint",
        type: "tuple",
        components: [
          { name: "clearingPrice", type: "uint256" },
          { name: "currencyRaisedAtClearingPriceQ96_X7", type: "uint256" },
          { name: "cumulativeMpsPerPrice", type: "uint256" },
          { name: "cumulativeMps", type: "uint24" },
          { name: "prev", type: "uint64" },
          { name: "next", type: "uint64" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitBid",
    inputs: [{ name: "bidId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "exitPartiallyFilledBid",
    inputs: [
      { name: "bidId", type: "uint256" },
      { name: "lastFullyFilledCheckpointBlock", type: "uint64" },
      { name: "outbidBlock", type: "uint64" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTokens",
    inputs: [{ name: "bidId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTokensBatch",
    inputs: [
      { name: "owner", type: "address" },
      { name: "bidIds", type: "uint256[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sweepCurrency",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "sweepUnsoldTokens",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "onTokensReceived",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  // View Functions - Checkpoint Storage
  {
    type: "function",
    name: "latestCheckpoint",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "clearingPrice", type: "uint256" },
          { name: "currencyRaisedAtClearingPriceQ96_X7", type: "uint256" },
          { name: "cumulativeMpsPerPrice", type: "uint256" },
          { name: "cumulativeMps", type: "uint24" },
          { name: "prev", type: "uint64" },
          { name: "next", type: "uint64" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "clearingPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "lastCheckpointedBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "checkpoints",
    inputs: [{ name: "blockNumber", type: "uint64" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "clearingPrice", type: "uint256" },
          { name: "currencyRaisedAtClearingPriceQ96_X7", type: "uint256" },
          { name: "cumulativeMpsPerPrice", type: "uint256" },
          { name: "cumulativeMps", type: "uint24" },
          { name: "prev", type: "uint64" },
          { name: "next", type: "uint64" },
        ],
      },
    ],
    stateMutability: "view",
  },

  // View Functions - Bid Storage
  {
    type: "function",
    name: "nextBidId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "bids",
    inputs: [{ name: "bidId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "startBlock", type: "uint64" },
          { name: "startCumulativeMps", type: "uint24" },
          { name: "exitedBlock", type: "uint64" },
          { name: "maxPrice", type: "uint256" },
          { name: "owner", type: "address" },
          { name: "amountQ96", type: "uint256" },
          { name: "tokensFilled", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },

  // View Functions - Tick Storage
  {
    type: "function",
    name: "nextActiveTickPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "floorPrice",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tickSpacing",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ticks",
    inputs: [{ name: "price", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "next", type: "uint256" },
          { name: "currencyDemandQ96", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },

  // View Functions - Step Storage
  {
    type: "function",
    name: "startBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "endBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "step",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "startBlock", type: "uint64" },
          { name: "endBlock", type: "uint64" },
          { name: "mps", type: "uint24" },
        ],
      },
    ],
    stateMutability: "view",
  },

  // View Functions - Token/Currency Storage
  {
    type: "function",
    name: "currency",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "token",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tokensRecipient",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "fundsRecipient",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },

  // View Functions - Auction State
  {
    type: "function",
    name: "isGraduated",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "currencyRaised",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalCleared",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimBlock",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "validationHook",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sumCurrencyDemandAboveClearingQ96",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const auctionContractConfig = {
  address: AUCTION_CONTRACT_ADDRESS,
  abi: AUCTION_CONTRACT_ABI,
} as const;

// ============================================
// CONTRACT 2: STATE LENS CONTRACT
// ============================================
export const STATE_LENS_CONTRACT_ADDRESS = (import.meta.env
  .VITE_STATE_LENS_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

export const STATE_LENS_CONTRACT_ABI = [
  {
    type: "function",
    name: "state",
    inputs: [
      {
        name: "auction",
        type: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          {
            name: "checkpoint",
            type: "tuple",
            components: [
              { name: "clearingPrice", type: "uint256" },
              { name: "currencyRaisedAtClearingPriceQ96_X7", type: "uint256" },
              { name: "cumulativeMpsPerPrice", type: "uint256" },
              { name: "cumulativeMps", type: "uint24" },
              { name: "prev", type: "uint64" },
              { name: "next", type: "uint64" },
            ],
          },
          { name: "currencyRaised", type: "uint256" },
          { name: "totalCleared", type: "uint256" },
          { name: "isGraduated", type: "bool" },
        ],
      },
    ],
    stateMutability: "nonpayable",
  },
] as const;

export const stateLensContractConfig = {
  address: STATE_LENS_CONTRACT_ADDRESS,
  abi: STATE_LENS_CONTRACT_ABI,
} as const;

// ============================================
// Export all contracts for convenience
// ============================================
export const contracts = {
  auction: auctionContractConfig,
  stateLens: stateLensContractConfig,
} as const;
