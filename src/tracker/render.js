const CHARACTER_SETUP_STEPS = [
  { id: "concept", label: "Concept" },
  { id: "ancestry", label: "Race / Ancestry" },
  { id: "hindrances", label: "Hindrances" },
  { id: "attributesSkills", label: "Traits" },
  { id: "edges", label: "Edges" },
  { id: "powers", label: "Powers" },
  { id: "gear", label: "Gear" },
  { id: "review", label: "Review" },
];
var characterSetupStep = "concept";
var characterSetupReviewOpen = false;

function characterSetupReviewMode() {
  return character?.setupStatus === "needsReview" || characterSetupReviewOpen;
}

function renderCharacterTabMode() {
  const setupMode = characterSetupReviewMode();
  const confirmedSheetMode =
    character?.setupStatus === "complete" && !characterSetupReviewOpen;
  els.characterSetupPanel?.classList.toggle("hidden", !setupMode);
  els.reviewSetupBtn?.classList.toggle("hidden", setupMode);
  els.manageCharacterBtn?.classList.toggle("hidden", false);
  els.addManualPowerPointsBtn?.classList.toggle(
    "hidden",
    confirmedSheetMode || Boolean(powerPointResource()),
  );
  [
    els.showAdvanceFormBtn,
    els.showEdgeFormBtn,
    els.showHindranceFormBtn,
  ].forEach((button) => button?.classList.toggle("hidden", confirmedSheetMode));
  [
    els.advanceEditorPanel,
    els.edgeEditorPanel,
    els.hindranceEditorPanel,
  ].forEach((panel) => {
    if (confirmedSheetMode) panel?.classList.add("hidden");
  });
}

function characterIdentitySubtitle(separator = " ") {
  return [character.rank, character.ancestry, character.archetype]
    .filter(Boolean)
    .join(separator);
}

function renderCharacterIdentityDisplays() {
  els.characterName.textContent = character.name;
  els.characterSubtitle.textContent = characterIdentitySubtitle(" ");
  if (els.characterSummaryName)
    els.characterSummaryName.textContent = character.name;
  if (els.characterDossierSubtitle)
    els.characterDossierSubtitle.textContent = characterIdentitySubtitle(" • ");
}

