"use server";

import { Prisma } from "@/generated/prisma/client";
import { InventoryType } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

const productSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string(),
  brand: z.string().optional(),
  price: z.coerce.number().positive(),
  costPrice: z.coerce.number().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  currentStock: z.coerce.number().int().min(0),
  minStockLevel: z.coerce.number().int().min(0),
  images: z.array(z.string()).optional(),
});

export const getProducts = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return products;
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

  const validatedData = productSchema.safeParse({
    sku: formData.sku,
    name: formData.name,
    description: formData.description,
    categoryId: formData.categoryId,
    brand: formData.brand,
    price: formData.price,
    costPrice: formData.costPrice,
    size: formData.size,
    color: formData.color,
    material: formData.material,
    currentStock: formData.currentStock,
    minStockLevel: formData.minStockLevel,
    images: formData.images,
  });

  if (!validatedData.success) {
    return { error: "Invalid product data" };
  }

  try {
    const product = await prisma.product.create({
      data: {
        ...validatedData.data,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      },
    });

    // Create inventory log
    await prisma.inventoryLog.create({
      data: {
        id: `inv_${Date.now()}`,
        productId: product.id,
        type: "PURCHASE",
        quantity: validatedData.data.currentStock,
        previousStock: 0,
        newStock: validatedData.data.currentStock,
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

    revalidatePath("/dashboard/products");
    return { success: true, product };
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

  const validatedData = productSchema.partial().safeParse({
    sku: formData.sku,
    name: formData.name,
    description: formData.description,
    categoryId: formData.categoryId,
    brand: formData.brand,
    price: formData.price,
    costPrice: formData.costPrice,
    size: formData.size,
    color: formData.color,
    material: formData.material,
    currentStock: formData.currentStock,
    minStockLevel: formData.minStockLevel,
    images: formData.images,
  });

  if (!validatedData.success) {
    return { error: "Invalid product data" };
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...validatedData.data,
        updatedBy: session.user.id,
      },
    });

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

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id}`);
    return { success: true, product };
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

    await prisma.product.delete({
      where: { id },
    });

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

    revalidatePath("/dashboard/products");
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
        lowStockAlert: newStock <= product.minStockLevel,
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

    revalidatePath("/inventory");
    revalidatePath(`/products/${productId}`);
    return { success: true };
  } catch (error) {
    console.error("Update stock error:", error);
    return { error: "Failed to update stock" };
  }
};
