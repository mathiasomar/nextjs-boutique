// app/actions/analytics.actions.ts
"use server";

import prisma from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";

export async function getTotalRevenue() {
  const result = await prisma.order.aggregate({
    where: {
      paymentStatus: "COMPLETED",
      status: {
        in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  return Number(result._sum.total) || 0;
}

export async function getRevenueTrends(
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths"
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);
  let groupBy: "day" | "month";

  switch (timeFrame) {
    case "7d":
      startDate = startOfDay(subDays(now, 7));
      groupBy = "day";
      break;
    case "30d":
      startDate = startOfDay(subDays(now, 30));
      groupBy = "day";
      break;
    case "lastMonth":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      groupBy = "day";
      break;
    case "allMonths":
      startDate = startOfMonth(subMonths(now, 12));
      groupBy = "month";
      break;
    default:
      startDate = startOfDay(subDays(now, 30));
      groupBy = "day";
  }

  const orders = await prisma.order.findMany({
    where: {
      orderDate: {
        gte: startDate,
        lte: endDate,
      },
      paymentStatus: "COMPLETED",
      status: {
        in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"],
      },
    },
    select: {
      total: true,
      orderDate: true,
    },
    orderBy: {
      orderDate: "asc",
    },
  });

  // Group by day or month
  const groupedData = orders.reduce((acc, order) => {
    const date = new Date(order.orderDate);
    const key =
      groupBy === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");

    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += Number(order.total);
    return acc;
  }, {} as Record<string, number>);

  // Fill missing dates/months with 0
  const result: unknown[] = [];

  if (groupBy === "day") {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      result.push({
        date: format(day, "MMM dd"),
        revenue: groupedData[key] || 0,
      });
    });
  } else {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    months.forEach((month) => {
      const key = format(month, "yyyy-MM");
      result.push({
        date: format(month, "MMM yyyy"),
        revenue: groupedData[key] || 0,
      });
    });
  }

  return result;
}

export async function getRevenueLossFromLowStock() {
  const lowStockProducts = await prisma.product.findMany({
    where: {
      lowStockAlert: true,
      currentStock: {
        gt: 0, // Only consider products that still have some stock
      },
    },
    include: {
      orderItems: {
        where: {
          order: {
            orderDate: {
              gte: subDays(new Date(), 30),
            },
            paymentStatus: "COMPLETED",
          },
        },
        select: {
          quantity: true,
        },
      },
    },
  });

  let totalRevenueLoss = 0;
  const productLosses = [];

  for (const product of lowStockProducts) {
    // Calculate average daily sales
    const totalSoldLast30Days = product.orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const avgDailySales = totalSoldLast30Days / 30;

    // Estimate lost sales based on current stock and sales velocity
    // const daysUntilOutOfStock =
    //   product.currentStock / Math.max(avgDailySales, 0.1);
    const lostDailySales =
      avgDailySales *
      (1 - product.currentStock / Math.max(product.minStockLevel, 1));

    // Assuming 30% of customers would buy alternative products, 70% would be lost sales
    const estimatedLostSales = lostDailySales * 30 * 0.7;
    const productRevenueLoss = estimatedLostSales * Number(product.price);

    if (productRevenueLoss > 0) {
      totalRevenueLoss += productRevenueLoss;
      productLosses.push({
        productName: product.name,
        currentStock: product.currentStock,
        minStockLevel: product.minStockLevel,
        avgDailySales: avgDailySales,
        estimatedLoss: productRevenueLoss,
      });
    }
  }

  return {
    totalLoss: totalRevenueLoss,
    productLosses: productLosses.slice(0, 5), // Top 5 contributors
  };
}

export async function getRevenueSplitByCategory() {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            where: {
              order: {
                orderDate: {
                  gte: startDate,
                  lte: endDate,
                },
                paymentStatus: "COMPLETED",
              },
            },
            select: {
              quantity: true,
              unitPrice: true,
            },
          },
        },
      },
    },
  });

  const result = categories
    .map((category) => {
      const revenue = category.products.reduce((total, product) => {
        const productRevenue = product.orderItems.reduce((sum, item) => {
          return sum + item.quantity * Number(item.unitPrice);
        }, 0);
        return total + productRevenue;
      }, 0);

      return {
        category: category.name,
        revenue,
      };
    })
    .filter((item) => item.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  return result;
}