function render() {
  renderCharacterIdentityDisplays();
  els.woundsValue.textContent = character.damage.wounds;
  const woundPenalty = Math.min(
    character.damage.wounds,
    character.damage.maxWounds,
  );
  els.woundPenalty.textContent = woundPenalty ? `Penalty -${woundPenalty}` : "";
  els.woundPenalty.classList.toggle("hidden", !woundPenalty);
  els.woundsNote.textContent = character.damage.wounds
    ? "Apply wound penalty to affected trait rolls."
    : "Healthy";
  els.fatigueValue.textContent = character.damage.fatigue;
  const fatiguePenalty = Math.min(
    character.damage.fatigue,
    character.damage.maxFatigue,
  );
  els.fatiguePenalty.textContent = fatiguePenalty
    ? `Penalty -${fatiguePenalty}`
    : "";
  els.fatiguePenalty.classList.toggle("hidden", !fatiguePenalty);
  els.fatigueNote.textContent = character.damage.fatigue
    ? "Apply fatigue penalty to affected trait rolls."
    : "Fresh";
  els.benniesValue.textContent = character.bennies.current;
  els.bennyStart.textContent = `Start ${character.bennies.starting}`;
  els.convictionValue.textContent = character.conviction;

  const location = "best";
  character.selectedArmorLocation = "best";
  const armor = armorValue(location);
  character.derived.armor = armor;
  character.derived.toughness =
    (Number(character.derived.baseToughness) || 0) + armor;
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
  els.armorStrengthPill.textContent = `Strength ${character.armorStrength}`;
  els.weaponStrengthPill.textContent = `Strength ${character.weaponStrength}`;
  els.moneyDisplay.textContent = money(character.moneyCents);

  renderCharacterSummary();
  renderCharacterSetup();
  renderCharacterTabMode();
  renderCatalogBrowser();
  renderAdvancement();
  renderArmor();
  renderWeapons();
  renderAmmo();
  renderResources();
  renderPowers();
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
  renderSettingsSummary();
  renderCharacterLibrary();

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

function settingsDetail(label, value) {
  return `<div><span>${esc(label)}</span><strong>${esc(value || "—")}</strong></div>`;
}

function renderSettingsSummary() {
  if (!els.settingsAppDetails) return;
  const powerPoints = powerPointResource();
  const isDemoMode = storageAdapter.readFlag(DEMO_MODE_KEY);
  const hasDraft = storageAdapter.has(CREATION_KEY);
  const hasTrackerSave = storageAdapter.has(STORAGE_KEY);
  const source = sourceLabel();

  els.settingsDemoLink.href = DEMO_URL;
  els.settingsStatusBadges.innerHTML = [
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

  els.settingsAppDetails.innerHTML = [
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
    ["Hosted Demo", DEMO_URL],
  ]
    .map(([label, value]) => settingsDetail(label, value))
    .join("");

  els.settingsStorageDetails.innerHTML = [
    [
      "Tracker Save",
      isUnsavedCharacterDraft()
        ? "Draft not saved"
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
    ["Demo Mode", isDemoMode ? "On" : "Off"],
    [
      "Export Reminder",
      hasTrackerSave
        ? "Use full backup before clearing local data"
        : "Load, import, or create a character first",
    ],
  ]
    .map(([label, value]) => settingsDetail(label, value))
    .join("");
}

function characterSetupStatus(stepId) {
  if (stepId === "concept") {
    return character.name && character.archetype ? "Complete" : "Incomplete";
  }
  if (stepId === "ancestry") {
    return isHumanAncestry(character.ancestry) ? "Complete" : "Needs review";
  }
  if (stepId === "hindrances") {
    const stats = hindrancePointStats();
    const spending = setupHindranceBenefitSpending(stats);
    if (!stats.count) return "Incomplete";
    if (stats.unknownCount || spending.spent > spending.available)
      return "Needs review";
    return "Complete";
  }
  if (stepId === "attributesSkills") {
    if (!ATTRIBUTE_ORDER.every((key) => character.attributes?.[key]))
      return "Incomplete";
    if (!setupTraitsEditable()) return "Complete";
    const attributes = setupAttributePointStats();
    const skills = setupSkillPointStats();
    if (
      attributes.spent > attributes.available ||
      skills.spent > skills.available
    )
      return "Needs review";
    return attributes.spent === attributes.available &&
      skills.spent === skills.available
      ? "Complete"
      : "Incomplete";
  }
  if (stepId === "edges") {
    return setupEdgeSelectionStatus();
  }
  if (stepId === "powers") {
    const { arcaneEdges, arcaneConfig, powerPoints, powers } =
      setupPowerAuditContext();
    const hasArcaneSignal =
      arcaneEdges.length || arcaneConfig || powerPoints || powers.length;
    if (!hasArcaneSignal) return "Not applicable";
    if (!arcaneConfig && (powerPoints || powers.length)) return "Needs review";
    if (arcaneEdges.length > 1) return "Needs review";
    if (!powerPoints) return "Needs review";
    return powers.length ? "Complete" : "Incomplete";
  }
  if (stepId === "gear") {
    const counts = setupGearAuditCounts();
    return counts.totalItems || counts.moneyCents ? "Complete" : "Incomplete";
  }
  if (stepId === "review") return "Needs review";
  return "Planned";
}

function setupStatusMarkup(status) {
  const className = slugify(status);
  return `<span class="setup-status ${className}">${esc(status)}</span>`;
}

function setupDetail(label, value) {
  return `<div class="setup-detail"><span>${esc(label)}</span><strong>${esc(value || "—")}</strong></div>`;
}

function setupPowerAuditContext() {
  const arcaneEdges = (character.edges || []).filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const edgeConfig = arcaneEdges
    .map((edge) => arcaneBackgroundConfigFromEdge(edge.name))
    .find(Boolean);
  const stateConfig = arcaneBackgroundConfigFromEdge(
    character.arcaneBackground?.edgeName ||
      character.arcaneBackground?.name ||
      "",
  );
  return {
    arcaneEdges,
    arcaneConfig: stateConfig || edgeConfig || null,
    powerPoints: powerPointResource(),
    powers: [...(character.powers || [])].filter((power) => power.name),
  };
}

function setupGearAuditCounts() {
  const ammoPools = Object.values(character.ammo || {}).filter(
    (ammo) => Number(ammo?.count) > 0,
  );
  const vehicles = (character.vehicles || []).filter(
    (vehicle) => Number(vehicle?.count ?? 1) > 0,
  );
  const counts = {
    moneyCents: Math.max(0, Number(character.moneyCents) || 0),
    weapons: (character.weapons || []).filter((weapon) => weapon.name).length,
    armor: (character.armorInventory || []).filter(
      (armor) => Number(armor?.count ?? 1) > 0,
    ).length,
    inventory: (character.inventory || []).filter(
      (item) => Number(item?.count ?? 1) > 0,
    ).length,
    consumables: (character.consumables || []).filter(
      (item) => Number(item?.count ?? 1) > 0,
    ).length,
    ammo: ammoPools.length,
    vehicles: vehicles.length,
  };
  counts.totalItems =
    counts.weapons +
    counts.armor +
    counts.inventory +
    counts.consumables +
    counts.ammo +
    counts.vehicles;
  return counts;
}

function setupCharacterIsCreated() {
  return String(character.source || "").toLowerCase() === "created";
}

function setupTraitsEditable() {
  return setupCharacterIsCreated() && !(character.advances || []).length;
}

const SETUP_HINDRANCE_BENEFITS = [
  {
    key: "extraAttributeRaisesFromHindrances",
    label: "Attribute Raise",
    pluralLabel: "Attribute Raises",
    cost: 2,
    effect: "+1 Attribute point",
  },
  {
    key: "extraEdgesFromHindrances",
    label: "Edge",
    pluralLabel: "Edges",
    cost: 2,
    effect: "+1 starting Edge slot",
  },
  {
    key: "extraSkillPointsFromHindrances",
    label: "Skill Point",
    pluralLabel: "Skill Points",
    cost: 1,
    effect: "+1 Skill point",
  },
  {
    key: "extraMoneyFromHindrances",
    label: "Money",
    pluralLabel: "Money",
    cost: 1,
    effect: "+$500 starting funds",
  },
];

function setupCreationRules() {
  const creation = character.creation || {};
  return {
    normalAttributePoints: Math.max(
      0,
      Number(creation.normalAttributePointsAvailable) || 5,
    ),
    extraAttributeRaises: Math.max(
      0,
      Number(creation.extraAttributeRaisesFromHindrances) || 0,
    ),
    normalSkillPoints: Math.max(
      0,
      Number(creation.normalSkillPointsAvailable) || 12,
    ),
    extraSkillPoints: Math.max(
      0,
      Number(creation.extraSkillPointsFromHindrances) || 0,
    ),
  };
}

function setupCreationBenefitValue(key) {
  return Math.max(0, Number(character.creation?.[key]) || 0);
}

function setupHindranceBenefitSpending(stats = hindrancePointStats()) {
  const items = SETUP_HINDRANCE_BENEFITS.map((definition) => {
    const count = setupCreationBenefitValue(definition.key);
    return {
      ...definition,
      count,
      spent: count * definition.cost,
    };
  });
  const spent = items.reduce((sum, item) => sum + item.spent, 0);
  const available = stats.benefitPoints;
  return {
    items,
    spent,
    available,
    remaining: available - spent,
  };
}

function setupHindranceBenefitItem(key) {
  return SETUP_HINDRANCE_BENEFITS.find((item) => item.key === key) || null;
}

function setupAttributePointStats() {
  const rules = setupCreationRules();
  const spent = ATTRIBUTE_ORDER.reduce(
    (sum, key) =>
      sum + Math.max(0, getDieStepIndex(character.attributes?.[key])),
    0,
  );
  const available = rules.normalAttributePoints + rules.extraAttributeRaises;
  return {
    ...rules,
    spent,
    available,
    remaining: available - spent,
  };
}

function setupSkillIsCoreName(name) {
  return [
    "Athletics",
    "Common Knowledge",
    "Notice",
    "Persuasion",
    "Stealth",
  ].includes(skillReferenceName(name));
}

function setupSkillPointCost(skill) {
  const skillIndex = getDieStepIndex(skill?.die || skill?.value);
  if (skillIndex < 0) return 0;
  const linkedAttribute = setupSkillAttributeKey(skillLinkedAttribute(skill));
  const attributeIndex = Math.max(
    0,
    getDieStepIndex(character.attributes?.[linkedAttribute] || "d4"),
  );
  const baseIndex = skill?.core || setupSkillIsCoreName(skill?.name) ? 0 : -1;
  let cost = 0;
  for (let index = baseIndex + 1; index <= skillIndex; index += 1)
    cost += index > attributeIndex ? 2 : 1;
  return Math.max(0, cost);
}

function setupSkillPointStats() {
  const rules = setupCreationRules();
  const spent = (character.skills || []).reduce(
    (sum, skill) => sum + setupSkillPointCost(skill),
    0,
  );
  const available = rules.normalSkillPoints + rules.extraSkillPoints;
  return {
    ...rules,
    spent,
    available,
    remaining: available - spent,
  };
}

function sortedAttributeEntries() {
  return Object.entries(character.attributes || {}).sort(([left], [right]) => {
    const leftIndex = ATTRIBUTE_ORDER.indexOf(left);
    const rightIndex = ATTRIBUTE_ORDER.indexOf(right);
    return (
      (leftIndex < 0 ? 99 : leftIndex) - (rightIndex < 0 ? 99 : rightIndex) ||
      displayNameFromKey(left).localeCompare(displayNameFromKey(right))
    );
  });
}

function sortedSkills() {
  return [...(character.skills || [])].sort((left, right) =>
    String(left.name || "").localeCompare(String(right.name || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function setupSkillAttributeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function setupSkillCatalogEntries() {
  const recordedSkills = sortedSkills();
  const usedRecordedIndexes = new Set();
  const entries = Object.entries(SKILL_LINKED_ATTRIBUTES).map(
    ([name, linkedAttribute]) => {
      const recordedIndex = recordedSkills.findIndex(
        (skill, index) =>
          !usedRecordedIndexes.has(index) &&
          (skill.name === name || skillReferenceName(skill.name) === name),
      );

      if (recordedIndex >= 0) {
        usedRecordedIndexes.add(recordedIndex);
        const recorded = recordedSkills[recordedIndex];
        return {
          ...recorded,
          name: recorded.name || name,
          linkedAttribute: recorded.linkedAttribute || linkedAttribute,
          isUnskilled: false,
        };
      }

      return {
        name,
        die: "d4-2",
        linkedAttribute,
        isUnskilled: true,
      };
    },
  );

  recordedSkills.forEach((skill, index) => {
    if (usedRecordedIndexes.has(index) || !skill.name) return;
    entries.push({
      ...skill,
      linkedAttribute:
        skillLinkedAttribute(skill) || skill.linkedAttribute || "Custom",
      isUnskilled: false,
    });
  });

  return entries;
}

function edgeCatalogEntry(edge) {
  const edgeId = String(edge?.id || "");
  const catalogId =
    edge?.catalogId || (edgeId.startsWith("dl-edge-") ? edgeId : "");
  const catalog = catalogId
    ? EDGE_CATALOG.find((item) => item.id === catalogId)
    : null;
  if (catalog) return catalog;

  const text = plainEntryName(edge?.name);
  if (!text) return null;
  return (
    EDGE_CATALOG.find((item) => plainEntryName(item.name) === text) || null
  );
}

function edgeMatchedAdvance(edge) {
  const edgeName = plainEntryName(edge?.name);
  if (!edgeName) return null;
  return (character.advances || []).find((advance) => {
    const advanceText = plainEntryName(
      [
        canonicalAdvanceTypeLabel(advance.type),
        advance.type,
        advance.label,
        advance.name,
        advance.targetName,
        advance.summary,
        advance.description,
        advance.notes,
      ].join(" "),
    );
    return advanceText.includes("edge") && advanceText.includes(edgeName);
  });
}

function setupEdgeCreationSource(edge) {
  const explicit = plainEntryName(edge?.creationSource);
  if (explicit === "human free edge" || explicit === "human-free-edge")
    return "human-free-edge";
  if (
    explicit === "hindrance benefit edge" ||
    explicit === "hindrance-benefit" ||
    explicit === "hindrance purchased edge"
  )
    return "hindrance-benefit";

  const source = plainEntryName(edge?.source);
  if (source === "human free edge") return "human-free-edge";
  if (
    source === "hindrance benefit edge" ||
    source === "hindrance purchased edge"
  )
    return "hindrance-benefit";
  return "";
}

function setupHumanFreeEdges() {
  return (character.edges || []).filter(
    (edge) => setupEdgeCreationSource(edge) === "human-free-edge",
  );
}

function setupExpectedHumanFreeEdges() {
  return isHumanAncestry(character.ancestry) ? 1 : 0;
}

function setupHindranceBenefitEdges() {
  return (character.edges || []).filter(
    (edge) => setupEdgeCreationSource(edge) === "hindrance-benefit",
  );
}

function setupEdgeSelectionStatus() {
  const edges = character.edges || [];
  const arcaneEdgeCount = edges.filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  ).length;
  if (!setupTraitsEditable()) {
    if (!edges.length) return "Incomplete";
    return arcaneEdgeCount > 1 ? "Needs review" : "Complete";
  }
  const expectedHumanEdges = setupExpectedHumanFreeEdges();
  const humanEdges = setupHumanFreeEdges().length;
  const hindranceEdgeSlots = setupCreationBenefitValue(
    "extraEdgesFromHindrances",
  );
  const hindranceEdges = setupHindranceBenefitEdges().length;

  if (arcaneEdgeCount > 1 || humanEdges > expectedHumanEdges)
    return "Needs review";
  if (hindranceEdges > hindranceEdgeSlots) return "Needs review";
  if (humanEdges < expectedHumanEdges) return "Incomplete";
  if (hindranceEdges < hindranceEdgeSlots) return "Incomplete";
  return edges.length ? "Complete" : "Incomplete";
}

function edgeLikelySource(edge) {
  const creationSource = setupEdgeCreationSource(edge);
  if (creationSource === "human-free-edge") return "Human free Edge";
  if (creationSource === "hindrance-benefit") return "Hindrance benefit Edge";

  const source = plainEntryName(edge?.source);
  const importNote = plainEntryName(edge?.importNote);

  if (source === "human free edge") return "Human free Edge";
  if (source === "hindrance purchased edge") return "Hindrance benefit Edge";
  if (source === "later advance") return "Advance Edge";
  if (importNote === "advance" || edgeMatchedAdvance(edge))
    return "Imported Advance Edge";
  if (importNote === "selected") return "Imported selected Edge";
  if (edge?.source && edge.source !== "Manual")
    return "Imported / source unknown";
  return "Manual / source unknown";
}

function setupEdgeBadge(label, tone = "") {
  return `<span class="setup-edge-badge${tone ? ` ${esc(tone)}` : ""}">${esc(label)}</span>`;
}

function setupEdgeAuditCard(edge) {
  const catalog = edgeCatalogEntry(edge);
  const arcaneConfig = arcaneBackgroundConfigFromEdge(edge.name);
  const likelySource = edgeLikelySource(edge);
  const matchedAdvance = edgeMatchedAdvance(edge);
  const category = catalog?.category || edge.category || "Unknown";
  const rank = catalog?.rank || edge.rank || "Unknown";
  const requirements = catalog?.requirements || edge.requirements || "";
  const summary =
    catalog?.shortSummary || edge.shortSummary || edge.notes || "";
  const removable =
    setupTraitsEditable() &&
    ["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    );
  const source = [
    edge.source,
    edge.importNote ? `Import: ${edge.importNote}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  const badges = [
    setupEdgeBadge(
      likelySource,
      likelySource.includes("unknown") ? "muted" : "",
    ),
    catalog
      ? setupEdgeBadge("Catalog matched", "good")
      : setupEdgeBadge("No catalog match", "warning"),
    arcaneConfig ? setupEdgeBadge("Arcane Background", "arcane") : "",
    category && category !== "Unknown" ? setupEdgeBadge(category) : "",
    rank && rank !== "Unknown" ? setupEdgeBadge(rank) : "",
  ]
    .filter(Boolean)
    .join("");
  const advisories = [
    !catalog
      ? "Catalog match not found; imported or custom text is preserved for review."
      : "",
    likelySource.includes("unknown")
      ? "Creation source is not explicit. Treat this as an audit hint, not validation."
      : "",
    matchedAdvance
      ? `Matched recorded Advance #${matchedAdvance.advanceNumber || matchedAdvance.number || "?"}.`
      : "",
    arcaneConfig
      ? `${arcaneConfig.displayName} uses ${arcaneConfig.arcaneSkill} and starts with ${arcaneConfig.startingPowerPoints} Power Points.`
      : "",
  ].filter(Boolean);

  return `<article class="setup-edge-card${arcaneConfig ? " arcane" : ""}">
    <div class="setup-edge-card-head">
      <div>
        <h4>${esc(edge.name || "Unnamed Edge")}</h4>
        ${source ? `<p>${esc(source)}</p>` : ""}
      </div>
      <div class="setup-edge-badges">
        ${badges}
        ${
          removable
            ? `<button class="ghost tag-action danger-lite" type="button" data-setup-action="removeSetupEdge" data-edge-id="${esc(edge.id)}">Remove</button>`
            : ""
        }
      </div>
    </div>
    <div class="setup-edge-details">
      ${setupDetail("Category", category)}
      ${setupDetail("Rank", rank)}
      ${setupDetail("Requirements", requirements || "None recorded")}
      ${setupDetail("Likely Source", likelySource)}
    </div>
    ${summary ? `<p class="setup-edge-summary">${esc(summary)}</p>` : ""}
    ${
      advisories.length
        ? `<div class="setup-edge-advisories">${advisories
            .map((item) => `<p>${esc(item)}</p>`)
            .join("")}</div>`
        : ""
    }
  </article>`;
}

function isHumanAncestry(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase() === "human"
  );
}

function hindrancePointValue(hindrance) {
  if (hindrance?.severity === "Major") return 2;
  if (hindrance?.severity === "Minor") return 1;
  return 0;
}

function hindrancePointStats() {
  const hindrances = character.hindrances || [];
  const total = hindrances.reduce(
    (sum, hindrance) => sum + hindrancePointValue(hindrance),
    0,
  );
  return {
    count: hindrances.length,
    total,
    benefitCap: 4,
    benefitPoints: Math.min(total, 4),
    overCap: total > 4,
    unknownCount: hindrances.filter(
      (hindrance) => !["Minor", "Major"].includes(hindrance?.severity),
    ).length,
  };
}

function hindrancePointText(hindrance) {
  const value = hindrancePointValue(hindrance);
  return value ? `${value} point${value === 1 ? "" : "s"}` : "Unknown points";
}

function renderSetupHindranceBenefitRows(stats) {
  const spending = setupHindranceBenefitSpending(stats);
  const canEdit = setupTraitsEditable();
  const overSpent = spending.spent > spending.available;
  return `<section class="setup-trait-group setup-benefit-spending" aria-labelledby="setupHindranceBenefitsHeading">
    <h4 id="setupHindranceBenefitsHeading">Spend Hindrance Benefits</h4>
    <p class="creator-note">Counted Hindrance points may buy Attribute raises, extra Edge slots, Skill points, or extra starting money.</p>
    <div class="setup-trait-editor-list">
      ${spending.items
        .map((item) => {
          const canIncrease =
            canEdit && spending.remaining >= item.cost && !overSpent;
          const canDecrease = canEdit && item.count > 0;
          const label = item.count === 1 ? item.label : item.pluralLabel;
          return `<div class="setup-trait-editor-row">
            <div>
              <strong>${esc(item.pluralLabel)}</strong>
              <span>${esc(item.effect)} - costs ${item.cost} point${item.cost === 1 ? "" : "s"} each</span>
            </div>
            <div class="setup-trait-controls">
              <button type="button" data-setup-action="decHindranceBenefit" data-benefit-key="${esc(item.key)}"${canDecrease ? "" : " disabled"}>-</button>
              <span>${esc(`${item.count} ${label}`)}</span>
              <button type="button" data-setup-action="incHindranceBenefit" data-benefit-key="${esc(item.key)}"${canIncrease ? "" : " disabled"}>+</button>
            </div>
          </div>`;
        })
        .join("")}
    </div>
    ${
      overSpent
        ? `<p class="entry-warning">Needs review: ${spending.spent} Hindrance benefit points are spent, but only ${spending.available} are available.</p>`
        : ""
    }
  </section>`;
}

function renderCharacterSetup() {
  if (!els.characterSetupStepper || !els.characterSetupContent) return;
  if (!CHARACTER_SETUP_STEPS.some((step) => step.id === characterSetupStep))
    characterSetupStep = "concept";

  els.characterSetupStepper.innerHTML = CHARACTER_SETUP_STEPS.map(
    (step, index) => {
      const active = step.id === characterSetupStep;
      const status = characterSetupStatus(step.id);
      return `<button class="setup-step ${active ? "active" : ""}" type="button" data-setup-step="${esc(step.id)}"${active ? ' aria-current="step"' : ""}>
        <span>${index + 1}. ${esc(step.label)}</span>
        ${setupStatusMarkup(status)}
      </button>`;
    },
  ).join("");

  const renderers = {
    concept: renderSetupConcept,
    ancestry: renderSetupAncestry,
    hindrances: renderSetupHindrances,
    attributesSkills: renderSetupTraits,
    edges: renderSetupEdges,
    powers: renderSetupPowers,
    gear: renderSetupGear,
    review: renderSetupReview,
  };

  els.characterSetupContent.innerHTML =
    renderSetupPersistencePanel() +
    (renderers[characterSetupStep]?.() || renderSetupConcept());
}

function renderSetupPersistencePanel() {
  const finishLabel = character.creation?.finalized
    ? "Start Playing"
    : "Finish Setup & Start Playing";
  if (isUnsavedCharacterDraft()) {
    return `<div class="setup-persistence-panel unsaved">
      <div>
        <strong>Unsaved setup draft</strong>
        <p>This character is only temporary until you save it to the local character library. Finish setup saves it and opens Combat.</p>
      </div>
      <div class="creator-actions">
        <button type="button" data-setup-action="saveDraftCharacter">Save Draft</button>
        <button type="button" data-setup-action="confirmSetup">Confirm Setup</button>
        <button type="button" data-setup-action="finishSetup">${finishLabel}</button>
        <button class="ghost danger-lite" type="button" data-setup-action="discardDraftCharacter">Discard Draft</button>
      </div>
    </div>`;
  }

  const active = activeCharacterSlot();
  if (!active) return "";
  return `<div class="setup-persistence-panel">
    <div>
      <strong>${character.creation?.finalized ? "Character ready to play" : "Saved character slot"}</strong>
      <p>${
        character.creation?.finalized
          ? "This setup is marked finished. Use Start Playing to return to Combat."
          : "Changes autosave to this browser. Finish setup marks this character ready and opens Combat."
      }</p>
    </div>
    <div class="creator-actions">
      <button class="ghost" type="button" data-setup-action="saveCharacterNow">Save Now</button>
      <button type="button" data-setup-action="confirmSetup">Confirm Setup</button>
      <button type="button" data-setup-action="finishSetup">${finishLabel}</button>
      <button class="ghost danger-lite" type="button" data-setup-action="deleteCharacterSlot">Delete Character</button>
    </div>
  </div>`;
}

function renderSetupConcept() {
  const status = characterSetupStatus("concept");
  return `<section id="setupConceptPanel" class="setup-step-panel" aria-labelledby="setupConceptHeading">
    <div class="section-title">
      <div>
        <h3 id="setupConceptHeading">Concept</h3>
        <p>Edit the active character's core concept fields. Race and ancestry stay in the Race / Ancestry step.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-form-grid">
      <label>Character name<input id="setupNameInput" data-concept-field="name" value="${esc(character.name)}" autocomplete="off"></label>
      <label>Gender<input id="setupGenderInput" data-concept-field="gender" value="${esc(character.gender || "")}" autocomplete="off" list="setupGenderOptions"></label>
      <label>Age<input id="setupAgeInput" data-concept-field="age" value="${esc(character.age || "")}" autocomplete="off"></label>
      <label>Profession or Title<input id="setupArchetypeInput" data-concept-field="archetype" value="${esc(character.archetype || "")}" autocomplete="off"></label>
      <label>Player name<input id="setupPlayerInput" data-concept-field="player" value="${esc(character.player || "")}" autocomplete="off"></label>
      <label class="setup-wide">Description<textarea id="setupDescriptionInput" data-concept-field="description" rows="5">${esc(character.description || "")}</textarea></label>
      <label class="setup-wide">Background<textarea id="setupBackgroundInput" data-concept-field="background" rows="6">${esc(character.background || "")}</textarea></label>
      <datalist id="setupGenderOptions">
        <option value="Female"></option>
        <option value="Male"></option>
        <option value="Nonbinary"></option>
      </datalist>
    </div>
    <p class="creator-note">${
      isUnsavedCharacterDraft()
        ? "Concept edits update this temporary draft. Use Save Draft when you want to keep it across sessions."
        : "Concept edits update the active tracker character and use the normal local save path."
    }</p>
    <div class="creator-actions">
      <button id="setupSaveConceptBtn" type="button" data-setup-action="saveConcept">Save Concept</button>
    </div>
  </section>`;
}

function renderSetupHindranceRows() {
  return (character.hindrances || []).length
    ? character.hindrances
        .map(
          (hindrance) =>
            `<article class="setup-hindrance-row">
              <div>
                <strong>${esc(hindrance.name || "Unnamed Hindrance")}</strong>
                <span>${esc(hindrance.severity || "Unknown")} • ${esc(hindrancePointText(hindrance))}</span>
                ${hindrance.shortSummary ? `<p>${esc(hindrance.shortSummary)}</p>` : ""}
                ${hindrance.notes ? `<p>${esc(hindrance.notes)}</p>` : ""}
              </div>
              <button class="ghost tag-action danger-lite" type="button" data-setup-action="removeHindrance" data-hindrance-id="${esc(hindrance.id)}">Remove</button>
            </article>`,
        )
        .join("")
    : emptyState("No Hindrances selected yet.");
}

function renderSetupHindrances() {
  const stats = hindrancePointStats();
  const spending = setupHindranceBenefitSpending(stats);
  const status = characterSetupStatus("hindrances");
  return `<section id="setupHindrancesPanel" class="setup-step-panel" aria-labelledby="setupHindrancesHeading">
    <div class="section-title">
      <div>
        <h3 id="setupHindrancesHeading">Hindrances</h3>
        <p>Select starting Hindrances, track their point value, and spend counted benefit points.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Expected Selection", "At least 1 Hindrance")}
      ${setupDetail("Minor Hindrance", "1 point")}
      ${setupDetail("Major Hindrance", "2 points")}
      ${setupDetail("Benefit Point Cap", "4 points")}
      ${setupDetail("Selected Hindrances", `${stats.count}`)}
      ${setupDetail("Total Hindrance Points", `${stats.total}`)}
      ${setupDetail("Benefit Points Counted", `${stats.benefitPoints} / ${stats.benefitCap}`)}
      ${setupDetail("Benefit Points Spent", `${spending.spent} / ${spending.available}`)}
      ${setupDetail("Benefit Points Remaining", `${spending.remaining}`)}
    </div>
    ${
      stats.overCap
        ? `<div class="entry-advisory"><p>You may record more than ${stats.benefitCap} Hindrance points for character flavor, but only ${stats.benefitCap} points should count for starting benefits by default.</p><p><strong>Above the standard cap:</strong> ${stats.total} Hindrance points selected; extra rewards require a table or GM exception.</p></div>`
        : '<p class="creator-note">You may record more than 4 Hindrance points for character flavor, but only 4 points should count for starting benefits.</p>'
    }
    ${
      stats.unknownCount
        ? '<p class="entry-warning">Needs review: one or more Hindrances need Minor or Major severity.</p>'
        : ""
    }
    ${renderSetupHindranceBenefitRows(stats)}
    <div class="setup-form-grid setup-hindrance-form">
      <label class="setup-wide">Hindrance<select id="setupHindranceCatalogSelect">${entryCatalogOptions(HINDRANCE_CATALOG, "Choose Hindrance...")}</select></label>
      <label>Severity<select id="setupHindranceSeverityInput"><option value="Minor">Minor</option><option value="Major">Major</option></select></label>
      <label class="setup-wide">Notes<input id="setupHindranceNotesInput" autocomplete="off" placeholder="Optional detail, obligation, enemy, vow, phobia, etc."></label>
      <div class="creator-actions setup-wide">
        <button id="setupAddHindranceBtn" type="button" data-setup-action="addHindrance">Add Hindrance</button>
      </div>
    </div>
    <div class="setup-hindrance-list">
      ${renderSetupHindranceRows()}
    </div>
  </section>`;
}

function renderSetupAncestry() {
  const status = characterSetupStatus("ancestry");
  const supported = isHumanAncestry(character.ancestry);
  return `<section id="setupRaceAncestryPanel" class="setup-step-panel" aria-labelledby="setupRaceAncestryHeading">
    <div class="section-title">
      <div>
        <h3 id="setupRaceAncestryHeading">Race / Ancestry</h3>
        <p>Deadlands: The Weird West uses Human characters for the current built-in profile.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Current Race / Ancestry", character.ancestry)}
      ${setupDetail("Supported by This Profile", "Human")}
    </div>
    <p class="creator-note">This step is read-only for now. Future SWADE-wide profile support may make race and ancestry configurable.</p>
    ${
      supported
        ? ""
        : '<p class="entry-warning">Needs review: this profile currently supports Human only.</p>'
    }
  </section>`;
}

function setupTraitPointDetails(attributeStats, skillStats) {
  return [
    setupDetail(
      "Attribute Points",
      `${attributeStats.spent} / ${attributeStats.available}`,
    ),
    setupDetail(
      "Attribute Normal / Extra",
      `${attributeStats.normalAttributePoints} / ${attributeStats.extraAttributeRaises}`,
    ),
    setupDetail(
      "Skill Points",
      `${skillStats.spent} / ${skillStats.available}`,
    ),
    setupDetail("Skill Points Remaining", `${skillStats.remaining}`),
    setupDetail(
      "Skill Normal / Extra",
      `${skillStats.normalSkillPoints} / ${skillStats.extraSkillPoints}`,
    ),
  ].join("");
}

function setupTraitControls(
  actionBase,
  name,
  decreaseDisabled,
  increaseDisabled,
) {
  return `<div class="setup-trait-controls">
    <button class="ghost tag-action" type="button" data-setup-action="dec${actionBase}" data-trait-name="${esc(name)}"${decreaseDisabled ? " disabled" : ""}>−</button>
    <button class="ghost tag-action" type="button" data-setup-action="inc${actionBase}" data-trait-name="${esc(name)}"${increaseDisabled ? " disabled" : ""}>+</button>
  </div>`;
}

function setupAttributeEditorRow(key, attributeStats) {
  const die = character.attributes?.[key] || "d4";
  const index = getDieStepIndex(die);
  const label = displayNameFromKey(key);
  const note = attributeUseNote(key);
  return `<article class="setup-trait-editor-row trait-help-target" tabindex="0" title="${esc([label, note].filter(Boolean).join(". "))}">
    <div>
      <strong>${esc(label)}</strong>
      <span>${esc(die)} • 1 point per step above d4</span>
      ${note ? `<small class="trait-help" role="tooltip">${esc(note)}</small>` : ""}
    </div>
    ${setupTraitControls("Attribute", key, index <= 0, index >= DIE_STEPS.length - 1 || attributeStats.spent >= attributeStats.available)}
  </article>`;
}

function setupSkillEditorRow(skill) {
  const linkedAttribute = setupSkillAttributeKey(skill.linkedAttribute);
  const attributeDie = character.attributes?.[linkedAttribute] || "d4";
  const referenceName = skillReferenceName(skill.name);
  const useNote = skillUseNote(skill.name);
  const displayDie = skill.isUnskilled
    ? "d4-2"
    : skill.die || skill.value || "—";
  const index = getDieStepIndex(skill.die || skill.value);
  const cost = skill.isUnskilled ? 0 : setupSkillPointCost(skill);
  const core = skill.core || setupSkillIsCoreName(skill.name);
  const decreaseDisabled = skill.isUnskilled || (core && index <= 0);
  const increaseDisabled = !skill.isUnskilled && index >= DIE_STEPS.length - 1;
  const meta = [
    displayDie,
    `Linked ${displayNameFromKey(linkedAttribute) || linkedAttribute} ${attributeDie}`,
    skill.isUnskilled ? "Unskilled" : `Cost ${cost}`,
    core ? "Core" : "",
  ].filter(Boolean);
  const help = [
    useNote,
    `Linked attribute: ${displayNameFromKey(linkedAttribute) || linkedAttribute}.`,
    skill.isUnskilled ? "Unskilled roll: d4-2." : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<article class="setup-trait-editor-row skill-row${skill.isUnskilled ? " unskilled" : ""} trait-help-target" tabindex="0" title="${esc([referenceName, help].filter(Boolean).join(". "))}">
    <div>
      <strong>${esc(skill.name || "Skill")}</strong>
      <span>${esc(meta.join(" • "))}</span>
      ${help ? `<small class="trait-help" role="tooltip">${esc(help)}</small>` : ""}
    </div>
    ${setupTraitControls("Skill", skill.name, decreaseDisabled, increaseDisabled)}
  </article>`;
}

function renderSetupTraitAttributeGroup(attributeStats) {
  if (setupTraitsEditable()) {
    return `<div class="setup-trait-editor-list">
      ${ATTRIBUTE_ORDER.map((key) => setupAttributeEditorRow(key, attributeStats)).join("")}
    </div>`;
  }

  const attributeEntries = sortedAttributeEntries();
  return `<div class="attribute-dice-grid">
    ${
      attributeEntries.length
        ? attributeEntries
            .map(([name, die]) => attributeCardMarkup(name, die))
            .join("")
        : emptyState("No attributes recorded.")
    }
  </div>`;
}

function renderSetupTraitSkillGroup(setupSkills) {
  const editable = setupTraitsEditable();
  return `<div class="setup-skill-attribute-groups">
    ${ATTRIBUTE_ORDER.map((attributeKey) => {
      const attributeSkills = setupSkills.filter(
        (skill) =>
          setupSkillAttributeKey(skill.linkedAttribute) === attributeKey,
      );
      return `<section class="setup-skill-attribute-group" aria-label="${esc(displayNameFromKey(attributeKey))} skills">
        <div class="setup-skill-attribute-heading">
          <h5>${esc(displayNameFromKey(attributeKey))}</h5>
          <span>Attribute ${esc(character.attributes?.[attributeKey] || "—")}</span>
        </div>
        <div class="${editable ? "setup-trait-editor-list" : "skill-chip-grid"}">
          ${
            attributeSkills.length
              ? attributeSkills
                  .map((skill) =>
                    editable
                      ? setupSkillEditorRow(skill)
                      : skillChipMarkup(skill),
                  )
                  .join("")
              : emptyState("No linked skills in this profile.")
          }
        </div>
      </section>`;
    }).join("")}
  </div>`;
}

function renderSetupTraits() {
  const attributeEntries = sortedAttributeEntries();
  const skills = sortedSkills();
  const setupSkills = setupSkillCatalogEntries();
  const unskilledCount = setupSkills.filter(
    (skill) => skill.isUnskilled,
  ).length;
  const editable = setupTraitsEditable();
  const hasAdvances = (character.advances || []).length > 0;
  const attributeStats = setupAttributePointStats();
  const skillPointStats = setupSkillPointStats();

  return `<section id="setupTraitsPanel" class="setup-step-panel" aria-labelledby="setupTraitsHeading">
    <div class="section-title">
      <div>
        <h3 id="setupTraitsHeading">Traits</h3>
        <p>${editable ? "Edit starting Attributes and Skills for this created character. Changes update the current character and its creation baseline." : "Read-only view of recorded Attributes and the full skill list."}</p>
      </div>
      ${setupStatusMarkup(characterSetupStatus("attributesSkills"))}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Recorded Attributes", `${attributeEntries.length}`)}
      ${setupDetail("Recorded Skills", `${skills.length}`)}
      ${setupDetail("All Skills Shown", `${setupSkills.length}`)}
      ${setupDetail("Unskilled Skills", `${unskilledCount}`)}
      ${setupDetail("Unskilled Value", "d4-2")}
      ${setupDetail("Recorded Advances", `${(character.advances || []).length}`)}
      ${editable ? setupTraitPointDetails(attributeStats, skillPointStats) : ""}
    </div>
    ${
      editable
        ? '<p class="creator-note">Attribute raises cost 1 point per step above d4. Non-core skills cost 1 point at or below their linked Attribute and 2 points per step above it. Core skills start at d4 for free.</p>'
        : ""
    }
    ${
      hasAdvances
        ? '<p class="entry-advisory"><strong>Advanced character:</strong> this view shows recorded trait values. Trait editing is locked here; use the Advances tab for current trait increases.</p>'
        : ""
    }
    ${
      !editable && !hasAdvances && !setupCharacterIsCreated()
        ? '<p class="entry-advisory"><strong>Audit only:</strong> imported or sample characters do not expose editable starting Traits until import reconstruction exists.</p>'
        : ""
    }
    <div class="setup-trait-groups">
      <section class="setup-trait-group" aria-labelledby="setupAttributesHeading">
        <h4 id="setupAttributesHeading">Attributes</h4>
        ${renderSetupTraitAttributeGroup(attributeStats)}
      </section>
      <section class="setup-trait-group" aria-labelledby="setupSkillsHeading">
        <h4 id="setupSkillsHeading">Skills</h4>
        <p class="creator-note">This list includes every skill in the current Deadlands profile. Missing skills are shown as unskilled d4-2.</p>
        ${renderSetupTraitSkillGroup(setupSkills)}
      </section>
    </div>
  </section>`;
}

const SETUP_EDGE_RANKS = [
  "novice",
  "seasoned",
  "veteran",
  "heroic",
  "legendary",
];

function setupEdgeRankValue(rank) {
  const text = plainEntryName(rank || "Novice");
  const index = SETUP_EDGE_RANKS.indexOf(text);
  return index < 0 ? 0 : index;
}

function setupCurrentRankValue() {
  return setupEdgeRankValue(character.rank || "Novice");
}

function setupHasEdgeNamed(name) {
  const text = plainEntryName(name);
  return (character.edges || []).some(
    (edge) => plainEntryName(edge.name) === text,
  );
}

function setupEdgeRequirementTraitDie(traitName) {
  const attributeDie = getAttributeDie(character, traitName);
  if (attributeDie) return attributeDie;
  return getSkillDie(character, traitName);
}

function setupDieRequirementMet(traitName, requiredDie) {
  const die = setupEdgeRequirementTraitDie(traitName);
  return getDieStepIndex(die) >= getDieStepIndex(requiredDie);
}

function setupRequirementTextIsRankOnly(text) {
  if (!text) return true;
  if (text === "novice" || text === "wild card") return true;
  if (text === "none beyond rank" || text === "rank") return true;
  return SETUP_EDGE_RANKS.includes(text);
}

function setupEdgeRequirementPartMet(part) {
  const text = String(part || "").trim();
  const normalized = plainEntryName(text);
  if (setupRequirementTextIsRankOnly(normalized)) return true;

  const dieMatch = text.match(/^(.+?)\s+d(4|6|8|10|12)\+$/i);
  if (dieMatch) {
    const [, traitText, sides] = dieMatch;
    const requiredDie = `d${sides}`;
    const options = traitText
      .split(/\s+(?:or)\s+|\/|;/i)
      .map((item) => item.trim())
      .filter(Boolean);
    return options.some((name) => setupDieRequirementMet(name, requiredDie));
  }

  const edgeRequirement = EDGE_CATALOG.find(
    (edge) => plainEntryName(edge.name) === normalized,
  );
  if (edgeRequirement) return setupHasEdgeNamed(edgeRequirement.name);

  return false;
}

function setupEdgeEligibility(edge) {
  const rank = edge?.rank || "Novice";
  if (setupEdgeRankValue(rank) > setupCurrentRankValue()) {
    return {
      eligible: false,
      reason: `${rank} Edge; starting characters can only choose rank-legal Edges.`,
    };
  }

  const requirements = String(edge?.requirements || "").trim();
  if (!requirements) return { eligible: true, reason: "" };
  const unmet = requirements
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !setupEdgeRequirementPartMet(part));

  return {
    eligible: unmet.length === 0,
    reason: unmet.length ? `Missing requirement: ${unmet.join(", ")}` : "",
  };
}

function setupEligibleStartingEdges() {
  const selectedNames = new Set(
    (character.edges || [])
      .filter((edge) => edge.name)
      .map((edge) => plainEntryName(edge.name)),
  );
  return EDGE_CATALOG.filter(
    (edge) =>
      !selectedNames.has(plainEntryName(edge.name)) &&
      setupEdgeEligibility(edge).eligible,
  );
}

function setupEdgeOptionLabel(edge) {
  const details = [edge.category, edge.rank, edge.requirements].filter(Boolean);
  return `${edge.name}${details.length ? ` - ${details.join(" - ")}` : ""}`;
}

function setupEdgeCatalogOptions(placeholder) {
  const selectedNames = new Set(
    (character.edges || [])
      .filter((edge) => edge.name)
      .map((edge) => plainEntryName(edge.name)),
  );
  const availableEdges = setupEligibleStartingEdges().filter(
    (edge) => !selectedNames.has(plainEntryName(edge.name)),
  );
  return [
    `<option value="">${placeholder}</option>`,
    ...availableEdges.map(
      (edge) =>
        `<option value="${esc(edge.id)}">${esc(setupEdgeOptionLabel(edge))}</option>`,
    ),
  ].join("");
}

function renderSetupEdgeSelectionControls() {
  const canEdit = setupTraitsEditable();
  const expectedHumanEdges = setupExpectedHumanFreeEdges();
  const humanEdges = setupHumanFreeEdges().length;
  const hindranceEdgeSlots = setupCreationBenefitValue(
    "extraEdgesFromHindrances",
  );
  const hindranceEdges = setupHindranceBenefitEdges().length;

  if (!canEdit) {
    return `<p class="entry-advisory"><strong>Audit only:</strong> imported or advanced characters keep their existing Edge records here. Use Advances for later Edge changes.</p>`;
  }

  return `<section class="setup-trait-group setup-edge-selection" aria-labelledby="setupEdgeSelectionHeading">
    <h4 id="setupEdgeSelectionHeading">Select Starting Edges</h4>
    <p class="creator-note">Only currently eligible starting Edges are shown. Raise Traits or choose prerequisite Edges first to unlock more options.</p>
    <div class="setup-review-grid">
      ${setupDetail("Human Free Edge", `${humanEdges} / ${expectedHumanEdges}`)}
      ${setupDetail("Hindrance Benefit Edges", `${hindranceEdges} / ${hindranceEdgeSlots}`)}
    </div>
    ${
      expectedHumanEdges
        ? `<div class="setup-form-grid">
          <label class="setup-wide">Human free Edge<select id="setupHumanFreeEdgeSelect"${humanEdges >= expectedHumanEdges ? " disabled" : ""}>${setupEdgeCatalogOptions("Choose Human free Edge...")}</select></label>
          <div class="creator-actions setup-wide">
            <button type="button" data-setup-action="addHumanFreeEdge"${humanEdges >= expectedHumanEdges ? " disabled" : ""}>Add Human Free Edge</button>
          </div>
        </div>`
        : '<p class="creator-note">This ancestry does not grant a built-in Human free Edge.</p>'
    }
    ${
      hindranceEdgeSlots
        ? `<div class="setup-form-grid">
          <label class="setup-wide">Hindrance benefit Edge<select id="setupHindranceBenefitEdgeSelect"${hindranceEdges >= hindranceEdgeSlots ? " disabled" : ""}>${setupEdgeCatalogOptions("Choose Hindrance benefit Edge...")}</select></label>
          <div class="creator-actions setup-wide">
            <button type="button" data-setup-action="addHindranceBenefitEdge"${hindranceEdges >= hindranceEdgeSlots ? " disabled" : ""}>Add Hindrance Benefit Edge</button>
          </div>
        </div>`
        : '<p class="creator-note">Spend 2 Hindrance benefit points on Edges to unlock an extra starting Edge slot.</p>'
    }
  </section>`;
}

function renderSetupEdges() {
  const edges = [...(character.edges || [])].filter((edge) => edge.name);
  const catalogMatches = edges.filter((edge) => edgeCatalogEntry(edge)).length;
  const arcaneEdges = edges.filter((edge) => isArcaneBackgroundEdge(edge.name));
  const advanceEdges = edges.filter((edge) =>
    edgeLikelySource(edge).includes("Advance"),
  );
  const expectedHumanEdges = setupExpectedHumanFreeEdges();
  const humanEdges = setupHumanFreeEdges().length;
  const hindranceEdgeSlots = setupCreationBenefitValue(
    "extraEdgesFromHindrances",
  );
  const hindranceEdges = setupHindranceBenefitEdges().length;
  const edgeSelectionEditable = setupTraitsEditable();
  const status = characterSetupStatus("edges");

  return `<section id="setupEdgesPanel" class="setup-step-panel" aria-labelledby="setupEdgesHeading">
    <div class="section-title">
      <div>
        <h3 id="setupEdgesHeading">Edges</h3>
        <p>Select starting Edges and keep their creation source separate from later Advances. The selector enforces Rank, simple Trait die requirements, and prerequisite Edge names; complex prerequisites and GM exceptions remain manual review items.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Recorded Edges", `${edges.length}`)}
      ${setupDetail("Catalog Matches", `${catalogMatches}`)}
      ${setupDetail("Arcane Background Edges", `${arcaneEdges.length}`)}
      ${setupDetail("Advance-Looking Edges", `${advanceEdges.length}`)}
      ${setupDetail("Human Free Edge", edgeSelectionEditable ? `${humanEdges} / ${expectedHumanEdges}` : "Source unknown")}
      ${setupDetail("Hindrance Benefit Edges", edgeSelectionEditable ? `${hindranceEdges} / ${hindranceEdgeSlots}` : "Source unknown")}
    </div>
    ${renderSetupEdgeSelectionControls()}
    <p class="entry-advisory"><strong>Audit only:</strong> imported characters may not preserve whether an Edge came from Human ancestry, Hindrance benefits, Advances, or a GM exception. Source labels below are hints unless they were created in this tool.</p>
    ${
      edgeSelectionEditable && humanEdges < expectedHumanEdges
        ? '<p class="entry-warning">Incomplete: Human characters should select their free starting Edge.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && hindranceEdges < hindranceEdgeSlots
        ? '<p class="entry-warning">Incomplete: one or more Hindrance benefit Edge slots have not been selected.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && hindranceEdges > hindranceEdgeSlots
        ? '<p class="entry-warning">Needs review: more Hindrance benefit Edges are recorded than current Hindrance spending allows.</p>'
        : ""
    }
    ${
      arcaneEdges.length > 1
        ? '<p class="entry-warning">Needs review: more than one Arcane Background Edge is recorded.</p>'
        : ""
    }
    <div class="setup-edge-list">
      ${
        edges.length
          ? edges.map(setupEdgeAuditCard).join("")
          : emptyState("No Edges recorded yet.")
      }
    </div>
  </section>`;
}

function setupPowerCostLabel(power) {
  const value = [power.baseCost, power.powerPoints, power.basePowerPoints].find(
    (item) => item !== undefined && item !== null && item !== "",
  );
  return value === undefined ? "" : `${value} PP`;
}

function setupFixedStartingPowerText(config, powers) {
  if (!config?.fixedStartingPowers?.length) return "None";
  const knownNames = new Set(powers.map((power) => plainEntryName(power.name)));
  return config.fixedStartingPowers
    .map((name) => {
      const label = displayNameFromKey(name);
      return knownNames.has(plainEntryName(name))
        ? `${label} recorded`
        : `${label} missing`;
    })
    .join(", ");
}

function setupPowerAuditCard(power) {
  const meta = [
    power.rank ? `Rank ${power.rank}` : "",
    setupPowerCostLabel(power),
    power.range ? `Range ${power.range}` : "",
    power.duration ? `Duration ${power.duration}` : "",
    power.source || "",
  ].filter(Boolean);
  const summary = power.shortSummary || power.notes || "";
  const trapping = power.trapping ? `Trapping: ${power.trapping}` : "";

  return `<article class="setup-power-card">
    <div>
      <h4>${esc(power.name || "Unnamed Power")}</h4>
      ${meta.length ? `<span>${esc(meta.join(" • "))}</span>` : ""}
    </div>
    ${summary ? `<p>${esc(summary)}</p>` : ""}
    ${trapping ? `<p>${esc(trapping)}</p>` : ""}
  </article>`;
}

function renderSetupPowers() {
  const { arcaneEdges, arcaneConfig, powerPoints, powers } =
    setupPowerAuditContext();
  const status = characterSetupStatus("powers");
  const backgroundName =
    arcaneConfig?.displayName ||
    character.arcaneBackground?.name ||
    arcaneEdges[0]?.name ||
    "";
  const powerPointLabel = powerPoints
    ? `${powerPoints.current} / ${powerPoints.max || "—"}`
    : "Not recorded";

  return `<section id="setupPowersPanel" class="setup-step-panel" aria-labelledby="setupPowersHeading">
    <div class="section-title">
      <div>
        <h3 id="setupPowersHeading">Powers</h3>
        <p>Read-only audit of Arcane Background, Power Points, and known powers. Power selection and full validation come in a later setup slice.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Arcane Background", backgroundName || "None recorded")}
      ${setupDetail("Arcane Skill", arcaneConfig?.arcaneSkill || character.arcaneBackground?.arcaneSkill || "—")}
      ${setupDetail("Power Points", powerPointLabel)}
      ${setupDetail("Known Powers", `${powers.length}`)}
      ${setupDetail("Starting Powers Expected", arcaneConfig ? `${arcaneConfig.startingPowersCount}` : "—")}
      ${setupDetail("Fixed Starting Powers", setupFixedStartingPowerText(arcaneConfig, powers))}
    </div>
    ${
      status === "Not applicable"
        ? '<p class="creator-note">No Arcane Background is recorded, so this character does not need Powers during setup.</p>'
        : '<p class="entry-advisory"><strong>Audit only:</strong> imported powers may be current known powers rather than the exact creation-time power list. Starting-power editing and advancement separation are deferred.</p>'
    }
    ${
      status === "Incomplete"
        ? '<p class="entry-warning">Powers incomplete: an Arcane Background is recorded but no known powers are listed.</p>'
        : ""
    }
    ${
      status === "Needs review"
        ? '<p class="entry-warning">Needs review: the Arcane Background, Power Points, or known powers do not line up cleanly.</p>'
        : ""
    }
    <div class="setup-power-list">
      ${
        powers.length
          ? powers.sort(comparePowers).map(setupPowerAuditCard).join("")
          : emptyState("No powers recorded.")
      }
    </div>
  </section>`;
}

function setupQuantityText(item, unit = "") {
  const count = Math.max(0, Number(item?.count ?? item?.quantity ?? 1) || 0);
  return `Qty ${count || 0}${unit ? ` ${unit}` : ""}`;
}

function setupGearLine(name, details, note = "") {
  return `<div class="setup-gear-line">
    <div>
      <strong>${esc(name || "Gear")}</strong>
      ${details.filter(Boolean).length ? `<span>${esc(details.filter(Boolean).join(" • "))}</span>` : ""}
      ${note ? `<p>${esc(note)}</p>` : ""}
    </div>
  </div>`;
}

function setupAuditGroup(title, items, emptyText, renderer) {
  return `<section class="setup-audit-group" aria-label="${esc(title)}">
    <h4>${esc(title)}</h4>
    <div class="setup-audit-list">
      ${items.length ? items.map(renderer).join("") : emptyState(emptyText)}
    </div>
  </section>`;
}

function setupWeaponLine(weapon) {
  const entry = {
    type: "weapon",
    id: weapon.id,
    label: weapon.name,
    item: weapon,
  };
  const loaded = isTrackedWeapon(weapon)
    ? `${weapon.shotsLoaded ?? 0} / ${weapon.shotsMax ?? "—"} loaded`
    : "";
  return setupGearLine(
    weapon.name,
    [
      `Damage ${weapon.damage || "—"}`,
      `Range ${weapon.range || "—"}`,
      `AP ${weapon.ap ?? "—"}`,
      `ROF ${weapon.rof ?? "—"}`,
      loaded,
      physicalItemLocationLabel(entry),
      `Weight ${formatWeightPounds(physicalItemWeight(entry))}`,
      weapon.costCents !== undefined ? `Cost ${money(weapon.costCents)}` : "",
    ],
    weapon.notes || "",
  );
}

function setupArmorLine(armor) {
  const entry = { type: "armor", id: armor.id, label: armor.name, item: armor };
  return setupGearLine(
    armor.name,
    [
      setupQuantityText(armor),
      `+${armor.armor}`,
      armorLabel(armor.location),
      armor.equipped ? "Equipped" : "",
      physicalItemLocationLabel(entry),
      `Min Str ${armor.minStr || "—"}`,
      `Weight ${formatWeightPounds(physicalItemWeight(entry))}`,
      armor.costCents !== undefined ? `Cost ${money(armor.costCents)}` : "",
    ],
    armor.note || "",
  );
}

function setupInventoryLine(item) {
  return setupGearLine(
    item.name,
    [
      setupQuantityText(item),
      locationLabel(item.location || "carried", item.storageId),
      `Weight ${formatWeightPounds(inventoryItemTotalWeight(item))}`,
      item.costCents !== undefined ? `Cost ${money(item.costCents)}` : "",
      item.book || "",
    ],
    item.note || "",
  );
}

function setupConsumableLine(item) {
  const entry = { type: "consumable", id: item.id, label: item.name, item };
  return setupGearLine(
    item.name,
    [
      setupQuantityText(item, item.unit || ""),
      physicalItemLocationLabel(entry),
      `Weight ${formatWeightPounds(physicalItemWeight(entry))}`,
    ],
    item.note || "",
  );
}

function setupAmmoLine([key, ammo]) {
  const entry = { type: "ammo", id: key, label: ammo.label, item: ammo };
  return setupGearLine(
    ammo.label,
    [
      `Reserve ${Math.max(0, Number(ammo.count) || 0)}`,
      physicalItemLocationLabel(entry),
      `Weight ${formatWeightPounds(physicalItemWeight(entry))}`,
    ],
    ammo.note || "",
  );
}

function setupVehicleLine(vehicle) {
  return setupGearLine(
    vehicle.name,
    [
      setupQuantityText(vehicle),
      vehicle.costCents !== undefined ? `Cost ${money(vehicle.costCents)}` : "",
      vehicle.book || "",
    ],
    vehicle.note || "",
  );
}

function renderSetupGear() {
  const counts = setupGearAuditCounts();
  const info = calculateEncumbrance(character);
  const weapons = (character.weapons || []).filter((weapon) => weapon.name);
  const armor = (character.armorInventory || []).filter(
    (item) => Number(item.count ?? 1) > 0,
  );
  const inventory = (character.inventory || []).filter(
    (item) => Number(item.count ?? 1) > 0,
  );
  const consumables = (character.consumables || []).filter(
    (item) => Number(item.count ?? 1) > 0,
  );
  const ammo = Object.entries(character.ammo || {}).filter(
    ([, reserve]) => Number(reserve?.count) > 0,
  );
  const vehicles = (character.vehicles || []).filter(
    (vehicle) => Number(vehicle.count ?? 1) > 0,
  );

  return `<section id="setupGearPanel" class="setup-step-panel" aria-labelledby="setupGearHeading">
    <div class="section-title">
      <div>
        <h3 id="setupGearHeading">Gear</h3>
        <p>Read-only audit of recorded equipment, money, and load. Starting purchases and gear-source tracking come in a later setup slice.</p>
      </div>
      ${setupStatusMarkup(characterSetupStatus("gear"))}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Money", money(counts.moneyCents))}
      ${setupDetail("Weapons", `${counts.weapons}`)}
      ${setupDetail("Armor", `${counts.armor}`)}
      ${setupDetail("Gear Items", `${counts.inventory}`)}
      ${setupDetail("Consumables", `${counts.consumables}`)}
      ${setupDetail("Ammo Pools", `${counts.ammo}`)}
      ${setupDetail("Vehicles", `${counts.vehicles}`)}
      ${setupDetail("Current Load (Combat Load)", compactLoadText(info))}
      ${setupDetail("Carrying Capacity", formatWeightPounds(info.carryingCapacity))}
    </div>
    <p class="entry-advisory"><strong>Audit only:</strong> imported/current inventory may include post-creation purchases, loot, or table adjustments. Starting cash and starting purchase validation are deferred.</p>
    <div class="setup-gear-groups">
      ${setupAuditGroup("Weapons", weapons, "No weapons recorded.", setupWeaponLine)}
      ${setupAuditGroup("Armor", armor, "No armor recorded.", setupArmorLine)}
      ${setupAuditGroup("Gear", inventory, "No general gear recorded.", setupInventoryLine)}
      ${setupAuditGroup("Consumables", consumables, "No consumables recorded.", setupConsumableLine)}
      ${setupAuditGroup("Ammunition", ammo, "No ammunition reserves recorded.", setupAmmoLine)}
      ${setupAuditGroup("Vehicles", vehicles, "No vehicles recorded.", setupVehicleLine)}
    </div>
  </section>`;
}

function renderSetupPlaceholder(title, body, details = []) {
  return `<section class="setup-step-panel setup-placeholder" aria-labelledby="setup${slugify(title)}Heading">
    <div class="section-title">
      <div>
        <h3 id="setup${slugify(title)}Heading">${esc(title)}</h3>
        <p>${esc(body)}</p>
      </div>
      ${setupStatusMarkup("Planned")}
    </div>
    <div class="setup-review-grid">
      ${details.map(([label, value]) => setupDetail(label, value)).join("")}
    </div>
  </section>`;
}

function renderSetupReview() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  const ancestryNeedsReview = !isHumanAncestry(character.ancestry);
  const hindranceStats = hindrancePointStats();
  const hindranceSpending = setupHindranceBenefitSpending(hindranceStats);
  const edgeCount = (character.edges || []).length;
  const arcaneEdgeCount = (character.edges || []).filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  ).length;
  const expectedHumanEdges = setupExpectedHumanFreeEdges();
  const humanEdges = setupHumanFreeEdges().length;
  const hindranceEdgeSlots = setupCreationBenefitValue(
    "extraEdgesFromHindrances",
  );
  const hindranceEdges = setupHindranceBenefitEdges().length;
  const edgeSelectionEditable = setupTraitsEditable();
  const powersCount = (character.powers || []).filter(
    (power) => power.name,
  ).length;
  const powerPoints = powerPointResource();
  const gearCounts = setupGearAuditCounts();
  return `<section id="setupReviewPanel" class="setup-step-panel" aria-labelledby="setupReviewHeading">
    <div class="section-title">
      <div>
        <h3 id="setupReviewHeading">Review</h3>
        <p>Summary only. Full rules validation is not part of this slice.</p>
      </div>
      ${setupStatusMarkup("Needs review")}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Name", character.name)}
      ${setupDetail("Gender", character.gender)}
      ${setupDetail("Age", character.age)}
      ${setupDetail("Profession or Title", character.archetype)}
      ${setupDetail("Race / Ancestry", character.ancestry)}
      ${setupDetail("Player Name", character.player)}
      ${setupDetail("Recorded Rank", character.rank)}
      ${setupDetail("Hindrance Count", `${hindranceStats.count}`)}
      ${setupDetail("Total Hindrance Points", `${hindranceStats.total}`)}
      ${setupDetail("Hindrance Benefit Cap", `${hindranceStats.benefitCap}`)}
      ${setupDetail("Hindrance Benefits Spent", `${hindranceSpending.spent} / ${hindranceSpending.available}`)}
      ${setupDetail("Edge Count", `${edgeCount}`)}
      ${setupDetail("Human Free Edge", edgeSelectionEditable ? `${humanEdges} / ${expectedHumanEdges}` : "Source unknown")}
      ${setupDetail("Hindrance Benefit Edges", edgeSelectionEditable ? `${hindranceEdges} / ${hindranceEdgeSlots}` : "Source unknown")}
      ${setupDetail("Arcane Background Edges", `${arcaneEdgeCount}`)}
      ${setupDetail("Known Powers", `${powersCount}`)}
      ${setupDetail("Power Points", powerPoints ? `${powerPoints.current} / ${powerPoints.max || "—"}` : "Not recorded")}
      ${setupDetail("Gear Items", `${gearCounts.totalItems}`)}
      ${setupDetail("Money", money(gearCounts.moneyCents))}
      ${setupDetail("Description", character.description)}
      ${setupDetail("Background", character.background)}
    </div>
    ${
      ancestryNeedsReview
        ? '<p class="entry-warning">Needs review: this profile currently supports Human only.</p>'
        : ""
    }
    ${
      !hindranceStats.count
        ? '<p class="entry-warning">Hindrances incomplete: select at least one Hindrance.</p>'
        : ""
    }
    ${
      hindranceStats.overCap
        ? `<p class="entry-advisory"><strong>Above the standard Hindrance benefit cap:</strong> ${hindranceStats.total} points selected, ${hindranceStats.benefitPoints} counted under default rules. Record any extra reward as a table or GM exception.</p>`
        : ""
    }
    ${
      hindranceSpending.spent > hindranceSpending.available
        ? '<p class="entry-warning">Needs review: Hindrance benefit spending exceeds counted Hindrance points.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && humanEdges < expectedHumanEdges
        ? '<p class="entry-warning">Edges incomplete: select the Human free starting Edge.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && hindranceEdges < hindranceEdgeSlots
        ? '<p class="entry-warning">Edges incomplete: select all Hindrance benefit Edge slots or adjust Hindrance spending.</p>'
        : ""
    }
    ${
      arcaneEdgeCount > 1
        ? '<p class="entry-warning">Needs review: more than one Arcane Background Edge is recorded.</p>'
        : ""
    }
    <div class="setup-review-list">
      <h4>Selected Hindrances</h4>
      ${
        character.hindrances.length
          ? character.hindrances
              .map(
                (hindrance) =>
                  `<article class="dossier-note"><strong>${esc(hindrance.name || "Unnamed Hindrance")}</strong><p>${esc(hindrance.severity || "Unknown")} • ${esc(hindrancePointText(hindrance))}</p></article>`,
              )
              .join("")
          : emptyState("No Hindrances selected yet.")
      }
    </div>
    <div class="setup-review-warnings">
      <h4>Import Warnings</h4>
      ${
        importWarnings.length
          ? importWarnings
              .map(
                (warning) =>
                  `<article class="dossier-note warning"><strong>${esc(warning.name)}</strong><p>${esc(warning.text)}</p></article>`,
              )
              .join("")
          : emptyState("No import warnings.")
      }
    </div>
  </section>`;
}

function renderEncumbrance() {
  const info = calculateEncumbrance(character);
  const combatInfo = calculateEncumbrance(character, { combat: true });
  const warning =
    encumbranceWarningText(combatInfo) || encumbranceWarningText(info);

  els.encumbranceSummaryPill.textContent = combatInfo.overloaded
    ? "Overloaded"
    : combatInfo.encumbered
      ? `Combat ${encumbranceText(combatInfo)}`
      : info.encumbered
        ? `Normal ${encumbranceText(info)}`
        : "No encumbrance";
  els.encumbranceDetails.innerHTML = [
    ["Current Load (Combat Load)", compactLoadText(info)],
    ["Carrying Capacity", formatWeightPounds(info.carryingCapacity)],
    [
      "Encumbrance",
      `Normal - ${encumbranceText(info)}, Combat - ${encumbranceText(combatInfo)}`,
    ],
    ["Combat Load", formatWeightPounds(info.combatLoad)],
    ["Normal Load", formatWeightPounds(info.normalLoad)],
    ["Container Load", formatWeightPounds(info.inventoryTotals.containerLoad)],
    ["Dropped Load", formatWeightPounds(info.inventoryTotals.droppedLoad)],
    ["Stored Load", formatWeightPounds(info.inventoryTotals.storedLoad)],
    ["Owned Gear", formatWeightPounds(info.inventoryTotals.ownedWeight)],
    ["Maximum Normal Carry", formatWeightPounds(info.normalCapacity)],
    ["Effective Strength", info.effectiveStrength],
    ["Combat Encumbrance", encumbranceText(combatInfo)],
    ["Normal Encumbrance", encumbranceText(info)],
    ["Next Combat Threshold", nextEncumbranceText(combatInfo)],
  ]
    .map(
      ([label, value]) =>
        `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`,
    )
    .join("");
  els.encumbranceWarning.textContent = warning;
  els.encumbranceWarning.classList.toggle("hidden", !warning);
}

function renderCharacterSummary() {
  els.characterSummaryName.textContent = character.name;
  els.characterDossierSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" • ");
  els.characterSourceBadge.textContent = sourceLabel();
  els.characterBasicsList.innerHTML = [
    ["Rank", character.rank],
    ["Ancestry", character.ancestry],
    ["Gender", character.gender],
    ["Age", character.age],
    ["Profession or Title", character.archetype],
    ["Player Name", character.player],
    ["Source", sourceLabel()],
  ]
    .map(
      ([label, value]) =>
        `<div class="dossier-meta-item"><span>${label}</span><strong>${esc(value || "—")}</strong></div>`,
    )
    .join("");

  const powerPoints = powerPointResource();
  els.characterStatusStrip.innerHTML = [
    statusPipMarkup(
      "Wounds",
      `${character.damage.wounds} / ${character.damage.maxWounds}`,
    ),
    statusPipMarkup(
      "Fatigue",
      `${character.damage.fatigue} / ${character.damage.maxFatigue}`,
    ),
    statusPipMarkup(
      "Bennies",
      character.bennies.current,
      `Start ${character.bennies.starting}`,
    ),
    statusPipMarkup("Conviction", character.conviction),
    powerPoints
      ? statusPipMarkup(
          "Power Points",
          `${powerPoints.current} / ${powerPoints.max}`,
          powerPoints.source,
        )
      : "",
  ]
    .filter(Boolean)
    .join("");
  els.addManualPowerPointsBtn.classList.toggle("hidden", Boolean(powerPoints));

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
    ["Pace", character.derived.pace, ""],
    ["Parry", character.derived.parry, ""],
    [
      "Toughness",
      character.derived.toughness,
      `Base ${compactText(character.derived.baseToughness)} + Armor ${compactText(character.derived.armor, "0")}`,
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

  const background = character.arcaneBackground;
  els.characterArcaneSummary.innerHTML = background
    ? `<div class="arcane-snapshot-grid">${[
        ["Background", background.name || background.edgeName],
        ["Edge", background.edgeName],
        [
          "Arcane Skill",
          background.arcaneSkill
            ? `${background.arcaneSkill}${background.linkedAttribute ? ` (${background.linkedAttribute})` : ""}`
            : "",
        ],
        [
          "Power Points",
          powerPoints ? `${powerPoints.current} / ${powerPoints.max}` : "—",
        ],
        ["Known Powers", character.powers.length],
      ]
        .map(
          ([label, value]) =>
            `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
        )
        .join("")}</div>`
    : powerPoints
      ? `<div class="arcane-snapshot-grid">${[
          ["Background", "Manual Power Points"],
          ["Power Points", `${powerPoints.current} / ${powerPoints.max}`],
          ["Known Powers", character.powers.length],
          ["Notes", powerPoints.note || "Manual post-import setup"],
        ]
          .map(
            ([label, value]) =>
              `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
          )
          .join("")}</div>`
      : emptyState("No Arcane Background or Power Points configured.");

  els.characterEquippedSummary.innerHTML = `<div class="equipment-group"><h3>Weapons</h3>${equippedWeaponSummaryMarkup()}</div><div class="equipment-group"><h3>Armor</h3>${equippedArmorSummaryMarkup()}</div><div class="equipment-line secondary"><strong>Cash</strong><span>${money(character.moneyCents)} • Inventory tracks money and gear details.</span></div>`;
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
      getAdvanceRankFromCount(summary.count),
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
  els.keyConditionsList.innerHTML = "";
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = `condition${character.conditions[key] ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${character.conditions[key] ? "checked" : ""}><span>${esc(displayNameFromKey(key))}</span>`;
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

  renderCombatHuckster();
  renderCombatConsumables();
  renderCombatReminders();
}
