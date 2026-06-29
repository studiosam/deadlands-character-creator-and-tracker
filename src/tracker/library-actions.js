/**
 * Character library and profile action helpers.
 *
 * This module owns save-slot mutations and stable identity/profile edits. It
 * should not reach into feature-specific rule workflows such as setup,
 * advancement, inventory, or powers except through existing character state.
 */
const CHARACTER_PROFILE_FIELDS = [
  "name",
  "gender",
  "age",
  "archetype",
  "player",
  "description",
  "background",
];

async function saveCharacterProfile() {
  const updates = {};
  document.querySelectorAll("[data-profile-field]").forEach((input) => {
    const field = input.dataset.profileField;
    if (CHARACTER_PROFILE_FIELDS.includes(field))
      updates[field] = input.value.trim();
  });

  if (!updates.name) {
    appToast("Character profile requires a name.", "danger");
    return;
  }

  CHARACTER_PROFILE_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field))
      character[field] = updates[field];
  });

  if (isUnsavedCharacterDraft()) {
    const entry = await saveUnsavedCharacterDraft();
    if (!entry) return;
    character = normalize(entry.character);
  } else {
    saveCharacterSlot(character);
  }

  render();
  renderDemoExperience();
  appToast("Character profile saved.", "success");
}

async function handleLibraryAction(target) {
  const id = target.dataset.libraryId;
  const entry = characterLibrary?.charactersById?.[id];
  if (!entry) return;

  if (target.dataset.libraryAction === "switch") {
    if (
      !(await resolveUnsavedCharacterDraft(
        "Save this character draft before switching to another saved character?",
      ))
    )
      return;
    saveCharacterSlot(character);
    if (activateCharacterSlot(id)) {
      render();
      renderDemoExperience();
      appToast(`Switched to ${entry.name}.`, "success");
    }
  } else if (target.dataset.libraryAction === "rename") {
    const nextName = await appPrompt(
      "Choose the saved character name shown in the library.",
      entry.name,
      {
        title: "Rename character slot",
        confirmText: "Rename",
        inputLabel: "Character name",
      },
    );
    if (nextName === null) return;
    if (renameCharacterSlot(id, nextName)) {
      render();
      appToast("Character slot renamed.", "success");
    }
  } else if (target.dataset.libraryAction === "duplicate") {
    if (
      !(await resolveUnsavedCharacterDraft(
        "Save this character draft before duplicating a saved character?",
      ))
    )
      return;
    saveCharacterSlot(character);
    const copy = duplicateCharacterSlot(id);
    if (copy) {
      character = normalize(copy.character);
      render();
      renderDemoExperience();
      appToast(`${copy.name} created.`, "success");
    }
  } else if (target.dataset.libraryAction === "export") {
    exportJson(
      `${slugify(entry.name || "character")}-tracker.json`,
      serializeTrackerExport(entry.character),
    );
  } else if (target.dataset.libraryAction === "delete") {
    if (
      !(await appConfirm(`Delete the saved slot for ${entry.name}?`, {
        title: "Delete character slot?",
        confirmText: "Delete",
        danger: true,
      }))
    )
      return;
    if (removeCharacterSlot(id)) {
      render();
      renderDemoExperience();
      if (!activeCharacterSlot()) renderLandingPage();
      appToast("Character slot deleted.", "success");
    }
  }
}

async function saveCurrentCharacterToLibrary() {
  if (isUnsavedCharacterDraft()) {
    await saveDraftCharacterFromSetup();
    return;
  }
  saveCharacterSlot(character);
  render();
  appToast("Current character saved to the library.", "success");
}

function reviewActiveCharacterSetup() {
  setAppTab("character");
  reopenSetupReview();
}

async function duplicateActiveCharacterFromLibrary() {
  if (
    !(await resolveUnsavedCharacterDraft(
      "Save this character draft before duplicating the active saved character?",
    ))
  )
    return;
  saveCharacterSlot(character);
  const copy = duplicateCharacterSlot(characterLibrary?.activeCharacterId);
  if (!copy) return;
  character = normalize(copy.character);
  render();
  renderDemoExperience();
  appToast(`${copy.name} created.`, "success");
}
