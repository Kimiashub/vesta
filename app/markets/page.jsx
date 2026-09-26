"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "../../components/bottomNav";


export default function MarketsPage() {
  const [search, setSearch] = useState("");

  const [assets, setAssets] = useState([]);

  const [suggestions, setSuggestions] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    suggestionsLoading,
    setSuggestionsLoading,
  ] = useState(false);

  const [error, setError] = useState("");

  const [hasSearched, setHasSearched] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("stocks");

  const [
    featuredAssets,
    setFeaturedAssets,
  ] = useState([]);

  const [
    featuredLoading,
    setFeaturedLoading,
  ] = useState(true);

  const [
    featuredError,
    setFeaturedError,
  ] = useState("");

  // LOAD FEATURED ASSETS

 useEffect(() => {
   async function loadFeaturedAssets() {
    try {
      setFeaturedLoading(true);
      setFeaturedError("");

      const response = await fetch(
        `/api/markets/featured?category=${selectedCategory}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not load market suggestions."
        );
      }

      setFeaturedAssets(data);
    } catch (error) {
      setFeaturedError(
        error.message ||
          "Could not load market suggestions."
      );

      setFeaturedAssets([]);
    } finally {
      setFeaturedLoading(false);
    }
  }

  loadFeaturedAssets();
}, [selectedCategory]);

  // AUTOCOMPLETE

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(
      async () => {
        try {
          setSuggestionsLoading(true);

          const response = await fetch(
            `/api/stocks/search?query=${encodeURIComponent(
              search
            )}`
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.error ||
                "Could not search stocks"
            );
          }

          setSuggestions(
            data.slice(0, 6)
          );
        } catch (error) {
          console.error(error);

          setSuggestions([]);
        } finally {
          setSuggestionsLoading(
            false
          );
        }
      },
      400
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // FULL SEARCH

  async function searchStocks(event) {
    event.preventDefault();

    if (!search.trim()) {
      setError(
        "Enter a company or stock symbol."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      setHasSearched(true);

      setSuggestions([]);

      const response = await fetch(
        `/api/stocks/search?query=${encodeURIComponent(
          search
        )}`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Something went wrong"
        );
      }

      setAssets(data);
    } catch (error) {
      setError(error.message);

      setAssets([]);
    } finally {
      setLoading(false);
    }
  }

  // CHANGE CATEGORY

  function changeCategory(category) {
    setSelectedCategory(category);

    setHasSearched(false);
    setAssets([]);
    setError("");
    setSearch("");
    setSuggestions([]);
  }

  // CATEGORY TITLE

  function getCategoryTitle() {
    if (selectedCategory === "stocks") {
      return "Trending stocks";
    }

    if (selectedCategory === "funds") {
      return "Popular funds";
    }

    return "Popular ETFs";
  }

  return (
    <main className="app-page">
      <header className="page-header">
        <p className="eyebrow">
          Discover
        </p>

        <h1>Markets</h1>
      </header>

      {/* SEARCH */}

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
              setSearch(
                event.target.value
              );

              setHasSearched(false);
              setError("");
            }}
          />

          <button
            className="search-icon-button"
            type="submit"
            aria-label="Search"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* AUTOCOMPLETE */}

        {search.trim() &&
          !hasSearched && (
            <div className="search-results">
              {suggestionsLoading && (
                <p className="search-message">
                  Searching...
                </p>
              )}

              {!suggestionsLoading &&
                suggestions.length ===
                  0 && (
                  <p className="search-message">
                    No suggestions found.
                  </p>
                )}

              {!suggestionsLoading &&
                suggestions.map(
                  (asset) => (
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
                  )
                )}
            </div>
          )}
      </form>

      {/* CATEGORIES */}

      <div className="market-tabs">
        <button
          className={
            selectedCategory ===
            "stocks"
              ? "selected"
              : ""
          }
          onClick={() =>
            changeCategory("stocks")
          }
        >
          Stocks
        </button>

        <button
          className={
            selectedCategory ===
            "funds"
              ? "selected"
              : ""
          }
          onClick={() =>
            changeCategory("funds")
          }
        >
          Funds
        </button>

        <button
          className={
            selectedCategory === "etfs"
              ? "selected"
              : ""
          }
          onClick={() =>
            changeCategory("etfs")
          }
        >
          ETFs
        </button>
      </div>

      {/* MARKET CONTENT */}

      <section className="section">
        <div className="section-header">
          <div>
            <h2>
              {hasSearched
                ? "Search results"
                : getCategoryTitle()}
            </h2>

            {!hasSearched &&
              selectedCategory ===
                "stocks" && (
                <p className="secondary-text">
                  Sorted by today's
                  performance
                </p>
              )}
          </div>
        </div>

        {/* FULL SEARCH LOADING */}

        {hasSearched && loading && (
          <p className="secondary-text">
            Loading market data...
          </p>
        )}

        {/* SEARCH ERROR */}

        {error && (
          <p className="negative">
            {error}
          </p>
        )}

        {/* NO SEARCH RESULTS */}

        {!loading &&
          !error &&
          hasSearched &&
          assets.length === 0 && (
            <p className="secondary-text">
              No assets found for "
              {search}".
            </p>
          )}

        {/* SEARCH RESULTS */}

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
                    {asset.symbol.charAt(
                      0
                    )}
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

        {/* FEATURED LOADING */}

        {!hasSearched &&
          featuredLoading && (
            <p className="secondary-text">
              Loading market
              suggestions...
            </p>
          )}

        {/* FEATURED ERROR */}

        {!hasSearched &&
          featuredError && (
            <p className="negative">
              {featuredError}
            </p>
          )}

        {/* FEATURED ASSETS */}

        {!hasSearched &&
          !featuredLoading &&
          !featuredError &&
          featuredAssets.length >
            0 && (
            <div className="asset-list">
              {featuredAssets.map(
                (asset) => {
                  const change =
                    Number(
                      asset.changePercent
                    ) || 0;

                  const price =
                    Number(asset.price);

                  return (
                    <Link
                      href={`/asset/${asset.symbol}`}
                      className="asset-row"
                      key={asset.symbol}
                    >
                      <div className="asset-symbol">
                        {asset.symbol.charAt(
                          0
                        )}
                      </div>

                      <div className="asset-info">
                        <strong>
                          {asset.name ||
                            asset.symbol}
                        </strong>

                        <span>
                          {asset.symbol}
                        </span>
                      </div>

                      <div className="asset-price">
                        <strong>
                          {Number.isFinite(
                            price
                          )
                            ? `$${price.toFixed(
                                2
                              )}`
                            : "N/A"}
                        </strong>

                        <span
                          className={
                            change >= 0
                              ? "positive"
                              : "negative"
                          }
                        >
                          {change >= 0
                            ? "+"
                            : ""}
                          {change.toFixed(
                            2
                          )}
                          %
                        </span>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          )}

        {/* NO FEATURED ASSETS */}

        {!hasSearched &&
          !featuredLoading &&
          !featuredError &&
          featuredAssets.length ===
            0 && (
            <p className="secondary-text">
              No market suggestions
              available right now.
            </p>
          )}
      </section>

      <BottomNav />
    </main>
  );
}