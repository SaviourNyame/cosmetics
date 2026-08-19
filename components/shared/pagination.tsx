"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  pageCount,
  onPageChange,
  totalLabel,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  totalLabel?: string;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      {totalLabel && <p className="text-sm text-on-surface-variant">{totalLabel}</p>}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center gap-2">
            {i > 0 && p - pages[i - 1] > 1 && <span className="px-1 text-on-surface-variant">…</span>}
            <Button
              variant={p === page ? "default" : "ghost"}
              size="icon"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          </span>
        ))}
        <Button
          variant="outline"
          size="icon"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
