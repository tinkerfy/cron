import React from "react";
import FilterRow from "./filter-row";

export interface SchedulerFilterProps {
  selected: string[];
  disabled: boolean;
  onClear: () => void;
  onToggle: (value: string) => void;
}

/**
 * Scheduler filter row (Active / Inactive).
 */
const SchedulerFilter = React.memo(function SchedulerFilter({
  selected,
  disabled,
  onClear,
  onToggle,
}: SchedulerFilterProps) {
  return (
    <FilterRow
      label="Scheduler"
      options={["true", "false"]}
      selected={selected}
      disabled={disabled}
      onSelectAll={onClear}
      onToggle={onToggle}
      optionLabels={{ true: "Active", false: "Inactive" }}
    />
  );
});

export default SchedulerFilter;
