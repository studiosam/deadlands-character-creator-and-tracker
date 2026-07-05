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
  startNewCharacterFromLanding,
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

test("selects hindrances in character setup and summarizes point expectations", async ({
  page,
}) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(hindrancePanel).toBeVisible();
  await expect(hindrancePanel).toContainText("Hindrances are optional");
  await expect(hindrancePanel).toContainText(
    "Up to 4 Benefit Points can be spent on starting benefits.",
  );
  await expect(hindrancePanel).toContainText(
    "Minor Hindrances grant 1 Benefit Point",
  );
  await expect(hindrancePanel).toContainText("Major Hindrances grant 2");
  await expect(hindrancePanel).toContainText("Selected Hindrances");
  const hindranceSummary = hindrancePanel.locator(
    ".setup-hindrance-summary-grid",
  );
  const benefitPointsCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefit Points" });
  const benefitsSpentCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefits Spent" });
  await expect(benefitPointsCard).toContainText("0 / 4");
  await expect(benefitPointsCard.locator("[role='meter']")).toHaveAttribute(
    "aria-valuemax",
    "4",
  );
  await expect(benefitsSpentCard).toContainText("0 / 0");
  await expect(benefitsSpentCard.locator("[role='meter']")).toHaveAttribute(
    "aria-valuemax",
    "0",
  );
  const initialMeterLayout = await benefitPointsCard.evaluate((card) => {
    const meter = card.querySelector("[role='meter']");
    return {
      cardWidth: card.getBoundingClientRect().width,
      meterWidth: meter?.getBoundingClientRect().width || 0,
    };
  });
  expect(initialMeterLayout.meterWidth).toBeGreaterThan(
    initialMeterLayout.cardWidth * 0.75,
  );
  await expect(hindranceSummary).not.toContainText("Selected");
  await expect(hindranceSummary).not.toContainText("Counted");
  await expect(hindranceSummary).not.toContainText("Remaining");
  const hindranceHelp = hindranceSummary.locator(".setup-detail-help");
  await expect(hindranceHelp).toHaveCount(2);
  await expect(hindranceHelp.first()).toHaveAttribute(
    "aria-label",
    /Earned Hindrance Benefit Points/,
  );
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
  await expect(hindrancePanel.locator(".setup-benefit-spending")).toHaveCount(
    0,
  );
  const entryCard = hindrancePanel.locator(".setup-hindrance-entry-card");
  await expect(entryCard).toContainText("Add Hindrance");
  await expect(entryCard.locator("#setupHindranceCatalogSelect")).toBeVisible();
  await expect(
    entryCard.locator("#setupHindranceCatalogSelect"),
  ).not.toContainText("Savage Worlds Adventure Edition");
  await expect(
    entryCard.locator("#setupHindranceCatalogSelect"),
  ).not.toContainText("Deadlands");
  await expect(entryCard.locator("#setupHindranceSeverityInput")).toBeVisible();
  await expect(entryCard.locator("#setupHindranceNotesInput")).toBeVisible();
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "Choose a Hindrance to preview what it does.",
  );
  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "Cursed",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "Marshal starts with one additional Benny",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).not.toContainText(
    "Deadlands",
  );
  await expect(entryCard.locator("#setupHindranceSeverityInput")).toHaveValue(
    "Major",
  );
  await expect(
    entryCard.locator("#setupHindranceSeverityInput"),
  ).toBeDisabled();
  await expect(entryCard.locator("#setupHindranceSeverityInput")).toHaveClass(
    /locked/,
  );
  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-ailin");
  await expect(entryCard.locator("#setupHindranceSeverityInput")).toBeEnabled();
  await expect(
    entryCard.locator("#setupHindranceSeverityInput"),
  ).not.toHaveClass(/locked/);
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Minor");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-1 to rolls made to resist Fatigue",
  );
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Major");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-2 to rolls made to resist Fatigue",
  );
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-clueless");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-1 to Common Knowledge and Notice",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).not.toContainText(
    "Penalty to Common Knowledge and Notice",
  );
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page
    .locator("#setupHindranceNotesInput")
    .fill("Hard luck follows him.");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Bad Luck");
  const badLuckCard = hindrancePanel.locator(".setup-hindrance-row").filter({
    hasText: "Bad Luck",
  });
  await expect(badLuckCard).toContainText("Major");
  await expect(badLuckCard).toContainText("Hard luck follows him.");
  await expect(benefitPointsCard).toContainText("2 / 4");
  await expect(benefitPointsCard.locator("[role='meter']")).toHaveAttribute(
    "aria-valuemax",
    "4",
  );
  await expect(benefitsSpentCard).toContainText("0 / 2");
  await expect(benefitsSpentCard.locator("[role='meter']")).toHaveAttribute(
    "aria-valuemax",
    "2",
  );
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );
  await expect(hindrancePanel.locator(".setup-benefit-spending")).toBeVisible();
  const hindranceLayout = await hindrancePanel.evaluate((panel) => {
    const topFor = (selector) =>
      panel.querySelector(selector).getBoundingClientRect().top;
    return {
      benefitsTop: topFor(".setup-benefit-spending"),
      entryTop: topFor(".setup-hindrance-entry-card"),
      selectedTop: topFor(".setup-selected-hindrances"),
    };
  });
  expect(hindranceLayout.entryTop).toBeLessThan(hindranceLayout.selectedTop);
  expect(hindranceLayout.selectedTop).toBeLessThan(hindranceLayout.benefitsTop);

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Cursed");
  await expect(hindranceSummary).toContainText("Benefit Points");
  await expect(hindranceSummary).toContainText("Benefits Spent");
  await expect(hindrancePanel).toContainText("4 / 4");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-tenderfoot");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Tenderfoot");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );
  await expect(hindrancePanel).toContainText("Above the standard cap");
  await expect(hindrancePanel).toContainText(
    "extra rewards require a table or GM exception",
  );
  await expect(hindrancePanel.locator(".entry-advisory")).toContainText(
    "Above the standard cap",
  );
  await expect(hindrancePanel.locator(".entry-warning")).toHaveCount(0);

  await hindrancePanel
    .locator(".setup-hindrance-row")
    .filter({ hasText: "Tenderfoot" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(
    hindrancePanel.locator(".setup-hindrance-row").filter({
      hasText: "Tenderfoot",
    }),
  ).toHaveCount(0);
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(page.locator("#setupHindrancesPanel")).toContainText("Bad Luck");
  await expect(page.locator("#setupHindrancesPanel")).toContainText("Cursed");
  await expect(page.locator("#setupHindrancesPanel")).toContainText("4 / 4");

  await page.locator("[data-setup-step='review']").click();
  const reviewPanel = page.locator("#setupReviewPanel");
  await expect(reviewPanel).toContainText("Hindrance Count");
  await expect(reviewPanel).toContainText("Total Hindrance Points");
  await expect(reviewPanel).toContainText("Hindrance Benefit Cap");
  await expect(reviewPanel).toContainText("Bad Luck");
  await expect(reviewPanel).toContainText("Cursed");
});

