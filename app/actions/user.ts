"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EditUserProps } from "../types";

export const getUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: "Error fetching users" };
  }
};

export const revalidateUser = async () => {
  revalidatePath("/dashboard/users");
};

export const deleteManyUsers = async (ids: string[]) => {
  if (!ids.length) return;

  await prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  revalidatePath("/dashboard/users");
};

export const getuser = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: "Error fetching user" };
  }
};

export const updateUser = async (id: string, data: EditUserProps) => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  revalidatePath(`/dashboard/users/${id}`);
  return user;
};
