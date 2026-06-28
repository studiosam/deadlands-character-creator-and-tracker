// Character Setup action and mutation helpers.
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

function applyConceptInputs() {
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
  render();
  save();
}

function setupHindranceSeverityForCatalog(catalogEntry, selectedSeverity = "") {
  if (catalogEntry?.severity === "Major" || catalogEntry?.severity === "Minor")
    return catalogEntry.severity;
  return selectedSeverity === "Major" ? "Major" : "Minor";
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
  upsertHindrance(character, {
    ...catalogEntry,
    id,
    catalogId: catalogEntry.id,
    severity,
    notes: notesInput?.value.trim() || "",
    source: catalogEntry.source || "Manual",
    isCustom: false,
  });
  render();
  save();
  appToast(`${catalogEntry.name} added.`, "success");
}

function removeSetupHindrance(id) {
  if (!id) return;
  removeHindrance(character, id);
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
        die: "d4",
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
      `${sourceLabel} is no longer eligible. Reselect it after reviewing Traits, Rank, prerequisites, and selected Edges.`,
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

  if (
    creationSource === "hindrance-benefit" &&
    setupHindranceBenefitEdges().length >=
      setupCreationBenefitValue("extraEdgesFromHindrances")
  ) {
    appToast("Spend Hindrance benefit points on an Edge slot first.", "danger");
    return;
  }

  const id = uniqueEntryId(
    generateStableEntryId("edge", `${creationSource}-${catalogEntry.name}`),
    new Set((character.edges || []).map((edge) => edge.id)),
  );
  upsertEdge(character, {
    ...catalogEntry,
    id,
    catalogId: catalogEntry.id,
    source: sourceLabel,
    creationSource,
    isCustom: false,
  });
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
    attributes: clone(character.attributes || {}),
    skills: clone(character.skills || []),
  };
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
  } else if (direction < 0 && currentIndex > 0) {
    existing.die = setupTraitDieFromIndex(currentIndex - 1);
  } else if (
    direction < 0 &&
    currentIndex <= 0 &&
    !existing.core &&
    !setupSkillIsCoreName(existing.name)
  ) {
    character.skills = character.skills.filter((skill) => skill !== existing);
  } else {
    return;
  }
  commitSetupTraitChange();
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
  render();
  $("#characterSetupPanel")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function incompleteSetupSections() {
  return [
    ["concept", "Concept"],
    ["ancestry", "Race / Ancestry"],
    ["hindrances", "Hindrances"],
    ["attributesSkills", "Traits"],
    ["edges", "Edges"],
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
