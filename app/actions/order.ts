// app/actions/orders.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { updateStock } from "./product";
// import { revalidatePath } from "next/cache";
import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";
import {
  CreateOrderInput,
  DailySalesData,
  MonthlyRevenueData,
  OrderFilters,
  OrderItemInput,
  OrderStatusSummary,
  ProductPerformance,
  ProductSalesData,
} from "../types";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay, subDays, format, parseISO } from "date-fns";

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
        payments: {
          orderBy: { createdAt: "desc" },
        },
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
          const updtproduct = await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                decrement: item.quantity,
              },
            },
          });

          if (updtproduct.currentStock <= updtproduct.minStockLevel) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                lowStockAlert: true,
              },
            });
          }

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

export const getDailySales = async (
  days: number = 7,
  productId?: string
): Promise<DailySalesData[]> => {
  const startDate = subDays(new Date(), days - 1);
  const endDate = new Date();

  try {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
        status: {
          not: "CANCELLED",
        },
        ...(productId && {
          items: {
            some: {
              productId,
            },
          },
        }),
      },
      include: {
        items: productId
          ? {
              where: { productId },
            }
          : true,
      },
    });

    // Group by date
    const salesByDate = orders.reduce((acc, order) => {
      const dateKey = format(order.createdAt, "yyyy-MM-dd");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          total: 0,
          orders: 0,
          items: 0,
        };
      }

      acc[dateKey].total += Number(order.total);
      acc[dateKey].orders += 1;

      // If filtering by product, only count items for that product
      if (productId) {
        const productItems = order.items.filter(
          (item) => item.productId === productId
        );
        acc[dateKey].items += productItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      } else {
        acc[dateKey].items += order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
      }

      return acc;
    }, {} as Record<string, { total: number; orders: number; items: number }>);

    // Fill missing dates and format for chart
    const result: DailySalesData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = format(currentDate, "yyyy-MM-dd");
      const dayData = salesByDate[dateKey] || { total: 0, orders: 0, items: 0 };

      result.push({
        date: format(currentDate, "MMM dd"),
        total: parseFloat(dayData.total.toFixed(2)),
        orders: dayData.orders,
        average:
          dayData.orders > 0
            ? parseFloat((dayData.total / dayData.orders).toFixed(2))
            : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    throw new Error("Failed to fetch sales data");
  }
};

export const getTopProducts = async (
  limit: number = 10,
  days: number = 30
): Promise<ProductSalesData[]> => {
  const startDate = subDays(new Date(), days);

  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      orderBy: {
        _sum: {
          totalPrice: "desc",
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    return topProducts.map((item) => ({
      productId: item.productId,
      productName: productMap.get(item.productId)?.name || "Unknown Product",
      category:
        (productMap.get(item.productId)?.category as { name: string })?.name ||
        "Unknown",
      quantity: item._sum.quantity || 0,
      revenue: parseFloat((item._sum.totalPrice || 0).toFixed(2)),
    }));
  } catch (error) {
    console.error("Error fetching top products:", error);
    throw new Error("Failed to fetch product data");
  }
};

export const getMonthlyRevenue = async (
  months: number = 12
): Promise<MonthlyRevenueData[]> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);

  try {
    const monthlyData = await prisma.$queryRaw<
      Array<{
        month: string;
        revenue: number;
        orders: number;
      }>
    >`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        SUM(grandTotal) as revenue,
        COUNT(*) as orders
      FROM Order
      WHERE createdAt >= ${startDate}
        AND createdAt <= ${endDate}
        AND status != 'CANCELLED'
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month ASC
    `;

    // Format for chart with growth calculation
    return monthlyData.map((data, index) => {
      const previousMonth = monthlyData[index - 1];
      const growth = previousMonth
        ? parseFloat(
            (
              ((data.revenue - previousMonth.revenue) / previousMonth.revenue) *
              100
            ).toFixed(1)
          )
        : null;

      return {
        month: format(parseISO(`${data.month}-01`), "MMM yy"),
        revenue: parseFloat(data.revenue.toFixed(2)),
        orders: data.orders,
        growth,
      };
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    throw new Error("Failed to fetch monthly revenue data");
  }
};

export const getOrderMetrics = async () => {
  try {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      monthlyOrders,
      totalRevenue,
      todayRevenue,
      monthlyRevenue,
      avgOrderValue,
      pendingOrders,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Today's orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfToday },
          status: { not: "CANCELLED" },
        },
      }),

      // This month's orders
      prisma.order.count({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: "CANCELLED" },
        },
      }),

      // Total revenue
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),

      // Today's revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfToday },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),

      // Monthly revenue
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),

      // Average order value
      prisma.order.aggregate({
        where: { status: { not: "CANCELLED" } },
        _avg: { total: true },
      }),

      // Pending orders
      prisma.order.count({
        where: { status: "PENDING" },
      }),
    ]);

    return {
      totalOrders,
      todayOrders,
      monthlyOrders,
      totalRevenue: parseFloat((totalRevenue._sum.total || 0).toFixed(2)),
      todayRevenue: parseFloat((todayRevenue._sum.total || 0).toFixed(2)),
      monthlyRevenue: parseFloat((monthlyRevenue._sum.total || 0).toFixed(2)),
      avgOrderValue: parseFloat((avgOrderValue._avg.total || 0).toFixed(2)),
      pendingOrders,
    };
  } catch (error) {
    console.error("Error fetching order metrics:", error);
    throw new Error("Failed to fetch order metrics");
  }
};

export async function getProductPerformance(): Promise<ProductPerformance[]> {
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const startOfLastMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  );
  const endOfLastMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    0
  );

  try {
    const [currentMonthProducts, lastMonthProducts] = await Promise.all([
      // This month's product performance
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: startOfMonth },
            status: { notIn: ["CANCELLED", "RETURNED"] },
          },
        },
        _sum: {
          quantity: true,
          totalPrice: true,
        },
        orderBy: {
          _sum: {
            totalPrice: "desc",
          },
        },
        take: 10,
      }),

      // Last month's product performance
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: {
          order: {
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
            status: { notIn: ["CANCELLED", "RETURNED"] },
          },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    // Get product details
    const productIds = currentMonthProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        category: true,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const lastMonthMap = new Map(
      lastMonthProducts.map((item) => [
        item.productId,
        Number(item._sum.totalPrice || 0),
      ])
    );

    return currentMonthProducts.map((item) => {
      const product = productMap.get(item.productId);
      const currentRevenue = Number(item._sum.totalPrice || 0);
      const lastRevenue = lastMonthMap.get(item.productId) || 0;
      const growth =
        lastRevenue > 0
          ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
          : 100;

      return {
        id: item.productId,
        name: product?.name || "Unknown Product",
        category:
          product?.category && typeof product.category === "object"
            ? product.category.name
            : "Unknown Category",
        revenue: currentRevenue,
        unitsSold: item._sum.quantity || 0,
        growth: parseFloat(growth.toFixed(1)),
      };
    });
  } catch (error) {
    console.error("Error fetching product performance:", error);
    return [];
  }
}

export async function getOrderStatusSummary(): Promise<OrderStatusSummary[]> {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const totalOrders = statusCounts.reduce(
      (sum, item) => sum + item._count.id,
      0
    );

    return statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
      percentage:
        totalOrders > 0
          ? parseFloat(((item._count.id / totalOrders) * 100).toFixed(1))
          : 0,
    }));
  } catch (error) {
    console.error("Error fetching order status summary:", error);
    return [];
  }
}
