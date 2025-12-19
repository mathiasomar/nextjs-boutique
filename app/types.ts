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
