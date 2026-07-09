import React from "react";

export interface TimeInputsRowProps {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  disabled: boolean;
  onFromDateChange: (d: string) => void;
  onFromTimeChange: (t: string) => void;
  onToDateChange: (d: string) => void;
  onToTimeChange: (t: string) => void;
  onApply: () => void;
}

/**
 * Date/time inputs row with labels and Filter button.
 */
const TimeInputsRow = React.memo(function TimeInputsRow({
  fromDate,
  fromTime,
  toDate,
  toTime,
  disabled,
  onFromDateChange,
  onFromTimeChange,
  onToDateChange,
  onToTimeChange,
  onApply,
}: TimeInputsRowProps) {
  return (
    <div
      className={`px-4 pb-3 ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="grid grid-cols-2 md:grid-cols-12 gap-x-3 gap-y-2 items-end">
        {/* From date */}
        <div className="col-span-1 md:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
            className="w-full h-8 px-2.5 text-xs border border-[#D9ECD2] dark:border-slate-700 rounded bg-[#F5FAF7] dark:bg-slate-800 text-[#204D4C] dark:text-white focus:ring-1 focus:ring-[#51A090] focus:border-[#51A090] outline-none transition-colors"
          />
        </div>

        {/* From time */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Time
          </label>
          <input
            type="time"
            value={fromTime}
            onChange={(e) => onFromTimeChange(e.target.value)}
            className="w-full h-8 px-2.5 text-xs border border-[#D9ECD2] dark:border-slate-700 rounded bg-[#F5FAF7] dark:bg-slate-800 text-[#204D4C] dark:text-white font-mono focus:ring-1 focus:ring-[#51A090] focus:border-[#51A090] outline-none transition-colors"
          />
        </div>

        {/* To date */}
        <div className="col-span-1 md:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
            className="w-full h-8 px-2.5 text-xs border border-[#D9ECD2] dark:border-slate-700 rounded bg-[#F5FAF7] dark:bg-slate-800 text-[#204D4C] dark:text-white focus:ring-1 focus:ring-[#51A090] focus:border-[#51A090] outline-none transition-colors"
          />
        </div>

        {/* To time */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Time
          </label>
          <input
            type="time"
            value={toTime}
            onChange={(e) => onToTimeChange(e.target.value)}
            className="w-full h-8 px-2.5 text-xs border border-[#D9ECD2] dark:border-slate-700 rounded bg-[#F5FAF7] dark:bg-slate-800 text-[#204D4C] dark:text-white font-mono focus:ring-1 focus:ring-[#51A090] focus:border-[#51A090] outline-none transition-colors"
          />
        </div>

        {/* Apply button */}
        <div className="col-span-1 md:col-span-2">
          <button
            type="button"
            onClick={onApply}
            className="w-full h-8 px-3 bg-[#51A090] hover:bg-[#468F80] active:bg-[#3D8070] text-white text-xs font-medium rounded border border-[#51A090] transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Filter
          </button>
        </div>
      </div>
    </div>
  );
});

export default TimeInputsRow;
