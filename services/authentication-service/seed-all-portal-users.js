const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding ALL portal users (12 portals)...");
  console.log("");

  const users = [
    // Provider Portal
    {
      email: "provider@example.com",
      password: "password123",
      firstName: "Dr. John",
      lastName: "Smith",
      role: "PROVIDER",
      portal: "PROVIDER",
    },
    // Patient Portal
    {
      email: "patient@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Doe",
      role: "PATIENT",
      portal: "PATIENT",
    },
    // Admin Portal
    {
      email: "admin@example.com",
      password: "password123",
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      portal: "ADMIN",
    },
    // Lab Portal
    {
      email: "labtech@example.com",
      password: "password123",
      firstName: "Emily",
      lastName: "Davis",
      role: "LAB_TECH",
      portal: "LAB",
    },
    // Pharmacy Portal
    {
      email: "pharmacist@example.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      role: "PHARMACIST",
      portal: "PHARMACY",
    },
    // Billing Portal
    {
      email: "billing@example.com",
      password: "password123",
      firstName: "Robert",
      lastName: "Martinez",
      role: "BILLING",
      portal: "BILLING",
    },
    // Radiology Portal
    {
      email: "radiologist@example.com",
      password: "password123",
      firstName: "Dr. Michael",
      lastName: "Chen",
      role: "RADIOLOGIST",
      portal: "RADIOLOGY",
    },
    // Nurses Portal (using PROVIDER portal type)
    {
      email: "nurse@example.com",
      password: "password123",
      firstName: "Lisa",
      lastName: "Anderson",
      role: "NURSE",
      portal: "PROVIDER",
    },
    // IT Portal (using ADMIN portal type)
    {
      email: "it@example.com",
      password: "password123",
      firstName: "David",
      lastName: "Wilson",
      role: "IT",
      portal: "ADMIN",
    },
    // HR Portal (using ADMIN portal type)
    {
      email: "hr@example.com",
      password: "password123",
      firstName: "Jessica",
      lastName: "Taylor",
      role: "HR",
      portal: "ADMIN",
    },
    // Engineering Portal (using ADMIN portal type)
    {
      email: "engineering@example.com",
      password: "password123",
      firstName: "Alex",
      lastName: "Thompson",
      role: "ENGINEERING",
      portal: "ADMIN",
    },
  ];

  for (const userData of users) {
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

    console.log(
      `✅ ${user.portal.padEnd(12)} Portal: ${user.email.padEnd(32)} (${user.firstName} ${user.lastName})`
    );
  }

  console.log("");
  console.log("🎉 All 11 portal users seeded successfully!");
  console.log("");
  console.log("📋 Quick Reference:");
  console.log("   Default password for all users: password123");
  console.log("");
  console.log("🌐 Portal URLs:");
  console.log("   Provider:    http://localhost:5174");
  console.log("   Patient:     http://localhost:5173");
  console.log("   Admin:       http://localhost:5175");
  console.log("   Lab:         http://localhost:5176");
  console.log("   Pharmacy:    http://localhost:5177");
  console.log("   Billing:     http://localhost:5178");
  console.log("   Radiology:   http://localhost:5179");
  console.log("   Nurses:      http://localhost:5180");
  console.log("   IT:          http://localhost:5181");
  console.log("   HR:          http://localhost:5182");
  console.log("   Engineering: http://localhost:5183");
  console.log("");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
