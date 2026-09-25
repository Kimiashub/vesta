"use client";

import { usePortfolioPrices } from "../../hooks/usePortfolioPrices";
import Link from "next/link";
import { usePortfolio } from "../../context/PortfolioContext";
import BottomNav from "../../components/bottomNav";
import PortfolioChart from "../../components/PortfolioChart";
import { useState } from "react";
import { usePortfolioHistory } from "../../hooks/usePortfolioHistory";

export default function DashboardPage() {
  const { portfolio, transactions } = usePortfolio();
  const [period, setPeriod] = useState("1M");

const {
  currentPrices,
  loading: pricesLoading,
  error: pricesError,
} = usePortfolioPrices(portfolio);

const {
  history: chartData,
  loading: historyLoading,
  error: historyError,
} = usePortfolioHistory(
  portfolio,
  period
);


  // Total investment
  const totalInvested = portfolio.reduce(
    (total, investment) => {
      return (
        total +
        investment.price * investment.quantity
      );
    },
    0
  );

  // Portfolio value atm
  const totalValue = portfolio.reduce(
    (total, investment) => {
      const currentPrice =
        currentPrices[investment.symbol] ??
        investment.price;

      return (
        total +
        currentPrice * investment.quantity
      );
    },
    0
  );

  // Total profit/loss
  const totalProfitLoss =
    totalValue - totalInvested;

  // Total profit/loss percent
  const totalProfitLossPercent =
    totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

      function formatTransactionDate(date) {
  const transactionDate = new Date(date);
  const today = new Date();

  const isToday =
    transactionDate.toDateString() ===
    today.toDateString();

  if (isToday) {
    return "Today";
  }

  return transactionDate.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}

  return (
    <main className="app-page">
      {/* Header */}
      <header className="page-header">
        <p className="eyebrow">Overview</p>
        <h1>Dashboard</h1>
      </header>

      {/* Portfolio summary */}
 <section className="portfolio-card">
  <p>Total portfolio</p>

  <h2>
    $
    {totalValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  </h2>

  {pricesLoading && portfolio.length > 0 && (
    <span className="secondary-text">
      Updating market prices...
    </span>
  )}

  {!pricesLoading &&
    !pricesError &&
    portfolio.length > 0 && (
      <span
        className={
          totalProfitLoss >= 0
            ? "positive"
            : "negative"
        }
      >
        {totalProfitLoss >= 0 ? "+" : ""}
        ${totalProfitLoss.toFixed(2)} (
        {totalProfitLoss >= 0 ? "+" : ""}
        {totalProfitLossPercent.toFixed(2)}%)
      </span>
    )}

  {/* Portfolio performance chart */}
  {historyLoading ? (
    <p className="secondary-text">
      Loading portfolio history...
    </p>
  ) : historyError ? (
    <p className="negative">
      {historyError}
    </p>
  ) : (
    <PortfolioChart
      data={chartData}
      period={period}
      setPeriod={setPeriod}
    />
  )}
</section>

      {/* API error */}
      {pricesError && (
        <p className="negative">
          {pricesError}
        </p>
      )}

      {/* Portfolio information */}
      <section className="section">
        <h2>Portfolio summary</h2>

        <div className="settings-list">
          <div>
            <span>Invested</span>

            <strong>
              $
              {totalInvested.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div>
            <span>Market value</span>

            <strong>
              $
              {totalValue.toLocaleString(
                "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </strong>
          </div>

          <div>
            <span>Profit / Loss</span>

            <strong
              className={
                totalProfitLoss >= 0
                  ? "positive"
                  : "negative"
              }
            >
              {totalProfitLoss >= 0 ? "+" : ""}
              ${totalProfitLoss.toFixed(2)}
            </strong>
          </div>
        </div>
      </section>

      {/* Holdings */}
      <section className="section">
        <h2>Your assets</h2>

        {portfolio.length === 0 ? (
          <div>
            <p className="secondary-text">
              You don't own any assets yet.
            </p>

            <Link href="/markets">
              Explore markets
            </Link>
          </div>
        ) : (
          <div className="asset-list">
            {portfolio.map((investment) => {

              const currentPrice =
                currentPrices[investment.symbol] ??
                investment.price;

              const invested =
                investment.price *
                investment.quantity;

              const marketValue =
                currentPrice *
                investment.quantity;

              const profitLoss =
                marketValue - invested;

              const profitLossPercent =
                invested > 0
                  ? (profitLoss / invested) *
                    100
                  : 0;

              return (
                <Link
                  href={`/asset/${investment.symbol}`}
                  className="asset-row"
                  key={investment.symbol}
                >
                  <div className="asset-symbol">
                    {investment.symbol.charAt(
                      0
                    )}
                  </div>

                  <div className="asset-info">
                    <strong>
                      {investment.symbol}
                    </strong>

                    <span>
                      {investment.quantity}{" "}
                      {investment.quantity === 1
                        ? "share"
                        : "shares"}
                    </span>

                    <span>
                      Avg. $
                      {investment.price.toFixed(
                        2
                      )}
                    </span>
                  </div>

                  <div className="asset-price">
                    <strong>
                      $
                      {marketValue.toFixed(2)}
                    </strong>

                    <span
                      className={
                        profitLoss >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {profitLoss >= 0
                        ? "+"
                        : ""}
                      ${profitLoss.toFixed(2)}
                    </span>

                    <span
                      className={
                        profitLoss >= 0
                          ? "positive"
                          : "negative"
                      }
                    >
                      {profitLoss >= 0
                        ? "+"
                        : ""}
                      {profitLossPercent.toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent activity */}
<section className="section">
  <div className="section-header">
    <h2>Recent activity</h2>
  </div>

  {transactions.length === 0 ? (
    <p className="secondary-text">
      Your transactions will appear here.
    </p>
  ) : (
    <div className="transaction-list">
      {transactions
        .slice(0, 5)
        .map((transaction) => {
          const total =
            transaction.price *
            transaction.quantity;

          return (
            <div
              className="transaction-row"
              key={transaction.id}
            >
              <div
                className={`transaction-icon ${transaction.type}`}
              >
                {transaction.type === "buy"
                  ? "↓"
                  : "↑"}
              </div>

              <div className="transaction-info">
                <strong>
                  {transaction.type === "buy"
                    ? "Bought"
                    : "Sold"}{" "}
                  {transaction.symbol}
                </strong>

                <span>
                  {transaction.quantity}{" "}
                  {transaction.quantity === 1
                    ? "share"
                    : "shares"}{" "}
                  · ${transaction.price.toFixed(2)}
                </span>
              </div>

              <div className="transaction-value">
                <strong>
                  {transaction.type === "buy"
                    ? "-"
                    : "+"}
                  $
                  {total.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </strong>

                <span>
                  {formatTransactionDate(
                    transaction.date
                  )}
                </span>
              </div>
            </div>
          );
        })}
    </div>
  )}
</section>

      <BottomNav />
    </main>
  );
}