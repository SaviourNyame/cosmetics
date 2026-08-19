"use client";

import { Bell, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { NotificationDoc } from "@/types/firestore";

export function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onSelect,
}: {
  notifications: NotificationDoc[];
  unreadCount: number;
  onMarkAllRead?: () => void;
  onSelect?: (notification: NotificationDoc) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="font-semibold text-sm">Notifications</p>
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <Check className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="You're all caught up"
              description="New activity will show up here."
              className="border-none py-10"
            />
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => onSelect?.(n)}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm transition-colors hover:bg-surface-container-low",
                  !n.read && "bg-surface-container-low/60"
                )}
              >
                <span className="flex items-center gap-2 font-medium text-on-surface">
                  {!n.read && <span className="size-1.5 rounded-full bg-primary" />}
                  {n.title}
                </span>
                <span className="text-on-surface-variant text-xs">{n.message}</span>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