test("Hindrance Benefit Point meters update for Minor Major and spending states", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("[data-setup-step='hindrances']").click();

  const hindrancePanel = page.locator("#setupHindrancesPanel");
  const hindranceSummary = hindrancePanel.locator(
    ".setup-hindrance-summary-grid",
  );
  const benefitPointsCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefit Points" });
  const benefitsSpentCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefits Spent" });

  await expect(benefitPointsCard).toContainText("0 / 4");
  await expect(benefitsSpentCard).toContainText("0 / 0");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-ailin");
  await page.locator("#setupHindranceSeverityInput").selectOption("Minor");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindranceSummary).toBeVisible();
  await expect(benefitPointsCard).toContainText("1 / 4");
  await expect(benefitsSpentCard).toContainText("0 / 1");

  await hindrancePanel
    .locator(".setup-hindrance-row")
    .first()
    .getByRole("button", { name: "Remove" })
    .click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(benefitPointsCard).toContainText("2 / 4");
  await expect(benefitsSpentCard).toContainText("0 / 2");

  const attributeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Attribute Raises" });
  await attributeBenefitRow.getByRole("button", { name: "+" }).click();
  await expect(benefitsSpentCard).toContainText("2 / 2");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );

  await page.evaluate(() => {
    character.creation ||= {};
    character.creation.extraEdgesFromHindrances = 1;
    render();
  });
  await expect(benefitsSpentCard).toContainText("4 / 2");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Overspent",
  );
  await expect(hindrancePanel).toContainText(
    "Overspent: 4 Benefit Points are spent, but only 2 are available.",
  );

  await hindrancePanel
    .getByRole("button", { name: "Reset Hindrances" })
    .click();
  const resetDialog = page.locator("#appDialog");
  await expect(resetDialog).toBeVisible();
  await expect(resetDialog).toContainText(
    "This removes all selected Hindrances",
  );
  await resetDialog.getByRole("button", { name: "Reset Hindrances" }).click();
  await expect(resetDialog).toBeHidden();
  await expect(benefitPointsCard).toContainText("0 / 4");
  await expect(benefitsSpentCard).toContainText("0 / 0");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
  await expect(hindrancePanel.locator(".setup-hindrance-row")).toHaveCount(0);
  await expect(
    hindrancePanel.getByRole("button", { name: "Reset Hindrances" }),
  ).toBeDisabled();
});

