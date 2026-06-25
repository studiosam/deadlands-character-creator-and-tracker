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

test("duplicates a character without linking the original and copy", async ({
  page,
}) => {
  const originalName = "Original Character";
  const duplicateName = "Duplicated Character";
  const originalRow = () =>
    page.locator(".library-character").filter({
      has: page.getByRole("heading", { name: /^Original Character$/ }),
    });
  const duplicateRow = () =>
    page.locator(".library-character").filter({
      has: page.getByRole("heading", { name: /^Duplicated Character$/ }),
    });

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
  await page.locator("#appDialogInput").fill(originalName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(originalName);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);

  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(duplicateName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(duplicateName);

  await expect(originalRow()).toHaveCount(1);
  await expect(duplicateRow()).toHaveCount(1);

  await originalRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(originalName);

  await duplicateRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(duplicateName);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, storageKey, originalName, duplicateName }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
        const entries = Object.values(library?.charactersById || {});
        const original = entries.find((entry) => entry.name === originalName);
        const duplicate = entries.find((entry) => entry.name === duplicateName);
        const ids = entries.map((entry) => entry.id).filter(Boolean);
        return {
          count: entries.length,
          originalName: original?.character?.name || "",
          duplicateName: duplicate?.character?.name || "",
          activeName:
            library?.charactersById?.[library.activeCharacterId]?.name || "",
          trackerName: tracker?.name || "",
          uniqueIdCount: new Set(ids).size,
          idsAreDistinct:
            Boolean(original?.id) &&
            Boolean(duplicate?.id) &&
            original.id !== duplicate.id,
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        storageKey: STORAGE_KEY,
        originalName,
        duplicateName,
      },
    ),
  ).toEqual({
    count: 2,
    originalName,
    duplicateName,
    activeName: duplicateName,
    trackerName: duplicateName,
    uniqueIdCount: 2,
    idsAreDistinct: true,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(duplicateName);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(originalRow()).toHaveCount(1);
  await expect(duplicateRow()).toHaveCount(1);
  await expect(page.locator(".library-character.active")).toContainText(
    duplicateName,
  );

  await originalRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(originalName);

  await duplicateRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(duplicateName);
});

test("preserves separate wound values across character switching and reload", async ({
  page,
}) => {
  const healthyName = "Healthy Character";
  const woundedName = "Wounded Character";
  const woundsBlock = page.locator(".block").filter({
    has: page.getByRole("heading", { name: "Wounds" }),
  });
  const woundsValue = page.locator("#woundsValue");
  const healthyRow = () =>
    page.locator(".library-character").filter({
      has: page.getByRole("heading", { name: /^Healthy Character$/ }),
    });
  const woundedRow = () =>
    page.locator(".library-character").filter({
      has: page.getByRole("heading", { name: /^Wounded Character$/ }),
    });
  const increaseWounds = async () => {
    await woundsBlock.getByRole("button", { name: "+", exact: true }).click();
  };

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
  await page.locator("#appDialogInput").fill(healthyName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(healthyName);

  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await increaseWounds();
  await expect(woundsValue).toHaveText("1");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);

  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(woundedName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(woundedName);

  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await expect(woundsValue).toHaveText("1");
  await increaseWounds();
  await expect(woundsValue).toHaveText("2");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await healthyRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(healthyName);
  await expect(woundsValue).toHaveText("1");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await woundedRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(woundedName);
  await expect(woundsValue).toHaveText("2");

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, healthyName, woundedName }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const entries = Object.values(library?.charactersById || {});
        const healthy = entries.find((entry) => entry.name === healthyName);
        const wounded = entries.find((entry) => entry.name === woundedName);
        return {
          healthyWounds: healthy?.character?.damage?.wounds ?? null,
          woundedWounds: wounded?.character?.damage?.wounds ?? null,
          distinctIds:
            Boolean(healthy?.id) &&
            Boolean(wounded?.id) &&
            healthy.id !== wounded.id,
          activeName:
            library?.charactersById?.[library.activeCharacterId]?.name || "",
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        healthyName,
        woundedName,
      },
    ),
  ).toEqual({
    healthyWounds: 1,
    woundedWounds: 2,
    distinctIds: true,
    activeName: woundedName,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(woundedName);
  await expect(woundsValue).toHaveText("2");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await healthyRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(healthyName);
  await expect(woundsValue).toHaveText("1");

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await woundedRow().getByRole("button", { name: "Switch" }).click();
  await expect(page.locator("#characterName")).toContainText(woundedName);
  await expect(woundsValue).toHaveText("2");
});

