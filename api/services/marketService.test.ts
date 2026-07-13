import test from "node:test";
import assert from "node:assert/strict";
import {
  compareMarkets,
  getMarketPerformance,
  listMarkets,
} from "./marketService.ts";

test("列出市场时返回首批覆盖市场", async () => {
  const result = await listMarkets();

  assert.equal(result.countries.length, 7);
  assert.equal(result.dataStatus, "live");
  assert.equal(result.countries[0]?.countryKey, "us");
  assert.ok((result.countries[0]?.indices.length ?? 0) > 1);
});

test("单市场接口返回发布以来与当前年度数据", async () => {
  const result = await getMarketPerformance("us_sp500", 5);

  assert.ok(result);
  assert.ok(result?.timelinePreview.length);
  assert.ok(typeof result?.latestPrice === "number");
  assert.ok(result?.inceptionDate);
  assert.ok(result?.yearly.length >= 5);
});

test("A 股宽基指数返回完整长历史", async () => {
  const result = await getMarketPerformance("cn_csi300", 10);

  assert.ok(result);
  assert.equal(result?.symbol, "000300.SH");
  assert.ok((result?.timeline.length ?? 0) > 200);
  assert.ok((result?.yearsListed ?? 0) > 10);
  assert.ok((result?.latestPrice ?? 0) > 0);
});

test("对比接口只返回请求到的市场", async () => {
  const result = await compareMarkets(["tw", "vn"], 10);

  assert.equal(result.countryKeys.length, 2);
  assert.deepEqual(result.countryKeys, ["tw", "vn"]);
  assert.ok(result.items.every((item) => ["tw", "vn"].includes(item.countryKey)));
  assert.ok(result.items[0]?.oneYearReturnPct !== undefined);
});
