const AMMO_CALIBERS_BY_CATALOG_ID = {
  "pistol-ammunition-small-22-38-caliber": [".22", ".32", ".36", ".38"],
  "pistol-ammunition-large-40-50-caliber": [".40", ".41", ".44", ".45", ".50"],
  "rifle-ammunition-small-38-44-caliber": [".38", ".40", ".44", ".45"],
  "rifle-ammunition-large-50-caliber": [".50", ".56", ".57", ".58"],
};

const AMMO_KIND_BY_CATALOG_ID = {
  "pistol-ammunition-small-22-38-caliber": "pistol",
  "pistol-ammunition-large-40-50-caliber": "pistol",
  "rifle-ammunition-small-38-44-caliber": "rifle",
  "rifle-ammunition-large-50-caliber": "rifle",
};

const LEGACY_AMMO_KEY_DEFAULTS = {
  pistolLarge: { kind: "pistol", caliber: ".44" },
  "pistol-ammunition-large-40-50-caliber": { kind: "pistol", caliber: ".44" },
  "pistol-ammunition-small-22-38-caliber": { kind: "pistol", caliber: ".38" },
  rifleSmall: { kind: "rifle", caliber: ".44" },
  "rifle-ammunition-small-38-44-caliber": { kind: "rifle", caliber: ".44" },
  "rifle-ammunition-large-50-caliber": { kind: "rifle", caliber: ".50" },
};

const STRENGTH_DIE_STEPS = ["d4", "d6", "d8", "d10", "d12"];
const ATTRIBUTE_ORDER = ["agility", "smarts", "spirit", "strength", "vigor"];
const EDGE_CATEGORIES = [
  "Background",
  "Combat",
  "Leadership",
  "Professional",
  "Social",
  "Weird",
  "Legendary",
  "Arcane",
  "Organization",
  "Custom",
  "Unknown",
];
const EDGE_RANKS = [
  "Novice",
  "Seasoned",
  "Veteran",
  "Heroic",
  "Legendary",
  "Custom",
  "Unknown",
];
const HINDRANCE_SEVERITIES = [
  "Minor",
  "Major",
  "Minor or Major",
  "Custom",
  "Unknown",
];
const ADVANCE_RANKS = ["Novice", "Seasoned", "Veteran", "Heroic", "Legendary"];
const ADVANCE_TYPES = [
  "New Edge",
  "Increase Skill",
  "Increase Two Skills",
  "Increase Attribute",
  "New Powers",
  "Power Points",
  "Other / Marshal-approved",
];
const ADVANCE_TARGET_TYPES = [
  "",
  "edge",
  "hindrance",
  "skill",
  "attribute",
  "power",
  "power-points",
  "resource",
  "custom",
];
const ADVANCE_SOURCES = [
  "manual",
  "imported",
  "marshal-override",
  "advancement",
];
const ADVANCE_APPLY_TYPES = [
  "New Edge",
  "Increase Skill",
  "Increase Two Skills",
  "Increase Attribute",
  "New Powers",
  "Power Points",
];
const DIE_STEPS = ["d4", "d6", "d8", "d10", "d12"];

const CONSUMABLE_GEAR_CONVERSIONS = {
  "matches-box-100": {
    id: "matches",
    name: "Matches",
    unit: "matches",
    multiplier: 100,
    unitsLabel: "Matches per box",
  },
  "trail-rations-per-day": {
    id: "trail-rations",
    name: "Trail rations",
    unit: "days",
    multiplier: 1,
  },
  "lantern-oil-per-gallon": {
    id: "lantern-oil",
    name: "Lantern oil",
    unit: "uses",
    multiplier: 1,
  },
  "restoration-elixir": {
    id: "restoration-elixir",
    name: "Restoration elixir",
    unit: "dose",
    multiplier: 1,
  },
  "tobacco-smoking-pouch": {
    id: "tobacco-smoking",
    name: "Smoking tobacco",
    unit: "pouches",
    multiplier: 1,
  },
  "tobacco-chewing-tin": {
    id: "tobacco-chewing",
    name: "Chewing tobacco",
    unit: "tins",
    multiplier: 1,
  },
  "liquid-courage": {
    id: "liquid-courage",
    name: "Liquid courage",
    unit: "dose",
    multiplier: 1,
  },
};

let character = loadCharacter();
let saveTimer = null;
let edgeEditingId = "";
let hindranceEditingId = "";
let powerEditingId = "";
let advanceEditingId = "";

const $ = (selector) => document.querySelector(selector);

const els = {
  characterName: $("#characterName"),
  characterSubtitle: $("#characterSubtitle"),
  saveState: $("#saveState"),
  woundsValue: $("#woundsValue"),
  woundPenalty: $("#woundPenalty"),
  woundsNote: $("#woundsNote"),
  fatigueValue: $("#fatigueValue"),
  fatiguePenalty: $("#fatiguePenalty"),
  fatigueNote: $("#fatigueNote"),
  benniesValue: $("#benniesValue"),
  bennyStart: $("#bennyStart"),
  convictionValue: $("#convictionValue"),
  paceValue: $("#paceValue"),
  parryValue: $("#parryValue"),
  toughnessValue: $("#toughnessValue"),
  armorSelect: $("#armorSelect"),
  armorNote: $("#armorNote"),
  armorStrengthPill: $("#armorStrengthPill"),
  weaponStrengthPill: $("#weaponStrengthPill"),
  moneyDisplay: $("#moneyDisplay"),
  moneyInput: $("#moneyInput"),
  addMoneyBtn: $("#addMoneyBtn"),
  spendMoneyBtn: $("#spendMoneyBtn"),
  resourcesList: $("#resourcesList"),
  addManualPowerPointsBtn: $("#addManualPowerPointsBtn"),
  combatStatusResources: $("#combatStatusResources"),
  combatArmorLocations: $("#combatArmorLocations"),
  combatPenaltyTotal: $("#combatPenaltyTotal"),
  combatPenaltySummary: $("#combatPenaltySummary"),
  combatPenaltyBreakdown: $("#combatPenaltyBreakdown"),
  playPowerPointsCard: $("#playPowerPointsCard"),
  playPowerPointsList: $("#playPowerPointsList"),
  playResourcesCard: $("#playResourcesCard"),
  playResourcesList: $("#playResourcesList"),
  playActivePowersCard: $("#playActivePowersCard"),
  playActivePowersList: $("#playActivePowersList"),
  combatHucksterCard: $("#combatHucksterCard"),
  combatHucksterHelper: $("#combatHucksterHelper"),
  combatConsumablesCard: $("#combatConsumablesCard"),
  combatConsumablesList: $("#combatConsumablesList"),
  combatRemindersCard: $("#combatRemindersCard"),
  combatRemindersList: $("#combatRemindersList"),
  keyConditionsList: $("#keyConditionsList"),
  playWeaponList: $("#playWeaponList"),
  playAmmoReserves: $("#playAmmoReserves"),
  characterSummaryName: $("#characterSummaryName"),
  characterDossierSubtitle: $("#characterDossierSubtitle"),
  characterSourceBadge: $("#characterSourceBadge"),
  characterStatusStrip: $("#characterStatusStrip"),
  characterBasicsList: $("#characterBasicsList"),
  attributesList: $("#attributesList"),
  skillsList: $("#skillsList"),
  advanceSummaryList: $("#advanceSummaryList"),
  advanceWarningList: $("#advanceWarningList"),
  advancesList: $("#advancesList"),
  showAdvanceFormBtn: $("#showAdvanceFormBtn"),
  advanceEditorPanel: $("#advanceEditorPanel"),
  advanceEditorTitle: $("#advanceEditorTitle"),
  advanceNumberInput: $("#advanceNumberInput"),
  advanceRankInput: $("#advanceRankInput"),
  advanceTypeInput: $("#advanceTypeInput"),
  advanceSummaryInput: $("#advanceSummaryInput"),
  advanceTargetNameInput: $("#advanceTargetNameInput"),
  advanceTargetTypeInput: $("#advanceTargetTypeInput"),
  advanceNotesInput: $("#advanceNotesInput"),
  advanceSourceInput: $("#advanceSourceInput"),
  advancePowerPointAmountInput: $("#advancePowerPointAmountInput"),
  advanceApplyInput: $("#advanceApplyInput"),
  advanceAppliedNote: $("#advanceAppliedNote"),
  advanceWarningText: $("#advanceWarningText"),
  saveAdvanceBtn: $("#saveAdvanceBtn"),
  cancelAdvanceEditBtn: $("#cancelAdvanceEditBtn"),
  edgesList: $("#edgesList"),
  hindrancesList: $("#hindrancesList"),
  characterDerivedDetails: $("#characterDerivedDetails"),
  characterArcaneSummary: $("#characterArcaneSummary"),
  characterEquippedSummary: $("#characterEquippedSummary"),
  characterBackgroundSummary: $("#characterBackgroundSummary"),
  showEdgeFormBtn: $("#showEdgeFormBtn"),
  edgeEditorPanel: $("#edgeEditorPanel"),
  edgeEditorTitle: $("#edgeEditorTitle"),
  edgeCatalogSelect: $("#edgeCatalogSelect"),
  edgeNameInput: $("#edgeNameInput"),
  edgeCategoryInput: $("#edgeCategoryInput"),
  edgeRankInput: $("#edgeRankInput"),
  edgeSourceInput: $("#edgeSourceInput"),
  edgeRequirementsInput: $("#edgeRequirementsInput"),
  edgeSubchoiceInput: $("#edgeSubchoiceInput"),
  edgeSummaryInput: $("#edgeSummaryInput"),
  edgeNotesInput: $("#edgeNotesInput"),
  edgeWarningText: $("#edgeWarningText"),
  saveEdgeBtn: $("#saveEdgeBtn"),
  cancelEdgeEditBtn: $("#cancelEdgeEditBtn"),
  showHindranceFormBtn: $("#showHindranceFormBtn"),
  hindranceEditorPanel: $("#hindranceEditorPanel"),
  hindranceEditorTitle: $("#hindranceEditorTitle"),
  hindranceCatalogSelect: $("#hindranceCatalogSelect"),
  hindranceNameInput: $("#hindranceNameInput"),
  hindranceSeverityInput: $("#hindranceSeverityInput"),
  hindranceSourceInput: $("#hindranceSourceInput"),
  hindranceSummaryInput: $("#hindranceSummaryInput"),
  hindranceNotesInput: $("#hindranceNotesInput"),
  hindranceWarningText: $("#hindranceWarningText"),
  saveHindranceBtn: $("#saveHindranceBtn"),
  cancelHindranceEditBtn: $("#cancelHindranceEditBtn"),
  arcaneDetailSummary: $("#arcaneDetailSummary"),
  arcaneRemindersList: $("#arcaneRemindersList"),
  importWarningsList: $("#importWarningsList"),
  longFormNotesList: $("#longFormNotesList"),
  arcaneSummary: $("#arcaneSummary"),
  powersList: $("#powersList"),
  powerSetupNotice: $("#powerSetupNotice"),
  powerCatalogSearch: $("#powerCatalogSearch"),
  powerRankFilter: $("#powerRankFilter"),
  powerValidOnlyInput: $("#powerValidOnlyInput"),
  powerMarshalOverrideInput: $("#powerMarshalOverrideInput"),
  powerCatalogSelect: $("#powerCatalogSelect"),
  powerCatalogWarning: $("#powerCatalogWarning"),
  powerCatalogPreview: $("#powerCatalogPreview"),
  addCatalogPowerBtn: $("#addCatalogPowerBtn"),
  addRequiredPowerBtn: $("#addRequiredPowerBtn"),
  hucksterAvailablePowers: $("#hucksterAvailablePowers"),
  powerNameInput: $("#powerNameInput"),
  powerCostInput: $("#powerCostInput"),
  powerRangeInput: $("#powerRangeInput"),
  powerDurationInput: $("#powerDurationInput"),
  powerSourceInput: $("#powerSourceInput"),
  powerTrappingInput: $("#powerTrappingInput"),
  powerSummaryInput: $("#powerSummaryInput"),
  powerNotesInput: $("#powerNotesInput"),
  addPowerBtn: $("#addPowerBtn"),
  hucksterDealPanel: $("#hucksterDealPanel"),
  hucksterSelectedPower: $("#hucksterSelectedPower"),
  hucksterRequiredPowerPoints: $("#hucksterRequiredPowerPoints"),
  hucksterGamblingRollResult: $("#hucksterGamblingRollResult"),
  hucksterCardsDrawn: $("#hucksterCardsDrawn"),
  hucksterPokerHand: $("#hucksterPokerHand"),
  hucksterTemporaryPowerPoints: $("#hucksterTemporaryPowerPoints"),
  hucksterShortagePenalty: $("#hucksterShortagePenalty"),
  hucksterLeftoverPowerPoints: $("#hucksterLeftoverPowerPoints"),
  hucksterAnteBennySpent: $("#hucksterAnteBennySpent"),
  hucksterUsedJoker: $("#hucksterUsedJoker"),
  hucksterBackfireTriggered: $("#hucksterBackfireTriggered"),
  hucksterNotes: $("#hucksterNotes"),
  weaponList: $("#weaponList"),
  weaponCatalogSelect: $("#weaponCatalogSelect"),
  weaponNameInput: $("#weaponNameInput"),
  weaponQtyInput: $("#weaponQtyInput"),
  weaponDamageInput: $("#weaponDamageInput"),
  weaponRangeInput: $("#weaponRangeInput"),
  weaponApInput: $("#weaponApInput"),
  weaponRofInput: $("#weaponRofInput"),
  weaponCapacityInput: $("#weaponCapacityInput"),
  weaponAmmoTypeSelect: $("#weaponAmmoTypeSelect"),
  weaponAddForm: $("#weaponAddForm"),
  addWeaponBtn: $("#addWeaponBtn"),
  cancelWeaponAddBtn: $("#cancelWeaponAddBtn"),
  weaponCatalogPreview: $("#weaponCatalogPreview"),
  weaponTemplate: $("#weaponTemplate"),
  ammoReserves: $("#ammoReserves"),
  ammoGearSelect: $("#ammoGearSelect"),
  ammoLabelInput: $("#ammoLabelInput"),
  ammoCountInput: $("#ammoCountInput"),
  ammoCaliberSelect: $("#ammoCaliberSelect"),
  ammoNoteInput: $("#ammoNoteInput"),
  ammoAddForm: $("#ammoAddForm"),
  addAmmoBtn: $("#addAmmoBtn"),
  cancelAmmoAddBtn: $("#cancelAmmoAddBtn"),
  ammoGearPreview: $("#ammoGearPreview"),
  armorLocationList: $("#armorLocationList"),
  armorInventoryList: $("#armorInventoryList"),
  armorCatalogSelect: $("#armorCatalogSelect"),
  armorNameInput: $("#armorNameInput"),
  armorCountInput: $("#armorCountInput"),
  armorValueInput: $("#armorValueInput"),
  armorLocationSelect: $("#armorLocationSelect"),
  armorAddForm: $("#armorAddForm"),
  addArmorBtn: $("#addArmorBtn"),
  cancelArmorAddBtn: $("#cancelArmorAddBtn"),
  armorCatalogPreview: $("#armorCatalogPreview"),
  conditionsList: $("#conditionsList"),
  clearTempConditionsBtn: $("#clearTempConditionsBtn"),
  consumablesList: $("#consumablesList"),
  remindersList: $("#remindersList"),
  gearSelect: $("#gearSelect"),
  inventoryNameInput: $("#inventoryNameInput"),
  inventoryCountInput: $("#inventoryCountInput"),
  inventoryUnitsField: $("#inventoryUnitsField"),
  inventoryUnitsLabel: $("#inventoryUnitsLabel"),
  inventoryUnitsInput: $("#inventoryUnitsInput"),
  inventoryNoteInput: $("#inventoryNoteInput"),
  gearAddForm: $("#gearAddForm"),
  addInventoryBtn: $("#addInventoryBtn"),
  cancelInventoryAddBtn: $("#cancelInventoryAddBtn"),
  gearPreview: $("#gearPreview"),
  inventoryList: $("#inventoryList"),
  vehicleCatalogSelect: $("#vehicleCatalogSelect"),
  vehicleNameInput: $("#vehicleNameInput"),
  vehicleQtyInput: $("#vehicleQtyInput"),
  vehicleNoteInput: $("#vehicleNoteInput"),
  vehicleAddForm: $("#vehicleAddForm"),
  addVehicleBtn: $("#addVehicleBtn"),
  cancelVehicleAddBtn: $("#cancelVehicleAddBtn"),
  vehicleCatalogPreview: $("#vehicleCatalogPreview"),
  vehicleList: $("#vehicleList"),
  notesArea: $("#notesArea"),
  newSessionBtn: $("#newSessionBtn"),
  headerToolsMenu: $("#headerToolsMenu"),
  exportBtn: $("#exportBtn"),
  importFile: $("#importFile"),
  pasteImportBtn: $("#pasteImportBtn"),
  pasteImportPanel: $("#pasteImportPanel"),
  importJsonText: $("#importJsonText"),
  confirmPasteImportBtn: $("#confirmPasteImportBtn"),
  cancelPasteImportBtn: $("#cancelPasteImportBtn"),
  resetBtn: $("#resetBtn"),
};

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

