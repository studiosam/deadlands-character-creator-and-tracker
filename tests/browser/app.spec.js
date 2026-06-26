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
  await expect(setupPowersPanel).toContainText("Starting Powers Expected");
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
  await expect(setupGearPanel).toContainText("Current Load (Combat Load)");
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
