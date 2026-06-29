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

async function openCharacterSetupReview(page) {
  await page.getByRole("button", { name: "Character", exact: true }).click();
  const setupPanel = page.locator("#characterSetupPanel");
  if (!(await setupPanel.isVisible())) {
    await page.locator("#reviewSetupBtn").click();
  }
  await expect(setupPanel).toBeVisible();
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

function weaponRow(page, name) {
  return page.locator("#weaponList .weapon-card").filter({
    has: page.getByRole("heading", {
      name: new RegExp(`^${escapeRegExp(name)}$`),
    }),
  });
}

async function addCustomGear(
  page,
  { name, quantity, note, catalogId, locationValue },
) {
  const gearSection = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: /^Gear$/ }),
  });
  const addGearForm = page.locator("#gearAddForm");

  await openInventory(page);
  if (!(await addGearForm.isVisible())) {
    await gearSection.locator("[data-toggle-form='gearAddForm']").click();
  }
  await expect(addGearForm).toBeVisible();
  if (catalogId)
    await addGearForm.locator("#gearSelect").selectOption(catalogId);
  if (name) await addGearForm.locator("#inventoryNameInput").fill(name);
  await addGearForm.locator("#inventoryCountInput").fill(quantity || "1");
  if (locationValue)
    await addGearForm
      .locator("#inventoryLocationSelect")
      .selectOption(locationValue);
  await addGearForm.locator("#inventoryNoteInput").fill(note || "");
  await addGearForm.locator("#addInventoryBtn").click();
  await expect(addGearForm).toBeHidden();
}

async function importSavagedSample(page, fileName) {
  const sample = await page.request.get(
    `/docs/Sample%20Characters/${encodeURIComponent(fileName)}`,
  );
  expect(sample.ok()).toBeTruthy();

  await enterTracker(page);
  await page.evaluate(
    (text) => {
      importJsonText(text);
    },
    await sample.text(),
  );
}

async function openAdvanceEditor(page, type) {
  await page.getByRole("button", { name: "Character", exact: true }).click();
  if (!(await page.locator("#showAdvanceFormBtn").isVisible())) {
    await page.locator("#reviewSetupBtn").click();
  }
  await expect(page.locator("#showAdvanceFormBtn")).toBeVisible();
  await page.locator("#showAdvanceFormBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeVisible();
  await page.locator("#advanceTypeInput").selectOption(type);
}

async function eligibleAdvanceSkills(page, mode) {
  return page.evaluate((advanceMode) => {
    return eligibleSkillsForAdvanceMode(advanceMode).map((skill) => {
      const target = skillTargetForName(skill.name);
      return {
        name: skill.name,
        before: target.before,
        after: target.after,
      };
    });
  }, mode);
}

function expectCanonicalAdvanceScaffold(advance, type) {
  expect(advance).toBeTruthy();
  expect(advance).toEqual(
    expect.objectContaining({
      type,
      label: expect.any(String),
      source: expect.any(String),
      advanceNumber: expect.any(Number),
      rankAtTime: expect.any(String),
      createdAt: expect.any(String),
      changes: expect.any(Array),
      notes: expect.any(String),
    }),
  );
  expect(advance.label).toBeTruthy();
  expect(advance.source).toBeTruthy();
  expect(advance.advanceNumber).toBeGreaterThan(0);
  expect(advance.rankAtTime).toBeTruthy();
  expect(advance.createdAt).toBeTruthy();
}

function expectCanonicalChangeScaffold(change) {
  expect(change).toBeTruthy();
  expect(change).toEqual(
    expect.objectContaining({
      path: expect.any(String),
      displayLabel: expect.any(String),
    }),
  );
  expect(Object.prototype.hasOwnProperty.call(change, "before")).toBe(true);
  expect(Object.prototype.hasOwnProperty.call(change, "after")).toBe(true);
  expect(change.path).toBeTruthy();
  expect(change.displayLabel).toBeTruthy();
}

async function firstEligibleAttributeAdvance(page) {
  return page.evaluate(() => {
    return ATTRIBUTE_ORDER.map((key) => ({
      key,
      ...attributeTargetForKey(key),
    })).find((target) => target.after && target.after !== target.before);
  });
}

async function firstAvailableAdvanceEdge(page) {
  return page.evaluate(() => {
    const known = new Set(
      (character.edges || []).map((edge) => plainEntryName(edge.name)),
    );
    const edge = EDGE_CATALOG.find(
      (item) => item.name && !known.has(plainEntryName(item.name)),
    );
    return edge
      ? {
          id: edge.id,
          name: edge.name,
        }
      : null;
  });
}

async function firstAvailableAdvancePower(page) {
  return page.evaluate(() => {
    const knownIds = new Set(
      (character.powers || []).map((power) => power.catalogId).filter(Boolean),
    );
    const knownNames = new Set(
      (character.powers || []).map((power) => plainEntryName(power.name)),
    );
    const power = POWER_CATALOG.find(
      (item) =>
        item.id &&
        item.name &&
        !knownIds.has(item.id) &&
        !knownNames.has(plainEntryName(item.name)),
    );
    return power
      ? {
          id: power.id,
          name: power.name,
        }
      : null;
  });
}

async function nonAdvancementMutationSnapshot(page) {
  return page.evaluate(() => {
    const copy = (value) => JSON.parse(JSON.stringify(value ?? null));
    return {
      attributes: copy(character.attributes),
      skills: copy(character.skills),
      edges: copy(character.edges),
      powers: copy(character.powers),
      resources: copy(character.resources),
      damage: copy(character.damage),
      moneyCents: character.moneyCents,
    };
  });
}

async function seedCanonicalAdvancementCharacter(page) {
  await enterTracker(page);
  await page.evaluate(() => {
    const testCharacter = normalize({
      source: "test",
      setupStatus: "needsReview",
      name: "Canonical Advancement Tester",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Regression Character",
      attributes: {
        agility: "d6",
        smarts: "d8",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [
        {
          name: "Shooting",
          die: "d8",
          linkedAttribute: "agility",
        },
        {
          name: "Fighting",
          die: "d4",
          linkedAttribute: "agility",
        },
        {
          name: "Riding",
          die: "d4",
          linkedAttribute: "agility",
        },
        {
          name: "Faith",
          die: "d6",
          linkedAttribute: "spirit",
        },
      ],
      edges: [],
      hindrances: [],
      powers: [],
      resources: [
        {
          id: "power-points",
          name: "Power Points",
          current: 10,
          max: 10,
          source: "test",
        },
      ],
      advances: [],
    });
    const entry = addCharacterSlot(testCharacter, {
      source: "test",
      preferredId: "canonical-advancement-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = false;
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });
  await expect(page.locator("#characterName")).toContainText(
    "Canonical Advancement Tester",
  );
}

async function importMinimalSavagedAdvancementHistory(page) {
  await enterTracker(page);
  await page.evaluate(
    (payload) => {
      importJsonText(JSON.stringify(payload));
    },
    {
      appVersion: "minimal-test",
      name: "Imported Advancement History",
      rankName: "Seasoned",
      race: "Human",
      attributes: [
        { name: "agility", label: "Agility", value: "d6" },
        { name: "smarts", label: "Smarts", value: "d6" },
        { name: "spirit", label: "Spirit", value: "d6" },
        { name: "strength", label: "Strength", value: "d6" },
        { name: "vigor", label: "Vigor", value: "d6" },
      ],
      skills: [
        {
          name: "Shooting",
          attribute: "agility",
          value: "d8",
        },
      ],
      advances: [
        {
          number: 1,
          name: "Raise Skill: Shooting",
          description: "Raise Skill: Shooting",
        },
        {
          number: 2,
          name: "Edge: Alertness",
          description: "Edge: Alertness",
        },
      ],
    },
  );
  await expect(page.locator("#characterName")).toContainText(
    "Imported Advancement History",
  );
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

test("loads the app and switches primary tabs @mobile", async ({ page }) => {
  await expect(page).toHaveTitle(/Deadlands Character Tracker/);
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await expect(page.locator(".app-tabs [data-app-tab='settings']")).toHaveCount(
    0,
  );
  await expect(page.locator(".app-tabs [data-app-tab='creation']")).toHaveCount(
    0,
  );
  await expect(page.locator(".app-tabs [data-app-tab='catalog']")).toHaveCount(
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

test("counts backpack load separately for combat and normal carrying", async ({
  page,
}) => {
  await enterTracker(page);
  await openInventory(page);

  const before = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
  }));

  await addCustomGear(page, {
    catalogId: "backpack",
    quantity: "1",
  });
  await expect(gearRow(page, "Backpack")).toContainText("On Body");

  await addCustomGear(page, {
    catalogId: "bedroll",
    quantity: "1",
    locationValue: "container:backpack",
  });
  await expect(gearRow(page, "Backpack")).toContainText("Total 13 lb");
  await expect(gearRow(page, "Bedroll")).toContainText("Inside Backpack");
  await expect(page.locator("#encumbranceDetails")).toContainText(
    "Current Load (Combat Load)",
  );

  const carried = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
  }));
  expect(carried.normalLoad - before.normalLoad).toBeCloseTo(13, 5);
  expect(carried.combatLoad).toBeCloseTo(before.combatLoad, 5);

  await gearRow(page, "Backpack").locator("select").selectOption("dropped");
  await expect(gearRow(page, "Backpack")).toContainText("Dropped");
  const dropped = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
  }));
  expect(dropped.combatLoad).toBeCloseTo(carried.combatLoad, 5);
  expect(carried.normalLoad - dropped.normalLoad).toBeCloseTo(13, 5);

  await gearRow(page, "Backpack").locator("select").selectOption("carried");
  await expect(gearRow(page, "Backpack")).toContainText("On Body");
  const pickedUp = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
  }));
  expect(pickedUp.normalLoad).toBeCloseTo(carried.normalLoad, 5);
  expect(pickedUp.combatLoad).toBeCloseTo(carried.combatLoad, 5);
});

test("shows current load combat load and carrying capacity separately", async ({
  page,
}) => {
  await enterTracker(page);
  await openInventory(page);

  const before = await page.evaluate(() => {
    const normal = calculateEncumbrance(character);
    const combat = calculateEncumbrance(character, { combat: true });
    return {
      normalLoad: normal.normalLoad,
      combatLoad: combat.combatLoad,
      carryingCapacity: normal.carryingCapacity,
      maximumNormalCarry: normal.normalCapacity,
      normalStatus: encumbranceText(normal),
      combatStatus: encumbranceText(combat),
      misleadingCurrentLoad: `${wt(normal.normalLoad)}/${wt(normal.normalCapacity)}`,
    };
  });
  expect(before.carryingCapacity).toBe(40);

  await addCustomGear(page, {
    catalogId: "backpack",
    quantity: "1",
  });
  await addCustomGear(page, {
    catalogId: "pick",
    quantity: "1",
    locationValue: "container:backpack",
  });
  await expect(gearRow(page, "Backpack")).toContainText("Total 15 lb");
  await expect(gearRow(page, "Pick")).toContainText("Inside Backpack");

  const after = await page.evaluate(() => {
    const normal = calculateEncumbrance(character);
    const combat = calculateEncumbrance(character, { combat: true });
    return {
      normalLoad: normal.normalLoad,
      combatLoad: combat.combatLoad,
      carryingCapacity: normal.carryingCapacity,
      maximumNormalCarry: normal.normalCapacity,
      normalStatus: encumbranceText(normal),
      combatStatus: encumbranceText(combat),
      misleadingCurrentLoad: `${wt(normal.normalLoad)}/${wt(normal.normalCapacity)}`,
    };
  });

  expect(after.normalLoad - before.normalLoad).toBeCloseTo(15, 5);
  expect(after.combatLoad).toBeCloseTo(before.combatLoad, 5);
  expect(after.normalLoad).toBeGreaterThan(after.carryingCapacity);
  expect(after.combatLoad).toBeLessThanOrEqual(after.carryingCapacity);
  expect(after.normalStatus).toBe("Encumbered");
  expect(after.combatStatus).toBe("Unencumbered");
  expect(after.maximumNormalCarry).toBe(80);

  const details = page.locator("#encumbranceDetails");
  await expect(details).toContainText("Current Load (Combat Load)");
  await expect(details).toContainText("Carrying Capacity");
  await expect(details).toContainText("Maximum Normal Carry");
  await expect(details).toContainText(
    "Normal - Encumbered, Combat - Unencumbered",
  );
  await expect(details).not.toContainText(after.misleadingCurrentLoad);
});

test("imports Savaged.us backpack contents without double-counting load", async ({
  page,
}) => {
  await importSavagedSample(
    page,
    "savaged-us-json-export-character-Dusty McCaw.json",
  );
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");

  const backpackWeights = await page.evaluate(() => {
    const backpack = character.inventory.find((item) =>
      /backpack/i.test(item.name || ""),
    );
    return {
      own: inventoryItemOwnWeight(backpack),
      contents: inventoryItemContentsWeight(backpack),
      total: inventoryItemTotalWeight(backpack),
      normalLoad: calculateEncumbrance(character).normalLoad,
      combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    };
  });
  expect(backpackWeights.own).toBe(3);
  expect(backpackWeights.contents).toBe(39);
  expect(backpackWeights.total).toBe(42);
  expect(backpackWeights.normalLoad).toBeGreaterThanOrEqual(
    backpackWeights.total,
  );
  expect(backpackWeights.normalLoad - backpackWeights.combatLoad).toBeCloseTo(
    backpackWeights.total,
    5,
  );
});

test("excludes off-person storage locations from carried load", async ({
  page,
}) => {
  await enterTracker(page);
  await openInventory(page);

  const before = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
  }));

  await addCustomGear(page, {
    catalogId: "pick",
    quantity: "1",
    locationValue: "stored:home",
  });
  await expect(gearRow(page, "Pick")).toContainText("Home");
  await expect(page.locator("#storageLocationList")).toContainText(
    "12 lb stored here",
  );

  const stored = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
  }));
  expect(stored.normalLoad).toBeCloseTo(before.normalLoad, 5);
  expect(stored.combatLoad).toBeCloseTo(before.combatLoad, 5);
  expect(stored.storedLoad - before.storedLoad).toBeCloseTo(12, 5);

  await gearRow(page, "Pick").locator("select").selectOption("carried");
  await expect(gearRow(page, "Pick")).toContainText("On Body");

  const carried = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
  }));
  expect(carried.normalLoad - stored.normalLoad).toBeCloseTo(12, 5);
  expect(carried.combatLoad - stored.combatLoad).toBeCloseTo(12, 5);
  expect(carried.storedLoad).toBeCloseTo(before.storedLoad, 5);
});

test("normalizes direct storage location values as off-person", async ({
  page,
}) => {
  await enterTracker(page);

  const result = await page.evaluate(() => {
    const storedCharacter = normalize({
      ...character,
      storageLocations: [{ id: "elsewhere", name: "Elsewhere" }],
      inventory: [
        {
          id: "iron-safe",
          name: "Iron Safe",
          count: 1,
          location: "cart",
          weight: 50,
        },
      ],
      weapons: [
        {
          id: "stored-rifle",
          name: "Stored Rifle",
          damage: "2d8",
          range: "24/48/96",
          rof: "1",
          ap: "—",
          weight: 8,
          itemLocation: "stored:cart",
        },
      ],
      armorInventory: [
        {
          id: "stored-coat",
          name: "Stored Coat",
          count: 1,
          armor: 1,
          weight: 10,
          location: "torso",
          itemLocation: "home",
        },
      ],
      ammo: {
        storedAmmo: {
          label: "Stored ammo",
          count: 10,
          weight: 0.1,
          itemLocation: "home",
        },
      },
      consumables: [
        {
          id: "stored-food",
          name: "Stored food",
          count: 3,
          weight: 2,
          itemLocation: "elsewhere",
        },
      ],
    });
    return {
      inventoryLocation: storedCharacter.inventory[0].location,
      inventoryStorageId: storedCharacter.inventory[0].storageId,
      weaponLocation: storedCharacter.weapons[0].itemLocation,
      weaponStorageId: storedCharacter.weapons[0].storageId,
      armorLocation: storedCharacter.armorInventory[0].itemLocation,
      armorStorageId: storedCharacter.armorInventory[0].storageId,
      ammoLocation: storedCharacter.ammo.storedAmmo.itemLocation,
      ammoStorageId: storedCharacter.ammo.storedAmmo.storageId,
      consumableLocation: storedCharacter.consumables[0].itemLocation,
      consumableStorageId: storedCharacter.consumables[0].storageId,
      normalLoad: calculateEncumbrance(storedCharacter).normalLoad,
      combatLoad: calculateEncumbrance(storedCharacter, { combat: true })
        .combatLoad,
      storedLoad:
        calculateEncumbrance(storedCharacter).inventoryTotals.storedLoad,
    };
  });

  expect(result).toEqual({
    inventoryLocation: "stored",
    inventoryStorageId: "cart",
    weaponLocation: "stored",
    weaponStorageId: "cart",
    armorLocation: "stored",
    armorStorageId: "home",
    ammoLocation: "stored",
    ammoStorageId: "home",
    consumableLocation: "stored",
    consumableStorageId: "elsewhere",
    normalLoad: 0,
    combatLoad: 0,
    storedLoad: 75,
  });
});

