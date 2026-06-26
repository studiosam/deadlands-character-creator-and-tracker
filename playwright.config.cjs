const { defineConfig, devices } = require("@playwright/test");

// Some shells and automation environments set NO_COLOR while Playwright forces
// color in child Node processes. Unset it here so workers and the web server do
// not emit Node's NO_COLOR/FORCE_COLOR warning.
delete process.env.NO_COLOR;

module.exports = defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  preserveOutput: "failures-only",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1366, height: 900 },
      },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "npx vite --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
});
