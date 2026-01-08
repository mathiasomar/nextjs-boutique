"use client";

import {
  createOrder,
  createPayment,
  getDailySales,
  getMonthlyRevenue,
  getOrderById,
  getOrderMetrics,
  getOrders,
  getProductPerformance,
  getTopProducts,
  updateOrderStatus,
} from "@/app/actions/order.action";
import { CreateOrderInput, OrderFilters } from "@/app/types";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { CustomError } from "@/lib/error-class";
import { Decimal } from "@prisma/client/runtime/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface OrderResponse {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    createdAt: Date;
    orderId: string;
    productId: string;
    quantity: number;
    selectedSize: string;
    selectedColor: string;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export const useOrders = (filters?: {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
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
        total: new Decimal(order.total.toString() || 0),
        subtotal: new Decimal(order.subtotal.toString()) || 0,
        tax: new Decimal(order.tax.toString()) || 0,
        discount: new Decimal(order.discount.toString()) || 0,
        shipping: new Decimal(order.shipping.toString()) || 0,
        paid: new Decimal(order.paid.toString()) || 0,
        balance: new Decimal(order.balance.toString()) || 0,
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              ...item,
              unitPrice: new Decimal(item.unitPrice.toString()) || 0,
              totalPrice: new Decimal(item.totalPrice.toString()) || 0,
            }))
          : [],
      }));

      return { ...result, orders };
    },
    keepPreviousData: true,
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const result = await getOrderById(id as string);
      if (!result) {
        throw new Error("Order not found");
      }

      return result;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateOrderInput): Promise<OrderResponse> => {
      const result = await createOrder(data);
      // If the server action returns an error, throw it as a custom error
      if (!result.success) {
        throw new CustomError(
          result.error || "Failed to create order",
          result.code
        );
      }

      if (!result.order) {
        throw new CustomError("Order creation failed", "NO_ORDER_RETURNED");
      }

      return result.order;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["revenueTrends"] });
      queryClient.invalidateQueries({ queryKey: ["revenueLoss"] });
      queryClient.invalidateQueries({ queryKey: ["revenueSplit"] });
      queryClient.invalidateQueries({ queryKey: ["productPerformance"] });
    },
    onError: (error: CustomError) => {
      // Log error to your error tracking service
      console.error("Order creation mutation error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      orderStatus,
    }: { orderStatus: OrderStatus } & { id: string }): Promise<{
      success?: boolean;
    }> => {
      const result = await updateOrderStatus(id, orderStatus);
      if (!result) {
        throw new Error("Failed to update order");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["revenueTrends"] });
      queryClient.invalidateQueries({ queryKey: ["revenueLoss"] });
      queryClient.invalidateQueries({ queryKey: ["revenueSplit"] });
      queryClient.invalidateQueries({ queryKey: ["productPerformance"] });
    },
    onError: (error: Error) => {
      // Log error to your error tracking service
      console.error("Order update mutation error:", error.message);
    },
  });
};

export const useMakePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      amount,
      method,
    }: {
      orderId: string;
      amount: number;
      method: PaymentMethod;
    }) => {
      const result = await createPayment(orderId, amount, method);
      if (!result.success) {
        throw new Error(result.error);
      }
      return {
        ...result,
        amount: new Decimal(result.payment.amount.toString()),
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(["orders", variables.orderId], data);
    },
    onError: (error: Error) => {
      console.error(`Payment failed: ${error.message}`);
    },
  });
};

export const useDailySales = (days: number = 7, productId?: string) => {
  return useQuery({
    queryKey: ["daily-sales", { days, productId }],
    queryFn: async () => {
      const result = await getDailySales(days, productId);
      if (!result) {
        throw new Error("Daily sales not found");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export const useTopProducts = (limit: number = 10, days: number = 30) => {
  return useQuery({
    queryKey: ["top-products", { limit, days }],
    queryFn: async () => {
      const result = await getTopProducts(limit, days);
      if (!result) {
        throw new Error("Top products not found");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export const useMontlyRevenue = (months: number = 12) => {
  return useQuery({
    queryKey: ["monthly-revenue", { months }],
    queryFn: async () => {
      const result = await getMonthlyRevenue(months);
      if (!result) {
        throw new Error("Monthly revenue not found");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export const useOrderMetrics = () => {
  return useQuery({
    queryKey: ["order-metrics"],
    queryFn: async () => {
      const result = await getOrderMetrics();
      if (!result) {
        throw new Error("Order metrics not found");
      }

      return result;
    },
    keepPreviousData: true,
  });
};

export const useProductPerformance = () => {
  return useQuery({
    queryKey: ["product-performance"],
    queryFn: async () => {
      const result = await getProductPerformance();
      if (!result) {
        throw new Error("Product performance not found");
      }

      return result;
    },
    keepPreviousData: true,
  });
};
