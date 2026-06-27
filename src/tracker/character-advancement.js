function setEntryWarning(element, warnings) {
  element.textContent = warnings.join(" ");
  element.classList.toggle("hidden", !warnings.length);
}

function applyEdgeCatalogSelection(edge) {
  els.edgeCatalogSelect.value = edge.catalogId || "";
  els.edgeNameInput.value = edge.name || "";
  selectKnownValue(els.edgeCategoryInput, edge.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge.rank, "Unknown");
  els.edgeSourceInput.value = edge.source || "Deadlands: The Weird West";
  els.edgeRequirementsInput.value = entryTextValue(edge.requirements);
  els.edgeSubchoiceInput.value = edge.subchoice || "";
  els.edgeSummaryInput.value = edge.shortSummary || edge.summary || "";
  els.edgeNotesInput.value = edge.notes || "";
  setEntryWarning(els.edgeWarningText, []);
}

function applyHindranceCatalogSelection(hindrance) {
  els.hindranceCatalogSelect.value = hindrance.catalogId || "";
  els.hindranceNameInput.value = hindrance.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance.severity, "Unknown");
  els.hindranceSourceInput.value =
    hindrance.source || "Deadlands: The Weird West";
  els.hindranceSummaryInput.value =
    hindrance.shortSummary || hindrance.summary || "";
  els.hindranceNotesInput.value = hindrance.notes || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function chooseEdgeCatalogEntry() {
  const entry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  if (!entry) return;
  applyEdgeCatalogSelection({ ...entry, catalogId: entry.id });
}

function chooseHindranceCatalogEntry() {
  const entry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  if (!entry) return;
  applyHindranceCatalogSelection({ ...entry, catalogId: entry.id });
}

function resetEdgeEditor(edge = null) {
  edgeEditingId = edge?.id || "";
  els.edgeEditorTitle.textContent = edge ? "Edit Edge" : "Add Edge";
  els.saveEdgeBtn.textContent = edge ? "Save Edge" : "Add Edge";
  els.edgeCatalogSelect.value = edge?.catalogId || "";
  els.edgeNameInput.value = edge?.name || "";
  selectKnownValue(els.edgeCategoryInput, edge?.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge?.rank, "Unknown");
  els.edgeSourceInput.value = edge?.source || "Manual";
  els.edgeRequirementsInput.value = entryTextValue(edge?.requirements);
  els.edgeSubchoiceInput.value = edge?.subchoice || "";
  els.edgeSummaryInput.value = edge?.shortSummary || edge?.summary || "";
  els.edgeNotesInput.value = edge?.notes || edge?.text || "";
  setEntryWarning(els.edgeWarningText, []);
}

function openEdgeEditor(edge = null) {
  resetEdgeEditor(edge);
  els.edgeEditorPanel.classList.remove("hidden");
  els.edgeNameInput.focus();
}

function closeEdgeEditor() {
  edgeEditingId = "";
  els.edgeEditorPanel.classList.add("hidden");
  setEntryWarning(els.edgeWarningText, []);
}

