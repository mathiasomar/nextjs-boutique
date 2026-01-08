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
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

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
    return {
      success: false,
      error: "Customer already exists",
      code: "CUSTOMER_EXISTS",
      customerId: checkCustomerExists.id,
    };
  }

  try {
    const customer = await prisma.customer.create({
      data: validatedData.data!,
    });

    if (!customer) {
      return {
        success: false,
        error: "Failed to create customer",
        code: "CUSTOMER_CREATION_FAILED",
      };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_CUSTOMER",
        entityType: "Product",
        entityId: customer.id,
      },
    });

    revalidatePath("/dashboard/customers");
    return customer;
  } catch (error) {
    console.error("Error adding customer:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for Prisma errors
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "Customer with similar details already exists",
          code: "DUPLICATE_CUSTOMER",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create customer. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }
};

export const getCustomerById = async (id: string) => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

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
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

  try {
    const customer = await prisma.customer.delete({
      where: { id },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "DELETE_CUSTOMER",
        entityType: "Product",
        entityId: customer.id,
      },
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
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  if (!session?.user) throw new Error("Unauthorized");

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

    if (!customer) {
      return {
        success: false,
        error: "Failed to updtae customer",
        code: "CUSTOMER_UPDATE_FAILED",
      };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_CUSTOMER",
        entityType: "Product",
        entityId: customer.id,
      },
    });

    revalidatePath("/dashboard/customers");
    return customer;
  } catch (error) {
    console.error("Error updating customer:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for Prisma errors
      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "Customer with similar details already exists",
          code: "DUPLICATE_CUSTOMER",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create customer. Please try again.",
      code: "UNKNOWN_ERROR",
    };
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "DELETE_MANY_CUSTOMER",
        entityType: "Product",
        entityId: "",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting customers:", error);
    return { error: "Error deleting customers" };
  }
};
