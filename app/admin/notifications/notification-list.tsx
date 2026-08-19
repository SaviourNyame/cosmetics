"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/actions/notifications";
import type { NotificationDoc } from "@/types/firestore";

export function NotificationList({ notifications }: { notifications: NotificationDoc[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        description="Platform activity — new applications, requests, orders, payouts — will notify you here."
      />
    );
  }

  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl overflow-hidden">
      {unreadCount > 0 && (
        <div className="flex justify-end px-4 py-3 border-b border-outline-variant/40">
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={() => startTransition(() => markAllNotificationsRead())}
            className="gap-1.5"
          >
            <Check className="size-4" /> Mark all as read
          </Button>
        </div>
      )}
      <ul>
        {notifications.map((n) => (
          <li
            key={n.id}
            className={cn(
              "flex items-start justify-between gap-4 px-5 py-4 border-b border-outline-variant/30 last:border-0",
              !n.read && "bg-surface-container-low/60"
            )}
          >
            <div>
              <p className="text-sm font-medium text-on-surface">{n.title}</p>
              <p className="text-sm text-on-surface-variant mt-0.5">{n.message}</p>
            </div>
            {!n.read && (
              <button
                disabled={isPending}
                onClick={() => startTransition(() => markNotificationRead(n.id))}
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
