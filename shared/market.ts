export type SourceType = "official" | "proxy";
export type DataStatus = "live" | "snapshot";
export type LiveMode = "near_real_time" | "daily_snapshot";

export type CountrySummary = {
  countryKey: string;
  countryName: string;
  displayName: string;
  notes?: string;
};

export type IndexSummary = {
  indexKey: string;
  countryKey: string;
  countryName: string;
  countryDisplayName: string;
  displayName: string;
  benchmarkName: string;
  symbol: string;
  sourceType: SourceType;
  currency: string;
  notes?: string;
};

export type TimelinePoint = {
  date: string;
  close: number;
};

export type YearPerformance = {
  year: number;
  openReferenceDate: string;
  closeReferenceDate: string;
  openPrice: number;
  closePrice: number;
  annualReturnPct: number;
  isYtd?: boolean;
};

export type CountryGroupSummary = CountrySummary & {
  indices: IndexSummary[];
};

export type IndexOverview = IndexSummary & {
  inceptionDate: string;
  latestPrice: number;
  latestPriceDate: string;
  sinceInceptionReturnPct: number;
  oneYearReturnPct: number | null;
  updatedAt: string;
  liveMode: LiveMode;
};

export type MarketPerformanceResponse = IndexOverview & {
  years: 5 | 10;
  yearsListed: number;
  latestAnnualReturnPct: number | null;
  yearly: YearPerformance[];
  timeline: TimelinePoint[];
  timelinePreview: TimelinePoint[];
  dataStatus: DataStatus;
};

export type CompareItem = IndexOverview & {
  latestAnnualReturnPct: number | null;
  yearly: Array<Pick<YearPerformance, "year" | "annualReturnPct" | "isYtd">>;
  timelinePreview: TimelinePoint[];
};

export type MarketsResponse = {
  updatedAt: string;
  countries: CountryGroupSummary[];
  dataStatus: DataStatus;
};

export type CompareResponse = {
  years: 5 | 10;
  countryKeys: string[];
  items: CompareItem[];
  updatedAt: string;
  dataStatus: DataStatus;
};
