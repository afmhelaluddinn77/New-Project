import { expect, test } from "@playwright/test";

// Helper function to login
async function login(page: any) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "test-doctor@hospital.com");
  await page.fill('input[name="password"]', "TestPassword123!");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 });
}

test.describe("Orders Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display orders page", async ({ page }) => {
    // Navigate to orders page
    await page.goto("/orders");

    // Check URL
    await expect(page).toHaveURL(/\/orders/);

    // Check for orders heading or content
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("should show orders list or empty state", async ({ page }) => {
    await page.goto("/orders");

    // Either orders exist or empty state is shown
    const ordersExist = await page
      .locator('[data-testid="order-card"], .order-card, .order-item')
      .count();
    const emptyState = await page
      .locator("text=/no orders|empty|create.*first/i")
      .count();

    // At least one should be present
    expect(ordersExist + emptyState).toBeGreaterThan(0);
  });

  test("should navigate back to dashboard", async ({ page }) => {
    await page.goto("/orders");

    // Find home/dashboard link
    const homeLink = page
      .locator('a[href="/"], a[href*="dashboard"], button:has-text("Home")')
      .first();

    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(/\/(dashboard)?$/);
    }
  });
});

test.describe("Results Viewing", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should display results page", async ({ page }) => {
    // Navigate to results page
    await page.goto("/results");

    // Check URL
    await expect(page).toHaveURL(/\/results/);

    // Page should load without errors
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });

  test("should show results list or empty state", async ({ page }) => {
    await page.goto("/results");

    // Either results exist or empty state is shown
    const resultsExist = await page
      .locator('[data-testid="result-card"], .result-card, .result-item')
      .count();
    const emptyState = await page.locator("text=/no results|empty/i").count();

    // At least one should be present
    expect(resultsExist + emptyState).toBeGreaterThan(0);
  });
});

test.describe("Navigation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should navigate through all main pages", async ({ page }) => {
    // Start at dashboard
    await expect(page).toHaveURL(/\/(dashboard)?$/);

    // Go to orders
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/orders/);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Go to results
    await page.goto("/results");
    await expect(page).toHaveURL(/\/results/);
    await expect(page.locator("h1, h2").first()).toBeVisible();

    // Back to dashboard
    await page.goto("/");
    await expect(page).toHaveURL(/\/(dashboard)?$/);
  });

  test("should handle direct URL navigation", async ({ page }) => {
    // Direct navigation to orders
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/orders/);

    // Direct navigation to results
    await page.goto("/results");
    await expect(page).toHaveURL(/\/results/);

    // All pages should load successfully
    const hasError = await page.locator("text=/error|went wrong/i").count();
    expect(hasError).toBe(0);
  });
});

test.describe("Mobile Responsiveness", () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE
  });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should be usable on mobile", async ({ page }) => {
    // Dashboard should be visible
    await expect(page.locator("body")).toBeVisible();

    // Navigate to orders
    await page.goto("/orders");
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();

    // Buttons should be clickable
    const buttons = page.locator("button").first();
    if (await buttons.isVisible()) {
      const box = await buttons.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThan(30); // Sufficient tap target
    }
  });
});

test.describe("Performance", () => {
  test("login and dashboard should load within reasonable time", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Navigate to login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test-doctor@hospital.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard)?$/);
    await page.waitForLoadState("networkidle");

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    console.log(`Login and dashboard loaded in ${loadTime}ms`);
  });
});
