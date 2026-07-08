/**
 * Character Setup action and mutation helpers.
 *
 * Setup actions mutate draft character records, apply source tracking, and
 * coordinate audit remediation. Rendering stays in setup-render.js, while
 * validation and status helpers stay in setup-model.js.
 */
const CONCEPT_RANDOMIZER_DATA_URL = "docs/deadlands_weird_west_names.json";
const CONCEPT_RANDOMIZER_FIELDS = [
  "name",
  "age",
  "archetype",
  "description",
  "background",
];
let conceptRandomizerDataCache = null;
let conceptRandomizerDataPromise = null;

function randomFromList(values) {
  if (!Array.isArray(values) || !values.length) return "";
  return values[Math.floor(Math.random() * values.length)] || values[0] || "";
}

function randomIntegerInclusive(minimum, maximum) {
  const min = Math.ceil(Number(minimum));
  const max = Math.floor(Number(maximum));
  return min + Math.floor(Math.random() * (max - min + 1));
}

function cleanRandomizerList(values) {
  return Array.isArray(values)
    ? values.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

function normalizeConceptRandomizerData(data) {
  const names = {
    firstNames: cleanRandomizerList(data?.firstNames),
    lastNames: cleanRandomizerList(data?.lastNames),
    professions: cleanRandomizerList(data?.professions),
    descriptionTraits: cleanRandomizerList(data?.descriptionTraits),
    descriptionDetails: cleanRandomizerList(data?.descriptionDetails),
    backgroundOrigins: cleanRandomizerList(data?.backgroundOrigins),
    backgroundTroubles: cleanRandomizerList(data?.backgroundTroubles),
    backgroundMotives: cleanRandomizerList(data?.backgroundMotives),
  };
  if (
    !names.firstNames.length ||
    !names.lastNames.length ||
    !names.professions.length ||
    !names.descriptionTraits.length ||
    !names.descriptionDetails.length ||
    !names.backgroundOrigins.length ||
    !names.backgroundTroubles.length ||
    !names.backgroundMotives.length
  ) {
    throw new Error("Concept randomizer data is missing required tables.");
  }
  return names;
}

async function loadConceptRandomizerData() {
  if (conceptRandomizerDataCache) return conceptRandomizerDataCache;
  if (!conceptRandomizerDataPromise) {
    conceptRandomizerDataPromise = fetch(CONCEPT_RANDOMIZER_DATA_URL)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `Concept randomizer data failed to load: ${response.status}`,
          );
        return response.json();
      })
      .then((data) => {
        conceptRandomizerDataCache = normalizeConceptRandomizerData(data);
        return conceptRandomizerDataCache;
      })
      .catch((error) => {
        conceptRandomizerDataPromise = null;
        throw error;
      });
  }
  return conceptRandomizerDataPromise;
}

function randomConceptValues(data) {
  const firstName = randomFromList(data.firstNames);
  const lastName = randomFromList(data.lastNames);
  const profession = randomFromList(data.professions);
  const trait = randomFromList(data.descriptionTraits);
  const detail = randomFromList(data.descriptionDetails);
  const origin = randomFromList(data.backgroundOrigins);
  const trouble = randomFromList(data.backgroundTroubles);
  const motive = randomFromList(data.backgroundMotives);

  return {
    name: `${firstName} ${lastName}`.trim(),
    age: String(randomIntegerInclusive(18, 72)),
    archetype: profession,
    description: `${trait} ${profession.toLowerCase()} with ${detail}`,
    background: `Left ${origin} after ${trouble}; now rides for ${motive}.`,
  };
}

function shouldRandomizeConceptField(field, onlyEmpty) {
  if (!CONCEPT_RANDOMIZER_FIELDS.includes(field)) return false;
  return !onlyEmpty || !String(character[field] || "").trim();
}

