import { useEffect, useState } from "react";

export function useEthUsdPrice(refreshMs = 300_000) { // 5 minutes to reduce API calls
  const [ethUsd, setEthUsd] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPrice = async () => {
      try {
        // Use Binance API (supports CORS, no API key needed)
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT"
        );
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        if (!active) return;
        const price = parseFloat(data?.price);
        if (typeof price === "number" && !isNaN(price) && price > 0) {
          setEthUsd(price);
        }
      } catch (err) {
        console.error("Failed to fetch ETH price from Binance", err);
        // Keep last known value on error - don't clear it
      }
    };

    fetchPrice();
    const id = setInterval(fetchPrice, refreshMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [refreshMs]);

  return ethUsd;
}
