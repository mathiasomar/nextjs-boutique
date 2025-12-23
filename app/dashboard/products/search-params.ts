// Define default search params
export const productSearchParams = {
  search: "",
  inStock: false,
  lowStock: false,
  isActive: true,
};

// Function to load search params from URLSearchParams
export const loadSearchParams = (searchParams: URLSearchParams) => {
  return {
    search: searchParams.get("search") || productSearchParams.search,
    inStock:
      searchParams.get("inStock") === "true" || productSearchParams.inStock,
    lowStock:
      searchParams.get("lowStock") === "true" || productSearchParams.lowStock,
    isActive:
      searchParams.get("isActive") !== "false" && productSearchParams.isActive,
  };
};
