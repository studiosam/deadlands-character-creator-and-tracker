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

test("Combat Declaration builds GM-facing text with state reminders and persists", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Declaration Reminder Tester",
    preferredId: "declaration-reminder-tester",
    conditions: {
      shaken: true,
      entangled: true,
    },
    weapons: [
      {
        id: "test-revolver",
        name: "Test Revolver",
        damage: "2d6",
        range: "12/24/48",
        ap: 0,
        rof: 1,
        shotsMax: 6,
        shotsLoaded: 0,
        ammoType: "test-ammo",
        minStr: "d4",
        weight: 2,
        itemLocation: "carried",
      },
    ],
  });
  await page.evaluate(() => {
    character.weapons.find(
      (weapon) => weapon.id === "test-revolver",
    ).shotsLoaded = 0;
    render();
    save();
  });

  await openCombat(page);
  const panel = page.locator("#combatDeclarationCard");
  await expect(panel).toContainText("Combat Declaration");
  await expect(page.locator("#combatDeclarationActionHints")).toContainText(
    "Attack: reload or switch first",
  );

  await page.locator("#combatDeclarationActionInput").selectOption("attack");
  await page.locator("#combatDeclarationCountInput").selectOption("2");
  await page
    .locator("#combatDeclarationWeaponInput")
    .selectOption("test-revolver");
  await page.locator("#combatDeclarationTargetInput").fill("Outlaw");
  await page.locator("#combatDeclarationDetailsInput").fill("called shot arm");

  await expect(page.locator("#combatDeclarationStatusPill")).toHaveText(
    "Review",
  );
  await expect(page.locator("#combatDeclarationReminders")).toContainText(
    "Shaken",
  );
  await expect(page.locator("#combatDeclarationReminders")).toContainText(
    "Entangled",
  );
  await expect(page.locator("#combatDeclarationReminders")).toContainText(
    "Test Revolver is unloaded",
  );
  await expect(page.locator("#combatDeclarationPreview")).toContainText(
    "I declare 2 actions: attack with Test Revolver at Outlaw (called shot arm).",
  );
  await expect(page.locator("#combatDeclarationPreview")).toContainText(
    "MAP reminder: 2 declared actions usually means -2",
  );

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#combatDeclarationActionInput")).toHaveValue(
    "attack",
  );
  await expect(page.locator("#combatDeclarationCountInput")).toHaveValue("2");
  await expect(page.locator("#combatDeclarationWeaponInput")).toHaveValue(
    "test-revolver",
  );
  await expect(page.locator("#combatDeclarationTargetInput")).toHaveValue(
    "Outlaw",
  );
  await expect(page.locator("#combatDeclarationDetailsInput")).toHaveValue(
    "called shot arm",
  );
  await expect(page.locator("#combatDeclarationPreview")).toContainText(
    "I declare 2 actions: attack with Test Revolver at Outlaw (called shot arm).",
  );
});

test("Combat Declaration applies and logs GM-adjudicated results", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Declaration Result Tester",
    preferredId: "declaration-result-tester",
    weapons: [
      {
        id: "test-revolver",
        name: "Test Revolver",
        damage: "2d6",
        range: "12/24/48",
        ap: 0,
        rof: 1,
        shotsMax: 6,
        shotsLoaded: 3,
        ammoType: "test-ammo",
        minStr: "d4",
        weight: 2,
        itemLocation: "carried",
      },
    ],
  });

  await openCombat(page);
  await page.locator("#combatDeclarationActionInput").selectOption("attack");
  await page
    .locator("#combatDeclarationWeaponInput")
    .selectOption("test-revolver");
  await page
    .locator("#combatDeclarationResultInput")
    .fill("GM ruled the shot lands and Dusty is Shaken by return fire.");
  await page.locator("#combatDeclarationWoundsInput").fill("1");
  await page.locator("#combatDeclarationBenniesInput").fill("-1");
  await page.locator("#combatDeclarationConditionInput").selectOption("shaken");
  await page.locator("#combatDeclarationAmmoInput").fill("1");
  await page.locator("#applyCombatDeclarationResultBtn").click();

  await expect(page.locator("#woundsValue")).toHaveText("1");
  await expect(page.locator("#benniesValue")).toHaveText("1");
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "GM ruled the shot lands",
  );
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "Wounds 0 -> 1",
  );
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "Bennies 2 -> 1",
  );
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "Shaken set",
  );
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "Test Revolver ammo 3 -> 2",
  );
  await expect(page.locator("#combatDeclarationResultInput")).toHaveValue("");
  await expect(page.locator("#combatDeclarationWoundsInput")).toHaveValue("0");

  const state = await page.evaluate(() => ({
    wounds: character.damage.wounds,
    bennies: character.bennies.current,
    shaken: character.conditions.shaken,
    shotsLoaded: character.weapons.find(
      (weapon) => weapon.id === "test-revolver",
    )?.shotsLoaded,
    logCount: character.combatDeclaration.resultLog.length,
  }));
  expect(state).toEqual({
    wounds: 1,
    bennies: 1,
    shaken: true,
    shotsLoaded: 2,
    logCount: 1,
  });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#combatDeclarationResultLog")).toContainText(
    "GM ruled the shot lands",
  );
  await expect(page.locator("#woundsValue")).toHaveText("1");
});
