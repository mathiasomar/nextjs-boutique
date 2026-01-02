"use server";

import { Prisma } from "@/generated/prisma/client";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface FilterPayment {
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export async function getPayments(filters: FilterPayment = {}) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { startDate, endDate, paymentStatus, paymentMethod } = filters;

  const where: Prisma.PaymentWhereInput = {};

  if (startDate && endDate) {
    where.processedAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (startDate && !endDate) {
    where.processedAt = {
      gte: new Date(startDate),
    };
  }

  if (!startDate && endDate) {
    where.processedAt = {
      lte: new Date(endDate),
    };
  }

  if (paymentStatus) {
    where.status = paymentStatus;
  }

  if (paymentMethod) {
    where.method = paymentMethod;
  }

  try {
    const payments = await prisma.payment.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      payments: payments.map((payment) => ({
        ...payment,
        amount: payment.amount.toNumber(),
      })),
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, message: "Failed to fetch payments" };
  }
}
