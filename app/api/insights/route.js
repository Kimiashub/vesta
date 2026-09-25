import { GoogleGenAI } from "@google/genai";

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
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is missing" },
        { status: 500 }
      );
    }

    const baseUrl = new URL(request.url).origin;

/* GET CURRENT STOCK DATA */

    const stockResponse = await fetch(
      `${baseUrl}/api/stocks/quote?symbol=${encodeURIComponent(
        symbol
      )}`
    );

    const stock = await stockResponse.json();

    if (!stockResponse.ok) {
      throw new Error(
        stock.error || "Could not load stock data"
      );
    }

    
   /* GET RECENT FINANCIAL NEWS */

    const newsResponse = await fetch(
      `${baseUrl}/api/news?symbol=${encodeURIComponent(
        symbol
      )}`
    );

    const news = await newsResponse.json();

    if (!newsResponse.ok) {
      throw new Error(
        news.error || "Could not load news"
      );
    }

    // Only send the 5 latest articles to Gemini
    const relevantNews = news.slice(0, 5);

    // PREPARE NEWS FOR GEMINI

    const newsText = relevantNews
      .map(
        (article, index) => `
Article ${index + 1}

Title: ${article.title}

Description: ${
          article.description || "No description"
        }

Source: ${article.source}

Published: ${article.publishedAt}
`
      )
      .join("\n");


    // CREATE AI PROMPT

    const prompt = `
You are Vesta, an AI market analysis assistant.

Analyze the following stock using ONLY the market data
and news provided below.

STOCK DATA

Symbol: ${stock.symbol}
Company: ${stock.name}
Current price: ${stock.price}
Daily change: ${stock.change}
Daily change percent: ${stock.changePercent}%
Previous close: ${stock.previousClose}

RECENT NEWS

${newsText}

Return ONLY valid JSON.

Do not include markdown.
Do not include a code block.
Do not include text before or after the JSON.

Use exactly this structure:

{
  "signal": "Positive",
  "summary": "Short explanation of what is currently happening.",
  "positiveFactors": [
    "First positive factor",
    "Second positive factor"
  ],
  "riskFactors": [
    "First risk factor",
    "Second risk factor"
  ],
  "whyItMatters": "Short explanation of why this could matter for the stock."
}

The signal must be one of:
"Positive", "Negative", "Mixed", or "Neutral".

Important rules:

- Only use the information provided above.
- Do not invent facts.
- Do not recommend buying or selling.
- Do not guarantee future price movements.
- Clearly communicate uncertainty.
- Keep the analysis concise.
`;

    // CREATE GEMINI CLIENT

    const ai = new GoogleGenAI({
      apiKey,
    });

    // ASK GEMINI FOR THE ANALYSIS

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    // CLEAN GEMINI RESPONSE

    const cleanedResponse = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // CONVERT TEXT INTO JAVASCRIPT OBJECT

    let insight;

    try {
      insight = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(
        "Could not parse Gemini response:",
        cleanedResponse
      );

      return Response.json(
        {
          error:
            "Vesta AI returned an invalid response. Please try again.",
        },
        { status: 500 }
      );
    }

    // RETURN RESULT TO FRONTEND

    return Response.json({
      symbol: stock.symbol,

      insight,

      sources: relevantNews.map((article) => ({
        title: article.title,
        source: article.source,
        url: article.url,
        publishedAt: article.publishedAt,
      })),
    });
  } catch (error) {
    console.error("Insight error:", error);

    const message = error?.message || "";

    if (
      message.includes("503") ||
      message.includes("UNAVAILABLE") ||
      message.includes("high demand")
    ) {
      return Response.json(
        {
          error:
            "Vesta AI is temporarily busy. Please try again in a moment.",
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        error:
          error?.message ||
          "Could not generate AI insight",
      },
      { status: 500 }
    );
  }
}