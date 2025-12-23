import { InventoryType } from "@/generated/prisma/enums";

export type EditUserProps = {
  name: string;
  role: "ADMIN" | "STAFF";
};

export type UserProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "STAFF";
    createdAt: Date;
  };
};

export type CategoryProps = {
  category: {
    id: string;
    name: string;
  };
};

export type Item = {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Items = Item[];

export type Product = {
  id: string | number;
  sku: string;
  brand?: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  costPrice: number;
  name: string;
  description: string;
  size: [string, ...string[]];
  color: [string, ...string[]];
  images: Record<string, string>;
};

export type EditProduct = {
  id: string | number;
  brand?: string;
  category: {
    id: string;
    name: string;
  };
  price: number;
  costPrice: number;
  name: string;
  description: string;
  material?: string;
};

export type EditInventoryType = {
  productId: string;
  quantity: number;
  type: InventoryType;
  reason?: string;
};
