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

test("local data and privacy links open distinct panels", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  const footerMetrics = await page
    .locator(".landing-footer-note")
    .evaluate((footer) => {
      const footerRect = footer.getBoundingClientRect();
      const footerText = footer.querySelector("span");
      const footerStyle = getComputedStyle(footer);
      const childTops = Array.from(footer.children).map(
        (child) => child.getBoundingClientRect().top,
      );
      const linkRects = Array.from(
        footer.querySelectorAll(".landing-footer-link"),
      ).map((link) => {
        const rect = link.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
        };
      });
      return {
        childTops,
        footerBottom: footerRect.bottom,
        footerLeft: footerRect.left,
        footerPosition: footerStyle.position,
        footerRight: footerRect.right,
        linkRects,
        textClientWidth: footerText.clientWidth,
        textScrollWidth: footerText.scrollWidth,
        viewportHeight: window.innerHeight,
        viewportWidth: window.innerWidth,
      };
    });
  const footerTopSpread =
    Math.max(...footerMetrics.childTops) - Math.min(...footerMetrics.childTops);
  if (footerMetrics.viewportWidth > 680) {
    expect(footerTopSpread).toBeLessThanOrEqual(1);
  } else {
    expect(footerMetrics.footerPosition).toBe("fixed");
    expect(footerMetrics.footerBottom).toBeLessThanOrEqual(
      footerMetrics.viewportHeight,
    );
    expect(
      footerMetrics.viewportHeight - footerMetrics.footerBottom,
    ).toBeLessThanOrEqual(24);
    expect(footerMetrics.textScrollWidth).toBeLessThanOrEqual(
      footerMetrics.textClientWidth + 1,
    );
  }
  expect(footerMetrics.footerLeft).toBeGreaterThanOrEqual(0);
  expect(footerMetrics.footerRight).toBeLessThanOrEqual(
    footerMetrics.viewportWidth,
  );
  for (const linkRect of footerMetrics.linkRects) {
    expect(linkRect.left).toBeGreaterThanOrEqual(0);
    expect(linkRect.right).toBeLessThanOrEqual(footerMetrics.viewportWidth);
  }
  await expect(page.locator("#landingSettingsBtn")).toHaveCount(0);
  await page.locator("#landingLocalDataBtn").click();

  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#localDataPanel")).toBeVisible();
  await expect(page.locator("#privacyLegalPanel")).toBeHidden();
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#characterHeaderTools")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityHeroCopy")).toBeVisible();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Local Data & Backups",
  );
  await expect(page.locator("#utilityPageSubtitle")).toContainText(
    "Browser saves",
  );
  await expect(page.locator("#localDataStatusBadges")).toContainText("Version");
  await expect(page.locator("#localDataStorageDetails")).toContainText(
    "Tracker Save",
  );
  await expect(page.locator("#localDataBackupSection")).toContainText(
    "Backups and Local Data",
  );
  await expect(page.locator("#localDataControlsSection")).toContainText(
    "Clear Local Data",
  );
  await expect(page.locator("#localDataPanel")).not.toContainText(
    "Privacy and Legal Notes",
  );

  await page.locator("#localDataShowWelcomeBtn").click();
  await expect(page.locator("#demoWelcomePanel")).toBeVisible();

  await page.evaluate(() => window.history.back());
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingLocalDataBtn").click();
  await expect(page.locator("#localDataBackupSection")).toBeVisible();
  await expect(page.locator("#localDataBackupSection")).toContainText(
    "Tracker Save",
  );
  await page.locator("#localDataClearAllBtn").click();
  const clearDialog = page.locator("#appDialog");
  await expect(clearDialog).toBeVisible();
  await expect(clearDialog.locator("#appDialogTitle")).toHaveText(
    "Permanently clear local data?",
  );
  await expect(clearDialog.locator("#appDialogMessage")).toContainText(
    "permanently erase all saved characters",
  );
  await expect(clearDialog.locator("#appDialogMessage")).toContainText(
    "destructive and cannot be undone",
  );
  await expect(clearDialog.locator("#appDialogConfirmBtn")).toHaveText(
    "Permanently Clear Local Data",
  );
  await clearDialog.locator("#appDialogCancelBtn").click();
  await expect(clearDialog).toBeHidden();

  await page.evaluate(() => window.history.back());
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingPrivacyLegalBtn").click();
  await expect(page.locator("#privacyLegalPanel")).toBeVisible();
  await expect(page.locator("#localDataPanel")).toBeHidden();
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Privacy & Legal Notes",
  );
  await expect(page.locator("#privacyLegalNotesSection")).toContainText(
    "License",
  );
  await expect(page.locator("#privacyLegalDemoLink")).toHaveAttribute(
    "href",
    /studiosam\.github\.io/,
  );
  await expect(page.locator("#privacyLegalPanel")).not.toContainText(
    "Tracker Save",
  );
});