test("Elderly applies setup effects and grants Smarts-linked Skill points", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("[data-setup-step='hindrances']").click();

  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-elderly");
  await expect(page.locator("#setupHindranceSeverityInput")).toHaveValue(
    "Major",
  );
  await expect(page.locator("#setupHindranceSeverityInput")).toBeDisabled();
  await expect(page.locator("#setupHindrancePreview")).toContainText(
    "Pace is reduced by 1",
  );
  await expect(page.locator("#setupHindrancePreview")).toContainText(
    "5 extra skill points for Smarts-linked skills",
  );
  await page.locator("#setupAddHindranceBtn").click();

  const elderlyCard = hindrancePanel.locator(".setup-hindrance-row").filter({
    hasText: "Elderly",
  });
  await expect(elderlyCard).toContainText("Major");
  await expect(elderlyCard).toContainText("Pace is reduced by 1");
  await expect(
    elderlyCard.getByRole("button", { name: "Go to Skills" }),
  ).toBeVisible();
  await expect(
    hindrancePanel.locator(".setup-hindrance-skill-shortcut"),
  ).toHaveCount(0);

  const elderlyEffects = await page.evaluate(() => ({
    pace: character.derived.pace,
    paceModifier: character.derived.effectPaceModifier,
    effectLabels: effectHookSummariesForSurface(character, "character").map(
      (effect) => effect.displayLabel,
    ),
  }));
  expect(elderlyEffects.pace).toBe(5);
  expect(elderlyEffects.paceModifier).toBe(-1);
  expect(elderlyEffects.effectLabels).toContain("Pace -1");
  expect(elderlyEffects.effectLabels).toContain("Running rolls -1");
  expect(elderlyEffects.effectLabels).toContain("Agility rolls -1");
  expect(elderlyEffects.effectLabels).toContain("Strength rolls -1");
  expect(elderlyEffects.effectLabels).toContain("Vigor rolls -1");

  await elderlyCard.getByRole("button", { name: "Go to Skills" }).click();
  const skillsPanel = page.locator("#setupSkillsPanel");
  await expect(skillsPanel).toContainText(
    "Elderly grants 5 extra Skill points",
  );
  const skillPointsCard = skillsPanel
    .locator(".setup-skill-points-card")
    .first();
  const elderlySkillCard = skillsPanel
    .locator(".setup-skill-points-card")
    .filter({ hasText: "Elderly Smarts Skill Points" });
  await expect(skillPointsCard).toContainText("0 / 17 assigned");
  await expect(elderlySkillCard).toContainText("0 / 5 assigned");

  const smartsGroup = skillsPanel
    .locator(".setup-skill-attribute-group")
    .filter({ hasText: "Smarts" });
  await expect(smartsGroup).toContainText("Academics");
  await expect(smartsGroup).toContainText("Research");
  await expect(smartsGroup).not.toContainText("Psionics");

  for (const skillName of [
    "Academics",
    "Battle",
    "Gambling",
    "Healing",
    "Occult",
  ]) {
    await smartsGroup
      .locator(".setup-trait-editor-row.skill-row")
      .filter({ hasText: skillName })
      .locator("[data-setup-action='incSkill']")
      .click();
  }

  await expect(skillPointsCard).toContainText("5 / 17 assigned");
  await expect(elderlySkillCard).toContainText("5 / 5 assigned");

  for (const skillName of [
    "Boating",
    "Driving",
    "Fighting",
    "Piloting",
    "Riding",
    "Shooting",
    "Thievery",
    "Faith",
    "Focus",
    "Intimidation",
    "Performance",
    "Spellcasting",
  ]) {
    await skillsPanel
      .locator(".setup-trait-editor-row.skill-row")
      .filter({ hasText: skillName })
      .locator("[data-setup-action='incSkill']")
      .click();
  }

  await expect(skillPointsCard).toContainText("17 / 17 assigned");
  await expect(elderlySkillCard).toContainText("5 / 5 assigned");
  await expect(page.locator("[data-setup-step='skills']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(
    elderlyCard.getByRole("button", { name: "Go to Skills" }),
  ).toHaveCount(0);

  const stored = await page.evaluate(() => character);
  expect(
    stored.hindrances.some(
      (hindrance) =>
        hindrance.name === "Elderly" &&
        hindrance.creationSource === "setup-starting-hindrance",
    ),
  ).toBe(true);
  expect(stored.creationBaseline.skills).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "Academics", die: "d4" }),
      expect.objectContaining({ name: "Occult", die: "d4" }),
      expect.objectContaining({ name: "Shooting", die: "d4" }),
    ]),
  );
});

test("removing Hindrances that lower the benefit budget resets spent benefits", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("[data-setup-step='hindrances']").click();

  const hindrancePanel = page.locator("#setupHindrancesPanel");
  const hindranceSummary = hindrancePanel.locator(
    ".setup-hindrance-summary-grid",
  );
  const benefitPointsCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefit Points" });
  const benefitsSpentCard = hindranceSummary
    .locator(".setup-hindrance-meter-card")
    .filter({ hasText: "Benefits Spent" });

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  const edgeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" });
  await edgeBenefitRow.getByRole("button", { name: "+" }).click();
  await edgeBenefitRow.getByRole("button", { name: "Go to Edges" }).click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await expect(edgesPanel).toBeVisible();
  await edgesPanel
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(hindrancePanel).toBeVisible();
  await expect(benefitPointsCard).toContainText("2 / 4");
  await expect(benefitsSpentCard).toContainText("2 / 2");

  await hindrancePanel
    .locator(".setup-hindrance-row")
    .filter({ hasText: "Bad Luck" })
    .getByRole("button", { name: "Remove" })
    .click();
  const resetDialog = page.locator("#appDialog");
  await expect(resetDialog).toBeVisible();
  await expect(resetDialog).toContainText(
    "Removing this Hindrance lowers your available Benefit Points",
  );
  await resetDialog.getByRole("button", { name: "Reset Benefits" }).click();
  await expect(resetDialog).toBeHidden();

  await expect(benefitPointsCard).toContainText("0 / 4");
  await expect(benefitsSpentCard).toContainText("0 / 0");
  await expect(hindrancePanel.locator(".setup-hindrance-row")).toHaveCount(0);
  await page.locator(".setup-step[data-setup-step='edges']").click();
  await expect(
    page.locator("#setupEdgesPanel .setup-edge-card").filter({
      hasText: "Berserk",
    }),
  ).toHaveCount(0);
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
});

