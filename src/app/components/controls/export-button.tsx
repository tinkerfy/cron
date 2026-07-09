import React from "react";

export interface ExportButtonProps {
  results: { totalCount: number }[] | null;
  onExport: () => void;
}

const ExportButton = React.memo(function ExportButton({
  results,
  onExport,
}: ExportButtonProps) {
  const hasResults = results && results.length > 0;

  return (
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
  );
});

export default ExportButton;
