import { getActivityLogs, getInventoryLogs } from "@/app/actions/log";
import { InventoryType } from "@/generated/prisma/enums";
import { useQuery } from "@tanstack/react-query";

export const useActivityLogs = (filters?: { search?: string }) => {
  return useQuery({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      const result = await getActivityLogs(filters);
      if (!result) {
        throw new Error("Activity log not found");
      }
      return result;
    },
    keepPreviousData: true,
  });
};

export const useInventoryLogs = (filters?: {
  type?: InventoryType;
  productId?: string;
}) => {
  return useQuery({
    queryKey: ["inventory-logs", filters],
    queryFn: async () => {
      const result = await getInventoryLogs(filters);
      if (!result) {
        throw new Error("Inventory log not found");
      }
      return result;
    },
    keepPreviousData: true,
  });
};
