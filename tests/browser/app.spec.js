const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "deadlands-tracker-v2";
const CHARACTER_LIBRARY_KEY = "deadlands-character-library-v1";
const runtimeErrorsByPage = new WeakMap();

function installRuntimeErrorCollectors(page) {
  const runtimeErrors = {
    pageErrors: [],
    consoleErrors: [],
  };

  runtimeErrorsByPage.set(page, runtimeErrors);

  page.on("pageerror", (error) => {
    runtimeErrors.pageErrors.push({
      message: error?.message || String(error),
      stack: error?.stack || "",
    });
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;

    const location = message.location();
    runtimeErrors.consoleErrors.push({
      text: message.text(),
      url: location.url || "",
      lineNumber: location.lineNumber,
      columnNumber: location.columnNumber,
    });
  });
}

function formatConsoleLocation(error) {
  if (!error.url && error.lineNumber === undefined) return "unknown location";

  const lineNumber = error.lineNumber ?? "?";
  const columnNumber = error.columnNumber ?? "?";
  return `${error.url || "unknown URL"}:${lineNumber}:${columnNumber}`;
}

function runtimeErrorFailures(page) {
  const runtimeErrors = runtimeErrorsByPage.get(page) || {
    pageErrors: [],
    consoleErrors: [],
  };

  return [
    ...runtimeErrors.pageErrors.map((error, index) => {
      const stack = error.stack ? `\n${error.stack}` : "";
      return `Page error ${index + 1}: ${error.message}${stack}`;
    }),
    ...runtimeErrors.consoleErrors.map(
      (error, index) =>
        `Console error ${index + 1}: ${error.text}\nLocation: ${formatConsoleLocation(error)}`,
    ),
  ];
}

async function clearAppStorage(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function enterTracker(page) {
  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
}

async function reloadIntoTracker(page) {
  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await enterTracker(page);
  } else {
    await expect(page.locator(".shell")).toBeVisible();
  }
}

async function openHeaderMenu(page) {
  const menu = page.locator("#headerToolsMenu");
  if (!(await menu.evaluate((element) => element.open))) {
    await page.locator("#headerToolsMenu summary").click();
  }
}

async function openCharacterLibrary(page) {
  await openHeaderMenu(page);
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
}

async function saveCurrentCharacter(page) {
  await openCharacterLibrary(page);
  await page.locator("#librarySaveCurrentBtn").click();
  await expect(page.locator(".library-character.active")).toHaveCount(1);
}

async function renameActiveCharacter(page, name) {
  const activeCharacter = page.locator(".library-character.active");
  await expect(activeCharacter).toHaveCount(1);
  await activeCharacter.getByRole("button", { name: "Rename" }).click();
  await page.locator("#appDialogInput").fill(name);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(name);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function characterRow(page, name) {
  return page.locator(".library-character").filter({
    has: page.getByRole("heading", {
      name: new RegExp(`^${escapeRegExp(name)}$`),
    }),
  });
}

async function switchToCharacter(page, name) {
  await openCharacterLibrary(page);
  const row = characterRow(page, name);
  await expect(row).toHaveCount(1);
  if (
    !(await row.evaluate((element) => element.classList.contains("active")))
  ) {
    await row.getByRole("button", { name: "Switch" }).click();
  }
  await expect(row).toHaveClass(/active/);
  await expect(page.locator("#characterName")).toContainText(name);
}

async function openCombat(page) {
  await page.getByRole("button", { name: "Combat", exact: true }).click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
}

function woundsBlock(page) {
  return page.locator(".block").filter({
    has: page.getByRole("heading", { name: "Wounds" }),
  });
}

async function increaseWounds(page) {
  await woundsBlock(page)
    .getByRole("button", { name: "+", exact: true })
    .click();
}

async function expectWounds(page, value) {
  await expect(page.locator("#woundsValue")).toHaveText(String(value));
}

async function openInventory(page) {
  await page.getByRole("button", { name: "Inventory", exact: true }).click();
  await expect(page.locator("#inventoryPanel")).toHaveClass(/active/);
}

function gearRow(page, name) {
  return page.locator("#inventoryList .inventory-row").filter({
    has: page.getByText(name, { exact: true }),
  });
}

async function addCustomGear(page, { name, quantity, note }) {
  const gearSection = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: /^Gear$/ }),
  });
  const addGearForm = page.locator("#gearAddForm");

  await openInventory(page);
  if (!(await addGearForm.isVisible())) {
    await gearSection.locator("[data-toggle-form='gearAddForm']").click();
  }
  await expect(addGearForm).toBeVisible();
  await addGearForm.locator("#inventoryNameInput").fill(name);
  await addGearForm.locator("#inventoryCountInput").fill(quantity);
  await addGearForm.locator("#inventoryNoteInput").fill(note);
  await addGearForm.locator("#addInventoryBtn").click();
  await expect(addGearForm).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  installRuntimeErrorCollectors(page);
  await clearAppStorage(page);
});

