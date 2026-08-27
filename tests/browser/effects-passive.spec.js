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

test("Elderly modifiers display on dossier attributes without linked skills", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Elderly Dossier Tester",
    preferredId: "elderly-dossier-tester",
    hindranceIds: ["swade-hindrance-elderly"],
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d6",
      strength: "d6",
      vigor: "d10",
    },
    skills: [
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
      { name: "Athletics", die: "d6", linkedAttribute: "Agility" },
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Persuasion", die: "d6", linkedAttribute: "Spirit" },
    ],
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-1");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Strength",
    }),
  ).toContainText("d6-1");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Vigor",
    }),
  ).toContainText("d10-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).not.toContainText("d8-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Athletics" }),
  ).toContainText("d6");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Athletics" }),
  ).not.toContainText("d6-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8+2");
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Effects -1",
  );

  const elderlyDisplay = await page.evaluate(() => ({
    agility: characterAttributeDisplay(
      character,
      "agility",
      character.attributes.agility,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
    pace: character.derived.pace,
  }));
  expect(elderlyDisplay).toEqual({
    agility: { value: "d8-1", note: "Elderly" },
    shooting: { value: "d8", note: "" },
    healing: { value: "d8+2", note: "" },
    pace: 5,
  });
});

test("imported Elderly severity suffix adjusts dossier rolls without double-counting Pace", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Imported Elderly Dossier Tester",
    preferredId: "imported-elderly-dossier-tester",
    source: "savaged.us",
    hindrances: [
      {
        id: "hindrance-elderly-major",
        name: "Elderly (major)",
        severity: "Major",
        type: "hindrance",
        source: "Imported",
      },
    ],
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d8",
      strength: "d6",
      vigor: "d10",
    },
    skills: [
      { name: "Athletics", die: "d6", linkedAttribute: "agility" },
      { name: "Fighting", die: "d4", linkedAttribute: "agility" },
      { name: "Healing", die: "d8+2", linkedAttribute: "smarts" },
      { name: "Riding", die: "d6", linkedAttribute: "agility" },
      { name: "Shooting", die: "d8", linkedAttribute: "agility" },
    ],
    derived: {
      pace: 5,
      basePace: 5,
      parry: 4,
      baseToughness: 6,
      toughness: 7,
      armor: 1,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-1");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Strength",
    }),
  ).toContainText("d6-1");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Vigor",
    }),
  ).toContainText("d10-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).not.toContainText("d8-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8+2");
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Recorded total; passive Pace effect shown below",
  );

  const importedDisplay = await page.evaluate(() => ({
    hooks: activeEffectHooks(character).map((hook) => hook.id),
    pace: character.derived.pace,
    paceModifier: character.derived.effectPaceModifier,
    pendingPaceModifier: character.derived.effectPacePendingModifier,
    agility: characterAttributeDisplay(
      character,
      "agility",
      character.attributes.agility,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
  }));
  expect(importedDisplay).toEqual({
    hooks: ["hindrance-elderly"],
    pace: 5,
    paceModifier: 0,
    pendingPaceModifier: -1,
    agility: { value: "d8-1", note: "Elderly" },
    shooting: { value: "d8", note: "" },
    healing: { value: "d8+2", note: "" },
  });
});

test("Elderly and Stiff Drink modifiers stack in dossier trait display", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Elderly Liquid Courage Tester",
    preferredId: "elderly-liquid-courage-tester",
    edgeIds: ["swade-edge-liquid-courage"],
    hindranceIds: ["swade-hindrance-elderly"],
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d6",
      strength: "d6",
      vigor: "d8",
    },
    skills: [
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
    ],
    conditions: {
      liquidCourage: true,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Vigor",
    }),
  ).toContainText("d10-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8+1");

  const stackedDisplay = await page.evaluate(() => ({
    vigor: characterAttributeDisplay(
      character,
      "vigor",
      character.attributes.vigor,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
  }));
  expect(stackedDisplay).toEqual({
    vigor: { value: "d10-1", note: "Base d8 • Liquid Courage, Elderly" },
    shooting: { value: "d8-1", note: "Liquid Courage" },
    healing: { value: "d8+1", note: "Liquid Courage" },
  });
});

