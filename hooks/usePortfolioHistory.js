"use client";

import { useEffect, useState } from "react";

export function usePortfolioHistory(
  portfolio,
  period
) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPortfolioHistory() {
      if (portfolio.length === 0) {
        setHistory([]);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const allHistory = [];

        for (const investment of portfolio) {
          const response = await fetch(
            `/api/stocks/history?symbol=${encodeURIComponent(
              investment.symbol
            )}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                `Could not load history for ${investment.symbol}`
            );
          }

          allHistory.push({
            symbol: investment.symbol,
            quantity: investment.quantity,
            history: data,
          });
        }

        const portfolioHistory =
          combinePortfolioHistory(
            allHistory,
            period
          );

        setHistory(portfolioHistory);
      } catch (error) {
        setError(
          error.message ||
            "Could not load portfolio history."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolioHistory();
  }, [portfolio, period]);

  return {
    history,
    loading,
    error,
  };
}

function combinePortfolioHistory(
  investments,
  period
) {
  if (investments.length === 0) {
    return [];
  }

  const days = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  const numberOfDays = days[period] || 30;

  const valuesByDate = {};

  investments.forEach((investment) => {
    investment.history.forEach((day) => {
      if (!valuesByDate[day.date]) {
        valuesByDate[day.date] = 0;
      }

      valuesByDate[day.date] +=
        day.close * investment.quantity;
    });
  });

  return Object.entries(valuesByDate)
    .map(([date, value]) => ({
      date,
      value,
    }))
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    )
    .slice(-numberOfDays);
}