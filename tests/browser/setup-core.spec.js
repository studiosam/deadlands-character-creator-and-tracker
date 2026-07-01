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

test("starts new characters directly in character setup @mobile", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await startNewCharacterFromLanding(page);

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
  await startNewCharacterFromLanding(page);
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
