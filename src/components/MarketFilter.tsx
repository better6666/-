import type { CountrySummary } from "@shared/market";
import { cn } from "@/lib/utils";

export default function MarketFilter({
  countries,
  selectedCountries,
  onToggle,
}: {
  countries: CountrySummary[];
  selectedCountries: string[];
  onToggle: (countryKey: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {countries.map((country) => {
        const active = selectedCountries.includes(country.countryKey);

        return (
          <button
            key={country.countryKey}
            type="button"
            onClick={() => onToggle(country.countryKey)}
            className={cn(
              "rounded-full border px-3 py-2 text-sm transition",
              active
                ? "border-emerald-300/60 bg-emerald-300/15 text-emerald-50"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/30 hover:text-white",
            )}
          >
            <span className="font-medium">{country.displayName}</span>
            <span className="ml-2 text-xs opacity-70">{country.countryName}</span>
          </button>
        );
      })}
    </div>
  );
}
