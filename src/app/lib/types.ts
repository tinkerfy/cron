export interface CronJob {
  schedule: string;
  minutes: string;
  hours: string;
  days: string;
  weeks: string;
  months: string;
  years: string;
  server: string | null;
  compositeServiceName: string | null;
  status: boolean;
  scheduler: string | null;
}

/** Wire format — dates sent as integer timestamps (ms since epoch). */
export interface MatchedJob {
  job: CronJob;
  matchedDates: number[];
  totalCount: number;
}

/** Display format — dates as Date objects after client-side deserialization. */
export interface MatchedJobDisplay {
  job: CronJob;
  matchedDates: Date[];
  totalCount: number;
}

export interface CronJobRow {
  minutes: string;
  hours: string;
  days: string;
  months: string;
  weeks: string;
  years: string;
  server: string | null;
  compositeservicename: string | null;
  status: string;
  scheduler: string | null;
}

export interface PaginatedResponse<T> {
  jobs: T[];
  total: number;
  page: number;
  pageSize: number;
  servers?: string[];
}
