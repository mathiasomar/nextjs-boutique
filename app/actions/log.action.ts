"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { activityLogFilters, InventoryLogFilters } from "../types";
import { Prisma } from "@/generated/prisma/client";

export const getActivityLogs = async (filters: activityLogFilters = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { search } = filters;

  const where: Prisma.ActivityLogWhereInput = {};

  if (search) {
    where.OR = [
      { action: { contains: search, mode: "insensitive" } },
      { entityType: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const activityLogs = await prisma.activityLog.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return activityLogs;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return { error: "Error fetching activity logs" };
  }
};

export const getInventoryLogs = async (filters: InventoryLogFilters = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { productId, type } = filters;

  const where: Prisma.InventoryLogWhereInput = {};

  if (type) {
    where.type = type;
  }

  if (productId) {
    where.productId = productId;
  }

  try {
    const inventoryLogs = await prisma.inventoryLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return inventoryLogs;
  } catch (error) {
    console.error("Error fetching inventory logs:", error);
    return { error: "Error fetching inventory logs" };
  }
};