function wt(weight) {
  if (weight === undefined || weight === null || Number.isNaN(Number(weight)))
    return "—";
  return Number(weight).toLocaleString(undefined, { maximumFractionDigits: 2 });
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
  return STRENGTH_DIE_STEPS.indexOf(String(die || "").trim().toLowerCase());
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
    /rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(
      text,
    )
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

function reminderMarkup(reminder) {
  return `<article class="reminder"><div class="topline"><h3>${esc(reminder.name)}</h3><small>${esc(reminder.type)}</small></div><p>${esc(reminder.text)}</p></article>`;
}

function traitListMarkup(items, emptyText) {
  return items.length
    ? items
        .map(
          (item) =>
            `<div class="row"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}${item.note ? `<span>${esc(item.note)}</span>` : ""}</div></div>`,
        )
        .join("")
    : emptyState(emptyText);
}

function compactText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function sourceLabel() {
  const source = compactText(character.source || "Tracker", "Tracker");
  if (source.toLowerCase() === "savaged.us") return "Savaged.us import";
  if (source.toLowerCase() === "created") return "Created in tracker";
  return source;
}

function statusPipMarkup(label, value, note = "") {
  return `<div class="status-pip"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
}

function tagCardMarkup(item, kind = "") {
  const controls = item.id
    ? `<div class="tag-actions"><button class="ghost tag-action" type="button" data-entry-type="${esc(kind)}" data-entry-action="edit" data-entry-id="${esc(item.id)}">Edit</button><button class="ghost tag-action danger-lite" type="button" data-entry-type="${esc(kind)}" data-entry-action="remove" data-entry-id="${esc(item.id)}">Remove</button></div>`
    : "";
  return `<article class="dossier-tag ${kind}"><div class="dossier-tag-head"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}</div>${controls}</div>${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.note ? `<p class="tag-note">${esc(item.note)}</p>` : ""}${item.sourceMeta ? `<small>${esc(item.sourceMeta)}</small>` : ""}</article>`;
}

function attributeCardMarkup(name, die) {
  return `<div class="attribute-die-card"><span>${esc(displayNameFromKey(name))}</span><strong>${esc(die || "—")}</strong></div>`;
}

function skillChipMarkup(skill) {
  const meta = skill.die || skill.value || "—";
  const note = skill.notes || skill.linkedAttribute || "";
  return `<div class="skill-chip"><strong>${esc(skill.name || "Skill")}</strong><span>${esc(meta)}${note ? ` • ${esc(note)}` : ""}</span></div>`;
}

function equippedArmorSummaryMarkup() {
  const equipped = character.armorInventory.filter(
    (armor) => armor.equipped && armor.count > 0,
  );
  if (!equipped.length) return emptyState("No equipped armor recorded.");

  return equipped
    .map(
      (armor) =>
        `<div class="equipment-line"><strong>${esc(armor.name)}</strong><span>+${esc(armor.armor)} ${esc(armorLabel(armor.location))}${armor.minStr ? ` • Min Str ${esc(armor.minStr)}` : ""}</span></div>`,
    )
    .join("");
}

function equippedWeaponSummaryMarkup() {
  const weapons = character.weapons.filter((weapon) => weapon.name).slice(0, 4);
  if (!weapons.length) return emptyState("No weapons recorded.");

  return weapons
    .map((weapon) => {
      const loaded = isTrackedWeapon(weapon)
        ? ` • ${weapon.shotsLoaded} / ${weapon.shotsMax}`
        : "";
      return `<div class="equipment-line"><strong>${esc(weapon.name)}</strong><span>Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")}${loaded}</span></div>`;
    })
    .join("");
}

function characterNotesSummaryMarkup() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  const notes = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);

  const parts = [];
  if (character.sourceId) {
    parts.push(
      `<article class="dossier-note"><strong>Import ID</strong><p>${esc(character.sourceId)}</p></article>`,
    );
  }
  notes.slice(0, 3).forEach(([label, value]) => {
    parts.push(
      `<article class="dossier-note"><strong>${esc(label)}</strong><p>${esc(value)}</p></article>`,
    );
  });
  importWarnings.slice(0, 3).forEach((warning) => {
    parts.push(
      `<article class="dossier-note warning"><strong>${esc(warning.name)}</strong><p>${esc(warning.text)}</p></article>`,
    );
  });

  return parts.length
    ? parts.join("")
    : emptyState("No background or import notes recorded.");
}

function generateStableEntryId(type, name) {
  return `${type}-${slugify(name || type)}`;
}

