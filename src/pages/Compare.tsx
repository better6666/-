import type { CompareResponse, CountrySummary, MarketsResponse } from "@shared/market";
import { useEffect, useMemo, useState } from "react";
import CompareTable from "@/components/CompareTable";
import MarketFilter from "@/components/MarketFilter";
import PeriodToggle from "@/components/PeriodToggle";
import { fetchCompare, fetchMarkets } from "@/lib/api";
import { useDashboardStore } from "@/store/dashboardStore";

export default function Compare() {
  const years = useDashboardStore((state) => state.years);
  const setYears = useDashboardStore((state) => state.setYears);
  const selectedCountries = useDashboardStore((state) => state.selectedCountries);
  const toggleCountry = useDashboardStore((state) => state.toggleCountry);

  const [markets, setMarkets] = useState<MarketsResponse | null>(null);
  const [compare, setCompare] = useState<CompareResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMarkets().then(setMarkets).catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedCountries.length === 0) {
      setCompare(null);
      return;
    }

    setError("");
    fetchCompare(selectedCountries, years)
      .then(setCompare)
      .catch((err: Error) => setError(err.message));
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

  const sortedItems = useMemo(
    () =>
      [...(compare?.items ?? [])].sort(
        (left, right) =>
          (right.oneYearReturnPct ?? -Infinity) - (left.oneYearReturnPct ?? -Infinity),
      ),
    [compare],
  );

  const exportCsv = () => {
    if (!sortedItems.length) {
      return;
    }

    const header = [
      "country",
      "index",
      "benchmarkName",
      "latestPrice",
      "oneYearReturnPct",
      "sinceInceptionReturnPct",
      "latestAnnualReturnPct",
      "inceptionDate",
      "latestPriceDate",
    ];

    const lines = sortedItems.map((item) =>
      [
        item.countryDisplayName,
        item.displayName,
        item.benchmarkName,
        item.latestPrice,
        item.oneYearReturnPct ?? "",
        item.sinceInceptionReturnPct,
        item.latestAnnualReturnPct ?? "",
        item.inceptionDate,
        item.latestPriceDate,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );

    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `country-index-compare-${years}y.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
              Country Multi Index Compare
            </p>
            <h2 className="mt-3 font-serif text-4xl text-white">多国家多指数对比</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              这里不再只比较一个国家一个指数，而是把国家下面的多条核心指数一起拉出来排位。
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

      {error ? (
        <div className="rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {sortedItems.length ? (
        <CompareTable items={sortedItems} onExport={exportCsv} />
      ) : (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-sm text-slate-300">
          请至少选择一个国家开始比较。
        </div>
      )}
    </div>
  );
}