test.afterEach(async ({ page }) => {
  const failures = runtimeErrorFailures(page);
  runtimeErrorsByPage.delete(page);

  expect(
    failures,
    `Unexpected browser runtime errors:\n${failures.join("\n\n")}`,
  ).toEqual([]);
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

test("shows the read-only sources and rulesets page from the global menu", async ({
  page,
}) => {
  await enterTracker(page);
  await openHeaderMenu(page);
  await page.locator("#sourcesRulesetsMenuBtn").click();

  const panel = page.locator("#sourcesRulesetsPanel");
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "Sources & Rulesets", exact: true }),
  ).toBeVisible();
  await expect(panel).toContainText(
    "Browning Private Security & Detective Agency",
  );
  await expect(panel).toContainText("Savage Worlds: Adventure Edition");
  await expect(panel).toContainText("Deadlands: The Weird West");
  await expect(panel).toContainText("Deadlands Weird West Companion");
  await expect(panel).toContainText("Starting Wealth: $250");
  await expect(panel).toContainText("Starting Attribute Points: 5");
  await expect(panel).toContainText("Starting Skill Points: 12");
  await expect(panel).toContainText("This page is informational for now");
  await expect(panel.locator("input, select, textarea, button")).toHaveCount(0);
  await expect(
    page.locator(".app-tabs [data-app-tab='sourcesRulesets']"),
  ).toHaveCount(0);

  const primaryTabs = [
    ["Character", "#characterPanel"],
    ["Inventory", "#inventoryPanel"],
    ["Arcane", "#arcanePanel"],
    ["Notes", "#notesPanel"],
    ["Combat", "#playPanel"],
  ];
  for (const [name, panelId] of primaryTabs) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(panelId)).toHaveClass(/active/);
  }
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

test("keeps character slots in stable order when switching", async ({
  page,
}) => {
  await page.locator("#landingLoadSampleBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await page.locator("#libraryDuplicateActiveBtn").click();

  const namesBefore = await page
    .locator(".library-character h3")
    .allTextContents();
  await page
    .locator(".library-character")
    .first()
    .getByRole("button", {
      name: "Switch",
    })
    .click();
  const namesAfter = await page
    .locator(".library-character h3")
    .allTextContents();

  expect(namesAfter).toEqual(namesBefore);
});

test("selects and opens a saved character from the minimal landing page", async ({
  page,
}) => {
  const firstName = "Landing Character One";
  const secondName = "Landing Character Two";
  const characterSelect = page.locator("#landingCharacterSelect");

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await renameActiveCharacter(page, firstName);
  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await renameActiveCharacter(page, secondName);
  await expect(page.locator("#characterName")).toContainText(secondName);

  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator("#landingCharacterPicker")).toBeVisible();
  await expect(characterSelect.locator("option")).toHaveText([
    firstName,
    secondName,
  ]);
  await expect(characterSelect.locator("option:checked")).toHaveText(
    secondName,
  );
  await expect(page.locator("#landingContinueLabel")).toHaveText(
    `Continue as ${secondName}`,
  );

  await characterSelect.selectOption({ label: firstName });
  await expect(page.locator("#landingContinueLabel")).toHaveText(
    `Continue as ${firstName}`,
  );

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterName")).toContainText(firstName);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, expectedName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeName: active?.name || "",
            activeCharacterName: active?.character?.name || "",
            trackerName: tracker?.name || "",
            isExpectedActive: active?.name === expectedName,
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          expectedName: firstName,
        },
      ),
    )
    .toEqual({
      activeName: firstName,
      activeCharacterName: firstName,
      trackerName: firstName,
      isExpectedActive: true,
    });

  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(characterSelect.locator("option:checked")).toHaveText(firstName);

  await page.reload();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(characterSelect.locator("option:checked")).toHaveText(firstName);
});

