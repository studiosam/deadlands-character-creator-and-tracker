// Catalog-backed Deadlands powers. Generated from docs/deadlands_weird_west_powers_catalog.md and kept as classic-script globals.
const ARCANE_BACKGROUND_POWER_PROFILES = {
  "blessed": {
    "id": "blessed",
    "name": "Blessed",
    "arcaneSkill": "Faith",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 3,
    "requiredStartingPowers": [
      "power-holy-symbol"
    ],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-banish",
      "power-barrier",
      "power-beast-friend",
      "power-blind",
      "power-boost-lower-trait",
      "power-confusion",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-dispel",
      "power-divination",
      "power-elemental-manipulation",
      "power-empathy",
      "power-environmental-protection",
      "power-havoc",
      "power-healing",
      "power-holy-symbol",
      "power-light-darkness",
      "power-protection",
      "power-relief",
      "power-resurrection",
      "power-sanctify",
      "power-sloth-speed",
      "power-smite",
      "power-speak-language",
      "power-stun",
      "power-warrior-s-gift"
    ],
    "notes": "Blessed requires Holy Symbol and two more starting powers.",
    "restrictions": {
      "power-detect-conceal-arcana": "Detect only; conceal is not available.",
      "power-light-darkness": "Light only; darkness is not available."
    }
  },
  "chiMaster": {
    "id": "chi-master",
    "name": "Chi Master",
    "arcaneSkill": "Focus",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 3,
    "requiredStartingPowers": [
      "power-deflection"
    ],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-boost-lower-trait",
      "power-burrow",
      "power-curse",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-empathy",
      "power-environmental-protection",
      "power-farsight",
      "power-healing",
      "power-numb",
      "power-protection",
      "power-relief",
      "power-sloth-speed",
      "power-smite",
      "power-wall-walker",
      "power-warrior-s-gift"
    ],
    "notes": "Chi Master requires Deflection and two more starting powers. Beneficial powers become Self range; detrimental powers become Touch range.",
    "restrictions": {
      "power-detect-conceal-arcana": "Detect only; conceal is not available.",
      "power-smite": "Hands and feet count as weapons for this power."
    }
  },
  "huckster": {
    "id": "huckster",
    "name": "Huckster",
    "arcaneSkill": "Spellcasting",
    "arcaneSkillAttribute": "Smarts",
    "startingPowerPoints": 10,
    "startingPowerCount": 3,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-ammo-whammy",
      "power-arcane-protection",
      "power-barrier",
      "power-beast-friend",
      "power-blind",
      "power-bolt",
      "power-boost-lower-trait",
      "power-burst",
      "power-confusion",
      "power-damage-field",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-divination",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-havoc",
      "power-illusion",
      "power-intangibility",
      "power-invisibility",
      "power-light-darkness",
      "power-numb",
      "power-object-reading",
      "power-protection",
      "power-puppet",
      "power-sloth-speed",
      "power-slumber",
      "power-sound-silence",
      "power-speak-language",
      "power-stun",
      "power-summon-ally",
      "power-telekinesis",
      "power-teleport",
      "power-trinkets",
      "power-wall-walker"
    ],
    "notes": "Huckster chooses three starting powers. Deal with the Devil can use available powers that are not known powers.",
    "restrictions": {}
  },
  "madScientist": {
    "id": "mad-scientist",
    "name": "Mad Scientist",
    "arcaneSkill": "Weird Science",
    "arcaneSkillAttribute": "Smarts",
    "startingPowerPoints": 15,
    "startingPowerCount": 2,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-barrier",
      "power-beast-friend",
      "power-blast",
      "power-blind",
      "power-bolt",
      "power-boost-lower-trait",
      "power-burrow",
      "power-burst",
      "power-confusion",
      "power-damage-field",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-drain-power-points",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-fly",
      "power-growth-shrink",
      "power-havoc",
      "power-healing",
      "power-illusion",
      "power-intangibility",
      "power-invisibility",
      "power-light-darkness",
      "power-mind-wipe",
      "power-numb",
      "power-protection",
      "power-puppet",
      "power-relief",
      "power-sloth-speed",
      "power-slumber",
      "power-smite",
      "power-sound-silence",
      "power-speak-language",
      "power-stun",
      "power-telekinesis",
      "power-teleport",
      "power-wall-walker",
      "power-warrior-s-gift",
      "power-zombie"
    ],
    "notes": "Mad Scientist chooses two starting powers. Name powers as devices, gizmos, elixirs, or inventions.",
    "restrictions": {
      "power-growth-shrink": "Shrink only; growth is not available."
    }
  },
  "shaman": {
    "id": "shaman",
    "name": "Shaman",
    "arcaneSkill": "Faith",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 2,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-banish",
      "power-beast-friend",
      "power-blind",
      "power-boost-lower-trait",
      "power-burrow",
      "power-confusion",
      "power-curse",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-divination",
      "power-drain-power-points",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-growth-shrink",
      "power-havoc",
      "power-healing",
      "power-holy-symbol",
      "power-intangibility",
      "power-numb",
      "power-protection",
      "power-relief",
      "power-resurrection",
      "power-sanctify",
      "power-shape-change",
      "power-sloth-speed",
      "power-slumber",
      "power-smite",
      "power-speak-language",
      "power-summon-ally",
      "power-teleport",
      "power-wall-walker",
      "power-warrior-s-gift",
      "power-wilderness-walk"
    ],
    "notes": "Shaman chooses two starting powers.",
    "restrictions": {
      "power-growth-shrink": "Growth only; shrink is not available."
    }
  }
};