test("stores weapons in containers and off-person locations", async ({
  page,
}) => {
  await enterTracker(page);
  await openInventory(page);

  await addCustomGear(page, {
    catalogId: "backpack",
    quantity: "1",
  });
  await expect(gearRow(page, "Backpack")).toContainText("On Body");

  const beforeContainer = await page.evaluate(() => {
    const weapon = character.weapons.find((item) => item.id === "colt-army-44");
    return {
      normalLoad: calculateEncumbrance(character).normalLoad,
      combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
      weaponWeight: physicalItemWeight({
        type: "weapon",
        id: weapon.id,
        label: weapon.name,
        item: weapon,
      }),
    };
  });

  await weaponRow(page, "Colt Army (.44)")
    .locator("select")
    .selectOption("container:backpack");
  await expect(weaponRow(page, "Colt Army (.44)")).toContainText(
    "Inside Backpack",
  );
  await expect(gearRow(page, "Colt Army (.44)")).toContainText(
    "Inside Backpack",
  );

  const inBackpack = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    weaponLocation: character.weapons.find((item) => item.id === "colt-army-44")
      ?.itemLocation,
    weaponContainerId: character.weapons.find(
      (item) => item.id === "colt-army-44",
    )?.containerId,
  }));
  expect(inBackpack.normalLoad).toBeCloseTo(beforeContainer.normalLoad, 5);
  expect(beforeContainer.combatLoad - inBackpack.combatLoad).toBeCloseTo(
    beforeContainer.weaponWeight,
    5,
  );
  expect(inBackpack.weaponLocation).toBe("container");
  expect(inBackpack.weaponContainerId).toBe("backpack");

  await openCombat(page);
  await expect(page.locator("#playWeaponList")).not.toContainText(
    "Colt Army (.44)",
  );

  await openInventory(page);
  const beforeHome = await page.evaluate(() => {
    const weapon = character.weapons.find((item) => item.id === "lariat");
    return {
      normalLoad: calculateEncumbrance(character).normalLoad,
      combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
      storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
      weaponWeight: physicalItemWeight({
        type: "weapon",
        id: weapon.id,
        label: weapon.name,
        item: weapon,
      }),
    };
  });

  await weaponRow(page, "Lariat").locator("select").selectOption("stored:home");
  await expect(weaponRow(page, "Lariat")).toContainText("Home");
  await expect(page.locator("#storageLocationList")).toContainText("Lariat");

  const atHome = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
    weaponLocation: character.weapons.find((item) => item.id === "lariat")
      ?.itemLocation,
    weaponStorageId: character.weapons.find((item) => item.id === "lariat")
      ?.storageId,
  }));
  expect(beforeHome.normalLoad - atHome.normalLoad).toBeCloseTo(
    beforeHome.weaponWeight,
    5,
  );
  expect(beforeHome.combatLoad - atHome.combatLoad).toBeCloseTo(
    beforeHome.weaponWeight,
    5,
  );
  expect(atHome.storedLoad - beforeHome.storedLoad).toBeCloseTo(
    beforeHome.weaponWeight,
    5,
  );
  expect(atHome.weaponLocation).toBe("stored");
  expect(atHome.weaponStorageId).toBe("home");

  await openCombat(page);
  await expect(page.locator("#playWeaponList")).not.toContainText("Lariat");
});

test("starts new characters directly in character setup @mobile", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingCreateBtn").click();

  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#creationPanel")).toBeHidden();
  await expect(page.locator("#characterName")).toContainText(
    "Untitled Character",
  );
  await expect(page.locator(".setup-persistence-panel.unsaved")).toContainText(
    "Unsaved setup draft",
  );
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='concept']")).toHaveAttribute(
    "aria-current",
    "step",
  );

  await page.locator("[data-setup-step='attributesSkills']").click();
  await expect(page.locator("#setupTraitsPanel")).toContainText(
    "Edit starting Attributes",
  );
  await expect(
    page.locator("#setupTraitsPanel [data-setup-action='incAttribute']"),
  ).not.toHaveCount(0);

  const stored = await page.evaluate(
    ({ libraryKey, storageKey }) => {
      const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
      const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
      return {
        slotCount: Object.keys(library?.charactersById || {}).length,
        activeSource:
          library?.charactersById?.[library.activeCharacterId]?.source || "",
        trackerSource: tracker?.source || "",
        hasBaseline: Boolean(tracker?.creationBaseline),
      };
    },
    { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
  );
  expect(stored).toEqual({
    slotCount: 0,
    activeSource: "",
    trackerSource: "",
    hasBaseline: false,
  });

  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogInput").fill("Saved Draft Prospect");
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Saved character slot",
  );

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          return {
            slotCount: Object.keys(library?.charactersById || {}).length,
            activeSource:
              library?.charactersById?.[library.activeCharacterId]?.source ||
              "",
            trackerSource: tracker?.source || "",
            hasBaseline: Boolean(tracker?.creationBaseline),
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      slotCount: 1,
      activeSource: "created",
      trackerSource: "created",
      hasBaseline: true,
    });

  await openHeaderMenu(page);
  await expect(page.locator("#creatorModeBtn")).toHaveText("New Character");
  await page.locator("#creatorModeBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Untitled Character",
  );
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("#creationPanel")).toBeHidden();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Object.keys(
            JSON.parse(localStorage.getItem(key) || "null")?.charactersById ||
              {},
          ).length,
        CHARACTER_LIBRARY_KEY,
      ),
    )
    .toBe(1);

  await page.locator("[data-setup-action='discardDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );

  await page.locator("[data-setup-action='deleteCharacterSlot']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Object.keys(
            JSON.parse(localStorage.getItem(key) || "null")?.charactersById ||
              {},
          ).length,
        CHARACTER_LIBRARY_KEY,
      ),
    )
    .toBe(0);
});

test("normalizes legacy characters without setupStatus as complete", async ({
  page,
}) => {
  const setupStatus = await page.evaluate(
    () =>
      normalize({
        name: "Legacy Character",
        rank: "Novice",
        attributes: {},
        skills: [],
      }).setupStatus,
  );

  expect(setupStatus).toBe("complete");
});

test("shows a clean reference sheet for confirmed characters", async ({
  page,
}) => {
  await importSavagedSample(
    page,
    "savaged-us-json-export-character-Dusty McCaw.json",
  );
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page
    .locator("#characterSetupPanel [data-setup-action='confirmSetup']")
    .click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();

  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSummaryName")).toContainText(
    "Dusty McCaw",
  );
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    "Drifter",
  );
  await expect(page.locator("#characterBasicsList")).toContainText("Human");
  await expect(page.locator("#characterDerivedDetails")).toContainText("Pace");
  await expect(page.locator("#characterDerivedDetails")).toContainText("Parry");
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Toughness",
  );
  await expect(page.locator("#attributesList")).toContainText("Agility");
  await expect(page.locator("#skillsList")).toContainText("Shooting");
  await expect(page.locator("#edgesList")).toContainText("Healer");
  await expect(page.locator("#hindrancesList")).toContainText("Bad Luck");

  await expect(page.locator("#reviewSetupBtn")).toBeVisible();
  await expect(page.locator("#manageCharacterBtn")).toBeVisible();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#characterSetupStepper")).toBeHidden();
  await expect(page.locator("#setupConceptPanel")).toBeHidden();
  await expect(page.locator("#setupSaveConceptBtn")).toBeHidden();
  await expect(page.locator("#showAdvanceFormBtn")).toBeHidden();
  await expect(page.locator("#showEdgeFormBtn")).toBeHidden();
  await expect(page.locator("#showHindranceFormBtn")).toBeHidden();
  await expect(page.locator("#addManualPowerPointsBtn")).toBeHidden();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#edgeEditorPanel")).toBeHidden();
  await expect(page.locator("#hindranceEditorPanel")).toBeHidden();

  await page.locator("#manageCharacterBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await expect(page.locator("#characterProfileEditor")).toBeVisible();

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#characterSetupStepper")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeSetupStatus: active?.character?.setupStatus || "",
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      activeSetupStatus: "complete",
      trackerSetupStatus: "complete",
    });
});

async function seedEffectHookCharacter(page, options = {}) {
  await enterTracker(page);
  await page.evaluate((seedOptions) => {
    const edgeIds = seedOptions.edgeIds || [];
    const hindranceIds = seedOptions.hindranceIds || [];
    const edges = edgeIds.map((id) => {
      const edge = EDGE_CATALOG.find((item) => item.id === id);
      return {
        ...edge,
        id,
        catalogId: edge.id,
        source: "Effect hook test",
        isCustom: false,
      };
    });
    const hindrances = hindranceIds.map((id) => {
      const hindrance = HINDRANCE_CATALOG.find((item) => item.id === id);
      const severity = seedOptions.hindranceSeverities?.[id];
      return {
        ...hindrance,
        id,
        catalogId: hindrance.id,
        severity: severity || hindrance.severity,
        source: "Effect hook test",
        isCustom: false,
      };
    });
    const characterData = normalize({
      source: seedOptions.source || "created",
      setupStatus: "complete",
      name: seedOptions.name || "Effect Hook Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Tester",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [],
      edges,
      hindrances,
      advances: [],
      derived: {
        pace: 6,
        parry: 2,
        baseToughness: 5,
        toughness: 5,
        armor: 0,
        baseSize: 0,
        ...(seedOptions.derived || {}),
      },
      damage: {
        wounds: 0,
        maxWounds: 3,
        fatigue: 0,
        maxFatigue: 2,
        ...(seedOptions.damage || {}),
      },
      armorStrength: "d6",
      weaponStrength: "d6",
      inventory: seedOptions.inventory || [],
      weapons: seedOptions.weapons || [],
      armorInventory: [],
      ammo: {},
      consumables: [],
      vehicles: [],
      powers: [],
      resources: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: seedOptions.preferredId || "effect-hook-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = false;
    characterDraftMode = false;
    render();
    renderDemoExperience();
  }, options);
}

test("Brawny passive effect updates Character Combat and Inventory surfaces", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Brawny Effect Tester",
    preferredId: "brawny-effect-tester",
    edgeIds: ["swade-edge-brawny"],
    inventory: [
      {
        id: "test-load",
        name: "Test Load",
        count: 1,
        weight: 55,
        location: "carried",
      },
    ],
    weapons: [
      {
        id: "heavy-test-weapon",
        name: "Heavy Test Weapon",
        damage: "2d8",
        range: "12/24/48",
        ap: 0,
        rof: 1,
        shotsMax: null,
        shotsLoaded: null,
        ammoType: null,
        minStr: "d8",
        weight: 1,
        itemLocation: "carried",
      },
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Brawny");
  await expect(derived).toContainText("Size +1");
  await expect(derived).toContainText("Toughness +1");
  await expect(derived).toContainText("Toughness");
  await expect(derived).toContainText("6");

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Brawny: Toughness +1",
  );

  await openInventory(page);
  const encumbrance = page.locator("#encumbranceDetails");
  await expect(encumbrance).toContainText("Effective Strength");
  await expect(encumbrance).toContainText("d8");
  await expect(encumbrance).toContainText("Passive Effects");
  await expect(encumbrance).toContainText(
    "Brawny: Strength counts one die higher",
  );
  await expect(page.locator("#weaponList")).not.toContainText(
    "Strength too low",
  );

  const computed = await page.evaluate(() => ({
    effectiveStrength: calculateEncumbrance(character).effectiveStrength,
    capacity: calculateEncumbrance(character).carryingCapacity,
    toughness: character.derived.toughness,
    size: character.derived.size,
    minStrengthMessage: getWeaponStrengthUsageInfo(
      effectiveStrengthForScope(
        character,
        character.weaponStrength,
        "minimum-strength",
      ),
      character.weapons[0],
    ).message,
  }));
  expect(computed).toEqual({
    effectiveStrength: "d8",
    capacity: 60,
    toughness: 6,
    size: 1,
    minStrengthMessage: "",
  });
});

test("Small passive effect reduces displayed Size and Toughness", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Small Effect Tester",
    preferredId: "small-effect-tester",
    hindranceIds: ["swade-hindrance-small"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Small");
  await expect(derived).toContainText("Size -1");
  await expect(derived).toContainText("Toughness -1");

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Small: Toughness -1",
  );

  const computed = await page.evaluate(() => ({
    toughness: character.derived.toughness,
    size: character.derived.size,
    hooks: activeEffectHooks(character).map((hook) => hook.id),
  }));
  expect(computed).toEqual({
    toughness: 4,
    size: -1,
    hooks: ["hindrance-small"],
  });
});

test("Fleet-Footed passive effect updates Pace and reminders", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Fleet-Footed Effect Tester",
    preferredId: "fleet-footed-effect-tester",
    edgeIds: ["swade-edge-fleet-footed"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Fleet-Footed");
  await expect(derived).toContainText("Pace +2");
  await expect(derived).toContainText("Running die increases one step");
  await expect(derived).toContainText("8");

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Fleet-Footed: Pace +2",
  );
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Fleet-Footed: Running die increases one step",
  );

  const computed = await page.evaluate(() => ({
    pace: character.derived.pace,
    paceModifier: character.derived.effectPaceModifier,
    hooks: activeEffectHooks(character).map((hook) => hook.id),
  }));
  expect(computed).toEqual({
    pace: 8,
    paceModifier: 2,
    hooks: ["edge-fleet-footed"],
  });
});

test("Block passive math increases Parry from a trusted baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Block Effect Tester",
    preferredId: "block-effect-tester",
    edgeIds: ["swade-edge-block"],
    derived: {
      parry: 5,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Parry");
  await expect(derived).toContainText("Base 5 + Effects +1");
  await expect(derived).toContainText("Block");
  await expect(derived).toContainText("Parry +1");
  await expect(derived).toContainText("Ignore 1 point of Gang Up bonus");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Block: Parry +1");
  await expect(combatBreakdown).toContainText(
    "Block: Ignore 1 point of Gang Up bonus",
  );

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    baseParry: character.derived.baseParry,
    parryModifier: character.derived.effectParryModifier,
    pendingParryModifier: character.derived.effectParryPendingModifier,
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.target === "parry")
      .map((effect) => effect.displayLabel),
  }));
  expect(computed).toEqual({
    parry: 6,
    baseParry: 5,
    parryModifier: 1,
    pendingParryModifier: 0,
    summaries: ["Parry +1"],
  });
});

test("Improved Block passive math replaces Block bonus instead of stacking", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Improved Block Effect Tester",
    preferredId: "improved-block-effect-tester",
    edgeIds: ["swade-edge-block", "swade-edge-improved-block"],
    derived: {
      parry: 5,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Base 5 + Effects +2");
  await expect(derived).toContainText("Improved Block");
  await expect(derived).toContainText("Parry +2");
  await expect(derived).not.toContainText("Parry +1");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Improved Block: Parry +2");
  await expect(combatBreakdown).toContainText(
    "Improved Block: Ignore 2 points of Gang Up bonus",
  );
  await expect(combatBreakdown).not.toContainText("Block: Parry +1");

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    baseParry: character.derived.baseParry,
    parryModifier: character.derived.effectParryModifier,
    activeHooks: activeEffectHooks(character).map((hook) => hook.id),
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) => ["parry", "gang-up"].includes(effect.target))
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    parry: 7,
    baseParry: 5,
    parryModifier: 2,
    activeHooks: ["edge-block", "edge-improved-block"],
    summaries: [
      "Improved Block: Parry +2",
      "Improved Block: Ignore 2 points of Gang Up bonus",
    ],
  });
});

test("Block passive math does not double-count imported Parry without a baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Imported Block Effect Tester",
    preferredId: "imported-block-effect-tester",
    source: "savaged.us",
    edgeIds: ["swade-edge-block"],
    derived: {
      parry: 7,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Parry");
  await expect(derived).toContainText("7");
  await expect(derived).toContainText(
    "Recorded total; passive Parry effect shown below",
  );
  await expect(derived).toContainText("Block");
  await expect(derived).toContainText("Parry +1");

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    hasBaseParry: Object.hasOwn(character.derived, "baseParry"),
    parryModifier: character.derived.effectParryModifier,
    pendingParryModifier: character.derived.effectParryPendingModifier,
  }));
  expect(computed).toEqual({
    parry: 7,
    hasBaseParry: false,
    parryModifier: 0,
    pendingParryModifier: 1,
  });
});

test("Weapon Master passive math increases Parry from a trusted baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Weapon Master Effect Tester",
    preferredId: "weapon-master-effect-tester",
    edgeIds: ["swade-edge-weapon-master"],
    derived: {
      parry: 5,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Parry");
  await expect(derived).toContainText("Base 5 + Effects +1");
  await expect(derived).toContainText("Weapon Master");
  await expect(derived).toContainText("Parry +1");
  await expect(derived).toContainText("Fighting bonus damage die becomes d8");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Weapon Master: Parry +1");
  await expect(combatBreakdown).toContainText(
    "Weapon Master: Fighting bonus damage die becomes d8",
  );

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    baseParry: character.derived.baseParry,
    parryModifier: character.derived.effectParryModifier,
    pendingParryModifier: character.derived.effectParryPendingModifier,
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) =>
        ["parry", "fighting-bonus-damage"].includes(effect.target),
      )
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    parry: 6,
    baseParry: 5,
    parryModifier: 1,
    pendingParryModifier: 0,
    summaries: [
      "Weapon Master: Parry +1",
      "Weapon Master: Fighting bonus damage die becomes d8",
    ],
  });
});

test("Master of Arms replaces Weapon Master bonus and stacks with Block", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Master of Arms Effect Tester",
    preferredId: "master-of-arms-effect-tester",
    edgeIds: [
      "swade-edge-block",
      "swade-edge-weapon-master",
      "swade-edge-master-of-arms",
    ],
    derived: {
      parry: 5,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Base 5 + Effects +3");
  await expect(derived).toContainText("Block");
  await expect(derived).toContainText("Master of Arms");
  await expect(derived).toContainText("Parry +2");
  await expect(derived).toContainText("Fighting bonus damage die becomes d10");
  await expect(derived).not.toContainText(
    "Fighting bonus damage die becomes d8",
  );

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Block: Parry +1");
  await expect(combatBreakdown).toContainText("Master of Arms: Parry +2");
  await expect(combatBreakdown).toContainText(
    "Master of Arms: Fighting bonus damage die becomes d10",
  );
  await expect(combatBreakdown).not.toContainText(
    "Weapon Master: Fighting bonus damage die becomes d8",
  );

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    baseParry: character.derived.baseParry,
    parryModifier: character.derived.effectParryModifier,
    activeHooks: activeEffectHooks(character).map((hook) => hook.id),
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) =>
        ["parry", "gang-up", "fighting-bonus-damage"].includes(effect.target),
      )
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    parry: 8,
    baseParry: 5,
    parryModifier: 3,
    activeHooks: ["edge-block", "edge-weapon-master", "edge-master-of-arms"],
    summaries: [
      "Block: Parry +1",
      "Block: Ignore 1 point of Gang Up bonus",
      "Master of Arms: Parry +2",
      "Master of Arms: Fighting bonus damage die becomes d10",
    ],
  });
});

