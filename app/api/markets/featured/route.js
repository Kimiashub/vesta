const MARKET_CATEGORIES = {
  stocks: [
    "AAPL",
    "MSFT",
    "NVDA",
    "AMZN",
    "META",
    "GOOGL",
  ],

  funds: [
    "VFIAX",
    "FXAIX",
    "VTSAX",
    "SWPPX",
  ],

  etfs: [
    "SPY",
    "QQQ",
    "VOO",
    "VTI",
    "IWM",
    "DIA",
  ],
};

// Cache stored on the server
const cache = new Map();

// Keep market data for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;

export async function GET(request) {
  const { searchParams } =
    new URL(request.url);

  const category =
    searchParams.get("category") || "stocks";

  if (!MARKET_CATEGORIES[category]) {
    return Response.json(
      {
        error: "Invalid market category.",
      },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "Twelve Data API key is missing.",
      },
      { status: 500 }
    );
  }

  // CHECK CACHE

  const cachedData =
    cache.get(category);

  if (
    cachedData &&
    Date.now() -
      cachedData.timestamp <
      CACHE_TIME
  ) {
    return Response.json(
      cachedData.data
    );
  }

  try {
    const symbols =
      MARKET_CATEGORIES[category];

    const results = [];

    // FETCH MARKET DATA

    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
            symbol
          )}&apikey=${apiKey}`
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          data.status === "error"
        ) {
          continue;
        }

        results.push({
          symbol: data.symbol,

          name:
            data.name ||
            symbol,

          type:
            data.type || "",

          exchange:
            data.exchange || "",

          currency:
            data.currency || "",

          price:
            Number(data.close),

          change:
            Number(data.change),

          changePercent:
            Number(
              data.percent_change
            ),
        });
      } catch (error) {
        console.error(
          `Could not load ${symbol}:`,
          error
        );
      }
    }

    // SORT BY DAILY PERFORMANCE

    results.sort(
      (a, b) =>
        b.changePercent -
        a.changePercent
    );

    // SAVE TO CACHE

    cache.set(category, {
      data: results,
      timestamp: Date.now(),
    });

    return Response.json(results);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Could not load market suggestions.",
      },
      { status: 500 }
    );
  }
}