test("Wounds and Fatigue update dossier trait rolls", async ({ page }) => {
  await seedEffectHookCharacter(page, {
    name: "Damage Penalty Dossier Tester",
    preferredId: "damage-penalty-dossier-tester",
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d8",
      strength: "d6",
      vigor: "d10",
    },
    skills: [
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
    ],
    damage: {
      wounds: 1,
      fatigue: 1,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Vigor",
    }),
  ).toContainText("d10-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8");

  const damageDisplay = await page.evaluate(() => ({
    agility: characterAttributeDisplay(
      character,
      "agility",
      character.attributes.agility,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
  }));
  expect(damageDisplay).toEqual({
    agility: { value: "d8-2", note: "Wounds, Fatigue" },
    shooting: { value: "d8-2", note: "Wounds, Fatigue" },
    healing: { value: "d8", note: "Wounds, Fatigue" },
  });
});

test("Tracker Wound and Fatigue controls update dossier trait rolls", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Live Damage Penalty Dossier Tester",
    preferredId: "live-damage-penalty-dossier-tester",
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d8",
      strength: "d6",
      vigor: "d10",
    },
    skills: [
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
    ],
  });

  await openCombat(page);
  const wounds = page.locator(".combat-status-grid .block").filter({
    has: page.getByRole("heading", { name: "Wounds" }),
  });
  const fatigue = page.locator(".combat-status-grid .block").filter({
    has: page.getByRole("heading", { name: "Fatigue" }),
  });
  await wounds.getByRole("button", { name: "+", exact: true }).click();
  await fatigue.getByRole("button", { name: "+", exact: true }).click();
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await expect(page.locator("#fatigueValue")).toHaveText("1");

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const shootingChip = page
    .locator("#skillsList .skill-chip")
    .filter({ hasText: "Shooting" });
  const healingChip = page
    .locator("#skillsList .skill-chip")
    .filter({ hasText: "Healing" });

  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-2");
  await expect(shootingChip).toContainText("d8-2");
  await expect(shootingChip).toContainText("Wounds, Fatigue");
  await expect(shootingChip).toHaveClass(/temporary-modified/);
  await expect(healingChip).toContainText("d8");
  await expect(healingChip).toContainText("Wounds, Fatigue");
  await expect(healingChip).toHaveClass(/temporary-modified/);
});

test("Wound penalty reductions apply to dossier trait rolls", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Reduced Wound Penalty Dossier Tester",
    preferredId: "reduced-wound-penalty-dossier-tester",
    edgeIds: ["swade-edge-nerves-of-steel"],
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d8",
      strength: "d6",
      vigor: "d10",
    },
    skills: [{ name: "Shooting", die: "d8", linkedAttribute: "Agility" }],
    damage: {
      wounds: 2,
      fatigue: 1,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8-2");

  const reducedDisplay = await page.evaluate(() => ({
    characterReduction: characterWoundPenaltyReduction(character, "character"),
    combatReduction: characterWoundPenaltyReduction(character, "combat"),
    agility: characterAttributeDisplay(
      character,
      "agility",
      character.attributes.agility,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
  }));
  expect(reducedDisplay).toEqual({
    characterReduction: 1,
    combatReduction: 1,
    agility: { value: "d8-2", note: "Wounds, Fatigue" },
    shooting: { value: "d8-2", note: "Wounds, Fatigue" },
  });
});

test("Stiff Drink ignores one Wound penalty on dossier trait rolls", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Stiff Drink Wound Penalty Dossier Tester",
    preferredId: "stiff-drink-wound-penalty-dossier-tester",
    edgeIds: ["swade-edge-liquid-courage"],
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d8",
      strength: "d6",
      vigor: "d8",
    },
    skills: [
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
    ],
    conditions: {
      liquidCourage: true,
    },
    damage: {
      wounds: 2,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Vigor",
    }),
  ).toContainText("d10-1");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8");

  const stiffDrinkDisplay = await page.evaluate(() => ({
    reduction: characterWoundPenaltyReduction(character, "character"),
    vigor: characterAttributeDisplay(
      character,
      "vigor",
      character.attributes.vigor,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
  }));
  expect(stiffDrinkDisplay).toEqual({
    reduction: 1,
    vigor: { value: "d10-1", note: "Base d8 • Liquid Courage, Wounds" },
    shooting: { value: "d8-2", note: "Liquid Courage, Wounds" },
    healing: { value: "d8", note: "Liquid Courage, Wounds" },
  });
});

