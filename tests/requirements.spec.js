const { test, expect } = require("@playwright/test");

const login = async (page) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("admin@local");
  await page.getByTestId("login-password").fill("admin123");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("nav-dashboard")).toBeVisible();
};

test("REQ-01 Toggle RO/EN + persistă după refresh", async ({ page }) => {
  await login(page);

  const navBooks = page.getByTestId("nav-books");
  const beforeText = await navBooks.innerText();

  await page.getByTestId("lang-toggle").click();
  await expect(navBooks).not.toHaveText(beforeText);

  await page.reload();
  await expect(navBooks).not.toHaveText(beforeText);
});

test("REQ-02 Toggle Light/Dark + persistă după refresh", async ({ page }) => {
  await login(page);

  await page.getByTestId("theme-toggle").click();

  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});
