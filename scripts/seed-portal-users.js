#!/usr/bin/env node

const axios = require("axios");

const AUTH_SERVICE_URL = "http://localhost:3001";

// Portal users with their respective roles
const portalUsers = [
  // Admin Portal
  {
    email: "admin@example.com",
    password: "password123",
    firstName: "System",
    lastName: "Administrator",
    role: "ADMIN",
    portalType: "ADMIN",
    portal: "admin-portal",
  },
  // IT Portal
  {
    email: "it@example.com",
    password: "password123",
    firstName: "John",
    lastName: "ITAdmin",
    role: "IT_ADMIN",
    portalType: "ADMIN",
    portal: "it-portal",
  },
  // Engineering Portal
  {
    email: "engineer@example.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Engineer",
    role: "ENGINEER",
    portalType: "ADMIN",
    portal: "engineering-portal",
  },
  // HR Portal
  {
    email: "hr@example.com",
    password: "password123",
    firstName: "Mary",
    lastName: "HRManager",
    role: "HR_MANAGER",
    portalType: "ADMIN",
    portal: "hr-portal",
  },
  // Nurses Portal
  {
    email: "nurse@example.com",
    password: "password123",
    firstName: "Emily",
    lastName: "Nurse",
    role: "NURSE",
    portalType: "PROVIDER",
    portal: "nurses-portal",
  },
  // Provider Portal
  {
    email: "provider@example.com",
    password: "password123",
    firstName: "Dr. James",
    lastName: "Wilson",
    role: "PROVIDER",
    portalType: "PROVIDER",
    portal: "provider-portal",
  },
  // Patient Portal
  {
    email: "patient@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    role: "PATIENT",
    portalType: "PATIENT",
    portal: "patient-portal",
  },
  // Lab Portal
  {
    email: "lab@example.com",
    password: "password123",
    firstName: "Lab",
    lastName: "Technician",
    role: "LAB_TECH",
    portalType: "PROVIDER",
    portal: "lab-portal",
  },
  // Billing Portal
  {
    email: "billing@example.com",
    password: "password123",
    firstName: "Billing",
    lastName: "Admin",
    role: "BILLING_ADMIN",
    portalType: "ADMIN",
    portal: "billing-portal",
  },
];

async function seedUsers() {
  console.log("🌱 Starting to seed portal users...\n");

  for (const user of portalUsers) {
    try {
      // Try to register the user
      const response = await axios.post(
        `${AUTH_SERVICE_URL}/api/auth/register`,
        {
          email: user.email,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          portalType: user.portalType,
        }
      );

      console.log(`✅ Created user: ${user.email} for ${user.portal}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`ℹ️  User already exists: ${user.email}`);
      } else {
        console.error(
          `❌ Error creating user ${user.email}:`,
          error.response?.data || error.message
        );
      }
    }
  }

  console.log("\n✨ Seeding completed!");
  console.log("\n📝 Portal Login Credentials:");
  console.log("================================");
  portalUsers.forEach((user) => {
    console.log(`${user.portal}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log("");
  });
}

// Wait for auth service to be ready
async function waitForService() {
  console.log("⏳ Waiting for authentication service...");
  let attempts = 0;
  while (attempts < 30) {
    try {
      // Try to reach the auth API endpoint
      await axios.get(`${AUTH_SERVICE_URL}/api/auth/csrf-token`, {
        timeout: 2000,
      });
      console.log("✅ Authentication service is ready!\n");
      return true;
    } catch (error) {
      attempts++;
      if (attempts % 5 === 0) {
        console.log(`  Still waiting... (attempt ${attempts}/30)`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.error("❌ Authentication service is not responding");
  console.error("   Make sure to run: ./scripts/restart-auth-service.sh");
  return false;
}

async function main() {
  const isReady = await waitForService();
  if (isReady) {
    await seedUsers();
  }
}

main().catch(console.error);
