"use client";

import { useState } from "react";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { resolvePreset, PRESET_LABELS, type DateRangePreset, type DateRangeValue } from "@/lib/date-range";

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.start.toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState(value.end.toISOString().slice(0, 10));

  const presets: DateRangePreset[] = [
    "today",
    "yesterday",
    "this_week",
    "this_month",
    "last_3_months",
    "last_6_months",
    "this_year",
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarRange className="size-4" />
          {PRESET_LABELS[value.preset]}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="flex flex-col gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                onChange(resolvePreset(p));
                setOpen(false);
              }}
              className={cn(
                "text-left rounded-lg px-3 py-2 text-sm hover:bg-surface-container transition-colors",
                value.preset === p && "bg-surface-container font-semibold"
              )}
            >
              {PRESET_LABELS[p]}
            </button>
          ))}

          <div className="border-t border-outline-variant/50 mt-2 pt-3 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Custom Date Range
            </p>
            <div className="flex items-center gap-2">
              <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
              <span className="text-on-surface-variant">–</span>
              <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
            <Button
              size="sm"
              onClick={() => {
                onChange(
                  resolvePreset("custom", { start: new Date(customStart), end: new Date(customEnd) })
                );
                setOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
