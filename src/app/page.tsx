"use client";

import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from "react";
import { CronJob, MatchedJob, buildDateTime, expandCron } from "./lib/cron";
import { MatchedJobDisplay } from "./lib/types";
import ThemeToggle from "./theme-toggle";
import GibberishLoading from "./gibberish-loading";

// Hooks
import { useDebounce } from "./hooks/use-debounce";
import { useRulerDrag } from "./hooks/use-ruler-drag";
import { useSortMenu } from "./hooks/use-sort-menu";
import { useQuickRanges } from "./hooks/use-quick-ranges";

// Components
import FilterPanel from "./components/filter-panel";
import ResultsView from "./components/results-view";

export default function Home() {
  // ─── State ───────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [results, setResults] = useState<MatchedJobDisplay[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<string[]>([]);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSchedulers, setSelectedSchedulers] = useState<string[]>([]);
  const [searchService, setSearchService] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "nextRun" | "count" | "server" | "service">("name");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [fromTime, setFromTime] = useState("00:00");
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [toTime, setToTime] = useState("23:59");
  const [showExecutionDates, setShowExecutionDates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [exportWarning, setExportWarning] = useState<string | null>(null);
  const [showAllMode, setShowAllMode] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [matchingCount, setMatchingCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(false);

  // ─── Refs ────────────────────────────────────────────────────────────
  const abortControllerRef = useRef<AbortController | null>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const fromTimeRef = useRef(fromTime);
  const toTimeRef = useRef(toTime);

  // ─── Pagination reset ───────────────────────────────────────────────
  const resetPagination = useCallback(() => setPage(0), []);

  // ─── URL state persistence ──────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get("page") || "0", 10);
    const ps = parseInt(params.get("pageSize") || "50", 10);
    if (!isNaN(p) && p >= 0) setPage(Math.max(0, p));
    if (!isNaN(ps) && ps >= 10 && ps <= 100) setPageSize(ps);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [page, pageSize]);

  // ─── Debounced values (via hook) ─────────────────────────────────────
  const debouncedService = useDebounce(searchService, 2000);

  const effectiveFrom = useMemo(() => `${fromDate}T${fromTime}:00`, [fromDate, fromTime]);
  const effectiveTo = useMemo(() => `${toDate}T${toTime}:59`, [toDate, toTime]);
  const debouncedFrom = useDebounce(effectiveFrom, 400);
  const debouncedTo = useDebounce(effectiveTo, 400);

  // ─── Derived state (via hooks) ──────────────────────────────────────
  const validFromMinutes = useMemo(() => {
    const [h, m] = fromTime.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? 0 : h * 60 + m;
  }, [fromTime]);

  const validToMinutes = useMemo(() => {
    const [h, m] = toTime.split(":").map(Number);
    return isNaN(h) || isNaN(m) ? 1439 : h * 60 + m;
  }, [toTime]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const { dateRanges, timeRanges } = useQuickRanges(today);
  const sortMenu = useSortMenu();
  const rulerState = useRulerDrag(rulerRef, fromTimeRef, toTimeRef, setFromTime, setToTime);

  // ─── Data fetch (unchanged) ─────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch("/api/cron-jobs", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cron jobs");
        return res.json();
      })
      .then((data: CronJob[] | { jobs: CronJob[]; servers: string[] }) => {
        if (Array.isArray(data)) {
          setJobs(data);
          setServers([]);
        } else {
          setJobs(data.jobs);
          setServers(data.servers || []);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError("Failed to load cron jobs: " + err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleServerToggle = useCallback((server: string) => {
    setSelectedServers((prev) =>
      prev.includes(server) ? prev.filter((s) => s !== server) : [...prev, server]
    );
  }, []);

  const handleServerClear = useCallback(() => setSelectedServers([]), []);

  const handleStatusToggle = useCallback((s: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }, []);

  const handleStatusClear = useCallback(() => setSelectedStatuses([]), []);

  const handleSchedulerToggle = useCallback((s: string) => {
    setSelectedSchedulers((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }, []);

  const handleSchedulerClear = useCallback(() => setSelectedSchedulers([]), []);

  // ─── CSV Export ──────────────────────────────────────────────────────
  const handleExportCsv = useCallback(() => {
    if (!results || results.length === 0) return;

    const totalExportDates = results.reduce((sum, r) => sum + r.totalCount, 0);
    if (totalExportDates > 100000) {
      setExportWarning(
        `Exporting ${totalExportDates.toLocaleString()} dates. This may cause browser slowdown. Continue?`
      );
      return;
    }

    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = [
      "Job",
      "Server",
      "Status",
      "Scheduler",
      "Minutes",
      "Hours",
      "Days",
      "Weeks",
      "Months",
      "Years",
    ].join(",");
    const rows = results.map(({ job }) => [
      escape(job.compositeServiceName || ""),
      escape(job.server || ""),
      job.status ? "true" : "false",
      escape(job.scheduler ?? ""),
      escape(job.minutes),
      escape(job.hours),
      escape(job.days),
      escape(job.weeks),
      escape(job.months),
      escape(job.years),
    ].join(","));
    const csv = header + "\n" + rows.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    a.href = url;
    a.download = `cron-jobs-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportWarning(null);
  }, [results]);

  // ─── Export All CSV ─────────────────────────────────────────────────
  const handleExportAllCsv = useCallback(async () => {
    if (showAllMode) {
      setExportWarning("Export is only available in filtered mode.");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setPageLoading(true);

    const from = buildDateTime(fromDate, fromTime);
    const to = buildDateTime(toDate, toTime);

    const fmt = (d: Date) => {
      const base = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      const offset = d.getTimezoneOffset();
      const sign = offset > 0 ? "-" : "+";
      const abs = Math.abs(offset);
      const oh = String(Math.floor(abs / 60)).padStart(2, "0");
      const om = String(abs % 60).padStart(2, "0");
      return `${base}${sign}${oh}:${om}`;
    };

    const params = new URLSearchParams({ from: fmt(from), to: fmt(to), showAll: "false" });
    if (selectedStatuses.length > 0) params.set("status", selectedStatuses.join(","));
    if (selectedSchedulers.length > 0) params.set("scheduler", selectedSchedulers.join(","));
    if (selectedServers.length > 0) params.set("server", selectedServers.join(","));
    if (debouncedService) params.set("compositeServiceName", debouncedService);

    try {
      const res = await fetch(`/api/cron-jobs?${params.toString()}`, { signal: controller.signal });
      if (!res.ok) throw new Error("Failed to fetch all jobs for export");
      const data = await res.json();
      const allJobs = data.jobs || data;

      const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
      const header = [
        "Job", "Server", "Status", "Scheduler",
        "Minutes", "Hours", "Days", "Weeks", "Months", "Years",
      ].join(",");
      const rows = allJobs.map((job: CronJob) => [
        escape(job.compositeServiceName || ""),
        escape(job.server || ""),
        job.status ? "true" : "false",
        escape(job.scheduler ?? ""),
        escape(job.minutes),
        escape(job.hours),
        escape(job.days),
        escape(job.weeks),
        escape(job.months),
        escape(job.years),
      ].join(","));
      const csv = header + "\n" + rows.join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      a.href = url;
      a.download = `cron-jobs-all-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setExportWarning(err.message);
      }
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [showAllMode, fromDate, fromTime, toDate, toTime, selectedStatuses, selectedSchedulers, selectedServers, debouncedService]);

  // ─── Results fetch ──────────────────────────────────────────────────
  const fetchResults = useCallback(
    (showAll: boolean, from?: Date, to?: Date, service?: string) => {
      setLoading(true);
      if (page > 0) {
        setPageLoading(true);
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (showAll) {
        const params = new URLSearchParams({ showAll: "true", page: String(page), pageSize: String(pageSize) });
        if (service !== undefined ? service : debouncedService) {
          params.set("compositeServiceName", service !== undefined ? service : debouncedService);
        }
        fetch(`/api/cron-jobs?${params.toString()}`, { signal: controller.signal })
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch all jobs");
            return res.json();
          })
          .then((data: { jobs: CronJob[]; total: number; page: number; pageSize: number }) => {
            let mapped: MatchedJobDisplay[];
            if (!showExecutionDates) {
              mapped = data.jobs.map((job) => ({ job, matchedDates: [], totalCount: 0 }));
            } else {
              const fromDT = buildDateTime(fromDate, fromTime);
              const toDT = buildDateTime(toDate, toTime);
              const rangeDays = (toDT.getTime() - fromDT.getTime()) / (1000 * 60 * 60 * 24);
              if (rangeDays > 30) {
                mapped = data.jobs.map((job) => ({ job, matchedDates: [], totalCount: 0 }));
              } else {
                mapped = data.jobs.map((job) => {
                  const dates = expandCron(job.schedule, fromDT, toDT);
                  return { job, matchedDates: dates, totalCount: dates.length };
                });
              }
            }
            setResults(mapped);
            setTotalCount(data.total);
            setMatchingCount(data.jobs.length);
          })
          .catch((err) => {
            if (err.name !== "AbortError") setError("Failed to fetch all jobs: " + err.message);
          })
          .finally(() => {
            if (!controller.signal.aborted) {
              setLoading(false);
              setPageLoading(false);
            }
          });
        return;
      }

      if (from && to && from > to) {
        console.error("Invalid date range: 'from' must be before 'to'");
        setLoading(false);
        setPageLoading(false);
        return;
      }
      if (!from || !to) {
        console.error("Invalid date range: 'from' and 'to' are required");
        setLoading(false);
        setPageLoading(false);
        return;
      }
      const maxRangeMs = 365 * 24 * 60 * 60 * 1000;
      if (to.getTime() - from.getTime() > maxRangeMs) {
        console.error("Date range too large. Maximum is 365 days.");
        setLoading(false);
        setPageLoading(false);
        return;
      }

      const fmt = (d: Date) => {
        const base = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        const offset = d.getTimezoneOffset();
        const sign = offset > 0 ? "-" : "+";
        const abs = Math.abs(offset);
        const oh = String(Math.floor(abs / 60)).padStart(2, "0");
        const om = String(abs % 60).padStart(2, "0");
        return `${base}${sign}${oh}:${om}`;
      };
      const params = new URLSearchParams({ from: fmt(from), to: fmt(to), page: String(page), pageSize: String(pageSize) });
      if (selectedStatuses.length > 0) params.set("status", selectedStatuses.join(","));
      if (selectedSchedulers.length > 0) params.set("scheduler", selectedSchedulers.join(","));
      if (selectedServers.length > 0) params.set("server", selectedServers.join(","));
      const serviceToUse = service !== undefined ? service : debouncedService;
      if (serviceToUse) params.set("compositeServiceName", serviceToUse);

      fetch(`/api/cron-jobs?${params.toString()}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch filtered jobs");
          return res.json();
        })
        .then((data: { jobs: MatchedJob[]; total: number }) => {
          setResults(data.jobs.map((r) => ({ ...r, matchedDates: r.matchedDates.map((t: number) => new Date(t)) })));
          setTotalCount(data.total);
          setMatchingCount(data.jobs.length);
        })
        .catch((err) => {
          if (err.name !== "AbortError") setError("Failed to fetch filtered jobs: " + err.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
            setPageLoading(false);
          }
        });
    },
    [selectedServers, selectedStatuses, selectedSchedulers, debouncedService, showExecutionDates, fromDate, fromTime, toDate, toTime, page, pageSize]
  );

  // ─── Quick range selection ──────────────────────────────────────────
  const handleQuickRangeSelect = useCallback((from: Date, to: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    setFromDate(`${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`);
    setToDate(`${to.getFullYear()}-${pad(to.getMonth() + 1)}-${pad(to.getDate())}`);
    setFromTime(`${pad(from.getHours())}:${pad(from.getMinutes())}`);
    setToTime(`${pad(to.getHours())}:${pad(to.getMinutes())}`);
    setPage(0);
    fetchResults(false, from, to);
  }, [fetchResults]);

  // ─── Date/time apply ────────────────────────────────────────────────
  const handleApplyFilter = useCallback(() => {
    const from = buildDateTime(fromDate, fromTime);
    const to = buildDateTime(toDate, toTime);
    fetchResults(false, from, to);
  }, [fetchResults, fromDate, fromTime, toDate, toTime]);

  const handleShowAllToggle = useCallback(() => {
    setShowAllMode((prev) => {
      if (!prev) {
        setSelectedServers([]);
        setSelectedStatuses([]);
        setSelectedSchedulers([]);
        setPage(0);
      } else {
        const pad = (n: number) => String(n).padStart(2, "0");
        const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
        setFromDate(todayStr);
        setToDate(todayStr);
        setFromTime("00:00");
        setToTime("23:59");
        setPage(0);
      }
      return !prev;
    });
  }, [today]);

  // ─── Sorted results ─────────────────────────────────────────────────
  const sortLabels = useMemo(
    () => ({
      name: "Name",
      nextRun: "Next Run",
      count: "Execution Count",
      server: "Server",
      service: "Service",
    }),
    []
  );

  const sortedResults = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.job.compositeServiceName || "").localeCompare(b.job.compositeServiceName || "");
        case "nextRun":
          const aNext = a.matchedDates[0]?.getTime() ?? Infinity;
          const bNext = b.matchedDates[0]?.getTime() ?? Infinity;
          return aNext - bNext;
        case "count":
          return b.totalCount - a.totalCount;
        case "server":
          return (a.job.server || "").localeCompare(b.job.server || "");
        case "service":
          return (a.job.compositeServiceName || "").localeCompare(b.job.compositeServiceName || "");
        default:
          return 0;
      }
    });
  }, [results, sortBy]);

  // ─── Results fetch effect ───────────────────────────────────────────
  useEffect(() => {
    if (showAllMode) {
      fetchResults(true);
    } else {
      const [fromDateStr, fromTimeStr] = debouncedFrom.split("T");
      const [toDateStr, toTimeStr] = debouncedTo.split("T");
      const from = buildDateTime(fromDateStr, fromTimeStr.replace(":00", ""));
      const to = buildDateTime(toDateStr, toTimeStr.replace(":59", ""));
      fetchResults(false, from, to);
    }
  }, [fetchResults, showAllMode, debouncedFrom, debouncedTo]);

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5FAF7] dark:bg-slate-950">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#FFFFFF] dark:bg-slate-900 border-b border-[#D9ECD2] dark:border-slate-800 min-h-[72px]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#204D4C] dark:text-white tracking-tight">
              Cron Job Viewer
            </h1>
            <div className="overflow-hidden">
              <GibberishLoading active={loading} />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#8BAFAD] dark:text-slate-400">
            <ThemeToggle />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {jobs.length} jobs loaded
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <FilterPanel
          // Server filter
          servers={servers}
          selectedServers={selectedServers}
          onServerToggle={handleServerToggle}
          onServerClear={handleServerClear}
          // Status filter
          selectedStatuses={selectedStatuses}
          onStatusToggle={handleStatusToggle}
          onStatusClear={handleStatusClear}
          // Scheduler filter
          selectedSchedulers={selectedSchedulers}
          onSchedulerToggle={handleSchedulerToggle}
          onSchedulerClear={handleSchedulerClear}
          // Service search
          searchService={searchService}
          onSearchChange={setSearchService}
          // Date/time
          fromDate={fromDate}
          fromTime={fromTime}
          toDate={toDate}
          toTime={toTime}
          onFromDateChange={setFromDate}
          onFromTimeChange={setFromTime}
          onToDateChange={setToDate}
          onToTimeChange={setToTime}
          onApplyFilter={handleApplyFilter}
          // Time ruler
          validFromMinutes={validFromMinutes}
          validToMinutes={validToMinutes}
          rulerRef={rulerRef}
          onRulerFromMouseDown={(e) => rulerState.handleRulerMouseDown(e, "from")}
          onRulerToMouseDown={(e) => rulerState.handleRulerMouseDown(e, "to")}
          onRulerFromTimeChange={setFromTime}
          onRulerToTimeChange={setToTime}
          // Quick ranges
          dateRanges={dateRanges}
          timeRanges={timeRanges}
          onQuickRangeSelect={handleQuickRangeSelect}
          // Toggles
          showExecutionDates={showExecutionDates}
          onShowDatesToggle={() => setShowExecutionDates((p) => !p)}
          showAllMode={showAllMode}
          onShowAllToggle={handleShowAllToggle}
          // Sort
          sortBy={sortBy}
          onSortChange={(s) => { setSortBy(s); resetPagination(); }}
          showSortMenu={sortMenu.showSortMenu}
          setShowSortMenu={sortMenu.setShowSortMenu}
          sortMenuRef={sortMenu.sortMenuRef}
          toggleSortMenu={sortMenu.toggleSortMenu}
          sortLabels={sortLabels}
          // Export
          results={results}
          onExport={handleExportCsv}
          onExportAll={handleExportAllCsv}
          exportAllLoading={pageLoading}
          // Pagination
          onResetPagination={resetPagination}
        />

        <Suspense fallback={<div className="py-8 text-center text-sm text-slate-400">Loading results…</div>}>
          <ResultsView
            results={results}
            sortedResults={sortedResults}
            matchingCount={matchingCount}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
            exportWarning={exportWarning}
            showExecutionDates={showExecutionDates}
            sortBy={sortBy}
          />
        </Suspense>
      </main>
    </div>
  );
}
