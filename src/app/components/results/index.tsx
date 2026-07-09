import React from "react";
import JobCard from "./job-card";
import { MatchedJobDisplay } from "@/app/lib/types";

export type SortOption = "name" | "nextRun" | "count" | "server" | "service";

export interface ResultsListProps {
  sortedResults: MatchedJobDisplay[] | null;
  sortBy: SortOption;
  showExecutionDates: boolean;
}

/**
 * Sorted results container — renders JobCard items.
 */
const ResultsList = React.memo(function ResultsList({
  sortedResults,
  showExecutionDates,
}: ResultsListProps) {
  if (!sortedResults || sortedResults.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3 opacity-30">⏰</div>
        <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-1">
          No jobs matched the selected date range
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Try adjusting your filters or date range
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedResults.map(({ job, matchedDates, totalCount }, idx) => (
        <JobCard
          key={`${job.compositeServiceName}-${idx}`}
          job={job}
          matchedDates={matchedDates as unknown as Date[]}
          totalCount={totalCount}
          showExecutionDates={showExecutionDates}
        />
      ))}
    </div>
  );
});

export default ResultsList;
