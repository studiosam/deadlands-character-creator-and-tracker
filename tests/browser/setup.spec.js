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

test("starts new characters directly in character setup @mobile", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingCreateBtn").click();

  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#creationPanel")).toBeHidden();
  await expect(page.locator("#characterName")).toContainText(
    "Untitled Character",
  );
  await expect(page.locator(".setup-persistence-panel.unsaved")).toContainText(
    "Unsaved setup draft",
  );
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='concept']")).toHaveAttribute(
    "aria-current",
    "step",
  );

  await page.locator("[data-setup-step='attributesSkills']").click();
  await expect(page.locator("#setupTraitsPanel")).toContainText(
    "Edit starting Attributes",
  );
  await expect(
    page.locator("#setupTraitsPanel [data-setup-action='incAttribute']"),
  ).not.toHaveCount(0);

  const stored = await page.evaluate(
    ({ libraryKey, storageKey }) => {
      const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
      const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
      return {
        slotCount: Object.keys(library?.charactersById || {}).length,
        activeSource:
          library?.charactersById?.[library.activeCharacterId]?.source || "",
        trackerSource: tracker?.source || "",
        hasBaseline: Boolean(tracker?.creationBaseline),
      };
    },
    { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
  );
  expect(stored).toEqual({
    slotCount: 0,
    activeSource: "",
    trackerSource: "",
    hasBaseline: false,
  });

  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogInput").fill("Saved Draft Prospect");
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Saved character slot",
  );

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          return {
            slotCount: Object.keys(library?.charactersById || {}).length,
            activeSource:
              library?.charactersById?.[library.activeCharacterId]?.source ||
              "",
            trackerSource: tracker?.source || "",
            hasBaseline: Boolean(tracker?.creationBaseline),
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      slotCount: 1,
      activeSource: "created",
      trackerSource: "created",
      hasBaseline: true,
    });

  await openHeaderMenu(page);
  await expect(page.locator("#creatorModeBtn")).toHaveText("New Character");
  await page.locator("#creatorModeBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Untitled Character",
  );
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("#creationPanel")).toBeHidden();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Object.keys(
            JSON.parse(localStorage.getItem(key) || "null")?.charactersById ||
              {},
          ).length,
        CHARACTER_LIBRARY_KEY,
      ),
    )
    .toBe(1);

  await page.locator("[data-setup-action='discardDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );

  await page.locator("[data-setup-action='deleteCharacterSlot']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        (key) =>
          Object.keys(
            JSON.parse(localStorage.getItem(key) || "null")?.charactersById ||
              {},
          ).length,
        CHARACTER_LIBRARY_KEY,
      ),
    )
    .toBe(0);
});

test("normalizes legacy characters without setupStatus as complete", async ({
  page,
}) => {
  const setupStatus = await page.evaluate(
    () =>
      normalize({
        name: "Legacy Character",
        rank: "Novice",
        attributes: {},
        skills: [],
      }).setupStatus,
  );

  expect(setupStatus).toBe("complete");
});

test("shows a clean reference sheet for confirmed characters", async ({
  page,
}) => {
  await importSavagedSample(
    page,
    "savaged-us-json-export-character-Dusty McCaw.json",
  );
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page
    .locator("#characterSetupPanel [data-setup-action='confirmSetup']")
    .click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();

  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSummaryName")).toContainText(
    "Dusty McCaw",
  );
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    "Drifter",
  );
  await expect(page.locator("#characterBasicsList")).toContainText("Human");
  await expect(page.locator("#characterDerivedDetails")).toContainText("Pace");
  await expect(page.locator("#characterDerivedDetails")).toContainText("Parry");
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Toughness",
  );
  await expect(page.locator("#attributesList")).toContainText("Agility");
  await expect(page.locator("#skillsList")).toContainText("Shooting");
  await expect(page.locator("#edgesList")).toContainText("Healer");
  await expect(page.locator("#hindrancesList")).toContainText("Bad Luck");

  await expect(page.locator("#reviewSetupBtn")).toBeVisible();
  await expect(page.locator("#manageCharacterBtn")).toBeVisible();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#characterSetupStepper")).toBeHidden();
  await expect(page.locator("#setupConceptPanel")).toBeHidden();
  await expect(page.locator("#setupSaveConceptBtn")).toBeHidden();
  await expect(page.locator("#showAdvanceFormBtn")).toBeHidden();
  await expect(page.locator("#showEdgeFormBtn")).toBeHidden();
  await expect(page.locator("#showHindranceFormBtn")).toBeHidden();
  await expect(page.locator("#addManualPowerPointsBtn")).toBeHidden();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#edgeEditorPanel")).toBeHidden();
  await expect(page.locator("#hindranceEditorPanel")).toBeHidden();

  await page.locator("#manageCharacterBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await expect(page.locator("#characterProfileEditor")).toBeVisible();

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#characterSetupStepper")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeSetupStatus: active?.character?.setupStatus || "",
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      activeSetupStatus: "complete",
      trackerSetupStatus: "complete",
    });
});

