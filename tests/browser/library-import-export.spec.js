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

test("keeps duplicated character state independent across switching and reload @mobile", async ({
  page,
}) => {
  const originalName = "Healthy Character";
  const duplicateName = "Wounded Character";

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await renameActiveCharacter(page, originalName);
  await openCombat(page);
  await increaseWounds(page);
  await expectWounds(page, 1);

  await openCharacterLibrary(page);
  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await renameActiveCharacter(page, duplicateName);

  await openCombat(page);
  await expectWounds(page, 1);
  await increaseWounds(page);
  await expectWounds(page, 2);

  await switchToCharacter(page, originalName);
  await openCombat(page);
  await expectWounds(page, 1);

  await switchToCharacter(page, duplicateName);
  await openCombat(page);
  await expectWounds(page, 2);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, originalName, duplicateName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const entries = Object.values(library?.charactersById || {});
          const original = entries.find((entry) => entry.name === originalName);
          const duplicate = entries.find(
            (entry) => entry.name === duplicateName,
          );
          return {
            count: entries.length,
            originalEntryName: original?.name || "",
            originalCharacterName: original?.character?.name || "",
            originalWounds: original?.character?.damage?.wounds ?? null,
            duplicateEntryName: duplicate?.name || "",
            duplicateCharacterName: duplicate?.character?.name || "",
            duplicateWounds: duplicate?.character?.damage?.wounds ?? null,
            distinctIds:
              Boolean(original?.id) &&
              Boolean(duplicate?.id) &&
              original.id !== duplicate.id,
            activeName:
              library?.charactersById?.[library.activeCharacterId]?.name || "",
            activeCharacterName:
              library?.charactersById?.[library.activeCharacterId]?.character
                ?.name || "",
            trackerName: tracker?.name || "",
            trackerWounds: tracker?.damage?.wounds ?? null,
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          originalName,
          duplicateName,
        },
      ),
    )
    .toEqual({
      count: 2,
      originalEntryName: originalName,
      originalCharacterName: originalName,
      originalWounds: 1,
      duplicateEntryName: duplicateName,
      duplicateCharacterName: duplicateName,
      duplicateWounds: 2,
      distinctIds: true,
      activeName: duplicateName,
      activeCharacterName: duplicateName,
      trackerName: duplicateName,
      trackerWounds: 2,
    });

  await reloadIntoTracker(page);
  await expect(page.locator("#characterName")).toContainText(duplicateName);
  await expectWounds(page, 2);

  await switchToCharacter(page, originalName);
  await openCombat(page);
  await expectWounds(page, 1);

  await switchToCharacter(page, duplicateName);
  await openCombat(page);
  await expectWounds(page, 2);
});

test("manages multiple local character save slots", async ({ page }) => {
  await page.locator("#landingLoadSampleBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();

  await expect(page.locator("#libraryPanel")).toBeVisible();
  await expect(page.locator("#librarySummaryPill")).toContainText("1 saved");
  await expect(page.locator(".library-character")).toHaveCount(1);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator("#librarySummaryPill")).toContainText("2 saved");
  await expect(page.locator(".library-character")).toHaveCount(2);

  const library = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    CHARACTER_LIBRARY_KEY,
  );
  expect(Object.keys(library.charactersById)).toHaveLength(2);
  expect(library.charactersById[library.activeCharacterId].name).toContain(
    "Copy",
  );
});

