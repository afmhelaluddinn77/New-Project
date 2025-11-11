import { expect, test } from "@playwright/test";

/**
 * CBC Workflow E2E Test
 *
 * Tests the complete CBC workflow from Provider Portal to Lab Portal
 * and back to Provider Portal for results viewing
 */

test.describe("CBC Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto("/login");
  });

  test("Complete CBC workflow - Provider creates order, Lab processes, Provider views results", async ({
    page,
    context,
  }) => {
    // Step 1: Provider Login
    await test.step("Provider logs in", async () => {
      await page.fill('input[type="email"]', "provider@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');

      // Wait for dashboard to load
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("h1")).toContainText("Dashboard");
    });

    let orderNumber: string;

    // Step 2: Create CBC Order
    await test.step("Provider creates CBC order", async () => {
      await page.goto("/orders");
      await expect(page.locator("h1")).toContainText("Unified Orders");

      // Fill patient information
      await page.fill('input[name="patientId"]', "P001");
      await page.fill('input[name="providerId"]', "DR001");
      await page.fill('input[name="encounterId"]', "ENC001");

      // Ensure Lab service is enabled
      const labToggle = page.locator('[data-testid="lab-toggle"]');
      if (!(await labToggle.isChecked())) {
        await labToggle.click();
      }

      // Select CBC test
      await page.selectOption(
        'select[name="testName"]',
        "Complete Blood Count"
      );

      // Submit order
      await page.click('button[type="submit"]');

      // Wait for success and capture order number
      await expect(page.locator(".success-message")).toBeVisible();
      const orderText = await page.locator(".order-number").textContent();
      orderNumber = orderText?.match(/WF-[\w-]+/)?.[0] || "";
      expect(orderNumber).toBeTruthy();
    });

    // Step 3: Lab Portal - Process Order
    await test.step("Lab technician processes order", async () => {
      // Open lab portal in new tab
      const labPage = await context.newPage();
      await labPage.goto("http://localhost:5176/login");

      // Lab login
      await labPage.fill('input[type="email"]', "labtech@example.com");
      await labPage.fill('input[type="password"]', "password123");
      await labPage.click('button[type="submit"]');

      // Wait for lab dashboard
      await expect(labPage).toHaveURL("http://localhost:5176/dashboard");

      // Navigate to pending orders
      await labPage.goto("http://localhost:5176/orders");
      await expect(labPage.locator("h1")).toContainText("Lab Orders");

      // Find and process the order
      const orderRow = labPage.locator(`tr:has-text("${orderNumber}")`);
      await expect(orderRow).toBeVisible();

      // Click process button
      await orderRow.locator('button:has-text("Process")').click();

      // Fill CBC results
      await labPage.fill('input[name="wbc"]', "7.2");
      await labPage.fill('input[name="rbc"]', "4.5");
      await labPage.fill('input[name="hemoglobin"]', "13.5");
      await labPage.fill('input[name="hematocrit"]', "40.0");
      await labPage.fill('input[name="platelets"]', "250");

      // Submit results
      await labPage.click('button:has-text("Submit Results")');

      // Verify success
      await expect(labPage.locator(".success-message")).toBeVisible();

      await labPage.close();
    });

    // Step 4: Provider Views Results
    await test.step("Provider views completed results", async () => {
      // Go to results page
      await page.goto("/results");
      await expect(page.locator("h1")).toContainText("Results Timeline");

      // Find the completed order
      const completedRow = page.locator(`tr:has-text("${orderNumber}")`);
      await expect(completedRow).toBeVisible();

      // Verify lab status is COMPLETED
      const labStatus = completedRow.locator(".lab-status");
      await expect(labStatus).toContainText("COMPLETED");

      // Click View Details button
      await completedRow.locator('button:has-text("View Details")').click();

      // Verify detailed results page
      await expect(page.locator("h1")).toContainText("Complete Blood Count");
      await expect(page.locator("text=WBC")).toBeVisible();
      await expect(page.locator("text=7.2")).toBeVisible();
      await expect(page.locator("text=Normal")).toBeVisible();
    });
  });

  test("CBC workflow handles validation errors gracefully", async ({
    page,
  }) => {
    await test.step("Provider logs in", async () => {
      await page.fill('input[type="email"]', "provider@example.com");
      await page.fill('input[type="password"]', "password123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
    });

    await test.step("Validation errors are shown for incomplete form", async () => {
      await page.goto("/orders");

      // Try to submit without required fields
      await page.click('button[type="submit"]');

      // Verify validation messages
      await expect(page.locator(".error-message")).toBeVisible();
      await expect(page.locator("text=Patient ID is required")).toBeVisible();
    });
  });

  test("CBC workflow handles service errors gracefully", async ({ page }) => {
    // This test would simulate service failures and verify error handling
    // For now, we'll skip it as it requires more complex setup
    test.skip("Service error handling - requires mock service failures");
  });
});