const POWER_CATALOG = [
  {
    "id": "power-ammo-whammy",
    "name": "Ammo Whammy",
    "source": "Deadlands",
    "rank": "Seasoned",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Huckster": "Requires Hexslinging Edge."
    },
    "shortSummary": "Hexslinger empowers shots from a hex gun with special shot effects.",
    "variableCostNotes": "Requires Huckster + Hexslinging. Special shot effects are selected per shot; raise can allow two effects.",
    "tags": [
      "variable-cost"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-arcane-protection",
    "name": "Arcane Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Enemy casters take a penalty to affect the target; damaging powers are reduced by the same amount.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "defense",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-banish",
    "name": "Banish",
    "source": "SWADE Core + Deadlands note",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll to banish extraplanar or similar entities. In Deadlands, Harrowed manitous are made inert temporarily, not destroyed.",
    "variableCostNotes": "Deadlands Harrowed handling.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-barrier",
    "name": "Barrier",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates a short Hardness 10 wall or barrier.",
    "variableCostNotes": "Damage, Hardened, Shaped, Size.",
    "tags": [
      "attack",
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-beast-friend",
    "name": "Beast Friend",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Communicate with and guide natural animals; cost depends on controlled creatures’ Size.",
    "variableCostNotes": "Variable cost by creature Size and count.",
    "tags": [
      "utility",
      "variable-cost"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "variable-cost",
        "label": "Variable Cost",
        "costPer": null,
        "quantityLabel": "table choice"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-blast",
    "name": "Blast",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts ×2",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Area attack, usually Medium Blast Template, for energy or matter damage.",
    "variableCostNotes": "Area Effect and Damage modifiers.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-blind",
    "name": "Blind",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Inflicts sight penalties that the victim can recover from over turns.",
    "variableCostNotes": "Potential strong/area handling; automate later.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-bolt",
    "name": "Bolt",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts ×2",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Ranged arcane attack for 2d6 damage, 3d6 with a raise.",
    "variableCostNotes": "Damage +2; attack penalties apply normally.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-boost-lower-trait",
    "name": "Boost/Lower Trait",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5 boost / Instant lower",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Boost raises an ally’s Trait temporarily; lower reduces an enemy’s Trait and allows recovery attempts.",
    "variableCostNotes": "Additional Recipients for boost; Strong for lower.",
    "tags": [
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-burrow",
    "name": "Burrow",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target tunnels through earth or similar material and may emerge later.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-burst",
    "name": "Burst",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Cone Template",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Cone-shaped attack for 2d6 damage, 3d6 with a raise.",
    "variableCostNotes": "Damage +2.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-confusion",
    "name": "Confusion",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Makes targets Distracted, Vulnerable, or worse depending on result.",
    "variableCostNotes": "Area/Strong modifiers may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-curse",
    "name": "Curse",
    "source": "Deadlands",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Touch",
    "duration": "Permanent",
    "allowedBackgrounds": [
      "Chi Master",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll; victim suffers recurring Fatigue and possible death unless curse is lifted.",
    "variableCostNotes": "Dispel can remove, but each helper gets only one attempt.",
    "tags": [
      "healing"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-damage-field",
    "name": "Damage Field",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates a damaging aura that harms adjacent beings at the end of their turns.",
    "variableCostNotes": "Damage +2.",
    "tags": [
      "attack",
      "utility"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-darksight",
    "name": "Darksight",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Allows target to ignore darkness or illumination penalties.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-deflection",
    "name": "Deflection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [
      "Chi Master"
    ],
    "restrictionsByBackground": {},
    "shortSummary": "Foes subtract from attacks against the protected target; raise improves the penalty.",
    "variableCostNotes": "Additional Recipients +1. Main target-count UI test case. Verify PP cost if your table’s book printing differs.",
    "tags": [
      "defense",
      "attack",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-detect-conceal-arcana",
    "name": "Detect/Conceal Arcana",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5 detect / 1 hour conceal",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Blessed": "Detect only; conceal is not available.",
      "Chi Master": "Detect only; conceal is not available."
    },
    "shortSummary": "Detect reveals supernatural beings, objects, and effects. Conceal hides arcane nature.",
    "variableCostNotes": "Additional Recipients +1; Conceal Area Effect and Strong. Blessed and Chi Master are detect-only.",
    "tags": [
      "utility",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      },
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-disguise",
    "name": "Disguise",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target appears to be someone else; observers may see through it.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-dispel",
    "name": "Dispel",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Negates active powers or magical effects.",
    "variableCostNotes": "Automate as active-power remover later.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-divination",
    "name": "Divination",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Self",
    "duration": "5 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Ask questions of supernatural entities or forces.",
    "variableCostNotes": "Manual notes/questions first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-drain-power-points",
    "name": "Drain Power Points",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed arcane roll drains Power Points from another caster.",
    "variableCostNotes": "Track drained PP and target pool.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-elemental-manipulation",
    "name": "Elemental Manipulation",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Minor manipulation of air, earth, fire, or water.",
    "variableCostNotes": "Utility/manual effect.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-empathy",
    "name": "Empathy",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Read or influence emotions; helps social interaction or animals depending on use.",
    "variableCostNotes": "Social bonus/reminder.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-entangle",
    "name": "Entangle",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Binds or Entangles foes until they break free.",
    "variableCostNotes": "Track Entangled/Bound state later.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-environmental-protection",
    "name": "Environmental Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Touch",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Protects against environmental hazards and similar damaging sources.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "defense",
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-farsight",
    "name": "Farsight",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "See far details; raise helps reduce ranged penalties.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-fear",
    "name": "Fear",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Targets make Fear checks; raise worsens result.",
    "variableCostNotes": "Area Effect +2/+3.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-fly",
    "name": "Fly",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target flies at high Pace; raise improves flight speed.",
    "variableCostNotes": "Additional Recipients +2.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 2,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-growth-shrink",
    "name": "Growth/Shrink",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Mad Scientist": "Shrink only; growth is not available.",
      "Shaman": "Growth only; shrink is not available."
    },
    "shortSummary": "Increase or reduce Size by spending Power Points.",
    "variableCostNotes": "Variable cost by Size change. Mad Scientist is shrink-only; Shaman is growth-only.",
    "tags": [
      "buff",
      "variable-cost"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "variable-cost",
        "label": "Variable Cost",
        "costPer": null,
        "quantityLabel": "table choice"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-havoc",
    "name": "Havoc",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Targets in an area are Distracted and may be hurled.",
    "variableCostNotes": "Template/opposed handling manual first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-healing",
    "name": "Healing",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Restores recent Wounds and may handle other recovery with modifiers/timing.",
    "variableCostNotes": "Connect to wound tracker later.",
    "tags": [
      "healing"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-holy-symbol",
    "name": "Holy Symbol",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [
      "Blessed"
    ],
    "restrictionsByBackground": {},
    "shortSummary": "Supernaturally evil creatures must pass Spirit to directly physically attack the bearer.",
    "variableCostNotes": "Area Effect +2/+3; Strong +1. Blessed required starting power.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-illusion",
    "name": "Illusion",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates imaginary images or sensory effects.",
    "variableCostNotes": "Size/area manual first.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-intangibility",
    "name": "Intangibility",
    "source": "SWADE Core",
    "rank": "Heroic",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target becomes incorporeal.",
    "variableCostNotes": "Active toggle recommended.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-invisibility",
    "name": "Invisibility",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target becomes difficult to detect and affect.",
    "variableCostNotes": "Additional recipients may be supported depending on source.",
    "tags": [
      "utility",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-light-darkness",
    "name": "Light/Darkness",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Blessed": "Light only; darkness is not available."
    },
    "shortSummary": "Creates or dispels illumination or darkness.",
    "variableCostNotes": "Blessed is light-only.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-mind-wipe",
    "name": "Mind Wipe",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Removes or alters memories.",
    "variableCostNotes": "Mad Scientist only among reviewed Deadlands player lists.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-numb",
    "name": "Numb",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Spirit",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster and nearby allies ignore some Wound or Fatigue penalties; raise improves amount and suppresses temporary injuries.",
    "variableCostNotes": "Area is based on caster Spirit in tabletop inches.",
    "tags": [
      "healing"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-object-reading",
    "name": "Object Reading",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Reads psychic impressions from an object’s history.",
    "variableCostNotes": "Huckster only among reviewed Deadlands player lists.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-protection",
    "name": "Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Grants Armor +2, or +4 with a raise.",
    "variableCostNotes": "Additional Recipients +1; More Armor may apply depending on source.",
    "tags": [
      "defense",
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-puppet",
    "name": "Puppet",
    "source": "SWADE Core + Deadlands modifier",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll to control a target’s actions.",
    "variableCostNotes": "Deadlands adds Mind Rider +1 modifier.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-relief",
    "name": "Relief",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Removes Fatigue or Shaken; raise can remove Stunned.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "healing",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-resurrection",
    "name": "Resurrection",
    "source": "SWADE Core",
    "rank": "Heroic",
    "powerPoints": "30",
    "basePowerPoints": 30,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Brings the dead back to life under strict limits.",
    "variableCostNotes": "High-cost, Marshal-sensitive power.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-sanctify",
    "name": "Sanctify",
    "source": "Deadlands",
    "rank": "Veteran",
    "powerPoints": "10",
    "basePowerPoints": 10,
    "range": "Special",
    "duration": "Until next sunset",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Long ritual creates sacred ground that harms or deters supernaturally evil creatures entering it.",
    "variableCostNotes": "Four-hour ritual; noncombat location effect.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-shape-change",
    "name": "Shape Change",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster takes on animal or creature form depending on cost and Rank.",
    "variableCostNotes": "Variable cost by form.",
    "tags": [
      "variable-cost"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "variable-cost",
        "label": "Variable Cost",
        "costPer": null,
        "quantityLabel": "table choice"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-sloth-speed",
    "name": "Sloth/Speed",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant sloth / 5 speed",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Sloth reduces movement/actions; Speed increases movement/actions.",
    "variableCostNotes": "Track chosen mode.",
    "tags": [
      "buff"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-slumber",
    "name": "Slumber",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts ×5",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Puts targets to sleep if they fail resistance.",
    "variableCostNotes": "Area/Strong may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-smite",
    "name": "Smite",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Chi Master": "Hands and feet count as weapons for this power."
    },
    "shortSummary": "Increases a weapon’s damage by +2, or +4 with a raise.",
    "variableCostNotes": "Additional Recipients +1. Chi Master hands/feet count as weapons.",
    "tags": [
      "buff",
      "attack",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-sound-silence",
    "name": "Sound/Silence",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant sound / 5 silence",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates sound or mutes sound in an area or target.",
    "variableCostNotes": "Track chosen mode.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-speak-language",
    "name": "Speak Language",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster can speak and understand languages.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "utility",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-stun",
    "name": "Stun",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target is Stunned on failed resistance.",
    "variableCostNotes": "Area Effect may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-summon-ally",
    "name": "Summon Ally",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts ×2",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Conjures an allied creature; cost depends on ally strength.",
    "variableCostNotes": "Variable cost by ally type.",
    "tags": [
      "variable-cost"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "variable-cost",
        "label": "Variable Cost",
        "costPer": null,
        "quantityLabel": "table choice"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-telekinesis",
    "name": "Telekinesis",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Moves objects with high effective Strength; raise improves Strength.",
    "variableCostNotes": "Track target/object manually first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-teleport",
    "name": "Teleport",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Teleports the character a short distance.",
    "variableCostNotes": "Distance/recipients manual first.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-trinkets",
    "name": "Trinkets",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Huckster creates a small mundane item under one pound; fades when duration ends.",
    "variableCostNotes": "Complete +1; Weight +2. Raise changes duration scale to minutes.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "complete",
        "label": "Complete",
        "costPer": 1,
        "quantityLabel": "use"
      },
      {
        "id": "weight",
        "label": "Weight",
        "costPer": 2,
        "quantityLabel": "use"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-wall-walker",
    "name": "Wall Walker",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target walks on walls or ceilings.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-warrior-s-gift",
    "name": "Warrior’s Gift",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Temporarily grants a Combat Edge.",
    "variableCostNotes": "Requires Edge selection; good subchoice test.",
    "tags": [
      "buff"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  },
  {
    "id": "power-wilderness-walk",
    "name": "Wilderness Walk",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Self",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Shaman shortens long overland travel and hides tracks after walking at least one mile.",
    "variableCostNotes": "Additional Recipients +1; raise improves travel compression.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": ""
  },
  {
    "id": "power-zombie",
    "name": "Zombie",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Raises and controls undead from available corpses.",
    "variableCostNotes": "Additional Zombies, Armed, Armor, Mind Rider.",
    "tags": [
      "defense"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": ""
  }
];

const RANK_ORDER = { Novice: 0, Seasoned: 1, Veteran: 2, Heroic: 3, Legendary: 4 };

function normalizePowerCatalogText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function powerCatalogSlug(value) {
  return normalizePowerCatalogText(value).replace(/\s+/g, "-");
}

function findPowerCatalogEntryById(id) {
  if (!id) return null;
  const normalizedId = String(id);
  return (
    POWER_CATALOG.find(
      (power) =>
        power.id === normalizedId || power.id.replace(/^power-/, "") === normalizedId,
    ) || null
  );
}

function findPowerCatalogEntryByName(name) {
  const text = normalizePowerCatalogText(name);
  if (!text) return null;
  return (
    POWER_CATALOG.find(
      (power) => normalizePowerCatalogText(power.name) === text,
    ) || null
  );
}

function arcanePowerProfileKey(value) {
  const text = normalizePowerCatalogText(value);
  if (!text) return "";
  if (text.includes("chi master")) return "chiMaster";
  if (text.includes("mad scientist")) return "madScientist";
  if (text.includes("huckster")) return "huckster";
  if (text.includes("shaman")) return "shaman";
  if (text.includes("blessed")) return "blessed";
  return "";
}

function getArcaneBackgroundProfile(character) {
  const background = character?.arcaneBackground;
  const key = arcanePowerProfileKey(
    background?.name || background?.edgeName || background?.key || background,
  );
  return ARCANE_BACKGROUND_POWER_PROFILES[key] || null;
}

function getAllowedPowersForCharacter(character) {
  const profile = getArcaneBackgroundProfile(character);
  if (!profile) return [];
  return POWER_CATALOG.filter((power) => profile.allowedPowerIds.includes(power.id));
}

function powerRankValue(rank) {
  return RANK_ORDER[rank] ?? 0;
}

function rankAllowsPower(characterRank, powerRank) {
  if (!characterRank || !powerRank) return true;
  return powerRankValue(characterRank) >= powerRankValue(powerRank);
}

function powerRestrictionForProfile(power, profile) {
  if (!power || !profile) return "";
  return (
    power.restrictionsByBackground?.[profile.name] ||
    profile.restrictions?.[power.id] ||
    ""
  );
}

function createKnownPowerFromCatalog(catalogPower, character, options = {}) {
  const profile = getArcaneBackgroundProfile(character);
  const restriction = powerRestrictionForProfile(catalogPower, profile);
  const chiMasterSelfRange =
    profile?.id === "chi-master" &&
    /defense|buff|healing/.test((catalogPower.tags || []).join(" "));
  return {
    id: options.id || "character-" + catalogPower.id + "-" + Date.now(),
    catalogId: catalogPower.id,
    name: catalogPower.name,
    source: catalogPower.source,
    arcaneBackground: profile?.name || character?.arcaneBackground?.name || "",
    rank: catalogPower.rank,
    basePowerPoints: catalogPower.basePowerPoints,
    baseCost: catalogPower.powerPoints,
    powerPoints: catalogPower.powerPoints,
    range: chiMasterSelfRange ? "Self" : catalogPower.range,
    originalRange: chiMasterSelfRange ? catalogPower.range : "",
    duration: catalogPower.duration,
    trapping: options.trapping || "",
    shortSummary: catalogPower.shortSummary,
    variableCostNotes: catalogPower.variableCostNotes,
    supportsVariableSpend: Boolean(catalogPower.supportsVariableSpend),
    variableSpendOptions: catalogPower.variableSpendOptions || [],
    modifiers: options.modifiers || [],
    restrictions: restriction,
    notes: options.notes || restriction || "",
    active: Boolean(options.active || options.isActive),
    isActive: Boolean(options.active || options.isActive),
    activeTargets: Array.isArray(options.activeTargets) ? options.activeTargets : [],
    addedReason: options.addedReason || "new-powers-edge",
    isCustom: false,
  };
}

window.ARCANE_BACKGROUND_POWER_PROFILES = ARCANE_BACKGROUND_POWER_PROFILES;
window.POWER_CATALOG = POWER_CATALOG;
