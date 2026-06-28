function renderResources() {
  els.resourcesList.innerHTML = "";
  if (!character.resources.length) {
    els.resourcesList.innerHTML = emptyState("No special resources.");
    return;
  }

  character.resources.forEach((resource) => {
    if (resource.id === "power-points") {
      appendPowerPointControls(els.resourcesList, resource, { showName: true });
      return;
    }

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>Source: ${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      resource.current = Math.max(0, resource.current - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      resource.current = resource.max
        ? Math.min(resource.max, resource.current + 1)
        : resource.current + 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      resource.current = resource.max;
      render();
      save();
    };
    els.resourcesList.appendChild(row);
  });
}

function powerPointResource() {
  return character.resources.find((resource) => resource.id === "power-points");
}

function hasPowerCatalog() {
  return (
    Array.isArray(window.POWER_CATALOG) &&
    typeof getArcaneBackgroundProfile === "function" &&
    typeof findPowerCatalogEntryById === "function"
  );
}

function powerCatalogEntries() {
  return hasPowerCatalog() ? window.POWER_CATALOG : [];
}

function knownPowerCatalogIds() {
  return new Set(
    character.powers.map((power) => power.catalogId).filter(Boolean),
  );
}

function missingRequiredPower(profile) {
  if (!profile) return null;
  const knownIds = knownPowerCatalogIds();
  return (profile.requiredStartingPowers || [])
    .map((id) => findPowerCatalogEntryById(id))
    .find((power) => power && !knownIds.has(power.id));
}

function filteredCatalogPowers() {
  if (!hasPowerCatalog() || !els.powerCatalogSearch) return [];
  const profile = getArcaneBackgroundProfile(character);
  const query = normalizePowerCatalogText(els.powerCatalogSearch.value);
  const rank = els.powerRankFilter.value;
  const validOnly = els.powerValidOnlyInput.checked;
  const allowedIds = new Set(profile?.allowedPowerIds || []);
  return powerCatalogEntries()
    .filter((power) => {
      if (validOnly && profile && !allowedIds.has(power.id)) return false;
      if (rank && power.rank !== rank) return false;
      if (
        query &&
        !normalizePowerCatalogText(
          `${power.name} ${power.shortSummary} ${power.variableCostNotes}`,
        ).includes(query)
      )
        return false;
      return true;
    })
    .sort(
      (left, right) =>
        powerRankValue(left.rank) - powerRankValue(right.rank) ||
        (left.basePowerPoints ?? 999) - (right.basePowerPoints ?? 999) ||
        left.name.localeCompare(right.name),
    );
}

function selectedCatalogPower() {
  if (!hasPowerCatalog() || !els.powerCatalogSelect) return null;
  return findPowerCatalogEntryById(els.powerCatalogSelect.value);
}

function getKnownPowerWarnings(character, power) {
  const warnings = [];
  const profile = hasPowerCatalog()
    ? getArcaneBackgroundProfile(character)
    : null;
  if (!profile) {
    warnings.push("No Arcane Background is selected.");
    return warnings;
  }
  if (!profile.allowedPowerIds.includes(power.id))
    warnings.push(`${power.name} is not normally allowed for ${profile.name}.`);
  if (!rankAllowsPower(character.rank, power.rank))
    warnings.push(`${power.name} requires ${power.rank} rank.`);
  if (character.powers.some((known) => known.catalogId === power.id))
    warnings.push(`${power.name} is already a known power.`);
  const restriction = powerRestrictionForProfile(power, profile);
  if (restriction) warnings.push(restriction);
  return warnings;
}

function catalogPowerPreviewMarkup(power) {
  if (!power) return emptyState("Choose a catalog power.");
  const profile = getArcaneBackgroundProfile(character);
  const restriction = powerRestrictionForProfile(power, profile);
  return `<div class="catalog-preview-card"><div class="topline"><div><h3>${esc(power.name)}</h3><p class="meta">${esc(power.rank)} • ${esc(power.powerPoints)} PP • Range ${esc(power.range)} • Duration ${esc(power.duration)}</p></div><span class="pill">${esc(power.source)}</span></div><p>${esc(power.shortSummary)}</p>${power.variableCostNotes ? `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>` : ""}${restriction ? `<p class="catalog-warning"><strong>Restriction:</strong> ${esc(restriction)}</p>` : ""}<p class="muted">Allowed: ${esc(power.allowedBackgrounds.join(", "))}</p></div>`;
}

function renderPowerSetupNotice() {
  if (!els.powerSetupNotice || !els.addRequiredPowerBtn) return;
  const profile = hasPowerCatalog()
    ? getArcaneBackgroundProfile(character)
    : null;
  if (!profile) {
    els.powerSetupNotice.classList.remove("hidden");
    els.powerSetupNotice.textContent =
      "Select an Arcane Background before choosing catalog powers. Marshal override still allows custom additions.";
    els.addRequiredPowerBtn.classList.add("hidden");
    return;
  }
  const missing = missingRequiredPower(profile);
  els.powerSetupNotice.classList.remove("hidden");
  els.powerSetupNotice.textContent = `${profile.notes} Known powers: ${character.powers.length} / ${profile.startingPowerCount} starting powers.`;
  els.addRequiredPowerBtn.classList.toggle("hidden", !missing);
  if (missing)
    els.addRequiredPowerBtn.textContent = `Add Required Power: ${missing.name}`;
}

function renderPowerCatalogPicker() {
  if (
    !els.powerCatalogSelect ||
    !els.powerCatalogPreview ||
    !els.powerCatalogWarning
  )
    return;
  if (!hasPowerCatalog()) {
    els.powerCatalogSelect.innerHTML =
      '<option value="">Power catalog unavailable</option>';
    els.powerCatalogPreview.innerHTML = emptyState(
      "Power catalog is unavailable. Manual powers still work.",
    );
    return;
  }
  renderPowerSetupNotice();
  const powers = filteredCatalogPowers();
  const previous = els.powerCatalogSelect.value;
  els.powerCatalogSelect.innerHTML = powers.length
    ? powers
        .map(
          (power) =>
            `<option value="${esc(power.id)}">${esc(power.name)} • ${esc(power.rank)} • ${esc(power.powerPoints)} PP</option>`,
        )
        .join("")
    : '<option value="">No matching powers</option>';
  if (powers.some((power) => power.id === previous))
    els.powerCatalogSelect.value = previous;
  const selected = selectedCatalogPower();
  const warnings = selected ? getKnownPowerWarnings(character, selected) : [];
  els.powerCatalogWarning.innerHTML = warnings.length
    ? warnings.map((warning) => `<p>${esc(warning)}</p>`).join("")
    : "";
  els.powerCatalogPreview.innerHTML = catalogPowerPreviewMarkup(selected);
  renderHucksterAvailablePowers();
}

function renderHucksterAvailablePowers() {
  if (!els.hucksterAvailablePowers || !hasPowerCatalog()) return;
  const profile = getArcaneBackgroundProfile(character);
  els.hucksterAvailablePowers.classList.toggle(
    "hidden",
    profile?.id !== "huckster",
  );
  if (profile?.id !== "huckster") return;
  const knownIds = knownPowerCatalogIds();
  const available = getAllowedPowersForCharacter(character)
    .filter((power) => !knownIds.has(power.id))
    .slice(0, 60);
  els.hucksterAvailablePowers.innerHTML = `<h3>Deal with the Devil Available Powers</h3><p class="muted">These are available to Hucksters through Deal with the Devil. They are not automatically Known Powers.</p><div class="catalog-chip-list">${available.map((power) => `<span>${esc(power.name)}</span>`).join("")}</div>`;
}

function renderPowers() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneSummary.textContent = background
    ? `${background.name} • ${background.arcaneSkill}`
    : powerPoints
      ? "Manual Power Points"
      : "No Arcane Background";
  renderPowerCatalogPicker();
  els.powersList.innerHTML = "";
  if (!character.powers.length) {
    els.powersList.innerHTML = emptyState("No powers tracked yet.");
    return;
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.powersList.appendChild(renderPowerCard(power, { includeDelete: true }));
  });
}

function renderHucksterDeal() {
  const deal = character.hucksterDeal;
  els.hucksterDealPanel.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const values = {
    hucksterSelectedPower: deal.selectedPower,
    hucksterRequiredPowerPoints: deal.requiredPowerPoints,
    hucksterGamblingRollResult: deal.gamblingRollResult,
    hucksterCardsDrawn: deal.cardsDrawn,
    hucksterPokerHand: deal.pokerHand,
    hucksterTemporaryPowerPoints: deal.temporaryPowerPoints,
    hucksterShortagePenalty: deal.shortagePenalty,
    hucksterLeftoverPowerPoints: deal.leftoverPowerPoints,
    hucksterNotes: deal.notes,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (document.activeElement !== els[key]) els[key].value = value ?? "";
  });
  els.hucksterAnteBennySpent.checked = Boolean(deal.anteBennySpent);
  els.hucksterUsedJoker.checked = Boolean(deal.usedJoker);
  els.hucksterBackfireTriggered.checked = Boolean(deal.backfireTriggered);
}
