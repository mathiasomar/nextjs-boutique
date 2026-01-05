// app/actions/orders.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { updateStock } from "./product";
// import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";
import { CreateOrderInput, OrderFilters, OrderItemInput } from "../types";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

export const getOrders = async (filters: OrderFilters) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { search, paymentStatus, status, startDate, endDate } = filters;

  const where: Prisma.OrderWhereInput = {};

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { firstName: { contains: search, mode: "insensitive" } } },
      { customer: { lastName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (paymentStatus !== undefined) {
    where.paymentStatus = paymentStatus;
  }

  if (status !== undefined) {
    where.status = status;
  }

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (startDate && !endDate) {
    where.createdAt = {
      gte: new Date(startDate),
    };
  }

  if (!startDate && endDate) {
    where.createdAt = {
      lte: new Date(endDate),
    };
  }

  try {
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        _count: { select: { items: true } },
        customer: { select: { id: true, email: true } },
        createdByUser: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedOrders = orders.map((order) => ({
      ...order,
      items: JSON.stringify(order.items),
      total: order.total.toNumber(),
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      discount: order.discount.toNumber(),
      paid: order.paid.toNumber(),
      balance: order.balance.toNumber(),
      shipping: order.shipping.toNumber(),
    }));

    return { success: true, orders: serializedOrders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Error fetching orders" };
  }
};

export const getOrderById = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        customer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        createdByUser: { select: { id: true, name: true } },
        payments: true,
      },
    });

    if (!order) return null;

    const serializedItems = order.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toNumber(),
      totalPrice: item.totalPrice.toNumber(),
      product: {
        ...item.product,
        price: item.product.price.toNumber(),
        costPrice: item.product.costPrice.toNumber(),
      },
    }));

    const serializedPayments = order.payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toNumber(),
    }));

    return {
      success: true,
      order: {
        ...order,
        total: order.total.toNumber(),
        subtotal: order.subtotal.toNumber(),
        tax: order.tax.toNumber(),
        discount: order.discount.toNumber(),
        shipping: order.shipping.toNumber(),
        paid: order.paid.toNumber(),
        balance: order.balance.toNumber(),
        items: serializedItems,
        payments: serializedPayments,
      },
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Error fetching orders" };
  }
};

export const createOrder = async (formData: CreateOrderInput) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)}`;

    // Validate that items exist
    if (
      !formData.items ||
      !Array.isArray(formData.items) ||
      formData.items.length === 0
    ) {
      return {
        success: false,
        error: "No items in order",
        code: "NO_ITEMS",
      };
    }

    const customerId = formData.customerId as string;
    const items: OrderItemInput[] = formData.items;

    // Calculate totals
    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: OrderItemInput) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const tax = 0; //  or calculate as needed: subtotal * 0.1
    const discoutCal = (Number(formData.discount) * subtotal) / 100;
    const total = subtotal + tax - discoutCal;

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return {
        success: false,
        error: "Customer not found",
        code: "CUSTOMER_NOT_FOUND",
      };
    }

    // Check stock availability before creating order
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return {
          success: false,
          error: `Product not found: ${item.productId}`,
          code: "PRODUCT_NOT_FOUND",
          productId: item.productId,
        };
      }

      if (product.currentStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`,
          code: "INSUFFICIENT_STOCK",
          productId: product.id,
          availableStock: product.currentStock,
          productName: product.name,
        };
      }
    }

    // Create the order with transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          status: formData.status || "PENDING",
          paymentStatus: formData.paymentStatus || "PENDING",
          subtotal,
          discount: discoutCal,
          tax,
          total,
          paid: 0.0,
          balance: total,
          createdBy: session.user.id,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        items.map(async (item: OrderItemInput) => {
          const totalPrice = item.totalPrice || item.quantity * item.unitPrice;

          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice,
              selectedSize: item.selectedSize as string,
              selectedColor: item.selectedColor as string,
            },
          });
        })
      );

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        details: { orderNumber, total, customerId },
      },
    });

    const serializedOrder = {
      ...order,
      total: order.total.toNumber(),
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      discount: order.discount.toNumber(),
      shipping: order.shipping.toNumber(),
      paid: order.paid.toNumber(),
      balance: order.balance.toNumber(),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: item.unitPrice.toNumber(),
        totalPrice: item.totalPrice.toNumber(),
      })),
    };

    // revalidatePath("/dashboard/orders");
    return { success: true, order: serializedOrder };
  } catch (error) {
    console.error("Create order error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for Prisma errors
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "Order with similar details already exists",
          code: "DUPLICATE_ORDER",
        };
      }

      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          error: "Invalid customer or product reference",
          code: "REFERENCE_ERROR",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create order. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // If order is cancelled, restore inventory
    if (status === "CANCELLED") {
      const items = await prisma.orderItem.findMany({
        where: { orderId },
      });

      for (const item of items) {
        await updateStock(
          item.productId,
          item.quantity,
          "RETURN",
          `Order ${order.orderNumber} cancelled`
        );
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_ORDER_STATUS",
        entityType: "Order",
        entityId: order.id,
        details: { status },
      },
    });

    // Convert Decimal to numbers for serialization
    const serializedOrder = {
      ...order,
      total: order.total.toNumber(),
      subtotal: order.subtotal.toNumber(),
      tax: order.tax.toNumber(),
      discount: order.discount.toNumber(),
      shipping: order.shipping.toNumber(),
      paid: order.paid.toNumber(),
      balance: order.balance.toNumber(),
    };

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    return {
      success: true,
      order: serializedOrder,
    };
  } catch (error) {
    console.error("Update order status error:", error);
    return { error: "Failed to update order status" };
  }
};

export const createPayment = async (
  orderId: string,
  amount: number,
  method: PaymentMethod
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        amount,
        method,
        status: "COMPLETED",
        transactionId: `TXN-${Date.now()}`,
        processedBy: session.user.email,
      },
    });

    // Update order payment status
    const totalPaid = await prisma.payment.aggregate({
      where: { orderId, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const paid = Number(totalPaid._sum.amount) || 0;
    const balance = Number(order.total) - paid;

    const paymentStatus =
      Number(totalPaid._sum.amount) >= Number(order.total)
        ? "COMPLETED"
        : Number(totalPaid._sum.amount) > 0
        ? "PARTIAL"
        : "PENDING";

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus, paid, balance },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_PAYMENT",
        entityType: "Payment",
        entityId: payment.id,
        details: { amount, method },
      },
    });

    // revalidatePath("/dashboard/orders");
    // revalidatePath(`/dashboard/orders/${orderId}`);
    return {
      success: true,
      payment: {
        ...payment,
        amount: payment.amount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Create payment error:", error);
    return { error: "Failed to create payment" };
  }
};
