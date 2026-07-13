export const formatPct = (value: number | null | undefined) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export const formatNumber = (value: number) => value.toFixed(2);

export const formatDate = (value: string) => value.slice(0, 10);

export const returnTone = (value: number) => {
  if (value >= 20) {
    return "bg-emerald-400/30 text-emerald-100";
  }
  if (value >= 10) {
    return "bg-teal-400/20 text-teal-100";
  }
  if (value >= 0) {
    return "bg-cyan-400/15 text-cyan-100";
  }
  if (value <= -20) {
    return "bg-rose-500/35 text-rose-50";
  }
  if (value <= -10) {
    return "bg-orange-500/30 text-orange-50";
  }
  return "bg-amber-400/15 text-amber-100";
};

export const textTone = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return "text-slate-300";
  }
  if (value > 0) {
    return "text-emerald-300";
  }
  if (value < 0) {
    return "text-rose-300";
  }
  return "text-slate-200";
};
