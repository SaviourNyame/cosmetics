import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
} from "date-fns";

/**
 * Plain date-math, no "use client" — Server Components (e.g. the dashboard
 * page, reading the preset from a search param) need to call resolvePreset()
 * directly. A client function can't be invoked from server code, so this
 * logic can't live in the same module as the <DateRangePicker> component.
 */
export type DateRangePreset =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "custom";

export interface DateRangeValue {
  preset: DateRangePreset;
  start: Date;
  end: Date;
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  this_week: "This Week",
  this_month: "This Month",
  last_3_months: "Last 3 Months",
  last_6_months: "Last 6 Months",
  this_year: "This Year",
  custom: "Custom Range",
};

export function resolvePreset(preset: DateRangePreset, custom?: { start: Date; end: Date }): DateRangeValue {
  const now = new Date();
  switch (preset) {
    case "today":
      return { preset, start: startOfDay(now), end: endOfDay(now) };
    case "yesterday": {
      const y = subDays(now, 1);
      return { preset, start: startOfDay(y), end: endOfDay(y) };
    }
    case "this_week":
      return { preset, start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    case "this_month":
      return { preset, start: startOfMonth(now), end: endOfMonth(now) };
    case "last_3_months":
      return { preset, start: startOfMonth(subMonths(now, 3)), end: endOfDay(now) };
    case "last_6_months":
      return { preset, start: startOfMonth(subMonths(now, 6)), end: endOfDay(now) };
    case "this_year":
      return { preset, start: startOfYear(now), end: endOfYear(now) };
    case "custom":
      return {
        preset,
        start: custom ? startOfDay(custom.start) : startOfDay(now),
        end: custom ? endOfDay(custom.end) : endOfDay(now),
      };
  }
}
