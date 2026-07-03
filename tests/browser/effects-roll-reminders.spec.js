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

test("Flexible Hindrance mechanical reminders respect selected severity", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Flexible Hindrance Reminder Tester",
    preferredId: "flexible-hindrance-reminder-tester",
    hindranceIds: [
      "dl-hindrance-ailin",
      "swade-hindrance-bad-eyes",
      "swade-hindrance-hard-of-hearing",
      "swade-hindrance-suspicious",
      "swade-hindrance-young",
      "swade-hindrance-delusional",
    ],
    hindranceSeverities: {
      "dl-hindrance-ailin": "Major",
      "swade-hindrance-bad-eyes": "Minor",
      "swade-hindrance-hard-of-hearing": "Major",
      "swade-hindrance-suspicious": "Major",
      "swade-hindrance-young": "Minor",
      "swade-hindrance-delusional": "Major",
    },
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const derived = page.locator("#characterDerivedDetails");
  await expect(derived).toContainText("Ailin");
  await expect(derived).toContainText("Resist Fatigue -2");
  await expect(derived).toContainText("Bad Eyes");
  await expect(derived).toContainText("Vision-dependent Trait rolls -1");
  await expect(derived).toContainText("Hard of Hearing");
  await expect(derived).toContainText(
    "Completely deaf: hearing-based Notice rolls fail automatically",
  );
  await expect(derived).toContainText("Suspicious");
  await expect(derived).toContainText("Support this character -2");
  await expect(derived).toContainText("Young");
  await expect(derived).toContainText("Starting Bennies +1");
  await expect(derived).toContainText(
    "Creation budget: 4 Attribute points and 10 Skill points",
  );
  await expect(derived).not.toContainText("Delusional:");

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
      expect.objectContaining({
        sourceName: expect.stringContaining("Ailin"),
        target: "resist-fatigue",
        type: "roll-modifier",
        value: -2,
        displayLabel: "Resist Fatigue -2",
      }),
      expect.objectContaining({
        sourceName: expect.stringContaining("Bad Eyes"),
        target: "vision-dependent-traits",
        type: "roll-modifier",
        value: -1,
        displayLabel: "Vision-dependent Trait rolls -1",
      }),
      expect.objectContaining({
        sourceName: expect.stringContaining("Hard of Hearing"),
        target: "hearing-notice",
        type: "reminder",
        displayLabel:
          "Completely deaf: hearing-based Notice rolls fail automatically",
      }),
      expect.objectContaining({
        sourceName: expect.stringContaining("Suspicious"),
        target: "support-this-character",
        type: "roll-modifier",
        value: -2,
        displayLabel: "Support this character -2",
      }),
      expect.objectContaining({
        sourceName: expect.stringContaining("Young"),
        target: "starting-bennies",
        type: "session-resource-modifier",
        value: 1,
        displayLabel: "Starting Bennies +1",
      }),
    ]),
  );
  expect(computed).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        sourceName: "Delusional",
      }),
    ]),
  );
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
