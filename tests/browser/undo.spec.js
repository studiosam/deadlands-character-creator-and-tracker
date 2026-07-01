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

test("global undo and redo restore character snapshots across reload", async ({
  page,
}) => {
  await enterTracker(page);
  await saveCurrentCharacter(page);
  await openCombat(page);
  await expectWounds(page, 0);

  await openHeaderMenu(page);
  await expect(page.locator("#undoBtn")).toBeDisabled();
  await page.locator("#headerToolsMenu").evaluate((menu) => {
    menu.open = false;
  });
  await increaseWounds(page);
  await expectWounds(page, 1);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 1, redo: 0 });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expectWounds(page, 1);
  await openHeaderMenu(page);
  await page.locator("#undoBtn").click();
  await expectWounds(page, 0);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 0, redo: 1 });

  await openHeaderMenu(page);
  await page.locator("#redoBtn").click();
  await expectWounds(page, 1);
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 1, redo: 0 });
});

test("global undo groups rapid note edits into one undo state", async ({
  page,
}) => {
  await enterTracker(page);
  await saveCurrentCharacter(page);
  await page.getByRole("button", { name: "Notes" }).click();

  const notes = page.locator("#notesArea");
  await notes.click();
  await notes.pressSequentially("Trail notes");
  await expect(notes).toHaveValue("Trail notes");
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 1, redo: 0 });

  await openHeaderMenu(page);
  await page.locator("#undoBtn").click();
  await page.getByRole("button", { name: "Notes" }).click();
  await expect(page.locator("#notesArea")).toHaveValue("");
  await expect
    .poll(() => page.evaluate(() => undoHistoryCounts()))
    .toEqual({ undo: 0, redo: 1 });
});
