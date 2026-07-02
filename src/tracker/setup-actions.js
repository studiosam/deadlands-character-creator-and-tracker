/**
 * Character Setup action and mutation helpers.
 *
 * Setup actions mutate draft character records, apply source tracking, and
 * coordinate audit remediation. Rendering stays in setup-render.js, while
 * validation and status helpers stay in setup-model.js.
 */
function applyConceptField(input) {
  const field = input.dataset.conceptField;
  if (
    ![
      "name",
      "gender",
      "age",
      "archetype",
      "player",
      "description",
      "background",
    ].includes(field)
  )
    return;
  character[field] = input.value.trim();
  renderCharacterIdentityDisplays();
  save();
}

function collectConceptInputs() {
  document.querySelectorAll("[data-concept-field]").forEach((input) => {
    const field = input.dataset.conceptField;
    if (
      [
        "name",
        "gender",
        "age",
        "archetype",
        "player",
        "description",
        "background",
      ].includes(field)
    )
      character[field] = input.value.trim();
  });
}

function applyConceptInputs() {
  collectConceptInputs();
  render();
  save();
}

function setupHasUnspentHindrancePoints() {
  const stats = hindrancePointStats();
  if (!stats.count) return false;
  const spending = setupHindranceBenefitSpending(stats);
  return spending.remaining > 0;
}

function setupHasNoHindrances() {
  return !hindrancePointStats().count;
}

function acknowledgeNoSetupHindrances() {
  if (!setupHasNoHindrances()) return;
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
    noHindrancesAcknowledged: true,
  };
}

function clearNoSetupHindranceAcknowledgement() {
  if (!setupHasNoHindrances()) return;
  if (!character.creation?.noHindrancesAcknowledged) return;
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
    noHindrancesAcknowledged: false,
  };
}

async function confirmProceedWithUnspentHindrancePoints() {
  if (characterSetupStep !== "hindrances") return true;
  if (!setupHasUnspentHindrancePoints()) return true;
  return appConfirm(
    "You have unspent Hindrance points. You can continue, but those starting bonuses will be unused unless your table allows changing them later.",
    {
      title: "Continue with unspent Hindrance points?",
      confirmText: "Continue Anyway",
      cancelText: "Go Back",
    },
  );
}

async function moveSetupStep(offset) {
  collectConceptInputs();
  if (offset > 0 && !(await confirmProceedWithUnspentHindrancePoints())) return;
  const currentIndex = CHARACTER_SETUP_STEPS.findIndex(
    (step) => step.id === characterSetupStep,
  );
  const targetStep = CHARACTER_SETUP_STEPS[currentIndex + offset];
  if (!targetStep) return;
  if (characterSetupStep === "hindrances" && offset > 0)
    acknowledgeNoSetupHindrances();
  characterSetupStep = targetStep.id;
  if (characterSetupStep === "hindrances")
    clearNoSetupHindranceAcknowledgement();
  renderCharacterSetup();
  save();
  $("#characterSetupContent")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

async function nextSetupStep() {
  await moveSetupStep(1);
}

function previousSetupStep() {
  void moveSetupStep(-1);
}

function setupHindranceSeverityForCatalog(catalogEntry, selectedSeverity = "") {
  if (catalogEntry?.severity === "Major" || catalogEntry?.severity === "Minor")
    return catalogEntry.severity;
  return selectedSeverity === "Major" ? "Major" : "Minor";
}

function setupHindranceHasFixedSeverity(catalogEntry) {
  return (
    catalogEntry?.severity === "Major" || catalogEntry?.severity === "Minor"
  );
}

function addSetupHindrance() {
  const catalogSelect = $("#setupHindranceCatalogSelect");
  const severityInput = $("#setupHindranceSeverityInput");
  const notesInput = $("#setupHindranceNotesInput");
  const catalogEntry = chosen(HINDRANCE_CATALOG, catalogSelect?.value || "");
  if (!catalogEntry) {
    appToast("Choose a Hindrance before adding it.", "danger");
    return;
  }

  const duplicate = character.hindrances.some(
    (hindrance) =>
      plainEntryName(hindrance.name) === plainEntryName(catalogEntry.name),
  );
  if (duplicate) {
    appToast("That Hindrance is already selected.", "danger");
    return;
  }

  const id = uniqueEntryId(
    generateStableEntryId("hindrance", catalogEntry.name),
    new Set(character.hindrances.map((hindrance) => hindrance.id)),
  );
  const severity = setupHindranceSeverityForCatalog(
    catalogEntry,
    severityInput?.value || "",
  );
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
    noHindrancesAcknowledged: false,
  };
  upsertHindrance(
    character,
    applySetupSourceFields(
      {
        ...catalogEntry,
        id,
        catalogId: catalogEntry.id,
        severity,
        notes: notesInput?.value.trim() || "",
        isCustom: false,
      },
      "setup-starting-hindrance",
      {
        catalogId: catalogEntry.id,
        severity,
      },
    ),
  );
  render();
  save();
  appToast(`${catalogEntry.name} added.`, "success");
}

