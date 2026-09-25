export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return Response.json(
      { error: "Stock symbol is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;

    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
        symbol
      )}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "error") {
      return Response.json(
        { error: data.message || "Could not fetch stock" },
        { status: 400 }
      );
    }

    const stock = {
      symbol: data.symbol,
      name: data.name,
      currency: data.currency,

      price: Number(data.close),
      open: Number(data.open),
      high: Number(data.high),
      low: Number(data.low),

      volume: Number(data.volume),
      previousClose: Number(data.previous_close),

      change: Number(data.change),
      changePercent: data.percent_change,
    };

    return Response.json(stock);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Could not fetch stock data" },
      { status: 500 }
    );
  }
}