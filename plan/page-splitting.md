# page.tsx Component Splitting Plan

## Current State

`page.tsx` is a **1202-line monolithic client component** with:
- **24+ `useState` hooks**
- **6 `useEffect` hooks**
- **3 `useMemo` hooks**
- **1 `useCallback`**
- **12+ inline SVG icons** (duplicated across the file)
- **~10 inline style calculations** (computed on every render)
- **4 distinct UI regions** tightly coupled: filter panel, time ruler, quick ranges, job results
- **2 identical debounce implementations** (searchService + date/time)
- **3 identical filter button patterns** (server, status, scheduler)
- **No React.memo** on any sub-component
- **No reusable hooks**

---

## Splitting Principles

1. **One concern per file** — filters, ruler, results, utilities
2. **Lift state up minimally** — keep the "source of truth" in `page.tsx`, pass down props
3. **Preserve `use client` boundary** — only files that use hooks become client components
4. **No circular dependencies**
5. **All exports are named** — no default exports in the app directory

---

## Proposed Architecture

```
src/app/
├── page.tsx                          (~350 lines) — orchestrator
├── components/
│   ├── filter-panel/
│   │   ├── index.tsx                 — FilterPanel (assembles all filter pieces)
│   │   ├── server-filter.tsx         — ServerFilterButtons
│   │   ├── status-filter.tsx         — StatusFilterButtons
│   │   ├── scheduler-filter.tsx      — SchedulerFilterButtons
│   │   └── service-search.tsx        — ServiceSearchInput
│   ├── time-ruler/
│   │   ├── index.tsx                 — TimeRuler (drag handles + track)
│   │   └── time-inputs.tsx           — TimeInputsRow (date + time fields + Filter button)
│   ├── quick-ranges/
│   │   ├── index.tsx                 — QuickRangesBar
│   │   └── quick-range-button.tsx    — QuickRangeButton (shared button)
│   ├── results/
│   │   ├── index.tsx                 — ResultsList (sorted results)
│   │   ├── summary-bar.tsx           — SummaryBar (count + export warning)
│   │   ├── job-card/
│   │   │   ├── index.tsx             — JobCard (full card)
│   │   │   ├── header.tsx            — JobCardHeader (name, schedule, badges)
│   │   │   └── execution-dates.tsx   — ExecutionDates (wrapped dates)
│   │   └── empty-state.tsx           — EmptyState
│   └── controls/
│       ├── sort-menu.tsx             — SortMenu (dropdown + click-outside)
│       ├── toggle-button.tsx         — ToggleButton (Show Dates / Show All)
│       └── export-button.tsx         — ExportButton
└── hooks/
    ├── use-debounce.ts               — shared debounce hook
    ├── use-ruler-drag.ts             — ruler mouse drag logic
    ├── use-sort-menu.ts              — sort menu click-outside + toggle
    ├── use-quick-ranges.ts           — quick range date computation
    └── use-export-warning.ts         — CSV export warning logic
```

---

## Phase 1 — Extract Independent UI Pieces (Low Risk, High Readability)

### 1. `ToggleButton` — Show All / Show Dates toggle buttons

**Why**: Two nearly identical toggle button patterns with inline SVGs duplicated 4+ times.

**Props**:
```tsx
interface ToggleButtonProps {
  active: boolean;
  label: string;
  iconActive: React.ReactNode;
  iconInactive: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}
```

**State moved**: None — pure controlled component.

---

### 2. `QuickRangesBar` — Quick range buttons

**Why**: 3 separate `.map()` blocks creating Date objects inline during render. Should be memoized.

**Props**:
```tsx
interface QuickRangesBarProps {
  quickRanges: QuickRange[];
  disabled: boolean;
  onSelect: (from: Date, to: Date) => void;
}
```

**Optimization**: Move `quickRanges` date computation into a `useQuickRanges()` hook (already memoized in page.tsx but buried).

---

### 3. `FilterButton` — Shared filter chip button

**Why**: Server, Status, and Scheduler filters each have 50+ lines of identical button markup with conditional classes.

**Props**:
```tsx
interface FilterButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}
```

**State moved**: None — pure controlled component.

---

### 4. `ServerFilter`, `StatusFilter`, `SchedulerFilter` — Filter row components

**Why**: Each is ~45 lines of identical structure (label → "All" button → mapped buttons).

**Props** (shared interface):
```tsx
interface FilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  disabled: boolean;
  onSelectAll: () => void;
  onToggle: (value: string) => void;
}
```

**State moved**: None — all state lifted to `page.tsx`.

---

## Phase 2 — Extract the Time Ruler (Medium Risk, High Impact)

### 5. `TimeRuler` — The 24-hour draggable ruler

**Why**: 150+ lines of inline styles, SVG icons, mouse event handlers, and position calculations. This is the single most complex visual component.

**Props**:
```tsx
interface TimeRulerProps {
  fromTime: string;
  toTime: string;
  disabled: boolean;
  onFromTimeChange: (time: string) => void;
  onToTimeChange: (time: string) => void;
}
```

