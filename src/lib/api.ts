import type {
  CompareResponse,
  MarketPerformanceResponse,
  MarketsResponse,
} from "@shared/market";

const isStaticDataMode = import.meta.env.VITE_DATA_MODE === "static";
const baseUrl = import.meta.env.BASE_URL;

async function request<T>(path: string): Promise<T> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const fetchMarkets = () =>
  request<MarketsResponse>(
    isStaticDataMode ? `${baseUrl}data/markets.json` : "/api/markets",
  );

export const fetchMarketPerformance = (marketKey: string, years: 5 | 10) =>
  request<MarketPerformanceResponse>(isStaticDataMode
    ? `${baseUrl}data/market/${marketKey}/${years}.json`
    : `/api/market/${marketKey}/performance?years=${years}`);

export const fetchCompare = async (marketKeys: string[], years: 5 | 10) => {
  if (!isStaticDataMode) {
    return request<CompareResponse>(
      `/api/markets/compare?countries=${marketKeys.join(",")}&years=${years}`,
    );
  }

  const fullResponse = await request<CompareResponse>(
    `${baseUrl}data/compare/${years}.json`,
  );

  return {
    ...fullResponse,
    countryKeys: marketKeys,
    items: fullResponse.items.filter((item) => marketKeys.includes(item.countryKey)),
  };
};
