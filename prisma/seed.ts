// prisma/seed.ts
import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// Types for better auth
interface UserSeedData {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  emailVerified?: boolean;
  image?: string;
}

// Generate a random ID for better auth compatibility
const generateUserId = () => {
  return `user_${Math.random().toString(36).substring(2, 15)}`;
};

// Hash password using bcrypt (same as better-auth)
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);

  // User data to seed
  const users: UserSeedData[] = [
    {
      id: generateUserId(),
      name: "Admin User",
      email: "admin@example.com",
      password: await hashPassword("Admin@123"), // Will be hashed
      role: Role.ADMIN,
      emailVerified: true,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    },
    {
      id: generateUserId(),
      name: "Staff User",
      email: "staff@example.com",
      password: await hashPassword("Staff@123"),
      role: Role.STAFF,
      emailVerified: true,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Staff",
    },
    {
      id: generateUserId(),
      name: "Manager User",
      email: "manager@example.com",
      password: await hashPassword("Manager@123"),
      role: Role.STAFF,
      emailVerified: true,
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
    },
  ];

  async function main() {
    console.log("🌱 Starting database seeding...");

    // 1. Clear existing data (optional - be careful in production)
    if (process.env.NODE_ENV === "development") {
      console.log("Clearing existing data...");
      await prisma.userCode.deleteMany();
      await prisma.session.deleteMany();
      await prisma.account.deleteMany();
      await prisma.user.deleteMany();
      await prisma.verification.deleteMany();
    }

    // 2. Create users
    console.log("Creating users...");
    for (const userData of users) {
      try {
        // Hash the password
        const hashedPassword = await hashPassword(userData.password);

        // Create the user
        const user = await prisma.user.create({
          data: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            emailVerified: userData.emailVerified,
            image: userData.image,
            role: userData.role,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Create an account for the user (mimicking better-auth)
        await prisma.account.create({
          data: {
            id: `account_${user.id}`,
            accountId: user.email,
            providerId: "credentials",
            userId: user.id,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Create a verification record if email is verified
        if (userData.emailVerified) {
          await prisma.verification.create({
            data: {
              id: `verify_${user.id}`,
              identifier: user.email,
              value: `${user.id}_${Date.now()}`, // Simple token
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        console.log(`✅ Created user: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    // Create code
    // 3. Create some user codes (for magic links or other auth methods)
    console.log("Creating user codes...");
    const codes = [123456, 654321, 111222, 333444, 555666];
    for (const code of codes) {
      await prisma.userCode.create({
        data: {
          id: `code_${code}`,
          code,
        },
      });
    }
    console.log("✅ Created user codes");

    // 4. Create sample data for other models (optional)
    console.log("Creating sample customers...");
    await prisma.customer.createMany({
      data: [
        {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          address: "123 Main St, City",
          customerType: "REGULAR",
          loyaltyPoints: 100,
        },
        {
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+0987654321",
          address: "456 Oak Ave, Town",
          customerType: "VIP",
          loyaltyPoints: 500,
        },
      ],
      skipDuplicates: true,
    });
    console.log("✅ Created sample customers");

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
    await Promise.all([
      prisma.product.create({
        data: {
          sku: "DR001",
          name: "Evening Gown",
          description: "Elegant evening gown for special occasions",
          categoryId: categories[0].id,
          price: 299.99,
          costPrice: 150.0,
          size: ["M"],
          color: ["Black"],
          currentStock: 10,
          images: { Black: "/products/evening_gown_black.jpg" },
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
          size: ["S"],
          color: ["White"],
          currentStock: 25,
          images: { White: "/products/blouse.jpg" },
        },
      }),
    ]);

    console.log("🎉 Seeding completed successfully!");
  }
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
};