test("flexible Hindrances expose Minor and Major descriptions without fake fixed modifiers", async ({
  page,
}) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='hindrances']").click();

  const expectedFlexibleIds = [
    "dl-hindrance-ailin",
    "dl-hindrance-talisman",
    "dl-hindrance-trouble-magnet",
    "swade-hindrance-bad-eyes",
    "swade-hindrance-delusional",
    "swade-hindrance-driven",
    "swade-hindrance-enemy",
    "swade-hindrance-greedy",
    "swade-hindrance-habit",
    "swade-hindrance-hard-of-hearing",
    "swade-hindrance-jealous",
    "swade-hindrance-obligation",
    "swade-hindrance-outsider",
    "swade-hindrance-pacifist",
    "swade-hindrance-phobia",
    "swade-hindrance-ruthless",
    "swade-hindrance-secret",
    "swade-hindrance-shamed",
    "swade-hindrance-slow",
    "swade-hindrance-suspicious",
    "swade-hindrance-thin-skinned",
    "swade-hindrance-ugly",
    "swade-hindrance-vengeful",
    "swade-hindrance-vow",
    "swade-hindrance-wanted",
    "swade-hindrance-young",
  ];

  const catalogSeverities = await page.evaluate(
    (ids) =>
      Object.fromEntries(
        ids.map((id) => [
          id,
          HINDRANCE_CATALOG.find((item) => item.id === id)?.severity,
        ]),
      ),
    expectedFlexibleIds,
  );
  for (const id of expectedFlexibleIds) {
    expect(catalogSeverities[id]).toBe("Minor or Major");
  }

  const entryCard = page.locator(".setup-hindrance-entry-card");
  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-eyes");
  await expect(entryCard.locator("#setupHindranceSeverityInput")).toBeEnabled();
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Minor");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-1 to vision-dependent Trait rolls",
  );
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Major");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-2 to vision-dependent Trait rolls",
  );

  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-hard-of-hearing");
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Minor");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "-4 to all Notice rolls related to hearing",
  );
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Major");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "Completely deaf",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "hearing-based Notice rolls fail automatically",
  );

  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-delusional");
  await expect(entryCard.locator("#setupHindrancePreview")).toContainText(
    "Believes something false or irrational",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).not.toContainText(
    "-1",
  );
  await expect(entryCard.locator("#setupHindrancePreview")).not.toContainText(
    "-2",
  );

  await entryCard
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-slow");
  await entryCard.locator("#setupHindranceSeverityInput").selectOption("Major");
  await page.locator("#setupAddHindranceBtn").click();
  const slowCard = page.locator(".setup-hindrance-row").filter({
    hasText: "Slow",
  });
  await expect(slowCard).toContainText("Pace -2");
  await expect(slowCard).toContainText("Athletics");
});

