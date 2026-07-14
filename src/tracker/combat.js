/**
 * Live tracker rendering and controls.
 *
 * Table state changes frequently during play: resources, conditions, loaded
 * ammunition, active powers, and reminders. This module should render
 * character-sheet controls without changing permanent setup semantics.
 */
function renderResourceControls(container, resources) {
  container.innerHTML = "";
  if (!resources.length) {
    container.innerHTML = emptyState("No active combat resources.");
    return;
  }

  resources.forEach((resource) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
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
    container.appendChild(row);
  });
}

function recoverResource(resource, amount) {
  resource.current = resource.max
    ? Math.min(resource.max, resource.current + amount)
    : resource.current + amount;
  render();
  save();
}

function appendPowerPointControls(
  container,
  resource,
  { showName = false } = {},
) {
  const row = document.createElement("div");
  row.className = "row power-point-resource-row";
  const max = resource.max || "—";
  const value = `${resource.current} / ${max}`;
  const recoveryPerHour = characterPowerPointRecoveryPerHour(character);
  row.innerHTML = `<div class="power-point-resource-copy"><div class="power-point-resource-heading"><strong>${showName ? esc(resource.name) : value}</strong>${showName ? `<strong class="power-point-resource-value">${value}</strong>` : ""}</div><span class="power-point-resource-label">Available / Maximum</span><div class="power-point-resource-meta"><span>Recover ${recoveryPerHour} per hour</span></div></div><div class="controls resource-recovery-actions"><button data-recover="hour" type="button" aria-label="Recover 1 hour +${recoveryPerHour}">1 Hour (+${recoveryPerHour})</button><button data-recover="5" type="button">+5</button><button data-recover="10" type="button">+10</button><button data-recover="15" type="button">+15</button><button data-recover="max" type="button">Max</button></div>`;
  row.querySelectorAll("[data-recover]").forEach((button) => {
    const atMax = Boolean(resource.max && resource.current >= resource.max);
    button.disabled =
      atMax || (button.dataset.recover === "max" && !resource.max);
    button.onclick = () => {
      if (button.dataset.recover === "max") {
        if (resource.max) {
          resource.current = resource.max;
          render();
          save();
        }
        return;
      }
      const amount =
        button.dataset.recover === "hour"
          ? recoveryPerHour
          : Number(button.dataset.recover);
      recoverResource(resource, amount);
    };
  });
  container.appendChild(row);
}

function renderCombatStatusResources() {
  const statuses = [
    {
      name: "Bleeding Out",
      text: character.conditions.bleedingOut ? "Active" : "Clear",
      active: character.conditions.bleedingOut,
    },
  ].filter((status) => status.active);

  els.combatStatusResources.classList.toggle("hidden", !statuses.length);
  els.combatStatusResources.innerHTML = [
    ...statuses.map(
      (status) =>
        `<div class="row"><div><strong>${esc(status.name)}</strong><span>${esc(status.text)}</span></div></div>`,
    ),
  ].join("");
}

function renderActionCards() {
  character.actionCards = normalizeActionCardState(character.actionCards);
  const state = character.actionCards;
  const capabilities = actionCardCapabilities(character);
  const quickStatus = quickRedrawStatus(character);
  const hasTrackedState = Boolean(
    state.current || state.secondary || state.notes,
  );
  const isRelevant = Boolean(capabilities.effects.length || hasTrackedState);

  els.actionCardPanel.classList.toggle("hidden", !isRelevant);
  if (!isRelevant) return;

  const rules = capabilities.effects.map(
    (effect) => `${effect.sourceName}: ${effect.displayLabel}`,
  );
  if (quickStatus.applies) rules.push(quickStatus.label);

  els.actionCardStatusPill.textContent = quickStatus.available
    ? "Redraw"
    : capabilities.effects.length
      ? `Draw ${capabilities.drawCount}`
      : "Manual";
  els.actionCardSummary.textContent = capabilities.drawInstruction;
  els.actionCardRules.innerHTML = rules.length
    ? rules.map((rule) => `<span>${esc(rule)}</span>`).join("")
    : "<span>No Action Card Edges or Hindrances detected.</span>";
  els.actionCardSecondaryField.classList.toggle(
    "hidden",
    !capabilities.recordsMultipleCards && !state.secondary,
  );

  if (document.activeElement !== els.actionCardInput) {
    els.actionCardInput.value = state.current;
  }
  if (document.activeElement !== els.actionCardSecondaryInput) {
    els.actionCardSecondaryInput.value = state.secondary;
  }
  if (document.activeElement !== els.actionCardNotesInput) {
    els.actionCardNotesInput.value = state.notes;
  }
}

function combatPenaltyInfo() {
  const damageStatus = characterDamageStatus(character);
  const rawWoundPenalty = damageStatus.wounds.penalty;
  const woundPenalty = Math.max(
    0,
    rawWoundPenalty - characterWoundPenaltyReduction(character, "combat"),
  );
  const fatiguePenalty = damageStatus.fatigue.penalty;
  const traitPenalties = [];
  const modifiers = [];

  if (woundPenalty)
    traitPenalties.push({ label: "Wounds", value: -woundPenalty });
  if (fatiguePenalty)
    traitPenalties.push({ label: "Fatigue", value: -fatiguePenalty });
  if (character.conditions.distracted)
    traitPenalties.push({ label: "Distracted", value: -2 });

  const conditionNotes = [
    ["shaken", "Shaken: limited actions"],
    ["vulnerable", "Vulnerable: +2 attacks vs you"],
    ["stunned", "Stunned: cannot act; attacks vs you +2"],
    ["prone", "Prone: -2 attacks; close attacks vs you +2"],
    ["bound", "Bound: can't move; likely Distracted/Vulnerable"],
    ["entangled", "Entangled: can't move; likely Distracted"],
    ["aiming", "Aiming: +2 ranged attack"],
    ["defending", "Defending: +4 Parry"],
    ["theDrop", "The Drop: +4 attack/damage"],
    ["onHold", "On Hold: interrupt ready"],
    ["wildAttack", "Wild Attack: +2 Fighting/damage; -2 Parry"],
    ["bleedingOut", "Bleeding Out: incapacitated"],
    ["diseased", "Diseased: check disease effects"],
    ["poisoned", "Poisoned: check poison effects"],
  ];

  conditionNotes.forEach(([key, text]) => {
    if (character.conditions[key]) modifiers.push(text);
  });
  passiveEffectSummaryItems("combat").forEach((effect) =>
    modifiers.push(effect),
  );

  const total = traitPenalties.reduce(
    (sum, penalty) => sum + Math.abs(penalty.value),
    0,
  );

  return { total, traitPenalties, modifiers };
}

