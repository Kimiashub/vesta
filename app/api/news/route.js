export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  try {
    const apiKey = process.env.MARKETAUX_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Marketaux API key is missing" },
        { status: 500 }
      );
    }

    let url =
      "https://api.marketaux.com/v1/news/all" +
      `?api_token=${apiKey}` +
      "&language=en" +
      "&limit=5";

    if (symbol) {
      url +=
        `&symbols=${encodeURIComponent(symbol)}` +
        "&filter_entities=true";
    }

    const response = await fetch(url);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "Could not fetch news"
      );
    }

    const articles = (data.data || []).map((article) => ({
      id: article.uuid,
      title: article.title,
      description: article.description,
      snippet: article.snippet,
      url: article.url,
      image: article.image_url,
      source: article.source,
      publishedAt: article.published_at,

      entities: (article.entities || []).map((entity) => ({
        symbol: entity.symbol,
        name: entity.name,
        type: entity.type,
        sentimentScore: entity.sentiment_score,
      })),
    }));

    return Response.json(articles);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Could not load financial news" },
      { status: 500 }
    );
  }
}