import { create } from "zustand";

type DashboardState = {
  years: 5 | 10;
  selectedCountries: string[];
  setYears: (years: 5 | 10) => void;
  toggleCountry: (countryKey: string) => void;
  setSelectedCountries: (countryKeys: string[]) => void;
};

const DEFAULT_COUNTRIES = ["us", "cn_a", "hk", "tw", "au", "mx", "vn"];

export const useDashboardStore = create<DashboardState>((set) => ({
  years: 10,
  selectedCountries: DEFAULT_COUNTRIES,
  setYears: (years) => set({ years }),
  toggleCountry: (countryKey) =>
    set((state) => ({
      selectedCountries: state.selectedCountries.includes(countryKey)
        ? state.selectedCountries.filter((item) => item !== countryKey)
        : [...state.selectedCountries, countryKey],
    })),
  setSelectedCountries: (countryKeys) => set({ selectedCountries: countryKeys }),
}));
