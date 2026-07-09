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
    "e.g. Abigail Stone",
  );
  await expect(page.locator("#setupGenderInput")).toHaveValue("");
  await expect
    .poll(() =>
      page.locator("#setupGenderInput option").evaluateAll((options) =>
        options.map((option) => ({
          label: option.textContent.trim(),
          value: option.value,
        })),
      ),
    )
    .toEqual([
      { label: "Choose gender...", value: "" },
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
      { label: "Nonbinary", value: "Nonbinary" },
    ]);
  await expect(page.locator("#setupAgeInput")).toHaveAttribute(
    "placeholder",
    "e.g. 19, 40s, elderly",
  );
  await expect(page.locator("#setupArchetypeInput")).toHaveAttribute(
    "placeholder",
    "e.g. drifter, deputy, huckster",
  );
  await expect(page.locator("#setupPlayerInput")).toHaveAttribute(
    "placeholder",
    "e.g. player at the table",
  );
  await expect(page.locator("#setupConceptPanel")).toContainText(
    "Player Name (optional)",
  );
  await expect(page.locator("#setupDescriptionInput")).toHaveAttribute(
    "placeholder",
    "Build, clothes, voice, obvious habits",
  );
  await expect(page.locator("#setupBackgroundInput")).toHaveAttribute(
    "placeholder",
    "Where they came from and why they ride",
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
    "Setup finalization appears on Gear.",
  );
  await expect(
    page.locator(
      ".setup-step-navigation-previous [data-setup-action='randomizeConceptEmpty']",
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      ".setup-step-navigation-previous [data-setup-action='randomizeConceptAll']",
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      "#setupConceptPanel [data-setup-action='randomizeConceptEmpty']",
    ),
  ).toHaveCount(0);
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
      "4. Edges",
      "5. Hindrances",
      "6. Powers",
      "7. Gear",
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

  await page.locator("[data-setup-step='concept']").click();
  await page.locator("#setupNameInput").fill("Saved Draft Prospect");
  await expect(page.locator("#characterName")).toContainText(
    "Saved Draft Prospect",
  );
  await page.locator("#setupMainMenuBtn").click();
  const saveDraftDialog = page.locator("#appDialog");
  await expect(saveDraftDialog).toBeVisible();
  await saveDraftDialog.getByRole("button", { name: "Save Draft" }).click();
  await expect(page.locator("#landingPage")).toBeVisible();

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

  await page.locator("#setupMainMenuBtn").click();
  const unsavedDraftDialog = page.locator("#appDialog");
  await expect(unsavedDraftDialog).toBeVisible();
  await expect(unsavedDraftDialog.locator("#appDialogTitle")).toHaveText(
    "Unsaved Character Draft",
  );
  await expect(
    unsavedDraftDialog.getByRole("button", { name: "Stay Here" }),
  ).toHaveCount(1);
  await unsavedDraftDialog.getByRole("button", { name: "Stay Here" }).click();
  await expect(unsavedDraftDialog).toBeHidden();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();

  await page.locator("#setupMainMenuBtn").click();
  await expect(unsavedDraftDialog).toBeVisible();
  const discardDraftButton = unsavedDraftDialog.getByRole("button", {
    name: "Discard Draft",
  });
  await expect(discardDraftButton).toHaveClass(/danger/);
  await expect
    .poll(() =>
      discardDraftButton.evaluate(
        (button) => getComputedStyle(button).backgroundImage,
      ),
    )
    .toContain("linear-gradient");
  await discardDraftButton.click();
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
    .toBe(1);
});