function uniqueEntryId(id, used) {
  const base = id || "entry";
  let candidate = base;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function generateAdvanceId(number, type, targetName) {
  return `advance-${slugify(number || "x")}-${slugify(type || "advance")}-${slugify(targetName || "entry")}`;
}

function inferAdvanceTypeFromText(text) {
  const value = String(text || "").trim();
  if (/^raise attribute:/i.test(value)) return "Increase Attribute";
  if (/^raise skills:/i.test(value)) return "Increase Two Skills";
  if (/^raise skill:/i.test(value)) return "Increase Skill";
  if (/^edge:\s*new powers/i.test(value)) return "New Powers";
  if (/^edge:\s*power points/i.test(value)) return "Power Points";
  if (/^edge:/i.test(value)) return "New Edge";
  return "";
}

function inferAdvanceTargetName(text, type) {
  const value = String(text || "").trim();
  if (!value) return "";
  const [, afterColon = ""] = value.match(/^[^:]+:\s*(.+)$/) || [];
  if (type === "Power Points") return "+5 Power Points";
  if (type === "New Powers") {
    const powers = afterColon.match(/\((.+)\)/);
    return powers?.[1] || afterColon.replace(/^New Powers\s*/i, "").trim();
  }
  return afterColon || "";
}

function getAdvanceRankFromCount(count) {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  if (total >= 16) return "Legendary";
  if (total >= 12) return "Heroic";
  if (total >= 8) return "Veteran";
  if (total >= 4) return "Seasoned";
  return "Novice";
}

function getNextDieStep(value) {
  const text = String(value || "").trim().toLowerCase();
  const index = DIE_STEPS.indexOf(text);
  if (index < 0) return "";
  return DIE_STEPS[Math.min(index + 1, DIE_STEPS.length - 1)];
}

function isSupportedAppliedAdvance(type) {
  return ADVANCE_APPLY_TYPES.includes(type);
}

function normalizeAdvanceEntry(entry, index = 0) {
  const raw =
    typeof entry === "string"
      ? { summary: entry }
      : entry && typeof entry === "object"
        ? entry
        : {};
  const sourceText = raw.summary || raw.description || raw.name || "";
  const number = Math.max(
    1,
    Math.floor(Number(raw.number ?? raw.advanceNumber ?? index + 1) || index + 1),
  );
  const type =
    raw.type ||
    raw.advanceType ||
    raw.advancementType ||
    inferAdvanceTypeFromText(sourceText);
  const summary = raw.summary || raw.description || raw.name || "";
  const rank = raw.rank || raw.rankAtAdvance || raw.selectedRank || "";
  const targetName =
    raw.targetName || raw.target || inferAdvanceTargetName(sourceText, type);
  const targetType = raw.targetType || raw.targetKind || targetTypeForAdvanceType(type);
  const source = raw.source || "manual";

  return {
    ...raw,
    id: raw.id || generateAdvanceId(number, type, targetName || summary),
    number,
    rank: ADVANCE_RANKS.includes(rank)
      ? rank
      : getAdvanceRankFromCount(Math.max(0, number - 1)),
    type: ADVANCE_TYPES.includes(type) ? type : type || "",
    summary,
    targetName,
    targetType: ADVANCE_TARGET_TYPES.includes(targetType) ? targetType : "",
    targetId: raw.targetId || "",
    catalogId: raw.catalogId || "",
    notes: raw.notes || "",
    dateAdded: raw.dateAdded || "",
    source: ADVANCE_SOURCES.includes(source) ? source : source || "manual",
    applied: Boolean(raw.applied),
    appliedByApp: Boolean(raw.appliedByApp),
    appliedAt: raw.appliedAt || "",
    appliedChanges: Array.isArray(raw.appliedChanges)
      ? raw.appliedChanges
      : [],
  };
}

function normalizeAdvances(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry, index) => {
    const normalized = normalizeAdvanceEntry(entry, index);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function getCharacterAdvanceSummary(currentCharacter) {
  const advances = normalizeAdvances(currentCharacter.advances || []);
  const count = advances.length;
  const derivedRank = getAdvanceRankFromCount(count);
  const recordedRank = currentCharacter.rank || "";
  return {
    count,
    derivedRank,
    recordedRank,
    rankMismatch:
      Boolean(recordedRank) &&
      ADVANCE_RANKS.includes(recordedRank) &&
      recordedRank !== derivedRank,
  };
}

function advanceDisplaySummary(advance) {
  const summary = compactText(advance.summary, "");
  if (summary) return summary;
  const target = compactText(advance.targetName, "");
  if (target) return `${compactText(advance.type, "Advance")}: ${target}`;
  if (advance.type === "Power Points") return "Power Points: +5 Power Points";
  return compactText(advance.type, "Advance recorded");
}

function advanceWarnings(currentCharacter, advance, editingId = "") {
  const warnings = [];
  const type = compactText(advance.type, "");
  if (!type) warnings.push("Advance type is missing.");

  const needsTarget = [
    "New Edge",
    "Increase Skill",
    "Increase Two Skills",
    "Increase Attribute",
    "New Powers",
    "Power Points",
  ].includes(type);
  if (needsTarget && !compactText(advance.targetName, ""))
    warnings.push("Target name is missing for this advance type.");

  const duplicate = (currentCharacter.advances || []).some(
    (item) => item.id !== editingId && Number(item.number) === Number(advance.number),
  );
  if (duplicate) warnings.push(`Advance #${advance.number} is already used.`);

  const expectedRank = getAdvanceRankFromCount(Math.max(0, Number(advance.number) - 1));
  if (
    advance.rank &&
    ADVANCE_RANKS.includes(advance.rank) &&
    advance.rank !== expectedRank
  )
    warnings.push(`Selected rank differs from expected rank ${expectedRank}.`);

  return warnings;
}

function upsertAdvance(currentCharacter, advance) {
  const normalized = normalizeAdvanceEntry(advance);
  const index = currentCharacter.advances.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.advances[index] = normalized;
  else currentCharacter.advances.push(normalized);
  currentCharacter.advances = normalizeAdvances(currentCharacter.advances);
}

function removeAdvance(currentCharacter, advanceId) {
  currentCharacter.advances = currentCharacter.advances.filter(
    (advance) => advance.id !== advanceId,
  );
}

function findEdgeCatalogEntryByName(name) {
  const text = plainEntryName(name);
  if (!text) return null;
  return EDGE_CATALOG.find((edge) => plainEntryName(edge.name) === text) || null;
}

function findPowerCatalogEntryByLooseName(name) {
  if (typeof findPowerCatalogEntryByName !== "function") return null;
  return findPowerCatalogEntryByName(name);
}

function splitAdvanceTargets(value) {
  return String(value || "")
    .split(/[,;/]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeAttributeKey(name) {
  const text = plainEntryName(name);
  return ATTRIBUTE_ORDER.find((key) => key === text) || "";
}

function findSkillByName(name) {
  const text = plainEntryName(name);
  return (character.skills || []).find((skill) => plainEntryName(skill.name) === text);
}

function parsePowerPointAdvanceAmount(advance) {
  const match = `${advance.targetName || ""} ${advance.summary || ""} ${advance.notes || ""}`.match(
    /[+]?(\d+)/,
  );
  return Math.max(1, Math.floor(Number(advance.powerPointAmount || match?.[1] || 5)));
}

function createAdvanceEdge(advance) {
  const catalogEntry =
    chosen(EDGE_CATALOG, advance.catalogId) ||
    findEdgeCatalogEntryByName(advance.targetName);
  const name = advance.targetName || catalogEntry?.name;
  if (!name) throw new Error("Target Edge name is required.");
  const id = uniqueEntryId(
    generateStableEntryId("edge", name),
    new Set(character.edges.map((edge) => edge.id)),
  );
  const edge = normalizeEdgeEntry({
    ...(catalogEntry || {}),
    id,
    name,
    type: "edge",
    source: "advancement",
    catalogId: catalogEntry?.id || advance.catalogId || "",
    createdByAdvanceId: advance.id,
    isCustom: !catalogEntry,
  });
  character.edges.push(edge);
  character.edges = normalizeEdges(character.edges);
  return {
    kind: "edge-added",
    entityId: edge.id,
    catalogId: edge.catalogId || "",
    name: edge.name,
    createdByAdvanceId: advance.id,
  };
}

function createAdvancePower(advance, name) {
  const catalogEntry =
    (advance.catalogId && typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById(advance.catalogId)
      : null) || findPowerCatalogEntryByLooseName(name);
  const id = uniqueEntryId(
    `power-${slugify(catalogEntry?.name || name)}`,
    new Set(character.powers.map((power) => power.id)),
  );
  const rawPower = catalogEntry
    ? createKnownPowerFromCatalog(catalogEntry, character, {
        id,
        addedReason: "advancement",
      })
    : {
        id,
        name,
        source: "advancement",
        rank: advance.rank || "Novice",
        active: false,
        addedReason: "advancement",
        isCustom: true,
      };
  rawPower.source = "advancement";
  rawPower.createdByAdvanceId = advance.id;
  const power = normalizePowerRecord(
    rawPower,
    character.powers.length,
    character.arcaneBackground?.edgeName,
  );
  power.createdByAdvanceId = advance.id;
  character.powers.push(power);
  return {
    kind: "power-added",
    entityId: power.id,
    catalogId: power.catalogId || "",
    name: power.name,
    createdByAdvanceId: advance.id,
  };
}

function increaseSkillForAdvance(advance, skillName) {
  if (!skillName) throw new Error("Skill name is required.");
  if (!Array.isArray(character.skills)) character.skills = [];
  const skill = findSkillByName(skillName);
  const before = skill?.die || skill?.value || "";
  const after = before ? getNextDieStep(before) : "d4";
  if (!after || after === before)
    throw new Error(`${skillName} cannot increase beyond ${before || "unknown"}.`);
  if (skill) skill.die = after;
  else character.skills.push({ name: skillName, die: after, linkedAttribute: "", notes: "" });
  return {
    kind: "skill-increased",
    skillName,
    before,
    after,
  };
}

function increaseAttributeForAdvance(attributeName) {
  const attributeKey = normalizeAttributeKey(attributeName);
  if (!attributeKey) throw new Error("Attribute must be Agility, Smarts, Spirit, Strength, or Vigor.");
  if (!character.attributes || typeof character.attributes !== "object")
    character.attributes = {};
  const before = character.attributes?.[attributeKey] || "d4";
  const after = getNextDieStep(before);
  if (!after || after === before)
    throw new Error(`${displayNameFromKey(attributeKey)} cannot increase beyond ${before}.`);
  character.attributes[attributeKey] = after;
  if (attributeKey === "strength") {
    character.armorStrength = after;
    character.weaponStrength = after;
  }
  return {
    kind: "attribute-increased",
    attributeName: displayNameFromKey(attributeKey),
    attributeKey,
    before,
    after,
  };
}

function increasePowerPointsForAdvance(advance) {
  let resource = powerPointResource();
  if (!resource) {
    resource = makePowerPointResource(null, {
      current: 0,
      max: 0,
      source: "advancement",
      note: "Created by advancement application.",
    });
    character.resources.push(resource);
  }
  const amount = parsePowerPointAdvanceAmount(advance);
  const before = Math.max(0, Math.floor(Number(resource.max) || 0));
  resource.max = before + amount;
  resource.current = Math.min(Math.max(0, Math.floor(Number(resource.current) || 0)), resource.max);
  return {
    kind: "power-points-increased",
    field: "maxPowerPoints",
    before,
    after: resource.max,
    amount,
  };
}

function applyAdvanceToCharacter(advance) {
  if (advance.applied) return advance;
  if (!isSupportedAppliedAdvance(advance.type)) return advance;
  const normalized = normalizeAdvanceEntry(advance);
  const changes = [];

  if (normalized.type === "New Edge") {
    changes.push(createAdvanceEdge(normalized));
  } else if (normalized.type === "New Powers") {
    const targets = splitAdvanceTargets(normalized.targetName);
    if (!targets.length) throw new Error("At least one power name is required.");
    targets.forEach((name) => changes.push(createAdvancePower(normalized, name)));
  } else if (normalized.type === "Power Points") {
    changes.push(increasePowerPointsForAdvance(normalized));
  } else if (normalized.type === "Increase Skill") {
    changes.push(increaseSkillForAdvance(normalized, normalized.targetName));
  } else if (normalized.type === "Increase Two Skills") {
    const targets = splitAdvanceTargets(normalized.targetName);
    if (targets.length !== 2)
      throw new Error("Enter exactly two skill names separated by a comma.");
    const invalid = targets
      .map((name) => findSkillByName(name))
      .filter((skill) => skill && getNextDieStep(skill.die || skill.value) === (skill.die || skill.value));
    if (invalid.length)
      throw new Error(`${invalid.map((skill) => skill.name).join(", ")} cannot increase further.`);
    targets.forEach((name) => changes.push(increaseSkillForAdvance(normalized, name)));
  } else if (normalized.type === "Increase Attribute") {
    changes.push(increaseAttributeForAdvance(normalized.targetName));
  }

  return {
    ...normalized,
    applied: true,
    appliedByApp: true,
    appliedAt: new Date().toISOString(),
    appliedChanges: changes,
  };
}

function canUndoAdvanceChange(advance, change) {
  if (change.kind === "edge-added") {
    const edge = character.edges.find((item) => item.id === change.entityId);
    const safe =
      edge &&
      edge.name === change.name &&
      (!change.catalogId || edge.catalogId === change.catalogId) &&
      (edge.createdByAdvanceId === advance.id ||
        change.createdByAdvanceId === advance.id);
    return {
      safe,
      message: safe
        ? `Remove Edge ${change.name}.`
        : `Cannot safely remove Edge ${change.name}; it was changed or is missing.`,
    };
  }

  if (change.kind === "power-added") {
    const power = character.powers.find((item) => item.id === change.entityId);
    const safe =
      power &&
      power.name === change.name &&
      (!change.catalogId || power.catalogId === change.catalogId) &&
      (power.createdByAdvanceId === advance.id ||
        change.createdByAdvanceId === advance.id);
    return {
      safe,
      message: safe
        ? `Remove Power ${change.name}.`
        : `Cannot safely remove Power ${change.name}; it was changed or is missing.`,
    };
  }

  if (change.kind === "skill-increased") {
    const skill = findSkillByName(change.skillName);
    const current = skill?.die || skill?.value || "";
    const safe =
      skill &&
      DIE_STEPS.includes(change.before) &&
      DIE_STEPS.includes(change.after) &&
      current === change.after;
    return {
      safe,
      message: safe
        ? `Revert ${change.skillName} from ${change.after} to ${change.before || "untrained"}.`
        : `Cannot safely revert ${change.skillName}; current value is ${current || "missing"}.`,
    };
  }

  if (change.kind === "attribute-increased") {
    const key = change.attributeKey || normalizeAttributeKey(change.attributeName);
    const current = character.attributes?.[key] || "";
    const safe =
      key &&
      DIE_STEPS.includes(change.before) &&
      DIE_STEPS.includes(change.after) &&
      current === change.after;
    return {
      safe,
      message: safe
        ? `Revert ${displayNameFromKey(key)} from ${change.after} to ${change.before}.`
        : `Cannot safely revert ${change.attributeName}; current value is ${current || "missing"}.`,
    };
  }

  if (change.kind === "power-points-increased") {
    const resource = powerPointResource();
    const currentMax = Math.max(0, Math.floor(Number(resource?.max) || 0));
    const safe = resource && currentMax === change.after;
    const clampNote =
      resource && resource.current > change.before
        ? ` Current Power Points will be clamped from ${resource.current} to ${change.before}.`
        : "";
    return {
      safe,
      message: safe
        ? `Revert max Power Points from ${change.after} to ${change.before}.${clampNote}`
        : `Cannot safely revert Power Points; current max is ${currentMax}.`,
    };
  }

  return {
    safe: false,
    message: `Cannot safely undo unknown change ${change.kind || "unknown"}.`,
  };
}

function getAdvanceUndoPlan(advance) {
  const changes = Array.isArray(advance.appliedChanges)
    ? advance.appliedChanges
    : [];
  const checks = changes.map((change) => canUndoAdvanceChange(advance, change));
  return {
    safe: Boolean(changes.length) && checks.every((check) => check.safe),
    messages: checks.map((check) => check.message),
  };
}

function undoAdvanceChange(change) {
  if (change.kind === "edge-added") {
    character.edges = character.edges.filter((edge) => edge.id !== change.entityId);
  } else if (change.kind === "power-added") {
    character.powers = character.powers.filter((power) => power.id !== change.entityId);
  } else if (change.kind === "skill-increased") {
    const skill = findSkillByName(change.skillName);
    if (skill) {
      if (change.before) skill.die = change.before;
      else character.skills = character.skills.filter((item) => item !== skill);
    }
  } else if (change.kind === "attribute-increased") {
    const key = change.attributeKey || normalizeAttributeKey(change.attributeName);
    if (key) {
      character.attributes[key] = change.before;
      if (key === "strength") {
        character.armorStrength = change.before;
        character.weaponStrength = change.before;
      }
    }
  } else if (change.kind === "power-points-increased") {
    const resource = powerPointResource();
    if (resource) {
      resource.max = change.before;
      resource.current = Math.min(resource.current, resource.max);
    }
  }
}

function undoAdvanceChanges(advance) {
  (advance.appliedChanges || []).forEach(undoAdvanceChange);
}

function normalizeEdgeEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("edge", entry),
      name: entry,
      type: "edge",
      category: "Unknown",
      rank: "Unknown",
      requirements: "",
      shortSummary: "",
      notes: "",
      source: "Imported",
      subchoice: "",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id: source.id || generateStableEntryId("edge", source.name || "edge"),
    name: source.name || "Unnamed Edge",
    type: source.type || "edge",
    category: source.category || "Unknown",
    rank: source.rank || "Unknown",
    requirements: source.requirements || "",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    subchoice: source.subchoice || "",
    isCustom: Boolean(source.isCustom),
  };
}

function normalizeHindranceEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("hindrance", entry),
      name: entry,
      type: "hindrance",
      severity: "Unknown",
      shortSummary: "",
      notes: "",
      source: "Imported",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id:
      source.id || generateStableEntryId("hindrance", source.name || "hindrance"),
    name: source.name || "Unnamed Hindrance",
    type: source.type || "hindrance",
    severity: source.severity || "Unknown",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    isCustom: Boolean(source.isCustom),
  };
}

