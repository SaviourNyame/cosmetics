import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-outline-variant/60 bg-white/40 px-8 py-16 text-center",
        className
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-container-low">
        <Icon className="size-6 text-on-surface-variant" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-lg text-on-surface">{title}</p>
        {description && (
          <p className="text-sm text-on-surface-variant max-w-sm mx-auto">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
