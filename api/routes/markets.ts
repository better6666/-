import { Router, type Request, type Response } from "express";
import {
  compareMarkets,
  getMarketPerformance,
  listMarkets,
} from "../services/marketService.ts";

const router = Router();

const parseYears = (rawYears: unknown): 5 | 10 => {
  const years = Number(rawYears);
  return years === 5 ? 5 : 10;
};

router.get("/", async (_req: Request, res: Response) => {
  res.json(await listMarkets());
});

router.get("/compare", async (req: Request, res: Response) => {
  const rawCountries =
    typeof req.query.countries === "string"
      ? req.query.countries
      : typeof req.query.markets === "string"
        ? req.query.markets
        : "";
  const countryKeys = rawCountries
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (countryKeys.length === 0) {
    res.status(400).json({
      success: false,
      error: "countries 参数不能为空",
    });
    return;
  }

  try {
    res.json(await compareMarkets(countryKeys, parseYears(req.query.years)));
  } catch (error) {
    res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "对比数据获取失败",
    });
  }
});

router.get("/:marketKey/performance", async (req: Request, res: Response) => {
  try {
    const result = await getMarketPerformance(
      req.params.marketKey,
      parseYears(req.query.years),
    );

    if (!result) {
      res.status(404).json({
        success: false,
        error: "未找到对应市场",
      });
      return;
    }

    res.json(result);
  } catch (error) {
    res.status(502).json({
      success: false,
      error: error instanceof Error ? error.message : "市场数据获取失败",
    });
  }
});

export default router;
