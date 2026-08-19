"use client";

import { useRouter } from "next/navigation";
import { Search, Plus, LogOut, User as UserIcon, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationPanel } from "@/components/shared/notification-panel";
import type { NotificationDoc } from "@/types/firestore";

export interface TopbarUser {
  name: string;
  roleLabel: string;
  photoURL?: string;
}

export function AppTopbar({
  user,
  sidebarTrigger,
  quickAddItems,
  notifications = [],
  unreadCount = 0,
  profileHref = "#",
}: {
  user: TopbarUser;
  sidebarTrigger?: React.ReactNode;
  quickAddItems?: { label: string; href: string }[];
  notifications?: NotificationDoc[];
  unreadCount?: number;
  profileHref?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-20 px-4 lg:px-8 border-b border-outline-variant/50 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {sidebarTrigger}
        <div className="relative hidden md:block max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
          <Input placeholder="Search..." className="pl-9 bg-white/60" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {quickAddItems && quickAddItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 hidden sm:inline-flex">
                <Plus className="size-4" /> Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {quickAddItems.map((item) => (
                <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <NotificationPanel notifications={notifications} unreadCount={unreadCount} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-container transition-colors">
              <Avatar>
                <AvatarImage src={user.photoURL} alt={user.name} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-on-surface">{user.name}</span>
                <span className="text-xs text-on-surface-variant">{user.roleLabel}</span>
              </span>
              <ChevronDown className="size-4 text-on-surface-variant hidden md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push(profileHref)}>
              <UserIcon className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-error focus:bg-error-container/40">
              <LogOut className="size-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