function concisePenaltyLabel(label) {
  return String(label || "")
    .replace(
      /^Athletics and rolls to resist Athletics -2$/,
      "Athletics / resist Athletics -2",
    )
    .replace(/^Running die increases one step$/, "Running die +1 step")
    .replace(/^Running die is d4$/, "Running die d4")
    .replace(/^Ignore (\d+) points? of Gang Up bonus$/, "Gang Up ignored -$1")
    .replace(
      /^Fighting bonus damage die becomes (d\d+)$/,
      "Fighting bonus damage $1",
    )
    .replace(/^Maximum Wounds \+(\d+);.*$/, "Max Wounds +$1")
    .replace(
      /^Actions at 5 inches \/ 10 yards or more -2$/,
      "Distant actions -2",
    )
    .replace(/^Mechanical or electrical device rolls -2$/, "Device rolls -2")
    .replace(/^Vigor to resist Fatigue -2$/, "Vigor vs Fatigue -2")
    .trim();
}

function modifierLabelIsVisible(label) {
  return /(?:^|\s)[+-]\d+\b|Pace \d|Running die|Parry|Toughness|Maximum Wounds|Ignore \d|bonus damage die/i.test(
    label || "",
  );
}

function modifierChip({ label, cause, legacyText, kind = "neutral" }) {
  const match = String(label || "").match(/^(.*?)([+-]\d+)$/);
  const labelMarkup = match
    ? `<span class="modifier-chip-label">${esc(match[1].trim())}</span> <strong class="modifier-chip-value">${esc(match[2])}</strong>`
    : `<strong class="modifier-chip-label">${esc(label)}</strong>`;
  return `<span class="modifier-chip ${esc(kind)}" title="${esc(cause)}"><span class="modifier-chip-copy">${labelMarkup}</span><span class="question-help modifier-source-help" tabindex="0" role="img" aria-label="Source: ${esc(cause)}" data-tooltip="${esc(cause)}">?</span><span class="sr-only">${esc(legacyText || `${cause}: ${label}`)}</span></span>`;
}

function conditionModifierChips() {
  const conditionChips = [
    ["shaken", "Limited actions", "Shaken: limited actions"],
    ["vulnerable", "Attacks vs you +2", "Vulnerable: +2 attacks vs you"],
    ["stunned", "Cannot act", "Stunned: cannot act; attacks vs you +2"],
    ["stunned", "Attacks vs you +2", "Stunned: cannot act; attacks vs you +2"],
    ["prone", "Attacks -2", "Prone: -2 attacks; close attacks vs you +2"],
    [
      "prone",
      "Close attacks vs you +2",
      "Prone: -2 attacks; close attacks vs you +2",
    ],
    ["bound", "Cannot move", "Bound: can't move; likely Distracted/Vulnerable"],
    ["entangled", "Cannot move", "Entangled: can't move; likely Distracted"],
    ["aiming", "Ranged attack +2", "Aiming: +2 ranged attack"],
    ["defending", "Parry +4", "Defending: +4 Parry"],
    ["theDrop", "Attack/damage +4", "The Drop: +4 attack/damage"],
    [
      "wildAttack",
      "Fighting/damage +2",
      "Wild Attack: +2 Fighting/damage; -2 Parry",
    ],
    ["wildAttack", "Parry -2", "Wild Attack: +2 Fighting/damage; -2 Parry"],
  ];

  return conditionChips
    .filter(([key]) => character.conditions[key])
    .map(([key, label, legacyText]) =>
      modifierChip({
        label,
        cause: displayNameFromKey(key),
        legacyText,
        kind: /-\d|Cannot|Limited/.test(label) ? "penalty" : "bonus",
      }),
    );
}

function effectModifierChips() {
  return effectHookSummariesForSurface(character, "combat")
    .filter((effect) => modifierLabelIsVisible(effect.displayLabel))
    .map((effect) => {
      const value = Number(effect.value);
      const kind = Number.isFinite(value)
        ? value < 0
          ? "penalty"
          : "bonus"
        : /-\d/.test(effect.displayLabel)
          ? "penalty"
          : /\+\d|Ignore|Maximum|bonus|Running die/i.test(effect.displayLabel)
            ? "bonus"
            : "neutral";
      return modifierChip({
        label: concisePenaltyLabel(effect.displayLabel),
        cause: effect.sourceName,
        legacyText: `${effect.sourceName}: ${effect.displayLabel}`,
        kind,
      });
    });
}

function encumbrancePenaltyFacts(info) {
  if (info.overloaded) {
    return [
      ["Max carry exceeded", "Above maximum lift/carry."],
      [
        "Inventory fix needed",
        "Reduce carried load on Inventory before normal movement.",
      ],
    ];
  }
  if (info.heavyOverload) {
    return [
      ["Pace 1", "Pace 1 for Vigor rounds"],
      ["Vigor each round", "After that: Vigor each round or take Fatigue"],
      ["Agility -2", "Agility and Agility-linked skills -2"],
      ["Agility-linked -2", "Agility and Agility-linked skills -2"],
      ["Vigor vs Fatigue -2", "Vigor rolls to resist Fatigue -2"],
    ];
  }
  if (info.encumbered) {
    return [
      ["Pace -2", "Pace -2, minimum 1"],
      ["Running -2", "Running rolls -2"],
      ["Agility -2", "Agility rolls -2"],
      ["Agility-linked -2", "Agility-linked skills -2"],
      ["Vigor vs Fatigue -2", "Vigor rolls to resist Fatigue -2"],
    ];
  }
  return [];
}

function encumbranceModifierChips(info) {
  return encumbrancePenaltyFacts(info).map(([label, detail]) =>
    modifierChip({
      label,
      cause: `Encumbrance: ${detail}`,
      legacyText: `Encumbrance: ${detail}`,
      kind: "penalty",
    }),
  );
}

function renderCombatPenalties() {
  const { total, traitPenalties, modifiers } = combatPenaltyInfo();
  const incapacitationSources = characterDamageStatus(character).sources;
  const encumbrance = calculateEncumbrance(character, { combat: true });
  const incapacitated = incapacitationSources.length > 0;
  const incapacitationCause = incapacitationSources
    .map(
      (source) =>
        `${source.label} ${source.value}/${source.maximum} exceeds maximum`,
    )
    .join("; ");
  const legacyEntries = [
    ...(incapacitated ? [`Incapacitated: ${incapacitationCause}`] : []),
    ...traitPenalties.map((penalty) => `${penalty.label} ${penalty.value}`),
    ...modifiers,
  ];
  const modifierChips = [
    ...(incapacitated
      ? [
          modifierChip({
            label: "Incapacitated",
            cause: incapacitationCause,
            legacyText: `Incapacitated: ${incapacitationCause}`,
            kind: "penalty",
          }),
        ]
      : []),
    ...traitPenalties.map((penalty) =>
      modifierChip({
        label: `Trait rolls ${penalty.value}`,
        cause: penalty.label,
        legacyText: `${penalty.label} ${penalty.value}`,
        kind: "penalty",
      }),
    ),
    ...conditionModifierChips(),
    ...effectModifierChips(),
    ...encumbranceModifierChips(encumbrance),
  ];

  const hiddenLegacyEntries = legacyEntries.length
    ? `<span class="sr-only">${esc(legacyEntries.join(" "))}</span>`
    : "";
  els.combatPenaltyTotal.textContent = incapacitated
    ? "Incapacitated"
    : total
      ? `-${total}`
      : modifierChips.length
        ? `${modifierChips.length} active`
        : "None";
  els.combatPenaltySummary.textContent = incapacitated
    ? `${incapacitationSources.map((source) => source.label).join(" and ")} exceeded normal capacity.`
    : "";
  els.combatPenaltySummary.classList.toggle("hidden", !incapacitated);
  els.combatPenaltyBreakdown.innerHTML = modifierChips.length
    ? `${modifierChips.join("")}${hiddenLegacyEntries}`
    : `<span>No active modifiers.</span>${hiddenLegacyEntries}`;
  els.combatEncumbranceSummary.className = "hidden";
  els.combatEncumbranceSummary.innerHTML = "";
}

