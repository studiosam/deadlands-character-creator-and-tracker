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

test("Increase Skill writes a canonical ledger entry", async ({ page }) => {
  await seedCanonicalAdvancementCharacter(page);

  const [target] = await eligibleAdvanceSkills(page, "single");
  expect(
    target,
    "Expected at least one eligible one-skill advance target",
  ).toBeTruthy();

  await openAdvanceEditor(page, "Increase Skill");
  await page.locator("#advanceSkillSelect").selectOption(target.name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const result = await page.evaluate((targetName) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "skill-increase" &&
        item.changes?.some((change) => change.displayLabel === targetName),
    );
    const skill = character.skills.find((item) => item.name === targetName);
    return {
      skillDie: skill?.die || "",
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, target.name);

  expect(result.skillDie).toBe(target.after);
  expect(result.advance).toEqual(
    expect.objectContaining({
      type: "skill-increase",
      label: expect.any(String),
      source: "advancement",
      advanceNumber: expect.any(Number),
      rankAtTime: expect.any(String),
      createdAt: expect.any(String),
      changes: expect.any(Array),
      notes: expect.any(String),
    }),
  );
  expect(result.advance.changes).toHaveLength(1);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `skills[${target.name}].die`,
      before: target.before,
      after: target.after,
      displayLabel: target.name,
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((targetName) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "skill-increase" &&
        item.changes?.some((change) => change.displayLabel === targetName),
    );
    const skill = character.skills.find((item) => item.name === targetName);
    return {
      skillDie: skill?.die || "",
      advanceType: advance?.type || "",
      changeCount: advance?.changes?.length || 0,
    };
  }, target.name);

  expect(persisted).toEqual({
    skillDie: target.after,
    advanceType: "skill-increase",
    changeCount: 1,
  });
});

test("Increase Two Skills writes one canonical ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const targets = (await eligibleAdvanceSkills(page, "two")).slice(0, 2);
  expect(targets).toHaveLength(2);

  await openAdvanceEditor(page, "Increase Two Skills");
  await page.locator("#advanceSkillOneSelect").selectOption(targets[0].name);
  await page.locator("#advanceSkillTwoSelect").selectOption(targets[1].name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const result = await page.evaluate(
    (targetNames) => {
      const advances = character.advances.filter(
        (item) => item.type === "two-skills-increase",
      );
      const skills = targetNames.map((name) => {
        const skill = character.skills.find((item) => item.name === name);
        return { name, die: skill?.die || "" };
      });
      return { advances, skills };
    },
    targets.map((target) => target.name),
  );

  expect(result.advances).toHaveLength(1);
  expect(result.advances[0]).toEqual(
    expect.objectContaining({
      type: "two-skills-increase",
      label: expect.any(String),
      source: "advancement",
      advanceNumber: expect.any(Number),
      rankAtTime: expect.any(String),
      createdAt: expect.any(String),
      changes: expect.any(Array),
      notes: expect.any(String),
    }),
  );
  expect(result.advances[0].changes).toHaveLength(2);
  targets.forEach((target) => {
    expect(result.skills).toContainEqual({
      name: target.name,
      die: target.after,
    });
    expect(result.advances[0].changes).toContainEqual(
      expect.objectContaining({
        path: `skills[${target.name}].die`,
        before: target.before,
        after: target.after,
        displayLabel: target.name,
      }),
    );
  });
  expect(Boolean(result.advances[0].appliedChanges?.length)).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(
    (targetNames) => {
      const advances = character.advances.filter(
        (item) => item.type === "two-skills-increase",
      );
      const skills = targetNames.map((name) => {
        const skill = character.skills.find((item) => item.name === name);
        return { name, die: skill?.die || "" };
      });
      return {
        advanceCount: advances.length,
        changeCount: advances[0]?.changes?.length || 0,
        skills,
      };
    },
    targets.map((target) => target.name),
  );

  expect(persisted.advanceCount).toBe(1);
  expect(persisted.changeCount).toBe(2);
  targets.forEach((target) => {
    expect(persisted.skills).toContainEqual({
      name: target.name,
      die: target.after,
    });
  });
});

