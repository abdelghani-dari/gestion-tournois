import { expect, test } from "@playwright/test";
import {
  acceptTournamentViaApi,
  activateRegisteredUser,
  createTournamentViaApi,
  loginViaApi,
  registerUser,
  routeApiToBackend,
  setUserRole,
  uniqueEmail,
  uniqueName,
} from "./helpers";

test("accepted tournament appears on the public home page", async ({ page, request }) => {
  const email = uniqueEmail("e2e-public-tournaments");
  const acceptedName = uniqueName("E2E Public Tournament");
  const pendingName = uniqueName("E2E Pending Tournament");

  await registerUser(request, email, "E2E Public Tournament Owner");
  await activateRegisteredUser(email);

  const userToken = await loginViaApi(request, email);
  const acceptedTournamentId = await createTournamentViaApi(request, userToken, acceptedName);
  await createTournamentViaApi(request, userToken, pendingName);

  await setUserRole(email, "admin");
  const adminToken = await loginViaApi(request, email);
  await acceptTournamentViaApi(request, adminToken, acceptedTournamentId);

  await routeApiToBackend(page);
  await page.goto("/#public-tournaments");

  await expect(page.getByRole("heading", { name: /tournois disponibles/i })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("heading", { name: acceptedName, exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(pendingName, { exact: true })).toHaveCount(0);
});
