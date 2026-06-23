# Deadlands Power Points and Arcane Background Defaults

This document describes how the Deadlands/SWADE tracker should handle Power Points, Arcane Backgrounds, powers, and Savaged.us imports. It is written as an implementation spec for Codex, not as copied rulebook text.

## Core App Rule

In Deadlands: The Weird West, characters should use the Deadlands-specific Arcane Background options instead of generic SWADE Arcane Background handling. The app should treat Arcane Backgrounds as explicit mechanical choices, not as something inferred from a character's profession, title, concept, background text, or religious flavor.

A character may only have one Arcane Background. If the user tries to select a second Arcane Background, the app should block it or ask whether the new choice should replace the old one.

Characters without an Arcane Background should not show Power Points by default. The app should still allow manual Power Points setup for house rules, custom characters, or edge cases.

## Arcane Background Defaults

| Arcane Background | Requirements | Arcane Skill | Linked Attribute | Starting Powers | Starting Power Points | Special Notes |
|---|---|---|---|---:|---:|---|
| Blessed | Novice, Spirit d6+, Faith d4+ | Faith | Spirit | 3 | 15 | Starts with holy symbol plus 2 chosen powers |
| Chi Master | Novice, Agility d6+, Spirit d6+, Martial Artist, Focus d4+ | Focus | Spirit | 3 | 15 | Starts with deflection plus 2 chosen powers |
| Huckster | Novice, Gambling d6+, Spellcasting d4+ | Spellcasting | Smarts | 3 | 10 | Uses Dealing with the Devil rules |
| Mad Scientist | Novice, Smarts d8+, Science d6+, Weird Science d4+ | Weird Science | Smarts | 2 | 15 | Critical Failure triggers Malfunction |
| Shaman | Novice, Spirit d8+, Faith d4+ | Faith | Spirit | 2 | 15 | Often interacts with Old Ways and ritual flavor |

The most important implementation detail is that Huckster starts with 10 Power Points, not 15. The app is wrong if it blindly gives every Arcane Background 15 Power Points.

Blessed and Chi Master each have one fixed starting power. Blessed starts with holy symbol, and Chi Master starts with deflection. The remaining starting powers should be empty player-choice slots.

## Power Points Tracker Behavior

Power Points should be stored as a tracker resource. The tracker should display current Power Points, maximum Power Points, plus and minus controls, a reset-to-max button, and a source label such as `Arcane Background: Huckster`.

Power Points should not be inferred from religious or supernatural flavor text. A character called preacher, elder, priest, shaman, miracle worker, or similar should not automatically receive Power Points unless the character actually has the correct Arcane Background Edge, explicit Power Point data, or a clear arcane background structure in the imported data.

## Recommended Arcane Background Config

```js
const ARCANE_BACKGROUNDS = {
  blessed: {
    edgeName: "Arcane Background: Blessed",
    displayName: "Blessed",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d6" },
      skills: { faith: "d4" }
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
      effect: "Gain 1 Fatigue and terminate currently active powers."
    },
    notes: [
      "Track sins or belief violations as reminder notes, not as automatic rules enforcement.",
      "Do not infer this background from religious profession text alone."
    ]
  },

  chiMaster: {
    edgeName: "Arcane Background: Chi Master",
    displayName: "Chi Master",
    requirements: {
      rank: "Novice",
      attributes: { agility: "d6", spirit: "d6" },
      edges: ["Martial Artist"],
      skills: { focus: "d4" }
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
      effect: "Gain 1 Fatigue and terminate currently active powers."
    },
    notes: [
      "Beneficial powers are self-focused by default.",
      "Detrimental powers generally need touch-range handling."
    ]
  },

  huckster: {
    edgeName: "Arcane Background: Huckster",
    displayName: "Huckster",
    requirements: {
      rank: "Novice",
      skills: { gambling: "d6", spellcasting: "d4" }
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
      effect: "Gain 1 Fatigue and terminate currently active powers."
    },
    notes: [
      "Hucksters cannot use Shorting or spend Bennies for Power Points in the normal way.",
      "Add a Dealing with the Devil helper as a separate subsystem."
    ]
  },

  madScientist: {
    edgeName: "Arcane Background: Mad Scientist",
    displayName: "Mad Scientist",
    requirements: {
      rank: "Novice",
      attributes: { smarts: "d8" },
      skills: { science: "d6", weirdScience: "d4" }
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
      effect: "Marshal rolls on the Malfunction Table."
    },
    notes: [
      "Powers should be named as devices, gizmos, elixirs, or inventions.",
      "Do not apply normal Fatigue backlash unless a specific rule says to."
    ]
  },

  shaman: {
    edgeName: "Arcane Background: Shaman",
    displayName: "Shaman",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d8" },
      skills: { faith: "d4" }
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
      effect: "Gain 1 Fatigue and terminate currently active powers."
    },
    notes: [
      "Track Old Ways separately as an oath or reminder.",
      "If silenced, the app should remind the user that Faith rolls may be penalized."
    ]
  }
};
```