function edgeDraftFromForm() {
  const existing = character.edges.find((edge) => edge.id === edgeEditingId);
  const catalogEntry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  const id = edgeEditingId || uniqueEntryId(
    generateStableEntryId("edge", els.edgeNameInput.value.trim() || "edge"),
    new Set(character.edges.map((edge) => edge.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.edgeNameInput.value.trim(),
    type: "edge",
    category: els.edgeCategoryInput.value || "Unknown",
    rank: els.edgeRankInput.value || "Unknown",
    requirements: els.edgeRequirementsInput.value.trim(),
    shortSummary: els.edgeSummaryInput.value.trim(),
    notes: els.edgeNotesInput.value.trim(),
    source: els.edgeSourceInput.value.trim() || "Manual",
    subchoice: els.edgeSubchoiceInput.value.trim(),
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

async function saveEdgeEditor() {
  const draft = edgeDraftFromForm();
  const warnings = getEdgeWarnings(character, draft, edgeEditingId);
  setEntryWarning(els.edgeWarningText, warnings);
  if (
    warnings.length &&
    !(await appConfirm(warnings.join("\n"), {
      title: "Save this Edge anyway?",
      confirmText: "Save Edge",
    }))
  )
    return;
  upsertEdge(character, draft);
  closeEdgeEditor();
  render();
  save();
}

function resetHindranceEditor(hindrance = null) {
  hindranceEditingId = hindrance?.id || "";
  els.hindranceEditorTitle.textContent = hindrance
    ? "Edit Hindrance"
    : "Add Hindrance";
  els.saveHindranceBtn.textContent = hindrance
    ? "Save Hindrance"
    : "Add Hindrance";
  els.hindranceCatalogSelect.value = hindrance?.catalogId || "";
  els.hindranceNameInput.value = hindrance?.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance?.severity, "Unknown");
  els.hindranceSourceInput.value = hindrance?.source || "Manual";
  els.hindranceSummaryInput.value =
    hindrance?.shortSummary || hindrance?.summary || "";
  els.hindranceNotesInput.value = hindrance?.notes || hindrance?.text || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function openHindranceEditor(hindrance = null) {
  resetHindranceEditor(hindrance);
  els.hindranceEditorPanel.classList.remove("hidden");
  els.hindranceNameInput.focus();
}

function closeHindranceEditor() {
  hindranceEditingId = "";
  els.hindranceEditorPanel.classList.add("hidden");
  setEntryWarning(els.hindranceWarningText, []);
}

function hindranceDraftFromForm() {
  const existing = character.hindrances.find(
    (hindrance) => hindrance.id === hindranceEditingId,
  );
  const catalogEntry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  const id = hindranceEditingId || uniqueEntryId(
    generateStableEntryId(
      "hindrance",
      els.hindranceNameInput.value.trim() || "hindrance",
    ),
    new Set(character.hindrances.map((hindrance) => hindrance.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.hindranceNameInput.value.trim(),
    type: "hindrance",
    severity: els.hindranceSeverityInput.value || "Unknown",
    shortSummary: els.hindranceSummaryInput.value.trim(),
    notes: els.hindranceNotesInput.value.trim(),
    source: els.hindranceSourceInput.value.trim() || "Manual",
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

async function saveHindranceEditor() {
  const draft = hindranceDraftFromForm();
  const warnings = getHindranceWarnings(character, draft, hindranceEditingId);
  setEntryWarning(els.hindranceWarningText, warnings);
  if (
    warnings.length &&
    !(await appConfirm(warnings.join("\n"), {
      title: "Save this Hindrance anyway?",
      confirmText: "Save Hindrance",
    }))
  )
    return;
  upsertHindrance(character, draft);
  closeHindranceEditor();
  render();
  save();
}

function optionMarkup(value, label, selected = false) {
  return `<option value="${esc(value)}"${selected ? " selected" : ""}>${esc(label)}</option>`;
}

function currentAdvanceTargets() {
  const existing = character.advances.find(
    (advance) => advance.id === advanceEditingId,
  );
  return advanceTargetsForLegacy({
    ...(existing || {}),
    type: els.advanceTypeInput.value,
    targetName: els.advanceTargetNameInput.value,
    targetType: els.advanceTargetTypeInput.value,
    catalogId: existing?.catalogId || "",
    targets: existing?.targets || [],
    powerPointAmount: els.advancePowerPointAmountInput.value,
  });
}

function skillOptionLabel(skill) {
  const die = skillValue(skill);
  return skill.unskilled || !isValidDieStep(die)
    ? `${skill.name} (unskilled 1d4-2 -> d4)`
    : `${skill.name} (${die})`;
}

function skillAdvanceBeforeLabel(target) {
  return target?.unskilled || !target?.before
    ? "unskilled 1d4-2"
    : target.before;
}

function skillOptionSort(left, right) {
  return String(left.name || "").localeCompare(String(right.name || ""), undefined, {
    sensitivity: "base",
  });
}

function deadlandsSkillLibraryOptions() {
  return Object.entries(SKILL_LINKED_ATTRIBUTES).map(([name, linkedAttribute]) => ({
    name,
    die: "",
    linkedAttribute,
    unskilled: true,
  }));
}

function twoSkillAdvanceCandidates() {
  const candidates = new Map();
  deadlandsSkillLibraryOptions().forEach((skill) => {
    candidates.set(plainEntryName(skill.name), skill);
  });
  (character.skills || []).forEach((skill) => {
    if (!skill?.name) return;
    const die = skillValue(skill);
    candidates.set(plainEntryName(skill.name), {
      ...skill,
      unskilled: !isValidDieStep(die),
    });
  });
  return [...candidates.values()];
}

function eligibleSkillsForAdvanceMode(mode, excludedNames = []) {
  const excluded = new Set(excludedNames.map(plainEntryName).filter(Boolean));
  const sourceSkills =
    mode === "two" ? twoSkillAdvanceCandidates() : [...(character.skills || [])];
  return sourceSkills
    .filter((skill) => {
      if (!skill.name || excluded.has(plainEntryName(skill.name))) return false;
      if (mode === "single")
        return canUseSingleSkillAdvance(character, skill.name).ok;
      if (mode === "two") return canUseTwoSkillAdvance(character, skill.name).ok;
      return true;
    })
    .sort(skillOptionSort);
}

function skillSelectMarkup(
  id,
  label,
  selectedName = "",
  mode = "all",
  excludedNames = [],
) {
  const skills = [...(character.skills || [])].sort(skillOptionSort);
  const eligibleSkills =
    mode === "all" ? skills : eligibleSkillsForAdvanceMode(mode, excludedNames);
  return `<label>${esc(label)}<select id="${esc(id)}">${optionMarkup("", "Choose skill", !selectedName)}${eligibleSkills
    .map((skill) =>
      optionMarkup(skill.name, skillOptionLabel(skill), skill.name === selectedName),
    )
    .join("")}</select></label>`;
}

function advanceGeneratedValues() {
  const type = els.advanceTypeInput.value;
  if (type === "New Edge") {
    const edgeId = $("#advanceEdgeSelect")?.value || "";
    const catalogEntry = chosen(EDGE_CATALOG, edgeId);
    const custom = advanceManualEdgeMode
      ? $("#advanceEdgeCustomInput")?.value.trim() || ""
      : "";
    const name = catalogEntry?.name || custom;
    const target = name
      ? {
          targetType: "edge",
          targetName: name,
          targetId: catalogEntry?.id || "",
          catalogId: catalogEntry?.id || "",
        }
      : null;
    return {
      targetType: "edge",
      targetName: name,
      targetId: target?.targetId || "",
      catalogId: target?.catalogId || "",
      summary: name ? `New Edge: ${name}` : "",
      preview: name ? `New Edge: ${name}` : "Select an Edge before applying.",
      targets: target ? [target] : [],
    };
  }

  if (type === "Increase Skill") {
    const selected = $("#advanceSkillSelect")?.value || "";
    const name = selected;
    const target = name ? skillTargetForName(name) : null;
    const check = name ? canUseSingleSkillAdvance(character, name) : null;
    return {
      targetType: "skill",
      targetName: name,
      summary: target
        ? `Increase Skill: ${name} ${skillAdvanceBeforeLabel(target)} → ${target.after}`
        : "",
      preview: target
        ? `Increase Skill: ${name} ${skillAdvanceBeforeLabel(target)} -> ${target.after}\nLinked Attribute: ${target.linkedAttribute || "Unknown"} ${target.linkedAttributeDie || "-"}\nEligible: ${check?.ok ? "yes" : `no - ${check?.reason || "not eligible"}`}`
        : "Select a skill. Add missing skills to the character sheet first, then return here to advance it.",
      targets: target ? [target] : [],
    };
  }

  if (type === "Increase Two Skills") {
    const first = $("#advanceSkillOneSelect")?.value || "";
    const second = $("#advanceSkillTwoSelect")?.value || "";
    const targets = [first, second].filter(Boolean).map(skillTargetForName);
    return {
      targetType: "skill",
      targetName: targets.map((target) => target.targetName).join(", "),
      summary: targets.length
        ? `Increase Two Skills: ${targets
            .map((target) => `${target.targetName} ${skillAdvanceBeforeLabel(target)} → ${target.after}`)
            .join(", ")}`
        : "",
      preview: targets.length
        ? `Increase Two Skills:\n${targets
            .map((target) => {
              const check = canUseTwoSkillAdvance(character, target.targetName);
              return `${target.targetName} ${skillAdvanceBeforeLabel(target)} -> ${target.after}, linked ${target.linkedAttribute || "Unknown"} ${target.linkedAttributeDie || "-"}, ${check.ok ? "eligible" : `not eligible - ${check.reason || "not eligible"}`}`;
            })
            .join("\n")}`
        : "Select two skills. Unskilled Deadlands skills can be advanced to d4.",
      targets,
    };
  }

  if (type === "Increase Attribute") {
    const attributeKey = $("#advanceAttributeSelect")?.value || "";
    const target = attributeKey ? attributeTargetForKey(attributeKey) : null;
    return {
      targetType: "attribute",
      targetName: target?.targetName || "",
      targetId: attributeKey,
      summary: target
        ? `Increase Attribute: ${target.targetName} ${target.before} → ${target.after}`
        : "",
      targets: target ? [target] : [],
    };
  }

  if (type === "New Powers") {
    const targets = advancePowerTargetIds
      .map((id) => findPowerCatalogEntryById(id))
      .filter(Boolean)
      .map((power) => ({
        targetType: "power",
        targetName: power.name,
        targetId: power.id,
        catalogId: power.id,
      }));
    return {
      targetType: "power",
      targetName: targets.map((target) => target.targetName).join(", "),
      summary: targets.length
        ? `New Powers: ${targets.map((target) => target.targetName).join(", ")}`
        : "",
      targets,
    };
  }

  if (type === "Power Points") {
    const amount = Math.max(
      1,
      Math.floor(Number(els.advancePowerPointAmountInput.value) || 5),
    );
    return {
      targetType: "power-points",
      targetName: "Power Points",
      summary: `Power Points: +${amount}`,
      powerPointAmount: amount,
      targets: [
        {
          targetType: "power-points",
          targetName: "Power Points",
          amount,
        },
      ],
    };
  }

  return {
    targetType: els.advanceTargetTypeInput.value || "",
    targetName: els.advanceTargetNameInput.value.trim(),
    summary: els.advanceSummaryInput.value.trim(),
    targets: [],
  };
}

function syncAdvanceGeneratedFields() {
  const type = els.advanceTypeInput.value;
  const generated = advanceGeneratedValues();
  if (type !== "Other / Marshal-approved") {
    els.advanceTargetTypeInput.value = generated.targetType || "";
    els.advanceTargetNameInput.value = generated.targetName || "";
    els.advanceSummaryInput.value = generated.summary || "";
  }
  const preview = $("#advanceGeneratedSummary");
  if (preview) {
    preview.textContent =
      generated.preview || generated.summary || "Choose a target to generate the advance summary.";
  }
  const warning = $("#advanceDynamicWarning");
  if (warning) {
    const warningAdvance = {
      type,
      number: Number(els.advanceNumberInput.value) || nextAdvanceNumber(),
      targetName: generated.targetName,
      targets: generated.targets,
      rank: els.advanceRankInput.value,
      powerPointAmount: generated.powerPointAmount,
    };
    const warnings = [
      ...advanceWarnings(character, warningAdvance, advanceEditingId),
      ...(els.advanceApplyInput.checked
        ? getAdvanceApplicationWarnings(character, warningAdvance)
        : []),
    ];
    warning.textContent = warnings.join(" ");
    warning.classList.toggle("hidden", !warnings.length);
    els.saveAdvanceBtn.disabled =
      els.advanceApplyInput.checked &&
      getAdvanceApplicationWarnings(character, warningAdvance).length > 0;
  }
}

function renderAdvanceDynamicFields(advance = null) {
  const type = els.advanceTypeInput.value;
  const applied = Boolean(advance?.applied);
  els.saveAdvanceBtn.disabled = false;
  const targets = advanceTargetsForLegacy(advance || {
    type,
    targetName: els.advanceTargetNameInput.value,
    targets: [],
  });
  els.advanceTargetTypeField.classList.toggle("hidden", type !== "Other / Marshal-approved");
  els.advanceTargetNameField.classList.toggle("hidden", type !== "Other / Marshal-approved");
  els.advanceSummaryField.classList.toggle("hidden", type !== "Other / Marshal-approved");
  els.advancePowerPointAmountField.classList.toggle("hidden", type !== "Power Points");

  if (type === "New Edge") {
    const selected = targets[0]?.catalogId || targets[0]?.targetId || "";
    const custom = selected ? "" : targets[0]?.targetName || "";
    if (custom && !selected) advanceManualEdgeMode = true;
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid"><label>Edge<select id="advanceEdgeSelect">${optionMarkup("", "Choose Edge", !selected)}${EDGE_CATALOG.map((edge) => optionMarkup(edge.id, `${edge.name} ? ${edge.rank || "Unknown"}`, edge.id === selected)).join("")}</select></label><button id="advanceManualEdgeToggle" class="ghost small-action" type="button">${advanceManualEdgeMode ? "Use Edge dropdown" : "Use manual entry"}</button><label id="advanceManualEdgeField" class="${advanceManualEdgeMode ? "" : "hidden"}">Manual Edge<input id="advanceEdgeCustomInput" value="${esc(custom)}" placeholder="Custom Edge name" /></label><p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else if (type === "Increase Skill") {
    const selected = targets[0]?.targetName || "";
    const eligibleCount = eligibleSkillsForAdvanceMode("single").length;
    const emptyMessage = eligibleCount
      ? ""
      : '<p class="entry-warning full">No skills are eligible for a one-skill advance. A skill must be equal to or higher than its linked attribute.</p>';
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid">${skillSelectMarkup("advanceSkillSelect", "Skill", selected, "single")}${emptyMessage}<p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else if (type === "Increase Two Skills") {
    const firstSelected = targets[0]?.targetName || "";
    const secondSelected = targets[1]?.targetName || "";
    const eligibleCount = eligibleSkillsForAdvanceMode("two").length;
    const emptyMessage =
      eligibleCount >= 2
        ? ""
        : '<p class="entry-warning full">Not enough skills are eligible for a two-skill advance. Each selected skill must be below its linked attribute.</p>';
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid">${skillSelectMarkup("advanceSkillOneSelect", "Skill 1", firstSelected, "two", [secondSelected])}${skillSelectMarkup("advanceSkillTwoSelect", "Skill 2", secondSelected, "two", [firstSelected])}${emptyMessage}<p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else if (type === "Increase Attribute") {
    const selected = normalizeAttributeKey(targets[0]?.targetName || targets[0]?.targetId) || "";
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid"><label>Attribute<select id="advanceAttributeSelect">${optionMarkup("", "Choose attribute", !selected)}${ATTRIBUTE_ORDER.map((key) => optionMarkup(key, `${displayNameFromKey(key)} (${character.attributes?.[key] || "d4"})`, key === selected)).join("")}</select></label><p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else if (type === "New Powers") {
    const selectedIds = new Set(advancePowerTargetIds);
    const selectedMarkup = advancePowerTargetIds
      .map((id) => findPowerCatalogEntryById(id))
      .filter(Boolean)
      .map((power) => `<span class="selected-target-pill">${esc(power.name)} <button type="button" data-remove-advance-power="${esc(power.id)}">×</button></span>`)
      .join("");
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid"><label class="full">Power<select id="advancePowerSelect">${optionMarkup("", "Choose power", true)}${powerCatalogEntries().map((power) => optionMarkup(power.id, `${power.name} • ${power.rank} • ${power.powerPoints || "—"} PP`, false)).join("")}</select></label><button id="advanceAddPowerTargetBtn" type="button">Add Power</button><div class="selected-target-list full">${selectedMarkup || emptyState("No powers selected.")}</div><p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else if (type === "Power Points") {
    els.advanceDynamicFields.innerHTML = `<div class="advancement-dynamic-grid"><p id="advanceGeneratedSummary" class="preview full"></p><p id="advanceDynamicWarning" class="entry-warning hidden full"></p></div>`;
  } else {
    els.advanceDynamicFields.innerHTML = `<p class="preview">Manual history entry. This type does not auto-apply.</p>`;
  }

  els.advanceDynamicFields
    .querySelectorAll("input, select, button")
    .forEach((input) => {
      input.disabled = applied;
      input.oninput = syncAdvanceGeneratedFields;
      input.onchange = syncAdvanceGeneratedFields;
    });
  $("#advanceManualEdgeToggle")?.addEventListener("click", () => {
    advanceManualEdgeMode = !advanceManualEdgeMode;
    if (advanceManualEdgeMode) $("#advanceEdgeSelect").value = "";
    renderAdvanceDynamicFields(advance);
  });
  ["advanceSkillOneSelect", "advanceSkillTwoSelect"].forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.onchange = () => {
      const generated = advanceGeneratedValues();
      renderAdvanceDynamicFields({
        type,
        targetName: generated.targetName,
        targets: generated.targets,
      });
    };
  });
  $("#advanceAddPowerTargetBtn")?.addEventListener("click", () => {
    const id = $("#advancePowerSelect")?.value || "";
    if (id && !advancePowerTargetIds.includes(id)) advancePowerTargetIds.push(id);
    renderAdvanceDynamicFields(advance);
  });
  els.advanceDynamicFields
    .querySelectorAll("[data-remove-advance-power]")
    .forEach((button) => {
      button.onclick = () => {
        advancePowerTargetIds = advancePowerTargetIds.filter(
          (id) => id !== button.dataset.removeAdvancePower,
        );
        renderAdvanceDynamicFields(advance);
      };
    });
  syncAdvanceGeneratedFields();
}

function resetAdvanceEditor(advance = null) {
  const number = advance?.advanceNumber || advance?.number || nextAdvanceNumber();
  const alreadyApplied = Boolean(advance?.applied);
  const existing = Boolean(advance);
  advanceEditingId = advance?.id || "";
  els.advanceEditorTitle.textContent = advance ? "Edit Advance" : "Add Advance";
  els.saveAdvanceBtn.textContent = advance ? "Save Advance" : "Add Advance";
  els.advanceNumberInput.value = number;
  selectKnownValue(
    els.advanceRankInput,
    advance?.rankAtTime ||
      advance?.rank ||
      rankForAdvanceNumber(number),
    "Novice",
  );
  selectKnownValue(
    els.advanceTypeInput,
    advance ? canonicalAdvanceTypeLabel(advance.type) : "New Edge",
    "New Edge",
  );
  els.advanceSummaryInput.value = advanceDisplayLabel(advance) || "";
  els.advanceTargetNameInput.value = advance?.targetName || "";
  selectKnownValue(
    els.advanceTargetTypeInput,
    advance?.targetType || targetTypeForAdvanceType(els.advanceTypeInput.value),
    "",
  );
  els.advancePowerPointAmountInput.value =
    advance?.powerPointAmount || (els.advanceTypeInput.value === "Power Points" ? 5 : "");
  advanceManualEdgeMode =
    els.advanceTypeInput.value === "New Edge" &&
    Boolean(advanceTargetsForLegacy(advance || { type: "New Edge" })[0]?.targetName) &&
    !advanceTargetsForLegacy(advance || { type: "New Edge" })[0]?.catalogId &&
    !advanceTargetsForLegacy(advance || { type: "New Edge" })[0]?.targetId;
  advancePowerTargetIds =
    els.advanceTypeInput.value === "New Powers"
      ? advanceTargetsForLegacy(advance || { type: "New Powers" })
          .map((target) => target.catalogId || target.targetId)
          .filter(Boolean)
      : [];
  els.advanceApplyInput.checked =
    !existing && isSupportedAppliedAdvance(els.advanceTypeInput.value);
  els.advanceApplyInput.disabled =
    alreadyApplied || !isSupportedAppliedAdvance(els.advanceTypeInput.value);
  els.advanceApplyPanel.classList.toggle(
    "hidden",
    alreadyApplied || !isSupportedAppliedAdvance(els.advanceTypeInput.value),
  );
  els.advanceNotesInput.value = advance?.notes || "";
  const showNotes = Boolean(existing && advance?.notes);
  els.advanceNotesField.classList.toggle("hidden", !showNotes);
  els.showAdvanceNotesBtn.classList.toggle("hidden", showNotes);
  selectKnownValue(
    els.advanceSourceInput,
    advance?.source || "advancement",
    "advancement",
  );
  [
    els.advanceNumberInput,
    els.advanceRankInput,
    els.advanceTypeInput,
    els.advanceTargetNameInput,
    els.advanceTargetTypeInput,
    els.advancePowerPointAmountInput,
  ].forEach((input) => {
    input.disabled = alreadyApplied;
  });
  els.advanceAppliedNote.textContent = alreadyApplied
    ? "This advance has already modified the character. V1 locks type, rank, target, and amount; summary, notes, and source remain editable."
    : "";
  els.advanceAppliedNote.classList.toggle("hidden", !alreadyApplied);
  renderAdvanceDynamicFields(advance);
  setEntryWarning(els.advanceWarningText, []);
  els.saveAdvanceBtn.disabled = false;
}

function openAdvanceEditor(advance = null) {
  resetAdvanceEditor(advance);
  els.advanceEditorPanel.classList.remove("hidden");
  els.advanceNumberInput.focus();
}

function closeAdvanceEditor() {
  advanceEditingId = "";
  els.advanceEditorPanel.classList.add("hidden");
  els.saveAdvanceBtn.disabled = false;
  setEntryWarning(els.advanceWarningText, []);
}

function advanceDraftFromForm() {
  const existing = character.advances.find(
    (advance) => advance.id === advanceEditingId,
  );
  const number = Math.max(
    1,
    Math.floor(Number(els.advanceNumberInput.value) || nextAdvanceNumber()),
  );
  const uiType = els.advanceTypeInput.value || "";
  const generated = advanceGeneratedValues();
  const source = els.advanceSourceInput.value || "manual";
  const type = legacyAdvanceTypeToCanonical(uiType, source);
  const isApplied = Boolean(existing?.applied);
  const targetName = isApplied
    ? existing.targetName || ""
    : generated.targetName || els.advanceTargetNameInput.value.trim();
  const summary = isApplied
    ? els.advanceSummaryInput.value.trim()
    : generated.summary || els.advanceSummaryInput.value.trim();
  const id = advanceEditingId || uniqueEntryId(
    generateAdvanceId(number, type, targetName || summary),
    new Set(character.advances.map((advance) => advance.id)),
  );
  const createdAt = existing?.createdAt || new Date().toISOString();

  return {
    ...(existing || {}),
    id,
    label: summary || canonicalAdvanceTypeLabel(type),
    source,
    advanceNumber: number,
    rankAtTime: els.advanceRankInput.value || "",
    createdAt,
    changes: existing?.changes || [],
    notes: els.advanceNotesInput.value.trim(),
    type,
    targetName,
    targetType: isApplied
      ? existing?.targetType || ""
      : generated.targetType ||
        els.advanceTargetTypeInput.value ||
        targetTypeForAdvanceType(type),
    targetId: isApplied
      ? existing?.targetId || ""
      : generated.targetId || existing?.targetId || "",
    catalogId: isApplied
      ? existing?.catalogId || ""
      : generated.catalogId || existing?.catalogId || "",
    targets: isApplied ? existing?.targets || [] : generated.targets || [],
    powerPointAmount: Math.max(
      1,
      Math.floor(
        Number(
          generated.powerPointAmount || els.advancePowerPointAmountInput.value,
        ) || 5,
      ),
    ),
  };
}

function saveAdvanceEditor() {
  const draft = advanceDraftFromForm();
  const warnings = advanceWarnings(character, draft, advanceEditingId);
  setEntryWarning(els.advanceWarningText, warnings);
  let savedAdvance = draft;
  if (els.advanceApplyInput.checked && !draft.applied) {
    const applicationWarnings = getAdvanceApplicationWarnings(character, draft);
    if (applicationWarnings.length) {
      setEntryWarning(els.advanceWarningText, applicationWarnings);
      return;
    }
    try {
      savedAdvance = applyAdvanceToCharacter(draft);
    } catch (error) {
      setEntryWarning(els.advanceWarningText, [
        error?.message || "Could not apply this advance.",
      ]);
      return;
    }
  } else if (!draft.applied) {
    savedAdvance = {
      ...draft,
      applied: false,
      appliedByApp: false,
      appliedAt: "",
      changes: [],
    };
  }
  upsertAdvance(character, savedAdvance);
  closeAdvanceEditor();
  render();
  save();
}

async function handleEntryAction(target) {
  const actionName = target.dataset.entryAction;
  const type = target.dataset.entryType;
  const id = target.dataset.entryId;
  if (type === "edge") {
    const edge = character.edges.find((item) => item.id === id);
    if (!edge) return;
    if (actionName === "edit") openEdgeEditor(edge);
    if (
      actionName === "remove" &&
      (await appConfirm("", {
        title: `Remove Edge "${edge.name || "Unnamed Edge"}"?`,
        confirmText: "Remove Edge",
        danger: true,
      }))
    ) {
      removeEdge(character, id);
      render();
      save();
    }
  }
  if (type === "hindrance") {
    const hindrance = character.hindrances.find((item) => item.id === id);
    if (!hindrance) return;
    if (actionName === "edit") openHindranceEditor(hindrance);
    if (
      actionName === "remove" &&
      (await appConfirm("", {
        title: `Remove Hindrance "${hindrance.name || "Unnamed Hindrance"}"?`,
        confirmText: "Remove Hindrance",
        danger: true,
      }))
    ) {
      removeHindrance(character, id);
      render();
      save();
    }
  }
  if (type === "advancement") {
    const advance = character.advances.find((item) => item.id === id);
    if (!advance) return;
    if (actionName === "edit") openAdvanceEditor(advance);
    if (actionName === "remove") await removeAdvanceWithPrompt(advance);
  }
}

async function removeAdvanceWithPrompt(advance) {
  const label = `Advance #${advance.advanceNumber || advance.number || "?"}`;
  const changes = Array.isArray(advance.changes) ? advance.changes : [];

  if (!advance.applied || !changes.length) {
    const note =
      advance.applied && !changes.length
        ? "\n\nThis advance has no reliable canonical changes data, so only the history record can be removed."
        : "";
    if (
      !(await appConfirm(note.trim(), {
        title: `Remove ${label}?`,
        confirmText: "Remove Advance",
        danger: true,
      }))
    )
      return;
    removeAdvance(character, advance.id);
    render();
    save();
    return;
  }

  const undoPlan = getAdvanceUndoPlan(advance);
  if (!undoPlan.safe) {
    if (
      !(await appConfirm(
        `Applied changes cannot be safely undone.\n\n${undoPlan.messages.join("\n")}`,
        {
          title: `Remove ${label} history only?`,
          confirmText: "Remove History",
          danger: true,
        },
      ))
    )
      return;
    removeAdvance(character, advance.id);
    render();
    save();
    return;
  }

  const choice = await appChoice(
    undoPlan.messages.join("\n"),
    [
      { value: "remove", label: "Remove History", danger: true },
      { value: "undo", label: "Remove and Undo", danger: true },
    ],
    { title: `Remove ${label}?` },
  );
  if (!choice) return;
  const normalizedChoice = String(choice).trim().toLowerCase();
  if (normalizedChoice === "undo") undoAdvanceChanges(advance);
  else if (normalizedChoice !== "remove") return;
  removeAdvance(character, advance.id);
  render();
  save();
}
