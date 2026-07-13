import type { CompareItem } from "@shared/market";
import { Download } from "lucide-react";
import { formatDate, formatNumber, formatPct, textTone } from "@/lib/format";

export default function CompareTable({
  items,
  onExport,
}: {
  items: CompareItem[];
  onExport: () => void;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">横向对比矩阵</h2>
          <p className="mt-1 text-sm text-slate-400">按最近一行可以快速观察当前年内表现。</p>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-50 transition hover:border-cyan-200/60 hover:bg-cyan-300/20"
        >
          <Download className="h-4 w-4" />
          导出 CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="px-4 py-3 text-left">市场</th>
              <th className="px-4 py-3 text-right">最新点位</th>
              <th className="px-4 py-3 text-right">最近一年</th>
              <th className="px-4 py-3 text-right">发布以来</th>
              <th className="px-4 py-3 text-right">最近年度</th>
              <th className="px-4 py-3 text-right">发布日期</th>
              <th className="px-4 py-3 text-right">口径</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.indexKey} className="border-t border-white/5">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-white">
                      {item.countryDisplayName} · {item.displayName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{item.benchmarkName}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-right font-mono text-white">
                  {formatNumber(item.latestPrice)}
                </td>
                <td className={`px-4 py-4 text-right font-mono ${textTone(item.oneYearReturnPct)}`}>
                  {formatPct(item.oneYearReturnPct)}
                </td>
                <td className={`px-4 py-4 text-right font-mono ${textTone(item.sinceInceptionReturnPct)}`}>
                  {formatPct(item.sinceInceptionReturnPct)}
                </td>
                <td className={`px-4 py-4 text-right font-mono ${textTone(item.latestAnnualReturnPct)}`}>
                  {formatPct(item.latestAnnualReturnPct)}
                </td>
                <td className="px-4 py-4 text-right font-mono text-slate-300">
                  {formatDate(item.inceptionDate)}
                </td>
                <td className="px-4 py-4 text-right text-slate-300">
                  {item.sourceType === "official" ? "官方" : "代理"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
