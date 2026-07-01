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

test("persists wounds for an unsaved active character across reload @mobile", async ({
  page,
}) => {
  await enterTracker(page);
  await openCombat(page);
  await increaseWounds(page);
  await expectWounds(page, 1);

  await reloadIntoTracker(page);
  await openCombat(page);
  await expectWounds(page, 1);
});

test("adds and deletes gear while preserving remaining inventory across reload @mobile", async ({
  page,
}) => {
  const deleteName = "Gear Item To Delete";
  const deleteNote = "This item should be deleted";
  const keepName = "Gear Item To Keep";
  const keepNote = "This item should remain";

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await openInventory(page);

  await addCustomGear(page, {
    name: deleteName,
    quantity: "2",
    note: deleteNote,
  });
  await addCustomGear(page, {
    name: keepName,
    quantity: "4",
    note: keepNote,
  });

  await expect(gearRow(page, deleteName)).toHaveCount(1);
  await expect(gearRow(page, deleteName)).toContainText("Qty 2");
  await expect(gearRow(page, deleteName)).toContainText(deleteNote);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);

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
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          const libraryInventory = active?.character?.inventory || [];
          const trackerInventory = tracker?.inventory || [];
          const libraryDelete = libraryInventory.filter(
            (item) => item.name === deleteName,
          );
          const libraryKeep = libraryInventory.filter(
            (item) => item.name === keepName,
          );
          const trackerDelete = trackerInventory.filter(
            (item) => item.name === deleteName,
          );
          const trackerKeep = trackerInventory.filter(
            (item) => item.name === keepName,
          );
          return {
            libraryDeleteCount: libraryDelete.length,
            libraryDeleteQuantity: libraryDelete[0]?.count ?? null,
            libraryDeleteNote: libraryDelete[0]?.note || "",
            libraryKeepCount: libraryKeep.length,
            libraryKeepQuantity: libraryKeep[0]?.count ?? null,
            libraryKeepNote: libraryKeep[0]?.note || "",
            trackerDeleteCount: trackerDelete.length,
            trackerDeleteQuantity: trackerDelete[0]?.count ?? null,
            trackerDeleteNote: trackerDelete[0]?.note || "",
            trackerKeepCount: trackerKeep.length,
            trackerKeepQuantity: trackerKeep[0]?.count ?? null,
            trackerKeepNote: trackerKeep[0]?.note || "",
            trackerMatchesActive: tracker?.name === active?.character?.name,
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
      libraryDeleteCount: 1,
      libraryDeleteQuantity: 2,
      libraryDeleteNote: deleteNote,
      libraryKeepCount: 1,
      libraryKeepQuantity: 4,
      libraryKeepNote: keepNote,
      trackerDeleteCount: 1,
      trackerDeleteQuantity: 2,
      trackerDeleteNote: deleteNote,
      trackerKeepCount: 1,
      trackerKeepQuantity: 4,
      trackerKeepNote: keepNote,
      trackerMatchesActive: true,
    });

  await gearRow(page, deleteName).locator("button.delete-small").click();
  if (await page.locator("#appDialog").isVisible()) {
    await page.locator("#appDialogConfirmBtn").click();
  }

  await expect(gearRow(page, deleteName)).toHaveCount(0);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);

  await expect
    .poll(async () =>
      page.evaluate(
        ({ libraryKey, storageKey, keepName, deleteName }) => {
          const library = JSON.parse(
            localStorage.getItem(libraryKey) || "null",
          );
          const tracker = JSON.parse(
            localStorage.getItem(storageKey) || "null",
          );
          const active =
            library?.charactersById?.[library.activeCharacterId] || null;
          const libraryInventory = active?.character?.inventory || [];
          const trackerInventory = tracker?.inventory || [];
          const libraryDelete = libraryInventory.filter(
            (item) => item.name === deleteName,
          );
          const libraryKeep = libraryInventory.filter(
            (item) => item.name === keepName,
          );
          const trackerDelete = trackerInventory.filter(
            (item) => item.name === deleteName,
          );
          const trackerKeep = trackerInventory.filter(
            (item) => item.name === keepName,
          );
          return {
            libraryDeleteCount: libraryDelete.length,
            libraryKeepCount: libraryKeep.length,
            libraryKeepQuantity: libraryKeep[0]?.count ?? null,
            libraryKeepNote: libraryKeep[0]?.note || "",
            trackerDeleteCount: trackerDelete.length,
            trackerKeepCount: trackerKeep.length,
            trackerKeepQuantity: trackerKeep[0]?.count ?? null,
            trackerKeepNote: trackerKeep[0]?.note || "",
          };
        },
        {
          libraryKey: CHARACTER_LIBRARY_KEY,
          storageKey: STORAGE_KEY,
          keepName,
          deleteName,
        },
      ),
    )
    .toEqual({
      libraryDeleteCount: 0,
      libraryKeepCount: 1,
      libraryKeepQuantity: 4,
      libraryKeepNote: keepNote,
      trackerDeleteCount: 0,
      trackerKeepCount: 1,
      trackerKeepQuantity: 4,
      trackerKeepNote: keepNote,
    });

  await reloadIntoTracker(page);
  await openInventory(page);

  await expect(gearRow(page, deleteName)).toHaveCount(0);
  await expect(gearRow(page, keepName)).toHaveCount(1);
  await expect(gearRow(page, keepName)).toContainText("Qty 4");
  await expect(gearRow(page, keepName)).toContainText(keepNote);
});