**Hook extracted**: `useRulerDrag(rulerRef, fromTimeRef, toTimeRef, dragHandle, isDragging)` — handles `mousemove`/`mouseup` on window.

**Optimization**: Move all inline style calculations into the hook. The ruler component becomes a clean composition of `<Track>`, `<Handle>`, `<DimmedRegion>` sub-components.

---

### 6. `TimeInputsRow` — Date/time fields + Filter button

**Why**: 4 date/time inputs with labels, all tightly coupled to the ruler.

**Props**:
```tsx
interface TimeInputsRowProps {
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
```

---

## Phase 3 — Extract Results Display (Medium Risk, High Impact)

### 7. `JobCard` — Individual job card

**Why**: 100+ lines of card markup with status indicator, schedule badge, server badge, scheduler badge, execution count badge, description, and conditional execution dates.

**Props**:
```tsx
interface JobCardProps {
  job: CronJob;
  matchedDates: Date[];
  totalCount: number;
  showExecutionDates: boolean;
}
```

**Sub-components**:
- `JobCardHeader` — name + schedule code + badges row
- `ExecutionDates` — wrapped date chips with "+N more" truncation

**Optimization**: Wrap in `React.memo` — job cards only change when `results` changes, not on filter state changes.

---

### 8. `ResultsList` — Sorted results container

**Why**: The `sortedResults` useMemo and `.map()` rendering.

**Props**:
```tsx
interface ResultsListProps {
  results: MatchedJob[] | null;
  sortBy: SortOption;
  showExecutionDates: boolean;
}
```

**Memoization**: The `sortedResults` useMemo stays in `page.tsx` (source of truth), but the rendering logic moves to this component.

---

### 9. `SummaryBar` — "N jobs in range · M executions" + export warning

**Why**: 20 lines of status text with conditional export warning.

**Props**:
```tsx
interface SummaryBarProps {
  matchingCount: number;
  totalCount: number;
  exportWarning: string | null;
}
```

---

### 10. `EmptyState` — "Select a date range" placeholder

**Why**: 10 lines, but conceptually distinct from results.

**Props**: None (or `className`).

---

## Phase 4 — Extract Hooks (Low Risk, High Reusability)

### 11. `useDebounce<T>(value: T, delay: number)` — Shared debounce hook

**Why**: Two identical debounce implementations (`searchService` and `date/time`) with inline `setTimeout` logic.

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
```

---

### 12. `useRulerDrag(rulerRef, fromTimeRef, toTimeRef)` — Ruler drag logic

**Why**: 30 lines of `mousedown`/`mousemove`/`mouseup` handler setup and cleanup.

---

### 13. `useSortMenu()` — Sort menu toggle + click-outside

**Why**: 8 lines of `mousedown` listener on `document`.

---

### 14. `useExportWarning(totalExportDates)` — CSV export warning

**Why**: 15 lines of export logic mixed into the render.

---

## Phase 5 — Extract Filter Panel (Medium Risk, High Readability)

### 15. `FilterPanel` — The entire filter panel container

**Why**: 200+ lines of filter markup (server buttons, status buttons, scheduler buttons, service search, date/time inputs, time ruler, quick ranges, toggles, sort menu, export button).

**Props** (full interface):
```tsx
interface FilterPanelProps {
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
  // Date/time
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  onFromDateChange: (d: string) => void;
  onFromTimeChange: (t: string) => void;
  onToDateChange: (d: string) => void;
  onToTimeChange: (t: string) => void;
  // Time ruler
  rulerFromMinutes: number;
  rulerToMinutes: number;
  onRulerFromChange: (time: string) => void;
  onRulerToChange: (time: string) => void;
  // Quick ranges
  quickRanges: QuickRange[];
  onQuickRangeSelect: (from: Date, to: Date) => void;
  // Toggles
  showExecutionDates: boolean;
  onShowDatesToggle: () => void;
  showAllMode: boolean;
  onShowAllToggle: () => void;
  // Sort
  sortBy: SortOption;
  onSortChange: (s: SortOption) => void;
  // Export
  totalExportDates: number;
  exportWarning: string | null;
  onExport: () => void;
  // State
  loading: boolean;
  jobsLoaded: number;
}
```

---

## `page.tsx` After Splitting (~350 lines)

```tsx
"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { CronJob, MatchedJob, expandCron, buildDateTime } from "./lib/cron";
import ThemeToggle from "./theme-toggle";
import GibberishLoading from "./gibberish-loading";

// Hooks
import { useDebounce } from "./hooks/use-debounce";
import { useRulerDrag } from "./hooks/use-ruler-drag";
import { useSortMenu } from "./hooks/use-sort-menu";
import { useQuickRanges } from "./hooks/use-quick-ranges";

// Components
import FilterPanel from "./components/filter-panel";
import ResultsList from "./components/results";
import EmptyState from "./components/results/empty-state";

