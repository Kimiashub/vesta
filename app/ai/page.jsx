"use client";

import { useState } from "react";
import BottomNav from "../../components/bottomNav";
import { usePortfolio } from "../../context/PortfolioContext";

export default function AIPage() {
  const { portfolio } = usePortfolio();

  const [question, setQuestion] =
    useState("");

  const [insight, setInsight] =
    useState(null);

  const [sources, setSources] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function askAI(questionToAsk) {
    if (!questionToAsk.trim()) {
      setError(
        "Please enter a question."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setInsight(null);
      setSources([]);

      const response = await fetch(
        "/api/ai",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            question: questionToAsk,
            portfolio,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not get an AI response."
        );
      }

      setInsight(data.insight);
      setSources(data.sources || []);
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const currentQuestion =
      question.trim();

    if (!currentQuestion) {
      setError(
        "Please enter a question."
      );
      return;
    }

    setQuestion("");

    await askAI(currentQuestion);
  }

  function handleSuggestion(suggestion) {
    setQuestion("");
    askAI(suggestion);
  }

  return (
    <main className="app-page ai-page">
      <header className="page-header">
        <p className="eyebrow">
          ✦ AI Assistant
        </p>

        <h1>Vesta AI</h1>

        <p className="secondary-text">
          Ask about markets, trends and
          your portfolio.
        </p>
      </header>

      <section className="ai-welcome-card">
        <span className="ai-large-icon">
          ✦
        </span>

        <h2>How can I help?</h2>

        <p>
          Get insights based on current
          market data, financial news and
          your simulated portfolio.
        </p>
      </section>

      <div className="suggestion-grid">
        <button
          onClick={() =>
            handleSuggestion(
              "What are the biggest risks in my portfolio?"
            )
          }
          disabled={loading}
        >
          What are my biggest risks?
        </button>

        <button
          onClick={() =>
            handleSuggestion(
              "Analyse my portfolio."
            )
          }
          disabled={loading}
        >
          Analyse my portfolio
        </button>

        <button
          onClick={() =>
            handleSuggestion(
              "What recent news could affect my portfolio?"
            )
          }
          disabled={loading}
        >
          Recent portfolio news
        </button>
      </div>

      {loading && (
        <section className="ai-response-card">
          <p className="secondary-text">
            ✦ Analysing your portfolio
            and market data...
          </p>
        </section>
      )}

      {error && (
        <section className="ai-response-card">
          <p className="negative">
            {error}
          </p>
        </section>
      )}

      {insight && !loading && (
        <section className="ai-response-card">
          <div className="ai-response-header">
            <span>✦</span>

            <div>
              <p className="eyebrow">
                Vesta AI
              </p>

              <h2>{insight.title}</h2>
            </div>
          </div>

          {insight.summary && (
            <p className="ai-summary">
              {insight.summary}
            </p>
          )}

          {insight.observations?.length >
            0 && (
            <div className="ai-insight-section">
              <h3>Key observations</h3>

              <ul>
                {insight.observations.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {insight.positiveFactors?.length >
            0 && (
            <div className="ai-insight-section">
              <h3>
                ↗ Potential positive factors
              </h3>

              <ul>
                {insight.positiveFactors.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {insight.riskFactors?.length >
            0 && (
            <div className="ai-insight-section">
              <h3>⚠ Risk factors</h3>

              <ul>
                {insight.riskFactors.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {insight.marketContext && (
            <div className="ai-insight-section">
              <h3>Market context</h3>

              <p>
                {insight.marketContext}
              </p>
            </div>
          )}

          {insight.conclusion && (
            <div className="ai-conclusion">
              <span>✦</span>

              <div>
                <strong>
                  Vesta takeaway
                </strong>

                <p>
                  {insight.conclusion}
                </p>
              </div>
            </div>
          )}

          {sources.length > 0 && (
            <div className="ai-sources">
              <h3>Sources</h3>

              {sources.map(
                (source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>
                      {source.source ||
                        "Financial news"}
                    </span>

                    <p>
                      {source.title}
                    </p>
                  </a>
                )
              )}
            </div>
          )}
        </section>
      )}

      <form
        className="ai-input-container"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Ask Vesta AI..."
          value={question}
          onChange={(event) =>
            setQuestion(
              event.target.value
            )
          }
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
        >
          ↑
        </button>
      </form>

      <BottomNav />
    </main>
  );
}