test("deletes only the selected character and preserves the remaining character", async ({
  page,
}) => {
  const deleteName = "Character To Delete";
  const keepName = "Character To Keep";

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
  await page.locator("#appDialogInput").fill(deleteName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(deleteName);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(keepName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(keepName);

  await expect(page.locator(".library-character h3")).toContainText([
    deleteName,
    keepName,
  ]);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: deleteName }) })
    .getByRole("button", { name: "Switch" })
    .click();
  await expect(page.locator("#characterName")).toContainText(deleteName);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: deleteName }) })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();

  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: deleteName }) }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: keepName }) }),
  ).toHaveCount(1);
  await expect(page.locator(".library-character.active")).toContainText(
    keepName,
  );
  await expect(page.locator("#characterName")).toContainText(keepName);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, storageKey, deleteName, keepName }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
        const entries = Object.values(library?.charactersById || {});
        return {
          count: entries.length,
          hasDeleted: entries.some((entry) => entry.name === deleteName),
          hasKeep: entries.some(
            (entry) => entry.name === keepName && entry.character?.name === keepName,
          ),
          activeName:
            library?.charactersById?.[library.activeCharacterId]?.name || "",
          trackerName: tracker?.name || "",
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        storageKey: STORAGE_KEY,
        deleteName,
        keepName,
      },
    ),
  ).toEqual({
    count: 1,
    hasDeleted: false,
    hasKeep: true,
    activeName: keepName,
    trackerName: keepName,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(keepName);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: deleteName }) }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: keepName }) }),
  ).toHaveCount(1);
  await expect(page.locator(".library-character.active")).toContainText(
    keepName,
  );
});

test("persists core combat controls across reload", async ({ page }) => {
  await page.locator("#landingContinueBtn").click();
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.reload();
  await expect(page.locator("#woundsValue")).toHaveText("1");
});

test("adds a custom gear item and preserves it across reload", async ({
  page,
}) => {
  const itemName = "Inventory Persistence Item";
  const itemNote = "Playwright inventory persistence test";
  const gearSection = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: /^Gear$/ }),
  });
  const addGearForm = page.locator("#gearAddForm");
  const gearItemRow = () =>
    page.locator("#inventoryList .inventory-row").filter({
      has: page.getByText(itemName, { exact: true }),
    });

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();

  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator("#inventoryPanel")).toHaveClass(/active/);

  await gearSection.locator("[data-toggle-form='gearAddForm']").click();
  await expect(addGearForm).toBeVisible();
  await addGearForm.locator("#inventoryNameInput").fill(itemName);
  await addGearForm.locator("#inventoryCountInput").fill("3");
  await addGearForm.locator("#inventoryNoteInput").fill(itemNote);
  await addGearForm.locator("#addInventoryBtn").click();

  await expect(gearItemRow()).toHaveCount(1);
  await expect(gearItemRow()).toContainText(itemName);
  await expect(gearItemRow()).toContainText("Qty 3");
  await expect(gearItemRow()).toContainText(itemNote);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, storageKey, itemName, itemNote }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
        const active =
          library?.charactersById?.[library.activeCharacterId] || null;
        const activeItem = active?.character?.inventory?.find(
          (item) => item.name === itemName,
        );
        const trackerItem = tracker?.inventory?.find(
          (item) => item.name === itemName,
        );
        return {
          activeName: active?.character?.name || "",
          activeItemCount: activeItem?.count ?? null,
          activeItemNote: activeItem?.note || "",
          trackerItemCount: trackerItem?.count ?? null,
          trackerItemNote: trackerItem?.note || "",
          matchesActiveCharacter: tracker?.name === active?.character?.name,
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        storageKey: STORAGE_KEY,
        itemName,
        itemNote,
      },
    ),
  ).toEqual({
    activeName: "Dusty McCaw",
    activeItemCount: 3,
    activeItemNote: itemNote,
    trackerItemCount: 3,
    trackerItemNote: itemNote,
    matchesActiveCharacter: true,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator("#inventoryPanel")).toHaveClass(/active/);

  await expect(gearItemRow()).toHaveCount(1);
  await expect(gearItemRow()).toContainText(itemName);
  await expect(gearItemRow()).toContainText("Qty 3");
  await expect(gearItemRow()).toContainText(itemNote);
});

