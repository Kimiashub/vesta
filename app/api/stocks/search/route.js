export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return Response.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    const response = await fetch(
      `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(
        query
      )}&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error("Failed to search stocks");
    }

    const data = await response.json();

    if (data.status === "error") {
      return Response.json(
        { error: data.message || "Could not search stocks" },
        { status: 400 }
      );
    }

    const stocks = (data.data || []).map((stock) => ({
      symbol: stock.symbol,
      name: stock.instrument_name,
      type: stock.instrument_type,
      exchange: stock.exchange,
      country: stock.country,
      currency: stock.currency,
    }));

    return Response.json(stocks);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Could not search market data" },
      { status: 500 }
    );
  }
}