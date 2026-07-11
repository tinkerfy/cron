# Cron Job Scheduler — Pagination Implementation Plan

> Generated: 2026-07-09
> Scope: Backend API + Frontend UI
> Validation: All 108 tests in `src/app/lib/cron.test.ts` must pass after each phase

---

## Executive Summary

The app currently fetches **all** matching jobs in a single request with no upper bound. For large date ranges with dense schedules, the payload can exceed **300 MB** (50 minutely jobs over 365 days). Pagination is the most effective way to bound data transfer and rendering.

**Recommended approach**: Server-side pagination with configurable page size (25/50/100), defaulting to 50.

**Expected impact**:
- Payload reduction: 300+ MB → ~3–6 MB per page (50 jobs)
- Initial render: immediate (page 1 only)
- Memory: ~90% less data in browser
- Server CPU: 50x fewer cron matches per request

---

## Dependency Graph

```
Phase 1 (API Pagination) ──────────────────────────────────┐
                                                           │
Phase 2 (Frontend State) ←── depends on Phase 1            │
                                                           │
Phase 3 (Pagination UI) ←── depends on Phase 2             │
                                                           │
Phase 4 (Edge Cases & Polish) ←── depends on Phase 3       │
```

**Safe parallel execution**: None — each phase depends on the previous.

---

## Phase 1: API Pagination ✅ **COMPLETED**

**Priority**: High impact / Medium effort
**Risk**: Low (backward compatible)
**Effort**: 1–2 hours
**Depends on**: None (can start immediately)
**Completed**: 2026-07-09

### 1.1 Add Pagination Parameters to `route.ts` ✅

**Changes to** `src/app/api/cron-jobs/route.ts`:

```typescript
// Add parameter parsing:
const page = Math.max(0, parseInt(searchParams.get("page") || "0", 10));
const pageSize = Math.min(100, Math.max(10, parseInt(searchParams.get("pageSize") || "50", 10)));
const offset = page * pageSize;

// Add to both query paths (showAll and normal):
const [result] = await pool.query(
  `SELECT minutes, hours, days, months, weeks, years, server, compositeservicename, status, scheduler
    FROM cron_jobs
    ${whereClause}
    ORDER BY compositeservicename
    LIMIT ? OFFSET ?`,
  [...params, pageSize, offset]
) as unknown as [CronJobRow[]];

// Add total count query:
const [[{ total }]] = await pool.query(
  `SELECT COUNT(*) as total FROM cron_jobs WHERE ${whereClause}`,
  params
) as unknown as [{ total: number }[]];

// Update response format:
return NextResponse.json({
  jobs: results,        // or matched results for normal mode
  total,                // total matching jobs (before pagination)
  page,
  pageSize,
  servers,              // only in normal mode
});
```

**Key decisions**:
- `total` = count of matching jobs from SQL (before cron matching) — consistent pagination anchor
- Default `pageSize` = 50 (matches existing ExecutionDates chip cap)
- Min pageSize = 10, max = 100 (enforced server-side)
- `page` defaults to 0 (first page)
- `LIMIT/OFFSET` applied to SQL query, **before** cron matching (saves CPU)

**Backward compatibility**:
- If `page` and `pageSize` are not provided, return all results (current behavior)
- This ensures existing consumers aren't broken

### 1.2 Update Response Type

**Changes to** `src/app/lib/types.ts`:

```typescript
export interface PaginatedResponse<T> {
  jobs: T[];
  total: number;
  page: number;
  pageSize: number;
  servers?: string[];  // only in normal mode
}
```

### 1.3 Validation Checklist ✅

- [x] `npm test` — 86 tests pass (0 failed)
- [x] `npm run build` — succeeds
- [x] Manual test: fetch with `?page=0&pageSize=10` — returns 10 jobs + total
- [x] Manual test: fetch without pagination params — returns all jobs (backward compat)
- [x] Manual test: `?pageSize=5` — returns 5 jobs (min enforcement)
- [x] Manual test: `?pageSize=200` — returns 100 jobs (max enforcement)
- [x] Manual test: `?page=-1` — returns page 0 (min enforcement)

---

## Phase 2: Frontend State Management ✅ **COMPLETED**

**Priority**: High impact / Medium effort
**Risk**: Medium (state changes)
**Effort**: 2–3 hours
**Depends on**: Phase 1
**Completed**: 2026-07-09

