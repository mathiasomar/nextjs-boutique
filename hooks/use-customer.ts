import {
  addCustomer,
  deleteManyCustomers,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "@/app/actions/customer.action";
import { Customer, Prisma } from "@/generated/prisma/client";
import { CustomError } from "@/lib/error-class";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCustomers = (filters?: {
  search?: string;
  type?: "REGULAR" | "VIP" | "WHOLESALE";
}) => {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: async () => {
      const result = await getCustomers(filters);
      if (!result) {
        throw new Error("Customer not found");
      }
      return result;
    },
    keepPreviousData: true,
  });
};

export const useCustomer = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: async () => {
      const result = await getCustomerById(id as string);
      if (!result) {
        throw new Error("Customer not found");
      }
      return result;
    },
    enabled: options?.enabled ?? true, // Default to true, but can be overridden
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Prisma.CustomerUncheckedCreateInput
    ): Promise<Customer | { error: string }> => {
      const result = await addCustomer(data);

      if (!result) {
        throw new CustomError(
          "Customer creation failed",
          "NO_CUSTOMER_RETURNED"
        );
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: CustomError) => {
      // Log error to your error tracking service
      console.error("Customer creation mutation error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Customer> & { id: string }): Promise<Customer> => {
      const result = await updateCustomer(id, data);
      if (!result) {
        throw new CustomError("Customer update failed", "NO_CUSTOMER_RETURNED");
      }
      return result as Customer;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["customers", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (error: CustomError) => {
      // Log error to your error tracking service
      console.error("Customer update mutation error:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string[]): Promise<void> => {
      await deleteManyCustomers(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