test("Weapon Master passive math does not double-count imported Parry without a baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Imported Weapon Master Effect Tester",
    preferredId: "imported-weapon-master-effect-tester",
    source: "savaged.us",
    edgeIds: ["swade-edge-weapon-master"],
    derived: {
      parry: 8,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Parry");
  await expect(derived).toContainText("8");
  await expect(derived).toContainText(
    "Recorded total; passive Parry effect shown below",
  );
  await expect(derived).toContainText("Weapon Master");
  await expect(derived).toContainText("Parry +1");

  const computed = await page.evaluate(() => ({
    parry: character.derived.parry,
    hasBaseParry: Object.hasOwn(character.derived, "baseParry"),
    parryModifier: character.derived.effectParryModifier,
    pendingParryModifier: character.derived.effectParryPendingModifier,
  }));
  expect(computed).toEqual({
    parry: 8,
    hasBaseParry: false,
    parryModifier: 0,
    pendingParryModifier: 1,
  });
});

test("Brawler passive math increases Toughness from a trusted baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Brawler Effect Tester",
    preferredId: "brawler-effect-tester",
    edgeIds: ["swade-edge-brawler"],
    derived: {
      baseToughness: 5,
      toughness: 5,
      armor: 0,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Toughness");
  await expect(derived).toContainText("Base 5 + Effects +1 + Armor 0");
  await expect(derived).toContainText("Brawler");
  await expect(derived).toContainText("Toughness +1");
  await expect(derived).toContainText("Improved unarmed damage");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Brawler: Toughness +1");
  await expect(combatBreakdown).toContainText(
    "Brawler: Improved unarmed damage",
  );

  const computed = await page.evaluate(() => ({
    toughness: character.derived.toughness,
    toughnessModifier: character.derived.effectToughnessModifier,
    pendingToughnessModifier: character.derived.effectToughnessPendingModifier,
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) =>
        ["toughness", "unarmed-damage"].includes(effect.target),
      )
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    toughness: 6,
    toughnessModifier: 1,
    pendingToughnessModifier: 0,
    summaries: ["Brawler: Toughness +1", "Brawler: Improved unarmed damage"],
  });
});

test("Brawler passive math does not double-count imported Toughness without a trusted baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Imported Brawler Effect Tester",
    preferredId: "imported-brawler-effect-tester",
    source: "savaged.us",
    edgeIds: ["swade-edge-brawler"],
    derived: {
      baseToughness: 7,
      toughness: 7,
      armor: 0,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Toughness");
  await expect(derived).toContainText("7");
  await expect(derived).toContainText(
    "Recorded total; passive Toughness effect shown below",
  );
  await expect(derived).toContainText("Brawler");
  await expect(derived).toContainText("Toughness +1");

  const computed = await page.evaluate(() => ({
    toughness: character.derived.toughness,
    toughnessModifier: character.derived.effectToughnessModifier,
    pendingToughnessModifier: character.derived.effectToughnessPendingModifier,
  }));
  expect(computed).toEqual({
    toughness: 7,
    toughnessModifier: 0,
    pendingToughnessModifier: 1,
  });
});

test("Tough as Nails increases Wound capacity from a trusted baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Tough as Nails Effect Tester",
    preferredId: "tough-as-nails-effect-tester",
    edgeIds: ["swade-edge-tough-as-nails"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterStatusStrip")).toContainText("0 / 4");
  await expect(page.locator("#woundsNote")).toContainText("Healthy");
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Tough as Nails");
  await expect(derived).toContainText(
    "Maximum Wounds +1; can take four Wounds",
  );

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Tough as Nails: Maximum Wounds +1; can take four Wounds",
  );

  const computed = await page.evaluate(() => ({
    maxWounds: character.damage.maxWounds,
    baseMaxWounds: character.damage.baseMaxWounds,
    maxWoundsModifier: character.damage.effectMaxWoundsModifier,
    pendingMaxWoundsModifier: character.damage.effectMaxWoundsPendingModifier,
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.target === "max-wounds")
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    maxWounds: 4,
    baseMaxWounds: 3,
    maxWoundsModifier: 1,
    pendingMaxWoundsModifier: 0,
    summaries: ["Tough as Nails: Maximum Wounds +1; can take four Wounds"],
  });
});

test("Tougher than Nails replaces Tough as Nails Wound capacity", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Tougher than Nails Effect Tester",
    preferredId: "tougher-than-nails-effect-tester",
    edgeIds: ["swade-edge-tough-as-nails", "swade-edge-tougher-than-nails"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterStatusStrip")).toContainText("0 / 5");
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Tougher than Nails");
  await expect(derived).toContainText(
    "Maximum Wounds +2; can take five Wounds",
  );
  await expect(derived).not.toContainText("Tough as NailsMaximum Wounds +1");

  const computed = await page.evaluate(() => ({
    maxWounds: character.damage.maxWounds,
    baseMaxWounds: character.damage.baseMaxWounds,
    maxWoundsModifier: character.damage.effectMaxWoundsModifier,
    activeHooks: activeEffectHooks(character).map((hook) => hook.id),
    summaries: effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.target === "max-wounds")
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
  }));
  expect(computed).toEqual({
    maxWounds: 5,
    baseMaxWounds: 3,
    maxWoundsModifier: 2,
    activeHooks: ["edge-tough-as-nails", "edge-tougher-than-nails"],
    summaries: ["Tougher than Nails: Maximum Wounds +2; can take five Wounds"],
  });
});

test("Tough as Nails does not double-count imported Wound capacity without a baseline", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Imported Tough as Nails Effect Tester",
    preferredId: "imported-tough-as-nails-effect-tester",
    source: "savaged.us",
    edgeIds: ["swade-edge-tough-as-nails"],
    damage: {
      maxWounds: 4,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterStatusStrip")).toContainText("0 / 4");
  await expect(page.locator("#woundsNote")).toContainText(
    "Recorded Wound maximum; passive Wound capacity effect shown below.",
  );
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Tough as Nails",
  );

  const computed = await page.evaluate(() => ({
    maxWounds: character.damage.maxWounds,
    hasBaseMaxWounds: Object.hasOwn(character.damage, "baseMaxWounds"),
    maxWoundsModifier: character.damage.effectMaxWoundsModifier,
    pendingMaxWoundsModifier: character.damage.effectMaxWoundsPendingModifier,
  }));
  expect(computed).toEqual({
    maxWounds: 4,
    hasBaseMaxWounds: false,
    maxWoundsModifier: 0,
    pendingMaxWoundsModifier: 1,
  });
});

test("Nerves of Steel reduces active wound penalties", async ({ page }) => {
  await seedEffectHookCharacter(page, {
    name: "Nerves Effect Tester",
    preferredId: "nerves-effect-tester",
    edgeIds: ["swade-edge-nerves-of-steel"],
    damage: {
      wounds: 2,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#woundPenalty")).toContainText("Penalty -1");
  await expect(page.locator("#woundsNote")).toContainText(
    "Wound penalty reduced by 1 from passive effects.",
  );
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Nerves of Steel",
  );
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Ignore 1 Wound penalty level",
  );

  await openCombat(page);
  await expect(page.locator("#combatPenaltyTotal")).toHaveText("-1");
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Wounds -1");
  await expect(combatBreakdown).toContainText(
    "Nerves of Steel: Ignore 1 Wound penalty level",
  );

  const computed = await page.evaluate(() => ({
    reduction: characterWoundPenaltyReduction(character, "combat"),
    penaltyInfo: combatPenaltyInfo(),
  }));
  expect(computed.reduction).toBe(1);
  expect(computed.penaltyInfo.total).toBe(1);
  expect(computed.penaltyInfo.traitPenalties).toEqual([
    { label: "Wounds", value: -1 },
  ]);
});

test("Improved Nerves of Steel replaces Nerves wound penalty reduction", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Improved Nerves Effect Tester",
    preferredId: "improved-nerves-effect-tester",
    edgeIds: [
      "swade-edge-nerves-of-steel",
      "swade-edge-improved-nerves-of-steel",
    ],
    damage: {
      wounds: 3,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#woundPenalty")).toContainText("Penalty -1");
  await expect(page.locator("#woundsNote")).toContainText(
    "Wound penalty reduced by 2 from passive effects.",
  );

  await openCombat(page);
  await expect(page.locator("#combatPenaltyTotal")).toHaveText("-1");
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText(
    "Improved Nerves of Steel: Ignore up to 2 Wound penalty levels",
  );
  await expect(combatBreakdown).not.toContainText(
    "Nerves of Steel: Ignore 1 Wound penalty level",
  );

  const computed = await page.evaluate(() => ({
    reduction: characterWoundPenaltyReduction(character, "combat"),
    activeHooks: activeEffectHooks(character).map((hook) => hook.id),
    summaries: effectHookSummariesForSurface(character, "combat")
      .filter((effect) => effect.target === "wound-penalty")
      .map((effect) => `${effect.sourceName}: ${effect.displayLabel}`),
    penaltyInfo: combatPenaltyInfo(),
  }));
  expect(computed).toEqual({
    reduction: 2,
    activeHooks: ["edge-improved-nerves-of-steel", "edge-nerves-of-steel"],
    summaries: [
      "Improved Nerves of Steel: Ignore up to 2 Wound penalty levels",
    ],
    penaltyInfo: {
      total: 1,
      traitPenalties: [{ label: "Wounds", value: -1 }],
      modifiers: [
        "Improved Nerves of Steel: Ignore up to 2 Wound penalty levels",
      ],
    },
  });
});

test("Obese passive effect updates Pace Size Toughness and Minimum Strength", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Obese Effect Tester",
    preferredId: "obese-effect-tester",
    hindranceIds: ["swade-hindrance-obese"],
    weapons: [
      {
        id: "minimum-strength-test-rifle",
        name: "Minimum Strength Test Rifle",
        damage: "2d8",
        range: "12/24/48",
        ap: 0,
        rof: 1,
        shotsMax: null,
        shotsLoaded: null,
        ammoType: null,
        minStr: "d6",
        weight: 1,
        itemLocation: "carried",
      },
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Obese");
  await expect(derived).toContainText("Pace -1");
  await expect(derived).toContainText("Size +1");
  await expect(derived).toContainText("Toughness +1 from Size");
  await expect(derived).toContainText("Running die is d4");

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Obese: Pace -1",
  );

  await openInventory(page);
  await expect(page.locator("#encumbranceDetails")).toContainText(
    "Obese: Strength counts one die lower for Minimum Strength",
  );
  await expect(page.locator("#weaponList")).toContainText(
    "Strength too low: ranged attacks suffer -1.",
  );

  const computed = await page.evaluate(() => ({
    pace: character.derived.pace,
    toughness: character.derived.toughness,
    size: character.derived.size,
    minimumStrength: effectiveStrengthForScope(
      character,
      character.weaponStrength,
      "minimum-strength",
    ),
    encumbranceStrength: calculateEncumbrance(character).effectiveStrength,
    minStrengthMessage: getWeaponStrengthUsageInfo(
      effectiveStrengthForScope(
        character,
        character.weaponStrength,
        "minimum-strength",
      ),
      character.weapons[0],
    ).message,
    hooks: activeEffectHooks(character).map((hook) => hook.id),
  }));
  expect(computed).toEqual({
    pace: 5,
    toughness: 6,
    size: 1,
    minimumStrength: "d4",
    encumbranceStrength: "d6",
    minStrengthMessage: "Strength too low: ranged attacks suffer -1.",
    hooks: ["hindrance-obese"],
  });
});

test("Minor Slow passive effect uses normalized Hindrance severity", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Minor Slow Effect Tester",
    preferredId: "minor-slow-effect-tester",
    hindranceIds: ["swade-hindrance-slow"],
    hindranceSeverities: {
      "swade-hindrance-slow": "Minor",
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Slow (Minor)");
  await expect(derived).toContainText("Pace -1");
  await expect(derived).toContainText("Running die is d4");
  await expect(derived).not.toContainText("Athletics and rolls to resist");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Slow (Minor): Pace -1");
  await expect(combatBreakdown).toContainText(
    "Slow (Minor): Running die is d4",
  );
  await expect(combatBreakdown).not.toContainText(
    "Athletics and rolls to resist",
  );

  const computed = await page.evaluate(() => ({
    severity: hindranceSeverity(character.hindrances[0]),
    minorMatch: hindranceMatchesSeverity(character.hindrances[0], "minor"),
    majorMatch: hindranceMatchesSeverity(character.hindrances[0], "major"),
    pace: character.derived.pace,
    hooks: activeEffectHooks(character).map((hook) => hook.id),
  }));
  expect(computed).toEqual({
    severity: "minor",
    minorMatch: true,
    majorMatch: false,
    pace: 5,
    hooks: ["hindrance-slow-minor"],
  });
});

test("Major Slow passive effect adds Athletics reminder", async ({ page }) => {
  await seedEffectHookCharacter(page, {
    name: "Major Slow Effect Tester",
    preferredId: "major-slow-effect-tester",
    hindranceIds: ["swade-hindrance-slow"],
    hindranceSeverities: {
      "swade-hindrance-slow": "Major",
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Slow (Major)");
  await expect(derived).toContainText("Pace -2");
  await expect(derived).toContainText("Running die is d4");
  await expect(derived).toContainText(
    "Athletics and rolls to resist Athletics -2",
  );

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Slow (Major): Pace -2");
  await expect(combatBreakdown).toContainText(
    "Slow (Major): Athletics and rolls to resist Athletics -2",
  );

  const computed = await page.evaluate(() => ({
    severity: hindranceSeverity(character.hindrances[0]),
    minorMatch: hindranceMatchesSeverity(character.hindrances[0], "minor"),
    majorMatch: hindranceMatchesSeverity(character.hindrances[0], "major"),
    pace: character.derived.pace,
    hooks: activeEffectHooks(character).map((hook) => hook.id),
  }));
  expect(computed).toEqual({
    severity: "major",
    minorMatch: false,
    majorMatch: true,
    pace: 4,
    hooks: ["hindrance-slow-major"],
  });
});

test("Edge roll modifier effects render on Character and Combat", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Edge Roll Modifier Tester",
    preferredId: "edge-roll-modifier-tester",
    edgeIds: [
      "swade-edge-alertness",
      "swade-edge-brave",
      "swade-edge-danger-sense",
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Alertness");
  await expect(derived).toContainText("Notice +2");
  await expect(derived).toContainText("Brave");
  await expect(derived).toContainText("Fear checks +2");
  await expect(derived).toContainText("Fear Table rolls -2");
  await expect(derived).toContainText("Danger Sense");
  await expect(derived).toContainText(
    "Notice +2 to sense ambushes or similar danger",
  );

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Alertness: Notice +2");
  await expect(combatBreakdown).toContainText("Brave: Fear checks +2");
  await expect(combatBreakdown).toContainText("Brave: Fear Table rolls -2");
  await expect(combatBreakdown).toContainText(
    "Danger Sense: Notice +2 to sense ambushes or similar danger",
  );

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.type === "roll-modifier")
      .map((effect) => ({
        sourceName: effect.sourceName,
        target: effect.target,
        trait: effect.trait,
        context: effect.context,
        value: effect.value,
        displayLabel: effect.displayLabel,
      })),
  );
  expect(computed).toEqual([
    {
      sourceName: "Alertness",
      target: "notice",
      trait: "Notice",
      context: "all Notice rolls",
      value: 2,
      displayLabel: "Notice +2",
    },
    {
      sourceName: "Brave",
      target: "fear-checks",
      trait: "Spirit",
      context: "Fear checks",
      value: 2,
      displayLabel: "Fear checks +2",
    },
    {
      sourceName: "Brave",
      target: "fear-table",
      trait: "Fear Table",
      context: "Fear Table rolls",
      value: -2,
      displayLabel: "Fear Table rolls -2",
    },
    {
      sourceName: "Danger Sense",
      target: "notice-danger",
      trait: "Notice",
      context: "ambushes or similar danger",
      value: 2,
      displayLabel: "Notice +2 to sense ambushes or similar danger",
    },
  ]);
});

test("Hindrance roll modifier effects render on Character and Combat", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Hindrance Roll Modifier Tester",
    preferredId: "hindrance-roll-modifier-tester",
    hindranceIds: [
      "swade-hindrance-all-thumbs",
      "swade-hindrance-anemic",
      "swade-hindrance-mean",
      "swade-hindrance-mild-mannered",
      "swade-hindrance-yellow",
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("All Thumbs");
  await expect(derived).toContainText(
    "Mechanical or electrical device rolls -2",
  );
  await expect(derived).toContainText("Anemic");
  await expect(derived).toContainText("Vigor to resist Fatigue -2");
  await expect(derived).toContainText("Mean");
  await expect(derived).toContainText("Persuasion -1");
  await expect(derived).toContainText("Mild Mannered");
  await expect(derived).toContainText("Intimidation -2");
  await expect(derived).toContainText("Yellow");
  await expect(derived).toContainText("Fear checks -2");
  await expect(derived).toContainText("Resist Intimidation -2");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText(
    "All Thumbs: Mechanical or electrical device rolls -2",
  );
  await expect(combatBreakdown).toContainText(
    "Anemic: Vigor to resist Fatigue -2",
  );
  await expect(combatBreakdown).toContainText("Mean: Persuasion -1");
  await expect(combatBreakdown).toContainText("Mild Mannered: Intimidation -2");
  await expect(combatBreakdown).toContainText("Yellow: Fear checks -2");
  await expect(combatBreakdown).toContainText("Yellow: Resist Intimidation -2");

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "combat")
      .filter((effect) => effect.type === "roll-modifier")
      .map((effect) => ({
        sourceName: effect.sourceName,
        target: effect.target,
        value: effect.value,
        displayLabel: effect.displayLabel,
      })),
  );
  expect(computed).toEqual([
    {
      sourceName: "All Thumbs",
      target: "mechanical-electrical-devices",
      value: -2,
      displayLabel: "Mechanical or electrical device rolls -2",
    },
    {
      sourceName: "Anemic",
      target: "resist-fatigue",
      value: -2,
      displayLabel: "Vigor to resist Fatigue -2",
    },
    {
      sourceName: "Mean",
      target: "persuasion",
      value: -1,
      displayLabel: "Persuasion -1",
    },
    {
      sourceName: "Mild Mannered",
      target: "intimidation",
      value: -2,
      displayLabel: "Intimidation -2",
    },
    {
      sourceName: "Yellow",
      target: "fear-checks",
      value: -2,
      displayLabel: "Fear checks -2",
    },
    {
      sourceName: "Yellow",
      target: "resist-intimidation",
      value: -2,
      displayLabel: "Resist Intimidation -2",
    },
  ]);
});

