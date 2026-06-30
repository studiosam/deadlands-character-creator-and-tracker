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

test("Known powers activate into editable active power records", async ({
  page,
}) => {
  await seedActivePowerCharacter(page, {
    name: "Active Power Activation Tester",
    preferredId: "active-power-activation-tester",
  });

  await openArcane(page);
  const knownPower = page.locator("#powersList .power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(knownPower).toContainText("Protection");
  await knownPower.getByRole("button", { name: /Activate/ }).click();

  const activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(activePower).toContainText("Active");
  await expect(activePower).toContainText("Power effect reminder only");
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
  await expect(activePower).toContainText("Expired");

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
    .filter({ has: page.getByRole("heading", { name: "Protection" }) });
  await expect(protectionCards).toHaveCount(2);
  await expect(protectionCards).toContainText([
    /Active|Expired/,
    /Active|Expired/,
  ]);
  await expect(page.locator("#activePowersList")).toContainText(
    "Expired: effect reminders no longer apply.",
  );
  await expect(page.locator("#activePowersList")).toContainText("Ended:");
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

  await expect(page.locator("#activePowersList")).toContainText(
    "Dismissed: active effect reminders no longer apply.",
  );
  await expect(page.locator("#activePowersList")).toContainText("Ended:");
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
  await expect(activePower).toContainText("1 round left");
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
  await expect(activePower).toContainText("Duration expired.");
  await expect(activePower).toContainText("Expired");
  await expect(activePower).toContainText(
    "Expired: effect reminders no longer apply.",
  );
  await expect(activePower).toContainText("Ended:");
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
  await expect(combatPower).toContainText("Duration expired.");
  await expect(combatPower).toContainText("Expired");
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
  await expect(activePower).toContainText("Structured tracking");
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
  let combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Boost/Lower Trait" }),
    });
  await expect(combatPower).toContainText("Target: Dusty");
  await expect(combatPower).toContainText("Mode: Boost");
  await expect(combatPower).toContainText("Raise marked");

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
  const combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Manual Duration Power" }),
    });
  await expect(combatPower).toContainText("Manual duration: Maintained.");
  await expect(combatPower).toContainText("Maintenance marked");
  await expect(
    combatPower.getByRole("button", { name: "Tick down 1 round" }),
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

test("Active power runtime reminders render in Arcane and Combat and persist", async ({
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
  await expect(activePower).toContainText("Effect reminder");
  await expect(activePower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );
  await expect(activePower).toContainText(
    "Track raise, More Armor, and extra-recipient details separately.",
  );

  await openCombat(page);
  let combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).toContainText("Effect reminder");
  await expect(combatPower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );

  await reloadIntoTracker(page);
  await openArcane(page);
  activePower = page.locator("#activePowersList .active-power-card").filter({
    has: page.getByRole("heading", { name: "Protection" }),
  });
  await expect(activePower).toContainText("Effect reminder");
  await expect(activePower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );

  await openCombat(page);
  combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).toContainText("Effect reminder");
  await expect(combatPower).toContainText(
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
  await expect(combatPowers).toContainText(
    "Track barrier placement, size, damage, and cover or obstruction manually.",
  );
  await expect(combatPowers).toContainText(
    "Track whether Sloth or Speed is active for each affected target.",
  );
});

test("Active power runtime reminders are marked inactive for ended statuses", async ({
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
  await expect(protection).toContainText("Effect inactive");
  await expect(protection).toContainText(
    "Expired: effect reminders no longer apply.",
  );
  await expect(protection).toContainText("Ended:");
  await expect(protection).not.toContainText(
    "Apply the Armor bonus to the protected target manually.",
  );

  await deflection.getByRole("button", { name: "Dismiss" }).click();
  await expect(deflection).toContainText("Effect inactive");
  await expect(deflection).toContainText(
    "Dismissed: active effect reminders no longer apply.",
  );
  await expect(deflection).toContainText("Ended:");
  await expect(deflection).not.toContainText(
    "Apply the attack penalty against the protected target manually.",
  );

  await boostLowerTrait.getByRole("button", { name: "Disrupt" }).click();
  await expect(boostLowerTrait).toContainText("Effect inactive");
  await expect(boostLowerTrait).toContainText(
    "Disrupted: confirm maintained power consequences manually.",
  );
  await expect(boostLowerTrait).toContainText("Ended:");
  await expect(boostLowerTrait).not.toContainText(
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
  await knownPower.locator("[data-variable-spend='0']").fill("2");
  await knownPower.getByRole("button", { name: "Spend 3 PP" }).click();

  let activePower = page
    .locator("#activePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(activePower).toContainText("Power Point spend");
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
  await expect(activePower).toContainText("Effect reminder");

  const exportedText = await page.evaluate(() =>
    JSON.stringify(serializeTrackerExport(character)),
  );
  await page.evaluate((text) => importJsonText(text), exportedText);
  await openCombat(page);
  const combatPower = page
    .locator("#playActivePowersList .active-power-card")
    .filter({
      has: page.getByRole("heading", { name: "Protection" }),
    });
  await expect(combatPower).toContainText("Base 1 PP; total 3 PP.");
  await expect(combatPower).toContainText(
    "Additional Recipients × 2 extra target: +2 PP",
  );
  await expect(combatPower).toContainText(
    "Apply the Armor bonus to the protected target manually.",
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
  const spendButton = knownPower.getByRole("button", { name: "Spend 4 PP" });
  await expect(spendButton).toBeDisabled();
  await expect(spendButton).toHaveAttribute("title", "Not enough Power Points");
  await expect(page.locator("#activePowersList")).toContainText(
    "No active power records.",
  );
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
  await expect(dismissable).toContainText("Dismissed");
  await expect(dismissable).toContainText(
    "Dismissed: active effect reminders no longer apply.",
  );
  await expect(dismissable).toContainText("Ended:");
  await disruptable.getByRole("button", { name: "Disrupt" }).click();
  await expect(disruptable).toContainText("Disrupted");
  await expect(disruptable).toContainText(
    "Disrupted: confirm maintained power consequences manually.",
  );
  await expect(disruptable).toContainText("Ended:");

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
