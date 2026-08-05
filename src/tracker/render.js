/**
 * Main tracker render orchestration.
 *
 * render() derives display state from the normalized character, updates shared
 * UI surfaces, and delegates feature-specific sections to focused renderers.
 * Keep long-lived data migration in storage.js rather than hiding it here.
 */
function characterSetupReviewMode() {
  return character?.setupStatus === "needsReview" || characterSetupReviewOpen;
}

function updateCharacterSetupShellMode() {
  const characterPanel = $("#characterPanel");
  const characterPanelActive =
    characterPanel?.classList.contains("active") &&
    !characterPanel?.classList.contains("hidden");
  $(".shell")?.classList.toggle(
    "character-setup-page",
    Boolean(characterSetupReviewMode() && characterPanelActive),
  );
}

function renderCharacterTabMode() {
  const setupMode = characterSetupReviewMode();
  const confirmedSheetMode =
    character?.setupStatus === "complete" && !characterSetupReviewOpen;
  updateCharacterSetupShellMode();
  els.characterSetupPanel?.classList.toggle("hidden", !setupMode);
  els.characterDossierLayout?.classList.toggle("hidden", setupMode);
  els.reviewSetupBtn?.classList.toggle("hidden", setupMode);
  els.showAdvanceFormBtn?.classList.toggle("hidden", false);
  [els.showEdgeFormBtn, els.showHindranceFormBtn].forEach((button) =>
    button?.classList.toggle("hidden", confirmedSheetMode),
  );
  [els.edgeEditorPanel, els.hindranceEditorPanel].forEach((panel) => {
    if (confirmedSheetMode) panel?.classList.add("hidden");
  });
}

function characterIdentitySubtitle(separator = " ") {
  return [character.rank, character.ancestry, character.archetype]
    .filter(Boolean)
    .join(separator);
}