export async function getTopBottomProducts() {
  const oneMonthAgo = subMonths(new Date(), 1);
  const twoMonthsAgo = subMonths(new Date(), 2);
  // const threeMonthsAgo = subMonths(new Date(), 3);

  // Get current month sales (last 30 days)
  const currentMonthProducts = await prisma.product.findMany({
    include: {
      orderItems: {
        where: {
          order: {
            orderDate: {
              gte: oneMonthAgo,
            },
            paymentStatus: "COMPLETED",
          },
        },
        select: {
          quantity: true,
          unitPrice: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  // Get previous month sales
  const previousMonthProducts = await prisma.product.findMany({
    include: {
      orderItems: {
        where: {
          order: {
            orderDate: {
              gte: twoMonthsAgo,
              lt: oneMonthAgo,
            },
            paymentStatus: "COMPLETED",
          },
        },
        select: {
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  // Calculate performance
  const productPerformance = currentMonthProducts
    .map((product) => {
      const currentRevenue = product.orderItems.reduce(
        (sum, item) => sum + item.quantity * Number(item.unitPrice),
        0
      );

      const previousProduct = previousMonthProducts.find(
        (p) => p.id === product.id
      );
      const previousRevenue =
        previousProduct?.orderItems.reduce(
          (sum, item) => sum + item.quantity * Number(item.unitPrice),
          0
        ) || 0;

      const revenueChange = currentRevenue - previousRevenue;
      const changePercentage =
        previousRevenue > 0
          ? (revenueChange / previousRevenue) * 100
          : currentRevenue > 0
          ? 100
          : 0;

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        currentRevenue,
        previousRevenue,
        revenueChange,
        changePercentage,
        currentStock: product.currentStock,
      };
    })
    .filter((p) => p.currentRevenue > 0 || p.previousRevenue > 0);

  // Sort by performance
  const sorted = productPerformance.sort(
    (a, b) => b.revenueChange - a.revenueChange
  );

  return {
    top5: sorted.slice(0, 5),
    bottom5: sorted.slice(-5).reverse(),
  };
}

export async function getDashboardStats() {
  const [totalRevenue, totalOrders, lowStockCount] = await Promise.all([
    prisma.order.aggregate({
      where: {
        paymentStatus: "COMPLETED",
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        paymentStatus: "COMPLETED",
        status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
    }),
    prisma.product.count({
      where: {
        lowStockAlert: true,
      },
    }),
  ]);

  return {
    totalRevenue: Number(totalRevenue._sum.total) || 0,
    totalOrders,
    lowStockCount,
  };
}

export const getProductPerformance = async (
  productId: string,
  timeFrame: "7d" | "30d" | "lastMonth" | "allMonths"
) => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(now);
  let groupBy: "day" | "month";

  switch (timeFrame) {
    case "7d":
      startDate = startOfDay(subDays(now, 7));
      groupBy = "day";
      break;
    case "30d":
      startDate = startOfDay(subDays(now, 30));
      groupBy = "day";
      break;
    case "lastMonth":
      startDate = startOfMonth(subMonths(now, 1));
      endDate = endOfMonth(subMonths(now, 1));
      groupBy = "day";
      break;
    case "allMonths":
      startDate = startOfMonth(subMonths(now, 12));
      groupBy = "month";
      break;
    default:
      startDate = startOfDay(subDays(now, 30));
      groupBy = "day";
  }

  const productOrders = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        orderDate: {
          gte: startDate,
          lte: endDate,
        },
        paymentStatus: "COMPLETED",
      },
    },
    select: {
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      order: {
        select: {
          orderDate: true,
        },
      },
    },
    orderBy: {
      order: {
        orderDate: "asc",
      },
    },
  });

  // Group by day or month
  const groupedData = productOrders.reduce((acc, item) => {
    const date = new Date(item.order.orderDate);
    const key =
      groupBy === "day" ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM");

    if (!acc[key]) {
      acc[key] = {
        revenue: 0,
        quantity: 0,
        orders: 0,
      };
    }
    acc[key].revenue += Number(item.totalPrice);
    acc[key].quantity += item.quantity;
    acc[key].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number; orders: number }>);

  // Fill missing dates/months with 0
  const result: unknown[] = [];

  if (groupBy === "day") {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      const data = groupedData[key] || { revenue: 0, quantity: 0, orders: 0 };
      result.push({
        date: format(day, "MMM dd"),
        revenue: data.revenue,
        quantity: data.quantity,
        orders: data.orders,
        avgPrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
      });
    });
  } else {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    months.forEach((month) => {
      const key = format(month, "yyyy-MM");
      const data = groupedData[key] || { revenue: 0, quantity: 0, orders: 0 };
      result.push({
        date: format(month, "MMM yyyy"),
        revenue: data.revenue,
        quantity: data.quantity,
        orders: data.orders,
        avgPrice: data.quantity > 0 ? data.revenue / data.quantity : 0,
      });
    });
  }

  return result;
};

export const getProductDetails = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: true,
      orderItems: {
        where: {
          order: {
            paymentStatus: "COMPLETED",
            orderDate: {
              gte: subMonths(new Date(), 1),
            },
          },
        },
        select: {
          quantity: true,
          totalPrice: true,
          order: {
            select: {
              orderDate: true,
            },
          },
        },
        orderBy: {
          order: {
            orderDate: "desc",
          },
        },
        take: 50,
      },
    },
  });

  if (!product) return null;

  // Calculate product metrics
  const lastMonthRevenue = product.orderItems.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );
  const lastMonthQuantity = product.orderItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // Get previous month data for comparison
  const twoMonthsAgo = subMonths(new Date(), 2);
  const oneMonthAgo = subMonths(new Date(), 1);

  const previousMonthOrders = await prisma.orderItem.findMany({
    where: {
      productId,
      order: {
        paymentStatus: "COMPLETED",
        orderDate: {
          gte: twoMonthsAgo,
          lt: oneMonthAgo,
        },
      },
    },
    select: {
      totalPrice: true,
      quantity: true,
    },
  });

  const previousMonthRevenue = previousMonthOrders.reduce(
    (sum, item) => sum + Number(item.totalPrice),
    0
  );
  const previousMonthQuantity = previousMonthOrders.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const revenueChange = lastMonthRevenue - previousMonthRevenue;
  const quantityChange = lastMonthQuantity - previousMonthQuantity;
  const revenueChangePercent =
    previousMonthRevenue > 0
      ? (revenueChange / previousMonthRevenue) * 100
      : lastMonthRevenue > 0
      ? 100
      : 0;

  const serializedProduct = {
    ...product,
    price: product.price.toNumber(),
    costPrice: product.costPrice.toNumber(),
    orderItems: product.orderItems.map((item) => ({
      ...item,
      totalPrice: item.totalPrice.toNumber(),
    })),
  };

  return {
    ...serializedProduct,
    lastMonthRevenue,
    lastMonthQuantity,
    previousMonthRevenue,
    previousMonthQuantity,
    revenueChange,
    quantityChange,
    revenueChangePercent,
    currentStockStatus:
      product.currentStock <= product.minStockLevel
        ? "LOW"
        : product.currentStock <= product.minStockLevel * 2
        ? "WARNING"
        : "GOOD",
  };
};
