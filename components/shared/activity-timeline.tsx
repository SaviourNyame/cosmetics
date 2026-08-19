import { cn } from "@/lib/utils";

export interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string;
  status: "complete" | "current" | "upcoming";
}

/**
 * Vertical stepper used for both the Activity Log feed and the visual
 * Request Timeline (created -> suppliers selected -> ... -> completed).
 */
export function ActivityTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "flex size-3 shrink-0 rounded-full mt-1.5",
                step.status === "complete" && "bg-on-surface",
                step.status === "current" && "bg-primary ring-4 ring-primary/15",
                step.status === "upcoming" && "bg-surface-container-high"
              )}
            />
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "w-px flex-1 min-h-8",
                  step.status === "complete" ? "bg-on-surface/30" : "bg-outline-variant"
                )}
              />
            )}
          </div>
          <div className="pb-6">
            <p
              className={cn(
                "text-sm font-medium",
                step.status === "upcoming" ? "text-on-surface-variant" : "text-on-surface"
              )}
            >
              {step.label}
            </p>
            {step.description && (
              <p className="text-sm text-on-surface-variant mt-0.5">{step.description}</p>
            )}
            {step.timestamp && (
              <p className="text-xs text-on-surface-variant/70 mt-1">{step.timestamp}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