test("spends hindrance benefits and selects source-tracked setup edges", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Benefit Edge Character");
  await page.locator("#setupArchetypeInput").fill("Card Sharp");
  await expect(
    page.locator("[data-setup-action='saveDraftCharacter']"),
  ).toHaveCount(0);
  await page.locator("[data-setup-step='review']").click();
  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Review and save character",
  );

  await page.locator(".setup-step[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  const setupNavigation = page.locator(".setup-step-navigation");
  await expect(edgesPanel.locator("#setupEdgeSelectionHeading")).toHaveText(
    "Edges",
  );
  await expect(edgesPanel).not.toContainText("Edges incomplete:");
  await expect(setupNavigation).toContainText("Edges incomplete:");
  await expect(setupNavigation).toContainText(
    "Select the Human free starting Edge.",
  );
  await expect(edgesPanel).not.toContainText("Recorded Edges");
  await expect(edgesPanel).not.toContainText("Catalog Matches");
  await expect(edgesPanel).toContainText("Free Edge");
  await expect(edgesPanel).toContainText("0 / 1");
  const freeEdgeMeter = edgesPanel
    .locator(".setup-edge-pick-card")
    .filter({ hasText: "Free Edge" })
    .locator("[role='meter'][aria-label='Free Edge']");
  await expect(freeEdgeMeter).toHaveAttribute("aria-valuenow", "0");
  await expect(freeEdgeMeter).toHaveAttribute("aria-valuemax", "1");
  await expect(edgesPanel).not.toContainText("Draft Hindrance Benefit Edges");
  await expect(page.locator("#setupHindranceBenefitEdgeSelect")).toHaveCount(0);
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "Brave",
  );
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "Fan the Hammer",
  );
  await expect(page.locator("#setupHumanFreeEdgeSelect")).not.toContainText(
    "\u00e2\u20ac\u00a2",
  );

  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await expect(page.locator("#setupHumanFreeEdgePreview")).toContainText(
    "Alertness",
  );
  await expect(page.locator("#setupHumanFreeEdgePreview")).toContainText(
    "Notice rolls",
  );
  await edgesPanel.getByRole("button", { name: "Add Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  const alertnessCard = edgesPanel
    .locator(".setup-edge-card")
    .filter({ hasText: "Alertness" });
  await expect(alertnessCard).toContainText("Effect:");
  await expect(alertnessCard).toContainText("Notice rolls");
  await expect(alertnessCard).toContainText("Requirements:");
  await expect(alertnessCard).not.toContainText("Human free Edge");
  await expect(alertnessCard).not.toContainText("Complete");
  await expect(alertnessCard).not.toContainText("Catalog matched");
  await expect(alertnessCard).not.toContainText("Subchoice");
  await expect(alertnessCard.getByText("Details")).toHaveCount(0);
  await expect(freeEdgeMeter).toHaveAttribute("aria-valuenow", "1");
  await expect(setupNavigation).not.toContainText("Edges incomplete:");

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
  await expect(
    page.getByRole("button", { name: "Continue without Hindrances" }),
  ).toBeVisible();
  await expect(hindrancePanel).toContainText(
    "Hindrances are optional flaws, obligations, or complications.",
  );
  await page
    .getByRole("button", { name: "Continue without Hindrances" })
    .click();
  await expect(page.locator("#setupPowersPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Optional",
  );
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Benefit Points");
  await expect(hindrancePanel).toContainText("4 / 4");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Incomplete",
  );
  await page
    .getByRole("button", { name: "Continue with Unspent Hindrance Points" })
    .click();
  const unspentDialog = page.locator("#appDialog");
  await expect(unspentDialog).toBeVisible();
  await expect(unspentDialog).toContainText("unspent Hindrance points");
  await unspentDialog.getByRole("button", { name: "Go Back" }).click();
  await expect(unspentDialog).toBeHidden();
  await expect(hindrancePanel).toBeVisible();

  const attributeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Attribute Raises" });
  const edgeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" });
  await attributeBenefitRow.getByRole("button", { name: "+" }).click();
  await edgeBenefitRow.getByRole("button", { name: "+" }).click();
  await expect(hindrancePanel).toContainText("Spent");
  await expect(hindrancePanel).toContainText("4 / 4");
  await expect(attributeBenefitRow).toContainText("1 Attribute Raise");
  await expect(edgeBenefitRow).toContainText("1 Edge");
  await expect(
    attributeBenefitRow.getByRole("button", { name: "Go to Attributes" }),
  ).toBeVisible();
  await expect(
    edgeBenefitRow.getByRole("button", { name: "Go to Edges" }),
  ).toBeVisible();
  await expect(
    hindrancePanel.locator(".setup-hindrance-attribute-shortcut"),
  ).toHaveCount(0);
  await expect(
    hindrancePanel.locator("#setupHindranceBenefitEdgeSelect"),
  ).toHaveCount(0);
  await expect(hindrancePanel).not.toContainText("Paid Attribute Raise");
  await attributeBenefitRow
    .getByRole("button", { name: "Go to Attributes" })
    .click();
  await expect(page.locator("#setupTraitsPanel")).toBeVisible();
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Incomplete",
  );
  await edgeBenefitRow.getByRole("button", { name: "Go to Edges" }).click();
  await expect(edgesPanel).toContainText("Hindrance Benefit Edges");
  await expect(edgesPanel).toContainText("0 / 1 selected");
  await expect(edgesPanel).not.toContainText("1 open");
  await expect(edgesPanel).not.toContainText("Incomplete: choose paid");
  await expect(setupNavigation).toContainText("Edges incomplete:");
  await expect(setupNavigation).toContainText("You have unspent Edge points.");
  const hindranceEdgeMeter = edgesPanel
    .locator(".setup-hindrance-benefit-edge-selection .setup-edge-pick-card")
    .filter({ hasText: "Paid Edge Slot" })
    .locator("[role='meter'][aria-label='Hindrance Edges']");
  await expect(hindranceEdgeMeter).toHaveAttribute("aria-valuenow", "0");
  await expect(hindranceEdgeMeter).toHaveAttribute("aria-valuemax", "1");
  await expect(
    edgesPanel.locator("#setupHindranceBenefitEdgeSelect"),
  ).toBeVisible();
  await edgesPanel
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await expect(
    edgesPanel.locator("#setupHindranceBenefitEdgePreview"),
  ).toContainText("Berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");
  await expect(edgesPanel).toContainText("Hindrance benefit Edge");
  await expect(
    edgesPanel.locator("[role='meter'][aria-label='Hindrance Edges']"),
  ).toHaveAttribute("aria-valuenow", "1");
  await expect(setupNavigation).not.toContainText("Edges incomplete:");
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Ready",
  );
  await expect(
    edgeBenefitRow.getByRole("button", { name: "Go to Edges" }),
  ).toHaveCount(0);

  await page.locator(".setup-step[data-setup-step='edges']").click();
  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Complete");

  await expect
    .poll(() =>
      page.evaluate((libraryKey) => {
        const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
        const active = library?.charactersById?.[library.activeCharacterId];
        const activeCharacter = active?.character;
        return {
          activeName: active?.name || "",
          extraAttributeRaises:
            activeCharacter?.creation?.extraAttributeRaisesFromHindrances ?? 0,
          extraEdges: activeCharacter?.creation?.extraEdgesFromHindrances ?? 0,
          humanEdge:
            activeCharacter?.edges?.find((edge) => edge.name === "Alertness")
              ?.creationSource || "",
          hindranceEdge:
            activeCharacter?.edges?.find((edge) => edge.name === "Berserk")
              ?.creationSource || "",
        };
      }, CHARACTER_LIBRARY_KEY),
    )
    .toEqual({
      activeName: "Benefit Edge Character",
      extraAttributeRaises: 1,
      extraEdges: 1,
      humanEdge: "human-free-edge",
      hindranceEdge: "hindrance-benefit",
    });

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator(".setup-step[data-setup-step='edges']").click();
  await expect(page.locator("#setupEdgesPanel")).toContainText("Alertness");
  await expect(page.locator("#setupEdgesPanel")).toContainText("Berserk");
  await expect(page.locator("#setupEdgesPanel")).not.toContainText(
    "Human free Edge",
  );
  await expect(page.locator("#setupEdgesPanel")).toContainText(
    "Hindrance benefit Edge",
  );
});

