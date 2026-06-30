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

test("global undo and redo restore character snapshots across reload", async ({
  page,
}) => {
  await enterTracker(page);
  await saveCurrentCharacter(page);
  await openCombat(page);
  await expectWounds(page, 0);

  await openHeaderMenu(page);
  await expect(page.locator("#undoBtn")).toBeDisabled();
  await page.locator("#headerToolsMenu").evaluate((menu) => {
    menu.open = false;
  });
  await increaseWounds(page);
  await expectWounds(page, 1);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 1, redo: 0 });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expectWounds(page, 1);
  await openHeaderMenu(page);
  await page.locator("#undoBtn").click();
  await expectWounds(page, 0);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 0, redo: 1 });

  await openHeaderMenu(page);
  await page.locator("#redoBtn").click();
  await expectWounds(page, 1);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 1, redo: 0 });
});
