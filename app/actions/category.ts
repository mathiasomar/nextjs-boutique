"use server";

import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name must be at least 2 characters!"),
});

export const getCategories = async () => {
  try {
    const categories = await prisma.category.findMany({});
    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { error: "Error fetching categories" };
  }
};

export const addCategory = async (data: { name: string }) => {
  const validatedData = categorySchema.safeParse({
    name: data.name,
  });

  if (!validatedData) {
    return { error: "Invalid category data" };
  }
  try {
    const category: Prisma.CategoryCreateInput = await prisma.category.create({
      data: validatedData.data!,
    });
    revalidatePath("/dashboard/categories");
    return category;
  } catch (error) {
    console.error("Error adding category:", error);
    return { error: "Error adding category" };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return { error: "Cannot delete category with existing products" };
    }

    await prisma.category.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete category error:", error);
    return { error: "Failed to delete category" };
  }
};
