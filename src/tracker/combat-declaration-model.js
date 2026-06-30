/**
 * Combat declaration helpers.
 *
 * This model keeps Phase 4 at the intended boundary: help the player state an
 * action, surface obvious table reminders, and record GM-adjudicated results.
 * It does not roll dice, choose targets, or decide combat outcomes.
 */
const DEFAULT_COMBAT_DECLARATION_STATE = {
  actionType: "",
  actionCount: 1,
  weaponId: "",
  targetLabel: "",
  details: "",
  gmResult: "",
  resultWounds: 0,
  resultFatigue: 0,
  resultBennies: 0,
  resultCondition: "",
  resultConditionMode: "set",
  resultAmmoSpent: 0,
  resultLog: [],
};

const COMBAT_DECLARATION_ACTIONS = [
  { id: "", label: "Choose action", phrase: "act" },
  { id: "attack", label: "Attack", phrase: "attack" },
  { id: "reload", label: "Reload / ready", phrase: "reload or ready" },
  { id: "test", label: "Test", phrase: "make a Test" },
  { id: "support", label: "Support", phrase: "Support an ally" },
  { id: "power", label: "Use Power", phrase: "use a Power" },
  { id: "move", label: "Move / run", phrase: "move" },
  { id: "defend", label: "Defend", phrase: "Defend" },
  { id: "hold", label: "Hold / interrupt", phrase: "go on Hold or interrupt" },
  { id: "recover", label: "Recover", phrase: "recover" },
  { id: "soak", label: "Soak / spend Benny", phrase: "spend a Benny or Soak" },
  { id: "other", label: "Other / GM call", phrase: "take another action" },
];

const COMBAT_DECLARATION_RESULT_CONDITIONS = [
  "",
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
  "bleedingOut",
  "diseased",
  "poisoned",
];

function normalizeCombatDeclarationNumber(value, fallback = 0) {
  const number = Math.trunc(Number(value));
  return Number.isFinite(number) ? number : fallback;
}

function normalizeCombatDeclarationLogEntry(entry, index = 0) {
  const source = entry && typeof entry === "object" ? entry : {};
  return {
    id:
      source.id ||
      `combat-result-${source.createdAt || Date.now()}-${index + 1}`,
    createdAt: source.createdAt || "",
    declaration: String(source.declaration || "").trim(),
    result: String(source.result || "").trim(),
    applied: Array.isArray(source.applied)
      ? source.applied.map((item) => String(item || "").trim()).filter(Boolean)
      : [],
  };
}

function normalizeCombatDeclarationState(value) {
  const source = value && typeof value === "object" ? value : {};
  const actionIds = new Set(
    COMBAT_DECLARATION_ACTIONS.map((action) => action.id),
  );
  const conditionIds = new Set(COMBAT_DECLARATION_RESULT_CONDITIONS);
  const actionCount = normalizeCombatDeclarationNumber(source.actionCount, 1);

  return {
    ...DEFAULT_COMBAT_DECLARATION_STATE,
    actionType: actionIds.has(source.actionType) ? source.actionType : "",
    actionCount: clamp(actionCount, 1, 4),
    weaponId: String(source.weaponId || "").trim(),
    targetLabel: String(source.targetLabel || "").trim(),
    details: String(source.details || "").trim(),
    gmResult: String(source.gmResult || "").trim(),
    resultWounds: clamp(
      normalizeCombatDeclarationNumber(source.resultWounds, 0),
      -5,
      5,
    ),
    resultFatigue: clamp(
      normalizeCombatDeclarationNumber(source.resultFatigue, 0),
      -5,
      5,
    ),
    resultBennies: clamp(
      normalizeCombatDeclarationNumber(source.resultBennies, 0),
      -10,
      10,
    ),
    resultCondition: conditionIds.has(source.resultCondition)
      ? source.resultCondition
      : "",
    resultConditionMode:
      source.resultConditionMode === "clear" ? "clear" : "set",
    resultAmmoSpent: clamp(
      normalizeCombatDeclarationNumber(source.resultAmmoSpent, 0),
      0,
      99,
    ),
    resultLog: Array.isArray(source.resultLog)
      ? source.resultLog.map(normalizeCombatDeclarationLogEntry)
      : [],
  };
}

