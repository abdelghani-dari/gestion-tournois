import { expect, type APIRequestContext, type Page } from "@playwright/test";
import pg from "pg";

export const apiBase = (process.env.E2E_API_URL ?? "http://backend:8000/api").replace(/\/+$/, "");
export const password = "password";

const { Client } = pg;

export function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(36).slice(2, 8)}`;
}

export async function routeApiToBackend(page: Page) {
  await page.route("http://localhost:8000/api/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.pathname.replace(/^\/api/, "");

    await route.continue({
      url: `${apiBase}${path}${requestUrl.search}`,
    });
  });
}

export async function registerUser(request: APIRequestContext, email: string, name = "E2E User") {
  const response = await request.post(`${apiBase}/register`, {
    data: {
      name,
      email,
      password,
      password_confirmation: password,
    },
  });

  expect(response.status()).toBe(201);
}

export async function activateRegisteredUser(email: string) {
  // Registration creates pending users; this activates only the E2E user without relying on seeded accounts.
  const result = await updateUserByEmail(
    "UPDATE users SET account_status = 'active', approved_at = NOW() WHERE email = $1 RETURNING id",
    [email],
  );

  expect(result.rowCount).toBe(1);

  return Number(result.rows[0].id);
}

export async function setUserRole(email: string, role: "admin" | "user") {
  const result = await updateUserByEmail(
    "UPDATE users SET role = $2 WHERE email = $1 RETURNING id",
    [email, role],
  );

  expect(result.rowCount).toBe(1);
}

export async function loginThroughUi(page: Page, email: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /se connecter/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

export async function loginViaApi(request: APIRequestContext, email: string) {
  const response = await request.post(`${apiBase}/login`, {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(200);

  const token = (await response.json()).token;
  expect(token).toBeTruthy();

  return token as string;
}

export async function createTournamentViaApi(request: APIRequestContext, token: string, name: string) {
  const response = await request.post(`${apiBase}/tournaments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name,
      description: `${name} created by Playwright.`,
      city: "Casablanca",
      location: "Stade E2E",
      format: "league",
      start_date: "2026-08-01",
      end_date: "2026-08-15",
    },
  });

  expect(response.status()).toBe(201);

  const tournament = await response.json();
  expect(tournament.id).toBeTruthy();

  return Number(tournament.id);
}

export async function acceptTournamentViaApi(request: APIRequestContext, token: string, tournamentId: number) {
  const response = await request.put(`${apiBase}/admin/tournaments/${tournamentId}/accept`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.status()).toBe(200);
}

async function updateUserByEmail(query: string, values: unknown[]) {
  const client = new Client({
    host: process.env.E2E_DB_HOST ?? "postgres",
    port: Number(process.env.E2E_DB_PORT ?? 5432),
    database: process.env.E2E_DB_DATABASE ?? "gestion_tournois",
    user: process.env.E2E_DB_USERNAME ?? "postgres",
    password: process.env.E2E_DB_PASSWORD ?? "postgres",
  });

  await client.connect();

  try {
    return await client.query(query, values);
  } finally {
    await client.end();
  }
}
