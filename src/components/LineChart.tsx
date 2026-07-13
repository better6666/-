import type { TimelinePoint } from "@shared/market";
import { cn } from "@/lib/utils";

function buildPath(points: TimelinePoint[], width: number, height: number) {
  if (!points.length) {
    return "";
  }

  const values = points.map((point) => point.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((point.close - min) / range) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function LineChart({
  points,
  className,
}: {
  points: TimelinePoint[];
  className?: string;
}) {
  const width = 420;
  const height = 180;
  const path = buildPath(points, width, height);

  return (
    <div className={cn("overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/65", className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.9)" />
            <stop offset="100%" stopColor="rgba(16,185,129,0.25)" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="rgb(103 232 249)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}
