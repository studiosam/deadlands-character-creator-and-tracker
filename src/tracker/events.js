/**
 * DOM event wiring for the tracker shell.
 *
 * Keep raw event listeners and element onclick assignments here. Feature logic
 * should live in action/helper modules so this file remains the composition
 * layer instead of becoming the application model.
 */
function updateHucksterDealField(field, value) {
  if (!character.hucksterDeal) character.hucksterDeal = makeHucksterDeal();
  character.hucksterDeal[field] = value;
  character.hucksterDeal = normalizeHucksterDeal(character.hucksterDeal);
  save();
}

function updateActionCardField(field, value) {
  character.actionCards = normalizeActionCardState(character.actionCards);
  character.actionCards[field] = String(value || "").trim();
  render();
  save();
}

function action(type) {
  switch (type) {
    case "incWounds":
      character.damage.wounds = clamp(
        character.damage.wounds + 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "decWounds":
      character.damage.wounds = clamp(
        character.damage.wounds - 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "incFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue + 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "decFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue - 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "incBennies":
      character.bennies.current += 1;
      break;
    case "decBennies":
      character.bennies.current = Math.max(0, character.bennies.current - 1);
      break;
    case "incConviction":
      character.conviction += 1;
      break;
    case "decConviction":
      character.conviction = Math.max(0, character.conviction - 1);
      break;
    default:
      return;
  }
  render();
  save();
}

function closeHeaderMenu() {
  els.headerToolsMenu.open = false;
}

window.addEventListener("resize", updateLandingImportPanelBounds);
window.visualViewport?.addEventListener(
  "resize",
  updateLandingImportPanelBounds,
);

window.addEventListener("beforeunload", (event) => {
  if (!isUnsavedCharacterDraft()) return;
  if (hasSavedSetupDraftState()) return;
  event.preventDefault();
  event.returnValue = "";
});

document.addEventListener("click", async (event) => {
  if (event.target?.dataset?.action) action(event.target.dataset.action);
  const catalogTypeButton = event.target?.closest?.("[data-catalog-type]");
  if (catalogTypeButton) {
    catalogSetType(catalogTypeButton.dataset.catalogType || "edges");
  }
  const catalogResult = event.target?.closest?.("[data-catalog-result-id]");
  if (catalogResult) {
    catalogSelectResult(catalogResult.dataset.catalogResultId || "");
  }
  const setupWeaponSort = event.target?.closest?.("[data-setup-weapon-sort]");
  if (setupWeaponSort) {
    sortSetupWeaponPicker(setupWeaponSort.dataset.setupWeaponSort || "");
  }
  const setupGearSort = event.target?.closest?.("[data-setup-gear-sort]");
  if (setupGearSort) {
    sortSetupGearPicker(setupGearSort.dataset.setupGearSort || "");
  }
  const setupArmorSort = event.target?.closest?.("[data-setup-armor-sort]");
  if (setupArmorSort) {
    sortSetupArmorPicker(setupArmorSort.dataset.setupArmorSort || "");
  }
  const setupVehicleSort = event.target?.closest?.("[data-setup-vehicle-sort]");
  if (setupVehicleSort) {
    sortSetupVehiclePicker(setupVehicleSort.dataset.setupVehicleSort || "");
  }
  const setupStep = event.target?.closest?.("[data-setup-step]");
  if (setupStep) {
    collectConceptInputs();
    characterSetupStep = setupStep.dataset.setupStep;
    if (characterSetupStep === "hindrances")
      clearNoSetupHindranceAcknowledgement();
    renderCharacterSetup();
    save();
  }
  const setupAction = event.target?.closest?.("[data-setup-action]");
  if (setupAction?.dataset.setupAction === "nextSetupStep") {
    await nextSetupStep();
  } else if (setupAction?.dataset.setupAction === "previousSetupStep") {
    previousSetupStep();
  } else if (setupAction?.dataset.setupAction === "saveDraftCharacter") {
    await saveDraftCharacterFromSetup();
  } else if (setupAction?.dataset.setupAction === "discardDraftCharacter") {
    await discardDraftCharacterFromSetup();
  } else if (setupAction?.dataset.setupAction === "saveCharacterNow") {
    await saveCurrentCharacterToLibrary();
  } else if (setupAction?.dataset.setupAction === "confirmSetup") {
    await confirmSetupReview();
  } else if (setupAction?.dataset.setupAction === "finishSetup") {
    await finishSetupAndStartPlaying();
  } else if (setupAction?.dataset.setupAction === "deleteCharacterSlot") {
    await deleteActiveCharacterSlotFromSetup();
  } else if (setupAction?.dataset.setupAction === "addHindrance") {
    addSetupHindrance();
  } else if (setupAction?.dataset.setupAction === "removeHindrance") {
    await removeSetupHindrance(setupAction.dataset.hindranceId || "");
  } else if (setupAction?.dataset.setupAction === "resetSetupHindrances") {
    await resetSetupHindrances();
  } else if (setupAction?.dataset.setupAction === "incHindranceBenefit") {
    changeSetupHindranceBenefit(setupAction.dataset.benefitKey || "", 1);
  } else if (setupAction?.dataset.setupAction === "decHindranceBenefit") {
    changeSetupHindranceBenefit(setupAction.dataset.benefitKey || "", -1);
  } else if (setupAction?.dataset.setupAction === "addHumanFreeEdge") {
    addSetupEdgeFromCatalog(
      "#setupHumanFreeEdgeSelect",
      "human-free-edge",
      "Human free Edge",
    );
  } else if (setupAction?.dataset.setupAction === "addHindranceBenefitEdge") {
    addSetupEdgeFromCatalog(
      "#setupHindranceBenefitEdgeSelect",
      "hindrance-benefit",
      "Hindrance benefit Edge",
    );
  } else if (setupAction?.dataset.setupAction === "removeSetupEdge") {
    removeSetupEdge(setupAction.dataset.edgeId || "");
  } else if (setupAction?.dataset.setupAction === "addSetupStartingPower") {
    addSetupStartingPower(setupAction.dataset.powerId || "");
  } else if (setupAction?.dataset.setupAction === "removeSetupStartingPower") {
    removeSetupStartingPower(setupAction.dataset.powerId || "");
  } else if (
    setupAction?.dataset.setupAction === "setSetupStartingPowerPoints"
  ) {
    setSetupStartingPowerPoints();
  } else if (setupAction?.dataset.setupAction === "addSetupGearPurchase") {
    addSetupGearPurchase(setupAction.dataset.setupGearId || "");
  } else if (setupAction?.dataset.setupAction === "adjustSetupAmmoQuantity") {
    adjustSetupAmmoQuantity(
      setupAction.dataset.setupWeaponId || "",
      Number(setupAction.dataset.direction) || 0,
    );
  } else if (setupAction?.dataset.setupAction === "addSetupAmmoForWeapon") {
    addSetupAmmoForWeapon(setupAction.dataset.setupWeaponId || "");
  } else if (setupAction?.dataset.setupAction === "addSetupArmorPurchase") {
    addSetupArmorPurchase(setupAction.dataset.setupArmorId || "");
  } else if (setupAction?.dataset.setupAction === "addSetupWeaponPurchase") {
    addSetupWeaponPurchase(setupAction.dataset.setupWeaponId || "");
  } else if (setupAction?.dataset.setupAction === "addSetupVehiclePurchase") {
    addSetupVehiclePurchase(setupAction.dataset.setupVehicleId || "");
  } else if (setupAction?.dataset.setupAction === "sellBackSetupGear") {
    sellBackSetupGearPurchase(
      setupAction.dataset.setupGearType || "",
      setupAction.dataset.setupGearId || "",
    );
  } else if (setupAction?.dataset.setupAction === "moveSetupGearToBackpack") {
    moveSetupGearToBackpack(
      setupAction.dataset.setupGearType || "",
      setupAction.dataset.setupGearId || "",
      setupAction.dataset.setupBackpackId || "",
    );
  } else if (setupAction?.dataset.setupAction === "moveSetupGearToBody") {
    moveSetupGearToBody(
      setupAction.dataset.setupGearType || "",
      setupAction.dataset.setupGearId || "",
    );
  } else if (setupAction?.dataset.setupAction === "resetSetupGear") {
    await resetSetupGear();
  } else if (setupAction?.dataset.setupAction === "markSetupException") {
    markSetupRecordAsException(
      setupAction.dataset.setupCollection || "",
      setupAction.dataset.setupRecordId || "",
      setupAction.dataset.setupRecordType || "",
      setupAction.dataset.setupRecordLabel || "",
    );
  } else if (setupAction?.dataset.setupAction === "incAttribute") {
    changeSetupAttribute(setupAction.dataset.traitName || "", 1);
  } else if (setupAction?.dataset.setupAction === "decAttribute") {
    changeSetupAttribute(setupAction.dataset.traitName || "", -1);
  } else if (setupAction?.dataset.setupAction === "resetAttributes") {
    resetSetupAttributes();
  } else if (setupAction?.dataset.setupAction === "incSkill") {
    changeSetupSkill(setupAction.dataset.traitName || "", 1);
  } else if (setupAction?.dataset.setupAction === "decSkill") {
    changeSetupSkill(setupAction.dataset.traitName || "", -1);
  } else if (setupAction?.dataset.setupAction === "resetSkills") {
    resetSetupSkills();
  }
  const entryAction = event.target?.closest?.("[data-entry-action]");
  if (entryAction) handleEntryAction(entryAction);
  const libraryAction = event.target?.closest?.("[data-library-action]");
  if (libraryAction) handleLibraryAction(libraryAction);
  if (event.target?.closest?.("#saveCharacterProfileBtn"))
    await saveCharacterProfile();
  if (event.target?.dataset?.toggleForm) {
    const form = document.getElementById(event.target.dataset.toggleForm);
    form?.classList.toggle("hidden");
  }
  if (event.target?.closest?.(".header-actions button")) closeHeaderMenu();
  if (!event.target?.closest?.(".header-tools")) closeHeaderMenu();
});

document.addEventListener(
  "toggle",
  (event) => {
    const picker = event.target?.matches?.(".setup-catalog-picker")
      ? event.target
      : null;
    if (!picker?.open) return;
    const setupGearPanel = picker.closest("#setupGearPanel");
    if (!setupGearPanel) return;
    setupGearPanel
      .querySelectorAll(".setup-catalog-picker[open]")
      .forEach((otherPicker) => {
        if (otherPicker !== picker) otherPicker.open = false;
      });
  },
  true,
);

document.addEventListener("input", (event) => {
  const conceptInput = event.target?.closest?.("[data-concept-field]");
  if (conceptInput) applyConceptField(conceptInput);
  if (event.target?.closest?.("#catalogSearchInput")) renderCatalogBrowser();
  if (event.target?.closest?.("#setupWeaponSearchInput"))
    filterSetupWeaponPicker();
  if (event.target?.closest?.("#setupGearSearchInput")) filterSetupGearPicker();
  if (event.target?.closest?.("#setupArmorSearchInput"))
    filterSetupArmorPicker();
  if (event.target?.closest?.("#setupVehicleSearchInput"))
    filterSetupVehiclePicker();
  const setupAmmoQuantity = event.target?.closest?.(
    "[data-setup-ammo-weapon-id]",
  );
  if (setupAmmoQuantity)
    updateSetupAmmoQuantityTotal(
      setupAmmoQuantity.dataset.setupAmmoWeaponId || "",
    );
});

document.addEventListener("change", (event) => {
  const conceptInput = event.target?.closest?.("[data-concept-field]");
  if (conceptInput) applyConceptField(conceptInput);
  if (event.target?.closest?.("[data-catalog-filter]")) renderCatalogBrowser();
  if (event.target?.closest?.("#setupWeaponCategoryFilter"))
    filterSetupWeaponPicker();
  if (event.target?.closest?.("#setupGearCategoryFilter"))
    filterSetupGearPicker();
  if (event.target?.closest?.("#setupArmorLocationFilter"))
    filterSetupArmorPicker();
  if (event.target?.closest?.("#setupVehicleCategoryFilter"))
    filterSetupVehiclePicker();
  if (event.target?.closest?.("#setupHindranceCatalogSelect")) {
    syncSetupHindranceSeverity();
    updateSetupHindranceSelectionPreview();
  }
  if (event.target?.closest?.("#setupHindranceSeverityInput"))
    updateSetupHindranceSelectionPreview();
  if (event.target?.closest?.("#setupHumanFreeEdgeSelect"))
    updateSetupEdgeSelectionPreview(
      "setupHumanFreeEdgeSelect",
      "setupHumanFreeEdgePreview",
    );
  if (event.target?.closest?.("#setupHindranceBenefitEdgeSelect"))
    updateSetupEdgeSelectionPreview(
      "setupHindranceBenefitEdgeSelect",
      "setupHindranceBenefitEdgePreview",
    );
  if (event.target?.closest?.("#setupStartingPowerSelect"))
    updateSetupPowerSelectionPreview();
});

els.armorSelect.onchange = () => {
  character.selectedArmorLocation = els.armorSelect.value;
  render();
  save();
};
els.addMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents += centsValue;
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.spendMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents = Math.max(0, character.moneyCents - centsValue);
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.addInventoryBtn.onclick = addInventory;
els.cancelInventoryAddBtn.onclick = () => {
  els.inventoryUnitsInput.value = "";
  updatePreviews();
  els.gearAddForm.classList.add("hidden");
};
els.addStorageLocationBtn.onclick = () => {
  addStorageLocation(els.storageLocationInput.value);
  els.storageLocationInput.value = "";
  render();
  save();
};
els.addVehicleBtn.onclick = addVehicle;
els.cancelVehicleAddBtn.onclick = () => {
  els.vehicleAddForm.classList.add("hidden");
};
els.addAmmoBtn.onclick = addAmmo;
els.cancelAmmoAddBtn.onclick = () => {
  els.ammoAddForm.classList.add("hidden");
};
els.addArmorBtn.onclick = addArmor;
els.cancelArmorAddBtn.onclick = () => {
  els.armorAddForm.classList.add("hidden");
};
els.addWeaponBtn.onclick = addWeapon;
els.cancelWeaponAddBtn.onclick = () => {
  els.weaponAddForm.classList.add("hidden");
};
els.addPowerBtn.onclick = addPower;
if (els.addCatalogPowerBtn)
  els.addCatalogPowerBtn.onclick = () => addCatalogPower();
if (els.addRequiredPowerBtn) els.addRequiredPowerBtn.onclick = addRequiredPower;
[
  els.powerCatalogSearch,
  els.powerRankFilter,
  els.powerValidOnlyInput,
  els.powerCatalogSelect,
]
  .filter(Boolean)
  .forEach((input) => {
    input.oninput = renderPowerCatalogPicker;
    input.onchange = renderPowerCatalogPicker;
  });
els.addManualPowerPointsBtn.onclick = addManualPowerPoints;
els.reviewSetupBtn.onclick = reopenSetupReview;
els.showEdgeFormBtn.onclick = () => openEdgeEditor();
els.edgeCatalogSelect.onchange = chooseEdgeCatalogEntry;
els.edgeNameInput.oninput = renderEdgeSubchoiceControls;
els.saveEdgeBtn.onclick = saveEdgeEditor;
els.cancelEdgeEditBtn.onclick = closeEdgeEditor;
els.showHindranceFormBtn.onclick = () => openHindranceEditor();
els.hindranceCatalogSelect.onchange = chooseHindranceCatalogEntry;
els.saveHindranceBtn.onclick = saveHindranceEditor;
els.cancelHindranceEditBtn.onclick = closeHindranceEditor;
els.showAdvanceFormBtn.onclick = () => openAdvanceEditor();
els.advanceTypeInput.onchange = () => {
  const type = els.advanceTypeInput.value;
  els.advanceTargetTypeInput.value = targetTypeForAdvanceType(type);
  els.advanceApplyInput.disabled = !isSupportedAppliedAdvance(type);
  els.advanceApplyInput.checked = isSupportedAppliedAdvance(type);
  els.advanceApplyPanel.classList.toggle(
    "hidden",
    !isSupportedAppliedAdvance(type),
  );
  if (type === "Power Points" && !els.advancePowerPointAmountInput.value)
    els.advancePowerPointAmountInput.value = 5;
  advancePowerTargetIds = [];
  advanceManualEdgeMode = false;
  renderAdvanceDynamicFields();
};
els.advancePowerPointAmountInput.oninput = syncAdvanceGeneratedFields;
els.advanceApplyInput.onchange = syncAdvanceGeneratedFields;
els.showAdvanceNotesBtn.onclick = () => {
  els.advanceNotesField.classList.remove("hidden");
  els.showAdvanceNotesBtn.classList.add("hidden");
  els.advanceNotesInput.focus();
};
els.saveAdvanceBtn.onclick = saveAdvanceEditor;
els.cancelAdvanceEditBtn.onclick = closeAdvanceEditor;
[
  els.gearSelect,
  els.ammoGearSelect,
  els.ammoCaliberSelect,
  els.armorCatalogSelect,
  els.weaponCatalogSelect,
  els.vehicleCatalogSelect,
].forEach((select) => {
  select.onchange = updatePreviews;
});
[els.inventoryCountInput, els.inventoryUnitsInput].forEach((input) => {
  input.oninput = updatePreviews;
});
els.notesArea.oninput = () => {
  character.notes = els.notesArea.value;
  save();
};
els.clearTempConditionsBtn.onclick = () => {
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
[
  ["hucksterSelectedPower", "selectedPower", "text"],
  ["hucksterRequiredPowerPoints", "requiredPowerPoints", "number"],
  ["hucksterGamblingRollResult", "gamblingRollResult", "text"],
  ["hucksterCardsDrawn", "cardsDrawn", "number"],
  ["hucksterPokerHand", "pokerHand", "text"],
  ["hucksterTemporaryPowerPoints", "temporaryPowerPoints", "number"],
  ["hucksterShortagePenalty", "shortagePenalty", "number"],
  ["hucksterLeftoverPowerPoints", "leftoverPowerPoints", "number"],
  ["hucksterNotes", "notes", "text"],
].forEach(([elementKey, field, type]) => {
  els[elementKey].oninput = () => {
    const raw = els[elementKey].value;
    updateHucksterDealField(
      field,
      type === "number" ? Math.max(0, Math.floor(Number(raw) || 0)) : raw,
    );
  };
});
[
  ["hucksterAnteBennySpent", "anteBennySpent"],
  ["hucksterUsedJoker", "usedJoker"],
  ["hucksterBackfireTriggered", "backfireTriggered"],
].forEach(([elementKey, field]) => {
  els[elementKey].onchange = () => {
    updateHucksterDealField(field, els[elementKey].checked);
  };
});
[
  ["actionCardInput", "current"],
  ["actionCardSecondaryInput", "secondary"],
  ["actionCardNotesInput", "notes"],
].forEach(([elementKey, field]) => {
  els[elementKey].oninput = () =>
    updateActionCardField(field, els[elementKey].value);
});
els.clearActionCardsBtn.onclick = () => {
  character.actionCards = normalizeActionCardState(null);
  render();
  save();
};
els.newSessionBtn.onclick = async () => {
  if (
    !(await appConfirm(
      "This resets bennies to starting, clears conviction, refills resources, clears Action Cards, clears combat declarations, and clears temporary conditions.",
      {
        title: "Start a new play session?",
        confirmText: "Start Session",
      },
    ))
  )
    return;
  syncCharacterStartingBennies(character);
  character.bennies.current = character.bennies.starting;
  character.actionCards = normalizeActionCardState(null);
  character.combatDeclaration = normalizeCombatDeclarationState(null);
  character.conviction = 0;
  character.resources.forEach((resource) => (resource.current = resource.max));
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
els.resetBtn.onclick = async () => {
  if (
    await appConfirm("This replaces the current local tracker state.", {
      title: "Reset tracker to defaults?",
      confirmText: "Reset",
      danger: true,
    })
  ) {
    characterDraftMode = false;
    character = normalize(clone(defaultCharacter));
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
    saveCharacterSlot(character, { source: "reset" });
    render();
    renderDemoExperience();
  }
};
els.exportBtn.onclick = () => {
  exportTrackerCharacter();
};
els.undoBtn.onclick = () => {
  undoLastCharacterChange();
};
els.redoBtn.onclick = () => {
  redoLastCharacterChange();
};
els.importFile.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      JSON.parse(reader.result);
    } catch {
      alertInvalidImport();
      els.importFile.value = "";
      return;
    }
    if (
      !(await resolveUnsavedCharacterDraft(
        "Save this character draft before importing another character?",
      ))
    ) {
      els.importFile.value = "";
      return;
    }
    try {
      const importType = importJsonText(reader.result);
      completeImport(importType);
      closeHeaderMenu();
    } catch {
      alertInvalidImport();
    }
  };
  reader.readAsText(file);
};
els.pasteImportBtn.onclick = () => {
  if (els.pasteImportPanel.classList.contains("hidden")) openPasteImportPanel();
  else {
    els.pasteImportPanel.classList.add("hidden");
    resetLandingImportPanelBounds();
  }
};
els.cancelPasteImportBtn.onclick = () => {
  els.importJsonText.value = "";
  els.importFile.value = "";
  els.pasteImportPanel.classList.add("hidden");
  resetLandingImportPanelBounds();
};
els.confirmPasteImportBtn.onclick = async () => {
  const text = els.importJsonText.value.trim();
  try {
    JSON.parse(text);
  } catch {
    alertInvalidImport();
    return;
  }
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save this character draft before importing another character?",
    ))
  )
    return;
  try {
    const importType = importJsonText(text);
    completeImport(importType);
  } catch {
    alertInvalidImport();
  }
};