test("opens sources and rulesets from the landing footer", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await page.locator("#landingSourcesRulesetsBtn").click();

  const panel = page.locator("#sourcesRulesetsPanel");
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(panel).toBeVisible();
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Sources & Rulesets",
  );
  await expect(
    panel.getByRole("heading", { name: "Sources & Rulesets", exact: true }),
  ).toBeVisible();
  await expect(panel).toContainText(
    "Browning Private Security & Detective Agency",
  );
  await expect(panel).toContainText("Savage Worlds: Adventure Edition");
  await expect(panel).toContainText("This page is informational for now");
  await expect(panel.locator("input, select, textarea, button")).toHaveCount(0);
});

test("empty landing offers create, import, and demo only", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator("#landingContinueBtn")).toBeHidden();
  await expect(page.locator("#landingCreateBtn")).toHaveText(
    "Create New Character",
  );
  await expect(page.locator("#landingImportBtn")).toHaveText(
    "Import Character",
  );
  await expect(page.locator("#landingLoadSampleBtn")).toBeVisible();

  await page.locator("#landingCreateBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator(".shell")).toHaveClass(/character-setup-page/);
  await expect(page.locator(".shell > .hero")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#setupMainMenuBtn")).toBeVisible();
  await expect(
    page.locator("#characterPanel .dossier-header-actions #headerToolsMenu"),
  ).toBeHidden();
  await expect(page.locator("#setupConceptPanel")).toBeVisible();
});

test("landing create edit button opens saved-character editor", async ({
  page,
}) => {
  const dialogButtonLayout = async (dialog) =>
    dialog.locator("button").evaluateAll((buttons) => {
      const visibleButtons = buttons.filter(
        (button) => button.getClientRects().length > 0,
      );
      const tops = visibleButtons.map(
        (button) => button.getBoundingClientRect().top,
      );
      const actionRow = document.querySelector("#appDialog .dialog-actions");
      const gap = Number.parseFloat(getComputedStyle(actionRow).columnGap) || 0;
      const requiredWidth =
        visibleButtons.reduce(
          (total, button) => total + button.getBoundingClientRect().width,
          0,
        ) +
        gap * Math.max(0, visibleButtons.length - 1);
      const availableWidth = actionRow.getBoundingClientRect().width;
      return {
        canFitOneLine: requiredWidth <= availableWidth + 1,
        count: visibleButtons.length,
        labelsFit: visibleButtons.every(
          (button) => button.scrollWidth <= button.clientWidth + 1,
        ),
        topSpread: Math.max(...tops) - Math.min(...tops),
      };
    });
  const editButtonPlacement = async (dialog) =>
    dialog.evaluate((dialogElement) => {
      const select = dialogElement.querySelector("#appDialogSelect");
      const editButton = Array.from(dialogElement.querySelectorAll("button"))
        .filter((button) => button.getClientRects().length > 0)
        .find(
          (button) => button.textContent.trim() === "Edit Selected Character",
        );
      const otherActionTops = Array.from(
        dialogElement.querySelectorAll("button"),
      )
        .filter(
          (button) =>
            button.getClientRects().length > 0 &&
            button.textContent.trim() !== "Edit Selected Character",
        )
        .map((button) => button.getBoundingClientRect().top);
      const selectRect = select.getBoundingClientRect();
      const editRect = editButton.getBoundingClientRect();
      return {
        editHasPlacementClass: editButton.classList.contains(
          "dialog-choice-edit-selected",
        ),
        editLeft: editRect.left,
        editTop: editRect.top,
        editWidth: editRect.width,
        isNarrow: window.matchMedia("(max-width: 520px)").matches,
        nextActionTop: Math.min(...otherActionTops),
        selectBottom: selectRect.bottom,
        selectLeft: selectRect.left,
        selectWidth: selectRect.width,
      };
    });

  await enterTracker(page);
  await saveCurrentCharacter(page);
  await renameActiveCharacter(page, "Saved Dusty");
  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();

  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator("#landingCreateBtn")).toHaveText(
    "Create/Edit Character",
  );
  await page.locator("#landingCreateBtn").click();

  const dialog = page.locator("#appDialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("#appDialogTitle")).toHaveText(
    "Create/Edit Character",
  );
  await expect(
    dialog.getByRole("button", { name: "Create New Character" }),
  ).toBeVisible();
  await expect(dialog.locator("#appDialogSelectLabel")).toBeVisible();
  await expect(dialog.locator("#appDialogSelectText")).toHaveText(
    "Saved character",
  );
  await expect(dialog.locator("#appDialogSelect")).toContainText("Saved Dusty");
  await expect(dialog.locator("#appDialogSelect")).not.toContainText(
    "Create a new character",
  );
  await dialog
    .locator("#appDialogSelect")
    .selectOption({ label: "Saved Dusty" });
  const savedDialogButtonLayout = await dialogButtonLayout(dialog);
  expect(savedDialogButtonLayout.count).toBe(3);
  expect(savedDialogButtonLayout.labelsFit).toBe(true);
  if (savedDialogButtonLayout.canFitOneLine)
    expect(savedDialogButtonLayout.topSpread).toBeLessThanOrEqual(1);
  const savedEditPlacement = await editButtonPlacement(dialog);
  expect(savedEditPlacement.editHasPlacementClass).toBe(true);
  if (savedEditPlacement.isNarrow) {
    expect(savedEditPlacement.editTop).toBeGreaterThanOrEqual(
      savedEditPlacement.selectBottom - 1,
    );
    expect(savedEditPlacement.editTop).toBeLessThan(
      savedEditPlacement.nextActionTop,
    );
    expect(
      Math.abs(savedEditPlacement.editLeft - savedEditPlacement.selectLeft),
    ).toBeLessThanOrEqual(2);
    expect(
      Math.abs(savedEditPlacement.editWidth - savedEditPlacement.selectWidth),
    ).toBeLessThanOrEqual(2);
  }
  await dialog.getByRole("button", { name: "Edit Selected Character" }).click();

  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterName")).toContainText("Saved Dusty");
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await expect(page.locator("#setupGearPanel")).toBeVisible();
  await expect(page.locator("[data-setup-step='review']")).toHaveCount(0);
});

