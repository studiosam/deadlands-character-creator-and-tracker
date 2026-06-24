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
const SKILL_LINKED_ATTRIBUTES = {
  Academics: "Smarts",
  Athletics: "Agility",
  Battle: "Smarts",
  Boating: "Agility",
  "Common Knowledge": "Smarts",
  Driving: "Agility",
  Electronics: "Smarts",
  Faith: "Spirit",
  Fighting: "Agility",
  Focus: "Spirit",
  Gambling: "Smarts",
  Hacking: "Smarts",
  Healing: "Smarts",
  Intimidation: "Spirit",
  Language: "Smarts",
  Notice: "Smarts",
  Occult: "Smarts",
  Performance: "Spirit",
  Persuasion: "Spirit",
  Piloting: "Agility",
  Psionics: "Smarts",
  Repair: "Smarts",
  Research: "Smarts",
  Riding: "Agility",
  Science: "Smarts",
  Shooting: "Agility",
  Spellcasting: "Smarts",
  Stealth: "Agility",
  Survival: "Smarts",
  Taunt: "Smarts",
  Thievery: "Agility",
  "Weird Science": "Smarts",
};

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
let advancePowerTargetIds = [];
let advanceManualEdgeMode = false;

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
  advanceDynamicFields: $("#advanceDynamicFields"),
  advanceSummaryInput: $("#advanceSummaryInput"),
  advanceSummaryField: $("#advanceSummaryField"),
  advanceTargetNameInput: $("#advanceTargetNameInput"),
  advanceTargetNameField: $("#advanceTargetNameField"),
  advanceTargetTypeInput: $("#advanceTargetTypeInput"),
  advanceTargetTypeField: $("#advanceTargetTypeField"),
  advanceNotesInput: $("#advanceNotesInput"),
  advanceSourceInput: $("#advanceSourceInput"),
  advancePowerPointAmountInput: $("#advancePowerPointAmountInput"),
  advancePowerPointAmountField: $("#advancePowerPointAmountField"),
  showAdvanceNotesBtn: $("#showAdvanceNotesBtn"),
  advanceNotesField: $("#advanceNotesField"),
  advanceApplyPanel: $("#advanceApplyPanel"),
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

function getDieStepIndex(value) {
  const text = String(value || "").trim().toLowerCase();
  return DIE_STEPS.indexOf(text);
}

function compareDieSteps(left, right) {
  return getDieStepIndex(left) - getDieStepIndex(right);
}

function getNextDieStep(value) {
  const index = getDieStepIndex(value);
  if (index < 0) return "";
  return DIE_STEPS[Math.min(index + 1, DIE_STEPS.length - 1)];
}

function getLinkedAttributeForSkill(skillName) {
  const skill = findSkillByName(skillName);
  const linked = skill?.linkedAttribute || skill?.attribute || "";
  if (linked) return displayNameFromKey(plainEntryName(linked));
  const text = plainEntryName(skillName);
  const match = Object.entries(SKILL_LINKED_ATTRIBUTES).find(
    ([name]) => plainEntryName(name) === text,
  );
  return match?.[1] || "";
}

function getAttributeDie(currentCharacter, attributeName) {
  const text = plainEntryName(attributeName);
  const key = ATTRIBUTE_ORDER.find(
    (attribute) => attribute === text || plainEntryName(displayNameFromKey(attribute)) === text,
  );
  return key ? currentCharacter.attributes?.[key] || "d4" : "";
}

function getSkillDie(currentCharacter, skillName) {
  const text = plainEntryName(skillName);
  const skill = (currentCharacter.skills || []).find(
    (item) => plainEntryName(item.name) === text,
  );
  return skill?.die || skill?.value || "";
}

