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
    "Current Load",
  );
  await expect(page.locator("#encumbranceDetails")).toContainText(
    "Combat Load",
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
  await expect(details).toContainText("Current Load");
  await expect(details).toContainText("Combat Load");
  await expect(details).toContainText("Carrying Capacity");
  await expect(details).toContainText("Maximum Normal Carry");
  await expect(details).not.toContainText("Owned Gear");
  await expect(details.locator(".encumbrance-load-card")).toContainText([
    /Current Load[\s\S]*Encumbered/,
    /Combat Load[\s\S]*Unencumbered/,
  ]);
  await expect(details).not.toContainText(after.misleadingCurrentLoad);
});

test("buys matching reserve ammo from the weapon inventory card", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Weapon Ammo Buyer",
    preferredId: "weapon-ammo-buyer",
    weapons: [
      {
        id: "test-peacemaker",
        catalogId: "colt-peacemaker",
        name: "Colt Peacemaker",
        damage: "2d6+1",
        range: "12/24/48",
        ap: 1,
        rof: 1,
        shotsMax: 6,
        shotsLoaded: 0,
        ammoType: "pistol-45-ammo",
        minStr: "d6",
        weight: 3,
        itemLocation: "carried",
      },
    ],
    ammo: {},
  });
  const unitCost = await page.evaluate(() => {
    const catalogItem = catalogAmmoForKey("pistol-45-ammo", {
      kind: "pistol",
      caliber: ".45",
    });
    character.moneyCents = Math.max(0, Number(catalogItem.costCents) || 0) * 6;
    render();
    save();
    return Math.max(0, Number(catalogItem.costCents) || 0);
  });

  await openInventory(page);
  const row = weaponRow(page, "Colt Peacemaker");
  await expect(row.locator(".weapon-ammo-purchase")).toContainText(
    "Buy Pistol ammo (.45)",
  );
  await row.locator(".weapon-ammo-buy-qty").fill("6");
  await row.getByRole("button", { name: "Buy Ammo" }).click();

  await expect(row).toContainText("Pistol ammo (.45) reserve: 6");
  await expect(
    page.getByRole("heading", { name: "Ammo Reserves" }),
  ).toHaveCount(0);
  await expect(page.locator("#inventoryList")).not.toContainText(
    "Pistol ammo (.45)",
  );
  const purchased = await page.evaluate(() => ({
    ammoCount: character.ammo["pistol-45-ammo"]?.count || 0,
    moneyCents: character.moneyCents,
  }));
  expect(purchased.ammoCount).toBe(6);
  expect(purchased.moneyCents).toBe(0);
  expect(unitCost).toBeGreaterThan(0);
});

test("shows unmatched carried ammo as gear instead of a separate reserve panel", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Unmatched Ammo Carrier",
    preferredId: "unmatched-ammo-carrier",
    weapons: [],
    ammo: {
      "shotgun-shells": {
        label: "Shotgun Shells",
        count: 8,
        weight: 0.1,
        itemLocation: "carried",
      },
    },
  });

  await openInventory(page);
  await expect(
    page.getByRole("heading", { name: "Ammo Reserves" }),
  ).toHaveCount(0);
  const ammoRow = page.locator("#inventoryList .inventory-row", {
    has: page.getByText("Shotgun Shells", { exact: true }),
  });
  await expect(ammoRow).toContainText("Qty 8");
  await expect(ammoRow).toContainText("On Body");
});

test("catalog expendables are tracked as consumables instead of gear", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Catalog Consumable Buyer",
    preferredId: "catalog-consumable-buyer",
  });
  await openInventory(page);

  await addCustomGear(page, { catalogId: "cigar", quantity: "3" });
  await addCustomGear(page, { catalogId: "matches-box-100", quantity: "1" });

  await expect(page.locator("#consumablesList")).toContainText("Cigars");
  await expect(page.locator("#consumablesList")).toContainText("3 cigars");
  await expect(page.locator("#consumablesList")).toContainText("Matches");
  await expect(page.locator("#consumablesList")).toContainText("100 matches");
  await expect(page.locator("#inventoryList")).not.toContainText("Cigar");
  await expect(page.locator("#inventoryList")).not.toContainText(
    "Matches (box of 100)",
  );

  const snapshot = await page.evaluate(() => ({
    cigars: character.consumables.find((item) => item.id === "cigars"),
    matches: character.consumables.find((item) => item.id === "matches"),
    inventoryNames: character.inventory.map((item) => item.name),
  }));
  expect(snapshot.cigars).toEqual(
    expect.objectContaining({ count: 3, unit: "cigars" }),
  );
  expect(snapshot.matches).toEqual(
    expect.objectContaining({ count: 100, unit: "matches" }),
  );
  expect(snapshot.inventoryNames).not.toContain("Cigar");
  expect(snapshot.inventoryNames).not.toContain("Matches (box of 100)");
});

