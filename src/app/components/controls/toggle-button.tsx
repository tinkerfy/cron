import React from "react";

export interface ToggleButtonProps {
  active: boolean;
  label: string;
  iconActive: React.ReactNode;
  iconInactive: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

/**
 * A controlled toggle button with active/inactive states.
 * Used for "Show All / Hide All" and "Show Dates / Hide Dates" toggles.
 */
const ToggleButton = React.memo(function ToggleButton({
  active,
  label,
  iconActive,
  iconInactive,
  onClick,
  disabled,
  title,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`ml-2 text-[10px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
        active
          ? "bg-[#4A9380] dark:bg-[#3D8070] text-white hover:bg-[#3D8070] dark:hover:bg-[#2D6E5E]"
          : "bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {active ? iconActive : iconInactive}
      </svg>
      {label}
    </button>
  );
});

export default ToggleButton;
