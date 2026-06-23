# Deadlands: The Weird West Edges and Hindrances Catalog with Summaries

## Purpose

This file is a practical app-design reference for the Deadlands character creator and tracker. It lists Deadlands-specific Hindrances and Edges from *Deadlands: The Weird West* with short mechanical summaries, validation notes, tags, and possible app effect hooks.

This is meant to make the app useful at the table. A catalog that only stores names and requirements is not enough, because players still need to know what an Edge or Hindrance actually does.

Source reviewed:

```txt
https://anyflip.com/fmydc/hkmt/basic
```

## Scope

This file covers Deadlands-specific material from *Deadlands: The Weird West*. It does not attempt to reproduce the entire Savage Worlds core Edge and Hindrance list.

Deadlands uses most Savage Worlds Hindrances and Edges, but the Weird West book specifically says these Savage Worlds Edges are not available in Deadlands:

- Arcane Background (any)
- Soul Drain

Deadlands uses its own Arcane Background Edges instead:

- Arcane Background (Blessed)
- Arcane Background (Chi Master)
- Arcane Background (Huckster)
- Arcane Background (Mad Scientist)
- Arcane Background (Shaman)

A character should generally only take one Arcane Background Edge.

---

# Recommended App Data Shape

## Hindrance shape

```js
{
  id: "dl-hindrance-ailin",
  name: "Ailin’",
  type: "hindrance",
  source: "Deadlands: The Weird West",
  severityOptions: ["Minor", "Major"],
  requirements: [],
  conflicts: [],
  shortSummary: "Penalty to rolls made to resist Fatigue; severity determines penalty.",
  mechanicalTags: ["fatigue", "resistance-penalty", "severity"],
  effects: [
    { type: "roll-modifier", appliesTo: "resist-fatigue", minorPenalty: -1, majorPenalty: -2 }
  ],
  notes: "Critical Failure can worsen the Hindrance or trigger a death-session outcome at Major severity."
}
```

## Edge shape

```js
{
  id: "dl-edge-fan-the-hammer",
  name: "Fan the Hammer",
  type: "edge",
  category: "Combat",
  source: "Deadlands: The Weird West",
  rank: "Seasoned",
  requirements: [
    { type: "attribute", name: "Agility", min: "d8" },
    { type: "skill", name: "Shooting", min: "d8" }
  ],
  conflicts: [],
  subchoices: [],
  shortSummary: "Fire up to six shots from a fully loaded single-action revolver as one action; each shot has a Shooting penalty.",
  mechanicalTags: ["single-action-revolver", "multi-shot", "shooting-penalty", "ammo-consumption"],
  effects: [
    {
      type: "combat-option",
      label: "Fan the Hammer",
      weaponFilter: "single-action-revolver",
      maxShots: 6,
      attackPenalty: -4
    }
  ],
  notes: "On low Shooting dice, Innocent Bystander risk may apply by Savage Worlds rules."
}
```

## Validation philosophy

Do not hard-block all invalid choices. Show warnings and allow a Marshal override. This matters for imported characters, house rules, campaign exceptions, Harrowed events, and characters created outside the app.

---

# Deadlands-Specific Hindrances

