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

async function openActivePowerHistory(page) {
  const history = page.locator("#activePowersList .active-power-history-group");
  await expect(history).toBeVisible();
  if (!(await history.evaluate((details) => details.open))) {
    await history.locator(":scope > summary").click();
  }
  return history;
}

function historyPowerCard(history, name) {
  return history
    .locator(".active-power-history-card")
    .filter({ hasText: name });
}

test("Known powers activate into editable active power records", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Activation Tester",
    preferredId: "active-power-activation-tester",
  });

  await expect(
    page.getByRole("button", { name: "Arcane", exact: true }),
  ).toBeEnabled();
  await openArcane(page);
  const arcaneLayout = await page.evaluate(() => {
    const rect = (selector) =>
      document.querySelector(selector).getBoundingClientRect();
    const panel = rect("#arcanePanel");
    const overview = rect(".arcane-overview-card");
    const knownPowersCard = rect(".arcane-known-powers-card");
    const resourceRow = document.querySelector(
      ".arcane-overview-card .power-point-resource-row",
    );
    const resourceCopy = rect(
      ".arcane-overview-card .power-point-resource-copy",
    );
    const recoveryActions = document.querySelector(
      ".arcane-overview-card .power-point-resource-row .resource-recovery-actions",
    );
    const recoveryBounds = recoveryActions.getBoundingClientRect();
    const knownPowersList = rect("#powersList");
    const knownPower = rect("#powersList .power-card");
    const powerDetails = rect("#powersList .power-card-details");
    const powerCasting = rect("#powersList .power-card-casting");
    const editPowerButton = rect("#powersList .edit-power-btn");
    const deletePowerButton = rect("#powersList .delete-power-btn");
    return {
      primaryCardsFillPanel:
        overview.width / panel.width > 0.95 &&
        knownPowersCard.width / panel.width > 0.95,
      knownPowerUsesInternalLayout:
        window.innerWidth <= 980
          ? powerDetails.top < powerCasting.top
          : Math.abs(powerDetails.top - powerCasting.top) <= 1 &&
            powerDetails.width < powerCasting.width,
      copyWidth: resourceCopy.width,
      resourceRowFits:
        resourceRow.scrollWidth <= resourceRow.clientWidth + 1 &&
        recoveryActions.scrollWidth <= recoveryActions.clientWidth + 1,
      recoveryButtonsFit: [...recoveryActions.querySelectorAll("button")].every(
        (button) => {
          const buttonBounds = button.getBoundingClientRect();
          return (
            buttonBounds.left >= recoveryBounds.left - 1 &&
            buttonBounds.right <= recoveryBounds.right + 1
          );
        },
      ),
      knownPowerWidthRatio: knownPower.width / knownPowersList.width,
      powerManagementIsCompact:
        editPowerButton.width <= 128 && deletePowerButton.width <= 52,
    };
  });
  expect(arcaneLayout.primaryCardsFillPanel).toBe(true);
  expect(arcaneLayout.knownPowerUsesInternalLayout).toBe(true);
  expect(arcaneLayout.copyWidth).toBeGreaterThan(160);
  expect(arcaneLayout.resourceRowFits).toBe(true);
  expect(arcaneLayout.recoveryButtonsFit).toBe(true);
  expect(arcaneLayout.knownPowerWidthRatio).toBeGreaterThan(0.95);
  expect(arcaneLayout.powerManagementIsCompact).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Power Points", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#resourcesList")).toContainText("15 / 15");
  await expect(page.locator("#resourcesList")).toContainText(
    "Recover 5 per hour",
  );
  await expect(page.locator("#arcanePanel")).not.toContainText(
    "Arcane Background:",
  );
  await expect(page.locator("#arcanePanel")).not.toContainText(
    "Blessed • Faith",
  );
  await expect(page.locator("#arcanePanel")).not.toContainText("Powers:");
  await expect(page.locator("#arcaneActivePowersPanel")).toBeHidden();
  await expect(page.locator("#arcaneRemindersPanel")).toBeHidden();
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(knownPower).toContainText("Protection");
  await expect(
    knownPower.getByRole("button", { name: /^Activate/ }),
  ).toHaveCount(1);
  await expect(knownPower).not.toContainText("Variable Spend");
  const castControlsFit = await knownPower
    .locator(".power-card-casting")
    .evaluate((casting) => {
      const bounds = casting.getBoundingClientRect();
      return [...casting.querySelectorAll("button, input, select")].every(
        (control) => {
          const controlBounds = control.getBoundingClientRect();
          return (
            controlBounds.left >= bounds.left - 1 &&
            controlBounds.right <= bounds.right + 1
          );
        },
      );
    });
  expect(castControlsFit).toBe(true);
  await knownPower.getByRole("button", { name: /Activate/ }).click();

  const activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(activePower).toContainText("Active");
  await expect(activePower.locator(".active-power-reminder")).toContainText(
    "Remember",
  );
  await expect(activePower.locator(".entry-advisory")).toHaveCount(0);
  await expect(page.locator("#arcaneActivePowersPanel")).toBeVisible();
  const activePowerActionsFit = await activePower.evaluate((card) => {
    const actions = card.querySelector(".power-actions");
    const actionBounds = actions.getBoundingClientRect();
    return (
      actions.scrollWidth <= actions.clientWidth + 1 &&
      [...actions.querySelectorAll("button")].every((button) => {
        const buttonBounds = button.getBoundingClientRect();
        return (
          buttonBounds.left >= actionBounds.left - 1 &&
          buttonBounds.right <= actionBounds.right + 1
        );
      })
    );
  });
  expect(activePowerActionsFit).toBe(true);
  const activePowerWidthRatio = await activePower.evaluate(
    (card) =>
      card.getBoundingClientRect().width /
      card.parentElement.getBoundingClientRect().width,
  );
  expect(activePowerWidthRatio).toBeGreaterThan(0.95);
  await activePower
    .locator("[data-active-power-field='targetLabel']")
    .fill("Dusty");
  await activePower
    .locator("[data-active-power-field='duration']")
    .fill("4 rounds");
  await activePower
    .locator("[data-active-power-field='durationRemaining']")
    .fill("4");
  await activePower.locator("[data-active-power-field='maintenance']").check();
  await expect(activePower).toContainText("Maintenance marked");
  await activePower
    .locator("[data-active-power-field='trappingNotes']")
    .fill("Glowing sigils");
  await activePower
    .locator("[data-active-power-field='notes']")
    .fill("Raise applied manually");
  await activePower.getByRole("button", { name: "Expire" }).click();
  const history = await openActivePowerHistory(page);
  const expiredPower = historyPowerCard(history, "Protection");
  await expect(expiredPower).toContainText("Expired");
  await expect(expiredPower.locator("input, textarea, button")).toHaveCount(0);

  const state = await page.evaluate(() => ({
    powerPoints: powerPointResource().current,
    activePowers: character.activePowers,
  }));
  expect(state.powerPoints).toBeLessThan(15);
  expect(state.activePowers).toEqual([
    expect.objectContaining({
      name: "Protection",
      status: "expired",
      cost: expect.any(Number),
      duration: "4 rounds",
      durationRemaining: 4,
      maintenance: true,
      targetLabel: "Dusty",
      trappingNotes: "Glowing sigils",
      notes: "Raise applied manually",
      activatedAt: expect.any(String),
      endedAt: expect.any(String),
    }),
  ]);

  await reloadIntoTracker(page);
  await openArcane(page);
  await expect(page.locator("#activePowersList")).toContainText("Protection");
  await expect(page.locator("#activePowersList")).toContainText("Expired");
  await expect(page.locator("#activePowersList")).toContainText(
    "Glowing sigils",
  );

  const exportedText = await page.evaluate(() =>
    JSON.stringify(serializeTrackerExport(character)),
  );
  await page.evaluate((text) => importJsonText(text), exportedText);
  await openArcane(page);
  expect(
    await page.evaluate(() =>
      character.activePowers.map((power) => power.status),
    ),
  ).toEqual(["expired"]);
  await expect(page.locator("#activePowersList")).toContainText(
    "Raise applied manually",
  );
});

