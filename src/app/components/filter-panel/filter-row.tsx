import React from "react";
import FilterButton from "../controls/filter-button";

export interface FilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  disabled: boolean;
  onSelectAll: () => void;
  onToggle: (value: string) => void;
  allLabel?: string;
  optionLabels?: Record<string, string>;
}

/**
 * A generic filter row: label + "All" button + mapped option buttons.
 * Used by ServerFilter, StatusFilter, and SchedulerFilter.
 */
const FilterRow = React.memo(function FilterRow({
  label,
  options,
  selected,
  disabled,
  onSelectAll,
  onToggle,
  allLabel = "All",
  optionLabels,
}: FilterRowProps) {
  return (
    <div className={`flex-1 min-w-0 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <label className="block text-[11px] font-semibold text-[#204D4C] dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-1">
        <FilterButton
          label={allLabel}
          selected={selected.length === 0}
          onClick={onSelectAll}
          disabled={disabled}
        />
        {options.map((option) => (
          <FilterButton
            key={option}
            label={optionLabels?.[option] ?? option}
            selected={selected.includes(option)}
            onClick={() => onToggle(option)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
});

export default FilterRow;
