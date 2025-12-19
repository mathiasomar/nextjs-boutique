"use server";

import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const customerSchema = z.object({
  firstName: z.string().min(1, "First Name must be at least 2 characters!"),
  lastName: z.string().min(1, "Last Name must be at least 2 characters!"),
  phone: z.string(),
  customerType: z.enum(["REGULAR", "VIP", "WHOLESALE"]),
});

export const getCustomers = async () => {
  try {
    const customers = await prisma.customer.findMany({});
    return customers;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { error: "Error fetching customers" };
  }
};

export const addCustomer = async (
  formData: Prisma.CustomerUncheckedCreateInput
) => {
  const validatedData = customerSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
    customerType: formData.customerType,
  });

  if (!validatedData) {
    return { error: "Invalid customer data" };
  }
  try {
    const customer = await prisma.customer.create({
      data: validatedData.data!,
    });
    revalidatePath("/dashboard/categories");
    return customer;
  } catch (error) {
    console.error("Error adding customer:", error);
    return { error: "Error adding customer" };
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    await prisma.customer.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete customer error:", error);
    return { error: "Failed to delete customer" };
  }
};
