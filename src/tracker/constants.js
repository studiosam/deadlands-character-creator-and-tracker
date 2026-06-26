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
const CANONICAL_ADVANCE_TYPE_LABELS = {
  "edge-gain": "New Edge",
  "skill-increase": "Increase Skill",
  "two-skills-increase": "Increase Two Skills",
  "attribute-increase": "Increase Attribute",
  "power-gain": "New Powers",
  "power-points-increase": "Power Points",
  "gm-exception": "Other / Marshal-approved",
  "manual-history": "Other / Marshal-approved",
  "imported-history": "Imported History",
};
const LEGACY_ADVANCE_TYPE_MAP = {
  "New Edge": "edge-gain",
  "Increase Skill": "skill-increase",
  "Increase Two Skills": "two-skills-increase",
  "Increase Attribute": "attribute-increase",
  "New Powers": "power-gain",
  "Power Points": "power-points-increase",
};
const CANONICAL_ADVANCE_APPLY_TYPES = [
  "edge-gain",
  "skill-increase",
  "two-skills-increase",
  "attribute-increase",
  "power-gain",
  "power-points-increase",
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

const ATTRIBUTE_USE_NOTES = {
  agility:
    "Coordination, reflexes, balance, fine motor control, and most physical precision tasks.",
  smarts:
    "Reasoning, memory, education, perception, research, and most knowledge or craft skills.",
  spirit:
    "Willpower, courage, faith, social presence, and resisting fear, intimidation, or despair.",
  strength:
    "Raw muscle, lifting, carrying, melee damage, grappling force, and meeting gear strength requirements.",
  vigor:
    "Health, stamina, toughness, resisting poison, disease, fatigue, and surviving physical punishment.",
};

const SKILL_USE_NOTES = {
  Academics:
    "Formal education, history, law, literature, theology, and other scholarly knowledge.",
  Athletics:
    "Climbing, jumping, swimming, throwing, running stunts, and other active movement.",
  Battle:
    "Tactics, command decisions, reading battlefields, and coordinating troops or posses.",
  Boating:
    "Handling boats, rafts, ferries, river travel, and hazards on the water.",
  "Common Knowledge":
    "Everyday facts, local customs, rumors, practical judgment, and general know-how.",
  Driving:
    "Operating wagons, coaches, carts, steam vehicles, and other ground vehicles.",
  Faith:
    "Calling on divine power for Blessed or similar Arcane Backgrounds.",
  Fighting:
    "Melee attacks, close combat defense, brawling, blades, clubs, and other hand-to-hand violence.",
  Focus:
    "Channeling inner discipline for Chi Master or similar Arcane Backgrounds.",
  Gambling:
    "Cards, dice, odds, reading bets, cheating, and Huckster Deal with the Devil rolls.",
  Healing:
    "Treating wounds, stabilizing allies, diagnosing illness, and practical frontier medicine.",
  Intimidation:
    "Threats, pressure, fear, hard stares, and forcing someone to back down.",
  Language:
    "Speaking, reading, or understanding a specific language beyond default fluency.",
  Notice:
    "Spotting ambushes, clues, hidden details, sounds, tracks, and sudden danger.",
  Occult:
    "Supernatural lore, rituals, monsters, ghost-rock weirdness, and forbidden knowledge.",
  Performance:
    "Singing, acting, storytelling, preaching, showmanship, and holding a crowd.",
  Persuasion:
    "Friendly influence, negotiation, diplomacy, bargaining, and winning trust.",
  Piloting:
    "Operating flying machines and other aircraft when the setting allows them.",
  Psionics:
    "Using psychic powers for characters with a psionic Arcane Background.",
  Repair:
    "Fixing, maintaining, disabling, or jury-rigging devices, weapons, and machinery.",
  Research:
    "Digging through records, books, newspapers, archives, and other information sources.",
  Riding:
    "Handling horses and mounts, staying mounted, racing, and mounted maneuvers.",
  Science:
    "Scientific theory, experiments, chemistry, engineering principles, and technical analysis.",
  Shooting:
    "Ranged attacks with guns, bows, and similar weapons when the rules call for Shooting.",
  Spellcasting:
    "Casting arcane spells for Hucksters or other spellcasting Arcane Backgrounds.",
  Stealth:
    "Sneaking, hiding, moving quietly, shadowing targets, and avoiding attention.",
  Survival:
    "Tracking, foraging, finding shelter, navigating wilderness, and enduring the trail.",
  Taunt:
    "Verbal jabs, mockery, baiting foes, and distracting someone through ridicule.",
  Thievery:
    "Picking locks, palming objects, disarming traps, sleight of hand, and burglary.",
  Trade:
    "A chosen practical profession, craft, or job specialty not covered by another skill.",
  "Weird Science":
    "Building, activating, and managing mad science devices and infernal inventions.",
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