function combatDeclarationActionForId(actionType) {
  return (
    COMBAT_DECLARATION_ACTIONS.find((action) => action.id === actionType) ||
    COMBAT_DECLARATION_ACTIONS[0]
  );
}

function combatDeclarationSelectedWeapon(currentCharacter, state) {
  return (currentCharacter?.weapons || []).find(
    (weapon) => weapon.id === state.weaponId,
  );
}

function combatDeclarationWeaponIsTracked(weapon) {
  return Boolean(weapon?.ammoType && Number(weapon?.shotsMax) > 0);
}

function combatDeclarationWeaponLabel(weapon) {
  if (!weapon) return "";
  const tracked = combatDeclarationWeaponIsTracked(weapon);
  const ammoText = tracked
    ? `, ${Number(weapon.shotsLoaded) || 0}/${Number(weapon.shotsMax) || 0}`
    : "";
  const location = physicalItemLocationLabel({
    type: "weapon",
    id: weapon.id,
    label: weapon.name,
    item: weapon,
  });
  return `${weapon.name}${ammoText} - ${location}`;
}

function combatDeclarationPowerPointResource(currentCharacter) {
  return (currentCharacter?.resources || []).find(
    (resource) => resource.id === "power-points",
  );
}

function combatDeclarationActionHints(currentCharacter = character) {
  const weapons = currentCharacter?.weapons || [];
  const activeWeapons = weapons.filter((weapon) =>
    physicalItemIsTopLevelActive(weapon),
  );
  const readyWeapon = activeWeapons.some(
    (weapon) =>
      !combatDeclarationWeaponIsTracked(weapon) ||
      Number(weapon.shotsLoaded) > 0,
  );
  const powers = currentCharacter?.powers || [];
  const powerPoints = combatDeclarationPowerPointResource(currentCharacter);
  const bennies = Number(currentCharacter?.bennies?.current) || 0;

  return [
    {
      label: readyWeapon
        ? "Attack: weapon ready"
        : activeWeapons.length
          ? "Attack: reload or switch first"
          : "Attack: no carried weapon",
      status: readyWeapon ? "ready" : "limited",
    },
    { label: "Move / run: GM confirms distance", status: "ready" },
    { label: "Test: declare Trait and target", status: "ready" },
    { label: "Support: declare ally and Trait", status: "ready" },
    {
      label: powers.length
        ? powerPoints?.current > 0
          ? "Power: PP available"
          : "Power: check PP or free source"
        : "Power: no known powers",
      status: powers.length && powerPoints?.current > 0 ? "ready" : "limited",
    },
    {
      label: bennies > 0 ? "Soak: Benny available" : "Soak: no Bennies",
      status: bennies > 0 ? "ready" : "limited",
    },
  ];
}

