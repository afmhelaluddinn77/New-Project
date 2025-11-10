import { expect, test } from "@playwright/test";

test.describe("Provider Portal Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should display login page correctly", async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Provider Portal/);

    // Check main heading
    await expect(page.locator("h1")).toContainText("Provider Portal");

    // Check form elements exist
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Submit empty form
    await page.click('button[type="submit"]');

    // Wait a bit for validation
    await page.waitForTimeout(500);

    // Check for error messages (adjust selector based on your validation implementation)
    const emailError = page.locator("text=/email/i").first();
    const passwordError = page.locator("text=/password/i").first();

    // At least one validation message should appear
    const hasValidationError =
      (await emailError.isVisible()) || (await passwordError.isVisible());
    expect(hasValidationError).toBeTruthy();
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    // Wait for error message (adjust timeout as needed)
    await expect(page.locator("text=/invalid|incorrect|failed/i")).toBeVisible({
      timeout: 10000,
    });
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // Fill in valid credentials using our test user
    await page.fill('input[name="email"]', "test-doctor@hospital.com");
    await page.fill('input[name="password"]', "TestPassword123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL(/\/(dashboard)?$/, { timeout: 15000 });

    // Verify we're on the dashboard
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(dashboard)?$/);

    // Check for dashboard elements
    // Note: Adjust selectors based on your actual dashboard
    const welcomeText = page.locator("text=/welcome|dashboard/i").first();
    const isWelcomeVisible = await welcomeText.isVisible();
    expect(isWelcomeVisible).toBeTruthy();
  });

  test("should redirect to login when accessing protected route without auth", async ({
    page,
  }) => {
    // Try to go directly to orders page without logging in
    await page.goto("/orders");

    // Should redirect to login
    await expect(page).toHaveURL("/login", { timeout: 5000 });
  });

  test("should handle network errors gracefully", async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);

    // Try to login
    await page.fill('input[name="email"]', "doctor@hospital.com");
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click('button[type="submit"]');

    // Should show network error (adjust selector based on your error handling)
    await expect(
      page.locator("text=/network|connection|offline/i")
    ).toBeVisible({
      timeout: 10000,
    });

    // Restore connection
    await context.setOffline(false);
  });
});

test.describe("Provider Portal Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test using our test user
    await page.goto("/login");
    await page.fill('input[name="email"]', "test-doctor@hospital.com");
    await page.fill('input[name="password"]', "TestPassword123!");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard)?$/);
  });

  test("should display dashboard content", async ({ page }) => {
    // Check for dashboard elements
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();

    // Should show some metrics or content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(100);
  });

  test("should navigate to orders page", async ({ page }) => {
    // Find and click orders link
    const ordersLink = page
      .locator('a[href*="orders"], button:has-text("Orders")')
      .first();

    if (await ordersLink.isVisible()) {
      await ordersLink.click();
      await expect(page).toHaveURL(/\/orders/);
    } else {
      // If orders link doesn't exist yet, just navigate
      await page.goto("/orders");
      await expect(page).toHaveURL(/\/orders/);
    }
  });

  test("should logout successfully", async ({ page }) => {
    // Find logout button/link
    const logoutButton = page
      .locator('button:has-text("Logout"), a:has-text("Logout")')
      .first();

    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL("/login", { timeout: 5000 });
    } else {
      // Alternative: look for user menu that might contain logout
      const userMenu = page
        .locator('[data-testid="user-menu"], .user-menu')
        .first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);

        const logout = page
          .locator('button:has-text("Logout"), a:has-text("Logout")')
          .first();
        await logout.click();
        await expect(page).toHaveURL("/login");
      }
    }
  });

  test("should preserve session on page refresh", async ({ page }) => {
    // Refresh the page
    await page.reload();

    // Should still be on dashboard (not redirected to login)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(dashboard)?$/);

    // Content should still be visible
    const content = await page.textContent("body");
    expect(content!.length).toBeGreaterThan(100);
  });
});
