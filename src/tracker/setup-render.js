// Character Setup rendering helpers.
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
  const startingEdgeValidation =
    setupTraitsEditable() &&
    ["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    )
      ? validateSetupStartingEdge(edge)
      : null;
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
    startingEdgeValidation && !startingEdgeValidation.valid
      ? setupEdgeBadge("Needs review", "warning")
      : "",
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
    ...(startingEdgeValidation?.messages || []),
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
  const report = setupStartingEdgeValidationReport();
  const expectedHumanEdges = report.expectedHumanEdges;
  const humanEdges = report.humanFreeEdges.length;
  const hindranceEdgeSlots = report.hindranceEdgeSlots;
  const hindranceEdges = report.hindranceBenefitEdges.length;

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
  const report = setupStartingEdgeValidationReport();
  const expectedHumanEdges = report.expectedHumanEdges;
  const humanEdges = report.humanFreeEdges.length;
  const hindranceEdgeSlots = report.hindranceEdgeSlots;
  const hindranceEdges = report.hindranceBenefitEdges.length;
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
      edgeSelectionEditable && report.invalidEdges.length
        ? `<p class="entry-warning">Needs review: ${esc(
            report.invalidEdges
              .map((item) => item.validation.messages.join(" "))
              .join(" "),
          )}</p>`
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

function setupPowerAuditCard(power, audit = null) {
  const meta = [
    audit?.catalog ? "Catalog matched" : "Unknown/custom",
    audit?.allowed ? "Allowed" : "",
    audit?.required ? "Required" : "",
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
    ${
      audit?.messages?.length
        ? `<div class="setup-edge-advisories">${audit.messages
            .map((item) => `<p>${esc(item)}</p>`)
            .join("")}</div>`
        : ""
    }
  </article>`;
}

function setupPowerMessageList(items, emptyText = "") {
  if (!items.length) return emptyText ? `<p>${esc(emptyText)}</p>` : "";
  return `<ul>${items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`;
}

function setupRequiredPowerChecklist(report) {
  if (!report.requiredPowerAudits.length) return "None";
  return report.requiredPowerAudits
    .map((item) => `${item.label}: ${item.recorded ? "recorded" : "missing"}`)
    .join(", ");
}

function renderSetupPowers() {
  const report = setupPowerAuditReport();
  const {
    profile,
    powers,
    skillAudit,
    powerPointsAudit,
    powerAudits,
    status,
  } = report;
  const arcaneSkillLabel = profile
    ? `${report.expectedArcaneSkill} d4+${
        report.expectedLinkedAttribute
          ? ` linked to ${report.expectedLinkedAttribute}`
          : ""
      }`
    : character.arcaneBackground?.arcaneSkill || "—";
  const expectedPowerPointsLabel = profile
    ? `${report.expectedPowerPoints} Power Points`
    : "—";
  const recordedPowerPointsLabel =
    powerPointsAudit?.statusText || "Not recorded";
  const knownPowerLabel = profile
    ? `${powers.length} / ${report.startingPowerCount} expected`
    : `${powers.length}`;

  return `<section id="setupPowersPanel" class="setup-step-panel" aria-labelledby="setupPowersHeading">
    <div class="section-title">
      <div>
        <h3 id="setupPowersHeading">Powers</h3>
        <p>Read-only audit of Arcane Background, Power Points, and known powers. Power selection and full validation come in a later setup slice.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Arcane Background Detected", report.backgroundName || "None recorded")}
      ${setupDetail("Expected Arcane Skill", arcaneSkillLabel)}
      ${setupDetail("Recorded Arcane Skill Status", skillAudit?.statusText || "Not recorded")}
      ${setupDetail("Expected Power Points", expectedPowerPointsLabel)}
      ${setupDetail("Recorded Power Points Status", recordedPowerPointsLabel)}
      ${setupDetail("Expected Starting Powers", profile ? `${report.startingPowerCount}` : "—")}
      ${setupDetail("Recorded Known Powers", knownPowerLabel)}
      ${setupDetail("Required Starting Powers", setupRequiredPowerChecklist(report))}
    </div>
    ${
      status === "Not applicable"
        ? '<p class="creator-note">No Arcane Background is recorded, so this character does not need Powers during setup.</p>'
        : '<p class="entry-advisory"><strong>Audit only:</strong> imported powers may be current known powers rather than the exact creation-time power list. Starting-power editing and advancement separation are deferred.</p>'
    }
    ${
      report.incompleteItems.length
        ? `<div class="entry-warning"><strong>Powers incomplete:</strong>${setupPowerMessageList(report.incompleteItems)}</div>`
        : ""
    }
    ${
      report.warnings.length
        ? `<div class="entry-warning"><strong>Needs review:</strong>${setupPowerMessageList(report.warnings)}</div>`
        : ""
    }
    <section class="setup-audit-group" aria-label="Required Starting Powers">
      <h4>Required Starting Powers</h4>
      <div class="setup-audit-list">
        ${
          report.requiredPowerAudits.length
            ? report.requiredPowerAudits
                .map(
                  (item) =>
                    `<article class="dossier-note${item.recorded ? "" : " warning"}"><strong>${esc(item.label)}</strong><p>${esc(
                      item.recorded
                        ? "Recorded"
                        : `Missing required starting power for ${
                            profile?.name || "this Arcane Background"
                          }.`,
                    )}</p></article>`,
                )
                .join("")
            : emptyState("No required starting powers.")
        }
      </div>
    </section>
    <div class="setup-power-list">
      ${
        powers.length
          ? powerAudits
              .sort((left, right) => comparePowers(left.power, right.power))
              .map((audit) => setupPowerAuditCard(audit.power, audit))
              .join("")
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

function setupGearAuditEntryLine(entry) {
  const item = entry.item || {};
  const details = [
    entry.type,
    setupGearEntryLocationLabel(entry),
    entry.type === "vehicle" ? "" : `Weight ${formatWeightPounds(entry.weight)}`,
    entry.catalog ? "Catalog matched" : "Manual review",
    item.costCents !== undefined ? `Cost ${money(item.costCents)}` : "",
    item.book || "",
  ];
  return setupGearLine(
    entry.label,
    details,
    [
      item.note || item.notes || "",
      ...entry.warnings.map((warning) => `Needs review: ${warning}`),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function setupContainerAuditLine(container) {
  const contentNames = container.contents.map((entry) => entry.label);
  return setupGearLine(
    container.label,
    [
      setupGearEntryLocationLabel(container),
      `Empty ${formatWeightPounds(container.ownWeight)}`,
      `Contents ${formatWeightPounds(container.contentsWeight)}`,
      `Total ${formatWeightPounds(container.totalWeight)}`,
    ],
    contentNames.length
      ? `Contains: ${contentNames.join(", ")}`
      : "No contents recorded.",
  );
}

function setupGearWarningMarkup(report) {
  const messages = [...report.incompleteItems, ...report.warnings];
  if (!messages.length) return "";
  return `<div class="entry-warning"><strong>Gear audit:</strong><ul>${messages
    .map((message) => `<li>${esc(message)}</li>`)
    .join("")}</ul></div>`;
}

function renderSetupGear() {
  const report = setupGearAuditReport();
  const { counts, normal, combat, locationGroups } = report;
  const byType = (type) => report.entries.filter((entry) => entry.type === type);

  return `<section id="setupGearPanel" class="setup-step-panel" aria-labelledby="setupGearHeading">
    <div class="section-title">
      <div>
        <h3 id="setupGearHeading">Gear</h3>
        <p>Read-only audit of recorded equipment, money, and load. Starting purchases and gear-source tracking come in a later setup slice.</p>
      </div>
      ${setupStatusMarkup(characterSetupStatus("gear"))}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Gear Status", report.status)}
      ${setupDetail("Recorded Money", money(counts.moneyCents))}
      ${setupDetail("Weapons", `${counts.weapons}`)}
      ${setupDetail("Armor", `${counts.armor}`)}
      ${setupDetail("Gear Items", `${counts.inventory}`)}
      ${setupDetail("Consumables", `${counts.consumables}`)}
      ${setupDetail("Ammo Pools", `${counts.ammo}`)}
      ${setupDetail("Vehicles", `${counts.vehicles}`)}
      ${setupDetail("Current Load", formatWeightPounds(normal.normalLoad))}
      ${setupDetail("Combat Load", formatWeightPounds(combat.combatLoad))}
      ${setupDetail("Carrying Capacity", formatWeightPounds(normal.carryingCapacity))}
      ${setupDetail("Normal Status", normal.encumbered ? "Encumbered" : "No encumbrance")}
      ${setupDetail("Combat Status", combat.encumbered ? "Encumbered" : "No encumbrance")}
      ${setupDetail("Audit Warnings", `${report.warnings.length}`)}
    </div>
    <p class="entry-advisory"><strong>Audit only:</strong> imported/current inventory may include post-creation purchases, loot, or table adjustments. Starting cash and starting purchase validation are deferred.</p>
    ${setupGearWarningMarkup(report)}
    <div class="setup-gear-groups">
      ${setupAuditGroup("Equipped / Worn", locationGroups.equipped, "No equipped or worn items recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("On Body / Carried", locationGroups.carried, "No carried gear recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Inside Containers", locationGroups.containers, "No container contents recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Dropped", locationGroups.dropped, "No dropped items recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Stored / Off-person", locationGroups.stored, "No stored or off-person items recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Containers", report.containers, "No containers recorded.", setupContainerAuditLine)}
      ${setupAuditGroup("Weapons", byType("weapon"), "No weapons recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Armor", byType("armor"), "No armor recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("General Gear", byType("gear"), "No general gear recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Consumables", byType("consumable"), "No consumables recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Ammunition", byType("ammo"), "No ammunition reserves recorded.", setupGearAuditEntryLine)}
      ${setupAuditGroup("Vehicles", locationGroups.vehicles, "No vehicles recorded.", setupGearAuditEntryLine)}
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
  const edgeReport = setupStartingEdgeValidationReport();
  const expectedHumanEdges = edgeReport.expectedHumanEdges;
  const humanEdges = edgeReport.humanFreeEdges.length;
  const hindranceEdgeSlots = edgeReport.hindranceEdgeSlots;
  const hindranceEdges = edgeReport.hindranceBenefitEdges.length;
  const edgeSelectionEditable = setupTraitsEditable();
  const powersCount = (character.powers || []).filter(
    (power) => power.name,
  ).length;
  const powerPoints = powerPointResource();
  const gearReport = setupGearAuditReport();
  const gearCounts = gearReport.counts;
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
      ${setupDetail("Gear Status", gearReport.status)}
      ${setupDetail("Gear Warnings", `${gearReport.warnings.length}`)}
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
      edgeSelectionEditable && edgeReport.invalidEdges.length
        ? `<p class="entry-warning">Edges need review: ${esc(
            edgeReport.invalidEdges
              .map((item) => item.validation.messages.join(" "))
              .join(" "),
          )}</p>`
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