## Character Creation Behavior

When the user selects an Arcane Background, the app should check whether another Arcane Background is already selected. If another one exists, the app should block the selection or ask whether the existing Arcane Background should be replaced.

After selection, the app should add the Arcane Background Edge, enable Power Points, set the arcane skill recommendation, create starting power slots, and set current and maximum Power Points from the config. Huckster should receive 10 current and 10 maximum Power Points, while Blessed, Chi Master, Mad Scientist, and Shaman should receive 15.

```js
function applyArcaneBackground(character, backgroundKey) {
  const config = ARCANE_BACKGROUNDS[backgroundKey];
  if (!config) return character;

  character.arcaneBackground = {
    key: backgroundKey,
    name: config.displayName,
    edgeName: config.edgeName,
    arcaneSkill: config.arcaneSkill,
    linkedAttribute: config.linkedAttribute,
    edgeFamily: config.edgeFamily
  };

  character.resources = character.resources || [];
  character.resources = character.resources.filter(
    (resource) => resource.id !== "power-points"
  );

  character.resources.push({
    id: "power-points",
    name: "Power Points",
    current: config.startingPowerPoints,
    max: config.startingPowerPoints,
    source: config.edgeName,
    note: `${config.displayName} uses ${config.arcaneSkill}.`
  });

  character.powers = [
    ...config.fixedStartingPowers.map((name) => ({
      name,
      source: "fixed starting power",
      cost: "",
      duration: "",
      active: false,
      notes: ""
    })),
    ...Array.from({ length: config.playerChoicePowers }, (_, index) => ({
      name: "",
      source: `player choice ${index + 1}`,
      cost: "",
      duration: "",
      active: false,
      notes: ""
    }))
  ];

  character.reminders = character.reminders || [];
  character.reminders.push({
    type: "Arcane Background",
    name: config.displayName,
    text: config.criticalFailure.effect
  });

  return character;
}
```

## Savaged.us Import Behavior

On Savaged.us import, the app should only auto-enable Power Points when the import contains explicit Power Point data, a real Arcane Background Edge, or a non-empty arcane background structure such as `abs` that clearly represents an Arcane Background. The app should not use `professionOrTitle`, `background`, `description`, `raceGenderAndProfession`, or religious keywords as proof.

If the import has an arcane-looking trained skill such as Faith, Focus, Spellcasting, Weird Science, or Psionics but no Arcane Background Edge, the app should show a warning instead of making the decision. The warning should say that the character may need Power Points, but the import does not prove the correct Arcane Background.

```js
function shouldEnablePowerPointsFromImport(data) {
  const edgeText = (data.edges || [])
    .map((edge) => edge.name || "")
    .join(" ")
    .toLowerCase();

  const hasArcaneBackgroundEdge =
    edgeText.includes("arcane background") ||
    edgeText.includes("blessed") ||
    edgeText.includes("chi master") ||
    edgeText.includes("huckster") ||
    edgeText.includes("mad scientist") ||
    edgeText.includes("shaman");

  const hasExplicitPowerPoints =
    Number(data.powerPoints) > 0 ||
    Number(data.powerPointsMax) > 0 ||
    Number(data.pp) > 0 ||
    Number(data.ppMax) > 0;

  const hasArcaneBackgroundObject =
    Array.isArray(data.abs) && data.abs.length > 0;

  return hasArcaneBackgroundEdge || hasExplicitPowerPoints || hasArcaneBackgroundObject;
}
```

## Import Warning Rules

If the import contains religious flavor text but no Arcane Background Edge, no active Faith skill, and no explicit Power Point pool, the app should not create Power Points. It may create a reminder or warning that says the character might be intended as Blessed, but the user must confirm that manually.

A useful warning is: `This character looks like it may be intended as an arcane character, but the imported JSON does not include an Arcane Background, powers, or Power Points. Enable Arcane Background setup?`

## Powers Section Behavior

Power Points alone are not enough for a useful tracker. The app should also track known powers, current active powers, costs, durations, modifiers, and whether the power was cast normally or through a special subsystem like Huckster Dealing with the Devil.

