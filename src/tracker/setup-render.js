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
          ? `<span class="question-help setup-detail-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
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
        ? `<span class="question-help setup-detail-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
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

function setupLabeledMeterSummary(
  label,
  displayValue,
  value,
  max,
  helpText = "",
) {
  const safeValue = Math.max(0, Number(value) || 0);
  const safeMax = Math.max(0, Number(max) || 0);
  const percentage =
    safeMax > 0 ? Math.min(100, Math.max(0, (safeValue / safeMax) * 100)) : 0;
  const help = String(helpText || "").trim();
  return `<article class="setup-trait-editor-row setup-attribute-points-card setup-hindrance-meter-card">
    ${
      help
        ? `<span class="question-help setup-detail-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
        : ""
    }
    <div class="setup-attribute-editor-heading">
      <strong>${esc(label)}</strong>
      <span>${esc(displayValue || `${safeValue} / ${safeMax}`)}</span>
    </div>
    <div class="setup-attribute-meter" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}">
      <span class="setup-attribute-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
    </div>
  </article>`;
}

function setupMeterBar(label, value, max) {
  const safeValue = Math.max(0, Number(value) || 0);
  const safeMax = Math.max(0, Number(max) || 0);
  const percentage =
    safeMax > 0 ? Math.min(100, Math.max(0, (safeValue / safeMax) * 100)) : 0;
  return `<div class="setup-attribute-meter setup-inline-meter" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}">
    <span class="setup-attribute-meter-fill" style="width: ${percentage.toFixed(2)}%"></span>
  </div>`;
}

function attributeHelpMarkup(label, helpText = "") {
  const help = String(helpText || "").trim();
  return help
    ? `<span class="question-help attribute-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`
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
      if (setupSkillPointStats().genericRemaining <= 0) return "";
      return `<div class="creator-actions setup-benefit-navigation"><button type="button" data-setup-step="skills">Go to Skills</button></div>`;
    }
    if (item.key === "extraEdgesFromHindrances") {
      if (!setupStartingEdgeValidationReport().missingHindranceBenefitEdges)
        return "";
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
              <span>${selectedEdges.length} / ${edgeSlots} selected</span>
              ${setupMeterBar("Hindrance Edges", selectedEdges.length, edgeSlots)}
            </div>
            <label>Edge<select id="setupHindranceBenefitEdgeSelect">${setupEdgeCatalogOptions("Choose Hindrance Benefit Edge...")}</select></label>
            <div id="setupHindranceBenefitEdgePreview" class="setup-edge-preview-slot">${setupEdgeSelectionPreviewMarkup("")}</div>
            <button type="button" data-setup-action="addHindranceBenefitEdge">Add Hindrance Benefit Edge</button>
          </article>`
        : `<article class="setup-edge-pick-card">
            <div class="setup-edge-pick-copy">
              <strong>Paid Edge Slots</strong>
              <span>${selectedEdges.length} / ${edgeSlots} selected</span>
              ${setupMeterBar("Hindrance Edges", selectedEdges.length, edgeSlots)}
            </div>
            <p class="creator-note">All paid Edge slots are filled. Remove a selected Hindrance benefit Edge before choosing a different one.</p>
          </article>`
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
  if (!skillStats.elderlySmartsSkillPointsRemaining) return "";

  return `<div class="creator-actions setup-hindrance-card-actions">
      <button type="button" data-setup-step="skills">Go to Skills</button>
    </div>`;
}

function renderCharacterSetup() {
  if (!els.characterSetupStepper || !els.characterSetupContent) return;
  characterSetupStep = validSetupStepId(characterSetupStep);
  if (typeof ensureSetupStartingPowerPointsGranted === "function")
    ensureSetupStartingPowerPointsGranted();
  if (typeof ensureSetupRequiredStartingPowersGranted === "function")
    ensureSetupRequiredStartingPowersGranted();

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
    powers: renderSetupPowersClean,
    gear: renderSetupGear,
  };

  els.characterSetupContent.innerHTML =
    (renderers[characterSetupStep]?.() || renderSetupConcept()) +
    renderSetupStepNavigation();
}

function renderSetupStepNavigation() {
  const currentIndex = CHARACTER_SETUP_STEPS.findIndex(
    (step) => step.id === characterSetupStep,
  );
  const previousStep = CHARACTER_SETUP_STEPS[currentIndex - 1];
  const nextStep = CHARACTER_SETUP_STEPS[currentIndex + 1];
  if (!previousStep && !nextStep) return "";
  const nextLabel = setupNextStepButtonLabel(nextStep);
  const nextDisabled = setupNextStepDisabled();
  const footerWarning = setupStepFooterWarningMarkup();
  return `<div class="setup-step-navigation">
    <div class="setup-step-navigation-previous">
      ${setupPreviousStepControls(previousStep)}
    </div>
    ${footerWarning}
    <div class="setup-step-navigation-next">
      ${nextStep ? `<button type="button" data-setup-action="nextSetupStep"${nextDisabled ? " disabled" : ""}>${esc(nextLabel)}</button>` : ""}
    </div>
  </div>`;
}

function setupPreviousStepControls(previousStep) {
  if (previousStep)
    return `<button class="ghost" type="button" data-setup-action="previousSetupStep">Previous: ${esc(previousStep.label)}</button>`;
  if (characterSetupStep !== "concept") return "";
  return `<div class="creator-actions setup-concept-randomizer-actions" aria-label="Concept randomizer actions">
    <button class="ghost" type="button" data-setup-action="randomizeConceptEmpty">Randomize Empty Fields</button>
    <button class="ghost" type="button" data-setup-action="randomizeConceptAll">Randomize All Fields</button>
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

function setupNextStepDisabled() {
  if (characterSetupStep !== "powers") return false;
  return characterSetupStatus("powers") === "Incomplete";
}

function setupEdgeIncompleteItems(
  report = setupStartingEdgeValidationReport(),
) {
  if (!setupTraitsEditable()) return [];
  return [
    report.missingHumanFreeEdges ? "Select the Human free starting Edge." : "",
    report.missingHindranceBenefitEdges ? "You have unspent Edge points." : "",
  ].filter(Boolean);
}

function setupStepFooterWarningMarkup() {
  if (characterSetupStep === "powers") {
    const report = setupPowerAuditReport();
    if (characterSetupStatus("powers") !== "Incomplete") return "";
    if (!report.incompleteItems.length) return "";
    return `<div class="setup-step-navigation-warning entry-warning"><strong>Powers incomplete:</strong>${setupPowerMessageList(report.incompleteItems)}</div>`;
  }
  if (characterSetupStep === "edges") {
    const incompleteItems = setupEdgeIncompleteItems();
    if (!incompleteItems.length) return "";
    return `<div class="setup-step-navigation-warning entry-warning"><strong>Edges incomplete:</strong>${setupPowerMessageList(incompleteItems)}</div>`;
  }
  if (characterSetupStep === "gear") {
    const report = setupGearAuditReport();
    const messages = [...report.incompleteItems, ...report.warnings];
    if (!messages.length) return "";
    const label = report.warnings.length
      ? "Gear needs review:"
      : "Gear incomplete:";
    return `<div class="setup-step-navigation-warning entry-warning"><strong>${label}</strong>${setupPowerMessageList(messages)}</div>`;
  }
  return "";
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
      <label>Character name<input id="setupNameInput" data-concept-field="name" value="${esc(character.name || "")}" placeholder="e.g. Abigail Stone" autocomplete="off"></label>
      <label>Gender<select id="setupGenderInput" data-concept-field="gender">
        <option value="">Choose gender...</option>
        <option value="Male"${character.gender === "Male" ? " selected" : ""}>Male</option>
        <option value="Female"${character.gender === "Female" ? " selected" : ""}>Female</option>
        <option value="Nonbinary"${character.gender === "Nonbinary" ? " selected" : ""}>Nonbinary</option>
      </select></label>
      <label>Age<input id="setupAgeInput" data-concept-field="age" value="${esc(character.age || "")}" placeholder="e.g. 19, 40s, elderly" autocomplete="off"></label>
      <label>Profession or Title<input id="setupArchetypeInput" data-concept-field="archetype" value="${esc(character.archetype || "")}" placeholder="e.g. drifter, deputy, huckster" autocomplete="off"></label>
      <label>Player Name (optional)<input id="setupPlayerInput" data-concept-field="player" value="${esc(character.player || "")}" placeholder="e.g. player at the table" autocomplete="off"></label>
      <div class="setup-readonly-field">
        <span>Race / Ancestry</span>
        <div class="setup-form-detail readonly"><div class="setup-readonly-value"><strong>${esc(character.ancestry || "Human")}</strong></div></div>
      </div>
      <label class="setup-wide">Description<textarea id="setupDescriptionInput" data-concept-field="description" rows="4" placeholder="Build, clothes, voice, obvious habits">${esc(character.description || "")}</textarea></label>
      <label class="setup-wide">Background<textarea id="setupBackgroundInput" data-concept-field="background" rows="5" placeholder="Where they came from and why they ride">${esc(character.background || "")}</textarea></label>
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
        <button class="ghost small-action" type="button" data-setup-action="resetSetupHindrances"${setupHindranceResetAvailable(stats, spending) ? "" : " disabled"}>Reset Hindrances</button>
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
            ${setupMeterBar("Free Edge", humanEdges, expectedHumanEdges)}
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

function setupPowerSummary(power, catalog = null) {
  return power?.shortSummary || catalog?.shortSummary || power?.notes || "";
}

function setupPowerSelectionPreviewMarkup(
  powerId,
  emptyText = "Choose a Power to preview what it does.",
) {
  const power =
    typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById(powerId || "")
      : null;
  if (!power) {
    return `<div class="setup-power-selection-preview empty">${esc(emptyText)}</div>`;
  }
  const details = [
    power.rank,
    setupPowerCostLabel(power),
    power.range ? `Range ${power.range}` : "",
    power.duration ? `Duration ${power.duration}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
  const summary = setupPowerSummary(power);
  return `<div class="setup-power-selection-preview">
    <strong>${esc(power.name)}</strong>
    ${details ? `<span>${esc(details)}</span>` : ""}
    ${summary ? `<p>${esc(summary)}</p>` : "<p>No short summary recorded yet.</p>"}
  </div>`;
}

function updateSetupPowerSelectionPreview() {
  const select = document.getElementById("setupStartingPowerSelect");
  const preview = document.getElementById("setupStartingPowerPreview");
  if (!select || !preview) return;
  preview.innerHTML = setupPowerSelectionPreviewMarkup(select.value);
}

function setupPowerAuditCard(power, audit = null) {
  const removable =
    setupTraitsEditable() &&
    setupPowerCreationSource(power) === "setup-starting-power" &&
    !audit?.required;
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
    ${
      removable
        ? `<div class="creator-actions"><button type="button" data-setup-action="removeSetupStartingPower" data-power-id="${esc(power.id)}">Remove</button></div>`
        : ""
    }
  </article>`;
}

function setupPowerAuditCardCompact(power, audit = null) {
  const removable =
    setupTraitsEditable() &&
    setupPowerCreationSource(power) === "setup-starting-power" &&
    !audit?.required;
  const visibleBadges = [
    audit?.required ? setupEdgeBadge("Required") : "",
    audit?.messages?.length ? setupEdgeBadge("Needs review", "warning") : "",
    !audit?.catalog ? setupEdgeBadge("Manual review", "warning") : "",
  ]
    .filter(Boolean)
    .join("");
  const facts = [
    setupPowerCostLabel(power),
    power.range ? `Range ${power.range}` : "",
    power.duration ? `Duration ${power.duration}` : "",
  ].filter(Boolean);
  const summary = setupPowerSummary(power, audit?.catalog);

  return `<article class="setup-power-card">
    <div class="setup-power-card-head">
      <div>
        <h4>${esc(power.name || "Unnamed Power")}</h4>
        ${summary ? `<p class="setup-power-effect"><strong>Effect:</strong> ${esc(summary)}</p>` : ""}
        ${
          facts.length
            ? `<div class="setup-power-facts">${facts
                .map((item) => `<span>${esc(item)}</span>`)
                .join("")}</div>`
            : ""
        }
      </div>
      <div class="setup-edge-badges">
        ${visibleBadges}
        ${
          removable
            ? `<button class="ghost tag-action danger-lite" type="button" data-setup-action="removeSetupStartingPower" data-power-id="${esc(power.id)}">Remove</button>`
            : ""
        }
      </div>
    </div>
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
    <p class="creator-note setup-edge-rules-note">Choose legal starting Powers from the matched Arcane Background profile.</p>
    <article class="setup-edge-pick-card setup-power-pick-card">
      <div class="setup-edge-pick-copy">
        <strong>Starting Power</strong>
        <span>${report.powers.length} / ${report.startingPowerCount} selected</span>
      </div>
      <label>Power<select id="setupStartingPowerSelect"${disabled ? " disabled" : ""}>${setupStartingPowerSelectOptions(report)}</select></label>
      <div id="setupStartingPowerPreview" class="setup-power-preview-slot">${setupPowerSelectionPreviewMarkup("")}</div>
      <button type="button" data-setup-action="addSetupStartingPower"${disabled ? " disabled" : ""}>Add Starting Power</button>
    </article>
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
  const canUpdatePowerPoints =
    Boolean(audit?.powerPoints) && !hasExpectedPowerPoints;
  if (!canUpdatePowerPoints) return "";

  return `<section class="setup-trait-group" aria-labelledby="setupPowerPointsSelectionHeading">
    <h4 id="setupPowerPointsSelectionHeading">Power Points mismatch</h4>
    <p class="creator-note">Starting Power Points are granted automatically from the matched Arcane Background. Existing mismatched Power Points are preserved unless you choose to update them.</p>
    <article class="setup-trait-editor-row setup-power-point-card">
      <div>
        <strong>${esc(audit?.statusText || "Not recorded")}</strong>
        <span>${esc(`${report.expectedPowerPoints} expected from ${report.profile.name}`)}</span>
      </div>
    </article>
    <div class="creator-actions"><button type="button" data-setup-action="setSetupStartingPowerPoints">Update Starting Power Points</button></div>
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

function setupPowerPointMeterValue(powerPointsAudit) {
  const powerPoints = powerPointsAudit?.powerPoints;
  return Math.max(0, Number(powerPoints?.current ?? 0) || 0);
}

function setupPowerPointMeterMax(report) {
  const recordedMax = Number(report.powerPointsAudit?.powerPoints?.max);
  return Math.max(
    report.expectedPowerPoints,
    Number.isFinite(recordedMax) ? recordedMax : 0,
  );
}

function renderSetupPowerOverview(report) {
  if (!report.profile) {
    return `<section class="setup-trait-group setup-power-overview" aria-labelledby="setupPowersHeading">
      <h4 id="setupPowersHeading">Powers</h4>
      <p class="creator-note">Powers are only needed for characters with an Arcane Background. If this character should use Powers, choose the Arcane Background on the Edges step first.</p>
      ${
        report.editable
          ? '<div class="creator-actions setup-benefit-navigation"><button type="button" data-setup-step="edges">Go to Edges</button></div>'
          : ""
      }
    </section>`;
  }

  const skillLabel = `${report.expectedArcaneSkill} d4+${
    report.expectedLinkedAttribute
      ? ` linked to ${report.expectedLinkedAttribute}`
      : ""
  }`;
  return `<section class="setup-trait-group setup-power-overview" aria-labelledby="setupPowersHeading">
    <h4 id="setupPowersHeading">Powers</h4>
    <p class="creator-note">${esc(report.profile.name)} uses ${esc(skillLabel)} and starts with ${report.expectedPowerPoints} Power Points. Required starting Powers are added automatically; choose any remaining starting Power slots here.</p>
    <div class="setup-review-grid setup-power-summary-grid">
      ${setupDetail("Arcane Background", report.backgroundName || report.profile.name)}
      ${setupMeterSummary("Power Points", setupPowerPointMeterValue(report.powerPointsAudit), setupPowerPointMeterMax(report), "Current Power Points. The Arcane Background grants a required starting amount, and other choices may raise the maximum.")}
      ${setupMeterSummary("Starting Powers", report.powers.length, report.startingPowerCount, "Known starting Powers selected out of the profile's expected starting Power count.")}
    </div>
  </section>`;
}

function renderSetupPowerAuditDetails(report) {
  if (report.status === "Not applicable") return "";
  const { profile, powers, skillAudit, powerPointsAudit } = report;
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

  return `<details class="setup-power-audit-details">
    <summary>Audit Details</summary>
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
  </details>`;
}

function renderSetupRequiredPowerCards(report) {
  if (!report.requiredPowerAudits.length) return "";
  return `<section class="setup-audit-group setup-required-powers" aria-label="Required Starting Powers">
    <h4>Required Starting Powers</h4>
    <div class="setup-power-list">
      ${report.requiredPowerAudits
        .map((item) => {
          const requiredAudit = report.powerAudits.find(
            (audit) => audit.catalog?.id === item.id,
          );
          if (requiredAudit) {
            return setupPowerAuditCardCompact(
              requiredAudit.power,
              requiredAudit,
            );
          }
          return `<article class="dossier-note warning"><strong>${esc(item.label)}: missing</strong><p>${esc(
            `Required for ${report.profile?.name || "this Arcane Background"}.`,
          )}</p></article>`;
        })
        .join("")}
    </div>
  </section>`;
}

function setupOptionalPowerAudits(report) {
  return report.powerAudits.filter((audit) => !audit.required);
}

function renderSetupPowersClean() {
  const report = setupPowerAuditReport();
  const optionalPowerAudits = setupOptionalPowerAudits(report);

  return `<section id="setupPowersPanel" class="setup-step-panel" aria-labelledby="setupPowersHeading">
    <div class="setup-trait-groups">
      ${renderSetupPowerOverview(report)}
      ${renderSetupPowerPointControls(report)}
      ${renderSetupPowerSelectionControls(report)}
    </div>
    ${
      report.warnings.length
        ? `<div class="entry-warning"><strong>Needs review:</strong>${setupPowerMessageList(report.warnings)}</div>`
        : ""
    }
    ${renderSetupRequiredPowerCards(report)}
    <section class="setup-audit-group setup-selected-powers" aria-label="Selected Powers">
      <h4>Selected Powers</h4>
      <div class="setup-power-list">
        ${
          optionalPowerAudits.length
            ? optionalPowerAudits
                .sort((left, right) => comparePowers(left.power, right.power))
                .map((audit) => setupPowerAuditCardCompact(audit.power, audit))
                .join("")
            : emptyState("No optional starting powers recorded.")
        }
      </div>
    </section>
  </section>`;
}

function setupQuantityText(item, unit = "") {
  const count = Math.max(0, Number(item?.count ?? item?.quantity ?? 1) || 0);
  return `Qty ${count || 0}${unit ? ` ${unit}` : ""}`;
}

function setupGearLine(name, details, note = "", actions = "") {
  return `<div class="setup-gear-line">
    <div>
      <strong>${esc(name || "Gear")}</strong>
      ${details.filter(Boolean).length ? `<span>${esc(details.filter(Boolean).join(" • "))}</span>` : ""}
      ${note ? `<p>${esc(note)}</p>` : ""}
    </div>
    ${actions}
  </div>`;
}

function setupGearEntryPriceLabel(entry) {
  const item = entry?.item || {};
  const count =
    entry?.type === "weapon"
      ? 1
      : Math.max(1, Math.floor(Number(entry?.count ?? item.count ?? 1) || 1));
  const unitCost = Number(item.sourceDetail?.costCents ?? item.costCents);
  return Number.isFinite(unitCost) ? money(unitCost * count) : "—";
}

function setupGearCard(
  name,
  price,
  weight,
  details,
  note = "",
  actions = "",
  summaryActions = "",
) {
  const detailItems = [
    `Price ${price || "—"}`,
    `Weight ${weight || "—"}`,
    ...details.filter(Boolean),
  ];
  const hasDetails = detailItems.length || note;
  const summaryMarkup = `<span class="setup-gear-card-summary">
      <span class="setup-gear-card-arrow${hasDetails ? "" : " setup-gear-card-arrow-empty"}" aria-hidden="true"></span>
      <strong>${esc(name || "Gear")}</strong>
    </span>`;
  const contentMarkup = hasDetails
    ? `<details class="setup-gear-line-details">
          <summary class="setup-gear-card-disclosure">${summaryMarkup}</summary>
          <div class="setup-gear-detail-list">
            ${detailItems.map((item) => `<span>${esc(item)}</span>`).join("")}
            ${note ? `<p>${esc(note)}</p>` : ""}
          </div>
        </details>`
    : `<div class="setup-gear-card-static">${summaryMarkup}</div>`;
  return `<div class="setup-gear-line setup-gear-card">
    <div class="setup-gear-card-top">
      ${contentMarkup}
      ${summaryActions}
    </div>
    ${actions}
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

function setupGearAuditGroup(title, items, emptyText, renderer) {
  return `<section class="setup-audit-group setup-gear-audit-group" aria-label="${esc(title)}">
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

function setupGearPlayerEntryLine(entry) {
  const item = entry.item || {};
  const requiredAmmo =
    entry.type === "weapon"
      ? requiredAmmoLabelForWeapon(item, entry.catalog)
      : "";
  const loaded =
    entry.type === "weapon" && isTrackedWeapon(item)
      ? `${item.shotsLoaded ?? 0} / ${item.shotsMax ?? "—"} loaded`
      : "";
  const details = [
    entry.count > 1 ? `Qty ${entry.count}` : "",
    entry.type === "weapon" && item.damage ? `Damage ${item.damage}` : "",
    entry.type === "weapon" && item.range ? `Range ${item.range}` : "",
    entry.type === "weapon" && item.ap !== undefined ? `AP ${item.ap}` : "",
    entry.type === "weapon" && item.rof !== undefined ? `ROF ${item.rof}` : "",
    entry.type === "weapon" && item.minStr ? `Min Str ${item.minStr}` : "",
    requiredAmmo ? `Ammo ${requiredAmmo}` : "",
    entry.type === "armor" && item.armor ? `Armor +${item.armor}` : "",
    entry.type === "armor" ? armorLabel(item.location) : "",
    entry.type === "armor" && item.minStr ? `Min Str ${item.minStr}` : "",
    entry.type === "ammo"
      ? `Reserve ${Math.max(0, Number(item.count) || 0)}`
      : "",
    entry.type === "vehicle" && item.category ? item.category : "",
    entry.type === "vehicle" && item.topSpeed !== undefined
      ? `Top Speed ${item.topSpeed} MPH`
      : "",
    entry.type === "vehicle" && item.toughness
      ? `Toughness ${item.toughness}`
      : "",
    entry.type === "vehicle" && item.crew ? `Crew ${item.crew}` : "",
    loaded,
    setupGearEntryLocationLabel(entry),
  ];
  return setupGearCard(
    entry.label,
    setupGearEntryPriceLabel(entry),
    entry.type === "vehicle" ? "—" : formatWeightPounds(entry.weight),
    details,
    [
      item.note || item.notes || "",
      ...entry.warnings.map((warning) => `Needs review: ${warning}`),
    ]
      .filter(Boolean)
      .join(" "),
    setupGearEntryActions(entry),
    setupGearSummaryActions(entry),
  );
}

function setupGearSellBackButton(entry) {
  if (!setupTraitsEditable()) return "";
  if (setupGearCreationSource(entry.item) !== "setup-starting-gear") return "";
  return `<button class="ghost tag-action danger-lite" type="button" data-setup-action="sellBackSetupGear" data-setup-gear-type="${esc(entry.type)}" data-setup-gear-id="${esc(entry.id)}">Sell Back</button>`;
}

function setupBackpackContainer() {
  return (
    flattenInventory()
      .map(({ item }) => item)
      .find(
        (item) =>
          item?.isContainer && /backpack/i.test(String(item.name || "")),
      ) || null
  );
}

function setupGearEntryIsBackpack(entry, backpack) {
  return entry?.type === "gear" && backpack?.id && entry.id === backpack.id;
}

function setupGearEntryIsInsideBackpack(entry, backpack) {
  if (!backpack?.id) return false;
  return entry.parent?.id === backpack.id || entry.containerId === backpack.id;
}

function setupGearBackpackMoveAction(entry) {
  if (!setupTraitsEditable()) return "";
  if (entry.type === "vehicle") return "";
  const backpack = setupBackpackContainer();
  if (!backpack || setupGearEntryIsBackpack(entry, backpack)) return "";
  const insideBackpack = setupGearEntryIsInsideBackpack(entry, backpack);
  const action = insideBackpack
    ? "moveSetupGearToBody"
    : "moveSetupGearToBackpack";
  const label = insideBackpack ? "Move to Body" : "Put in Backpack";
  return `<button class="ghost tag-action" type="button" data-setup-action="${esc(action)}" data-setup-gear-type="${esc(entry.type)}" data-setup-gear-id="${esc(entry.id)}" data-setup-backpack-id="${esc(backpack.id)}">${esc(label)}</button>`;
}

function setupWeaponAmmoPurchaseAction(entry) {
  if (!setupTraitsEditable() || entry.type !== "weapon") return "";
  const item = entry.item || {};
  const ammoType = exactAmmoTypeForWeapon(item);
  const catalogItem = ammoType ? catalogAmmoForKey(ammoType, item) : null;
  if (!ammoType || !catalogItem) return "";
  const ammoLabel = requiredAmmoLabelForWeapon(item, entry.catalog);
  const unitCostCents = Math.max(0, Number(catalogItem.costCents) || 0);
  const unitCost = money(unitCostCents);
  return `<div class="creator-actions setup-gear-actions setup-weapon-ammo-actions">
    <span class="setup-weapon-ammo-cost">Ammo ${esc(unitCost)} each · <strong data-setup-ammo-total-for="${esc(entry.id)}">${esc(unitCost)}</strong></span>
    <span class="setup-weapon-ammo-stepper" aria-label="Ammo quantity for ${esc(entry.label)}">
      <button class="tag-action" type="button" data-setup-action="adjustSetupAmmoQuantity" data-setup-weapon-id="${esc(entry.id)}" data-direction="-1" aria-label="Decrease ammo quantity for ${esc(entry.label)}">−</button>
      <input class="setup-weapon-ammo-qty" type="number" min="1" step="1" value="1" data-setup-ammo-weapon-id="${esc(entry.id)}" data-setup-ammo-unit-cost="${esc(unitCostCents)}" aria-label="Ammo quantity for ${esc(entry.label)}">
      <button class="tag-action" type="button" data-setup-action="adjustSetupAmmoQuantity" data-setup-weapon-id="${esc(entry.id)}" data-direction="1" aria-label="Increase ammo quantity for ${esc(entry.label)}">+</button>
    </span>
    <button class="setup-weapon-ammo-buy" type="button" data-setup-action="addSetupAmmoForWeapon" data-setup-weapon-id="${esc(entry.id)}" aria-label="Buy ${esc(ammoLabel || "Ammo")} for ${esc(entry.label)}">Buy Ammo</button>
  </div>`;
}

function setupGearEntryActions(entry) {
  const backpackAction = setupGearBackpackMoveAction(entry);
  const sellBackAction = setupGearSellBackButton(entry);
  const managementActions =
    backpackAction || sellBackAction
      ? `<div class="creator-actions setup-gear-actions setup-gear-management-actions">${backpackAction}${sellBackAction}</div>`
      : "";
  return [setupWeaponAmmoPurchaseAction(entry), managementActions]
    .filter(Boolean)
    .join("");
}

function setupGearSummaryActions(entry) {
  return "";
}

function setupContainerAuditLine(container) {
  const contentNames = container.contents.map((entry) => entry.label);
  return setupGearCard(
    container.label,
    setupGearEntryPriceLabel(container),
    formatWeightPounds(container.totalWeight),
    [
      setupGearEntryLocationLabel(container),
      `Empty ${formatWeightPounds(container.ownWeight)}`,
      `Contents ${formatWeightPounds(container.contentsWeight)}`,
      `Total ${formatWeightPounds(container.totalWeight)}`,
    ],
    contentNames.length
      ? `Contains: ${contentNames.join(", ")}`
      : "No contents recorded.",
    `<div class="creator-actions setup-gear-actions setup-gear-management-actions">${setupGearSellBackButton(container)}</div>`,
  );
}

function setupGearSummaryMarkup(report) {
  const availableFunds = Math.max(
    0,
    Number(report.startingFundsAvailable) || 0,
  );
  const fundsSpent = Math.max(0, Number(report.startingPurchaseSpent) || 0);
  const fundsRemaining = Math.max(0, Number(report.moneyCents) || 0);
  const carryingCapacity = Math.max(
    0,
    Number(report.normal.carryingCapacity) || 0,
  );
  const carriedLoad = Math.max(0, Number(report.normal.normalLoad) || 0);
  const combatLoad = Math.max(0, Number(report.combat.combatLoad) || 0);
  return `<div class="setup-review-grid setup-gear-summary-grid">
    ${setupLabeledMeterSummary("Funds Spent", `${money(fundsSpent)} / ${money(availableFunds)}`, fundsSpent, availableFunds, "Starting funds already spent during setup.")}
    ${setupLabeledMeterSummary("Funds Remaining", money(fundsRemaining), fundsRemaining, availableFunds, "Starting funds still available for setup purchases.")}
    ${setupLabeledMeterSummary("Current Load", `${formatWeightPounds(carriedLoad)} / ${formatWeightPounds(carryingCapacity)}`, carriedLoad, carryingCapacity, "Normal carried load compared to carrying capacity.")}
    ${setupLabeledMeterSummary("Combat Load", `${formatWeightPounds(combatLoad)} / ${formatWeightPounds(carryingCapacity)}`, combatLoad, carryingCapacity, "Combat load after automatic backpack-drop handling.")}
  </div>`;
}

function setupGearResetButton(report) {
  if (!report.editable) return "";
  const hasSetupPurchases = report.entries.some(
    (entry) => setupGearCreationSource(entry.item) === "setup-starting-gear",
  );
  return `<button class="ghost danger-lite" type="button" data-setup-action="resetSetupGear"${hasSetupPurchases ? "" : " disabled"}>Reset Gear</button>`;
}

function renderSetupGearGroups(report) {
  const byType = (type) =>
    report.entries.filter((entry) => entry.type === type);
  const looseGear = report.entries.filter(
    (entry) =>
      entry.type === "gear" && !entry.item?.isContainer && !entry.parent,
  );
  const looseConsumables = report.entries.filter(
    (entry) =>
      entry.type === "consumable" &&
      !entry.item?.isContainer &&
      !entry.parent &&
      entry.location !== "container",
  );
  const insideContainers = report.entries.filter(
    (entry) => entry.parent || entry.location === "container",
  );
  const groups = [
    [
      "Weapons",
      byType("weapon"),
      "No weapons recorded.",
      setupGearPlayerEntryLine,
    ],
    ["Armor", byType("armor"), "No armor recorded.", setupGearPlayerEntryLine],
    ["Gear", looseGear, "No general gear recorded.", setupGearPlayerEntryLine],
    [
      "Consumables",
      looseConsumables,
      "No consumables recorded.",
      setupGearPlayerEntryLine,
    ],
    [
      "Containers",
      report.containers,
      "No containers recorded.",
      setupContainerAuditLine,
    ],
    [
      "Inside Containers",
      insideContainers,
      "No container contents recorded.",
      setupGearPlayerEntryLine,
    ],
    [
      "Ammunition",
      byType("ammo"),
      "No ammunition reserves recorded.",
      setupGearPlayerEntryLine,
    ],
    [
      "Vehicles",
      byType("vehicle"),
      "No vehicles recorded.",
      setupGearPlayerEntryLine,
    ],
  ].filter(([, items]) => items.length);

  if (!groups.length) return emptyState("No gear recorded yet.");
  return groups
    .map(([title, items, emptyText, renderer]) =>
      setupGearAuditGroup(title, items, emptyText, renderer),
    )
    .join("");
}

function setupWeaponPickerGroup(item) {
  const category = String(item?.category || "");
  const text = `${category} ${item?.name || ""} ${item?.ammoType || ""}`;
  if (/gatling/i.test(text)) return "Gatling";
  if (/shotgun/i.test(text)) return "Shotguns";
  if (/revolver|pistol|derringer|pepperbox/i.test(text)) return "Pistols";
  if (/rifle|carbine|musket|winchester|sharps|spencer/i.test(text))
    return "Rifles";
  if (/melee/i.test(category)) return "Melee";
  if (/thrown|bow|lance|spear|tomahawk|bola|explosive|dynamite/i.test(text))
    return "Thrown & Other";
  if (/infernal/i.test(text)) return "Infernal";
  return category || "Other";
}

function setupWeaponPickerGroupOptions(items) {
  const groups = [
    "All",
    ...new Set(items.map(setupWeaponPickerGroup).filter(Boolean)),
  ];
  return groups
    .map((group) => `<option value="${esc(group)}">${esc(group)}</option>`)
    .join("");
}

function setupWeaponPickerDisplay(value) {
  const text = String(value ?? "").trim();
  return text || "—";
}

function setupWeaponPickerShortRange(item) {
  const match = String(item?.range || "").match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : "";
}

function setupWeaponPickerDamageExpressionAverage(value) {
  const text = String(value || "")
    .replace(/[–—]/g, "-")
    .replace(/\bStr\b\s*\+?/gi, "")
    .trim();
  if (!text) return "";

  const diceRange = text.match(/^([+-]?\d+(?:\.\d+)?)\s*-\s*(\d+)d(\d+)/i);
  if (diceRange) {
    const low = Number(diceRange[1]);
    const high = Number(diceRange[2]);
    const die = Number(diceRange[3]);
    if ([low, high, die].every(Number.isFinite))
      return ((low + high) / 2) * ((die + 1) / 2);
  }

  let total = 0;
  let hasValue = false;
  const dicePattern = /([+-]?\s*\d*)d(\d+)/gi;
  const withoutDice = text.replace(dicePattern, (match, countText, dieText) => {
    const normalizedCount = String(countText || "")
      .replace(/\s+/g, "")
      .trim();
    const sign = normalizedCount.startsWith("-") ? -1 : 1;
    const countValue = Math.abs(Number(normalizedCount || 1)) || 1;
    const die = Number(dieText);
    if (Number.isFinite(die)) {
      total += sign * countValue * ((die + 1) / 2);
      hasValue = true;
    }
    return "";
  });
  const flatMatches = withoutDice.match(/[+-]?\s*\d+(?:\.\d+)?/g) || [];
  flatMatches.forEach((value) => {
    const number = Number(String(value).replace(/\s+/g, ""));
    if (Number.isFinite(number)) {
      total += number;
      hasValue = true;
    }
  });

  return hasValue ? total : "";
}

function setupWeaponPickerDamageAverage(item) {
  const values = String(item?.damage || "")
    .split("/")
    .map(setupWeaponPickerDamageExpressionAverage)
    .filter((value) => Number.isFinite(value));
  return values.length ? Math.max(...values) : "";
}

function setupWeaponPickerRofShots(item) {
  const parts = [
    item.rof !== undefined && item.rof !== "" ? `RoF ${item.rof}` : "",
    item.shotsText || item.shotsMax
      ? `Shots ${item.shotsText || item.shotsMax}`
      : "",
  ].filter(Boolean);
  return parts.join(" / ");
}

function setupWeaponPickerWeight(item) {
  const value = Number(item?.weight);
  return Number.isFinite(value) ? value : "";
}

function setupWeaponPickerNotes(item) {
  return String(item?.notes || "").trim();
}

function setupWeaponPickerSearchText(item, group, ammoLabel) {
  return [
    item.name,
    item.category,
    group,
    item.damage,
    item.range,
    setupWeaponPickerRofShots(item),
    item.costText || money(item.costCents || 0),
    setupWeaponPickerWeight(item) !== ""
      ? formatWeightPounds(setupWeaponPickerWeight(item))
      : "",
    ammoLabel,
    setupWeaponPickerNotes(item),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function setupWeaponPickerHeaderCell(label, sortKey = "") {
  if (!sortKey)
    return `<strong class="setup-catalog-picker-heading">${esc(label)}</strong>`;
  return `<button class="setup-catalog-sort-button" type="button" data-setup-weapon-sort="${esc(sortKey)}">${esc(label)}</button>`;
}

function setupWeaponPickerCell(label, value, className = "") {
  return `<span class="setup-catalog-picker-cell ${esc(className)}" data-label="${esc(label)}">${esc(value)}</span>`;
}

function setupCatalogPickerDetails(items = [], note = "") {
  const detailItems = items.filter(Boolean);
  const cleanNote = String(note || "").trim();
  if (!detailItems.length && !cleanNote) return "";
  return `<details class="setup-catalog-picker-details">
    <summary>Details</summary>
    <div class="setup-catalog-picker-detail-list">
      ${detailItems.map((item) => `<span>${esc(item)}</span>`).join("")}
      ${cleanNote ? `<p>${esc(cleanNote)}</p>` : ""}
    </div>
  </details>`;
}

function setupCatalogPickerSummary(content) {
  return `<div class="setup-catalog-picker-summary">${content}</div>`;
}

function setupWeaponPickerRow(item) {
  const group = setupWeaponPickerGroup(item);
  const ammoLabel = requiredAmmoLabelForWeapon(item, item);
  const weight = setupWeaponPickerWeight(item);
  const rangeSort = setupWeaponPickerShortRange(item);
  const damageSort = setupWeaponPickerDamageAverage(item);
  const searchText = setupWeaponPickerSearchText(item, group, ammoLabel);
  return `<div class="setup-catalog-picker-row" data-setup-weapon-row data-weapon-group="${esc(group)}" data-weapon-search="${esc(searchText)}" data-weapon-sort-name="${esc(String(item.name || "").toLowerCase())}" data-weapon-sort-type="${esc(group.toLowerCase())}" data-weapon-sort-price="${esc(Number(item.costCents) || 0)}" data-weapon-sort-weight="${esc(weight)}" data-weapon-sort-range="${esc(rangeSort)}" data-weapon-sort-damage="${esc(damageSort)}">
    ${setupCatalogPickerSummary(`
      <div class="setup-catalog-picker-cell setup-catalog-picker-name" data-label="Name">
        <strong>${esc(item.name || "Unnamed weapon")}</strong>
      </div>
      ${setupWeaponPickerCell("Type", group, "setup-catalog-picker-type")}
      ${setupWeaponPickerCell("Damage", setupWeaponPickerDisplay(item.damage), "setup-catalog-picker-damage")}
      ${setupWeaponPickerCell("Range", setupWeaponPickerDisplay(item.range), "setup-catalog-picker-range")}
      ${setupWeaponPickerCell("RoF / Shots", setupWeaponPickerDisplay(setupWeaponPickerRofShots(item)), "setup-catalog-picker-rof")}
      ${setupWeaponPickerCell("Price", money(item.costCents || 0), "setup-catalog-picker-price")}
      ${setupWeaponPickerCell("Load", weight !== "" ? formatWeightPounds(weight) : "\u2014", "setup-catalog-picker-load")}
      <span class="setup-catalog-picker-cell setup-catalog-picker-add" data-label="Buy"><button type="button" data-setup-action="addSetupWeaponPurchase" data-setup-weapon-id="${esc(item.id)}">Buy</button></span>
    `)}
    ${setupCatalogPickerDetails(
      [
        ammoLabel ? `Ammo ${ammoLabel}` : "",
        item.ap !== undefined && item.ap !== "" ? `AP ${item.ap}` : "",
        item.minStr ? `Min Str ${item.minStr}` : "",
        item.book || "",
      ],
      setupWeaponPickerNotes(item),
    )}
  </div>`;
}

function setupWeaponPicker(items) {
  return `<details class="setup-purchase-card setup-catalog-picker" id="setupWeaponPicker" open>
    <summary class="setup-catalog-picker-title"><h5>Weapons</h5><span>Search, compare, and buy weapons.</span></summary>
    <div class="setup-form-grid setup-purchase-form setup-catalog-picker-controls">
      <label>Search weapons<input id="setupWeaponSearchInput" type="search" placeholder="Search weapons..." autocomplete="off" /></label>
      <label>Type<select id="setupWeaponCategoryFilter" aria-label="Filter weapons by type">${setupWeaponPickerGroupOptions(items)}</select></label>
    </div>
    <div class="setup-catalog-picker-list">
      <div class="setup-catalog-picker-header" aria-label="Weapon catalog columns">
        ${setupWeaponPickerHeaderCell("Name", "name")}
        ${setupWeaponPickerHeaderCell("Type", "type")}
        ${setupWeaponPickerHeaderCell("Damage", "damage")}
        ${setupWeaponPickerHeaderCell("Range", "range")}
        ${setupWeaponPickerHeaderCell("RoF / Shots")}
        ${setupWeaponPickerHeaderCell("Price", "price")}
        ${setupWeaponPickerHeaderCell("Load", "weight")}
        <span aria-hidden="true"></span>
      </div>
      ${items.map(setupWeaponPickerRow).join("")}
      <p class="empty-state setup-catalog-picker-empty hidden">No weapons match that search.</p>
    </div>
  </details>`;
}

function setupWeaponSortValue(row, key) {
  if (["price", "weight", "range", "damage"].includes(key)) {
    const value =
      row.dataset[`weaponSort${key[0].toUpperCase()}${key.slice(1)}`];
    return value === "" ? null : Number(value);
  }
  return String(
    row.dataset[`weaponSort${key[0].toUpperCase()}${key.slice(1)}`] || "",
  );
}

function compareSetupWeaponRows(left, right, key, direction) {
  const leftValue = setupWeaponSortValue(left, key);
  const rightValue = setupWeaponSortValue(right, key);
  const leftMissing = leftValue === null || leftValue === "";
  const rightMissing = rightValue === null || rightValue === "";
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  const result =
    typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue));
  return direction === "desc" ? -result : result;
}

function updateSetupWeaponSortButtons(picker) {
  const key = picker.dataset.sortKey || "";
  const direction = picker.dataset.sortDirection || "asc";
  picker.querySelectorAll("[data-setup-weapon-sort]").forEach((button) => {
    const active = button.dataset.setupWeaponSort === key;
    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-sort",
      active ? (direction === "desc" ? "descending" : "ascending") : "none",
    );
  });
}

function sortSetupWeaponPicker(key) {
  const picker = document.getElementById("setupWeaponPicker");
  if (!picker || !key) return;
  const currentKey = picker.dataset.sortKey || "";
  const currentDirection = picker.dataset.sortDirection || "asc";
  const direction =
    currentKey === key && currentDirection === "asc" ? "desc" : "asc";
  picker.dataset.sortKey = key;
  picker.dataset.sortDirection = direction;
  const list = picker.querySelector(".setup-catalog-picker-list");
  const emptyState = picker.querySelector(".setup-catalog-picker-empty");
  [...picker.querySelectorAll("[data-setup-weapon-row]")]
    .sort((left, right) => compareSetupWeaponRows(left, right, key, direction))
    .forEach((row) => list?.insertBefore(row, emptyState || null));
  updateSetupWeaponSortButtons(picker);
}

function filterSetupWeaponPicker() {
  const picker = document.getElementById("setupWeaponPicker");
  if (!picker) return;
  const search = String(
    document.getElementById("setupWeaponSearchInput")?.value || "",
  )
    .trim()
    .toLowerCase();
  const category =
    document.getElementById("setupWeaponCategoryFilter")?.value || "All";
  const rows = [...picker.querySelectorAll("[data-setup-weapon-row]")];
  let visibleCount = 0;
  rows.forEach((row) => {
    const matchesSearch =
      !search || String(row.dataset.weaponSearch || "").includes(search);
    const matchesCategory =
      category === "All" || row.dataset.weaponGroup === category;
    const visible = matchesSearch && matchesCategory;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });
  picker
    .querySelector(".setup-catalog-picker-empty")
    ?.classList.toggle("hidden", visibleCount > 0);
  updateSetupWeaponSortButtons(picker);
}

function setupGearPickerGroup(item) {
  return String(item?.category || item?.book || "Gear").trim() || "Gear";
}

function setupGearPickerGroupOptions(items) {
  return [
    '<option value="All">All</option>',
    ...[...new Set(items.map(setupGearPickerGroup).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
      .map((group) => `<option value="${esc(group)}">${esc(group)}</option>`),
  ].join("");
}

function setupGearPickerHeaderCell(label, sortKey = "") {
  if (!sortKey)
    return `<strong class="setup-catalog-picker-heading">${esc(label)}</strong>`;
  return `<button class="setup-catalog-sort-button" type="button" data-setup-gear-sort="${esc(sortKey)}">${esc(label)}</button>`;
}

function setupGearPickerWeight(item) {
  const value = Number(item?.weight);
  return Number.isFinite(value) ? value : "";
}

function setupGearPickerSearchText(item, group) {
  return [
    item.name,
    group,
    item.book,
    item.costText || money(item.costCents || 0),
    setupGearPickerWeight(item) !== ""
      ? formatWeightPounds(setupGearPickerWeight(item))
      : "",
    item.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function setupGearPickerRow(item) {
  const group = setupGearPickerGroup(item);
  const weight = setupGearPickerWeight(item);
  const searchText = setupGearPickerSearchText(item, group);
  return `<div class="setup-catalog-picker-row" data-setup-gear-row data-gear-group="${esc(group)}" data-gear-search="${esc(searchText)}" data-gear-sort-name="${esc(String(item.name || "").toLowerCase())}" data-gear-sort-type="${esc(group.toLowerCase())}" data-gear-sort-price="${esc(Number(item.costCents) || 0)}" data-gear-sort-weight="${esc(weight)}">
    ${setupCatalogPickerSummary(`
      <div class="setup-catalog-picker-cell setup-catalog-picker-name" data-label="Name">
        <strong>${esc(item.name || "Unnamed gear")}</strong>
      </div>
      ${setupWeaponPickerCell("Type", group, "setup-catalog-picker-type")}
      ${setupWeaponPickerCell("Price", money(item.costCents || 0), "setup-catalog-picker-price")}
      ${setupWeaponPickerCell("Load", weight !== "" ? formatWeightPounds(weight) : "\u2014", "setup-catalog-picker-load")}
      <span class="setup-catalog-picker-cell setup-catalog-picker-add" data-label="Buy"><button type="button" data-setup-action="addSetupGearPurchase" data-setup-gear-id="${esc(item.id)}">Buy</button></span>
    `)}
    ${setupCatalogPickerDetails([group, item.book || ""], item.notes)}
  </div>`;
}

function setupGearPicker(items) {
  return `<details class="setup-purchase-card setup-catalog-picker setup-gear-catalog-picker" id="setupGearPicker">
    <summary class="setup-catalog-picker-title"><h5>Gear</h5><span>General equipment and services.</span></summary>
    <div class="setup-form-grid setup-purchase-form setup-catalog-picker-controls">
      <label>Search gear<input id="setupGearSearchInput" type="search" placeholder="Search gear..." autocomplete="off" /></label>
      <label>Type<select id="setupGearCategoryFilter" aria-label="Filter gear by type">${setupGearPickerGroupOptions(items)}</select></label>
    </div>
    <div class="setup-catalog-picker-list">
      <div class="setup-catalog-picker-header" aria-label="Gear catalog columns">
        ${setupGearPickerHeaderCell("Name", "name")}
        ${setupGearPickerHeaderCell("Type", "type")}
        ${setupGearPickerHeaderCell("Price", "price")}
        ${setupGearPickerHeaderCell("Load", "weight")}
        <span aria-hidden="true"></span>
      </div>
      ${items.map(setupGearPickerRow).join("")}
      <p class="empty-state setup-catalog-picker-empty hidden">No gear matches that search.</p>
    </div>
  </details>`;
}

function setupGearSortValue(row, key) {
  if (["price", "weight"].includes(key)) {
    const value = row.dataset[`gearSort${key[0].toUpperCase()}${key.slice(1)}`];
    return value === "" ? null : Number(value);
  }
  return String(
    row.dataset[`gearSort${key[0].toUpperCase()}${key.slice(1)}`] || "",
  );
}

function compareSetupGearRows(left, right, key, direction) {
  const leftValue = setupGearSortValue(left, key);
  const rightValue = setupGearSortValue(right, key);
  const leftMissing = leftValue === null || leftValue === "";
  const rightMissing = rightValue === null || rightValue === "";
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  const result =
    typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue));
  return direction === "desc" ? -result : result;
}

function updateSetupGearSortButtons(picker) {
  const key = picker.dataset.sortKey || "";
  const direction = picker.dataset.sortDirection || "asc";
  picker.querySelectorAll("[data-setup-gear-sort]").forEach((button) => {
    const active = button.dataset.setupGearSort === key;
    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-sort",
      active ? (direction === "desc" ? "descending" : "ascending") : "none",
    );
  });
}

function sortSetupGearPicker(key) {
  const picker = document.getElementById("setupGearPicker");
  if (!picker || !key) return;
  const currentKey = picker.dataset.sortKey || "";
  const currentDirection = picker.dataset.sortDirection || "asc";
  const direction =
    currentKey === key && currentDirection === "asc" ? "desc" : "asc";
  picker.dataset.sortKey = key;
  picker.dataset.sortDirection = direction;
  const list = picker.querySelector(".setup-catalog-picker-list");
  const emptyState = picker.querySelector(".setup-catalog-picker-empty");
  [...picker.querySelectorAll("[data-setup-gear-row]")]
    .sort((left, right) => compareSetupGearRows(left, right, key, direction))
    .forEach((row) => list?.insertBefore(row, emptyState || null));
  updateSetupGearSortButtons(picker);
}

function filterSetupGearPicker() {
  const picker = document.getElementById("setupGearPicker");
  if (!picker) return;
  const search = String(
    document.getElementById("setupGearSearchInput")?.value || "",
  )
    .trim()
    .toLowerCase();
  const category =
    document.getElementById("setupGearCategoryFilter")?.value || "All";
  const rows = [...picker.querySelectorAll("[data-setup-gear-row]")];
  let visibleCount = 0;
  rows.forEach((row) => {
    const matchesSearch =
      !search || String(row.dataset.gearSearch || "").includes(search);
    const matchesCategory =
      category === "All" || row.dataset.gearGroup === category;
    const visible = matchesSearch && matchesCategory;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });
  picker
    .querySelector(".setup-catalog-picker-empty")
    ?.classList.toggle("hidden", visibleCount > 0);
  updateSetupGearSortButtons(picker);
}

function setupArmorPickerLocationOptions(items) {
  return [
    '<option value="All">All</option>',
    ...[
      ...new Set(
        items
          .map((item) => item.location)
          .filter(Boolean)
          .map((location) => armorLabel(location)),
      ),
    ]
      .sort((left, right) => left.localeCompare(right))
      .map((label) => `<option value="${esc(label)}">${esc(label)}</option>`),
  ].join("");
}

function setupArmorPickerHeaderCell(label, sortKey = "") {
  if (!sortKey)
    return `<strong class="setup-catalog-picker-heading">${esc(label)}</strong>`;
  return `<button class="setup-catalog-sort-button" type="button" data-setup-armor-sort="${esc(sortKey)}">${esc(label)}</button>`;
}

function setupArmorPickerWeight(item) {
  const value = Number(item?.weight);
  return Number.isFinite(value) ? value : "";
}

function setupArmorPickerSearchText(item, locationLabel) {
  return [
    item.name,
    locationLabel,
    item.book,
    item.minStr,
    item.armor !== undefined ? `+${item.armor}` : "",
    item.costText || money(item.costCents || 0),
    setupArmorPickerWeight(item) !== ""
      ? formatWeightPounds(setupArmorPickerWeight(item))
      : "",
    item.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function setupArmorPickerRow(item) {
  const locationLabel = armorLabel(item.location || "");
  const weight = setupArmorPickerWeight(item);
  const armorValue = Number(item.armor);
  const armorSort = Number.isFinite(armorValue) ? armorValue : "";
  const searchText = setupArmorPickerSearchText(item, locationLabel);
  return `<div class="setup-catalog-picker-row" data-setup-armor-row data-armor-location="${esc(locationLabel)}" data-armor-search="${esc(searchText)}" data-armor-sort-name="${esc(String(item.name || "").toLowerCase())}" data-armor-sort-armor="${esc(armorSort)}" data-armor-sort-location="${esc(locationLabel.toLowerCase())}" data-armor-sort-min-str="${esc(getDieStep(item.minStr))}" data-armor-sort-price="${esc(Number(item.costCents) || 0)}" data-armor-sort-weight="${esc(weight)}">
    ${setupCatalogPickerSummary(`
      <div class="setup-catalog-picker-cell setup-catalog-picker-name" data-label="Name">
        <strong>${esc(item.name || "Unnamed armor")}</strong>
      </div>
      ${setupWeaponPickerCell("Armor", Number.isFinite(armorValue) ? `+${armorValue}` : "\u2014", "setup-catalog-picker-armor")}
      ${setupWeaponPickerCell("Location", locationLabel || "\u2014", "setup-catalog-picker-location")}
      ${setupWeaponPickerCell("Min Str", item.minStr || "\u2014", "setup-catalog-picker-min-str")}
      ${setupWeaponPickerCell("Price", money(item.costCents || 0), "setup-catalog-picker-price")}
      ${setupWeaponPickerCell("Load", weight !== "" ? formatWeightPounds(weight) : "\u2014", "setup-catalog-picker-load")}
      <span class="setup-catalog-picker-cell setup-catalog-picker-add" data-label="Buy"><button type="button" data-setup-action="addSetupArmorPurchase" data-setup-armor-id="${esc(item.id)}">Buy</button></span>
    `)}
    ${setupCatalogPickerDetails([item.book || ""], item.notes)}
  </div>`;
}

function setupArmorPicker(items) {
  return `<details class="setup-purchase-card setup-catalog-picker setup-armor-catalog-picker" id="setupArmorPicker">
    <summary class="setup-catalog-picker-title"><h5>Armor</h5><span>Protective gear by location.</span></summary>
    <div class="setup-form-grid setup-purchase-form setup-catalog-picker-controls">
      <label>Search armor<input id="setupArmorSearchInput" type="search" placeholder="Search armor..." autocomplete="off" /></label>
      <label>Location<select id="setupArmorLocationFilter" aria-label="Filter armor by location">${setupArmorPickerLocationOptions(items)}</select></label>
    </div>
    <div class="setup-catalog-picker-list">
      <div class="setup-catalog-picker-header" aria-label="Armor catalog columns">
        ${setupArmorPickerHeaderCell("Name", "name")}
        ${setupArmorPickerHeaderCell("Armor", "armor")}
        ${setupArmorPickerHeaderCell("Location", "location")}
        ${setupArmorPickerHeaderCell("Min Str", "min-str")}
        ${setupArmorPickerHeaderCell("Price", "price")}
        ${setupArmorPickerHeaderCell("Load", "weight")}
        <span aria-hidden="true"></span>
      </div>
      ${items.map(setupArmorPickerRow).join("")}
      <p class="empty-state setup-catalog-picker-empty hidden">No armor matches that search.</p>
    </div>
  </details>`;
}

function setupArmorSortValue(row, key) {
  if (["armor", "min-str", "price", "weight"].includes(key)) {
    const value =
      row.dataset[
        `armorSort${key.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase())}`
      ];
    return value === "" || value === "-1" ? null : Number(value);
  }
  return String(
    row.dataset[
      `armorSort${key.replace(/(^|-)([a-z])/g, (_, __, char) => char.toUpperCase())}`
    ] || "",
  );
}

function compareSetupArmorRows(left, right, key, direction) {
  const leftValue = setupArmorSortValue(left, key);
  const rightValue = setupArmorSortValue(right, key);
  const leftMissing = leftValue === null || leftValue === "";
  const rightMissing = rightValue === null || rightValue === "";
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  const result =
    typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue));
  return direction === "desc" ? -result : result;
}

function updateSetupArmorSortButtons(picker) {
  const key = picker.dataset.sortKey || "";
  const direction = picker.dataset.sortDirection || "asc";
  picker.querySelectorAll("[data-setup-armor-sort]").forEach((button) => {
    const active = button.dataset.setupArmorSort === key;
    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-sort",
      active ? (direction === "desc" ? "descending" : "ascending") : "none",
    );
  });
}

function sortSetupArmorPicker(key) {
  const picker = document.getElementById("setupArmorPicker");
  if (!picker || !key) return;
  const currentKey = picker.dataset.sortKey || "";
  const currentDirection = picker.dataset.sortDirection || "asc";
  const direction =
    currentKey === key && currentDirection === "asc" ? "desc" : "asc";
  picker.dataset.sortKey = key;
  picker.dataset.sortDirection = direction;
  const list = picker.querySelector(".setup-catalog-picker-list");
  const emptyState = picker.querySelector(".setup-catalog-picker-empty");
  [...picker.querySelectorAll("[data-setup-armor-row]")]
    .sort((left, right) => compareSetupArmorRows(left, right, key, direction))
    .forEach((row) => list?.insertBefore(row, emptyState || null));
  updateSetupArmorSortButtons(picker);
}

function filterSetupArmorPicker() {
  const picker = document.getElementById("setupArmorPicker");
  if (!picker) return;
  const search = String(
    document.getElementById("setupArmorSearchInput")?.value || "",
  )
    .trim()
    .toLowerCase();
  const location =
    document.getElementById("setupArmorLocationFilter")?.value || "All";
  const rows = [...picker.querySelectorAll("[data-setup-armor-row]")];
  let visibleCount = 0;
  rows.forEach((row) => {
    const matchesSearch =
      !search || String(row.dataset.armorSearch || "").includes(search);
    const matchesLocation =
      location === "All" || row.dataset.armorLocation === location;
    const visible = matchesSearch && matchesLocation;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });
  picker
    .querySelector(".setup-catalog-picker-empty")
    ?.classList.toggle("hidden", visibleCount > 0);
  updateSetupArmorSortButtons(picker);
}

function setupVehiclePickerGroup(item) {
  return (
    String(item?.category || item?.book || "Vehicles").trim() || "Vehicles"
  );
}

function setupVehiclePickerGroupOptions(items) {
  return [
    '<option value="All">All</option>',
    ...[...new Set(items.map(setupVehiclePickerGroup).filter(Boolean))]
      .sort((left, right) => left.localeCompare(right))
      .map((group) => `<option value="${esc(group)}">${esc(group)}</option>`),
  ].join("");
}

function setupVehiclePickerHeaderCell(label, sortKey = "") {
  if (!sortKey)
    return `<strong class="setup-catalog-picker-heading">${esc(label)}</strong>`;
  return `<button class="setup-catalog-sort-button" type="button" data-setup-vehicle-sort="${esc(sortKey)}">${esc(label)}</button>`;
}

function setupVehiclePickerNumber(value) {
  const match = String(value ?? "").match(/[+-]?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : "";
}

function setupVehiclePickerSearchText(item, group) {
  return [
    item.name,
    group,
    item.book,
    item.size,
    item.handling,
    item.topSpeed,
    item.toughness,
    item.crew,
    item.costText || money(item.costCents || 0),
    item.notes,
  ]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .join(" ")
    .toLowerCase();
}

function setupVehiclePickerRow(item) {
  const group = setupVehiclePickerGroup(item);
  const searchText = setupVehiclePickerSearchText(item, group);
  return `<div class="setup-catalog-picker-row" data-setup-vehicle-row data-vehicle-group="${esc(group)}" data-vehicle-search="${esc(searchText)}" data-vehicle-sort-name="${esc(String(item.name || "").toLowerCase())}" data-vehicle-sort-type="${esc(group.toLowerCase())}" data-vehicle-sort-handling="${esc(setupVehiclePickerNumber(item.handling))}" data-vehicle-sort-speed="${esc(setupVehiclePickerNumber(item.topSpeed))}" data-vehicle-sort-toughness="${esc(setupVehiclePickerNumber(item.toughness))}" data-vehicle-sort-crew="${esc(setupVehiclePickerNumber(item.crew))}" data-vehicle-sort-price="${esc(Number(item.costCents) || 0)}">
    ${setupCatalogPickerSummary(`
      <div class="setup-catalog-picker-cell setup-catalog-picker-name" data-label="Name">
        <strong>${esc(item.name || "Unnamed vehicle")}</strong>
      </div>
      ${setupWeaponPickerCell("Type", group, "setup-catalog-picker-type")}
      ${setupWeaponPickerCell("Handling", setupWeaponPickerDisplay(item.handling), "setup-catalog-picker-handling")}
      ${setupWeaponPickerCell("Speed", setupWeaponPickerDisplay(item.topSpeed), "setup-catalog-picker-speed")}
      ${setupWeaponPickerCell("Toughness", setupWeaponPickerDisplay(item.toughness), "setup-catalog-picker-toughness")}
      ${setupWeaponPickerCell("Crew", setupWeaponPickerDisplay(item.crew), "setup-catalog-picker-crew")}
      ${setupWeaponPickerCell("Price", money(item.costCents || 0), "setup-catalog-picker-price")}
      <span class="setup-catalog-picker-cell setup-catalog-picker-add" data-label="Buy"><button type="button" data-setup-action="addSetupVehiclePurchase" data-setup-vehicle-id="${esc(item.id)}">Buy</button></span>
    `)}
    ${setupCatalogPickerDetails(
      [item.size ? `Size ${item.size}` : "", item.book || ""],
      item.notes,
    )}
  </div>`;
}

function setupVehiclePicker(items) {
  return `<details class="setup-purchase-card setup-catalog-picker setup-vehicle-catalog-picker" id="setupVehiclePicker">
    <summary class="setup-catalog-picker-title"><h5>Vehicles</h5><span>Mounts, wagons, boats, and infernal vehicles.</span></summary>
    <div class="setup-form-grid setup-purchase-form setup-catalog-picker-controls">
      <label>Search vehicles<input id="setupVehicleSearchInput" type="search" placeholder="Search vehicles..." autocomplete="off" /></label>
      <label>Type<select id="setupVehicleCategoryFilter" aria-label="Filter vehicles by type">${setupVehiclePickerGroupOptions(items)}</select></label>
    </div>
    <div class="setup-catalog-picker-list">
      <div class="setup-catalog-picker-header" aria-label="Vehicle catalog columns">
        ${setupVehiclePickerHeaderCell("Name", "name")}
        ${setupVehiclePickerHeaderCell("Type", "type")}
        ${setupVehiclePickerHeaderCell("Handling", "handling")}
        ${setupVehiclePickerHeaderCell("Speed", "speed")}
        ${setupVehiclePickerHeaderCell("Toughness", "toughness")}
        ${setupVehiclePickerHeaderCell("Crew", "crew")}
        ${setupVehiclePickerHeaderCell("Price", "price")}
        <span aria-hidden="true"></span>
      </div>
      ${items.map(setupVehiclePickerRow).join("")}
      <p class="empty-state setup-catalog-picker-empty hidden">No vehicles match that search.</p>
    </div>
  </details>`;
}

function setupVehicleSortValue(row, key) {
  if (["handling", "speed", "toughness", "crew", "price"].includes(key)) {
    const value =
      row.dataset[`vehicleSort${key[0].toUpperCase()}${key.slice(1)}`];
    return value === "" ? null : Number(value);
  }
  return String(
    row.dataset[`vehicleSort${key[0].toUpperCase()}${key.slice(1)}`] || "",
  );
}

function compareSetupVehicleRows(left, right, key, direction) {
  const leftValue = setupVehicleSortValue(left, key);
  const rightValue = setupVehicleSortValue(right, key);
  const leftMissing = leftValue === null || leftValue === "";
  const rightMissing = rightValue === null || rightValue === "";
  if (leftMissing && rightMissing) return 0;
  if (leftMissing) return 1;
  if (rightMissing) return -1;
  const result =
    typeof leftValue === "number" && typeof rightValue === "number"
      ? leftValue - rightValue
      : String(leftValue).localeCompare(String(rightValue));
  return direction === "desc" ? -result : result;
}

function updateSetupVehicleSortButtons(picker) {
  const key = picker.dataset.sortKey || "";
  const direction = picker.dataset.sortDirection || "asc";
  picker.querySelectorAll("[data-setup-vehicle-sort]").forEach((button) => {
    const active = button.dataset.setupVehicleSort === key;
    button.classList.toggle("active", active);
    button.setAttribute(
      "aria-sort",
      active ? (direction === "desc" ? "descending" : "ascending") : "none",
    );
  });
}

function sortSetupVehiclePicker(key) {
  const picker = document.getElementById("setupVehiclePicker");
  if (!picker || !key) return;
  const currentKey = picker.dataset.sortKey || "";
  const currentDirection = picker.dataset.sortDirection || "asc";
  const direction =
    currentKey === key && currentDirection === "asc" ? "desc" : "asc";
  picker.dataset.sortKey = key;
  picker.dataset.sortDirection = direction;
  const list = picker.querySelector(".setup-catalog-picker-list");
  const emptyState = picker.querySelector(".setup-catalog-picker-empty");
  [...picker.querySelectorAll("[data-setup-vehicle-row]")]
    .sort((left, right) => compareSetupVehicleRows(left, right, key, direction))
    .forEach((row) => list?.insertBefore(row, emptyState || null));
  updateSetupVehicleSortButtons(picker);
}

function filterSetupVehiclePicker() {
  const picker = document.getElementById("setupVehiclePicker");
  if (!picker) return;
  const search = String(
    document.getElementById("setupVehicleSearchInput")?.value || "",
  )
    .trim()
    .toLowerCase();
  const category =
    document.getElementById("setupVehicleCategoryFilter")?.value || "All";
  const rows = [...picker.querySelectorAll("[data-setup-vehicle-row]")];
  let visibleCount = 0;
  rows.forEach((row) => {
    const matchesSearch =
      !search || String(row.dataset.vehicleSearch || "").includes(search);
    const matchesCategory =
      category === "All" || row.dataset.vehicleGroup === category;
    const visible = matchesSearch && matchesCategory;
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });
  picker
    .querySelector(".setup-catalog-picker-empty")
    ?.classList.toggle("hidden", visibleCount > 0);
  updateSetupVehicleSortButtons(picker);
}

function renderSetupGearPurchaseControls(report) {
  if (!report.editable) {
    return `<p class="entry-advisory"><strong>Audit only:</strong> imported or advanced characters keep their recorded gear here. Use Inventory for current possessions.</p>`;
  }

  return `<section class="setup-trait-group" aria-labelledby="setupGearPurchaseHeading">
    <div class="section-title">
      <div>
        <h4 id="setupGearPurchaseHeading">Buy Starting Gear</h4>
      </div>
    </div>
    <div class="setup-purchase-card-list">
      ${setupWeaponPicker(WEAPON_CATALOG)}
      ${setupGearPicker(GEAR_CATALOG.filter((item) => !isAmmo(item)))}
      ${setupArmorPicker(ARMOR_CATALOG)}
      ${setupVehiclePicker(VEHICLE_CATALOG)}
    </div>
  </section>`;
}

function setupFinalizeBlockerList(report) {
  if (!report.blockers.length) return "";
  return `<div class="setup-finalize-blockers" aria-label="Blocking setup issues">
    <strong>Fix setup issues before starting play:</strong>
    <div class="setup-review-list setup-finalize-blocker-list">
      ${report.blockers.map(setupReviewIssueCard).join("")}
    </div>
  </div>`;
}

function setupFinalizeWarningSummary(report) {
  if (!report.warnings.length) return "";
  return `<p class="creator-note setup-finalize-warning-summary">${esc(report.warnings.length)} warning${report.warnings.length === 1 ? "" : "s"} remain for table review, but they do not block starting play.</p>`;
}

function renderSetupFinalizePanel(report) {
  const blocked = report.blockers.length > 0;
  return `<section class="setup-review-finalize setup-gear-finalize" aria-labelledby="setupGearFinalizeHeading">
    <div>
      <h4 id="setupGearFinalizeHeading">Finish Setup & Start Playing</h4>
      <p>${
        blocked
          ? "Resolve blocking setup issues before finalizing this character."
          : "Finalize setup to save the starting baseline and open the normal Character Sheet / live tracker."
      }</p>
      ${blocked ? setupFinalizeBlockerList(report) : setupFinalizeWarningSummary(report)}
    </div>
    <button type="button" data-setup-action="finishSetup"${blocked ? " disabled" : ""}>${blocked ? "Fix setup issues" : "Finish Setup & Start Playing"}</button>
  </section>`;
}

function renderSetupGear() {
  const validationReport = setupReviewValidationReport();
  const report = validationReport.gearReport;

  return `<section id="setupGearPanel" class="setup-step-panel" aria-labelledby="setupGearHeading">
    <div class="section-title">
      <div>
        <h3 id="setupGearHeading">Gear</h3>
        <p>Buy starting equipment for created characters. Use Inventory later for loot, repairs, trades, and GM adjustments.</p>
      </div>
      <div class="creator-actions">
        ${setupGearResetButton(report)}
        ${setupStatusMarkup(characterSetupStatus("gear"))}
      </div>
    </div>
    ${setupGearSummaryMarkup(report)}
    <div class="setup-gear-workbench">
      ${renderSetupGearPurchaseControls(report)}
      <section class="setup-trait-group setup-recorded-gear" aria-labelledby="setupRecordedGearHeading">
        <div class="section-title">
          <div>
            <h4 id="setupRecordedGearHeading">Current Inventory</h4>
          </div>
        </div>
        <div class="setup-gear-groups">
          ${renderSetupGearGroups(report)}
        </div>
      </section>
    </div>
    ${renderSetupFinalizePanel(validationReport)}
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

function setupReviewStatusTitle(report) {
  if (report.blockers.length) return "Needs Fix";
  if (report.warnings.length) return "Playable with Warnings";
  return "Ready to Play";
}

function setupReviewStatusMessage(report) {
  if (report.blockers.length)
    return "Resolve the blocking setup issues below before finalizing this character.";
  if (report.warnings.length)
    return "No blocking setup issues were found, but some choices may need Marshal review.";
  return "No blocking setup issues were found. Review the character sheet below, then finalize setup to begin tracking this character in play.";
}

function setupReviewStatusBanner(report) {
  const title = setupReviewStatusTitle(report);
  const className = report.blockers.length
    ? "needs-fix"
    : report.warnings.length
      ? "warnings-present"
      : "ready-to-play";
  return `<section class="setup-review-status-banner ${className}" aria-labelledby="setupReviewStatusHeading">
    <div>
      <p class="eyebrow">Setup Status</p>
      <h4 id="setupReviewStatusHeading">${esc(title)}</h4>
      <p>${esc(setupReviewStatusMessage(report))}</p>
    </div>
    ${setupStatusMarkup(report.status, title)}
  </section>`;
}

function setupReviewIssueCard(issue) {
  const action = issue.step
    ? `<button class="ghost small-action" type="button" data-setup-jump-step="${esc(issue.step)}">${esc(issue.action || "Review Step")}</button>`
    : "";
  return `<article class="dossier-note setup-review-issue ${esc(issue.severity)}">
    <strong>${esc(issue.title)}</strong>
    <p>${esc(issue.message)}</p>
    ${action}
  </article>`;
}

function setupReviewIssueSection(title, issues, emptyText, severity) {
  return `<section class="setup-review-validation-section ${esc(severity)}" aria-labelledby="setupReview${slugify(title)}Heading">
    <div class="section-title compact">
      <div>
        <h4 id="setupReview${slugify(title)}Heading">${esc(title)}</h4>
      </div>
      <span class="setup-review-count">${issues.length}</span>
    </div>
    <div class="setup-review-list">
      ${issues.length ? issues.map(setupReviewIssueCard).join("") : emptyState(emptyText)}
    </div>
  </section>`;
}

function setupReviewValidationSections(report) {
  return `<section class="setup-review-validation" aria-label="Setup validation summary">
    ${setupReviewIssueSection("Blocking Issues", report.blockers, "No blocking setup issues.", "blocker")}
    ${setupReviewIssueSection("Warnings", report.warnings, "No warnings requiring Marshal review.", "warning")}
    ${setupReviewIssueSection("Optional Notes", report.optional, "No optional notes.", "optional")}
  </section>`;
}

function setupReviewReadonlyTagCard(item, kind = "") {
  return `<article class="dossier-tag ${esc(kind)} setup-review-readonly-card">
    <div class="dossier-tag-head">
      <div>
        <strong>${esc(item.name || "Unnamed")}</strong>
        ${item.meta ? `<span>${esc(item.meta)}</span>` : ""}
      </div>
    </div>
    ${item.summary ? `<p>${esc(item.summary)}</p>` : ""}
    ${item.note ? `<p class="tag-note">${esc(item.note)}</p>` : ""}
    ${item.sourceMeta ? `<small>${esc(item.sourceMeta)}</small>` : ""}
  </article>`;
}

function setupReviewDerivedCards() {
  const derived = character.derived || {};
  return [
    ["Pace", derived.pace, derived.basePace ? `Base ${derived.basePace}` : ""],
    [
      "Parry",
      derived.parry,
      derived.baseParry !== undefined ? `Base ${derived.baseParry}` : "",
    ],
    [
      "Toughness",
      derived.toughness,
      [
        derived.baseToughness !== undefined
          ? `Base ${derived.baseToughness}`
          : "",
        `Armor ${compactText(derived.armor, "0")}`,
      ]
        .filter(Boolean)
        .join(" + "),
    ],
    ["Size", derived.size ?? character.size, ""],
    ["Armor", `+${compactText(derived.armor, "0")}`, "Best equipped"],
  ]
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    )
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");
}

function setupReviewIdentityPreview() {
  const subtitle = [
    character.rank || "Novice",
    character.ancestry || "Human",
    character.archetype || "",
  ]
    .filter(Boolean)
    .join(" • ");
  return `<section class="setup-review-preview-card setup-review-identity-preview" aria-labelledby="setupReviewIdentityHeading">
    <h4 id="setupReviewIdentityHeading">Character</h4>
    <article class="setup-review-character-card">
      <div>
        <strong>${esc(character.name || "Unnamed Character")}</strong>
        <span>${esc(subtitle || "Novice • Human")}</span>
        <p>${esc([character.gender, character.age, character.player ? `Player: ${character.player}` : ""].filter(Boolean).join(" • ") || "Concept details incomplete.")}</p>
      </div>
    </article>
    <div class="setup-review-grid setup-review-concept-grid">
      ${setupDetail("Name", character.name)}
      ${setupDetail("Gender", character.gender)}
      ${setupDetail("Age", character.age)}
      ${setupDetail("Profession or Title", character.archetype)}
      ${setupDetail("Race / Ancestry", character.ancestry)}
      ${setupDetail("Player Name", character.player)}
      ${setupDetail("Recorded Rank", character.rank)}
    </div>
  </section>`;
}

function setupReviewTraitsPreview() {
  const attributes = sortedAttributeEntries();
  const skills = sortedSkills();
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewTraitsHeading">
    <h4 id="setupReviewTraitsHeading">Traits</h4>
    <div class="attribute-dice-grid">
      ${attributes.length ? attributes.map(([name, die]) => attributeCardMarkup(name, die)).join("") : emptyState("No attributes recorded.")}
    </div>
    <div class="skill-list setup-review-skill-list">
      ${skills.length ? skills.map(skillChipMarkup).join("") : emptyState("No skills recorded.")}
    </div>
  </section>`;
}

function setupReviewEdgesPreview() {
  const edges = (character.edges || []).filter((edge) => edge.name);
  const hindrances = (character.hindrances || []).filter(
    (hindrance) => hindrance.name,
  );
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewEdgesHeading">
    <h4 id="setupReviewEdgesHeading">Edges & Hindrances</h4>
    <div class="setup-review-two-column">
      <div>
        <h5>Edges</h5>
        <div class="setup-review-card-list">
          ${
            edges.length
              ? edges
                  .map((edge) =>
                    setupReviewReadonlyTagCard(
                      {
                        name: edge.name,
                        meta: edgeDisplayMeta(edge),
                        summary: edge.shortSummary || edge.summary || "",
                        note: edge.notes || edge.text || "",
                        sourceMeta: sourceMeta(edge),
                      },
                      "edge",
                    ),
                  )
                  .join("")
              : emptyState("No Edges recorded.")
          }
        </div>
      </div>
      <div>
        <h5>Hindrances</h5>
        <div class="setup-review-card-list">
          ${
            hindrances.length
              ? hindrances
                  .map((hindrance) =>
                    setupReviewReadonlyTagCard(
                      {
                        name: hindrance.name,
                        meta: hindranceDisplayMeta(hindrance),
                        summary:
                          hindrance.shortSummary || hindrance.summary || "",
                        note: hindrance.notes || hindrance.text || "",
                        sourceMeta: sourceMeta(hindrance),
                      },
                      "hindrance",
                    ),
                  )
                  .join("")
              : emptyState("No Hindrances selected.")
          }
        </div>
      </div>
    </div>
  </section>`;
}

function setupReviewDerivedPreview() {
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewDerivedHeading">
    <h4 id="setupReviewDerivedHeading">Derived Stats</h4>
    <div class="character-derived-grid">
      ${setupReviewDerivedCards()}
      ${passiveEffectDerivedCards("character")}
    </div>
  </section>`;
}

function setupReviewArcanePreview(report) {
  const powerPoints = powerPointResource();
  const background = character.arcaneBackground;
  const powers = (character.powers || []).filter((power) => power.name);
  const summaryRows = background
    ? [
        ["Background", background.name || background.edgeName],
        ["Arcane Skill", background.arcaneSkill || ""],
        [
          "Power Points",
          powerPoints ? `${powerPoints.current} / ${powerPoints.max}` : "—",
        ],
        ["Known Powers", powers.length],
      ]
    : powerPoints
      ? [
          ["Background", "Manual Power Points"],
          ["Power Points", `${powerPoints.current} / ${powerPoints.max}`],
          ["Known Powers", powers.length],
        ]
      : [];
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewArcaneHeading">
    <h4 id="setupReviewArcaneHeading">Arcane</h4>
    ${
      summaryRows.length
        ? `<div class="arcane-snapshot-grid">${summaryRows
            .map(
              ([label, value]) =>
                `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
            )
            .join("")}</div>`
        : emptyState("No Arcane Background or Power Points configured.")
    }
    <div class="setup-review-card-list">
      ${
        powers.length
          ? powers
              .map((power) => {
                const audit = report.powerReport.powerAudits.find(
                  (item) => item.power === power,
                );
                return setupReviewReadonlyTagCard(
                  {
                    name: power.name,
                    meta: [
                      audit?.catalog?.rank,
                      audit?.catalog?.basePowerPoints !== undefined
                        ? `${audit.catalog.basePowerPoints} PP`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" • "),
                    summary:
                      power.shortSummary ||
                      power.summary ||
                      audit?.catalog?.shortSummary ||
                      "",
                    note: power.notes || power.text || "",
                    sourceMeta: sourceMeta(power),
                  },
                  "power",
                );
              })
              .join("")
          : ""
      }
    </div>
  </section>`;
}

function setupReviewGearEntryMarkup(entry) {
  const item = entry.item || {};
  const details = [
    entry.type === "weapon" && item.damage ? `Damage ${item.damage}` : "",
    entry.type === "weapon" && item.range ? `Range ${item.range}` : "",
    entry.type === "armor" && item.armor ? `Armor +${item.armor}` : "",
    entry.type === "ammo"
      ? `Reserve ${Math.max(0, Number(item.count) || 0)}`
      : "",
    entry.locationLabel,
    entry.type !== "vehicle" ? formatWeightPounds(entry.weight) : "",
  ].filter(Boolean);
  return `<div class="equipment-line">
    <strong>${esc(entry.label)}</strong>
    <span>${esc(details.join(" • ") || setupGearEntryLocationLabel(entry))}</span>
  </div>`;
}

function setupReviewGearPreview(report) {
  const groups = [
    ["Weapons", report.entries.filter((entry) => entry.type === "weapon")],
    ["Armor", report.entries.filter((entry) => entry.type === "armor")],
    ["Gear", report.entries.filter((entry) => entry.type === "gear")],
    ["Ammunition", report.entries.filter((entry) => entry.type === "ammo")],
    ["Vehicles", report.entries.filter((entry) => entry.type === "vehicle")],
  ].filter(([, entries]) => entries.length);
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewGearHeading">
    <h4 id="setupReviewGearHeading">Gear</h4>
    <div class="setup-review-grid setup-review-core-grid">
      ${setupDetail("Money", money(character.moneyCents))}
      ${setupDetail("Current Load", compactLoadText(report.normal))}
      ${setupDetail("Combat Load", formatWeightPounds(report.normal.combatLoad))}
      ${setupDetail("Carrying Capacity", formatWeightPounds(report.normal.carryingCapacity))}
    </div>
    ${
      groups.length
        ? groups
            .map(
              ([title, entries]) => `<div class="setup-review-gear-group">
                <h5>${esc(title)}</h5>
                <div class="setup-review-card-list">${entries
                  .map(setupReviewGearEntryMarkup)
                  .join("")}</div>
              </div>`,
            )
            .join("")
        : emptyState("No gear recorded.")
    }
  </section>`;
}

function setupReviewNotesPreview() {
  const notes = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => String(value || "").trim());
  if (!notes.length) return "";
  return `<section class="setup-review-preview-card" aria-labelledby="setupReviewNotesHeading">
    <h4 id="setupReviewNotesHeading">Notes</h4>
    <div class="setup-review-list">
      ${notes
        .map(
          ([label, value]) =>
            `<article class="dossier-note"><strong>${esc(label)}</strong><p>${esc(value)}</p></article>`,
        )
        .join("")}
    </div>
  </section>`;
}

function setupReviewCharacterSheetPreview(report) {
  return `<section class="setup-review-preview" aria-labelledby="setupReviewPreviewHeading">
    <div class="section-title">
      <div>
        <h4 id="setupReviewPreviewHeading">Character Sheet Preview</h4>
        <p class="creator-note">Read-only preview of the character that will enter play.</p>
      </div>
    </div>
    ${setupReviewIdentityPreview()}
    ${setupReviewTraitsPreview()}
    ${setupReviewDerivedPreview()}
    ${setupReviewEdgesPreview()}
    ${setupReviewArcanePreview(report)}
    ${setupReviewGearPreview(report.gearReport)}
    ${setupReviewNotesPreview()}
  </section>`;
}

function renderSetupReview() {
  const report = setupReviewValidationReport();
  const finalizeDisabled = report.blockers.length > 0;
  const finishLabel = character.creation?.finalized
    ? "Start Playing"
    : "Confirm Setup & Start Playing";

  return `<section id="setupReviewPanel" class="setup-step-panel" aria-labelledby="setupReviewHeading">
    <div class="section-title">
      <div>
        <h3 id="setupReviewHeading">Review & Finalize</h3>
        <p>Confirm the build, resolve blockers, and preview the character sheet before play.</p>
      </div>
      ${setupStatusMarkup(report.status, setupReviewStatusTitle(report))}
    </div>
    ${setupReviewStatusBanner(report)}
    ${setupReviewValidationSections(report)}
    ${setupReviewCharacterSheetPreview(report)}
    <section class="setup-review-finalize" aria-labelledby="setupReviewFinalizeHeading">
      <div>
        <h4 id="setupReviewFinalizeHeading">Finalize</h4>
        <p>${
          finalizeDisabled
            ? "Resolve blocking issues before finalizing this character."
            : "Finalize setup to save the starting baseline and enter normal play mode."
        }</p>
      </div>
      <button type="button" data-setup-action="finishSetup"${finalizeDisabled ? " disabled" : ""}>${esc(finishLabel)}</button>
    </section>
  </section>`;
}
