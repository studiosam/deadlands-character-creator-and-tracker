const {
  test,
  expect,
  useAppTestHooks,
  STORAGE_KEY,
  CHARACTER_LIBRARY_KEY,
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
} = require("./helpers");

useAppTestHooks();

test("Powers setup audit reports missing requirements for an Arcane Background", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Powers",
    preferredId: "missing-blessed-powers",
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  const setupNavigation = page.locator(".setup-step-navigation");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  await expect(setupPowersPanel).not.toContainText("Powers incomplete:");
  await expect(setupNavigation).toContainText("Powers incomplete:");
  await expect(
    setupNavigation.getByRole("button", { name: "Next: Gear" }),
  ).toBeDisabled();
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Faith d4+ linked to Spirit");
  await expect(setupNavigation).toContainText("Missing Faith d4+ for Blessed");
  await expect(setupPowersPanel).not.toContainText("Audit Details");
  await expect(setupPowersPanel).toContainText("15 Power Points");
  await expect(setupPowersPanel).toContainText("15 / 15");
  await expect(setupPowersPanel).not.toContainText("Power Points mismatch");
  await expect(setupNavigation).not.toContainText(
    "Expected 15 Power Points; none recorded.",
  );
  await expect(setupPowersPanel).toContainText("Starting Powers");
  await expect(setupNavigation).toContainText(
    "Expected 3 starting powers; 1 recorded.",
  );
  await expect(setupNavigation).not.toContainText(
    "Holy Symbol is required for Blessed and is missing.",
  );
  await expect(
    setupPowersPanel.locator(".setup-required-powers"),
  ).toContainText("Holy Symbol");
  await expect(
    setupPowersPanel.locator(".setup-selected-powers"),
  ).not.toContainText("Holy Symbol");

  const mutationSnapshot = await page.evaluate(() => ({
    powers: character.powers.length,
    powerCatalogIds: character.powers.map((power) => power.catalogId),
    powerPoints: powerPointResource(),
  }));
  expect(mutationSnapshot.powers).toBe(1);
  expect(mutationSnapshot.powerCatalogIds).toEqual(["power-holy-symbol"]);
  expect(mutationSnapshot.powerPoints).toEqual(
    expect.objectContaining({
      current: 15,
      max: 15,
      creationSource: "setup-arcane-background",
    }),
  );
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
        current: 20,
        max: 20,
        source: "Arcane Background (Blessed) plus extra Power Points",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(
    page
      .locator(".setup-step-navigation")
      .getByRole("button", { name: "Next: Gear" }),
  ).toBeEnabled();
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Faith d4+ linked to Spirit");
  await expect(setupPowersPanel).toContainText("20 / 20");
  await expect(setupPowersPanel).toContainText("3 / 3");
  await expect(
    setupPowersPanel.locator(".setup-required-powers"),
  ).toContainText("Holy Symbol");
  await expect(
    setupPowersPanel.locator(".setup-selected-powers"),
  ).toContainText("Barrier");
  await expect(
    setupPowersPanel.locator(".setup-selected-powers"),
  ).toContainText("Protection");
  await expect(
    setupPowersPanel.locator(".setup-selected-powers"),
  ).not.toContainText("Holy Symbol");
  await expect(
    setupPowersPanel.getByRole("button", { name: "Add Starting Power" }),
  ).toBeDisabled();
});

test("Powers setup auto-creates and persists setup starting Power Points", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Power Points",
    preferredId: "missing-blessed-power-points",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  const setupNavigation = page.locator(".setup-step-navigation");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).not.toContainText(
    "Expected 15 Power Points; none recorded.",
  );
  await expect(
    setupNavigation.getByRole("button", { name: "Next: Gear" }),
  ).toBeEnabled();
  await expect(
    setupPowersPanel.getByRole("button", { name: "Add Starting Power Points" }),
  ).toHaveCount(0);

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
  await openCharacterSetupReview(page);
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
    "Expected at least 15 Power Points; recorded max is 12.",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected at least 15 current Power Points; recorded current is 10.",
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
  await expect(
    setupPowersPanel.locator(".setup-required-powers"),
  ).toContainText("Holy Symbol");
  await expect(
    setupPowersPanel.locator(".setup-selected-powers"),
  ).not.toContainText("Holy Symbol");
  await expect(
    setupPowersPanel.getByRole("button", { name: "Add Holy Symbol" }),
  ).toHaveCount(0);
  await expect(
    setupPowersPanel
      .locator(".setup-power-card")
      .filter({ hasText: "Holy Symbol" })
      .getByRole("button", { name: "Remove" }),
  ).toHaveCount(0);
  await page.locator("#setupStartingPowerSelect").selectOption("power-barrier");
  await expect(page.locator("#setupStartingPowerPreview")).toContainText(
    "Barrier",
  );
  await expect(page.locator("#setupStartingPowerPreview")).toContainText(
    "Creates a short Hardness 10 wall or barrier.",
  );
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
  await expect(setupPowersPanel).toContainText("3 / 3");

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
  await openCharacterSetupReview(page);
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
