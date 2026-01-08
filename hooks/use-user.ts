import {
  deleteManyUsers,
  getuser,
  getUsers,
  updateUser,
} from "@/app/actions/user.action";
import { User } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await getUsers();
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    },
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const result = await getuser(id as string);
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<User> & { id: string }): Promise<User> => {
      const result = await updateUser(id, data);
      if (!result) {
        throw new Error("User not found");
      }
      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["users", variables.id], data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string[]): Promise<void> => {
      await deleteManyUsers(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