test("randomizes Concept fields from Weird West name tables", async ({
  page,
}) => {
  await page.route("**/docs/deadlands_weird_west_names.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        firstNames: ["Ada"],
        lastNames: ["Carter"],
        professions: ["Bounty Hunter"],
        descriptionTraits: ["dust-worn"],
        descriptionDetails: ["a battered hat"],
        backgroundOrigins: ["a railroad camp"],
        backgroundTroubles: ["a debt came due"],
        backgroundMotives: ["work"],
      }),
    }),
  );
  await startNewCharacterFromLanding(page);
  await page.evaluate(() => {
    Math.random = () => 0;
  });

  await page.locator("#setupNameInput").fill("Kept Name");
  await page.getByRole("button", { name: "Randomize Empty Fields" }).click();

  await expect(page.locator("#setupNameInput")).toHaveValue("Kept Name");
  await expect(page.locator("#setupGenderInput")).toHaveValue("");
  await expect(page.locator("#setupAgeInput")).toHaveValue("18");
  await expect(page.locator("#setupArchetypeInput")).toHaveValue(
    "Bounty Hunter",
  );
  await expect(page.locator("#setupPlayerInput")).toHaveValue("");
  await expect(page.locator("#setupDescriptionInput")).toHaveValue(
    "dust-worn bounty hunter with a battered hat",
  );
  await expect(page.locator("#setupBackgroundInput")).toHaveValue(
    "Left a railroad camp after a debt came due; now rides for work.",
  );

  await page.locator("#setupGenderInput").selectOption("Male");
  await page.locator("#setupPlayerInput").fill("Kept Player");
  await page.getByRole("button", { name: "Randomize All Fields" }).click();

  await expect(page.locator("#setupNameInput")).toHaveValue("Ada Carter");
  await expect(page.locator("#setupGenderInput")).toHaveValue("Male");
  await expect(page.locator("#setupPlayerInput")).toHaveValue("Kept Player");
  await expect(page.locator("#setupAgeInput")).toHaveValue("18");
  await expect(page.locator("#setupArchetypeInput")).toHaveValue(
    "Bounty Hunter",
  );
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
    .locator("#setupGearPanel [data-setup-action='finishSetup']")
    .click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await page.getByRole("button", { name: "Character", exact: true }).click();
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

test("Gear finalization blocks unfinished setup and jumps to the relevant step", async ({
  page,
}) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await startNewCharacterFromLanding(page);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

  await page.locator("#setupNameInput").fill("Finished Setup Character");
  await page.locator("#setupGenderInput").selectOption("Female");
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
  await expect(page.locator("[data-setup-action='nextSetupStep']")).toHaveCount(
    0,
  );
  await expect(page.locator("[data-setup-step='review']")).toHaveCount(0);

  const gearPanel = page.locator("#setupGearPanel");
  await expect(gearPanel).toContainText("Finish Setup & Start Playing");
  await expect(gearPanel).toContainText(
    "Fix setup issues before starting play",
  );
  await expect(gearPanel).toContainText("Edges needs attention");
  await expect(
    gearPanel.getByRole("button", { name: "Fix setup issues" }),
  ).toBeDisabled();
  await gearPanel.getByRole("button", { name: "Go to Edges" }).click();
  await expect(page.locator("#setupEdgesPanel")).toBeVisible();
  await page.locator("[data-setup-step='concept']").click();
  await expect(page.locator("#characterName")).toContainText(
    "Finished Setup Character",
  );
  await expect(page.locator("#setupNameInput")).toHaveValue(
    "Finished Setup Character",
  );
});

