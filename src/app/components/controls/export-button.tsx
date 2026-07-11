import React from "react";

export interface ExportButtonProps {
  results: { totalCount: number }[] | null;
  onExport: () => void;
  onExportAll?: () => void;
  exportAllLoading?: boolean;
}

const ExportButton = React.memo(function ExportButton({
  results,
  onExport,
  onExportAll,
  exportAllLoading,
}: ExportButtonProps) {
  const hasResults = results && results.length > 0;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onExport}
        disabled={!hasResults}
        className={`ml-2 text-[10px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
          hasResults
            ? "bg-[#E4F2E7] dark:bg-[#1A3A38] text-[#51A090] dark:text-[#6AD4B8] hover:bg-[#D9ECD2] dark:hover:bg-[#2D4A48] cursor-pointer"
            : "bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
        }`}
        title={hasResults ? "Export matched jobs to CSV" : "No results to export"}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>

      {onExportAll && (
        <button
          type="button"
          onClick={onExportAll}
          disabled={exportAllLoading}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
            exportAllLoading
              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-wait"
              : "bg-[#E4F2E7] dark:bg-[#1A3A38] text-[#51A090] dark:text-[#6AD4B8] hover:bg-[#D9ECD2] dark:hover:bg-[#2D4A48] cursor-pointer"
          }`}
          title="Export all matching jobs (ignores pagination)"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Export All
        </button>
      )}
    </div>
  );
});

export default ExportButton;
