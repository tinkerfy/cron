import React from "react";

/**
 * Empty state shown when no results have been fetched yet.
 */
const EmptyState = React.memo(function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3 opacity-30">⏰</div>
      <h2 className="text-base font-semibold text-slate-500 dark:text-slate-400 mb-1">
        Select a date range
      </h2>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Choose your dates above and click Filter
      </p>
    </div>
  );
});

export default EmptyState;
