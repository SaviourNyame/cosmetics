"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { ShopSort } from "@/lib/actions/storefront";

const SORT_LABELS: Record<ShopSort, string> = {
  newest: "Newest First",
  name_asc: "Name A-Z",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
};

function updateParam(current: URLSearchParams, key: string, value: string | null) {
  const params = new URLSearchParams(current.toString());
  if (value) params.set(key, value);
  else params.delete(key);
  params.delete("page");
  return params;
}

export function SortSelect({ sort }: { sort: ShopSort }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={sort}
      onChange={(e) => {
        const params = updateParam(searchParams, "sort", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="bg-transparent border-none focus:ring-0 text-xs font-semibold cursor-pointer hover:text-primary"
    >
      {Object.entries(SORT_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function SearchInput({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(query);
  const [isPending, startTransition] = useTransition();
  const currentQuery = searchParams.get("q") ?? "";
  const isSearching = isPending || value.trim() !== currentQuery;

  useEffect(() => {
    if (value === (searchParams.get("q") ?? "")) return;
    const timeout = setTimeout(() => {
      const params = updateParam(searchParams, "q", value.trim() || null);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex items-center gap-2 glass-effect-deep rounded-full px-4 py-2 w-full sm:w-64 lg:w-72">
      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search products..."
        className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant"
      />
      {isSearching && <span className="material-symbols-outlined text-[14px] animate-spin text-on-surface-variant shrink-0">progress_activity</span>}
    </div>
  );
}
