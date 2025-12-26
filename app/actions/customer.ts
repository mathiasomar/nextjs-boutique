"use server";

import { Prisma } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CustomerFilters } from "../types";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const customerSchema = z.object({
  firstName: z.string().min(1, "First Name must be at least 2 characters!"),
  lastName: z.string().min(1, "Last Name must be at least 2 characters!"),
  phone: z.string().optional(),
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
      message: "Invalid email address!",
    })
    .optional(),
  address: z.string().optional(),
  customerType: z.enum(["REGULAR", "VIP", "WHOLESALE"]),
});

export const getCustomers = async (filters: CustomerFilters = {}) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const { search, type } = filters;

  const where: Prisma.CustomerWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (type !== undefined) {
    where.customerType = type;
  }
  try {
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
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
    phone: formData.phone || "",
    email: formData.email || "",
    address: formData.address || "",
    customerType: formData.customerType,
  });

  if (!validatedData) {
    return { error: "Invalid customer data" };
  }

  const checkCustomerExists = await prisma.customer.findUnique({
    where: {
      email: formData.email as string,
    },
  });

  if (checkCustomerExists) {
    return { error: "Customer already exists" };
  }
  try {
    const customer = await prisma.customer.create({
      data: validatedData.data!,
    });
    revalidatePath("/dashboard/customers");
    return customer;
  } catch (error) {
    console.error("Error adding customer:", error);
    return { error: "Error adding customer" };
  }
};

export const getCustomerById = async (id: string) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return { error: "Customer not found" };
    }

    return { success: true, customer };
  } catch (error) {
    console.error("Get customer error:", error);
    return { error: "Failed to fetch customer" };
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

export const updateCustomer = async (
  id: string,
  formData: Prisma.CustomerUncheckedUpdateInput
) => {
  const validatedData = customerSchema.safeParse({
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone || "",
    email: formData.email || "",
    address: formData.address || "",
    loyaltyPoints: formData.loyaltyPoints || 0,
    customerType: formData.customerType,
  });

  if (!validatedData) {
    return { error: "Invalid customer data" };
  }
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: validatedData.data!,
    });
    revalidatePath("/dashboard/customers");
    return customer;
  } catch (error) {
    console.error("Error updating customer:", error);
    return { error: "Error updating customer" };
  }
};

export const deleteManyCustomers = async (ids: string[]) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  const checkCustomerInOrders = await prisma.order.findFirst({
    where: {
      customerId: { in: ids },
    },
  });

  if (checkCustomerInOrders) {
    return { error: "Cannot delete customers with existing orders" };
  }

  try {
    await prisma.customer.deleteMany({
      where: { id: { in: ids } },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting customers:", error);
    return { error: "Error deleting customers" };
  }
};