test("imports JSON from the landing page only after confirmation", async ({
  page,
}) => {
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();

  await page.locator("#landingImportBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await expect(page.locator("#pasteImportPanel")).toBeVisible();
  await expect(page.locator("#importJsonText")).toBeVisible();
  await expect(page.getByText("Or upload a JSON file")).toBeVisible();
  await expect(page.locator(".import-file-option .file-label")).toBeVisible();

  await page.locator("#importFile").setInputFiles({
    name: "landing-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(await sample.text()),
  });

  await expect(page.locator("#pasteImportPanel")).toBeHidden();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText("Lehi Larson");
});

test("keeps duplicated character state independent across switching and reload", async ({
  page,
}) => {
  const originalName = "Healthy Character";
  const duplicateName = "Wounded Character";

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await renameActiveCharacter(page, originalName);
  await openCombat(page);
  await increaseWounds(page);
  await expectWounds(page, 1);

  await openCharacterLibrary(page);
  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await renameActiveCharacter(page, duplicateName);

  await openCombat(page);
  await expectWounds(page, 1);
  await increaseWounds(page);
  await expectWounds(page, 2);

  await switchToCharacter(page, originalName);
  await openCombat(page);
  await expectWounds(page, 1);

  await switchToCharacter(page, duplicateName);
  await openCombat(page);
  await expectWounds(page, 2);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, originalName, duplicateName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const entries = Object.values(library?.charactersById || {});
          const original = entries.find((entry) => entry.name === originalName);
          const duplicate = entries.find(
            (entry) => entry.name === duplicateName,
          );
          return {
            count: entries.length,
            originalEntryName: original?.name || "",
            originalCharacterName: original?.character?.name || "",
            originalWounds: original?.character?.damage?.wounds ?? null,
            duplicateEntryName: duplicate?.name || "",
            duplicateCharacterName: duplicate?.character?.name || "",
            duplicateWounds: duplicate?.character?.damage?.wounds ?? null,
            distinctIds:
              Boolean(original?.id) &&
              Boolean(duplicate?.id) &&
              original.id !== duplicate.id,
            activeName:
              library?.charactersById?.[library.activeCharacterId]?.name || "",
            activeCharacterName:
              library?.charactersById?.[library.activeCharacterId]?.character
                ?.name || "",
            trackerName: tracker?.name || "",
            trackerWounds: tracker?.damage?.wounds ?? null,
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          originalName,
          duplicateName,
        },
      ),
    )
    .toEqual({
      count: 2,
      originalEntryName: originalName,
      originalCharacterName: originalName,
      originalWounds: 1,
      duplicateEntryName: duplicateName,
      duplicateCharacterName: duplicateName,
      duplicateWounds: 2,
      distinctIds: true,
      activeName: duplicateName,
      activeCharacterName: duplicateName,
      trackerName: duplicateName,
      trackerWounds: 2,
    });

  await reloadIntoTracker(page);
  await expect(page.locator("#characterName")).toContainText(duplicateName);
  await expectWounds(page, 2);

  await switchToCharacter(page, originalName);
  await openCombat(page);
  await expectWounds(page, 1);

  await switchToCharacter(page, duplicateName);
  await openCombat(page);
  await expectWounds(page, 2);
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

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, deleteName, keepName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const entries = Object.values(library?.charactersById || {});
          return {
            count: entries.length,
            hasDeleted: entries.some((entry) => entry.name === deleteName),
            hasKeep: entries.some(
              (entry) =>
                entry.name === keepName && entry.character?.name === keepName,
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
    )
    .toEqual({
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

test("persists wounds for an unsaved active character across reload", async ({
  page,
}) => {
  await enterTracker(page);
  await openCombat(page);
  await increaseWounds(page);
  await expectWounds(page, 1);

  await reloadIntoTracker(page);
  await openCombat(page);
  await expectWounds(page, 1);
});

test("adds and deletes gear while preserving remaining inventory across reload", async ({
  page,
}) => {
  const deleteName = "Gear Item To Delete";
  const deleteNote = "This item should be deleted";
  const keepName = "Gear Item To Keep";
  const keepNote = "This item should remain";

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await openInventory(page);

  await addCustomGear(page, {
    name: deleteName,
    quantity: "2",
    note: deleteNote,
  });
  await addCustomGear(page, {
    name: keepName,
    quantity: "4",
    note: keepNote,
  });

  await expect(gearRow(page, deleteName)).toHaveCount(1);
  await expect(gearRow(page, deleteName)).toContainText("Qty 2");
  await expect(gearRow(page, deleteName)).toContainText(deleteNote);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, deleteName, keepName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          const libraryInventory = active?.character?.inventory || [];
          const trackerInventory = tracker?.inventory || [];
          const libraryDelete = libraryInventory.filter(
            (item) => item.name === deleteName,
          );
          const libraryKeep = libraryInventory.filter(
            (item) => item.name === keepName,
          );
          const trackerDelete = trackerInventory.filter(
            (item) => item.name === deleteName,
          );
          const trackerKeep = trackerInventory.filter(
            (item) => item.name === keepName,
          );
          return {
            libraryDeleteCount: libraryDelete.length,
            libraryDeleteQuantity: libraryDelete[0]?.count ?? null,
            libraryDeleteNote: libraryDelete[0]?.note || "",
            libraryKeepCount: libraryKeep.length,
            libraryKeepQuantity: libraryKeep[0]?.count ?? null,
            libraryKeepNote: libraryKeep[0]?.note || "",
            trackerDeleteCount: trackerDelete.length,
            trackerDeleteQuantity: trackerDelete[0]?.count ?? null,
            trackerDeleteNote: trackerDelete[0]?.note || "",
            trackerKeepCount: trackerKeep.length,
            trackerKeepQuantity: trackerKeep[0]?.count ?? null,
            trackerKeepNote: trackerKeep[0]?.note || "",
            trackerMatchesActive: tracker?.name === active?.character?.name,
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          deleteName,
          keepName,
        },
      ),
    )
    .toEqual({
      libraryDeleteCount: 1,
      libraryDeleteQuantity: 2,
      libraryDeleteNote: deleteNote,
      libraryKeepCount: 1,
      libraryKeepQuantity: 4,
      libraryKeepNote: keepNote,
      trackerDeleteCount: 1,
      trackerDeleteQuantity: 2,
      trackerDeleteNote: deleteNote,
      trackerKeepCount: 1,
      trackerKeepQuantity: 4,
      trackerKeepNote: keepNote,
      trackerMatchesActive: true,
    });

  await gearRow(page, deleteName).locator("button.delete-small").click();
  if (await page.locator("#appDialog").isVisible()) {
    await page.locator("#appDialogConfirmBtn").click();
  }

  await expect(gearRow(page, deleteName)).toHaveCount(0);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, keepName, deleteName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          const libraryInventory = active?.character?.inventory || [];
          const trackerInventory = tracker?.inventory || [];
          const libraryDelete = libraryInventory.filter(
            (item) => item.name === deleteName,
          );
          const libraryKeep = libraryInventory.filter(
            (item) => item.name === keepName,
          );
          const trackerDelete = trackerInventory.filter(
            (item) => item.name === deleteName,
          );
          const trackerKeep = trackerInventory.filter(
            (item) => item.name === keepName,
          );
          return {
            libraryDeleteCount: libraryDelete.length,
            libraryKeepCount: libraryKeep.length,
            libraryKeepQuantity: libraryKeep[0]?.count ?? null,
            libraryKeepNote: libraryKeep[0]?.note || "",
            trackerDeleteCount: trackerDelete.length,
            trackerKeepCount: trackerKeep.length,
            trackerKeepQuantity: trackerKeep[0]?.count ?? null,
            trackerKeepNote: trackerKeep[0]?.note || "",
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          keepName,
          deleteName,
        },
      ),
    )
    .toEqual({
      libraryDeleteCount: 0,
      libraryKeepCount: 1,
      libraryKeepQuantity: 4,
      libraryKeepNote: keepNote,
      trackerDeleteCount: 0,
      trackerKeepCount: 1,
      trackerKeepQuantity: 4,
      trackerKeepNote: keepNote,
    });

  await reloadIntoTracker(page);
  await openInventory(page);

  await expect(gearRow(page, deleteName)).toHaveCount(0);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);
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

  await openCombat(page);
  await increaseWounds(page);
  await page.getByRole("button", { name: "Notes" }).click();
  await page.locator("#notesArea").fill(noteText);

  await expect
    .poll(async () =>
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
    )
    .toEqual({
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
