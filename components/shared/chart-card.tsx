"use client";

import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  actions,
  height = 300,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  height?: number;
  children: React.ReactElement;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-6 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-lg text-on-surface">{title}</h3>
          {subtitle && <p className="text-sm text-on-surface-variant">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Shared, on-brand color sequence for multi-series charts (grayscale-forward, minimal-accent). */
export const CHART_COLORS = ["#1c1b1b", "#5d5f5f", "#9a9c9c", "#c6c6c7", "#e5e2e1"];
