type YahooChartResult = {
  chart: {
    result?: Array<{
      meta?: {
        firstTradeDate?: number;
        regularMarketPrice?: number;
        regularMarketTime?: number;
      };
      timestamp?: number[];
      indicators?: {
        adjclose?: Array<{ adjclose?: Array<number | null> }>;
        quote?: Array<{ close?: Array<number | null> }>;
      };
    }>;
    error?: {
      description?: string;
    } | null;
  };
};

export type PricePoint = {
  date: string;
  close: number;
};

type CachedValue = {
  expiresAt: number;
  value: {
    firstTradeDate: string;
    latestPrice: number;
    latestPriceDate: string;
    updatedAt: string;
    points: PricePoint[];
  };
};

const cache = new Map<string, CachedValue>();
const TTL_MS = 1000 * 60 * 5;

const round = (value: number) => Number(value.toFixed(2));

const buildCacheKey = (symbol: string, interval: string, range: string) =>
  `${symbol}:${interval}:${range}`;

export async function fetchYahooHistory(
  symbol: string,
  interval = "1d",
  range = "max",
) {
  const cacheKey = buildCacheKey(symbol, interval, range);
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplits`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`行情源请求失败：${response.status}`);
  }

  const payload = (await response.json()) as YahooChartResult;
  const result = payload.chart.result?.[0];
  const error = payload.chart.error?.description;

  if (!result || error) {
    throw new Error(error || `无法获取 ${symbol} 的历史行情`);
  }

  const timestamps = result.timestamp ?? [];
  const closes =
    result.indicators?.adjclose?.[0]?.adjclose ??
    result.indicators?.quote?.[0]?.close ??
    [];

  const points = timestamps
    .map((timestamp, index) => {
      const close = closes[index];
      if (typeof close !== "number" || !Number.isFinite(close)) {
        return null;
      }

      return {
        date: new Date(timestamp * 1000).toISOString().slice(0, 10),
        close: round(close),
      };
    })
    .filter((item): item is PricePoint => Boolean(item));

  if (!points.length) {
    throw new Error(`未拿到 ${symbol} 的有效收盘数据`);
  }

  const latestPoint = points[points.length - 1];
  const latestPrice =
    typeof result.meta?.regularMarketPrice === "number" &&
    Number.isFinite(result.meta.regularMarketPrice)
      ? round(result.meta.regularMarketPrice)
      : latestPoint.close;
  const latestPriceDate =
    typeof result.meta?.regularMarketTime === "number"
      ? new Date(result.meta.regularMarketTime * 1000).toISOString()
      : `${latestPoint.date}T00:00:00.000Z`;

  const value = {
    firstTradeDate:
      typeof result.meta?.firstTradeDate === "number"
        ? new Date(result.meta.firstTradeDate * 1000).toISOString().slice(0, 10)
        : points[0].date,
    latestPrice,
    latestPriceDate,
    updatedAt: new Date().toISOString(),
    points,
  };

  cache.set(cacheKey, {
    expiresAt: now + TTL_MS,
    value,
  });

  return value;
}
