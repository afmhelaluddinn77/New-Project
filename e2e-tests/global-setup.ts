import { FullConfig } from "@playwright/test";

/**
 * Global E2E Test Setup
 *
 * Ensures all services are running and database is seeded
 * before running tests
 */

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting E2E Test Setup...");

  // Wait for services to be ready
  await waitForServices();

  // Seed test data
  await seedTestData();

  console.log("✅ E2E Test Setup Complete");
}

async function waitForServices() {
  const services = [
    {
      name: "Authentication Service",
      url: "http://localhost:3001/api/auth/csrf-token",
    },
    { name: "Workflow Service", url: "http://localhost:3004/health" },
    { name: "Lab Service", url: "http://localhost:3013/health" },
    { name: "Pharmacy Service", url: "http://localhost:3012/health" },
    { name: "Radiology Service", url: "http://localhost:3014/health" },
  ];

  console.log("⏳ Waiting for services to be ready...");

  for (const service of services) {
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(service.url);
        if (response.ok) {
          console.log(`✅ ${service.name} is ready`);
          break;
        }
      } catch (error) {
        // Service not ready yet
      }

      attempts++;
      if (attempts === maxAttempts) {
        throw new Error(
          `❌ ${service.name} failed to start after ${maxAttempts} attempts`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

async function seedTestData() {
  console.log("🌱 Seeding test data...");

  try {
    // Seed users
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    await execAsync("cd services/authentication-service && node seed-users.js");
    console.log("✅ Users seeded");

    // Add any other test data seeding here
  } catch (error) {
    console.error("❌ Failed to seed test data:", error);
    throw error;
  }
}

export default globalSetup;
