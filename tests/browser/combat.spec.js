const {
  test,
  expect,
  useAppTestHooks,
  openCombat,
  seedEffectHookCharacter,
} = require("./helpers");

useAppTestHooks();

test("live tracker opens as an interactive character sheet, not a combat simulator", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Live Tracker Tester",
    preferredId: "live-tracker-tester",
    edgeIds: ["swade-edge-luck"],
    weapons: [
      {
        id: "test-revolver",
        name: "Test Revolver",
        damage: "2d6",
        range: "12/24/48",
        ap: 0,
        rof: 1,
        shotsMax: 6,
        shotsLoaded: 3,
        ammoType: "test-ammo",
        minStr: "d4",
        weight: 2,
        itemLocation: "carried",
      },
    ],
  });

  await expect(
    page.getByRole("button", { name: "Tracker", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Combat", exact: true }),
  ).toHaveCount(0);

  await openCombat(page);
  await expect(page.locator("#playPanel")).toBeVisible();
  await expect(page.locator("#playPanel")).toContainText("Health and Resolve");
  await expect(page.locator("#playPanel")).toContainText("Current Weapons");
  await expect(page.locator("#playPanel")).toContainText("Resources");
  await expect(page.locator("#playPanel")).toContainText("Key Conditions");
  await expect(page.locator("#playPanel")).toContainText("Quick Consumables");
  await expect(page.locator("#playWeaponList")).toContainText("Test Revolver");
  await expect(page.locator("#combatEncumbranceSummary")).toBeHidden();

  const combatSummaryLayout = await page.evaluate(() => {
    const statusCards = [
      ...document.querySelectorAll(".combat-status-grid > .block"),
    ];
    const uniqueColumns = new Set(
      statusCards.map((card) => Math.round(card.getBoundingClientRect().left)),
    );
    const defensePanel = document.querySelector(".combat-defense-panel");
    const modifierPanel = document.querySelector(".combat-penalty-panel");
    return {
      viewportWidth: window.innerWidth,
      statusColumns: uniqueColumns.size,
      statusGridFits:
        statusCards.every((card) => card.scrollWidth <= card.clientWidth + 1) &&
        document.querySelector(".combat-status-grid").scrollWidth <=
          document.querySelector(".combat-status-grid").clientWidth + 1,
      defenseFits: defensePanel.scrollWidth <= defensePanel.clientWidth + 1,
      modifiersFit: modifierPanel.scrollWidth <= modifierPanel.clientWidth + 1,
    };
  });
  expect(combatSummaryLayout.statusColumns).toBe(
    combatSummaryLayout.viewportWidth > 680 ? 4 : 2,
  );
  expect(combatSummaryLayout.statusGridFits).toBe(true);
  expect(combatSummaryLayout.defenseFits).toBe(true);
  expect(combatSummaryLayout.modifiersFit).toBe(true);
});

test("simulator-style play helpers are hidden from the normal tracker workflow", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Hidden Simulator Tester",
    preferredId: "hidden-simulator-tester",
    edgeIds: ["swade-edge-quick", "swade-edge-level-headed"],
    hindranceIds: ["swade-hindrance-hesitant"],
    hucksterDeal: {
      enabled: true,
      selectedPower: "Bolt",
    },
  });

  await openCombat(page);

  await expect(page.locator("#combatDeclarationCard")).toBeHidden();
  await expect(page.locator("#actionCardPanel")).toBeHidden();
  await expect(page.locator("#combatHucksterCard")).toBeHidden();

  await page.locator("#headerToolsMenu").click();
  await expect(page.locator("#newSessionBtn")).toBeHidden();
});

test("tracker modifier chips report encumbrance penalties without load details", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Encumbrance Penalty Tester",
    preferredId: "encumbrance-penalty-tester",
  });
  await page.evaluate(() => {
    character.attributes.strength = "d4";
    character.inventory = [
      {
        id: "heavy-load",
        name: "Heavy Load",
        count: 1,
        weight: 25,
        location: "carried",
      },
    ];
    render();
    save();
  });

  await openCombat(page);
  await expect(page.locator("#combatEncumbranceSummary")).toBeHidden();
  const modifierPanel = page.locator("#combatPenaltyBreakdown");
  await expect(modifierPanel).toContainText("Pace -2");
  await expect(modifierPanel).toContainText("Running -2");
  await expect(modifierPanel).toContainText("Agility -2");
  await expect(modifierPanel).toContainText("Agility-linked -2");
  await expect(modifierPanel).toContainText("Vigor vs Fatigue -2");
  await expect(modifierPanel).not.toContainText("Combat Load");
  await expect(modifierPanel).not.toContainText("Capacity");
  await expect(page.locator("#combatPenaltySummary")).toBeHidden();
  await expect(
    modifierPanel.locator(".modifier-source-help").first(),
  ).toBeVisible();
  await expect(
    modifierPanel.locator(".modifier-chip", { hasText: "Pace -2" }),
  ).toHaveAttribute("title", /Encumbrance: Pace -2, minimum 1/);
});

test("exceeding Wound or Fatigue capacity marks the character incapacitated", async ({
  page,
}) => {
  await seedEffectHookCharacter(page, {
    name: "Incapacitation Tester",
    preferredId: "incapacitation-tester",
  });
  await openCombat(page);

  const wounds = page.locator(".combat-status-grid .block").filter({
    has: page.getByRole("heading", { name: "Wounds" }),
  });
  const fatigue = page.locator(".combat-status-grid .block").filter({
    has: page.getByRole("heading", { name: "Fatigue" }),
  });

  for (let index = 0; index < 4; index += 1) {
    await wounds.getByRole("button", { name: "+", exact: true }).click();
  }

  await expect(page.locator("#woundsValue")).toHaveText("4");
  await expect(page.locator("#woundPenalty")).toHaveCount(0);
  await expect(page.locator("#woundsNote")).toContainText(
    "Wounds exceed the maximum (4/3)",
  );
  await expect(page.locator("#combatPenaltyTotal")).toHaveText("Incapacitated");
  await expect(page.locator("#combatPenaltyBreakdown")).toContainText(
    "Incapacitated",
  );

  await wounds.getByRole("button", { name: "−", exact: true }).click();
  await expect(page.locator("#woundsValue")).toHaveText("3");
  await expect(page.locator("#combatPenaltyTotal")).toHaveText("-3");

  for (let index = 0; index < 3; index += 1) {
    await fatigue.getByRole("button", { name: "+", exact: true }).click();
  }

  await expect(page.locator("#fatigueValue")).toHaveText("3");
  await expect(page.locator("#fatiguePenalty")).toHaveCount(0);
  await expect(page.locator("#fatigueNote")).toContainText(
    "Fatigue exceeds the maximum (3/2)",
  );
  await expect(page.locator("#combatPenaltyTotal")).toHaveText("Incapacitated");
  await expect(page.locator("#combatPenaltySummary")).toContainText(
    "Fatigue exceeded normal capacity",
  );
});