function removeSetupHindrance(id) {
  if (!id) return;
  removeHindrance(character, id);
  if (setupHasNoHindrances()) clearNoSetupHindranceAcknowledgement();
  render();
  save();
  appToast("Hindrance removed.", "success");
}

function setupCanDecreaseHindranceBenefit(key, nextValue) {
  if (key === "extraAttributeRaisesFromHindrances") {
    const stats = setupAttributePointStats();
    return stats.spent <= stats.normalAttributePoints + nextValue;
  }
  if (key === "extraSkillPointsFromHindrances") {
    const stats = setupSkillPointStats();
    return stats.spent <= stats.normalSkillPoints + nextValue;
  }
  if (key === "extraEdgesFromHindrances") {
    return setupHindranceBenefitEdges().length <= nextValue;
  }
  return true;
}

function setupHindranceBenefitDecreaseMessage(key) {
  if (key === "extraAttributeRaisesFromHindrances")
    return "Reduce starting Attributes before removing this Attribute benefit.";
  if (key === "extraSkillPointsFromHindrances")
    return "Reduce starting Skills before removing this Skill point benefit.";
  if (key === "extraEdgesFromHindrances")
    return "Remove a Hindrance benefit Edge before removing this Edge benefit.";
  return "That Hindrance benefit cannot be reduced right now.";
}

function updateSetupMoneyForBenefitChange(key, direction) {
  if (key !== "extraMoneyFromHindrances") return;
  character.moneyCents = Math.max(
    0,
    (Number(character.moneyCents) || 0) + direction * 50000,
  );
}

function changeSetupHindranceBenefit(key, direction) {
  if (!ensureSetupTraitsEditable()) return;
  const benefit = setupHindranceBenefitItem(key);
  if (!benefit) return;
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
  };
  const current = setupCreationBenefitValue(key);

  if (direction > 0) {
    const spending = setupHindranceBenefitSpending();
    if (spending.remaining < benefit.cost) {
      appToast("Not enough Hindrance benefit points remain.", "danger");
      return;
    }
    character.creation[key] = current + 1;
    updateSetupMoneyForBenefitChange(key, 1);
  } else if (direction < 0 && current > 0) {
    const nextValue = current - 1;
    if (!setupCanDecreaseHindranceBenefit(key, nextValue)) {
      appToast(setupHindranceBenefitDecreaseMessage(key), "danger");
      return;
    }
    character.creation[key] = nextValue;
    updateSetupMoneyForBenefitChange(key, -1);
  } else {
    return;
  }

  render();
  save();
}

function setupSkillIncreaseCost(name, existing) {
  const definition = setupSkillDefinition(name);
  const currentCost = existing ? setupSkillPointCost(existing) : 0;
  const nextSkill = existing
    ? { ...existing }
    : {
        name,
        die: setupStartingSkillBaselineDie(name) || "d4",
        linkedAttribute: definition.linkedAttribute,
        notes: "",
        core: definition.core,
      };
  if (existing) {
    const currentIndex = getDieStepIndex(existing.die || existing.value);
    if (currentIndex < 0 || currentIndex >= DIE_STEPS.length - 1)
      return Infinity;
    nextSkill.die = setupTraitDieFromIndex(currentIndex + 1);
  }
  return Math.max(0, setupSkillPointCost(nextSkill) - currentCost);
}

function addSetupEdgeFromCatalog(selectId, creationSource, sourceLabel) {
  if (!ensureSetupTraitsEditable()) return;
  const catalogSelect = $(selectId);
  const catalogEntry = chosen(EDGE_CATALOG, catalogSelect?.value || "");
  if (!catalogEntry) {
    appToast("Choose an Edge before adding it.", "danger");
    return;
  }

  const stillEligible = setupEligibleStartingEdges().some(
    (edge) => edge.id === catalogEntry.id,
  );
  if (!stillEligible) {
    appToast(
      `${sourceLabel} is no longer eligible. Reselect it after reviewing Attributes, Skills, Rank, prerequisites, and selected Edges.`,
      "danger",
    );
    return;
  }

  const duplicate = (character.edges || []).some(
    (edge) => plainEntryName(edge.name) === plainEntryName(catalogEntry.name),
  );
  if (duplicate) {
    appToast("That Edge is already selected.", "danger");
    return;
  }

  const eligibility = setupEdgeEligibility(catalogEntry);
  if (!eligibility.eligible) {
    appToast(
      eligibility.reason || "That Edge is not currently eligible.",
      "danger",
    );
    return;
  }

  if (
    creationSource === "human-free-edge" &&
    setupHumanFreeEdges().length >= setupExpectedHumanFreeEdges()
  ) {
    appToast("The Human free Edge slot is already filled.", "danger");
    return;
  }

  const id = uniqueEntryId(
    generateStableEntryId("edge", `${creationSource}-${catalogEntry.name}`),
    new Set((character.edges || []).map((edge) => edge.id)),
  );
  upsertEdge(
    character,
    applySetupSourceFields(
      {
        ...catalogEntry,
        id,
        catalogId: catalogEntry.id,
        isCustom: false,
      },
      creationSource,
      {
        catalogId: catalogEntry.id,
        slotType: creationSource,
      },
    ),
  );
  render();
  save();
  appToast(`${catalogEntry.name} added.`, "success");
}