test("selected setup Edge and Hindrance cards surface precise catalog mechanics", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const selectedEdgeIds = [
      "dl-edge-fan-the-hammer",
      "dl-edge-improved-fan-the-hammer",
      "dl-edge-quick-draw",
      "dl-edge-born-in-the-saddle",
      "dl-edge-scout",
      "dl-edge-tale-teller",
      "dl-edge-reputation",
      "dl-edge-grit",
      "dl-edge-fast-as-lightning",
      "dl-edge-man-of-a-thousand-faces",
      "dl-edge-soul-eater",
      "dl-edge-spook",
      "dl-edge-whateley-blood",
      "dl-edge-like-an-oak",
      "swade-edge-ambidextrous",
      "swade-edge-berserk",
      "swade-edge-brawler",
      "swade-edge-brute",
      "swade-edge-calculating",
      "swade-edge-fame",
      "swade-edge-famous",
      "swade-edge-free-runner",
      "swade-edge-harder-to-kill",
      "swade-edge-steady-hands",
      "swade-edge-extra-effort",
      "swade-edge-holy-unholy-warrior",
      "swade-edge-improvisational-fighter",
      "swade-edge-linguist",
      "swade-edge-liquid-courage",
      "swade-edge-martial-artist",
      "swade-edge-martial-warrior",
      "swade-edge-rock-and-roll",
      "swade-edge-improved-trademark-weapon",
    ];
    const edges = selectedEdgeIds.map((id) => {
      const catalogEdge = EDGE_CATALOG.find((edge) => edge.id === id);
      return {
        ...catalogEdge,
        id: `record-${id}`,
        catalogId: catalogEdge.id,
        source: "Imported setup summary test",
        isCustom: false,
      };
    });
    const allThumbs = HINDRANCE_CATALOG.find(
      (hindrance) => hindrance.id === "swade-hindrance-all-thumbs",
    );
    const characterData = normalize({
      source: "imported",
      setupStatus: "needsReview",
      name: "Catalog Summary Tester",
      rank: "Legendary",
      ancestry: "Human",
      archetype: "Reference",
      attributes: {
        agility: "d12",
        smarts: "d12",
        spirit: "d12",
        strength: "d12",
        vigor: "d12",
      },
      skills: [],
      edges,
      hindrances: [
        {
          ...allThumbs,
          id: "record-swade-hindrance-all-thumbs",
          catalogId: allThumbs.id,
          source: "Imported setup summary test",
          isCustom: false,
        },
      ],
      advances: [],
      inventory: [],
      weapons: [],
      armorInventory: [],
      ammo: {},
      consumables: [],
      vehicles: [],
      powers: [],
      resources: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "catalog-summary-tester",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterDraftMode = false;
    render();
  });

  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  const edgeCard = (name) =>
    edgesPanel.locator(".setup-edge-card").filter({
      has: page.getByRole("heading", { name, exact: true }),
    });

  await expect(edgeCard("Fan the Hammer")).toContainText("Shooting die at -4");
  await expect(edgeCard("Improved Fan the Hammer")).toContainText(
    "-2 Shooting instead of -4",
  );
  await expect(edgeCard("Quick Draw")).toContainText(
    "+2 to Athletics rolls to interrupt or resist interruption",
  );
  await expect(edgeCard("Reputation")).toContainText("+2 to Intimidation");
  await expect(edgeCard("Grit")).toContainText("Fear check penalties by 2");
  await expect(edgeCard("Fast as Lightning")).toContainText(
    "Maximum Multi-Action Penalty becomes -6",
  );
  await expect(edgeCard("Soul Eater")).toContainText("Spirit at -2");
  await expect(edgeCard("Spook")).toContainText("Fear check at -2");
  await expect(edgeCard("Whateley Blood")).toContainText("-1 to Persuasion");
  await expect(edgeCard("Whateley Blood")).toContainText(
    "Fatigue level for 5 Power Points",
  );
  await expect(edgeCard("Calculating")).toContainText(
    "Action Card is 5 or lower",
  );
  await expect(edgeCard("Calculating")).toContainText(
    "ignore up to 2 points of penalties",
  );
  await expect(edgeCard("Holy/Unholy Warrior")).toContainText(
    "1 to 4 Power Points",
  );
  await expect(edgeCard("Holy/Unholy Warrior")).toContainText(
    "+1 to +4 to a Soak roll",
  );
  await expect(edgeCard("Ambidextrous")).toContainText("-2 off-hand penalty");
  await expect(edgeCard("Brawler")).toContainText("Str+d4 damage");
  await expect(edgeCard("Brute")).toContainText("+1 at Short");
  await expect(edgeCard("Brute")).toContainText("+2 at Medium");
  await expect(edgeCard("Brute")).toContainText("+4 at Long");
  await expect(edgeCard("Fame")).toContainText("+1 Persuasion");
  await expect(edgeCard("Fame")).toContainText("Performance pay is doubled");
  await expect(edgeCard("Famous")).toContainText("+2 Persuasion");
  await expect(edgeCard("Famous")).toContainText("five times normal");
  await expect(edgeCard("Linguist")).toContainText("half the Smarts die type");
  await expect(edgeCard("Liquid Courage")).toContainText(
    "Vigor increases one die type",
  );
  await expect(edgeCard("Liquid Courage")).toContainText(
    "ignores one level of Wound penalties",
  );
  await expect(edgeCard("Liquid Courage")).toContainText(
    "Agility, Smarts, and skills linked to them suffer -1",
  );
  await expect(edgeCard("Liquid Courage")).toContainText(
    "one level of Fatigue for 4 hours",
  );
  await expect(edgeCard("Harder to Kill")).toContainText("even result");
  await expect(edgeCard("Improvisational Fighter")).toContainText(
    "-2 improvised weapon attack penalty",
  );
  await expect(edgeCard("Martial Artist")).toContainText("Str+d4");
  await expect(edgeCard("Martial Warrior")).toContainText("Str+d6");
  await expect(edgeCard("Rock and Roll!")).toContainText("-2 Recoil penalty");
  await expect(edgeCard("Improved Trademark Weapon")).toContainText(
    "+2 attack and Parry",
  );

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  const allThumbsCard = hindrancePanel
    .locator(".setup-hindrance-row")
    .filter({ hasText: "All Thumbs" });
  await expect(allThumbsCard).toContainText(
    "-2 when using mechanical or electrical devices",
  );
  await expect(allThumbsCard).toContainText("Critical Failure");
  await expect(allThumbsCard).toContainText("breaks or malfunctions");

  await hindrancePanel
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-all-thumbs");
  await expect(hindrancePanel.locator("#setupHindrancePreview")).toContainText(
    "Critical Failure",
  );
});

