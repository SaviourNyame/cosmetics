"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { resolvePreset, type DateRangePreset } from "@/lib/date-range";

export function DashboardFilter({ preset }: { preset: DateRangePreset }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <DateRangePicker
      value={resolvePreset(preset)}
      onChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", value.preset);
        if (value.preset === "custom") {
          params.set("start", value.start.toISOString().slice(0, 10));
          params.set("end", value.end.toISOString().slice(0, 10));
        }
        router.push(`${pathname}?${params.toString()}`);
      }}
    />
  );
}
