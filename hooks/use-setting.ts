"use client";

import {
  addSetting,
  getSettings,
  getSettingsByCategory,
  SystemSetting,
  updateSetting,
  updateSettings,
  uploadFile,
} from "@/app/actions/setting.action";
import { SettingCategory, SystemSettings } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useSettings = (params?: {
  category?: SettingCategory;
  isPublic?: boolean;
}) => {
  return useQuery({
    queryKey: ["settings", params?.category, params?.isPublic],
    queryFn: async () => {
      const result = await getSettings(params);
      if (!result) {
        throw new Error("Setting not found");
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useSettingsByCategory = (category: SettingCategory) => {
  return useQuery({
    queryKey: ["settingsByCategory", category],
    queryFn: async () => {
      const result = await getSettingsByCategory(category);
      if (!result) {
        throw new Error("Setting not found");
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SystemSetting): Promise<SystemSettings> => {
      const result = await addSetting(data);
      if (!result) {
        throw new Error("Setting not found");
      }

      return result as SystemSettings;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["settingsByCategory"] });
      queryClient.setQueryData(["settings", variables.category], data);
      queryClient.setQueryData(
        ["settingsByCategory", variables.category],
        data
      );
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
    },
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: string;
    }): Promise<SystemSettings> => {
      const result = await updateSetting(key, value);
      if (!result) {
        throw new Error("Setting not found");
      }

      return result as SystemSettings;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["settingsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
    },
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      settings: Record<string, string | number | boolean | object>
    ): Promise<SystemSettings[]> => {
      const result = await updateSettings(settings);
      if (!result) {
        throw new Error("Setting not found");
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["settingsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      formdata: FormData;
    }): Promise<SystemSettings> => {
      const result = await uploadFile(data.formdata);
      if (!result) {
        throw new Error("User not found");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["settingsByCategory"] });
    },
  });
};
