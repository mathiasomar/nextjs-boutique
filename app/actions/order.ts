// app/actions/orders.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { updateStock } from "./product";
import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";
import { Item } from "../types";
import { Prisma } from "@/generated/prisma/client";

export const createOrder = async (
  formData: Prisma.OrderUncheckedCreateInput
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)}`;

    const customerId = formData.customerId as string;
    const items = JSON.parse(formData.items as string);

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: Item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        tax,
        total,
        createdBy: session.user.id,
        items: {
          create: items.map((item: Item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update inventory for each item
    for (const item of items) {
      await updateStock(
        item.productId,
        item.quantity,
        "SALE",
        `Order ${orderNumber}`
      );
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        details: { orderNumber, total },
      },
    });

    revalidatePath("/dashboard/orders");
    return { success: true, order };
  } catch (error) {
    console.error("Create order error:", error);
    return { error: "Failed to create order" };
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

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, order };
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
        processedBy: session.user.id,
      },
    });

    // Update order payment status
    const totalPaid = await prisma.payment.aggregate({
      where: { orderId, status: "COMPLETED" },
      _sum: { amount: true },
    });

    const paymentStatus =
      totalPaid._sum.amount! >= order.total
        ? "COMPLETED"
        : Number(totalPaid._sum.amount) > 0
        ? "PARTIAL"
        : "PENDING";

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
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

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, payment };
  } catch (error) {
    console.error("Create payment error:", error);
    return { error: "Failed to create payment" };
  }
};
