"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";

const CEILING = 350;

export function PriceRangeFilter({ maxPrice }: { maxPrice: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(maxPrice);

  function apply(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next >= CEILING) params.delete("maxPrice");
    else params.set("maxPrice", String(next));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div>
      <h3 className="text-xs font-semibold tracking-[0.1em] text-on-surface-variant mb-6 uppercase">
        Price Range
      </h3>
      <input
        type="range"
        min={0}
        max={CEILING}
        step={5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={() => apply(value)}
        onTouchEnd={() => apply(value)}
        className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between mt-2 text-xs font-semibold text-on-surface-variant">
        <span>GHS 0</span>
        <span className="price-text">{value >= CEILING ? `${formatCurrency(CEILING)}+` : formatCurrency(value)}</span>
      </div>
    </div>
  );
}
