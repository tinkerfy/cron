import React from "react";
import { CronJob } from "@/app/lib/cron";

export interface JobCardHeaderProps {
  job: CronJob;
  totalCount: number;
}

/**
 * Job card header: name + schedule code + badges row.
 */
const JobCardHeader = React.memo(function JobCardHeader({
  job,
  totalCount,
}: JobCardHeaderProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-semibold text-slate-900 dark:text-white">
        {job.compositeServiceName || "NULL"}
      </span>
      <code className="text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono">
        {job.schedule}
      </code>
      {job.server && (
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            job.server === "Prod1"
              ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300"
              : job.server === "Prod2"
                ? "bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300"
                : "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300"
          }`}
        >
          {job.server}
        </span>
      )}
      {job.scheduler !== null && (
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
            job.scheduler === "true"
              ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
          }`}
        >
          {job.scheduler === "true" ? "Scheduler: Active" : "Scheduler: Inactive"}
        </span>
      )}
      <span
        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
          totalCount > 0
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300"
            : "bg-slate-100 dark:bg-slate-800 text-slate-400"
        }`}
      >
        {totalCount > 0 ? `${totalCount}x` : "No match"}
      </span>
    </div>
  );
});

export default JobCardHeader;
