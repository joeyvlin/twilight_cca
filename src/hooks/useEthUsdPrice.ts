import { useEffect, useState } from "react";

export function useEthUsdPrice(refreshMs = 60_000) {
  const [ethUsd, setEthUsd] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        if (!active) return;
        const price = data?.ethereum?.usd;
        if (typeof price === "number") {
          setEthUsd(price);
        }
      } catch (err) {
        console.error("Failed to fetch ETH price", err);
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