test("keeps character slots in stable order when switching", async ({
  page,
}) => {
  await page.locator("#landingLoadSampleBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await page.locator("#libraryDuplicateActiveBtn").click();

  const namesBefore = await page
    .locator(".library-character h3")
    .allTextContents();
  await page
    .locator(".library-character")
    .first()
    .getByRole("button", {
      name: "Switch",
    })
    .click();
  const namesAfter = await page
    .locator(".library-character h3")
    .allTextContents();

  expect(namesAfter).toEqual(namesBefore);
});

test("edits active character profile from the characters panel", async ({
  page,
}) => {
  const name = "Profile Panel Character";
  const archetype = "Rail Agent Profile Test";
  const player = "Profile Panel Player";
  const age = "42";
  const gender = "Nonbinary";
  const description = "Profile panel description persists across reload.";
  const background = "Profile panel background stays with the character.";

  await enterTracker(page);
  await openCharacterLibrary(page);
  await expect(page.locator("#characterProfileEditor")).toBeVisible();
  await page.locator("#profileNameInput").fill(name);
  await page.locator("#profileArchetypeInput").fill(archetype);
  await page.locator("#profilePlayerInput").fill(player);
  await page.locator("#profileAgeInput").fill(age);
  await page.locator("#profileGenderInput").fill(gender);
  await page.locator("#profileDescriptionInput").fill(description);
  await page.locator("#profileBackgroundInput").fill(background);
  await page.locator("#saveCharacterProfileBtn").click();

  await expect(page.locator("#characterName")).toContainText(name);
  await expect(page.locator(".library-character.active")).toContainText(name);

  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSummaryName")).toHaveText(name);
  await expect(page.locator("#characterDossierSubtitle")).toContainText(
    archetype,
  );
  await expect(page.locator("#characterBasicsList")).toContainText(archetype);
  await expect(page.locator("#characterBasicsList")).toContainText(player);
  await expect(page.locator("#characterBasicsList")).toContainText(age);
  await expect(page.locator("#characterBasicsList")).toContainText(gender);
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    description,
  );
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    background,
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
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeName: active?.name || "",
            activeCharacterName: active?.character?.name || "",
            activeArchetype: active?.character?.archetype || "",
            activePlayer: active?.character?.player || "",
            activeAge: active?.character?.age || "",
            activeGender: active?.character?.gender || "",
            activeDescription: active?.character?.description || "",
            activeBackground: active?.character?.background || "",
            activeSetupStatus: active?.character?.setupStatus || "",
            trackerName: tracker?.name || "",
            trackerArchetype: tracker?.archetype || "",
            trackerSetupStatus: tracker?.setupStatus || "",
          };
        },
        { libraryKey: CHARACTER_LIBRARY_KEY, storageKey: STORAGE_KEY },
      ),
    )
    .toEqual({
      activeName: name,
      activeCharacterName: name,
      activeArchetype: archetype,
      activePlayer: player,
      activeAge: age,
      activeGender: gender,
      activeDescription: description,
      activeBackground: background,
      activeSetupStatus: "complete",
      trackerName: name,
      trackerArchetype: archetype,
      trackerSetupStatus: "complete",
    });

  await reloadIntoTracker(page);
  await expect(page.locator("#characterName")).toContainText(name);
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSummaryName")).toHaveText(name);
  await expect(page.locator("#characterBasicsList")).toContainText(archetype);
  await expect(page.locator("#characterBasicsList")).toContainText(player);
  await expect(page.locator("#characterBackgroundSummary")).toContainText(
    description,
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

test("selects and opens a saved character from the minimal landing page @mobile", async ({
  page,
}) => {
  const firstName = "Landing Character One";
  const secondName = "Landing Character Two";
  const characterSelect = page.locator("#landingCharacterSelect");

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await renameActiveCharacter(page, firstName);
  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await renameActiveCharacter(page, secondName);
  await expect(page.locator("#characterName")).toContainText(secondName);

  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator("#landingCharacterPicker")).toBeVisible();
  await expect(characterSelect.locator("option")).toHaveText([
    firstName,
    secondName,
  ]);
  await expect(characterSelect.locator("option:checked")).toHaveText(
    secondName,
  );
  await expect(page.locator("#landingContinueLabel")).toHaveText(
    `Continue as ${secondName}`,
  );

  await characterSelect.selectOption({ label: firstName });
  await expect(page.locator("#landingContinueLabel")).toHaveText(
    `Continue as ${firstName}`,
  );

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterName")).toContainText(firstName);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, expectedName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          return {
            activeName: active?.name || "",
            activeCharacterName: active?.character?.name || "",
            trackerName: tracker?.name || "",
            isExpectedActive: active?.name === expectedName,
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          expectedName: firstName,
        },
      ),
    )
    .toEqual({
      activeName: firstName,
      activeCharacterName: firstName,
      trackerName: firstName,
      isExpectedActive: true,
    });

  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(characterSelect.locator("option:checked")).toHaveText(firstName);

  await page.reload();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(characterSelect.locator("option:checked")).toHaveText(firstName);
});

