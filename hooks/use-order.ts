"use client";

import { getOrders } from "@/app/actions/order";
import { OrderFilters } from "@/app/types";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";
import { useQuery } from "@tanstack/react-query";

export const useOrders = (filters?: {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
}) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const result = await getOrders(filters as OrderFilters);
      if (!result) {
        throw new Error("Order not found");
      }

      const orders = result.orders?.map((order) => ({
        ...order,
        total: new Decimal(order.total.toString()),
      }));

      return { ...result, orders };
    },
    keepPreviousData: true,
  });
};