test("Savaged.us gear import classifies expendables as consumables", async ({
  page,
}) => {
  await enterTracker(page);
  const snapshot = await page.evaluate(() => {
    const imported = fromSavagedUs({
      name: "Imported Consumables",
      attributes: [{ name: "strength", value: "d6" }],
      gear: [
        { name: "Cigar", quantity: 3, weight: 0, cost: 0.05 },
        { name: "Matches (box of 100)", quantity: 1, weight: 0.25, cost: 0.5 },
        { name: "Coffee (per lb.)", quantity: 2, weight: 2, cost: 0.5 },
        { name: "Backpack", quantity: 1, weight: 3, cost: 2 },
      ],
    });
    return {
      consumables: imported.consumables.map((item) => ({
        name: item.name,
        count: item.count,
        unit: item.unit,
      })),
      inventoryNames: imported.inventory.map((item) => item.name),
    };
  });

  expect(snapshot.consumables).toEqual(
    expect.arrayContaining([
      { name: "Cigars", count: 3, unit: "cigars" },
      { name: "Matches", count: 100, unit: "matches" },
      { name: "Coffee", count: 2, unit: "lb." },
    ]),
  );
  expect(snapshot.inventoryNames).toContain("Backpack");
  expect(snapshot.inventoryNames).not.toContain("Cigar");
  expect(snapshot.inventoryNames).not.toContain("Matches (box of 100)");
});

test("encumbrance meter layers show progress toward the next overload tier", async ({
  page,
}) => {
  await enterTracker(page);
  await openInventory(page);

  const readCurrentLoadMeter = async (loadMultiplier) =>
    page.evaluate((multiplier) => {
      const capacity = calculateEncumbrance(character).carryingCapacity;
      character.weapons = [];
      character.armorInventory = [];
      character.ammo = {};
      character.consumables = [];
      character.inventory = [
        {
          id: "tiered-load-test",
          name: "Tiered Load Test",
          count: 1,
          weight: capacity * multiplier,
          location: "carried",
        },
      ];
      render();
      const card = document.querySelector(
        "#encumbranceDetails .encumbrance-load-card",
      );
      const meter = card.querySelector(".encumbrance-meter");
      return {
        className: meter.className,
        safe: parseFloat(
          meter.querySelector(".encumbrance-meter-layer.safe").style.width,
        ),
        caution: parseFloat(
          meter.querySelector(".encumbrance-meter-layer.caution").style.width,
        ),
        danger: parseFloat(
          meter.querySelector(".encumbrance-meter-layer.danger").style.width,
        ),
      };
    }, loadMultiplier);

  const encumbered = await readCurrentLoadMeter(1.5);
  expect(encumbered.className).toContain("encumbered");
  expect(encumbered.safe).toBeCloseTo(100, 2);
  expect(encumbered.caution).toBeCloseTo(25, 2);
  expect(encumbered.danger).toBeCloseTo(0, 2);

  const heavy = await readCurrentLoadMeter(3.5);
  expect(heavy.className).toContain("heavy");
  expect(heavy.safe).toBeCloseTo(100, 2);
  expect(heavy.caution).toBeCloseTo(100, 2);
  expect(heavy.danger).toBeCloseTo(50, 2);
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
  await expect(gearRow(page, "Pick")).toHaveCount(0);
  await expect(page.locator("#storageLocationList")).toContainText(
    "12 lb stored here",
  );
  await expect(page.locator("#storageLocationList")).toContainText("Pick");

  const stored = await page.evaluate(() => ({
    normalLoad: calculateEncumbrance(character).normalLoad,
    combatLoad: calculateEncumbrance(character, { combat: true }).combatLoad,
    storedLoad: calculateEncumbrance(character).inventoryTotals.storedLoad,
  }));
  expect(stored.normalLoad).toBeCloseTo(before.normalLoad, 5);
  expect(stored.combatLoad).toBeCloseTo(before.combatLoad, 5);
  expect(stored.storedLoad - before.storedLoad).toBeCloseTo(12, 5);

  await page
    .locator("#storageLocationList .inventory-row", {
      has: page.getByText("Pick", { exact: true }),
    })
    .locator("select")
    .selectOption("carried");
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