test("deletes only the selected gear item and preserves the deletion across reload", async ({
  page,
}) => {
  const deleteName = "Gear Item To Delete";
  const deleteNote = "This item should be deleted";
  const keepName = "Gear Item To Keep";
  const keepNote = "This item should remain";
  const gearSection = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: /^Gear$/ }),
  });
  const addGearForm = page.locator("#gearAddForm");
  const gearItemRow = (name) =>
    page.locator("#inventoryList .inventory-row").filter({
      has: page.getByText(name, { exact: true }),
    });
  const addCustomGear = async ({ name, quantity, note }) => {
    await gearSection.locator("[data-toggle-form='gearAddForm']").click();
    await expect(addGearForm).toBeVisible();
    await addGearForm.locator("#inventoryNameInput").fill(name);
    await addGearForm.locator("#inventoryCountInput").fill(quantity);
    await addGearForm.locator("#inventoryNoteInput").fill(note);
    await addGearForm.locator("#addInventoryBtn").click();
  };

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();

  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator("#inventoryPanel")).toHaveClass(/active/);

  await addCustomGear({
    name: deleteName,
    quantity: "2",
    note: deleteNote,
  });
  await addCustomGear({
    name: keepName,
    quantity: "4",
    note: keepNote,
  });

  await expect(gearItemRow(deleteName)).toHaveCount(1);
  await expect(gearItemRow(deleteName)).toContainText("Qty 2");
  await expect(gearItemRow(deleteName)).toContainText(deleteNote);
  await expect(gearItemRow(keepName)).toHaveCount(1);
  await expect(gearItemRow(keepName)).toContainText("Qty 4");
  await expect(gearItemRow(keepName)).toContainText(keepNote);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, deleteName, keepName, deleteNote, keepNote }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const active =
          library?.charactersById?.[library.activeCharacterId] || null;
        const inventory = active?.character?.inventory || [];
        const deleteItems = inventory.filter((item) => item.name === deleteName);
        const keepItems = inventory.filter((item) => item.name === keepName);
        return {
          deleteCount: deleteItems.length,
          deleteQuantity: deleteItems[0]?.count ?? null,
          deleteNote: deleteItems[0]?.note || "",
          keepCount: keepItems.length,
          keepQuantity: keepItems[0]?.count ?? null,
          keepNote: keepItems[0]?.note || "",
          activeCharacterName: active?.character?.name || "",
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        deleteName,
        keepName,
        deleteNote,
        keepNote,
      },
    ),
  ).toEqual({
    deleteCount: 1,
    deleteQuantity: 2,
    deleteNote,
    keepCount: 1,
    keepQuantity: 4,
    keepNote,
    activeCharacterName: "Dusty McCaw",
  });

  await gearItemRow(deleteName).locator("button.delete-small").click();
  if (await page.locator("#appDialog").isVisible()) {
    await page.locator("#appDialogConfirmBtn").click();
  }

  await expect(gearItemRow(deleteName)).toHaveCount(0);
  await expect(gearItemRow(keepName)).toHaveCount(1);
  await expect(gearItemRow(keepName)).toContainText("Qty 4");
  await expect(gearItemRow(keepName)).toContainText(keepNote);

  await expect.poll(async () =>
    page.evaluate(
      ({ libraryKey, keepName, deleteName, keepNote }) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const active =
          library?.charactersById?.[library.activeCharacterId] || null;
        const inventory = active?.character?.inventory || [];
        const deleteItems = inventory.filter((item) => item.name === deleteName);
        const keepItems = inventory.filter((item) => item.name === keepName);
        return {
          deleteCount: deleteItems.length,
          keepCount: keepItems.length,
          keepQuantity: keepItems[0]?.count ?? null,
          keepNote: keepItems[0]?.note || "",
        };
      },
      {
        libraryKey: CHARACTER_LIBRARY_KEY,
        keepName,
        deleteName,
        keepNote,
      },
    ),
  ).toEqual({
    deleteCount: 0,
    keepCount: 1,
    keepQuantity: 4,
    keepNote,
  });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator("#inventoryPanel")).toHaveClass(/active/);

  await expect(gearItemRow(deleteName)).toHaveCount(0);
  await expect(gearItemRow(keepName)).toHaveCount(1);
  await expect(gearItemRow(keepName)).toContainText("Qty 4");
  await expect(gearItemRow(keepName)).toContainText(keepNote);
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

test("round-trips exported tracker JSON through import", async ({
  page,
}, testInfo) => {
  const characterName = "Backup Recovery Character";
  const noteText = "Round trip smoke note";

  await page.locator("#landingContinueBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();
  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(characterName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(characterName);

  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await page.getByRole("button", { name: "+", exact: true }).first().click();
  await page.getByRole("button", { name: "Notes" }).click();
  await page.locator("#notesArea").fill(noteText);

  await expect.poll(async () =>
    page.evaluate(
      ({ storageKey }) => {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
        return {
          name: saved?.name || "",
          wounds: saved?.damage?.wounds ?? null,
          notes: saved?.notes || "",
        };
      },
      {
        storageKey: STORAGE_KEY,
      },
    ),
  ).toEqual({
    name: characterName,
    wounds: 1,
    notes: noteText,
  });

  await page.locator("#headerToolsMenu summary").click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#exportBtn").click(),
  ]);
  const downloadedJsonPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(downloadedJsonPath);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#resetBtn").click();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await expect(page.locator("#characterName")).not.toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("0");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).not.toHaveValue(noteText);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#importFile").setInputFiles(downloadedJsonPath);

  await expect(page.locator("#characterName")).toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue(noteText);

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }

  await expect(page.locator("#characterName")).toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue(noteText);
});