test("Increase Attribute writes a canonical attribute-increase ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const target = await firstEligibleAttributeAdvance(page);
  expect(
    target,
    "Expected at least one eligible attribute advance target",
  ).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(target.key);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText(
    "Increase Attribute",
  );
  await expect(page.locator("#advancesList")).toContainText(target.targetName);

  const result = await page.evaluate((attributeKey) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "attribute-increase" &&
        item.changes?.some(
          (change) => change.path === `attributes.${attributeKey}`,
        ),
    );
    return {
      attributeDie: character.attributes?.[attributeKey] || "",
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, target.key);

  expect(result.attributeDie).toBe(target.after);
  expectCanonicalAdvanceScaffold(result.advance, "attribute-increase");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `attributes.${target.key}`,
      before: target.before,
      after: target.after,
      displayLabel: target.targetName,
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((attributeKey) => {
    const advance = character.advances.find(
      (item) =>
        item.type === "attribute-increase" &&
        item.changes?.some(
          (change) => change.path === `attributes.${attributeKey}`,
        ),
    );
    return {
      attributeDie: character.attributes?.[attributeKey] || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, target.key);

  expect(persisted.attributeDie).toBe(target.after);
  expect(persisted.advanceType).toBe("attribute-increase");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      path: `attributes.${target.key}`,
      before: target.before,
      after: target.after,
      displayLabel: target.targetName,
    }),
  );
});

test("blocks a second Increase Attribute advance in the same Rank", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const firstTarget = await firstEligibleAttributeAdvance(page);
  expect(firstTarget).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(firstTarget.key);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();

  const secondTarget = await firstEligibleAttributeAdvance(page);
  expect(secondTarget).toBeTruthy();

  await openAdvanceEditor(page, "Increase Attribute");
  await page.locator("#advanceAttributeSelect").selectOption(secondTarget.key);

  await expect(page.locator("#advanceEditorPanel")).toBeVisible();
  await expect(page.locator("#saveAdvanceBtn")).toBeDisabled();
  await expect(page.locator("#advanceDynamicWarning")).toContainText(
    "You have already increased an Attribute this Rank.",
  );

  const result = await page.evaluate(() => ({
    attributeIncreaseCount: character.advances.filter(
      (advance) => advance.type === "attribute-increase",
    ).length,
    appliedAttributeIncreaseCount: character.advances.filter(
      (advance) => advance.type === "attribute-increase" && advance.applied,
    ).length,
  }));

  expect(result).toEqual({
    attributeIncreaseCount: 1,
    appliedAttributeIncreaseCount: 1,
  });
});

