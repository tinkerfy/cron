import React from "react";

export interface ServiceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
}

/**
 * Service search input — always enabled.
 */
const ServiceSearchInput = React.memo(function ServiceSearchInput({
  value,
  onChange,
  onEnter,
}: ServiceSearchInputProps) {
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-[11px] font-semibold text-[#204D4C] dark:text-slate-400 uppercase tracking-wider mb-1">
        Service
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onEnter?.();
          }
        }}
        placeholder="Search service..."
        className="w-full h-7 px-2.5 text-[11px] border border-[#D9ECD2] dark:border-slate-700 rounded bg-[#F5FAF7] dark:bg-slate-800 text-[#204D4C] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-1 focus:ring-[#51A090] focus:border-[#51A090] outline-none transition-colors"
      />
    </div>
  );
});

export default ServiceSearchInput;