| Hindrance | Severity | Short mechanical summary | App tags / effect hooks |
|---|---:|---|---|
| Ailin’ | Minor or Major | Penalty to rolls made to resist Fatigue. Minor is worse than normal by 1; Major by 2. A Critical Failure can worsen the condition or create a terminal story moment at Major severity. | `fatigue`, `resistance-penalty`, `severity`, `conviction-trigger` |
| Cursed | Major | For each player character with this Hindrance, the Marshal starts with one additional Benny. | `marshal-benny`, `party-impact` |
| Grim Servant o’ Death | Major | Wild Card only. Adds +1 to all damage rolls, but a Critical Failure on an attack hits the nearest ally with a raise. | `wild-card-only`, `damage-bonus`, `critical-failure-complication`, `friendly-fire` |
| Heavy Sleeper | Minor | Takes a large penalty to wake up and to stay awake. | `sleep`, `notice-penalty`, `vigor-penalty` |
| Lyin’ Eyes | Minor | Penalty to social rolls that require lying; also penalizes bluffing in poker or faro. | `social-penalty`, `gambling-penalty`, `lying` |
| Night Terrors | Major | Constant nightmares weaken resolve, causing a penalty to all Spirit rolls. | `spirit-penalty`, `sleep`, `fear-adjacent` |
| Old Ways Oath | Minor | Character rejects modern technology. If faithful, gains a free reroll on Spirit rolls. Violating the oath suppresses the benefit temporarily, longer for ghost-rock use. | `spirit-reroll`, `technology-restriction`, `ghost-rock`, `conditional-benefit` |
| Talisman | Minor or Major | Arcane character suffers an arcane skill penalty without their talisman. Minor and Major differ by penalty size. Mad scientists are not eligible. | `arcane`, `arcane-skill-penalty`, `severity`, `not-mad-scientist` |
| Tenderfoot | Major | If wounded, suffers an extra action penalty. Cannot take Don’t Get ’im Riled! | `wound-penalty`, `conflict`, `combat-penalty` |
| Trouble Magnet | Minor or Major | Minor makes Critical Failure consequences worse. Major causes random negative targeting to hit this character. | `critical-failure-complication`, `random-target`, `severity` |

## Hindrance validation notes

- `Grim Servant o’ Death` should warn if the character is not a Wild Card.
- `Talisman` should warn if the character has no Arcane Background or has Arcane Background (Mad Scientist).
- `Tenderfoot` conflicts with `Don’t Get ’im Riled!`.
- `Trouble Magnet` and `Ailin’` need severity selection.

---

# Deadlands-Specific Edges

## Background Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Arcane Background (Blessed) | Novice | Spirit d6+, Faith d4+ | Grants Blessed casting: Faith arcane skill, 15 Power Points, holy symbol plus two chosen starting powers, Blessed power list, divine sin/backlash rules. | `arcane-background`, `blessed`, `faith`, `power-points-15`, `starting-powers-3`, `one-arcane-background` |
| Arcane Background (Chi Master) | Novice | Agility d6+, Spirit d6+, Martial Artist, Focus d4+ | Grants Chi Master casting: Focus arcane skill, 15 Power Points, deflection plus two chosen starting powers, internal/self-focused casting limitations. | `arcane-background`, `chi-master`, `focus`, `power-points-15`, `starting-powers-3`, `one-arcane-background`, `martial-artist` |
| Arcane Background (Huckster) | Novice | Gambling d6+, Spellcasting d4+ | Grants Huckster casting: Spellcasting arcane skill, 10 Power Points, three starting powers, Deal with the Devil rules, huckster backlash. | `arcane-background`, `huckster`, `spellcasting`, `power-points-10`, `starting-powers-3`, `deal-with-the-devil`, `one-arcane-background` |
| Arcane Background (Mad Scientist) | Novice | Smarts d8+, Science d6+, Weird Science d4+ | Grants Mad Scientist casting: Weird Science arcane skill, 15 Power Points, two starting powers, gizmo/invention framing, malfunction rules. | `arcane-background`, `mad-scientist`, `weird-science`, `power-points-15`, `starting-powers-2`, `malfunction`, `one-arcane-background` |
| Arcane Background (Shaman) | Novice | Spirit d8+, Faith d4+ | Grants Shaman casting: Faith arcane skill, 15 Power Points, two starting powers, Shaman power list, nature-spirit backlash and Old Ways context. | `arcane-background`, `shaman`, `faith`, `power-points-15`, `starting-powers-2`, `one-arcane-background` |
| Gallows Humor | Novice | Taunt d6+ | Allows Taunt instead of Spirit for Fear checks. A raise can support allies facing the same Fear check. | `fear`, `taunt`, `support`, `fear-check-alternate-skill` |
| Veteran o’ the Weird West | Novice | Wild Card, Spirit d6+, Occult d6+ | Starts at Seasoned or one Rank higher than the posse, gaining four Advances, but draws for a serious Weird West complication. | `wild-card-only`, `rank-boost`, `starting-advance`, `complication-draw`, `marshal-table` |

