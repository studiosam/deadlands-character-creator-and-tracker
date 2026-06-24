function normalize(data) {
  const defaults = clone(defaultCharacter);
  const normalized =
    data && typeof data === "object"
      ? migrateCharacterPayload(data)
      : migrateCharacterPayload(defaults);

  normalized.schemaVersion = APP_SCHEMA_VERSION;
  normalized.name ||= defaults.name;
  normalized.rank ||= defaults.rank;
  normalized.ancestry ||= defaults.ancestry;
  normalized.archetype ||= defaults.archetype;
  normalized.bennies = { ...defaults.bennies, ...(normalized.bennies || {}) };
  normalized.damage = { ...defaults.damage, ...(normalized.damage || {}) };
  normalized.derived = { ...defaults.derived, ...(normalized.derived || {}) };
  normalized.attributes =
    normalized.attributes && typeof normalized.attributes === "object"
      ? normalized.attributes
      : {};
  normalized.skills = Array.isArray(normalized.skills) ? normalized.skills : [];
  normalized.conditions = {
    ...defaults.conditions,
    ...(normalized.conditions || {}),
  };
  normalized.temporaryConditions = Array.isArray(normalized.temporaryConditions)
    ? normalized.temporaryConditions
    : clone(defaults.temporaryConditions);
  normalized.selectedArmorLocation ||= "best";
  normalized.moneyCents = Math.round(Number(normalized.moneyCents) || 0);
  normalized.armorStrength ||=
    normalized.attributes?.strength || defaults.armorStrength || "d4";
  normalized.weaponStrength ||=
    normalized.attributes?.strength || defaults.weaponStrength || "d4";
  normalized.conviction = Math.max(
    0,
    Math.floor(Number(normalized.conviction) || 0),
  );
  normalized.arcaneBackground = normalized.arcaneBackground || null;
  if (normalized.arcaneBackground?.edgeName) {
    const config = arcaneBackgroundConfigFromEdge(
      normalized.arcaneBackground.edgeName,
    );
    normalized.arcaneBackground = config
      ? {
          ...makeArcaneBackgroundState(config),
          ...normalized.arcaneBackground,
        }
      : normalized.arcaneBackground;
  }
  normalized.advances = normalizeAdvances(normalized.advances);

  normalized.ammo =
    normalized.ammo && typeof normalized.ammo === "object"
      ? normalized.ammo
      : {};
  normalized.ammo = Object.entries(normalized.ammo).reduce(
    (ammoMap, [key, ammo]) => {
      const migrated = migrateAmmoEntry(key, ammo);
      if (!ammoMap[migrated.key]) ammoMap[migrated.key] = migrated.ammo;
      else ammoMap[migrated.key].count += Number(migrated.ammo.count) || 0;
      return ammoMap;
    },
    {},
  );
  Object.values(normalized.ammo).forEach((ammo) => {
    ammo.label ||= "Ammo";
    ammo.count = Math.max(0, Math.floor(Number(ammo.count) || 0));
  });

  normalized.weapons = Array.isArray(normalized.weapons)
    ? normalized.weapons
    : [];
  normalized.weapons = normalized.weapons.map((weapon, index) => {
    const item = { ...weapon };
    const catalogItem = catalogWeaponForRecord(item);
    item.id ||= `${slugify(item.name || "weapon")}-${index}`;
    item.name ||= "Unnamed weapon";
    item.damage ||= "—";
    item.range ||= "—";
    item.ap = item.ap === "" || item.ap === undefined ? "—" : item.ap;
    item.rof = item.rof === "" || item.rof === undefined ? "—" : item.rof;
    if ((!item.shotsMax || Number(item.shotsMax) <= 0) && catalogItem?.shotsMax)
      item.shotsMax = catalogItem.shotsMax;
    if (!item.ammoType && catalogItem?.ammoType)
      item.ammoType = catalogItem.ammoType;

    if (!item.shotsMax || Number(item.shotsMax) <= 0) {
      item.shotsMax = null;
      item.shotsLoaded = null;
      item.ammoType = null;
    } else {
      item.shotsMax = Math.floor(Number(item.shotsMax));
      item.shotsLoaded = clamp(
        Math.floor(Number(item.shotsLoaded) || item.shotsMax),
        0,
        item.shotsMax,
      );
      item.ammoType = exactAmmoTypeForWeapon(item);
      if (!item.ammoType) {
        item.shotsMax = null;
        item.shotsLoaded = null;
      } else if (!normalized.ammo[item.ammoType]) {
        normalized.ammo[item.ammoType] = ammoReserveForKey(item.ammoType);
      }
    }

    return item;
  });

  normalized.armorInventory = Array.isArray(normalized.armorInventory)
    ? normalized.armorInventory
    : [];
  normalized.armorInventory = normalized.armorInventory.map((armor, index) => ({
    id: armor.id || `${slugify(armor.name || "armor")}-${index}`,
    name: armor.name || "Armor",
    count: Math.max(0, Math.floor(Number(armor.count) || 0)),
    armor: Math.max(0, Math.floor(Number(armor.armor) || 0)),
    weight: armor.weight,
    minStr: armor.minStr || "—",
    costCents: armor.costCents,
    book: armor.book || "Deadlands",
    location: ARMOR_LOCATIONS.some((location) => location.id === armor.location)
      ? armor.location
      : "torso",
    equipped: Boolean(armor.equipped),
    note: armor.note || "",
  }));

  normalized.resources = Array.isArray(normalized.resources)
    ? normalized.resources
    : [];
  normalized.resources = normalized.resources.map((resource, index) => ({
    id: resource.id || `${slugify(resource.name || "resource")}-${index}`,
    name: resource.name || "Resource",
    current: Math.max(0, Math.floor(Number(resource.current) || 0)),
    max: Math.max(0, Math.floor(Number(resource.max) || 0)),
    source: resource.source || "",
    note: resource.note || "",
  }));
  normalized.powers = Array.isArray(normalized.powers)
    ? normalized.powers.map((power, index) =>
        normalizePowerRecord(
          power,
          index,
          normalized.arcaneBackground?.edgeName,
        ),
      )
    : [];
  normalized.hucksterDeal = normalizeHucksterDeal(normalized.hucksterDeal);
  if (
    normalized.arcaneBackground?.key === "huckster" &&
    !normalized.hucksterDeal
  )
    normalized.hucksterDeal = makeHucksterDeal();

  normalized.edges = normalizeEdges(normalized.edges);
  normalized.hindrances = normalizeHindrances(normalized.hindrances);
  normalized.inventory = Array.isArray(normalized.inventory)
    ? normalized.inventory
    : [];
  normalizeInventoryState(normalized);
  normalized.vehicles = Array.isArray(normalized.vehicles)
    ? normalized.vehicles
    : [];
  normalized.consumables = Array.isArray(normalized.consumables)
    ? normalized.consumables
    : [];
  normalizePhysicalInventoryState(normalized);
  normalized.reminders = Array.isArray(normalized.reminders)
    ? normalized.reminders
    : [];
  normalized.notes ||= "";

  return normalized;
}

function loadCharacter() {
  return normalize(storageAdapter.readJson(STORAGE_KEY, clone(defaultCharacter)));
}

function save() {
  if (!els.saveState) return;
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    storageAdapter.writeJson(STORAGE_KEY, serializeCharacterForStorage(character));
    els.saveState.textContent = "Saved";
  }, 120);
}

character = loadCharacter();