function canUseSingleSkillAdvance(currentCharacter, skillName) {
  const skillDie = getSkillDie(currentCharacter, skillName);
  const linkedAttribute = getLinkedAttributeForSkill(skillName);
  const attributeDie = getAttributeDie(currentCharacter, linkedAttribute);
  const skillIndex = getDieStepIndex(skillDie);
  const attributeIndex = getDieStepIndex(attributeDie);
  return {
    ok:
      skillIndex >= 0 &&
      attributeIndex >= 0 &&
      skillIndex < DIE_STEPS.length - 1 &&
      skillIndex >= attributeIndex,
    skillDie,
    linkedAttribute,
    attributeDie,
    reason:
      skillIndex === DIE_STEPS.length - 1
        ? "This skill is already at d12."
        : skillIndex >= 0 && attributeIndex >= 0 && skillIndex < attributeIndex
          ? "This skill is below its linked attribute, so use Increase Two Skills instead."
          : "",
  };
}

function canUseTwoSkillAdvance(currentCharacter, skillName) {
  const skillDie = getSkillDie(currentCharacter, skillName);
  const linkedAttribute = getLinkedAttributeForSkill(skillName);
  const attributeDie = getAttributeDie(currentCharacter, linkedAttribute);
  const skillIndex = getDieStepIndex(skillDie);
  const attributeIndex = getDieStepIndex(attributeDie);
  return {
    ok:
      skillIndex >= 0 &&
      attributeIndex >= 0 &&
      skillIndex < DIE_STEPS.length - 1 &&
      skillIndex < attributeIndex,
    skillDie,
    linkedAttribute,
    attributeDie,
    reason:
      skillIndex === DIE_STEPS.length - 1
        ? "This skill is already at d12."
        : skillIndex >= 0 && attributeIndex >= 0 && skillIndex >= attributeIndex
          ? `This skill is not below ${linkedAttribute} ${attributeDie}.`
          : "",
  };
}

function isSupportedAppliedAdvance(type) {
  return ADVANCE_APPLY_TYPES.includes(type);
}

function normalizeAdvanceTarget(target) {
  const source = target && typeof target === "object" ? target : {};
  const amount =
    source.amount === undefined || source.amount === ""
      ? undefined
      : Math.max(1, Math.floor(Number(source.amount) || 1));
  return {
    ...source,
    targetType: source.targetType || "",
    targetName: source.targetName || source.name || "",
    targetId: source.targetId || source.id || "",
    catalogId: source.catalogId || "",
    before: source.before || "",
    after: source.after || "",
    ...(amount === undefined ? {} : { amount }),
  };
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
  const targets = Array.isArray(raw.targets)
    ? raw.targets.map(normalizeAdvanceTarget)
    : [];

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
    targets,
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
  const targets = Array.isArray(advance.targets) ? advance.targets : [];
  if (targets.length) {
    const names = targets.map((target) => target.targetName).filter(Boolean);
    if (names.length) return `${compactText(advance.type, "Advance")}: ${names.join(", ")}`;
  }
  const target = compactText(advance.targetName, "");
  if (target) return `${compactText(advance.type, "Advance")}: ${target}`;
  if (advance.type === "Power Points") return "Power Points: +5 Power Points";
  return compactText(advance.type, "Advance recorded");
}

function advanceWarnings(currentCharacter, advance, editingId = "") {
  const warnings = [];
  const type = compactText(advance.type, "");
  if (!type) warnings.push("Advance type is missing.");
  const targets = Array.isArray(advance.targets) ? advance.targets : [];

  const needsTarget = [
    "New Edge",
    "Increase Skill",
    "Increase Two Skills",
    "Increase Attribute",
    "New Powers",
    "Power Points",
  ].includes(type);
  if (needsTarget && !compactText(advance.targetName, "") && !targets.length)
    warnings.push("Target name is missing for this advance type.");
  if (
    (type === "Increase Skill" || type === "Increase Two Skills") &&
    targets.some((target) => target.before === "d12" || target.after === "d12" && target.before === target.after)
  )
    warnings.push("Selected skill is already at d12 and cannot increase.");
  if (type === "Increase Skill" && targets[0]?.targetName) {
    const check = canUseSingleSkillAdvance(currentCharacter, targets[0].targetName);
    if (!check.ok) warnings.push(check.reason || "Selected skill cannot use Increase Skill.");
  }
  if (type === "Increase Two Skills") {
    const names = targets.map((target) => plainEntryName(target.targetName)).filter(Boolean);
    if (names.length === 2 && names[0] === names[1])
      warnings.push("Select two different skills.");
    targets.forEach((target) => {
      if (!target.targetName) return;
      const check = canUseTwoSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          `${target.targetName} cannot be selected for Increase Two Skills because ${check.reason || "it is not eligible"}`,
        );
    });
  }
  if (
    type === "Increase Attribute" &&
    targets.some((target) => target.before === "d12" || target.after === target.before)
  )
    warnings.push("Selected attribute is already at d12 and cannot increase.");

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