test("Active power recast helper can create another active record", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Recast Duplicate Tester",
    preferredId: "active-power-recast-duplicate-tester",
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await knownPower.getByRole("button", { name: /Activate/ }).click();
  await knownPower.getByRole("button", { name: /Activate/ }).click();
  await expect(page.locator("#appDialogTitle")).toHaveText(
    "Power already active",
  );
  await expect(page.locator("#appDialogMessage")).toContainText(
    "Protection already has an active record.",
  );
  await page.getByRole("button", { name: "Create another record" }).click();

  await expect(
    page
      .locator("#activePowersList .active-power-card")
      .filter({ has: page.getByRole("heading", { name: "Protection" }) }),
  ).toHaveCount(2);
  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      statuses: character.activePowers.map((power) => power.status),
      ended: character.activePowers.map((power) => Boolean(power.endedAt)),
    })),
  ).toEqual({
    powerPoints: 13,
    statuses: ["active", "active"],
    ended: [false, false],
  });
});

test("Active power recast helper can expire old record before recasting", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Recast Expire Tester",
    preferredId: "active-power-recast-expire-tester",
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await knownPower.getByRole("button", { name: /Activate/ }).click();
  await knownPower.getByRole("button", { name: /Activate/ }).click();
  await page.getByRole("button", { name: "Expire old record" }).click();

  const protectionCards = page
    .locator("#activePowersList .active-power-card")
    .filter({ hasText: "Protection" });
  await expect(protectionCards).toHaveCount(2);
  await expect(protectionCards).toContainText([
    /Active|Expired/,
    /Active|Expired/,
  ]);
  const history = await openActivePowerHistory(page);
  await expect(historyPowerCard(history, "Protection")).toContainText("Ended");
  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      records: character.activePowers.map((power) => ({
        status: power.status,
        ended: Boolean(power.endedAt),
      })),
    })),
  ).toEqual({
    powerPoints: 13,
    records: [
      { status: "expired", ended: true },
      { status: "active", ended: false },
    ],
  });
});

