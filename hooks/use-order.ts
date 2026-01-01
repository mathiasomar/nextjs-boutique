"use client";

import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "@/app/actions/order";
import { CreateOrderInput, OrderFilters } from "@/app/types";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Custom error class for consistent error handling
export class OrderError extends Error {
  code?: string;
  details?: unknown;

  constructor(message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "OrderError";
    this.code = code;
    this.details = details;
  }
}

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
        subtotal: new Decimal(order.subtotal.toString()),
        tax: new Decimal(order.tax.toString()),
        discount: new Decimal(order.discount.toString()),
        shipping: new Decimal(order.shipping.toString()),
        items: Array.isArray(order.items)
          ? order.items.map((item) => ({
              ...item,
              unitPrice: new Decimal(item.unitPrice.toString()),
              totalPrice: new Decimal(item.totalPrice.toString()),
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
        throw new OrderError(
          result.error || "Failed to create order",
          result.code
        );
      }

      if (!result.order) {
        throw new OrderError("Order creation failed", "NO_ORDER_RETURNED");
      }

      return result.order;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["orders", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: OrderError) => {
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
    },
  });
};