function combatDeclarationReminders(currentCharacter = character) {
  const state = normalizeCombatDeclarationState(
    currentCharacter?.combatDeclaration,
  );
  const conditions = currentCharacter?.conditions || {};
  const reminders = [];
  const add = (severity, text) => reminders.push({ severity, text });

  if (!state.actionType) {
    add("info", "Choose an action or use Other / GM call for a table ruling.");
  }
  if (conditions.bleedingOut) {
    add(
      "limited",
      "Bleeding Out: resolve survival/recovery before normal actions.",
    );
  }
  if (conditions.stunned) {
    add(
      "limited",
      "Stunned: confirm recovery and allowed actions before declaring.",
    );
  }
  if (conditions.shaken) {
    add(
      "limited",
      "Shaken: confirm recovery before a normal action if required.",
    );
  }
  if (conditions.bound) {
    add(
      "limited",
      "Bound: movement and actions are restricted until addressed.",
    );
  }
  if (conditions.entangled) {
    add(
      "limited",
      "Entangled: movement is restricted; confirm escape or action limits.",
    );
  }
  if (conditions.prone) {
    add("info", "Prone: remind the GM before movement or attack resolution.");
  }
  if (conditions.onHold) {
    add(
      "info",
      "On Hold: declare whether this is an interrupt or a held action.",
    );
  }
  if (conditions.wildAttack) {
    add(
      "info",
      "Wild Attack marked: remember its attack/damage and defense consequences.",
    );
  }

  if (state.actionCount > 1) {
    add(
      "info",
      `Multiple actions declared: expect a Multi-Action Penalty reminder for ${state.actionCount} actions.`,
    );
  }
  if (
    state.actionCount >= 4 &&
    !characterHasCanonicalEdge(currentCharacter, "Fast as Lightning")
  ) {
    add(
      "limited",
      "Four actions usually need a specific Edge or GM permission.",
    );
  }

  const selectedWeapon = combatDeclarationSelectedWeapon(
    currentCharacter,
    state,
  );
  if (state.actionType === "attack") {
    if (!selectedWeapon) {
      add("info", "Attack: choose a weapon or describe the attack in details.");
    } else if (!physicalItemIsTopLevelActive(selectedWeapon)) {
      add(
        "limited",
        `${selectedWeapon.name} is not on your person; confirm access before attacking.`,
      );
    } else if (
      combatDeclarationWeaponIsTracked(selectedWeapon) &&
      Number(selectedWeapon.shotsLoaded) <= 0
    ) {
      add(
        "limited",
        `${selectedWeapon.name} is unloaded; reload or switch weapons.`,
      );
    }
  }

  if (state.actionType === "reload" && selectedWeapon) {
    if (!combatDeclarationWeaponIsTracked(selectedWeapon)) {
      add("info", `${selectedWeapon.name} does not use loaded-ammo tracking.`);
    } else if (
      Number(selectedWeapon.shotsLoaded) >= Number(selectedWeapon.shotsMax)
    ) {
      add("info", `${selectedWeapon.name} is already full.`);
    }
  }

  if (state.actionType === "power") {
    const powerPoints = combatDeclarationPowerPointResource(currentCharacter);
    if (!(currentCharacter?.powers || []).length) {
      add("limited", "No known Powers are recorded.");
    } else if (!powerPoints) {
      add(
        "info",
        "No Power Points resource is recorded; confirm the power source.",
      );
    } else if (Number(powerPoints.current) <= 0) {
      add(
        "limited",
        "Power Points are at 0; confirm cost or alternate source.",
      );
    }
  }

  if (
    state.actionType === "soak" &&
    Number(currentCharacter?.bennies?.current) <= 0
  ) {
    add("limited", "No Bennies are currently recorded.");
  }

  return reminders;
}

function combatDeclarationMapReminder(state) {
  const actionCount = Math.max(1, Number(state.actionCount) || 1);
  if (actionCount <= 1) return "No Multi-Action Penalty from action count.";
  return `MAP reminder: ${actionCount} declared actions usually means -${(actionCount - 1) * 2} to affected actions before Edges or GM modifiers.`;
}

function combatDeclarationText(currentCharacter = character) {
  const state = normalizeCombatDeclarationState(
    currentCharacter?.combatDeclaration,
  );
  const action = combatDeclarationActionForId(state.actionType);
  const weapon = combatDeclarationSelectedWeapon(currentCharacter, state);
  const countText =
    state.actionCount === 1 ? "1 action" : `${state.actionCount} actions`;
  const weaponText = weapon ? ` with ${weapon.name}` : "";
  const targetText = state.targetLabel ? ` at ${state.targetLabel}` : "";
  const detailText = state.details ? ` (${state.details})` : "";

  if (!state.actionType) {
    return "Choose an action to build a GM-facing declaration.";
  }

  return `I declare ${countText}: ${action.phrase}${weaponText}${targetText}${detailText}.`;
}
