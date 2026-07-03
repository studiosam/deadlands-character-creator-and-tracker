/**
 * Character Setup rendering helpers.
 *
 * This module renders the setup workflow and audit UI from existing setup
 * state. It should call setup-actions.js for mutations and setup-model.js for
 * eligibility, warnings, and completion status.
 */
function setupStatusMarkup(status, label = status) {
  const className = slugify(status);
  return `<span class="setup-status ${className}">${esc(label)}</span>`;
}

function setupDetail(label, value, helpText = "") {
  const help = String(helpText || "").trim();
  return `<div class="setup-detail">
    <div class="setup-detail-label">
      <span>${esc(label)}</span>
      ${
        help
          ? `<span class="setup-detail-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
          : ""
      }
    </div>
    <strong>${esc(value || "—")}</strong>
  </div>`;
}

function setupMeterSummary(label, value, max, helpText = "") {
  const safeValue = Math.max(0, Number(value) || 0);
  const safeMax = Math.max(0, Number(max) || 0);
  const percentage =
    safeMax > 0 ? Math.min(100, Math.max(0, (safeValue / safeMax) * 100)) : 0;
  const help = String(helpText || "").trim();
  return `<article class="setup-trait-editor-row setup-attribute-points-card setup-hindrance-meter-card">
    ${
      help
        ? `<span class="setup-detail-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
        : ""
    }
    <div class="setup-attribute-editor-heading">
      <strong>${esc(label)}</strong>
      <span>${safeValue} / ${safeMax}</span>
    </div>
    <div class="setup-attribute-meter" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}">
      <span class="setup-attribute-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
    </div>
  </article>`;
}

