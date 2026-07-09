import React from "react";

export interface SummaryBarProps {
  matchingCount: number;
  totalCount: number;
  exportWarning: string | null;
}

/**
 * Summary bar: "N jobs in range · M executions" + optional export warning.
 */
const SummaryBar = React.memo(function SummaryBar({
  matchingCount,
  totalCount,
  exportWarning,
}: SummaryBarProps) {
  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {matchingCount > 0 ? (
          <>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {matchingCount}
            </span>{" "}
            jobs in range
            {" · "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {totalCount}
            </span>{" "}
            executions
          </>
        ) : (
          "No jobs matched the selected date range"
        )}
      </p>
      {exportWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {exportWarning}
        </p>
      )}
    </div>
  );
});

export default SummaryBar;
