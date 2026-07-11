import React from "react";

export interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PaginationControls = React.memo(function PaginationControls({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const start = (currentPage * pageSize) + 1;
  const end = Math.min((currentPage + 1) * pageSize, total);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between py-4 px-1">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {start}–{end} of {total} jobs
      </p>

      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 dark:text-slate-400">
          Per page:
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="ml-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 pr-6 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <button
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          &larr; Prev
        </button>

        {pageNumbers.map((num, i) =>
          num === "..." ? (
            <span key={`e-${i}`} className="text-xs text-slate-400 px-0.5">
              &middot;&middot;&middot;
            </span>
          ) : (
            <button
              key={num}
              onClick={() => onPageChange(num as number)}
              className={`px-2.5 py-1 text-xs rounded transition-colors ${
                currentPage === num
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium"
                  : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {(num as number) + 1}
            </button>
          )
        )}

        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
});

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const pages: (number | "...")[] = [];
  pages.push(0);

  if (current > 2) pages.push("...");

  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 3) pages.push("...");

  pages.push(total - 1);

  return pages;
}

export default PaginationControls;
