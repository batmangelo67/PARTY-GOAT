import { create } from "zustand";
import { DEFAULT_MAX_SPICE } from "../constants";
import type { PackListFilters } from "../../content/pack-filter";

interface PackBrowserState extends Omit<PackListFilters, "language"> {
  allLanguages: boolean;
  update: (changes: Partial<Omit<PackBrowserState, "update">>) => void;
}

export const usePackBrowserFilters = create<PackBrowserState>((set) => ({
  allLanguages: false,
  kind: "all",
  maxSpice: DEFAULT_MAX_SPICE,
  source: "all",
  query: "",
  update: (changes) => set(changes),
}));