function renderCombatPowerPoints() {
  const resources = character.resources.filter(
    (resource) => resource.id === "power-points",
  );
  els.playPowerPointsCard.classList.toggle("hidden", !resources.length);
  if (!resources.length) {
    els.playPowerPointsList.innerHTML = "";
    return;
  }
  els.playPowerPointsList.innerHTML = "";
  resources.forEach((resource) =>
    appendPowerPointControls(els.playPowerPointsList, resource),
  );
}

function renderCombatWeapons() {
  els.playWeaponList.innerHTML = "";
  const activeWeapons = character.weapons.filter((weapon) =>
    physicalItemIsTopLevelActive(weapon),
  );
  if (!activeWeapons.length) {
    els.playWeaponList.innerHTML = emptyState("No weapons tracked.");
    return;
  }

  [...activeWeapons]
    .sort(
      (left, right) =>
        Number(isTrackedWeapon(right)) - Number(isTrackedWeapon(left)),
    )
    .forEach((weapon) => {
      const reserve = weapon.ammoType ? character.ammo[weapon.ammoType] : null;
      const tracked = isTrackedWeapon(weapon);
      const strengthWarning = weaponStrengthWarningMarkup(weapon);
      const weaponEntry = {
        type: "weapon",
        id: weapon.id,
        label: weapon.name,
        item: weapon,
      };
      const reserveEntry = reserve
        ? {
            type: "ammo",
            id: weapon.ammoType,
            label: reserve.label,
            item: reserve,
          }
        : null;
      const availability = physicalItemLocationLabel(weaponEntry);
      const reserveLocation = reserveEntry
        ? ` • ${physicalItemLocationLabel(reserveEntry)}`
        : "";
      const requiredAmmo = requiredAmmoLabelForWeapon(
        weapon,
        catalogWeaponForRecord(weapon),
      );
      const weaponMeta = [
        `Damage ${weapon.damage || "—"}`,
        `Range ${weapon.range || "—"}`,
        `AP ${weapon.ap ?? "—"}`,
        `ROF ${weapon.rof ?? "—"}`,
        `Min Str ${weapon.minStr || "—"}`,
        requiredAmmo ? `Ammo ${requiredAmmo}` : "",
        availability,
      ]
        .filter(Boolean)
        .join(" • ");
      const article = document.createElement("article");
      article.className = "weapon-card";
      article.innerHTML = `<div class="topline"><div><h3>${esc(weapon.name)}</h3><p class="meta">${esc(weaponMeta)}</p></div><span class="loaded">${tracked ? `${weapon.shotsLoaded} / ${weapon.shotsMax}` : "No ammo"}</span></div>${tracked ? `<p class="muted">${esc(reserve?.label || "Ammo")} reserve: ${reserve?.count || 0}${esc(reserveLocation)}</p>` : '<p class="muted">Melee / no ammo tracking.</p>'}${strengthWarning}${weapon.notes ? `<p class="muted">${esc(weapon.notes)}</p>` : ""}${tracked ? '<div class="weapon-actions"><button class="fire-btn" type="button">Fire</button><button class="load-btn" type="button">Load +1</button><button class="reload-btn" type="button">Fill</button><button class="unload-btn" type="button">Unload</button></div>' : ""}`;

      if (tracked) {
        const [fire, load, reload, unload] = article.querySelectorAll("button");
        const reserveCount = reserve?.count || 0;
        fire.disabled = weapon.shotsLoaded <= 0;
        load.disabled =
          weapon.shotsLoaded >= weapon.shotsMax || reserveCount <= 0;
        reload.disabled = load.disabled;
        unload.disabled = weapon.shotsLoaded <= 0;
        fire.onclick = () => {
          weapon.shotsLoaded -= 1;
          render();
          save();
        };
        load.onclick = () => {
          if (!reserve) return;
          weapon.shotsLoaded += 1;
          reserve.count -= 1;
          render();
          save();
        };
        reload.onclick = () => {
          if (!reserve) return;
          const amount = Math.min(
            weapon.shotsMax - weapon.shotsLoaded,
            reserve.count,
          );
          weapon.shotsLoaded += amount;
          reserve.count -= amount;
          render();
          save();
        };
        unload.onclick = () => {
          if (!reserve) return;
          reserve.count += weapon.shotsLoaded;
          weapon.shotsLoaded = 0;
          render();
          save();
        };
      }

      els.playWeaponList.appendChild(article);
    });
}

function powerCost(power) {
  if (Number.isFinite(Number(power.basePowerPoints)))
    return Math.max(0, Math.floor(Number(power.basePowerPoints)));
  const match = String(power.baseCost || power.powerPoints || "").match(/\d+/);
  const cost = match ? Math.floor(Number(match[0]) || 0) : 0;
  return Math.max(0, cost);
}

function powerHelpMarkup(text, label = "More information") {
  const help = String(text || "").trim();
  if (!help) return "";
  return `<span class="question-help power-help" tabindex="0" role="img" aria-label="${esc(`${label}: ${help}`)}" data-tooltip="${esc(help)}">?</span>`;
}

function powerRangeDetails(power) {
  const listedRange = String(power?.range || "").trim();
  const smartsRange = listedRange.match(/^Smarts(?:\s*[×x]\s*(\d+))?$/i);
  if (!smartsRange) return { text: listedRange, help: "" };

  const smartsDie = String(character.attributes?.smarts || "").trim();
  const dieMatch = smartsDie.match(/^d(\d+)/i);
  const dieSides = Number(dieMatch?.[1]) || 0;
  if (!dieSides) {
    return {
      text: listedRange,
      help: "This range is based on Smarts, but no Smarts die is recorded.",
    };
  }

  const multiplier = Math.max(1, Number(smartsRange[1]) || 1);
  const tabletopInches = dieSides * multiplier;
  const calculation = `${smartsDie}${multiplier > 1 ? ` × ${multiplier}` : ""}`;
  return {
    text: `${tabletopInches} inches`,
    help: `Calculated from Smarts ${calculation}. In Savage Worlds, one tabletop inch represents two yards.`,
  };
}

