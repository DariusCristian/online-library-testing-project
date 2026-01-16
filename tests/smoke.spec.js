const { test, expect } = require("@playwright/test");

const login = async (page) => {
  await page.goto("/login");
  await page.getByTestId("login-email").fill("admin@local");
  await page.getByTestId("login-password").fill("admin123");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("nav-dashboard")).toBeVisible();
};

test.describe("Smoke", () => {
  test("SMK-01 Navigare între pagini (Panou → Cărți → Coș împrumuturi → Istoric)", async ({ page }) => {
    await login(page);

    await page.goto("/dashboard");
    await expect(page.getByTestId("dashboard-stats")).toBeVisible();

    await page.goto("/books");
    await expect(page.getByTestId("books-title")).toBeVisible();

    await page.goto("/cart/loans");
    await expect(page.getByTestId("loan-cart-title")).toBeVisible();

    await page.goto("/me/history");
    await expect(page.getByTestId("history-title")).toBeVisible();
  });

  test("SMK-02 Căutare în catalog (ex: Marea)", async ({ page }) => {
    await login(page);
    await page.goto("/books");
    await expect(page.getByTestId("books-title")).toBeVisible();

    const firstTitle = page.getByTestId("book-title").first();
    const titleText = await firstTitle.innerText();
    const query = titleText.split(" ")[0];

    await page.getByTestId("books-search").fill(query);
    await expect(page.getByText(new RegExp(query, "i"))).toBeVisible();
  });

  test("SMK-03 Împrumut: adăugare în coș + coș nu e gol", async ({ page }) => {
    await login(page);
    await page.goto("/books");
    await expect(page.getByTestId("books-title")).toBeVisible();

    const borrowBtn = page.getByTestId("btn-borrow").first();
    await expect(borrowBtn).toBeEnabled();
    await borrowBtn.click();

    await page.getByTestId("nav-loan-cart").click();

    // dacă ai mesaj de coș gol cu testid:
    await expect(page.getByTestId("loan-cart-empty")).toHaveCount(0);
  });
});
