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
const DEADLANDS_SKILL_LINKED_ATTRIBUTES = {
  Academics: "Smarts",
  Athletics: "Agility",
  Battle: "Smarts",
  Boating: "Agility",
  "Common Knowledge": "Smarts",
  Driving: "Agility",
  Faith: "Spirit",
  Fighting: "Agility",
  Focus: "Spirit",
  Gambling: "Smarts",
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
  Trade: "Smarts",
  "Weird Science": "Smarts",
};
const SKILL_LINKED_ATTRIBUTES = DEADLANDS_SKILL_LINKED_ATTRIBUTES;

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
