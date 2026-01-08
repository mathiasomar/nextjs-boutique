import {
  addCategory,
  deleteCategory,
  getCategories,
} from "@/app/actions/category.action";
import {
  createProduct,
  deleteManyProducts,
  getProductById,
  getProducts,
  updateProduct,
  updateStock,
} from "@/app/actions/product.action";
import { InventoryType, Prisma, Product } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProducts = (filters?: {
  search?: string;
  stock?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const result = await getProducts(filters);
      if (!result) {
        throw new Error("User not found");
      }

      const products = result.products?.map((product) => ({
        ...product,
        price: new Decimal(product.price.toString()),
        costPrice: new Decimal(product.costPrice.toString()),
      }));

      return { ...result, products };
    },
    keepPreviousData: true,
  });
};

export const useProduct = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      const result = await getProductById(id as string);
      if (!result) {
        throw new Error("Product not found");
      }

      return {
        ...result,
        product: {
          ...result.product,
          price: new Decimal(result.product!.price.toString()),
          costPrice: new Decimal(result.product!.costPrice.toString()),
        },
      };
    },
    enabled: options?.enabled ?? true, // Default to true, but can be overridden
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: Prisma.ProductUncheckedCreateInput
    ): Promise<Product> => {
      const result = await createProduct(data);
      if (!result.product) {
        throw new Error("User not found");
      }
      return {
        ...result.product,
        price: new Decimal(result.product.price.toString()),
        costPrice: new Decimal(result.product.costPrice.toString()),
      };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["products", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Prisma.ProductUncheckedUpdateInput> & {
      id: string;
    }): Promise<Product> => {
      const result = await updateProduct(id, data);
      if (!result.product) {
        throw new Error("Update failed");
      }
      return {
        ...result.product,
        price: new Decimal(result.product.price.toString()),
        costPrice: new Decimal(result.product.costPrice.toString()),
      };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["products", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      type,
      reason,
    }: {
      productId: string;
      quantity: number;
      type: InventoryType;
      reason?: string;
    } & {
      id?: string;
    }): Promise<{ success?: boolean; error?: string }> => {
      const result = await updateStock(productId, quantity, type, reason);
      if (!result) {
        throw new Error("Update failed");
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["products", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string[]): Promise<void> => {
      await deleteManyProducts(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Categories

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategories();
      if (!result) {
        throw new Error("Category not found");
      }
      return result;
    },
  });
};

export const useCreatecategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
    }): Promise<{ id: string; name: string } | { error: string }> => {
      const result = await addCategory(data);
      if (!result) {
        throw new Error("Failed to add category");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await deleteCategory(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
