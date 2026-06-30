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

test("Guts Grit and True Grit render a concise Fear check reminder", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Fear Reminder Chain Tester",
    preferredId: "fear-reminder-chain-tester",
    edgeIds: ["dl-edge-guts", "dl-edge-grit", "dl-edge-true-grit"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("True Grit");
  await expect(derived).toContainText(
    "Fear check reminder: True Grit Edge present",
  );
  await expect(derived).not.toContainText(
    "Fear check reminder: Guts Edge present",
  );
  await expect(derived).not.toContainText(
    "Fear check reminder: Grit Edge present",
  );

  await openCombat(page);
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "True Grit: Fear check reminder: True Grit Edge present",
  );

  expect(
    await page.evaluate(() => ({
      state: characterFearCheckEdgeState(character),
      summaries: effectHookSummariesForSurface(character, "character")
        .filter((effect) => effect.target === "fear-check-edge-chain")
        .map((effect) => ({
          sourceName: effect.sourceName,
          target: effect.target,
          type: effect.type,
          value: effect.value,
          status: effect.status,
          displayLabel: effect.displayLabel,
        })),
    })),
  ).toEqual({
    state: {
      hasGuts: true,
      hasGrit: true,
      hasTrueGrit: true,
      reviewNotes: [],
    },
    summaries: [
      {
        sourceName: "True Grit",
        target: "fear-check-edge-chain",
        type: "reminder",
        value: 3,
        status: undefined,
        displayLabel: "Fear check reminder: True Grit Edge present",
      },
    ],
  });
});

test("Fear check Edge chain flags suspicious prerequisite data", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Fear Chain Audit Tester",
    preferredId: "fear-chain-audit-tester",
    edgeIds: ["dl-edge-grit"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  let derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Fear check reminder: Grit Edge present");
  await expect(derived).toContainText(
    "Manual review: Grit recorded without Guts",
  );
  expect(
    await page.evaluate(() => ({
      state: characterFearCheckEdgeState(character),
      auditNotes: effectHookSummariesForSurface(character, "character")
        .filter((effect) => effect.status === "manual-review")
        .map((effect) => effect.displayLabel),
      combatAuditNotes: effectHookSummariesForSurface(character, "combat")
        .filter((effect) => effect.status === "manual-review")
        .map((effect) => effect.displayLabel),
    })),
  ).toEqual({
    state: {
      hasGuts: false,
      hasGrit: true,
      hasTrueGrit: false,
      reviewNotes: [
        {
          id: "fear-edge-grit-without-guts",
          displayLabel: "Manual review: Grit recorded without Guts",
        },
      ],
    },
    auditNotes: ["Manual review: Grit recorded without Guts"],
    combatAuditNotes: [],
  });
});

test("Fear check Edge chain flags True Grit without Grit", async ({ page }) => {
  await seedEffectHookCharacter(page, {
    name: "True Grit Audit Tester",
    preferredId: "true-grit-audit-tester",
    edgeIds: ["dl-edge-true-grit"],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText(
    "Fear check reminder: True Grit Edge present",
  );
  await expect(derived).toContainText(
    "Manual review: True Grit recorded without Grit",
  );

  expect(
    await page.evaluate(() => characterFearCheckEdgeState(character)),
  ).toEqual({
    hasGuts: false,
    hasGrit: false,
    hasTrueGrit: true,
    reviewNotes: [
      {
        id: "fear-edge-true-grit-without-grit",
        displayLabel: "Manual review: True Grit recorded without Grit",
      },
    ],
  });
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

test("Power Point recovery defaults to five per hour without recharge Edges", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Default Power Point Recovery Tester",
    preferredId: "default-power-point-recovery-tester",
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 5,
        max: 15,
        source: "Effect hook test",
      },
    ],
  });

  await openCombat(page);
  const powerPoints = page.locator("#playPowerPointsList");
  await expect(powerPoints).toContainText("5 / 15");
  await expect(powerPoints).toContainText("Recovery: 5 / hour");
  await powerPoints.getByRole("button", { name: "Recover 1 hour +5" }).click();
  await expect(powerPoints).toContainText("10 / 15");

  expect(
    await page.evaluate(() => characterPowerPointRecoveryPerHour(character)),
  ).toBe(5);
});

test("Rapid Recharge effects set hourly Power Point recovery controls", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Rapid Recharge Recovery Tester",
    preferredId: "rapid-recharge-recovery-tester",
    edgeIds: [
      "swade-edge-rapid-recharge",
      "swade-edge-improved-rapid-recharge",
    ],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 0,
        max: 20,
        source: "Effect hook test",
      },
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Improved Rapid Recharge");
  await expect(derived).toContainText("Power Points recover 20 per hour");
  await expect(derived).not.toContainText("Power Points recover 10 per hour");

  await openCombat(page);
  const powerPoints = page.locator("#playPowerPointsList");
  await expect(powerPoints).toContainText("0 / 20");
  await expect(powerPoints).toContainText("Recovery: 20 / hour");
  await powerPoints.getByRole("button", { name: "Recover 1 hour +20" }).click();
  await expect(powerPoints).toContainText("20 / 20");
  await expect(
    powerPoints.getByRole("button", { name: "Recover 1 hour +20" }),
  ).toBeDisabled();

  expect(
    await page.evaluate(() => ({
      current: powerPointResource().current,
      recovery: characterPowerPointRecoveryPerHour(character),
      summaries: effectHookSummariesForSurface(character, "character")
        .filter((effect) => effect.target === "power-points-per-hour")
        .map((effect) => ({
          sourceName: effect.sourceName,
          type: effect.type,
          value: effect.value,
          displayLabel: effect.displayLabel,
        })),
    })),
  ).toEqual({
    current: 20,
    recovery: 20,
    summaries: [
      {
        sourceName: "Improved Rapid Recharge",
        type: "resource-recovery-rate",
        value: 20,
        displayLabel: "Power Points recover 20 per hour",
      },
    ],
  });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#playPowerPointsList")).toContainText("20 / 20");
  await expect(page.locator("#playPowerPointsList")).toContainText(
    "Recovery: 20 / hour",
  );
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