test("Active power recast helper can dismiss old record before recasting", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Recast Dismiss Tester",
    preferredId: "active-power-recast-dismiss-tester",
    activePowers: [
      {
        id: "existing-protection-recast",
        catalogId: "power-protection",
        name: "Protection",
        status: "active",
        cost: 1,
        duration: "5",
        durationRemaining: 5,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await knownPower.getByRole("button", { name: /Activate/ }).click();
  await page.getByRole("button", { name: "Dismiss old record" }).click();

  const history = await openActivePowerHistory(page);
  await expect(historyPowerCard(history, "Protection")).toContainText(
    "Dismissed",
  );
  await expect(historyPowerCard(history, "Protection")).toContainText("Ended");
  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      records: character.activePowers.map((power) => ({
        status: power.status,
        ended: Boolean(power.endedAt),
      })),
    })),
  ).toEqual({
    powerPoints: 14,
    records: [
      { status: "dismissed", ended: true },
      { status: "active", ended: false },
    ],
  });
});

test("Numeric active power durations tick down persist and expire at zero", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Countdown Tester",
    preferredId: "active-power-countdown-tester",
    activePowers: [
      {
        id: "countdown-power",
        name: "Countdown Power",
        status: "active",
        cost: 1,
        duration: "3 rounds",
        durationRemaining: 2,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openArcane(page);
  let activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Countdown Power" }),
    });
  await expect(activePower).toContainText("2 rounds remaining.");
  await activePower.getByRole("button", { name: "Tick down 1 round" }).click();
  await expect(activePower).toContainText("1 round remaining.");
  expect(
    await page.evaluate(() => {
      const activePowerRecord = character.activePowers.find(
        (power) => power.id === "countdown-power",
      );
      return {
        durationRemaining: activePowerRecord.durationRemaining,
        status: activePowerRecord.status,
        ended: Boolean(activePowerRecord.endedAt),
      };
    }),
  ).toEqual({
    durationRemaining: 1,
    status: "active",
    ended: false,
  });

  await reloadIntoTracker(page);
  await openArcane(page);
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Countdown Power" }),
  });
  await expect(activePower).toContainText("1 round remaining.");
  await activePower.getByRole("button", { name: "Tick down 1 round" }).click();
  const history = await openActivePowerHistory(page);
  const expiredPower = historyPowerCard(history, "Countdown Power");
  await expect(expiredPower).toContainText("Expired");
  await expect(expiredPower).toContainText("Ended");
  await expect(expiredPower.locator("input, textarea, button")).toHaveCount(0);
  expect(
    await page.evaluate(() => {
      const activePowerRecord = character.activePowers.find(
        (power) => power.id === "countdown-power",
      );
      return {
        durationRemaining: activePowerRecord.durationRemaining,
        status: activePowerRecord.status,
        ended: Boolean(activePowerRecord.endedAt),
      };
    }),
  ).toEqual({
    durationRemaining: 0,
    status: "expired",
    ended: true,
  });

  await openCombat(page);
  const combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Countdown Power" }),
    });
  await expect(combatPower).toHaveCount(0);
});

test("Active powers track structured target mode and raise fields", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Structured Active Power Field Tester",
    preferredId: "structured-active-power-field-tester",
    powerIds: ["power-boost-lower-trait"],
    activePowers: [
      {
        id: "structured-boost-lower",
        catalogId: "power-boost-lower-trait",
        name: "Boost/Lower Trait",
        status: "active",
        cost: 2,
        duration: "5 boost / Instant lower",
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openArcane(page);
  let activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
    });
  await expect(
    activePower.locator("[data-active-power-field='effectMode']"),
  ).toHaveCount(1);
  await activePower
    .locator("[data-active-power-field='targetLabel']")
    .fill("Dusty");
  await activePower
    .locator("[data-active-power-field='effectMode']")
    .selectOption("Boost");
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
  });
  await activePower.locator("[data-active-power-field='raiseMarked']").check();
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
  });
  await expect(
    activePower.locator(".active-power-tracking-facts"),
  ).toBeVisible();
  await expect(activePower).toContainText("Target: Dusty");
  await expect(activePower).toContainText("Mode: Boost");
  await expect(activePower).toContainText("Raise marked");

  expect(
    await page.evaluate(() => {
      const activePowerRecord = character.activePowers[0];
      return {
        targetLabel: activePowerRecord.targetLabel,
        effectMode: activePowerRecord.effectMode,
        raiseMarked: activePowerRecord.raiseMarked,
      };
    }),
  ).toEqual({
    targetLabel: "Dusty",
    effectMode: "Boost",
    raiseMarked: true,
  });

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(
    page.getByRole("heading", { name: "Cast a Power", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("#playActivePowersList .active-power-card"),
  ).toHaveCount(0);
  await expect(
    page.locator("#playActivePowersList .combat-cast-power-card").filter({
      has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
    }),
  ).toBeVisible();

  const exportedText = await page.evaluate(() =>
    JSON.stringify(serializeTrackerExport(character)),
  );
  await page.evaluate((text) => importJsonText(text), exportedText);
  await openArcane(page);
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
  });
  await expect(activePower).toContainText("Target: Dusty");
  await expect(activePower).toContainText("Mode: Boost");
  await expect(activePower).toContainText("Raise marked");
});

