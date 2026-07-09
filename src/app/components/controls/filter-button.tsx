import React from "react";

export interface FilterButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * A shared filter chip button used across Server, Status, and Scheduler filters.
 */
const FilterButton = React.memo(function FilterButton({
  label,
  selected,
  onClick,
  disabled,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`h-6 px-2 text-[10px] font-medium rounded-full transition-all border text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:text-white focus-visible:ring-2 focus-visible:ring-[#51A090] focus-visible:ring-offset-1 focus-visible:outline-none ${
        disabled ? "cursor-not-allowed" : ""
      } ${
        selected
          ? "bg-[#4A9380] text-white border-[#4A9380] ring-2 ring-[#4A9380] ring-offset-1"
          : "bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-600"
      }`}
    >
      {label}
    </button>
  );
});

export default FilterButton;
