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
  await expect(actionCardPanel).toBeHidden();

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

test("Luck and Bad Luck update starting Bennies without session reset UI", async ({
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
  await expect(page.locator("#newSessionBtn")).toBeHidden();
});

test("Action Card model tracks Quick redraw state without normal tracker UI", async ({
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
  await expect(panel).toBeHidden();

  await page.evaluate(() => {
    character.actionCards.current = "5H";
    character.actionCards.secondary = "King";
    character.actionCards.notes = "Round 1";
    save();
  });
  expect(await page.evaluate(() => character.actionCards)).toEqual({
    current: "5H",
    secondary: "King",
    notes: "Round 1",
  });
  expect(
    await page.evaluate(() => quickRedrawStatus(character).available),
  ).toBe(true);

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#actionCardPanel")).toBeHidden();
  expect(await page.evaluate(() => character.actionCards)).toEqual({
    current: "5H",
    secondary: "King",
    notes: "Round 1",
  });
  await page.evaluate(() => {
    character.actionCards = normalizeActionCardState(null);
    save();
  });
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
  await expect(panel).toBeHidden();

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