test("Combat omits active effect tracking and keeps power casting focused", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Compact Active Power Tester",
    preferredId: "compact-active-power-tester",
    powerIds: ["power-protection"],
    activePowers: [
      {
        id: "compact-protection",
        catalogId: "power-protection",
        name: "Protection",
        status: "active",
        cost: 3,
        duration: "5",
        durationRemaining: 4,
        targetLabel: "Marshal Kane",
        trappingNotes: "A pale blue ward surrounds the target.",
        notes: "Raised with More Armor.",
        maintenance: true,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openCombat(page);
  const combatPanel = page.locator("#playActivePowersCard");
  await expect(
    combatPanel.getByRole("heading", { name: "Cast a Power", exact: true }),
  ).toBeVisible();
  await expect(combatPanel.locator(".combat-active-power-card")).toHaveCount(0);
  await expect(combatPanel.locator("[data-active-power-field]")).toHaveCount(0);
  await expect(combatPanel.getByText("In Effect Now")).toHaveCount(0);
  await expect(
    combatPanel
      .locator(".combat-cast-power-card")
      .filter({ has: page.getByRole("heading", { name: "Protection" }) }),
  ).toBeVisible();

  expect(
    await page.evaluate(
      () =>
        character.activePowers.find(
          (power) => power.id === "compact-protection",
        ).targetLabel,
    ),
  ).toBe("Marshal Kane");
});

test("Combat known powers show only casting essentials", async ({ page }) => {
  await seedActivePowerCharacter(page, {
    name: "Minimal Combat Power Tester",
    preferredId: "minimal-combat-power-tester",
    powerIds: [
      "power-protection",
      "power-smite",
      "power-boost-lower-trait",
      "power-detect-conceal-arcana",
      "power-sloth-speed",
      "power-sound-silence",
    ],
  });

  await page.evaluate(() => {
    character.attributes.smarts = "d8";
    const smite = character.powers.find(
      (power) => power.catalogId === "power-smite",
    );
    smite.restrictions = "Hands and feet count as weapons for this power.";
    render();
    save();
  });

  await openCombat(page);
  let powerCard = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({ has: page.getByRole("heading", { name: "Protection" }) });
  const modifierDetails = powerCard.locator(".combat-power-modifiers");

  await expect(powerCard).toContainText("Grants Armor +2, or +4 with a raise.");
  await expect(powerCard).toContainText("Range: 8 inches");
  await expect(powerCard).toContainText("Duration: 5");
  await expect(
    powerCard.locator(".combat-power-facts .power-help"),
  ).toHaveAttribute("data-tooltip", /Calculated from Smarts d8/);
  expect(
    await powerCard
      .locator(".combat-power-facts .power-help")
      .evaluate((helper) => {
        const style = getComputedStyle(helper);
        return {
          borderWidth: Number.parseFloat(style.borderWidth),
          borderRadius: Number.parseFloat(style.borderRadius),
          width: Number.parseFloat(style.width),
          height: Number.parseFloat(style.height),
        };
      }),
  ).toEqual(
    expect.objectContaining({
      borderWidth: 2,
      width: expect.any(Number),
      height: expect.any(Number),
    }),
  );
  await expect(page.locator(".combat-power-casting-summary")).toContainText(
    "15 PP available",
  );
  await expect(powerCard.locator("[data-power-affordability]")).toBeHidden();
  await expect(
    powerCard.getByRole("button", { name: "Cast — 1 PP" }),
  ).toBeEnabled();
  await expect(powerCard).not.toContainText("Rank Novice");
  await expect(powerCard).not.toContainText("SWADE Core");
  await expect(powerCard).not.toContainText("Use Power");
  await expect(powerCard).not.toContainText("Cast Modifiers");
  await expect(powerCard).not.toContainText("Trapping:");
  await expect(modifierDetails).not.toHaveAttribute("open", "");
  await expect(
    powerCard.locator(".variable-spend-row", {
      hasText: "Additional Recipients",
    }),
  ).toBeHidden();

  await expect(modifierDetails.locator("summary .power-help")).toHaveAttribute(
    "data-tooltip",
    /improve or expand this power/,
  );
  await modifierDetails.getByText("Enhance Power", { exact: true }).click();
  await powerCard
    .getByRole("button", { name: "Increase Additional Recipients" })
    .click();
  await expect(
    powerCard.getByRole("button", { name: "Cast — 2 PP" }),
  ).toBeEnabled();

  const smiteCard = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({ has: page.getByRole("heading", { name: "Smite" }) });
  await expect(smiteCard).not.toContainText("Hands and feet count as weapons");
  await expect(
    smiteCard.locator(".combat-cast-power-heading .power-help"),
  ).toHaveAttribute(
    "data-tooltip",
    "Restriction: Hands and feet count as weapons for this power.",
  );

  const splitDurationPowers = [
    [
      "Boost/Lower Trait",
      "Duration: 5/Instant",
      "Boost lasts 5 rounds. Lower is Instant.",
    ],
    [
      "Detect/Conceal Arcana",
      "Duration: 5/1 hour",
      "Detect lasts 5 rounds. Conceal lasts 1 hour.",
    ],
    [
      "Sloth/Speed",
      "Duration: Instant/5",
      "Sloth is Instant. Speed lasts 5 rounds.",
    ],
    [
      "Sound/Silence",
      "Duration: Instant/5",
      "Sound is Instant. Silence lasts 5 rounds.",
    ],
  ];
  for (const [name, duration, help] of splitDurationPowers) {
    const card = page
      .locator("#playActivePowersList .combat-cast-power-card")
      .filter({ has: page.getByRole("heading", { name }) });
    await expect(card).toContainText(duration);
    await expect(
      card.locator(".combat-power-facts .power-help").last(),
    ).toHaveAttribute("data-tooltip", help);
  }

  await page.evaluate(() => {
    powerPointResource().current = 0;
    render();
  });
  powerCard = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({ has: page.getByRole("heading", { name: "Protection" }) });
  await expect(powerCard).toContainText("Cannot cast · 1 PP short");
  await expect(
    powerCard.getByRole("button", { name: "Cast — 1 PP" }),
  ).toBeDisabled();
});

test("Arcane reminders stay in Arcane instead of the live Tracker", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Arcane Reminder Placement Tester",
    preferredId: "arcane-reminder-placement-tester",
  });
  await page.evaluate(() => {
    character.reminders.push({
      type: "Arcane",
      name: "Backlash",
      text: "Resolve the recorded backlash effect.",
    });
    render();
    save();
  });

  await openCombat(page);
  await expect(page.locator("#combatRemindersCard")).toHaveCount(0);

  await openArcane(page);
  await expect(page.locator("#arcaneRemindersPanel")).toBeVisible();
  await expect(page.locator("#arcaneRemindersList")).toContainText(
    "Resolve the recorded backlash effect.",
  );
});