test("finishes character setup and starts playing with a saved character", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Finished Setup Character");
  await page.locator("#setupArchetypeInput").fill("Trail Scout");
  await page.locator("#setupPlayerInput").fill("Playwright");

  await page.locator("[data-setup-action='finishSetup']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await expect(page.locator("#appDialogTitle")).toHaveText("Finish setup?");
  await expect(page.locator("#appDialogMessage")).toContainText("Hindrances");
  await expect(page.locator("#appDialogMessage")).toContainText("Traits");
  await page.locator("#appDialogConfirmBtn").click();

  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterName")).toContainText(
    "Finished Setup Character",
  );
  await expect(page.locator("#landingPage")).toBeHidden();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId]?.character ||
            null;
          return {
            slotCount: Object.keys(library?.charactersById || {}).length,
            activeName: active?.name || "",
            activeFinalized: Boolean(active?.creation?.finalized),
            activeSetupStatus: active?.setupStatus || "",
            trackerName: tracker?.name || "",
            trackerFinalized: Boolean(tracker?.creation?.finalized),
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      slotCount: 1,
      activeName: "Finished Setup Character",
      activeFinalized: true,
      activeSetupStatus: "complete",
      trackerName: "Finished Setup Character",
      trackerFinalized: true,
      trackerSetupStatus: "complete",
    });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(page.locator("#characterName")).toContainText(
    "Finished Setup Character",
  );

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();
  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Character ready to play",
  );
  await expect(
    page.locator("[data-setup-action='finishSetup']").first(),
  ).toHaveText("Start Playing");
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

test("shows human-only race ancestry setup as read-only", async ({ page }) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await page.locator("[data-setup-step='ancestry']").click();
  const ancestryPanel = page.locator("#setupRaceAncestryPanel");
  await expect(ancestryPanel).toBeVisible();
  await expect(
    ancestryPanel.getByRole("heading", {
      name: "Race / Ancestry",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-setup-step='ancestry']")).toContainText(
    "Complete",
  );
  await expect(ancestryPanel).toContainText("Current Race / Ancestry");
  await expect(ancestryPanel).toContainText("Human");
  await expect(ancestryPanel).toContainText("This step is read-only for now.");
  await expect(
    ancestryPanel.locator("input, select, textarea, button"),
  ).toHaveCount(0);

  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Race / Ancestry",
  );
  await expect(page.locator("#setupReviewPanel")).toContainText("Human");
});

test("selects hindrances in character setup and summarizes point expectations", async ({
  page,
}) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(hindrancePanel).toBeVisible();
  await expect(hindrancePanel).toContainText("Expected Selection");
  await expect(hindrancePanel).toContainText("At least 1 Hindrance");
  await expect(hindrancePanel).toContainText("Minor Hindrance");
  await expect(hindrancePanel).toContainText("1 point");
  await expect(hindrancePanel).toContainText("Major Hindrance");
  await expect(hindrancePanel).toContainText("2 points");
  await expect(hindrancePanel).toContainText("Benefit Point Cap");
  await expect(hindrancePanel).toContainText("4 points");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Incomplete",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("swade-hindrance-bad-luck");
  await page
    .locator("#setupHindranceNotesInput")
    .fill("Hard luck follows him.");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Bad Luck");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-cursed");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Cursed");
  await expect(hindrancePanel).toContainText("Benefit Points Counted");
  await expect(hindrancePanel).toContainText("Benefit Points Spent");
  await expect(hindrancePanel).toContainText("4 / 4");

  await page
    .locator("#setupHindranceCatalogSelect")
    .selectOption("dl-hindrance-tenderfoot");
  await page.locator("#setupAddHindranceBtn").click();
  await expect(hindrancePanel).toContainText("Tenderfoot");
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
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
    "Complete",
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

