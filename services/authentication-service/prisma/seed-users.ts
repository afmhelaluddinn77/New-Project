import { PrismaClient } from "@prisma/client";
const bcrypt = require("bcrypt"); // Use bcrypt instead of bcryptjs to match auth.service.ts

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding portal users...\n");

  const users = [
    {
      email: "admin@example.com",
      password: "password123",
      firstName: "System",
      lastName: "Administrator",
      role: "ADMIN",
      portal: "ADMIN",
    },
    {
      email: "it@example.com",
      password: "password123",
      firstName: "John",
      lastName: "ITAdmin",
      role: "IT_ADMIN",
      portal: "ADMIN",
    },
    {
      email: "engineer@example.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Engineer",
      role: "ENGINEER",
      portal: "ADMIN",
    },
    {
      email: "hr@example.com",
      password: "password123",
      firstName: "Mary",
      lastName: "HRManager",
      role: "HR_MANAGER",
      portal: "ADMIN",
    },
    {
      email: "nurse@example.com",
      password: "password123",
      firstName: "Emily",
      lastName: "Nurse",
      role: "NURSE",
      portal: "PROVIDER",
    },
  ];

  for (const userData of users) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          portal: userData.portal,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          portal: userData.portal,
        },
      });

      console.log(`✅ Created/Updated user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Error with user ${userData.email}:`, error.message);
    }
  }

  console.log("\n✨ Seeding completed!\n");
  console.log("Portal Login Credentials:");
  console.log("=========================");
  users.forEach((u) => {
    console.log(`${u.email} / ${u.password}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
