"use server";

// import { colors, sizes } from "@/constants/product";
import { Prisma } from "@/generated/prisma/client";
import { InventoryType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ProductFilters } from "../types";
// import { z } from "zod";

// const productSchema = z.object({
//   sku: z.string().min(3),
//   name: z.string().min(2),
//   description: z.string().optional(),
//   categoryId: z.string(),
//   brand: z.string().optional(),
//   price: z.coerce.number().positive(),
//   costPrice: z.coerce.number().positive(),
//   size: z.array(z.enum(sizes)),
//   color: z.array(z.enum(colors)),
//   material: z.string().optional(),
//   currentStock: z.coerce.number().int().min(0),
//   minStockLevel: z.coerce.number().int().min(0),
//   images: z.record(z.enum(colors), z.string()),
// });

export const getProducts = async (filters: ProductFilters = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { search, stock, isActive = true } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive,
  };

  // Text search
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  // Price range
  // if (minPrice !== undefined || maxPrice !== undefined) {
  //   where.price = {}
  //   if (minPrice !== undefined) {
  //     where.price.gte = minPrice
  //   }
  //   if (maxPrice !== undefined) {
  //     where.price.lte = maxPrice
  //   }
  // }

  // Stock filters
  if (stock !== undefined) {
    if (stock == "inStock") {
      where.currentStock = { gt: 0 };
    } else {
      where.currentStock = 0;
    }
  }

  try {
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to string to preserve precision
    const serializedProducts = products.map((product) => ({
      ...product,
      price: product.price.toNumber(), // Convert Decimal to string
      costPrice: product.costPrice.toNumber(), // Convert Decimal to string
    }));

    // Transform Decimal fields to plain numbers
    return {
      success: true,
      products: serializedProducts,
    };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product" };
  }
};

export const getProductById = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventoryLogs: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!product) return null;

    // Convert Decimal to string
    const serializedProduct = {
      ...product,
      price: product.price.toNumber(),
      costPrice: product.costPrice.toNumber(),
    };

    // Transform Decimal fields to plain numbers
    return { success: true, product: serializedProduct };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product" };
  }
};

export const createProduct = async (
  formData: Prisma.ProductUncheckedCreateInput
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  if (
    !formData.color ||
    !Array.isArray(formData.color) ||
    formData.color.length === 0
  ) {
    return { error: "At least one color is required" };
  }

  if (!formData.images || typeof formData.images !== "object") {
    return { error: "Images object is required" };
  }

  const missingColors = formData.color.filter(
    (col) => !(col in (formData.images as Record<string, unknown>))
  );
  if (missingColors.length > 0) {
    return {
      error: `Images missing for color(s): ${missingColors.join(", ")}`,
    };
  }

  // const validatedData = productSchema.safeParse({
  //   sku: formData.sku,
  //   name: formData.name,
  //   description: formData.description,
  //   categoryId: formData.categoryId,
  //   brand: formData.brand,
  //   price: formData.price,
  //   costPrice: formData.costPrice,
  //   material: formData.material,
  //   currentStock: formData.currentStock,
  //   minStockLevel: formData.minStockLevel,
  // });

  // if (!validatedData.success) {
  //   return { error: "Invalid product data" };
  // }

  try {
    const product = await prisma.product.create({
      data: {
        ...formData,
        size: formData.size as string[],
        color: formData.color as string[],
        images: formData.images as Record<string, string>,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });

    if (!product) {
      return { error: "Failed to create product" };
    }

    // Create inventory log
    await prisma.inventoryLog.create({
      data: {
        id: `inv_${Date.now()}`,
        productId: product.id,
        type: "PURCHASE",
        quantity: formData.currentStock || 0,
        previousStock: 0,
        newStock: formData.currentStock || 0,
        reason: "Initial stock",
        userId: session.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_PRODUCT",
        entityType: "Product",
        entityId: product.id,
      },
    });

    // revalidatePath("/dashboard/products");
    return {
      success: true,
      product: {
        ...product,
        price: product.price.toNumber(),
        costPrice: product.costPrice.toNumber(),
      },
    };
  } catch (error) {
    console.error("Create product error:", error);
    return { error: "Failed to create product" };
  }
};

export const updateProduct = async (
  id: string,
  formData: Prisma.ProductUncheckedUpdateInput
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  // const validatedData = productSchema.partial().safeParse({
  //   sku: formData.sku,
  //   name: formData.name,
  //   description: formData.description,
  //   categoryId: formData.categoryId,
  //   brand: formData.brand,
  //   price: formData.price,
  //   costPrice: formData.costPrice,
  //   size: formData.size,
  //   color: formData.color,
  //   material: formData.material,
  //   currentStock: formData.currentStock,
  //   minStockLevel: formData.minStockLevel,
  //   images: formData.images,
  // });

  // if (!validatedData.success) {
  //   return { error: "Invalid product data" };
  // }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...formData,
        updatedBy: session.user.id,
      },
    });

    if (!product) {
      return { error: "Failed to update product" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_PRODUCT",
        entityType: "Product",
        entityId: product.id,
      },
    });

    // revalidatePath("/dashboard/products");
    // revalidatePath(`/dashboard/products/${id}`);
    return {
      success: true,
      product: {
        ...product,
        price: product.price.toNumber(),
        costPrice: product.costPrice.toNumber(),
      },
    };
  } catch (error) {
    console.error("Update product error:", error);
    return { error: "Failed to update product" };
  }
};

export const deleteProduct = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    // Check if product has orders
    const orderItems = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItems > 0) {
      return { error: "Cannot delete product with existing orders" };
    }

    // Delete inventory logs first
    // await prisma.inventoryLog.deleteMany({
    //   where: { productId: id },
    // });

    const product = await prisma.product.delete({
      where: { id },
    });

    if (!product) {
      return { error: "Failed to delete product" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "DELETE_PRODUCT",
        entityType: "Product",
        entityId: id,
      },
    });

    // revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { error: "Failed to delete product" };
  }
};

export const updateStock = async (
  productId: string,
  quantity: number,
  type: InventoryType,
  reason?: string
) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    const newStock =
      type === "SALE" || type === "DAMAGE"
        ? product.currentStock - quantity
        : product.currentStock + quantity;

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
        lowStockAlert: newStock <= product.minStockLevel ? true : false,
      },
    });

    // Create inventory log
    await prisma.inventoryLog.create({
      data: {
        id: `inv_${Date.now()}`,
        productId,
        type,
        quantity,
        previousStock: product.currentStock,
        newStock,
        reason,
        userId: session.user.id,
      },
    });

    // revalidatePath("/inventory");
    // revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Update stock error:", error);
    return { error: "Failed to update stock" };
  }
};

export const deleteManyProducts = async (ids: string[]) => {
  if (!ids.length) return;

  // Check if any products have orders
  const orderItems = await prisma.orderItem.count({
    where: { productId: { in: ids } },
  });

  if (orderItems > 0) {
    return { error: "Cannot delete products with existing orders" };
  }

  // Delete inventory logs first
  await prisma.inventoryLog.deleteMany({
    where: {
      productId: { in: ids },
    },
  });

  await prisma.product.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  // revalidatePath("/dashboard/products");
  return { success: true };
};