test("spends hindrance benefits and selects source-tracked setup edges", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Benefit Edge Character");
  await page.locator("#setupArchetypeInput").fill("Card Sharp");
  await page.locator("#setupSaveConceptBtn").click();
  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Saved character slot",
  );

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
  await expect(hindrancePanel).toContainText("Benefit Points Counted");
  await expect(hindrancePanel).toContainText("4 / 4");

  const attributeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Attribute Raises" });
  const edgeBenefitRow = hindrancePanel
    .locator(".setup-trait-editor-row")
    .filter({ hasText: "Edges" });
  await attributeBenefitRow.getByRole("button", { name: "+" }).click();
  await edgeBenefitRow.getByRole("button", { name: "+" }).click();
  await expect(hindrancePanel).toContainText("Benefit Points Spent");
  await expect(hindrancePanel).toContainText("4 / 4");
  await expect(attributeBenefitRow).toContainText("1 Attribute Raise");
  await expect(edgeBenefitRow).toContainText("1 Edge");

  await page.locator("[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await expect(edgesPanel).toContainText("Human Free Edge");
  await expect(edgesPanel).toContainText("0 / 1");
  await expect(edgesPanel).toContainText("Hindrance Benefit Edges");
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
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(edgesPanel).toContainText("Human free Edge");

  await page
    .locator("#setupHindranceBenefitEdgeSelect")
    .selectOption("swade-edge-berserk");
  await edgesPanel
    .getByRole("button", { name: "Add Hindrance Benefit Edge" })
    .click();
  await expect(edgesPanel).toContainText("Berserk");
  await expect(edgesPanel).toContainText("Hindrance benefit Edge");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );

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
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='edges']").click();
  await expect(page.locator("#setupEdgesPanel")).toContainText("Alertness");
  await expect(page.locator("#setupEdgesPanel")).toContainText("Berserk");
  await expect(page.locator("#setupEdgesPanel")).toContainText(
    "Human free Edge",
  );
  await expect(page.locator("#setupEdgesPanel")).toContainText(
    "Hindrance benefit Edge",
  );
});

test("filters starting Edge choices by Rank Trait and prerequisite Edge requirements", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("[data-setup-step='edges']").click();
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
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("#setupNameInput").fill("Stale Human Edge");
  await page.locator("[data-setup-step='edges']").click();

  const edgesPanel = page.locator("#setupEdgesPanel");
  await page
    .locator("#setupHumanFreeEdgeSelect")
    .selectOption("swade-edge-alertness");
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );

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

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );
  await expect(edgesPanel).toContainText(
    "Human free Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");

  await page
    .locator("#characterSetupPanel [data-setup-action='confirmSetup']")
    .first()
    .click();
  await expect(page.locator("#toastRegion")).toContainText(
    "Resolve invalid source-tracked starting Edges",
  );
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );

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
  await edgesPanel.getByRole("button", { name: "Add Human Free Edge" }).click();
  await expect(edgesPanel).toContainText("Alertness");
  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Complete",
  );
});

test("starting Edge validation flags stale invalid Hindrance benefit Edge choices", async ({
  page,
}) => {
  await page.locator("#landingCreateBtn").click();
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

  await page.locator("[data-setup-step='edges']").click();
  const edgesPanel = page.locator("#setupEdgesPanel");
  await page
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

  await expect(page.locator("[data-setup-step='edges']")).toContainText(
    "Needs review",
  );
  await expect(edgesPanel).toContainText(
    "Hindrance benefit Edge no longer satisfies starting Edge eligibility",
  );
  await expect(edgesPanel).toContainText("Spirit d6+");
});