test("Non-numeric active power durations remain manual without countdown controls", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Manual Active Power Duration Tester",
    preferredId: "manual-active-power-duration-tester",
    activePowers: [
      {
        id: "manual-duration-power",
        name: "Manual Duration Power",
        status: "active",
        cost: 2,
        duration: "Maintained",
        maintenance: true,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openArcane(page);
  const activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Manual Duration Power" }),
    });
  await expect(activePower).toContainText("Manual duration: Maintained.");
  await expect(activePower).toContainText("Maintenance marked");
  await expect(
    activePower.getByRole("button", { name: "Tick down 1 round" }),
  ).toHaveCount(0);

  await reloadIntoTracker(page);
  await openCombat(page);
  await expect(
    page.locator("#playActivePowersList .active-power-card").filter({
      has: page.getByRole("heading", { name: "Manual Duration Power" }),
    }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => {
      const activePowerRecord = character.activePowers.find(
        (power) => power.id === "manual-duration-power",
      );
      return {
        durationRemaining: activePowerRecord.durationRemaining,
        status: activePowerRecord.status,
      };
    }),
  ).toEqual({
    durationRemaining: null,
    status: "active",
  });
});

test("Arcane keeps runtime reminders while Combat only offers casting", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Reminder Tester",
    preferredId: "active-power-reminder-tester",
    activePowers: [
      {
        id: "protection-reminder-power",
        catalogId: "power-protection",
        name: "Protection",
        status: "active",
        cost: 1,
        duration: "5",
        durationRemaining: 5,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  });

  await openArcane(page);
  let activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(activePower.locator(".active-power-reminder")).toContainText(
    "Remember",
  );
  await expect(activePower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(activePower).toContainText(
    "Track raise, More Armor, and extra-recipient details separately.",
  );

  await openCombat(page);
  let combatPower = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).toContainText(
    "Grants Armor +2, or +4 with a raise.",
  );
  await expect(combatPower).not.toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(combatPower.locator(".active-power-reminder")).toHaveCount(0);
  await expect(
    page.locator("#playActivePowersList .active-power-card"),
  ).toHaveCount(0);

  await reloadIntoTracker(page);
  await openArcane(page);
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(activePower.locator(".active-power-reminder")).toContainText(
    "Remember",
  );
  await expect(activePower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );

  await openCombat(page);
  combatPower = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).toContainText(
    "Grants Armor +2, or +4 with a raise.",
  );
  await expect(combatPower).not.toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
});

