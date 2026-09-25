"use client";

import { useEffect, useState } from "react";

export function usePortfolioPrices(portfolio) {
  const [currentPrices, setCurrentPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrices() {
      if (portfolio.length === 0) {
        setCurrentPrices({});
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const prices = {};

        for (const investment of portfolio) {
          const response = await fetch(
            `/api/stocks/quote?symbol=${encodeURIComponent(
              investment.symbol
            )}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                `Could not load ${investment.symbol}`
            );
          }

          prices[investment.symbol] = data.price;
        }

        setCurrentPrices(prices);
      } catch (error) {
        setError(
          error.message ||
            "Could not update market prices."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [portfolio]);

  return {
    currentPrices,
    loading,
    error,
  };
}