import { useMemo } from "react";

export interface QuickRange {
  key: string;
  label: string;
  from: Date;
  to: Date;
}

/**
 * Memoized quick ranges derived from a base `today` date.
 * Time ranges are computed inline (not memoized) since they depend on `new Date()`.
 */
export function useQuickRanges(today: Date): {
  dateRanges: QuickRange[];
  timeRanges: QuickRange[];
} {
  const dateRanges = useMemo(() => {
    const todayStart = new Date(today);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const oneDayStart = new Date(today);
    const oneDayEnd = new Date(today);
    oneDayEnd.setDate(oneDayEnd.getDate() + 1);
    oneDayEnd.setHours(23, 59, 59, 999);

    return [
      { key: "today", label: "Today", from: todayStart, to: todayEnd },
      { key: "oneDay", label: "1 Day", from: oneDayStart, to: oneDayEnd },
    ] as QuickRange[];
  }, [today]);

  // Time ranges computed inline since they depend on `new Date()` (current time)
  const now = new Date();
  const timeRanges: QuickRange[] = (() => {
    const makeRange = (offsetMin: number, durationMin: number, label: string): QuickRange => {
      const quickFrom = new Date(now);
      quickFrom.setMinutes(now.getMinutes() + offsetMin);
      quickFrom.setSeconds(0, 0);
      const quickTo = new Date(now);
      quickTo.setMinutes(now.getMinutes() + offsetMin + durationMin);
      quickTo.setSeconds(59, 999);
      return { key: `${offsetMin}-${label}`, label, from: quickFrom, to: quickTo };
    };

    return [
      makeRange(0, 5, "Next 5 Min"),
      makeRange(-5, 5, "Past 5 Min"),
      makeRange(0, 30, "Next 30 Min"),
      makeRange(-30, 30, "Past 30 Min"),
      makeRange(0, 60, "Next 1 Hour"),
      makeRange(-60, 60, "Past 1 Hour"),
    ];
  })();

  return { dateRanges, timeRanges };
}
