"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "../../components/bottomNav";

export default function MarketsPage() {
  const [search, setSearch] = useState("");

  // Full search results
  const [assets, setAssets] = useState([]);

  // Suggestions shown while typing
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // AUTOCOMPLETE

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);

        const response = await fetch(
          `/api/stocks/search?query=${encodeURIComponent(
            search
          )}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not search stocks"
          );
        }

        // Only show 6 suggestions in dropdown
        setSuggestions(data.slice(0, 6));
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // FULL SEARCH

  async function searchStocks(event) {
    event.preventDefault();

    if (!search.trim()) {
      setError("Enter a company or stock symbol.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      // Close autocomplete dropdown
      setSuggestions([]);

      const response = await fetch(
        `/api/stocks/search?query=${encodeURIComponent(
          search
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong"
        );
      }

      // Save ALL returned search results
      setAssets(data);
    } catch (error) {
      setError(error.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-page">
      <header className="page-header">
        <p className="eyebrow">Discover</p>
        <h1>Markets</h1>
      </header>

      {/* Search */}
      <form
        className="market-search"
        onSubmit={searchStocks}
      >
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search Apple, NVIDIA, Microsoft..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);

              // Hide old full results when starting
              // a completely new search
              setHasSearched(false);
            }}
          />

          <button
            className="search-button"
            type="submit"
          >
            Search
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {search.trim() &&
          !hasSearched && (
            <div className="search-results">
              {suggestionsLoading && (
                <p className="search-message">
                  Searching...
                </p>
              )}

              {!suggestionsLoading &&
                suggestions.length === 0 && (
                  <p className="search-message">
                    No suggestions found.
                  </p>
                )}

              {!suggestionsLoading &&
                suggestions.map((asset) => (
                  <Link
                    href={`/asset/${asset.symbol}`}
                    key={`${asset.symbol}-${asset.exchange}`}
                    className="search-result"
                  >
                    <div className="search-result-symbol">
                      {asset.symbol}
                    </div>

                    <div className="search-result-info">
                      <strong>
                        {asset.name}
                      </strong>

                      <span>
                        {asset.exchange} ·{" "}
                        {asset.type}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          )}
      </form>

      {/* Categories */}
      <div className="market-tabs">
        <button className="selected">
          Stocks
        </button>

        <button>
          Funds
        </button>

        <button>
          ETFs
        </button>
      </div>

      {/* Full search results */}
      <section className="section">
        <h2>
          {hasSearched
            ? "Search results"
            : "Assets"}
        </h2>

        {loading && (
          <p className="secondary-text">
            Loading market data...
          </p>
        )}

        {error && (
          <p className="negative">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          hasSearched &&
          assets.length === 0 && (
            <p className="secondary-text">
              No assets found for "{search}".
            </p>
          )}

        {!loading &&
          !error &&
          !hasSearched && (
            <p className="secondary-text">
              Search for a company or stock symbol
              to discover assets.
            </p>
          )}

        {!loading &&
          !error &&
          hasSearched &&
          assets.length > 0 && (
            <div className="asset-list">
              {assets.map((asset) => (
                <Link
                  href={`/asset/${asset.symbol}`}
                  className="asset-row"
                  key={`${asset.symbol}-${asset.exchange}`}
                >
                  <div className="asset-symbol">
                    {asset.symbol.charAt(0)}
                  </div>

                  <div className="asset-info">
                    <strong>
                      {asset.name}
                    </strong>

                    <span>
                      {asset.symbol} ·{" "}
                      {asset.type}
                    </span>
                  </div>

                  <div className="asset-price">
                    <strong>
                      {asset.exchange}
                    </strong>

                    <span>
                      {asset.currency}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </section>

      <BottomNav />
    </main>
  );
}