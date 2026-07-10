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
  row.className = "row";
  const max = resource.max || "—";
  const value = `${resource.current} / ${max}`;
  const recoveryPerHour = characterPowerPointRecoveryPerHour(character);
  row.innerHTML = `<div><strong>${showName ? esc(resource.name) : value}</strong>${showName ? `<span>${value}</span>` : "<span>Current / Max</span>"}<span>Recovery: ${recoveryPerHour} / hour</span>${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls resource-recovery-actions"><button data-recover="hour" type="button">Recover 1 hour +${recoveryPerHour}</button><button data-recover="5" type="button">Manual +5</button><button data-recover="10" type="button">Manual +10</button><button data-recover="15" type="button">Manual +15</button><button data-recover="max" type="button">Max</button></div>`;
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
  const rawWoundPenalty = Math.min(
    character.damage.wounds,
    character.damage.maxWounds,
  );
  const woundPenalty = Math.max(
    0,
    rawWoundPenalty - characterWoundPenaltyReduction(character, "combat"),
  );
  const fatiguePenalty = Math.min(
    character.damage.fatigue,
    character.damage.maxFatigue,
  );
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
  return `<span class="modifier-chip ${esc(kind)}" title="${esc(cause)}"><strong>${esc(label)}</strong><span class="sr-only">${esc(legacyText || `${cause}: ${label}`)}</span></span>`;
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
  const encumbrance = calculateEncumbrance(character, { combat: true });
  const legacyEntries = [
    ...traitPenalties.map((penalty) => `${penalty.label} ${penalty.value}`),
    ...modifiers,
  ];
  const modifierChips = [
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
  els.combatPenaltyTotal.textContent = total
    ? `-${total}`
    : modifierChips.length
      ? `${modifierChips.length} active`
      : "None";
  els.combatPenaltySummary.textContent = modifierChips.length
    ? "Hover a modifier for its source."
    : "No active modifiers.";
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

function comparePowerCosts(left, right) {
  return (
    left.cost - right.cost ||
    Number(!left.base) - Number(!right.base) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function comparePowers(left, right) {
  return (
    powerCost(left) - powerCost(right) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function powerCastOptions(power) {
  const baseCost = powerCost(power);
  const options = [
    {
      name: "Activate",
      cost: baseCost,
      description: power.notes || "",
      base: true,
    },
  ];
  (power.modifiers || []).forEach((modifier) => {
    const parsed = parsePowerModifier(modifier);
    const costs = parsed.costs.length ? parsed.costs : [parsed.cost];
    costs.forEach((cost) => {
      options.push({
        ...parsed,
        name: parsed.name,
        cost: baseCost + cost,
        modifierCost: cost,
      });
    });
  });
  return options.sort(comparePowerCosts);
}

function powerOptionButtonMarkup(option, index, powerPoints) {
  return `<button class="cast-option-btn" type="button" data-power-option="${index}">${esc(option.name)}${powerPoints || option.cost ? ` (${option.cost} PP)` : ""}</button>`;
}

function variableSpendOptionsForPower(power) {
  const catalogPower =
    hasPowerCatalog() && power.catalogId
      ? findPowerCatalogEntryById(power.catalogId)
      : null;
  const supportsVariableSpend = Boolean(
    power.supportsVariableSpend || catalogPower?.supportsVariableSpend,
  );
  const options = Array.isArray(power.variableSpendOptions)
    ? power.variableSpendOptions
    : catalogPower?.variableSpendOptions || [];
  return supportsVariableSpend ? options : [];
}

function variableSpendMarkup(power) {
  const options = variableSpendOptionsForPower(power);
  if (!options.length) return "";
  const rows = options
    .map((option, index) => {
      const hasCost = Number.isFinite(Number(option.costPer));
      const unit = hasCost
        ? `+${Number(option.costPer)} PP / ${esc(option.quantityLabel || "use")}`
        : "manual PP";
      return `<label class="variable-spend-row"><span><strong>${esc(option.label)}</strong><small>${unit}</small></span><input data-variable-spend="${index}" type="number" min="0" step="1" value="0" aria-label="${esc(option.label)} quantity"></label>`;
    })
    .join("");
  return `<div class="variable-spend-controls"><div class="topline"><h3>Variable Spend</h3><small>Base ${powerCost(power)} PP</small></div>${rows}<button class="variable-spend-btn" type="button">Spend ${powerCost(power)} PP</button></div>`;
}

function variableSpendOptionCostPer(option) {
  return Number.isFinite(Number(option?.costPer)) ? Number(option.costPer) : 0;
}

function variableSpendQuantity(input) {
  return Math.max(0, Math.floor(Number(input.value) || 0));
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
      const costPer = variableSpendOptionCostPer(option);
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

function variableSpendTotal(power, article) {
  return variableSpendBreakdown(power, article).totalCost;
}

function updateVariableSpendButton(power, article, powerPoints) {
  const button = article.querySelector(".variable-spend-btn");
  if (!button) return;
  const total = variableSpendTotal(power, article);
  button.textContent = `Spend ${total} PP`;
  button.disabled = Boolean(powerPoints && total > powerPoints.current);
  button.title =
    powerPoints && total > powerPoints.current
      ? "Not enough Power Points"
      : `Spend ${total} Power Points`;
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
  const parts = [];
  if (power.shortSummary || power.notes) {
    parts.push(`<p>${esc(power.shortSummary || power.notes)}</p>`);
  } else {
    parts.push(
      '<p class="muted">No description imported yet. Add what this power does in the Arcane tab notes.</p>',
    );
  }
  if (power.restrictions) {
    parts.push(
      `<p class="catalog-warning"><strong>Restriction:</strong> ${esc(power.restrictions)}</p>`,
    );
  }
  if (power.variableCostNotes) {
    parts.push(
      `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>`,
    );
  }
  if (power.trapping) {
    parts.push(
      `<p class="muted"><strong>Trapping:</strong> ${esc(power.trapping)}</p>`,
    );
  }
  const baseOption = castOptions[0];
  const modifierOptions = castOptions.slice(1);
  if (baseOption) {
    parts.push(
      `<div class="power-primary-option${modifierOptions.length ? " has-following-options" : ""}">${powerOptionButtonMarkup(baseOption, 0, powerPoints)}</div>`,
    );
  }
  if (modifierOptions.length) {
    const modifiers = modifierOptions
      .map(
        (option, index) =>
          `<li>${powerOptionButtonMarkup(option, index + 1, powerPoints)}${option.description ? `<span>${esc(option.description)}</span>` : ""}</li>`,
      )
      .join("");
    parts.push(`<ul class="power-modifiers">${modifiers}</ul>`);
  }
  parts.push(variableSpendMarkup(power));
  return `<div class="power-description">${parts.join("")}</div>`;
}

function renderPowerCard(power, { includeDelete = false } = {}) {
  const powerPoints = powerPointResource();
  const castOptions = powerCastOptions(power);
  const article = document.createElement("article");
  article.className = `weapon-card power-card${power.active ? " active" : ""}`;
  const rankMeta = power.rank ? `Rank ${esc(power.rank)}` : "";
  const rangeMeta = power.range ? ` | Range ${esc(power.range)}` : "";
  const sourceMeta = power.source ? ` | ${esc(power.source)}` : "";
  const deleteButtonMarkup = includeDelete
    ? '<button class="edit-power-btn ghost" type="button">Edit</button><button class="delete-small delete-power-btn" type="button">×</button>'
    : "";
  const managementButtonsMarkup = deleteButtonMarkup;
  const managementMarkup = deleteButtonMarkup
    ? `<div class="weapon-actions power-actions">${managementButtonsMarkup}</div>`
    : "";
  article.innerHTML = `<div class="topline"><div><h3>${esc(power.name || "Unnamed power")}</h3><p class="meta">${rankMeta} | ${esc(power.baseCost || power.powerPoints || "—")} PP${rangeMeta} | Duration ${esc(power.duration || "—")}${sourceMeta}</p></div><span class="loaded">${power.active ? "Active" : "Ready"}</span></div>${powerDescriptionMarkup(power, castOptions, powerPoints)}${managementMarkup}`;

  const optionButtons = article.querySelectorAll(".cast-option-btn");
  const variableInputs = article.querySelectorAll("[data-variable-spend]");
  const variableSpendButton = article.querySelector(".variable-spend-btn");
  const editButton = article.querySelector(".edit-power-btn");
  const deleteButton = article.querySelector(".delete-power-btn");

  optionButtons.forEach((button) => {
    const option = castOptions[Number(button.dataset.powerOption)];
    button.disabled = Boolean(powerPoints && option.cost > powerPoints.current);
    button.title =
      powerPoints && option.cost > powerPoints.current
        ? "Not enough Power Points"
        : option.description || `Spend ${option.cost} Power Points`;
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
    input.oninput = () =>
      updateVariableSpendButton(power, article, powerPoints);
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
        name: "Variable Spend",
        cost: total,
        spendBreakdown,
        description:
          "Variable Power Point spend; track selected options manually.",
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
  const hasActivePowers = Boolean(character.activePowers?.length);
  const hasKnownPowers = Boolean(character.powers.length);
  if (!hasActivePowers && !hasKnownPowers) {
    els.playActivePowersList.innerHTML = emptyState("No powers tracked.");
    return;
  }

  if (hasActivePowers) {
    const activeSection = document.createElement("div");
    activeSection.className = "active-power-stack";
    activeSection.innerHTML = "<h3>Active Power Records</h3>";
    const activeList = document.createElement("div");
    activeList.className = "grid powers";
    renderActivePowersList(activeList);
    activeSection.appendChild(activeList);
    els.playActivePowersList.appendChild(activeSection);
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.playActivePowersList.appendChild(renderPowerCard(power));
  });
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

function renderCombatReminders() {
  const reminders = [];
  character.powers
    .filter((power) => power.active && power.notes)
    .forEach((power) =>
      reminders.push({
        type: "Active Power",
        name: power.name || "Power",
        text: power.notes,
      }),
    );
  Object.entries(character.conditions)
    .filter(([, active]) => active)
    .forEach(([key]) =>
      reminders.push({
        type: "Condition",
        name: displayNameFromKey(key),
        text: "Remember current condition effects.",
      }),
    );
  character.reminders
    .filter((reminder) =>
      /arcane|backlash|malfunction|huckster|backfire|combat|weapon|power/i.test(
        `${reminder.type} ${reminder.name} ${reminder.text}`,
      ),
    )
    .forEach((reminder) => reminders.push(reminder));
  if (character.hucksterDeal?.backfireTriggered) {
    reminders.push({
      type: "Huckster",
      name: "Backfire",
      text: "Backfire is marked on the current deal.",
    });
  }

  els.combatRemindersCard.classList.toggle("hidden", !reminders.length);
  els.combatRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : "";
}
