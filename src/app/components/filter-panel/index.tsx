import React, { lazy, Suspense } from "react";
import { SortOption } from "../results";
import ServerFilter from "./server-filter";
import StatusFilter from "./status-filter";
import SchedulerFilter from "./scheduler-filter";
import ServiceSearchInput from "./service-search";
import TimeInputsRow from "../time-ruler/time-inputs";
import ToggleButton from "../controls/toggle-button";
import ExportButton from "../controls/export-button";
import SortMenu from "../controls/sort-menu";
import { QuickRange } from "../../hooks/use-quick-ranges";

// Dynamic imports for heavy components — loaded only when needed
const TimeRuler = lazy(() => import("../time-ruler"));
const QuickRangesBar = lazy(() => import("../quick-ranges"));

export interface FilterPanelProps {
  // Server filter
  servers: string[];
  selectedServers: string[];
  onServerToggle: (server: string) => void;
  onServerClear: () => void;
  // Status filter
  selectedStatuses: string[];
  onStatusToggle: (s: string) => void;
  onStatusClear: () => void;
  // Scheduler filter
  selectedSchedulers: string[];
  onSchedulerToggle: (s: string) => void;
  onSchedulerClear: () => void;
  // Service search
  searchService: string;
  onSearchChange: (s: string) => void;
  onSearchEnter?: () => void;
  // Date/time
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  onFromDateChange: (d: string) => void;
  onFromTimeChange: (t: string) => void;
  onToDateChange: (d: string) => void;
  onToTimeChange: (t: string) => void;
  onApplyFilter: () => void;
  // Time ruler
  validFromMinutes: number;
  validToMinutes: number;
  rulerRef: React.RefObject<HTMLDivElement | null>;
  onRulerFromMouseDown: (e: React.MouseEvent) => void;
  onRulerToMouseDown: (e: React.MouseEvent) => void;
  onRulerFromTimeChange: (time: string) => void;
  onRulerToTimeChange: (time: string) => void;
  // Quick ranges
  dateRanges: QuickRange[];
  timeRanges: QuickRange[];
  onQuickRangeSelect: (from: Date, to: Date) => void;
  // Toggles
  showExecutionDates: boolean;
  onShowDatesToggle: () => void;
  showAllMode: boolean;
  onShowAllToggle: () => void;
  // Sort
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  showSortMenu: boolean;
  setShowSortMenu: (v: boolean) => void;
  sortMenuRef: React.RefObject<HTMLDivElement | null>;
  toggleSortMenu: () => void;
  sortLabels: Record<string, string>;
  // Export
  results: { totalCount: number }[] | null;
  onExport: () => void;
  onExportAll?: () => void;
  exportAllLoading?: boolean;
  // Pagination
  onResetPagination?: () => void;
}

/**
 * The entire filter panel container — assembles all filter pieces.
 */
