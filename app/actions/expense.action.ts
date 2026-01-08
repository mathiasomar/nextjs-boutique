"use server";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface FilterExpense {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const getExpenses = async (filters: FilterExpense = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { startDate, endDate, search } = filters;

  const where: Prisma.ExpenseWhereInput = {};

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  if (search) {
    where.expense = {
      contains: search,
      mode: "insensitive",
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
    const expenses = await prisma.expense.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      expenses: expenses.map((expense) => ({
        ...expense,
        amount: expense.amount.toNumber(),
      })),
    };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { error: "Error fetching expenses" };
  }
};

export const getExpenseById = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true } } },
    });
    return {
      success: true,
      expense: {
        ...expense,
        amount: expense?.amount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error fetching expense:", error);
    return { error: "Error fetching expense" };
  }
};

export const createExpense = async (
  formData: Prisma.ExpenseUncheckedCreateInput
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const expense = await prisma.expense.create({
      data: { ...formData, userId: session.user.id },
    });
    if (!expense) {
      return {
        success: false,
        error: `Expense not found:`,
        code: "EXPENSE_NOT_FOUND",
      };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_EXPENSE",
        entityType: "Product",
        entityId: expense.id,
      },
    });

    return {
      success: true,
      expense: {
        ...expense,
        amount: expense.amount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Create order error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for Prisma errors
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "expense with similar details already exists",
          code: "DUPLICATE_EXPENSE",
        };
      }

      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          error: "Invalid user reference",
          code: "REFERENCE_ERROR",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create expense. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};

export const updateExpense = async (
  id: string,
  formData: Prisma.ExpenseUpdateInput
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: formData,
    });
    if (!expense) {
      return {
        success: false,
        error: `Failed to update expense`,
        code: "EXPENSE_UPDATE_ERROR",
      };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_EXPENSE",
        entityType: "Product",
        entityId: expense.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating expense:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for Prisma errors
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "expense with similar details already exists",
          code: "DUPLICATE_EXPENSE",
        };
      }

      if (error.message.includes("Foreign key constraint")) {
        return {
          success: false,
          error: "Invalid user reference",
          code: "REFERENCE_ERROR",
        };
      }
    }

    return {
      success: false,
      error: "Failed to update expense. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};

export const deleteManyExpenses = async (ids: string[]) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    await prisma.expense.deleteMany({ where: { id: { in: ids } } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting expenses:", error);
    return { error: "Error deleting expenses" };
  }
};
