import type {
  CountryGroupSummary,
  IndexSummary,
  SourceType,
} from "../../shared/market.ts";

export type IndexConfig = IndexSummary & {
  yahooSymbol: string;
  eastmoneySecid?: string;
};

export type CountryConfig = CountryGroupSummary & {
  indices: IndexConfig[];
};

const official = "official" satisfies SourceType;
const proxy = "proxy" satisfies SourceType;

const createIndex = (
  country: Omit<CountryGroupSummary, "indices">,
  index: Omit<IndexConfig, "countryKey" | "countryName" | "countryDisplayName">,
): IndexConfig => ({
  ...index,
  countryKey: country.countryKey,
  countryName: country.countryName,
  countryDisplayName: country.displayName,
});

const createCountry = (
  country: Omit<CountryGroupSummary, "indices">,
  indices: Array<Omit<IndexConfig, "countryKey" | "countryName" | "countryDisplayName">>,
): CountryConfig => ({
  ...country,
  indices: indices.map((index) => createIndex(country, index)),
});

export const COUNTRY_GROUPS: CountryConfig[] = [
  createCountry(
    {
      countryKey: "us",
      countryName: "美国",
      displayName: "美国",
      notes: "美国市场不只看一个指数，默认同时跟踪大盘、科技、道指和全市场口径。",
    },
    [
      {
        indexKey: "us_sp500",
        displayName: "标普 500",
        benchmarkName: "S&P 500 Index",
        symbol: "^GSPC",
        yahooSymbol: "^GSPC",
        sourceType: official,
        currency: "USD",
        notes: "美国大盘核心指数，适合观察整体风险资产方向。",
      },
      {
        indexKey: "us_nasdaq100",
        displayName: "纳斯达克 100",
        benchmarkName: "NASDAQ 100 Index",
        symbol: "^NDX",
        yahooSymbol: "^NDX",
        sourceType: official,
        currency: "USD",
        notes: "科技权重更高，适合看美国成长股强弱。",
      },
      {
        indexKey: "us_dow",
        displayName: "道琼斯工业",
        benchmarkName: "Dow Jones Industrial Average",
        symbol: "^DJI",
        yahooSymbol: "^DJI",
        sourceType: official,
        currency: "USD",
        notes: "传统蓝筹代表，适合与科技风格做对照。",
      },
      {
        indexKey: "us_total_market",
        displayName: "美国全市场",
        benchmarkName: "Vanguard Total Stock Market ETF",
        symbol: "VTI",
        yahooSymbol: "VTI",
        sourceType: proxy,
        currency: "USD",
        notes: "作为全市场代理口径，补足美国宽基整体视角。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "cn_a",
      countryName: "中国 A 股",
      displayName: "中国 A 股",
      notes: "A 股建议同时看上证、深证、沪深 300、中证全指和科创板，不同风格差异很大。",
    },
    [
      {
        indexKey: "cn_shanghai",
        displayName: "上证指数",
        benchmarkName: "Shanghai Composite Index",
        symbol: "000001.SH",
        yahooSymbol: "000001.SS",
        eastmoneySecid: "1.000001",
        sourceType: official,
        currency: "CNY",
        notes: "最常见的大盘观察口径，偏传统权重股。",
      },
      {
        indexKey: "cn_shenzhen",
        displayName: "深证成指",
        benchmarkName: "Shenzhen Component Index",
        symbol: "399001.SZ",
        yahooSymbol: "399001.SZ",
        eastmoneySecid: "0.399001",
        sourceType: official,
        currency: "CNY",
        notes: "更偏成长和制造链，可和上证形成风格对照。",
      },
      {
        indexKey: "cn_csi300",
        displayName: "沪深 300",
        benchmarkName: "CSI 300 Index",
        symbol: "000300.SH",
        yahooSymbol: "000300.SS",
        eastmoneySecid: "1.000300",
        sourceType: official,
        currency: "CNY",
        notes: "机构最常用核心宽基之一，代表大盘核心资产。",
      },
      {
        indexKey: "cn_all_share",
        displayName: "中证全指",
        benchmarkName: "CSI All Share Index",
        symbol: "000985.SH",
        yahooSymbol: "000985.SS",
        eastmoneySecid: "1.000985",
        sourceType: official,
        currency: "CNY",
        notes: "更完整的 A 股整体口径，用来看全市场更合适。",
      },
      {
        indexKey: "cn_star50",
        displayName: "科创 50",
        benchmarkName: "STAR 50 Index",
        symbol: "000688.SH",
        yahooSymbol: "000688.SS",
        eastmoneySecid: "1.000688",
        sourceType: official,
        currency: "CNY",
        notes: "代表 A 股高研发和硬科技方向，波动通常更大。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "hk",
      countryName: "中国香港",
      displayName: "中国香港",
      notes: "港股当前保留主指数和两类 ETF 代理，兼顾大盘、科技和宽基观察。",
    },
    [
      {
        indexKey: "hk_hsi",
        displayName: "恒生指数",
        benchmarkName: "Hang Seng Index",
        symbol: "^HSI",
        yahooSymbol: "^HSI",
        sourceType: official,
        currency: "HKD",
        notes: "港股最核心的大盘口径。",
      },
      {
        indexKey: "hk_hstech_proxy",
        displayName: "恒生科技代理",
        benchmarkName: "Hang Seng TECH ETF",
        symbol: "3032.HK",
        yahooSymbol: "3032.HK",
        sourceType: proxy,
        currency: "HKD",
        notes: "免费长历史下用 ETF 代理恒生科技风格。",
      },
      {
        indexKey: "hk_tracker_proxy",
        displayName: "盈富基金代理",
        benchmarkName: "Tracker Fund of Hong Kong",
        symbol: "2800.HK",
        yahooSymbol: "2800.HK",
        sourceType: proxy,
        currency: "HKD",
        notes: "可作为港股宽基 ETF 代理，用来补主指数视角。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "tw",
      countryName: "中国台湾",
      displayName: "中国台湾",
      notes: "台湾市场当前同时跟踪加权指数和 50 指数代理。",
    },
    [
      {
        indexKey: "tw_twii",
        displayName: "台湾加权",
        benchmarkName: "TWSE Capitalization Weighted Stock Index",
        symbol: "^TWII",
        yahooSymbol: "^TWII",
        sourceType: official,
        currency: "TWD",
        notes: "台湾市场主指数，适合观察整体电子周期。",
      },
      {
        indexKey: "tw_top50_proxy",
        displayName: "台湾 50 代理",
        benchmarkName: "元大台湾 50 ETF",
        symbol: "0050.TW",
        yahooSymbol: "0050.TW",
        sourceType: proxy,
        currency: "TWD",
        notes: "用 ETF 代理台湾核心龙头表现。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "jp",
      countryName: "日本",
      displayName: "日本",
      notes: "日本当前保留日经 225 和 TOPIX ETF 代理，兼顾价格型大盘与更宽市场口径。",
    },
    [
      {
        indexKey: "jp_nikkei225",
        displayName: "日经 225",
        benchmarkName: "Nikkei 225 Index",
        symbol: "^N225",
        yahooSymbol: "^N225",
        sourceType: official,
        currency: "JPY",
        notes: "日本最常被引用的大盘指数，适合看核心龙头和出口周期。",
      },
      {
        indexKey: "jp_topix_proxy",
        displayName: "TOPIX 代理",
        benchmarkName: "TOPIX ETF",
        symbol: "1306.T",
        yahooSymbol: "1306.T",
        sourceType: proxy,
        currency: "JPY",
        notes: "用 ETF 代理更宽的日本股票市场口径，补足日经 225 的窄样本问题。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "kr",
      countryName: "韩国",
      displayName: "韩国",
      notes: "韩国当前保留 KOSPI 和 KOSDAQ，分别观察大盘权重股与成长科技风格。",
    },
    [
      {
        indexKey: "kr_kospi",
        displayName: "KOSPI",
        benchmarkName: "Korea Composite Stock Price Index",
        symbol: "^KS11",
        yahooSymbol: "^KS11",
        sourceType: official,
        currency: "KRW",
        notes: "韩国主板核心指数，适合观察三星等权重股驱动的大盘表现。",
      },
      {
        indexKey: "kr_kosdaq",
        displayName: "KOSDAQ",
        benchmarkName: "KOSDAQ Index",
        symbol: "^KQ11",
        yahooSymbol: "^KQ11",
        sourceType: official,
        currency: "KRW",
        notes: "韩国成长和中小盘风格更强，可与 KOSPI 形成风格对照。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "au",
      countryName: "澳大利亚",
      displayName: "澳大利亚",
      notes: "澳股同时保留 All Ordinaries 和 ASX 200 两种主流口径。",
    },
    [
      {
        indexKey: "au_allord",
        displayName: "All Ordinaries",
        benchmarkName: "All Ordinaries Index",
        symbol: "^AORD",
        yahooSymbol: "^AORD",
        sourceType: official,
        currency: "AUD",
        notes: "更宽的澳股市场口径。",
      },
      {
        indexKey: "au_asx200",
        displayName: "ASX 200",
        benchmarkName: "S&P/ASX 200 Index",
        symbol: "^AXJO",
        yahooSymbol: "^AXJO",
        sourceType: official,
        currency: "AUD",
        notes: "澳大利亚最常用的大盘指数。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "mx",
      countryName: "墨西哥",
      displayName: "墨西哥",
      notes: "墨西哥当前保留官方 IPC 指数和美国上市 ETF 代理。",
    },
    [
      {
        indexKey: "mx_ipc",
        displayName: "墨西哥 IPC",
        benchmarkName: "S&P/BMV IPC",
        symbol: "^MXX",
        yahooSymbol: "^MXX",
        sourceType: official,
        currency: "MXN",
        notes: "墨西哥最主流的本土指数口径。",
      },
      {
        indexKey: "mx_eww_proxy",
        displayName: "墨西哥 ETF 代理",
        benchmarkName: "iShares MSCI Mexico ETF",
        symbol: "EWW",
        yahooSymbol: "EWW",
        sourceType: proxy,
        currency: "USD",
        notes: "用海外 ETF 补一个美元计价观察视角。",
      },
    ],
  ),
  createCountry(
    {
      countryKey: "vn",
      countryName: "越南",
      displayName: "越南",
      notes: "越南免费长期官方接口较弱，当前先保留代理口径，后续可继续补。",
    },
    [
      {
        indexKey: "vn_vnm_proxy",
        displayName: "越南宽基代理",
        benchmarkName: "VanEck Vietnam ETF",
        symbol: "VNM",
        yahooSymbol: "VNM",
        sourceType: proxy,
        currency: "USD",
        notes: "越南目前先用可持续更新的 ETF 代理口径。",
      },
    ],
  ),
];

export const INDEX_DATA: IndexConfig[] = COUNTRY_GROUPS.flatMap(
  (country) => country.indices,
);