test("smoke tests read-only Catalog navigation and modes", async ({ page }) => {
  await expect(page.locator("#landingPage")).toBeVisible();
  const panel = page.locator("#catalogPanel");
  const assertCatalogMode = async (label) => {
    await expect(
      panel.locator(".catalog-type-selector button.active"),
    ).toHaveText(label);
    await expect(
      panel.locator("#catalogResultsList .catalog-result").first(),
    ).toBeVisible();
    await expect(
      panel.locator("#catalogDetailPanel .catalog-detail-card"),
    ).toBeVisible();
  };

  await expect(page.locator("#landingCatalogBtn")).toHaveCount(0);
  await enterTracker(page);
  await openHeaderMenu(page);
  await page.locator("#catalogMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(panel).toBeVisible();
  await expect(page.locator(".app-tabs [data-app-tab='catalog']")).toHaveCount(
    0,
  );
  await expect(panel).toContainText("Catalog");
  await expect(panel).toContainText(
    "Browse Edges, Hindrances, and Powers without editing the character.",
  );
  await assertCatalogMode("Edges");
  await page.locator("#catalogSearchInput").fill("Psionics");
  await expect(panel.locator("#catalogResultsList")).toContainText(
    "No matching Edges.",
  );
  await expect(panel).not.toContainText("Mentalist");
  await expect(panel).not.toContainText("Psionics");
  await page.locator("#catalogSearchInput").fill("");
  await page.locator("[data-catalog-type='hindrances']").click();
  await assertCatalogMode("Hindrances");
  await page.locator("[data-catalog-type='powers']").click();
  await assertCatalogMode("Powers");

  await expect(
    panel.getByRole("button", { name: /^(Add|Save|Apply)\b/i }),
  ).toHaveCount(0);
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");

  await page.evaluate(() => window.history.back());
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await expect(panel).toBeHidden();

  await openHeaderMenu(page);
  await page.locator("#creatorModeBtn").click();
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
  await page.locator("#characterSetupPanel [data-app-tab='catalog']").click();
  await expect(panel).toBeVisible();
  await page.evaluate(() => window.history.back());
  await expect(page.locator("#characterPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterSetupPanel")).toBeVisible();
});

test("shows the read-only sources and rulesets page from the global menu", async ({
  page,
}) => {
  await enterTracker(page);
  await openHeaderMenu(page);
  await page.locator("#sourcesRulesetsMenuBtn").click();

  const panel = page.locator("#sourcesRulesetsPanel");
  await expect(panel).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "Sources & Rulesets", exact: true }),
  ).toBeVisible();
  await expect(panel).toContainText(
    "Browning Private Security & Detective Agency",
  );
  await expect(panel).toContainText("Savage Worlds: Adventure Edition");
  await expect(panel).toContainText("Deadlands: The Weird West");
  await expect(panel).toContainText("Deadlands Weird West Companion");
  await expect(panel).toContainText("Starting Wealth: $250");
  await expect(panel).toContainText("Starting Attribute Points: 5");
  await expect(panel).toContainText("Starting Skill Points: 12");
  await expect(panel).toContainText("This page is informational for now");
  await expect(panel.locator("input, select, textarea, button")).toHaveCount(0);
  await expect(
    page.locator(".app-tabs [data-app-tab='sourcesRulesets']"),
  ).toHaveCount(0);
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Sources & Rulesets",
  );

  await page.locator("#utilityBackToTrackerBtn").click();
  await expect(page.locator("#characterHeroCopy")).toBeVisible();
  await expect(page.locator("#appTabs")).toBeVisible();
  const primaryTabs = [
    ["Character", "#characterPanel"],
    ["Inventory", "#inventoryPanel"],
    ["Arcane", "#arcanePanel"],
    ["Notes", "#notesPanel"],
    ["Combat", "#playPanel"],
  ];
  for (const [name, panelId] of primaryTabs) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(page.locator(panelId)).toHaveClass(/active/);
  }
});