function ensureSetupStartingEdgesValidForCompletion() {
  const report = setupStartingEdgeValidationReport();
  if (!report.editable || !report.invalidEdges.length) return true;

  character.setupStatus = "needsReview";
  characterSetupReviewOpen = true;
  characterSetupStep = "edges";
  render();
  appToast(
    "Resolve invalid source-tracked starting Edges before confirming setup.",
    "danger",
  );
  return false;
}

function removeSetupEdge(id) {
  if (!ensureSetupTraitsEditable() || !id) return;
  const edge = (character.edges || []).find((item) => item.id === id);
  if (!edge) return;
  if (
    !["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    )
  ) {
    appToast("Only setup-selected Edges can be removed here.", "danger");
    return;
  }
  removeEdge(character, id);
  render();
  save();
  appToast("Edge removed.", "success");
}

function setupStartingPowerById(powerId) {
  return typeof findPowerCatalogEntryById === "function" && powerId
    ? findPowerCatalogEntryById(powerId)
    : null;
}

function setupPowerAlreadyKnown(catalogPower) {
  return (character.powers || []).some((power) =>
    setupKnownPowerMatchesCatalog(power, catalogPower),
  );
}

function addSetupStartingPower(powerId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const report = setupPowerAuditReport();
  const selectedId = powerId || $("#setupStartingPowerSelect")?.value || "";
  const catalogPower = setupStartingPowerById(selectedId);

  if (!report.profile) {
    appToast(
      "Choose an Arcane Background before adding starting Powers.",
      "danger",
    );
    return;
  }
  if (!catalogPower) {
    appToast("Choose a starting Power before adding it.", "danger");
    return;
  }
  if (!report.profile.allowedPowerIds?.includes(catalogPower.id)) {
    appToast(
      `${catalogPower.name} is not allowed for ${report.profile.name}.`,
      "danger",
    );
    return;
  }
  if (
    typeof rankAllowsPower === "function" &&
    !rankAllowsPower(character.rank, catalogPower.rank)
  ) {
    appToast(
      `${catalogPower.name} requires ${catalogPower.rank} rank.`,
      "danger",
    );
    return;
  }
  if (setupPowerAlreadyKnown(catalogPower)) {
    appToast("That Power is already recorded.", "danger");
    return;
  }
  if (!report.startingPowerSlotOpen) {
    appToast("All starting Power slots are already filled.", "danger");
    return;
  }

  if (!Array.isArray(character.powers)) character.powers = [];
  character.powers.push(
    applySetupSourceFields(
      normalizePowerRecord(
        createKnownPowerFromCatalog(catalogPower, character, {
          addedReason: "setup-starting-power",
          creationSource: "setup-starting-power",
        }),
        character.powers.length,
        character.arcaneBackground?.edgeName,
      ),
      "setup-starting-power",
      {
        catalogId: catalogPower.id,
        arcaneBackground: report.profile.name,
      },
    ),
  );
  render();
  save();
  appToast(`${catalogPower.name} added as a starting Power.`, "success");
}

function removeSetupStartingPower(powerId) {
  if (!ensureSetupTraitsEditable() || !powerId) return;
  const power = (character.powers || []).find((item) => item.id === powerId);
  if (!power) return;
  if (setupPowerCreationSource(power) !== "setup-starting-power") {
    appToast(
      "Only setup-selected starting Powers can be removed here.",
      "danger",
    );
    return;
  }
  character.powers = character.powers.filter((item) => item.id !== powerId);
  render();
  save();
  appToast("Starting Power removed.", "success");
}

function setupPowerPointConfig(report) {
  if (!report?.profile) return null;
  return {
    displayName: report.profile.name,
    arcaneSkill: report.profile.arcaneSkill,
    startingPowerPoints: report.expectedPowerPoints,
    edgeName: `Setup: Arcane Background (${report.profile.name})`,
  };
}

function setSetupStartingPowerPoints() {
  if (!ensureSetupTraitsEditable()) return;
  const report = setupPowerAuditReport();
  const config = setupPowerPointConfig(report);
  if (!config || !report.expectedPowerPoints) {
    appToast(
      "Choose an Arcane Background before setting Power Points.",
      "danger",
    );
    return;
  }

  const resource = applySetupSourceFields(
    makePowerPointResource(config, {
      current: report.expectedPowerPoints,
      max: report.expectedPowerPoints,
      source: `Setup: Arcane Background (${report.profile.name})`,
      creationSource: "setup-arcane-background",
      note: `${report.profile.name} starting Power Points.`,
    }),
    "setup-arcane-background",
    {
      arcaneBackground: report.profile.name,
      startingPowerPoints: report.expectedPowerPoints,
    },
  );
  const existingIndex = (character.resources || []).findIndex(
    (item) => item.id === "power-points",
  );

  if (!Array.isArray(character.resources)) character.resources = [];
  if (existingIndex >= 0) character.resources[existingIndex] = resource;
  else character.resources.push(resource);

  render();
  save();
  appToast("Starting Power Points set.", "success");
}

function ensureSetupTraitsEditable() {
  if (setupTraitsEditable()) return true;
  appToast(
    "Trait editing is only available for created characters with no Advances.",
    "danger",
  );
  return false;
}

function setupTraitDieFromIndex(index) {
  return DIE_STEPS[clamp(index, 0, DIE_STEPS.length - 1)] || "d4";
}

function setupFindSkill(name) {
  return (character.skills || []).find((skill) => skill.name === name);
}

function setupSkillDefinition(name) {
  const referenceName = skillReferenceName(name);
  return {
    name: referenceName,
    linkedAttribute: setupSkillAttributeKey(
      SKILL_LINKED_ATTRIBUTES[referenceName] || "smarts",
    ),
    core: setupSkillIsCoreName(referenceName),
  };
}

function updateSetupCreationBaseline() {
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
  };
  character.creationBaseline = {
    ...(character.creationBaseline || {}),
    attributes: clone(character.attributes || {}),
    skills: clone(character.skills || []),
  };
  normalizeCreationBaselineShape(character);
}