test("hindrance skill and money benefits expose skill spending and update gear funds", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await page.locator("#setupNameInput").fill("Benefit Money Character");
  await page.locator("#setupArchetypeInput").fill("Prospector");

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();

  const skillBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Skill Points" });
  const moneyBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Money" });
  await skillBenefitRow.getByRole("button", { name: "+" }).click();
  await moneyBenefitRow.getByRole("button", { name: "+" }).click();

  await expect(
    skillBenefitRow.getByRole("button", { name: "Go to Skills" }),
  ).toBeVisible();
  await expect(
    hindrancePanel.locator(".setup-hindrance-skill-shortcut"),
  ).toHaveCount(0);
  await expect(hindrancePanel).not.toContainText("Paid Skill Points");
  await expect(hindrancePanel).not.toContainText("Hindrance Benefit Money");

  await skillBenefitRow.getByRole("button", { name: "Go to Skills" }).click();
  const skillsPanel = page.locator("#setupSkillsPanel");
  for (const skillName of [
    "Academics",
    "Battle",
    "Boating",
    "Driving",
    "Fighting",
    "Gambling",
    "Healing",
    "Occult",
    "Piloting",
    "Riding",
    "Shooting",
    "Thievery",
    "Faith",
  ]) {
    await skillsPanel
      .locator(".setup-trait-editor-row.skill-row")
      .filter({ hasText: skillName })
      .locator("[data-setup-action='incSkill']")
      .click();
  }
  await expect(page.locator("[data-setup-step='skills']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='hindrances']").click();
  await expect(
    skillBenefitRow.getByRole("button", { name: "Go to Skills" }),
  ).toHaveCount(0);

  await page.locator("[data-setup-step='gear']").click();
  const gearPanel = page.locator("#setupGearPanel");
  await expect(gearPanel).toContainText("Remaining");
  await expect(gearPanel).toContainText("$750.00");

  await expect
    .poll(() =>
      page.evaluate(() => ({
        moneyCents: character.moneyCents,
        extraSkillPoints:
          character.creation?.extraSkillPointsFromHindrances ?? 0,
        extraMoney: character.creation?.extraMoneyFromHindrances ?? 0,
      })),
    )
    .toEqual({
      moneyCents: 75000,
      extraSkillPoints: 1,
      extraMoney: 1,
    });
});