function characterDossierSubtitleText(separator = " \u2022 ") {
  const setupMode = characterSetupReviewMode();
  return [
    setupMode ? "" : character.player,
    character.gender,
    character.age,
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(separator);
}

function characterDisplayName() {
  return String(character?.name || "").trim() || "Unnamed Character";
}

function renderCharacterIdentityDisplays() {
  els.characterName.textContent = characterDisplayName();
  els.characterSubtitle.textContent = characterIdentitySubtitle(" ");
  if (els.characterSummaryName)
    els.characterSummaryName.textContent = characterDisplayName();
  if (els.characterDossierSubtitle)
    els.characterDossierSubtitle.textContent = characterDossierSubtitleText();
}

function renderArcaneTabAvailability() {
  const available = characterHasArcaneTrackerContent(character);
  els.arcaneTabBtn.disabled = !available;
  els.arcaneTabBtn.setAttribute("aria-disabled", String(!available));
  els.clearArcaneTrackingBtn?.classList.toggle("hidden", !available);
  if (available) els.arcaneTabBtn.removeAttribute("title");
  else
    els.arcaneTabBtn.title =
      "No Arcane Background, powers, Power Points, or other arcane tools are recorded for this character.";

  if (!available && $("#arcanePanel")?.classList.contains("active")) {
    setAppTab("play", { replace: true });
  }
}

function render() {
  renderCharacterIdentityDisplays();
  renderArcaneTabAvailability();
  const maxWoundsModifier = characterMaxWoundsModifier(character);
  const pendingMaxWoundsModifier = characterPendingMaxWoundsModifier(character);
  if (
    character.damage.baseMaxWounds === undefined &&
    character.source === "created"
  ) {
    character.damage.baseMaxWounds = Number(character.damage.maxWounds) || 3;
  }
  const baseMaxWounds = Number(character.damage.baseMaxWounds);
  const canApplyMaxWoundsModifier =
    Number.isFinite(baseMaxWounds) && baseMaxWounds > 0;
  character.damage.maxWounds = canApplyMaxWoundsModifier
    ? Math.max(1, baseMaxWounds + maxWoundsModifier)
    : Number(character.damage.maxWounds) || 3;
  character.damage.effectMaxWoundsModifier = canApplyMaxWoundsModifier
    ? maxWoundsModifier
    : 0;
  character.damage.effectMaxWoundsPendingModifier = canApplyMaxWoundsModifier
    ? 0
    : pendingMaxWoundsModifier;
  const damageStatus = characterDamageStatus(character);
  els.woundsValue.textContent = damageStatus.wounds.value;
  const rawWoundPenalty = damageStatus.wounds.penalty;
  const woundPenaltyReduction = characterWoundPenaltyReduction(
    character,
    "character",
  );
  const appliedWoundPenaltyReduction = Math.min(
    rawWoundPenalty,
    woundPenaltyReduction,
  );
  els.woundsNote.textContent = damageStatus.wounds.incapacitated
    ? `Incapacitated: Wounds exceed the maximum (${damageStatus.wounds.value}/${damageStatus.wounds.maximum}).`
    : character.damage.wounds
      ? appliedWoundPenaltyReduction
        ? `Wound penalty reduced by ${appliedWoundPenaltyReduction} from passive effects.`
        : "Apply wound penalty to affected trait rolls."
      : character.damage.effectMaxWoundsPendingModifier
        ? "Recorded Wound maximum; passive Wound capacity effect shown below."
        : "Healthy";
  els.fatigueValue.textContent = damageStatus.fatigue.value;
  els.fatigueNote.textContent = damageStatus.fatigue.incapacitated
    ? `Incapacitated: Fatigue exceeds the maximum (${damageStatus.fatigue.value}/${damageStatus.fatigue.maximum}).`
    : character.damage.fatigue
      ? "Apply fatigue penalty to affected trait rolls."
      : "Fresh";
  syncCharacterStartingBennies(character);
  els.benniesValue.textContent = character.bennies.current;
  els.bennyStart.textContent = `Start ${character.bennies.starting}`;
  els.convictionValue.textContent = character.conviction;

  const location = "best";
  character.selectedArmorLocation = "best";
  const armor = armorValue(location);
  const toughnessModifier = characterToughnessModifier(character);
  const pendingToughnessModifier = characterPendingToughnessModifier(character);
  const sizeModifier = characterSizeModifier(character);
  const paceModifier = characterPaceModifier(character);
  const parryModifier = characterParryModifier(character);
  if (character.derived.basePace === undefined) {
    character.derived.basePace = Number(character.derived.pace) || 6;
  }
  if (
    character.derived.baseParry === undefined &&
    character.source === "created"
  ) {
    character.derived.baseParry = Number(character.derived.parry) || 2;
  }
  if (character.derived.baseSize === undefined) {
    character.derived.baseSize =
      Number(character.size ?? character.derived.size) || 0;
  }
  const baseParry = Number(character.derived.baseParry);
  const canApplyParryModifier = Number.isFinite(baseParry) && baseParry > 0;
  const effectivePace = Math.max(
    1,
    (Number(character.derived.basePace) || 6) + paceModifier,
  );
  const effectiveParry = canApplyParryModifier
    ? baseParry + parryModifier
    : Number(character.derived.parry) || 2;
  const effectiveBaseToughness =
    (Number(character.derived.baseToughness) || 0) + toughnessModifier;
  const effectiveSize =
    (Number(character.derived.baseSize) || 0) + sizeModifier;
  character.derived.armor = armor;
  character.derived.pace = effectivePace;
  character.derived.parry = effectiveParry;
  character.derived.toughness = effectiveBaseToughness + armor;
  character.derived.size = effectiveSize;
  character.derived.effectPaceModifier = paceModifier;
  character.derived.effectParryModifier = canApplyParryModifier
    ? parryModifier
    : 0;
  character.derived.effectParryPendingModifier = canApplyParryModifier
    ? 0
    : parryModifier;
  character.derived.effectToughnessModifier = toughnessModifier;
  character.derived.effectToughnessPendingModifier = pendingToughnessModifier;
  character.derived.effectSizeModifier = sizeModifier;
  els.paceValue.textContent = character.derived.pace;
  els.parryValue.textContent = character.derived.parry;
  els.toughnessValue.textContent = `${character.derived.toughness} (+${armor})`;
  els.armorSelect.innerHTML = `<option value="best">All equipped armor</option>`;
  els.armorSelect.value = location;
  els.armorNote.textContent = `Armor bonus: +${armor}`;
  els.combatArmorLocations.innerHTML = ARMOR_LOCATIONS.filter(
    (item) => !["best", "shield"].includes(item.id),
  )
    .map(
      (item) =>
        `<span><strong>${esc(item.label)}:</strong> +${armorValue(item.id)}</span>`,
    )
    .join("");
  els.weaponStrengthPill.textContent = `Strength ${character.weaponStrength}`;
  els.moneyDisplay.textContent = money(character.moneyCents);

  renderCharacterSummary();
  if (typeof renderDeadlandsOrganizations === "function")
    renderDeadlandsOrganizations();
  renderCharacterSetup();
  renderCharacterTabMode();
  renderCatalogBrowser();
  renderAdvancement();
  renderArmor();
  renderWeapons();
  renderAmmo();
  renderResources();
  renderPowers();
  renderActivePowers();
  if (typeof renderMadScienceDevices === "function") renderMadScienceDevices();
  renderHucksterDeal();
  renderKeyConditions();
  renderConditions();
  renderCombatPenalties();
  renderConsumables();
  renderEncumbrance();
  renderInventory();
  renderVehicles();
  renderReminders();
  renderPlaySummary();
  renderArcaneSummary();
  renderNotesSummary();
  renderLocalDataSummary();
  renderCharacterLibrary();
  renderUndoControls();

  if (document.activeElement !== els.notesArea)
    els.notesArea.value = character.notes || "";
}

function characterSlotMeta(entry) {
  return [
    entry.rank,
    entry.archetype,
    entry.source ? characterSlotSourceLabel(entry.source) : "",
    entry.isDemo ? "Demo" : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function characterSlotSourceLabel(sourceValue) {
  const source = compactText(sourceValue || "local", "local");
  if (source.toLowerCase() === "savaged.us") return "Savaged.us import";
  if (source.toLowerCase() === "created") return "Created in tracker";
  if (source.toLowerCase() === "migrated") return "Migrated save";
  return source;
}

function renderCharacterProfileEditor() {
  if (!els.characterProfileEditor) return;
  const activeEntry = activeCharacterSlot();
  const slotMeta = activeEntry
    ? `${activeEntry.name || "Unnamed Character"} • ${characterSlotMeta(activeEntry) || "Local character"}`
    : "Saving profile edits will create a local saved slot for this character.";
  const setupStatus =
    character.setupStatus === "needsReview"
      ? "Needs setup review"
      : "Setup complete";
  els.characterProfileEditor.innerHTML = `
    <div class="character-profile-summary">
      <span class="pill">${esc(setupStatus)}</span>
      <p class="muted">${esc(slotMeta)}</p>
    </div>
    <div class="creator-grid character-profile-grid">
      <label>Name<input id="profileNameInput" data-profile-field="name" value="${esc(character.name || "")}" autocomplete="off"></label>
      <label>Player<input id="profilePlayerInput" data-profile-field="player" value="${esc(character.player || "")}" autocomplete="off"></label>
      <label>Profession or Title<input id="profileArchetypeInput" data-profile-field="archetype" value="${esc(character.archetype || "")}" autocomplete="off"></label>
      <label>Age<input id="profileAgeInput" data-profile-field="age" value="${esc(character.age || "")}" autocomplete="off"></label>
      <label>Gender<input id="profileGenderInput" data-profile-field="gender" value="${esc(character.gender || "")}" autocomplete="off" list="profileGenderOptions"></label>
      <datalist id="profileGenderOptions">
        <option value="Female"></option>
        <option value="Male"></option>
        <option value="Nonbinary"></option>
      </datalist>
      <label class="setup-wide">Description<textarea id="profileDescriptionInput" data-profile-field="description" rows="4">${esc(character.description || "")}</textarea></label>
      <label class="setup-wide">Background<textarea id="profileBackgroundInput" data-profile-field="background" rows="5">${esc(character.background || "")}</textarea></label>
    </div>
    <div class="creator-actions character-profile-actions">
      <button id="saveCharacterProfileBtn" type="button">Save Profile</button>
    </div>
  `;
  if (els.characterProfileStatus)
    els.characterProfileStatus.textContent =
      "Profile edits update identity text only. Rules, gear, powers, and advancement stay in their dedicated workflows.";
}

function renderCharacterLibrary() {
  if (!els.characterLibraryList) return;
  const entries = characterLibraryEntries();
  const activeId = characterLibrary?.activeCharacterId || "";
  if (els.librarySaveCurrentBtn)
    els.librarySaveCurrentBtn.textContent = isUnsavedCharacterDraft()
      ? "Save Draft"
      : "Save Current";
  els.librarySummaryPill.textContent = entries.length
    ? `${entries.length} saved`
    : "No saved slots";

  els.characterLibraryList.innerHTML = entries.length
    ? entries
        .map((entry) => {
          const active = entry.id === activeId;
          const updated = entry.updatedAt
            ? new Date(entry.updatedAt).toLocaleString()
            : "Not saved";
          return `<article class="library-character ${active ? "active" : ""}">
            <div class="library-character-main">
              <span class="pill">${active ? "Active" : "Saved"}</span>
              <h3>${esc(entry.name || "Unnamed Character")}</h3>
              <p class="muted">${esc(characterSlotMeta(entry) || "Local character")}</p>
              <small>Updated ${esc(updated)}</small>
            </div>
            <div class="library-character-actions">
              <button class="ghost" type="button" data-library-action="switch" data-library-id="${esc(entry.id)}" ${active ? "disabled" : ""}>Switch</button>
              <button class="ghost" type="button" data-library-action="rename" data-library-id="${esc(entry.id)}">Rename</button>
              <button class="ghost" type="button" data-library-action="duplicate" data-library-id="${esc(entry.id)}">Duplicate</button>
              <button class="ghost" type="button" data-library-action="export" data-library-id="${esc(entry.id)}">Export</button>
              <button class="delete-small" type="button" data-library-action="delete" data-library-id="${esc(entry.id)}">Delete</button>
            </div>
          </article>`;
        })
        .join("")
    : emptyState(
        "No saved character slots yet. Save the current character, load a sample, import JSON, or finalize a creator draft.",
      );
  renderCharacterProfileEditor();
}

function localJsonSize(key) {
  const value = storageAdapter.readText(key);
  return value ? `${Math.ceil(value.length / 1024)} KB` : "Not saved";
}

function localDataDetail(label, value) {
  return `<div><span>${esc(label)}</span><strong>${esc(value || "—")}</strong></div>`;
}

function renderLocalDataSummary() {
  if (!els.localDataAppDetails) return;
  const powerPoints = powerPointResource();
  const isDemoMode = storageAdapter.readFlag(DEMO_MODE_KEY);
  const hasDraft = storageAdapter.has(CREATION_KEY);
  const hasSetupDraft = storageAdapter.has(SETUP_DRAFT_KEY);
  const hasTrackerSave = storageAdapter.has(STORAGE_KEY);
  const source = sourceLabel();

  els.privacyLegalDemoLink.href = DEMO_URL;
  els.localDataStatusBadges.innerHTML = [
    `<span class="pill">Version ${esc(APP_VERSION)}</span>`,
    `<span class="pill">Schema ${APP_SCHEMA_VERSION}</span>`,
    `<span class="pill">${
      isUnsavedCharacterDraft()
        ? "Unsaved draft"
        : isDemoMode
          ? "Demo mode"
          : "Local save"
    }</span>`,
  ].join("");

  els.localDataAppDetails.innerHTML = [
    ["Current Character", character.name],
    [
      "Rank / Archetype",
      [character.rank, character.archetype].filter(Boolean).join(" / "),
    ],
    ["Source", source],
    ["App Version", APP_VERSION],
    ["Schema Version", APP_SCHEMA_VERSION],
    ["Browser Save Key", STORAGE_KEY],
    [
      "Power Points",
      powerPoints
        ? `${powerPoints.current} / ${powerPoints.max}`
        : "Not enabled",
    ],
  ]
    .map(([label, value]) => localDataDetail(label, value))
    .join("");

  els.localDataStorageDetails.innerHTML = [
    [
      "Tracker Save",
      isUnsavedCharacterDraft()
        ? "Setup draft saved separately"
        : hasTrackerSave
          ? localJsonSize(STORAGE_KEY)
          : "Not saved yet",
    ],
    [
      "Character Library",
      characterLibraryEntries().length
        ? `${characterLibraryEntries().length} slot(s), ${localJsonSize(CHARACTER_LIBRARY_KEY)}`
        : "No library saved",
    ],
    [
      "Creator Draft",
      hasDraft ? localJsonSize(CREATION_KEY) : "No draft saved",
    ],
    [
      "Setup Draft",
      hasSetupDraft ? localJsonSize(SETUP_DRAFT_KEY) : "No setup draft saved",
    ],
    ["Demo Mode", isDemoMode ? "On" : "Off"],
    [
      "Export Reminder",
      hasTrackerSave
        ? "Use full backup before clearing local data"
        : "Load, import, or create a character first",
    ],
  ]
    .map(([label, value]) => localDataDetail(label, value))
    .join("");
}

function encumbranceStatusClass(info) {
  if (info.overloaded) return "danger";
  if (info.heavyOverload) return "warning";
  if (info.encumbered) return "caution";
  return "safe";
}

function encumbranceMeterLayers(load, capacity) {
  const safeCapacity = Math.max(1, Number(capacity) || 0);
  const currentLoad = Math.max(0, Number(load) || 0);
  const encumbered = currentLoad > safeCapacity;
  const heavy = currentLoad >= safeCapacity * 3;
  const overloaded = currentLoad > safeCapacity * 4;

  return {
    state: overloaded
      ? "overloaded"
      : heavy
        ? "heavy"
        : encumbered
          ? "encumbered"
          : "safe",
    safe: (encumbered
      ? 100
      : clamp((currentLoad / safeCapacity) * 100, 0, 100)
    ).toFixed(2),
    caution: (encumbered
      ? heavy
        ? 100
        : clamp(
            ((currentLoad - safeCapacity) / (safeCapacity * 2)) * 100,
            0,
            100,
          )
      : 0
    ).toFixed(2),
    danger: (heavy
      ? overloaded
        ? 100
        : clamp(((currentLoad - safeCapacity * 3) / safeCapacity) * 100, 0, 100)
      : 0
    ).toFixed(2),
  };
}

function encumbranceMeterMarkup(load, capacity) {
  const layers = encumbranceMeterLayers(load, capacity);
  return `<div class="encumbrance-meter ${esc(layers.state)}" aria-hidden="true">
    <span class="encumbrance-meter-layer safe" style="width: ${layers.safe}%"></span>
    <span class="encumbrance-meter-layer caution" style="width: ${layers.caution}%"></span>
    <span class="encumbrance-meter-layer danger" style="width: ${layers.danger}%"></span>
  </div>`;
}

function encumbranceLoadCard({
  label,
  load,
  value,
  capacity,
  status,
  help,
  className,
}) {
  return `<div class="encumbrance-load-card ${esc(className)}">
    <div class="encumbrance-load-card-heading">
      <span>${esc(label)}</span>
      <strong>${esc(value)}</strong>
    </div>
    ${encumbranceMeterMarkup(load, capacity)}
    <div class="encumbrance-load-card-footer">
      <span>${esc(help)}</span>
      <strong>${esc(status)}</strong>
    </div>
  </div>`;
}

function encumbranceDetailCard(label, value, className = "") {
  return `<div class="encumbrance-detail-card ${esc(className)}"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function encumbranceThresholdCard(label, value, className) {
  return `<div class="encumbrance-threshold-card ${esc(className)}">
    <span>${esc(label)}</span>
    <strong>${esc(value)}</strong>
  </div>`;
}

function renderEncumbrance() {
  const info = calculateEncumbrance(character);
  const combatInfo = calculateEncumbrance(character, { combat: true });
  const passiveEffects = passiveEffectSummaryItems("inventory");
  const warning =
    encumbranceWarningText(combatInfo) || encumbranceWarningText(info);

  els.encumbranceSummaryPill.textContent = combatInfo.overloaded
    ? "Overloaded"
    : combatInfo.encumbered
      ? `Combat ${encumbranceText(combatInfo)}`
      : info.encumbered
        ? `Normal ${encumbranceText(info)}`
        : "No encumbrance";
  els.encumbranceDetails.innerHTML = `
    <div class="encumbrance-load-summary">
      ${encumbranceLoadCard({
        label: "Current Load",
        load: info.normalLoad,
        value: formatWeightPounds(info.normalLoad),
        capacity: info.carryingCapacity,
        status: encumbranceText(info),
        help: `Capacity ${formatWeightPounds(info.carryingCapacity)}`,
        className: encumbranceStatusClass(info),
      })}
      ${encumbranceLoadCard({
        label: "Combat Load",
        load: combatInfo.combatLoad,
        value: formatWeightPounds(combatInfo.combatLoad),
        capacity: combatInfo.carryingCapacity,
        status: encumbranceText(combatInfo),
        help: "After dropped pack/container load",
        className: encumbranceStatusClass(combatInfo),
      })}
    </div>
    <div class="encumbrance-threshold-grid" aria-label="Encumbrance thresholds">
      ${encumbranceThresholdCard("Effective Strength", info.effectiveStrength, "strength")}
      ${encumbranceThresholdCard("Encumbered", formatWeightPounds(info.carryingCapacity), "encumbered")}
      ${encumbranceThresholdCard("Heavy Overload", formatWeightPounds(info.carryingCapacity * 3), "heavy")}
      ${encumbranceThresholdCard("Maximum", formatWeightPounds(info.carryingCapacity * 4), "maximum")}
    </div>
    ${
      passiveEffects.length
        ? `<div class="encumbrance-reference-grid">
      ${encumbranceDetailCard("Passive Effects", passiveEffects.join("; "), "wide")}
    </div>`
        : ""
    }`;
  els.encumbranceWarning.textContent = warning;
  els.encumbranceWarning.classList.toggle("hidden", !warning);
}

function renderCharacterSummary() {
  els.characterSummaryName.textContent = character.name;
  els.characterDossierSubtitle.textContent = characterDossierSubtitleText();
  els.characterSourceBadge.textContent = sourceLabel();
  els.characterSourceBadge.classList.toggle(
    "unsaved-draft",
    isUnsavedCharacterDraft(),
  );
  els.characterBasicsList.innerHTML = "";

  const powerPoints = powerPointResource();
  els.characterStatusStrip.innerHTML = [
    statusPipMarkup(
      "Wounds",
      `${character.damage?.wounds ?? 0} / ${character.damage?.maxWounds ?? 3}`,
    ),
    statusPipMarkup(
      "Fatigue",
      `${character.damage?.fatigue ?? 0} / ${character.damage?.maxFatigue ?? 2}`,
    ),
    statusPipMarkup(
      "Bennies",
      `${character.bennies?.current ?? 0} / ${character.bennies?.starting ?? 0}`,
    ),
    statusPipMarkup("Conviction", character.conviction ?? 0),
    powerPoints
      ? statusPipMarkup(
          "Power Points",
          `${powerPoints.current} / ${powerPoints.max}`,
        )
      : "",
    characterHasLiquidCourage(character)
      ? `<button class="status-pip status-pip-action${character.conditions?.liquidCourage ? " active" : ""}" type="button" data-toggle-liquid-courage><span>Liquid Courage</span><strong>${character.conditions?.liquidCourage ? "Active" : "Off"}</strong><small>Stiff drink</small></button>`
      : "",
  ]
    .filter(Boolean)
    .join("");
  els.characterStatusStrip
    .querySelector("[data-toggle-liquid-courage]")
    ?.addEventListener("click", () => {
      character.conditions.liquidCourage =
        !character.conditions.liquidCourage;
      render();
      save();
    });
  els.addManualPowerPointsBtn?.classList.toggle("hidden", Boolean(powerPoints));

  const attributeEntries = sortedAttributeEntries();
  els.attributesList.innerHTML = attributeEntries.length
    ? attributeEntries
        .map(([name, die]) => attributeCardMarkup(name, die))
        .join("")
    : emptyState("No attributes recorded.");

  const skills = sortedSkills();
  els.skillsList.innerHTML = skills.length
    ? skills.map(skillChipMarkup).join("")
    : emptyState("No skills recorded.");

  const unskilledSkills = setupSkillCatalogEntries().filter(
    (skill) => skill.isUnskilled,
  );
  els.unskilledSkillsList.innerHTML = unskilledSkills.length
    ? unskilledSkills.map(skillChipMarkup).join("")
    : emptyState("No unskilled skills.");

  const edges = (character.edges || [])
    .filter((edge) => edge.name)
    .map((edge) => ({
      id: edge.id,
      name: edge.name,
      meta: edgeDisplayMeta(edge),
      summary: edge.shortSummary || edge.summary || "",
      note: edge.notes || edge.text || "",
      sourceMeta: sourceMeta(edge),
    }));
  els.edgesList.innerHTML = edges.length
    ? edges.map((edge) => tagCardMarkup(edge, "edge")).join("")
    : emptyState("No Edges added yet.");

  const hindrances = (character.hindrances || [])
    .filter((hindrance) => hindrance.name)
    .map((hindrance) => ({
      id: hindrance.id,
      name: hindrance.name,
      meta: hindranceDisplayMeta(hindrance),
      summary: hindrance.shortSummary || hindrance.summary || "",
      note: hindrance.notes || hindrance.text || "",
      sourceMeta: sourceMeta(hindrance),
    }));
  els.hindrancesList.innerHTML = hindrances.length
    ? hindrances
        .map((hindrance) => tagCardMarkup(hindrance, "hindrance"))
        .join("")
    : emptyState("No Hindrances added yet.");

  els.characterDerivedDetails.innerHTML = [
    [
      "Pace",
      character.derived.pace,
      [
        `Base ${compactText(character.derived.basePace)}`,
        character.derived.effectPaceModifier
          ? `Effects ${character.derived.effectPaceModifier > 0 ? "+" : ""}${character.derived.effectPaceModifier}`
          : "",
      ]
        .filter(Boolean)
        .join(" + "),
    ],
    [
      "Parry",
      character.derived.parry,
      [
        character.derived.baseParry !== undefined
          ? `Base ${compactText(character.derived.baseParry)}`
          : "",
        character.derived.effectParryModifier
          ? `Effects ${character.derived.effectParryModifier > 0 ? "+" : ""}${character.derived.effectParryModifier}`
          : "",
        character.derived.effectParryPendingModifier
          ? "Recorded total; passive Parry effect shown below"
          : "",
      ]
        .filter(Boolean)
        .join(" + "),
    ],
    [
      "Toughness",
      character.derived.toughness,
      [
        `Base ${compactText(character.derived.baseToughness)}`,
        character.derived.effectToughnessModifier
          ? `Effects ${character.derived.effectToughnessModifier > 0 ? "+" : ""}${character.derived.effectToughnessModifier}`
          : "",
        character.derived.effectToughnessPendingModifier
          ? "Recorded total; passive Toughness effect shown below"
          : "",
        `Armor ${compactText(character.derived.armor, "0")}`,
      ]
        .filter(Boolean)
        .join(" + "),
    ],
    ["Size", character.derived.size ?? character.size, ""],
    ["Armor", `+${compactText(character.derived.armor, "0")}`, "Best equipped"],
  ]
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");
  els.characterDerivedDetails.insertAdjacentHTML(
    "beforeend",
    passiveEffectDerivedCards("character"),
  );

  const background = character.arcaneBackground;
  const arcaneSnapshotRows = background
    ? [
        ["Background", background.name || background.edgeName],
        ["Edge", background.edgeName],
        [
          "Arcane Skill",
          background.arcaneSkill
            ? `${background.arcaneSkill}${background.linkedAttribute ? ` (${background.linkedAttribute})` : ""}`
            : "",
        ],
        powerPoints
          ? ["Power Points", `${powerPoints.current} / ${powerPoints.max}`]
          : null,
        ["Known Powers", character.powers.length],
      ]
        .filter(Boolean)
    : powerPoints
      ? [
          ["Background", "Manual Power Points"],
          ["Power Points", `${powerPoints.current} / ${powerPoints.max}`],
          ["Known Powers", character.powers.length],
          ["Notes", powerPoints.note || "Manual post-import setup"],
        ]
      : [];
  els.characterArcaneSummary.innerHTML = arcaneSnapshotRows.length
    ? `<div class="arcane-snapshot-grid">${arcaneSnapshotRows
        .map(
          ([label, value]) =>
            `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
        )
        .join("")}</div>`
    : emptyState("No Arcane Background or Power Points configured.");

  els.characterEquippedSummary.innerHTML = `<div class="equipment-group"><h3>Weapons</h3>${equippedWeaponSummaryMarkup()}</div><div class="equipment-group"><h3>Armor</h3>${equippedArmorSummaryMarkup()}</div><div class="equipment-line secondary cash-summary"><strong>Cash</strong><span>${money(character.moneyCents)}</span></div>`;
  els.characterBackgroundSummary.innerHTML = characterNotesSummaryMarkup();
}

function sortedAdvances() {
  return [...(character.advances || [])].sort(
    (left, right) =>
      Number(left.advanceNumber ?? left.number) -
        Number(right.advanceNumber ?? right.number) ||
      String(left.createdAt || left.dateAdded || "").localeCompare(
        String(right.createdAt || right.dateAdded || ""),
      ),
  );
}

function nextAdvanceNumber() {
  return (
    Math.max(
      0,
      ...(character.advances || []).map(
        (advance) => Number(advance.advanceNumber ?? advance.number) || 0,
      ),
    ) + 1
  );
}

function advanceCardMarkup(advance) {
  const warnings = advanceWarnings(character, advance, advance.id);
  const number = advance.advanceNumber ?? advance.number;
  const status = advance.applied
    ? `Applied${advance.appliedAt ? ` ${advance.appliedAt}` : ""}`
    : "History only";
  const target = [
    advance.targetType ? displayNameFromKey(advance.targetType) : "",
    advance.targetName,
  ]
    .filter(Boolean)
    .join(": ");
  const source = [advance.source, advance.createdAt || advance.dateAdded]
    .filter(Boolean)
    .join(" • ");
  return tagCardMarkup(
    {
      id: advance.id,
      name: `Advance #${number}`,
      meta: [
        advance.rankAtTime || advance.rank,
        canonicalAdvanceTypeLabel(advance.type),
      ]
        .filter(Boolean)
        .join(" • "),
      summary: advanceDisplaySummary(advance),
      note: [
        status,
        target ? `Target: ${target}` : "",
        advance.notes,
        warnings.length ? `Warning: ${warnings.join(" ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      sourceMeta: source,
    },
    "advancement",
  );
}

function renderAdvancement() {
  const summary = getCharacterAdvanceSummary(character);
  els.advanceSummaryList.innerHTML = [
    ["Current Rank", summary.derivedRank, "Based on recorded advances"],
    ["Recorded Rank", summary.recordedRank, "Character sheet value"],
    ["Total Advances", summary.count, "History entries"],
    [
      "Next Advance",
      nextAdvanceNumber(),
      rankForAdvanceNumber(nextAdvanceNumber()),
    ],
  ]
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");

  const warnings = [];
  if (summary.rankMismatch) {
    warnings.push(
      `Character rank is ${summary.recordedRank}, but ${summary.count} recorded advances derive ${summary.derivedRank}.`,
    );
  }
  const duplicateNumbers = new Set();
  const seenNumbers = new Set();
  (character.advances || []).forEach((advance) => {
    const number = Number(advance.advanceNumber ?? advance.number);
    if (!number) return;
    if (seenNumbers.has(number)) duplicateNumbers.add(number);
    seenNumbers.add(number);
  });
  duplicateNumbers.forEach((number) =>
    warnings.push(`Advance #${number} appears more than once.`),
  );
  els.advanceWarningList.innerHTML = warnings.length
    ? warnings
        .map((warning) => `<p class="entry-warning">${esc(warning)}</p>`)
        .join("")
    : "";

  const advances = sortedAdvances();
  els.advancesList.innerHTML = advances.length
    ? advances.map(advanceCardMarkup).join("")
    : emptyState("No advances recorded yet.");
}

function renderKeyConditions() {
  const keys = [
    "shaken",
    "distracted",
    "vulnerable",
    "stunned",
    "prone",
    "bound",
    "entangled",
    "aiming",
    "defending",
    "theDrop",
    "onHold",
    "wildAttack",
  ].filter((key) => key in character.conditions);
  if (characterHasLiquidCourage(character)) keys.push("liquidCourage");
  els.keyConditionsList.innerHTML = "";
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = `condition${character.conditions[key] ? " active" : ""}`;
    const labelText =
      key === "liquidCourage" ? "Stiff Drink" : displayNameFromKey(key);
    label.innerHTML = `<input type="checkbox" ${character.conditions[key] ? "checked" : ""}><span>${esc(labelText)}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.keyConditionsList.appendChild(label);
  });
}

function renderPlaySummary() {
  renderCombatWeapons();
  renderCombatStatusResources();
  renderCombatPowerPoints();

  const activeResources = character.resources.filter(
    (resource) =>
      resource.id !== "power-points" &&
      (resource.max > 0 || resource.current > 0),
  );
  els.playResourcesCard.classList.toggle("hidden", !activeResources.length);
  renderResourceControls(els.playResourcesList, activeResources);

  const showPowers = character.powers.length > 0;
  els.playActivePowersCard.classList.toggle("hidden", !showPowers);
  if (showPowers) renderCombatPowers();

  renderCombatConsumables();
}
