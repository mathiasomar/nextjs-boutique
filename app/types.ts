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