async function randomizeConceptFields({ onlyEmpty = false } = {}) {
  collectConceptInputs();
  let data;
  try {
    data = await loadConceptRandomizerData();
  } catch (error) {
    console.error(error);
    appToast("Could not load the Weird West name tables.", "danger");
    return;
  }

  const values = randomConceptValues(data);
  let changedCount = 0;
  for (const field of CONCEPT_RANDOMIZER_FIELDS) {
    if (!shouldRandomizeConceptField(field, onlyEmpty)) continue;
    character[field] = values[field];
    changedCount += 1;
  }

  if (!changedCount) {
    appToast("No empty Concept fields to randomize.", "success");
    return;
  }

  renderCharacterIdentityDisplays();
  renderCharacterSetup();
  save();
  appToast(
    onlyEmpty
      ? "Empty Concept fields randomized."
      : "Concept fields randomized.",
    "success",
  );
}

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

function resetSetupHindranceBenefitSpending() {
  character.creation = {
    normalAttributePointsAvailable: 5,
    normalSkillPointsAvailable: 12,
    ...(character.creation || {}),
  };

  const moneyBenefits = setupCreationBenefitValue("extraMoneyFromHindrances");
  if (moneyBenefits)
    updateSetupMoneyForBenefitChange(
      "extraMoneyFromHindrances",
      -moneyBenefits,
    );

  SETUP_HINDRANCE_BENEFITS.forEach((benefit) => {
    character.creation[benefit.key] = 0;
  });

  character.edges = (character.edges || []).filter(
    (edge) => setupEdgeCreationSource(edge) !== "hindrance-benefit",
  );
}

async function confirmResetSetupHindranceBenefits(message, title) {
  return appConfirm(message, {
    title,
    confirmText: "Reset Benefits",
    cancelText: "Go Back",
  });
}

async function removeSetupHindrance(id) {
  if (!id) return;
  const existing = character.hindrances || [];
  const hindrance = existing.find((item) => item.id === id);
  if (!hindrance) return;

  const nextStats = (() => {
    const remaining = existing.filter((item) => item.id !== id);
    const total = remaining.reduce(
      (sum, item) => sum + hindrancePointValue(item),
      0,
    );
    return {
      count: remaining.length,
      total,
      benefitCap: 4,
      benefitPoints: Math.min(total, 4),
      overCap: total > 4,
      unknownCount: remaining.filter(
        (item) => !["Minor", "Major"].includes(item?.severity),
      ).length,
    };
  })();
  const nextSpending = setupHindranceBenefitSpending(nextStats);
  const shouldResetBenefits = nextSpending.spent > nextSpending.available;
  const removingElderly =
    plainEntryName(hindrance.name) === "elderly" && setupHasElderlyHindrance();
  const nextHindrances = existing.filter((item) => item.id !== id);
  const nextSkillStats = setupSkillPointStats(nextHindrances);
  const shouldResetSkills =
    removingElderly &&
    (nextSkillStats.spent > nextSkillStats.available ||
      nextSkillStats.genericOverBudget);
  if (
    shouldResetBenefits &&
    !(await confirmResetSetupHindranceBenefits(
      "Removing this Hindrance lowers your available Benefit Points below the benefits already spent. Reset Hindrance benefit spending now, then choose benefits again from the remaining budget.",
      "Reset Hindrance benefits?",
    ))
  )
    return;
  if (
    shouldResetSkills &&
    !(await appConfirm(
      "Removing Elderly removes its 5 Smarts-linked Skill points. Reset Skills to starting values now, then spend Skill points again from the remaining budget.",
      {
        title: "Reset Skills?",
        confirmText: "Reset Skills",
        cancelText: "Go Back",
      },
    ))
  )
    return;

  removeHindrance(character, id);
  if (shouldResetBenefits) resetSetupHindranceBenefitSpending();
  if (shouldResetSkills) resetSetupSkills();
  if (setupHasNoHindrances()) clearNoSetupHindranceAcknowledgement();
  render();
  save();
  appToast(
    shouldResetBenefits
      ? "Hindrance removed and benefit spending reset."
      : "Hindrance removed.",
    "success",
  );
}

