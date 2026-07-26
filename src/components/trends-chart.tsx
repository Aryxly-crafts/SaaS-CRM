"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { TrendPoint } from "@/lib/dashboard-data";

const SERIES = [
  { key: "revenue", label: "Revenue", color: "#2f7eda" },
  { key: "leadsWon", label: "Leads Won", color: "#9fa0b5" },
] as const;

type SeriesKey = (typeof SERIES)[number]["key"];

const shortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// Trends line chart with toggleable series, always rendering its axes so the
// panel reads as a real chart even before any data exists.
export function TrendsChart({
  data,
  hasData,
}: {
  data: TrendPoint[];
  hasData: boolean;
}) {
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());

  const toggle = (key: SeriesKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {SERIES.map((series) => {
          const off = hidden.has(series.key);
          return (
            <button
              key={series.key}
              type="button"
              onClick={() => toggle(series.key)}
              aria-pressed={!off}
              className={`flex cursor-pointer items-center gap-1.5 text-[12px] transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:outline-none ${
                off ? "opacity-40" : "opacity-100"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: series.color }}
              />
              <span className="text-ink-muted">{series.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={208}>
          <LineChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: -18 }}
          >
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#dfe4ea"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tick={{ fontSize: 11, fill: "#9fa0b5" }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9fa0b5" }}
              axisLine={false}
              tickLine={false}
              width={44}
            />
            {hasData && (
              <Tooltip
                cursor={{ stroke: "#9fa0b5", strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid #dfe4ea",
                  boxShadow: "0 12px 32px -8px rgba(42,43,51,0.18)",
                  fontSize: 12,
                }}
                labelFormatter={(label) => shortDate(String(label))}
              />
            )}
            {SERIES.filter((s) => !hidden.has(s.key)).map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.label}
                stroke={series.color}
                strokeWidth={1.75}
                dot={false}
                activeDot={{ r: 3.5 }}
                isAnimationActive={hasData}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {!hasData && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="bg-surface/85 text-ink-subtle rounded-lg px-3 py-1.5 text-[12px] backdrop-blur-[1px]">
              No trend data yet — fills in as leads convert and payments land
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
