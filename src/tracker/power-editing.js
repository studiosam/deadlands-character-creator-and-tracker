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

async function addCatalogPower(power = selectedCatalogPower(), options = {}) {
  if (!hasPowerCatalog() || !power) return;
  const warnings = getKnownPowerWarnings(character, power);
  const duplicate = character.powers.some(
    (known) => known.catalogId === power.id,
  );
  let marshalOverride = Boolean(els.powerMarshalOverrideInput?.checked);
  if (
    duplicate &&
    !marshalOverride &&
    !(await appConfirm(`${power.name} is already known.`, {
      title: "Add another copy anyway?",
      confirmText: "Add Copy",
    }))
  )
    return;
  if (warnings.length && !marshalOverride) {
    const proceed = await appConfirm(warnings.join("\n"), {
      title: "Add anyway as a Marshal override?",
      confirmText: "Add Override",
    });
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

async function addRequiredPower() {
  const missing = missingRequiredPower(getArcaneBackgroundProfile(character));
  if (missing)
    await addCatalogPower(missing, { addedReason: "starting-power" });
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

async function addManualPowerPoints() {
  if (powerPointResource()) return;
  const value = await appPrompt("Maximum Power Points?", "15", {
    title: "Enable Manual Power Points",
    inputLabel: "Maximum Power Points",
    inputType: "number",
    confirmText: "Enable",
  });
  if (value === null) return;
  const max = Math.max(0, Math.floor(Number(value) || 0));
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