test("Expanded Edge roll modifier effects render and replace improved variants", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Expanded Edge Modifier Tester",
    preferredId: "expanded-edge-modifier-tester",
    edgeIds: [
      "swade-edge-arcane-resistance",
      "swade-edge-improved-arcane-resistance",
      "swade-edge-aristocrat",
      "swade-edge-attractive",
      "swade-edge-very-attractive",
      "swade-edge-elan",
      "swade-edge-fast-healer",
      "swade-edge-healer",
      "swade-edge-iron-jaw",
      "swade-edge-investigator",
      "swade-edge-mr-fix-it",
      "swade-edge-menacing",
      "swade-edge-streetwise",
      "swade-edge-strong-willed",
      "swade-edge-iron-will",
      "swade-edge-thief",
      "swade-edge-woodsman",
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Improved Arcane Resistance");
  await expect(derived).toContainText("Resist magical effects +4");
  await expect(derived).toContainText("Magical damage reduced by 4");
  await expect(derived).not.toContainText("Resist magical effects +2");
  await expect(derived).toContainText("Very Attractive");
  await expect(derived).toContainText("Performance +2 when appearance matters");
  await expect(derived).toContainText("Persuasion +2 when appearance matters");
  await expect(derived).not.toContainText(
    "Performance +1 when appearance matters",
  );
  await expect(derived).toContainText("Iron Will");
  await expect(derived).toContainText("Resist Smarts or Spirit-based Tests +4");
  await expect(derived).not.toContainText(
    "Resist Smarts or Spirit-based Tests +2",
  );
  await expect(derived).toContainText("Aristocrat");
  await expect(derived).toContainText(
    "Common Knowledge +2 with the upper class",
  );
  await expect(derived).toContainText("Elan");
  await expect(derived).toContainText("Trait rerolls with a Benny +2");
  await expect(derived).toContainText("Fast Healer");
  await expect(derived).toContainText("Natural healing rolls +2");
  await expect(derived).toContainText(
    "Natural healing checks occur more often",
  );
  await expect(derived).toContainText("Healer");
  await expect(derived).toContainText("Healing rolls +2");
  await expect(derived).toContainText("Iron Jaw");
  await expect(derived).toContainText("Soak rolls +2");
  await expect(derived).toContainText("Avoid Knockout Blows +2");
  await expect(derived).toContainText("Investigator");
  await expect(derived).toContainText("Research +2");
  await expect(derived).toContainText("Notice +2 for clues");
  await expect(derived).toContainText("Mr. Fix It");
  await expect(derived).toContainText("Repair +2");
  await expect(derived).toContainText("Repairs take less time with a raise");
  await expect(derived).toContainText("Menacing");
  await expect(derived).toContainText(
    "Intimidation +2 using bad looks or attitude",
  );
  await expect(derived).toContainText("Streetwise");
  await expect(derived).toContainText(
    "Common Knowledge +2 for criminal networking",
  );
  await expect(derived).toContainText("Thief");
  await expect(derived).toContainText("Thievery +1");
  await expect(derived).toContainText("Woodsman");
  await expect(derived).toContainText("Survival +2");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText(
    "Improved Arcane Resistance: Resist magical effects +4",
  );
  await expect(combatBreakdown).toContainText(
    "Very Attractive: Persuasion +2 when appearance matters",
  );
  await expect(combatBreakdown).toContainText(
    "Iron Will: Resist Smarts or Spirit-based Tests +4",
  );
  await expect(combatBreakdown).toContainText(
    "Thief: Athletics +1 when climbing",
  );
  await expect(combatBreakdown).toContainText(
    "Woodsman: Stealth +2 in the wilderness",
  );

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "character").map((effect) => ({
      sourceName: effect.sourceName,
      target: effect.target,
      type: effect.type,
      value: effect.value,
      displayLabel: effect.displayLabel,
    })),
  );
  expect(computed).toEqual(
    expect.arrayContaining([
      {
        sourceName: "Improved Arcane Resistance",
        target: "resist-magical-effects",
        type: "roll-modifier",
        value: 4,
        displayLabel: "Resist magical effects +4",
      },
      {
        sourceName: "Improved Arcane Resistance",
        target: "magical-damage-reduction",
        type: "reminder",
        value: 4,
        displayLabel: "Magical damage reduced by 4",
      },
      {
        sourceName: "Very Attractive",
        target: "appearance-performance",
        type: "roll-modifier",
        value: 2,
        displayLabel: "Performance +2 when appearance matters",
      },
      {
        sourceName: "Iron Will",
        target: "resist-smarts-spirit-tests",
        type: "roll-modifier",
        value: 4,
        displayLabel: "Resist Smarts or Spirit-based Tests +4",
      },
      {
        sourceName: "Thief",
        target: "urban-stealth",
        type: "roll-modifier",
        value: 1,
        displayLabel: "Stealth +1 in urban areas",
      },
      {
        sourceName: "Woodsman",
        target: "wilderness-stealth",
        type: "roll-modifier",
        value: 2,
        displayLabel: "Stealth +2 in the wilderness",
      },
    ]),
  );
  expect(computed).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        sourceName: "Arcane Resistance",
        target: "resist-magical-effects",
      }),
      expect.objectContaining({
        sourceName: "Attractive",
        target: "appearance-performance",
      }),
      expect.objectContaining({
        sourceName: "Strong Willed",
        target: "resist-smarts-spirit-tests",
      }),
    ]),
  );
});

test("Expanded Hindrance roll modifier effects render on Character and Combat", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Expanded Hindrance Modifier Tester",
    preferredId: "expanded-hindrance-modifier-tester",
    hindranceIds: [
      "swade-hindrance-clueless",
      "swade-hindrance-clumsy",
      "swade-hindrance-one-eye",
      "swade-hindrance-tongue-tied",
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Clueless");
  await expect(derived).toContainText("Common Knowledge -1");
  await expect(derived).toContainText("Notice -1");
  await expect(derived).toContainText("Clumsy");
  await expect(derived).toContainText("Athletics -2");
  await expect(derived).toContainText("Stealth -2");
  await expect(derived).toContainText("One Eye");
  await expect(derived).toContainText(
    "Actions at 5 inches / 10 yards or more -2",
  );
  await expect(derived).toContainText("Tongue-Tied");
  await expect(derived).toContainText("Speech-based Persuasion -1");
  await expect(derived).toContainText("Speech-based Taunt -1");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Clueless: Common Knowledge -1");
  await expect(combatBreakdown).toContainText("Clumsy: Athletics -2");
  await expect(combatBreakdown).toContainText(
    "One Eye: Actions at 5 inches / 10 yards or more -2",
  );
  await expect(combatBreakdown).toContainText(
    "Tongue-Tied: Speech-based Intimidation -1",
  );

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.type === "roll-modifier")
      .map((effect) => ({
        sourceName: effect.sourceName,
        target: effect.target,
        value: effect.value,
        displayLabel: effect.displayLabel,
      })),
  );
  expect(computed).toEqual([
    {
      sourceName: "Clueless",
      target: "common-knowledge",
      value: -1,
      displayLabel: "Common Knowledge -1",
    },
    {
      sourceName: "Clueless",
      target: "notice",
      value: -1,
      displayLabel: "Notice -1",
    },
    {
      sourceName: "Clumsy",
      target: "athletics",
      value: -2,
      displayLabel: "Athletics -2",
    },
    {
      sourceName: "Clumsy",
      target: "stealth",
      value: -2,
      displayLabel: "Stealth -2",
    },
    {
      sourceName: "One Eye",
      target: "distance-actions",
      value: -2,
      displayLabel: "Actions at 5 inches / 10 yards or more -2",
    },
    {
      sourceName: "Tongue-Tied",
      target: "speech-intimidation",
      value: -1,
      displayLabel: "Speech-based Intimidation -1",
    },
    {
      sourceName: "Tongue-Tied",
      target: "speech-performance",
      value: -1,
      displayLabel: "Speech-based Performance -1",
    },
    {
      sourceName: "Tongue-Tied",
      target: "speech-persuasion",
      value: -1,
      displayLabel: "Speech-based Persuasion -1",
    },
    {
      sourceName: "Tongue-Tied",
      target: "speech-taunt",
      value: -1,
      displayLabel: "Speech-based Taunt -1",
    },
  ]);
});

test("Session and action-card effects render concrete model hooks", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Session Action Model Tester",
    preferredId: "session-action-model-tester",
    edgeIds: [
      "swade-edge-berserk",
      "swade-edge-luck",
      "swade-edge-great-luck",
      "swade-edge-quick",
      "swade-edge-level-headed",
    ],
    hindranceIds: ["swade-hindrance-bad-luck", "swade-hindrance-hesitant"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Berserk");
  await expect(derived).toContainText(
    "Manual/table: track Berserk state and uncontrolled attacks",
  );
  await expect(derived).toContainText("Great Luck");
  await expect(derived).toContainText("Starting Bennies +2");
  await expect(derived).toContainText("Bad Luck");
  await expect(derived).toContainText("Starting Bennies -1");
  await expect(derived).toContainText("Quick");
  await expect(derived).toContainText(
    "Action Cards of 5 or lower may be redrawn",
  );
  await expect(derived).toContainText("Hesitant");
  await expect(derived).toContainText(
    "Draw two Action Cards and keep the lowest, except Jokers",
  );
  await expect(derived).toContainText("Level Headed");
  await expect(derived).toContainText(
    "Draw one additional Action Card and choose which to use",
  );

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText(
    "Berserk: Manual/table: track Berserk state and uncontrolled attacks",
  );
  await expect(combatBreakdown).toContainText(
    "Quick: Action Cards of 5 or lower may be redrawn",
  );
  await expect(combatBreakdown).toContainText(
    "Hesitant: Draw two Action Cards and keep the lowest, except Jokers",
  );
  await expect(combatBreakdown).toContainText(
    "Level Headed: Draw one additional Action Card and choose which to use",
  );
  const actionCardPanel = page.locator("#actionCardPanel");
  await expect(actionCardPanel).toBeVisible();
  await expect(actionCardPanel).toContainText(
    "Draw 2 Action Cards; Hesitant keeps the lowest except Jokers, with Level Headed extra draw included.",
  );
  await expect(actionCardPanel).toContainText(
    "Quick: record an Action Card to check redraw.",
  );

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "character")
      .filter((effect) =>
        [
          "automation-status",
          "session-resource-modifier",
          "action-card-rule",
        ].includes(effect.type),
      )
      .map((effect) => ({
        sourceName: effect.sourceName,
        target: effect.target,
        type: effect.type,
        value: effect.value,
        displayLabel: effect.displayLabel,
      })),
  );
  expect(computed).toEqual([
    {
      sourceName: "Berserk",
      target: "berserk-state",
      type: "automation-status",
      value: undefined,
      displayLabel:
        "Manual/table: track Berserk state and uncontrolled attacks",
    },
    {
      sourceName: "Great Luck",
      target: "starting-bennies",
      type: "session-resource-modifier",
      value: 2,
      displayLabel: "Starting Bennies +2",
    },
    {
      sourceName: "Quick",
      target: "quick-redraw",
      type: "action-card-rule",
      value: undefined,
      displayLabel: "Action Cards of 5 or lower may be redrawn",
    },
    {
      sourceName: "Level Headed",
      target: "level-headed-draw",
      type: "action-card-rule",
      value: 1,
      displayLabel: "Draw one additional Action Card and choose which to use",
    },
    {
      sourceName: "Bad Luck",
      target: "starting-bennies",
      type: "session-resource-modifier",
      value: -1,
      displayLabel: "Starting Bennies -1",
    },
    {
      sourceName: "Hesitant",
      target: "hesitant-draw",
      type: "action-card-rule",
      value: undefined,
      displayLabel: "Draw two Action Cards and keep the lowest, except Jokers",
    },
  ]);
});

test("Luck and Bad Luck update starting Bennies and Start Session reset", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Session Bennies Tester",
    preferredId: "session-bennies-tester",
    edgeIds: ["swade-edge-luck", "swade-edge-great-luck"],
    hindranceIds: ["swade-hindrance-bad-luck"],
  });

  await expect(page.locator("#bennyStart")).toHaveText("Start 4");
  expect(
    await page.evaluate(() => ({
      normalStarting: character.bennies.normalStarting,
      starting: character.bennies.starting,
      modifier: characterStartingBennyModifier(character),
    })),
  ).toEqual({
    normalStarting: 3,
    starting: 4,
    modifier: 1,
  });

  await openHeaderMenu(page);
  await page.locator("#newSessionBtn").click();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#benniesValue")).toHaveText("4");
  expect(await page.evaluate(() => character.bennies.current)).toBe(4);
});

test("Action Card model tracks Quick redraw state and persists cards", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Action Card State Tester",
    preferredId: "action-card-state-tester",
    edgeIds: ["swade-edge-quick", "swade-edge-level-headed"],
    hindranceIds: ["swade-hindrance-hesitant"],
  });

  await openCombat(page);
  const panel = page.locator("#actionCardPanel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(
    "Quick: record an Action Card to check redraw.",
  );
  await expect(panel).toContainText(
    "Level Headed: Draw one additional Action Card and choose which to use",
  );
  await expect(panel).toContainText(
    "Hesitant: Draw two Action Cards and keep the lowest, except Jokers",
  );
  await expect(panel).toContainText(
    "Draw 2 Action Cards; Hesitant keeps the lowest except Jokers, with Level Headed extra draw included.",
  );

  await page.locator("#actionCardInput").fill("5H");
  await expect(panel).toContainText("Quick redraw available for this card.");
  await page.locator("#actionCardSecondaryInput").fill("King");
  await page.locator("#actionCardNotesInput").fill("Round 1");
  expect(await page.evaluate(() => character.actionCards)).toEqual({
    current: "5H",
    secondary: "King",
    notes: "Round 1",
  });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#actionCardInput")).toHaveValue("5H");
  await expect(page.locator("#actionCardSecondaryInput")).toHaveValue("King");
  await expect(page.locator("#actionCardNotesInput")).toHaveValue("Round 1");
  await expect(panel).toContainText("Quick redraw available for this card.");

  await page.locator("#actionCardInput").fill("Joker");
  await expect(panel).toContainText("Quick: Joker is not redrawn.");
  await page.locator("#clearActionCardsBtn").click();
  await expect(page.locator("#actionCardInput")).toHaveValue("");
  expect(await page.evaluate(() => character.actionCards)).toEqual({
    current: "",
    secondary: "",
    notes: "",
  });
});

test("Improved Level Headed replaces Level Headed Action Card draw count", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Improved Level Headed Tester",
    preferredId: "improved-level-headed-tester",
    edgeIds: ["swade-edge-level-headed", "swade-edge-improved-level-headed"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Improved Level Headed");
  await expect(derived).toContainText(
    "Draw two additional Action Cards and choose which to use",
  );
  await expect(derived).not.toContainText("Draw one additional Action Card");

  await openCombat(page);
  const panel = page.locator("#actionCardPanel");
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(
    "Draw 3 Action Cards and choose which to use.",
  );
  await expect(panel).toContainText("Improved Level Headed");
  await expect(panel).not.toContainText(
    "Level Headed: Draw one additional Action Card",
  );

  expect(
    await page.evaluate(() => {
      const capabilities = actionCardCapabilities(character);
      return {
        levelHeadedExtraCards: capabilities.levelHeadedExtraCards,
        drawCount: capabilities.drawCount,
        drawInstruction: capabilities.drawInstruction,
        effects: actionCardRuleSummaries(character).map((effect) => ({
          sourceName: effect.sourceName,
          value: effect.value,
          displayLabel: effect.displayLabel,
        })),
      };
    }),
  ).toEqual({
    levelHeadedExtraCards: 2,
    drawCount: 3,
    drawInstruction: "Draw 3 Action Cards and choose which to use.",
    effects: [
      {
        sourceName: "Improved Level Headed",
        value: 2,
        displayLabel:
          "Draw two additional Action Cards and choose which to use",
      },
    ],
  });
});

test("Automation status effects mark subchoice-required entries", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Subchoice Status Tester",
    preferredId: "subchoice-status-tester",
    edgeIds: ["swade-edge-trademark-weapon", "dl-edge-reputation"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Trademark Weapon");
  await expect(derived).toContainText(
    "Subchoice required: choose the specific weapon before attack/Parry bonus can be automated",
  );
  await expect(derived).toContainText("Reputation");
  await expect(derived).toContainText(
    "Subchoice required: choose good or bad reputation before social effect can be automated",
  );

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Trademark Weapon: Subchoice required: choose the specific weapon before attack/Parry bonus can be automated",
  );
  await expect(page.locator("#combatPenaltyBreakdown")).not.toContainText(
    "Reputation: Subchoice required",
  );

  const computed = await page.evaluate(() =>
    effectHookSummariesForSurface(character, "character")
      .filter((effect) => effect.type === "automation-status")
      .map((effect) => ({
        sourceName: effect.sourceName,
        target: effect.target,
        status: effect.status,
        displayLabel: effect.displayLabel,
      })),
  );
  expect(computed).toEqual([
    {
      sourceName: "Trademark Weapon",
      target: "chosen-weapon",
      status: "subchoice-required",
      displayLabel:
        "Subchoice required: choose the specific weapon before attack/Parry bonus can be automated",
    },
    {
      sourceName: "Reputation",
      target: "reputation-choice",
      status: "subchoice-required",
      displayLabel:
        "Subchoice required: choose good or bad reputation before social effect can be automated",
    },
  ]);
});

