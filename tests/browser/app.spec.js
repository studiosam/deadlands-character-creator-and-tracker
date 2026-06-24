const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "deadlands-tracker-v2";

async function clearAppStorage(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await clearAppStorage(page);
});

test("loads the app and switches primary tabs", async ({ page }) => {
  await expect(page).toHaveTitle(/Deadlands Character Tracker/);
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await expect(page.locator("#demoWelcomePanel")).toBeVisible();

  for (const tab of ["Character", "Inventory", "Arcane", "Notes", "Settings"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.locator(".tab-panel.active")).toBeVisible();
  }

  await expect(page.locator("#settingsPanel")).toContainText(
    "About and Settings",
  );
  await expect(page.locator("#settingsAppDetails")).toContainText(
    "Schema Version",
  );

  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
});

test("settings panel exposes backup and local data controls", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Settings", exact: true }).click();

  await expect(page.locator("#settingsStatusBadges")).toContainText("Version");
  await expect(page.locator("#settingsStorageDetails")).toContainText(
    "Tracker Save",
  );
  await expect(page.locator("#settingsDemoLink")).toHaveAttribute(
    "href",
    /studiosam\.github\.io/,
  );

  await page.locator("#settingsShowWelcomeBtn").click();
  await expect(page.locator("#demoWelcomePanel")).toBeVisible();
});

test("loads a bundled sample in demo mode", async ({ page }) => {
  await page.locator("#sampleCharacterSelect").selectOption("dusty-mccaw");
  await page.locator("#loadSelectedSampleBtn").click();

  await expect(page.locator("#demoModeBanner")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  expect(stored.schemaVersion).toBe(1);
});

test("persists core combat controls across reload", async ({ page }) => {
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#woundsValue")).toHaveText("1");
});

test("imports a Savaged.us sample through paste import", async ({ page }) => {
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(await sample.text());
  await page.locator("#confirmPasteImportBtn").click();

  await expect(page.locator("#characterName")).toContainText("Lehi Larson");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#importWarningsList")).toBeVisible();
});

test("round-trips exported tracker JSON through import", async ({ page }) => {
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  await page.getByRole("button", { name: "Notes" }).click();
  await page.locator("#notesArea").fill("Round trip smoke note");
  await page.waitForTimeout(200);

  const exported = await page.evaluate((key) => {
    const saved = JSON.parse(localStorage.getItem(key));
    return JSON.stringify(serializeTrackerExport(saved));
  }, STORAGE_KEY);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#resetBtn").click();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(exported);
  await page.locator("#confirmPasteImportBtn").click();

  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue("Round trip smoke note");
});
