"use client";

import React from "react";
import QuickRangeButton from "./quick-range-button";
import { QuickRange } from "@/app/hooks/use-quick-ranges";

export interface QuickRangesBarProps {
  dateRanges: QuickRange[];
  timeRanges: QuickRange[];
  disabled: boolean;
  onSelect: (from: Date, to: Date) => void;
}

/**
 * Quick range buttons bar — date ranges + time ranges.
 */
const QuickRangesBar = React.memo(function QuickRangesBar({
  dateRanges,
  timeRanges,
  disabled,
  onSelect,
}: QuickRangesBarProps) {
  const pad = (n: number) => String(n).padStart(2, "0");

  const handleDateRangeSelect = (range: QuickRange) => {
    onSelect(range.from, range.to);
  };

  const handleTimeRangeSelect = (range: QuickRange) => {
    onSelect(range.from, range.to);
  };

  return (
    <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-0.5">
        Quick:
      </span>
      <div className="flex flex-wrap gap-1">
        {dateRanges.map((range) => (
          <QuickRangeButton
            key={range.key}
            label={range.label}
            disabled={disabled}
            onClick={() => handleDateRangeSelect(range)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {timeRanges.map((range) => (
          <QuickRangeButton
            key={range.key}
            label={range.label}
            disabled={disabled}
            onClick={() => handleTimeRangeSelect(range)}
          />
        ))}
      </div>
    </div>
  );
});

export default QuickRangesBar;