test("Trademark Weapon and Reputation subchoices persist and resolve status markers", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Resolved Subchoice Tester",
    preferredId: "resolved-subchoice-tester",
    edgeIds: ["swade-edge-trademark-weapon", "dl-edge-reputation"],
    weapons: [
      {
        id: "colt-peacemaker",
        name: "Colt Peacemaker",
        damage: "2d6+1",
        range: "12/24/48",
        ap: 1,
        rof: 1,
        shotsMax: 6,
        shotsLoaded: 6,
        ammoType: "pistol-large",
        minStr: "d4",
        weight: 4,
        itemLocation: "carried",
      },
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const trademarkCard = page
    .locator("#edgesList .dossier-tag.edge")
    .filter({ hasText: "Trademark Weapon" });
  await trademarkCard.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("#edgeEditorPanel")).toBeVisible();
  await expect(page.locator("#edgeSubchoiceHelp")).toContainText(
    "Choose the specific weapon",
  );
  await page.locator("#edgeSubchoiceInput").fill("Colt Peacemaker");
  await page.locator("#saveEdgeBtn").click();
  await expect(page.locator("#edgeEditorPanel")).toBeHidden();

  const reputationCard = page
    .locator("#edgesList .dossier-tag.edge")
    .filter({ hasText: "Reputation" });
  await reputationCard.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("#edgeSubchoiceHelp")).toContainText("Choose Good");
  await page.locator("#edgeSubchoiceInput").fill("Good");
  await page.locator("#saveEdgeBtn").click();
  await expect(page.locator("#edgeEditorPanel")).toBeHidden();

  await expect(trademarkCard).toContainText("Choice: Colt Peacemaker");
  await expect(reputationCard).toContainText("Choice: Good");

  const stored = await page.evaluate(() => {
    const trademark = character.edges.find(
      (edge) => edge.name === "Trademark Weapon",
    );
    const reputation = character.edges.find(
      (edge) => edge.name === "Reputation",
    );
    return {
      trademark: {
        subchoice: trademark?.subchoice || "",
        subchoiceDetail: trademark?.subchoiceDetail || null,
      },
      reputation: {
        subchoice: reputation?.subchoice || "",
        subchoiceDetail: reputation?.subchoiceDetail || null,
      },
      statusMarkers: effectHookSummariesForSurface(character, "character")
        .filter((effect) => effect.type === "automation-status")
        .map((effect) => ({
          sourceName: effect.sourceName,
          status: effect.status,
          displayLabel: effect.displayLabel,
        })),
    };
  });
  expect(stored).toEqual({
    trademark: {
      subchoice: "Colt Peacemaker",
      subchoiceDetail: {
        type: "weapon",
        value: "colt-peacemaker",
        label: "Colt Peacemaker",
        sourceId: "colt-peacemaker",
      },
    },
    reputation: {
      subchoice: "Good",
      subchoiceDetail: {
        type: "reputation",
        value: "good",
        label: "Good",
      },
    },
    statusMarkers: [
      {
        sourceName: "Trademark Weapon",
        status: "subchoice-selected",
        displayLabel:
          "Chosen weapon: Colt Peacemaker; apply attack/Parry bonus manually until attack context exists",
      },
      {
        sourceName: "Reputation",
        status: "subchoice-selected",
        displayLabel: "Good reputation selected: Persuasion reroll reminder",
      },
    ],
  });

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Trademark Weapon: Chosen weapon: Colt Peacemaker; apply attack/Parry bonus manually until attack context exists",
  );

  const payloadText = await page.evaluate(() =>
    JSON.stringify(serializeTrackerExport(character)),
  );
  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#edgesList")).toContainText(
    "Choice: Colt Peacemaker",
  );
  await expect(page.locator("#edgesList")).toContainText("Choice: Good");

  const imported = await page.evaluate((text) => {
    importJsonText(text);
    return {
      choices: character.edges.map((edge) => ({
        name: edge.name,
        subchoice: edge.subchoice || "",
        subchoiceDetail: edge.subchoiceDetail || null,
      })),
      markers: effectHookSummariesForSurface(character, "character")
        .filter((effect) => effect.type === "automation-status")
        .map((effect) => ({
          sourceName: effect.sourceName,
          status: effect.status,
          displayLabel: effect.displayLabel,
        })),
    };
  }, payloadText);
  expect(imported.choices).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Trademark Weapon",
        subchoice: "Colt Peacemaker",
        subchoiceDetail: expect.objectContaining({
          type: "weapon",
          value: "colt-peacemaker",
          label: "Colt Peacemaker",
        }),
      }),
      expect.objectContaining({
        name: "Reputation",
        subchoice: "Good",
        subchoiceDetail: {
          type: "reputation",
          value: "good",
          label: "Good",
        },
      }),
    ]),
  );
  expect(imported.markers).toEqual(
    expect.arrayContaining([
      {
        sourceName: "Trademark Weapon",
        status: "subchoice-selected",
        displayLabel:
          "Chosen weapon: Colt Peacemaker; apply attack/Parry bonus manually until attack context exists",
      },
      {
        sourceName: "Reputation",
        status: "subchoice-selected",
        displayLabel: "Good reputation selected: Persuasion reroll reminder",
      },
    ]),
  );
});

test("Increase Skill writes a canonical ledger entry", async ({ page }) => {
  await seedCanonicalAdvancementCharacter(page);

  const [target] = await eligibleAdvanceSkills(page, "single");
  expect(
    target,
    "Expected at least one eligible one-skill advance target",
  ).toBeTruthy();

  await openAdvanceEditor(page, "Increase Skill");
  await page.locator("#advanceSkillSelect").selectOption(target.name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const result = await page.evaluate((targetName) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "skill-increase" &&
        item.changes?.some((change) => change.displayLabel === targetName),
    );
    const skill = character.skills.find((item) => item.name === targetName);
    return {
      skillDie: skill?.die || "",
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, target.name);

  expect(result.skillDie).toBe(target.after);
  expect(result.advance).toEqual(
    expect.objectContaining({
      type: "skill-increase",
      label: expect.any(String),
      source: "advancement",
      advanceNumber: expect.any(Number),
      rankAtTime: expect.any(String),
      createdAt: expect.any(String),
      changes: expect.any(Array),
      notes: expect.any(String),
    }),
  );
  expect(result.advance.changes).toHaveLength(1);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `skills[${target.name}].die`,
      before: target.before,
      after: target.after,
      displayLabel: target.name,
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((targetName) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "skill-increase" &&
        item.changes?.some((change) => change.displayLabel === targetName),
    );
    const skill = character.skills.find((item) => item.name === targetName);
    return {
      skillDie: skill?.die || "",
      advanceType: advance?.type || "",
      changeCount: advance?.changes?.length || 0,
    };
  }, target.name);

  expect(persisted).toEqual({
    skillDie: target.after,
    advanceType: "skill-increase",
    changeCount: 1,
  });
});

test("Increase Two Skills writes one canonical ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const targets = (await eligibleAdvanceSkills(page, "two")).slice(0, 2);
  expect(targets).toHaveLength(2);

  await openAdvanceEditor(page, "Increase Two Skills");
  await page.locator("#advanceSkillOneSelect").selectOption(targets[0].name);
  await page.locator("#advanceSkillTwoSelect").selectOption(targets[1].name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const result = await page.evaluate(
    (targetNames) => {
      const advances = character.advances.filter(
        (item) => item.type === "two-skills-increase",
      );
      const skills = targetNames.map((name) => {
        const skill = character.skills.find((item) => item.name === name);
        return { name, die: skill?.die || "" };
      });
      return { advances, skills };
    },
    targets.map((target) => target.name),
  );

  expect(result.advances).toHaveLength(1);
  expect(result.advances[0]).toEqual(
    expect.objectContaining({
      type: "two-skills-increase",
      label: expect.any(String),
      source: "advancement",
      advanceNumber: expect.any(Number),
      rankAtTime: expect.any(String),
      createdAt: expect.any(String),
      changes: expect.any(Array),
      notes: expect.any(String),
    }),
  );
  expect(result.advances[0].changes).toHaveLength(2);
  targets.forEach((target) => {
    expect(result.skills).toContainEqual({
      name: target.name,
      die: target.after,
    });
    expect(result.advances[0].changes).toContainEqual(
      expect.objectContaining({
        path: `skills[${target.name}].die`,
        before: target.before,
        after: target.after,
        displayLabel: target.name,
      }),
    );
  });
  expect(Boolean(result.advances[0].appliedChanges?.length)).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(
    (targetNames) => {
      const advances = character.advances.filter(
        (item) => item.type === "two-skills-increase",
      );
      const skills = targetNames.map((name) => {
        const skill = character.skills.find((item) => item.name === name);
        return { name, die: skill?.die || "" };
      });
      return {
        advanceCount: advances.length,
        changeCount: advances[0]?.changes?.length || 0,
        skills,
      };
    },
    targets.map((target) => target.name),
  );

  expect(persisted.advanceCount).toBe(1);
  expect(persisted.changeCount).toBe(2);
  targets.forEach((target) => {
    expect(persisted.skills).toContainEqual({
      name: target.name,
      die: target.after,
    });
  });
});

test("Increase Attribute writes a canonical attribute-increase ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const target = await firstEligibleAttributeAdvance(page);
  expect(
    target,
    "Expected at least one eligible attribute advance target",
  ).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(target.key);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText(
    "Increase Attribute",
  );
  await expect(page.locator("#advancesList")).toContainText(target.targetName);

  const result = await page.evaluate((attributeKey) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "attribute-increase" &&
        item.changes?.some(
          (change) => change.path === `attributes.${attributeKey}`,
        ),
    );
    return {
      attributeDie: character.attributes?.[attributeKey] || "",
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, target.key);

  expect(result.attributeDie).toBe(target.after);
  expectCanonicalAdvanceScaffold(result.advance, "attribute-increase");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `attributes.${target.key}`,
      before: target.before,
      after: target.after,
      displayLabel: target.targetName,
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((attributeKey) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "attribute-increase" &&
        item.changes?.some(
          (change) => change.path === `attributes.${attributeKey}`,
        ),
    );
    return {
      attributeDie: character.attributes?.[attributeKey] || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, target.key);

  expect(persisted.attributeDie).toBe(target.after);
  expect(persisted.advanceType).toBe("attribute-increase");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      path: `attributes.${target.key}`,
      before: target.before,
      after: target.after,
      displayLabel: target.targetName,
    }),
  );
});

test("blocks a second Increase Attribute advance in the same Rank", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const firstTarget = await firstEligibleAttributeAdvance(page);
  expect(firstTarget).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(firstTarget.key);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const secondTarget = await firstEligibleAttributeAdvance(page);
  expect(secondTarget).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(secondTarget.key);

  await expect(page.locator("#advanceEditorPanel")).toBeVisible();
  await expect(page.locator("#saveAdvanceBtn")).toBeDisabled();
  await expect(page.locator("#advanceDynamicWarning")).toContainText(
    "You have already increased an Attribute this Rank.",
  );

  const result = await page.evaluate(() => ({
    attributeIncreaseCount: character.advances.filter(
      (advance) => advance.type === "attribute-increase",
    ).length,
    appliedAttributeIncreaseCount: character.advances.filter(
      (advance) => advance.type === "attribute-increase" && advance.applied,
    ).length,
  }));

  expect(result).toEqual({
    attributeIncreaseCount: 1,
    appliedAttributeIncreaseCount: 1,
  });
});

test("applies Legendary Attribute cadence without fixed parity", async ({
  page,
}) => {
  await enterTracker(page);

  const results = await page.evaluate(() => {
    const attributeChange = (attributeName, before = "d6", after = "d8") => ({
      path: `attributes.${attributeName}`,
      before,
      after,
      displayLabel: displayNameFromKey(attributeName),
      targetType: "attribute",
      operation: "update",
    });
    const attributeAdvance = (
      advanceNumber,
      attributeName,
      source = "advancement",
    ) =>
      normalizeAdvanceEntry({
        id: `attribute-${advanceNumber}-${attributeName}`,
        type: "attribute-increase",
        label: `Increase Attribute: ${displayNameFromKey(attributeName)}`,
        source,
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        changes: [attributeChange(attributeName)],
        applied: true,
        appliedByApp: source === "advancement",
      });
    const nonAttributeAdvance = (advanceNumber) =>
      normalizeAdvanceEntry({
        id: `edge-${advanceNumber}`,
        type: "edge-gain",
        label: "New Edge: Alertness",
        source: "advancement",
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        changes: [
          {
            path: "edges[alertness]",
            before: null,
            after: { id: "alertness", name: "Alertness" },
            displayLabel: "Alertness",
            targetType: "edge",
            operation: "add",
          },
        ],
        applied: true,
        appliedByApp: true,
      });
    const candidate = (advanceNumber, attributeName = "strength") =>
      normalizeAdvanceEntry({
        id: `candidate-${advanceNumber}-${attributeName}`,
        type: "attribute-increase",
        label: `Increase Attribute: ${displayNameFromKey(attributeName)}`,
        source: "advancement",
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        targetName: displayNameFromKey(attributeName),
        targetType: "attribute",
        targets: [
          {
            targetType: "attribute",
            targetName: displayNameFromKey(attributeName),
            targetId: attributeName,
            before: "d6",
            after: "d8",
          },
        ],
      });
    const warningsFor = (
      advances,
      advanceNumber,
      attributeName = "strength",
    ) => {
      const testCharacter = normalize({
        name: "Legendary Cadence Tester",
        rank: "Legendary",
        attributes: {
          agility: "d6",
          smarts: "d6",
          spirit: "d6",
          strength: "d6",
          vigor: "d6",
        },
        skills: [],
        advances,
      });
      return getAdvanceApplicationWarnings(
        testCharacter,
        candidate(advanceNumber, attributeName),
      );
    };

    return {
      heroic15DoesNotBlockLegendary16: warningsFor(
        [attributeAdvance(15, "agility")],
        16,
        "strength",
      ),
      legendary16Blocks17: warningsFor(
        [attributeAdvance(16, "agility")],
        17,
        "strength",
      ),
      legendary16Allows18: warningsFor(
        [attributeAdvance(16, "agility")],
        18,
        "strength",
      ),
      skipped16Allows17: warningsFor([nonAttributeAdvance(16)], 17, "strength"),
      importedHistoryDoesNotCount: warningsFor(
        [
          normalizeAdvanceEntry({
            id: "imported-attribute-label",
            type: "imported-history",
            label: "Raise Attribute: Strength",
            source: "imported",
            advanceNumber: 16,
            rankAtTime: "Legendary",
            changes: [],
          }),
        ],
        17,
        "strength",
      ),
    };
  });

  expect(results.heroic15DoesNotBlockLegendary16).toEqual([]);
  expect(results.legendary16Blocks17).toContain(
    "Legendary characters may increase an Attribute every other Advance. Take a different Advance before increasing another Attribute.",
  );
  expect(results.legendary16Allows18).toEqual([]);
  expect(results.skipped16Allows17).toEqual([]);
  expect(results.importedHistoryDoesNotCount).toEqual([]);
});

test("New Edge writes a canonical edge-gain ledger entry", async ({ page }) => {
  await seedCanonicalAdvancementCharacter(page);

  const edge = await firstAvailableAdvanceEdge(page);
  expect(
    edge,
    "Expected at least one available Edge catalog entry",
  ).toBeTruthy();

  await openAdvanceEditor(page, "New Edge");
  await page.locator("#advanceEdgeSelect").selectOption(edge.id);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("New Edge");
  await expect(page.locator("#advancesList")).toContainText(edge.name);

  const result = await page.evaluate((edgeName) => {
    const edgeRecord = character.edges.find((item) => item.name === edgeName);
    const advance = character.advances.find(
      (item) =>
        item.type === "edge-gain" &&
        item.changes?.some((change) => change.displayLabel === edgeName),
    );
    return {
      edge: edgeRecord,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, edge.name);

  expect(result.edge).toEqual(
    expect.objectContaining({
      name: edge.name,
      source: "advancement",
      createdByAdvanceId: expect.any(String),
    }),
  );
  expectCanonicalAdvanceScaffold(result.advance, "edge-gain");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `edges[${result.edge.id}]`,
      before: null,
      after: expect.objectContaining({
        id: result.edge.id,
        catalogId: edge.id,
        name: edge.name,
      }),
      displayLabel: edge.name,
      targetType: "edge",
      operation: "add",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((edgeName) => {
    const edgeRecord = character.edges.find((item) => item.name === edgeName);
    const advance = character.advances.find(
      (item) =>
        item.type === "edge-gain" &&
        item.changes?.some((change) => change.displayLabel === edgeName),
    );
    return {
      edgeName: edgeRecord?.name || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, edge.name);

  expect(persisted.edgeName).toBe(edge.name);
  expect(persisted.advanceType).toBe("edge-gain");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      displayLabel: edge.name,
      targetType: "edge",
      operation: "add",
    }),
  );
});

test("New Powers writes a canonical power-gain ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const power = await firstAvailableAdvancePower(page);
  expect(
    power,
    "Expected at least one available Power catalog entry",
  ).toBeTruthy();

  await openAdvanceEditor(page, "New Powers");
  await page.locator("#advancePowerSelect").selectOption(power.id);
  await page.locator("#advanceAddPowerTargetBtn").click();
  await expect(page.locator(".selected-target-list")).toContainText(power.name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("New Powers");
  await expect(page.locator("#advancesList")).toContainText(power.name);

  const result = await page.evaluate((powerName) => {
    const powerRecord = character.powers.find(
      (item) => item.name === powerName,
    );
    const advance = character.advances.find(
      (item) =>
        item.type === "power-gain" &&
        item.changes?.some((change) => change.displayLabel === powerName),
    );
    return {
      power: powerRecord,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, power.name);

  expect(result.power).toEqual(
    expect.objectContaining({
      name: power.name,
      source: "advancement",
      addedReason: "advancement",
      createdByAdvanceId: expect.any(String),
    }),
  );
  expectCanonicalAdvanceScaffold(result.advance, "power-gain");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `powers[${result.power.id}]`,
      before: null,
      after: expect.objectContaining({
        id: result.power.id,
        catalogId: power.id,
        name: power.name,
      }),
      displayLabel: power.name,
      targetType: "power",
      operation: "add",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((powerName) => {
    const powerRecord = character.powers.find(
      (item) => item.name === powerName,
    );
    const advance = character.advances.find(
      (item) =>
        item.type === "power-gain" &&
        item.changes?.some((change) => change.displayLabel === powerName),
    );
    return {
      powerName: powerRecord?.name || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, power.name);

  expect(persisted.powerName).toBe(power.name);
  expect(persisted.advanceType).toBe("power-gain");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      displayLabel: power.name,
      targetType: "power",
      operation: "add",
    }),
  );
});

test("Power Points writes a canonical power-points-increase ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const before = await page.evaluate(() => powerPointResource()?.max || 0);
  const amount = 5;

  await openAdvanceEditor(page, "Power Points");
  await page.locator("#advancePowerPointAmountInput").fill(String(amount));
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("Power Points");

  const result = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "power-points-increase",
    );
    return {
      maxPowerPoints: powerPointResource()?.max || 0,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  });

  expect(result.maxPowerPoints).toBe(before + amount);
  expectCanonicalAdvanceScaffold(result.advance, "power-points-increase");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: "resources.power-points.max",
      before,
      after: before + amount,
      displayLabel: "Power Points",
      targetType: "power-points",
      operation: "update",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "power-points-increase",
    );
    return {
      maxPowerPoints: powerPointResource()?.max || 0,
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  });

  expect(persisted.maxPowerPoints).toBe(before + amount);
  expect(persisted.advanceType).toBe("power-points-increase");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      before,
      after: before + amount,
      displayLabel: "Power Points",
    }),
  );
});