## Combat Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Don’t Get ’im Riled! | Novice | None beyond Rank | Adds current Wound levels to melee damage rolls. | `melee-damage-bonus`, `wound-based`, `combat` |
| Duelist | Novice | Shooting d6+ | Grants two extra Hole Cards at the start of a formal duel. | `duel`, `hole-cards`, `shooting` |
| Fan the Hammer | Seasoned | Agility d8+, Shooting d8+ | With a fully loaded single-action revolver, fire up to six shots as one action. Each shot suffers a Shooting penalty. | `single-action-revolver`, `multi-shot`, `shooting-penalty`, `ammo-consumption` |
| Improved Fan the Hammer | Heroic | Agility d10+, Fan the Hammer, Shooting d10+ | Same as Fan the Hammer, but with a smaller Shooting penalty. | `single-action-revolver`, `multi-shot`, `improved-edge`, `shooting-penalty` |
| Quick Draw | Novice | Agility d8+ | When spending a Benny for an extra Action Card, draw two and choose from available options. Also improves Athletics rolls to interrupt or resist interruption. | `initiative`, `action-card`, `benny`, `interrupt`, `athletics-bonus` |

### Suggested combat effect hooks

```js
[
  {
    edge: "Fan the Hammer",
    effect: {
      type: "combat-option",
      weaponFilter: "single-action-revolver",
      maxShots: 6,
      attackPenalty: -4,
      consumesAmmoPerShot: true
    }
  },
  {
    edge: "Improved Fan the Hammer",
    effect: {
      type: "modify-combat-option",
      target: "Fan the Hammer",
      attackPenalty: -2
    }
  },
  {
    edge: "Don’t Get ’im Riled!",
    effect: {
      type: "damage-modifier",
      appliesTo: "melee",
      valueFrom: "currentWounds"
    }
  }
]
```

## Professional Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Agent | Novice | Smarts d8+, Fighting d6+, Occult d6+, Research d6+, Shooting d6+ | Makes the character a U.S. Agent. Grants organization status, starting gear, pay, badge benefits, and access to Agent favors/rank advancement. | `organization`, `agent`, `starting-gear`, `monthly-pay`, `favors`, `badge` |
| Born in the Saddle | Novice | Agility d8+, Riding d6+ | Free reroll on Riding rolls. Also improves the character’s horse movement. | `riding-reroll`, `mount`, `pace-bonus`, `running-die-bonus` |
| Card Sharp | Novice | Gambling d6+ | Free reroll on Gambling rolls, including Huckster Deal with the Devil Gambling rolls. | `gambling-reroll`, `huckster-synergy`, `deal-with-the-devil` |
| Guts | Novice | Spirit d6+ | Free reroll on Fear checks. | `fear`, `fear-reroll` |
| Scout | Seasoned | Woodsman | Improves wilderness travel awareness, tracking, and route knowledge. Can detect travel encounters before they hit the posse. | `travel`, `notice`, `survival`, `tracking`, `common-knowledge`, `encounter-detection` |
| Soldier | Novice | Strength d6+, Vigor d6+ | Military-service Edge. Gives rank/pay/Obligation context if still serving. Higher starting rank is possible but increases Obligation and has extra expectations. | `organization`, `soldier`, `monthly-pay`, `obligation`, `rank` |
| Tale-Teller | Novice | Performance or Persuasion d8+ | Helps lower local Fear Levels. On a strong success, the tale-teller and supporters can earn Conviction. | `fear-level`, `performance`, `persuasion`, `conviction`, `support` |
| Territorial Ranger | Novice | Vigor d6+, Fighting d6+, Intimidation d6+, Riding d6+, Shooting d6+, Survival d4+ | Makes the character a Territorial Ranger. Grants organization status, starting gear, badge benefits, pay/favor context, and access to Ranger advancement. | `organization`, `ranger`, `starting-gear`, `monthly-pay`, `favors`, `badge` |

## Social Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Reputation | Veteran | None beyond Rank | Choose good or bad reputation. Good reputation gives a Persuasion reroll with people who know the character; bad reputation gives an Intimidation bonus with people who know the character. | `social`, `subchoice`, `persuasion-reroll`, `intimidation-bonus`, `reputation` |

