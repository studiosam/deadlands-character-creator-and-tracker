function updateHucksterDealField(field, value) {
  if (!character.hucksterDeal) character.hucksterDeal = makeHucksterDeal();
  character.hucksterDeal[field] = value;
  character.hucksterDeal = normalizeHucksterDeal(character.hucksterDeal);
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

function exportJson(name, data) {
  downloadJsonFile(name, data);
  appToast(`Exported ${name}.`, "success");
}

function importJsonText(text) {
  const data = JSON.parse(text);
  const payload = unwrapImportPayload(data);
  if (payload.type === "full-state") {
    character = normalize(payload.activeCharacter);
    if (payload.creationDraft) {
      creationDraft = normalizeDraft(payload.creationDraft);
      saveCreationDraft();
    }
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  } else if (payload.type === "creation-draft") {
    creationDraft = normalizeDraft(payload.creationDraft);
    saveCreationDraft();
    setCreatorMode(true);
  } else {
    character = isSavagedUsExport(data)
      ? fromSavagedUs(data)
      : normalize(payload.activeCharacter);
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  }
  render();
  renderDemoExperience();
  save();
  appToast("Import complete.", "success");
}

function alertInvalidImport() {
  appToast(
    "That was not valid tracker, full app state, creation draft, or Savaged.us character JSON.",
    "danger",
  );
}

function closeHeaderMenu() {
  els.headerToolsMenu.open = false;
}

function exportTrackerCharacter() {
  exportJson(
    `${slugify(character.name || "character")}-tracker.json`,
    serializeTrackerExport(character),
  );
}

function exportFullState() {
  exportJson(
    "deadlands-tracker-full-state.json",
    serializeFullStateExport(character, creationDraft),
  );
}

function openPasteImportPanel() {
  els.pasteImportPanel.classList.remove("hidden");
  els.importJsonText.focus();
  els.pasteImportPanel.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("click", (event) => {
  if (event.target?.dataset?.action) action(event.target.dataset.action);
  const entryAction = event.target?.closest?.("[data-entry-action]");
  if (entryAction) handleEntryAction(entryAction);
  if (event.target?.dataset?.toggleForm) {
    const form = document.getElementById(event.target.dataset.toggleForm);
    form?.classList.toggle("hidden");
  }
  if (event.target?.closest?.(".header-actions button")) closeHeaderMenu();
  if (!event.target?.closest?.(".header-tools")) closeHeaderMenu();
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
if (els.addCatalogPowerBtn) els.addCatalogPowerBtn.onclick = () => addCatalogPower();
if (els.addRequiredPowerBtn) els.addRequiredPowerBtn.onclick = addRequiredPower;
[
  els.powerCatalogSearch,
  els.powerRankFilter,
  els.powerValidOnlyInput,
  els.powerCatalogSelect,
].filter(Boolean).forEach((input) => {
  input.oninput = renderPowerCatalogPicker;
  input.onchange = renderPowerCatalogPicker;
});
els.addManualPowerPointsBtn.onclick = addManualPowerPoints;
els.showEdgeFormBtn.onclick = () => openEdgeEditor();
els.edgeCatalogSelect.onchange = chooseEdgeCatalogEntry;
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
  els.advanceApplyPanel.classList.toggle("hidden", !isSupportedAppliedAdvance(type));
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
els.newSessionBtn.onclick = async () => {
  if (
    !(await appConfirm(
      "This resets bennies to starting, clears conviction, refills resources, and clears temporary conditions.",
      {
        title: "Start a new play session?",
        confirmText: "Start Session",
      },
    ))
  )
    return;
  character.bennies.current = character.bennies.starting;
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
    character = normalize(clone(defaultCharacter));
    storageAdapter.remove(STORAGE_KEY);
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
    render();
    renderDemoExperience();
    save();
  }
};
els.exportBtn.onclick = () => {
  exportTrackerCharacter();
};
els.importFile.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importJsonText(reader.result);
      els.importFile.value = "";
      closeHeaderMenu();
    } catch {
      alertInvalidImport();
    }
  };
  reader.readAsText(file);
};
els.pasteImportBtn.onclick = () => {
  els.pasteImportPanel.classList.toggle("hidden");
  if (!els.pasteImportPanel.classList.contains("hidden"))
    els.importJsonText.focus();
};
els.cancelPasteImportBtn.onclick = () => {
  els.importJsonText.value = "";
  els.pasteImportPanel.classList.add("hidden");
};
els.confirmPasteImportBtn.onclick = () => {
  try {
    importJsonText(els.importJsonText.value.trim());
    els.importJsonText.value = "";
    els.pasteImportPanel.classList.add("hidden");
  } catch {
    alertInvalidImport();
  }
};

els.settingsExportTrackerBtn.onclick = exportTrackerCharacter;
els.settingsExportFullBtn.onclick = exportFullState;
els.settingsOpenImportBtn.onclick = openPasteImportPanel;
els.settingsShowWelcomeBtn.onclick = () => {
  const panel = $("#demoWelcomePanel");
  if (panel) {
    panel.dataset.manualOpen = "true";
    renderDemoExperience(true);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
els.settingsClearDemoFlagBtn.onclick = () => {
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  renderDemoExperience();
  renderSettingsSummary();
  appToast("Demo mode flag cleared. Current character data remains saved.", "success");
};
els.settingsClearDraftBtn.onclick = async () => {
  if (
    !(await appConfirm("This removes only the saved character creation draft.", {
      title: "Clear creator draft?",
      confirmText: "Clear Draft",
      danger: true,
    }))
  )
    return;
  creationDraft = emptyDraft();
  storageAdapter.remove(CREATION_KEY);
  if ($("#creationPanel")?.classList.contains("active")) renderCreator();
  renderSettingsSummary();
  appToast("Creator draft cleared.", "success");
};
els.settingsClearAllBtn.onclick = async () => {
  if (
    !(await appConfirm(
      "This removes the tracker save, creator draft, demo flags, and welcome preference from this browser. Export a full backup first if this data matters.",
      {
        title: "Clear all local data?",
        confirmText: "Clear Local Data",
        danger: true,
      },
    ))
  )
    return;
  clearTimeout(saveTimer);
  storageAdapter.remove(STORAGE_KEY);
  storageAdapter.remove(CREATION_KEY);
  storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  storageAdapter.writeFlag(WELCOME_DISMISSED_KEY, false);
  character = normalize(clone(defaultCharacter));
  creationDraft = emptyDraft();
  render();
  renderDemoExperience(true);
  appToast("Local app data cleared from this browser.", "success");
};
