const CHARACTER_SETUP_STEPS = [
  { id: "concept", label: "Concept" },
  { id: "ancestry", label: "Race / Ancestry" },
  { id: "hindrances", label: "Hindrances" },
  { id: "attributesSkills", label: "Traits" },
  { id: "edges", label: "Edges" },
  { id: "review", label: "Review" },
];
var characterSetupStep = "concept";

function characterIdentitySubtitle(separator = " ") {
  return [character.rank, character.ancestry, character.archetype]
    .filter(Boolean)
    .join(separator);
}

function renderCharacterIdentityDisplays() {
  els.characterName.textContent = character.name;
  els.characterSubtitle.textContent = characterIdentitySubtitle(" ");
  if (els.characterSummaryName) els.characterSummaryName.textContent = character.name;
  if (els.characterDossierSubtitle)
    els.characterDossierSubtitle.textContent = characterIdentitySubtitle(" • ");
}

function render() {
  renderCharacterIdentityDisplays();
  els.woundsValue.textContent = character.damage.wounds;
  const woundPenalty = Math.min(character.damage.wounds, character.damage.maxWounds);
  els.woundPenalty.textContent = woundPenalty ? `Penalty -${woundPenalty}` : "";
  els.woundPenalty.classList.toggle("hidden", !woundPenalty);
  els.woundsNote.textContent = character.damage.wounds
    ? "Apply wound penalty to affected trait rolls."
    : "Healthy";
  els.fatigueValue.textContent = character.damage.fatigue;
  const fatiguePenalty = Math.min(character.damage.fatigue, character.damage.maxFatigue);
  els.fatiguePenalty.textContent = fatiguePenalty ? `Penalty -${fatiguePenalty}` : "";
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

function renderCharacterLibrary() {
  if (!els.characterLibraryList) return;
  const entries = characterLibraryEntries();
  const activeId = characterLibrary?.activeCharacterId || "";
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
    : emptyState("No saved character slots yet. Save the current character, load a sample, import JSON, or finalize a creator draft.");
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
    `<span class="pill">${isDemoMode ? "Demo mode" : "Local save"}</span>`,
  ].join("");

  els.settingsAppDetails.innerHTML = [
    ["Current Character", character.name],
    ["Rank / Archetype", [character.rank, character.archetype].filter(Boolean).join(" / ")],
    ["Source", source],
    ["App Version", APP_VERSION],
    ["Schema Version", APP_SCHEMA_VERSION],
    ["Browser Save Key", STORAGE_KEY],
    ["Power Points", powerPoints ? `${powerPoints.current} / ${powerPoints.max}` : "Not enabled"],
    ["Hosted Demo", DEMO_URL],
  ]
    .map(([label, value]) => settingsDetail(label, value))
    .join("");

  els.settingsStorageDetails.innerHTML = [
    ["Tracker Save", hasTrackerSave ? localJsonSize(STORAGE_KEY) : "Not saved yet"],
    [
      "Character Library",
      characterLibraryEntries().length
        ? `${characterLibraryEntries().length} slot(s), ${localJsonSize(CHARACTER_LIBRARY_KEY)}`
        : "No library saved",
    ],
    ["Creator Draft", hasDraft ? localJsonSize(CREATION_KEY) : "No draft saved"],
    ["Demo Mode", isDemoMode ? "On" : "Off"],
    ["Export Reminder", hasTrackerSave ? "Use full backup before clearing local data" : "Load, import, or create a character first"],
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
    if (!stats.count) return "Incomplete";
    return stats.unknownCount ? "Needs review" : "Complete";
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

function sortedAttributeEntries() {
  return Object.entries(character.attributes || {}).sort(([left], [right]) => {
    const leftIndex = ATTRIBUTE_ORDER.indexOf(left);
    const rightIndex = ATTRIBUTE_ORDER.indexOf(right);
    return (
      (leftIndex < 0 ? 99 : leftIndex) -
        (rightIndex < 0 ? 99 : rightIndex) ||
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
          isUntrained: false,
        };
      }

      return {
        name,
        die: "d4-2",
        linkedAttribute,
        isUntrained: true,
      };
    },
  );

  recordedSkills.forEach((skill, index) => {
    if (usedRecordedIndexes.has(index) || !skill.name) return;
    entries.push({
      ...skill,
      linkedAttribute: skillLinkedAttribute(skill) || skill.linkedAttribute || "Custom",
      isUntrained: false,
    });
  });

  return entries;
}

function isHumanAncestry(value) {
  return String(value || "").trim().toLowerCase() === "human";
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
    edges: () =>
      renderSetupPlaceholder(
        "Edges",
        "Edge selection is planned for a later setup slice. Existing Edges remain visible in the dossier below.",
        [["Recorded Edges", `${character.edges.length}`]],
      ),
    review: renderSetupReview,
  };

  els.characterSetupContent.innerHTML =
    renderers[characterSetupStep]?.() || renderSetupConcept();
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
    <p class="creator-note">Concept edits update the active tracker character and use the normal local save path.</p>
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
  const status = characterSetupStatus("hindrances");
  return `<section id="setupHindrancesPanel" class="setup-step-panel" aria-labelledby="setupHindrancesHeading">
    <div class="section-title">
      <div>
        <h3 id="setupHindrancesHeading">Hindrances</h3>
        <p>Select starting Hindrances and track their point value. Spending those points comes in a later setup slice.</p>
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
      ${setupDetail("Benefit Points Counted Later", `${stats.benefitPoints} / ${stats.benefitCap}`)}
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

function renderSetupTraits() {
  const attributeEntries = sortedAttributeEntries();
  const skills = sortedSkills();
  const setupSkills = setupSkillCatalogEntries();
  const untrainedCount = setupSkills.filter((skill) => skill.isUntrained).length;
  const hasAdvances = (character.advances || []).length > 0;

  return `<section id="setupTraitsPanel" class="setup-step-panel" aria-labelledby="setupTraitsHeading">
    <div class="section-title">
      <div>
        <h3 id="setupTraitsHeading">Traits</h3>
        <p>Read-only view of recorded Attributes and the full skill list. Trait editing and starting-trait audit rules come in a later setup slice.</p>
      </div>
      ${setupStatusMarkup(characterSetupStatus("attributesSkills"))}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Recorded Attributes", `${attributeEntries.length}`)}
      ${setupDetail("Recorded Skills", `${skills.length}`)}
      ${setupDetail("All Skills Shown", `${setupSkills.length}`)}
      ${setupDetail("Untrained Skills", `${untrainedCount}`)}
      ${setupDetail("Untrained Value", "d4-2")}
      ${setupDetail("Recorded Advances", `${(character.advances || []).length}`)}
    </div>
    ${
      hasAdvances
        ? '<p class="entry-advisory"><strong>Advanced character:</strong> this view shows recorded trait values. A later setup editor should separate starting traits from changes gained through Advances.</p>'
        : ""
    }
    <div class="setup-trait-groups">
      <section class="setup-trait-group" aria-labelledby="setupAttributesHeading">
        <h4 id="setupAttributesHeading">Attributes</h4>
        <div class="attribute-dice-grid">
          ${
            attributeEntries.length
              ? attributeEntries
                  .map(([name, die]) => attributeCardMarkup(name, die))
                  .join("")
              : emptyState("No attributes recorded.")
          }
        </div>
      </section>
      <section class="setup-trait-group" aria-labelledby="setupSkillsHeading">
        <h4 id="setupSkillsHeading">Skills</h4>
        <p class="creator-note">This list includes every skill in the current Deadlands profile. Missing skills are shown as untrained d4-2.</p>
        <div class="setup-skill-attribute-groups">
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
              <div class="skill-chip-grid">
                ${
                  attributeSkills.length
                    ? attributeSkills.map(skillChipMarkup).join("")
                    : emptyState("No linked skills in this profile.")
                }
              </div>
            </section>`;
          }).join("")}
        </div>
      </section>
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
  const warning = encumbranceWarningText(info);

  els.encumbranceSummaryPill.textContent = info.overloaded
    ? "Overloaded"
    : info.encumbered
      ? encumbranceText(info)
      : "No encumbrance";
  els.encumbranceDetails.innerHTML = [
    ["Active Load", formatWeightPounds(info.carriedWeight)],
    ["Container Load", formatWeightPounds(info.inventoryTotals.containerLoad)],
    ["Dropped Load", formatWeightPounds(info.inventoryTotals.droppedLoad)],
    ["Stored Load", formatWeightPounds(info.inventoryTotals.storedLoad)],
    ["Owned Gear", formatWeightPounds(info.inventoryTotals.ownedWeight)],
    ["Load Limit", formatWeightPounds(info.loadLimit)],
    ["Effective Strength", info.effectiveStrength],
    ["Encumbrance", encumbranceText(info)],
    ["Next Threshold", nextEncumbranceText(info)],
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
    statusPipMarkup("Bennies", character.bennies.current, `Start ${character.bennies.starting}`),
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
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
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
      Number(left.number) - Number(right.number) ||
      String(left.dateAdded || "").localeCompare(String(right.dateAdded || "")),
  );
}

function nextAdvanceNumber() {
  return (
    Math.max(0, ...((character.advances || []).map((advance) => Number(advance.number) || 0))) +
    1
  );
}

function advanceCardMarkup(advance) {
  const warnings = advanceWarnings(character, advance, advance.id);
  const status = advance.applied
    ? `Applied${advance.appliedAt ? ` ${advance.appliedAt}` : ""}`
    : "History only";
  const target = [
    advance.targetType ? displayNameFromKey(advance.targetType) : "",
    advance.targetName,
  ]
    .filter(Boolean)
    .join(": ");
  const source = [advance.source, advance.dateAdded].filter(Boolean).join(" • ");
  return tagCardMarkup(
    {
      id: advance.id,
      name: `Advance #${advance.number}`,
      meta: [advance.rank, advance.type].filter(Boolean).join(" • "),
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
    const number = Number(advance.number);
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