test("Gear finalization starts play for a valid setup character", async ({
  page,
}) => {
  await enterTracker(page);
  await page.evaluate(() => {
    const alertness = EDGE_CATALOG.find(
      (edge) => edge.id === "swade-edge-alertness",
    );
    const characterData = normalize({
      source: "created",
      setupStatus: "needsReview",
      name: "Ready Gear Character",
      rank: "Novice",
      ancestry: "Human",
      archetype: "Scout",
      gender: "Nonbinary",
      age: "31",
      player: "Playwright",
      description: "A careful scout ready for table play.",
      background: "Built through the setup gear finalization test.",
      attributes: {
        agility: "d6",
        smarts: "d6",
        spirit: "d6",
        strength: "d6",
        vigor: "d6",
      },
      skills: [
        {
          name: "Athletics",
          die: "d4",
          linkedAttribute: "Agility",
          core: true,
        },
        {
          name: "Common Knowledge",
          die: "d4",
          linkedAttribute: "Smarts",
          core: true,
        },
        { name: "Notice", die: "d4", linkedAttribute: "Smarts", core: true },
        {
          name: "Persuasion",
          die: "d4",
          linkedAttribute: "Spirit",
          core: true,
        },
        { name: "Stealth", die: "d4", linkedAttribute: "Agility", core: true },
        {
          name: "Language",
          die: "d8",
          linkedAttribute: "Smarts",
          core: true,
        },
        { name: "Shooting", die: "d6", linkedAttribute: "Agility" },
        { name: "Fighting", die: "d6", linkedAttribute: "Agility" },
        { name: "Riding", die: "d6", linkedAttribute: "Agility" },
        { name: "Survival", die: "d6", linkedAttribute: "Smarts" },
        { name: "Healing", die: "d6", linkedAttribute: "Smarts" },
        { name: "Repair", die: "d6", linkedAttribute: "Smarts" },
      ],
      hindrances: [],
      edges: [
        {
          ...alertness,
          id: "ready-alertness",
          catalogId: alertness.id,
          creationSource: "human-free-edge",
          source: "Human free Edge",
          isCustom: false,
        },
      ],
      powers: [],
      resources: [],
      inventory: [
        {
          id: "ready-backpack",
          catalogId: "backpack",
          name: "Backpack",
          count: 1,
          weight: 3,
          costCents: 200,
          location: "carried",
          creationSource: "setup-starting-gear",
          source: "Starting Gear Purchase",
          sourceDetail: {
            kind: "starting-funds",
            purchaseType: "gear",
            catalogId: "backpack",
            costCents: 200,
            quantity: 1,
          },
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
      preferredId: "ready-gear-character",
    });
    character = normalize(entry.character);
    characterSetupReviewOpen = true;
    characterSetupStep = "gear";
    characterDraftMode = false;
    render();
    renderDemoExperience();
  });

  await page.getByRole("button", { name: "Character", exact: true }).click();
  const gearPanel = page.locator("#setupGearPanel");
  await expect(gearPanel).toBeVisible();
  await expect(gearPanel).toContainText("Finish Setup & Start Playing");
  await expect(gearPanel).toContainText("Current Inventory");
  await expect(gearPanel).toContainText("Backpack");

  const finalButton = gearPanel.getByRole("button", {
    name: "Finish Setup & Start Playing",
  });
  await expect(finalButton).toBeEnabled();
  await finalButton.click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSetupPanel")).toBeHidden();
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
  await expect(conceptPanel.locator(".setup-readonly-field")).toContainText(
    "Race / Ancestry",
  );
  await expect(conceptPanel.locator(".setup-readonly-value")).toHaveText(
    "Human",
  );
  await expect(conceptPanel.locator(".setup-readonly-value")).not.toContainText(
    "Race / Ancestry",
  );

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

  await expect(page.locator("[data-setup-step='review']")).toHaveCount(0);
  await page.locator("[data-setup-step='gear']").click();
  await expect(page.locator("#setupGearPanel")).toBeVisible();
  await expect(page.locator("#setupGearPanel")).toContainText(
    "Finish Setup & Start Playing",
  );
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
  await expect(page.locator("[data-setup-step='review']")).toHaveCount(0);
  await expect(page.locator("#setupGearPanel")).toBeVisible();
  const finalSetupButton = page.locator(
    "#setupGearPanel [data-setup-action='finishSetup']",
  );
  await expect(finalSetupButton).toBeVisible();
  await expect(finalSetupButton).toBeEnabled();
  await expect(page.locator("#setupGearPanel")).toContainText("warning");

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

  await finalSetupButton.click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await page.getByRole("button", { name: "Character", exact: true }).click();
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
  await expect(page.locator("[data-setup-step='review']")).toHaveCount(0);
  await expect(page.locator("#setupConceptPanel")).toBeVisible();

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
