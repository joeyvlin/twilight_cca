import { Address, isAddress } from "viem";

/**
 * Validates a contract address and returns it as an Address type
 * @param address - The address string to validate
 * @param name - Name of the contract for error messages
 * @returns Validated Address or null if invalid
 */
export function validateContractAddress(
  address: string | undefined,
  name: string
): Address | null {
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    if (process.env.NODE_ENV === "development") {
      console.warn(`⚠️ ${name} contract address not configured`);
    }
    return null;
  }

  if (!isAddress(address)) {
    console.error(`❌ Invalid ${name} contract address: ${address}`);
    return null;
  }

  return address as Address;
}

/**
 * Checks if all required contract addresses are configured
 */
export function validateContractConfig(
  auctionAddress: Address,
  stateLensAddress: Address
): boolean {
  const isAuctionValid =
    auctionAddress !== "0x0000000000000000000000000000000000000000";
  const isStateLensValid =
    stateLensAddress !== "0x0000000000000000000000000000000000000000";

  if (!isAuctionValid) {
    console.error(
      "❌ Auction contract address not set. Set VITE_AUCTION_CONTRACT_ADDRESS"
    );
  }

  if (!isStateLensValid) {
    console.warn(
      "⚠️ State Lens contract address not set. Set VITE_STATE_LENS_CONTRACT_ADDRESS (optional)"
    );
  }

  return isAuctionValid; // State lens is optional
}
