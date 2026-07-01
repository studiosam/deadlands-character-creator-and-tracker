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

test("finalizing setup snapshots source-tracked creation baseline and round-trips import", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const arcaneEdge = EDGE_CATALOG.find(
      (item) => item.id === "dl-edge-arcane-background-blessed",
    );
    const config = arcaneBackgroundConfigFromEdge(arcaneEdge.name);
    const characterData = normalize({
      source: "created",
      setupStatus: "needsReview",
      name: "Baseline Source Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Blessed Drifter",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [
        { name: "Faith", die: "d4", linkedAttribute: "Spirit" },
        { name: "Notice", die: "d4", linkedAttribute: "Smarts", core: true },
      ],
      hindrances: [
        {
          id: "hindrance-big-mouth",
          name: "Big Mouth",
          severity: "Minor",
          notes: "Cannot keep secrets.",
        },
      ],
      edges: [
        {
          ...arcaneEdge,
          id: "baseline-blessed-edge",
          catalogId: arcaneEdge.id,
          source: "Human free Edge",
          isCustom: false,
        },
      ],
      arcaneBackground: makeArcaneBackgroundState(config),
      powers: [
        { catalogId: "power-holy-symbol" },
        { catalogId: "power-barrier" },
        { catalogId: "power-protection" },
      ],
      resources: [
        {
          id: "power-points",
          name: "Power Points",
          current: 15,
          max: 15,
        },
      ],
      inventory: [
        {
          id: "backpack",
          name: "Backpack",
          count: 1,
          weight: 3,
          costCents: 200,
        },
      ],
      moneyCents: 24800,
      ammo: {},
      weapons: [],
      armorInventory: [],
      consumables: [],
      vehicles: [],
      advances: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "baseline-source-character",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "review";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-action='finishSetup']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);

  const finalized = await page.evaluate(
    (storageKey) => JSON.parse(localStorage.getItem(storageKey) || "null"),
    STORAGE_KEY,
  );
  expect(finalized.creationBaseline).toEqual(
    expect.objectContaining({
      version: 1,
      source: "setup",
      attributes: expect.objectContaining({ spirit: "d6" }),
      money: expect.objectContaining({
        cents: 24800,
        creationSource: "setup-starting-funds",
      }),
    }),
  );
  expect(finalized.creationBaseline.capturedAt).toBeTruthy();
  expect(finalized.hindrances[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-hindrance",
      source: "Starting Hindrance",
    }),
  );
  expect(finalized.edges[0]).toEqual(
    expect.objectContaining({
      creationSource: "human-free-edge",
      source: "Human free Edge",
    }),
  );
  expect(finalized.resources[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-arcane-background",
      source: "Setup: Arcane Background (Blessed)",
    }),
  );
  expect(finalized.powers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Holy Symbol",
        creationSource: "setup-starting-power",
        source: "Starting Power",
      }),
    ]),
  );
  expect(finalized.inventory[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-gear",
      source: "Starting Gear Purchase",
    }),
  );
  expect(finalized.creationBaseline.gear.inventory[0]).toEqual(
    expect.objectContaining({
      creationSource: "setup-starting-gear",
    }),
  );

  await reloadIntoTracker(page);
  await openCharacterSetupReview(page);
  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Setup Source Audit",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Needs GM/Table Exception",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("0");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Explained by Starting Gear Purchase.",
  );

  const exported = await page.evaluate(() => serializeTrackerExport(character));
  await page.evaluate((payload) => {
    localStorage.clear();
    importJsonText(JSON.stringify(payload));
  }, exported);

  const imported = await page.evaluate(() => ({
    name: character.name,
    setupStatus: character.setupStatus,
    hindranceSource: character.hindrances[0]?.creationSource || "",
    powerSource: character.powers[0]?.creationSource || "",
    gearSource: character.inventory[0]?.creationSource || "",
    baselineGearSource:
      character.creationBaseline?.gear?.inventory?.[0]?.creationSource || "",
    baselineMoneySource:
      character.creationBaseline?.money?.creationSource || "",
  }));
  expect(imported).toEqual({
    name: "Baseline Source Character",
    setupStatus: "complete",
    hindranceSource: "setup-starting-hindrance",
    powerSource: "setup-starting-power",
    gearSource: "setup-starting-gear",
    baselineGearSource: "setup-starting-gear",
    baselineMoneySource: "setup-starting-funds",
  });

  await reloadIntoTracker(page);
  const reloaded = await page.evaluate(() => ({
    baselinePowers: character.creationBaseline?.powers?.length || 0,
    baselineResourceSource:
      character.creationBaseline?.resources?.[0]?.creationSource || "",
    baselineCapturedAt: character.creationBaseline?.capturedAt || "",
  }));
  expect(reloaded.baselinePowers).toBe(3);
  expect(reloaded.baselineResourceSource).toBe("setup-arcane-background");
  expect(reloaded.baselineCapturedAt).toBeTruthy();
});

