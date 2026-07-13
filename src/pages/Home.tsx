import type {
  CompareItem,
  CompareResponse,
  CountrySummary,
  MarketsResponse,
} from "@shared/market";
import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, DatabaseZap, Layers3, TrendingUp } from "lucide-react";
import HeatmapTable from "@/components/HeatmapTable";
import MarketCard from "@/components/MarketCard";
import MarketFilter from "@/components/MarketFilter";
import PeriodToggle from "@/components/PeriodToggle";
import { fetchCompare, fetchMarkets } from "@/lib/api";
import { formatDate, formatPct, textTone } from "@/lib/format";
import { useDashboardStore } from "@/store/dashboardStore";

export default function Home() {
  const years = useDashboardStore((state) => state.years);
  const setYears = useDashboardStore((state) => state.setYears);
  const selectedCountries = useDashboardStore((state) => state.selectedCountries);
  const toggleCountry = useDashboardStore((state) => state.toggleCountry);

  const [markets, setMarkets] = useState<MarketsResponse | null>(null);
  const [compare, setCompare] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMarkets().then(setMarkets).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedCountries.length === 0) {
      setCompare(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    fetchCompare(selectedCountries, years)
      .then(setCompare)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCountries, years]);

  const countries = useMemo<CountrySummary[]>(
    () =>
      (markets?.countries ?? []).map(({ countryKey, countryName, displayName, notes }) => ({
        countryKey,
        countryName,
        displayName,
        notes,
      })),
    [markets],
  );

  const visibleItems = useMemo(
    () =>
      (compare?.items ?? []).filter((item) =>
        selectedCountries.includes(item.countryKey),
      ),
    [compare, selectedCountries],
  );

  const itemsByCountry = useMemo(() => {
    const grouped = new Map<string, CompareItem[]>();
    visibleItems.forEach((item) => {
      const bucket = grouped.get(item.countryKey) ?? [];
      bucket.push(item);
      grouped.set(item.countryKey, bucket);
    });
    return grouped;
  }, [visibleItems]);

  const rankedByOneYear = useMemo(
    () =>
      [...visibleItems].sort(
        (left, right) =>
          (right.oneYearReturnPct ?? -Infinity) - (left.oneYearReturnPct ?? -Infinity),
      ),
    [visibleItems],
  );

  const strongest = rankedByOneYear[0];

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[32px] border border-cyan-300/15 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/25">
          <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-cyan-200/70">
            Multi Index Countries
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight text-white">
            一个国家下面放多条核心指数，直接看谁代表大盘，谁代表科技，谁代表全市场。
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            现在不再是“一个国家只给一个代表指数”，而是按国家分组，把美国、A 股、香港这些市场下面的多条核心指数一起展开。这样你看美国时能同时看到标普 500、纳斯达克 100、道指和全市场；看 A 股时也能同时看到上证、深证、沪深 300、中证全指和科创板。
          </p>

          {strongest ? (
            <div className="mt-6 rounded-[28px] border border-emerald-300/20 bg-emerald-300/10 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-200/80">
                最近一年最强指数
              </p>
              <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h3 className="text-2xl text-white">
                    {strongest.countryDisplayName} · {strongest.displayName}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-50/80">
                    {strongest.benchmarkName}
                  </p>
                </div>
                <p className={`font-mono text-3xl ${textTone(strongest.oneYearReturnPct)}`}>
                  {formatPct(strongest.oneYearReturnPct)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <SignalCard icon={Clock3} label="更新时点" value={compare ? formatDate(compare.updatedAt) : "--"} />
          <SignalCard icon={Layers3} label="已选国家" value={`${selectedCountries.length} 个`} />
          <SignalCard
            icon={DatabaseZap}
            label="数据状态"
            value={
              compare?.dataStatus === "live"
                ? "实时拉取"
                : compare?.dataStatus === "snapshot"
                  ? "定时刷新"
                  : "--"
            }
          />
          <SignalCard icon={Activity} label="指数数量" value={`${visibleItems.length} 条`} />
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">国家筛选</h3>
            <p className="mt-1 text-sm text-slate-400">
              先选国家，再展开该国家下的多个核心指数。
            </p>
          </div>
          <PeriodToggle value={years} onChange={setYears} />
        </div>
        <div className="mt-5">
          <MarketFilter
            countries={countries}
            selectedCountries={selectedCountries}
            onToggle={toggleCountry}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {rankedByOneYear.slice(0, 3).map((item, index) => (
          <HighlightCard key={item.indexKey} item={item} rank={index + 1} />
        ))}
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white">国家分组指数卡</h3>
          <p className="mt-1 text-sm text-slate-400">
            每个国家下面会列出多条核心指数，而不是只给一个代表。
          </p>
        </div>

        {loading ? <PanelState label="正在拉取各国家多指数实时数据..." /> : null}
        {error ? <PanelState label={error} isError /> : null}

        {!loading && !error
          ? countries
              .filter((country) => selectedCountries.includes(country.countryKey))
              .map((country) => (
                <section
                  key={country.countryKey}
                  className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="mb-5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
                      {country.countryName}
                    </p>
                    <h4 className="mt-2 text-2xl text-white">{country.displayName}</h4>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{country.notes}</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                    {(itemsByCountry.get(country.countryKey) ?? []).map((item) => (
                      <MarketCard key={item.indexKey} item={item} />
                    ))}
                  </div>
                </section>
              ))
          : null}
      </section>

      {!loading && !error && compare ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white">年度涨幅补充表</h3>
            <p className="mt-1 text-sm text-slate-400">
              现在表里是一条指数一行，所以你可以直接比较同一国家内部不同指数的年度节奏。
            </p>
          </div>
          <HeatmapTable items={compare.items} />
        </section>
      ) : null}
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10">
          <Icon className="h-4 w-4 text-cyan-100" />
        </span>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="mt-1 font-mono text-base text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ item, rank }: { item: CompareItem; rank: number }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 font-mono text-xs text-cyan-100">
          TOP {rank}
        </span>
        <TrendingUp className="h-4 w-4 text-cyan-100" />
      </div>
      <h3 className="mt-4 text-lg text-white">
        {item.countryDisplayName} · {item.displayName}
      </h3>
      <p className="mt-1 text-sm text-slate-400">{item.benchmarkName}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniMetric label="最近一年" value={formatPct(item.oneYearReturnPct)} tone={textTone(item.oneYearReturnPct)} />
        <MiniMetric label="发布以来" value={formatPct(item.sinceInceptionReturnPct)} tone={textTone(item.sinceInceptionReturnPct)} />
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-base ${tone}`}>{value}</p>
    </div>
  );
}

function PanelState({
  label,
  isError,
}: {
  label: string;
  isError?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 text-sm text-slate-300">
      <span className={isError ? "text-rose-200" : "text-cyan-100"}>{label}</span>
    </div>
  );
}
