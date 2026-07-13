import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { HistoricalSeries, PricePoint } from "./yahooChartService.ts";

type EastmoneyResponse = {
  rc?: number;
  data?: {
    code?: string;
    name?: string;
    klines?: string[];
  } | null;
};

type CachedValue = {
  expiresAt: number;
  value: HistoricalSeries;
};

const cache = new Map<string, CachedValue>();
const TTL_MS = 1000 * 60 * 5;
const execFileAsync = promisify(execFile);

const round = (value: number) => Number(value.toFixed(2));

function parseKlinePoint(kline: string): PricePoint | null {
  const parts = kline.split(",");
  const date = parts[0];
  const close = Number(parts[2]);

  if (!date || !Number.isFinite(close)) {
    return null;
  }

  return {
    date,
    close: round(close),
  };
}

function buildEastmoneyUrl(secid: string) {
  return `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${encodeURIComponent(secid)}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58&klt=101&fqt=0&beg=0&end=20500000`;
}

async function requestByFetch(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      Accept: "application/json",
      Referer: "https://quote.eastmoney.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`东方财富行情源请求失败：${response.status}`);
  }

  return (await response.json()) as EastmoneyResponse;
}

async function requestByCurl(url: string) {
  const { stdout } = await execFileAsync("curl", [
    "-L",
    "-s",
    "-H",
    "User-Agent: Mozilla/5.0",
    "-H",
    "Accept: application/json",
    "-H",
    "Referer: https://quote.eastmoney.com/",
    url,
  ]);

  return JSON.parse(stdout) as EastmoneyResponse;
}

export async function fetchEastmoneyHistory(secid: string, symbol: string) {
  const cacheKey = `eastmoney:${secid}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const url = buildEastmoneyUrl(secid);
  let payload: EastmoneyResponse;

  try {
    payload = await requestByFetch(url);
  } catch {
    payload = await requestByCurl(url);
  }

  const rawPoints = payload.data?.klines ?? [];
  const points = rawPoints
    .map((item) => parseKlinePoint(item))
    .filter((item): item is PricePoint => Boolean(item));

  if (!points.length) {
    throw new Error(`未拿到 ${symbol} 的有效 A 股历史收盘数据`);
  }

  const latestPoint = points[points.length - 1];
  const value: HistoricalSeries = {
    firstTradeDate: points[0].date,
    latestPrice: latestPoint.close,
    latestPriceDate: `${latestPoint.date}T00:00:00.000Z`,
    updatedAt: new Date().toISOString(),
    points,
  };

  cache.set(cacheKey, {
    expiresAt: now + TTL_MS,
    value,
  });

  return value;
}