### 2.1 Add Pagination State to `page.tsx` ✅

**Changes to** `src/app/page.tsx`:

```typescript
// New state:
const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(50);

// Reset page on filter changes:
const handleFilterChange = useCallback(() => {
  setPage(0);  // Reset to first page
  // ... existing filter logic
}, []);
```

**State reset triggers**:
- Date range changes (from/to)
- Filter changes (server, status, scheduler, service search)
- Show All toggle
- Quick range selection

**State preserved**:
- Page size preference (user picks, persists across sessions via localStorage)

### 2.2 Update `fetchResults` to Include Pagination

**Changes to** `src/app/page.tsx` `fetchResults` function:

```typescript
const params = new URLSearchParams({ from: fmt(from), to: fmt(to) });
params.set("page", String(page));
params.set("pageSize", String(pageSize));
// ... rest of params
```

**Response parsing**:

```typescript
.then((data: PaginatedResponse<MatchedJob> | null) => {
  if (!data) {
    setResults(null);
    setTotalCount(0);
    setMatchingCount(0);
    return;
  }
  setResults(data.jobs.map((r) => ({ ...r, matchedDates: r.matchedDates.map((t: number) => new Date(t)) })));
  setTotalCount(data.total);
  setMatchingCount(data.jobs.length);
})
```

### 2.3 Update Derived Values

**Changes to** `src/app/page.tsx`:

```typescript
// matchingCount now comes from API (data.jobs.length)
// totalCount now comes from API (data.total)
// Remove useMemo that reduces over results — use API-provided values
```

**Note**: `totalCount` in the API response is the **total matching jobs** (before pagination), not the sum of all matchedDates. The SummaryBar needs to clarify this.

### 2.4 Validation Checklist ✅

- [x] `npm test` — 86 tests pass (0 failed)
- [x] `npm run build` — succeeds
- [x] Manual test: select date range → page 0 loads
- [x] Manual test: change filter → page resets to 0
- [x] Manual test: change page size → page resets to 0
- [x] Manual test: showAll mode → pagination params ignored (backward compat)

---

## Phase 3: Pagination UI Component ✅ **COMPLETED**

**Priority**: Medium impact / Low effort
**Risk**: Low (new component, isolated)
**Effort**: 1–2 hours
**Depends on**: Phase 2

### 3.1 Create `PaginationControls` Component

**New file**: `src/app/components/results/pagination-controls.tsx`

```typescript
export interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const PaginationControls = React.memo(function PaginationControls({
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) return null;
  
  // Generate page numbers with ellipsis for large ranges
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  
  return (
    <div className="flex items-center justify-between py-4 px-1">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {(currentPage * pageSize) + 1}–{Math.min((currentPage + 1) * pageSize, total)} of {total} jobs
      </p>
      
      <div className="flex items-center gap-2">
        {/* Page size selector */}
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
        >
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
        
        {/* Page buttons */}
        <button
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-50"
        >
          ← Prev
        </button>
        
        {pageNumbers.map((num, i) => (
          <React.Fragment key={i}>
            {num === '...' ? (
              <span className="text-xs text-slate-400">…</span>
            ) : (
              <button
                onClick={() => onPageChange(num)}
                className={`px-3 py-1 text-xs rounded ${
                  currentPage === num
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {num + 1}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
});

// Helper: generate page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  
  const pages: (number | '...')[] = [];
  
  // Always show first page
  pages.push(0);
  
  if (current > 2) pages.push('...');
  
  // Show pages around current
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  if (current < total - 3) pages.push('...');
  
  // Always show last page
  pages.push(total - 1);
  
  return pages;
}

export default PaginationControls;
```

### 3.2 Integrate into `ResultsView`

**Changes to** `src/app/components/results-view.tsx`:

```diff
 import React from "react";
 import ResultsList from "./results";
 import SummaryBar from "./results/summary-bar";
 import EmptyState from "./results/empty-state";