function getAdvanceApplicationWarnings(currentCharacter, advance) {
  if (!isSupportedAppliedAdvance(advance.type)) return [];
  const targets = advanceTargetsForLegacy(advance);
  const warnings = [];

  if (advance.type === "New Edge" && !targets[0]?.targetName)
    warnings.push("Select an Edge before applying.");
  if (advance.type === "New Powers" && !targets.length)
    warnings.push("Select at least one power before applying.");
  if (advance.type === "Power Points" && parsePowerPointAdvanceAmount(advance) < 1)
    warnings.push("Power Point increase must be at least 1.");
  if (advance.type === "Increase Skill") {
    const target = targets[0];
    if (!target?.targetName) warnings.push("Select a skill before applying.");
    else {
      const check = canUseSingleSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          check.reason || "This skill is not eligible for Increase Skill.",
        );
    }
  }
  if (advance.type === "Increase Two Skills") {
    if (targets.length !== 2) warnings.push("Select two skills before applying.");
    const names = targets.map((target) => plainEntryName(target.targetName)).filter(Boolean);
    if (names.length === 2 && names[0] === names[1])
      warnings.push("Select two different skills.");
    targets.forEach((target) => {
      if (!target.targetName) return;
      const check = canUseTwoSkillAdvance(currentCharacter, target.targetName);
      if (!check.ok)
        warnings.push(
          `${target.targetName} cannot be selected for Increase Two Skills because ${check.reason || "it is not eligible"}`,
        );
    });
  }
  if (advance.type === "Increase Attribute") {
    const target = targets[0];
    if (!target?.targetName) warnings.push("Select an attribute before applying.");
    else if (target.before === "d12" || target.after === target.before)
      warnings.push("Selected attribute is already at d12 and cannot increase.");
  }
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
  const structuredAmount = (advance.targets || []).find(
    (target) => target.targetType === "power-points" && target.amount,
  )?.amount;
  const match = `${advance.targetName || ""} ${advance.summary || ""} ${advance.notes || ""}`.match(
    /[+]?(\d+)/,
  );
  return Math.max(
    1,
    Math.floor(Number(advance.powerPointAmount || structuredAmount || match?.[1] || 5)),
  );
}

function skillValue(skill) {
  return skill?.die || skill?.value || "";
}

function skillTargetForName(name) {
  const skill = findSkillByName(name);
  const before = skillValue(skill);
  const after = before ? getNextDieStep(before) : "d4";
  const linkedAttribute = getLinkedAttributeForSkill(name);
  const linkedAttributeDie = getAttributeDie(character, linkedAttribute);
  const single = canUseSingleSkillAdvance(character, name);
  const two = canUseTwoSkillAdvance(character, name);
  return {
    targetType: "skill",
    targetName: name,
    targetId: slugify(name),
    before,
    after,
    linkedAttribute,
    linkedAttributeDie,
    eligibleForSingleSkillAdvance: single.ok,
    eligibleForTwoSkillAdvance: two.ok,
  };
}

function attributeTargetForKey(attributeKey) {
  const before = character.attributes?.[attributeKey] || "d4";
  return {
    targetType: "attribute",
    targetName: displayNameFromKey(attributeKey),
    targetId: attributeKey,
    before,
    after: getNextDieStep(before),
  };
}