test("applies Legendary Attribute cadence without fixed parity", async ({
  page,
}) => {
  await enterTracker(page);

  const results = await page.evaluate(() => {
    const attributeChange = (attributeName, before = "d6", after = "d8") => ({
      path: `attributes.${attributeName}`,
      before,
      after,
      displayLabel: displayNameFromKey(attributeName),
      targetType: "attribute",
      operation: "update",
    });
    const attributeAdvance = (
      advanceNumber,
      attributeName,
      source = "advancement",
    ) =>
      normalizeAdvanceEntry({
        id: `attribute-${advanceNumber}-${attributeName}`,
        type: "attribute-increase",
        label: `Increase Attribute: ${displayNameFromKey(attributeName)}`,
        source,
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        changes: [attributeChange(attributeName)],
        applied: true,
        appliedByApp: source === "advancement",
      });
    const nonAttributeAdvance = (advanceNumber) =>
      normalizeAdvanceEntry({
        id: `edge-${advanceNumber}`,
        type: "edge-gain",
        label: "New Edge: Alertness",
        source: "advancement",
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        changes: [
          {
            path: "edges[alertness]",
            before: null,
            after: { id: "alertness", name: "Alertness" },
            displayLabel: "Alertness",
            targetType: "edge",
            operation: "add",
          },
        ],
        applied: true,
        appliedByApp: true,
      });
    const candidate = (advanceNumber, attributeName = "strength") =>
      normalizeAdvanceEntry({
        id: `candidate-${advanceNumber}-${attributeName}`,
        type: "attribute-increase",
        label: `Increase Attribute: ${displayNameFromKey(attributeName)}`,
        source: "advancement",
        advanceNumber,
        rankAtTime: rankForAdvanceNumber(advanceNumber),
        createdAt: "2026-06-27T00:00:00.000Z",
        targetName: displayNameFromKey(attributeName),
        targetType: "attribute",
        targets: [
          {
            targetType: "attribute",
            targetName: displayNameFromKey(attributeName),
            targetId: attributeName,
            before: "d6",
            after: "d8",
          },
        ],
      });
    const warningsFor = (
      advances,
      advanceNumber,
      attributeName = "strength",
    ) => {
      const testCharacter = normalize({
        name: "Legendary Cadence Tester",
        rank: "Legendary",
        attributes: {
          agility: "d6",
          smarts: "d6",
          spirit: "d6",
          strength: "d6",
          vigor: "d6",
        },
        skills: [],
        advances,
      });
      return getAdvanceApplicationWarnings(
        testCharacter,
        candidate(advanceNumber, attributeName),
      );
    };

    return {
      heroic15DoesNotBlockLegendary16: warningsFor(
        [attributeAdvance(15, "agility")],
        16,
        "strength",
      ),
      legendary16Blocks17: warningsFor(
        [attributeAdvance(16, "agility")],
        17,
        "strength",
      ),
      legendary16Allows18: warningsFor(
        [attributeAdvance(16, "agility")],
        18,
        "strength",
      ),
      skipped16Allows17: warningsFor([nonAttributeAdvance(16)], 17, "strength"),
      importedHistoryDoesNotCount: warningsFor(
        [
          normalizeAdvanceEntry({
            id: "imported-attribute-label",
            type: "imported-history",
            label: "Raise Attribute: Strength",
            source: "imported",
            advanceNumber: 16,
            rankAtTime: "Legendary",
            changes: [],
          }),
        ],
        17,
        "strength",
      ),
    };
  });

  expect(results.heroic15DoesNotBlockLegendary16).toEqual([]);
  expect(results.legendary16Blocks17).toContain(
    "Legendary characters may increase an Attribute every other Advance. Take a different Advance before increasing another Attribute.",
  );
  expect(results.legendary16Allows18).toEqual([]);
  expect(results.skipped16Allows17).toEqual([]);
  expect(results.importedHistoryDoesNotCount).toEqual([]);
});