function powerDurationDetails(power) {
  const duration = String(power?.duration || "").trim();
  const powerId = String(power?.catalogId || power?.id || "").trim();
  const powerName = String(power?.name || "").trim();
  const splitDurations = [
    {
      id: "power-boost-lower-trait",
      name: /boost\s*\/\s*lower trait/i,
      text: "5/Instant",
      help: "Boost lasts 5 rounds. Lower is Instant.",
    },
    {
      id: "power-detect-conceal-arcana",
      name: /detect\s*\/\s*conceal arcana/i,
      text: "5/1 hour",
      help: "Detect lasts 5 rounds. Conceal lasts 1 hour.",
    },
    {
      id: "power-sloth-speed",
      name: /sloth\s*\/\s*speed/i,
      text: "Instant/5",
      help: "Sloth is Instant. Speed lasts 5 rounds.",
    },
    {
      id: "power-sound-silence",
      name: /sound\s*\/\s*silence/i,
      text: "Instant/5",
      help: "Sound is Instant. Silence lasts 5 rounds.",
    },
  ];
  const splitDuration = splitDurations.find(
    (entry) => entry.id === powerId || entry.name.test(powerName),
  );
  return splitDuration
    ? { text: splitDuration.text, help: splitDuration.help }
    : { text: duration, help: "" };
}

function parsePowerModifier(modifier) {
  if (typeof modifier === "string") {
    const match = modifier.match(/^\s*(.+?)\s*\(\s*([^)]+)\s*\)\s*:?\s*(.*)$/);
    const costs = match
      ? (match[2].match(/[+-]?\d+/g) || []).map((cost) =>
          Math.max(0, Math.floor(Number(cost) || 0)),
        )
      : [];
    return {
      name: match ? match[1].trim() : modifier.trim(),
      cost: costs[0] || 0,
      costs,
      description: match ? match[3].trim() : "",
    };
  }
  const cost = Math.max(
    0,
    Math.floor(Number(modifier.cost ?? modifier.powerPoints ?? 0) || 0),
  );
  return {
    name: modifier.name || "Modifier",
    cost,
    costs: [cost],
    description: modifier.description || modifier.notes || "",
  };
}

