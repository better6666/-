import type {
  CompareResponse,
  MarketPerformanceResponse,
  MarketsResponse,
} from "@shared/market";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const fetchMarkets = () => request<MarketsResponse>("/api/markets");

export const fetchMarketPerformance = (marketKey: string, years: 5 | 10) =>
  request<MarketPerformanceResponse>(
    `/api/market/${marketKey}/performance?years=${years}`,
  );

export const fetchCompare = (marketKeys: string[], years: 5 | 10) =>
  request<CompareResponse>(
    `/api/markets/compare?countries=${marketKeys.join(",")}&years=${years}`,
  );