test("New Edge writes a canonical edge-gain ledger entry", async ({ page }) => {
  await seedCanonicalAdvancementCharacter(page);

  const edge = await firstAvailableAdvanceEdge(page);
  expect(
    edge,
    "Expected at least one available Edge catalog entry",
  ).toBeTruthy();

  await openAdvanceEditor(page, "New Edge");
  await page.locator("#advanceEdgeSelect").selectOption(edge.id);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("New Edge");
  await expect(page.locator("#advancesList")).toContainText(edge.name);

  const result = await page.evaluate((edgeName) => {
    const edgeRecord = character.edges.find((item) => item.name === edgeName);
    const advance = character.advances.find(
      (item) =>
        item.type === "edge-gain" &&
        item.changes?.some((change) => change.displayLabel === edgeName),
    );
    return {
      edge: edgeRecord,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, edge.name);

  expect(result.edge).toEqual(
    expect.objectContaining({
      name: edge.name,
      source: "advancement",
      createdByAdvanceId: expect.any(String),
    }),
  );
  expectCanonicalAdvanceScaffold(result.advance, "edge-gain");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `edges[${result.edge.id}]`,
      before: null,
      after: expect.objectContaining({
        id: result.edge.id,
        catalogId: edge.id,
        name: edge.name,
      }),
      displayLabel: edge.name,
      targetType: "edge",
      operation: "add",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((edgeName) => {
    const edgeRecord = character.edges.find((item) => item.name === edgeName);
    const advance = character.advances.find(
      (item) =>
        item.type === "edge-gain" &&
        item.changes?.some((change) => change.displayLabel === edgeName),
    );
    return {
      edgeName: edgeRecord?.name || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, edge.name);

  expect(persisted.edgeName).toBe(edge.name);
  expect(persisted.advanceType).toBe("edge-gain");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      displayLabel: edge.name,
      targetType: "edge",
      operation: "add",
    }),
  );
});

test("New Powers writes a canonical power-gain ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const power = await firstAvailableAdvancePower(page);
  expect(
    power,
    "Expected at least one available Power catalog entry",
  ).toBeTruthy();

  await openAdvanceEditor(page, "New Powers");
  await page.locator("#advancePowerSelect").selectOption(power.id);
  await page.locator("#advanceAddPowerTargetBtn").click();
  await expect(page.locator(".selected-target-list")).toContainText(power.name);
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("New Powers");
  await expect(page.locator("#advancesList")).toContainText(power.name);

  const result = await page.evaluate((powerName) => {
    const powerRecord = character.powers.find(
      (item) => item.name === powerName,
    );
    const advance = character.advances.find(
      (item) =>
        item.type === "power-gain" &&
        item.changes?.some((change) => change.displayLabel === powerName),
    );
    return {
      power: powerRecord,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  }, power.name);

  expect(result.power).toEqual(
    expect.objectContaining({
      name: power.name,
      source: "advancement",
      addedReason: "advancement",
      createdByAdvanceId: expect.any(String),
    }),
  );
  expectCanonicalAdvanceScaffold(result.advance, "power-gain");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: `powers[${result.power.id}]`,
      before: null,
      after: expect.objectContaining({
        id: result.power.id,
        catalogId: power.id,
        name: power.name,
      }),
      displayLabel: power.name,
      targetType: "power",
      operation: "add",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate((powerName) => {
    const powerRecord = character.powers.find(
      (item) => item.name === powerName,
    );
    const advance = character.advances.find(
      (item) =>
        item.type === "power-gain" &&
        item.changes?.some((change) => change.displayLabel === powerName),
    );
    return {
      powerName: powerRecord?.name || "",
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  }, power.name);

  expect(persisted.powerName).toBe(power.name);
  expect(persisted.advanceType).toBe("power-gain");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      displayLabel: power.name,
      targetType: "power",
      operation: "add",
    }),
  );
});

test("Power Points writes a canonical power-points-increase ledger entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);

  const before = await page.evaluate(() => powerPointResource()?.max || 0);
  const amount = 5;

  await openAdvanceEditor(page, "Power Points");
  await page.locator("#advancePowerPointAmountInput").fill(String(amount));
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText("Power Points");

  const result = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "power-points-increase",
    );
    return {
      maxPowerPoints: powerPointResource()?.max || 0,
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  });

  expect(result.maxPowerPoints).toBe(before + amount);
  expectCanonicalAdvanceScaffold(result.advance, "power-points-increase");
  expect(result.advance.source).toBe("advancement");
  expect(result.advance.changes).toHaveLength(1);
  expectCanonicalChangeScaffold(result.advance.changes[0]);
  expect(result.advance.changes[0]).toEqual(
    expect.objectContaining({
      path: "resources.power-points.max",
      before,
      after: before + amount,
      displayLabel: "Power Points",
      targetType: "power-points",
      operation: "update",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "power-points-increase",
    );
    return {
      maxPowerPoints: powerPointResource()?.max || 0,
      advanceType: advance?.type || "",
      change: advance?.changes?.[0] || null,
    };
  });

  expect(persisted.maxPowerPoints).toBe(before + amount);
  expect(persisted.advanceType).toBe("power-points-increase");
  expect(persisted.change).toEqual(
    expect.objectContaining({
      before,
      after: before + amount,
      displayLabel: "Power Points",
    }),
  );
});

