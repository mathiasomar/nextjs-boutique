"use client";

import {
  getDashboardStats,
  getProductDetails,
  getProductPerformance,
  getRevenueLossFromLowStock,
  getRevenueSplitByCategory,
  getRevenueTrends,
  getTopBottomProducts,
} from "@/app/actions/analytic";
import { Decimal } from "@prisma/client/runtime/client";
import { useQuery } from "@tanstack/react-query";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const result = await getDashboardStats();
      if (!result) {
        throw new Error("Dashboard stats not found");
      }
      return result;
    },
  });
};

export const useRevenueTrends = ({
  timeFrame = "30d",
}: {
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths";
}) => {
  return useQuery({
    queryKey: ["revenueTrends", timeFrame],
    queryFn: async () => {
      const result = await getRevenueTrends(timeFrame);
      if (!result) {
        throw new Error("Revenue not found");
      }
      return result;
    },
  });
};

export const useRevenueLoss = () => {
  return useQuery({
    queryKey: ["revenueLoss"],
    queryFn: async () => {
      const result = await getRevenueLossFromLowStock();
      if (!result) {
        throw new Error("Revenue Loss not found");
      }
      return result;
    },
  });
};

export const useRevenueSplit = () => {
  return useQuery({
    queryKey: ["revenueSplit"],
    queryFn: async () => {
      const result = await getRevenueSplitByCategory();
      if (!result) {
        throw new Error("Revenue Split not found");
      }
      return result;
    },
  });
};

export const useProductPerformance = () => {
  return useQuery({
    queryKey: ["productPerformance"],
    queryFn: async () => {
      const result = await getTopBottomProducts();
      if (!result) {
        throw new Error("Product Performance not found");
      }
      return result;
    },
  });
};

export const useSingleProductPerformance = ({
  productId,
  timeFrame,
}: {
  productId: string;
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths";
}) => {
  return useQuery({
    queryKey: ["productSinglePerformance", productId, timeFrame],
    queryFn: async () => {
      const result = await getProductPerformance(productId, timeFrame);
      if (!result) {
        throw new Error("Product Performance not found");
      }
      return result;
    },
  });
};

export const useProductDetails = ({ productId }: { productId: string }) => {
  return useQuery({
    queryKey: ["productDetails", productId],
    queryFn: async () => {
      const result = await getProductDetails(productId);
      if (!result) {
        throw new Error("Product Performance not found");
      }
      return {
        ...result,
        price: new Decimal(result.price.toString()),
        costPrice: new Decimal(result.costPrice.toString()),
      };
    },
  });
};
