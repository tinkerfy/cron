import React from "react";
import FilterRow from "./filter-row";

export interface StatusFilterProps {
  selected: string[];
  disabled: boolean;
  onClear: () => void;
  onToggle: (value: string) => void;
}

/**
 * Status filter row (Enabled / Disabled).
 */
const StatusFilter = React.memo(function StatusFilter({
  selected,
  disabled,
  onClear,
  onToggle,
}: StatusFilterProps) {
  return (
    <FilterRow
      label="STATUS"
      options={["true", "false"]}
      selected={selected}
      disabled={disabled}
      onSelectAll={onClear}
      onToggle={onToggle}
      optionLabels={{ true: "Enabled", false: "Disabled" }}
    />
  );
});

export default StatusFilter;
