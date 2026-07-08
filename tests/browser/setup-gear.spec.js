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

async function addSetupWeaponFromPicker(page, weaponName) {
  const setupGearPanel = page.locator("#setupGearPanel");
  await openSetupPicker(page, "#setupWeaponPicker");
  await page.locator("#setupWeaponSearchInput").fill(weaponName);
  const row = setupGearPanel
    .locator("[data-setup-weapon-row]")
    .filter({ hasText: weaponName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Buy" }).click();
}

function visibleWeaponRows(page) {
  return page.locator("#setupWeaponPicker [data-setup-weapon-row]:visible");
}

function visibleGearRows(page) {
  return page.locator("#setupGearPicker [data-setup-gear-row]:visible");
}

function visibleArmorRows(page) {
  return page.locator("#setupArmorPicker [data-setup-armor-row]:visible");
}

function visibleVehicleRows(page) {
  return page.locator("#setupVehiclePicker [data-setup-vehicle-row]:visible");
}

function exactTextPattern(text) {
  return new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
}

async function openSetupPicker(page, selector) {
  const picker = page.locator(selector);
  await expect(picker).toBeVisible();
  const isOpen = await picker.evaluate((element) =>
    "open" in element ? element.open : true,
  );
  if (!isOpen) {
    await picker.locator(".setup-catalog-picker-title").click();
  }
}

function setupGearCardByName(page, itemName) {
  return page.locator(".setup-gear-line").filter({
    has: page.locator(".setup-gear-card-summary > strong", {
      hasText: exactTextPattern(itemName),
    }),
  });
}

async function visibleWeaponNames(page) {
  return visibleWeaponRows(page)
    .locator(".setup-catalog-picker-name strong")
    .allTextContents();
}

async function addSetupGearFromPicker(page, gearName) {
  const setupGearPanel = page.locator("#setupGearPanel");
  await openSetupPicker(page, "#setupGearPicker");
  await page.locator("#setupGearSearchInput").fill(gearName);
  const row = setupGearPanel
    .locator("[data-setup-gear-row]")
    .filter({ hasText: gearName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Buy" }).click();
}

async function addSetupArmorFromPicker(page, armorName) {
  const setupGearPanel = page.locator("#setupGearPanel");
  await openSetupPicker(page, "#setupArmorPicker");
  await page.locator("#setupArmorSearchInput").fill(armorName);
  const row = setupGearPanel
    .locator("[data-setup-armor-row]")
    .filter({ hasText: armorName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Buy" }).click();
}

async function addSetupVehicleFromPicker(page, vehicleName) {
  const setupGearPanel = page.locator("#setupGearPanel");
  await openSetupPicker(page, "#setupVehiclePicker");
  await page.locator("#setupVehicleSearchInput").fill(vehicleName);
  const row = setupGearPanel
    .locator("[data-setup-vehicle-row]")
    .filter({ hasText: vehicleName });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Buy" }).click();
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
      {
        id: "single-barrel-shotgun",
        catalogId: "ww-single-barrel-shotgun",
        name: "Single-Barrel Shotgun",
        damage: "1-3d6",
        range: "12/24/48",
        ap: "",
        rof: 1,
        shotsMax: 1,
        shotsLoaded: 1,
        ammoType: "shotgun-shells",
        weight: 6,
        costCents: 2500,
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
  await expect(setupGearPanel.locator(".setup-gear-column-header")).toHaveCount(
    0,
  );
  const bowieKnifeCard = setupGearPanel
    .locator(".setup-gear-line")
    .filter({ hasText: "Bowie Knife" });
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).toContainText("Bowie Knife");
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).not.toContainText("$4.00");
  await expect(
    bowieKnifeCard.locator(".setup-gear-card-summary"),
  ).not.toContainText("1 lb");
  await expect(bowieKnifeCard.locator("details")).toHaveCount(1);
  await expect(bowieKnifeCard).not.toContainText("Details");
  await expect(bowieKnifeCard.locator(".setup-gear-card-arrow")).toHaveCount(1);
  const gearSummary = bowieKnifeCard.locator(".setup-gear-card-summary");
  await expect(gearSummary).toHaveCSS("display", "grid");
  const arrowBox = await gearSummary
    .locator(".setup-gear-card-arrow")
    .boundingBox();
  const nameBox = await gearSummary.locator(":scope > strong").boundingBox();
  if (!arrowBox || !nameBox) {
    throw new Error("Expected compact gear card row to render item columns");
  }
  const rowCenters = [arrowBox, nameBox].map((box) => box.y + box.height / 2);
  expect(Math.max(...rowCenters) - Math.min(...rowCenters)).toBeLessThan(8);
  await bowieKnifeCard.locator("summary").click();
  await expect(bowieKnifeCard.locator(".setup-gear-detail-list")).toContainText(
    "Price $4.00",
  );
  await expect(bowieKnifeCard.locator(".setup-gear-detail-list")).toContainText(
    "Weight 1 lb",
  );
  await expect(bowieKnifeCard.locator(".setup-gear-detail-list")).toContainText(
    "Damage Str+d4",
  );
  const shotgunCard = setupGearPanel
    .locator(".setup-gear-line")
    .filter({ hasText: "Single-Barrel Shotgun" });
  await shotgunCard.locator("summary").click();
  await expect(shotgunCard.locator(".setup-gear-detail-list")).toContainText(
    "Ammo Shotgun shells (12-ga)",
  );
  await expect(
    setupGearPanel.locator(".setup-gear-workbench > .setup-recorded-gear"),
  ).toHaveCount(1);
  await expect(setupGearPanel.locator(".setup-purchase-card h5")).toHaveText([
    "Weapons",
    "Gear",
    "Armor",
    "Vehicles",
  ]);
  await expect(
    setupGearPanel.locator("#setupWeaponPurchaseSelect"),
  ).toHaveCount(0);
  await expect(page.locator("#setupWeaponSearchInput")).toBeVisible();
  await expect(page.locator("#setupWeaponCategoryFilter")).toBeVisible();
  await expect(page.locator("#setupWeaponPurchaseQty")).toHaveCount(0);
  const weaponPicker = setupGearPanel.locator("#setupWeaponPicker");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Name");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Type");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Damage");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Range");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("RoF / Shots");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Price");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Load");
  await expect(
    weaponPicker.locator(".setup-catalog-picker-header"),
  ).not.toContainText("Notes");
  const gearPicker = setupGearPanel.locator("#setupGearPicker");
  await expect(setupGearPanel.locator("#setupGearPurchaseSelect")).toHaveCount(
    0,
  );
  await expect(setupGearPanel.locator("#setupGearPurchaseQty")).toHaveCount(0);
  await expect(page.locator("#setupGearSearchInput")).toBeHidden();
  await openSetupPicker(page, "#setupGearPicker");
  await expect(page.locator("#setupGearSearchInput")).toBeVisible();
  await expect(page.locator("#setupGearCategoryFilter")).toBeVisible();
  await expect(
    gearPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Name");
  await expect(
    gearPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Type");
  await expect(
    gearPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Price");
  await expect(
    gearPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Load");
  const armorPicker = setupGearPanel.locator("#setupArmorPicker");
  await expect(setupGearPanel.locator("#setupArmorPurchaseSelect")).toHaveCount(
    0,
  );
  await expect(setupGearPanel.locator("#setupArmorPurchaseQty")).toHaveCount(0);
  await expect(page.locator("#setupArmorSearchInput")).toBeHidden();
  await openSetupPicker(page, "#setupArmorPicker");
  await expect(page.locator("#setupArmorSearchInput")).toBeVisible();
  await expect(page.locator("#setupArmorLocationFilter")).toBeVisible();
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Name");
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Armor");
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Location");
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Min Str");
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Price");
  await expect(
    armorPicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Load");
  const vehiclePicker = setupGearPanel.locator("#setupVehiclePicker");
  await expect(
    setupGearPanel.locator("#setupVehiclePurchaseSelect"),
  ).toHaveCount(0);
  await expect(setupGearPanel.locator("#setupVehiclePurchaseQty")).toHaveCount(
    0,
  );
  await expect(page.locator("#setupVehicleSearchInput")).toBeHidden();
  await openSetupPicker(page, "#setupVehiclePicker");
  await expect(page.locator("#setupVehicleSearchInput")).toBeVisible();
  await expect(page.locator("#setupVehicleCategoryFilter")).toBeVisible();
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Name");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Type");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Handling");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Speed");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Toughness");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Crew");
  await expect(
    vehiclePicker.locator(".setup-catalog-picker-header"),
  ).toContainText("Price");

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

test("Gear setup weapon picker searches filters and sorts catalog rows", async ({
  page,
}, testInfo) => {
  await seedGearSetupCharacter(page, {
    name: "Weapon Picker Sorter",
    preferredId: "weapon-picker-sorter",
    moneyCents: 25000,
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await page.locator("#setupWeaponSearchInput").fill("Peacemaker");
  await expect(
    visibleWeaponRows(page).filter({ hasText: "Colt Peacemaker (.45)" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-weapon-row]")
      .filter({ hasText: "Single-Barrel Shotgun" }),
  ).toBeHidden();

  await page.locator("#setupWeaponSearchInput").fill("");
  await page.locator("#setupWeaponCategoryFilter").selectOption("Shotguns");
  const singleBarrelShotgunRow = visibleWeaponRows(page).filter({
    hasText: "Single-Barrel Shotgun",
  });
  await expect(singleBarrelShotgunRow).toBeVisible();
  await expect(
    singleBarrelShotgunRow.locator(".setup-catalog-picker-damage"),
  ).toContainText("3d6/2d6/1d6");
  expect(
    Number(
      await singleBarrelShotgunRow.getAttribute("data-weapon-sort-damage"),
    ),
  ).toBeCloseTo(10.5, 5);
  await expect(
    setupGearPanel
      .locator("[data-setup-weapon-row]")
      .filter({ hasText: "Colt Peacemaker (.45)" }),
  ).toBeHidden();

  if (testInfo.project.name === "mobile") return;

  const weaponPicker = setupGearPanel.locator("#setupWeaponPicker");
  const headerBox = await weaponPicker
    .locator(".setup-catalog-picker-header")
    .boundingBox();
  const firstRowBox = await visibleWeaponRows(page).first().boundingBox();
  if (!headerBox || !firstRowBox) {
    throw new Error("Expected weapon picker header and rows to render");
  }
  expect(Math.abs(headerBox.x - firstRowBox.x)).toBeLessThan(1);
  expect(Math.abs(headerBox.width - firstRowBox.width)).toBeLessThan(1);

  await weaponPicker.getByRole("button", { name: "Name" }).click();
  expect((await visibleWeaponNames(page))[0]).toBe("Colt Revolving Shotgun");

  await weaponPicker.getByRole("button", { name: "Price" }).click();
  await expect(
    visibleWeaponRows(page).first().locator(".setup-catalog-picker-price"),
  ).toContainText("$25.00");

  await weaponPicker.getByRole("button", { name: "Load" }).click();
  await expect(
    visibleWeaponRows(page).first().locator(".setup-catalog-picker-load"),
  ).toContainText("4 lb");

  await weaponPicker.getByRole("button", { name: "Range" }).click();
  await expect(
    visibleWeaponRows(page).first().locator(".setup-catalog-picker-range"),
  ).toContainText("5/10/20");

  await page.locator("#setupWeaponCategoryFilter").selectOption("Rifles");
  await weaponPicker.getByRole("button", { name: "Damage" }).click();
  await expect(
    visibleWeaponRows(page).first().locator(".setup-catalog-picker-damage"),
  ).toContainText("2d8-1");

  const gearPicker = setupGearPanel.locator("#setupGearPicker");
  await openSetupPicker(page, "#setupGearPicker");
  await page.locator("#setupGearSearchInput").fill("Backpack");
  await expect(
    visibleGearRows(page).filter({ hasText: "Backpack" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-gear-row]")
      .filter({ hasText: "Bedroll" }),
  ).toBeHidden();

  await page.locator("#setupGearSearchInput").fill("");
  await page.locator("#setupGearCategoryFilter").selectOption("Transportation");
  await expect(
    visibleGearRows(page).filter({ hasText: "Horse" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-gear-row]")
      .filter({ hasText: "Backpack" }),
  ).toBeHidden();

  await page.locator("#setupGearCategoryFilter").selectOption("All");
  await gearPicker.getByRole("button", { name: "Name" }).click();
  await expect(
    visibleGearRows(page).first().locator(".setup-catalog-picker-name"),
  ).toContainText("Adrenal booster");

  await gearPicker.getByRole("button", { name: "Price" }).click();
  await expect(
    visibleGearRows(page).first().locator(".setup-catalog-picker-price"),
  ).toContainText("$0.05");

  await gearPicker.getByRole("button", { name: "Load" }).click();
  await expect(
    visibleGearRows(page).first().locator(".setup-catalog-picker-load"),
  ).toContainText("0 lb");
  const backpackRow = visibleGearRows(page).filter({ hasText: "Backpack" });
  await backpackRow.locator(".setup-catalog-picker-details summary").click();
  await expect(
    backpackRow.locator(".setup-catalog-picker-detail-list"),
  ).toContainText("General Equipment");

  const armorPicker = setupGearPanel.locator("#setupArmorPicker");
  await openSetupPicker(page, "#setupArmorPicker");
  await page.locator("#setupArmorSearchInput").fill("Armored duster");
  await expect(
    visibleArmorRows(page).filter({ hasText: "Armored duster (light)" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-armor-row]")
      .filter({ hasText: "Native Armor" }),
  ).toBeHidden();

  await page.locator("#setupArmorSearchInput").fill("");
  await page.locator("#setupArmorLocationFilter").selectOption("Head");
  await expect(
    visibleArmorRows(page).filter({ hasText: "Armored hat (light)" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-armor-row]")
      .filter({ hasText: "Armored vest/corset (light)" }),
  ).toBeHidden();

  await page.locator("#setupArmorLocationFilter").selectOption("All");
  await armorPicker.getByRole("button", { name: "Name" }).click();
  await expect(
    visibleArmorRows(page).first().locator(".setup-catalog-picker-name"),
  ).toContainText("Armored duster (heavy)");

  await armorPicker.getByRole("button", { name: "Price" }).click();
  await expect(
    visibleArmorRows(page).first().locator(".setup-catalog-picker-price"),
  ).toContainText("$2.00");

  await armorPicker.getByRole("button", { name: "Load" }).click();
  await expect(
    visibleArmorRows(page).first().locator(".setup-catalog-picker-load"),
  ).toContainText("2 lb");

  const vehiclePicker = setupGearPanel.locator("#setupVehiclePicker");
  await openSetupPicker(page, "#setupVehiclePicker");
  await page.locator("#setupVehicleSearchInput").fill("Bateaux");
  await expect(
    visibleVehicleRows(page).filter({ hasText: "Bateaux" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-vehicle-row]")
      .filter({ hasText: "Stagecoach" }),
  ).toBeHidden();

  await page.locator("#setupVehicleSearchInput").fill("");
  await page
    .locator("#setupVehicleCategoryFilter")
    .selectOption("Water Vehicles");
  await expect(
    visibleVehicleRows(page).filter({ hasText: "Bateaux" }),
  ).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-vehicle-row]")
      .filter({ hasText: "Buckboard/buggy" }),
  ).toBeHidden();

  await page.locator("#setupVehicleCategoryFilter").selectOption("All");
  await vehiclePicker.getByRole("button", { name: "Name" }).click();
  await expect(
    visibleVehicleRows(page).first().locator(".setup-catalog-picker-name"),
  ).toContainText("Air Carriage");

  await vehiclePicker.getByRole("button", { name: "Price" }).click();
  await expect(
    visibleVehicleRows(page).first().locator(".setup-catalog-picker-price"),
  ).toContainText("$50.00");

  await vehiclePicker.getByRole("button", { name: "Speed" }).click();
  await expect(
    visibleVehicleRows(page).first().locator(".setup-catalog-picker-speed"),
  ).toContainText("0");
  const bateauxRow = visibleVehicleRows(page).filter({ hasText: "Bateaux" });
  await bateauxRow.locator(".setup-catalog-picker-details summary").click();
  await expect(
    bateauxRow.locator(".setup-catalog-picker-detail-list"),
  ).toContainText("Flat-bottomed boat");
});

test("Gear setup weapon picker stacks into usable mobile cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await seedGearSetupCharacter(page, {
    name: "Mobile Weapon Picker",
    preferredId: "mobile-weapon-picker",
    moneyCents: 25000,
  });

  const picker = page.locator("#setupWeaponPicker");
  await page.locator("#setupWeaponSearchInput").fill("Single-Barrel");
  const row = picker
    .locator("[data-setup-weapon-row]")
    .filter({ hasText: "Single-Barrel Shotgun" });
  await expect(picker.locator(".setup-catalog-picker-header")).toBeHidden();
  await expect(row).toBeVisible();
  await expect(row.locator(".setup-catalog-picker-type")).toContainText(
    "Shotguns",
  );
  await expect(row.locator(".setup-catalog-picker-damage")).toContainText(
    "3d6/2d6/1d6",
  );
  await expect(row.locator(".setup-catalog-picker-range")).toContainText(
    "12/24/48",
  );
  await expect(row.locator(".setup-catalog-picker-price")).toContainText(
    "$25.00",
  );
  await expect(row.locator(".setup-catalog-picker-load")).toContainText("6 lb");
  await expect(row.getByRole("button", { name: "Buy" })).toBeVisible();
  const mobileColumnCount = await row
    .locator(".setup-catalog-picker-summary")
    .evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/)
          .length,
    );
  expect(mobileColumnCount).toBe(1);
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
  await addSetupGearFromPicker(page, "Backpack");
  await page.locator("#setupWeaponCategoryFilter").selectOption("Pistols");
  await page.locator("#setupWeaponSearchInput").fill("Peacemaker");
  const peacemakerRow = setupGearPanel
    .locator("[data-setup-weapon-row]")
    .filter({ hasText: "Colt Peacemaker (.45)" });
  await expect(peacemakerRow).toBeVisible();
  await expect(
    setupGearPanel
      .locator("[data-setup-weapon-row]")
      .filter({ hasText: "Single-Barrel Shotgun" }),
  ).toBeHidden();
  await peacemakerRow.getByRole("button", { name: "Buy" }).click();
  await expect(
    setupGearPanel.locator(".setup-audit-group[aria-label='Ammunition']"),
  ).toHaveCount(0);
  await expect(page.locator("#setupAmmoPurchaseSelect")).toHaveCount(0);
  await expect(page.locator("#setupAmmoPurchaseCaliber")).toHaveCount(0);
  await expect(page.locator("#setupAmmoPurchaseQty")).toHaveCount(0);
  const peacemakerInventoryCard = setupGearPanel
    .locator(".setup-gear-line")
    .filter({ hasText: "Colt Peacemaker (.45)" });
  await expect(peacemakerInventoryCard).toContainText("Ammo $0.06 each");
  await expect(
    peacemakerInventoryCard.getByRole("button", { name: "Put in Backpack" }),
  ).toBeVisible();
  await peacemakerInventoryCard
    .getByRole("button", { name: "Put in Backpack" })
    .click();
  await expect(
    setupGearPanel
      .locator(".setup-gear-line")
      .filter({ hasText: "Colt Peacemaker (.45)" })
      .first()
      .getByRole("button", { name: "Move to Body" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => {
      const weapon = character.weapons.find(
        (item) => item.catalogId === "ww-colt-peacemaker-45",
      );
      const backpack = character.inventory.find(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      );
      return {
        itemLocation: weapon?.itemLocation,
        containerId: weapon?.containerId,
        backpackId: backpack?.id,
      };
    }),
  ).toEqual(
    expect.objectContaining({
      itemLocation: "container",
    }),
  );
  expect(
    await page.evaluate(() => {
      const weapon = character.weapons.find(
        (item) => item.catalogId === "ww-colt-peacemaker-45",
      );
      const backpack = character.inventory.find(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      );
      return weapon?.containerId === backpack?.id;
    }),
  ).toBe(true);
  await setupGearPanel
    .locator(".setup-gear-line")
    .filter({ hasText: "Colt Peacemaker (.45)" })
    .first()
    .getByRole("button", { name: "Move to Body" })
    .click();
  expect(
    await page.evaluate(() => {
      const weapon = character.weapons.find(
        (item) => item.catalogId === "ww-colt-peacemaker-45",
      );
      return {
        itemLocation: weapon?.itemLocation,
        containerId: weapon?.containerId || "",
      };
    }),
  ).toEqual({ itemLocation: "carried", containerId: "" });
  const managementActions = peacemakerInventoryCard.locator(
    ".setup-gear-management-actions",
  );
  await expect(
    managementActions.getByRole("button", { name: "Put in Backpack" }),
  ).toBeVisible();
  await expect(
    managementActions.getByRole("button", { name: "Sell Back" }),
  ).toBeVisible();
  const backpackButtonBox = await managementActions
    .getByRole("button", { name: "Put in Backpack" })
    .boundingBox();
  const sellBackButtonBox = await managementActions
    .getByRole("button", { name: "Sell Back" })
    .boundingBox();
  if (!backpackButtonBox || !sellBackButtonBox) {
    throw new Error("Expected backpack and sell back buttons to render");
  }
  expect(backpackButtonBox.x).toBeLessThan(sellBackButtonBox.x);
  await peacemakerInventoryCard
    .getByRole("button", {
      name: "Increase ammo quantity for Colt Peacemaker (.45)",
    })
    .click();
  await expect(
    peacemakerInventoryCard.locator("[data-setup-ammo-total-for]"),
  ).toContainText("$0.12");
  await peacemakerInventoryCard
    .locator("[data-setup-ammo-weapon-id]")
    .fill("6");
  await expect(
    peacemakerInventoryCard.locator("[data-setup-ammo-total-for]"),
  ).toContainText("$0.36");
  await peacemakerInventoryCard
    .getByRole("button", { name: /Buy Pistol ammo \(\.45\)/ })
    .click();
  const ammunitionGroup = setupGearPanel.locator(
    ".setup-audit-group[aria-label='Ammunition']",
  );
  await expect(ammunitionGroup).toBeVisible();
  await expect(
    ammunitionGroup.locator(".setup-gear-card-summary > strong"),
  ).toHaveText(["Pistol ammo (.45)"]);
  await addSetupArmorFromPicker(page, "Native Armor");
  await addSetupVehicleFromPicker(page, "Bateaux");

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await expect(setupGearPanel).toContainText("Funds Remaining");
  await expect(setupGearPanel).toContainText("$180.64");
  await expect(setupGearPanel.locator(".setup-gear-groups")).not.toContainText(
    "Starting Gear Purchase",
  );
  await expect(setupGearPanel).toContainText("Bateaux");
  await expect(
    setupGearPanel
      .locator(".setup-gear-line")
      .filter({ hasText: "Colt Peacemaker (.45)" })
      .locator(".setup-gear-detail-list"),
  ).toContainText("Ammo Pistol ammo (.45)");

  const snapshot = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    backpack: character.inventory.find(
      (item) => item.catalogId === "backpack" || item.name === "Backpack",
    ),
    ammo: Object.values(character.ammo)[0],
    weapon: character.weapons.find(
      (weapon) => weapon.catalogId === "ww-colt-peacemaker-45",
    ),
    armor: character.armorInventory.find(
      (item) =>
        item.catalogId === "native-armor" || item.name === "Native Armor",
    ),
    vehicle: character.vehicles.find(
      (item) => item.catalogId === "bateaux" || item.name === "Bateaux",
    ),
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
      (item) =>
        item.catalogId === "native-armor" || item.name === "Native Armor",
    )?.creationSource,
    vehicleSource: character.vehicles.find(
      (item) => item.catalogId === "bateaux" || item.name === "Bateaux",
    )?.creationSource,
  }));
  expect(persisted).toEqual({
    moneyCents: 18064,
    armorSource: "setup-starting-gear",
    vehicleSource: "setup-starting-gear",
  });

  const sellBack = async (label, times = 1) => {
    for (let index = 0; index < times; index += 1) {
      const gearCard = setupGearCardByName(page, label);
      await expect(gearCard).toHaveCount(1);
      await gearCard.getByRole("button", { name: "Sell Back" }).click();
    }
    await expect(setupGearCardByName(page, label)).toHaveCount(0);
  };

  await sellBack("Bateaux");
  await sellBack("Colt Peacemaker (.45)");
  await sellBack("Native Armor");
  await sellBack("Pistol ammo (.45)", 6);
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

test("Gear setup repeated non-ammo purchases create separate entries", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Stacked Gear Seller",
    preferredId: "stacked-gear-seller",
    moneyCents: 25000,
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  await addSetupGearFromPicker(page, "Backpack");
  await addSetupGearFromPicker(page, "Backpack");
  await expect(setupGearPanel).toContainText("$246.00");

  const backpackCards = setupGearCardByName(page, "Backpack");
  await expect(backpackCards).toHaveCount(2);
  await backpackCards.first().locator("summary").click();
  await expect(
    backpackCards.first().locator(".setup-gear-detail-list"),
  ).toContainText("Price $2.00");
  await expect(
    backpackCards.first().locator(".setup-gear-detail-list"),
  ).toContainText("Weight 3 lb");
  expect(
    await page.evaluate(() => ({
      moneyCents: character.moneyCents,
      count: character.inventory.filter(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      ).length,
      counts: character.inventory
        .filter(
          (item) => item.catalogId === "backpack" || item.name === "Backpack",
        )
        .map((item) => item.count),
      sourceQuantities: character.inventory
        .filter(
          (item) => item.catalogId === "backpack" || item.name === "Backpack",
        )
        .map((item) => item.sourceDetail?.quantity),
      uniqueIds: new Set(
        character.inventory
          .filter(
            (item) => item.catalogId === "backpack" || item.name === "Backpack",
          )
          .map((item) => item.id),
      ).size,
    })),
  ).toEqual({
    moneyCents: 24600,
    count: 2,
    counts: [1, 1],
    sourceQuantities: [1, 1],
    uniqueIds: 2,
  });

  await backpackCards
    .first()
    .getByRole("button", { name: "Sell Back" })
    .click();
  await expect(setupGearPanel).toContainText("$248.00");
  await expect(setupGearCardByName(page, "Backpack")).toHaveCount(1);
  expect(
    await page.evaluate(() => ({
      moneyCents: character.moneyCents,
      count: character.inventory.filter(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      ).length,
      sourceQuantity: character.inventory.find(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      )?.sourceDetail?.quantity,
    })),
  ).toEqual({ moneyCents: 24800, count: 1, sourceQuantity: 1 });

  await setupGearCardByName(page, "Backpack")
    .getByRole("button", { name: "Sell Back" })
    .click();
  await expect(setupGearPanel).toContainText("$250.00");
  await expect(setupGearCardByName(page, "Backpack")).toHaveCount(0);
  expect(
    await page.evaluate(() => ({
      moneyCents: character.moneyCents,
      inventory: character.inventory.length,
    })),
  ).toEqual({ moneyCents: 25000, inventory: 0 });
});

test("Gear setup normalizes legacy non-ammo setup stacks into separate entries", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Legacy Stacked Gear",
    preferredId: "legacy-stacked-gear",
    moneyCents: 24600,
    inventory: [
      {
        id: "backpack",
        catalogId: "backpack",
        name: "Backpack",
        count: 2,
        weight: 3,
        costCents: 200,
        location: "carried",
        creationSource: "setup-starting-gear",
        sourceDetail: {
          kind: "starting-funds",
          purchaseType: "gear",
          catalogId: "backpack",
          costCents: 200,
          quantity: 2,
        },
      },
    ],
  });

  const backpackCards = setupGearCardByName(page, "Backpack");
  await expect(backpackCards).toHaveCount(2);
  await expect(backpackCards.first()).not.toContainText("Qty 2");
  expect(
    await page.evaluate(() => {
      const backpacks = character.inventory.filter(
        (item) => item.catalogId === "backpack" || item.name === "Backpack",
      );
      return {
        count: backpacks.length,
        counts: backpacks.map((item) => item.count),
        sourceQuantities: backpacks.map((item) => item.sourceDetail?.quantity),
        uniqueIds: new Set(backpacks.map((item) => item.id)).size,
      };
    }),
  ).toEqual({
    count: 2,
    counts: [1, 1],
    sourceQuantities: [1, 1],
    uniqueIds: 2,
  });
});

test("Gear setup reset confirms before clearing starting purchases", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Reset Gear Purchaser",
    preferredId: "reset-gear-purchaser",
    moneyCents: 25000,
  });

  const setupGearPanel = page.locator("#setupGearPanel");
  const resetButton = setupGearPanel.getByRole("button", {
    name: "Reset Gear",
  });
  await expect(resetButton).toBeDisabled();

  await addSetupGearFromPicker(page, "Backpack");
  await addSetupWeaponFromPicker(page, "Colt Peacemaker (.45)");
  await expect(resetButton).toBeEnabled();
  await expect(setupGearPanel).toContainText("$233.00");

  await resetButton.click();
  const dialog = page.locator("#appDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Reset setup gear?");
  await dialog.getByRole("button", { name: "Keep Gear" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    setupGearPanel
      .locator(".setup-gear-card-summary > strong")
      .filter({ hasText: /^Backpack$/ }),
  ).toHaveCount(1);
  await expect(
    setupGearPanel
      .locator(".setup-gear-line")
      .filter({ hasText: "Colt Peacemaker (.45)" }),
  ).toHaveCount(1);
  await expect(setupGearPanel).toContainText("$233.00");

  await resetButton.click();
  await dialog.getByRole("button", { name: "Reset Gear" }).click();
  await expect(dialog).toBeHidden();
  await expect(
    setupGearPanel
      .locator(".setup-gear-card-summary > strong")
      .filter({ hasText: /^Backpack$/ }),
  ).toHaveCount(0);
  await expect(
    setupGearPanel
      .locator(".setup-gear-line")
      .filter({ hasText: "Colt Peacemaker (.45)" }),
  ).toHaveCount(0);
  await expect(setupGearPanel).toContainText("$250.00");
  await expect(resetButton).toBeDisabled();

  const snapshot = await page.evaluate(() => ({
    moneyCents: character.moneyCents,
    inventory: character.inventory,
    weapons: character.weapons,
    ammo: character.ammo,
  }));
  expect(snapshot).toEqual({
    moneyCents: 25000,
    inventory: [],
    weapons: [],
    ammo: {},
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

  await addSetupWeaponFromPicker(page, "Colt Peacemaker (.45)");
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

test("Gear setup audit accepts generic clothing without price or weight", async ({
  page,
}) => {
  await seedGearSetupCharacter(page, {
    name: "Clothing Gear Audit",
    preferredId: "clothing-gear-audit",
    moneyCents: 25000,
    injectInvalidInventory: [
      {
        id: "clothing",
        name: "Clothing",
        count: 1,
        location: "carried",
      },
    ],
  });

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await expect(page.locator(".setup-step-navigation")).not.toContainText(
    "Gear needs review:",
  );
  await expect(page.locator(".setup-step-navigation")).not.toContainText(
    "Weight is unknown",
  );
  await expect(page.locator(".setup-step-navigation")).not.toContainText(
    "Cost is unknown",
  );
  await expect(page.locator("#setupGearPanel")).toContainText("Clothing");
  await expect(
    page.locator(".setup-gear-finalize", { hasText: "Gear: Clothing" }),
  ).toHaveCount(0);
  await expect(page.locator("#setupGearPanel")).not.toContainText(
    "Setup Source Audit",
  );
});
