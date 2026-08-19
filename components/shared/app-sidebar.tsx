"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, SUPPLIER_NAV_ITEMS, type NavItem } from "@/lib/nav-config";

type NavVariant = "admin" | "supplier";

/**
 * NavItem.icon is a Lucide component reference, which can't cross the
 * Server -> Client Component boundary (it's not a plain serializable
 * value). So Server Component layouts only decide *which* hrefs are
 * visible (permission filtering happens there) and pass that plain
 * string array down; the icon/label/href data itself is resolved here,
 * client-side, from the shared nav config.
 */
function resolveItems(variant: NavVariant, visibleHrefs?: string[]): NavItem[] {
  const all = variant === "admin" ? ADMIN_NAV_ITEMS : SUPPLIER_NAV_ITEMS;
  if (!visibleHrefs) return all;
  return all.filter((item) => visibleHrefs.includes(item.href));
}

function NavLinks({ items, collapsed, onNavigate }: { items: NavItem[]; collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active = item.href === "/admin" || item.href === "/supplier"
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-on-surface text-white"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
              collapsed && "justify-center px-2.5"
            )}
          >
            <Icon className="size-[18px] shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

/** Desktop collapsible sidebar. Rendered once, alongside the topbar+content column. */
export function AppSidebar({
  variant,
  visibleHrefs,
  homeHref,
  brandLabel = "Lumière",
}: {
  variant: NavVariant;
  /** Hrefs the current user is permitted to see (server-computed). Omit to show all. */
  visibleHrefs?: string[];
  homeHref: string;
  brandLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const items = resolveItems(variant, visibleHrefs);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-outline-variant/60 bg-white/70 backdrop-blur-xl shrink-0 transition-all duration-200 h-screen sticky top-0",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex items-center gap-3 h-20 px-5 border-b border-outline-variant/40">
        <Link href={homeHref} className="flex items-center gap-2 min-w-0">
          <Image
            src="/images/stitch/dbfb0daaf0ad.jpg"
            alt={brandLabel}
            width={32}
            height={32}
            className="size-8 rounded-full object-cover shrink-0"
          />
          {!collapsed && (
            <span className="font-display text-lg tracking-wide text-on-surface truncate">
              {brandLabel}
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks items={items} collapsed={collapsed} />
      </div>

      <div className="p-3 border-t border-outline-variant/40">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-2"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          {!collapsed && "Collapse"}
        </Button>
      </div>
    </aside>
  );
}

/** Mobile hamburger + slide-out drawer — rendered inside the topbar's left section. */
export function MobileNavSheet({
  variant,
  visibleHrefs,
  homeHref,
  brandLabel = "Lumière",
}: {
  variant: NavVariant;
  visibleHrefs?: string[];
  homeHref: string;
  brandLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const items = resolveItems(variant, visibleHrefs);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex items-center gap-2 h-20 px-5 border-b border-outline-variant/40">
          <Link href={homeHref} className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image
              src="/images/stitch/dbfb0daaf0ad.jpg"
              alt={brandLabel}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
            <span className="font-display text-lg tracking-wide text-on-surface">{brandLabel}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