async function resetSetupHindrances() {
  if (!ensureSetupTraitsEditable()) return;
  const stats = hindrancePointStats();
  const spending = setupHindranceBenefitSpending(stats);
  const hasAnythingToReset =
    stats.count ||
    spending.spent ||
    setupHindranceBenefitEdges().length ||
    character.creation?.noHindrancesAcknowledged;
  if (!hasAnythingToReset) return;

  const confirmed = await appConfirm(
    "This removes all selected Hindrances, clears all Hindrance benefit spending, removes Hindrance benefit Edges, and removes any extra starting money bought with Hindrance benefits. Attribute or Skill choices made with those benefits may need adjustment on their setup steps.",
    {
      title: "Reset Hindrances?",
      confirmText: "Reset Hindrances",
      cancelText: "Keep Current",
    },
  );
  if (!confirmed) return;

  character.hindrances = [];
  resetSetupHindranceBenefitSpending();
  if (character.creation) character.creation.noHindrancesAcknowledged = false;
  render();
  save();
  appToast("Hindrances and benefit spending reset.", "success");
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

function setupCanIncreaseSkill(name, cost) {
  const stats = setupSkillPointStats();
  if (stats.remaining < cost) return false;
  const definition = setupSkillDefinition(name);
  if (definition.linkedAttribute === "smarts") return true;
  return stats.genericRemaining >= cost;
}

function setupSkillIncreaseBlockedMessage(name) {
  const stats = setupSkillPointStats();
  const definition = setupSkillDefinition(name);
  if (
    definition.linkedAttribute !== "smarts" &&
    stats.genericRemaining <= 0 &&
    stats.elderlySmartsSkillPointsRemaining > 0
  ) {
    return "Only Elderly Smarts-linked Skill points remain.";
  }
  return "No setup Skill points remain.";
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

function setupStartingPowerBlockedMessage(report, catalogPower) {
  if (!report.profile) {
    return "Choose an Arcane Background before adding starting Powers.";
  }
  if (!catalogPower) return "Choose a starting Power before adding it.";
  if (!report.profile.allowedPowerIds?.includes(catalogPower.id)) {
    return `${catalogPower.name} is not allowed for ${report.profile.name}.`;
  }
  if (
    typeof rankAllowsPower === "function" &&
    !rankAllowsPower(character.rank, catalogPower.rank)
  ) {
    return `${catalogPower.name} requires ${catalogPower.rank} rank.`;
  }
  if (setupPowerAlreadyKnown(catalogPower)) {
    return "That Power is already recorded.";
  }
  if (
    !setupStartingPowerSlotOpen(
      report.profile,
      report.arcaneConfig,
      character.powers || [],
    )
  ) {
    return "All starting Power slots are already filled.";
  }
  return "";
}

function addSetupStartingPowerRecord(report, catalogPower) {
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
}

function addSetupStartingPower(powerId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const report = setupPowerAuditReport();
  const selectedId = powerId || $("#setupStartingPowerSelect")?.value || "";
  const catalogPower = setupStartingPowerById(selectedId);
  const blockedMessage = setupStartingPowerBlockedMessage(report, catalogPower);

  if (blockedMessage) {
    appToast(blockedMessage, "danger");
    return;
  }

  addSetupStartingPowerRecord(report, catalogPower);
  render();
  save();
  appToast(`${catalogPower.name} added as a starting Power.`, "success");
}

function ensureSetupRequiredStartingPowersGranted() {
  if (!setupTraitsEditable()) return false;
  let report = setupPowerAuditReport();
  if (!report.profile?.requiredStartingPowers?.length) return false;

  let changed = false;
  for (const powerId of report.profile.requiredStartingPowers) {
    report = setupPowerAuditReport();
    const catalogPower = setupStartingPowerById(powerId);
    if (!catalogPower || setupPowerAlreadyKnown(catalogPower)) continue;
    if (setupStartingPowerBlockedMessage(report, catalogPower)) continue;
    addSetupStartingPowerRecord(report, catalogPower);
    changed = true;
  }

  if (changed) save();
  return changed;
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
  const report = setupPowerAuditReport();
  const catalog = setupKnownPowerCatalogEntry(power);
  if (catalog && report.profile?.requiredStartingPowers?.includes(catalog.id)) {
    appToast("Required starting Powers are granted automatically.", "danger");
    render();
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

function setupStartingPowerPointResource(report) {
  const config = setupPowerPointConfig(report);
  if (!config || !report?.expectedPowerPoints) return null;
  return applySetupSourceFields(
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
}

function upsertSetupStartingPowerPointResource(report) {
  const resource = setupStartingPowerPointResource(report);
  if (!resource) return false;
  const existingIndex = (character.resources || []).findIndex(
    (item) => item.id === "power-points",
  );

  if (!Array.isArray(character.resources)) character.resources = [];
  if (existingIndex >= 0) character.resources[existingIndex] = resource;
  else character.resources.push(resource);
  return true;
}

function ensureSetupStartingPowerPointsGranted() {
  if (!setupTraitsEditable()) return false;
  const report = setupPowerAuditReport();
  if (!report.profile || !report.expectedPowerPoints) return false;
  if (report.powerPointsAudit?.powerPoints) return false;
  if (!upsertSetupStartingPowerPointResource(report)) return false;
  save();
  return true;
}

function setSetupStartingPowerPoints() {
  if (!ensureSetupTraitsEditable()) return;
  const report = setupPowerAuditReport();
  if (!setupPowerPointConfig(report) || !report.expectedPowerPoints) {
    appToast(
      "Choose an Arcane Background before setting Power Points.",
      "danger",
    );
    return;
  }

  upsertSetupStartingPowerPointResource(report);

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
    if (!setupCanIncreaseSkill(name, cost)) {
      appToast(setupSkillIncreaseBlockedMessage(name), "danger");
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
    if (!setupCanIncreaseSkill(name, cost)) {
      appToast(setupSkillIncreaseBlockedMessage(name), "danger");
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

function setupStartingPurchaseRecordId(catalogItem, purchaseType) {
  return `${catalogItem?.id || purchaseType || "item"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

function refundSetupStartingFunds(item, quantity = 1) {
  const unitCost = Math.max(
    0,
    Number(item?.sourceDetail?.costCents ?? item?.costCents) || 0,
  );
  character.moneyCents = Math.max(
    0,
    Math.round((Number(character.moneyCents) || 0) + unitCost * quantity),
  );
}

function setupStartingGearNote(catalogItem, fallback = "") {
  return catalogItem?.notes || fallback || "";
}

function setupSellBackQuantity(item, fallback = 1) {
  return Math.max(
    1,
    Math.floor(Number(item?.count ?? item?.quantity ?? fallback) || fallback),
  );
}

function setupSellBackLabel(item, fallback = "Starting gear") {
  return item?.name || item?.label || fallback;
}

function decrementSetupSellBackStack(item) {
  const current = setupSellBackQuantity(item);
  if (current <= 1) return false;
  const nextCount = current - 1;
  item.count = nextCount;
  if (item.quantity !== undefined) item.quantity = nextCount;
  if (item.sourceDetail && typeof item.sourceDetail === "object") {
    item.sourceDetail.quantity = nextCount;
  }
  return true;
}

function sellBackSetupGearPurchase(type, id) {
  if (!ensureSetupTraitsEditable()) return;
  if (!type || !id) return;

  let item = null;
  let quantity = 1;
  let removed = false;

  if (type === "gear") {
    const entry = findInventoryEntry(id);
    item = entry?.item || null;
    if (
      item?.isContainer &&
      ((item.contents || []).length || physicalItemsInContainer(item.id).length)
    ) {
      appToast("Empty the container before selling it back.", "danger");
      return;
    }
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      removed = Boolean(removeInventoryItem(id));
    }
  } else if (type === "ammo") {
    item = character.ammo?.[id] || null;
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      if (!decrementSetupSellBackStack(item)) delete character.ammo[id];
      removed = true;
    }
  } else if (type === "weapon") {
    item = (character.weapons || []).find((entry) => entry.id === id) || null;
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      character.weapons = character.weapons.filter((entry) => entry.id !== id);
      removed = true;
    }
  } else if (type === "armor") {
    item =
      (character.armorInventory || []).find((entry) => entry.id === id) || null;
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      character.armorInventory = character.armorInventory.filter(
        (entry) => entry.id !== id,
      );
      removed = true;
    }
  } else if (type === "consumable") {
    item =
      (character.consumables || []).find((entry) => entry.id === id) || null;
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      character.consumables = character.consumables.filter(
        (entry) => entry.id !== id,
      );
      removed = true;
    }
  } else if (type === "vehicle") {
    item = (character.vehicles || []).find((entry) => entry.id === id) || null;
    if (item && setupGearCreationSource(item) === "setup-starting-gear") {
      character.vehicles = character.vehicles.filter(
        (entry) => entry.id !== id,
      );
      removed = true;
    }
  }

  if (!removed || !item) {
    appToast("Only setup starting purchases can be sold back here.", "danger");
    return;
  }

  refundSetupStartingFunds(item, quantity);
  render();
  save();
  appToast(`${setupSellBackLabel(item)} sold back.`, "success");
}

function moveSetupGearToBackpack(type, id, backpackId = "") {
  if (!ensureSetupTraitsEditable()) return;
  if (!type || !id || !backpackId) return;
  const backpack = findInventoryEntry(backpackId)?.item || null;
  if (!backpack?.isContainer) {
    appToast("Buy a backpack before putting items inside it.", "danger");
    return;
  }
  if (type === "gear") {
    if (id === backpackId) return;
    moveInventoryItem(id, "container", backpackId);
  } else if (["weapon", "armor", "ammo", "consumable"].includes(type)) {
    movePhysicalItem(type, id, "container", backpackId);
  } else {
    return;
  }
  render();
  save();
  appToast("Moved into backpack.", "success");
}

function moveSetupGearToBody(type, id) {
  if (!ensureSetupTraitsEditable()) return;
  if (!type || !id) return;
  if (type === "gear") {
    moveInventoryItem(id, "carried");
  } else if (["weapon", "armor", "ammo", "consumable"].includes(type)) {
    movePhysicalItem(type, id, "carried");
  } else {
    return;
  }
  render();
  save();
  appToast("Moved to carried gear.", "success");
}

function resetSetupInventoryGear(items, removedContainerIds) {
  return (items || []).flatMap((item) => {
    const keptContents = resetSetupInventoryGear(
      item.contents || [],
      removedContainerIds,
    );
    if (setupGearCreationSource(item) === "setup-starting-gear") {
      if (item.id) removedContainerIds.add(item.id);
      return keptContents.map((content) => ({
        ...content,
        location: "carried",
        storageId: "",
      }));
    }
    item.contents = keptContents;
    return [item];
  });
}

function setupGearRecordIsResettable(item) {
  return setupGearCreationSource(item) === "setup-starting-gear";
}

function movePhysicalItemsOutOfResetContainers(removedContainerIds) {
  if (!removedContainerIds.size) return;
  [
    ...(character.weapons || []),
    ...(character.armorInventory || []),
    ...(character.consumables || []),
    ...Object.values(character.ammo || {}),
  ].forEach((item) => {
    if (
      item?.itemLocation === "container" &&
      removedContainerIds.has(item.containerId)
    ) {
      setPhysicalItemLocation(item, "carried");
    }
  });
}

async function resetSetupGear() {
  if (!ensureSetupTraitsEditable()) return;
  const setupPurchaseEntries = setupGearStartingPurchaseEntries();
  if (!setupPurchaseEntries.length) return;

  const confirmed = await appConfirm(
    "This removes all setup starting gear purchases and refunds their starting funds. Imported gear, GM/table exceptions, and later inventory changes are not removed.",
    {
      title: "Reset setup gear?",
      confirmText: "Reset Gear",
      cancelText: "Keep Gear",
      danger: true,
    },
  );
  if (!confirmed) return;

  const refundCents = setupGearStartingPurchaseSpent();
  const setupWeaponAmmoKeys = new Set(
    (character.weapons || [])
      .filter(setupGearRecordIsResettable)
      .map((weapon) => exactAmmoTypeForWeapon(weapon))
      .filter(Boolean),
  );
  const removedContainerIds = new Set();

  character.inventory = resetSetupInventoryGear(
    character.inventory || [],
    removedContainerIds,
  );
  character.weapons = (character.weapons || []).filter(
    (weapon) => !setupGearRecordIsResettable(weapon),
  );
  character.armorInventory = (character.armorInventory || []).filter(
    (armor) => !setupGearRecordIsResettable(armor),
  );
  character.consumables = (character.consumables || []).filter(
    (item) => !setupGearRecordIsResettable(item),
  );
  Object.entries(character.ammo || {}).forEach(([key, ammo]) => {
    const emptySetupWeaponReserve =
      setupWeaponAmmoKeys.has(key) &&
      !setupGearCreationSource(ammo) &&
      Math.max(0, Number(ammo?.count) || 0) === 0;
    if (setupGearRecordIsResettable(ammo) || emptySetupWeaponReserve)
      delete character.ammo[key];
  });
  character.vehicles = (character.vehicles || []).filter(
    (vehicle) => !setupGearRecordIsResettable(vehicle),
  );
  movePhysicalItemsOutOfResetContainers(removedContainerIds);
  character.moneyCents = Math.max(
    0,
    (Number(character.moneyCents) || 0) + refundCents,
  );

  render();
  save();
  appToast("Setup gear purchases reset.", "success");
}

function addSetupGearPurchase(gearId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(GEAR_CATALOG, gearId || "");
  const quantity = 1;
  if (!catalogItem) {
    appToast("Choose gear before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const item = normalizeInventoryItem(
    applySetupStartingGearSource(
      {
        id: setupStartingPurchaseRecordId(catalogItem, "gear"),
        catalogId: catalogItem.id,
        name: catalogItem.name,
        count: 1,
        note: setupStartingGearNote(catalogItem),
        weight: catalogItem.weight,
        costCents: catalogItem.costCents,
        book: catalogItem.book,
        category: catalogItem.category,
        notes: catalogItem.notes,
      },
      catalogItem,
      1,
      "gear",
    ),
    character.inventory.length,
    new Set(flattenInventory().map(({ item }) => item.id)),
  );
  character.inventory.push(item);
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function setupAmmoQuantityInputForWeapon(weaponId) {
  return [...document.querySelectorAll("[data-setup-ammo-weapon-id]")].find(
    (element) => element.dataset.setupAmmoWeaponId === weaponId,
  );
}

function setupAmmoTotalForWeapon(weaponId) {
  return [...document.querySelectorAll("[data-setup-ammo-total-for]")].find(
    (element) => element.dataset.setupAmmoTotalFor === weaponId,
  );
}

function setupAmmoQuantityForWeapon(weaponId) {
  const input = setupAmmoQuantityInputForWeapon(weaponId);
  return Math.max(1, Math.floor(Number(input?.value) || 1));
}

function updateSetupAmmoQuantityTotal(weaponId = "") {
  const input = setupAmmoQuantityInputForWeapon(weaponId);
  if (!input) return;
  const quantity = setupAmmoQuantityForWeapon(weaponId);
  input.value = String(quantity);
  const total = setupAmmoTotalForWeapon(weaponId);
  if (!total) return;
  const unitCost = Math.max(0, Number(input.dataset.setupAmmoUnitCost) || 0);
  total.textContent = money(unitCost * quantity);
}

function adjustSetupAmmoQuantity(weaponId = "", direction = 0) {
  const input = setupAmmoQuantityInputForWeapon(weaponId);
  if (!input) return;
  input.value = String(
    Math.max(1, setupAmmoQuantityForWeapon(weaponId) + Number(direction || 0)),
  );
  updateSetupAmmoQuantityTotal(weaponId);
}

function addSetupAmmoForWeapon(weaponId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const weapon =
    (character.weapons || []).find((entry) => entry.id === weaponId) || null;
  if (!weapon) {
    appToast("Choose a purchased weapon before buying ammo.", "danger");
    return;
  }

  const key = exactAmmoTypeForWeapon(weapon);
  const catalogWeapon = catalogWeaponForRecord(weapon);
  const catalogItem = key ? catalogAmmoForKey(key, weapon) : null;
  const quantity = setupAmmoQuantityForWeapon(weaponId);
  if (!key || !catalogItem || !isAmmo(catalogItem)) {
    appToast("No catalog ammunition is matched to that weapon.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;

  const keyed = String(key).match(/^(pistol|rifle)-(\d{2})-ammo$/);
  const caliber = keyed?.[2]
    ? `.${keyed[2]}`
    : normalizeCaliber(weapon.caliber) || "";
  const fallback = applySetupStartingGearSource(
    {
      label:
        requiredAmmoLabelForWeapon(weapon, catalogWeapon) || catalogItem.name,
      count: 0,
      caliber: caliber || undefined,
      kind: keyed?.[1] || AMMO_KIND_BY_CATALOG_ID[catalogItem.id],
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
  appToast(`${fallback.label} purchased.`, "success");
}

function addSetupArmorPurchase(armorId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(ARMOR_CATALOG, armorId || "");
  const quantity = 1;
  if (!catalogItem) {
    appToast("Choose armor before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  character.armorInventory.push(
    applySetupStartingGearSource(
      {
        id: setupStartingPurchaseRecordId(catalogItem, "armor"),
        catalogId: catalogItem.id,
        name: catalogItem.name,
        count: 1,
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
      1,
      "armor",
    ),
  );
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupWeaponPurchase(weaponId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(
    WEAPON_CATALOG,
    weaponId || $("#setupWeaponPurchaseSelect")?.value || "",
  );
  const quantity = 1;
  if (!catalogItem) {
    appToast("Choose a weapon before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  const ammoType = exactAmmoTypeForWeapon(catalogItem);
  if (ammoType) ensureAmmoReserve(ammoType);
  character.weapons.push(
    applySetupStartingGearSource(
      {
        id: setupStartingPurchaseRecordId(catalogItem, "weapon"),
        catalogId: catalogItem.id,
        name: catalogItem.name,
        damage: catalogItem.damage || "—",
        range: catalogItem.range || "—",
        ap: catalogItem.ap || "—",
        rof: catalogItem.rof || "—",
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
  spendSetupStartingFunds(catalogItem, quantity);
  render();
  save();
  appToast(`${catalogItem.name} purchased.`, "success");
}

function addSetupVehiclePurchase(vehicleId = "") {
  if (!ensureSetupTraitsEditable()) return;
  const catalogItem = chosen(VEHICLE_CATALOG, vehicleId || "");
  const quantity = 1;
  if (!catalogItem) {
    appToast("Choose a vehicle before purchasing it.", "danger");
    return;
  }
  if (!ensureSetupCanAffordPurchase(catalogItem, quantity)) return;
  character.vehicles.push(
    applySetupStartingGearSource(
      {
        id: setupStartingPurchaseRecordId(catalogItem, "vehicle"),
        catalogId: catalogItem.id,
        name: catalogItem.name,
        count: 1,
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
      1,
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
  if (!ensureSetupReviewCanFinalize()) return false;
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

function ensureSetupReviewCanFinalize() {
  const report = setupReviewValidationReport();
  if (!report.blockers.length) return true;
  characterSetupStep = validSetupStepId(report.blockers[0]?.step, "gear");
  saveSetupProgressState(characterSetupStep);
  render();
  appToast("Resolve blocking setup issues before finalizing.", "danger");
  return false;
}

function reopenSetupReview() {
  characterSetupReviewOpen = true;
  characterSetupStep = validSetupStepId(characterSetupStep, "concept");
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
    ["edges", "Edges"],
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
  if (!ensureSetupReviewCanFinalize()) return false;
  if (!(await ensureSetupCharacterHasName())) return false;
  if (!ensureSetupStartingEdgesValidForCompletion()) return false;

  const wasFinalized = Boolean(character.creation?.finalized);

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

  characterSetupStep = "gear";
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
