function normalizeCaliber(value) {
  const match = String(value || "").match(/\.?\d{2}/);
  if (!match) return "";
  return `.${match[0].replace(".", "")}`;
}

function caliberFromText(text) {
  const matches = String(text || "").match(/\.\d{2}/g) || [];
  const unique = [...new Set(matches.map(normalizeCaliber))];
  if (unique.length === 1) return unique[0];
  if (matches.length > 2) return normalizeCaliber(matches[matches.length - 1]);
  return matches.length === 1 ? normalizeCaliber(matches[0]) : "";
}

function ammoKey(kind, caliber) {
  const normalized = normalizeCaliber(caliber);
  return kind && normalized ? `${kind}-${normalized.slice(1)}-ammo` : "";
}

function ammoLabel(kind, caliber) {
  const label = kind === "rifle" ? "Rifle" : "Pistol";
  return `${label} ammo (${normalizeCaliber(caliber)})`;
}

function ammoKindFromWeapon(weapon) {
  const category = String(weapon?.category || "").toLowerCase();
  if (/revolver|pistol/.test(category)) return "pistol";
  if (/rifle|carbine|musket/.test(category)) return "rifle";

  const text = `${weapon?.name || ""} ${weapon?.notes || ""}`.toLowerCase();
  if (
    /pistol|revolver|colt|lemat|starr|peacemaker|dragoon|derringer/.test(text)
  )
    return "pistol";
  if (
    /rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(text)
  )
    return "rifle";
  return "";
}

function exactAmmoTypeForWeapon(weapon) {
  const type = weapon?.ammoType || "";
  if (!type || ["shotgun-shells", "arrow", "percussion-caps"].includes(type))
    return type;
  if (/^(pistol|rifle)-\d{2}-ammo$/.test(type)) return type;

  const legacy = LEGACY_AMMO_KEY_DEFAULTS[type];
  const kind = legacy?.kind || ammoKindFromWeapon(weapon);
  const caliber =
    caliberFromText(`${weapon?.name || ""} ${weapon?.notes || ""}`) ||
    legacy?.caliber ||
    "";
  return ammoKey(kind, caliber) || type;
}

function exactAmmoTypeForCatalogAmmo(item, selectedCaliber = "") {
  if (!item) return "";
  const kind = AMMO_KIND_BY_CATALOG_ID[item.id];
  if (!kind) return item.id;
  const caliber =
    normalizeCaliber(selectedCaliber) ||
    caliberFromText(item.name) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber;
  return ammoKey(kind, caliber);
}

function migrateAmmoEntry(key, ammo) {
  const legacy = LEGACY_AMMO_KEY_DEFAULTS[key];
  if (!legacy) return { key, ammo };
  const caliber = caliberFromText(ammo?.label) || legacy.caliber;
  const migratedKey = ammoKey(legacy.kind, caliber);
  return {
    key: migratedKey,
    ammo: {
      ...ammo,
      label: ammoLabel(legacy.kind, caliber),
      caliber,
      kind: legacy.kind,
    },
  };
}

function ammoReserveForKey(key, fallback = {}) {
  const match = key.match(/^(pistol|rifle)-(\d{2})-ammo$/);
  return {
    ...fallback,
    label: match
      ? ammoLabel(match[1], `.${match[2]}`)
      : fallback.label || "Ammo",
    count: fallback.count ?? 0,
  };
}

function ensureAmmoReserve(key, fallback = {}) {
  if (!key || character.ammo[key]) return;
  character.ammo[key] = ammoReserveForKey(key, fallback);
}

function catalogWeaponForRecord(weapon) {
  return WEAPON_CATALOG.find(
    (item) =>
      item.id === weapon?.catalogId ||
      item.id === weapon?.id ||
      item.name.toLowerCase() === String(weapon?.name || "").toLowerCase(),
  );
}

function armorValue(location) {
  return character.armorInventory
    .filter(
      (armor) =>
        armor.equipped &&
        armor.itemLocation !== "dropped" &&
        armor.itemLocation !== "stored" &&
        armor.itemLocation !== "container" &&
        armor.count > 0 &&
        (location === "best" || armor.location === location),
    )
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}
