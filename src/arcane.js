const ARCANE_BACKGROUNDS = {
  blessed: {
    key: "blessed",
    edgeName: "Arcane Background: Blessed",
    displayName: "Blessed",
    requirementsText: "Novice, Spirit d6+, Faith d4+",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d6" },
      skills: { Faith: "d4" },
    },
    arcaneSkill: "Faith",
    linkedAttribute: "Spirit",
    startingPowersCount: 3,
    fixedStartingPowers: ["holy symbol"],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Miracles",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Track sins, vows, or belief violations as reminders, not automated penalties.",
      "Do not infer Blessed from religious profession text alone.",
    ],
  },
  chiMaster: {
    key: "chiMaster",
    edgeName: "Arcane Background: Chi Master",
    displayName: "Chi Master",
    requirementsText:
      "Novice, Agility d6+, Spirit d6+, Martial Artist, Focus d4+",
    requirements: {
      rank: "Novice",
      attributes: { agility: "d6", spirit: "d6" },
      edges: ["Martial Artist"],
      skills: { Focus: "d4" },
    },
    arcaneSkill: "Focus",
    linkedAttribute: "Spirit",
    startingPowersCount: 3,
    fixedStartingPowers: ["deflection"],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Gifted",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Beneficial powers are usually self-focused.",
      "Detrimental powers may need touch-range handling.",
    ],
  },
  huckster: {
    key: "huckster",
    edgeName: "Arcane Background: Huckster",
    displayName: "Huckster",
    requirementsText: "Novice, Gambling d6+, Spellcasting d4+",
    requirements: {
      rank: "Novice",
      skills: { Gambling: "d6", Spellcasting: "d4" },
    },
    arcaneSkill: "Spellcasting",
    linkedAttribute: "Smarts",
    startingPowersCount: 3,
    fixedStartingPowers: [],
    playerChoicePowers: 3,
    startingPowerPoints: 10,
    edgeFamily: "Magic",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Keep Dealing with the Devil temporary points separate from normal Power Points.",
      "Hucksters cannot use normal Shorting or Benny-for-Power-Points flow.",
    ],
  },
  madScientist: {
    key: "madScientist",
    edgeName: "Arcane Background: Mad Scientist",
    displayName: "Mad Scientist",
    requirementsText: "Novice, Smarts d8+, Science d6+, Weird Science d4+",
    requirements: {
      rank: "Novice",
      attributes: { smarts: "d8" },
      skills: { Science: "d6", "Weird Science": "d4" },
    },
    arcaneSkill: "Weird Science",
    linkedAttribute: "Smarts",
    startingPowersCount: 2,
    fixedStartingPowers: [],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Weird Science",
    criticalFailure: {
      type: "malfunction",
      effect: "Marshal rolls on the Malfunction Table.",
    },
    notes: [
      "Name powers as devices, gizmos, elixirs, or inventions.",
      "Do not apply normal Fatigue backlash unless your table says to.",
    ],
  },
  shaman: {
    key: "shaman",
    edgeName: "Arcane Background: Shaman",
    displayName: "Shaman",
    requirementsText: "Novice, Spirit d8+, Faith d4+",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d8" },
      skills: { Faith: "d4" },
    },
    arcaneSkill: "Faith",
    linkedAttribute: "Spirit",
    startingPowersCount: 2,
    fixedStartingPowers: [],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Miracles",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Track Old Ways separately as an oath or reminder.",
      "If silenced, remember Faith rolls may be penalized.",
    ],
  },
};

const ARCANE_BACKGROUND_LIST = Object.values(ARCANE_BACKGROUNDS);
const ARCANE_SKILLS = [
  "Faith",
  "Focus",
  "Spellcasting",
  "Weird Science",
  "Psionics",
];

function normalizeArcaneText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function arcaneBackgroundKeyFromText(value) {
  const text = normalizeArcaneText(value);
  if (!text) return "";
  if (text.includes("chi master")) return "chiMaster";
  if (text.includes("mad scientist")) return "madScientist";
  if (text.includes("huckster")) return "huckster";
  if (text.includes("shaman")) return "shaman";
  if (text.includes("blessed")) return "blessed";
  return "";
}

function arcaneBackgroundKeyFromEdgeName(edgeName) {
  const text = normalizeArcaneText(edgeName);
  if (!text) return "";
  if (text.includes("arcane background"))
    return arcaneBackgroundKeyFromText(text);
  return arcaneBackgroundKeyFromText(text);
}