test("imports JSON from the landing page only after confirmation @mobile", async ({
  page,
}) => {
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();

  await page.locator("#landingImportBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await expect(page.locator("#pasteImportPanel")).toBeVisible();
  await expect(page.locator("#importJsonText")).toBeVisible();
  await expect(page.getByText("Or upload a JSON file")).toBeVisible();
  await expect(page.locator(".import-file-option .file-label")).toBeVisible();

  await page.locator("#importFile").setInputFiles({
    name: "landing-import.json",
    mimeType: "application/json",
    buffer: Buffer.from(await sample.text()),
  });

  await expect(page.locator("#pasteImportPanel")).toBeHidden();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText("Lehi Larson");
});

test("deletes only the selected character and preserves the remaining character", async ({
  page,
}) => {
  const deleteName = "Character To Delete";
  const keepName = "Character To Keep";

  await page.locator("#landingContinueBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();

  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(deleteName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(deleteName);

  await page.locator("#libraryDuplicateActiveBtn").click();
  await expect(page.locator(".library-character")).toHaveCount(2);
  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(keepName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(keepName);

  await expect(page.locator(".library-character h3")).toContainText([
    deleteName,
    keepName,
  ]);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: deleteName }) })
    .getByRole("button", { name: "Switch" })
    .click();
  await expect(page.locator("#characterName")).toContainText(deleteName);

  await page
    .locator(".library-character")
    .filter({ has: page.getByRole("heading", { name: deleteName }) })
    .getByRole("button", { name: "Delete" })
    .click();
  await expect(page.locator("#appDialog")).toBeVisible();
  await page.locator("#appDialogConfirmBtn").click();

  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: deleteName }) }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: keepName }) }),
  ).toHaveCount(1);
  await expect(page.locator(".library-character.active")).toContainText(
    keepName,
  );
  await expect(page.locator("#characterName")).toContainText(keepName);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, deleteName, keepName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const entries = Object.values(library?.charactersById || {});
          return {
            count: entries.length,
            hasDeleted: entries.some((entry) => entry.name === deleteName),
            hasKeep: entries.some(
              (entry) =>
                entry.name === keepName && entry.character?.name === keepName,
            ),
            activeName:
              library?.charactersById?.[library.activeCharacterId]?.name || "",
            trackerName: tracker?.name || "",
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          deleteName,
          keepName,
        },
      ),
    )
    .toEqual({
      count: 1,
      hasDeleted: false,
      hasKeep: true,
      activeName: keepName,
      trackerName: keepName,
    });

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }
  await expect(page.locator("#characterName")).toContainText(keepName);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: deleteName }) }),
  ).toHaveCount(0);
  await expect(
    page
      .locator(".library-character")
      .filter({ has: page.getByRole("heading", { name: keepName }) }),
  ).toHaveCount(1);
  await expect(page.locator(".library-character.active")).toContainText(
    keepName,
  );
});

test("imports a Savaged.us sample through paste import", async ({ page }) => {
  await page.locator("#landingContinueBtn").click();
  const sample = await page.request.get(
    "/docs/Sample%20Characters/savaged-us-json-export-character-Lehi%20Larson.json",
  );
  expect(sample.ok()).toBeTruthy();

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#pasteImportBtn").click();
  await page.locator("#importJsonText").fill(await sample.text());
  await page.locator("#confirmPasteImportBtn").click();

  await expect(page.locator("#characterName")).toContainText("Lehi Larson");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#importWarningsList")).toBeVisible();
  await page.getByRole("button", { name: "Character", exact: true }).click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='hindrances']")).toContainText(
    "Complete",
  );
  await page.locator("[data-setup-step='hindrances']").click();
  const hindrancePanel = page.locator("#setupHindrancesPanel");
  await expect(hindrancePanel).toContainText("Heroic");
  await expect(hindrancePanel).toContainText("Major");
  await expect(hindrancePanel).toContainText("Small");
  await expect(hindrancePanel).toContainText("Minor");
  await expect(hindrancePanel).not.toContainText(
    "Needs review: one or more Hindrances need Minor or Major severity.",
  );
  await page.locator("[data-setup-step='review']").click();
  await expect(page.locator("#setupReviewPanel")).toContainText("Lehi Larson");
  await expect(page.locator("#setupReviewPanel")).toContainText(
    "Import Warnings",
  );
});

test("round-trips exported tracker JSON through import @mobile", async ({
  page,
}, testInfo) => {
  const characterName = "Backup Recovery Character";
  const noteText = "Round trip smoke note";

  await page.locator("#landingContinueBtn").click();
  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#characterLibraryMenuBtn").click();
  await expect(page.locator("#libraryPanel")).toBeVisible();
  await page.locator("#librarySaveCurrentBtn").click();
  await page
    .locator(".library-character.active")
    .getByRole("button", { name: "Rename" })
    .click();
  await page.locator("#appDialogInput").fill(characterName);
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText(characterName);

  await openCombat(page);
  await increaseWounds(page);
  await page.getByRole("button", { name: "Notes" }).click();
  await page.locator("#notesArea").fill(noteText);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ storageKey }) => {
          const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
          return {
            name: saved?.name || "",
            wounds: saved?.damage?.wounds ?? null,
            notes: saved?.notes || "",
          };
        },
        {
          storageKey: STORAGE_KEY,
        },
      ),
    )
    .toEqual({
      name: characterName,
      wounds: 1,
      notes: noteText,
    });

  await page.locator("#headerToolsMenu summary").click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#exportBtn").click(),
  ]);
  const downloadedJsonPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(downloadedJsonPath);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#resetBtn").click();
  await page.locator("#appDialogConfirmBtn").click();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await expect(page.locator("#characterName")).not.toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("0");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).not.toHaveValue(noteText);

  await page.locator("#headerToolsMenu summary").click();
  await page.locator("#importFile").setInputFiles(downloadedJsonPath);

  await expect(page.locator("#characterName")).toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue(noteText);

  await page.reload();
  if (await page.locator("#landingPage").isVisible()) {
    await page.locator("#landingContinueBtn").click();
  }

  await expect(page.locator("#characterName")).toContainText(characterName);
  await expect(page.locator("#woundsValue")).toHaveText("1");
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue(noteText);
});
