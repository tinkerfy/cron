import React from "react";

export interface ExecutionDatesProps {
  totalCount: number;
  matchedDates: Date[];
}

/**
 * Execution dates display — wrapped chips or truncated with "+N more".
 */
const ExecutionDates = React.memo(function ExecutionDates({
  totalCount,
  matchedDates,
}: ExecutionDatesProps) {
  if (totalCount <= 500) {
    return (
      <div className="flex flex-wrap gap-0.5">
        {matchedDates.map((date, i) => (
          <span
            key={`exec-${i}`}
            className="inline-flex items-center text-[10px] px-1 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
          >
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {matchedDates.slice(0, 50).map((date, i) => (
          <span
            key={`exec-${i}`}
            className="inline-flex items-center text-[10px] px-1 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded"
          >
            {date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}{" "}
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        + {totalCount - 50} more executions
      </p>
    </div>
  );
});

export default ExecutionDates;