function attributeHelpMarkup(label, helpText = "") {
  const help = String(helpText || "").trim();
  return help
    ? `<span class="attribute-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
    : "";
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
  return [...(character.skills || [])]
    .filter(isUserFacingSkill)
    .sort((left, right) =>
      String(left.name || "").localeCompare(
        String(right.name || ""),
        undefined,
        {
          numeric: true,
          sensitivity: "base",
        },
      ),
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
  const entries = Object.entries(SKILL_LINKED_ATTRIBUTES)
    .filter(([name]) => isUserFacingSkillName(name))
    .map(([name, linkedAttribute]) => {
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
    });

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

function setupEdgeSubchoiceIsRequirementFlag(value) {
  if (value === true) return true;
  const text = plainEntryName(value);
  return text === "required" || text === "required choice";
}

function setupEdgeRecordedSubchoice(edge) {
  return setupEdgeSubchoiceIsRequirementFlag(edge?.subchoice)
    ? ""
    : String(edge?.subchoice || "").trim();
}

function setupEdgeSubchoiceRequired(edge, catalog) {
  return (
    Boolean(setupEdgeRecordedSubchoice(edge)) ||
    setupEdgeSubchoiceIsRequirementFlag(edge?.subchoice) ||
    setupEdgeSubchoiceIsRequirementFlag(catalog?.subchoice)
  );
}

function setupArcaneBackgroundSummary(arcaneConfig) {
  return arcaneConfig
    ? `${arcaneConfig.displayName} uses ${arcaneConfig.arcaneSkill} and starts with ${arcaneConfig.startingPowerPoints} Power Points.`
    : "";
}

function setupEdgeAuditCard(edge) {
  const catalog = edgeCatalogEntry(edge);
  const arcaneConfig = arcaneBackgroundConfigFromEdge(edge.name);
  const likelySource = edgeLikelySource(edge);
  const startingEdgeValidation =
    setupTraitsEditable() &&
    ["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    )
      ? validateSetupStartingEdge(edge)
      : null;
  const requirements = catalog?.requirements || edge.requirements || "";
  const summary =
    setupArcaneBackgroundSummary(arcaneConfig) ||
    catalog?.shortSummary ||
    edge.shortSummary ||
    edge.notes ||
    "";
  const subchoiceRequired = setupEdgeSubchoiceRequired(edge, catalog);
  const recordedSubchoice = setupEdgeRecordedSubchoice(edge);
  const removable =
    setupTraitsEditable() &&
    ["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    );
  const visibleBadges = [
    likelySource === "Hindrance benefit Edge"
      ? setupEdgeBadge(likelySource)
      : "",
    startingEdgeValidation && !startingEdgeValidation.valid
      ? setupEdgeBadge("Needs review", "warning")
      : !startingEdgeValidation && !catalog
        ? setupEdgeBadge("Manual review", "warning")
        : "",
  ]
    .filter(Boolean)
    .join("");
  const visibleAdvisories = [
    ...(startingEdgeValidation?.messages || []),
    subchoiceRequired && !recordedSubchoice ? "Subchoice required." : "",
  ].filter(Boolean);
  const showVisibleRequirements =
    requirements && startingEdgeValidation && !startingEdgeValidation.valid;

  return `<article class="setup-edge-card${arcaneConfig ? " arcane" : ""}">
    <div class="setup-edge-card-head">
      <div>
        <h4>${esc(edge.name || "Unnamed Edge")}</h4>
        ${summary ? `<p class="setup-edge-effect"><strong>Effect:</strong> ${esc(summary)}</p>` : ""}
        ${requirements ? `<p class="setup-edge-requirements${showVisibleRequirements ? " warning" : ""}"><strong>Requirements:</strong> ${esc(requirements)}</p>` : ""}
      </div>
      <div class="setup-edge-badges">
        ${visibleBadges}
        ${
          removable
            ? `<button class="ghost tag-action danger-lite" type="button" data-setup-action="removeSetupEdge" data-edge-id="${esc(edge.id)}">Remove</button>`
            : ""
        }
      </div>
    </div>
    ${
      visibleAdvisories.length
        ? `<div class="setup-edge-advisories">${visibleAdvisories
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
  const benefitNavigation = (item) => {
    if (!canEdit || !item.count) return "";
    if (item.key === "extraAttributeRaisesFromHindrances") {
      return `<div class="creator-actions setup-benefit-navigation"><button type="button" data-setup-step="traits">Go to Attributes</button></div>`;
    }
    if (item.key === "extraSkillPointsFromHindrances") {
      return `<div class="creator-actions setup-benefit-navigation"><button type="button" data-setup-step="skills">Go to Skills</button></div>`;
    }
    if (item.key === "extraEdgesFromHindrances") {
      return `<div class="creator-actions setup-benefit-navigation"><button type="button" data-setup-step="edges">Go to Edges</button></div>`;
    }
    return "";
  };
  return `<section class="setup-trait-group setup-benefit-spending" aria-labelledby="setupHindranceBenefitsHeading">
    <h4 id="setupHindranceBenefitsHeading">Spend Hindrance Benefits</h4>
    <p class="creator-note">Benefit Points may buy Attribute raises, extra Edge slots, Skill points, or extra starting money.</p>
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
              <button class="tag-action" type="button" data-setup-action="decHindranceBenefit" data-benefit-key="${esc(item.key)}"${canDecrease ? "" : " disabled"}>-</button>
              <span>${esc(`${item.count} ${label}`)}</span>
              <button class="tag-action" type="button" data-setup-action="incHindranceBenefit" data-benefit-key="${esc(item.key)}"${canIncrease ? "" : " disabled"}>+</button>
            </div>
            ${benefitNavigation(item)}
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

function setupHindranceResetAvailable(stats, spending) {
  return Boolean(
    stats.count ||
    spending.spent ||
    setupHindranceBenefitEdges().length ||
    character.creation?.noHindrancesAcknowledged,
  );
}

function renderSetupHindranceBenefitEdgeSelection() {
  const canEdit = setupTraitsEditable();
  const report = setupStartingEdgeValidationReport();
  const edgeSlots = report.hindranceEdgeSlots;
  const selectedEdges = report.hindranceBenefitEdges;
  if (!canEdit || (!edgeSlots && !selectedEdges.length)) return "";

  const openSlots = Math.max(0, edgeSlots - selectedEdges.length);
  return `<div class="setup-hindrance-benefit-edge-selection">
    <div class="setup-edge-pick-copy">
      <strong>Hindrance Benefit Edges</strong>
      <span>${selectedEdges.length} / ${edgeSlots} selected</span>
    </div>
    <p class="creator-note">You spent Hindrance points on extra starting Edge slots. Choose those paid Edges here.</p>
    ${
      openSlots
        ? `<article class="setup-edge-pick-card">
            <div class="setup-edge-pick-copy">
              <strong>Paid Edge Slot</strong>
              <span>${openSlots} open</span>
            </div>
            <label>Edge<select id="setupHindranceBenefitEdgeSelect">${setupEdgeCatalogOptions("Choose Hindrance Benefit Edge...")}</select></label>
            <div id="setupHindranceBenefitEdgePreview" class="setup-edge-preview-slot">${setupEdgeSelectionPreviewMarkup("")}</div>
            <button type="button" data-setup-action="addHindranceBenefitEdge">Add Hindrance Benefit Edge</button>
          </article>`
        : '<p class="creator-note">All paid Edge slots are filled. Remove a selected Hindrance benefit Edge before choosing a different one.</p>'
    }
    <div class="setup-edge-list">
      ${
        selectedEdges.length
          ? selectedEdges.map(setupEdgeAuditCard).join("")
          : emptyState("No Hindrance benefit Edges selected yet.")
      }
    </div>
  </div>`;
}

function setupHindranceCardActions(hindrance) {
  if (!setupTraitsEditable()) return "";
  if (plainEntryName(hindrance?.name) !== "elderly") return "";
  const skillStats = setupSkillPointStats();
  if (!skillStats.elderlySmartsSkillPoints) return "";

  return `<div class="creator-actions setup-hindrance-card-actions">
      <button type="button" data-setup-step="skills">Go to Skills</button>
    </div>`;
}

function renderCharacterSetup() {
  if (!els.characterSetupStepper || !els.characterSetupContent) return;
  characterSetupStep = validSetupStepId(characterSetupStep);

  els.characterSetupStepper.innerHTML = CHARACTER_SETUP_STEPS.map(
    (step, index) => {
      const active = step.id === characterSetupStep;
      const status = characterSetupStatus(step.id);
      const statusLabel =
        step.id === "hindrances"
          ? setupHindranceStatusLabel(
              status,
              hindrancePointStats(),
              setupHindranceBenefitSpending(),
            )
          : status === "Not applicable"
            ? "N/A"
            : status;
      return `<button class="setup-step ${active ? "active" : ""}" type="button" data-setup-step="${esc(step.id)}"${active ? ' aria-current="step"' : ""}>
        <span class="setup-step-label"><span class="setup-step-number">${index + 1}.</span><span>${esc(step.label)}</span></span>
        ${setupStatusMarkup(status, statusLabel)}
      </button>`;
    },
  ).join("");

  const renderers = {
    concept: renderSetupConcept,
    traits: renderSetupTraits,
    skills: renderSetupSkills,
    hindrances: renderSetupHindrances,
    attributesSkills: renderSetupTraits,
    edges: renderSetupEdges,
    powers: renderSetupPowers,
    gear: renderSetupGear,
    review: renderSetupReview,
  };

  els.characterSetupContent.innerHTML =
    (characterSetupStep === "review" ? renderSetupPersistencePanel() : "") +
    (renderers[characterSetupStep]?.() || renderSetupConcept()) +
    renderSetupStepNavigation();
}

function renderSetupPersistencePanel() {
  const reviewStep = characterSetupStep === "review";
  if (!reviewStep) return "";

  const finishLabel = character.creation?.finalized
    ? "Start Playing"
    : "Finish Setup & Start Playing";
  if (isUnsavedCharacterDraft()) {
    return `<div class="setup-persistence-panel unsaved">
      <div>
        <strong>Review and save character</strong>
        <p>This draft resumes on reload, but it is not a saved character slot until you save or finish setup.</p>
      </div>
      <div class="creator-actions">
        <button type="button" data-setup-action="saveDraftCharacter">Save Character</button>
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
      <strong>${character.creation?.finalized ? "Character ready to play" : "Review and save character"}</strong>
      <p>${
        character.creation?.finalized
          ? "This setup is marked finished. Use Start Playing to return to Combat."
          : "Review the setup summary, then save or finish this character."
      }</p>
    </div>
    <div class="creator-actions">
      <button class="ghost" type="button" data-setup-action="saveCharacterNow">Save Character</button>
      <button type="button" data-setup-action="confirmSetup">Confirm Setup</button>
      <button type="button" data-setup-action="finishSetup">${finishLabel}</button>
      <button class="ghost danger-lite" type="button" data-setup-action="deleteCharacterSlot">Delete Character</button>
    </div>
  </div>`;
}

function renderSetupStepNavigation() {
  const currentIndex = CHARACTER_SETUP_STEPS.findIndex(
    (step) => step.id === characterSetupStep,
  );
  const previousStep = CHARACTER_SETUP_STEPS[currentIndex - 1];
  const nextStep = CHARACTER_SETUP_STEPS[currentIndex + 1];
  if (!previousStep && !nextStep) return "";
  const nextLabel = setupNextStepButtonLabel(nextStep);
  return `<div class="setup-step-navigation">
    <div class="setup-step-navigation-previous">
      ${previousStep ? `<button class="ghost" type="button" data-setup-action="previousSetupStep">Previous: ${esc(previousStep.label)}</button>` : ""}
    </div>
    <div class="setup-step-navigation-next">
      ${nextStep ? `<button type="button" data-setup-action="nextSetupStep">${esc(nextLabel)}</button>` : ""}
    </div>
  </div>`;
}

function setupNextStepButtonLabel(nextStep) {
  if (!nextStep) return "";
  if (characterSetupStep !== "hindrances") return `Next: ${nextStep.label}`;
  const stats = hindrancePointStats();
  if (!stats.count) return "Continue without Hindrances";
  const spending = setupHindranceBenefitSpending(stats);
  if (spending.remaining > 0) return "Continue with Unspent Hindrance Points";
  return `Next: ${nextStep.label}`;
}

function renderSetupConcept() {
  const status = characterSetupStatus("concept");
  return `<section id="setupConceptPanel" class="setup-step-panel" aria-labelledby="setupConceptHeading">
    <div class="section-title">
      <div>
        <h3 id="setupConceptHeading">Concept</h3>
        <p>Sketch the character's identity first. Name, gender, age, and title are required before Concept is complete.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-form-grid">
      <label>Character name<input id="setupNameInput" data-concept-field="name" value="${esc(character.name || "")}" placeholder="Character Name" autocomplete="off"></label>
      <label>Gender<input id="setupGenderInput" data-concept-field="gender" value="${esc(character.gender || "")}" placeholder="Gender Identity" autocomplete="off" list="setupGenderOptions"></label>
      <label>Age<input id="setupAgeInput" data-concept-field="age" value="${esc(character.age || "")}" placeholder="32" autocomplete="off"></label>
      <label>Profession or Title<input id="setupArchetypeInput" data-concept-field="archetype" value="${esc(character.archetype || "")}" placeholder="Profession or Title" autocomplete="off"></label>
      <label>Player Name<input id="setupPlayerInput" data-concept-field="player" value="${esc(character.player || "")}" placeholder="Player Name" autocomplete="off"></label>
      <div class="setup-readonly-field">
        <span>Race / Ancestry</span>
        <div class="setup-form-detail readonly"><div class="setup-readonly-value"><strong>${esc(character.ancestry || "Human")}</strong></div></div>
      </div>
      <label class="setup-wide">Description<textarea id="setupDescriptionInput" data-concept-field="description" rows="4" placeholder="Tall, wary, dusty coat">${esc(character.description || "")}</textarea></label>
      <label class="setup-wide">Background<textarea id="setupBackgroundInput" data-concept-field="background" rows="5" placeholder="Why they ride">${esc(character.background || "")}</textarea></label>
      <datalist id="setupGenderOptions">
        <option value="Female"></option>
        <option value="Male"></option>
        <option value="Nonbinary"></option>
      </datalist>
    </div>
    ${
      isHumanAncestry(character.ancestry)
        ? ""
        : '<p class="entry-warning">Needs review: this profile currently supports Human only.</p>'
    }
  </section>`;
}

function renderSetupHindranceRows() {
  return (character.hindrances || []).length
    ? character.hindrances
        .map((hindrance) => {
          const summary = setupHindranceDisplaySummary(hindrance);
          return `<article class="setup-hindrance-row">
              <div class="setup-hindrance-card-copy">
                <strong>${esc(hindrance.name || "Unnamed Hindrance")}</strong>
                <span class="setup-hindrance-meta">${esc(hindrance.severity || "Unknown")} • ${esc(hindrancePointText(hindrance))}</span>
                ${summary ? `<p class="setup-hindrance-summary">${esc(summary)}</p>` : ""}
                ${hindrance.notes ? `<p class="setup-hindrance-notes">Note: ${esc(hindrance.notes)}</p>` : ""}
                ${setupHindranceCardActions(hindrance)}
              </div>
              <button class="ghost tag-action danger-lite" type="button" data-setup-action="removeHindrance" data-hindrance-id="${esc(hindrance.id)}">Remove</button>
            </article>`;
        })
        .join("")
    : emptyState("No Hindrances selected yet.");
}

function renderSetupHindranceSelectionControls() {
  return `<section class="setup-trait-group setup-hindrance-entry-card" aria-labelledby="setupHindranceEntryHeading">
    <h4 id="setupHindranceEntryHeading">Add Hindrance</h4>
    <p class="creator-note">Choose the Hindrance, confirm its severity, and add any table-specific notes before spending its benefit points.</p>
    <div class="setup-form-grid setup-hindrance-form">
      <label class="setup-hindrance-name">Hindrance<select id="setupHindranceCatalogSelect">${setupHindranceCatalogOptions("Choose Hindrance...")}</select></label>
      <label class="setup-hindrance-severity">Severity<select id="setupHindranceSeverityInput"><option value="Minor">Minor</option><option value="Major">Major</option></select></label>
      <label class="setup-hindrance-notes">Notes<input id="setupHindranceNotesInput" autocomplete="off" placeholder="Optional detail, obligation, enemy, vow, phobia, etc."></label>
      <div id="setupHindrancePreview" class="setup-hindrance-preview-slot setup-wide">${setupHindranceSelectionPreviewMarkup("")}</div>
      <div class="creator-actions setup-wide">
        <button id="setupAddHindranceBtn" type="button" data-setup-action="addHindrance">Add Hindrance</button>
      </div>
    </div>
  </section>`;
}

function setupHindranceCatalogOptions(placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...HINDRANCE_CATALOG.map(
      (item) =>
        `<option value="${esc(item.id)}">${esc(item.name)}${item.severity ? ` • ${esc(item.severity)}` : ""}</option>`,
    ),
  ].join("");
}

function setupHindranceSelectionPreviewMarkup(
  hindranceId,
  selectedSeverity = "",
  emptyText = "Choose a Hindrance to preview what it does.",
) {
  const hindrance = chosen(HINDRANCE_CATALOG, hindranceId || "");
  if (!hindrance) {
    return `<div class="setup-hindrance-selection-preview empty">${esc(emptyText)}</div>`;
  }
  const severity = hindrance.severity
    ? `<span>${esc(hindrance.severity)}</span>`
    : "";
  const summary = setupHindranceDisplaySummary(hindrance, selectedSeverity);
  return `<div class="setup-hindrance-selection-preview">
    <strong>${esc(hindrance.name)}</strong>
    ${severity}
    ${summary ? `<p>${esc(summary)}</p>` : "<p>No short summary recorded yet.</p>"}
  </div>`;
}

function updateSetupHindranceSelectionPreview() {
  const select = document.getElementById("setupHindranceCatalogSelect");
  const severity = document.getElementById("setupHindranceSeverityInput");
  const preview = document.getElementById("setupHindrancePreview");
  if (!select || !preview) return;
  preview.innerHTML = setupHindranceSelectionPreviewMarkup(
    select.value,
    severity?.value || "",
  );
}

function setupHindranceCatalogEntryForRecord(hindrance) {
  const catalogId = hindrance?.catalogId || hindrance?.id || "";
  const name = plainEntryName(hindrance?.name);
  return (
    chosen(HINDRANCE_CATALOG, catalogId) ||
    HINDRANCE_CATALOG.find((item) => plainEntryName(item.name) === name) ||
    null
  );
}

function setupHindranceDisplaySummary(hindrance, selectedSeverity = "") {
  const catalog = setupHindranceCatalogEntryForRecord(hindrance) || hindrance;
  const severity = selectedSeverity || hindrance?.severity || "";
  return (
    catalog?.severitySummaries?.[severity] ||
    hindrance?.severitySummaries?.[severity] ||
    catalog?.shortSummary ||
    hindrance?.shortSummary ||
    hindrance?.summary ||
    hindrance?.notes ||
    ""
  );
}

function setupHindranceStatusLabel(status, stats, spending) {
  if (stats.unknownCount) return "Needs Severity";
  if (spending.spent > spending.available) return "Overspent";
  if (status === "Needs review") return "Needs Fix";
  if (status === "Complete") return stats.count ? "Ready" : "Optional";
  return status;
}

function renderSetupHindrances() {
  const stats = hindrancePointStats();
  const spending = setupHindranceBenefitSpending(stats);
  const status = characterSetupStatus("hindrances");
  const statusLabel = setupHindranceStatusLabel(status, stats, spending);
  return `<section id="setupHindrancesPanel" class="setup-step-panel" aria-labelledby="setupHindrancesHeading">
    <div class="section-title">
      <div>
        <h3 id="setupHindrancesHeading">Hindrances</h3>
        <p>Hindrances are optional flaws, obligations, or complications. Minor Hindrances grant 1 Benefit Point, and Major Hindrances grant 2. Up to ${stats.benefitCap} Benefit Points can be spent on starting benefits.</p>
      </div>
      ${setupStatusMarkup(status, statusLabel)}
    </div>
    <div class="setup-review-grid setup-hindrance-summary-grid">
      ${setupMeterSummary("Benefit Points", stats.benefitPoints, stats.benefitCap, "Earned Hindrance Benefit Points that count toward starting benefits under the default cap.")}
      ${setupMeterSummary("Benefits Spent", spending.spent, spending.available, "Benefit Points already allocated to starting benefits below.")}
    </div>
    ${
      stats.overCap
        ? `<div class="entry-advisory"><p>You may record more than ${stats.benefitCap} Hindrance points for character flavor, but only ${stats.benefitCap} Benefit Points should count for starting benefits by default.</p><p><strong>Above the standard cap:</strong> ${stats.total} Hindrance points selected; extra rewards require a table or GM exception.</p></div>`
        : ""
    }
    ${
      stats.unknownCount
        ? '<p class="entry-warning">Needs Severity: one or more Hindrances need Minor or Major severity.</p>'
        : ""
    }
    ${
      spending.spent > spending.available
        ? `<p class="entry-warning">Overspent: ${spending.spent} Benefit Points are spent, but only ${spending.available} are available.</p>`
        : ""
    }
    ${renderSetupHindranceSelectionControls()}
    <section class="setup-trait-group setup-selected-hindrances" aria-labelledby="setupSelectedHindrancesHeading">
      <div class="setup-section-heading-row">
        <h4 id="setupSelectedHindrancesHeading">Selected Hindrances</h4>
        <button class="ghost small-action danger-lite" type="button" data-setup-action="resetSetupHindrances"${setupHindranceResetAvailable(stats, spending) ? "" : " disabled"}>Reset Hindrances</button>
      </div>
      <div class="setup-hindrance-list">
        ${renderSetupHindranceRows()}
      </div>
    </section>
    ${stats.count ? renderSetupHindranceBenefitRows(stats) : ""}
  </section>`;
}

function setupAttributeDiceControls(
  key,
  currentDie,
  decreaseDisabled,
  increaseDisabled,
) {
  return `<div class="setup-trait-controls setup-attribute-dice-controls" aria-label="${esc(`${displayNameFromKey(key)} die value ${currentDie}`)}">
    <button class="ghost tag-action" type="button" data-setup-action="decAttribute" data-trait-name="${esc(key)}"${decreaseDisabled ? " disabled" : ""}>−</button>
    <div class="setup-die-track" aria-hidden="true">
      ${DIE_STEPS.map(
        (step) =>
          `<span class="setup-die-step${step === currentDie ? " current" : ""}">${esc(step)}</span>`,
      ).join("")}
    </div>
    <button class="ghost tag-action" type="button" data-setup-action="incAttribute" data-trait-name="${esc(key)}"${increaseDisabled ? " disabled" : ""}>+</button>
  </div>`;
}

function setupAttributePointCard(attributeStats) {
  const spent = Math.max(0, Number(attributeStats.spent) || 0);
  const available = Math.max(0, Number(attributeStats.available) || 0);
  const percentage =
    available > 0 ? Math.min(100, Math.max(0, (spent / available) * 100)) : 0;

  return `<article class="setup-trait-editor-row setup-attribute-editor-row setup-attribute-points-card">
    <div class="setup-attribute-editor-heading">
      <strong>Attribute Points</strong>
      <span>${spent} / ${available} assigned</span>
    </div>
    <div class="setup-attribute-meter" role="meter" aria-label="Attribute Points assigned" aria-valuemin="0" aria-valuemax="${available}" aria-valuenow="${spent}">
      <span class="setup-attribute-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
    </div>
    <div class="setup-attribute-meter-actions">
      <button class="ghost small-action" type="button" data-setup-action="resetAttributes" aria-label="Reset Attributes to d4" title="Reset Attributes to d4"${spent <= 0 ? " disabled" : ""}>Reset</button>
    </div>
  </article>`;
}

function setupAttributeEditorRow(key, attributeStats) {
  const die = character.attributes?.[key] || "d4";
  const index = getDieStepIndex(die);
  const label = displayNameFromKey(key);
  const note = attributeUseNote(key);
  return `<article class="setup-trait-editor-row setup-attribute-editor-row">
    ${attributeHelpMarkup(label, note)}
    <div class="setup-attribute-editor-heading">
      <strong>${esc(label)}</strong>
    </div>
    ${setupAttributeDiceControls(key, die, index <= 0, index >= DIE_STEPS.length - 1 || attributeStats.spent >= attributeStats.available)}
  </article>`;
}

function setupSkillDiceControls(
  skillName,
  currentDie,
  decreaseDisabled,
  increaseDisabled,
  baselineDie = "",
) {
  const skillDieSteps = ["d4-2", ...DIE_STEPS];
  const baselineIndex = baselineDie ? getDieStepIndex(baselineDie) : -1;
  return `<div class="setup-trait-controls setup-skill-dice-controls" aria-label="${esc(`${skillName} die value ${currentDie}`)}">
    <button class="ghost tag-action" type="button" data-setup-action="decSkill" data-trait-name="${esc(skillName)}"${decreaseDisabled ? " disabled" : ""}>−</button>
    <div class="setup-die-track" aria-hidden="true">
      ${skillDieSteps
        .map((step) => {
          const stepIndex = step === "d4-2" ? -1 : getDieStepIndex(step);
          const unavailable = stepIndex < baselineIndex;
          return `<span class="setup-die-step${step === currentDie ? " current" : ""}${unavailable ? " unavailable" : ""}"${unavailable ? ' data-unavailable="true"' : ""}>${esc(step)}</span>`;
        })
        .join("")}
    </div>
    <button class="ghost tag-action" type="button" data-setup-action="incSkill" data-trait-name="${esc(skillName)}"${increaseDisabled ? " disabled" : ""}>+</button>
  </div>`;
}

function setupSkillPointCard(skillStats) {
  const spent = Math.max(0, Number(skillStats.spent) || 0);
  const available = Math.max(0, Number(skillStats.available) || 0);
  const percentage =
    available > 0 ? Math.min(100, Math.max(0, (spent / available) * 100)) : 0;

  return `<article class="setup-trait-editor-row setup-skill-editor-row setup-skill-points-card">
    <div class="setup-skill-editor-heading">
      <strong>Skill Points</strong>
      <span>${spent} / ${available} assigned</span>
      ${
        skillStats.elderlySmartsSkillPoints
          ? `<small>Includes ${skillStats.elderlySmartsSkillPoints} Elderly points for Smarts-linked skills only.</small>`
          : ""
      }
    </div>
    <div class="setup-skill-meter" role="meter" aria-label="Skill Points assigned" aria-valuemin="0" aria-valuemax="${available}" aria-valuenow="${spent}">
      <span class="setup-skill-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
    </div>
    <div class="setup-skill-meter-actions">
      <button class="ghost small-action" type="button" data-setup-action="resetSkills" aria-label="Reset Skills to starting values" title="Reset Skills to starting values"${spent <= 0 ? " disabled" : ""}>Reset</button>
    </div>
  </article>`;
}

function setupElderlySkillPointCard(skillStats) {
  if (!skillStats.elderlySmartsSkillPoints) return "";
  const spent = Math.max(
    0,
    Number(skillStats.elderlySmartsSkillPointsUsed) || 0,
  );
  const available = Math.max(
    0,
    Number(skillStats.elderlySmartsSkillPoints) || 0,
  );
  const percentage =
    available > 0 ? Math.min(100, Math.max(0, (spent / available) * 100)) : 0;

  return `<article class="setup-trait-editor-row setup-skill-editor-row setup-skill-points-card">
    <div class="setup-skill-editor-heading">
      <strong>Elderly Smarts Skill Points</strong>
      <span>${spent} / ${available} assigned</span>
      <small>These points can only pay for skills linked to Smarts.</small>
    </div>
    <div class="setup-skill-meter" role="meter" aria-label="Elderly Smarts Skill Points assigned" aria-valuemin="0" aria-valuemax="${available}" aria-valuenow="${spent}">
      <span class="setup-skill-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
    </div>
  </article>`;
}

function setupSkillUpgradeCost(skill) {
  if (!skill?.name) return Infinity;
  const currentCost = skill.isUnskilled ? 0 : setupSkillPointCost(skill);
  const definition = setupSkillDefinition(skill.name);
  const nextSkill = skill.isUnskilled
    ? {
        name: skill.name,
        die: setupStartingSkillBaselineDie(skill.name) || "d4",
        linkedAttribute: skill.linkedAttribute || definition.linkedAttribute,
        core: definition.core,
      }
    : { ...skill };

  if (!skill.isUnskilled) {
    const currentIndex = getDieStepIndex(skill.die || skill.value);
    if (currentIndex < 0 || currentIndex >= DIE_STEPS.length - 1)
      return Infinity;
    nextSkill.die = setupTraitDieFromIndex(currentIndex + 1);
  }

  return Math.max(0, setupSkillPointCost(nextSkill) - currentCost);
}

function setupSkillUpgradeCostText(skill) {
  const upgradeCost = setupSkillUpgradeCost(skill);
  return Number.isFinite(upgradeCost)
    ? `Upgrade Cost ${upgradeCost}`
    : "Upgrade Cost —";
}

function setupSkillEditorRow(skill) {
  const linkedAttribute = setupSkillAttributeKey(skill.linkedAttribute);
  const referenceName = skillReferenceName(skill.name);
  const useNote = skillUseNote(skill.name);
  const displayDie = skill.isUnskilled
    ? "d4-2"
    : skill.die || skill.value || "—";
  const index = getDieStepIndex(skill.die || skill.value);
  const baselineDie = setupStartingSkillBaselineDie(skill.name);
  const baselineIndex = baselineDie ? getDieStepIndex(baselineDie) : -1;
  const decreaseDisabled = skill.isUnskilled || index <= baselineIndex;
  const increaseDisabled = !skill.isUnskilled && index >= DIE_STEPS.length - 1;
  const meta = [setupSkillUpgradeCostText(skill)].filter(Boolean);
  const help = [
    useNote,
    `Linked attribute: ${displayNameFromKey(linkedAttribute) || linkedAttribute}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return `<article class="setup-trait-editor-row setup-skill-editor-row skill-row${skill.isUnskilled ? " unskilled" : ""}">
    ${attributeHelpMarkup(referenceName, help)}
    <div class="setup-skill-editor-heading">
      <strong>${esc(skill.name || "Skill")}</strong>
      <span>${esc(meta.join(" • "))}</span>
    </div>
    ${setupSkillDiceControls(skill.name, displayDie, decreaseDisabled, increaseDisabled, baselineDie)}
  </article>`;
}

function renderSetupTraitAttributeGroup(attributeStats) {
  if (setupTraitsEditable()) {
    return `<div class="setup-trait-editor-list setup-attribute-editor-list">
      ${setupAttributePointCard(attributeStats)}
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
        <div class="${editable ? "setup-trait-editor-list setup-skill-editor-list" : "skill-chip-grid"}">
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
  const editable = setupTraitsEditable();
  const hasAdvances = (character.advances || []).length > 0;
  const attributeStats = setupAttributePointStats();

  return `<section id="setupTraitsPanel" class="setup-step-panel" aria-labelledby="setupAttributesHeading">
    ${
      hasAdvances
        ? '<p class="entry-advisory"><strong>Advanced character:</strong> this view shows recorded Attribute values. Attribute editing is locked here; use the Advances tab for current Attribute increases.</p>'
        : ""
    }
    ${
      !editable && !hasAdvances && !setupCharacterIsCreated()
        ? '<p class="entry-advisory"><strong>Audit only:</strong> imported or sample characters do not expose editable starting Attributes until import reconstruction exists.</p>'
        : ""
    }
    <div class="setup-trait-groups">
      <section class="setup-trait-group" aria-labelledby="setupAttributesHeading">
        <h4 id="setupAttributesHeading">Attributes</h4>
        ${
          editable
            ? '<p class="creator-note">Attribute raises cost 1 point per step above d4. Use Hindrance benefits later if this draft needs extra Attribute points.</p>'
            : ""
        }
        ${renderSetupTraitAttributeGroup(attributeStats)}
      </section>
    </div>
  </section>`;
}

function renderSetupSkills() {
  const setupSkills = setupSkillCatalogEntries();
  const editable = setupTraitsEditable();
  const hasAdvances = (character.advances || []).length > 0;
  const skillPointStats = setupSkillPointStats();

  return `<section id="setupSkillsPanel" class="setup-step-panel" aria-labelledby="setupSkillsListHeading">
    ${
      hasAdvances
        ? '<p class="entry-advisory"><strong>Advanced character:</strong> this view shows recorded skill values. Skill editing is locked here; use the Advances tab for current skill increases.</p>'
        : ""
    }
    ${
      !editable && !hasAdvances && !setupCharacterIsCreated()
        ? '<p class="entry-advisory"><strong>Audit only:</strong> imported or sample characters do not expose editable starting Skills until import reconstruction exists.</p>'
        : ""
    }
    <div class="setup-trait-groups">
      <section class="setup-trait-group setup-skills-group" aria-labelledby="setupSkillsListHeading">
        <h4 id="setupSkillsListHeading">Skills</h4>
        ${
          editable
            ? `<p class="creator-note setup-skill-rules-note">Athletics, Common Knowledge, Notice, Persuasion, and Stealth start at d4; Language starts at d8. Other skills start Unskilled (d4-2).<br />Each purchased step costs 1 point up to the linked Attribute, or 2 points above it.${skillPointStats.elderlySmartsSkillPoints ? "<br />Elderly grants 5 extra Skill points that can only be spent on Smarts-linked skills." : ""}</p>
        <div class="setup-trait-editor-list setup-skill-editor-list setup-skill-overview-list">
          ${setupSkillPointCard(skillPointStats)}
          ${setupElderlySkillPointCard(skillPointStats)}
        </div>`
            : '<p class="creator-note">This list includes every skill in the current Deadlands profile. Missing skills are shown at d4-2.</p>'
        }
        ${
          skillPointStats.genericOverBudget
            ? '<p class="entry-warning">Needs review: Elderly Skill points can only pay for Smarts-linked skills. Reduce non-Smarts Skill purchases or add regular Skill points.</p>'
            : ""
        }
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
    (edge) =>
      isUserFacingEdgeCatalogEntry(edge) &&
      !selectedNames.has(plainEntryName(edge.name)),
  );
  return [
    `<option value="">${placeholder}</option>`,
    ...availableEdges.map(
      (edge) =>
        `<option value="${esc(edge.id)}">${esc(setupEdgeOptionLabel(edge))}</option>`,
    ),
  ].join("");
}

function setupEdgeSelectionPreviewMarkup(
  edgeId,
  emptyText = "Choose an Edge to preview what it does.",
) {
  const edge = chosen(EDGE_CATALOG, edgeId || "");
  if (!edge) {
    return `<div class="setup-edge-selection-preview empty">${esc(emptyText)}</div>`;
  }
  const details = [edge.category, edge.rank].filter(Boolean).join(" • ");
  const requirements = edge.requirements
    ? `<p><strong>Requirements:</strong> ${esc(edge.requirements)}</p>`
    : "";
  const summary = edge.shortSummary || edge.summary || edge.notes || "";
  return `<div class="setup-edge-selection-preview">
    <strong>${esc(edge.name)}</strong>
    ${details ? `<span>${esc(details)}</span>` : ""}
    ${summary ? `<p>${esc(summary)}</p>` : "<p>No short summary recorded yet.</p>"}
    ${requirements}
  </div>`;
}

function updateSetupEdgeSelectionPreview(selectId, previewId) {
  const select = document.getElementById(selectId);
  const preview = document.getElementById(previewId);
  if (!select || !preview) return;
  preview.innerHTML = setupEdgeSelectionPreviewMarkup(select.value);
}

function renderSetupEdgeSelectionControls() {
  const canEdit = setupTraitsEditable();
  const report = setupStartingEdgeValidationReport();
  const expectedHumanEdges = report.expectedHumanEdges;
  const humanEdges = report.humanFreeEdges.length;

  if (!canEdit) {
    return `<p class="entry-advisory"><strong>Audit only:</strong> imported or advanced characters keep their existing Edge records here. Use Advances for later Edge changes.</p>`;
  }

  return `<section class="setup-trait-group setup-edge-selection" aria-labelledby="setupEdgeSelectionHeading">
    <h4 id="setupEdgeSelectionHeading">Edges</h4>
    <p class="creator-note setup-edge-rules-note">Choose the free Human starting Edge here. If Hindrance points buy extra Edge slots, those paid choices appear below.</p>
    <div class="setup-edge-pick-list">
    ${
      expectedHumanEdges
        ? `<article class="setup-edge-pick-card">
          <div class="setup-edge-pick-copy">
            <strong>Free Edge</strong>
            <span>${humanEdges} / ${expectedHumanEdges} selected</span>
          </div>
          <label>Edge<select id="setupHumanFreeEdgeSelect"${humanEdges >= expectedHumanEdges ? " disabled" : ""}>${setupEdgeCatalogOptions("Choose Free Edge...")}</select></label>
          <div id="setupHumanFreeEdgePreview" class="setup-edge-preview-slot">${setupEdgeSelectionPreviewMarkup("")}</div>
          <button type="button" data-setup-action="addHumanFreeEdge"${humanEdges >= expectedHumanEdges ? " disabled" : ""}>Add Free Edge</button>
        </article>`
        : '<p class="creator-note">This ancestry does not grant a built-in Human free Edge.</p>'
    }
    </div>
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
  const humanFreeEdges = report.humanFreeEdges;
  const humanEdges = humanFreeEdges.length;
  const hindranceEdgeSlots = report.hindranceEdgeSlots;
  const hindranceEdges = report.hindranceBenefitEdges.length;
  const edgeSelectionEditable = setupTraitsEditable();
  const status = characterSetupStatus("edges");
  const warnings = [
    edgeSelectionEditable && hindranceEdges < hindranceEdgeSlots
      ? "Incomplete: choose paid Hindrance benefit Edges below, or adjust Hindrance benefit spending."
      : "",
    edgeSelectionEditable && hindranceEdges > hindranceEdgeSlots
      ? "Needs review: one or more Hindrance benefit Edges are not covered by Hindrance benefit spending and must be removed."
      : "",
    edgeSelectionEditable && report.invalidEdges.length
      ? `Needs review: ${report.invalidEdges
          .map((item) => item.validation.messages.join(" "))
          .join(" ")}`
      : "",
    arcaneEdges.length > 1
      ? "Needs review: more than one Arcane Background Edge is recorded."
      : "",
  ].filter(Boolean);

  if (edgeSelectionEditable) {
    return `<section id="setupEdgesPanel" class="setup-step-panel" aria-labelledby="setupEdgeSelectionHeading">
      <div class="setup-trait-groups">
        ${renderSetupEdgeSelectionControls()}
        ${
          warnings.length
            ? `<div class="setup-review-warnings">${warnings
                .map(
                  (warning) => `<p class="entry-warning">${esc(warning)}</p>`,
                )
                .join("")}</div>`
            : ""
        }
        <section class="setup-trait-group setup-selected-edges" aria-labelledby="setupSelectedEdgesHeading">
          <h4 id="setupSelectedEdgesHeading">Selected Free Edge</h4>
          <div class="setup-edge-list">
            ${
              humanFreeEdges.length
                ? humanFreeEdges.map(setupEdgeAuditCard).join("")
                : emptyState("No free Edge selected yet.")
            }
          </div>
        </section>
        ${renderSetupHindranceBenefitEdgeSelection()}
      </div>
    </section>`;
  }

  return `<section id="setupEdgesPanel" class="setup-step-panel" aria-labelledby="setupEdgesHeading">
    <div class="section-title">
      <div>
        <h3 id="setupEdgesHeading">Edges</h3>
        <p>Review recorded Edges and keep their creation source separate from later Advances. Human free Edge selection and Hindrance-paid Edge selection both happen here.</p>
      </div>
      ${setupStatusMarkup(status)}
    </div>
    <div class="setup-review-grid">
      ${setupDetail("Recorded Edges", `${edges.length}`)}
      ${setupDetail("Catalog Matches", `${catalogMatches}`)}
      ${setupDetail("Arcane Background Edges", `${arcaneEdges.length}`)}
      ${setupDetail("Advance-Looking Edges", `${advanceEdges.length}`)}
      ${setupDetail("Free Edge", edgeSelectionEditable ? `${humanEdges} / ${expectedHumanEdges}` : "Source unknown")}
      ${setupDetail("Hindrance Benefit Edges", edgeSelectionEditable ? `${hindranceEdges} / ${hindranceEdgeSlots}` : "Source unknown")}
    </div>
    ${renderSetupEdgeSelectionControls()}
    <p class="entry-advisory"><strong>Audit only:</strong> imported characters may not preserve whether an Edge came from Human ancestry, Hindrance benefits, Advances, or a GM exception. Source labels below are hints unless they were created in this tool.</p>
    ${warnings.map((warning) => `<p class="entry-warning">${esc(warning)}</p>`).join("")}
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
  const removable =
    setupTraitsEditable() &&
    setupPowerCreationSource(power) === "setup-starting-power";
  const meta = [
    audit?.catalog ? "Catalog matched" : "Unknown/custom",
    audit?.allowed ? "Allowed" : "",
    audit?.required ? "Required" : "",
    setupPowerCreationSource(power) === "setup-starting-power"
      ? "Setup starting Power"
      : "",
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
    ${
      removable
        ? `<div class="creator-actions"><button type="button" data-setup-action="removeSetupStartingPower" data-power-id="${esc(power.id)}">Remove</button></div>`
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

function setupStartingPowerSelectOptions(report) {
  return [
    '<option value="">Choose starting Power...</option>',
    ...report.startingPowerOptions.map(
      (power) =>
        `<option value="${esc(power.id)}">${esc(power.name)} - ${esc(power.rank)} - ${esc(power.powerPoints)} PP</option>`,
    ),
  ].join("");
}

function renderSetupPowerSelectionControls(report) {
  if (!report.editable) {
    return `<p class="entry-advisory"><strong>Audit only:</strong> imported or advanced characters keep their recorded known powers here. Use Advances or Arcane controls for later Power changes.</p>`;
  }
  if (!report.profile) {
    return `<p class="creator-note">Select an Arcane Background Edge before choosing starting Powers.</p>`;
  }

  const disabled =
    !report.startingPowerSlotOpen || !report.startingPowerOptions.length;
  return `<section class="setup-trait-group" aria-labelledby="setupPowerSelectionHeading">
    <h4 id="setupPowerSelectionHeading">Select Starting Powers</h4>
    <p class="creator-note">Choose legal starting Powers from the matched Arcane Background profile. Setup-selected Powers are source-tagged separately from later Advancement Powers.</p>
    <div class="setup-form-grid">
      <label class="setup-wide">Starting Power<select id="setupStartingPowerSelect"${disabled ? " disabled" : ""}>${setupStartingPowerSelectOptions(report)}</select></label>
      <div class="creator-actions setup-wide">
        <button type="button" data-setup-action="addSetupStartingPower"${disabled ? " disabled" : ""}>Add Starting Power</button>
      </div>
    </div>
    ${
      !report.startingPowerSlotOpen
        ? '<p class="creator-note">All expected starting Power slots are filled.</p>'
        : !report.startingPowerOptions.length
          ? '<p class="creator-note">No additional legal starting Powers are currently available.</p>'
          : ""
    }
  </section>`;
}

function renderSetupPowerPointControls(report) {
  if (!report.editable || !report.profile) return "";
  const audit = report.powerPointsAudit;
  const hasExpectedPowerPoints = Boolean(audit?.complete);
  const buttonLabel = audit?.powerPoints
    ? "Update Starting Power Points"
    : "Add Starting Power Points";

  return `<section class="setup-trait-group" aria-labelledby="setupPowerPointsSelectionHeading">
    <h4 id="setupPowerPointsSelectionHeading">Setup Power Points</h4>
    <p class="creator-note">Set starting Power Points from the matched Arcane Background profile. Existing Power Points are preserved until you choose to update them.</p>
    <div class="setup-review-grid">
      ${setupDetail("Expected", `${report.expectedPowerPoints} Power Points`)}
      ${setupDetail("Recorded", audit?.statusText || "Not recorded")}
    </div>
    <div class="creator-actions">
      <button type="button" data-setup-action="setSetupStartingPowerPoints"${hasExpectedPowerPoints ? " disabled" : ""}>${hasExpectedPowerPoints ? "Starting Power Points Set" : buttonLabel}</button>
    </div>
  </section>`;
}

function renderSetupPowers() {
  const report = setupPowerAuditReport();
  const { profile, powers, skillAudit, powerPointsAudit, powerAudits, status } =
    report;
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
        <p>Select starting Powers for eligible created characters and audit Arcane Background, Power Points, and known powers for all characters.</p>
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
    ${renderSetupPowerPointControls(report)}
    ${renderSetupPowerSelectionControls(report)}
    ${
      status === "Not applicable"
        ? '<p class="creator-note">No Arcane Background is recorded, so this character does not need Powers during setup.</p>'
        : '<p class="entry-advisory"><strong>Power audit:</strong> imported powers may be current known powers rather than the exact creation-time power list. Created pre-advance characters can source-tag setup-selected starting Powers here.</p>'
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
                    )}</p>${
                      report.editable && !item.recorded
                        ? `<div class="creator-actions"><button type="button" data-setup-action="addSetupStartingPower" data-power-id="${esc(item.id)}"${report.startingPowerSlotOpen ? "" : " disabled"}>Add ${esc(item.label)}</button></div>`
                        : ""
                    }</article>`,
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
      vehicle.category || "",
      vehicle.size ? `Size ${vehicle.size}` : "",
      vehicle.handling ? `Handling ${vehicle.handling}` : "",
      vehicle.topSpeed !== undefined ? `Top Speed ${vehicle.topSpeed} MPH` : "",
      vehicle.toughness ? `Toughness ${vehicle.toughness}` : "",
      vehicle.crew ? `Crew ${vehicle.crew}` : "",
      vehicle.costCents !== undefined ? `Cost ${money(vehicle.costCents)}` : "",
      vehicle.book || "",
    ],
    vehicle.note || vehicle.notes || "",
  );
}

function setupGearAuditEntryLine(entry) {
  const item = entry.item || {};
  const details = [
    entry.type,
    setupGearEntryLocationLabel(entry),
    entry.type === "vehicle"
      ? ""
      : `Weight ${formatWeightPounds(entry.weight)}`,
    entry.catalog ? "Catalog matched" : "Manual review",
    item.source || "",
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

function setupPurchaseOptions(items, placeholder) {
  return [
    `<option value="">${esc(placeholder)}</option>`,
    ...items.map(
      (item) =>
        `<option value="${esc(item.id)}">${esc(item.name)} - ${esc(item.category || item.book || "Catalog")} - ${esc(money(item.costCents || 0))}</option>`,
    ),
  ].join("");
}

function setupQuantityInput(id) {
  return `<input id="${esc(id)}" class="creator-small" type="number" min="1" value="1" />`;
}

function setupPurchaseControl(title, selectId, qtyId, action, items) {
  return `<div class="setup-form-grid">
    <label class="setup-wide">${esc(title)}<select id="${esc(selectId)}">${setupPurchaseOptions(items, `Choose ${title.toLowerCase()}...`)}</select></label>
    <label>Qty ${setupQuantityInput(qtyId)}</label>
    <div class="creator-actions">
      <button type="button" data-setup-action="${esc(action)}">Buy ${esc(title)}</button>
    </div>
  </div>`;
}

function setupAmmoCaliberOptions() {
  const calibers = [
    ...new Set(
      Object.values(AMMO_CALIBERS_BY_CATALOG_ID).flat().filter(Boolean),
    ),
  ];
  return [
    '<option value="">Default caliber</option>',
    ...calibers.map(
      (caliber) => `<option value="${esc(caliber)}">${esc(caliber)}</option>`,
    ),
  ].join("");
}

function renderSetupGearPurchaseControls(report) {
  if (!report.editable) {
    return `<p class="entry-advisory"><strong>Audit only:</strong> imported or advanced characters keep their recorded gear here. Use Inventory for current possessions and future correction workflows for uncertain starting gear.</p>`;
  }

  return `<section class="setup-trait-group" aria-labelledby="setupGearPurchaseHeading">
    <h4 id="setupGearPurchaseHeading">Buy Starting Gear</h4>
    <p class="creator-note">Purchases use current setup funds, reduce remaining money, and source-tag records as setup starting gear.</p>
    <div class="setup-review-grid">
      ${setupDetail("Starting Funds Accounted", money(report.startingFundsAvailable))}
      ${setupDetail("Spent On Setup Gear", money(report.startingPurchaseSpent))}
      ${setupDetail("Remaining", money(report.moneyCents))}
    </div>
    ${setupPurchaseControl(
      "Gear",
      "setupGearPurchaseSelect",
      "setupGearPurchaseQty",
      "addSetupGearPurchase",
      GEAR_CATALOG.filter((item) => !isAmmo(item)),
    )}
    <div class="setup-form-grid">
      <label class="setup-wide">Ammunition<select id="setupAmmoPurchaseSelect">${setupPurchaseOptions(GEAR_CATALOG.filter(isAmmo), "Choose ammunition...")}</select></label>
      <label>Caliber<select id="setupAmmoPurchaseCaliber">${setupAmmoCaliberOptions()}</select></label>
      <label>Qty ${setupQuantityInput("setupAmmoPurchaseQty")}</label>
      <div class="creator-actions"><button type="button" data-setup-action="addSetupAmmoPurchase">Buy Ammunition</button></div>
    </div>
    ${setupPurchaseControl("Armor", "setupArmorPurchaseSelect", "setupArmorPurchaseQty", "addSetupArmorPurchase", ARMOR_CATALOG)}
    ${setupPurchaseControl("Weapon", "setupWeaponPurchaseSelect", "setupWeaponPurchaseQty", "addSetupWeaponPurchase", WEAPON_CATALOG)}
    ${setupPurchaseControl("Vehicle", "setupVehiclePurchaseSelect", "setupVehiclePurchaseQty", "addSetupVehiclePurchase", VEHICLE_CATALOG)}
  </section>`;
}

function renderSetupGear() {
  const report = setupGearAuditReport();
  const { counts, normal, combat, locationGroups } = report;
  const byType = (type) =>
    report.entries.filter((entry) => entry.type === type);

  return `<section id="setupGearPanel" class="setup-step-panel" aria-labelledby="setupGearHeading">
    <div class="section-title">
      <div>
        <h3 id="setupGearHeading">Gear</h3>
        <p>Buy starting gear for eligible created characters and audit recorded equipment, money, and load for all characters.</p>
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
      ${setupDetail("Setup Gear Spent", money(report.startingPurchaseSpent))}
      ${setupDetail("Audit Warnings", `${report.warnings.length}`)}
    </div>
    ${renderSetupGearPurchaseControls(report)}
    <p class="entry-advisory"><strong>Gear audit:</strong> imported/current inventory may include post-creation purchases, loot, or table adjustments. Setup purchases created here are source-tagged as starting gear.</p>
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
  const sourceAudit = setupSourceAuditReport();
  const sourceExceptionEditable = setupTraitsEditable();
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
      ${setupDetail("Free Edge", edgeSelectionEditable ? `${humanEdges} / ${expectedHumanEdges}` : "Source unknown")}
      ${setupDetail("Hindrance Benefit Edges", edgeSelectionEditable ? `${hindranceEdges} / ${hindranceEdgeSlots}` : "Source unknown")}
      ${setupDetail("Arcane Background Edges", `${arcaneEdgeCount}`)}
      ${setupDetail("Known Powers", `${powersCount}`)}
      ${setupDetail("Power Points", powerPoints ? `${powerPoints.current} / ${powerPoints.max || "—"}` : "Not recorded")}
      ${setupDetail("Gear Items", `${gearCounts.totalItems}`)}
      ${setupDetail("Money", money(gearCounts.moneyCents))}
      ${setupDetail("Gear Status", gearReport.status)}
      ${setupDetail("Gear Warnings", `${gearReport.warnings.length}`)}
      ${setupDetail("Setup Source Records", `${sourceAudit.explained.length} explained`)}
      ${setupDetail("Needs GM/Table Exception", `${sourceAudit.needsExceptions.length}`)}
      ${setupDetail("Description", character.description)}
      ${setupDetail("Background", character.background)}
    </div>
    ${
      ancestryNeedsReview
        ? '<p class="entry-warning">Needs review: this profile currently supports Human only.</p>'
        : ""
    }
    ${
      edgeSelectionEditable &&
      hindranceStats.count &&
      hindranceSpending.remaining > 0
        ? '<p class="entry-warning">Hindrances incomplete: spend remaining Benefit Points or remove enough Hindrances to leave no unspent Benefit Points.</p>'
        : ""
    }
    ${
      hindranceStats.overCap
        ? `<p class="entry-advisory"><strong>Above the standard Hindrance benefit cap:</strong> ${hindranceStats.total} points selected, ${hindranceStats.benefitPoints} Benefit Points under default rules. Record any extra reward as a table or GM exception.</p>`
        : ""
    }
    ${
      hindranceSpending.spent > hindranceSpending.available
        ? '<p class="entry-warning">Needs review: Hindrance benefit spending exceeds earned Benefit Points.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && humanEdges < expectedHumanEdges
        ? '<p class="entry-warning">Edges incomplete: select the Human free starting Edge.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && hindranceEdges < hindranceEdgeSlots
        ? '<p class="entry-warning">Hindrances incomplete: choose all paid Hindrance benefit Edges or adjust Hindrance benefit spending.</p>'
        : ""
    }
    ${
      edgeSelectionEditable && hindranceEdges > hindranceEdgeSlots
        ? '<p class="entry-warning">Edges need review: one or more Hindrance benefit Edges are not covered by Hindrance benefit spending and must be removed.</p>'
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
    <div class="setup-review-list">
      <h4>Setup Source Audit</h4>
      ${
        sourceAudit.records.length
          ? sourceAudit.records
              .map(
                (record) =>
                  `<article class="dossier-note${record.needsException ? " warning" : ""}"><strong>${esc(record.type)}: ${esc(record.label)}</strong><p>${
                    record.needsException
                      ? "Needs a GM/table exception note or a specific setup source."
                      : `Explained by ${esc(record.sourceLabel)}.`
                  }</p>${
                    record.needsException && sourceExceptionEditable
                      ? `<button type="button" class="ghost small-action" data-setup-action="markSetupException" data-setup-collection="${esc(record.collection)}" data-setup-record-id="${esc(record.recordId)}" data-setup-record-type="${esc(record.type)}" data-setup-record-label="${esc(record.label)}">Mark Exception</button>`
                      : ""
                  }</article>`,
              )
              .join("")
          : emptyState("No source-tracked setup records yet.")
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