els.localDataExportTrackerBtn.onclick = exportTrackerCharacter;
els.localDataExportFullBtn.onclick = exportFullState;
els.localDataOpenImportBtn.onclick = openPasteImportPanel;
els.librarySaveCurrentBtn.onclick = saveCurrentCharacterToLibrary;
els.libraryReviewSetupBtn.onclick = reviewActiveCharacterSetup;
els.libraryDuplicateActiveBtn.onclick = duplicateActiveCharacterFromLibrary;
els.localDataShowWelcomeBtn.onclick = () => {
  const panel = $("#demoWelcomePanel");
  if (panel) {
    panel.dataset.manualOpen = "true";
    renderDemoExperience(true);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
els.localDataClearDemoFlagBtn.onclick = () => {
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  renderDemoExperience();
  renderLocalDataSummary();
  appToast(
    "Demo mode flag cleared. Current character data remains saved.",
    "success",
  );
};
els.localDataClearDraftBtn.onclick = async () => {
  if (
    !(await appConfirm(
      "This removes only saved character creation/setup drafts. Saved character slots are unchanged.",
      {
        title: "Clear creation drafts?",
        confirmText: "Clear Draft",
        danger: true,
      },
    ))
  )
    return;
  creationDraft = emptyDraft();
  storageAdapter.remove(CREATION_KEY);
  clearSetupResumeState();
  if ($("#creationPanel")?.classList.contains("active")) renderCreator();
  renderLocalDataSummary();
  appToast("Creator and setup drafts cleared.", "success");
};
els.localDataClearAllBtn.onclick = async () => {
  if (
    !(await appConfirm(
      "This will permanently erase all saved characters and all local tracker data from this browser. This is destructive and cannot be undone. Export a full backup first if this data matters.",
      {
        title: "Permanently clear local data?",
        confirmText: "Permanently Clear Local Data",
        danger: true,
      },
    ))
  )
    return;
  clearTimeout(saveTimer);
  storageAdapter.remove(STORAGE_KEY);
  storageAdapter.remove(CHARACTER_LIBRARY_KEY);
  storageAdapter.remove(UNDO_HISTORY_KEY);
  storageAdapter.remove(CREATION_KEY);
  clearSetupResumeState();
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, false);
  characterDraftMode = false;
  character = normalize(clone(defaultCharacter));
  characterLibrary = emptyCharacterLibrary();
  creationDraft = emptyDraft();
  render();
  renderLandingPage();
  renderDemoExperience();
  appToast("Local app data cleared from this browser.", "success");
};
