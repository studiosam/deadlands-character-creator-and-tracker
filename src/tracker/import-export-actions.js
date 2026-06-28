// Import, export, and paste-import panel helpers.
function exportJson(name, data) {
  downloadJsonFile(name, data);
  appToast(`Exported ${name}.`, "success");
}

function importJsonText(text) {
  const data = JSON.parse(text);
  const payload = unwrapImportPayload(data);
  characterDraftMode = false;
  characterSetupReviewOpen = false;
  if (payload.type === "full-state") {
    characterLibrary = payload.characterLibrary
      ? normalizeCharacterLibrary(payload.characterLibrary)
      : emptyCharacterLibrary();
    character = normalize(payload.activeCharacter);
    saveCharacterSlot(character, {
      id: characterLibrary.activeCharacterId || undefined,
      source: activeCharacterSlot()?.source || character.source || "imported",
    });
    if (payload.creationDraft) {
      creationDraft = normalizeDraft(payload.creationDraft);
      saveCreationDraft();
    } else {
      creationDraft = emptyDraft();
      storageAdapter.remove(CREATION_KEY);
    }
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  } else if (payload.type === "creation-draft") {
    creationDraft = normalizeDraft(payload.creationDraft);
    saveCreationDraft();
    setCreatorMode(true);
  } else {
    const importedCharacter = isSavagedUsExport(data)
      ? fromSavagedUs(data)
      : normalize(payload.activeCharacter, {
          defaultSetupStatus: "needsReview",
        });
    const entry = addCharacterSlot(importedCharacter, {
      source:
        importedCharacter.source ||
        (isSavagedUsExport(data) ? "savaged.us" : "imported"),
    });
    character = normalize(entry.character);
    characterSetupStep = "review";
    storageAdapter.writeFlag(DEMO_MODE_KEY, false);
  }
  render();
  renderDemoExperience();
  appToast("Import complete.", "success");
  return payload.type;
}

function alertInvalidImport() {
  appToast(
    "That was not valid tracker, full app state, creation draft, or Savaged.us character JSON.",
    "danger",
  );
}

function exportTrackerCharacter() {
  exportJson(
    `${slugify(character.name || "character")}-tracker.json`,
    serializeTrackerExport(character),
  );
}

function exportFullState() {
  if (!isUnsavedCharacterDraft()) saveCharacterSlot(character);
  exportJson(
    "deadlands-tracker-full-state.json",
    serializeFullStateExport(character, creationDraft, characterLibrary),
  );
}

function openPasteImportPanel(location = "app") {
  if (location === "landing" && landingPageIsVisible()) {
    const landingContent = $(".landing-content");
    landingContent?.append(els.pasteImportPanel);
    landingContent?.classList.add("landing-import-open");
    els.pasteImportPanel.classList.add("landing-import-panel");
  } else {
    $("#toastRegion")?.before(els.pasteImportPanel);
    els.pasteImportPanel.classList.remove("landing-import-panel");
    resetLandingImportPanelBounds();
  }
  els.pasteImportPanel.classList.remove("hidden");
  requestAnimationFrame(updateLandingImportPanelBounds);
  els.importJsonText.focus();
}

function landingPageIsVisible() {
  return !$("#landingPage")?.classList.contains("hidden");
}

function updateLandingImportPanelBounds() {
  const landingContent = $(".landing-content");
  if (
    !landingContent ||
    !els.pasteImportPanel.classList.contains("landing-import-panel") ||
    els.pasteImportPanel.classList.contains("hidden")
  ) {
    return;
  }

  if (window.matchMedia("(max-width: 520px)").matches) {
    clearLandingImportPanelStyles();
    return;
  }

  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const viewportWidth = window.visualViewport?.width || window.innerWidth;
  const viewportGap = 16;
  const dockGap = 12;

  clearLandingImportPanelStyles();

  const anchorRect = getLandingImportAnchorRect();
  if (!anchorRect) return;

  const maximumPanelHeight = Math.max(0, viewportHeight - viewportGap * 2);
  const preferredPanelHeight = Math.min(
    els.pasteImportPanel.scrollHeight,
    maximumPanelHeight,
  );
  const adjustedPanelTop = anchorRect.bottom + dockGap;
  const remainingHeight = Math.max(
    0,
    viewportHeight - adjustedPanelTop - viewportGap,
  );
  const panelHeight = Math.min(
    maximumPanelHeight,
    preferredPanelHeight,
    remainingHeight,
  );

  els.pasteImportPanel.style.setProperty(
    "--landing-import-max-height",
    `${panelHeight}px`,
  );
  els.pasteImportPanel.style.setProperty(
    "--landing-import-top",
    `${adjustedPanelTop}px`,
  );
  els.pasteImportPanel.style.setProperty(
    "--landing-import-left",
    `${Math.max(viewportGap, anchorRect.left)}px`,
  );
  els.pasteImportPanel.style.setProperty(
    "--landing-import-width",
    `${Math.min(anchorRect.width, viewportWidth - viewportGap * 2)}px`,
  );
}

function getLandingImportAnchorRect() {
  const elements = [
    $("#landingCharacterPicker:not(.hidden)"),
    $("#landingContinueBtn"),
    $(".landing-secondary-actions"),
    $("#landingLoadSampleBtn:not(.hidden)"),
  ].filter(Boolean);
  const rects = elements
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
  if (!rects.length) return null;
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return {
    bottom,
    left,
    width: right - left,
  };
}

function clearLandingImportPanelStyles() {
  els.pasteImportPanel.style.removeProperty("--landing-import-max-height");
  els.pasteImportPanel.style.removeProperty("--landing-import-top");
  els.pasteImportPanel.style.removeProperty("--landing-import-left");
  els.pasteImportPanel.style.removeProperty("--landing-import-width");
}

function resetLandingImportPanelBounds() {
  $(".landing-content")?.classList.remove("landing-import-open");
  clearLandingImportPanelStyles();
}

function closeLandingAfterImport(importType) {
  if (!landingPageIsVisible() || typeof closeLandingPage !== "function") return;
  closeLandingPage(importType === "creation-draft" ? "creation" : "play");
}

function completeImport(importType) {
  els.importJsonText.value = "";
  els.importFile.value = "";
  els.pasteImportPanel.classList.add("hidden");
  resetLandingImportPanelBounds();
  closeLandingAfterImport(importType);
}
