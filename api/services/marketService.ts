import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRY_GROUPS, INDEX_DATA } from "../data/marketData.ts";
import { fetchYahooHistory, type PricePoint } from "./yahooChartService.ts";
import { fetchEastmoneyHistory } from "./eastmoneyChartService.ts";
import type {
  CompareItem,
  CompareResponse,
  MarketsResponse,
  MarketPerformanceResponse,
  TimelinePoint,
  YearPerformance,
} from "../../shared/market.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fallbackMarketDir = path.resolve(__dirname, "../data/fallback-market");
const round = (value: number) => Number(value.toFixed(2));

function findIndex(indexKey: string) {
  return INDEX_DATA.find((item) => item.indexKey === indexKey);
}

function pickReferencePoint(points: PricePoint[], targetDate: Date) {
  const targetTime = targetDate.getTime();

  for (let index = points.length - 1; index >= 0; index -= 1) {
    const pointTime = new Date(points[index].date).getTime();
    if (pointTime <= targetTime) {
      return points[index];
    }
  }

  return points[0];
}

function toMonthlyTimeline(points: PricePoint[]): TimelinePoint[] {
  const monthly = new Map<string, TimelinePoint>();

  points.forEach((point) => {
    monthly.set(point.date.slice(0, 7), point);
  });

  return Array.from(monthly.values());
}

function toPreviewTimeline(points: TimelinePoint[]) {
  if (points.length <= 72) {
    return points;
  }

  const step = Math.ceil(points.length / 72);
  return points.filter((_, index) => index % step === 0 || index === points.length - 1);
}

function toYearlyPerformance(points: PricePoint[], years: 5 | 10): YearPerformance[] {
  const byYear = new Map<number, PricePoint>();

  points.forEach((point) => {
    byYear.set(Number(point.date.slice(0, 4)), point);
  });

  const yearEnds = Array.from(byYear.entries())
    .map(([year, point]) => ({ year, point }))
    .sort((left, right) => left.year - right.year);

  const yearly: YearPerformance[] = [];

  for (let index = 1; index < yearEnds.length; index += 1) {
    const previous = yearEnds[index - 1];
    const current = yearEnds[index];

    yearly.push({
      year: current.year,
      openReferenceDate: previous.point.date,
      closeReferenceDate: current.point.date,
      openPrice: previous.point.close,
      closePrice: current.point.close,
      annualReturnPct: round(((current.point.close / previous.point.close) - 1) * 100),
    });
  }

  const latestPoint = points[points.length - 1];
  const latestYear = Number(latestPoint.date.slice(0, 4));
  const lastAnnual = yearly[yearly.length - 1];

  if (lastAnnual && lastAnnual.year !== latestYear) {
    const previousYearClose = yearEnds[yearEnds.length - 1];
    yearly.push({
      year: latestYear,
      openReferenceDate: previousYearClose.point.date,
      closeReferenceDate: latestPoint.date,
      openPrice: previousYearClose.point.close,
      closePrice: latestPoint.close,
      annualReturnPct: round(((latestPoint.close / previousYearClose.point.close) - 1) * 100),
      isYtd: true,
    });
  } else if (lastAnnual) {
    lastAnnual.isYtd = true;
    lastAnnual.closeReferenceDate = latestPoint.date;
    lastAnnual.closePrice = latestPoint.close;
    lastAnnual.annualReturnPct = round(
      ((latestPoint.close / lastAnnual.openPrice) - 1) * 100,
    );
  }

  const fullYears = yearly.filter((item) => !item.isYtd);
  const ytd = yearly.find((item) => item.isYtd);
  const selected = fullYears.slice(-years);

  return ytd ? [...selected, ytd] : selected;
}

function yearsBetween(startDate: string, endDate: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return round((end - start) / (1000 * 60 * 60 * 24 * 365.25));
}

function hasEnoughHistory(points: PricePoint[], minimumPoints = 30) {
  return points.length >= minimumPoints;
}

async function loadFallbackMarketPerformance(indexKey: string, years: 5 | 10) {
  try {
    const filePath = path.join(fallbackMarketDir, indexKey, `${years}.json`);
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as MarketPerformanceResponse;
  } catch {
    return null;
  }
}

async function fetchIndexHistory(index: NonNullable<ReturnType<typeof findIndex>>) {
  if (!index.eastmoneySecid) {
    return fetchYahooHistory(index.yahooSymbol);
  }

  try {
    return await fetchEastmoneyHistory(index.eastmoneySecid, index.symbol);
  } catch (eastmoneyError) {
    const yahooHistory = await fetchYahooHistory(index.yahooSymbol);

    if (hasEnoughHistory(yahooHistory.points)) {
      return yahooHistory;
    }

    throw new Error(
      `${index.displayName} 历史数据不足：东方财富不可用，Yahoo 仅返回 ${yahooHistory.points.length} 个点。原始错误：${
        eastmoneyError instanceof Error ? eastmoneyError.message : String(eastmoneyError)
      }`,
    );
  }
}