test("Active power runtime reminders cover common candidate powers", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Expanded Active Power Reminder Tester",
    preferredId: "expanded-active-power-reminder-tester",
    activePowers: [
      {
        id: "barrier-reminder",
        catalogId: "power-barrier",
        name: "Barrier",
        status: "active",
        cost: 2,
        duration: "5",
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "burrow-reminder",
        catalogId: "power-burrow",
        name: "Burrow",
        status: "active",
        cost: 2,
        duration: "5",
        activatedAt: "2026-01-01T00:01:00.000Z",
      },
      {
        id: "light-darkness-reminder",
        catalogId: "power-light-darkness",
        name: "Light/Darkness",
        status: "active",
        cost: 2,
        duration: "10 minutes",
        activatedAt: "2026-01-01T00:02:00.000Z",
      },
      {
        id: "entangle-reminder",
        catalogId: "power-entangle",
        name: "Entangle",
        status: "active",
        cost: 2,
        duration: "Instant",
        activatedAt: "2026-01-01T00:03:00.000Z",
      },
      {
        id: "fly-reminder",
        catalogId: "power-fly",
        name: "Fly",
        status: "active",
        cost: 3,
        duration: "5",
        activatedAt: "2026-01-01T00:04:00.000Z",
      },
      {
        id: "invisibility-reminder",
        catalogId: "power-invisibility",
        name: "Invisibility",
        status: "active",
        cost: 5,
        duration: "5",
        activatedAt: "2026-01-01T00:05:00.000Z",
      },
      {
        id: "sloth-speed-reminder",
        catalogId: "power-sloth-speed",
        name: "Sloth/Speed",
        status: "active",
        cost: 2,
        duration: "Instant sloth / 5 speed",
        activatedAt: "2026-01-01T00:06:00.000Z",
      },
      {
        id: "smite-reminder",
        catalogId: "power-smite",
        name: "Smite",
        status: "active",
        cost: 2,
        duration: "5",
        activatedAt: "2026-01-01T00:07:00.000Z",
      },
      {
        id: "wall-walker-reminder",
        catalogId: "power-wall-walker",
        name: "Wall Walker",
        status: "active",
        cost: 2,
        duration: "5",
        activatedAt: "2026-01-01T00:08:00.000Z",
      },
    ],
  });

  await openArcane(page);
  const activePowers = page.locator("#activePowersList");
  await expect(activePowers).toContainText(
    "Track barrier placement, size, damage, and cover or obstruction manually.",
  );
  await expect(activePowers).toContainText(
    "Track submerged targets, underground movement, and emergence timing manually.",
  );
  await expect(activePowers).toContainText(
    "Track the affected area and whether it is light, darkness, or dispelled.",
  );
  await expect(activePowers).toContainText(
    "Track each affected target's restrained state and escape attempts manually.",
  );
  await expect(activePowers).toContainText(
    "Track flying Pace, altitude, target count, and terrain risks manually.",
  );
  await expect(activePowers).toContainText(
    "Track visibility, detection, and target-reveal circumstances manually.",
  );
  await expect(activePowers).toContainText(
    "Track whether Sloth or Speed is active for each affected target.",
  );
  await expect(activePowers).toContainText(
    "Track the affected weapon and damage bonus manually.",
  );
  await expect(activePowers).toContainText(
    "Track wall or ceiling movement, position, and surface limits manually.",
  );

  await openCombat(page);
  const combatPowers = page.locator("#playActivePowersList");
  await expect(combatPowers).not.toContainText(
    "Track barrier placement, size, damage, and cover or obstruction manually.",
  );
  await expect(combatPowers).not.toContainText(
    "Track whether Sloth or Speed is active for each affected target.",
  );
  await expect(
    combatPowers.getByRole("heading", { name: "Barrier" }),
  ).toHaveCount(0);
  await expect(
    combatPowers.getByRole("heading", { name: "Sloth/Speed" }),
  ).toHaveCount(0);
  await expect(
    combatPowers.getByRole("heading", { name: "Protection" }),
  ).toBeVisible();
});

test("Ended power records move to compact history without live reminders", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Inactive Active Power Reminder Tester",
    preferredId: "inactive-active-power-reminder-tester",
    activePowers: [
      {
        id: "expired-protection-reminder",
        catalogId: "power-protection",
        name: "Protection",
        status: "active",
        cost: 1,
        duration: "5",
        durationRemaining: 5,
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "dismissed-deflection-reminder",
        catalogId: "power-deflection",
        name: "Deflection",
        status: "active",
        cost: 3,
        duration: "5",
        durationRemaining: 5,
        activatedAt: "2026-01-01T00:01:00.000Z",
      },
      {
        id: "disrupted-boost-reminder",
        catalogId: "power-boost-lower-trait",
        name: "Boost/Lower Trait",
        status: "active",
        cost: 2,
        duration: "5 boost / Instant lower",
        activatedAt: "2026-01-01T00:02:00.000Z",
      },
    ],
  });

  await openArcane(page);
  const protection = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  const deflection = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Deflection" }),
    });
  const boostLowerTrait = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
    });

  await expect(protection).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(deflection).toContainText(
    "Apply the attack penalty against the protected target manually.",
  );
  await expect(boostLowerTrait).toContainText(
    "Track the affected Trait, target, and whether this is the boost or lower use.",
  );

  await protection.getByRole("button", { name: "Expire" }).click();
  await deflection.getByRole("button", { name: "Dismiss" }).click();
  await boostLowerTrait.getByRole("button", { name: "Disrupt" }).click();

  const historyGroup = page.locator(
    "#activePowersList .active-power-history-group",
  );
  await expect(historyGroup).toBeVisible();
  expect(await historyGroup.evaluate((details) => details.open)).toBe(false);
  const history = await openActivePowerHistory(page);
  const expiredProtection = historyPowerCard(history, "Protection");
  const dismissedDeflection = historyPowerCard(history, "Deflection");
  const disruptedBoost = historyPowerCard(history, "Boost/Lower Trait");

  await expect(expiredProtection).toContainText("Expired");
  await expect(dismissedDeflection).toContainText("Dismissed");
  await expect(disruptedBoost).toContainText("Disrupted");
  await expect(history).toContainText("Ended");
  await expect(history.locator(".entry-advisory")).toHaveCount(0);
  await expect(history.locator("input, textarea, button")).toHaveCount(0);
  await expect(history).not.toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(history).not.toContainText(
    "Apply the attack penalty against the protected target manually.",
  );
  await expect(history).not.toContainText(
    "Track the affected Trait, target, and whether this is the boost or lower use.",
  );
});

