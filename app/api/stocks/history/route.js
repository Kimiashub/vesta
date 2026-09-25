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
      `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(
        symbol
      )}&interval=1day&outputsize=365&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data.status === "error") {
      return Response.json(
        { error: data.message || "Could not fetch stock history" },
        { status: 400 }
      );
    }

    const history = (data.values || []).map((day) => ({
      date: day.datetime,
      open: Number(day.open),
      high: Number(day.high),
      low: Number(day.low),
      close: Number(day.close),
    }));

    return Response.json(history);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Could not fetch stock history" },
      { status: 500 }
    );
  }
}