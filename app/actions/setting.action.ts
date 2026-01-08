// app/actions/settings.actions.ts
"use server";

import { SettingCategory } from "@/generated/prisma/enums";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

// Validation schemas
const settingSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.object({})]),
  type: z.enum(["string", "number", "boolean", "json", "file"]),
});

const updateSettingsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.object({})])
);

export type SystemSetting = {
  id: string;
  key: string;
  value: string | null;
  type: string;
  category: SettingCategory;
  displayName: string;
  description?: string | null; // Updated type
  isPublic: boolean;
  updatedAt: Date;
};

// Get all settings (with optional filtering)
export const getSettings = async (params?: {
  category?: SettingCategory;
  isPublic?: boolean;
}): Promise<SystemSetting[]> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const settings = await prisma.systemSettings.findMany({
      where: {
        ...(params?.category && { category: params.category }),
        ...(params?.isPublic !== undefined && { isPublic: params.isPublic }),
      },
      include: {
        updatedBy: {
          select: {
            name: true,
          },
        },
        uploadedFiles: true,
      },
      orderBy: { key: "asc" },
    });

    return settings;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    throw new Error("Failed to fetch settings");
  }
};

// Add setting
export const addSetting = async (setting: SystemSetting) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const newSetting = await prisma.systemSettings.create({
      data: { ...setting, updatedById: session.user.id, updatedAt: new Date() },
    });
    revalidatePath("/dashboard/settings");

    if (!newSetting) {
      return { error: "Failed to create the setting" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "CREATE_SETTING",
        entityType: "Setting",
        entityId: newSetting.id,
      },
    });

    return newSetting;
  } catch (error) {
    console.error("Failed to add setting:", error);
    throw new Error("Failed to add setting");
  }
};

// Get a single setting by key
export const getSetting = async (
  key: string
): Promise<SystemSetting | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });

    return setting;
  } catch (error) {
    console.error(`Failed to fetch setting ${key}:`, error);
    throw new Error(`Failed to fetch setting ${key}`);
  }
};

export const getSettingsByCategory = async (
  category: SettingCategory
): Promise<SystemSetting[] | null> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const setting = await prisma.systemSettings.findMany({
      where: { category },
    });

    return setting;
  } catch (error) {
    console.error(`Failed to fetch setting ${category}:`, error);
    throw new Error(`Failed to fetch setting ${category}`);
  }
};

// Update a single setting
export async function updateSetting(
  key: string,
  value: string | number | boolean | object
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    // Validate input
    const validated = settingSchema.parse({
      key,
      value,
      type: typeof value === "object" ? "json" : typeof value,
    });

    // Convert value to string for storage
    const stringValue =
      typeof validated.value === "object"
        ? JSON.stringify(validated.value)
        : String(validated.value);

    const updatedSetting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value: stringValue,
        type: validated.type,
        updatedById: session.user.id,
      },
      create: {
        key,
        value: stringValue,
        type: validated.type,
        category: "general",
        displayName: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        updatedById: session.user.id,
      },
    });

    if (!updatedSetting) {
      return { error: "Failed to update the setting" };
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_SETTING",
        entityType: "Setting",
        entityId: updatedSetting.id,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard"); // Revalidate home page if settings affect it

    return updatedSetting;
  } catch (error) {
    console.error(`Failed to update setting ${key}:`, error);
    throw new Error(`Failed to update setting ${key}`);
  }
}

// Bulk update settings
export const updateSettings = async (
  settings: Record<string, string | number | boolean | object>
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    // Validate input
    const validated = updateSettingsSchema.parse(settings);

    const updates = Object.entries(validated).map(([key, value]) => ({
      key,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
      type: typeof value === "object" ? "json" : typeof value,
    }));

    const transaction = await prisma.$transaction(
      updates.map((update) =>
        prisma.systemSettings.upsert({
          where: { key: update.key },
          update: {
            value: update.value,
            type: update.type,
            updatedById: session.user.id,
          },
          create: {
            key: update.key,
            value: update.value,
            type: update.type,
            category: "general",
            displayName: update.key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase()),
            updatedById: session.user.id,
          },
        })
      )
    );

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPDATE_SETTINGS",
        entityType: "Settings",
        entityId: null,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return transaction;
  } catch (error) {
    console.error("Failed to update settings:", error);
    throw new Error("Failed to update settings");
  }
};

// Upload file (e.g., logo)
export const uploadFile = async (formData: FormData) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!session?.user) throw new Error("Unauthorized");

    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file || !key) {
      throw new Error("File and key are required");
    }

    // Here you would upload to your storage (S3, Cloudinary, local, etc.)
    // This is a simplified example - implement based on your storage solution
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Example: Save to local filesystem (for development)
    const filename = `${Date.now()}-${file.name}`;
    const path = `/uploads/${filename}`;

    // In production, use cloud storage:
    // const result = await uploadToCloudStorage(buffer, filename, file.type);

    // Update the setting with file reference
    const updatedSetting = await prisma.systemSettings.upsert({
      where: { key },
      update: {
        value: path, // or cloud URL
        type: "file",
        updatedById: session.user.id,
      },
      create: {
        key,
        value: path,
        type: "file",
        category: "branding",
        displayName: "Logo",
        updatedById: session.user.id,
      },
    });

    // Optionally save file info in UploadedFile table
    await prisma.uploadedFile.create({
      data: {
        filename: file.name,
        path,
        mimeType: file.type,
        size: file.size,
        key,
        uploadedById: session.user.id,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        id: `act_${Date.now()}`,
        userId: session.user.id,
        action: "UPLOAD_FILE",
        entityType: "Setting",
        entityId: updatedSetting.id,
      },
    });

    revalidatePath("/dashboard/settings");

    return updatedSetting;
  } catch (error) {
    console.error("Failed to upload file:", error);
    throw new Error("Failed to upload file");
  }
};