const FilterPanel = React.memo(function FilterPanel({
  servers,
  selectedServers,
  onServerToggle,
  onServerClear,
  selectedStatuses,
  onStatusToggle,
  onStatusClear,
  selectedSchedulers,
  onSchedulerToggle,
  onSchedulerClear,
  searchService,
  onSearchChange,
  onSearchEnter,
  fromDate,
  fromTime,
  toDate,
  toTime,
  onFromDateChange,
  onFromTimeChange,
  onToDateChange,
  onToTimeChange,
  onApplyFilter,
  validFromMinutes,
  validToMinutes,
  rulerRef,
  onRulerFromMouseDown,
  onRulerToMouseDown,
  dateRanges,
  timeRanges,
  onQuickRangeSelect,
  showExecutionDates,
  onShowDatesToggle,
  showAllMode,
  onShowAllToggle,
  sortBy,
  onSortChange,
  showSortMenu,
  setShowSortMenu,
  sortMenuRef,
  toggleSortMenu,
  sortLabels,
  results,
  onExport,
  onRulerFromTimeChange,
  onRulerToTimeChange,
  onExportAll,
  exportAllLoading,
  onResetPagination,
}: FilterPanelProps) {
  // Show All icons
  const showAllActiveIcon = (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.528 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.07 7-9.542 7S2.458 16.057 1.184 12zM12 1v2m0 16v2M4.22 4.22l1.42 1.42m10.14 10.14l1.42-1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42 1.42"
    />
  );
  const showAllInactiveIcon = (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.238 1.706c1.724 0 3.35 0 3.35 0M17.97 9.07a2.75 2.75 0 01-4.7 0 2.75 2.75 0 01-4.7 0m.86-6.83c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.238-1.706c-1.724 0-3.35 0-3.35 0M6.03 9.07a2.75 2.75 0 014.7 0 2.75 2.75 0 014.7 0m-.86 6.83c.426-1.756 2.924 1.756 3.35 0a1.724 1.724 0 002.238 1.706c1.724 0 3.35 0 3.35 0"
    />
  );

  return (
    <div className="bg-[#E8F0EA] dark:bg-slate-900 rounded-lg border border-[#D9ECD2] dark:border-slate-700 mb-6">
      {/* Date/time inputs + filters */}
      <div className="px-4 py-3 border-t border-[#D9ECD2] dark:border-slate-800">
        <div className="flex items-start gap-4 mb-2">
          <ServerFilter
            servers={servers}
            selected={selectedServers}
            disabled={showAllMode}
            onClear={() => { onResetPagination?.(); onServerClear(); }}
            onToggle={(s) => { onResetPagination?.(); onServerToggle(s); }}
          />
          <StatusFilter
            selected={selectedStatuses}
            disabled={showAllMode}
            onClear={() => { onResetPagination?.(); onStatusClear(); }}
            onToggle={(s) => { onResetPagination?.(); onStatusToggle(s); }}
          />
          <SchedulerFilter
            selected={selectedSchedulers}
            disabled={showAllMode}
            onClear={() => { onResetPagination?.(); onSchedulerClear(); }}
            onToggle={(s) => { onResetPagination?.(); onSchedulerToggle(s); }}
          />
          <ServiceSearchInput
            value={searchService}
            onChange={(s) => { onResetPagination?.(); onSearchChange(s); }}
            onEnter={onSearchEnter}
          />
        </div>

        {/* Divider */}
        <div className="my-3">
          <div className="h-px bg-gradient-to-r from-transparent via-[#A3C4A0] to-transparent dark:via-slate-700" />
        </div>

        {/* Time ruler */}
        <Suspense fallback={<div className="h-7 rounded bg-slate-200 dark:bg-slate-800" />} >
          <TimeRuler
            validFromMinutes={validFromMinutes}
            validToMinutes={validToMinutes}
            disabled={showAllMode}
            rulerRef={rulerRef}
            onFromMouseDown={onRulerFromMouseDown}
            onToMouseDown={onRulerToMouseDown}
            onFromTimeChange={onRulerFromTimeChange}
            onToTimeChange={onRulerToTimeChange}
          />
        </Suspense>

        {/* Date/time inputs */}
        <TimeInputsRow
          fromDate={fromDate}
          fromTime={fromTime}
          toDate={toDate}
          toTime={toTime}
          disabled={showAllMode}
          onFromDateChange={(d) => { onResetPagination?.(); onFromDateChange(d); }}
          onFromTimeChange={(t) => { onResetPagination?.(); onFromTimeChange(t); }}
          onToDateChange={(d) => { onResetPagination?.(); onToDateChange(d); }}
          onToTimeChange={(t) => { onResetPagination?.(); onToTimeChange(t); }}
          onApply={() => { onResetPagination?.(); onApplyFilter(); }}
        />
      </div>

      {/* Quick ranges + controls */}
      <Suspense fallback={<div className="h-7 rounded bg-slate-100 dark:bg-slate-800" />}>
        <QuickRangesBar
          dateRanges={dateRanges}
          timeRanges={timeRanges}
          disabled={showAllMode}
          onSelect={onQuickRangeSelect}
        />
      </Suspense>
      <div className="px-4 pb-3 flex flex-wrap items-center gap-1">
        {/* Show Execution Dates toggle */}
        <button
          type="button"
          aria-pressed={showExecutionDates}
          onClick={() => { onResetPagination?.(); onShowDatesToggle(); }}
          className={`ml-auto text-[10px] px-2 py-0.5 rounded-full transition-colors ${
            showExecutionDates
              ? "bg-[#E4F2E7] dark:bg-[#1A3A38] text-[#51A090] dark:text-[#6AD4B8] hover:bg-[#D9ECD2] dark:hover:bg-[#2D4A48]"
              : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          }`}
        >
          {showExecutionDates ? "Hide Dates" : "Show Dates"}
        </button>

        {/* Sort menu */}
        <SortMenu
          sortBy={sortBy}
          onSortChange={(s) => { onResetPagination?.(); onSortChange(s); }}
          showSortMenu={showSortMenu}
          setShowSortMenu={setShowSortMenu}
          sortMenuRef={sortMenuRef}
          toggleSortMenu={toggleSortMenu}
          sortLabels={sortLabels}
        />

        {/* Show All toggle */}
        <ToggleButton
          active={showAllMode}
          label={showAllMode ? "Hide All" : "Show All"}
          iconActive={showAllActiveIcon}
          iconInactive={showAllInactiveIcon}
          onClick={onShowAllToggle}
          title={
            showAllMode
              ? "Show only matched jobs in date range"
              : "Show all jobs regardless of date range"
          }
        />

        {/* Export */}
        <ExportButton results={results} onExport={onExport} onExportAll={onExportAll} exportAllLoading={exportAllLoading} />
      </div>
    </div>
  );
});

export default FilterPanel;
