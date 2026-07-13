import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COUNTRY_GROUPS, INDEX_DATA } from "../api/data/marketData.ts";
import {
  compareMarkets,
  getMarketPerformance,
  listMarkets,
} from "../api/services/marketService.ts";
import type {
  CompareResponse,
  MarketPerformanceResponse,
  MarketsResponse,
} from "../shared/market.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const dataDir = path.join(publicDir, "data");

function toSnapshotMarkets(payload: MarketsResponse): MarketsResponse {
  return {
    ...payload,
    dataStatus: "snapshot",
    updatedAt: new Date().toISOString(),
  };
}

function toSnapshotMarketPerformance(
  payload: MarketPerformanceResponse,
): MarketPerformanceResponse {
  return {
    ...payload,
    dataStatus: "snapshot",
    liveMode: "daily_snapshot",
    updatedAt: new Date().toISOString(),
  };
}

function toSnapshotCompare(payload: CompareResponse): CompareResponse {
  return {
    ...payload,
    dataStatus: "snapshot",
    updatedAt: new Date().toISOString(),
    items: payload.items.map((item) => ({
      ...item,
      liveMode: "daily_snapshot",
      updatedAt: new Date().toISOString(),
    })),
  };
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  await rm(dataDir, { recursive: true, force: true });

  const markets = toSnapshotMarkets(await listMarkets());
  await writeJson(path.join(dataDir, "markets.json"), markets);

  const allCountryKeys = COUNTRY_GROUPS.map((country) => country.countryKey);

  for (const years of [5, 10] as const) {
    const compare = toSnapshotCompare(
      await compareMarkets(allCountryKeys, years),
    );
    await writeJson(path.join(dataDir, "compare", `${years}.json`), compare);

    for (const index of INDEX_DATA) {
      const performance = await getMarketPerformance(index.indexKey, years);

      if (!performance) {
        continue;
      }

      await writeJson(
        path.join(dataDir, "market", index.indexKey, `${years}.json`),
        toSnapshotMarketPerformance(performance),
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
