import { parseAsBoolean, parseAsString } from "nuqs";
import { createLoader } from "nuqs/server";

// Describe your search params, and reuse this in useQueryStates / createSerializer:
export const productSearchParams = {
  search: parseAsString.withDefault(""),
  inStock: parseAsBoolean.withDefault(false),
  lowStock: parseAsBoolean.withDefault(false),
  isActive: parseAsBoolean.withDefault(true),
};

export const loadSearchParams = createLoader(productSearchParams);
