import React from "react";

export interface QuickRangeButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

/**
 * A single quick-range button with consistent styling.
 */
const QuickRangeButton = React.memo(function QuickRangeButton({
  label,
  disabled,
  onClick,
}: QuickRangeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`Set date range to ${label}`}
      onClick={onClick}
      className="h-6 px-2 text-[10px] font-medium rounded-full transition-colors bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 dark:active:bg-slate-400 text-slate-700 dark:text-white focus-visible:ring-2 focus-visible:ring-[#51A090] focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none"
    >
      {label}
    </button>
  );
});

export default QuickRangeButton;