test("Other Marshal-approved writes a canonical gm-exception history entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);
  const before = await nonAdvancementMutationSnapshot(page);

  await openAdvanceEditor(page, "Other / Marshal-approved");
  await page.locator("#advanceSourceInput").selectOption("marshal-override");
  await page
    .locator("#advanceSummaryInput")
    .fill("Marshal-approved story milestone");
  await page.locator("#advanceTargetTypeInput").selectOption("custom");
  await page.locator("#advanceTargetNameInput").fill("Story milestone");
  await page.locator("#showAdvanceNotesBtn").click();
  await page.locator("#advanceNotesInput").fill("No sheet mutation.");
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText(
    "Other / Marshal-approved",
  );
  await expect(page.locator("#advancesList")).toContainText(
    "Marshal-approved story milestone",
  );

  const after = await nonAdvancementMutationSnapshot(page);
  expect(after).toEqual(before);

  const result = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "gm-exception",
    );
    return {
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  });

  expectCanonicalAdvanceScaffold(result.advance, "gm-exception");
  expect(result.advance).toEqual(
    expect.objectContaining({
      source: "marshal-override",
      targetType: "custom",
      targetName: "Story milestone",
      applied: false,
      appliedByApp: false,
      appliedAt: "",
      changes: [],
      notes: "No sheet mutation.",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "gm-exception",
    );
    return {
      type: advance?.type || "",
      source: advance?.source || "",
      changesLength: advance?.changes?.length ?? -1,
      applied: Boolean(advance?.applied),
      appliedByApp: Boolean(advance?.appliedByApp),
    };
  });

  expect(persisted).toEqual({
    type: "gm-exception",
    source: "marshal-override",
    changesLength: 0,
    applied: false,
    appliedByApp: false,
  });
});

test("Imported Savaged.us advancement history remains canonical imported history", async ({
  page,
}) => {
  await importMinimalSavagedAdvancementHistory(page);

  const imported = await page.evaluate(() => ({
    shootingDie:
      character.skills.find((skill) => skill.name === "Shooting")?.die || "",
    advances: character.advances.map((advance) => ({
      type: advance.type,
      source: advance.source,
      label: advance.label,
      changesLength: advance.changes?.length || 0,
      applied: Boolean(advance.applied),
      appliedByApp: Boolean(advance.appliedByApp),
      trustedUndoable: Boolean(advance.appliedByApp && advance.changes?.length),
    })),
  }));

  expect(imported.shootingDie).toBeTruthy();
  expect(imported.advances.length).toBeGreaterThan(0);
  await expect(page.locator("#advancesList")).toContainText("Imported History");
  imported.advances.forEach((advance) => {
    expect(advance.type).toBe("imported-history");
    expect(advance.source).toBe("imported");
    expect(advance.label).toBeTruthy();
    expect(advance.changesLength).toBe(0);
    expect(advance.applied).toBe(false);
    expect(advance.appliedByApp).toBe(false);
    expect(advance.trustedUndoable).toBe(false);
  });

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() =>
    character.advances.map((advance) => ({
      type: advance.type,
      source: advance.source,
      changesLength: advance.changes?.length || 0,
      applied: Boolean(advance.applied),
      appliedByApp: Boolean(advance.appliedByApp),
    })),
  );

  expect(persisted.length).toBe(imported.advances.length);
  persisted.forEach((advance) => {
    expect(advance).toEqual(
      expect.objectContaining({
        type: "imported-history",
        source: "imported",
        changesLength: 0,
        applied: false,
        appliedByApp: false,
      }),
    );
  });
});

test("finishes character setup and starts playing with a saved character", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Finished Setup Character");
  await page.locator("#setupArchetypeInput").fill("Trail Scout");
  await page.locator("#setupPlayerInput").fill("Playwright");

  await page.locator("[data-setup-action='finishSetup']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await expect(page.locator("#appDialogTitle")).toHaveText("Finish setup?");
  await expect(page.locator("#appDialogMessage")).toContainText("Hindrances");
  await expect(page.locator("#appDialogMessage")).toContainText("Traits");
  await page.locator("#appDialogConfirmBtn").click();

  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterName")).toContainText(
    "Finished Setup Character",
  );
  await expect(page.locator("#landingPage")).toBeHidden();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId]?.character ||
            null;
          return {
            slotCount: Object.keys(library?.charactersById || {}).length,
            activeName: active?.name || "",
            activeFinalized: Boolean(active?.creation?.finalized),
            activeSetupStatus: active?.setupStatus || "",
            trackerName: tracker?.name || "",
            trackerFinalized: Boolean(tracker?.creation?.finalized),
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      slotCount: 1,
      activeName: "Finished Setup Character",
      activeFinalized: true,
      activeSetupStatus: "complete",
      trackerName: "Finished Setup Character",
      trackerFinalized: true,
      trackerSetupStatus: "complete",
    });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#characterName")).toContainText(
    "Finished Setup Character",
  );

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();
  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Character ready to play",
  );
  await expect(
    page.locator("[data-setup-action='finishSetup']").first(),
  ).toHaveText("Start Playing");
});

test("finalizing setup snapshots source-tracked creation baseline and round-trips import", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const arcaneEdge = EDGE_CATALOG.find(
      (item) => item.id === "dl-edge-arcane-background-blessed",
    );
    const config = arcaneBackgroundConfigFromEdge(arcaneEdge.name);
    const characterData = normalize({
      source: "created",
      setupStatus: "needsReview",
      name: "Baseline Source Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Blessed Drifter",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [
        { name: "Faith", die: "d4", linkedAttribute: "Spirit" },
        { name: "Notice", die: "d4", linkedAttribute: "Smarts", core: true },
      ],
      hindrances: [
        {
          id: "hindrance-big-mouth",
          name: "Big Mouth",
          severity: "Minor",
          notes: "Cannot keep secrets.",
        },
      ],
      edges: [
        {
          ...arcaneEdge,
          id: "baseline-blessed-edge",
          catalogId: arcaneEdge.id,
          source: "Human free Edge",
          isCustom: false,
        },
      ],
      arcaneBackground: makeArcaneBackgroundState(config),
      powers: [
        { catalogId: "power-holy-symbol" },
        { catalogId: "power-barrier" },
        { catalogId: "power-protection" },
      ],
      resources: [
        {
          id: "power-points",
          name: "Power Points",
          current: 15,
          max: 15,
        },
      ],
      inventory: [
        {
          id: "backpack",
          name: "Backpack",
          count: 1,
          weight: 3,
          costCents: 200,
        },
      ],
      moneyCents: 24800,
      ammo: {},
      weapons: [],
      armorInventory: [],
      consumables: [],
      vehicles: [],
      advances: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "baseline-source-character",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "review";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-action='finishSetup']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);

  const finalized = await page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey) || "null"),
    STORAGE_KEY,
  );
  expect(finalized.creationBaseline).toEqual(
    expect.objectContaining({
      version: 1,
      source: "setup",
      attributes: expect.objectContaining({ spirit: "d6" }),
      money: expect.objectContaining({
        cents: 24800,
        creationSource: "setup-starting-funds",
      }),
    }),
  );
  expect(finalized.creationBaseline.capturedAt).toBeTruthy();
  expect(finalized.hindrances[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-hindrance",
      source: "Starting Hindrance",
    }),
  );
  expect(finalized.edges[0]).toEqual(
    expect.objectContaining({
      creationSource: "human-free-edge",
      source: "Human free Edge",
    }),
  );
  expect(finalized.resources[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-arcane-background",
      source: "Setup: Arcane Background (Blessed)",
    }),
  );
  expect(finalized.powers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Holy Symbol",
        creationSource: "setup-starting-power",
        source: "Starting Power",
      }),
    ]),
  );
  expect(finalized.inventory[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
    }),
  );
  expect(finalized.creationBaseline.gear.inventory[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-gear",
    }),
  );

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Setup Source Audit",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Needs GM/Table Exception",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("0");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Explained by Starting Gear Purchase.",
  );

  const exported = await page.evaluate(() => serializeTrackerExport(character));
  await page.evaluate((payload) => {
    localStorage.clear();
    importJsonText(JSON.stringify(payload));
  }, exported);

  const imported = await page.evaluate(() => ({
    name: character.name,
    setupStatus: character.setupStatus,
    hindranceSource: character.hindrances[0]?.creationSource || "",
    powerSource: character.powers[0]?.creationSource || "",
    gearSource: character.inventory[0]?.creationSource || "",
    baselineGearSource:
      character.creationBaseline?.gear?.inventory?.[0]?.creationSource || "",
    baselineMoneySource:
      character.creationBaseline?.money?.creationSource || "",
  }));
  expect(imported).toEqual({
    name: "Baseline Source Character",
    setupStatus: "complete",
    hindranceSource: "setup-starting-hindrance",
    powerSource: "setup-starting-power",
    gearSource: "setup-starting-gear",
    baselineGearSource: "setup-starting-gear",
    baselineMoneySource: "setup-starting-funds",
  });

  await reloadIntoTracker(page);
  const reloaded = await page.evaluate(() => ({
    baselinePowers: character.creationBaseline?.powers?.length || 0,
    baselineResourceSource:
      character.creationBaseline?.resources?.[0]?.creationSource || "",
    baselineCapturedAt: character.creationBaseline?.capturedAt || "",
  }));
  expect(reloaded.baselinePowers).toBe(3);
  expect(reloaded.baselineResourceSource).toBe("setup-arcane-background");
  expect(reloaded.baselineCapturedAt).toBeTruthy();
});

test("marks setup source audit records as GM table exceptions", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const characterData = normalize({
      source: "created",
      setupStatus: "needsReview",
      name: "Exception Setup Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Oddity",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [],
      hindrances: [],
      edges: [],
      powers: [],
      resources: [],
      advances: [],
      inventory: [
        {
          id: "mysterious-relic",
          name: "Mysterious Relic",
          count: 1,
          weight: 1,
          costCents: 0,
        },
      ],
      ammo: {},
      weapons: [],
      armorInventory: [],
      consumables: [],
      vehicles: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "exception-setup-character",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "review";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-step='review']").click();

  const relicAuditRow = page.locator("#setupReviewPanel .dossier-note").filter({
    hasText: "Mysterious Relic",
  });
  await expect(relicAuditRow).toContainText("Needs a GM/table exception note");
  await relicAuditRow.getByRole("button", { name: "Mark Exception" }).click();

  await expect(
    page.locator("#setupReviewPanel .dossier-note").filter({
      hasText: "Mysterious Relic",
    }),
  ).toContainText("Explained by GM / table exception.");

  const snapshot = await page.evaluate((storageKey) => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    const relic = stored.inventory.find(
      (item) => item.id === "mysterious-relic",
    );
    return {
      liveSource: relic.creationSource,
      liveSourceLabel: relic.source,
      liveSourceDetail: relic.sourceDetail,
      exception: stored.setupExceptions[0],
      baselineRelicSource:
        stored.creationBaseline.gear.inventory[0].creationSource,
      baselineExceptionSource:
        stored.creationBaseline.setupExceptions[0].creationSource,
    };
  }, STORAGE_KEY);
  expect(snapshot.liveSource).toBe("setup-gm-exception");
  expect(snapshot.liveSourceLabel).toBe("GM / table exception");
  expect(snapshot.liveSourceDetail).toEqual(
    expect.objectContaining({
      kind: "setup-exception",
      recordCollection: "inventory",
      recordId: "mysterious-relic",
      recordType: "Gear",
      displayLabel: "Mysterious Relic",
    }),
  );
  expect(snapshot.exception).toEqual(
    expect.objectContaining({
      type: "setup-exception",
      label: "Mysterious Relic",
      recordCollection: "inventory",
      recordId: "mysterious-relic",
      creationSource: "setup-gm-exception",
      source: "GM / table exception",
    }),
  );
  expect(snapshot.baselineRelicSource).toBe("setup-gm-exception");
  expect(snapshot.baselineExceptionSource).toBe("setup-gm-exception");

  const exported = await page.evaluate(() => serializeTrackerExport(character));
  await page.evaluate((payload) => {
    localStorage.clear();
    importJsonText(JSON.stringify(payload));
  }, exported);

  const imported = await page.evaluate(() => ({
    relicSource:
      character.inventory.find((item) => item.id === "mysterious-relic")
        ?.creationSource || "",
    exceptionSource: character.setupExceptions?.[0]?.creationSource || "",
    baselineExceptionSource:
      character.creationBaseline?.setupExceptions?.[0]?.creationSource || "",
  }));
  expect(imported).toEqual({
    relicSource: "setup-gm-exception",
    exceptionSource: "setup-gm-exception",
    baselineExceptionSource: "setup-gm-exception",
  });
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

test("opens sources and rulesets from the landing footer", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingSourcesRulesetsBtn").click();

  const panel = page.locator("#sourcesRulesetsPanel");
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "Sources & Rulesets", exact: true }),
  ).toBeVisible();
  await expect(panel).toContainText(
    "Browning Private Security & Detective Agency",
  );
  await expect(panel).toContainText("Savage Worlds: Adventure Edition");
  await expect(panel).toContainText("This page is informational for now");
  await expect(panel.locator("input, select, textarea, button")).toHaveCount(0);
});

test("smoke tests read-only Catalog navigation and modes", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  const panel = page.locator("#catalogPanel");
  const assertCatalogMode = async (label) => {
    await expect(
      panel.locator(".catalog-type-selector button.active"),
    ).toHaveText(label);
    await expect(
      panel.locator("#catalogResultsList .catalog-result").first(),
    ).toBeVisible();
    await expect(
      panel.locator("#catalogDetailPanel .catalog-detail-card"),
    ).toBeVisible();
  };

  await page.locator("#landingCatalogBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(page.locator(".app-tabs [data-app-tab='catalog']")).toHaveCount(
    0,
  );
  await expect(panel).toContainText("Catalog");
  await expect(panel).toContainText(
    "Browse Edges, Hindrances, and Powers without editing the character.",
  );
  await assertCatalogMode("Edges");
  await page.locator("[data-catalog-type='hindrances']").click();
  await assertCatalogMode("Hindrances");
  await page.locator("[data-catalog-type='powers']").click();
  await assertCatalogMode("Powers");

  await expect(
    panel.getByRole("button", { name: /^(Add|Save|Apply)\b/i }),
  ).toHaveCount(0);
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
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

test("edits concept information in character setup and preserves it across reload", async ({
  page,
}) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='concept']").click();

  const setupPanel = page.locator("#characterSetupPanel");
  await expect(setupPanel).toBeVisible();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='concept']")).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator("#setupRankInput")).toHaveCount(0);

  await page.locator("#setupNameInput").fill("Concept Test Character");
  await page.locator("#setupGenderInput").fill("Male");
  await page.locator("#setupAgeInput").fill("61");
  await page.locator("#setupArchetypeInput").fill("Rail Scout");
  await page.locator("#setupPlayerInput").fill("Austin");
  await page
    .locator("#setupDescriptionInput")
    .fill("A weathered scout with steady hands and a careful eye.");
  await page
    .locator("#setupBackgroundInput")
    .fill("Dusty left Deseret after hard accusations and harder losses.");
  await page.locator("#setupSaveConceptBtn").click();

  await expect(page.locator("#characterName")).toContainText(
    "Concept Test Character",
  );
  await expect(page.locator("#characterSubtitle")).toContainText("Rail Scout");

  await page.locator("[data-setup-step='review']").click();
  const reviewPanel = page.locator("#setupReviewPanel");
  await expect(reviewPanel).toBeVisible();
  await expect(reviewPanel).toContainText("Concept Test Character");
  await expect(reviewPanel).toContainText("Male");
  await expect(reviewPanel).toContainText("61");
  await expect(reviewPanel).toContainText("Rail Scout");
  await expect(reviewPanel).toContainText("Austin");
  await expect(reviewPanel).toContainText(
    "A weathered scout with steady hands and a careful eye.",
  );
  await expect(reviewPanel).toContainText(
    "Dusty left Deseret after hard accusations and harder losses.",
  );

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='concept']").click();

  await expect(page.locator("#characterName")).toContainText(
    "Concept Test Character",
  );
  await expect(page.locator("#characterSubtitle")).toContainText("Rail Scout");

  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Concept Test Character",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("Male");
  await expect(page.locator("#setupReviewPanel")).toContainText("61");
  await expect(page.locator("#setupReviewPanel")).toContainText("Rail Scout");
  await expect(page.locator("#setupReviewPanel")).toContainText("Austin");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "A weathered scout with steady hands and a careful eye.",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Dusty left Deseret after hard accusations and harder losses.",
  );
});

test("shows human-only race ancestry setup as read-only", async ({ page }) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await page.locator("[data-setup-step='ancestry']").click();
  const ancestryPanel = page.locator("#setupRaceAncestryPanel");
  await expect(ancestryPanel).toBeVisible();
  await expect(
    ancestryPanel.getByRole("heading", {
      name: "Race / Ancestry",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-setup-step='ancestry']")).toContainText(
    "Complete",
  );
  await expect(ancestryPanel).toContainText("Current Race / Ancestry");
  await expect(ancestryPanel).toContainText("Human");
  await expect(ancestryPanel).toContainText("This step is read-only for now.");
  await expect(
    ancestryPanel.locator("input, select, textarea, button"),
  ).toHaveCount(0);

  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Race / Ancestry",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("Human");
});