function recalculateSetupTraitDerivedStats() {
  const fighting = setupFindSkill("Fighting");
  const fightingIndex = getDieStepIndex(fighting?.die || fighting?.value);
  const fightingSides =
    fightingIndex >= 0 ? Number(DIE_STEPS[fightingIndex].replace("d", "")) : 0;
  const vigorIndex = getDieStepIndex(character.attributes?.vigor || "d4");
  const vigorSides =
    vigorIndex >= 0 ? Number(DIE_STEPS[vigorIndex].replace("d", "")) : 4;
  const armor = armorValue("best");

  character.derived = {
    ...(character.derived || {}),
    pace: Number(character.derived?.pace) || 6,
    parry: 2 + Math.floor(fightingSides / 2),
    baseToughness: 2 + Math.floor(vigorSides / 2),
    toughness: 2 + Math.floor(vigorSides / 2) + armor,
    armor,
  };
  character.armorStrength = character.attributes?.strength || "d4";
  character.weaponStrength = character.attributes?.strength || "d4";
}

function commitSetupTraitChange() {
  updateSetupCreationBaseline();
  recalculateSetupTraitDerivedStats();
  render();
  save();
}

function changeSetupAttribute(name, direction) {
  if (!ensureSetupTraitsEditable()) return;
  const key = setupSkillAttributeKey(name);
  if (!ATTRIBUTE_ORDER.includes(key)) return;
  if (!character.attributes) character.attributes = {};
  const currentIndex = Math.max(
    0,
    getDieStepIndex(character.attributes[key] || "d4"),
  );
  if (direction > 0) {
    const stats = setupAttributePointStats();
    if (currentIndex >= DIE_STEPS.length - 1 || stats.spent >= stats.available)
      return;
    character.attributes[key] = setupTraitDieFromIndex(currentIndex + 1);
  } else if (currentIndex > 0) {
    character.attributes[key] = setupTraitDieFromIndex(currentIndex - 1);
  }
  commitSetupTraitChange();
}

function resetSetupAttributes() {
  if (!ensureSetupTraitsEditable()) return;
  if (!character.attributes) character.attributes = {};
  let changed = false;
  ATTRIBUTE_ORDER.forEach((key) => {
    if (character.attributes[key] !== "d4") {
      character.attributes[key] = "d4";
      changed = true;
    }
  });
  if (!changed) return;
  commitSetupTraitChange();
}