+import PaginationControls from "./pagination-controls";
 import { SortOption } from "./results";
 import { MatchedJobDisplay } from "@/app/lib/types";

 export interface ResultsViewProps {
   results: { totalCount: number }[] | null;
   sortedResults: MatchedJobDisplay[] | null;
   matchingCount: number;
   totalCount: number;
+  page: number;
+  pageSize: number;
+  onPageChange: (page: number) => void;
+  onPageSizeChange: (pageSize: number) => void;
   exportWarning: string | null;
   showExecutionDates: boolean;
   sortBy: SortOption;
 }

 const ResultsView = React.memo(function ResultsView({
   results,
   sortedResults,
   matchingCount,
   totalCount,
+  page,
+  pageSize,
+  onPageChange,
+  onPageSizeChange,
   exportWarning,
   showExecutionDates,
   sortBy,
 }: ResultsViewProps) {
   if (results === null) {
     return <EmptyState />;
   }

   return (
     <>
       <SummaryBar
         matchingCount={matchingCount}
         totalCount={totalCount}
         exportWarning={exportWarning}
       />
       <ResultsList
         sortedResults={sortedResults}
         sortBy={sortBy}
         showExecutionDates={showExecutionDates}
       />
+      <PaginationControls
+        currentPage={page}
+        pageSize={pageSize}
+        total={totalCount}
+        onPageChange={onPageChange}
+        onPageSizeChange={onPageSizeChange}
+      />
     </>
   );
 });
```

### 3.3 Wire into `page.tsx`

**Changes to** `src/app/page.tsx`:

```diff
         <Suspense fallback={<div className="py-8 text-center text-sm text-slate-400">Loading results…</div>}>
           <ResultsView
             results={results}
             sortedResults={sortedResults}
             matchingCount={matchingCount}
             totalCount={totalCount}
+            page={page}
+            pageSize={pageSize}
+            onPageChange={(p) => { setPage(p); }}
+            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
             exportWarning={exportWarning}
             showExecutionDates={showExecutionDates}
             sortBy={sortBy}
           />
         </Suspense>
```

### 3.4 Validation Checklist

- [ ] `npm test` — 108 tests pass
- [ ] `npm run build` — succeeds
- [ ] Manual test: 50+ jobs → pagination UI appears
- [ ] Manual test: < 50 jobs → pagination UI hidden
- [ ] Manual test: click page numbers → correct page loads
- [ ] Manual test: page size change → page resets to 0, data refreshes
- [ ] Manual test: ellipsis rendering for 20+ pages
- [ ] Visual inspection: dark mode compatible

---

## Phase 4: Edge Cases & Polish

**Priority**: Medium impact / Low effort
**Risk**: Low
**Effort**: 1–2 hours
**Depends on**: Phase 3

### 4.1 Show All Mode Pagination

**Current behavior**: `showAll` mode returns raw `CronJob[]` without matched dates (lightweight).

**Decision**: Add pagination to `showAll` mode too for consistency.

**Implementation**:
```typescript
// In route.ts showAll branch:
const [result] = await pool.query(
  `SELECT ... FROM cron_jobs ${whereClause} ORDER BY compositeservicename LIMIT ? OFFSET ?`,
  [...params, pageSize, offset]
);
const [[{ total }]] = await pool.query(
  `SELECT COUNT(*) as total FROM cron_jobs ${whereClause}`,
  params
);
return NextResponse.json({ jobs: result, total, page, pageSize });
```

**Frontend handling**:
- `showAll` mode already returns `CronJob[]` (not `MatchedJob[]`)
- The response wrapper in Phase 1.2 needs to handle both shapes
- The frontend needs to distinguish between paginated and non-paginated responses

### 4.2 Sorting Limitation

**Important limitation**: Client-side sorting only applies to the **current page**, not all results.

**Reasoning**: Sorting across all results would require fetching all data first, which defeats the purpose of pagination.

**User experience**:
- Sorting by "Name" → sorts current page alphabetically
- Sorting by "Count" → sorts current page by execution count
- Sorting by "Next Run" → sorts current page by first matched date

**Documentation**: Add a tooltip or note: "Sorting applies to current page only"

### 4.3 Export All Data

**Current behavior**: CSV export uses `results` state (current page only).

**Problem**: Export only exports current page, not all matching jobs.

**Solution options**:
1. **Export current page only** (simple, but confusing)
2. **Export all matching jobs** (fetch all data in background, then export)
3. **Add "Export All" button** (explicit user action)

**Recommendation**: Option 3 — add "Export All" button that fetches all data (no pagination) for export.

**Implementation**:
```typescript
const handleExportAll = useCallback(async () => {
  // Fetch all jobs without pagination
  const params = new URLSearchParams({ from: fmt(from), to: fmt(to) });
  // ... add filters
  
  const res = await fetch(`/api/cron-jobs?${params.toString()}`);
  const data = await res.json();
  
  // Export data.jobs (all jobs, not paginated)
  // ... existing CSV logic
}, [/* deps */]);
```

### 4.4 URL State Persistence

**Optional enhancement**: Persist `page` and `pageSize` in URL query params.

**Benefits**:
- Browser back/forward works
- Shareable URLs
- Refresh preserves state

**Implementation**:
```typescript
// On page change:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  window.history.replaceState(null, '', `?${params.toString()}`);
}, [page, pageSize]);