test("selects hindrances in character setup and summarizes point expectations", async ({
  page,
}) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(hindrancePanel).toBeVisible();
  await expect(hindrancePanel).toContainText("Expected Selection");
  await expect(hindrancePanel).toContainText("At least 1 Hindrance");
  await expect(hindrancePanel).toContainText("Minor Hindrance");
  await expect(hindrancePanel).toContainText("1 point");
  await expect(hindrancePanel).toContainText("Major Hindrance");
  await expect(hindrancePanel).toContainText("2 points");
  await expect(hindrancePanel).toContainText("Benefit Point Cap");
  await expect(hindrancePanel).toContainText("4 points");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Incomplete",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page
    .locator("#setupHindranceNotesInput")
    .fill("Hard luck follows him.");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Bad Luck");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Cursed");
  await expect(hindrancePanel).toContainText("Benefit Points Counted");
  await expect(hindrancePanel).toContainText("Benefit Points Spent");
  await expect(hindrancePanel).toContainText("4 / 4");

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-tenderfoot");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Tenderfoot");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );
  await expect(hindrancePanel).toContainText("Above the standard cap");
  await expect(hindrancePanel).toContainText(
    "extra rewards require a table or GM exception",
  );
  await expect(hindrancePanel.locator(".entry-advisory")).toContainText(
    "Above the standard cap",
  );
  await expect(hindrancePanel.locator(".entry-warning")).toHaveCount(0);

  await hindrancePanel
    .locator(".setup-hindrance-row")
    .filter({ hasText: "Tenderfoot" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(
    hindrancePanel.locator(".setup-hindrance-row").filter({
      hasText: "Tenderfoot",
    }),
  ).toHaveCount(0);
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(page.locator("#setupHindrancesPanel")).toContainText("Bad Luck");
  await expect(page.locator("#setupHindrancesPanel")).toContainText("Cursed");
  await expect(page.locator("#setupHindrancesPanel")).toContainText("4 / 4");

  await page.locator("[data-setup-step='review']").click();
  const reviewPanel = page.locator("#setupReviewPanel");
  await expect(reviewPanel).toContainText("Hindrance Count");
  await expect(reviewPanel).toContainText("Total Hindrance Points");
  await expect(reviewPanel).toContainText("Hindrance Benefit Cap");
  await expect(reviewPanel).toContainText("Bad Luck");
  await expect(reviewPanel).toContainText("Cursed");
});

test("spends hindrance benefits and selects source-tracked setup edges", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Benefit Edge Character");
  await page.locator("#setupArchetypeInput").fill("Card Sharp");
  await page.locator("#setupSaveConceptBtn").click();
  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Saved character slot",
  );

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Benefit Points Counted");
  await expect(hindrancePanel).toContainText("4 / 4");

  const attributeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Attribute Raises" });
  const edgeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" });
  await attributeBenefitRow.getByRole("button", { name: "+" }).click();
  await edgeBenefitRow.getByRole("button", { name: "+" }).click();
  await expect(hindrancePanel).toContainText("Benefit Points Spent");
  await expect(hindrancePanel).toContainText("4 / 4");
  await expect(attributeBenefitRow).toContainText("1 Attribute Raise");
  await expect(edgeBenefitRow).toContainText("1 Edge");

  await page.locator("[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await expect(edgesPanel).toContainText("Human Free Edge");
  await expect(edgesPanel).toContainText("0 / 1");
  await expect(edgesPanel).toContainText("Hindrance Benefit Edges");
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "Brave",
  );
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "Fan the Hammer",
  );
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "\u00e2\u20ac\u00a2",
  );

  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(edgesPanel).toContainText("Human free Edge");

  await page
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");
  await expect(edgesPanel).toContainText("Hindrance benefit Edge");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );

  await expect
    .poll(() =>
      page.evaluate((libraryKey) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const active = library?.charactersById?.[library.activeCharacterId];
        const activeCharacter = active?.character;
        return {
          activeName: active?.name || "",
          extraAttributeRaises:
            activeCharacter?.creation?.extraAttributeRaisesFromHindrances ?? 0,
          extraEdges: activeCharacter?.creation?.extraEdgesFromHindrances ?? 0,
          humanEdge:
            activeCharacter?.edges?.find((edge) => edge.name === "Alertness")
              ?.creationSource || "",
          hindranceEdge:
            activeCharacter?.edges?.find((edge) => edge.name === "Berserk")
              ?.creationSource || "",
        };
      }, CHARACTER_LIBRARY_KEY),
    )
    .toEqual({
      activeName: "Benefit Edge Character",
      extraAttributeRaises: 1,
      extraEdges: 1,
      humanEdge: "human-free-edge",
      hindranceEdge: "hindrance-benefit",
    });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='edges']").click();
  await expect(page.locator("#setupEdgesPanel")).toContainText("Alertness");
  await expect(page.locator("#setupEdgesPanel")).toContainText("Berserk");
  await expect(page.locator("#setupEdgesPanel")).toContainText(
    "Human free Edge",
  );
  await expect(page.locator("#setupEdgesPanel")).toContainText(
    "Hindrance benefit Edge",
  );
});

test("filters starting Edge choices by Rank Trait and prerequisite Edge requirements", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("[data-setup-step='edges']").click();
  const humanEdgeSelect = page.locator("#setupHumanFreeEdgeSelect");
  await expect(humanEdgeSelect).toBeVisible();

  const eligibility = await page.evaluate(() => {
    const edgeById = (id) => EDGE_CATALOG.find((edge) => edge.id === id);
    return {
      alertness: setupEdgeEligibility(edgeById("swade-edge-alertness")),
      brave: setupEdgeEligibility(edgeById("swade-edge-brave")),
      fanTheHammer: setupEdgeEligibility(edgeById("dl-edge-fan-the-hammer")),
      improvedArcaneResistance: setupEdgeEligibility(
        edgeById("swade-edge-improved-arcane-resistance"),
      ),
    };
  });

  expect(eligibility.alertness).toEqual({
    eligible: true,
    reason: "",
  });
  expect(eligibility.brave).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Spirit d6+"),
    }),
  );
  expect(eligibility.fanTheHammer).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Seasoned Edge"),
    }),
  );
  expect(eligibility.improvedArcaneResistance).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Arcane Resistance"),
    }),
  );

  await expect(humanEdgeSelect).toContainText("Alertness");
  await expect(humanEdgeSelect).not.toContainText("Brave");
  await expect(humanEdgeSelect).not.toContainText("Fan the Hammer");
  await expect(humanEdgeSelect).not.toContainText("Improved Arcane Resistance");
});

test("starting Edge validation blocks stale invalid Human free Edge choices", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("#setupNameInput").fill("Stale Human Edge");
  await page.locator("[data-setup-step='edges']").click();

  const edgesPanel = page.locator("#setupEdgesPanel");
  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );

  await page.evaluate(() => {
    const brave = EDGE_CATALOG.find((edge) => edge.id === "swade-edge-brave");
    const humanEdge = character.edges.find(
      (edge) => setupEdgeCreationSource(edge) === "human-free-edge",
    );
    Object.assign(humanEdge, {
      ...brave,
      id: humanEdge.id,
      catalogId: brave.id,
      source: "Human free Edge",
      creationSource: "human-free-edge",
    });
    save();
    render();
  });

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );
  await expect(edgesPanel).toContainText(
    "Human free Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");

  await page
    .locator("#characterSetupPanel [data-setup-action='confirmSetup']")
    .first()
    .click();
  await expect(page.locator("#toastRegion")).toContainText(
    "Resolve invalid source-tracked starting Edges",
  );
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );

  await edgesPanel
    .locator(".setup-edge-card")
    .filter({ hasText: "Brave" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(edgesPanel).not.toContainText(
    "no longer satisfies starting Edge eligibility",
  );
  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );
});

test("starting Edge validation flags stale invalid Hindrance benefit Edge choices", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("#setupNameInput").fill("Stale Benefit Edge");

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" })
    .getByRole("button", { name: "+" })
    .click();

  await page.locator("[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await page
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");

  const source = await page.evaluate(
    () =>
      character.edges.find((edge) => edge.name === "Berserk")?.creationSource ||
      "",
  );
  expect(source).toBe("hindrance-benefit");

  await page.evaluate(() => {
    const brave = EDGE_CATALOG.find((edge) => edge.id === "swade-edge-brave");
    const benefitEdge = character.edges.find(
      (edge) => setupEdgeCreationSource(edge) === "hindrance-benefit",
    );
    Object.assign(benefitEdge, {
      ...brave,
      id: benefitEdge.id,
      catalogId: brave.id,
      source: "Hindrance benefit Edge",
      creationSource: "hindrance-benefit",
    });
    save();
    render();
  });

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );
  await expect(edgesPanel).toContainText(
    "Hindrance benefit Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");
});

async function seedPowersSetupCharacter(page, options = {}) {
  await enterTracker(page);
  await page.evaluate((seedOptions) => {
    const edge = EDGE_CATALOG.find(
      (item) => item.id === "dl-edge-arcane-background-blessed",
    );
    const powerRecords = (seedOptions.powerIds || []).map((id) => ({
      catalogId: id,
    }));
    const config = arcaneBackgroundConfigFromEdge(edge.name);
    const characterData = normalize({
      source: seedOptions.source || "created",
      setupStatus: "needsReview",
      name: seedOptions.name || "Powers Audit Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Arcane Tester",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: seedOptions.skills || [],
      edges: [
        {
          ...edge,
          id: "test-blessed-edge",
          catalogId: edge.id,
          source: "setup test",
          isCustom: false,
        },
      ],
      hindrances: [],
      powers: powerRecords,
      resources: seedOptions.resources || [],
      arcaneBackground: makeArcaneBackgroundState(config),
      advances: seedOptions.advances || [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: seedOptions.preferredId || "powers-audit-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "powers";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  }, options);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-step='powers']").click();
}

test("Powers setup audit reports missing requirements for an Arcane Background", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Powers",
    preferredId: "missing-blessed-powers",
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Expected Arcane Skill");
  await expect(setupPowersPanel).toContainText("Faith d4+ linked to Spirit");
  await expect(setupPowersPanel).toContainText("Missing Faith d4+ for Blessed");
  await expect(setupPowersPanel).toContainText("Expected Power Points");
  await expect(setupPowersPanel).toContainText("15 Power Points");
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; none recorded.",
  );
  await expect(setupPowersPanel).toContainText("Expected Starting Powers");
  await expect(setupPowersPanel).toContainText(
    "Expected 3 starting powers; 0 recorded.",
  );
  await expect(setupPowersPanel).toContainText(
    "Holy Symbol is required for Blessed and is missing.",
  );

  const mutationSnapshot = await page.evaluate(() => ({
    powers: character.powers.length,
    powerPoints: Boolean(powerPointResource()),
  }));
  expect(mutationSnapshot).toEqual({
    powers: 0,
    powerPoints: false,
  });
});

test("Powers setup audit recognizes a complete starting arcane package", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Complete Blessed Powers",
    preferredId: "complete-blessed-powers",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Faith d4 linked to Spirit");
  await expect(setupPowersPanel).toContainText("15 / 15");
  await expect(setupPowersPanel).toContainText("3 / 3 expected");
  await expect(setupPowersPanel).toContainText("Holy Symbol: recorded");
  await expect(setupPowersPanel).toContainText("Barrier");
  await expect(setupPowersPanel).toContainText("Protection");
  await expect(
    setupPowersPanel.getByRole("button", { name: "Add Starting Power" }),
  ).toBeDisabled();
});

test("Powers setup creates and persists setup starting Power Points", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Power Points",
    preferredId: "missing-blessed-power-points",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; none recorded.",
  );

  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power Points" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );

  const snapshot = await page.evaluate(() => {
    const powerPoints = powerPointResource();
    return {
      current: powerPoints?.current,
      max: powerPoints?.max,
      source: powerPoints?.source,
      creationSource: powerPoints?.creationSource,
    };
  });
  expect(snapshot).toEqual({
    current: 15,
    max: 15,
    source: "Setup: Arcane Background (Blessed)",
    creationSource: "setup-arcane-background",
  });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='powers']").click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  const persistedSource = await page.evaluate(
    () => powerPointResource()?.creationSource,
  );
  expect(persistedSource).toBe("setup-arcane-background");
});

test("Powers setup warns for mismatched Power Points and can reset them", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Mismatched Blessed Power Points",
    preferredId: "mismatched-blessed-power-points",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 10,
        max: 12,
        source: "Manual setup",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Needs review",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; recorded max is 12.",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 current Power Points; recorded current is 10.",
  );

  await setupPowersPanel
    .getByRole("button", { name: "Update Starting Power Points" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("15 / 15");

  const powerPoints = await page.evaluate(() => powerPointResource());
  expect(powerPoints).toEqual(
    expect.objectContaining({
      current: 15,
      max: 15,
      source: "Setup: Arcane Background (Blessed)",
      creationSource: "setup-arcane-background",
    }),
  );
});

test("Powers setup selection adds removes and persists setup starting powers", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Selectable Blessed Powers",
    preferredId: "selectable-blessed-powers",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
  });

  let setupPowersPanel = page.locator("#setupPowersPanel");
  await setupPowersPanel
    .getByRole("button", { name: "Add Holy Symbol" })
    .click();
  await page.locator("#setupStartingPowerSelect").selectOption("power-barrier");
  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power" })
    .click();
  await page
    .locator("#setupStartingPowerSelect")
    .selectOption("power-protection");
  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power" })
    .click();

  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("3 / 3 expected");

  const snapshot = await page.evaluate(() => ({
    catalogIds: character.powers.map((power) => power.catalogId).sort(),
    creationSources: character.powers.map((power) => power.creationSource),
    addedReasons: character.powers.map((power) => power.addedReason),
  }));
  expect(snapshot).toEqual({
    catalogIds: ["power-barrier", "power-holy-symbol", "power-protection"],
    creationSources: [
      "setup-starting-power",
      "setup-starting-power",
      "setup-starting-power",
    ],
    addedReasons: [
      "setup-starting-power",
      "setup-starting-power",
      "setup-starting-power",
    ],
  });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='powers']").click();

  setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(setupPowersPanel).toContainText("Setup starting Power");
  const persistedSources = await page.evaluate(() =>
    character.powers.map((power) => power.creationSource),
  );
  expect(persistedSources).toEqual([
    "setup-starting-power",
    "setup-starting-power",
    "setup-starting-power",
  ]);

  await setupPowersPanel
    .locator(".setup-power-card")
    .filter({ hasText: "Barrier" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  const afterRemove = await page.evaluate(() =>
    character.powers.map((power) => power.catalogId).sort(),
  );
  expect(afterRemove).toEqual(["power-holy-symbol", "power-protection"]);
});

test("Powers setup audit flags powers outside the Arcane Background list", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Invalid Blessed Power",
    preferredId: "invalid-blessed-power",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-bolt"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Needs review",
  );
  await expect(setupPowersPanel).toContainText(
    "Bolt is not in the Blessed allowed power list.",
  );
  await expect(setupPowersPanel).toContainText("Bolt");

  const powers = await page.evaluate(() =>
    character.powers.map((power) => power.name),
  );
  expect(powers).toContain("Bolt");
});

async function seedGearSetupCharacter(page, options = {}) {
  await enterTracker(page);
  await page.evaluate((seedOptions) => {
    const characterData = normalize({
      source: seedOptions.source || "created",
      setupStatus: "needsReview",
      name: seedOptions.name || "Gear Audit Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Gear Tester",
      moneyCents: seedOptions.moneyCents ?? 25000,
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [],
      edges: [],
      hindrances: [],
      powers: [],
      resources: [],
      advances: seedOptions.advances || [],
      inventory: seedOptions.inventory || [],
      weapons: seedOptions.weapons || [],
      armorInventory: seedOptions.armorInventory || [],
      consumables: seedOptions.consumables || [],
      ammo: seedOptions.ammo || {},
      vehicles: seedOptions.vehicles || [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: seedOptions.preferredId || "gear-audit-test",
    });
    character = normalize(entry.character);
    if (seedOptions.injectInvalidInventory) {
      character.inventory = seedOptions.injectInvalidInventory;
    }
    characterSetupReviewOpen = true;
    characterSetupStep = "gear";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  }, options);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-step='gear']").click();
}

test("Gear setup audit separates money carried gear stored gear and load", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Complete Gear Audit",
    preferredId: "complete-gear-audit",
    inventory: [
      {
        id: "backpack",
        name: "Backpack",
        count: 1,
        unitWeight: 3,
        containerOwnWeight: 3,
        totalWeight: 13,
        costCents: 200,
        location: "carried",
        contents: [
          {
            id: "bedroll",
            name: "Bedroll",
            count: 1,
            weight: 10,
            costCents: 400,
          },
        ],
      },
      {
        id: "canteen",
        name: "Canteen",
        count: 1,
        weight: 3,
        costCents: 100,
        location: "carried",
      },
      {
        id: "stored-rope",
        name: "Rope (20 yards)",
        count: 1,
        weight: 8,
        costCents: 500,
        location: "stored",
        storageId: "home",
      },
    ],
    weapons: [
      {
        id: "bowie-knife",
        name: "Bowie Knife",
        damage: "Str+d4",
        range: "—",
        ap: 0,
        rof: 1,
        weight: 1,
        costCents: 400,
        itemLocation: "carried",
      },
    ],
    armorInventory: [
      {
        id: "duster",
        name: "Duster",
        count: 1,
        armor: 1,
        location: "torso",
        equipped: true,
        itemLocation: "equipped",
        weight: 4,
        costCents: 1000,
      },
    ],
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await expect(setupGearPanel).toContainText("Recorded Money");
  await expect(setupGearPanel).toContainText("$250.00");
  await expect(setupGearPanel).toContainText("Current Load");
  await expect(setupGearPanel).toContainText("Combat Load");
  await expect(setupGearPanel).toContainText("Carrying Capacity");
  await expect(setupGearPanel).toContainText("On Body / Carried");
  await expect(setupGearPanel).toContainText("Equipped / Worn");
  await expect(setupGearPanel).toContainText("Stored / Off-person");
  await expect(setupGearPanel).toContainText("Containers");
  await expect(setupGearPanel).toContainText("Backpack");
  await expect(setupGearPanel).toContainText("Empty 3 lb");
  await expect(setupGearPanel).toContainText("Contents 10 lb");
  await expect(setupGearPanel).toContainText("Total 13 lb");
  await expect(setupGearPanel).toContainText("Contains: Bedroll");
  await expect(setupGearPanel).toContainText("Home");
  await expect(setupGearPanel).not.toContainText("Add Item");
  await expect(setupGearPanel).not.toContainText("Save Item");
  await expect(setupGearPanel).not.toContainText("Apply");
  await expect(setupGearPanel).toContainText("Buy Starting Gear");

  const before = await page.evaluate(() =>
    JSON.stringify({
      moneyCents: character.moneyCents,
      inventory: character.inventory,
      weapons: character.weapons,
      armorInventory: character.armorInventory,
    }),
  );
  await page.locator("[data-setup-step='gear']").click();
  const after = await page.evaluate(() =>
    JSON.stringify({
      moneyCents: character.moneyCents,
      inventory: character.inventory,
      weapons: character.weapons,
      armorInventory: character.armorInventory,
    }),
  );
  expect(after).toBe(before);

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='gear']").click();
  await expect(page.locator("#setupGearPanel")).toContainText("Backpack");
});

