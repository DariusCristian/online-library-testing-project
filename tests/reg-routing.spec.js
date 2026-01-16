const { test, expect } = require("@playwright/test");

const login = async (page) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("admin@local");
  await page.getByTestId("login-password").fill("admin123");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("nav-dashboard")).toBeVisible();
};

test("REG-01 Stress routing (URL se schimbă, view trebuie să se schimbe)", async ({ page }) => {
  await login(page);

  for (let i = 0; i < 10; i++) {
    await page.goto("/books");
    await expect(page.getByTestId("books-title")).toBeVisible();

    await page.goto("/me/history");
    await expect(page.getByTestId("history-title")).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-stats")).toBeVisible();
  }
});
