import React from "react";
import ResultsList from "./results";
import SummaryBar from "./results/summary-bar";
import EmptyState from "./results/empty-state";
import { SortOption } from "./results";
import { MatchedJobDisplay } from "@/app/lib/types";

export interface ResultsViewProps {
  results: { totalCount: number }[] | null;
  sortedResults: MatchedJobDisplay[] | null;
  matchingCount: number;
  totalCount: number;
  exportWarning: string | null;
  showExecutionDates: boolean;
  sortBy: SortOption;
}

/**
 * ResultsView — encapsulates the results rendering logic.
 * Only re-renders when its props change, preventing unnecessary
 * parent re-renders during ruler drag / time changes.
 */
const ResultsView = React.memo(function ResultsView({
  results,
  sortedResults,
  matchingCount,
  totalCount,
  exportWarning,
  showExecutionDates,
  sortBy,
}: ResultsViewProps) {
  if (results === null) {
    return <EmptyState />;
  }

  return (
    <>
      <SummaryBar
        matchingCount={matchingCount}
        totalCount={totalCount}
        exportWarning={exportWarning}
      />
      <ResultsList
        sortedResults={sortedResults}
        sortBy={sortBy}
        showExecutionDates={showExecutionDates}
      />
    </>
  );
});

export default ResultsView;