test("Powers setup audit reports missing requirements for an Arcane Background", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Powers",
    preferredId: "missing-blessed-powers",
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Expected Arcane Skill");
  await expect(setupPowersPanel).toContainText("Faith d4+ linked to Spirit");
  await expect(setupPowersPanel).toContainText("Missing Faith d4+ for Blessed");
  await expect(setupPowersPanel).toContainText("Expected Power Points");
  await expect(setupPowersPanel).toContainText("15 Power Points");
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; none recorded.",
  );
  await expect(setupPowersPanel).toContainText("Expected Starting Powers");
  await expect(setupPowersPanel).toContainText(
    "Expected 3 starting powers; 0 recorded.",
  );
  await expect(setupPowersPanel).toContainText(
    "Holy Symbol is required for Blessed and is missing.",
  );

  const mutationSnapshot = await page.evaluate(() => ({
    powers: character.powers.length,
    powerPoints: Boolean(powerPointResource()),
  }));
  expect(mutationSnapshot).toEqual({
    powers: 0,
    powerPoints: false,
  });
});

test("Powers setup audit recognizes a complete starting arcane package", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Complete Blessed Powers",
    preferredId: "complete-blessed-powers",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("Blessed");
  await expect(setupPowersPanel).toContainText("Faith d4 linked to Spirit");
  await expect(setupPowersPanel).toContainText("15 / 15");
  await expect(setupPowersPanel).toContainText("3 / 3 expected");
  await expect(setupPowersPanel).toContainText("Holy Symbol: recorded");
  await expect(setupPowersPanel).toContainText("Barrier");
  await expect(setupPowersPanel).toContainText("Protection");
  await expect(
    setupPowersPanel.getByRole("button", { name: "Add Starting Power" }),
  ).toBeDisabled();
});

test("Powers setup creates and persists setup starting Power Points", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Missing Blessed Power Points",
    preferredId: "missing-blessed-power-points",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; none recorded.",
  );

  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power Points" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );

  const snapshot = await page.evaluate(() => {
    const powerPoints = powerPointResource();
    return {
      current: powerPoints?.current,
      max: powerPoints?.max,
      source: powerPoints?.source,
      creationSource: powerPoints?.creationSource,
    };
  });
  expect(snapshot).toEqual({
    current: 15,
    max: 15,
    source: "Setup: Arcane Background (Blessed)",
    creationSource: "setup-arcane-background",
  });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='powers']").click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  const persistedSource = await page.evaluate(
    () => powerPointResource()?.creationSource,
  );
  expect(persistedSource).toBe("setup-arcane-background");
});

test("Powers setup warns for mismatched Power Points and can reset them", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Mismatched Blessed Power Points",
    preferredId: "mismatched-blessed-power-points",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 10,
        max: 12,
        source: "Manual setup",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-protection"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Needs review",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 Power Points; recorded max is 12.",
  );
  await expect(setupPowersPanel).toContainText(
    "Expected 15 current Power Points; recorded current is 10.",
  );

  await setupPowersPanel
    .getByRole("button", { name: "Update Starting Power Points" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("15 / 15");

  const powerPoints = await page.evaluate(() => powerPointResource());
  expect(powerPoints).toEqual(
    expect.objectContaining({
      current: 15,
      max: 15,
      source: "Setup: Arcane Background (Blessed)",
      creationSource: "setup-arcane-background",
    }),
  );
});

test("Powers setup selection adds removes and persists setup starting powers", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Selectable Blessed Powers",
    preferredId: "selectable-blessed-powers",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
  });

  let setupPowersPanel = page.locator("#setupPowersPanel");
  await setupPowersPanel
    .getByRole("button", { name: "Add Holy Symbol" })
    .click();
  await page.locator("#setupStartingPowerSelect").selectOption("power-barrier");
  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power" })
    .click();
  await page
    .locator("#setupStartingPowerSelect")
    .selectOption("power-protection");
  await setupPowersPanel
    .getByRole("button", { name: "Add Starting Power" })
    .click();

  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Complete",
  );
  await expect(setupPowersPanel).toContainText("3 / 3 expected");

  const snapshot = await page.evaluate(() => ({
    catalogIds: character.powers.map((power) => power.catalogId).sort(),
    creationSources: character.powers.map((power) => power.creationSource),
    addedReasons: character.powers.map((power) => power.addedReason),
  }));
  expect(snapshot).toEqual({
    catalogIds: ["power-barrier", "power-holy-symbol", "power-protection"],
    creationSources: [
      "setup-starting-power",
      "setup-starting-power",
      "setup-starting-power",
    ],
    addedReasons: [
      "setup-starting-power",
      "setup-starting-power",
      "setup-starting-power",
    ],
  });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("[data-setup-step='powers']").click();

  setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(setupPowersPanel).toContainText("Setup starting Power");
  const persistedSources = await page.evaluate(() =>
    character.powers.map((power) => power.creationSource),
  );
  expect(persistedSources).toEqual([
    "setup-starting-power",
    "setup-starting-power",
    "setup-starting-power",
  ]);

  await setupPowersPanel
    .locator(".setup-power-card")
    .filter({ hasText: "Barrier" })
    .getByRole("button", { name: "Remove" })
    .click();
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Incomplete",
  );
  const afterRemove = await page.evaluate(() =>
    character.powers.map((power) => power.catalogId).sort(),
  );
  expect(afterRemove).toEqual(["power-holy-symbol", "power-protection"]);
});

