"use client";

import {
  createExpense,
  deleteManyExpenses,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "@/app/actions/expense";
import { Expense, Prisma } from "@/generated/prisma/client";
import { CustomError } from "@/lib/error-class";
import { Decimal } from "@prisma/client/runtime/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useExpenses = (filters?: {
  startDate?: string;
  endDate?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      const result = await getExpenses(filters);
      if (!result) {
        throw new Error("Order not found");
      }

      const expenses = result.expenses?.map((expense) => ({
        ...expense,
        amount: new Decimal(expense.amount.toString() || 0),
      }));

      return { ...result, expenses };
    },
    keepPreviousData: true,
  });
};

export const useExpense = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const result = await getExpenseById(id);
      if (!result) {
        throw new Error("Expense not found");
      }

      return result;
    },
    enabled: options?.enabled ?? true, // Default to true, but can be overridden
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Prisma.ExpenseUncheckedCreateInput
    ): Promise<Expense> => {
      const result = await createExpense(data);
      // If the server action returns an error, throw it as a custom error
      if (!result.success) {
        throw new CustomError(
          result.error || "Failed to create order",
          result.code
        );
      }

      if (!result.expense) {
        throw new CustomError("Expense creation failed", "NO_EXPENSE_RETURNED");
      }

      return {
        ...result.expense,
        amount: new Decimal(result.expense.amount.toString() || 0),
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.setQueryData(["expenses", variables.id], data);
    },
    onError: (error: CustomError) => {
      console.error("Order creation mutation error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Prisma.ExpenseUncheckedUpdateInput> & { id: string }): Promise<{
      success?: boolean;
    }> => {
      const result = await updateExpense(id, data);
      if (!result.success) {
        throw new CustomError(
          result.error || "Failed to create expense",
          result.code
        );
      }

      if (!result) {
        throw new CustomError("Expense creation failed", "NO_EXPENSE_RETURNED");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.setQueryData(["expenses", variables.id], data);
    },
    onError: (error: Error) => {
      // Log error to your error tracking service
      console.error("Expense update mutation error:", error.message);
    },
  });
};

export const useDeleteExpenses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string[]): Promise<void> => {
      await deleteManyExpenses(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};
