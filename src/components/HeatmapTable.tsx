import type { CompareItem } from "@shared/market";
import { Link } from "react-router-dom";
import { formatPct, returnTone } from "@/lib/format";
import { cn } from "@/lib/utils";

type YearColumn = {
  year: number;
  isYtd?: boolean;
};

export default function HeatmapTable({ items }: { items: CompareItem[] }) {
  const years: YearColumn[] = Array.from(
    new Map(
      items
        .flatMap((item) => item.yearly)
        .map((entry) => [entry.year, { year: entry.year, isYtd: entry.isYtd }]),
    ).values(),
  );

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 shadow-2xl shadow-cyan-950/30">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-950/95 px-4 py-4 text-left font-medium">
                市场
              </th>
              {years.map((year) => (
                <th key={year.year} className="px-4 py-4 text-right font-medium">
                  <span>{year.year}</span>
                  {year.isYtd ? (
                    <span className="ml-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                      YTD
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.indexKey} className="border-t border-white/5">
                <td className="sticky left-0 bg-slate-950/95 px-4 py-4">
                  <Link
                    to={`/market/${item.indexKey}`}
                    className="group flex flex-col gap-1"
                  >
                    <span className="text-sm font-medium text-white group-hover:text-cyan-100">
                      {item.countryDisplayName} · {item.displayName}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {item.benchmarkName}
                    </span>
                  </Link>
                </td>
                {years.map((year) => {
                  const matched = item.yearly.find((entry) => entry.year === year.year);
                  return (
                    <td key={`${item.indexKey}-${year.year}`} className="px-2 py-2">
                      {matched ? (
                        <div
                          className={cn(
                            "rounded-2xl px-3 py-3 text-right font-mono text-sm",
                            returnTone(matched.annualReturnPct),
                          )}
                        >
                          {formatPct(matched.annualReturnPct)}
                        </div>
                      ) : (
                        <div className="px-3 py-3 text-right text-slate-500">--</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