export default function Home() {
  // --- State (unchanged, just organized) ---
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [results, setResults] = useState<MatchedJob[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSchedulers, setSelectedSchedulers] = useState<string[]>([]);
  const [showExecutionDates, setShowExecutionDates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAllMode, setShowAllMode] = useState(false);

  // --- Debounced values (via hook) ---
  const debouncedService = useDebounce(searchService, 2000);
  const debouncedFrom = useDebounce(effectiveFrom, 400);
  const debouncedTo = useDebounce(effectiveTo, 400);

  // --- Derived state (via hooks) ---
  const quickRanges = useQuickRanges(today);
  const sortMenu = useSortMenu();
  const rulerState = useRulerDrag(rulerRef, fromTimeRef, toTimeRef);

  // --- Data fetch (unchanged) ---
  useEffect(() => { /* fetch jobs */ }, []);

  // --- Results fetch (unchanged, just calls fetchResults) ---
  useEffect(() => { /* fetch results */ }, [fetchResults, showAllMode, debouncedFrom, debouncedTo]);

  // --- Sorted results ---
  const sortedResults = useMemo(() => { /* sort logic */ }, [results, sortBy]);

  // --- Handlers (wrapped in useCallback) ---
  const handleServerToggle = useCallback((s: string) => {}, []);
  const handleQuickRange = useCallback((from: Date, to: Date) => {}, []);
  const handleExport = useCallback(() => {}, []);

  return (
    <div className="min-h-screen bg-[#F5FAF7] dark:bg-slate-950">
      {error && <ErrorBanner error={error} onClose={() => setError(null)} />}
      <Header jobsLoaded={jobs.length} loading={loading} />
      <main className="max-w-7xl mx-auto px-6 py-6">
        <FilterPanel
          // ... all props
        />
        {results === null ? (
          <EmptyState />
        ) : (
          <ResultsList
            sortedResults={sortedResults}
            showExecutionDates={showExecutionDates}
          />
        )}
      </main>
    </div>
  );
}
```

---

## Impact Summary

| Metric | Before | After |
|---|---|---|
| `page.tsx` lines | 1202 | ~350 |
| Max file size | 1202 | 350 (page) + max 150 (any component) |
| `useState` hooks in page | 24 | 12 |
| `useEffect` hooks in page | 6 | 3 |
| Inline SVGs in page | 12+ | 0 (extracted) |
| Inline styles in page | ~10 | 0 |
| Re-render scope | Entire page on any state change | Isolated per component |
| Testable units | 1 giant component | 10+ focused components + 4 hooks |

---

## Execution Order

1. **Hooks first** (`use-debounce`, `use-ruler-drag`, `use-sort-menu`, `use-quick-ranges`) — no UI changes, pure logic extraction
2. **Leaf components** (`ToggleButton`, `FilterButton`, `QuickRangeButton`, `EmptyState`) — pure presentational, no new state
3. **Medium components** (`ServerFilter`, `StatusFilter`, `SchedulerFilter`, `TimeRuler`, `TimeInputsRow`, `JobCard`, `ExecutionDates`, `SummaryBar`) — controlled components receiving props
4. **Composite components** (`FilterPanel`, `ResultsList`) — assemble the leaf components
5. **Orchestrate** (`page.tsx`) — lift state, wire props, remove all extracted markup

---

## Validation Requirements

Per AGENTS.md, this change requires:

1. **`nextjs-code-quality` review** — All TypeScript changes, React component boundaries, data fetching patterns, ESLint compliance
2. **`ui-ux-reviewer` review** — All visual elements preserved, no spacing/typography/color changes
3. **`filtering-validator` review** — No filtering logic changes, but the filter UI moves to a new component (props interface must be verified)
4. **`npm test`** — All 108 cron tests must pass (no cron logic changes)
5. **Manual verification** — All filters, ruler dragging, quick ranges, sort, show-all toggle, CSV export, and execution dates display must work identically

---

## Risk Assessment

| Phase | Risk | Mitigation |
|---|---|---|
| Hooks | Low | Pure logic extraction, no UI changes |
| Leaf components | Low | Pure presentational, controlled props |
| Medium components | Medium | Props interface must be precise |
| Composite components | Medium | Integration testing required |
| page.tsx orchestration | Medium | Visual regression comparison |

---

## Key Optimizations Enabled

1. **`React.memo` on `JobCard`** — prevents re-render when only filter state changes
2. **`React.memo` on `QuickRangeButton`** — prevents re-render on every parent update
3. **`useMemo` on `quickRanges`** — already exists but buried; extracted to its own hook for clarity
4. **`useCallback` on all handlers** — prevents child re-renders from stable function references
5. **`useDebounce` hook** — eliminates duplicate debounce code, easier to tune
6. **`useRulerDrag` hook** — isolates complex mouse event logic, easier to test
7. **`useSortMenu` hook** — isolates click-outside logic
8. **Reduced re-render scope** — filter changes no longer re-render job cards
9. **No inline styles in render** — ruler position calculations moved to hook
10. **No inline SVGs in render** — extracted to memoized components