test("Variable power spend records cost breakdown and preserves reminders", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Variable Active Power Spend Tester",
    preferredId: "variable-active-power-spend-tester",
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(
    knownPower.getByRole("button", { name: "Activate — 1 PP" }),
  ).toHaveCount(1);
  await knownPower
    .getByRole("button", { name: "Increase Additional Recipients" })
    .click();
  await knownPower
    .getByRole("button", { name: "Increase Additional Recipients" })
    .click();
  await expect(knownPower.locator("[data-variable-spend='0']")).toHaveValue(
    "2",
  );
  await expect(knownPower).toContainText("Modifiers +2 PP");
  await knownPower.getByRole("button", { name: "Activate — 3 PP" }).click();

  let activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(activePower).toContainText("Activation details");
  await expect(activePower).toContainText("Base 1 PP; total 3 PP.");
  await expect(activePower).toContainText(
    "Additional Recipients × 2 extra target: +2 PP",
  );
  await expect(activePower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );

  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      activePower: character.activePowers[0],
    })),
  ).toEqual({
    powerPoints: 12,
    activePower: expect.objectContaining({
      name: "Protection",
      cost: 3,
      spendBreakdown: {
        baseCost: 1,
        totalCost: 3,
        modifiers: [
          {
            id: "additional-recipients",
            label: "Additional Recipients",
            quantity: 2,
            costPer: 1,
            totalCost: 2,
            quantityLabel: "extra target",
            manualCost: false,
          },
        ],
      },
    }),
  });

  await reloadIntoTracker(page);
  await openArcane(page);
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(activePower).toContainText("Base 1 PP; total 3 PP.");
  await expect(activePower).toContainText(
    "Additional Recipients × 2 extra target: +2 PP",
  );
  await expect(activePower.locator(".active-power-reminder")).toContainText(
    "Remember",
  );

  const exportedText = await page.evaluate(() =>
    JSON.stringify(serializeTrackerExport(character)),
  );
  await page.evaluate((text) => importJsonText(text), exportedText);
  await openCombat(page);
  const combatPower = page
    .locator("#playActivePowersList .combat-cast-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).not.toContainText("Base 1 PP; total 3 PP.");
  await expect(combatPower).not.toContainText(
    "Additional Recipients × 2 extra target: +2 PP",
  );
  await expect(combatPower).not.toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(combatPower).toContainText(
    "Grants Armor +2, or +4 with a raise.",
  );
  expect(
    await page.evaluate(() => character.activePowers[0].spendBreakdown),
  ).toEqual({
    baseCost: 1,
    totalCost: 3,
    modifiers: [
      {
        id: "additional-recipients",
        label: "Additional Recipients",
        quantity: 2,
        costPer: 1,
        totalCost: 2,
        quantityLabel: "extra target",
        manualCost: false,
      },
    ],
  });
});

test("Variable power spend blocks activation when Power Points are insufficient", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Variable Active Power Spend Block Tester",
    preferredId: "variable-active-power-spend-block-tester",
    powerPointsCurrent: 3,
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await knownPower.locator("[data-variable-spend='0']").fill("3");
  const spendButton = knownPower.getByRole("button", {
    name: "Activate — 4 PP",
  });
  await expect(spendButton).toBeDisabled();
  await expect(spendButton).toHaveAttribute("title", "Not enough Power Points");
  await expect(page.locator("#arcaneActivePowersPanel")).toBeHidden();
  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      activePowers: character.activePowers,
    })),
  ).toEqual({
    powerPoints: 3,
    activePowers: [],
  });
});

