const LOAD_LIMIT_BY_STRENGTH = {
  d4: 20,
  d6: 40,
  d8: 60,
  d10: 80,
  d12: 100,
};

function normalizeRuleName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hasEdgeNamed(currentCharacter, edgeName) {
  const target = normalizeRuleName(edgeName);
  return (currentCharacter.edges || []).some(
    (edge) => normalizeRuleName(edge?.name) === target,
  );
}

function dieStepIndex(die) {
  const text = String(die || "").trim().toLowerCase();
  const extended = text.match(/^d12\s*\+\s*(\d+)$/);
  if (extended) return STRENGTH_DIE_STEPS.indexOf("d12") + Number(extended[1]);
  return STRENGTH_DIE_STEPS.indexOf(text);
}

function dieStepLabel(step) {
  const safeStep = Math.max(0, Math.floor(Number(step) || 0));
  if (safeStep < STRENGTH_DIE_STEPS.length) return STRENGTH_DIE_STEPS[safeStep];
  return `d12+${safeStep - STRENGTH_DIE_STEPS.indexOf("d12")}`;
}

function effectiveStrengthForEncumbrance(currentCharacter) {
  const baseStrength =
    currentCharacter.attributes?.strength ||
    currentCharacter.weaponStrength ||
    currentCharacter.armorStrength ||
    "d4";
  const baseStep = dieStepIndex(baseStrength);
  const edgeSteps =
    (hasEdgeNamed(currentCharacter, "Brawny") ? 1 : 0) +
    (hasEdgeNamed(currentCharacter, "Soldier") ? 1 : 0);
  const effectiveStep = Math.max(0, baseStep < 0 ? 0 : baseStep) + edgeSteps;
  return dieStepLabel(effectiveStep);
}

function loadLimitForStrength(strengthDie) {
  const label = String(strengthDie || "").trim().toLowerCase();
  if (LOAD_LIMIT_BY_STRENGTH[label]) return LOAD_LIMIT_BY_STRENGTH[label];

  const step = dieStepIndex(label);
  const d12Step = STRENGTH_DIE_STEPS.indexOf("d12");
  if (step > d12Step) {
    return LOAD_LIMIT_BY_STRENGTH.d12 + (step - d12Step) * 20;
  }

  return LOAD_LIMIT_BY_STRENGTH.d4;
}

function carriedQuantity(item, fallback = 1) {
  const raw = item?.count ?? item?.quantity ?? item?.qty ?? fallback;
  return Math.max(0, Number(raw) || 0);
}

function catalogAmmoForKey(key, ammo = {}) {
  const direct = GEAR_CATALOG.find((item) => item.id === key);
  if (direct) return direct;

  const match = String(key || "").match(/^(pistol|rifle)-(\d{2})-ammo$/);
  const kind = match?.[1] || ammo.kind || "";
  const caliberText = match ? `.${match[2]}` : ammo.caliber;
  const caliber = Number(String(caliberText || "").replace(".", ""));

  if (kind === "pistol")
    return caliber <= 38
      ? GEAR_CATALOG.find(
          (item) => item.id === "pistol-ammunition-small-22-38-caliber",
        )
      : GEAR_CATALOG.find(
          (item) => item.id === "pistol-ammunition-large-40-50-caliber",
        );
  if (kind === "rifle")
    return caliber <= 44
      ? GEAR_CATALOG.find(
          (item) => item.id === "rifle-ammunition-small-38-44-caliber",
        )
      : GEAR_CATALOG.find(
          (item) => item.id === "rifle-ammunition-large-50-caliber",
        );

  return null;
}

function ammoUnitWeight(key, ammo = {}) {
  const recordWeight = parseWeightNumber(ammo.weight);
  if (recordWeight !== null) return recordWeight;
  return parseWeight(catalogAmmoForKey(key, ammo)?.weight);
}

function carriedAmmoWeight(currentCharacter) {
  const reserveWeight = Object.entries(currentCharacter.ammo || {}).reduce(
    (sum, [key, ammo]) => sum + ammoUnitWeight(key, ammo) * carriedQuantity(ammo),
    0,
  );
  const loadedWeight = (currentCharacter.weapons || []).reduce((sum, weapon) => {
    if (!isTrackedWeapon(weapon)) return sum;
    const reserve = currentCharacter.ammo?.[weapon.ammoType] || {};
    return sum + ammoUnitWeight(weapon.ammoType, reserve) * carriedQuantity(
      { count: weapon.shotsLoaded },
      0,
    );
  }, 0);
  return reserveWeight + loadedWeight;
}

function carriedItemKey(item) {
  const id = normalizeRuleName(item?.id);
  const name = normalizeRuleName(item?.name || item?.label);
  return { id, name };
}

function isNormalClothingItem(item) {
  const text = normalizeRuleName(`${item?.id || ""} ${item?.name || ""}`);
  return /\b(boots|shirt blouse|shirt|blouse|trousers skirt|trousers|skirt)\b/.test(
    text,
  );
}

function equipmentIdentitySet(currentCharacter) {
  const keys = new Set();
  [...(currentCharacter.weapons || []), ...(currentCharacter.armorInventory || [])]
    .filter(
      (item) =>
        carriedQuantity(item) > 0 && physicalItemIsTopLevelActive(item),
    )
    .forEach((item) => {
      const key = carriedItemKey(item);
      if (key.id) keys.add(`id:${key.id}`);
      if (key.name) keys.add(`name:${key.name}`);
    });
  return keys;
}