function arcaneBackgroundConfigFromEdge(edgeName) {
  return ARCANE_BACKGROUNDS[arcaneBackgroundKeyFromEdgeName(edgeName)] || null;
}

function isArcaneBackgroundEdge(edgeName) {
  return Boolean(arcaneBackgroundConfigFromEdge(edgeName));
}

function makeArcaneBackgroundState(config) {
  if (!config) return null;
  return {
    key: config.key,
    name: config.displayName,
    edgeName: config.edgeName,
    arcaneSkill: config.arcaneSkill,
    linkedAttribute: config.linkedAttribute,
    edgeFamily: config.edgeFamily,
    requirementsText: config.requirementsText,
  };
}

function makePowerPointResource(config, overrides = {}) {
  const max = Math.max(
    0,
    Math.floor(Number(overrides.max ?? config?.startingPowerPoints ?? 0) || 0),
  );
  const current = Math.max(
    0,
    Math.floor(Number(overrides.current ?? max) || 0),
  );
  return {
    id: "power-points",
    name: "Power Points",
    current: Math.min(current, max || current),
    max,
    source: overrides.source || config?.edgeName || "Manual setup",
    note:
      overrides.note ||
      (config ? `${config.displayName} uses ${config.arcaneSkill}.` : ""),
  };
}

function makeStartingPowers(config) {
  if (!config) return [];
  return [
    ...config.fixedStartingPowers.map((name) => ({
      id: `${config.key}-${normalizeArcaneText(name).replace(/\s+/g, "-")}`,
      name,
      rank: "Novice",
      baseCost: "",
      duration: "",
      active: false,
      source: config.edgeName,
      trapping: "",
      notes: "Fixed starting power.",
      modifiers: [],
      fixed: true,
    })),
    ...Array.from({ length: config.playerChoicePowers }, (_, index) => ({
      id: `${config.key}-choice-${index + 1}`,
      name: "",
      rank: "Novice",
      baseCost: "",
      duration: "",
      active: false,
      source: config.edgeName,
      trapping: "",
      notes: `Player choice ${index + 1}.`,
      modifiers: [],
      fixed: false,
    })),
  ];
}

function makeArcaneReminder(config) {
  if (!config) return null;
  return {
    type: "Arcane Background",
    name: config.displayName,
    text: `${config.criticalFailure.effect} ${config.notes.join(" ")}`,
  };
}

function makeHucksterDeal() {
  return {
    enabled: true,
    anteBennySpent: false,
    selectedPower: "",
    requiredPowerPoints: 0,
    gamblingRollResult: "",
    cardsDrawn: 5,
    pokerHand: "",
    temporaryPowerPoints: 0,
    shortagePenalty: 0,
    leftoverPowerPoints: 0,
    usedJoker: false,
    backfireTriggered: false,
    notes: "",
  };
}

function normalizePowerRecord(power, index = 0, fallbackSource = "") {
  return {
    id: power.id || power.uuid || `power-${index + 1}`,
    name: power.name || "",
    rank: power.rank || "Novice",
    baseCost: power.baseCost ?? power.cost ?? power.powerPoints ?? "",
    duration: power.duration || "",
    active: Boolean(power.active),
    source: power.source || fallbackSource,
    trapping: power.trapping || power.trappings || power.deviceName || "",
    notes: power.notes || power.summary || power.description || "",
    modifiers: Array.isArray(power.modifiers)
      ? power.modifiers
      : Array.isArray(power.powerModifiers)
        ? power.powerModifiers
        : [],
    fixed: Boolean(power.fixed),
  };
}

function normalizeHucksterDeal(deal) {
  if (!deal) return null;
  return {
    ...makeHucksterDeal(),
    ...deal,
    anteBennySpent: Boolean(deal.anteBennySpent),
    cardsDrawn: Math.max(0, Math.floor(Number(deal.cardsDrawn) || 0)),
    requiredPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.requiredPowerPoints) || 0),
    ),
    temporaryPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.temporaryPowerPoints) || 0),
    ),
    shortagePenalty: Math.max(0, Math.floor(Number(deal.shortagePenalty) || 0)),
    leftoverPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.leftoverPowerPoints) || 0),
    ),
    usedJoker: Boolean(deal.usedJoker),
    backfireTriggered: Boolean(deal.backfireTriggered),
  };
}