function comparePowers(left, right) {
  return (
    powerCost(left) - powerCost(right) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function powerCastOptions(power) {
  const baseCost = powerCost(power);
  return [
    {
      name: "Activate",
      cost: baseCost,
      description: power.notes || "",
      base: true,
    },
  ];
}

function powerOptionButtonMarkup(option, index, powerPoints) {
  return `<button class="cast-option-btn" type="button" data-power-option="${index}">${esc(option.name)}${powerPoints || option.cost ? ` — ${option.cost} PP` : ""}</button>`;
}

function powerAffordabilityText(powerPoints, total) {
  const cost = Math.max(0, Math.floor(Number(total) || 0));
  if (!powerPoints) return cost ? `${cost} PP required` : "No PP required";
  const available = Math.max(0, Math.floor(Number(powerPoints.current) || 0));
  if (cost <= available) return "";
  const shortage = cost - available;
  return `Cannot cast · ${shortage} PP short`;
}

function powerAffordabilityMarkup(powerPoints, total) {
  const text = powerAffordabilityText(powerPoints, total);
  return `<span data-power-affordability class="${text ? "" : "hidden"}">${esc(text)}</span>`;
}

function updatePowerAffordability(article, powerPoints, total) {
  const affordability = article.querySelector("[data-power-affordability]");
  if (!affordability) return;
  const text = powerAffordabilityText(powerPoints, total);
  affordability.textContent = text;
  affordability.classList.toggle("hidden", !text);
  affordability.classList.toggle(
    "unaffordable",
    Boolean(powerPoints && total > powerPoints.current),
  );
}

function catalogVariableSpendOptionsForPower(power) {
  const catalogPower =
    hasPowerCatalog() && power.catalogId
      ? findPowerCatalogEntryById(power.catalogId)
      : null;
  const supportsVariableSpend = Boolean(
    power.supportsVariableSpend || catalogPower?.supportsVariableSpend,
  );
  const options =
    Array.isArray(power.variableSpendOptions) &&
    power.variableSpendOptions.length
      ? power.variableSpendOptions
      : catalogPower?.variableSpendOptions || [];
  return supportsVariableSpend ? options : [];
}

function manualVariableSpendForPower(power) {
  const catalogPower =
    hasPowerCatalog() && power.catalogId
      ? findPowerCatalogEntryById(power.catalogId)
      : null;
  return Boolean(
    power.manualVariableSpend || catalogPower?.manualVariableSpend,
  );
}

function variableSpendOptionKey(label) {
  return normalizeArcaneText(label)
    .replace(/\brecipients\b/g, "recipient")
    .trim();
}

function uniquePowerModifierCosts(costs) {
  return [...new Set((costs || []).map(Number).filter(Number.isFinite))].sort(
    (left, right) => left - right,
  );
}

function catalogVariableSpendOption(option, index) {
  const costPer = Number(option?.costPer);
  const hasCost = Number.isFinite(costPer);
  const quantityLabel = option?.quantityLabel || "use";
  const repeatable = /extra target|template step/i.test(quantityLabel);
  return {
    id: option?.id || `catalog-modifier-${index + 1}`,
    label: option?.label || "Modifier",
    description: option?.description || "",
    quantityLabel,
    costPer: hasCost ? Math.max(0, costPer) : 0,
    costs: hasCost ? [Math.max(0, costPer)] : [],
    control: repeatable ? "quantity" : "toggle",
    manualCost: !hasCost,
  };
}

function powerModifierDisplayLabel(label) {
  const value = String(label || "Modifier").trim();
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bAp\b/g, "AP")
    .replace(/\bPp\b/g, "PP");
}

function importedVariableSpendOption(modifier, index) {
  const parsed = parsePowerModifier(modifier);
  const costs = uniquePowerModifierCosts(parsed.costs);
  return {
    id: `imported-modifier-${index + 1}-${variableSpendOptionKey(parsed.name).replace(/\s+/g, "-")}`,
    label: powerModifierDisplayLabel(parsed.name),
    description: parsed.description || "",
    quantityLabel: "use",
    costPer: costs[0] || 0,
    costs,
    control: costs.length > 1 ? "choice" : "toggle",
    manualCost: !costs.length,
  };
}

function mergeVariableSpendOption(existing, imported) {
  if (imported.description) existing.description = imported.description;
  if (imported.costs.length > 1) {
    existing.costs = imported.costs;
    existing.costPer = imported.costs[0];
    existing.control = "choice";
    existing.quantityLabel = "selected level";
    existing.manualCost = false;
  } else if (imported.costs.length && existing.control !== "quantity") {
    existing.costs = imported.costs;
    existing.costPer = imported.costs[0];
    existing.manualCost = false;
  }
  return existing;
}

function variableSpendOptionsForPower(power) {
  const options = catalogVariableSpendOptionsForPower(power).map(
    catalogVariableSpendOption,
  );
  (power.modifiers || []).forEach((modifier, index) => {
    const imported = importedVariableSpendOption(modifier, index);
    const existing = options.find(
      (option) =>
        variableSpendOptionKey(option.label) ===
        variableSpendOptionKey(imported.label),
    );
    if (existing) {
      mergeVariableSpendOption(existing, imported);
    } else {
      options.push(imported);
    }
  });
  return options;
}

function variableSpendTemplateTier(option, cost) {
  const description = String(option?.description || "");
  const escapedCost = String(cost).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const forward = description.match(
    new RegExp(
      `\\+${escapedCost}\\b[\\s\\S]{0,140}?\\b(Small|Medium|Large)\\b(?:\\s+Blast)?\\s+Template`,
      "i",
    ),
  );
  const backward = description.match(
    new RegExp(
      `\\b(Small|Medium|Large)\\b(?:\\s+Blast)?\\s+Template[\\s\\S]{0,80}?(?:for\\s*)?\\+${escapedCost}\\b`,
      "i",
    ),
  );
  const size = forward?.[1] || backward?.[1] || "";
  const templateMechanics = {
    small: "Small: 2″ diameter / 4 yards across",
    medium: "Medium: 4″ diameter / 8 yards across",
    large: "Large: 6″ diameter / 12 yards across",
  };
  return size ? templateMechanics[size.toLowerCase()] || "" : "";
}

function variableSpendChoiceLabel(option, cost) {
  const tier = variableSpendTemplateTier(option, cost);
  const distance = tier.match(/\d+ yards across/i)?.[0] || tier;
  return `+${cost} PP${distance ? ` — ${distance}` : ""}`;
}

function variableSpendChoiceSummary(option) {
  const tiers = option.costs.map((cost) => ({
    cost,
    detail: variableSpendTemplateTier(option, cost),
  }));
  if (tiers.every((tier) => tier.detail)) {
    return tiers.map((tier) => `+${tier.cost}: ${tier.detail}`).join(" • ");
  }
  return option.description || "Choose one Power Point level";
}

function variableSpendCostLabel(option) {
  if (option.manualCost) return "Cost handled manually";
  if (option.control === "choice") return variableSpendChoiceSummary(option);
  if (option.control === "quantity") {
    return `+${option.costPer} PP per ${option.quantityLabel}`;
  }
  return `+${option.costPer} PP when selected`;
}

function variableSpendControlMarkup(option, index) {
  const label = esc(option.label);
  if (option.control === "choice") {
    const choices = option.costs
      .map(
        (cost) =>
          `<option value="${cost}">${esc(variableSpendChoiceLabel(option, cost))}</option>`,
      )
      .join("");
    return `<select data-variable-spend="${index}" data-variable-control="choice" aria-label="${label} Power Point cost"><option value="0">Off</option>${choices}</select>`;
  }
  if (option.control === "toggle") {
    return `<label class="variable-spend-toggle"><input data-variable-spend="${index}" data-variable-control="toggle" type="checkbox"><span>Include</span></label>`;
  }
  return `<div class="variable-spend-stepper"><button type="button" data-variable-spend-adjust="-1" data-variable-spend-index="${index}" aria-label="Decrease ${label}">−</button><input data-variable-spend="${index}" data-variable-control="quantity" type="number" min="0" step="1" value="0" inputmode="numeric" aria-label="${label} quantity"><button type="button" data-variable-spend-adjust="1" data-variable-spend-index="${index}" aria-label="Increase ${label}">+</button></div>`;
}

function variableSpendMarkup(power, config = {}) {
  const options = variableSpendOptionsForPower(power);
  if (!options.length) return "";
  const rows = options
    .map(
      (option, index) =>
        `<div class="variable-spend-row control-${esc(option.control)}" data-variable-spend-row="${index}"><span class="variable-spend-copy"><span class="variable-spend-label"><strong>${esc(option.label)}</strong>${powerHelpMarkup(option.description, `${option.label} details`)}</span><small>${esc(variableSpendCostLabel(option))}</small></span>${variableSpendControlMarkup(option, index)}</div>`,
    )
    .join("");
  const baseCost = powerCost(power);
  if (config.compact) {
    const powerPoints = powerPointResource();
    return `<details class="combat-power-modifiers"><summary><span class="combat-power-modifier-label"><span>Enhance Power</span>${powerHelpMarkup("Spend additional Power Points to improve or expand this power before casting.", "About power enhancements")}</span><span data-variable-spend-summary>Base ${baseCost} PP</span></summary><div class="variable-spend-options">${rows}</div></details><div class="combat-power-cast-row">${powerAffordabilityMarkup(powerPoints, baseCost)}<button class="variable-spend-btn" type="button">Cast — ${baseCost} PP</button></div>`;
  }
  return `<div class="variable-spend-controls"><div class="variable-spend-heading"><div><h5>Cast Modifiers</h5><small>Choose any optional changes, then activate once.</small></div><span class="pill">Base ${baseCost} PP</span></div><div class="variable-spend-options">${rows}</div><div class="variable-spend-summary"><span data-variable-spend-summary>Base cost only</span><button class="variable-spend-btn" type="button">Activate — ${baseCost} PP</button></div></div>`;
}

function manualPowerPointSpendMarkup(power, options = {}) {
  if (!manualVariableSpendForPower(power)) return "";
  const baseCost = powerCost(power);
  const initialCost = baseCost > 0 ? String(baseCost) : "";
  const minimum = Math.max(1, baseCost);
  const buttonLabel = initialCost
    ? `Activate — ${initialCost} PP`
    : "Enter PP Cost";
  const helper = baseCost
    ? `Listed base ${baseCost} PP; enter the final total after modifiers.`
    : "Enter the final total from the rulebook or table ruling.";
  if (options.compact) {
    const powerPoints = powerPointResource();
    const affordability = initialCost
      ? powerAffordabilityText(powerPoints, Number(initialCost))
      : "Enter the final cost";
    return `<details class="combat-power-modifiers" open><summary><span>Set final cost</span><span data-manual-spend-summary>${initialCost ? `Final cost ${initialCost} PP` : "Required"}</span></summary><label class="combat-manual-power-cost"><span>Final PP</span><input data-manual-power-cost type="number" min="${minimum}" step="1" value="${initialCost}" inputmode="numeric" placeholder="PP" aria-label="Final Power Point Cost"></label></details><div class="combat-power-cast-row"><span data-power-affordability class="${affordability ? "" : "hidden"}">${esc(affordability)}</span><button class="manual-spend-btn" type="button">${initialCost ? `Cast — ${initialCost} PP` : "Enter PP Cost"}</button></div>`;
  }
  return `<div class="manual-spend-controls"><div class="variable-spend-heading"><div><h5>Set Power Point Cost</h5><small>This power does not have a complete automatic cost calculator.</small></div><span class="pill">Manual Cost</span></div><div class="variable-spend-options"><label class="manual-power-cost-field"><span class="variable-spend-copy"><strong>Final Power Point Cost</strong><small>${esc(helper)}</small></span><input data-manual-power-cost type="number" min="${minimum}" step="1" value="${initialCost}" inputmode="numeric" placeholder="PP" aria-label="Final Power Point Cost"></label></div><div class="variable-spend-summary"><span data-manual-spend-summary>${initialCost ? `Final cost ${initialCost} PP` : "A final cost is required"}</span><button class="manual-spend-btn" type="button">${buttonLabel}</button></div></div>`;
}

function variableSpendOptionCostPer(option) {
  return Number.isFinite(Number(option?.costPer)) ? Number(option.costPer) : 0;
}

function variableSpendQuantity(input) {
  if (input.dataset.variableControl === "toggle") {
    return input.checked ? 1 : 0;
  }
  if (input.dataset.variableControl === "choice") {
    return Number(input.value) > 0 ? 1 : 0;
  }
  return Math.max(0, Math.floor(Number(input.value) || 0));
}

function variableSpendSelectedCost(input, option) {
  if (input.dataset.variableControl === "choice") {
    return Math.max(0, Number(input.value) || 0);
  }
  return variableSpendOptionCostPer(option);
}

function variableSpendBreakdown(power, article) {
  const baseCost = powerCost(power);
  const options = variableSpendOptionsForPower(power);
  const modifiers = Array.from(
    article.querySelectorAll("[data-variable-spend]"),
  )
    .map((input) => {
      const option = options[Number(input.dataset.variableSpend)];
      const quantity = variableSpendQuantity(input);
      const costPer = variableSpendSelectedCost(input, option);
      return {
        id: option?.id || "",
        label: option?.label || "Modifier",
        quantity,
        costPer,
        totalCost: quantity * costPer,
        quantityLabel: option?.quantityLabel || "use",
        manualCost: !Number.isFinite(Number(option?.costPer)),
      };
    })
    .filter((modifier) => modifier.quantity > 0);
  const modifierTotal = modifiers.reduce(
    (total, modifier) => total + modifier.totalCost,
    0,
  );
  return {
    baseCost,
    modifiers,
    totalCost: baseCost + modifierTotal,
  };
}

function updateVariableSpendButton(power, article, powerPoints) {
  const button = article.querySelector(".variable-spend-btn");
  if (!button) return;
  const breakdown = variableSpendBreakdown(power, article);
  const total = breakdown.totalCost;
  const modifierCost = total - breakdown.baseCost;
  const hasManualModifier = breakdown.modifiers.some(
    (modifier) => modifier.manualCost,
  );
  const summary = article.querySelector("[data-variable-spend-summary]");
  if (summary) {
    if (article.classList.contains("combat-cast-power-card")) {
      summary.textContent = hasManualModifier
        ? `${modifierCost ? `+${modifierCost} PP; ` : ""}manual cost selected`
        : modifierCost
          ? `+${modifierCost} PP`
          : `Base ${breakdown.baseCost} PP`;
    } else {
      summary.textContent = hasManualModifier
        ? `${modifierCost ? `Modifiers +${modifierCost} PP; ` : ""}manual cost also selected`
        : modifierCost
          ? `Modifiers +${modifierCost} PP`
          : "Base cost only";
    }
  }
  const verb = article.classList.contains("combat-cast-power-card")
    ? "Cast"
    : "Activate";
  button.textContent = `${verb} — ${total} PP`;
  button.disabled = Boolean(powerPoints && total > powerPoints.current);
  button.title =
    powerPoints && total > powerPoints.current
      ? "Not enough Power Points"
      : `Activate for ${total} Power Points`;
  updatePowerAffordability(article, powerPoints, total);
  article.querySelectorAll("[data-variable-spend-row]").forEach((row) => {
    const input = row.querySelector("[data-variable-spend]");
    row.classList.toggle("selected", variableSpendQuantity(input) > 0);
  });
  article
    .querySelectorAll("[data-variable-spend-adjust='-1']")
    .forEach((decreaseButton) => {
      const input = article.querySelector(
        `[data-variable-spend='${decreaseButton.dataset.variableSpendIndex}']`,
      );
      decreaseButton.disabled = !input || variableSpendQuantity(input) <= 0;
    });
}

function addActivePowerFromCast(power, option = {}) {
  if (!Array.isArray(character.activePowers)) character.activePowers = [];
  const activePower = makeActivePowerRecord(power, option);
  character.activePowers.push(activePower);
  appToast(`Activated ${activePower.name}.`, "success");
  return activePower;
}

function activePowerMatchesKnownPower(activePower, power) {
  const activeCatalogId = String(
    activePower.catalogId || activePower.powerCatalogId || "",
  ).trim();
  const powerCatalogId = String(power.catalogId || "").trim();
  if (activeCatalogId && powerCatalogId && activeCatalogId === powerCatalogId) {
    return true;
  }

  const activePowerId = String(activePower.powerId || "").trim();
  const powerId = String(power.id || "").trim();
  if (activePowerId && powerId && activePowerId === powerId) return true;

  return (
    normalizeArcaneText(activePower.name) &&
    normalizeArcaneText(activePower.name) === normalizeArcaneText(power.name)
  );
}

function manualPowerPointCost(power, input) {
  const entered = Math.floor(Number(input?.value) || 0);
  if (entered <= 0) return 0;
  return Math.max(powerCost(power), entered);
}

function updateManualSpendButton(power, article, powerPoints) {
  const input = article.querySelector("[data-manual-power-cost]");
  const button = article.querySelector(".manual-spend-btn");
  if (!input || !button) return;
  const total = manualPowerPointCost(power, input);
  const summary = article.querySelector("[data-manual-spend-summary]");
  if (summary) {
    summary.textContent = total
      ? `Final cost ${total} PP`
      : "A final cost is required";
  }
  const verb = article.classList.contains("combat-cast-power-card")
    ? "Cast"
    : "Activate";
  button.textContent = total ? `${verb} — ${total} PP` : "Enter PP Cost";
  button.disabled =
    !total || Boolean(powerPoints && total > powerPoints.current);
  button.title = !total
    ? "Enter the final Power Point cost"
    : powerPoints && total > powerPoints.current
      ? "Not enough Power Points"
      : `Activate for ${total} Power Points`;
  updatePowerAffordability(article, powerPoints, total);
}

function activePowerRecordsForKnownPower(power) {
  const activePowers = Array.isArray(character.activePowers)
    ? character.activePowers
    : [];
  return activePowers.filter(
    (activePower) =>
      activePowerIsCurrent(activePower) &&
      activePowerMatchesKnownPower(activePower, power),
  );
}

function endActivePowerRecord(activePower, status) {
  activePower.status = normalizeActivePowerStatus(status);
  activePower.endedAt = new Date().toISOString();
}

async function resolveActivePowerRecast(power) {
  const activePowers = activePowerRecordsForKnownPower(power);
  if (!activePowers.length) return true;

  const powerName = power.name || "This power";
  const countLabel =
    activePowers.length === 1
      ? "an active record"
      : `${activePowers.length} active records`;
  const choice = await appChoice(
    `${powerName} already has ${countLabel}. Choose how to handle this activation.`,
    [
      { label: "Create another record", value: "create" },
      { label: "Expire old record", value: "expired" },
      { label: "Dismiss old record", value: "dismissed" },
    ],
    {
      title: "Power already active",
      cancelText: "Cancel",
    },
  );

  if (choice === "create") return true;
  if (choice === "expired" || choice === "dismissed") {
    activePowers.forEach((activePower) =>
      endActivePowerRecord(activePower, choice),
    );
    return true;
  }
  return false;
}

function powerDescriptionMarkup(power, castOptions, powerPoints) {
  const details = [];
  const casting = [];
  if (power.shortSummary || power.notes) {
    details.push(`<p>${esc(power.shortSummary || power.notes)}</p>`);
  } else {
    details.push(
      '<p class="muted">No description imported yet. Add what this power does in the Arcane tab notes.</p>',
    );
  }
  if (power.restrictions) {
    details.push(
      `<p class="catalog-warning"><strong>Restriction:</strong> ${esc(power.restrictions)}</p>`,
    );
  }
  if (power.variableCostNotes) {
    details.push(
      `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>`,
    );
  }
  if (power.trapping) {
    details.push(
      `<p class="muted"><strong>Trapping:</strong> ${esc(power.trapping)}</p>`,
    );
  }
  const baseOption = castOptions[0];
  const manualSpend = manualPowerPointSpendMarkup(power);
  const variableSpend = manualSpend ? "" : variableSpendMarkup(power);
  if (manualSpend) {
    casting.push(manualSpend);
  } else if (variableSpend) {
    casting.push(variableSpend);
  } else if (baseOption) {
    casting.push(
      `<div class="power-primary-option">${powerOptionButtonMarkup(baseOption, 0, powerPoints)}</div>`,
    );
  }
  return `<div class="power-description power-card-workspace"><div class="power-card-details">${details.join("")}</div><div class="power-card-casting"><h4>Use Power</h4>${casting.join("")}</div></div>`;
}

function combatPowerDescriptionMarkup(power, castOptions, powerPoints) {
  const summary = power.shortSummary || power.notes;
  const range = powerRangeDetails(power);
  const duration = powerDurationDetails(power);
  const facts = [
    range.text
      ? `<span>Range: ${esc(range.text)}${powerHelpMarkup(range.help, "Range calculation")}</span>`
      : "",
    duration.text
      ? `<span>Duration: ${esc(duration.text)}${powerHelpMarkup(duration.help, "Duration details")}</span>`
      : "",
  ].filter(Boolean);
  const manualSpend = manualPowerPointSpendMarkup(power, { compact: true });
  const variableSpend = manualSpend
    ? ""
    : variableSpendMarkup(power, { compact: true });
  const baseOption = castOptions[0];
  const baseCast =
    !manualSpend && !variableSpend && baseOption
      ? `<div class="combat-power-cast-row">${powerAffordabilityMarkup(powerPoints, baseOption.cost)}<button class="cast-option-btn" type="button" data-power-option="0">Cast — ${baseOption.cost} PP</button></div>`
      : "";
  return `<p class="combat-power-effect">${esc(summary || "Open Arcane for the full power description.")}</p>${facts.length ? `<div class="combat-power-facts">${facts.join("")}</div>` : ""}${manualSpend || variableSpend || baseCast}`;
}

function renderPowerCard(
  power,
  { includeDelete = false, compact = false } = {},
) {
  const powerPoints = powerPointResource();
  const castOptions = powerCastOptions(power);
  const article = document.createElement("article");
  article.className = `weapon-card power-card${compact ? " combat-cast-power-card" : ""}${power.active ? " active" : ""}`;
  const rankMeta = power.rank ? `Rank ${esc(power.rank)}` : "";
  const range = powerRangeDetails(power);
  const duration = powerDurationDetails(power);
  const rangeMeta = range.text
    ? ` | Range: ${esc(range.text)}${powerHelpMarkup(range.help, "Range calculation")}`
    : "";
  const sourceMeta = power.source ? ` | ${esc(power.source)}` : "";
  const deleteButtonMarkup = includeDelete
    ? '<button class="edit-power-btn ghost" type="button">Edit</button><button class="delete-small delete-power-btn" type="button">×</button>'
    : "";
  const managementButtonsMarkup = deleteButtonMarkup;
  const managementMarkup = deleteButtonMarkup
    ? `<div class="weapon-actions power-actions">${managementButtonsMarkup}</div>`
    : "";
  article.innerHTML = compact
    ? `<div class="combat-cast-power-heading"><h3>${esc(power.name || "Unnamed power")}</h3>${powerHelpMarkup(power.restrictions ? `Restriction: ${power.restrictions}` : "", `${power.name || "Power"} restriction`)}</div>${combatPowerDescriptionMarkup(power, castOptions, powerPoints)}`
    : `<div class="topline"><div><h3>${esc(power.name || "Unnamed power")}</h3><p class="meta">${rankMeta} | ${esc(power.baseCost || power.powerPoints || "—")} PP${rangeMeta} | Duration: ${esc(duration.text || "—")}${powerHelpMarkup(duration.help, "Duration details")}${sourceMeta}</p></div><span class="loaded">${power.active ? "Active" : "Ready"}</span></div>${powerDescriptionMarkup(power, castOptions, powerPoints)}${managementMarkup}`;

  const optionButtons = article.querySelectorAll(".cast-option-btn");
  const variableInputs = article.querySelectorAll("[data-variable-spend]");
  const variableAdjustButtons = article.querySelectorAll(
    "[data-variable-spend-adjust]",
  );
  const variableSpendButton = article.querySelector(".variable-spend-btn");
  const manualSpendInput = article.querySelector("[data-manual-power-cost]");
  const manualSpendButton = article.querySelector(".manual-spend-btn");
  const editButton = article.querySelector(".edit-power-btn");
  const deleteButton = article.querySelector(".delete-power-btn");

  optionButtons.forEach((button) => {
    const option = castOptions[Number(button.dataset.powerOption)];
    button.disabled = Boolean(powerPoints && option.cost > powerPoints.current);
    button.title =
      powerPoints && option.cost > powerPoints.current
        ? "Not enough Power Points"
        : option.description || `Spend ${option.cost} Power Points`;
    updatePowerAffordability(article, powerPoints, option.cost);
    button.onclick = async () => {
      if (!(await resolveActivePowerRecast(power))) return;
      if (powerPoints && option.cost) {
        powerPoints.current = Math.max(0, powerPoints.current - option.cost);
      }
      addActivePowerFromCast(power, option);
      render();
      save();
    };
  });

  variableInputs.forEach((input) => {
    const update = () => updateVariableSpendButton(power, article, powerPoints);
    input.oninput = update;
    input.onchange = update;
  });
  variableAdjustButtons.forEach((button) => {
    button.onclick = () => {
      const input = article.querySelector(
        `[data-variable-spend='${button.dataset.variableSpendIndex}']`,
      );
      if (!input) return;
      const quantity = variableSpendQuantity(input);
      const adjustment = Number(button.dataset.variableSpendAdjust) || 0;
      input.value = String(Math.max(0, quantity + adjustment));
      updateVariableSpendButton(power, article, powerPoints);
    };
  });
  if (variableSpendButton) {
    updateVariableSpendButton(power, article, powerPoints);
    variableSpendButton.onclick = async () => {
      const spendBreakdown = variableSpendBreakdown(power, article);
      const total = spendBreakdown.totalCost;
      if (powerPoints && total > powerPoints.current) return;
      if (!(await resolveActivePowerRecast(power))) return;
      if (powerPoints && total) {
        powerPoints.current = Math.max(0, powerPoints.current - total);
      }
      addActivePowerFromCast(power, {
        name: "Activate",
        cost: total,
        spendBreakdown,
        description: power.shortSummary || power.notes || "",
      });
      render();
      save();
    };
  }
  if (manualSpendInput && manualSpendButton) {
    const updateManualSpend = () =>
      updateManualSpendButton(power, article, powerPoints);
    manualSpendInput.oninput = updateManualSpend;
    manualSpendInput.onchange = () => {
      const total = manualPowerPointCost(power, manualSpendInput);
      if (total) manualSpendInput.value = String(total);
      updateManualSpend();
    };
    updateManualSpend();
    manualSpendButton.onclick = async () => {
      const total = manualPowerPointCost(power, manualSpendInput);
      if (!total || (powerPoints && total > powerPoints.current)) return;
      if (!(await resolveActivePowerRecast(power))) return;
      if (powerPoints) {
        powerPoints.current = Math.max(0, powerPoints.current - total);
      }
      addActivePowerFromCast(power, {
        name: "Activate",
        cost: total,
        description: power.shortSummary || power.notes || "",
      });
      render();
      save();
    };
  }

  if (editButton) {
    editButton.onclick = () => openPowerEditor(power);
  }

  if (deleteButton) {
    deleteButton.onclick = () => {
      character.powers = character.powers.filter(
        (item) => item.id !== power.id,
      );
      render();
      save();
    };
  }

  return article;
}

function renderCombatPowers() {
  els.playActivePowersList.innerHTML = "";
  if (!character.powers.length) {
    els.playActivePowersList.innerHTML = emptyState("No powers known.");
    return;
  }

  const powerPoints = powerPointResource();
  const castSection = document.createElement("div");
  castSection.className = "combat-power-casting-stack";
  if (powerPoints) {
    castSection.innerHTML = `<p class="combat-power-casting-summary">${powerPoints.current} PP available</p>`;
  }
  const castList = document.createElement("div");
  castList.className = "grid powers combat-cast-power-list";
  [...character.powers].sort(comparePowers).forEach((power) => {
    castList.appendChild(renderPowerCard(power, { compact: true }));
  });
  castSection.appendChild(castList);
  els.playActivePowersList.appendChild(castSection);
}

function renderCombatHuckster() {
  const deal = character.hucksterDeal;
  els.combatHucksterCard.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const fields = [
    ["selectedPower", "Selected power", "text"],
    ["requiredPowerPoints", "Required PP", "number"],
    ["anteBennySpent", "Ante Benny spent", "checkbox"],
    ["gamblingRollResult", "Gambling result", "text"],
    ["cardsDrawn", "Cards drawn", "number"],
    ["pokerHand", "Poker hand", "text"],
    ["temporaryPowerPoints", "Temporary PP", "number"],
    ["shortagePenalty", "Shortage penalty", "number"],
    ["leftoverPowerPoints", "Leftover PP", "number"],
    ["backfireTriggered", "Backfire", "checkbox"],
    ["notes", "Notes", "text"],
  ];
  els.combatHucksterHelper.innerHTML = fields
    .map(([field, label, type]) => {
      if (type === "checkbox") {
        return `<label class="checkline"><input type="checkbox" data-combat-huckster="${field}" ${deal[field] ? "checked" : ""}> ${label}</label>`;
      }
      return `<label>${label}<input data-combat-huckster="${field}" type="${type}" min="0" value="${esc(deal[field] ?? "")}"></label>`;
    })
    .join("");
  els.combatHucksterHelper
    .querySelectorAll("[data-combat-huckster]")
    .forEach((input) => {
      input.oninput = input.onchange = () => {
        const field = input.dataset.combatHuckster;
        updateHucksterDealField(
          field,
          input.type === "checkbox"
            ? input.checked
            : input.type === "number"
              ? Math.max(0, Math.floor(Number(input.value) || 0))
              : input.value,
        );
      };
    });
}

function isCombatConsumable(item) {
  if (/backpack|pack|bag|sack|pouch|container/i.test(item.name || ""))
    return false;
  if (item.combatUsable || item.pinToCombat) return true;
  return /healing|unguent|elixir|restoration|dynamite|explosive|grenade|bomb|oil|tonic|potion|booster|tablet|pill|courage|desensitizer|unction/i.test(
    `${item.name || ""} ${item.unit || ""}`,
  );
}

function addConsumableFromGear(item, packageCount, unitsPerPackage) {
  const conversion = consumableConversionForGear(item);
  if (!conversion) return false;
  const safeUnitsPerPackage = Math.max(
    1,
    Math.floor(Number(unitsPerPackage) || conversion.multiplier || 1),
  );
  const count =
    Math.max(1, Math.floor(Number(packageCount) || 1)) * safeUnitsPerPackage;
  addConsumableCount(
    conversion.id,
    conversion.name,
    conversion.unit,
    count,
    `Converted from ${item.name}.`,
    parseWeight(item.weight) / safeUnitsPerPackage,
  );
  return true;
}

function addConsumableCount(
  id,
  name,
  unit,
  amount,
  note = "",
  weight = undefined,
) {
  const existing = character.consumables.find(
    (consumable) =>
      consumable.id === id ||
      consumable.name.toLowerCase() === String(name).toLowerCase(),
  );
  if (existing) {
    existing.count =
      Math.max(0, Math.floor(Number(existing.count) || 0)) +
      Math.max(1, Math.floor(Number(amount) || 1));
    existing.unit = unit;
    if (note && !existing.note) existing.note = note;
    if (
      parseWeightNumber(existing.weight) === null &&
      parseWeightNumber(weight) !== null
    )
      existing.weight = weight;
  } else {
    character.consumables.push({
      id,
      name,
      count: Math.max(1, Math.floor(Number(amount) || 1)),
      unit,
      note,
      weight,
      itemLocation: "carried",
    });
  }
}

function consumeItem(source, item, amount) {
  item.count = Math.max(0, item.count - amount);
  if (!item.count) {
    const index = source.indexOf(item);
    if (index >= 0) source.splice(index, 1);
  }
}

function renderCombatConsumables() {
  const consumables = character.consumables
    .filter(
      (item) =>
        item.count > 0 &&
        isCombatConsumable(item) &&
        physicalItemIsTopLevelActive(item),
    )
    .map((item) => ({ item, source: character.consumables }));
  const inventory = character.inventory
    .filter(
      (item) =>
        item.count > 0 &&
        isCombatConsumable(item) &&
        !["dropped", "stored", "container"].includes(item.location),
    )
    .map((item) => ({ item, source: character.inventory }));
  const entries = [...consumables, ...inventory];

  els.combatConsumablesCard.classList.toggle("hidden", !entries.length);
  els.combatConsumablesList.innerHTML = "";
  if (!entries.length) return;

  entries.forEach(({ item, source }) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button></div>`;
    const input = row.querySelector("input");
    const [use, add] = row.querySelectorAll("button");
    use.onclick = () => {
      const amount = clamp(Math.floor(Number(input.value) || 1), 1, item.count);
      consumeItem(source, item, amount);
      render();
      save();
    };
    add.onclick = () => {
      item.count += Math.max(1, Math.floor(Number(input.value) || 1));
      render();
      save();
    };
    els.combatConsumablesList.appendChild(row);
  });
}
