"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export default function PortfolioChart({
  data,
  period,
  setPeriod,
}) {
  const periods = ["1W", "1M", "3M", "1Y"];

  if (data.length === 0) {
    return (
      <div className="portfolio-chart-empty">
        <p className="secondary-text">
          Buy an asset to start tracking your
          portfolio performance.
        </p>
      </div>
    );
  }

  return (
    <div className="portfolio-chart">
      <div className="chart-periods">
        {periods.map((item) => (
          <button
            key={item}
            onClick={() => setPeriod(item)}
            className={
              period === item ? "active" : ""
            }
          >
            {item}
          </button>
        ))}
      </div>

      <div className="chart-container">
        <ResponsiveContainer
          width="100%"
          height={220}
        >
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              hide
            />

            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString(
                  "en-US",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}`,
                "Portfolio",
              ]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}