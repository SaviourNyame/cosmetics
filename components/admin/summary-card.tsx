import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function SummaryCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "neutral" | "accent";
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 flex items-start justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant truncate">
          {label}
        </p>
        <p className="font-display text-2xl text-on-surface mt-1.5">{value}</p>
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          tone === "accent" ? "bg-on-surface text-white" : "bg-surface-container-low text-on-surface-variant"
        )}
      >
        <Icon className="size-5" />
      </div>
    </div>
  );
}
