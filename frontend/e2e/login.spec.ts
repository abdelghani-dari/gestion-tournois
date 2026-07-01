import { expect, test, type Page } from "@playwright/test";

const apiBase = (process.env.E2E_API_URL ?? "http://backend:8000/api").replace(/\/+$/, "");

async function routeApiToBackend(page: Page) {
  await page.route("http://localhost:8000/api/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.pathname.replace(/^\/api/, "");

    await route.continue({
      url: `${apiBase}${path}${requestUrl.search}`,
    });
  });
}

test("login flow works from frontend to backend", async ({ page }) => {
  await routeApiToBackend(page);

  await page.goto("/");
  await page.evaluate(() => window.localStorage.removeItem("auth_token"));

  await page.goto("/login");
  await page.locator('input[name="email"]').fill("admin@example.com");
  await page.locator('input[name="password"]').fill("password");
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(page.getByText("En attente", { exact: true })).toBeVisible({ timeout: 15_000 });

  const token = await page.evaluate(() => window.localStorage.getItem("auth_token"));
  expect(token).toBeTruthy();
});
