const {
  test,
  expect,
  useAppTestHooks,
  STORAGE_KEY,
  CHARACTER_LIBRARY_KEY,
  SETUP_DRAFT_KEY,
  SETUP_PROGRESS_KEY,
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
    "Unnamed Character",
  );
  await expect(page.locator("#setupNameInput")).toHaveValue("");
  await expect(page.locator("#setupArchetypeInput")).toHaveValue("");
  await expect(page.locator("#setupNameInput")).toHaveAttribute(
    "placeholder",
    "Character Name",
  );
  await expect(page.locator("#setupGenderInput")).toHaveAttribute(
    "placeholder",
    "Gender Identity",
  );
  await expect(page.locator("#setupAgeInput")).toHaveAttribute(
    "placeholder",
    "32",
  );
  await expect(page.locator("#setupArchetypeInput")).toHaveAttribute(
    "placeholder",
    "Profession or Title",
  );
  await expect(page.locator("#setupPlayerInput")).toHaveAttribute(
    "placeholder",
    "Player Name",
  );
  await expect(page.locator("#setupDescriptionInput")).toHaveAttribute(
    "placeholder",
    "Tall, wary, dusty coat",
  );
  await expect(page.locator("#setupBackgroundInput")).toHaveAttribute(
    "placeholder",
    "Why they ride",
  );
  await expect(page.locator("[data-setup-step='concept']")).toContainText(
    "Incomplete",
  );
  await expect(page.locator(".setup-persistence-panel")).toHaveCount(0);
  await expect(page.locator("#characterSetupPanel")).toContainText(
    "Use the Next button at the bottom of each step.",
  );
  await expect(page.locator("#characterSetupPanel")).toContainText(
    "Progress is saved locally.",
  );
  await expect(page.locator("#characterSetupPanel")).toContainText(
    "Final save controls appear on Review.",
  );
  await expect(
    page.locator("[data-setup-action='saveDraftCharacter']"),
  ).toHaveCount(0);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await expect(page.locator("#setupConceptPanel")).toContainText(
    "Race / Ancestry",
  );
  await expect(page.locator("#setupConceptPanel")).toContainText("Human");
  await expect(page.locator("[data-setup-step='ancestry']")).toHaveCount(0);
  await expect(page.locator("#characterDossierLayout")).toBeHidden();
  await expect(page.locator("[data-setup-step='concept']")).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect
    .poll(() =>
      page.locator("#characterSetupStepper .setup-step").evaluateAll((steps) =>
        steps.map((step) => {
          const number = step
            .querySelector(".setup-step-number")
            ?.textContent.replace(/\s+/g, " ")
            .trim();
          const label = step
            .querySelector(".setup-step-label span:last-child")
            ?.textContent.replace(/\s+/g, " ")
            .trim();
          return `${number} ${label}`;
        }),
      ),
    )
    .toEqual([
      "1. Concept",
      "2. Attributes",
      "3. Skills",
      "4. Free Edge",
      "5. Hindrances",
      "6. Powers",
      "7. Gear",
      "8. Review",
    ]);

  await page.locator("[data-setup-step='traits']").click();
  await expect(page.locator("#setupTraitsPanel")).toContainText("Attributes");
  await expect(page.locator("#setupTraitsPanel")).toContainText(
    "Attribute Points",
  );
  await expect(
    page.locator("#setupTraitsPanel [data-setup-action='incAttribute']"),
  ).not.toHaveCount(0);

  const stored = await page.evaluate(
    ({ libraryKey, setupDraftKey, setupProgressKey, storageKey }) => {
      const library = JSON.parse(localStorage.getItem(libraryKey) || "null");
      const setupDraft = JSON.parse(
        localStorage.getItem(setupDraftKey) || "null",
      );
      const setupProgress = JSON.parse(
        localStorage.getItem(setupProgressKey) || "null",
      );
      const tracker = JSON.parse(localStorage.getItem(storageKey) || "null");
      return {
        slotCount: Object.keys(library?.charactersById || {}).length,
        activeSource:
          library?.charactersById?.[library.activeCharacterId]?.source || "",
        setupDraftSource: setupDraft?.character?.source || "",
        setupDraftName: setupDraft?.character?.name ?? "__missing__",
        setupDraftArchetype: setupDraft?.character?.archetype ?? "__missing__",
        setupDraftLanguageDie:
          setupDraft?.character?.skills?.find(
            (skill) => skill.name === "Language",
          )?.die || "",
        setupDraftLanguageCore: Boolean(
          setupDraft?.character?.skills?.find(
            (skill) => skill.name === "Language",
          )?.core,
        ),
        setupDraftStep: setupDraft?.step || "",
        setupProgressStep: setupProgress?.step || "",
        trackerSource: tracker?.source || "",
        hasBaseline: Boolean(tracker?.creationBaseline),
      };
    },
    {
      libraryKey: CHARACTER_LIBRARY_KEY,
      setupDraftKey: SETUP_DRAFT_KEY,
      setupProgressKey: SETUP_PROGRESS_KEY,
      storageKey: STORAGE_KEY,
    },
  );
  expect(stored).toEqual({
    slotCount: 0,
    activeSource: "",
    setupDraftSource: "created",
    setupDraftName: "",
    setupDraftArchetype: "",
    setupDraftLanguageDie: "d8",
    setupDraftLanguageCore: true,
    setupDraftStep: "traits",
    setupProgressStep: "traits",
    trackerSource: "",
    hasBaseline: false,
  });

  await page.reload();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterName")).toContainText(
    "Unnamed Character",
  );
  await expect(page.locator("[data-setup-step='traits']")).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(page.locator("#setupTraitsPanel")).toContainText("Attributes");

  await page.locator("[data-setup-step='review']").click();
  await page.locator("[data-setup-action='saveDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogInput").fill("Saved Draft Prospect");
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );
  await expect(page.locator(".setup-persistence-panel")).toContainText(
    "Review and save character",
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

  await page.locator("#setupMainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator("#landingCreateBtn")).toHaveText(
    "Create/Edit Character",
  );
  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page
    .locator("#appDialog")
    .getByRole("button", { name: "Create New Character" })
    .click();
  await expect(page.locator("#characterName")).toContainText(
    "Unnamed Character",
  );
  await expect(page.locator("#setupNameInput")).toHaveValue("");
  await expect(page.locator("#setupArchetypeInput")).toHaveValue("");
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

  await page.locator("[data-setup-step='review']").click();
  await expect(
    page.locator("[data-setup-action='discardDraftCharacter']"),
  ).toBeVisible();
  await page.locator("[data-setup-action='discardDraftCharacter']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );

  await page.locator("[data-setup-step='review']").click();
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

test("loads stale setup placeholder names as empty concept fields", async ({
  page,
}) => {
  await page.evaluate(
    ({ setupDraftKey }) => {
      const draft = normalize(
        {
          source: "created",
          setupStatus: "needsReview",
          name: "Untitled Character",
          archetype: "Drifter",
          rank: "Novice",
          ancestry: "Human",
          attributes: {},
          skills: [],
        },
        { preserveBlankConceptFields: true },
      );
      localStorage.setItem(
        setupDraftKey,
        JSON.stringify({
          schemaVersion: APP_SCHEMA_VERSION,
          step: "concept",
          savedAt: new Date().toISOString(),
          character: serializeCharacterForStorage(draft),
        }),
      );
    },
    { setupDraftKey: SETUP_DRAFT_KEY },
  );

  await page.reload();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText(
    "Unnamed Character",
  );
  await expect(page.locator("#setupNameInput")).toHaveValue("");
  await expect(page.locator("#setupArchetypeInput")).toHaveValue("");
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
  await expect(page.locator(".shell")).not.toHaveClass(/character-setup-page/);
  await expect(page.locator(".shell > .hero")).toBeVisible();
  await expect(page.locator("#appTabs")).toBeVisible();
  await expect(page.locator("#setupMainMenuBtn")).toBeHidden();
  await expect(page.locator("#headerToolsMenu")).toBeVisible();

  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSummaryName")).toContainText(
    "Dusty McCaw",
  );
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    "Drifter",
  );
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    "Human",
  );
  await expect(page.locator("#characterBasicsList")).not.toContainText("Human");
  await expect(page.locator("#characterBasicsList")).not.toContainText(
    "Novice",
  );
  await expect(page.locator("#characterBasicsList")).toBeHidden();
  await expect(page.locator("#characterDerivedDetails")).toContainText("Pace");
  await expect(page.locator("#characterDerivedDetails")).toContainText("Parry");
  await expect(page.locator("#characterDerivedDetails")).toContainText(
    "Toughness",
  );
  await expect(page.locator("#attributesList")).toContainText("Agility");
  await expect(page.locator("#skillsList")).toContainText("Shooting");
  await expect(page.locator("#skillsList")).not.toContainText("Psionics");
  await expect(page.locator("#edgesList")).toContainText("Healer");
  await expect(page.locator("#hindrancesList")).toContainText("Bad Luck");

  await expect(page.locator("#reviewSetupBtn")).toBeVisible();
  await expect(page.locator("#manageCharacterBtn")).toHaveCount(0);
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
  await expect(page.locator("#characterSetupStepper")).toBeHidden();
  await expect(page.locator("#setupConceptPanel")).toBeHidden();
  await expect(page.locator("#setupSaveConceptBtn")).toHaveCount(0);
  await expect(page.locator("#showAdvanceFormBtn")).toBeVisible();
  await expect(page.locator("#showEdgeFormBtn")).toBeHidden();
  await expect(page.locator("#showHindranceFormBtn")).toBeHidden();
  await expect(
    page.locator("#characterPanel #addManualPowerPointsBtn"),
  ).toHaveCount(0);
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#edgeEditorPanel")).toBeHidden();
  await expect(page.locator("#hindranceEditorPanel")).toBeHidden();

  await openHeaderMenu(page);
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await expect(page.locator("#characterProfileEditor")).toBeVisible();

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await page.locator("#reviewSetupBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator(".shell")).toHaveClass(/character-setup-page/);
  await expect(page.locator(".shell > .hero")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#setupMainMenuBtn")).toBeVisible();
  await expect(page.locator("#headerToolsMenu")).toBeHidden();
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
  await page.locator("#setupGenderInput").fill("Female");
  await page.locator("#setupAgeInput").fill("29");
  await page.locator("#setupArchetypeInput").fill("Trail Scout");
  await page.locator("#setupPlayerInput").fill("Playwright");
  await expect(page.locator("#characterDossierSubtitle")).not.toContainText(
    "Playwright",
  );
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    "Trail Scout",
  );

  await expect(page.locator("[data-setup-action='finishSetup']")).toHaveCount(
    0,
  );
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupTraitsPanel")).toBeVisible();
  await expect(
    page.locator("[data-setup-action='previousSetupStep']"),
  ).toHaveText("Previous: Concept");
  await page.locator("[data-setup-action='previousSetupStep']").click();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupTraitsPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupSkillsPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupEdgesPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupHindrancesPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupPowersPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupGearPanel")).toBeVisible();
  await page.locator("[data-setup-action='nextSetupStep']").click();
  await expect(page.locator("#setupReviewPanel")).toBeVisible();

  await page.locator("[data-setup-action='finishSetup']").click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await expect(page.locator("#appDialogTitle")).toHaveText("Finish setup?");
  await expect(page.locator("#appDialogMessage")).toContainText("Attributes");
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

test("shows human ancestry in concept setup", async ({ page }) => {
  await enterTracker(page);
  await openCharacterSetupReview(page);

  await expect(page.locator("[data-setup-step='ancestry']")).toHaveCount(0);
  await expect(page.locator("#setupRaceAncestryPanel")).toHaveCount(0);

  await page.locator("[data-setup-step='concept']").click();
  const conceptPanel = page.locator("#setupConceptPanel");
  await expect(conceptPanel).toBeVisible();
  await expect(
    conceptPanel.getByRole("heading", {
      name: "Concept",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("[data-setup-step='concept']")).toContainText(
    "Incomplete",
  );
  await expect(conceptPanel).toContainText("Race / Ancestry");
  await expect(conceptPanel).toContainText("Human");
  await expect(conceptPanel).not.toContainText("Supported by This Profile");

  const ancestryFollowsPlayer = await conceptPanel
    .getByText("Race / Ancestry")
    .first()
    .evaluate((ancestryElement) => {
      const playerInput = document.querySelector("#setupPlayerInput");
      return Boolean(
        playerInput &&
        playerInput.compareDocumentPosition(ancestryElement) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
  expect(ancestryFollowsPlayer).toBe(true);

  const fixedAncestryTop = await conceptPanel
    .getByText("Race / Ancestry")
    .first()
    .evaluate((element) => element.getBoundingClientRect().top);
  const descriptionTop = await page
    .locator("#setupDescriptionInput")
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(fixedAncestryTop).toBeLessThan(descriptionTop);

  const stepTopSpread = await page
    .locator("#characterSetupStepper .setup-step")
    .evaluateAll((steps) => {
      const tops = steps.map((step) => step.getBoundingClientRect().top);
      return Math.max(...tops) - Math.min(...tops);
    });
  expect(stepTopSpread).toBeLessThanOrEqual(1);

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

  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#appTabs")).toBeHidden();
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