test("marks setup source audit records as GM table exceptions", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const characterData = normalize({
      source: "created",
      setupStatus: "needsReview",
      name: "Exception Setup Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Oddity",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [],
      hindrances: [],
      edges: [],
      powers: [],
      resources: [],
      advances: [],
      inventory: [
        {
          id: "mysterious-relic",
          name: "Mysterious Relic",
          count: 1,
          weight: 1,
          costCents: 0,
        },
      ],
      ammo: {},
      weapons: [],
      armorInventory: [],
      consumables: [],
      vehicles: [],
    });
    const entry = addCharacterSlot(characterData, {
      source: "test",
      preferredId: "exception-setup-character",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "review";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("[data-setup-step='review']").click();

  const relicAuditRow = page.locator("#setupReviewPanel .dossier-note").filter({
    hasText: "Mysterious Relic",
  });
  await expect(relicAuditRow).toContainText("Needs a GM/table exception note");
  await relicAuditRow.getByRole("button", { name: "Mark Exception" }).click();

  await expect(
    page.locator("#setupReviewPanel .dossier-note").filter({
      hasText: "Mysterious Relic",
    }),
  ).toContainText("Explained by GM / table exception.");

  const snapshot = await page.evaluate((storageKey) => {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    const relic = stored.inventory.find(
      (item) => item.id === "mysterious-relic",
    );
    return {
      liveSource: relic.creationSource,
      liveSourceLabel: relic.source,
      liveSourceDetail: relic.sourceDetail,
      exception: stored.setupExceptions[0],
      baselineRelicSource:
        stored.creationBaseline.gear.inventory[0].creationSource,
      baselineExceptionSource:
        stored.creationBaseline.setupExceptions[0].creationSource,
    };
  }, STORAGE_KEY);
  expect(snapshot.liveSource).toBe("setup-gm-exception");
  expect(snapshot.liveSourceLabel).toBe("GM / table exception");
  expect(snapshot.liveSourceDetail).toEqual(
    expect.objectContaining({
      kind: "setup-exception",
      recordCollection: "inventory",
      recordId: "mysterious-relic",
      recordType: "Gear",
      displayLabel: "Mysterious Relic",
    }),
  );
  expect(snapshot.exception).toEqual(
    expect.objectContaining({
      type: "setup-exception",
      label: "Mysterious Relic",
      recordCollection: "inventory",
      recordId: "mysterious-relic",
      creationSource: "setup-gm-exception",
      source: "GM / table exception",
    }),
  );
  expect(snapshot.baselineRelicSource).toBe("setup-gm-exception");
  expect(snapshot.baselineExceptionSource).toBe("setup-gm-exception");

  const exported = await page.evaluate(() => serializeTrackerExport(character));
  await page.evaluate((payload) => {
    localStorage.clear();
    importJsonText(JSON.stringify(payload));
  }, exported);

  const imported = await page.evaluate(() => ({
    relicSource:
      character.inventory.find((item) => item.id === "mysterious-relic")
        ?.creationSource || "",
    exceptionSource: character.setupExceptions?.[0]?.creationSource || "",
    baselineExceptionSource:
      character.creationBaseline?.setupExceptions?.[0]?.creationSource || "",
  }));
  expect(imported).toEqual({
    relicSource: "setup-gm-exception",
    exceptionSource: "setup-gm-exception",
    baselineExceptionSource: "setup-gm-exception",
  });
});

test("shows usage notes and audits setup traits, edges, powers, and gear", async ({
  page,
}) => {
  await importSavagedSample(
    page,
    "savaged-us-json-export-character-Dusty McCaw.json",
  );
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("[data-setup-step='attributesSkills']"),
  ).toContainText("Complete");
  await page.locator("[data-setup-step='attributesSkills']").click();
  const setupTraitsPanel = page.locator("#setupTraitsPanel");
  await expect(setupTraitsPanel).toContainText("Traits");

  const agilityCard = setupTraitsPanel
    .locator(".attribute-die-card")
    .filter({ hasText: "Agility" });
  await expect(agilityCard).toHaveAttribute("title", /Coordination/);
  await agilityCard.hover();
  await expect(agilityCard.locator(".trait-help")).toBeVisible();
  await expect(agilityCard.locator(".trait-help")).toContainText(
    "Coordination",
  );

  const shootingChip = setupTraitsPanel
    .locator(".skill-chip")
    .filter({ hasText: "Shooting" });
  await expect(shootingChip).toHaveAttribute("title", /Ranged attacks/);
  await shootingChip.hover();
  await expect(shootingChip.locator(".trait-help")).toBeVisible();
  await expect(shootingChip.locator(".trait-help")).toContainText(
    "Linked attribute: Agility",
  );

  await expect(setupTraitsPanel).toContainText("Advanced character");
  await expect(setupTraitsPanel).toContainText("All Skills Shown");
  await expect(setupTraitsPanel).toContainText("Unskilled Value");
  await expect(setupTraitsPanel).toContainText("d4-2");
  await expect(
    setupTraitsPanel.locator("[data-setup-action='incAttribute']"),
  ).toHaveCount(0);
  await expect(
    page
      .locator("#setupTraitsPanel .skill-chip")
      .filter({ hasText: "Healing" }),
  ).toHaveAttribute("title", /Treating wounds/);
  await expect(
    page
      .locator("#setupTraitsPanel .skill-chip:not(.unskilled)")
      .filter({ hasText: "Healing" }),
  ).toHaveCSS("border-style", "solid");

  const unskilledAcademics = setupTraitsPanel
    .locator(".skill-chip.unskilled")
    .filter({ hasText: "Academics" });
  await expect(unskilledAcademics).toContainText("d4-2");
  await expect(unskilledAcademics).toContainText("Unskilled");
  await expect(unskilledAcademics).toHaveAttribute("title", /Formal education/);
  await expect(unskilledAcademics).toHaveCSS("border-style", "dashed");

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='edges']").click();
  const setupEdgesPanel = page.locator("#setupEdgesPanel");
  await expect(setupEdgesPanel).toContainText("Recorded Edges");
  await expect(setupEdgesPanel).toContainText("Catalog Matches");
  await expect(setupEdgesPanel).toContainText("Arcane Background Edges");
  await expect(setupEdgesPanel).toContainText("Arcane Background (Blessed)");
  await expect(setupEdgesPanel).toContainText("Healer");
  await expect(setupEdgesPanel).toContainText("Catalog matched");
  await expect(setupEdgesPanel).toContainText("Imported Advance Edge");
  await expect(setupEdgesPanel).toContainText("Imported selected Edge");
  await expect(setupEdgesPanel).toContainText("Spirit d6+, Faith d4+");
  await expect(setupEdgesPanel).not.toContainText(
    "more than one Arcane Background Edge",
  );

  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='powers']").click();
  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(setupPowersPanel).toContainText("Arcane Background");
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Power Points");
  await expect(setupPowersPanel).toContainText("15 / 15");
  await expect(setupPowersPanel).toContainText("Expected Starting Powers");
  await expect(setupPowersPanel).toContainText("Holy Symbol");
  await expect(setupPowersPanel).toContainText("Barrier");
  await expect(setupPowersPanel).toContainText("Protection");

  await expect(page.locator("[data-setup-step='gear']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='gear']").click();
  const setupGearPanel = page.locator("#setupGearPanel");
  await expect(setupGearPanel).toContainText("Money");
  await expect(setupGearPanel).toContainText("Weapons");
  await expect(setupGearPanel).toContainText("Armor");
  await expect(setupGearPanel).toContainText("Current Load");
  await expect(setupGearPanel).toContainText("Combat Load");
  await expect(setupGearPanel).toContainText("Carrying Capacity");
  await expect(setupGearPanel).toContainText("Colt Army");
  await expect(setupGearPanel).toContainText("Winchester");
  await expect(setupGearPanel).toContainText("Native Armor");
  await expect(setupGearPanel).toContainText("Ammunition");

  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText("Edge Count");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Arcane Background Edges",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("Known Powers");
  await expect(page.locator("#setupReviewPanel")).toContainText("Gear Items");
});