test("Distracted condition updates dossier attributes and skills", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Distracted Dossier Tester",
    preferredId: "distracted-dossier-tester",
    attributes: {
      agility: "d8",
      smarts: "d8",
      spirit: "d6",
      strength: "d6",
      vigor: "d10",
    },
    skills: [
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Persuasion", die: "d6", linkedAttribute: "Spirit" },
    ],
    conditions: {
      distracted: true,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Agility",
    }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#attributesList .attribute-die-card").filter({
      hasText: "Spirit",
    }),
  ).toContainText("d6-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8-2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8");

  const distractedDisplay = await page.evaluate(() => ({
    hooks: activeEffectHooks(character).map((hook) => hook.id),
    agility: characterAttributeDisplay(
      character,
      "agility",
      character.attributes.agility,
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
    persuasion: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Persuasion"),
    ),
  }));
  expect(distractedDisplay).toEqual({
    hooks: ["condition-distracted"],
    agility: { value: "d8-2", note: "Distracted" },
    shooting: { value: "d8-2", note: "Distracted" },
    healing: { value: "d8", note: "Distracted" },
    persuasion: { value: "d6-2", note: "Distracted" },
  });
});

test("attack condition toggles update relevant dossier skills", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Attack Condition Dossier Tester",
    preferredId: "attack-condition-dossier-tester",
    skills: [
      { name: "Athletics", die: "d6", linkedAttribute: "Agility" },
      { name: "Fighting", die: "d6", linkedAttribute: "Agility" },
      { name: "Healing", die: "d8+2", linkedAttribute: "Smarts" },
      { name: "Shooting", die: "d8", linkedAttribute: "Agility" },
    ],
    conditions: {
      aiming: true,
      prone: true,
      theDrop: true,
      wildAttack: true,
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Athletics" }),
  ).toContainText("d6+2");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Fighting" }),
  ).toContainText("d6+4");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Shooting" }),
  ).toContainText("d8+4");
  await expect(
    page.locator("#skillsList .skill-chip").filter({ hasText: "Healing" }),
  ).toContainText("d8+2");

  const conditionDisplay = await page.evaluate(() => ({
    hooks: activeEffectHooks(character).map((hook) => hook.id),
    athletics: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Athletics"),
    ),
    fighting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Fighting"),
    ),
    shooting: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Shooting"),
    ),
    healing: characterSkillDisplay(
      character,
      character.skills.find((skill) => skill.name === "Healing"),
    ),
  }));
  expect(conditionDisplay).toEqual({
    hooks: [
      "condition-prone",
      "condition-aiming",
      "condition-the-drop",
      "condition-wild-attack",
    ],
    athletics: { value: "d6+2", note: "Prone, The Drop" },
    fighting: { value: "d6+4", note: "Prone, The Drop, Wild Attack" },
    shooting: { value: "d8+4", note: "Prone, Aiming, The Drop" },
    healing: { value: "d8+2", note: "" },
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
  await expect(derived).toContainText("Unarmed damage Str+d4");

  await openCombat(page);
  const combatBreakdown = page.locator("#combatPenaltyBreakdown");
  await expect(combatBreakdown).toContainText("Brawler: Toughness +1");
  await expect(combatBreakdown).toContainText("Brawler: Unarmed damage Str+d4");

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
    summaries: ["Brawler: Toughness +1", "Brawler: Unarmed damage Str+d4"],
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
  await expect(page.locator("#characterStatusStrip")).toContainText(
    "Wounds0 / 4",
  );
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
  await expect(page.locator("#characterStatusStrip")).toContainText(
    "Wounds0 / 5",
  );
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
  await expect(page.locator("#characterStatusStrip")).toContainText(
    "Wounds0 / 4",
  );
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