Each power should be a plain player-facing record. Do not copy full rulebook text into the app, and store only the information needed for tracking.

```js
const power = {
  id: "boost-lower-trait",
  name: "boost/lower Trait",
  rank: "Novice",
  baseCost: 2,
  duration: "5 rounds",
  active: false,
  source: "Arcane Background: Blessed",
  trapping: "",
  notes: "",
  modifiers: []
};
```

Power controls should include add power, remove power, mark active, mark inactive, spend base cost, refund cost, and notes. The app should preserve powers through localStorage and JSON export.

## Huckster-Specific Behavior

Huckster support needs more than normal Power Point tracking. A Huckster can cast normally using their 10-point pool, but the special Deadlands mechanic lets them Deal with the Devil using a separate sequence involving a Benny, Gambling, cards, and temporary Power Points.

The app should not mix temporary Huckster points into the normal Power Points pool unless the user chooses to apply leftover points according to table procedure. Add a separate Huckster helper that logs the deal and keeps normal Power Points separate.

```js
const hucksterDeal = {
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
  notes: ""
};
```

The Huckster helper should include fields for ante Benny spent, selected power, required Power Points, Gambling result, cards drawn, poker hand, temporary Power Points generated, shortage penalty, leftover Power Points, used Joker, Backfire triggered, and notes.

## Mad Scientist-Specific Behavior

Mad Scientists use Weird Science and should have inventions, devices, gizmos, elixirs, or similar trappings for their powers. The app should let each power have a `deviceName` or `trapping` field so the player can name the invention that represents the power.

Mad Scientists should use a Malfunction reminder on Critical Failure. Do not apply the normal Fatigue backlash automatically unless a specific rule or table setting requires it.

## Blessed and Shaman Behavior

Blessed and Shaman both use Faith and should use the Power Points tracker normally. The app should support notes for sins, vows, Old Ways, religious restrictions, or table-specific consequences, but those should be reminders rather than automated penalties.

Blessed should start with holy symbol as a fixed power slot. Shaman should not automatically receive holy symbol unless the user adds it manually.

## Chi Master Behavior

Chi Master uses Focus and should start with deflection as a fixed power slot. The app should include notes that the player may need special range handling for self-focused beneficial powers and touch-range detrimental powers.

The app should not hard-code complex targeting behavior in the first version. A note or reminder field is enough for the current tracker scope.

## Harrowed Are Not Power Point Characters

Harrowed are supernatural, but they are not one of the Power Point Arcane Backgrounds. The app should not automatically create a Power Points resource when a character is Harrowed.

Harrowed should be a separate optional module. That module should track Dominion, death wound, Harrowed Edges, Undead reminders, and Let the Devil Out.

## Resource Data Model

Use `resources` as the tracker source of truth. Character creation can use helper state like `powerPoints`, but the finalized tracker should render Power Points from `resources`.

```js
const powerPointResource = {
  id: "power-points",
  name: "Power Points",
  current: 15,
  max: 15,
  source: "Arcane Background: Blessed",
  note: "Blessed uses Faith."
};
```

This keeps Power Points consistent with other resources such as Sanity, Strain, or setting-specific pools. It also avoids having two separate tracker systems for the same kind of value.

## Export and LocalStorage Requirements

The app's own exported JSON must include resources, powers, arcaneBackground, and any Huckster helper state. If a character is exported and imported again, the app should preserve current Power Points, maximum Power Points, known powers, active powers, notes, and source.

Savaged.us imported characters may not include current or maximum Power Points. If the user manually enables Power Points after import, the app should preserve that app-owned data locally and in the app's own export format.

## Acceptance Criteria

The implementation is correct when Blessed creates 15 Power Points, Chi Master creates 15, Huckster creates 10, Mad Scientist creates 15, and Shaman creates 15. The implementation is wrong if every Arcane Background blindly receives the same Power Point value.

The implementation is correct when religious flavor text creates a warning only, not an automatic Power Points resource. The implementation is wrong if a title like elder, priest, preacher, blessed, shaman, or miracle worker creates Power Points without mechanical confirmation.

The implementation is correct when Power Points are stored as a tracker resource and powers are stored as a separate list. The implementation is incomplete if it tracks Power Points but has no way to track known powers, active powers, costs, durations, or notes.

The implementation is correct when Huckster has normal Power Points and a separate Dealing with the Devil helper. The implementation is incomplete if temporary Huckster Power Points are mixed directly into the normal Power Points pool without user control.

The implementation is correct when Harrowed do not automatically receive Power Points. Harrowed features should be handled by a separate Harrowed module, not by the Arcane Background system.
