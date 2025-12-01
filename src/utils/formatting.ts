import { formatEther, formatUnits, parseEther, parseUnits } from "viem";

/**
 * Format bigint value to readable number string
 */
export function formatBigInt(
  value: bigint | undefined,
  decimals: number = 18,
  precision: number = 4
): string {
  if (!value) return "0";
  return parseFloat(formatUnits(value, decimals)).toFixed(precision);
}

/**
 * Format price (Q96 format) to readable price
 * Q96 means value is multiplied by 2^96
 */
export function formatPrice(value: bigint | undefined): string {
  if (!value) return "0";
  const divisor = 2n ** 96n;
  const price = Number(value) / Number(divisor);
  return price.toFixed(4);
}

/**
 * Convert blocks to approximate time
 */
export function blocksToTime(
  blocks: bigint | undefined,
  blockTimeSeconds: number = 12
): string {
  if (!blocks) return "0s";
  const seconds = Number(blocks) * blockTimeSeconds;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

/**
 * Format address to short form (0x1234...5678)
 */
export function formatAddress(
  address: string | undefined,
  length: number = 4
): string {
  if (!address) return "";
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Format currency amount (ETH or token)
 */
export function formatCurrency(
  value: bigint | undefined,
  symbol: string = "ETH"
): string {
  if (!value) return `0 ${symbol}`;
  const formatted = formatEther(value);
  return `${parseFloat(formatted).toFixed(4)} ${symbol}`;
}

/**
 * Format clearing price (Q96 format) to ETH per token
 */
export function formatClearingPrice(value: bigint | undefined): string {
  if (!value || value === 0n) return "0";
  const divisor = 2n ** 96n;
  const price = Number(value) / Number(divisor);
  
  // Format with appropriate precision based on magnitude
  if (price >= 1) {
    return price.toFixed(4);
  } else if (price >= 0.01) {
    return price.toFixed(6);
  } else if (price >= 0.0001) {
    return price.toFixed(8);
  } else {
    return price.toExponential(4);
  }
}
