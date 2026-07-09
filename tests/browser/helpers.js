const { test, expect } = require("@playwright/test");

const STORAGE_KEY = "deadlands-tracker-v2";
const CHARACTER_LIBRARY_KEY = "deadlands-character-library-v1";
const SETUP_DRAFT_KEY = "deadlands-setup-draft-v1";
const SETUP_PROGRESS_KEY = "deadlands-setup-progress-v1";
const THEME_KEY = "deadlands-tracker-theme-v1";
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
  if (await page.locator("#landingContinueBtn").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  } else {
    await page.locator("#landingLoadSampleBtn").click();
  }
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
  const summary = page.locator("#headerToolsMenu summary");
  if (!(await summary.isVisible())) {
    if (await page.locator("#utilityBackToTrackerBtn").isVisible()) {
      await page.locator("#utilityBackToTrackerBtn").click();
    }
    if (!(await summary.isVisible())) {
      await page
        .getByRole("button", { name: "Character", exact: true })
        .click();
    }
    await expect(summary).toBeVisible();
  }
  const menu = page.locator("#headerToolsMenu");
  if (!(await menu.evaluate((element) => element.open))) {
    await summary.click();
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

async function openArcane(page) {
  await page.getByRole("button", { name: "Arcane", exact: true }).click();
  await expect(page.locator("#arcanePanel")).toHaveClass(/active/);
}

async function openCharacterSetupReview(page) {
  const setupPanel = page.locator("#characterSetupPanel");
  if (await setupPanel.isVisible()) {
    await expect(setupPanel).toBeVisible();
    return;
  }
  const characterTab = page.getByRole("button", {
    name: "Character",
    exact: true,
  });
  if (await characterTab.isVisible()) await characterTab.click();
  else await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  if (!(await setupPanel.isVisible())) {
    await page.locator("#reviewSetupBtn").click();
  }
  await expect(setupPanel).toBeVisible();
}

async function startNewCharacterFromLanding(page) {
  await page.locator("#landingCreateBtn").click();
  if (!(await page.locator("#appDialog").isVisible())) {
    await expect(page.locator("#landingPage")).toBeHidden();
    await expect(page.locator("#characterSetupPanel")).toBeVisible();
    return;
  }
  const dialog = page.locator("#appDialog");
  await expect(dialog.locator("#appDialogSelectLabel")).toBeHidden();
  await dialog.getByRole("button", { name: "Create New Character" }).click();
  await expect(dialog).toBeHidden();
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
  const addAdvanceButton = page.locator("#showAdvanceFormBtn");
  await expect(addAdvanceButton).toBeVisible();
  await addAdvanceButton.click();
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
      setupStatus: "complete",
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
      creation: {
        finalized: true,
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

function useAppTestHooks() {
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
}

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
      conditions: seedOptions.conditions || {},
      armorStrength: "d6",
      weaponStrength: "d6",
      inventory: seedOptions.inventory || [],
      weapons: seedOptions.weapons || [],
      armorInventory: [],
      ammo: seedOptions.ammo || {},
      consumables: [],
      vehicles: [],
      powers: [],
      resources: seedOptions.resources || [],
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

async function seedActivePowerCharacter(page, options = {}) {
  await enterTracker(page);
  await page.evaluate((seedOptions) => {
    const config = ARCANE_BACKGROUNDS.blessed;
    const baseCharacter = {
      arcaneBackground: makeArcaneBackgroundState(config),
    };
    const powerIds = seedOptions.powerIds || ["power-protection"];
    const powers = powerIds
      .map((id) => findPowerCatalogEntryById(id))
      .filter(Boolean)
      .map((power, index) =>
        normalizePowerRecord(
          createKnownPowerFromCatalog(power, baseCharacter, {
            id: `active-power-known-${index + 1}`,
            addedReason: "test-known-power",
          }),
          index,
          config.edgeName,
        ),
      );
    const characterData = normalize({
      source: "test",
      setupStatus: "complete",
      name: seedOptions.name || "Active Power Tester",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Arcane Tester",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d8",
        strength: "d6",
        vigor: "d6",
      },
      skills: [{ name: "Faith", die: "d6", linkedAttribute: "spirit" }],
      edges: [],
      hindrances: [],
      powers,
      activePowers: seedOptions.activePowers || [],
      resources: [
        {
          id: "power-points",
          name: "Power Points",
          current: seedOptions.powerPointsCurrent ?? 15,
          max: 15,
          source: "Active power test",
        },
      ],
      arcaneBackground: makeArcaneBackgroundState(config),
      advances: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: seedOptions.preferredId || "active-power-test",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = false;
    characterDraftMode = false;
    render();
    renderDemoExperience();
  }, options);
}

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
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='powers']").click();
}

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
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='gear']").click();
}

module.exports = {
  test,
  expect,
  useAppTestHooks,
  STORAGE_KEY,
  CHARACTER_LIBRARY_KEY,
  SETUP_DRAFT_KEY,
  SETUP_PROGRESS_KEY,
  THEME_KEY,
  clearAppStorage,
  enterTracker,
  reloadIntoTracker,
  openHeaderMenu,
  openCharacterLibrary,
  saveCurrentCharacter,
  renameActiveCharacter,
  characterRow,
  switchToCharacter,
  openCombat,
  openArcane,
  openCharacterSetupReview,
  startNewCharacterFromLanding,
  woundsBlock,
  increaseWounds,
  expectWounds,
  openInventory,
  gearRow,
  weaponRow,
  addCustomGear,
  importSavagedSample,
  openAdvanceEditor,
  eligibleAdvanceSkills,
  expectCanonicalAdvanceScaffold,
  expectCanonicalChangeScaffold,
  firstEligibleAttributeAdvance,
  firstAvailableAdvanceEdge,
  firstAvailableAdvancePower,
  nonAdvancementMutationSnapshot,
  seedCanonicalAdvancementCharacter,
  importMinimalSavagedAdvancementHistory,
  seedEffectHookCharacter,
  seedActivePowerCharacter,
  seedPowersSetupCharacter,
  seedGearSetupCharacter,
};