function resetSetupSkills() {
  if (!ensureSetupTraitsEditable()) return;
  if (!Array.isArray(character.skills)) character.skills = [];
  const baselines = setupStartingSkillBaselineEntries();
  const hasMissingOrChangedBaseline = baselines.some((baseline) => {
    const existing = character.skills.find(
      (skill) => skillReferenceName(skill.name) === baseline.name,
    );
    return (
      !existing ||
      (existing.die || existing.value || "") !== baseline.die ||
      !existing.core
    );
  });
  const hasResettableSkills =
    setupSkillPointStats().spent > 0 ||
    hasMissingOrChangedBaseline ||
    character.skills.some((skill) => !setupSkillIsCoreName(skill.name));
  if (!hasResettableSkills) return;

  character.skills = baselines.map((baseline) => {
    const existing = character.skills.find(
      (skill) => skillReferenceName(skill.name) === baseline.name,
    );
    return {
      ...(existing || {}),
      ...baseline,
      linkedAttribute: setupSkillAttributeKey(baseline.linkedAttribute),
      core: true,
    };
  });
  commitSetupTraitChange();
}

function changeSetupSkill(name, direction) {
  if (!ensureSetupTraitsEditable()) return;
  if (!Array.isArray(character.skills)) character.skills = [];
  const existing = setupFindSkill(name);

  if (!existing && direction > 0) {
    const cost = setupSkillIncreaseCost(name, null);
    if (setupSkillPointStats().remaining < cost) {
      appToast("No setup Skill points remain.", "danger");
      return;
    }
    const definition = setupSkillDefinition(name);
    character.skills.push({
      name,
      die: "d4",
      linkedAttribute: definition.linkedAttribute,
      notes: "",
      core: definition.core,
    });
    commitSetupTraitChange();
    return;
  }
  if (!existing) return;

  const currentIndex = getDieStepIndex(existing.die || existing.value);
  const baselineDie = setupStartingSkillBaselineDie(existing.name);
  const baselineIndex = baselineDie ? getDieStepIndex(baselineDie) : -1;
  if (
    direction > 0 &&
    currentIndex >= 0 &&
    currentIndex < DIE_STEPS.length - 1
  ) {
    const cost = setupSkillIncreaseCost(name, existing);
    if (setupSkillPointStats().remaining < cost) {
      appToast("No setup Skill points remain.", "danger");
      return;
    }
    existing.die = setupTraitDieFromIndex(currentIndex + 1);
  } else if (direction < 0 && currentIndex > baselineIndex) {
    const nextIndex = currentIndex - 1;
    if (nextIndex < 0 && !setupSkillIsCoreName(existing.name)) {
      character.skills = character.skills.filter((skill) => skill !== existing);
    } else {
      existing.die = setupTraitDieFromIndex(nextIndex);
    }
  } else if (
    direction < 0 &&
    currentIndex <= baselineIndex &&
    !existing.core &&
    !setupSkillIsCoreName(existing.name)
  ) {
    character.skills = character.skills.filter((skill) => skill !== existing);
  } else {
    return;
  }
  commitSetupTraitChange();
}

function setupStartingGearSourceDetail(catalogItem, quantity, purchaseType) {
  return {
    kind: "starting-funds",
    purchaseType,
    catalogId: catalogItem?.id || "",
    costCents: Math.max(0, Number(catalogItem?.costCents) || 0),
    quantity: Math.max(1, Number(quantity) || 1),
  };
}

function applySetupStartingGearSource(
  record,
  catalogItem,
  quantity,
  purchaseType,
) {
  return applySetupSourceFields(
    record,
    "setup-starting-gear",
    setupStartingGearSourceDetail(catalogItem, quantity, purchaseType),
  );
}

function setupPurchaseQuantity(inputId) {
  return Math.max(1, Math.floor(Number($(inputId)?.value) || 1));
}

function setupPurchaseCost(catalogItem, quantity) {
  return Math.max(0, Number(catalogItem?.costCents) || 0) * quantity;
}

function ensureSetupCanAffordPurchase(catalogItem, quantity) {
  const cost = setupPurchaseCost(catalogItem, quantity);
  if (cost <= Math.max(0, Number(character.moneyCents) || 0)) return true;
  appToast(
    `Not enough starting funds. ${catalogItem.name} costs ${money(cost)}.`,
    "danger",
  );
  return false;
}

function spendSetupStartingFunds(catalogItem, quantity) {
  character.moneyCents = Math.max(
    0,
    Math.round(
      (Number(character.moneyCents) || 0) -
        setupPurchaseCost(catalogItem, quantity),
    ),
  );
}

function setupStartingGearNote(catalogItem, fallback = "") {
  return catalogItem?.notes || fallback || "";
}