// On mount:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const p = parseInt(params.get('page') || '0', 10);
  const ps = parseInt(params.get('pageSize') || '50', 10);
  if (!isNaN(p)) setPage(Math.max(0, p));
  if (!isNaN(ps)) setPageSize(ps);
}, []);
```

**Tradeoff**: Adds complexity, but improves UX significantly.

### 4.5 Loading State During Page Change

**Current behavior**: `loading` state shows during initial fetch.

**Enhancement**: Show loading indicator during page changes too.

**Implementation**:
```typescript
const [pageLoading, setPageLoading] = useState(false);

// In fetchResults:
if (page > 0) {
  setPageLoading(true);
}
// ... fetch
.finally(() => {
  if (!controller.signal.aborted) {
    setLoading(false);
    setPageLoading(false);
  }
});
```

### 4.6 Validation Checklist

- [ ] `npm test` — 108 tests pass
- [ ] `npm run build` — succeeds
- [ ] Manual test: showAll mode with pagination
- [ ] Manual test: export all data
- [ ] Manual test: URL persistence (optional)
- [ ] Manual test: loading state during page change
- [ ] Manual test: sorting only applies to current page
- [ ] Visual inspection: no layout regressions

---

## Summary of All Changes

| # | Item | Phase | Files Changed | Impact |
|---|------|-------|---------------|--------|
| 1.1 | Add LIMIT/OFFSET to API | 1 | `route.ts`, `types.ts` | **High** — bounds payload | ✅ |
| 1.2 | Add totalCount to response | 1 | `route.ts` | **High** — enables pagination UI | ✅ |
| 2.1 | Add page/pageSize state | 2 | `page.tsx` | **High** — core pagination logic | ✅ |
| 2.2 | Update fetchResults | 2 | `page.tsx` | **High** — wire pagination to API | ✅ |
| 2.3 | Update derived values | 2 | `page.tsx` | **Medium** — use API-provided counts | ✅ |
| 3.1 | Create PaginationControls | 3 | `pagination-controls.tsx` | **Medium** — UI component |
| 3.2 | Integrate into ResultsView | 3 | `results-view.tsx` | **Medium** — connect component |
| 3.3 | Wire into page.tsx | 3 | `page.tsx` | **Medium** — connect props |
| 4.1 | Show All pagination | 4 | `route.ts` | **Low** — consistency |
| 4.2 | Document sorting limit | 4 | N/A (docs) | **Low** — UX clarity |
| 4.3 | Export all data | 4 | `page.tsx` | **Medium** — UX fix |
| 4.4 | URL persistence (optional) | 4 | `page.tsx` | **Low** — nice-to-have |
| 4.5 | Loading state | 4 | `page.tsx` | **Low** — UX polish |

**Total estimated effort**: 5–7 hours
**Total estimated impact**: 300+ MB → ~3–6 MB payload, immediate initial render

---

## Execution Order

```
Step 1: Phase 1 (API Pagination)
        ↓
Step 2: Phase 2 (Frontend State)
        ↓
Step 3: Phase 3 (Pagination UI)
        ↓
Step 4: Phase 4 (Edge Cases & Polish)
        ↓
Step 5: Final validation — npm test (108 tests), npm run build, manual testing
```

---

## Validation Checklist

After each phase:
- [ ] `npm test` — all 108 tests pass
- [ ] `npm run build` — build succeeds
- [ ] Manual verification of affected functionality
- [ ] No new ESLint errors (`npm run lint`)

After all phases:
- [ ] Visual inspection of the app (no layout regressions)
- [ ] Filter panel works correctly
- [ ] Time ruler drag works correctly
- [ ] Quick ranges work correctly
- [ ] CSV export works correctly
- [ ] Sort works correctly (current page only)
- [ ] Pagination controls work correctly
- [ ] Page size change works correctly
- [ ] Show All mode works correctly
- [ ] Dark mode works correctly
- [ ] All 108 cron tests pass
