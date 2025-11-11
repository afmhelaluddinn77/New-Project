import { FullConfig } from "@playwright/test";

/**
 * Global E2E Test Teardown
 *
 * Cleanup after all tests complete
 */

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting E2E Test Teardown...");

  // Clean up test data if needed
  await cleanupTestData();

  console.log("✅ E2E Test Teardown Complete");
}

async function cleanupTestData() {
  console.log("🗑️  Cleaning up test data...");

  try {
    // Add cleanup logic here if needed
    // For now, we'll keep the seeded data for manual testing

    console.log("✅ Cleanup complete");
  } catch (error) {
    console.error("❌ Cleanup failed:", error);
    // Don't throw - teardown failures shouldn't fail the test suite
  }
}

export default globalTeardown;
