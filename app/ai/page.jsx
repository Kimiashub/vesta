"use client";

import { useState } from "react";
import BottomNav from "../../components/bottomNav";

export default function AIPage() {
  const [question, setQuestion] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    console.log(question);
    setQuestion("");
  }

  return (
    <main className="app-page ai-page">
      <header className="page-header">
        <p className="eyebrow">✦ AI Assistant</p>
        <h1>Vesta AI</h1>

        <p className="secondary-text">
          Ask about markets, trends and your portfolio.
        </p>
      </header>

      <section className="ai-welcome-card">
        <span className="ai-large-icon">✦</span>

        <h2>How can I help?</h2>

        <p>
          Get insights based on market data and your
          simulated portfolio.
        </p>
      </section>

      <div className="suggestion-grid">
        <button>What's trending today?</button>
        <button>Analyse my portfolio</button>
        <button>Which assets have high momentum?</button>
      </div>

      <form className="ai-input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask Vesta AI..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />

        <button type="submit">↑</button>
      </form>

      <BottomNav />
    </main>
  );
}