test("Other Marshal-approved writes a canonical gm-exception history entry", async ({
  page,
}) => {
  await seedCanonicalAdvancementCharacter(page);
  const before = await nonAdvancementMutationSnapshot(page);

  await openAdvanceEditor(page, "Other / Marshal-approved");
  await page.locator("#advanceSourceInput").selectOption("marshal-override");
  await page
    .locator("#advanceSummaryInput")
    .fill("Marshal-approved story milestone");
  await page.locator("#advanceTargetTypeInput").selectOption("custom");
  await page.locator("#advanceTargetNameInput").fill("Story milestone");
  await page.locator("#showAdvanceNotesBtn").click();
  await page.locator("#advanceNotesInput").fill("No sheet mutation.");
  await page.locator("#saveAdvanceBtn").click();
  await expect(page.locator("#advanceEditorPanel")).toBeHidden();
  await expect(page.locator("#advancesList")).toContainText(
    "Other / Marshal-approved",
  );
  await expect(page.locator("#advancesList")).toContainText(
    "Marshal-approved story milestone",
  );

  const after = await nonAdvancementMutationSnapshot(page);
  expect(after).toEqual(before);

  const result = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "gm-exception",
    );
    return {
      advance,
      hasLegacyAppliedChanges: Boolean(advance?.appliedChanges?.length),
    };
  });

  expectCanonicalAdvanceScaffold(result.advance, "gm-exception");
  expect(result.advance).toEqual(
    expect.objectContaining({
      source: "marshal-override",
      targetType: "custom",
      targetName: "Story milestone",
      applied: false,
      appliedByApp: false,
      appliedAt: "",
      changes: [],
      notes: "No sheet mutation.",
    }),
  );
  expect(result.hasLegacyAppliedChanges).toBe(false);

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() => {
    const advance = character.advances.find(
      (item) => item.type === "gm-exception",
    );
    return {
      type: advance?.type || "",
      source: advance?.source || "",
      changesLength: advance?.changes?.length ?? -1,
      applied: Boolean(advance?.applied),
      appliedByApp: Boolean(advance?.appliedByApp),
    };
  });

  expect(persisted).toEqual({
    type: "gm-exception",
    source: "marshal-override",
    changesLength: 0,
    applied: false,
    appliedByApp: false,
  });
});

test("Imported Savaged.us advancement history remains canonical imported history", async ({
  page,
}) => {
  await importMinimalSavagedAdvancementHistory(page);

  const imported = await page.evaluate(() => ({
    shootingDie:
      character.skills.find((skill) => skill.name === "Shooting")?.die || "",
    advances: character.advances.map((advance) => ({
      type: advance.type,
      source: advance.source,
      label: advance.label,
      changesLength: advance.changes?.length || 0,
      applied: Boolean(advance.applied),
      appliedByApp: Boolean(advance.appliedByApp),
      trustedUndoable: Boolean(advance.appliedByApp && advance.changes?.length),
    })),
  }));

  expect(imported.shootingDie).toBeTruthy();
  expect(imported.advances.length).toBeGreaterThan(0);
  await expect(page.locator("#advancesList")).toContainText("Imported History");
  imported.advances.forEach((advance) => {
    expect(advance.type).toBe("imported-history");
    expect(advance.source).toBe("imported");
    expect(advance.label).toBeTruthy();
    expect(advance.changesLength).toBe(0);
    expect(advance.applied).toBe(false);
    expect(advance.appliedByApp).toBe(false);
    expect(advance.trustedUndoable).toBe(false);
  });

  await reloadIntoTracker(page);
  const persisted = await page.evaluate(() =>
    character.advances.map((advance) => ({
      type: advance.type,
      source: advance.source,
      changesLength: advance.changes?.length || 0,
      applied: Boolean(advance.applied),
      appliedByApp: Boolean(advance.appliedByApp),
    })),
  );

  expect(persisted.length).toBe(imported.advances.length);
  persisted.forEach((advance) => {
    expect(advance).toEqual(
      expect.objectContaining({
        type: "imported-history",
        source: "imported",
        changesLength: 0,
        applied: false,
        appliedByApp: false,
      }),
    );
  });
});
