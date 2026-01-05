"use client";
import { getPayments } from "@/app/actions/payment";
import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";
import { Decimal } from "@prisma/client/runtime/client";
import { useQuery } from "@tanstack/react-query";

export const usePayments = (filters?: {
  search?: string;
  startDate?: string;
  endDate?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}) => {
  return useQuery({
    queryKey: ["payments", filters],
    queryFn: async () => {
      const result = await getPayments(filters);
      if (!result) {
        throw new Error("Payments not found");
      }

      const payments = result.payments?.map((payment) => ({
        ...payment,
        amount: new Decimal(payment.amount.toString() || 0),
      }));

      return { ...result, payments };
    },
    keepPreviousData: true,
  });
};