test("Powers setup audit flags powers outside the Arcane Background list", async ({
  page,
}) => {
  await seedPowersSetupCharacter(page, {
    name: "Invalid Blessed Power",
    preferredId: "invalid-blessed-power",
    skills: [{ name: "Faith", die: "d4", linkedAttribute: "Spirit" }],
    resources: [
      {
        id: "power-points",
        name: "Power Points",
        current: 15,
        max: 15,
        source: "Arcane Background (Blessed)",
      },
    ],
    powerIds: ["power-holy-symbol", "power-barrier", "power-bolt"],
  });

  const setupPowersPanel = page.locator("#setupPowersPanel");
  await expect(page.locator("[data-setup-step='powers']")).toContainText(
    "Needs review",
  );
  await expect(setupPowersPanel).toContainText(
    "Bolt is not in the Blessed allowed power list.",
  );
  await expect(setupPowersPanel).toContainText("Bolt");

  const powers = await page.evaluate(() =>
    character.powers.map((power) => power.name),
  );
  expect(powers).toContain("Bolt");
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

  const agilityCard = page
    .locator("#attributesList .attribute-die-card")
    .filter({ hasText: "Agility" });
  await expect(agilityCard).toHaveAttribute("title", /Coordination/);
  await agilityCard.hover();
  await expect(agilityCard.locator(".trait-help")).toBeVisible();
  await expect(agilityCard.locator(".trait-help")).toContainText(
    "Coordination",
  );

  const shootingChip = page
    .locator("#skillsList .skill-chip")
    .filter({ hasText: "Shooting" });
  await expect(shootingChip).toHaveAttribute("title", /Ranged attacks/);
  await shootingChip.hover();
  await expect(shootingChip.locator(".trait-help")).toBeVisible();
  await expect(shootingChip.locator(".trait-help")).toContainText(
    "Linked attribute: Agility",
  );

  await expect(
    page.locator("[data-setup-step='attributesSkills']"),
  ).toContainText("Complete");
  await page.locator("[data-setup-step='attributesSkills']").click();
  const setupTraitsPanel = page.locator("#setupTraitsPanel");
  await expect(setupTraitsPanel).toContainText("Traits");
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

test("shows setup review for imported characters until confirmed @mobile", async ({
  page,
}) => {
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await enterTracker(page);
  await openHeaderMenu(page);
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(await sample.text());
  await page.locator("#confirmPasteImportBtn").click();
  await expect(page.locator("#characterName")).toContainText("Lehi Larson");

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#characterSetupStepper")).toBeVisible();
  await expect(page.locator("#setupReviewPanel")).toBeVisible();
  const confirmSetupButton = page.locator(
    "#characterSetupPanel [data-setup-action='confirmSetup']",
  );
  await expect(confirmSetupButton).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "needsReview",
      trackerStatus: "needsReview",
    });

  await confirmSetupButton.click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "complete",
      trackerStatus: "complete",
    });

  await reloadIntoTracker(page);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#reviewSetupBtn")).toBeVisible();

  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#setupReviewPanel")).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(
        ({ libraryKey, storageKey }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active = library?.charactersById?.[library.activeCharacterId];
          return {
            libraryStatus: active?.character?.setupStatus || "",
            trackerStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      libraryStatus: "complete",
      trackerStatus: "complete",
    });
});