function isDuplicateEquipmentInventoryItem(item, equipmentKeys) {
  const key = carriedItemKey(item);
  return (
    (key.id && equipmentKeys.has(`id:${key.id}`)) ||
    (key.name && equipmentKeys.has(`name:${key.name}`))
  );
}

function carriedWeightForItem(item, quantity = carriedQuantity(item)) {
  if (parseWeightNumber(item?.totalWeight) !== null)
    return parseWeight(item.totalWeight);
  return parseWeight(item?.unitWeight ?? item?.weight) * quantity;
}

function normalCapacityForCombatCapacity(combatCapacity) {
  return combatCapacity * 2;
}

function itemDropsInCombat(item) {
  const text = normalizeRuleName(
    `${item?.id || ""} ${item?.name || ""} ${item?.note || item?.notes || ""}`,
  );
  return (
    Boolean(item?.dropsInCombat) ||
    text.includes("backpack") ||
    (item?.isContainer && text.includes("dropped in combat"))
  );
}

function combatAutoDroppedInventoryWeight(currentCharacter) {
  return (currentCharacter.inventory || [])
    .filter(
      (item) =>
        item.location !== "dropped" &&
        item.location !== "stored" &&
        itemDropsInCombat(item),
    )
    .reduce(
      (sum, item) => sum + inventoryItemTotalWeight(item, currentCharacter),
      0,
    );
}

function activeInventoryWeight(currentCharacter, options = {}) {
  const equipmentKeys = equipmentIdentitySet(currentCharacter);
  const inventoryTotals = inventoryWeightBreakdown(currentCharacter);
  const duplicateEquipmentWeight = (currentCharacter.inventory || [])
    .filter(
      (item) =>
        item.location !== "dropped" &&
        item.location !== "stored" &&
        isDuplicateEquipmentInventoryItem(item, equipmentKeys),
    )
    .reduce((sum, item) => sum + inventoryItemTotalWeight(item), 0);
  const autoDroppedWeight = options.combat
    ? combatAutoDroppedInventoryWeight(currentCharacter)
    : 0;

  return Math.max(
    0,
    inventoryTotals.activeLoad - duplicateEquipmentWeight - autoDroppedWeight,
  );
}

function calculateTotalCarriedWeight(currentCharacter, options = {}) {
  return activeInventoryWeight(currentCharacter, options);
}

function calculateEncumbrancePenalty(carriedWeight, loadLimit) {
  return carriedWeight > loadLimit ? -2 : 0;
}

function calculateEncumbrance(currentCharacter, options = {}) {
  const inventoryTotals = inventoryWeightBreakdown(currentCharacter);
  const effectiveStrength = effectiveStrengthForEncumbrance(currentCharacter);
  const carryingCapacity = loadLimitForStrength(effectiveStrength);
  const combatCapacity = carryingCapacity;
  const normalCapacity = normalCapacityForCombatCapacity(carryingCapacity);
  const combatLoad = calculateTotalCarriedWeight(currentCharacter, {
    combat: true,
  });
  const normalLoad = calculateTotalCarriedWeight(currentCharacter);
  const combatMode = Boolean(options.combat);
  const carriedWeight = combatMode ? combatLoad : normalLoad;
  const loadLimit = carryingCapacity;
  const penalty = calculateEncumbrancePenalty(carriedWeight, loadLimit);
  const encumbered = carriedWeight > loadLimit;
  const heavyOverload = carriedWeight >= loadLimit * 3;
  const overloaded = carriedWeight > loadLimit * 4;
  const nextThreshold = !encumbered
    ? loadLimit
    : heavyOverload
      ? loadLimit * 4
      : loadLimit * 3;
  const remainingBeforeNext =
    overloaded ? 0 : Math.max(0, nextThreshold - carriedWeight);

  return {
    carriedWeight,
    combatLoad,
    normalLoad,
    carryingCapacity,
    combatCapacity,
    normalCapacity,
    inventoryTotals,
    effectiveStrength,
    loadLimit,
    penalty,
    encumbered,
    heavyOverload,
    overloaded,
    nextThreshold,
    remainingBeforeNext,
  };
}

function compactLoadText(info) {
  return `${wt(info.normalLoad)} (${wt(info.combatLoad)})`;
}

function formatWeightPounds(weight) {
  return `${wt(weight)} lb`;
}

function encumbranceText(info) {
  if (info.overloaded) return "Overloaded";
  if (info.heavyOverload) return "Heavy overload";
  return info.encumbered ? "Encumbered" : "Unencumbered";
}

function nextEncumbranceText(info) {
  if (info.overloaded) return "Already overloaded";
  const label = info.encumbered
    ? info.heavyOverload
      ? "Maximum lift/carry"
      : "Heavy overload"
    : "Encumbered";
  return `${label} at ${formatWeightPounds(info.nextThreshold)} (${formatWeightPounds(info.remainingBeforeNext)} remaining)`;
}

function encumbranceWarningText(info) {
  if (info.overloaded)
    return "Above 4x Carrying Capacity. This exceeds the maximum weight the character can lift or carry.";
  if (info.heavyOverload)
    return "At 3x Carrying Capacity or more: Pace 1 for Vigor rounds, then Vigor each round or take Fatigue.";
  if (info.encumbered)
    return "Encumbered reminder: -2 Pace (minimum 1), -2 running rolls, -2 Agility and Agility-linked skills, and -2 Vigor rolls to resist Fatigue.";
  return "";
}
