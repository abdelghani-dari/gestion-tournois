import { expect, test } from "@playwright/test";
import {
  activateRegisteredUser,
  loginThroughUi,
  registerUser,
  routeApiToBackend,
  uniqueEmail,
  uniqueName,
} from "./helpers";

test("authenticated user creates a tournament from the UI", async ({ page, request }) => {
  const email = uniqueEmail("e2e-tournament-create");
  const tournamentName = uniqueName("E2E Tournament");

  await registerUser(request, email, "E2E Tournament Creator");
  await activateRegisteredUser(email);
  await routeApiToBackend(page);

  await loginThroughUi(page, email);
  await page.goto("/tournaments?create=1");

  await expect(page.getByRole("heading", { name: /créer un tournoi/i })).toBeVisible({ timeout: 15_000 });
  await page.getByLabel(/nom/i).fill(tournamentName);
  await page.getByLabel(/ville/i).fill("Casablanca");
  await page.getByLabel(/lieu/i).fill("Stade E2E");
  await page.getByLabel(/description/i).fill("Tournoi créé par un test E2E.");
  await page.getByLabel(/date début/i).fill("2026-08-01");
  await page.getByLabel(/date fin/i).fill("2026-08-15");
  await page.getByRole("button", { name: /créer le tournoi/i }).click();

  await expect(page.getByText(tournamentName, { exact: true })).toBeVisible({ timeout: 15_000 });
});
