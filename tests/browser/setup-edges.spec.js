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
  await startNewCharacterFromLanding(page);
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
  await startNewCharacterFromLanding(page);
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
  await startNewCharacterFromLanding(page);
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