async function buildIndexOverview(indexKey: string, years: 5 | 10) {
  const index = findIndex(indexKey);

  if (!index) {
    return null;
  }

  const history = await fetchIndexHistory(index);
  const timeline = toMonthlyTimeline(history.points);
  const previewTimeline = toPreviewTimeline(timeline);
  const firstPoint = history.points[0];
  const latestPoint = history.points[history.points.length - 1];
  const oneYearReference = pickReferencePoint(
    history.points,
    new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
  );
  const yearly = toYearlyPerformance(history.points, years);

  return {
    indexKey: index.indexKey,
    countryKey: index.countryKey,
    countryName: index.countryName,
    countryDisplayName: index.countryDisplayName,
    displayName: index.displayName,
    benchmarkName: index.benchmarkName,
    symbol: index.symbol,
    sourceType: index.sourceType,
    currency: index.currency,
    notes: index.notes,
    inceptionDate: history.firstTradeDate || firstPoint.date,
    latestPrice: history.latestPrice,
    latestPriceDate: history.latestPriceDate,
    sinceInceptionReturnPct: round(
      ((history.latestPrice / firstPoint.close) - 1) * 100,
    ),
    oneYearReturnPct: oneYearReference
      ? round(((history.latestPrice / oneYearReference.close) - 1) * 100)
      : null,
    updatedAt: history.updatedAt,
    liveMode: "near_real_time" as const,
    yearsListed: yearsBetween(firstPoint.date, latestPoint.date),
    latestAnnualReturnPct:
      yearly.length > 0 ? yearly[yearly.length - 1].annualReturnPct : null,
    yearly,
    timeline,
    timelinePreview: previewTimeline,
  };
}

export async function listMarkets(): Promise<MarketsResponse> {
  return {
    updatedAt: new Date().toISOString(),
    dataStatus: "live",
    countries: COUNTRY_GROUPS.map((country) => ({
      countryKey: country.countryKey,
      countryName: country.countryName,
      displayName: country.displayName,
      notes: country.notes,
      indices: country.indices.map(
        ({
          indexKey,
          countryKey,
          countryName,
          countryDisplayName,
          displayName,
          benchmarkName,
          symbol,
          sourceType,
          currency,
          notes,
        }) => ({
          indexKey,
          countryKey,
          countryName,
          countryDisplayName,
          displayName,
          benchmarkName,
          symbol,
          sourceType,
          currency,
          notes,
        }),
      ),
    })),
  };
}

export async function getMarketPerformance(
  indexKey: string,
  years: 5 | 10,
): Promise<MarketPerformanceResponse | null> {
  let overview: Awaited<ReturnType<typeof buildIndexOverview>>;

  try {
    overview = await buildIndexOverview(indexKey, years);
  } catch {
    const fallback = await loadFallbackMarketPerformance(indexKey, years);
    return fallback;
  }

  if (!overview) {
    return null;
  }

  return {
    ...overview,
    years,
    dataStatus: "live",
  };
}

export async function compareMarkets(
  countryKeys: string[],
  years: 5 | 10,
): Promise<CompareResponse> {
  const indexKeys = COUNTRY_GROUPS.filter((country) =>
    countryKeys.includes(country.countryKey),
  ).flatMap((country) => country.indices.map((index) => index.indexKey));

  const results = await Promise.all(
    indexKeys.map((indexKey) => getMarketPerformance(indexKey, years)),
  );

  const performances = results.filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );

  const items = performances.map<CompareItem>((item) => ({
    indexKey: item.indexKey,
    countryKey: item.countryKey,
    countryName: item.countryName,
    countryDisplayName: item.countryDisplayName,
    displayName: item.displayName,
    benchmarkName: item.benchmarkName,
    symbol: item.symbol,
    sourceType: item.sourceType,
    currency: item.currency,
    notes: item.notes,
    inceptionDate: item.inceptionDate,
    latestPrice: item.latestPrice,
    latestPriceDate: item.latestPriceDate,
    sinceInceptionReturnPct: item.sinceInceptionReturnPct,
    oneYearReturnPct: item.oneYearReturnPct,
    updatedAt: item.updatedAt,
    liveMode: item.liveMode,
    latestAnnualReturnPct: item.latestAnnualReturnPct,
    yearly: item.yearly.map(({ year, annualReturnPct, isYtd }) => ({
      year,
      annualReturnPct,
      isYtd,
    })),
    timelinePreview: item.timelinePreview,
  }));

  return {
    years,
    countryKeys,
    items,
    updatedAt: new Date().toISOString(),
    dataStatus: performances.some((item) => item.dataStatus === "snapshot")
      ? "snapshot"
      : "live",
  };
}
