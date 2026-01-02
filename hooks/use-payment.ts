"use client";

import { initiateMpesaPayment } from "@/app/actions/payment";
import { Prisma } from "@/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: Prisma.PaymentUncheckedCreateInput) => {
      const result = await initiateMpesaPayment(formData);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.setQueryData(["payments", variables.id], data);
    },
    onError: (error: Error) => {
      console.error(`Payment failed: ${error.message}`);
    },
  });
};