function normalizeEdges(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeEdgeEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function normalizeHindrances(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeHindranceEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function plainEntryName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function entryTextValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function selectKnownValue(select, value, fallback) {
  const text = compactText(value, fallback);
  select.value = [...select.options].some((option) => option.value === text)
    ? text
    : fallback;
}

function edgeDisplayMeta(edge) {
  return [
    edge.rank && edge.rank !== "Unknown" ? edge.rank : "",
    edge.category && edge.category !== "Unknown" ? edge.category : "",
    edge.requirements ? `Req: ${entryTextValue(edge.requirements)}` : "",
    edge.subchoice ? `Choice: ${edge.subchoice}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function hindranceDisplayMeta(hindrance) {
  return hindrance.severity && hindrance.severity !== "Unknown"
    ? hindrance.severity
    : "";
}

function sourceMeta(entry) {
  if (!entry.source || entry.source === "Manual") return "";
  return `Source: ${entry.source}`;
}

function getEdgeWarnings(currentCharacter, draftEdge, editingId = "") {
  const warnings = [];
  if (!draftEdge.name.trim()) warnings.push("Edge name is blank.");

  if (isArcaneBackgroundEdge(draftEdge.name)) {
    const hasOtherArcaneBackground = currentCharacter.edges.some(
      (edge) => edge.id !== editingId && isArcaneBackgroundEdge(edge.name),
    );
    if (hasOtherArcaneBackground)
      warnings.push("This character already has an Arcane Background Edge.");
  }

  const draftName = plainEntryName(draftEdge.name);
  const hasTenderfoot = currentCharacter.hindrances.some(
    (hindrance) => plainEntryName(hindrance.name) === "tenderfoot",
  );
  if (draftName === "dont get im riled" && hasTenderfoot) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function getHindranceWarnings(currentCharacter, draftHindrance, editingId = "") {
  const warnings = [];
  if (!draftHindrance.name.trim()) warnings.push("Hindrance name is blank.");
  if (!draftHindrance.severity || draftHindrance.severity === "Unknown")
    warnings.push("Hindrance severity is not selected.");

  const draftName = plainEntryName(draftHindrance.name);
  const hasRiled = currentCharacter.edges.some(
    (edge) => plainEntryName(edge.name) === "dont get im riled",
  );
  if (draftName === "tenderfoot" && hasRiled) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function upsertEdge(currentCharacter, edge) {
  const normalized = normalizeEdgeEntry(edge);
  const index = currentCharacter.edges.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.edges[index] = normalized;
  else currentCharacter.edges.push(normalized);
  currentCharacter.edges = normalizeEdges(currentCharacter.edges);
}

function removeEdge(currentCharacter, edgeId) {
  currentCharacter.edges = currentCharacter.edges.filter(
    (edge) => edge.id !== edgeId,
  );
}

function upsertHindrance(currentCharacter, hindrance) {
  const normalized = normalizeHindranceEntry(hindrance);
  const index = currentCharacter.hindrances.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.hindrances[index] = normalized;
  else currentCharacter.hindrances.push(normalized);
  currentCharacter.hindrances = normalizeHindrances(currentCharacter.hindrances);
}

function removeHindrance(currentCharacter, hindranceId) {
  currentCharacter.hindrances = currentCharacter.hindrances.filter(
    (hindrance) => hindrance.id !== hindranceId,
  );
}

function normalize(data) {
  const defaults = clone(defaultCharacter);
  const normalized = data && typeof data === "object" ? data : defaults;

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
  normalized.vehicles = Array.isArray(normalized.vehicles)
    ? normalized.vehicles
    : [];
  normalized.consumables = Array.isArray(normalized.consumables)
    ? normalized.consumables
    : [];
  normalized.reminders = Array.isArray(normalized.reminders)
    ? normalized.reminders
    : [];
  normalized.notes ||= "";

  return normalized;
}

function loadCharacter() {
  try {
    return normalize(
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultCharacter),
    );
  } catch {
    return normalize(clone(defaultCharacter));
  }
}

function save() {
  if (!els.saveState) return;
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    els.saveState.textContent = "Saved";
  }, 120);
}

function ammoOptions(selected = "") {
  const selectedMissing = selected && !character.ammo[selected];
  return [
    `<option value=""${!selected ? " selected" : ""}>No ammunition tracking</option>`,
    selectedMissing
      ? `<option value="${esc(selected)}" selected>${esc(ammoReserveForKey(selected).label)} (no reserve)</option>`
      : "",
    ...Object.entries(character.ammo).map(
      ([key, ammo]) =>
        `<option value="${esc(key)}"${key === selected ? " selected" : ""}>${esc(ammo.label)}</option>`,
    ),
  ].join("");
}

function caliberOptionsForAmmo(item, selected = "") {
  const options = AMMO_CALIBERS_BY_CATALOG_ID[item?.id] || [];
  if (!options.length) {
    return '<option value="">No caliber selection</option>';
  }
  const selectedCaliber =
    normalizeCaliber(selected) ||
    caliberFromText(els.ammoLabelInput.value) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber ||
    options[0];
  return options
    .map(
      (caliber) =>
        `<option value="${esc(caliber)}"${caliber === selectedCaliber ? " selected" : ""}>${esc(caliber)}</option>`,
    )
    .join("");
}

function entryCatalogOptions(items, placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items
      .map(
        (item) =>
          `<option value="${esc(item.id)}">${esc(item.name)}${item.rank ? ` • ${esc(item.rank)}` : ""}${item.severity ? ` • ${esc(item.severity)}` : ""}${item.source ? ` • ${esc(item.source)}` : ""}</option>`,
      )
      .join(""),
  ].join("");
}

function catalogs() {
  els.gearSelect.innerHTML = optionList(
    byName(GEAR_CATALOG),
    "Choose gear from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.ammoGearSelect.innerHTML = optionList(
    GEAR_CATALOG.filter(isAmmo),
    "Choose ammunition from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.armorCatalogSelect.innerHTML = optionList(
    ARMOR_CATALOG,
    "Choose armor from catalog…",
    (item) =>
      `+${item.armor} • ${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.weaponCatalogSelect.innerHTML = optionList(
    WEAPON_CATALOG,
    "Choose weapon from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.vehicleCatalogSelect.innerHTML = optionList(
    VEHICLE_CATALOG,
    "Choose vehicle from catalog…",
    (item) => money(item.costCents),
  );
  els.edgeCatalogSelect.innerHTML = entryCatalogOptions(
    EDGE_CATALOG,
    "Manual Edge or choose from catalog…",
  );
  els.hindranceCatalogSelect.innerHTML = entryCatalogOptions(
    HINDRANCE_CATALOG,
    "Manual Hindrance or choose from catalog…",
  );
  els.armorLocationSelect.innerHTML = ARMOR_LOCATIONS.map(
    (location) =>
      `<option value="${esc(location.id)}">${esc(location.label)}</option>`,
  ).join("");
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

function updatePreviews() {
  const gear = chosen(GEAR_CATALOG, els.gearSelect.value);
  const consumableConversion = consumableConversionForGear(gear);
  els.inventoryUnitsField.classList.toggle(
    "hidden",
    !consumableConversion?.unitsLabel,
  );
  if (consumableConversion?.unitsLabel) {
    els.inventoryUnitsLabel.textContent = consumableConversion.unitsLabel;
    els.inventoryUnitsInput.placeholder = String(consumableConversion.multiplier);
  } else {
    els.inventoryUnitsInput.value = "";
  }
  const packageCount = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const unitsPerPackage = Math.max(
    1,
    Math.floor(
      Number(els.inventoryUnitsInput.value) ||
        consumableConversion?.multiplier ||
        1,
    ),
  );
  els.gearPreview.textContent = gear
    ? consumableConversion
      ? `${gear.name} • Adds ${packageCount * unitsPerPackage} ${consumableConversion.unit} to Consumables`
      : `${gear.name} • Weight ${wt(gear.weight)} • Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const ammo = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  els.ammoGearPreview.textContent = ammo
    ? `${ammo.name} • Weight ${wt(ammo.weight)} • Cost ${money(ammo.costCents)} each`
    : "Choose ammunition from the catalog or type custom ammo.";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo(
    ammo,
    els.ammoCaliberSelect.value,
  );
  els.ammoCaliberSelect.disabled = !(
    ammo && AMMO_CALIBERS_BY_CATALOG_ID[ammo.id]
  );

  const armor = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  els.armorCatalogPreview.textContent = armor
    ? `${armor.name} • +${armor.armor} armor • ${armorLabel(armor.location)} • Min Str ${armor.minStr} • ${money(armor.costCents)}`
    : "Choose armor from the catalog or type custom armor.";
  if (armor) {
    els.armorValueInput.value = armor.armor;
    els.armorLocationSelect.value = armor.location;
  }

  const weapon = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  els.weaponCatalogPreview.textContent = weapon
    ? `${weapon.name} • Min Str ${weapon.minStr} • Weight ${wt(weapon.weight)} • Cost ${money(weapon.costCents)}. Fill blank combat stats manually.`
    : "Choose a weapon from the catalog or type custom weapon.";
  if (weapon) {
    els.weaponDamageInput.value = weapon.damage || "";
    els.weaponRangeInput.value = weapon.range || "";
    els.weaponApInput.value = weapon.ap !== undefined ? weapon.ap : "";
    els.weaponRofInput.value = weapon.rof || "";
    els.weaponCapacityInput.value = weapon.shotsMax || "";
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      exactAmmoTypeForWeapon(weapon),
    );
  }

  const vehicle = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  els.vehicleCatalogPreview.textContent = vehicle
    ? `${vehicle.name} • Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}

function armorValue(location) {
  return character.armorInventory
    .filter(
      (armor) =>
        armor.equipped &&
        armor.count > 0 &&
        (location === "best" || armor.location === location),
    )
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}

function render() {
  els.characterName.textContent = character.name;
  els.characterSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" ");
  els.woundsValue.textContent = character.damage.wounds;
  const woundPenalty = Math.min(character.damage.wounds, character.damage.maxWounds);
  els.woundPenalty.textContent = woundPenalty ? `Penalty -${woundPenalty}` : "";
  els.woundPenalty.classList.toggle("hidden", !woundPenalty);
  els.woundsNote.textContent = character.damage.wounds
    ? "Apply wound penalty to affected trait rolls."
    : "Healthy";
  els.fatigueValue.textContent = character.damage.fatigue;
  const fatiguePenalty = Math.min(character.damage.fatigue, character.damage.maxFatigue);
  els.fatiguePenalty.textContent = fatiguePenalty ? `Penalty -${fatiguePenalty}` : "";
  els.fatiguePenalty.classList.toggle("hidden", !fatiguePenalty);
  els.fatigueNote.textContent = character.damage.fatigue
    ? "Apply fatigue penalty to affected trait rolls."
    : "Fresh";
  els.benniesValue.textContent = character.bennies.current;
  els.bennyStart.textContent = `Start ${character.bennies.starting}`;
  els.convictionValue.textContent = character.conviction;

  const location = "best";
  character.selectedArmorLocation = "best";
  const armor = armorValue(location);
  character.derived.armor = armor;
  character.derived.toughness =
    (Number(character.derived.baseToughness) || 0) + armor;
  els.paceValue.textContent = character.derived.pace;
  els.parryValue.textContent = character.derived.parry;
  els.toughnessValue.textContent = `${character.derived.toughness} (+${armor})`;
  els.armorSelect.innerHTML = `<option value="best">All equipped armor</option>`;
  els.armorSelect.value = location;
  els.armorNote.textContent = `Armor bonus: +${armor}`;
  els.combatArmorLocations.innerHTML = ARMOR_LOCATIONS.filter(
    (item) => !["best", "shield"].includes(item.id),
  )
    .map(
      (item) =>
        `<span><strong>${esc(item.label)}:</strong> +${armorValue(item.id)}</span>`,
    )
    .join("");
  els.armorStrengthPill.textContent = `Strength ${character.armorStrength}`;
  els.weaponStrengthPill.textContent = `Strength ${character.weaponStrength}`;
  els.moneyDisplay.textContent = money(character.moneyCents);

  renderCharacterSummary();
  renderAdvancement();
  renderArmor();
  renderWeapons();
  renderAmmo();
  renderResources();
  renderPowers();
  renderHucksterDeal();
  renderKeyConditions();
  renderConditions();
  renderCombatPenalties();
  renderConsumables();
  renderInventory();
  renderVehicles();
  renderReminders();
  renderPlaySummary();
  renderArcaneSummary();
  renderNotesSummary();

  if (document.activeElement !== els.notesArea)
    els.notesArea.value = character.notes || "";
}

function renderCharacterSummary() {
  els.characterSummaryName.textContent = character.name;
  els.characterDossierSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" • ");
  els.characterSourceBadge.textContent = sourceLabel();
  els.characterBasicsList.innerHTML = [
    ["Rank", character.rank],
    ["Ancestry", character.ancestry],
    ["Concept", character.archetype],
    ["Source", sourceLabel()],
  ]
    .map(
      ([label, value]) =>
        `<div class="dossier-meta-item"><span>${label}</span><strong>${esc(value || "—")}</strong></div>`,
    )
    .join("");

  const powerPoints = powerPointResource();
  els.characterStatusStrip.innerHTML = [
    statusPipMarkup(
      "Wounds",
      `${character.damage.wounds} / ${character.damage.maxWounds}`,
    ),
    statusPipMarkup(
      "Fatigue",
      `${character.damage.fatigue} / ${character.damage.maxFatigue}`,
    ),
    statusPipMarkup("Bennies", character.bennies.current, `Start ${character.bennies.starting}`),
    statusPipMarkup("Conviction", character.conviction),
    powerPoints
      ? statusPipMarkup(
          "Power Points",
          `${powerPoints.current} / ${powerPoints.max}`,
          powerPoints.source,
        )
      : "",
  ]
    .filter(Boolean)
    .join("");
  els.addManualPowerPointsBtn.classList.toggle("hidden", Boolean(powerPoints));

  const attributeEntries = Object.entries(character.attributes || {}).sort(
    ([left], [right]) => {
      const leftIndex = ATTRIBUTE_ORDER.indexOf(left);
      const rightIndex = ATTRIBUTE_ORDER.indexOf(right);
      return (
        (leftIndex < 0 ? 99 : leftIndex) -
          (rightIndex < 0 ? 99 : rightIndex) ||
        displayNameFromKey(left).localeCompare(displayNameFromKey(right))
      );
    },
  );
  els.attributesList.innerHTML = attributeEntries.length
    ? attributeEntries
        .map(([name, die]) => attributeCardMarkup(name, die))
        .join("")
    : emptyState("No attributes recorded.");

  const skills = [...(character.skills || [])].sort((left, right) =>
    String(left.name || "").localeCompare(String(right.name || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
  els.skillsList.innerHTML = skills.length
    ? skills.map(skillChipMarkup).join("")
    : emptyState("No skills recorded.");

  const edges = (character.edges || [])
    .filter((edge) => edge.name)
    .map((edge) => ({
      id: edge.id,
      name: edge.name,
      meta: edgeDisplayMeta(edge),
      summary: edge.shortSummary || edge.summary || "",
      note: edge.notes || edge.text || "",
      sourceMeta: sourceMeta(edge),
    }));
  els.edgesList.innerHTML = edges.length
    ? edges.map((edge) => tagCardMarkup(edge, "edge")).join("")
    : emptyState("No Edges added yet.");

  const hindrances = (character.hindrances || [])
    .filter((hindrance) => hindrance.name)
    .map((hindrance) => ({
      id: hindrance.id,
      name: hindrance.name,
      meta: hindranceDisplayMeta(hindrance),
      summary: hindrance.shortSummary || hindrance.summary || "",
      note: hindrance.notes || hindrance.text || "",
      sourceMeta: sourceMeta(hindrance),
    }));
  els.hindrancesList.innerHTML = hindrances.length
    ? hindrances
        .map((hindrance) => tagCardMarkup(hindrance, "hindrance"))
        .join("")
    : emptyState("No Hindrances added yet.");

  els.characterDerivedDetails.innerHTML = [
    ["Pace", character.derived.pace, ""],
    ["Parry", character.derived.parry, ""],
    [
      "Toughness",
      character.derived.toughness,
      `Base ${compactText(character.derived.baseToughness)} + Armor ${compactText(character.derived.armor, "0")}`,
    ],
    ["Size", character.derived.size ?? character.size, ""],
    ["Armor", `+${compactText(character.derived.armor, "0")}`, "Best equipped"],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");

  const background = character.arcaneBackground;
  els.characterArcaneSummary.innerHTML = background
    ? `<div class="arcane-snapshot-grid">${[
        ["Background", background.name || background.edgeName],
        ["Edge", background.edgeName],
        [
          "Arcane Skill",
          background.arcaneSkill
            ? `${background.arcaneSkill}${background.linkedAttribute ? ` (${background.linkedAttribute})` : ""}`
            : "",
        ],
        [
          "Power Points",
          powerPoints ? `${powerPoints.current} / ${powerPoints.max}` : "—",
        ],
        ["Known Powers", character.powers.length],
      ]
        .map(
          ([label, value]) =>
            `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
        )
        .join("")}</div>`
    : powerPoints
      ? `<div class="arcane-snapshot-grid">${[
          ["Background", "Manual Power Points"],
          ["Power Points", `${powerPoints.current} / ${powerPoints.max}`],
          ["Known Powers", character.powers.length],
          ["Notes", powerPoints.note || "Manual post-import setup"],
        ]
          .map(
            ([label, value]) =>
              `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
          )
          .join("")}</div>`
      : emptyState("No Arcane Background or Power Points configured.");

  els.characterEquippedSummary.innerHTML = `<div class="equipment-group"><h3>Weapons</h3>${equippedWeaponSummaryMarkup()}</div><div class="equipment-group"><h3>Armor</h3>${equippedArmorSummaryMarkup()}</div><div class="equipment-line secondary"><strong>Cash</strong><span>${money(character.moneyCents)} • Inventory tracks money and gear details.</span></div>`;
  els.characterBackgroundSummary.innerHTML = characterNotesSummaryMarkup();
}

function sortedAdvances() {
  return [...(character.advances || [])].sort(
    (left, right) =>
      Number(left.number) - Number(right.number) ||
      String(left.dateAdded || "").localeCompare(String(right.dateAdded || "")),
  );
}

function nextAdvanceNumber() {
  return (
    Math.max(0, ...((character.advances || []).map((advance) => Number(advance.number) || 0))) +
    1
  );
}

function targetTypeForAdvanceType(type) {
  if (type === "New Edge") return "edge";
  if (type === "Increase Skill" || type === "Increase Two Skills") return "skill";
  if (type === "Increase Attribute") return "attribute";
  if (type === "New Powers") return "power";
  if (type === "Power Points") return "power-points";
  return "custom";
}

function advanceCardMarkup(advance) {
  const warnings = advanceWarnings(character, advance, advance.id);
  const status = advance.applied
    ? `Applied${advance.appliedAt ? ` ${advance.appliedAt}` : ""}`
    : "History only";
  const target = [
    advance.targetType ? displayNameFromKey(advance.targetType) : "",
    advance.targetName,
  ]
    .filter(Boolean)
    .join(": ");
  const source = [advance.source, advance.dateAdded].filter(Boolean).join(" • ");
  return tagCardMarkup(
    {
      id: advance.id,
      name: `Advance #${advance.number}`,
      meta: [advance.rank, advance.type].filter(Boolean).join(" • "),
      summary: advanceDisplaySummary(advance),
      note: [
        status,
        target ? `Target: ${target}` : "",
        advance.notes,
        warnings.length ? `Warning: ${warnings.join(" ")}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      sourceMeta: source,
    },
    "advancement",
  );
}

function renderAdvancement() {
  const summary = getCharacterAdvanceSummary(character);
  els.advanceSummaryList.innerHTML = [
    ["Current Rank", summary.derivedRank, "Based on recorded advances"],
    ["Recorded Rank", summary.recordedRank, "Character sheet value"],
    ["Total Advances", summary.count, "History entries"],
    [
      "Next Advance",
      nextAdvanceNumber(),
      getAdvanceRankFromCount(summary.count),
    ],
  ]
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");

  const warnings = [];
  if (summary.rankMismatch) {
    warnings.push(
      `Character rank is ${summary.recordedRank}, but ${summary.count} recorded advances derive ${summary.derivedRank}.`,
    );
  }
  const duplicateNumbers = new Set();
  const seenNumbers = new Set();
  (character.advances || []).forEach((advance) => {
    const number = Number(advance.number);
    if (!number) return;
    if (seenNumbers.has(number)) duplicateNumbers.add(number);
    seenNumbers.add(number);
  });
  duplicateNumbers.forEach((number) =>
    warnings.push(`Advance #${number} appears more than once.`),
  );
  els.advanceWarningList.innerHTML = warnings.length
    ? warnings
        .map((warning) => `<p class="entry-warning">${esc(warning)}</p>`)
        .join("")
    : "";

  const advances = sortedAdvances();
  els.advancesList.innerHTML = advances.length
    ? advances.map(advanceCardMarkup).join("")
    : emptyState("No advances recorded yet.");
}

function renderKeyConditions() {
  const keys = [
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
  ].filter((key) => key in character.conditions);
  els.keyConditionsList.innerHTML = "";
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = `condition${character.conditions[key] ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${character.conditions[key] ? "checked" : ""}><span>${esc(displayNameFromKey(key))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.keyConditionsList.appendChild(label);
  });
}

function renderPlaySummary() {
  renderCombatWeapons();
  renderCombatStatusResources();
  renderCombatPowerPoints();

  const activeResources = character.resources.filter(
    (resource) =>
      resource.id !== "power-points" &&
      (resource.max > 0 || resource.current > 0),
  );
  els.playResourcesCard.classList.toggle("hidden", !activeResources.length);
  renderResourceControls(els.playResourcesList, activeResources);

  const showPowers = character.powers.length > 0;
  els.playActivePowersCard.classList.toggle("hidden", !showPowers);
  if (showPowers) renderCombatPowers();

  renderCombatHuckster();
  renderCombatConsumables();
  renderCombatReminders();
}

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
  row.innerHTML = `<div><strong>${showName ? esc(resource.name) : value}</strong>${showName ? `<span>${value}</span>` : "<span>Current / Max</span>"}${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls resource-recovery-actions"><button data-recover="5" type="button">Rest +5</button><button data-recover="10" type="button">Rest +10</button><button data-recover="15" type="button">Rest +15</button><button data-recover="max" type="button">Max</button></div>`;
  row.querySelectorAll("[data-recover]").forEach((button) => {
    const atMax = Boolean(resource.max && resource.current >= resource.max);
    button.disabled = atMax || (button.dataset.recover === "max" && !resource.max);
    button.onclick = () => {
      if (button.dataset.recover === "max") {
        if (resource.max) {
          resource.current = resource.max;
          render();
          save();
        }
        return;
      }
      recoverResource(resource, Number(button.dataset.recover));
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

function combatPenaltyInfo() {
  const woundPenalty = Math.min(
    character.damage.wounds,
    character.damage.maxWounds,
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

  const total = traitPenalties.reduce(
    (sum, penalty) => sum + Math.abs(penalty.value),
    0,
  );

  return { total, traitPenalties, modifiers };
}

function renderCombatPenalties() {
  const { total, traitPenalties, modifiers } = combatPenaltyInfo();
  const entries = [
    ...traitPenalties.map(
      (penalty) => `${penalty.label} ${penalty.value}`,
    ),
    ...modifiers,
  ];

  els.combatPenaltyTotal.textContent = total ? `-${total}` : "0";
  els.combatPenaltySummary.textContent = total
    ? "Trait penalty total"
    : "No trait penalties";
  els.combatPenaltyBreakdown.innerHTML = entries.length
    ? entries
        .map((entry) => `<span>${esc(entry)}</span>`)
        .join("")
    : '<span>No active penalty causes.</span>';
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
  if (!character.weapons.length) {
    els.playWeaponList.innerHTML = emptyState("No weapons tracked.");
    return;
  }

  [...character.weapons]
    .sort(
      (left, right) =>
        Number(isTrackedWeapon(right)) - Number(isTrackedWeapon(left)),
    )
    .forEach((weapon) => {
      const reserve = weapon.ammoType ? character.ammo[weapon.ammoType] : null;
      const tracked = isTrackedWeapon(weapon);
      const strengthWarning = weaponStrengthWarningMarkup(weapon);
      const article = document.createElement("article");
      article.className = "weapon-card";
      article.innerHTML = `<div class="topline"><div><h3>${esc(weapon.name)}</h3><p class="meta">Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")} • AP ${esc(weapon.ap ?? "—")} • ROF ${esc(weapon.rof ?? "—")} • Min Str ${esc(weapon.minStr || "—")}</p></div><span class="loaded">${tracked ? `${weapon.shotsLoaded} / ${weapon.shotsMax}` : "No ammo"}</span></div>${tracked ? `<p class="muted">${esc(reserve?.label || "Ammo")} reserve: ${reserve?.count || 0}</p>` : '<p class="muted">Melee / no ammo tracking.</p>'}${strengthWarning}${weapon.notes ? `<p class="muted">${esc(weapon.notes)}</p>` : ""}${tracked ? '<div class="weapon-actions"><button class="fire-btn" type="button">Fire</button><button class="load-btn" type="button">Load +1</button><button class="reload-btn" type="button">Fill</button><button class="unload-btn" type="button">Unload</button></div>' : ""}`;

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
  const baseName = power.modifiers?.length ? "Basic" : "Cast";
  const options = [
    {
      name: baseName,
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

function variableSpendTotal(power, article) {
  const baseCost = powerCost(power);
  const options = variableSpendOptionsForPower(power);
  return Array.from(article.querySelectorAll("[data-variable-spend]")).reduce(
    (total, input) => {
      const option = options[Number(input.dataset.variableSpend)];
      const quantity = Math.max(0, Math.floor(Number(input.value) || 0));
      const costPer = Number.isFinite(Number(option?.costPer))
        ? Number(option.costPer)
        : 1;
      return total + quantity * costPer;
    },
    baseCost,
  );
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
    button.onclick = () => {
      if (powerPoints && option.cost) {
        powerPoints.current = Math.max(0, powerPoints.current - option.cost);
      }
      render();
      save();
    };
  });

  variableInputs.forEach((input) => {
    input.oninput = () => updateVariableSpendButton(power, article, powerPoints);
  });
  if (variableSpendButton) {
    updateVariableSpendButton(power, article, powerPoints);
    variableSpendButton.onclick = () => {
      const total = variableSpendTotal(power, article);
      if (powerPoints && total) {
        powerPoints.current = Math.max(0, powerPoints.current - total);
      }
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
    els.playActivePowersList.innerHTML = emptyState("No known powers.");
    return;
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
  return /healing|unguent|elixir|restoration|dynamite|explosive|grenade|bomb|oil|tonic|potion/i.test(
    `${item.name || ""} ${item.unit || ""}`,
  );
}

function consumableConversionForGear(item) {
  if (!item) return null;
  return CONSUMABLE_GEAR_CONVERSIONS[item.id] || null;
}

function addConsumableFromGear(item, packageCount, unitsPerPackage) {
  const conversion = consumableConversionForGear(item);
  if (!conversion) return false;
  const count =
    Math.max(1, Math.floor(Number(packageCount) || 1)) *
    Math.max(
      1,
      Math.floor(Number(unitsPerPackage) || conversion.multiplier || 1),
    );
  addConsumableCount(
    conversion.id,
    conversion.name,
    conversion.unit,
    count,
    `Converted from ${item.name}.`,
  );
  return true;
}

function addConsumableCount(id, name, unit, amount, note = "") {
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
  } else {
    character.consumables.push({
      id,
      name,
      count: Math.max(1, Math.floor(Number(amount) || 1)),
      unit,
      note,
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
    .filter((item) => item.count > 0 && isCombatConsumable(item))
    .map((item) => ({ item, source: character.consumables }));
  const inventory = character.inventory
    .filter((item) => item.count > 0 && isCombatConsumable(item))
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
      const amount = clamp(
        Math.floor(Number(input.value) || 1),
        1,
        item.count,
      );
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

function renderArcaneSummary() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneDetailSummary.innerHTML = background
    ? `<div class="row"><div><strong>${esc(background.name)}</strong><span>${esc(background.edgeName)} • ${esc(background.arcaneSkill)} (${esc(background.linkedAttribute)})</span><span>${esc(background.edgeFamily || "")}</span></div></div>`
    : powerPoints
      ? `<div class="row"><div><strong>Manual Power Points</strong><span>${powerPoints.current} / ${powerPoints.max}</span><span>${esc(powerPoints.note || "")}</span></div></div>`
      : emptyState("No arcane tools configured for this character.");

  const reminders = character.reminders.filter((reminder) =>
    /arcane|backlash|malfunction|huckster|power/i.test(
      `${reminder.type} ${reminder.name} ${reminder.text}`,
    ),
  );
  els.arcaneRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No arcane reminders.");
}

function renderNotesSummary() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  els.importWarningsList.innerHTML = importWarnings.length
    ? importWarnings.map(reminderMarkup).join("")
    : emptyState("No import warnings.");

  const longForm = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);
  els.longFormNotesList.innerHTML = longForm.length
    ? longForm
        .map(
          ([label, value]) =>
            `<article class="reminder"><div class="topline"><h3>${esc(label)}</h3></div><p>${esc(value)}</p></article>`,
        )
        .join("")
    : emptyState("No long-form character text recorded.");
}

function renderArmor() {
  els.armorLocationList.innerHTML = ARMOR_LOCATIONS.filter(
    (location) => location.id !== "shield",
  )
    .map((location) => {
      const equipped = character.armorInventory.filter(
        (armor) =>
          armor.equipped && armor.count > 0 && armor.location === location.id,
      );
      return `<div class="loc-card"><strong>${esc(location.label)} (${armorValue(location.id)})</strong><span>${equipped.map((armor) => `${esc(armor.name)} (+${armor.armor})`).join("<br>") || "—"}</span></div>`;
    })
    .join("");

  els.armorInventoryList.innerHTML = "";
  if (!character.armorInventory.length) {
    els.armorInventoryList.innerHTML = emptyState("No armor tracked yet.");
    return;
  }

  character.armorInventory.forEach((armor) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(armor.name)}</strong><span>+${armor.armor} • ${armorLabel(armor.location)} • Min Str ${esc(armor.minStr)} • Weight ${wt(armor.weight)} • Cost ${armor.costCents !== undefined ? money(armor.costCents) : "—"} each</span>${armor.note ? `<span>${esc(armor.note)}</span>` : ""}</div><div class="controls"><button>${armor.equipped ? "Equipped" : "Equip"}</button><button>&minus;</button><strong>${armor.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      armor.equipped = !armor.equipped;
      render();
      save();
    };
    buttons[1].onclick = () => {
      armor.count = Math.max(0, armor.count - 1);
      if (!armor.count) armor.equipped = false;
      render();
      save();
    };
    buttons[2].onclick = () => {
      armor.count += 1;
      render();
      save();
    };
    buttons[3].onclick = () => {
      character.armorInventory = character.armorInventory.filter(
        (item) => item.id !== armor.id,
      );
      render();
      save();
    };
    els.armorInventoryList.appendChild(row);
  });
}

function renderWeapons() {
  els.weaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.weaponList.innerHTML = emptyState("No weapons tracked yet.");
    return;
  }

  character.weapons.forEach((weapon) => {
    const fragment = els.weaponTemplate.content.cloneNode(true);
    const query = (selector) => fragment.querySelector(selector);
    query(".weapon-name").textContent = weapon.name;
    query(".weapon-details").textContent =
      `Damage ${weapon.damage || "—"} • Range ${weapon.range || "—"} • AP ${weapon.ap ?? "—"} • ROF ${weapon.rof ?? "—"} • Weight ${wt(weapon.weight)} • Min Str ${weapon.minStr || "—"} • Cost ${weapon.costCents !== undefined ? money(weapon.costCents) : "—"}`;

    const fire = query(".fire-btn");
    const load = query(".load-btn");
    const reload = query(".reload-btn");
    const unload = query(".unload-btn");
    const remove = query(".remove-btn");
    const strengthInfo = getWeaponStrengthUsageInfo(
      character.weaponStrength,
      weapon,
    );
    const warning = query(".weapon-warning");
    warning.textContent = strengthInfo.message;
    warning.classList.toggle("hidden", !strengthInfo.message);

    if (isTrackedWeapon(weapon)) {
      const reserve = character.ammo[weapon.ammoType];
      const reserveCount = reserve?.count || 0;
      query(".loaded").textContent =
        `Loaded ${weapon.shotsLoaded} / ${weapon.shotsMax}`;
      query(".weapon-notes").textContent =
        `${reserve?.label || "Ammo"} reserve: ${reserveCount}.`;
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
    } else {
      query(".loaded").textContent = "No ammo";
      query(".weapon-notes").textContent =
        weapon.notes || "No ammunition tracking.";
      [fire, load, reload, unload].forEach(
        (button) => (button.disabled = true),
      );
    }

    remove.onclick = () => {
      if (isTrackedWeapon(weapon) && weapon.shotsLoaded > 0) {
        ensureAmmoReserve(weapon.ammoType);
        character.ammo[weapon.ammoType].count += weapon.shotsLoaded;
      }
      character.weapons = character.weapons.filter(
        (item) => item.id !== weapon.id,
      );
      render();
      save();
    };
    els.weaponList.appendChild(fragment);
  });
}

function renderAmmo() {
  els.ammoReserves.innerHTML = "";
  if (!Object.keys(character.ammo).length) {
    els.ammoReserves.innerHTML = emptyState("No ammo categories recorded.");
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      els.weaponAmmoTypeSelect.value,
    );
    return;
  }
  Object.entries(character.ammo).forEach(([key, ammo]) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${ammo.count}</strong><span>${esc(ammo.label)}</span></div><div class="controls"><button type="button">&minus;</button><button type="button">+</button><button class="delete-small" type="button" title="Remove ammo category">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      ammo.count = Math.max(0, ammo.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      ammo.count += 1;
      render();
      save();
    };
    buttons[2].onclick = () => removeAmmoCategory(key);
    els.ammoReserves.appendChild(row);
  });
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
    els.weaponAmmoTypeSelect.value,
  );
}

function removeAmmoCategory(key) {
  const ammo = character.ammo[key];
  if (!ammo) return;
  const linkedWeapons = character.weapons.filter(
    (weapon) => weapon.ammoType === key,
  );
  const linkedText = linkedWeapons.length
    ? `\n\nThis ammo is assigned to ${linkedWeapons.length} weapon(s): ${linkedWeapons
        .map((weapon) => weapon.name || "Unnamed weapon")
        .join(", ")}.\nRemoving it will clear ammo tracking for those weapons.`
    : "";
  if (!confirm(`Remove ammo category "${ammo.label || key}"?${linkedText}`))
    return;
  linkedWeapons.forEach((weapon) => {
    weapon.ammoType = null;
    weapon.shotsMax = null;
    weapon.shotsLoaded = null;
  });
  delete character.ammo[key];
  render();
  save();
}

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
  return new Set(character.powers.map((power) => power.catalogId).filter(Boolean));
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
  return powerCatalogEntries().filter((power) => {
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
  }).sort(
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
  const profile = hasPowerCatalog() ? getArcaneBackgroundProfile(character) : null;
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
  const profile = hasPowerCatalog() ? getArcaneBackgroundProfile(character) : null;
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
  if (missing) els.addRequiredPowerBtn.textContent = `Add Required Power: ${missing.name}`;
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

function renderConditions() {
  if (!els.conditionsList) return;
  els.conditionsList.innerHTML = "";
  Object.entries(character.conditions).forEach(([key, value]) => {
    const label = document.createElement("label");
    label.className = `condition${value ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${value ? "checked" : ""}><span>${esc(key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.conditionsList.appendChild(label);
  });
}

function counterList(container, items, unitFn, emptyText) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = emptyState(emptyText);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong>${unitFn(item)}</div><div class="controls"><button>&minus;</button><strong>${item.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      item.count = Math.max(0, item.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      item.count += 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      items.splice(items.indexOf(item), 1);
      render();
      save();
    };
    container.appendChild(row);
  });
}

function renderConsumables() {
  els.consumablesList.innerHTML = "";
  const consumables = character.consumables.filter((item) => item.count > 0);
  const hasMatches = consumables.some(
    (item) => item.id === "matches" || /^matches$/i.test(item.name || ""),
  );
  if (!consumables.length) {
    els.consumablesList.innerHTML = emptyState("No consumables tracked.");
  }

  consumables.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button><button class="delete-small" type="button">×</button></div>`;
    const input = row.querySelector("input");
    const [use, add, remove] = row.querySelectorAll("button");
    use.onclick = () => {
      const amount = clamp(
        Math.floor(Number(input.value) || 1),
        1,
        item.count,
      );
      consumeItem(character.consumables, item, amount);
      render();
      save();
    };
    add.onclick = () => {
      item.count += Math.max(1, Math.floor(Number(input.value) || 1));
      render();
      save();
    };
    remove.onclick = () => {
      character.consumables.splice(character.consumables.indexOf(item), 1);
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  });

  if (!hasMatches) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>Matches</strong><span>0 matches</span></div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of matches to add"><button type="button">Add</button></div>`;
    const input = row.querySelector("input");
    row.querySelector("button").onclick = () => {
      addConsumableCount(
        "matches",
        "Matches",
        "matches",
        Math.max(1, Math.floor(Number(input.value) || 1)),
      );
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  }
}

function renderInventory() {
  counterList(
    els.inventoryList,
    character.inventory,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Weight ${wt(item.weight)} each • Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No inventory tracked yet.",
  );
}

function renderVehicles() {
  counterList(
    els.vehicleList,
    character.vehicles,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No vehicles tracked yet.",
  );
}

function renderReminders() {
  const reminders = character.reminders.filter(
    (reminder) => reminder.type !== "Import Warning",
  );
  els.remindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No reminders recorded.");
}

function addInventory() {
  const catalogItem = chosen(GEAR_CATALOG, els.gearSelect.value);
  const name = els.inventoryNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const conversion = consumableConversionForGear(catalogItem);
  const unitsPerPackage = conversion?.unitsLabel
    ? Math.max(
        1,
        Math.floor(
          Number(els.inventoryUnitsInput.value) || conversion.multiplier || 1,
        ),
      )
    : conversion?.multiplier;
  const addedConsumable = addConsumableFromGear(
    catalogItem,
    count,
    unitsPerPackage,
  );
  if (addedConsumable) {
    els.gearSelect.value = "";
    els.inventoryNameInput.value = "";
    els.inventoryCountInput.value = "";
    els.inventoryUnitsInput.value = "";
    els.inventoryNoteInput.value = "";
    els.gearAddForm.classList.add("hidden");
    updatePreviews();
    render();
    save();
    return;
  }
  const id = catalogItem?.id || slugify(name);
  const existing = character.inventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.inventory.push({
      id,
      name,
      count,
      note: els.inventoryNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book,
    });
  els.gearSelect.value = "";
  els.inventoryNameInput.value = "";
  els.inventoryCountInput.value = "";
  els.inventoryUnitsInput.value = "";
  els.inventoryNoteInput.value = "";
  els.gearAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addVehicle() {
  const catalogItem = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  const name = els.vehicleNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(1, Math.floor(Number(els.vehicleQtyInput.value) || 1));
  const id = catalogItem?.id || slugify(name);
  const existing = character.vehicles.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.vehicles.push({
      id,
      name,
      count,
      note: els.vehicleNoteInput.value.trim(),
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
    });
  els.vehicleCatalogSelect.value = "";
  els.vehicleNameInput.value = "";
  els.vehicleQtyInput.value = "";
  els.vehicleNoteInput.value = "";
  els.vehicleAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addAmmo() {
  const catalogItem = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  const label = els.ammoLabelInput.value.trim() || catalogItem?.name;
  if (!label) return;
  const selectedCaliber = normalizeCaliber(els.ammoCaliberSelect.value);
  const exactKey = exactAmmoTypeForCatalogAmmo(catalogItem, selectedCaliber);
  const key = exactKey || catalogItem?.id || slugify(label);
  const count = Math.max(1, Math.floor(Number(els.ammoCountInput.value) || 1));
  if (character.ammo[key]) character.ammo[key].count += count;
  else
    character.ammo[key] = {
      label:
        AMMO_KIND_BY_CATALOG_ID[catalogItem?.id] && selectedCaliber
          ? ammoLabel(AMMO_KIND_BY_CATALOG_ID[catalogItem.id], selectedCaliber)
          : label,
      count,
      caliber: selectedCaliber || undefined,
      kind: AMMO_KIND_BY_CATALOG_ID[catalogItem?.id],
      note: els.ammoNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
    };
  els.ammoGearSelect.value = "";
  els.ammoLabelInput.value = "";
  els.ammoCountInput.value = "";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
  els.ammoNoteInput.value = "";
  els.ammoAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addArmor() {
  const catalogItem = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  const name = els.armorNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const id = catalogItem?.id || slugify(name);
  const existing = character.armorInventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  const count = Math.max(1, Math.floor(Number(els.armorCountInput.value) || 1));
  const armor = Math.max(
    0,
    Math.floor(Number(els.armorValueInput.value || catalogItem?.armor || 1)),
  );
  if (existing) {
    existing.count += count;
    existing.armor = armor;
    existing.location = els.armorLocationSelect.value;
    existing.equipped = true;
  } else {
    character.armorInventory.push({
      id,
      name,
      count,
      armor,
      location:
        els.armorLocationSelect.value || catalogItem?.location || "torso",
      equipped: true,
      weight: catalogItem?.weight,
      minStr: catalogItem?.minStr,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
      note: "Purchased armor.",
    });
  }
  els.armorCatalogSelect.value = "";
  els.armorNameInput.value = "";
  els.armorCountInput.value = "";
  els.armorValueInput.value = "";
  els.armorAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addWeapon() {
  const catalogItem = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  const name = els.weaponNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const quantity = Math.max(
    1,
    Math.floor(Number(els.weaponQtyInput.value) || 1),
  );
  const capacity = Math.max(
    0,
    Math.floor(Number(els.weaponCapacityInput.value) || 0),
  );
  const selectedAmmoType = capacity > 0 ? els.weaponAmmoTypeSelect.value : "";
  const ammoType = selectedAmmoType
    ? exactAmmoTypeForWeapon({ ...catalogItem, ammoType: selectedAmmoType })
    : "";
  if (ammoType) ensureAmmoReserve(ammoType);
  for (let index = 0; index < quantity; index += 1) {
    character.weapons.push({
      id: `${catalogItem?.id || slugify(name)}-${Date.now()}-${index}`,
      catalogId: catalogItem?.id,
      name,
      damage: els.weaponDamageInput.value.trim() || catalogItem?.damage || "—",
      range: els.weaponRangeInput.value.trim() || catalogItem?.range || "—",
      ap:
        els.weaponApInput.value === ""
          ? catalogItem?.ap || "—"
          : Number(els.weaponApInput.value),
      rof: els.weaponRofInput.value.trim() || catalogItem?.rof || "—",
      shotsMax: capacity && ammoType ? capacity : null,
      shotsLoaded: capacity && ammoType ? capacity : null,
      ammoType: capacity && ammoType ? ammoType : null,
      notes: catalogItem?.notes || "",
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      minStr: catalogItem?.minStr,
      book: catalogItem?.book || "Deadlands",
    });
  }
  els.weaponCatalogSelect.value = "";
  els.weaponNameInput.value = "";
  els.weaponQtyInput.value = "";
  els.weaponDamageInput.value = "";
  els.weaponRangeInput.value = "";
  els.weaponApInput.value = "";
  els.weaponRofInput.value = "";
  els.weaponCapacityInput.value = "";
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  els.weaponAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

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

function addCatalogPower(power = selectedCatalogPower(), options = {}) {
  if (!hasPowerCatalog() || !power) return;
  const warnings = getKnownPowerWarnings(character, power);
  const duplicate = character.powers.some(
    (known) => known.catalogId === power.id,
  );
  let marshalOverride = Boolean(els.powerMarshalOverrideInput?.checked);
  if (
    duplicate &&
    !marshalOverride &&
    !confirm(`${power.name} is already known. Add another copy anyway?`)
  )
    return;
  if (warnings.length && !marshalOverride) {
    const proceed = confirm(
      `${warnings.join("\n")}\n\nAdd anyway as a Marshal override?`,
    );
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

function addRequiredPower() {
  const missing = missingRequiredPower(getArcaneBackgroundProfile(character));
  if (missing) addCatalogPower(missing, { addedReason: "starting-power" });
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

function addManualPowerPoints() {
  if (powerPointResource()) return;
  const max = Math.max(
    0,
    Math.floor(Number(prompt("Maximum Power Points?", "15")) || 0),
  );
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

function setEntryWarning(element, warnings) {
  element.textContent = warnings.join(" ");
  element.classList.toggle("hidden", !warnings.length);
}

function applyEdgeCatalogSelection(edge) {
  els.edgeCatalogSelect.value = edge.catalogId || "";
  els.edgeNameInput.value = edge.name || "";
  selectKnownValue(els.edgeCategoryInput, edge.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge.rank, "Unknown");
  els.edgeSourceInput.value = edge.source || "Deadlands: The Weird West";
  els.edgeRequirementsInput.value = entryTextValue(edge.requirements);
  els.edgeSubchoiceInput.value = edge.subchoice || "";
  els.edgeSummaryInput.value = edge.shortSummary || edge.summary || "";
  els.edgeNotesInput.value = edge.notes || "";
  setEntryWarning(els.edgeWarningText, []);
}

function applyHindranceCatalogSelection(hindrance) {
  els.hindranceCatalogSelect.value = hindrance.catalogId || "";
  els.hindranceNameInput.value = hindrance.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance.severity, "Unknown");
  els.hindranceSourceInput.value =
    hindrance.source || "Deadlands: The Weird West";
  els.hindranceSummaryInput.value =
    hindrance.shortSummary || hindrance.summary || "";
  els.hindranceNotesInput.value = hindrance.notes || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function chooseEdgeCatalogEntry() {
  const entry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  if (!entry) return;
  applyEdgeCatalogSelection({ ...entry, catalogId: entry.id });
}

function chooseHindranceCatalogEntry() {
  const entry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  if (!entry) return;
  applyHindranceCatalogSelection({ ...entry, catalogId: entry.id });
}

function resetEdgeEditor(edge = null) {
  edgeEditingId = edge?.id || "";
  els.edgeEditorTitle.textContent = edge ? "Edit Edge" : "Add Edge";
  els.saveEdgeBtn.textContent = edge ? "Save Edge" : "Add Edge";
  els.edgeCatalogSelect.value = edge?.catalogId || "";
  els.edgeNameInput.value = edge?.name || "";
  selectKnownValue(els.edgeCategoryInput, edge?.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge?.rank, "Unknown");
  els.edgeSourceInput.value = edge?.source || "Manual";
  els.edgeRequirementsInput.value = entryTextValue(edge?.requirements);
  els.edgeSubchoiceInput.value = edge?.subchoice || "";
  els.edgeSummaryInput.value = edge?.shortSummary || edge?.summary || "";
  els.edgeNotesInput.value = edge?.notes || edge?.text || "";
  setEntryWarning(els.edgeWarningText, []);
}

function openEdgeEditor(edge = null) {
  resetEdgeEditor(edge);
  els.edgeEditorPanel.classList.remove("hidden");
  els.edgeNameInput.focus();
}

function closeEdgeEditor() {
  edgeEditingId = "";
  els.edgeEditorPanel.classList.add("hidden");
  setEntryWarning(els.edgeWarningText, []);
}

function edgeDraftFromForm() {
  const existing = character.edges.find((edge) => edge.id === edgeEditingId);
  const catalogEntry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  const id = edgeEditingId || uniqueEntryId(
    generateStableEntryId("edge", els.edgeNameInput.value.trim() || "edge"),
    new Set(character.edges.map((edge) => edge.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.edgeNameInput.value.trim(),
    type: "edge",
    category: els.edgeCategoryInput.value || "Unknown",
    rank: els.edgeRankInput.value || "Unknown",
    requirements: els.edgeRequirementsInput.value.trim(),
    shortSummary: els.edgeSummaryInput.value.trim(),
    notes: els.edgeNotesInput.value.trim(),
    source: els.edgeSourceInput.value.trim() || "Manual",
    subchoice: els.edgeSubchoiceInput.value.trim(),
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

function saveEdgeEditor() {
  const draft = edgeDraftFromForm();
  const warnings = getEdgeWarnings(character, draft, edgeEditingId);
  setEntryWarning(els.edgeWarningText, warnings);
  if (
    warnings.length &&
    !confirm(`${warnings.join("\n")}\n\nSave this Edge anyway?`)
  )
    return;
  upsertEdge(character, draft);
  closeEdgeEditor();
  render();
  save();
}

function resetHindranceEditor(hindrance = null) {
  hindranceEditingId = hindrance?.id || "";
  els.hindranceEditorTitle.textContent = hindrance
    ? "Edit Hindrance"
    : "Add Hindrance";
  els.saveHindranceBtn.textContent = hindrance
    ? "Save Hindrance"
    : "Add Hindrance";
  els.hindranceCatalogSelect.value = hindrance?.catalogId || "";
  els.hindranceNameInput.value = hindrance?.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance?.severity, "Unknown");
  els.hindranceSourceInput.value = hindrance?.source || "Manual";
  els.hindranceSummaryInput.value =
    hindrance?.shortSummary || hindrance?.summary || "";
  els.hindranceNotesInput.value = hindrance?.notes || hindrance?.text || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function openHindranceEditor(hindrance = null) {
  resetHindranceEditor(hindrance);
  els.hindranceEditorPanel.classList.remove("hidden");
  els.hindranceNameInput.focus();
}

function closeHindranceEditor() {
  hindranceEditingId = "";
  els.hindranceEditorPanel.classList.add("hidden");
  setEntryWarning(els.hindranceWarningText, []);
}

function hindranceDraftFromForm() {
  const existing = character.hindrances.find(
    (hindrance) => hindrance.id === hindranceEditingId,
  );
  const catalogEntry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  const id = hindranceEditingId || uniqueEntryId(
    generateStableEntryId(
      "hindrance",
      els.hindranceNameInput.value.trim() || "hindrance",
    ),
    new Set(character.hindrances.map((hindrance) => hindrance.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.hindranceNameInput.value.trim(),
    type: "hindrance",
    severity: els.hindranceSeverityInput.value || "Unknown",
    shortSummary: els.hindranceSummaryInput.value.trim(),
    notes: els.hindranceNotesInput.value.trim(),
    source: els.hindranceSourceInput.value.trim() || "Manual",
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

function saveHindranceEditor() {
  const draft = hindranceDraftFromForm();
  const warnings = getHindranceWarnings(character, draft, hindranceEditingId);
  setEntryWarning(els.hindranceWarningText, warnings);
  if (
    warnings.length &&
    !confirm(`${warnings.join("\n")}\n\nSave this Hindrance anyway?`)
  )
    return;
  upsertHindrance(character, draft);
  closeHindranceEditor();
  render();
  save();
}

function resetAdvanceEditor(advance = null) {
  const number = advance?.number || nextAdvanceNumber();
  const alreadyApplied = Boolean(advance?.applied);
  const existing = Boolean(advance);
  advanceEditingId = advance?.id || "";
  els.advanceEditorTitle.textContent = advance ? "Edit Advance" : "Add Advance";
  els.saveAdvanceBtn.textContent = advance ? "Save Advance" : "Add Advance";
  els.advanceNumberInput.value = number;
  selectKnownValue(
    els.advanceRankInput,
    advance?.rank || getAdvanceRankFromCount(Math.max(0, Number(number) - 1)),
    "Novice",
  );
  selectKnownValue(els.advanceTypeInput, advance?.type || "New Edge", "New Edge");
  els.advanceSummaryInput.value = advance?.summary || "";
  els.advanceTargetNameInput.value = advance?.targetName || "";
  selectKnownValue(
    els.advanceTargetTypeInput,
    advance?.targetType || targetTypeForAdvanceType(els.advanceTypeInput.value),
    "",
  );
  els.advancePowerPointAmountInput.value =
    advance?.powerPointAmount || (els.advanceTypeInput.value === "Power Points" ? 5 : "");
  els.advanceApplyInput.checked =
    !existing && isSupportedAppliedAdvance(els.advanceTypeInput.value);
  els.advanceApplyInput.disabled =
    alreadyApplied || !isSupportedAppliedAdvance(els.advanceTypeInput.value);
  els.advanceNotesInput.value = advance?.notes || "";
  selectKnownValue(
    els.advanceSourceInput,
    advance?.source || "advancement",
    "advancement",
  );
  [
    els.advanceNumberInput,
    els.advanceRankInput,
    els.advanceTypeInput,
    els.advanceTargetNameInput,
    els.advanceTargetTypeInput,
    els.advancePowerPointAmountInput,
  ].forEach((input) => {
    input.disabled = alreadyApplied;
  });
  els.advanceAppliedNote.textContent = alreadyApplied
    ? "This advance has already modified the character. V1 locks type, rank, target, and amount; summary, notes, and source remain editable."
    : "";
  els.advanceAppliedNote.classList.toggle("hidden", !alreadyApplied);
  setEntryWarning(els.advanceWarningText, []);
}

function openAdvanceEditor(advance = null) {
  resetAdvanceEditor(advance);
  els.advanceEditorPanel.classList.remove("hidden");
  els.advanceNumberInput.focus();
}

function closeAdvanceEditor() {
  advanceEditingId = "";
  els.advanceEditorPanel.classList.add("hidden");
  setEntryWarning(els.advanceWarningText, []);
}

function advanceDraftFromForm() {
  const existing = character.advances.find(
    (advance) => advance.id === advanceEditingId,
  );
  const number = Math.max(
    1,
    Math.floor(Number(els.advanceNumberInput.value) || nextAdvanceNumber()),
  );
  const type = els.advanceTypeInput.value || "";
  const targetName = els.advanceTargetNameInput.value.trim();
  const summary = els.advanceSummaryInput.value.trim();
  const id = advanceEditingId || uniqueEntryId(
    generateAdvanceId(number, type, targetName || summary),
    new Set(character.advances.map((advance) => advance.id)),
  );

  return {
    ...(existing || {}),
    id,
    number,
    rank: els.advanceRankInput.value || "",
    type,
    summary,
    targetName,
    targetType:
      els.advanceTargetTypeInput.value || targetTypeForAdvanceType(type),
    powerPointAmount: Math.max(
      1,
      Math.floor(Number(els.advancePowerPointAmountInput.value) || 5),
    ),
    notes: els.advanceNotesInput.value.trim(),
    dateAdded: existing?.dateAdded || new Date().toISOString(),
    source: els.advanceSourceInput.value || "manual",
  };
}

function saveAdvanceEditor() {
  const draft = advanceDraftFromForm();
  const warnings = advanceWarnings(character, draft, advanceEditingId);
  setEntryWarning(els.advanceWarningText, warnings);
  if (
    warnings.length &&
    !confirm(`${warnings.join("\n")}\n\nSave this advance anyway?`)
  )
    return;
  let savedAdvance = draft;
  if (els.advanceApplyInput.checked && !draft.applied) {
    try {
      savedAdvance = applyAdvanceToCharacter(draft);
    } catch (error) {
      setEntryWarning(els.advanceWarningText, [
        error?.message || "Could not apply this advance.",
      ]);
      return;
    }
  } else if (!draft.applied) {
    savedAdvance = {
      ...draft,
      applied: false,
      appliedByApp: false,
      appliedAt: "",
      appliedChanges: [],
    };
  }
  upsertAdvance(character, savedAdvance);
  closeAdvanceEditor();
  render();
  save();
}

function handleEntryAction(target) {
  const actionName = target.dataset.entryAction;
  const type = target.dataset.entryType;
  const id = target.dataset.entryId;
  if (type === "edge") {
    const edge = character.edges.find((item) => item.id === id);
    if (!edge) return;
    if (actionName === "edit") openEdgeEditor(edge);
    if (
      actionName === "remove" &&
      confirm(`Remove Edge "${edge.name || "Unnamed Edge"}"?`)
    ) {
      removeEdge(character, id);
      render();
      save();
    }
  }
  if (type === "hindrance") {
    const hindrance = character.hindrances.find((item) => item.id === id);
    if (!hindrance) return;
    if (actionName === "edit") openHindranceEditor(hindrance);
    if (
      actionName === "remove" &&
      confirm(`Remove Hindrance "${hindrance.name || "Unnamed Hindrance"}"?`)
    ) {
      removeHindrance(character, id);
      render();
      save();
    }
  }
  if (type === "advancement") {
    const advance = character.advances.find((item) => item.id === id);
    if (!advance) return;
    if (actionName === "edit") openAdvanceEditor(advance);
    if (actionName === "remove") removeAdvanceWithPrompt(advance);
  }
}

function removeAdvanceWithPrompt(advance) {
  const label = `Advance #${advance.number || "?"}`;
  const changes = Array.isArray(advance.appliedChanges)
    ? advance.appliedChanges
    : [];

  if (!advance.applied || !changes.length) {
    const note =
      advance.applied && !changes.length
        ? "\n\nThis advance has no reliable appliedChanges data, so only the history record can be removed."
        : "";
    if (!confirm(`Remove ${label}?${note}`)) return;
    removeAdvance(character, advance.id);
    render();
    save();
    return;
  }

  const undoPlan = getAdvanceUndoPlan(advance);
  if (!undoPlan.safe) {
    alert(
      `Applied changes cannot be safely undone.\n\n${undoPlan.messages.join("\n")}`,
    );
    if (!confirm(`Remove ${label} history only?`)) return;
    removeAdvance(character, advance.id);
    render();
    save();
    return;
  }

  const choice = prompt(
    `Remove ${label}?\n\nType "undo" to remove the advance and undo applied changes.\nType "remove" to remove only the advance history.\nLeave blank to cancel.\n\n${undoPlan.messages.join("\n")}`,
    "remove",
  );
  if (!choice) return;
  const normalizedChoice = choice.trim().toLowerCase();
  if (normalizedChoice === "undo") undoAdvanceChanges(advance);
  else if (normalizedChoice !== "remove") return;
  removeAdvance(character, advance.id);
  render();
  save();
}

function updateHucksterDealField(field, value) {
  if (!character.hucksterDeal) character.hucksterDeal = makeHucksterDeal();
  character.hucksterDeal[field] = value;
  character.hucksterDeal = normalizeHucksterDeal(character.hucksterDeal);
  save();
}

function action(type) {
  switch (type) {
    case "incWounds":
      character.damage.wounds = clamp(
        character.damage.wounds + 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "decWounds":
      character.damage.wounds = clamp(
        character.damage.wounds - 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "incFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue + 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "decFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue - 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "incBennies":
      character.bennies.current += 1;
      break;
    case "decBennies":
      character.bennies.current = Math.max(0, character.bennies.current - 1);
      break;
    case "incConviction":
      character.conviction += 1;
      break;
    case "decConviction":
      character.conviction = Math.max(0, character.conviction - 1);
      break;
    default:
      return;
  }
  render();
  save();
}

function exportJson(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJsonText(text) {
  const data = JSON.parse(text);
  if (data.activeCharacter) {
    character = normalize(data.activeCharacter);
    if (data.creationDraft) {
      creationDraft = normalizeDraft(data.creationDraft);
      saveCreationDraft();
    }
  } else if (data.creationDraft) {
    creationDraft = normalizeDraft(data.creationDraft);
    saveCreationDraft();
    setCreatorMode(true);
  } else {
    character = isSavagedUsExport(data) ? fromSavagedUs(data) : normalize(data);
  }
  render();
  save();
}

function alertInvalidImport() {
  alert(
    "That was not valid tracker, full app state, creation draft, or Savaged.us character JSON.",
  );
}

function closeHeaderMenu() {
  els.headerToolsMenu.open = false;
}

document.addEventListener("click", (event) => {
  if (event.target?.dataset?.action) action(event.target.dataset.action);
  const entryAction = event.target?.closest?.("[data-entry-action]");
  if (entryAction) handleEntryAction(entryAction);
  if (event.target?.dataset?.toggleForm) {
    const form = document.getElementById(event.target.dataset.toggleForm);
    form?.classList.toggle("hidden");
  }
  if (event.target?.closest?.(".header-actions button")) closeHeaderMenu();
  if (!event.target?.closest?.(".header-tools")) closeHeaderMenu();
});

els.armorSelect.onchange = () => {
  character.selectedArmorLocation = els.armorSelect.value;
  render();
  save();
};
els.addMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents += centsValue;
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.spendMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents = Math.max(0, character.moneyCents - centsValue);
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.addInventoryBtn.onclick = addInventory;
els.cancelInventoryAddBtn.onclick = () => {
  els.inventoryUnitsInput.value = "";
  updatePreviews();
  els.gearAddForm.classList.add("hidden");
};
els.addVehicleBtn.onclick = addVehicle;
els.cancelVehicleAddBtn.onclick = () => {
  els.vehicleAddForm.classList.add("hidden");
};
els.addAmmoBtn.onclick = addAmmo;
els.cancelAmmoAddBtn.onclick = () => {
  els.ammoAddForm.classList.add("hidden");
};
els.addArmorBtn.onclick = addArmor;
els.cancelArmorAddBtn.onclick = () => {
  els.armorAddForm.classList.add("hidden");
};
els.addWeaponBtn.onclick = addWeapon;
els.cancelWeaponAddBtn.onclick = () => {
  els.weaponAddForm.classList.add("hidden");
};
els.addPowerBtn.onclick = addPower;
if (els.addCatalogPowerBtn) els.addCatalogPowerBtn.onclick = () => addCatalogPower();
if (els.addRequiredPowerBtn) els.addRequiredPowerBtn.onclick = addRequiredPower;
[
  els.powerCatalogSearch,
  els.powerRankFilter,
  els.powerValidOnlyInput,
  els.powerCatalogSelect,
].filter(Boolean).forEach((input) => {
  input.oninput = renderPowerCatalogPicker;
  input.onchange = renderPowerCatalogPicker;
});
els.addManualPowerPointsBtn.onclick = addManualPowerPoints;
els.showEdgeFormBtn.onclick = () => openEdgeEditor();
els.edgeCatalogSelect.onchange = chooseEdgeCatalogEntry;
els.saveEdgeBtn.onclick = saveEdgeEditor;
els.cancelEdgeEditBtn.onclick = closeEdgeEditor;
els.showHindranceFormBtn.onclick = () => openHindranceEditor();
els.hindranceCatalogSelect.onchange = chooseHindranceCatalogEntry;
els.saveHindranceBtn.onclick = saveHindranceEditor;
els.cancelHindranceEditBtn.onclick = closeHindranceEditor;
els.showAdvanceFormBtn.onclick = () => openAdvanceEditor();
els.advanceTypeInput.onchange = () => {
  const type = els.advanceTypeInput.value;
  els.advanceTargetTypeInput.value = targetTypeForAdvanceType(type);
  els.advanceApplyInput.disabled = !isSupportedAppliedAdvance(type);
  els.advanceApplyInput.checked = isSupportedAppliedAdvance(type);
  if (type === "Power Points" && !els.advancePowerPointAmountInput.value)
    els.advancePowerPointAmountInput.value = 5;
};
els.saveAdvanceBtn.onclick = saveAdvanceEditor;
els.cancelAdvanceEditBtn.onclick = closeAdvanceEditor;
[
  els.gearSelect,
  els.ammoGearSelect,
  els.ammoCaliberSelect,
  els.armorCatalogSelect,
  els.weaponCatalogSelect,
  els.vehicleCatalogSelect,
].forEach((select) => {
  select.onchange = updatePreviews;
});
[els.inventoryCountInput, els.inventoryUnitsInput].forEach((input) => {
  input.oninput = updatePreviews;
});
els.notesArea.oninput = () => {
  character.notes = els.notesArea.value;
  save();
};
els.clearTempConditionsBtn.onclick = () => {
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
[
  ["hucksterSelectedPower", "selectedPower", "text"],
  ["hucksterRequiredPowerPoints", "requiredPowerPoints", "number"],
  ["hucksterGamblingRollResult", "gamblingRollResult", "text"],
  ["hucksterCardsDrawn", "cardsDrawn", "number"],
  ["hucksterPokerHand", "pokerHand", "text"],
  ["hucksterTemporaryPowerPoints", "temporaryPowerPoints", "number"],
  ["hucksterShortagePenalty", "shortagePenalty", "number"],
  ["hucksterLeftoverPowerPoints", "leftoverPowerPoints", "number"],
  ["hucksterNotes", "notes", "text"],
].forEach(([elementKey, field, type]) => {
  els[elementKey].oninput = () => {
    const raw = els[elementKey].value;
    updateHucksterDealField(
      field,
      type === "number" ? Math.max(0, Math.floor(Number(raw) || 0)) : raw,
    );
  };
});
[
  ["hucksterAnteBennySpent", "anteBennySpent"],
  ["hucksterUsedJoker", "usedJoker"],
  ["hucksterBackfireTriggered", "backfireTriggered"],
].forEach(([elementKey, field]) => {
  els[elementKey].onchange = () => {
    updateHucksterDealField(field, els[elementKey].checked);
  };
});
els.newSessionBtn.onclick = () => {
  if (
    !confirm(
      "Start a new play session? This resets bennies to starting, clears conviction, refills resources, and clears temporary conditions.",
    )
  )
    return;
  character.bennies.current = character.bennies.starting;
  character.conviction = 0;
  character.resources.forEach((resource) => (resource.current = resource.max));
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
els.resetBtn.onclick = () => {
  if (confirm("Reset tracker to defaults?")) {
    character = normalize(clone(defaultCharacter));
    localStorage.removeItem(STORAGE_KEY);
    render();
    save();
  }
};
els.exportBtn.onclick = () => {
  exportJson(
    `${slugify(character.name || "character")}-tracker.json`,
    character,
  );
};
els.importFile.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importJsonText(reader.result);
      els.importFile.value = "";
      closeHeaderMenu();
    } catch {
      alertInvalidImport();
    }
  };
  reader.readAsText(file);
};
els.pasteImportBtn.onclick = () => {
  els.pasteImportPanel.classList.toggle("hidden");
  if (!els.pasteImportPanel.classList.contains("hidden"))
    els.importJsonText.focus();
};
els.cancelPasteImportBtn.onclick = () => {
  els.importJsonText.value = "";
  els.pasteImportPanel.classList.add("hidden");
};
els.confirmPasteImportBtn.onclick = () => {
  try {
    importJsonText(els.importJsonText.value.trim());
    els.importJsonText.value = "";
    els.pasteImportPanel.classList.add("hidden");
  } catch {
    alertInvalidImport();
  }
};