test("Imported and catalog modifiers share one activation configurator", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Unified Power Modifier Tester",
    preferredId: "unified-power-modifier-tester",
  });
  await page.evaluate(() => {
    character.powers[0].modifiers = [
      "ADDITIONAL RECIPIENTS (+1): The power may affect additional targets at a cost of 1 Power Point each.",
      "MORE ARMOR (+1): Success grants additional Armor.",
      "TOUGHNESS (+1): Protection provides Toughness instead of Armor.",
    ];
    render();
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(knownPower.locator(".variable-spend-row")).toHaveCount(3);
  await expect(
    knownPower.locator(".variable-spend-copy strong", {
      hasText: "Additional Recipients",
    }),
  ).toHaveCount(1);
  await expect(
    knownPower.getByRole("button", { name: /^Activate/ }),
  ).toHaveCount(1);

  await knownPower
    .getByRole("button", { name: "Increase Additional Recipients" })
    .click();
  await knownPower
    .locator(".variable-spend-row", { hasText: "More Armor" })
    .getByRole("checkbox")
    .check();
  await knownPower.getByRole("button", { name: "Activate — 3 PP" }).click();

  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      breakdown: character.activePowers[0].spendBreakdown,
    })),
  ).toEqual({
    powerPoints: 12,
    breakdown: {
      baseCost: 1,
      totalCost: 3,
      modifiers: [
        expect.objectContaining({
          label: "Additional Recipients",
          quantity: 1,
          totalCost: 1,
        }),
        expect.objectContaining({
          label: "More Armor",
          quantity: 1,
          totalCost: 1,
        }),
      ],
    },
  });
});

test("Imported tiered modifiers use one clear cost selector", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Tiered Power Modifier Tester",
    preferredId: "tiered-power-modifier-tester",
    powerIds: ["power-holy-symbol"],
  });
  await page.evaluate(() => {
    character.powers[0].modifiers = [
      "AREA EFFECT (+2/+3): For +2 points the power affects all allies within a Medium Blast Template centered on the caster. For +3 points the area of effect is increased to a Large Blast Template.",
      "STRONG (+1): Spirit rolls suffer an additional penalty.",
    ];
    render();
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Holy Symbol" }),
  });
  const areaCost = knownPower.getByRole("combobox", {
    name: "Area Effect Power Point cost",
  });
  await expect(areaCost.locator("option")).toHaveText([
    "Off",
    "+2 PP — 8 yards across",
    "+3 PP — 12 yards across",
  ]);
  await expect(knownPower).toContainText(
    "+2: Medium: 4″ diameter / 8 yards across • +3: Large: 6″ diameter / 12 yards across",
  );
  await areaCost.selectOption("3");
  await knownPower
    .locator(".variable-spend-row", { hasText: "Strong" })
    .getByRole("checkbox")
    .check();
  await expect(
    knownPower.getByRole("button", { name: "Activate — 7 PP" }),
  ).toBeEnabled();
});

test("Special-cost powers require one explicit final Power Point cost", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Manual Power Cost Tester",
    preferredId: "manual-power-cost-tester",
    powerIds: ["power-beast-friend"],
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Beast Friend" }),
  });
  await expect(knownPower).not.toContainText("Activate — 0 PP");
  const finalCost = knownPower.getByRole("spinbutton", {
    name: "Final Power Point Cost",
  });
  const activate = knownPower.getByRole("button", { name: "Enter PP Cost" });
  await expect(activate).toBeDisabled();
  await finalCost.fill("4");
  await knownPower.getByRole("button", { name: "Activate — 4 PP" }).click();

  expect(
    await page.evaluate(() => ({
      powerPoints: powerPointResource().current,
      cost: character.activePowers[0].cost,
    })),
  ).toEqual({
    powerPoints: 11,
    cost: 4,
  });
});

test("Active powers can be dismissed and disrupted without deleting records", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Status Tester",
    preferredId: "active-power-status-tester",
    activePowers: [
      {
        id: "dismissable-power",
        name: "Dismissable Power",
        status: "active",
        cost: 1,
        duration: "5 rounds",
        activatedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "disruptable-power",
        name: "Disruptable Power",
        status: "active",
        cost: 2,
        duration: "3 rounds",
        activatedAt: "2026-01-01T00:01:00.000Z",
      },
    ],
  });

  await openArcane(page);
  const dismissable = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Dismissable Power" }),
    });
  const disruptable = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Disruptable Power" }),
    });

  await dismissable.getByRole("button", { name: "Dismiss" }).click();
  await disruptable.getByRole("button", { name: "Disrupt" }).click();
  const history = await openActivePowerHistory(page);
  await expect(historyPowerCard(history, "Dismissable Power")).toContainText(
    "Dismissed",
  );
  await expect(historyPowerCard(history, "Disruptable Power")).toContainText(
    "Disrupted",
  );
  await expect(history).toContainText("Ended");

  expect(
    await page.evaluate(() =>
      character.activePowers.map((power) => ({
        id: power.id,
        status: power.status,
        ended: Boolean(power.endedAt),
      })),
    ),
  ).toEqual([
    { id: "dismissable-power", status: "dismissed", ended: true },
    { id: "disruptable-power", status: "disrupted", ended: true },
  ]);
});
