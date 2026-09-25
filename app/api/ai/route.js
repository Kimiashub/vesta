import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const { question, portfolio } =
      await request.json();

    if (!question?.trim()) {
      return Response.json(
        { error: "A question is required." },
        { status: 400 }
      );
    }

    const geminiKey =
      process.env.GEMINI_API_KEY;

    const twelveDataKey =
      process.env.TWELVE_DATA_API_KEY;

    const marketauxKey =
      process.env.MARKETAUX_API_KEY;

    if (
      !geminiKey ||
      !twelveDataKey ||
      !marketauxKey
    ) {
      return Response.json(
        {
          error:
            "One or more API keys are missing.",
        },
        { status: 500 }
      );
    }

    // MARKET DATA

    const marketData = [];

    if (portfolio?.length > 0) {
      for (const investment of portfolio) {
        try {
          const response = await fetch(
            `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(
              investment.symbol
            )}&apikey=${twelveDataKey}`
          );

          const data = await response.json();

          if (
            response.ok &&
            data.status !== "error"
          ) {
            marketData.push({
              symbol: investment.symbol,
              name:
                investment.name ||
                data.name,
              quantity:
                investment.quantity,
              averagePurchasePrice:
                investment.price,
              currentPrice:
                Number(data.close),
              change:
                Number(data.change),
              changePercent:
                Number(
                  data.percent_change
                ),
            });
          }
        } catch {
        }
      }
    }

    // NEWS

    let news = [];

    if (portfolio?.length > 0) {
      try {
        const symbols = portfolio
          .map(
            (investment) =>
              investment.symbol
          )
          .join(",");

        const response = await fetch(
          `https://api.marketaux.com/v1/news/all?api_token=${marketauxKey}&symbols=${encodeURIComponent(
            symbols
          )}&filter_entities=true&language=en&limit=5`
        );

        const data = await response.json();

        if (response.ok) {
          news = (data.data || []).map(
            (article) => ({
              title: article.title,
              description:
                article.description ||
                article.snippet ||
                "",
              source: article.source,
              url: article.url,
              publishedAt:
                article.published_at,
            })
          );
        }
      } catch {
      }
    }

    // PROMPT

    const prompt = `
You are Vesta AI, an educational financial
assistant inside a simulated investment app.

USER QUESTION:
${question}

PORTFOLIO AND CURRENT MARKET DATA:
${JSON.stringify(marketData, null, 2)}

RECENT FINANCIAL NEWS:
${JSON.stringify(news, null, 2)}

Important rules:

- Base market-related claims only on the data
  supplied above.
- Never invent prices, performance, news or events.
- If the supplied data is insufficient, say so.
- Use the user's portfolio when relevant.
- Explain information in accessible language.
- Do not guarantee future performance.
- Do not present predictions as facts.
- Do not directly instruct the user to buy or sell.
- Keep the answer useful and reasonably concise.

Return ONLY valid JSON.

Use exactly this structure:

{
  "title": "Short relevant title",
  "summary": "A short overview",
  "observations": [
    "Observation",
    "Observation"
  ],
  "positiveFactors": [
    "Potential positive factor"
  ],
  "riskFactors": [
    "Relevant risk"
  ],
  "marketContext": "Relevant market context",
  "conclusion": "Short takeaway"
}

If a section is not relevant, return an empty
array or empty string instead of inventing
information.
`;

    // GEMINI

    const ai = new GoogleGenAI({
      apiKey: geminiKey,
    });

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

    const cleanedResponse =
      response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    let insight;

    try {
      insight =
        JSON.parse(cleanedResponse);
    } catch {
      return Response.json(
        {
          error:
            "Vesta AI returned an invalid response.",
        },
        { status: 500 }
      );
    }

    return Response.json({
      insight,
      sources: news.map((article) => ({
        title: article.title,
        source: article.source,
        url: article.url,
        publishedAt:
          article.publishedAt,
      })),
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error:
          "Vesta AI could not answer right now.",
      },
      { status: 500 }
    );
  }
}