## Weird Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Grit | Veteran | Spirit d8+, Guts | Reduces Fear check penalties and stacks with Brave. | `fear`, `fear-penalty-reduction`, `requires-guts` |
| Harrowed | Novice | Wild Card, Spirit d6+ | Character begins play as undead Harrowed. Grants Harrowed rules package and access to Harrowed Edges. Character-creation-only unless the Marshal says otherwise. | `wild-card-only`, `undead`, `harrowed`, `character-creation-only`, `edge-unlock` |
| Knack | Novice | None beyond Rank | Character chooses one folklore-based birth omen that grants a specific supernatural trick. Needs a subchoice. | `subchoice`, `supernatural`, `birth-omen`, `character-creation-preferred` |

## Knack subchoices

| Knack option | Short mechanical summary | App tags / effect hooks |
|---|---|---|
| Bastard | Spend a Benny to see invisible, hidden, or supernaturally blended creatures for five rounds. | `benny-spend`, `see-invisible`, `detection`, `duration-5` |
| Born on All Hallows’ Eve | Spend Conviction to reroll a Critical Failure. | `conviction-spend`, `critical-failure-reroll` |
| Born on Christmas | Blessed or Shaman only. Spend a Benny to negate a power from a different Arcane Background that targets the character, then the caster risks being Shaken. | `benny-spend`, `arcane-defense`, `blessed-or-shaman-only`, `power-negation` |
| Breech Birth | Spend a Benny to use healing with automatic single-success effect. | `benny-spend`, `healing`, `auto-success` |
| Seventh Son | Spend a Benny to negate another Benny used in the character’s presence. | `benny-spend`, `benny-negation`, `fate` |
| Shooting Star | Spend a Benny at the start of combat to double Command Range for that encounter. | `benny-spend`, `command-range`, `encounter-duration`, `leadership` |
| Storm Born | When spending a Benny to reroll a Fear check, ignore Fear penalties from the threat and local Fear Level. | `benny-reroll`, `fear`, `ignore-fear-penalties` |

## Legendary Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Behold a Pale Horse… | Legendary | None beyond Rank | Grants a special war horse that is Fearless, has Danger Sense, is a Wild Card, and starts each session with its own Bennies. | `mount`, `wild-card-ally`, `session-bennies`, `danger-sense`, `fearless` |
| Damned | Legendary | Wild Card, Spirit d6+, Reputation | If killed, the character automatically returns as Harrowed. After returning, this Edge can become an additional Harrowed Edge. | `wild-card-only`, `harrowed`, `death-trigger`, `edge-conversion` |
| Fast as Lightning | Legendary | Agility d10+, Quick | Character can take a fourth action. Maximum Multi-Action Penalty increases accordingly. | `extra-action`, `multi-action`, `legendary`, `quick` |
| Right Hand of the Devil | Legendary | Trademark Weapon, Shooting/Fighting/Athletics d10+ | Chosen favored weapon becomes a relic and deals one extra damage die. The benefit is tied to the weapon. | `relic-weapon`, `damage-die-bonus`, `trademark-weapon`, `weapon-bound` |
| True Grit | Legendary | Spirit d10+, Grit | Ignores Fear check penalties and may reroll on the Fear Effects Table after failing. | `fear`, `ignore-fear-penalties`, `fear-effects-reroll`, `requires-grit` |

---

# Arcane and Organization-Specific Edges

These Edges appear in later setting/No Man’s Land sections and should still be included as valid character options.

## Agent Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Grade 2 | Seasoned | Agent | Character is already an Agent Grade 2. Grants mnemomizer, possible Gatling upgrade, three Favors, and broader supernatural knowledge. | `agent`, `rank-up`, `favors-3`, `mnemomizer`, `starting-upgrade` |
| Man of a Thousand Faces | Seasoned | Agent, Performance d8+ | Improves Performance rolls to impersonate a general type; more specific impersonations still carry penalties. Disguise kit helps offset penalties. | `agent`, `performance-bonus`, `disguise`, `impersonation` |

