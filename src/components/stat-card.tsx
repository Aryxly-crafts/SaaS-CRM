"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatDelta {
  value: string;
  direction: "up" | "down" | "flat";
}

// Splits a formatted value like "₹88,400" into its prefix and numeric part
// so only the number animates.
function parseValue(value: string | number) {
  const text = String(value);
  const match = text.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  const numeric = Number(match[2].replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return null;
  return { prefix: match[1], value: numeric, suffix: match[3] };
}

// Counts from zero to the target once the card scrolls into view.
function AnimatedValue({ value }: { value: string | number }) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(parsed ? 0 : null);

  const target = parsed?.value;

  useEffect(() => {
    if (target === undefined || !inView) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 650;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      // Ease-out cubic so it decelerates into the final number.
      setDisplay(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  if (!parsed || display === null) {
    return <span ref={ref}>{value}</span>;
  }

  const rounded = Math.round(display);
  return (
    <span ref={ref}>
      {parsed.prefix}
      {rounded.toLocaleString("en-IN")}
      {parsed.suffix}
    </span>
  );
}

// Single stat tile: label, animated value, accent colouring, and optional delta.
export function StatCard({
  label,
  value,
  delta,
  accent,
  index,
}: {
  label: string;
  value: string | number;
  delta?: StatDelta;
  accent?: "danger" | "positive";
  index: number;
}) {
  const valueColor = accent === "danger"
    ? "text-danger"
    : accent === "positive"
      ? "text-positive"
      : "text-ink";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      className="hover:bg-surface-muted flex flex-col gap-1.5 px-4 py-3.5 transition-colors"
    >
      <p className="text-ink-subtle text-label-md truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className={`tabular text-[20px] leading-none font-semibold tracking-tight ${valueColor}`}>
          <AnimatedValue value={value} />
        </span>
        {delta ? (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-medium ${
              delta.direction === "up"
                ? "text-positive"
                : delta.direction === "down"
                  ? "text-danger"
                  : "text-ink-subtle"
            }`}
          >
            {delta.direction === "up" && (
              <ArrowUpRight size={12} strokeWidth={2.25} />
            )}
            {delta.direction === "down" && (
              <ArrowDownRight size={12} strokeWidth={2.25} />
            )}
            {delta.value}
          </span>
        ) : (
          <span className="text-ink-subtle text-[11px]">—</span>
        )}
      </div>
    </motion.div>
  );
}
