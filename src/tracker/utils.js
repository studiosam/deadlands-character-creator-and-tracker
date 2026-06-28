function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}

function money(cents) {
  return `$${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function parseWeightNumber(weight) {
  if (typeof weight === "number")
    return Number.isFinite(weight) ? Math.max(0, weight) : null;

  const text = String(weight ?? "")
    .trim()
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\b(pounds?|lbs?\.?)\b/g, "")
    .trim();

  if (!text || /^[-—–]+$/.test(text)) return null;

  const normalized = text.replace(/^\+/, "");
  const fractionMatch = normalized.match(
    /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/,
  );
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1]);
    const denominator = Number(fractionMatch[2]);
    if (
      Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      denominator
    )
      return Math.max(0, numerator / denominator);
  }

  const decimalMatch = normalized.match(/^\d*\.?\d+$/);
  if (!decimalMatch) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

function parseWeight(weight) {
  return parseWeightNumber(weight) ?? 0;
}

function wt(weight) {
  const parsed = parseWeightNumber(weight);
  if (parsed === null) return "—";
  return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
}

function optionList(items, placeholder, detail) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items.map(
      (item) =>
        `<option value="${esc(item.id)}">${esc(item.name)} • ${esc(detail(item))}</option>`,
    ),
  ].join("");
}

function byName(items) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function armorLabel(id) {
  return (
    ARMOR_LOCATIONS.find((location) => location.id === id) || { label: id }
  ).label;
}

function isAmmo(item) {
  return /ammo|ammunition|shell|shot w\/powder|arrow|percussion cap/i.test(
    item.name,
  );
}

function isTrackedWeapon(weapon) {
  return Boolean(
    Number.isFinite(Number(weapon?.shotsMax)) &&
    Number(weapon.shotsMax) > 0 &&
    weapon.ammoType,
  );
}

function getDieStep(die) {
  return STRENGTH_DIE_STEPS.indexOf(
    String(die || "")
      .trim()
      .toLowerCase(),
  );
}

function getStrengthShortfall(characterStrength, minStr) {
  const characterStep = getDieStep(characterStrength);
  const requiredStep = getDieStep(minStr);

  if (characterStep < 0 || requiredStep < 0) return 0;
  return Math.max(0, requiredStep - characterStep);
}

function classifyWeaponUsageType(weapon) {
  const category = String(weapon?.category || "").toLowerCase();
  const name = String(weapon?.name || "").toLowerCase();
  const notes = String(weapon?.notes || "").toLowerCase();
  const range = String(weapon?.range || "").trim();
  const text = `${name} ${notes}`;

  if (category.includes("thrown") || /\bthrown\b|, thrown|throwing/.test(text))
    return "thrown";
  if (category.includes("melee")) return "melee";
  if (
    /firearm|revolver|derringer|rifle|carbine|musket|shotgun|gatling|bow|explosive|infernal|ranged/.test(
      category,
    ) ||
    /revolver|derringer|rifle|carbine|musket|shotgun|gatling|bow|dynamite|nitro|flamethrower/.test(
      text,
    )
  )
    return "ranged";
  if (range) return "ranged";
  return "unknown";
}

function getWeaponStrengthUsageInfo(characterStrength, weapon) {
  const shortfall = getStrengthShortfall(characterStrength, weapon?.minStr);

  if (!shortfall) {
    return {
      isUnderStrength: false,
      shortfall: 0,
      attackPenalty: 0,
      damageCap: "",
      message: "",
    };
  }

  const type = classifyWeaponUsageType(weapon);

  if (type === "melee" || type === "thrown") {
    return {
      isUnderStrength: true,
      shortfall,
      attackPenalty: 0,
      damageCap: characterStrength,
      message: `Strength too low: damage die capped at ${characterStrength}. Positive weapon qualities do not apply, but penalties still apply.`,
    };
  }

  if (type === "ranged") {
    return {
      isUnderStrength: true,
      shortfall,
      attackPenalty: -shortfall,
      damageCap: "",
      message: `Strength too low: ranged attacks suffer -${shortfall}.`,
    };
  }

  return {
    isUnderStrength: true,
    shortfall,
    attackPenalty: 0,
    damageCap: "",
    message: "Strength too low for this weapon.",
  };
}

function weaponStrengthWarningMarkup(weapon) {
  const info = getWeaponStrengthUsageInfo(character.weaponStrength, weapon);
  return info.message
    ? `<p class="weapon-warning">${esc(info.message)}</p>`
    : "";
}

function emptyState(text) {
  return `<p class="empty-state">${esc(text)}</p>`;
}

function displayNameFromKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
