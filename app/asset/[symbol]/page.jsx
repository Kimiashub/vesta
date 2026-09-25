"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePortfolio } from "../../../context/PortfolioContext";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AssetPage() {
  const params = useParams();
  const symbol = params.symbol;

  // Stock data
  const [stock, setStock] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("1M");

  // Buy
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Sell
  const [showSellForm, setShowSellForm] = useState(false);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellSuccess, setSellSuccess] = useState(false);
  const [lastSoldQuantity, setLastSoldQuantity] = useState(0);

  // Portfolio
  const { portfolio, buyStock, sellStock } = usePortfolio();

  // News
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  // AI Insight
const [insight, setInsight] = useState("");
const [insightLoading, setInsightLoading] = useState(false);
const [insightError, setInsightError] = useState("");
const [insightSources, setInsightSources] = useState([]);

  // Find current stock in portfolio
  const ownedStock = portfolio.find(
    (investment) => investment.symbol === symbol
  );

  const ownedQuantity = ownedStock?.quantity || 0;

  // Fetch stock data and price history
  useEffect(() => {
    async function fetchStock() {
      try {
        setLoading(true);
        setError("");

        // Current stock price
        const response = await fetch(
          `/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load stock"
          );
        }

        setStock(data);

        // Historical stock prices
        const historyResponse = await fetch(
          `/api/stocks/history?symbol=${encodeURIComponent(symbol)}`
        );

        const historyData =
          await historyResponse.json();

        if (!historyResponse.ok) {
          throw new Error(
            historyData.error ||
              "Could not load stock history"
          );
        }

        // API returns newest first,
        // so reverse makes oldest appear first in chart
        setHistory(historyData.reverse());
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchStock();
    }
  }, [symbol]);

  // Fetch financial news for current stock
  useEffect(() => {
    async function fetchNews() {
      try {
        setNewsLoading(true);
        setNewsError("");

        const response = await fetch(
          `/api/news?symbol=${encodeURIComponent(symbol)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load news"
          );
        }

        setNews(data);
      } catch (error) {
        setNewsError(error.message);
      } finally {
        setNewsLoading(false);
      }
    }

    if (symbol) {
      fetchNews();
    }
  }, [symbol]);

  async function generateInsight() {
  try {
    setInsightLoading(true);
    setInsightError("");

    const response = await fetch(
      `/api/insights?symbol=${encodeURIComponent(symbol)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Could not generate AI insight"
      );
    }

    setInsight(data.insight);
    setInsightSources(data.sources || []);
  } catch (error) {
    setInsightError(error.message);
  } finally {
    setInsightLoading(false);
  }
}

  // Buy stock
  function handleBuy() {
    buyStock(stock, quantity);

    setPurchaseSuccess(true);
    setSellSuccess(false);
    setShowBuyForm(false);
    setQuantity(1);
  }

  // Sell stock
  function handleSell() {
    if (sellQuantity > ownedQuantity) {
      return;
    }

    setLastSoldQuantity(sellQuantity);

    sellStock(stock, sellQuantity);

    setSellSuccess(true);
    setPurchaseSuccess(false);
    setShowSellForm(false);
    setSellQuantity(1);
  }

  // Number of historical data points
  // shown for each selected period
  const periodDays = {
    "1W": 7,
    "1M": 30,
    "3M": 90,
    "1Y": 365,
  };

  const chartData = history.slice(
    -periodDays[period]
  );

  // Loading stock data
  if (loading) {
    return (
      <main className="app-page">
        <p>Loading stock...</p>
      </main>
    );
  }

  // Stock API error
  if (error) {
    return (
      <main className="app-page">
        <Link
          href="/markets"
          className="back-link"
        >
          ← Markets
        </Link>

        <p className="negative">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="app-page">
      {/* Back button */}
      <Link
        href="/markets"
        className="back-link"
      >
        ← Markets
      </Link>

      {/* Stock header */}
      <section className="asset-detail-header">
        <div className="asset-symbol large">
          {stock.symbol.charAt(0)}
        </div>

        <div>
          <h1>{stock.symbol}</h1>
          <p>Stock</p>
        </div>
      </section>

      {/* Current price */}
      <section className="price-section">
        <h2>
          ${stock.price.toFixed(2)}
        </h2>

        <span
          className={
            stock.change >= 0
              ? "positive"
              : "negative"
          }
        >
          {stock.change >= 0 ? "+" : ""}
          {stock.change.toFixed(2)} (
          {stock.changePercent}%)
        </span>
      </section>

      {/* Chart period buttons */}
      <div className="chart-periods">
        {["1W", "1M", "3M", "1Y"].map(
          (item) => (
            <button
              key={item}
              className={
                period === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setPeriod(item)
              }
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Stock price chart */}
      <div className="stock-chart">
        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <LineChart data={chartData}>
            <XAxis
              dataKey="date"
              tickFormatter={(date) =>
                date.slice(5)
              }
            />

            <YAxis
              domain={["auto", "auto"]}
              width={55}
            />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="close"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Market data */}
      <section className="section">
        <h2>Market data</h2>

        <div className="settings-list">
          <div>
            <span>Open</span>
            <strong>
              ${stock.open.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>High</span>
            <strong>
              ${stock.high.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Low</span>
            <strong>
              ${stock.low.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Previous close</span>
            <strong>
              ${stock.previousClose.toFixed(2)}
            </strong>
          </div>

          <div>
            <span>Volume</span>
            <strong>
              {stock.volume != null
  ? stock.volume.toLocaleString()
  : "N/A"}
            </strong>
          </div>
        </div>
      </section>

      {/* AI Insight */}
<section className="ai-insight-card">
  <div className="ai-insight-header">
    <div>
      <p className="eyebrow">✦ Vesta AI</p>
      <h2>AI Insight</h2>
    </div>

    {!insight && (
      <button
        className="generate-insight-button"
        onClick={generateInsight}
        disabled={insightLoading}
      >
        {insightLoading
          ? "Analyzing..."
          : "Generate insight"}
      </button>
    )}
  </div>

  {!insight && !insightLoading && !insightError && (
    <p className="secondary-text">
      Analyze recent market data and news for{" "}
      {stock.symbol}.
    </p>
  )}

  {insightLoading && (
    <div className="insight-loading">
      <span className="ai-sparkle">✦</span>

      <div>
        <strong>Vesta is analyzing {stock.symbol}</strong>
        <p className="secondary-text">
          Reviewing market data and recent news...
        </p>
      </div>
    </div>
  )}

  {insightError && (
    <div>
      <p className="negative">
        {insightError}
      </p>

      <button
        className="generate-insight-button"
        onClick={generateInsight}
      >
        Try again
      </button>
    </div>
  )}

  {insight && (
  <>
    <div className="ai-insight-content">
      {/* Overall signal */}
      <div className="insight-section">
        <span className="insight-label">
          Overall signal
        </span>

        <span
          className={`insight-signal ${insight.signal?.toLowerCase()}`}
        >
          {insight.signal}
        </span>
      </div>

      {/* Summary */}
      <div className="insight-section">
        <h3>What's happening</h3>
        <p>{insight.summary}</p>
      </div>

      {/* Positive factors */}
      <div className="insight-section">
        <h3>Positive factors</h3>

        <ul>
          {insight.positiveFactors?.map(
            (factor, index) => (
              <li key={index}>
                {factor}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Risks */}
      <div className="insight-section">
        <h3>Risk factors</h3>

        <ul>
          {insight.riskFactors?.map(
            (risk, index) => (
              <li key={index}>
                {risk}
              </li>
            )
          )}
        </ul>
      </div>

      {/* Why it matters */}
      <div className="insight-section">
        <h3>Why it matters</h3>
        <p>{insight.whyItMatters}</p>
      </div>
    </div>

    {insightSources.length > 0 && (
      <div className="insight-sources">
        <span>
          Based on {insightSources.length} recent{" "}
          {insightSources.length === 1
            ? "article"
            : "articles"}
        </span>
      </div>
    )}

    <button
      className="refresh-insight-button"
      onClick={generateInsight}
      disabled={insightLoading}
    >
      {insightLoading
        ? "Analyzing..."
        : "Refresh insight"}
    </button>
  </>
)}
</section>

      {/* Latest financial news */}
      <section className="section">
        <div className="section-header">
          <div>
            <p className="eyebrow">
              Market intelligence
            </p>

            <h2>Latest news</h2>
          </div>
        </div>

        {/* News loading */}
        {newsLoading && (
          <p className="secondary-text">
            Loading latest news...
          </p>
        )}

        {/* News error */}
        {newsError && (
          <p className="negative">
            {newsError}
          </p>
        )}

        {/* No news */}
        {!newsLoading &&
          !newsError &&
          news.length === 0 && (
            <p className="secondary-text">
              No recent news found for{" "}
              {stock.symbol}.
            </p>
          )}

        {/* News articles */}
        {!newsLoading &&
          !newsError &&
          news.length > 0 && (
            <div className="news-list">
              {news.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-card"
                >
                  <div className="news-card-content">
                    <span className="news-source">
                      {article.source}
                    </span>

                    <h3>
                      {article.title}
                    </h3>

                    {article.description && (
                      <p>
                        {article.description}
                      </p>
                    )}

                    <span className="news-date">
                      {new Date(
                        article.publishedAt
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>

                  {article.image && (
                    <img
                      src={article.image}
                      alt=""
                      className="news-image"
                    />
                  )}
                </a>
              ))}
            </div>
          )}
      </section>

      {/* Purchase success */}
      {purchaseSuccess && (
        <p className="purchase-success">
          ✓ {stock.symbol} was added to
          your portfolio.
        </p>
      )}

      {/* Sell success */}
      {sellSuccess && (
        <p className="purchase-success">
          ✓ {lastSoldQuantity}{" "}
          {stock.symbol}{" "}
          {lastSoldQuantity === 1
            ? "share"
            : "shares"}{" "}
          sold successfully.
        </p>
      )}

      {/* Buy form */}
      {showBuyForm && (
        <section className="trade-form">
          <h2>
            Buy {stock.symbol}
          </h2>

          <div className="trade-form-row">
            <span>Current price</span>

            <strong>
              ${stock.price.toFixed(2)}
            </strong>
          </div>

          <div className="quantity-selector">
            <button
              type="button"
              onClick={() =>
                setQuantity((current) =>
                  Math.max(
                    1,
                    current - 1
                  )
                )
              }
            >
              −
            </button>

            <strong>
              {quantity}
            </strong>

            <button
              type="button"
              onClick={() =>
                setQuantity(
                  (current) =>
                    current + 1
                )
              }
            >
              +
            </button>
          </div>

          <div className="trade-form-row">
            <span>
              Estimated total
            </span>

            <strong>
              $
              {(
                stock.price * quantity
              ).toFixed(2)}
            </strong>
          </div>

          <button
            className="confirm-buy-button"
            onClick={handleBuy}
          >
            Confirm purchase
          </button>

          <button
            className="cancel-trade-button"
            onClick={() => {
              setShowBuyForm(false);
              setQuantity(1);
            }}
          >
            Cancel
          </button>
        </section>
      )}

      {/* Sell form */}
      {showSellForm && (
        <section className="trade-form">
          <h2>
            Sell {stock.symbol}
          </h2>

          <div className="trade-form-row">
            <span>You own</span>

            <strong>
              {ownedQuantity}{" "}
              {ownedQuantity === 1
                ? "share"
                : "shares"}
            </strong>
          </div>

          <div className="trade-form-row">
            <span>Current price</span>

            <strong>
              ${stock.price.toFixed(2)}
            </strong>
          </div>

          <div className="quantity-selector">
            <button
              type="button"
              onClick={() =>
                setSellQuantity(
                  (current) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
            >
              −
            </button>

            <strong>
              {sellQuantity}
            </strong>

            <button
              type="button"
              onClick={() =>
                setSellQuantity(
                  (current) =>
                    Math.min(
                      ownedQuantity,
                      current + 1
                    )
                )
              }
            >
              +
            </button>
          </div>

          <div className="trade-form-row">
            <span>
              Estimated value
            </span>

            <strong>
              $
              {(
                stock.price *
                sellQuantity
              ).toFixed(2)}
            </strong>
          </div>

          <button
            className="confirm-buy-button"
            onClick={handleSell}
          >
            Confirm sale
          </button>

          <button
            className="cancel-trade-button"
            onClick={() => {
              setShowSellForm(false);
              setSellQuantity(1);
            }}
          >
            Cancel
          </button>
        </section>
      )}

      {/* Buy and Sell buttons */}
      <div className="trade-buttons">
        <button
          className="buy-button"
          onClick={() => {
            setShowBuyForm(true);
            setShowSellForm(false);
            setPurchaseSuccess(false);
            setSellSuccess(false);
          }}
        >
          Buy
        </button>

        <button
          className="sell-button"
          disabled={
            ownedQuantity === 0
          }
          onClick={() => {
            setShowSellForm(true);
            setShowBuyForm(false);
            setPurchaseSuccess(false);
            setSellSuccess(false);
            setSellQuantity(1);
          }}
        >
          Sell
        </button>
      </div>
    </main>
  );
}