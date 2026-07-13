import type { CompareItem } from "@shared/market";
import { ArrowRight, BadgeInfo } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatNumber, formatPct, textTone } from "@/lib/format";
import LineChart from "@/components/LineChart";

export default function MarketCard({
  item,
}: {
  item: CompareItem;
}) {
  const latest = item.yearly[item.yearly.length - 1];

  return (
    <article className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-lg shadow-black/20 backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan-200/70">
            {item.countryDisplayName} · {item.currency} · {item.sourceType === "official" ? "官方口径" : "代理口径"}
          </p>
          <h3 className="text-lg font-semibold text-white">{item.displayName}</h3>
          <p className="mt-1 text-sm text-slate-400">{item.benchmarkName}</p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-slate-300">
          {item.symbol}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <LineChart points={item.timelinePreview} className="h-40" />
        <div className="grid grid-cols-2 gap-3">
          <Metric label="最新点位" value={formatNumber(item.latestPrice)} />
          <Metric label="最近一年" value={formatPct(item.oneYearReturnPct)} tone={textTone(item.oneYearReturnPct)} />
          <Metric label="发布以来" value={formatPct(item.sinceInceptionReturnPct)} tone={textTone(item.sinceInceptionReturnPct)} />
          <Metric
            label={latest?.isYtd ? `${latest.year} YTD` : "最近年度"}
            value={formatPct(latest?.annualReturnPct)}
            tone={textTone(latest?.annualReturnPct)}
          />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-cyan-300/10 bg-cyan-300/5 p-3 text-xs text-slate-300">
        <BadgeInfo className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
        <p>{item.notes}</p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>发布起点：{formatDate(item.inceptionDate)}</span>
        <span>更新：{formatDate(item.latestPriceDate)}</span>
      </div>

      <Link
        to={`/market/${item.indexKey}`}
        className="mt-5 inline-flex items-center gap-2 text-sm text-cyan-100 transition hover:text-white"
      >
        查看详情
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-base ${tone ?? "text-white"}`}>{value}</p>
    </div>
  );
}
