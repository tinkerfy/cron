import React from "react";
import FilterRow from "./filter-row";

export interface ServerFilterProps {
  servers: string[];
  selected: string[];
  disabled: boolean;
  onClear: () => void;
  onToggle: (server: string) => void;
}

/**
 * Server filter row.
 */
const ServerFilter = React.memo(function ServerFilter({
  servers,
  selected,
  disabled,
  onClear,
  onToggle,
}: ServerFilterProps) {
  return (
    <FilterRow
      label="Server"
      options={[...servers].sort()}
      selected={selected}
      disabled={disabled}
      onSelectAll={onClear}
      onToggle={onToggle}
    />
  );
});

export default ServerFilter;
