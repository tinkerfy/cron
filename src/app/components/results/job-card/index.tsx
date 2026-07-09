import React, { lazy, Suspense } from "react";
import { CronJob } from "@/app/lib/cron";
import JobCardHeader from "./header";

// Dynamic import for heavy component — can render 500+ date chips
const ExecutionDates = lazy(() => import("./execution-dates"));

export interface JobCardProps {
  job: CronJob;
  matchedDates: Date[];
  totalCount: number;
  showExecutionDates: boolean;
}

/**
 * Individual job card with status indicator, header, and optional execution dates.
 * Wrapped in React.memo to prevent re-render when only filter state changes.
 */
const JobCard = React.memo(function JobCard({
  job,
  matchedDates,
  totalCount,
  showExecutionDates,
}: JobCardProps) {
  return (
    <div
      className={`rounded-lg border transition-colors ${
        job.status === false
          ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-50"
          : "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-800"
      }`}
    >
      <div className="px-4 py-3">
        <div className="flex items-start gap-2.5">
          <div
            className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              job.status === true
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}
          >
            {job.status ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <JobCardHeader job={job} totalCount={totalCount} />
          </div>
        </div>

        {/* Matched dates */}
        {totalCount > 0 && showExecutionDates && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Execution dates
            </p>
            <Suspense fallback={<div className="h-8 rounded bg-slate-50 dark:bg-slate-800" />}>
              <ExecutionDates totalCount={totalCount} matchedDates={matchedDates} />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
});

export default JobCard;
