import { useState, useEffect } from "react";

export function useTokenPrice(contractAddress?: string) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!contractAddress) return;

    const fetchPrice = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/token-price?contract_address=${contractAddress}`,
        );
        if (!response.ok) throw new Error("Failed to fetch token price");

        const data = await response.json();
        const priceData = data[contractAddress.toLowerCase()]?.usd;
        setPrice(priceData || null);
      } catch (err) {
        console.error("Error fetching token price:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch token price"),
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();

    // Refresh price every minute
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [contractAddress]);

  return { price, loading, error };
}
