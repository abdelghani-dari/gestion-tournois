import { expect, test } from "@playwright/test";
import { activateRegisteredUser, loginThroughUi, registerUser, routeApiToBackend, uniqueEmail } from "./helpers";

test("login flow works from frontend to backend", async ({ page, request }) => {
  const email = uniqueEmail("e2e-login");

  await registerUser(request, email);
  await activateRegisteredUser(email);
  await routeApiToBackend(page);

  await loginThroughUi(page, email);
  await expect(page.getByText("Mes tournois", { exact: true })).toBeVisible({ timeout: 15_000 });

  const token = await page.evaluate(() => window.localStorage.getItem("auth_token"));
  expect(token).toBeTruthy();
});
