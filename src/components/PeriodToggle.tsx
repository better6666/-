import { cn } from "@/lib/utils";

export default function PeriodToggle({
  value,
  onChange,
}: {
  value: 5 | 10;
  onChange: (value: 5 | 10) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
      {[5, 10].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option as 5 | 10)}
          className={cn(
            "rounded-full px-4 py-2 text-sm transition",
            value === option
              ? "bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-300/30"
              : "text-slate-300 hover:text-white",
          )}
        >
          近 {option} 年
        </button>
      ))}
    </div>
  );
}