test("loads the app and switches primary tabs @mobile", async ({ page }) => {
  await expect(page).toHaveTitle(/Deadlands Character Tracker/);
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await expect(
    page.locator(".app-tabs [data-app-tab='localData']"),
  ).toHaveCount(0);
  await expect(page.locator(".app-tabs [data-app-tab='creation']")).toHaveCount(
    0,
  );
  await expect(page.locator(".app-tabs [data-app-tab='catalog']")).toHaveCount(
    0,
  );

  await enterTracker(page);

  await page.reload();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
  await enterTracker(page);

  for (const tab of ["Character", "Inventory", "Arcane", "Notes"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await expect(page.locator(".tab-panel.active")).toBeVisible();
    await expect(page.locator("#headerToolsMenu summary")).toBeVisible();
  }

  await openHeaderMenu(page);
  await page.locator("#localDataMenuBtn").click();
  await expect(page.locator("#localDataPanel")).toContainText(
    "Local Data & Backups",
  );
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Local Data & Backups",
  );
  await expect(page.locator("#localDataAppDetails")).toContainText(
    "Schema Version",
  );

  await page.locator("#utilityBackToTrackerBtn").click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);
  await expect(page.locator("#characterHeroCopy")).toBeVisible();
  await expect(page.locator("#appTabs")).toBeVisible();

  await openHeaderMenu(page);
  await page.locator("#privacyLegalMenuBtn").click();
  await expect(page.locator("#privacyLegalPanel")).toContainText(
    "Privacy & Legal Notes",
  );
  await expect(page.locator("#characterHeroCopy")).toBeHidden();
  await expect(page.locator("#appTabs")).toBeHidden();
  await expect(page.locator("#utilityPageTitle")).toHaveText(
    "Privacy & Legal Notes",
  );

  await page.locator("#utilityBackToTrackerBtn").click();
  await expect(page.locator("#playPanel")).toHaveClass(/active/);

  await openHeaderMenu(page);
  await page.locator("#mainMenuBtn").click();
  await expect(page.locator("#landingPage")).toBeVisible();
  await expect(page.locator(".shell")).toBeHidden();
});

test("loads a bundled sample in demo mode", async ({ page }) => {
  await page.locator("#landingLoadSampleBtn").click();

  await expect(page.locator("#demoModeBanner")).toBeVisible();
  await expect(page.locator("#landingPage")).toBeHidden();
  await expect(page.locator(".shell")).toBeVisible();
  await expect(page.locator("#characterName")).toContainText("Dusty McCaw");
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    STORAGE_KEY,
  );
  expect(stored.schemaVersion).toBe(1);
  const library = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    CHARACTER_LIBRARY_KEY,
  );
  expect(Object.keys(library.charactersById)).toHaveLength(1);
  expect(library.charactersById[library.activeCharacterId].isDemo).toBe(true);
});
