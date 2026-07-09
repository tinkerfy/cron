import React from "react";
import { SortOption } from "../results";

export interface SortMenuProps {
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  showSortMenu: boolean;
  setShowSortMenu: (v: boolean) => void;
  sortMenuRef: React.RefObject<HTMLDivElement | null>;
  toggleSortMenu: () => void;
  sortLabels: Record<string, string>;
}

const sortIcon = (
  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const checkIcon = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Sort dropdown menu with click-outside-to-close.
 */
const SortMenu = React.memo(function SortMenu({
  sortBy,
  onSortChange,
  showSortMenu,
  sortMenuRef,
  toggleSortMenu,
  sortLabels,
}: SortMenuProps) {
  return (
    <div className="relative" ref={sortMenuRef}>
      <button
        type="button"
        onClick={toggleSortMenu}
        className={`ml-2 text-[10px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
          sortBy !== "name"
            ? "bg-[#E4F2E7] dark:bg-[#1A3A38] text-[#51A090] dark:text-[#6AD4B8] hover:bg-[#D9ECD2] dark:hover:bg-[#2D4A48]"
            : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
        }`}
      >
        Sort
        {sortIcon}
      </button>
      {showSortMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
          {Object.entries(sortLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onSortChange(key as SortOption);
              }}
              className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center justify-between transition-colors ${
                sortBy === key
                  ? "bg-[#E4F2E7] dark:bg-[#1A3A38] text-[#51A090] dark:text-[#6AD4B8]"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {label}
              {sortBy === key && checkIcon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default SortMenu;