## Blessed Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| True Believer | Novice | Spirit d10+, Arcane Background (Blessed), Faith d6+ | Free reroll on Faith rolls. | `blessed`, `faith-reroll`, `arcane-skill-reroll` |
| Flock | Veteran | Arcane Background (Blessed), Persuasion d8+ | Grants five follower Allies using Townsfolk-style stats. Lost followers are replaced over time. Can be taken repeatedly at Legendary. | `blessed`, `followers`, `allies`, `repeatable-legendary` |

## Chi Master Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Superior Kung Fu | Novice | Spirit d6+, Arcane Background (Chi Master), Fighting d8+ | Choose one kung fu style each time the Edge is taken. The character can assume one known style as a free action at the start of their turn. | `chi-master`, `subchoice`, `stance`, `free-action`, `repeatable` |
| Celestial Kung Fu | Veteran | Spirit d8+, Superior Kung Fu, Fighting d10+ | Grants another Superior Kung Fu style and allows two styles to be active at once. | `chi-master`, `stance`, `two-active-styles`, `requires-superior-kung-fu` |

## Superior Kung Fu style subchoices

| Style option | Short mechanical summary | App tags / effect hooks |
|---|---|---|
| Drunken Style | Foes suffer an attack penalty against the martial artist, but the martial artist’s Pace is reduced. | `stance`, `defense`, `enemy-attack-penalty`, `pace-penalty` |
| Eagle Claw | Unarmed Fighting attacks gain strong Armor Piercing and count as Heavy Weapons. | `stance`, `unarmed`, `ap`, `heavy-weapon` |
| Mantis | Once per round, a foe who fails a Fighting attack against the martial artist becomes Distracted or Vulnerable, martial artist’s choice. | `stance`, `reaction`, `distracted`, `vulnerable` |
| Monkey | Grants a Parry bonus and allows a single Athletics Test against all adjacent foes. | `stance`, `parry-bonus`, `area-test`, `adjacent-foes` |
| Shuai Chao | Once per round, when a foe fails a Fighting attack against the martial artist, the martial artist may attempt a free grapple. | `stance`, `reaction`, `grapple`, `free-action` |
| Tan Tui | Once per round, one unarmed attack deals a higher damage die and can knock the foe back if it Shakes or Wounds. Also helps rise from prone. | `stance`, `unarmed-damage`, `knockback`, `prone-recovery` |
| Wing Chun | Grants a smaller Parry bonus and reduces melee damage taken. | `stance`, `parry-bonus`, `melee-damage-reduction` |

## Harrowed Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Cat Eyes | Novice | Harrowed | Ignores Dim and Dark lighting penalties. | `harrowed`, `vision`, `ignore-dim`, `ignore-dark` |
| Improved Cat Eyes | Seasoned | Cat Eyes, Harrowed | Ignores all lighting penalties. | `harrowed`, `vision`, `ignore-lighting`, `improved-edge` |
| Chill o’ the Grave | Seasoned | Harrowed | Spend a Benny and an action to make living creatures in a Large Blast Template centered on the Harrowed Vulnerable unless protected from cold. | `harrowed`, `benny-spend`, `action`, `large-blast-template`, `vulnerable` |
| Claws | Novice | Harrowed | Gains retractable claws dealing Str+d6. Extending or retracting is a free action. | `harrowed`, `natural-weapon`, `claws`, `free-action` |
| Improved Claws | Veteran | Claws, Harrowed | Claws improve to Str+d8 with AP 2. | `harrowed`, `natural-weapon`, `ap`, `improved-edge` |
| Ghost | Heroic | Harrowed | Can become incorporeal at the start of turn as a free action. While ghosted, visible but intangible, Distracted, and still affected by magic. | `harrowed`, `incorporeal`, `free-action`, `distracted`, `magic-vulnerable` |
| Hellfire | Heroic | Harrowed | Once per turn, use an action to attack with Athletics in a Cone Template for fire damage; targets may Evade. | `harrowed`, `athletics-attack`, `cone-template`, `damage-3d6`, `evade` |
| Implacable | Heroic | Harrowed | Can take one extra Wound before Incapacitation. Stacks with Tough as Nails style Edges. | `harrowed`, `extra-wound`, `incapacitation-threshold` |
| Infest | Novice | Harrowed | Spend a Benny and an action to control an existing nearby insect swarm for about five minutes. | `harrowed`, `benny-spend`, `action`, `swarm-control`, `duration-5-minutes` |
| Soul Eater | Veteran | Harrowed | After causing a Wound with a barehanded/claw Fighting attack, make a Spirit roll at a penalty to heal one Wound or one Fatigue. | `harrowed`, `self-healing`, `spirit-roll`, `barehanded`, `claws` |
| Spook | Novice | Harrowed | As an action, force one visible/nearby target to make a penalized Fear check. Can take Fatigue to affect all targets within 12 inches. | `harrowed`, `fear`, `action`, `fatigue-option`, `area-option` |
| Stitchin’ | Novice | Harrowed | Natural healing rolls happen daily instead of every five days if the Harrowed consumes meat for each attempt. | `harrowed`, `natural-healing`, `daily-healing`, `meat-requirement` |
| Improved Stitchin’ | Veteran | Harrowed, Stitchin’ | Natural healing rolls happen hourly instead of daily. | `harrowed`, `natural-healing`, `hourly-healing`, `improved-edge` |
| Supernatural Attribute | Novice | Harrowed | Raises one chosen attribute by two die types and increases that Trait’s limit, including linked skills. Can be taken once per attribute. | `harrowed`, `attribute-boost`, `subchoice`, `repeatable-limited` |
| Wither | Novice | Harrowed | Touch attack with opposed Spirit. On success, lowers target Strength for one hour; raise also lowers Vigor. Does not stack on same target. | `harrowed`, `touch`, `opposed-spirit`, `attribute-penalty`, `duration-1-hour` |

