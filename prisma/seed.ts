// prisma/seed.ts
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Create admin user
  // const hashedPassword = await bcrypt.hash("admin123", 10);

  // const admin = await prisma.user.upsert({
  //   where: { email: "admin@boutique.com" },
  //   update: {},
  //   create: {
  //     id: "admin_001",
  //     name: "Admin User",
  //     email: "admin@boutique.com",
  //     emailVerified: true,
  //     role: Role.ADMIN,
  //     accounts: {
  //       create: {
  //         id: "acc_001",
  //         accountId: "admin_001",
  //         providerId: "credentials",
  //         password: hashedPassword,
  //       },
  //     },
  //   },
  // });

  // Create code
  const randomCode = Math.floor(Math.random() * 9000) + 1000;
  const code = await prisma.userCode.upsert({
    where: { code: randomCode },
    update: {},
    create: {
      code: randomCode,
    },
  });

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Dresses" },
      update: {},
      create: { name: "Dresses" },
    }),
    prisma.category.upsert({
      where: { name: "Tops" },
      update: {},
      create: { name: "Tops" },
    }),
    prisma.category.upsert({
      where: { name: "Bottoms" },
      update: {},
      create: { name: "Bottoms" },
    }),
  ]);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: "DR001",
        name: "Evening Gown",
        description: "Elegant evening gown for special occasions",
        categoryId: categories[0].id,
        price: 299.99,
        costPrice: 150.0,
        size: "M",
        color: "Black",
        currentStock: 10,
        images: ["/products/gown.jpg"],
      },
    }),
    prisma.product.create({
      data: {
        sku: "TP001",
        name: "Silk Blouse",
        description: "Premium silk blouse",
        categoryId: categories[1].id,
        price: 89.99,
        costPrice: 40.0,
        size: "S",
        color: "White",
        currentStock: 25,
        images: ["/products/blouse.jpg"],
      },
    }),
  ]);

  console.log({ code, categories, products });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