function addSetupGearPurchase() {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    GEAR_CATALOG,
    $("#setupGearPurchaseSelect")?.value || "",
  );
  const quantity = setupPurchaseQuantity("#setupGearPurchaseQty");
  if (!catalogItem) {
    appToast("Choose gear before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const id = catalogItem.id;
  const existing = (character.inventory || []).find(
    (item) =>
      item.id === id && setupGearCreationSource(item) === "setup-starting-gear",
  );
  if (existing) {
    existing.count += quantity;
    normalizeSetupSourceFields(
      existing,
      "setup-starting-gear",
      setupStartingGearSourceDetail(catalogItem, existing.count, "gear"),
    );
  } else {
    const item = normalizeInventoryItem(
      applySetupStartingGearSource(
        {
          id,
          name: catalogItem.name,
          count: quantity,
          note: setupStartingGearNote(catalogItem),
          weight: catalogItem.weight,
          costCents: catalogItem.costCents,
          book: catalogItem.book,
          category: catalogItem.category,
          notes: catalogItem.notes,
        },
        catalogItem,
        quantity,
        "gear",
      ),
      character.inventory.length,
      new Set(flattenInventory().map(({ item }) => item.id)),
    );
    character.inventory.push(item);
  }
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupAmmoPurchase() {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    GEAR_CATALOG,
    $("#setupAmmoPurchaseSelect")?.value || "",
  );
  const quantity = setupPurchaseQuantity("#setupAmmoPurchaseQty");
  if (!catalogItem || !isAmmo(catalogItem)) {
    appToast("Choose ammunition before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const selectedCaliber = $("#setupAmmoPurchaseCaliber")?.value || "";
  const key = exactAmmoTypeForCatalogAmmo(catalogItem, selectedCaliber);
  const fallback = applySetupStartingGearSource(
    {
      label:
        AMMO_KIND_BY_CATALOG_ID[catalogItem.id] && selectedCaliber
          ? ammoLabel(AMMO_KIND_BY_CATALOG_ID[catalogItem.id], selectedCaliber)
          : catalogItem.name,
      count: 0,
      caliber: normalizeCaliber(selectedCaliber) || undefined,
      kind: AMMO_KIND_BY_CATALOG_ID[catalogItem.id],
      note: setupStartingGearNote(catalogItem),
      weight: catalogItem.weight,
      costCents: catalogItem.costCents,
      itemLocation: "carried",
    },
    catalogItem,
    quantity,
    "ammo",
  );
  ensureAmmoReserve(key, fallback);
  Object.assign(character.ammo[key], fallback, {
    count: Math.max(0, Number(character.ammo[key].count) || 0) + quantity,
  });
  normalizeSetupSourceFields(
    character.ammo[key],
    "setup-starting-gear",
    setupStartingGearSourceDetail(
      catalogItem,
      character.ammo[key].count,
      "ammo",
    ),
  );
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupArmorPurchase() {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    ARMOR_CATALOG,
    $("#setupArmorPurchaseSelect")?.value || "",
  );
  const quantity = setupPurchaseQuantity("#setupArmorPurchaseQty");
  if (!catalogItem) {
    appToast("Choose armor before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const existing = (character.armorInventory || []).find(
    (item) =>
      item.id === catalogItem.id &&
      setupGearCreationSource(item) === "setup-starting-gear",
  );
  if (existing) {
    existing.count += quantity;
    normalizeSetupSourceFields(
      existing,
      "setup-starting-gear",
      setupStartingGearSourceDetail(catalogItem, existing.count, "armor"),
    );
  } else
    character.armorInventory.push(
      applySetupStartingGearSource(
        {
          id: catalogItem.id,
          name: catalogItem.name,
          count: quantity,
          armor: catalogItem.armor,
          location: catalogItem.location || "torso",
          equipped: false,
          itemLocation: "carried",
          weight: catalogItem.weight,
          minStr: catalogItem.minStr,
          costCents: catalogItem.costCents,
          book: catalogItem.book || "Deadlands",
          note: setupStartingGearNote(catalogItem, "Starting armor."),
        },
        catalogItem,
        quantity,
        "armor",
      ),
    );
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupWeaponPurchase() {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    WEAPON_CATALOG,
    $("#setupWeaponPurchaseSelect")?.value || "",
  );
  const quantity = setupPurchaseQuantity("#setupWeaponPurchaseQty");
  if (!catalogItem) {
    appToast("Choose a weapon before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  for (let index = 0; index < quantity; index += 1) {
    const ammoType = exactAmmoTypeForWeapon(catalogItem);
    if (ammoType) ensureAmmoReserve(ammoType);
    character.weapons.push(
      applySetupStartingGearSource(
        {
          id: `${catalogItem.id}-${Date.now()}-${index}`,
          catalogId: catalogItem.id,
          name: catalogItem.name,
          damage: catalogItem.damage || "â€”",
          range: catalogItem.range || "â€”",
          ap: catalogItem.ap || "â€”",
          rof: catalogItem.rof || "â€”",
          shotsMax: catalogItem.shotsMax || null,
          shotsLoaded: catalogItem.shotsMax || null,
          ammoType: ammoType || null,
          notes: catalogItem.notes || "",
          weight: catalogItem.weight,
          itemLocation: "carried",
          costCents: catalogItem.costCents,
          minStr: catalogItem.minStr,
          book: catalogItem.book || "Deadlands",
        },
        catalogItem,
        1,
        "weapon",
      ),
    );
  }
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupVehiclePurchase() {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    VEHICLE_CATALOG,
    $("#setupVehiclePurchaseSelect")?.value || "",
  );
  const quantity = setupPurchaseQuantity("#setupVehiclePurchaseQty");
  if (!catalogItem) {
    appToast("Choose a vehicle before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const existing = (character.vehicles || []).find(
    (item) =>
      item.id === catalogItem.id &&
      setupGearCreationSource(item) === "setup-starting-gear",
  );
  if (existing) {
    existing.count += quantity;
    normalizeSetupSourceFields(
      existing,
      "setup-starting-gear",
      setupStartingGearSourceDetail(catalogItem, existing.count, "vehicle"),
    );
  } else
    character.vehicles.push(
      applySetupStartingGearSource(
        {
          id: catalogItem.id,
          name: catalogItem.name,
          count: quantity,
          note: catalogItem.notes || "",
          costCents: catalogItem.costCents,
          book: catalogItem.book || "Deadlands",
          category: catalogItem.category,
          size: catalogItem.size,
          handling: catalogItem.handling,
          topSpeed: catalogItem.topSpeed,
          toughness: catalogItem.toughness,
          crew: catalogItem.crew,
          notes: catalogItem.notes,
        },
        catalogItem,
        quantity,
        "vehicle",
      ),
    );
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function syncSetupHindranceSeverity() {
  const catalogSelect = $("#setupHindranceCatalogSelect");
  const severityInput = $("#setupHindranceSeverityInput");
  if (!catalogSelect || !severityInput) return;
  const catalogEntry = chosen(HINDRANCE_CATALOG, catalogSelect.value);
  severityInput.value = setupHindranceSeverityForCatalog(
    catalogEntry,
    severityInput.value,
  );
  const fixedSeverity = setupHindranceHasFixedSeverity(catalogEntry);
  severityInput.disabled = fixedSeverity;
  severityInput.classList.toggle("locked", fixedSeverity);
  severityInput.title = fixedSeverity
    ? "This Hindrance has only one allowed severity."
    : "";
}

function setupExceptionTarget(collection, recordId) {
  if (!collection || !recordId) return null;
  if (collection === "inventory")
    return findInventoryEntry(recordId)?.item || null;
  if (collection === "ammo") return character.ammo?.[recordId] || null;
  const records = character[collection];
  return Array.isArray(records)
    ? records.find((record) => record.id === recordId) || null
    : null;
}

function setupExceptionSourceDetail(
  collection,
  recordId,
  type,
  label,
  markedAt,
) {
  return {
    recordCollection: collection,
    recordId,
    recordType: type,
    displayLabel: label,
    markedAt,
  };
}

function recordSetupException(collection, recordId, type, label, markedAt) {
  if (!Array.isArray(character.setupExceptions)) character.setupExceptions = [];
  const exceptionId = generateStableEntryId(
    "setup-exception",
    `${collection}-${recordId}`,
  );
  const sourceDetail = setupSourceDetail("setup-gm-exception", {
    ...setupExceptionSourceDetail(collection, recordId, type, label, markedAt),
  });
  const existing = character.setupExceptions.find(
    (exception) =>
      exception.recordCollection === collection &&
      exception.recordId === recordId,
  );
  const entry = {
    id: existing?.id || exceptionId,
    type: "setup-exception",
    label,
    recordType: type,
    recordCollection: collection,
    recordId,
    creationSource: "setup-gm-exception",
    source: setupSourceLabel("setup-gm-exception"),
    sourceDetail,
    createdAt: existing?.createdAt || markedAt,
    updatedAt: markedAt,
    notes: existing?.notes || "",
  };

  if (existing) Object.assign(existing, entry);
  else character.setupExceptions.push(entry);
}

function markSetupRecordAsException(collection, recordId, type, label) {
  if (!ensureSetupTraitsEditable()) return;
  const target = setupExceptionTarget(collection, recordId);
  if (!target) {
    appToast("That setup record could not be found.", "danger");
    return;
  }

  const markedAt = new Date().toISOString();
  const displayLabel = label || target.name || target.label || "Setup record";
  applySetupSourceFields(
    target,
    "setup-gm-exception",
    setupExceptionSourceDetail(
      collection,
      recordId,
      type || "Setup Record",
      displayLabel,
      markedAt,
    ),
  );
  recordSetupException(
    collection,
    recordId,
    type || "Setup Record",
    displayLabel,
    markedAt,
  );

  if (character.creationBaseline) {
    character.creationBaseline = buildCreationBaselineSnapshot(character);
  }

  render();
  save();
  appToast(`${displayLabel} marked as a GM/table exception.`, "success");
}

async function saveDraftCharacterFromSetup() {
  const entry = await saveUnsavedCharacterDraft();
  if (!entry) return false;
  render();
  renderDemoExperience();
  appToast(`${entry.name} saved to Characters.`, "success");
  return true;
}

async function discardDraftCharacterFromSetup() {
  if (!isUnsavedCharacterDraft()) return false;
  if (
    !(await appConfirm(
      "This draft has not been saved to your local character library.",
      {
        title: "Discard character draft?",
        confirmText: "Discard Draft",
        danger: true,
      },
    ))
  )
    return false;

  const restoredSavedCharacter = discardUnsavedCharacterDraft();
  render();
  renderDemoExperience();
  if (!restoredSavedCharacter && !characterLibraryEntries().length)
    renderLandingPage();
  else setAppTab("character");
  appToast("Character draft discarded.", "success");
  return true;
}

async function deleteActiveCharacterSlotFromSetup() {
  const entry = activeCharacterSlot();
  if (!entry) return;
  if (
    !(await appConfirm(
      `Delete ${entry.name || "this character"} from this browser? This removes the local saved slot.`,
      {
        title: "Delete character?",
        confirmText: "Delete Character",
        danger: true,
      },
    ))
  )
    return;

  const deletedName = entry.name || "Character";
  if (removeCharacterSlot(entry.id)) {
    render();
    renderDemoExperience();
    if (!activeCharacterSlot()) renderLandingPage();
    appToast(`${deletedName} deleted.`, "success");
  }
}

async function confirmSetupReview() {
  applyConceptInputs();
  if (!(await ensureSetupCharacterHasName())) return false;
  if (!ensureSetupStartingEdgesValidForCompletion()) return false;

  character.setupStatus = "complete";
  characterSetupReviewOpen = false;
  if (setupTraitsEditable()) snapshotCreationBaseline(character);
  else normalizeSetupSourceTracking(character);

  if (isUnsavedCharacterDraft()) {
    const entry = await saveUnsavedCharacterDraft();
    if (!entry) return false;
    character = normalize(entry.character);
    character.setupStatus = "complete";
    saveCharacterSlot(character);
  } else {
    saveCharacterSlot(character);
  }

  render();
  renderDemoExperience();
  appToast("Character setup marked complete.", "success");
  return true;
}

function reopenSetupReview() {
  characterSetupReviewOpen = true;
  characterSetupStep = "review";
  saveSetupProgressState(characterSetupStep);
  render();
  $("#characterSetupPanel")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function incompleteSetupSections() {
  return [
    ["concept", "Concept"],
    ["traits", "Attributes"],
    ["skills", "Skills"],
    ["edges", "Free Edge"],
    ["hindrances", "Hindrances"],
    ["powers", "Powers"],
    ["gear", "Gear"],
  ].filter(([stepId]) => characterSetupStatus(stepId) !== "Complete");
}

async function ensureSetupCharacterHasName() {
  const existingName = draftCharacterSaveName();
  if (existingName) return true;

  const prompted = await appPrompt(
    "Name this character before finishing setup.",
    "",
    {
      title: "Finish Character Setup",
      confirmText: "Continue",
      inputLabel: "Character name",
    },
  );
  if (prompted === null) return false;

  const name = prompted.trim();
  if (!name || placeholderSetupCharacterName(name)) {
    appToast("A character name is required before finishing setup.", "danger");
    return false;
  }

  character.name = name;
  return true;
}

async function finishSetupAndStartPlaying() {
  applyConceptInputs();
  if (!(await ensureSetupCharacterHasName())) return false;
  if (!ensureSetupStartingEdgesValidForCompletion()) return false;

  const wasFinalized = Boolean(character.creation?.finalized);
  const incompleteSections = incompleteSetupSections();
  if (
    !wasFinalized &&
    incompleteSections.length &&
    !(await appConfirm(
      `Some setup sections still need attention: ${incompleteSections
        .map(([, label]) => label)
        .join(", ")}. You can keep editing later. Start playing anyway?`,
      {
        title: "Finish setup?",
        confirmText: "Start Playing",
      },
    ))
  ) {
    return false;
  }

  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
    finalized: true,
  };
  character.setupStatus = "complete";
  characterSetupReviewOpen = false;
  if (setupTraitsEditable()) snapshotCreationBaseline(character);
  else normalizeSetupSourceTracking(character);

  if (isUnsavedCharacterDraft()) {
    const entry = await saveUnsavedCharacterDraft();
    if (!entry) return false;
    character = normalize(entry.character);
  } else {
    saveCharacterSlot(character);
  }

  characterSetupStep = "review";
  render();
  setAppTab("play");
  renderDemoExperience();
  appToast(
    wasFinalized
      ? "Character loaded for play."
      : "Character setup finished and saved.",
    "success",
  );
  return true;
}
