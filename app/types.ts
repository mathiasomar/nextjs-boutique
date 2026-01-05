import {
  InventoryType,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

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
  selectedSize: string;
  selectedColor: string;
};

export interface OrderItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CreateOrderInput {
  id?: string;
  customerId: string;
  discount?: number;
  status?:
    | "DRAFT"
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED";
  paymentStatus?: "PENDING" | "PARTIAL" | "COMPLETED" | "FAILED" | "REFUNDED";
  items: OrderItemInput[];
}

export type Items = Item[];

export type Product = {
  id: string | number;
  sku: string;
  brand?: string;
  category: {
    id: string;
    name: string;
  };
  price: string;
  costPrice: string;
  lowStockAlert: boolean;
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
  updatedBy: string;
};

export type EditInventoryType = {
  productId: string;
  quantity: number;
  type: InventoryType;
  reason?: string;
};

export interface ProductFilters {
  search?: string;
  stock?: string;
  isActive?: boolean;
  sortOrder?: "asc" | "desc";
}

export interface CustomerFilters {
  search?: string;
  type?: "REGULAR" | "VIP" | "WHOLESALE";
}

export interface activityLogFilters {
  search?: string;
}

export interface InventoryLogFilters {
  type?: InventoryType;
  productId?: string;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
}

export type ProductWithoutCategory = {
  id: string;
  sku: string;
  price: number;
  name: string;
  images: Record<string, string>;
};

export type CartItemType = ProductWithoutCategory & {
  productId: string;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  totalPrice: number;
};

export type CartItemsType = CartItemType[];

export type CartStoreStateType = {
  cart: CartItemsType;
  hasHydrated: boolean;
};

export type CartStoreActionsType = {
  addToCart: (product: CartItemType) => void;
  removeFromCart: (product: CartItemType) => void;
  clearCart: () => void;
};
