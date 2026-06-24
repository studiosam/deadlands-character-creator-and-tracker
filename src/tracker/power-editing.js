function addPower() {
  const name = els.powerNameInput.value.trim();
  if (!name) return;
  const existing = powerEditingId
    ? character.powers.find((power) => power.id === powerEditingId)
    : character.powers.find(
        (power) => power.name.toLowerCase() === name.toLowerCase(),
      );
  const data = {
    name,
    baseCost: els.powerCostInput.value.trim(),
    powerPoints: els.powerCostInput.value.trim(),
    range: els.powerRangeInput.value.trim(),
    duration: els.powerDurationInput.value.trim(),
    source: els.powerSourceInput.value.trim() || "Manual power",
    trapping: els.powerTrappingInput.value.trim(),
    shortSummary: els.powerSummaryInput.value.trim(),
    notes: els.powerNotesInput.value.trim(),
    arcaneBackground: character.arcaneBackground?.name || "",
    addedReason: "custom-homebrew",
    isCustom: true,
  };
  if (existing) Object.assign(existing, data);
  else
    character.powers.push(
      normalizePowerRecord(
        {
          id: `${slugify(name)}-${Date.now()}`,
          rank: "Novice",
          active: false,
          modifiers: [],
          ...data,
        },
        character.powers.length,
        data.source,
      ),
    );

  els.powerNameInput.value = "";
  els.powerCostInput.value = "";
  els.powerRangeInput.value = "";
  els.powerDurationInput.value = "";
  els.powerSourceInput.value = "";
  els.powerTrappingInput.value = "";
  els.powerSummaryInput.value = "";
  els.powerNotesInput.value = "";
  powerEditingId = "";
  render();
  save();
}

function addCatalogPower(power = selectedCatalogPower(), options = {}) {
  if (!hasPowerCatalog() || !power) return;
  const warnings = getKnownPowerWarnings(character, power);
  const duplicate = character.powers.some(
    (known) => known.catalogId === power.id,
  );
  let marshalOverride = Boolean(els.powerMarshalOverrideInput?.checked);
  if (
    duplicate &&
    !marshalOverride &&
    !confirm(`${power.name} is already known. Add another copy anyway?`)
  )
    return;
  if (warnings.length && !marshalOverride) {
    const proceed = confirm(
      `${warnings.join("\n")}\n\nAdd anyway as a Marshal override?`,
    );
    if (!proceed) return;
    marshalOverride = true;
  }
  character.powers.push(
    normalizePowerRecord(
      createKnownPowerFromCatalog(power, character, {
        addedReason:
          options.addedReason ||
          (marshalOverride ? "marshal-override" : "new-powers-edge"),
      }),
      character.powers.length,
      character.arcaneBackground?.edgeName,
    ),
  );
  render();
  save();
}

function addRequiredPower() {
  const missing = missingRequiredPower(getArcaneBackgroundProfile(character));
  if (missing) addCatalogPower(missing, { addedReason: "starting-power" });
}

function openPowerEditor(power) {
  powerEditingId = power.id;
  els.powerNameInput.value = power.name || "";
  els.powerCostInput.value = power.baseCost || power.powerPoints || "";
  els.powerRangeInput.value = power.range || "";
  els.powerDurationInput.value = power.duration || "";
  els.powerSourceInput.value = power.source || "";
  els.powerTrappingInput.value = power.trapping || "";
  els.powerSummaryInput.value = power.shortSummary || "";
  els.powerNotesInput.value = power.notes || "";
  els.powerAddForm.classList.remove("hidden");
  els.powerNameInput.focus();
}

function addManualPowerPoints() {
  if (powerPointResource()) return;
  const max = Math.max(
    0,
    Math.floor(Number(prompt("Maximum Power Points?", "15")) || 0),
  );
  character.resources.push(
    makePowerPointResource(null, {
      current: max,
      max,
      source: "Manual setup",
      note: "House rule, custom character, or manual post-import setup.",
    }),
  );
  render();
  save();
}
