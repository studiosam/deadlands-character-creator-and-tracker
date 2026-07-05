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
  await expect(setupGearPanel).toContainText("Funds Remaining");
  await expect(setupGearPanel).toContainText("$250.00");
  await expect(setupGearPanel).toContainText("Current Load");
  await expect(setupGearPanel).toContainText("Combat Load");
  await expect(setupGearPanel).not.toContainText("Gear Status");
  await expect(setupGearPanel).not.toContainText("Catalog matched");
  await expect(setupGearPanel).not.toContainText("Manual review");
  await expect(setupGearPanel).not.toContainText("On Body / Carried");
  await expect(setupGearPanel).not.toContainText("Stored / Off-person");
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
  await expect(setupGearPanel).toContainText("Current Inventory");
  await expect(
    setupGearPanel.locator(".setup-gear-column-header").first(),
  ).toContainText("Item");
  await expect(
    setupGearPanel.locator(".setup-gear-column-header").first(),
  ).toContainText("Price");
  await expect(
    setupGearPanel.locator(".setup-gear-column-header").first(),
  ).toContainText("Weight");
  const bowieKnifeCard = setupGearPanel
    .locator(".setup-gear-line")
    .filter({ hasText: "Bowie Knife" });
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).toContainText("Bowie Knife");
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).toContainText("$4.00");
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).toContainText("1 lb");
  await expect(bowieKnifeCard.locator("details")).toHaveCount(1);
  await expect(bowieKnifeCard).not.toContainText("Details");
  await expect(bowieKnifeCard.locator(".setup-gear-card-arrow")).toHaveCount(1);
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-cell .sr-only").first(),
  ).toHaveCSS("position", "absolute");
  const gearSummary = bowieKnifeCard.locator(".setup-gear-card-summary");
  await expect(gearSummary).toHaveCSS("display", "grid");
  const arrowBox = await gearSummary
    .locator(".setup-gear-card-arrow")
    .boundingBox();
  const nameBox = await gearSummary.locator(":scope > strong").boundingBox();
  const priceBox = await gearSummary
    .locator(".setup-gear-card-cell")
    .first()
    .boundingBox();
  const weightBox = await gearSummary
    .locator(".setup-gear-card-cell")
    .nth(1)
    .boundingBox();
  if (!arrowBox || !nameBox || !priceBox || !weightBox) {
    throw new Error("Expected compact gear card row to render all columns");
  }
  const rowCenters = [arrowBox, nameBox, priceBox, weightBox].map(
    (box) => box.y + box.height / 2,
  );
  expect(Math.max(...rowCenters) - Math.min(...rowCenters)).toBeLessThan(8);
  await bowieKnifeCard.locator("summary").click();
  await expect(bowieKnifeCard.locator(".setup-gear-detail-list")).toContainText(
    "Damage Str+d4",
  );
  await expect(
    setupGearPanel.locator(".setup-gear-workbench > .setup-recorded-gear"),
  ).toHaveCount(1);
  await expect(setupGearPanel.locator(".setup-purchase-card h5")).toHaveText([
    "Weapons",
    "Ammunition",
    "Gear",
    "Vehicles",
  ]);

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
    .locator("#setupWeaponPurchaseSelect")
    .selectOption("ww-colt-peacemaker-45");
  await setupGearPanel.getByRole("button", { name: "Buy Weapon" }).click();
  const ammoOptionTexts = await page
    .locator("#setupAmmoPurchaseSelect option")
    .evaluateAll((options) =>
      options.map((option) => option.textContent?.trim() || ""),
    );
  const purchasableAmmoOptions = ammoOptionTexts.filter(
    (text) => text && !text.startsWith("Choose"),
  );
  expect(purchasableAmmoOptions[0]).toContain(
    "Pistol Ammunition (Large, .40-.50 caliber)",
  );
  expect(purchasableAmmoOptions[0]).toContain("for Colt Peacemaker (.45)");
  expect(
    purchasableAmmoOptions.some((text) => text.includes("no matching weapon")),
  ).toBe(true);
  await expect(page.locator("#setupAmmoPurchaseCaliber")).toHaveValue(".45");
  await page
    .locator("#setupAmmoPurchaseSelect")
    .selectOption("pistol-ammunition-large-40-50-caliber");
  await page.locator("#setupAmmoPurchaseQty").fill("6");
  await setupGearPanel.getByRole("button", { name: "Buy Ammunition" }).click();
  await page.locator("#setupArmorPurchaseSelect").selectOption("native-armor");
  await setupGearPanel.getByRole("button", { name: "Buy Armor" }).click();
  await page.locator("#setupVehiclePurchaseSelect").selectOption("bateaux");
  await setupGearPanel.getByRole("button", { name: "Buy Vehicle" }).click();

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await expect(setupGearPanel).toContainText("Funds Remaining");
  await expect(setupGearPanel).toContainText("$180.64");
  await expect(setupGearPanel).not.toContainText("Starting Gear Purchase");
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
  await openCharacterSetupReview(page);
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

  const sellBack = async (label) => {
    const gearCard = page
      .locator(".setup-gear-line")
      .filter({ hasText: label });
    await expect(gearCard).toHaveCount(1);
    await gearCard.getByRole("button", { name: "Sell Back" }).click();
    await expect(
      page.locator(".setup-gear-line").filter({ hasText: label }),
    ).toHaveCount(0);
  };

  await sellBack("Bateaux");
  await sellBack("Colt Peacemaker (.45)");
  await sellBack("Native Armor");
  await sellBack("Pistol ammo (.45)");
  await sellBack("Backpack");

  await expect(setupGearPanel).toContainText("Funds Remaining");
  await expect(setupGearPanel).toContainText("$250.00");
  const afterSellBack = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    inventory: character.inventory.length,
    ammo: Object.keys(character.ammo || {}).length,
    weapons: character.weapons.length,
    armor: character.armorInventory.length,
    vehicles: character.vehicles.length,
  }));
  expect(afterSellBack).toEqual({
    moneyCents: 25000,
    inventory: 0,
    ammo: 0,
    weapons: 0,
    armor: 0,
    vehicles: 0,
  });
});

test("Gear setup repairs mojibake weapon fallback values", async ({ page }) => {
  await seedGearSetupCharacter(page, {
    name: "Mojibake Gear Audit",
    preferredId: "mojibake-gear-audit",
    weapons: [
      {
        id: "brass-knuckles",
        name: "Brass Knuckles",
        damage: "Str+d4",
        range: "\u00e2\u20ac\u201d",
        ap: "\u00e2\u20ac\u201d",
        rof: "\u00e2\u20ac\u201d",
        weight: 1,
        costCents: 100,
        itemLocation: "carried",
        creationSource: "setup-starting-gear",
      },
    ],
  });

  const brassKnucklesCard = page
    .locator(".setup-gear-line")
    .filter({ hasText: "Brass Knuckles" });
  await expect(brassKnucklesCard).toContainText("Range —");
  await expect(brassKnucklesCard).not.toContainText("\u00e2");
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
  await expect(page.locator(".setup-step-navigation")).toContainText(
    "Gear needs review:",
  );
  await expect(page.locator(".setup-step-navigation")).toContainText(
    "Missing item name",
  );
  await expect(page.locator(".setup-step-navigation")).toContainText(
    "Unknown or missing location",
  );
  await expect(page.locator(".setup-step-navigation")).toContainText(
    "Suspicious count value",
  );
  await expect(page.locator(".setup-step-navigation")).toContainText(
    "Weight is unknown",
  );

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