## Huckster Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Hexslinging | Seasoned | Arcane Background (Huckster), Shooting d8+ | Grants ammo whammy and lets the huckster make rune-carved hex guns. Certain powers can be cast on/with the hex gun without Multi-Action penalty. | `huckster`, `hex-gun`, `ammo-whammy`, `no-map-for-gun-powers`, `crafting` |
| High Roller | Seasoned | Spirit d8+, Arcane Background (Huckster), Spellcasting d6+ | Draw one extra card when Dealing with the Devil. | `huckster`, `deal-with-the-devil`, `extra-card` |
| Improved High Roller | Veteran | High Roller | Draw two extra cards total when Dealing with the Devil. | `huckster`, `deal-with-the-devil`, `extra-cards-2`, `improved-edge` |
| Old Hand | Heroic | Arcane Background (Huckster), Spellcasting d10+ | After forming a five-card poker hand for Deal with the Devil, discard up to three cards and redraw. | `huckster`, `deal-with-the-devil`, `redraw`, `poker-hand` |
| Whateley Blood | Novice | Arcane Background (Huckster) | Has an unsettling bloodline: social penalty to Persuasion. Can suffer Fatigue for 5 Power Points or a Wound for 10 Power Points as a free action. | `huckster`, `power-point-generation`, `fatigue-cost`, `wound-cost`, `persuasion-penalty` |

## Mad Scientist Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Alchemy | Seasoned | Arcane Background (Mad Scientist), Weird Science d8+ | Creates up to three short-lived potions/elixirs, each tying up one Power Point and costing reagents. Potion options cover healing, Trait boost, or Fatigue relief. | `mad-scientist`, `alchemy`, `potion`, `power-point-investment`, `reagent-cost` |
| Iron Bound | Novice | Arcane Background (Mad Scientist) | Starts with a large budget in infernal devices or vehicles and gets a discount from the relevant source later. | `mad-scientist`, `starting-gear-budget`, `infernal-devices`, `discount` |
| Ore Eater | Novice | Arcane Background (Mad Scientist), Weird Science d6+ | Gains 5 Power Points. Malfunction result 13 becomes ghost rock fever instead of the normal result. | `mad-scientist`, `power-points-plus-5`, `malfunction-modifier`, `ghost-rock-fever` |
| True Genius | Novice | Smarts d8+, Arcane Background (Mad Scientist) | Spend Bennies to reroll Madness or infernal-device Malfunction Table results, choosing the preferred result. | `mad-scientist`, `benny-spend`, `malfunction-reroll`, `madness-reroll` |