function advanceTargetsForLegacy(advance) {
  const type = advance.type;
  if (Array.isArray(advance.targets) && advance.targets.length)
    return advance.targets;
  if (type === "New Edge" && advance.targetName) {
    return [
      {
        targetType: "edge",
        targetName: advance.targetName,
        targetId: advance.targetId || advance.catalogId || "",
        catalogId: advance.catalogId || "",
      },
    ];
  }
  if ((type === "Increase Skill" || type === "Increase Two Skills") && advance.targetName) {
    return splitAdvanceTargets(advance.targetName).map(skillTargetForName);
  }
  if (type === "Increase Attribute" && advance.targetName) {
    const key = normalizeAttributeKey(advance.targetName);
    return key ? [attributeTargetForKey(key)] : [];
  }
  if (type === "New Powers" && advance.targetName) {
    return splitAdvanceTargets(advance.targetName).map((name) => {
      const catalogEntry = findPowerCatalogEntryByLooseName(name);
      return {
        targetType: "power",
        targetName: catalogEntry?.name || name,
        targetId: catalogEntry?.id || slugify(name),
        catalogId: catalogEntry?.id || "",
      };
    });
  }
  if (type === "Power Points") {
    return [
      {
        targetType: "power-points",
        targetName: "Power Points",
        amount: parsePowerPointAdvanceAmount(advance),
      },
    ];
  }
  return [];
}

function createAdvanceEdge(advance, target = null) {
  const catalogEntry =
    chosen(EDGE_CATALOG, target?.catalogId || target?.targetId || advance.catalogId) ||
    findEdgeCatalogEntryByName(target?.targetName || advance.targetName);
  const name = target?.targetName || advance.targetName || catalogEntry?.name;
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

function createAdvancePower(advance, name, target = null) {
  const catalogEntry =
    ((target?.catalogId || target?.targetId || advance.catalogId) && typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById(target?.catalogId || target?.targetId || advance.catalogId)
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

function increaseSkillForAdvance(advance, skillTarget) {
  const skillName =
    typeof skillTarget === "string" ? skillTarget : skillTarget?.targetName;
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

function increaseAttributeForAdvance(attributeTarget) {
  const attributeName =
    typeof attributeTarget === "string"
      ? attributeTarget
      : attributeTarget?.targetId || attributeTarget?.targetName;
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
  const targets = advanceTargetsForLegacy(normalized);
  const applicationWarnings = getAdvanceApplicationWarnings(character, normalized);
  if (applicationWarnings.length) throw new Error(applicationWarnings.join(" "));
  const changes = [];

  if (normalized.type === "New Edge") {
    changes.push(createAdvanceEdge(normalized, targets[0]));
  } else if (normalized.type === "New Powers") {
    if (!targets.length) throw new Error("At least one power name is required.");
    targets.forEach((target) =>
      changes.push(createAdvancePower(normalized, target.targetName, target)),
    );
  } else if (normalized.type === "Power Points") {
    changes.push(increasePowerPointsForAdvance(normalized));
  } else if (normalized.type === "Increase Skill") {
    changes.push(increaseSkillForAdvance(normalized, targets[0] || normalized.targetName));
  } else if (normalized.type === "Increase Two Skills") {
    if (targets.length !== 2)
      throw new Error("Select exactly two skills.");
    const names = targets.map((target) => plainEntryName(target.targetName));
    if (names[0] && names[0] === names[1])
      throw new Error("Select two different skills.");
    const invalid = targets
      .map((target) => findSkillByName(target.targetName))
      .filter((skill) => skill && getNextDieStep(skill.die || skill.value) === (skill.die || skill.value));
    if (invalid.length)
      throw new Error(`${invalid.map((skill) => skill.name).join(", ")} cannot increase further.`);
    targets.forEach((target) => changes.push(increaseSkillForAdvance(normalized, target)));
  } else if (normalized.type === "Increase Attribute") {
    changes.push(increaseAttributeForAdvance(targets[0] || normalized.targetName));
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
