/**
 * Equipment normalization and catalog lookup helpers.
 *
 * These utilities keep weapons, ammo, armor, and gear records comparable across
 * manual entries, catalog purchases, imports, and legacy saves. UI-specific
 * inventory behavior belongs in inventory.js or equipment.js.
 */
function normalizeCaliber(value) {
  const match = String(value || "")
    .replace(/[–—]/g, "-")
    .match(/\.?(\d{2})(?:\s*-\s*(\d{2}))?/);
  if (!match) return "";
  return `.${match[1]}${match[2] ? `-${match[2]}` : ""}`;
}

function canonicalAmmoCaliber(kind, caliber) {
  const normalized = normalizeCaliber(caliber);
  if (kind === "pistol" && normalized === ".44-40") return ".44";
  return normalized;
}

function caliberFromText(text) {
  const matches =
    String(text || "")
      .replace(/[–—]/g, "-")
      .match(/\.?\d{2}\s*-\s*\d{2}|\.\d{2}/g) || [];
  const unique = [...new Set(matches.map(normalizeCaliber))];
  if (unique.length === 1) return unique[0];
  if (matches.length > 2) return normalizeCaliber(matches[matches.length - 1]);
  return matches.length === 1 ? normalizeCaliber(matches[0]) : "";
}

function ammoKey(kind, caliber) {
  const normalized = canonicalAmmoCaliber(kind, caliber);
  return kind && normalized ? `${kind}-${normalized.slice(1)}-ammo` : "";
}

function ammoLabel(kind, caliber) {
  const label = kind === "rifle" ? "Rifle" : "Pistol";
  return `${label} ammo (${canonicalAmmoCaliber(kind, caliber)})`;
}

function titleCaseAmmoType(value) {
  return String(value || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function displayAmmoCaliber(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/ga/i.test(text)) return text;
  return normalizeCaliber(text) || text;
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
  const catalogItem = catalogWeaponForRecord(weapon);
  if (!type || ["shotgun-shells", "arrow", "percussion-caps"].includes(type))
    return type;

  const legacy = LEGACY_AMMO_KEY_DEFAULTS[type];
  const kind = legacy?.kind || ammoKindFromWeapon(catalogItem || weapon);
  const caliber =
    normalizeCaliber(weapon?.caliber || catalogItem?.caliber) ||
    caliberFromText(
      `${weapon?.name || ""} ${weapon?.notes || ""} ${catalogItem?.name || ""} ${catalogItem?.notes || ""}`,
    ) ||
    legacy?.caliber ||
    "";
  if (kind && caliber) return ammoKey(kind, caliber);
  if (/^(pistol|rifle)-\d{2}(?:-\d{2})?-ammo$/.test(type)) return type;
  return ammoKey(kind, caliber) || type;
}

function requiredAmmoLabelForWeapon(weapon, catalogItem = null) {
  const ammoType =
    exactAmmoTypeForWeapon(weapon) || catalogItem?.ammoType || "";
  if (!ammoType) return "";

  const caliber =
    displayAmmoCaliber(weapon?.caliber || catalogItem?.caliber) ||
    caliberFromText(
      `${weapon?.name || ""} ${weapon?.notes || ""} ${catalogItem?.name || ""} ${catalogItem?.notes || ""}`,
    );
  const keyed = String(ammoType).match(
    /^(pistol|rifle)-(\d{2}(?:-\d{2})?)-ammo$/,
  );
  if (keyed) return ammoLabel(keyed[1], `.${keyed[2]}`);

  const catalogAmmo = GEAR_CATALOG.find((item) => item.id === ammoType);
  const label = catalogAmmo?.name || titleCaseAmmoType(ammoType);
  return caliber && !label.includes(caliber) ? `${label} (${caliber})` : label;
}

function migrateAmmoEntry(key, ammo) {
  const exactMatch = String(key || "").match(
    /^(pistol|rifle)-(\d{2}(?:-\d{2})?)-ammo$/,
  );
  if (exactMatch) {
    const [, kind, rawCaliber] = exactMatch;
    const caliber = canonicalAmmoCaliber(kind, `.${rawCaliber}`);
    const migratedKey = ammoKey(kind, caliber);
    if (migratedKey && migratedKey !== key) {
      return {
        key: migratedKey,
        ammo: {
          ...ammo,
          label: ammoLabel(kind, caliber),
          caliber,
          kind,
        },
      };
    }
  }

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
  const match = key.match(/^(pistol|rifle)-(\d{2}(?:-\d{2})?)-ammo$/);
  return {
    ...fallback,
    label: match
      ? ammoLabel(match[1], `.${match[2]}`)
      : fallback.label || "Ammo",
    caliber: match ? `.${match[2]}` : fallback.caliber,
    kind: match ? match[1] : fallback.kind,
    count: fallback.count ?? 0,
  };
}

function normalizeWeaponAmmoNotes(weapon, catalogItem = null) {
  const notes = repairCommonMojibake(weapon?.notes);
  if (
    catalogItem?.notes &&
    /ammunition may be shared/i.test(notes) &&
    !/ammunition may be shared/i.test(catalogItem.notes)
  ) {
    return catalogItem.notes;
  }
  return notes;
}

function ensureAmmoReserve(key, fallback = {}) {
  if (!key || character.ammo[key]) return;
  character.ammo[key] = ammoReserveForKey(key, fallback);
}

function mergeAmmoReserve(currentCharacter, targetKey, sourceKey) {
  const source = currentCharacter.ammo?.[sourceKey];
  if (!source) return;
  currentCharacter.ammo[targetKey] ||= ammoReserveForKey(targetKey);
  const target = currentCharacter.ammo[targetKey];
  const fallback = ammoReserveForKey(targetKey);
  target.label = fallback.label;
  target.caliber = target.caliber || fallback.caliber;
  target.kind = target.kind || fallback.kind;
  target.count =
    Math.max(0, Number(target.count) || 0) +
    Math.max(0, Number(source.count) || 0);
  ["weight", "costCents", "itemLocation", "storageId", "containerId"].forEach(
    (field) => {
      if (target[field] === undefined || target[field] === "") {
        target[field] = source[field];
      }
    },
  );
  delete currentCharacter.ammo[sourceKey];
}

function reconcileExactCaliberAmmoReserves(currentCharacter) {
  const usedKeys = new Set(
    (currentCharacter.weapons || [])
      .map((weapon) => weapon.ammoType)
      .filter(Boolean),
  );
  Object.keys(currentCharacter.ammo || {}).forEach((sourceKey) => {
    if (usedKeys.has(sourceKey)) return;
    const sourceMatch = sourceKey.match(/^(pistol|rifle)-(\d{2})-ammo$/);
    if (!sourceMatch) return;
    const [, kind, caliber] = sourceMatch;
    const targets = [...usedKeys].filter((key) =>
      key.startsWith(`${kind}-${caliber}-`),
    );
    if (targets.length === 1)
      mergeAmmoReserve(currentCharacter, targets[0], sourceKey);
  });
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