test("edits setup traits for created characters and stores the creation baseline", async ({
  page,
}) => {
  await enterTracker(page);
  const createdCharacter = {
    source: "created",
    name: "Setup Trait Editor",
    rank: "Novice",
    ancestry: "Human",
    archetype: "Drifter",
    attributes: {
      agility: "d4",
      smarts: "d4",
      spirit: "d4",
      strength: "d4",
      vigor: "d4",
    },
    skills: [
      { name: "Athletics", die: "d4", linkedAttribute: "agility", core: true },
      {
        name: "Common Knowledge",
        die: "d4",
        linkedAttribute: "smarts",
        core: true,
      },
      { name: "Notice", die: "d4", linkedAttribute: "smarts", core: true },
      {
        name: "Persuasion",
        die: "d4",
        linkedAttribute: "spirit",
        core: true,
      },
      { name: "Stealth", die: "d4", linkedAttribute: "agility", core: true },
    ],
    hindrances: [],
    edges: [],
    advances: [],
    creation: {
      normalAttributePointsAvailable: 5,
      normalSkillPointsAvailable: 12,
      extraAttributeRaisesFromHindrances: 0,
      extraSkillPointsFromHindrances: 0,
      finalized: true,
    },
    creationBaseline: {
      attributes: {
        agility: "d4",
        smarts: "d4",
        spirit: "d4",
        strength: "d4",
        vigor: "d4",
      },
      skills: [],
    },
    moneyCents: 0,
    ammo: {},
    weapons: [],
    armorInventory: [],
    inventory: [],
    consumables: [],
    vehicles: [],
    resources: [],
    powers: [],
  };

  await openHeaderMenu(page);
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(JSON.stringify(createdCharacter));
  await page.locator("#confirmPasteImportBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Setup Trait Editor",
  );

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(
    page.locator("[data-setup-step='attributesSkills']"),
  ).toContainText("Incomplete");
  await page.locator("[data-setup-step='attributesSkills']").click();
  const setupTraitsPanel = page.locator("#setupTraitsPanel");
  await expect(setupTraitsPanel).toContainText("Edit starting Attributes");
  await expect(setupTraitsPanel).toContainText("Attribute Points");
  await expect(setupTraitsPanel).toContainText("0 / 5");

  const agilityRow = setupTraitsPanel
    .locator(".setup-trait-editor-row:not(.skill-row)")
    .filter({ hasText: "Agility" });
  await agilityRow.locator("[data-setup-action='incAttribute']").click();
  await expect(agilityRow).toContainText("d6");
  await expect(setupTraitsPanel).toContainText("1 / 5");

  const shootingRow = setupTraitsPanel
    .locator(".setup-trait-editor-row.skill-row")
    .filter({ hasText: "Shooting" });
  await expect(shootingRow).toContainText("d4-2");
  await shootingRow.locator("[data-setup-action='incSkill']").click();
  await expect(shootingRow).toContainText("d4");
  await expect(shootingRow).toContainText("Cost 1");

  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  expect(stored.creationBaseline.attributes.agility).toBe("d6");
  expect(stored.attributes.agility).toBe("d6");
  expect(
    stored.creationBaseline.skills.some(
      (skill) => skill.name === "Shooting" && skill.die === "d4",
    ),
  ).toBe(true);
});
