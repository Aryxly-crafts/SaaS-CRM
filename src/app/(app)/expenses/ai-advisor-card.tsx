"use client";

import { useTransition } from "react";
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Zap } from "lucide-react";
import type { AIInsightRecord, AIInsightItem } from "@/lib/records";
import { refreshAIInsights } from "./ai-actions";

interface AIAdvisorCardProps {
  insightRecord: AIInsightRecord;
  isTeam: boolean;
}

// Maps insight severity to visual styles and icons.
function getSeverityBadge(severity: AIInsightItem["severity"]) {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-danger-soft text-danger border-danger/20",
        icon: ShieldAlert,
        label: "Critical Action",
      };
    case "warning":
      return {
        bg: "bg-warning-soft text-warning border-warning/20",
        icon: AlertTriangle,
        label: "Margin Alert",
      };
    case "optimization":
      return {
        bg: "bg-info-soft text-info border-info/20",
        icon: Zap,
        label: "Optimization",
      };
    case "positive":
    default:
      return {
        bg: "bg-positive-soft text-positive border-positive/20",
        icon: CheckCircle2,
        label: "Healthy",
      };
  }
}

// AI Financial Advisor card that displays actionable deal, cost, and savings advice.
export function AIAdvisorCard({ insightRecord, isTeam }: AIAdvisorCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      await refreshAIInsights();
    });
  };

  const scoreColor =
    insightRecord.health_score >= 80
      ? "text-positive bg-positive-soft border-positive/30"
      : insightRecord.health_score >= 60
      ? "text-warning bg-warning-soft border-warning/30"
      : "text-danger bg-danger-soft border-danger/30";

  return (
    <div className="border-line bg-surface mb-5 rounded-2xl border p-5 shadow-xs transition-all">
      {/* Advisor Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-accent-soft text-accent flex h-9 w-9 items-center justify-center rounded-xl">
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-ink text-[14px] font-bold tracking-tight">
                {isTeam ? "AI Deal & Project Margin Advisor" : "AI Personal Cashflow & Savings Advisor"}
              </h3>
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${scoreColor}`}>
                {insightRecord.health_score}/100 Health Score
              </span>
            </div>
            <p className="text-ink-muted text-[12px]">{insightRecord.summary}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          className="text-ink-muted hover:text-ink bg-surface-muted hover:bg-surface border-line flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all disabled:opacity-50"
        >
          <RefreshCw size={13} className={isPending ? "animate-spin text-accent" : ""} />
          {isPending ? "Re-evaluating..." : "Refresh Insights"}
        </button>
      </div>

      {/* Insights Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insightRecord.insights.map((item) => {
          const badge = getSeverityBadge(item.severity);
          const Icon = badge.icon;

          return (
            <div
              key={item.id}
              className="bg-surface-muted/60 border-line hover:border-line-strong flex flex-col justify-between rounded-xl border p-3.5 transition-all"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${badge.bg}`}>
                    <Icon size={11} strokeWidth={2.5} />
                    {badge.label}
                  </span>
                  {item.impact_amount && (
                    <span className="text-ink-subtle text-[11px] font-medium tabular">
                      Impact: ₹{item.impact_amount.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <h4 className="text-ink text-[13px] font-semibold">{item.title}</h4>
                <p className="text-ink-muted mt-1 text-[11.5px] leading-relaxed">{item.finding}</p>
              </div>

              <div className="bg-surface border-line mt-3 rounded-lg border p-2.5">
                <p className="text-accent flex items-start gap-1.5 text-[11.5px] font-medium leading-snug">
                  <TrendingUp size={13} className="mt-0.5 flex-shrink-0" />
                  <span>{item.recommendation}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
