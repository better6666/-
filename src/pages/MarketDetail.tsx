import type { MarketPerformanceResponse } from "@shared/market";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeInfo, Radio } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import LineChart from "@/components/LineChart";
import PeriodToggle from "@/components/PeriodToggle";
import { fetchMarketPerformance } from "@/lib/api";
import { formatDate, formatNumber, formatPct, textTone } from "@/lib/format";
import { useDashboardStore } from "@/store/dashboardStore";

export default function MarketDetail() {
  const { marketKey = "" } = useParams();
  const years = useDashboardStore((state) => state.years);
  const setYears = useDashboardStore((state) => state.setYears);
  const [data, setData] = useState<MarketPerformanceResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    fetchMarketPerformance(marketKey, years)
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, [marketKey, years]);

  if (error) {
    return <StateBox label={error} />;
  }

  if (!data) {
    return <StateBox label="正在加载市场详情..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回总览
          </Link>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
            {data.countryDisplayName} · {data.currency} · {data.sourceType === "official" ? "官方口径" : "代理口径"}
          </p>
          <h2 className="mt-3 font-serif text-4xl text-white">{data.displayName}</h2>
          <p className="mt-2 text-slate-300">{data.benchmarkName}</p>
        </div>
        <PeriodToggle value={years} onChange={setYears} />
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">发布以来走势</h3>
              <p className="mt-1 text-sm text-slate-400">
                从 {formatDate(data.inceptionDate)} 到 {formatDate(data.latestPriceDate)}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
              <Radio className="h-3.5 w-3.5" />
              {data.liveMode === "daily_snapshot" ? "定时刷新" : "实时更新"}
            </span>
          </div>
          <LineChart points={data.timelinePreview} className="h-72" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <InfoCard label="指数代码" value={data.symbol} mono />
          <InfoCard label="最新点位" value={formatNumber(data.latestPrice)} mono />
          <InfoCard label="最近一年涨幅" value={formatPct(data.oneYearReturnPct)} mono tone={textTone(data.oneYearReturnPct)} />
          <InfoCard label="发布以来涨幅" value={formatPct(data.sinceInceptionReturnPct)} mono tone={textTone(data.sinceInceptionReturnPct)} />
          <InfoCard label="已上市年限" value={`${data.yearsListed} 年`} mono />
          <InfoCard
            label={data.latestAnnualReturnPct !== null ? "最近年度 / YTD" : "最近年度 / YTD"}
            value={formatPct(data.latestAnnualReturnPct)}
            mono
            tone={textTone(data.latestAnnualReturnPct)}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4 flex items-start gap-3">
          <BadgeInfo className="mt-1 h-5 w-5 text-cyan-100" />
          <div>
            <h3 className="text-lg font-semibold text-white">口径说明</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">{data.notes}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">年度收益表</h3>
          <p className="mt-1 text-sm text-slate-400">
            这里继续保留近 {years} 年的年度变化，方便看长期走势里的阶段节奏。
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">年份</th>
                <th className="px-4 py-3 text-right">参考起点</th>
                <th className="px-4 py-3 text-right">参考终点</th>
                <th className="px-4 py-3 text-right">起始价</th>
                <th className="px-4 py-3 text-right">收盘价</th>
                <th className="px-4 py-3 text-right">年度涨幅</th>
              </tr>
            </thead>
            <tbody>
              {data.yearly.map((item) => (
                <tr key={item.year} className="border-t border-white/5">
                  <td className="px-4 py-4 text-white">
                    {item.year}
                    {item.isYtd ? (
                      <span className="ml-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                        YTD
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-slate-300">
                    {item.openReferenceDate}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-slate-300">
                    {item.closeReferenceDate}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-white">
                    {formatNumber(item.openPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-white">
                    {formatNumber(item.closePrice)}
                  </td>
                  <td className={`px-4 py-4 text-right font-mono ${textTone(item.annualReturnPct)}`}>
                    {formatPct(item.annualReturnPct)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 text-lg ${mono ? "font-mono" : ""} ${tone ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function StateBox({ label }: { label: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-300">
      {label}
    </div>
  );
}