## Shaman Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Fetish | Novice | Arcane Background (Shaman), Faith d8+ | Free reroll on Faith rolls while the fetish is available. Replacement can be created with a ritual. | `shaman`, `faith-reroll`, `focus-item`, `replacement-ritual` |
| Spirit’s Favor | Seasoned | Arcane Background (Shaman), Faith d8+ | Choose one Shaman power each time this Edge is taken. That power can be cast as an action without Multi-Action penalty, once per turn. | `shaman`, `selected-power`, `no-map`, `repeatable`, `once-per-turn` |

## Territorial Ranger Edges

| Edge | Rank | Requirements summary | Short mechanical summary | App tags / effect hooks |
|---|---|---|---|---|
| Lieutenant | Seasoned | Territorial Ranger | Character is already a Ranger Lieutenant with Chapter 13 knowledge and three Favors. | `ranger`, `rank-up`, `favors-3`, `occult-knowledge` |
| Like an Oak | Veteran | Grit, Territorial Ranger | Allies near the Ranger reduce Fear penalties if the Ranger holds steady. Ranger checks first when the group checks together. | `ranger`, `fear-support`, `aura-12`, `ally-benefit`, `requires-grit` |

---

# Suggested Catalog Implementation Plan

## 1. Add catalogs

Add these exports to `src/catalogs.js` or split them into a dedicated catalog module if `catalogs.js` is getting too large:

```js
export const HINDRANCE_CATALOG = [];
export const EDGE_CATALOG = [];
```

Populate them using this document as the source reference.

## 2. Add validation helpers

Suggested helper categories:

```js
validateRankRequirement(character, edge)
validateAttributeRequirements(character, edge)
validateSkillRequirements(character, edge)
validatePrerequisiteEdges(character, edge)
validateConflicts(character, option)
validateArcaneBackgroundLimit(character, edge)
validateSubchoiceRequired(selection)
```

Do not block invalid selections automatically. Return warnings and allow Marshal override.

## 3. Store subchoices

Edges that need subchoice UI:

- Knack
- Reputation
- Superior Kung Fu
- Supernatural Attribute
- Spirit’s Favor
- Right Hand of the Devil
- Possibly Arcane Background starting powers

## 4. Preserve imported entries

Savaged.us imports may include notes, subchoices, or text not in the catalog. Do not discard imported text during normalization. If an imported Edge or Hindrance does not match the catalog, keep it as custom/imported.

## 5. Delay full automation

Start by adding catalog-backed selection, requirements warnings, summaries, and remove buttons. Automate only obvious safe effects first, such as Power Point grants, Fear modifiers, rerolls, ammo/combat options, and selected stance display.

---

# Highest-Value Automation Targets

These are worth automating soon because they directly help table play.

| Feature | Why it matters |
|---|---|
| Fan the Hammer / Improved Fan the Hammer | Direct combat button, ammo consumption, attack penalty, single-action revolver filter. |
| Whateley Blood | Direct Power Point recovery button with Fatigue/Wound cost. |
| Ore Eater | Adds +5 Power Points automatically. |
| Guts / Grit / True Grit | Fear checks are common and penalties are easy to display. |
| Born in the Saddle | Riding reroll and horse movement summary. |
| Card Sharp / High Roller / Old Hand | Huckster Deal with the Devil support. |
| Superior Kung Fu / Celestial Kung Fu | Stance selector for Chi Masters. |
| Harrowed Edges | Direct combat/status buttons for claws, ghost, hellfire, stitchin’, and spook. |
| Reputation | Social roll reminder based on good/bad reputation subchoice. |
| Spirit’s Favor | Removes Multi-Action penalty for selected Shaman power once per turn. |

---

# Quick Counts

| Type | Count |
|---|---:|
| Deadlands-specific Hindrances | 10 |
| Main Deadlands-specific Edges | 34 |
| Knack subchoices | 7 |
| Arcane / organization-specific Edges | 31 |
| Superior Kung Fu style subchoices | 7 |
| Total Edge names, excluding subchoices | 65 |

