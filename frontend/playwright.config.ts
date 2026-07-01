import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const systemChromium = ["/usr/bin/chromium-browser", "/usr/bin/chromium"].find((path) => existsSync(path));

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    trace: "on-first-retry",
    ...(systemChromium ? { launchOptions: { executablePath: systemChromium } } : {}),
  },
});
