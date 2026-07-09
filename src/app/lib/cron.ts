import type { CronJob, MatchedJob } from "./types";
export type { CronJob, MatchedJob } from "./types";

// Parse a single cron field into a set of valid values
export function parseField(field: string, min: number, max: number): Set<number> {
  const values = new Set<number>();
  for (const part of field.split(",")) {
    if (part === "*") {
      for (let i = min; i <= max; i++) values.add(i);
    } else if (part.includes("/")) {
      const [range, stepStr] = part.split("/");
      const start = range === "*" ? min : parseInt(range, 10);
      const step = parseInt(stepStr, 10);
      for (let i = start; i <= max; i += step) values.add(i);
    } else if (part.includes("-")) {
      const [startStr, endStr] = part.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      for (let i = start; i <= end; i++) values.add(i);
    } else {
      values.add(parseInt(part, 10));
    }
  }
  return values;
}

/** Precompute cron expression fields into lookup sets for fast matching.
 *  Called once per job (not per minute), reducing per-minute work by ~80%. */
export function precomputeCron(expression: string): CronPrecomputed | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length < 5) return null;

  const [minute, hour, dayOfMonth, month, dayOfWeek, yearField] = parts;

  return {
    minutes: parseField(minute, 0, 59),
    hours: parseField(hour, 0, 23),
    daysOfMonth: parseField(dayOfMonth, 1, 31),
    months: parseField(month, 1, 12),
    daysOfWeek: new Set(
      [...parseField(dayOfWeek, 0, 7)].map((d) => (d === 7 ? 0 : d))
    ),
    years: parseField(yearField || "*", 1970, 2099),
    dayOfMonthConstrained: dayOfMonth !== "*",
    dayOfWeekConstrained: dayOfWeek !== "*",
  };
}

/** Check if a given date matches a cron expression (all in local time).
 *  Accepts optional precomputed fields to avoid re-parsing on every call. */
export function cronMatches(
  date: Date,
  expressionOrPrecomputed: string | CronPrecomputed
): boolean {
  let precomputed: CronPrecomputed;

  if (typeof expressionOrPrecomputed === "string") {
    const parsed = precomputeCron(expressionOrPrecomputed);
    if (!parsed) return false;
    precomputed = parsed;
  } else {
    precomputed = expressionOrPrecomputed;
  }

  const {
    minutes,
    hours,
    daysOfMonth,
    months,
    daysOfWeek,
    years,
    dayOfMonthConstrained,
    dayOfWeekConstrained,
  } = precomputed;

  const dateMin = date.getMinutes();
  const dateHour = date.getHours();
  const dateDayOfMonth = date.getDate();
  const dateMonth = date.getMonth() + 1;
  const dateDayOfWeek = date.getDay();
  const dateYear = date.getFullYear();

  // Traditional cron: if both day-of-month and day-of-week are constrained, use OR
  const dayMatch = dayOfMonthConstrained && dayOfWeekConstrained
    ? daysOfMonth.has(dateDayOfMonth) || daysOfWeek.has(dateDayOfWeek)
    : daysOfMonth.has(dateDayOfMonth) && daysOfWeek.has(dateDayOfWeek);

  return (
    minutes.has(dateMin) &&
    hours.has(dateHour) &&
    months.has(dateMonth) &&
    years.has(dateYear) &&
    dayMatch
  );
}

/** Cron field sets precomputed from a cron expression for fast per-minute matching. */
export interface CronPrecomputed {
  minutes: Set<number>;
  hours: Set<number>;
  daysOfMonth: Set<number>;
  months: Set<number>;
  daysOfWeek: Set<number>;
  years: Set<number>;
  dayOfMonthConstrained: boolean;
  dayOfWeekConstrained: boolean;
}

export function expandCron(
  cronExpression: string,
  from: Date,
  to: Date
): Date[] {
  const dates: Date[] = [];
  const current = new Date(from);
  current.setSeconds(0, 0);

  const toClamped = new Date(to);
  toClamped.setSeconds(59, 999);

  while (current <= toClamped) {
    if (cronMatches(current, cronExpression)) {
      dates.push(new Date(current));
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return dates;
}

export function buildDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr ? timeStr.split(":").map(Number) : [0, 0];
  return new Date(year, month - 1, day, hour, minute);
}
