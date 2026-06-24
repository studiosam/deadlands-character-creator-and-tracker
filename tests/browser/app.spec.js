const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "deadlands-tracker-v2";
const CHARACTER_LIBRARY_KEY = "deadlands-character-library-v1";

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
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await expect(page.locator(".app-tabs [data-app-tab='settings']")).toHaveCount(
    0,
  );

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.reload();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  for (const tab of ["Character", "Inventory", "Arcane", "Notes"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.locator(".tab-panel.active")).toBeVisible();
  }

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#settingsMenuBtn").click();
  await expect(page.locator("#settingsPanel")).toContainText(
    "About and Settings",
  );
  await expect(page.locator("#settingsAppDetails")).toContainText(
    "Schema Version",
  );

  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
});

test("settings panel exposes backup and local data controls", async ({
  page,
}) => {
  await page.locator("#landingContinueBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#settingsMenuBtn").click();

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
  await page.locator("#landingLoadSampleBtn").click();

  await expect(page.locator("#demoModeBanner")).toBeVisible();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  expect(stored.schemaVersion).toBe(1);
  const library = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    CHARACTER_LIBRARY_KEY,
  );
  expect(Object.keys(library.charactersById)).toHaveLength(1);
  expect(library.charactersById[library.activeCharacterId].isDemo).toBe(true);
});

test("manages multiple local character save slots", async ({ page }) => {
  await page.locator("#landingLoadSampleBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();

  await expect(page.locator("#libraryPanel")).toBeVisible();
  await expect(page.locator("#librarySummaryPill")).toContainText("1 saved");
  await expect(page.locator(".library-character")).toHaveCount(1);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator("#librarySummaryPill")).toContainText("2 saved");
  await expect(page.locator(".library-character")).toHaveCount(2);

  const library = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    CHARACTER_LIBRARY_KEY,
  );
  expect(Object.keys(library.charactersById)).toHaveLength(2);
  expect(library.charactersById[library.activeCharacterId].name).toContain(
    "Copy",
  );
});

test("keeps character slots in stable order when switching", async ({ page }) => {
  await page.locator("#landingLoadSampleBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await page.locator("#libraryDuplicateActiveBtn").click();

  const namesBefore = await page
    .locator(".library-character h3")
    .allTextContents();
  await page.locator(".library-character").first().getByRole("button", {
    name: "Switch",
  }).click();
  const namesAfter = await page
    .locator(".library-character h3")
    .allTextContents();

  expect(namesAfter).toEqual(namesBefore);
});

test("persists an edited character name across reload", async ({ page }) => {
  const newName = "Persistence Test Character";

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();

  const activeCharacter = page.locator(".library-character.active");
  await expect(activeCharacter).toHaveCount(1);
  await activeCharacter.getByRole("button", { name: "Rename" }).click();
  await page.locator("#appDialogInput").fill(newName);
  await page.locator("#appDialogConfirmBtn").click();

  await expect(page.locator("#characterName")).toContainText(newName);
  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, storageKey, expectedName }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const active =
          library?.charactersById?.[library.activeCharacterId] || null;
        const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
        return (
          active?.name === expectedName &&
          active?.character?.name === expectedName &&
          tracker?.name === expectedName
        );
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        storageKey: STORAGE_KEY,
        expectedName: newName,
      },
    ),
  ).toBe(true);

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(newName);
});

test("preserves separate character data across switching and reload", async ({
  page,
}) => {
  const firstName = "Switch Reload Character One";
  const secondName = "Switch Reload Character Two";

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();

  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(firstName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(firstName);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(secondName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(secondName);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: firstName }) })
    .getByRole("button", { name: "Switch" })
    .click();
  await expect(page.locator("#characterName")).toContainText(firstName);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: secondName }) })
    .getByRole("button", { name: "Switch" })
    .click();
  await expect(page.locator("#characterName")).toContainText(secondName);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, storageKey, names }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
        const entries = Object.values(library?.charactersById || {});
        return {
          storedNames: entries.map((entry) => entry.name).sort(),
          activeName:
            library?.charactersById?.[library.activeCharacterId]?.name || "",
          trackerName: tracker?.name || "",
          hasBothNames: names.every((name) =>
            entries.some(
              (entry) => entry.name === name && entry.character?.name === name,
            ),
          ),
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        storageKey: STORAGE_KEY,
        names: [firstName, secondName],
      },
    ),
  ).toEqual({
    storedNames: [firstName, secondName].sort(),
    activeName: secondName,
    trackerName: secondName,
    hasBothNames: true,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(secondName);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator(".library-character h3")).toContainText([
    firstName,
    secondName,
  ]);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: firstName }) })
    .getByRole("button", { name: "Switch" })
    .click();
  await expect(page.locator("#characterName")).toContainText(firstName);
});

test("persists core combat controls across reload", async ({ page }) => {
  await page.locator("#landingContinueBtn").click();
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#woundsValue")).toHaveText("1");
});

test("imports a Savaged.us sample through paste import", async ({ page }) => {
  await page.locator("#landingContinueBtn").click();
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
  await page.locator("#landingContinueBtn").click();
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
