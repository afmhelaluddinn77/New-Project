import { expect, test } from "@playwright/test";

/**
 * Pharmacy Workflow E2E Test
 *
 * Tests the complete pharmacy workflow from Provider Portal to Pharmacy Portal
 * and back to Provider Portal for prescription status
 */

test.describe("Pharmacy Workflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("Complete pharmacy workflow - Provider creates prescription, Pharmacist dispenses", async ({
    page,
    context,
  }) => {
    let orderNumber: string;

    // Step 1: Provider Login and Create Prescription
    await test.step("Provider creates prescription order", async () => {
      await page.fill('input[type="email"]', "provider@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      await expect(page).toHaveURL("/dashboard");

      // Navigate to orders
      await page.goto("/orders");

      // Fill patient information
      await page.fill('input[name="patientId"]', "P002");
      await page.fill('input[name="providerId"]', "DR002");
      await page.fill('input[name="encounterId"]', "ENC002");

      // Enable pharmacy service
      const pharmacyToggle = page.locator('[data-testid="pharmacy-toggle"]');
      if (!(await pharmacyToggle.isChecked())) {
        await pharmacyToggle.click();
      }

      // Fill prescription details
      await page.fill('input[name="drugName"]', "Amoxicillin");
      await page.fill('input[name="dosage"]', "500mg");
      await page.fill('input[name="frequency"]', "TID");
      await page.fill('input[name="duration"]', "7 days");
      await page.fill('input[name="quantity"]', "21");
      await page.fill('textarea[name="instructions"]', "Take with food");

      // Submit order
      await page.click('button[type="submit"]');

      // Capture order number
      await expect(page.locator(".success-message")).toBeVisible();
      const orderText = await page.locator(".order-number").textContent();
      orderNumber = orderText?.match(/WF-[\w-]+/)?.[0] || "";
      expect(orderNumber).toBeTruthy();
    });

    // Step 2: Pharmacist Processes Prescription
    await test.step("Pharmacist verifies and dispenses prescription", async () => {
      const pharmacyPage = await context.newPage();
      await pharmacyPage.goto("http://localhost:5177/login");

      // Pharmacist login
      await pharmacyPage.fill('input[type="email"]', "pharmacist@example.com");
      await pharmacyPage.fill('input[type="password"]', "password123");
      await pharmacyPage.click('button[type="submit"]');

      await expect(pharmacyPage).toHaveURL("http://localhost:5177/dashboard");

      // Navigate to pending prescriptions
      await pharmacyPage.goto("http://localhost:5177/prescriptions");

      // Find the prescription
      const prescriptionRow = pharmacyPage.locator(
        `tr:has-text("${orderNumber}")`
      );
      await expect(prescriptionRow).toBeVisible();

      // Verify prescription details
      await expect(prescriptionRow).toContainText("Amoxicillin");
      await expect(prescriptionRow).toContainText("500mg");

      // Click verify button
      await prescriptionRow.locator('button:has-text("Verify")').click();

      // Add pharmacist notes
      await pharmacyPage.fill(
        'textarea[name="pharmacistNotes"]',
        "Verified - no drug interactions"
      );

      // Dispense
      await pharmacyPage.click('button:has-text("Dispense")');

      // Verify success
      await expect(pharmacyPage.locator(".success-message")).toBeVisible();

      await pharmacyPage.close();
    });

    // Step 3: Provider Checks Status
    await test.step("Provider views prescription status", async () => {
      await page.goto("/results");

      // Find the completed prescription
      const completedRow = page.locator(`tr:has-text("${orderNumber}")`);
      await expect(completedRow).toBeVisible();

      // Verify pharmacy status is COMPLETED
      const pharmacyStatus = completedRow.locator(".pharmacy-status");
      await expect(pharmacyStatus).toContainText("COMPLETED");
    });
  });

  test.skip("Pharmacy workflow handles drug interaction checks", async ({
    page,
    context,
  }) => {
    // This would test drug interaction validation
    // Skipped: requires pharmacy service enhancement
  });
});