test("Gear setup purchases source-track starting gear and reduce funds", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Starting Gear Purchaser",
    preferredId: "starting-gear-purchaser",
    moneyCents: 25000,
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await page.locator("#setupGearPurchaseSelect").selectOption("backpack");
  await setupGearPanel.getByRole("button", { name: "Buy Gear" }).click();
  await page
    .locator("#setupAmmoPurchaseSelect")
    .selectOption("pistol-ammunition-large-40-50-caliber");
  await page.locator("#setupAmmoPurchaseCaliber").selectOption(".45");
  await page.locator("#setupAmmoPurchaseQty").fill("6");
  await setupGearPanel.getByRole("button", { name: "Buy Ammunition" }).click();
  await page.locator("#setupArmorPurchaseSelect").selectOption("native-armor");
  await setupGearPanel.getByRole("button", { name: "Buy Armor" }).click();
  await page
    .locator("#setupWeaponPurchaseSelect")
    .selectOption("ww-colt-peacemaker-45");
  await setupGearPanel.getByRole("button", { name: "Buy Weapon" }).click();
  await page.locator("#setupVehiclePurchaseSelect").selectOption("bateaux");
  await setupGearPanel.getByRole("button", { name: "Buy Vehicle" }).click();

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await expect(setupGearPanel).toContainText("Remaining");
  await expect(setupGearPanel).toContainText("$180.64");
  await expect(setupGearPanel).toContainText("Starting Gear Purchase");
  await expect(setupGearPanel).toContainText("Bateaux");

  const snapshot = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    backpack: character.inventory.find((item) => item.id === "backpack"),
    ammo: Object.values(character.ammo)[0],
    weapon: character.weapons.find(
      (weapon) => weapon.catalogId === "ww-colt-peacemaker-45",
    ),
    armor: character.armorInventory.find((item) => item.id === "native-armor"),
    vehicle: character.vehicles.find((item) => item.id === "bateaux"),
  }));
  expect(snapshot.moneyCents).toBe(18064);
  expect(snapshot.backpack).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
      category: "General Equipment",
    }),
  );
  expect(snapshot.backpack.sourceDetail).toEqual(
    expect.objectContaining({
      kind: "starting-funds",
      purchaseType: "gear",
      catalogId: "backpack",
      costCents: 200,
      quantity: 1,
    }),
  );
  expect(snapshot.ammo).toEqual(
    expect.objectContaining({
      label: "Pistol ammo (.45)",
      count: 6,
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
    }),
  );
  expect(snapshot.weapon).toEqual(
    expect.objectContaining({
      name: "Colt Peacemaker (.45)",
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
      shotsLoaded: 6,
    }),
  );
  expect(snapshot.armor).toEqual(
    expect.objectContaining({
      name: "Native Armor",
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
    }),
  );
  expect(snapshot.vehicle).toEqual(
    expect.objectContaining({
      name: "Bateaux",
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
      category: "Water Vehicles",
      topSpeed: 2,
    }),
  );

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='gear']").click();
  const persisted = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    armorSource: character.armorInventory.find(
      (item) => item.id === "native-armor",
    )?.creationSource,
    vehicleSource: character.vehicles.find((item) => item.id === "bateaux")
      ?.creationSource,
  }));
  expect(persisted).toEqual({
    moneyCents: 18064,
    armorSource: "setup-starting-gear",
    vehicleSource: "setup-starting-gear",
  });
});

test("Gear setup blocks purchases that exceed remaining starting funds", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Overspend Gear Purchaser",
    preferredId: "overspend-gear-purchaser",
    moneyCents: 100,
  });

  await page
    .locator("#setupWeaponPurchaseSelect")
    .selectOption("ww-colt-peacemaker-45");
  await page
    .locator("#setupGearPanel")
    .getByRole("button", { name: "Buy Weapon" })
    .click();
  await expect(page.locator("#toastRegion")).toContainText(
    "Not enough starting funds",
  );

  const snapshot = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    weapons: character.weapons.length,
  }));
  expect(snapshot).toEqual({
    moneyCents: 100,
    weapons: 0,
  });
});

test("Gear setup keeps imported and advanced characters audit only", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Imported Gear Audit",
    preferredId: "imported-gear-audit",
    source: "imported",
    inventory: [
      {
        id: "backpack",
        name: "Backpack",
        count: 1,
        weight: 3,
        costCents: 200,
      },
    ],
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await expect(setupGearPanel).not.toContainText("Buy Starting Gear");
  await expect(setupGearPanel.locator("#setupGearPurchaseSelect")).toHaveCount(
    0,
  );
  await expect(setupGearPanel).toContainText("Audit only");

  await page.evaluate(() => {
    character.source = "created";
    character.name = "Advanced Gear Audit";
    character.advances = [
      { id: "advance-1", type: "gm-exception", label: "Played" },
    ];
    render();
  });
  await expect(page.locator("#setupGearPanel")).not.toContainText(
    "Buy Starting Gear",
  );
});

test("Gear setup audit flags missing or unknown gear data", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Invalid Gear Audit",
    preferredId: "invalid-gear-audit",
    moneyCents: 25000,
    injectInvalidInventory: [
      {
        id: "mystery-item",
        name: "",
        count: -1,
        location: "somewhere-unknown",
        weight: "",
        unitWeight: "",
        totalWeight: "",
      },
    ],
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Needs review",
  );
  await expect(setupGearPanel).toContainText("Missing item name");
  await expect(setupGearPanel).toContainText("Unknown or missing location");
  await expect(setupGearPanel).toContainText("Suspicious count value");
  await expect(setupGearPanel).toContainText("Weight is unknown");

  const invalidItem = await page.evaluate(() => character.inventory[0]);
  expect(invalidItem).toEqual(
    expect.objectContaining({
      id: "mystery-item",
      name: "",
      count: -1,
      location: "somewhere-unknown",
    }),
  );
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

test("shows usage notes and audits setup traits, edges, powers, and gear", async ({
  page,
}) => {
  await importSavagedSample(
    page,
    "savaged-us-json-export-character-Dusty McCaw.json",
  );
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await page.getByRole("button", { name: "Character", exact: true }).click();

  const agilityCard = page
    .locator("#attributesList .attribute-die-card")
    .filter({ hasText: "Agility" });
  await expect(agilityCard).toHaveAttribute("title", /Coordination/);
  await agilityCard.hover();
  await expect(agilityCard.locator(".trait-help")).toBeVisible();
  await expect(agilityCard.locator(".trait-help")).toContainText(
    "Coordination",
  );

  const shootingChip = page
    .locator("#skillsList .skill-chip")
    .filter({ hasText: "Shooting" });
  await expect(shootingChip).toHaveAttribute("title", /Ranged attacks/);
  await shootingChip.hover();
  await expect(shootingChip.locator(".trait-help")).toBeVisible();
  await expect(shootingChip.locator(".trait-help")).toContainText(
    "Linked attribute: Agility",
  );

  await expect(
    page.locator("[data-setup-step='attributesSkills']"),
  ).toContainText("Complete");
  await page.locator("[data-setup-step='attributesSkills']").click();
  const setupTraitsPanel = page.locator("#setupTraitsPanel");
  await expect(setupTraitsPanel).toContainText("Traits");
  await expect(setupTraitsPanel).toContainText("Advanced character");
  await expect(setupTraitsPanel).toContainText("All Skills Shown");
  await expect(setupTraitsPanel).toContainText("Unskilled Value");
  await expect(setupTraitsPanel).toContainText("d4-2");
  await expect(
    setupTraitsPanel.locator("[data-setup-action='incAttribute']"),
  ).toHaveCount(0);
  await expect(
    page
      .locator("#setupTraitsPanel .skill-chip")
      .filter({ hasText: "Healing" }),
  ).toHaveAttribute("title", /Treating wounds/);
  await expect(
    page
      .locator("#setupTraitsPanel .skill-chip:not(.unskilled)")
      .filter({ hasText: "Healing" }),
  ).toHaveCSS("border-style", "solid");

  const unskilledAcademics = setupTraitsPanel
    .locator(".skill-chip.unskilled")
    .filter({ hasText: "Academics" });
  await expect(unskilledAcademics).toContainText("d4-2");
  await expect(unskilledAcademics).toContainText("Unskilled");
  await expect(unskilledAcademics).toHaveAttribute("title", /Formal education/);
  await expect(unskilledAcademics).toHaveCSS("border-style", "dashed");

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='edges']").click();
  const setupEdgesPanel = page.locator("#setupEdgesPanel");
  await expect(setupEdgesPanel).toContainText("Recorded Edges");
  await expect(setupEdgesPanel).toContainText("Catalog Matches");
  await expect(setupEdgesPanel).toContainText("Arcane Background Edges");
  await expect(setupEdgesPanel).toContainText("Arcane Background (Blessed)");
  await expect(setupEdgesPanel).toContainText("Healer");
  await expect(setupEdgesPanel).toContainText("Catalog matched");
  await expect(setupEdgesPanel).toContainText("Imported Advance Edge");
  await expect(setupEdgesPanel).toContainText("Imported selected Edge");
  await expect(setupEdgesPanel).toContainText("Spirit d6+, Faith d4+");
  await expect(setupEdgesPanel).not.toContainText(
    "more than one Arcane Background Edge",
  );

  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='powers']").click();
  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(setupPowersPanel).toContainText("Arcane Background");
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Power Points");
  await expect(setupPowersPanel).toContainText("15 / 15");
  await expect(setupPowersPanel).toContainText("Expected Starting Powers");
  await expect(setupPowersPanel).toContainText("Holy Symbol");
  await expect(setupPowersPanel).toContainText("Barrier");
  await expect(setupPowersPanel).toContainText("Protection");

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='gear']").click();
  const setupGearPanel = page.locator("#setupGearPanel");
  await expect(setupGearPanel).toContainText("Money");
  await expect(setupGearPanel).toContainText("Weapons");
  await expect(setupGearPanel).toContainText("Armor");
  await expect(setupGearPanel).toContainText("Current Load");
  await expect(setupGearPanel).toContainText("Combat Load");
  await expect(setupGearPanel).toContainText("Carrying Capacity");
  await expect(setupGearPanel).toContainText("Colt Army");
  await expect(setupGearPanel).toContainText("Winchester");
  await expect(setupGearPanel).toContainText("Native Armor");
  await expect(setupGearPanel).toContainText("Ammunition");

  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText("Edge Count");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Arcane Background Edges",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("Known Powers");
  await expect(page.locator("#setupReviewPanel")).toContainText("Gear Items");
});

test("edits setup traits for created characters and stores the creation baseline", async ({
  page,
}) => {
  await enterTracker(page);
  const createdCharacter = {
    source: "created",
    name: "Setup Trait Editor",
    rank: "Novice",
    ancestry: "Human",
    archetype: "Drifter",
    attributes: {
      agility: "d4",
      smarts: "d4",
      spirit: "d4",
      strength: "d4",
      vigor: "d4",
    },
    skills: [
      { name: "Athletics", die: "d4", linkedAttribute: "agility", core: true },
      {
        name: "Common Knowledge",
        die: "d4",
        linkedAttribute: "smarts",
        core: true,
      },
      { name: "Notice", die: "d4", linkedAttribute: "smarts", core: true },
      {
        name: "Persuasion",
        die: "d4",
        linkedAttribute: "spirit",
        core: true,
      },
      { name: "Stealth", die: "d4", linkedAttribute: "agility", core: true },
    ],
    hindrances: [],
    edges: [],
    advances: [],
    creation: {
      normalAttributePointsAvailable: 5,
      normalSkillPointsAvailable: 12,
      extraAttributeRaisesFromHindrances: 0,
      extraSkillPointsFromHindrances: 0,
      finalized: true,
    },
    creationBaseline: {
      attributes: {
        agility: "d4",
        smarts: "d4",
        spirit: "d4",
        strength: "d4",
        vigor: "d4",
      },
      skills: [],
    },
    moneyCents: 0,
    ammo: {},
    weapons: [],
    armorInventory: [],
    inventory: [],
    consumables: [],
    vehicles: [],
    resources: [],
    powers: [],
  };

  await openHeaderMenu(page);
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(JSON.stringify(createdCharacter));
  await page.locator("#confirmPasteImportBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Setup Trait Editor",
  );

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("[data-setup-step='attributesSkills']"),
  ).toContainText("Incomplete");
  await page.locator("[data-setup-step='attributesSkills']").click();
  const setupTraitsPanel = page.locator("#setupTraitsPanel");
  await expect(setupTraitsPanel).toContainText("Edit starting Attributes");
  await expect(setupTraitsPanel).toContainText("Attribute Points");
  await expect(setupTraitsPanel).toContainText("0 / 5");

  const agilityRow = setupTraitsPanel
    .locator(".setup-trait-editor-row:not(.skill-row)")
    .filter({ hasText: "Agility" });
  await agilityRow.locator("[data-setup-action='incAttribute']").click();
  await expect(agilityRow).toContainText("d6");
  await expect(setupTraitsPanel).toContainText("1 / 5");

  const shootingRow = setupTraitsPanel
    .locator(".setup-trait-editor-row.skill-row")
    .filter({ hasText: "Shooting" });
  await expect(shootingRow).toContainText("d4-2");
  await shootingRow.locator("[data-setup-action='incSkill']").click();
  await expect(shootingRow).toContainText("d4");
  await expect(shootingRow).toContainText("Cost 1");

  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  expect(stored.creationBaseline.attributes.agility).toBe("d6");
  expect(stored.attributes.agility).toBe("d6");
  expect(
    stored.creationBaseline.skills.some(
      (skill) => skill.name === "Shooting" && skill.die === "d4",
    ),
  ).toBe(true);
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

test("edits active character profile from the characters panel", async ({
  page,
}) => {
  const name = "Profile Panel Character";
  const archetype = "Rail Agent Profile Test";
  const player = "Profile Panel Player";
  const age = "42";
  const gender = "Nonbinary";
  const description = "Profile panel description persists across reload.";
  const background = "Profile panel background stays with the character.";

  await enterTracker(page);
  await openCharacterLibrary(page);
  await expect(page.locator("#characterProfileEditor")).toBeVisible();
  await page.locator("#profileNameInput").fill(name);
  await page.locator("#profileArchetypeInput").fill(archetype);
  await page.locator("#profilePlayerInput").fill(player);
  await page.locator("#profileAgeInput").fill(age);
  await page.locator("#profileGenderInput").fill(gender);
  await page.locator("#profileDescriptionInput").fill(description);
  await page.locator("#profileBackgroundInput").fill(background);
  await page.locator("#saveCharacterProfileBtn").click();

  await expect(page.locator("#characterName")).toContainText(name);
  await expect(page.locator(".library-character.active")).toContainText(name);

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSummaryName")).toHaveText(name);
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    archetype,
  );
  await expect(page.locator("#characterBasicsList")).toContainText(archetype);
  await expect(page.locator("#characterBasicsList")).toContainText(player);
  await expect(page.locator("#characterBasicsList")).toContainText(age);
  await expect(page.locator("#characterBasicsList")).toContainText(gender);
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    description,
  );
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    background,
  );

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
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
            activeArchetype: active?.character?.archetype || "",
            activePlayer: active?.character?.player || "",
            activeAge: active?.character?.age || "",
            activeGender: active?.character?.gender || "",
            activeDescription: active?.character?.description || "",
            activeBackground: active?.character?.background || "",
            activeSetupStatus: active?.character?.setupStatus || "",
            trackerName: tracker?.name || "",
            trackerArchetype: tracker?.archetype || "",
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      activeName: name,
      activeCharacterName: name,
      activeArchetype: archetype,
      activePlayer: player,
      activeAge: age,
      activeGender: gender,
      activeDescription: description,
      activeBackground: background,
      activeSetupStatus: "complete",
      trackerName: name,
      trackerArchetype: archetype,
      trackerSetupStatus: "complete",
    });

  await reloadIntoTracker(page);
  await expect(page.locator("#characterName")).toContainText(name);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSummaryName")).toHaveText(name);
  await expect(page.locator("#characterBasicsList")).toContainText(archetype);
  await expect(page.locator("#characterBasicsList")).toContainText(player);
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    description,
  );

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeSetupStatus: active?.character?.setupStatus || "",
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      activeSetupStatus: "complete",
      trackerSetupStatus: "complete",
    });
});

test("selects and opens a saved character from the minimal landing page @mobile", async ({
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

test("imports JSON from the landing page only after confirmation @mobile", async ({
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

test("shows setup review for imported characters until confirmed @mobile", async ({
  page,
}) => {
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await enterTracker(page);
  await openHeaderMenu(page);
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(await sample.text());
  await page.locator("#confirmPasteImportBtn").click();
  await expect(page.locator("#characterName")).toContainText("Lehi Larson");

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#characterSetupStepper")).toBeVisible();
  await expect(page.locator("#setupReviewPanel")).toBeVisible();
  const confirmSetupButton = page.locator(
    "#characterSetupPanel [data-setup-action='confirmSetup']",
  );
  await expect(confirmSetupButton).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "needsReview",
      trackerStatus: "needsReview",
    });

  await confirmSetupButton.click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "complete",
      trackerStatus: "complete",
    });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();

  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#setupReviewPanel")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "complete",
      trackerStatus: "complete",
    });
});

test("keeps duplicated character state independent across switching and reload @mobile", async ({
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

test("persists wounds for an unsaved active character across reload @mobile", async ({
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

test("adds and deletes gear while preserving remaining inventory across reload @mobile", async ({
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
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(hindrancePanel).toContainText("Heroic");
  await expect(hindrancePanel).toContainText("Major");
  await expect(hindrancePanel).toContainText("Small");
  await expect(hindrancePanel).toContainText("Minor");
  await expect(hindrancePanel).not.toContainText(
    "Needs review: one or more Hindrances need Minor or Major severity.",
  );
  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText("Lehi Larson");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Import Warnings",
  );
});

test("round-trips exported tracker JSON through import @mobile", async ({
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