test("filters starting Edge choices by Rank Trait and prerequisite Edge requirements", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator(".setup-step[data-setup-step='edges']").click();
  const humanEdgeSelect = page.locator("#setupHumanFreeEdgeSelect");
  await expect(humanEdgeSelect).toBeVisible();

  const eligibility = await page.evaluate(() => {
    const edgeById = (id) => EDGE_CATALOG.find((edge) => edge.id === id);
    return {
      alertness: setupEdgeEligibility(edgeById("swade-edge-alertness")),
      brave: setupEdgeEligibility(edgeById("swade-edge-brave")),
      fanTheHammer: setupEdgeEligibility(edgeById("dl-edge-fan-the-hammer")),
      improvedArcaneResistance: setupEdgeEligibility(
        edgeById("swade-edge-improved-arcane-resistance"),
      ),
    };
  });

  expect(eligibility.alertness).toEqual({
    eligible: true,
    reason: "",
  });
  expect(eligibility.brave).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Spirit d6+"),
    }),
  );
  expect(eligibility.fanTheHammer).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Seasoned Edge"),
    }),
  );
  expect(eligibility.improvedArcaneResistance).toEqual(
    expect.objectContaining({
      eligible: false,
      reason: expect.stringContaining("Arcane Resistance"),
    }),
  );

  await expect(humanEdgeSelect).toContainText("Alertness");
  await expect(humanEdgeSelect).not.toContainText("Brave");
  await expect(humanEdgeSelect).not.toContainText("Fan the Hammer");
  await expect(humanEdgeSelect).not.toContainText("Improved Arcane Resistance");
});

test("starting Edge validation blocks stale invalid Human free Edge choices", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("#setupNameInput").fill("Stale Human Edge");
  await page.locator(".setup-step[data-setup-step='edges']").click();

  const edgesPanel = page.locator("#setupEdgesPanel");
  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Complete");

  await page.evaluate(() => {
    const brave = EDGE_CATALOG.find((edge) => edge.id === "swade-edge-brave");
    const humanEdge = character.edges.find(
      (edge) => setupEdgeCreationSource(edge) === "human-free-edge",
    );
    Object.assign(humanEdge, {
      ...brave,
      id: humanEdge.id,
      catalogId: brave.id,
      source: "Human free Edge",
      creationSource: "human-free-edge",
    });
    save();
    render();
  });

  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Needs review");
  await expect(edgesPanel).toContainText(
    "Human free Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");
  const braveCard = edgesPanel
    .locator(".setup-edge-card")
    .filter({ hasText: "Brave" });
  await expect(braveCard).not.toContainText("Catalog matched");
  await expect(braveCard).not.toContainText("Rank");

  await page.locator("[data-setup-step='review']").click();
  await page
    .locator("#characterSetupPanel [data-setup-action='confirmSetup']")
    .first()
    .click();
  await expect(page.locator("#toastRegion")).toContainText(
    "Resolve invalid source-tracked starting Edges",
  );
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Needs review");

  await edgesPanel
    .locator(".setup-edge-card")
    .filter({ hasText: "Brave" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(edgesPanel).not.toContainText(
    "no longer satisfies starting Edge eligibility",
  );
  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Complete");
});

test("starting Edge validation flags stale invalid Hindrance benefit Edge choices", async ({
  page,
}) => {
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("#setupNameInput").fill("Stale Benefit Edge");

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page.locator("#setupAddHindranceBtn").click();
  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" })
    .getByRole("button", { name: "+" })
    .click();
  await hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" })
    .getByRole("button", { name: "Go to Edges" })
    .click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await edgesPanel
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");

  const source = await page.evaluate(
    () =>
      character.edges.find((edge) => edge.name === "Berserk")?.creationSource ||
      "",
  );
  expect(source).toBe("hindrance-benefit");

  await page.evaluate(() => {
    const brave = EDGE_CATALOG.find((edge) => edge.id === "swade-edge-brave");
    const benefitEdge = character.edges.find(
      (edge) => setupEdgeCreationSource(edge) === "hindrance-benefit",
    );
    Object.assign(benefitEdge, {
      ...brave,
      id: benefitEdge.id,
      catalogId: brave.id,
      source: "Hindrance benefit Edge",
      creationSource: "hindrance-benefit",
    });
    save();
    render();
  });

  await page.locator(".setup-step[data-setup-step='edges']").click();
  await expect(
    page.locator(".setup-step[data-setup-step='edges']"),
  ).toContainText("Needs review");
  await expect(edgesPanel).toContainText(
    "Hindrance benefit Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");
});
