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
