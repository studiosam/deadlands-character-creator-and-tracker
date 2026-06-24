# Deadlands: The Weird West Powers Catalog Reference

## Purpose

This file is a project reference for adding a real power catalog and power-selection workflow to the Deadlands character creator and tracker. It lists every power that appears in the reviewed *Deadlands: The Weird West* player Arcane Background power lists, plus the Deadlands-specific powers from the book.

This is meant for app implementation and table reference. It uses short app-facing summaries rather than full rulebook text.

## Sources reviewed

```txt
Deadlands: The Weird West
https://anyflip.com/fmydc/hkmt/basic
```

```txt
Savage Worlds Adventure Edition core powers
https://online.fliphtml5.com/xzazx/umaq/#p=1
```

```txt
Parsed SWADE core power summary reference
https://anyflip.com/ihoof/gpte/basic/151-200
```

## Important implementation warning

The Deadlands book determines **which powers each Arcane Background can choose from**. The SWADE core rules determine the general mechanics for most powers.

Do not add every SWADE core power blindly. Use the Deadlands Arcane Background lists as the ruleset filter. The reviewed Deadlands player lists do **not** include every SWADE power.

Also, do not auto-add an entire power list when a player selects an Arcane Background. The Arcane Background sets the allowed list and starting count. The player still chooses their starting powers, except where the background requires a specific starting power.

## Recommended runtime data shape

```js
{
  id: "power-deflection",
  name: "Deflection",
  source: "SWADE Core",
  rank: "Novice",
  powerPoints: "3",
  range: "Smarts",
  duration: "5",
  allowedBackgrounds: ["Blessed", "Chi Master", "Huckster", "Mad Scientist", "Shaman"],
  requiredForBackgrounds: ["Chi Master"],
  restrictionsByBackground: {
    "Chi Master": "Beneficial powers become Self range."
  },
  shortSummary: "Foes subtract from attacks against the protected target; raise improves the penalty.",
  variableCostNotes: "Additional Recipients +1.",
  tags: ["defense", "buff", "additional-recipients", "active-duration"],
  supportsVariableSpend: true,
  supportsActiveToggle: true,
  supportsMaintenance: true,
  notes: ""
}
```

## Arcane Background power profiles

| Arcane Background | Arcane Skill | Power Points | Starting Powers | Required Starting Power | Special Notes |
|---|---|---|---|---|---|
| Blessed | Faith (Spirit) | 15 | 3: holy symbol plus two player choices | Holy Symbol | May take Miracles Edges. Critical Failure on Faith causes Fatigue and ends active powers. Sinnin’ can penalize or remove powers temporarily. |
| Chi Master | Focus (Spirit) | 15 | 3: deflection plus two player choices | Deflection | May take Gifted Edges. Beneficial powers are Self only. Detrimental powers are Touch range. These reductions do not grant Limitation discounts. |
| Huckster | Spellcasting (Smarts) | 10 | 3 player choices | None | May take Magic Edges. Cannot Short or spend Bennies for Power Points. Deal with the Devil can cast available powers even if not known and even if above current Rank. |
| Mad Scientist | Weird Science (Smarts) | 15 | 2 player choices | None | May take Weird Science Edges. Powers are inventions, gizmos, elixirs, or devices. Critical Failure triggers Infernal Device Malfunction. |
| Shaman | Faith (Spirit) | 15 | 2 player choices | None | May take Miracles Edges. If silenced, subtracts 2 from Faith rolls. Often paired with Old Ways Oath, but not required by default. |

## Arcane Background-specific restrictions

### Blessed

- Starting powers: `holy symbol` plus two player choices.
- `detect arcana` is available, but `conceal arcana` is not.
- `light` is available, but `darkness` is not.
- Blessed powers use Faith.
- Critical Failure on Faith causes Fatigue and ends active powers.
- Sinnin’ can penalize or remove Blessed powers temporarily.

### Chi Master

- Starting powers: `deflection` plus two player choices.
- `detect arcana` is available, but `conceal arcana` is not.
- Beneficial powers become Range `Self`.
- Detrimental powers become Range `Touch`.
- These range reductions do not grant the normal Limitation Power Point discount.
- `smite` can affect hands and feet as weapons.

### Huckster

- Starting powers: three player choices.
- Hucksters cannot Short or spend Bennies for Power Points.
- Deal with the Devil can attempt powers from the Huckster available list even if the power is not known and even if it is above the Huckster’s current Rank.
- The app should separate `Known Powers` from `Available Deal with the Devil Powers`.

### Mad Scientist

- Starting powers: two player choices.
- Powers are inventions, gizmos, elixirs, or devices.
- Critical Failure triggers Infernal Device Malfunction.
- `shrink` is available, but `growth` is not.

### Shaman

- Starting powers: two player choices.
- `growth` is available, but `shrink` is not.
- If silenced, the Shaman subtracts 2 from Faith rolls.
- Many Shamans take Old Ways Oath, but the Arcane Background does not require it by default.

---

# Master Powers Catalog

The table below is the app-facing power catalog for powers valid in Deadlands: The Weird West based on the reviewed Arcane Background lists.

| Power | Source | Rank | PP | Range | Duration | Allowed Backgrounds | Short Summary | Variable Spend / Modifier Notes | Deadlands Restriction Notes |
|---|---|---|---|---|---|---|---|---|---|
| Ammo Whammy | Deadlands | Seasoned | 4 | Self | 5 | Huckster | Hexslinger empowers shots from a hex gun with special shot effects. | Requires Huckster + Hexslinging. Special shot effects are selected per shot; raise can allow two effects. | Huckster: Requires Hexslinging Edge. |
| Arcane Protection | SWADE | Novice | 1 | Smarts | 5 | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Enemy casters take a penalty to affect the target; damaging powers are reduced by the same amount. | Additional Recipients +1. |  |
| Banish | SWADE + Deadlands note | Veteran | 3 | Smarts | Instant | Blessed, Shaman | Opposed roll to banish extraplanar or similar entities. In Deadlands, Harrowed manitous are made inert temporarily, not destroyed. | Deadlands Harrowed handling. |  |
| Barrier | SWADE | Novice | 2 | Smarts | 5 | Blessed, Huckster, Mad Scientist | Creates a short Hardness 10 wall or barrier. | Damage, Hardened, Shaped, Size. |  |
| Beast Friend | SWADE | Novice | Special | Smarts | 10 minutes | Blessed, Huckster, Mad Scientist, Shaman | Communicate with and guide natural animals; cost depends on controlled creatures’ Size. | Variable cost by creature Size and count. |  |
| Blast | SWADE | Seasoned | 3 | Smarts ×2 | Instant | Mad Scientist | Area attack, usually Medium Blast Template, for energy or matter damage. | Area Effect and Damage modifiers. |  |
| Blind | SWADE | Novice | 2 | Smarts | Instant | Blessed, Huckster, Mad Scientist, Shaman | Inflicts sight penalties that the victim can recover from over turns. | Potential strong/area handling; automate later. |  |
| Bolt | SWADE | Novice | 1 | Smarts ×2 | Instant | Huckster, Mad Scientist | Ranged arcane attack for 2d6 damage, 3d6 with a raise. | Damage +2; attack penalties apply normally. |  |
| Boost/Lower Trait | SWADE | Novice | 2 | Smarts | 5 boost / Instant lower | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Boost raises an ally’s Trait temporarily; lower reduces an enemy’s Trait and allows recovery attempts. | Additional Recipients for boost; Strong for lower. |  |
| Burrow | SWADE | Novice | 2 | Smarts | 5 | Chi Master, Mad Scientist, Shaman | Target tunnels through earth or similar material and may emerge later. | Additional Recipients +1. |  |
| Burst | SWADE | Novice | 2 | Cone Template | Instant | Huckster, Mad Scientist | Cone-shaped attack for 2d6 damage, 3d6 with a raise. | Damage +2. |  |
| Confusion | SWADE | Novice | 1 | Smarts | Instant | Blessed, Huckster, Mad Scientist, Shaman | Makes targets Distracted, Vulnerable, or worse depending on result. | Area/Strong modifiers may be useful. |  |
| Curse | Deadlands | Seasoned | 5 | Touch | Permanent | Chi Master, Shaman | Opposed roll; victim suffers recurring Fatigue and possible death unless curse is lifted. | Dispel can remove, but each helper gets only one attempt. |  |
| Damage Field | SWADE | Novice | 4 | Self | 5 | Huckster, Mad Scientist | Creates a damaging aura that harms adjacent beings at the end of their turns. | Damage +2. |  |
| Darksight | SWADE | Novice | 1 | Smarts | One hour | Chi Master, Mad Scientist, Shaman | Allows target to ignore darkness or illumination penalties. | Additional Recipients +1. |  |
| Deflection | SWADE | Novice | 3 | Smarts | 5 | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Foes subtract from attacks against the protected target; raise improves the penalty. | Additional Recipients +1. Main target-count UI test case. Verify PP cost if your table’s book printing differs. |  |
| Detect/Conceal Arcana | SWADE | Novice | 2 | Smarts | 5 detect / 1 hour conceal | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Detect reveals supernatural beings, objects, and effects. Conceal hides arcane nature. | Additional Recipients +1; Conceal Area Effect and Strong. Blessed and Chi Master are detect-only. | Blessed: Detect only; conceal is not available. Chi Master: Detect only; conceal is not available. |
| Disguise | SWADE | Seasoned | 2 | Smarts | 10 minutes | Huckster, Mad Scientist, Shaman | Target appears to be someone else; observers may see through it. | Additional Recipients +1. |  |
| Dispel | SWADE | Novice | 1 | Smarts | Instant | Blessed, Huckster, Mad Scientist, Shaman | Negates active powers or magical effects. | Automate as active-power remover later. |  |
| Divination | SWADE | Seasoned | 5 | Self | 5 minutes | Blessed, Huckster, Shaman | Ask questions of supernatural entities or forces. | Manual notes/questions first. |  |
| Drain Power Points | SWADE | Veteran | 3 | Smarts | Instant | Mad Scientist, Shaman | Opposed arcane roll drains Power Points from another caster. | Track drained PP and target pool. |  |
| Elemental Manipulation | SWADE | Novice | 1 | Smarts | 5 | Blessed, Huckster, Mad Scientist, Shaman | Minor manipulation of air, earth, fire, or water. | Utility/manual effect. |  |
| Empathy | SWADE | Novice | 2 | Smarts | 5 | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Read or influence emotions; helps social interaction or animals depending on use. | Social bonus/reminder. |  |
| Entangle | SWADE | Novice | 2 | Smarts | Instant | Huckster, Mad Scientist, Shaman | Binds or Entangles foes until they break free. | Track Entangled/Bound state later. |  |
| Environmental Protection | SWADE | Novice | 2 | Touch | One hour | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Protects against environmental hazards and similar damaging sources. | Additional Recipients +1. |  |
| Farsight | SWADE | Seasoned | 2 | Smarts | 5 | Chi Master, Huckster, Mad Scientist, Shaman | See far details; raise helps reduce ranged penalties. | Additional Recipients +1. |  |
| Fear | SWADE | Novice | 2 | Smarts | Instant | Huckster, Mad Scientist, Shaman | Targets make Fear checks; raise worsens result. | Area Effect +2/+3. |  |
| Fly | SWADE | Veteran | 3 | Smarts | 5 | Mad Scientist | Target flies at high Pace; raise improves flight speed. | Additional Recipients +2. |  |
| Growth/Shrink | SWADE | Seasoned | Special | Smarts | 5 | Mad Scientist, Shaman | Increase or reduce Size by spending Power Points. | Variable cost by Size change. Mad Scientist is shrink-only; Shaman is growth-only. | Mad Scientist: Shrink only; growth is not available. Shaman: Growth only; shrink is not available. |
| Havoc | SWADE | Seasoned | 2 | Smarts | Instant | Blessed, Huckster, Mad Scientist, Shaman | Targets in an area are Distracted and may be hurled. | Template/opposed handling manual first. |  |
| Healing | SWADE | Novice | 3 | Touch | Instant | Blessed, Chi Master, Mad Scientist, Shaman | Restores recent Wounds and may handle other recovery with modifiers/timing. | Connect to wound tracker later. |  |
| Holy Symbol | Deadlands | Novice | 3 | Self | 5 | Blessed, Shaman | Supernaturally evil creatures must pass Spirit to directly physically attack the bearer. | Area Effect +2/+3; Strong +1. Blessed required starting power. |  |
| Illusion | SWADE | Novice | 3 | Smarts | 5 | Huckster, Mad Scientist | Creates imaginary images or sensory effects. | Size/area manual first. |  |
| Intangibility | SWADE | Heroic | 5 | Smarts | 5 | Huckster, Mad Scientist, Shaman | Target becomes incorporeal. | Active toggle recommended. |  |
| Invisibility | SWADE | Seasoned | 5 | Smarts | 5 | Huckster, Mad Scientist | Target becomes difficult to detect and affect. | Additional recipients may be supported depending on source. |  |
| Light/Darkness | SWADE | Novice | 2 | Smarts | 10 minutes | Blessed, Huckster, Mad Scientist | Creates or dispels illumination or darkness. | Blessed is light-only. | Blessed: Light only; darkness is not available. |
| Mind Wipe | SWADE | Veteran | 3 | Touch | Instant | Mad Scientist | Removes or alters memories. | Mad Scientist only among reviewed Deadlands player lists. |  |
| Numb | Deadlands | Novice | 2 | Spirit | 5 | Chi Master, Huckster, Mad Scientist, Shaman | Caster and nearby allies ignore some Wound or Fatigue penalties; raise improves amount and suppresses temporary injuries. | Area is based on caster Spirit in tabletop inches. |  |
| Object Reading | SWADE | Seasoned | 2 | Touch | Instant | Huckster | Reads psychic impressions from an object’s history. | Huckster only among reviewed Deadlands player lists. |  |
| Protection | SWADE | Novice | 1 | Smarts | 5 | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Grants Armor +2, or +4 with a raise. | Additional Recipients +1; More Armor may apply depending on source. |  |
| Puppet | SWADE + Deadlands modifier | Veteran | 3 | Smarts | 5 | Huckster, Mad Scientist | Opposed roll to control a target’s actions. | Deadlands adds Mind Rider +1 modifier. |  |
| Relief | SWADE | Novice | 1 | Touch | Instant | Blessed, Chi Master, Mad Scientist, Shaman | Removes Fatigue or Shaken; raise can remove Stunned. | Additional Recipients +1. |  |
| Resurrection | SWADE | Heroic | 30 | Touch | Instant | Blessed, Shaman | Brings the dead back to life under strict limits. | High-cost, Marshal-sensitive power. |  |
| Sanctify | Deadlands | Veteran | 10 | Special | Until next sunset | Blessed, Shaman | Long ritual creates sacred ground that harms or deters supernaturally evil creatures entering it. | Four-hour ritual; noncombat location effect. |  |
| Shape Change | SWADE | Seasoned | Special | Self | 5 | Shaman | Caster takes on animal or creature form depending on cost and Rank. | Variable cost by form. |  |
| Sloth/Speed | SWADE | Novice | 2 | Smarts | Instant sloth / 5 speed | Blessed, Chi Master, Huckster, Mad Scientist, Shaman | Sloth reduces movement/actions; Speed increases movement/actions. | Track chosen mode. |  |
| Slumber | SWADE | Seasoned | 2 | Smarts ×5 | One hour | Huckster, Mad Scientist, Shaman | Puts targets to sleep if they fail resistance. | Area/Strong may be useful. |  |
| Smite | SWADE | Novice | 2 | Smarts | 5 | Blessed, Chi Master, Mad Scientist, Shaman | Increases a weapon’s damage by +2, or +4 with a raise. | Additional Recipients +1. Chi Master hands/feet count as weapons. | Chi Master: Hands and feet count as weapons for this power. |
| Sound/Silence | SWADE | Novice | 1 | Smarts | Instant sound / 5 silence | Huckster, Mad Scientist | Creates sound or mutes sound in an area or target. | Track chosen mode. |  |
| Speak Language | SWADE | Novice | 1 | Smarts | 10 minutes | Blessed, Huckster, Mad Scientist, Shaman | Caster can speak and understand languages. | Additional Recipients +1. |  |
| Stun | SWADE | Novice | 2 | Smarts | Instant | Blessed, Huckster, Mad Scientist | Target is Stunned on failed resistance. | Area Effect may be useful. |  |
| Summon Ally | SWADE | Novice | Special | Smarts ×2 | 5 | Huckster, Shaman | Conjures an allied creature; cost depends on ally strength. | Variable cost by ally type. |  |
| Telekinesis | SWADE | Seasoned | 5 | Smarts | 5 | Huckster, Mad Scientist | Moves objects with high effective Strength; raise improves Strength. | Track target/object manually first. |  |
| Teleport | SWADE | Seasoned | 2 | Smarts | Instant | Huckster, Mad Scientist, Shaman | Teleports the character a short distance. | Distance/recipients manual first. |  |
| Trinkets | Deadlands | Novice | 3 | Smarts | 5 | Huckster | Huckster creates a small mundane item under one pound; fades when duration ends. | Complete +1; Weight +2. Raise changes duration scale to minutes. |  |
| Wall Walker | SWADE | Novice | 2 | Smarts | 5 | Chi Master, Huckster, Mad Scientist, Shaman | Target walks on walls or ceilings. | Additional Recipients +1. |  |
| Warrior’s Gift | SWADE | Seasoned | 4 | Smarts | 5 | Blessed, Chi Master, Mad Scientist, Shaman | Temporarily grants a Combat Edge. | Requires Edge selection; good subchoice test. |  |
| Wilderness Walk | Deadlands | Novice | 2 | Self | One hour | Shaman | Shaman shortens long overland travel and hides tracks after walking at least one mile. | Additional Recipients +1; raise improves travel compression. |  |
| Zombie | SWADE | Veteran | 3 | Smarts | One hour | Mad Scientist | Raises and controls undead from available corpses. | Additional Zombies, Armed, Armor, Mind Rider. |  |

---

# Available Powers by Arcane Background

## Blessed Available Powers

| Power | Required starting power? | Restriction / note |
|---|---|---|
| Arcane Protection |  |  |
| Banish |  |  |
| Barrier |  |  |
| Beast Friend |  |  |
| Blind |  |  |
| Boost/Lower Trait |  |  |
| Confusion |  |  |
| Deflection |  |  |
| Detect/Conceal Arcana |  | Detect only; conceal is not available. |
| Dispel |  |  |
| Divination |  |  |
| Elemental Manipulation |  |  |
| Empathy |  |  |
| Environmental Protection |  |  |
| Havoc |  |  |
| Healing |  |  |
| Holy Symbol | Yes |  |
| Light/Darkness |  | Light only; darkness is not available. |
| Protection |  |  |
| Relief |  |  |
| Resurrection |  |  |
| Sanctify |  |  |
| Sloth/Speed |  |  |
| Smite |  |  |
| Speak Language |  |  |
| Stun |  |  |
| Warrior’s Gift |  |  |
## Chi Master Available Powers

| Power | Required starting power? | Restriction / note |
|---|---|---|
| Arcane Protection |  |  |
| Boost/Lower Trait |  |  |
| Burrow |  |  |
| Curse |  |  |
| Darksight |  |  |
| Deflection | Yes |  |
| Detect/Conceal Arcana |  | Detect only; conceal is not available. |
| Empathy |  |  |
| Environmental Protection |  |  |
| Farsight |  |  |
| Healing |  |  |
| Numb |  |  |
| Protection |  |  |
| Relief |  |  |
| Sloth/Speed |  |  |
| Smite |  | Hands and feet count as weapons for this power. |
| Wall Walker |  |  |
| Warrior’s Gift |  |  |
## Huckster Available Powers

| Power | Required starting power? | Restriction / note |
|---|---|---|
| Ammo Whammy |  | Requires Hexslinging Edge. |
| Arcane Protection |  |  |
| Barrier |  |  |
| Beast Friend |  |  |
| Blind |  |  |
| Bolt |  |  |
| Boost/Lower Trait |  |  |
| Burst |  |  |
| Confusion |  |  |
| Damage Field |  |  |
| Deflection |  |  |
| Detect/Conceal Arcana |  |  |
| Disguise |  |  |
| Dispel |  |  |
| Divination |  |  |
| Elemental Manipulation |  |  |
| Empathy |  |  |
| Entangle |  |  |
| Environmental Protection |  |  |
| Farsight |  |  |
| Fear |  |  |
| Havoc |  |  |
| Illusion |  |  |
| Intangibility |  |  |
| Invisibility |  |  |
| Light/Darkness |  |  |
| Numb |  |  |
| Object Reading |  |  |
| Protection |  |  |
| Puppet |  |  |
| Sloth/Speed |  |  |
| Slumber |  |  |
| Sound/Silence |  |  |
| Speak Language |  |  |
| Stun |  |  |
| Summon Ally |  |  |
| Telekinesis |  |  |
| Teleport |  |  |
| Trinkets |  |  |
| Wall Walker |  |  |
## Mad Scientist Available Powers

| Power | Required starting power? | Restriction / note |
|---|---|---|
| Arcane Protection |  |  |
| Barrier |  |  |
| Beast Friend |  |  |
| Blast |  |  |
| Blind |  |  |
| Bolt |  |  |
| Boost/Lower Trait |  |  |
| Burrow |  |  |
| Burst |  |  |
| Confusion |  |  |
| Damage Field |  |  |
| Darksight |  |  |
| Deflection |  |  |
| Detect/Conceal Arcana |  |  |
| Disguise |  |  |
| Dispel |  |  |
| Drain Power Points |  |  |
| Elemental Manipulation |  |  |
| Empathy |  |  |
| Entangle |  |  |
| Environmental Protection |  |  |
| Farsight |  |  |
| Fear |  |  |
| Fly |  |  |
| Havoc |  |  |
| Healing |  |  |
| Illusion |  |  |
| Intangibility |  |  |
| Invisibility |  |  |
| Light/Darkness |  |  |
| Mind Wipe |  |  |
| Numb |  |  |
| Protection |  |  |
| Puppet |  |  |
| Relief |  |  |
| Growth/Shrink |  | Shrink only; growth is not available. |
| Sloth/Speed |  |  |
| Slumber |  |  |
| Smite |  |  |
| Sound/Silence |  |  |
| Speak Language |  |  |
| Stun |  |  |
| Telekinesis |  |  |
| Teleport |  |  |
| Wall Walker |  |  |
| Warrior’s Gift |  |  |
| Zombie |  |  |
## Shaman Available Powers

| Power | Required starting power? | Restriction / note |
|---|---|---|
| Arcane Protection |  |  |
| Banish |  |  |
| Beast Friend |  |  |
| Blind |  |  |
| Boost/Lower Trait |  |  |
| Burrow |  |  |
| Confusion |  |  |
| Curse |  |  |
| Darksight |  |  |
| Deflection |  |  |
| Detect/Conceal Arcana |  |  |
| Disguise |  |  |
| Dispel |  |  |
| Divination |  |  |
| Drain Power Points |  |  |
| Elemental Manipulation |  |  |
| Empathy |  |  |
| Entangle |  |  |
| Environmental Protection |  |  |
| Farsight |  |  |
| Fear |  |  |
| Growth/Shrink |  | Growth only; shrink is not available. |
| Havoc |  |  |
| Healing |  |  |
| Holy Symbol |  |  |
| Intangibility |  |  |
| Numb |  |  |
| Protection |  |  |
| Relief |  |  |
| Resurrection |  |  |
| Sanctify |  |  |
| Shape Change |  |  |
| Sloth/Speed |  |  |
| Slumber |  |  |
| Smite |  |  |
| Speak Language |  |  |
| Summon Ally |  |  |
| Teleport |  |  |
| Wall Walker |  |  |
| Warrior’s Gift |  |  |
| Wilderness Walk |  |  |

---

# Power-selection workflow recommendation

When a player chooses or imports an Arcane Background, the app should follow this flow:

```txt
Arcane Background selected
→ set arcane skill
→ set Power Points max/current
→ load allowed power list
→ auto-add or require mandatory starting power if applicable
→ prompt player to choose remaining starting powers
→ allow add/remove/edit powers manually
→ warn if a power is invalid for background, rank, or restrictions
→ allow Marshal override
```

## Known Powers vs Available Powers

Store these separately:

```js
character.powers.known = []
character.powers.available = []
```

For most Arcane Backgrounds, the `available` list is only used for choosing legal known powers. For Hucksters, the `available` list matters during play because Deal with the Devil can cast available powers that are not normally known.

## Power entry shape on the character

```js
{
  id: "character-power-deflection",
  catalogId: "power-deflection",
  name: "Deflection",
  source: "SWADE Core",
  arcaneBackground: "Chi Master",
  rank: "Novice",
  basePowerPoints: 3,
  range: "Self",
  originalRange: "Smarts",
  duration: "5",
  trapping: "",
  shortSummary: "Foes subtract from attacks against the protected target; raise improves the penalty.",
  modifiers: [],
  notes: "",
  isActive: false,
  activeTargets: [],
  addedReason: "starting-power",
  isCustom: false
}
```

## Reasons for adding a power

Track why a power was added:

```txt
starting-power
new-powers-edge
imported
manual-correction
custom-homebrew
marshal-override
deal-with-the-devil-temporary
```

## Variable Power Point spending

This is a required feature, not a polish detail.

Some powers need variable spending:

- Additional Recipients
- Area Effect
- Strong
- Damage
- Growth/Shrink size changes
- Summon Ally ally strength
- Beast Friend creature Size/count
- Trinkets Complete/Weight
- Holy Symbol Area Effect/Strong
- Wilderness Walk Additional Recipients

Deflection should be the main test case because players commonly want to affect multiple allies.

Suggested UI model:

```js
{
  baseCost: 3,
  selectedModifiers: [
    { id: "additional-recipients", label: "Additional Recipients", costPer: 1, quantity: 4 }
  ],
  totalCost: 7
}
```

If your table’s book printing has a different base PP cost for a power than this catalog, adjust the catalog value and keep the variable modifier structure.

## Active powers and maintenance

Powers with non-Instant durations should support:

- Cast / spend PP
- Mark active
- Track target names or count
- End power
- Maintain power
- Reminder text for duration
- Active power list on Combat and Arcane tabs

Instant powers should generally not need active toggles.

## High-priority implementation tests

1. Blessed selection adds or requires `Holy Symbol`, then prompts for two more Blessed powers.
2. Chi Master selection adds or requires `Deflection`, then prompts for two more Chi powers.
3. Huckster Known Powers and Deal with the Devil Available Powers remain separate.
4. Mad Scientist powers use Weird Science and malfunction notes.
5. Shaman Faith rolls show the silenced penalty reminder.
6. `Detect/Conceal Arcana` shows detect-only restriction for Blessed and Chi Master.
7. `Light/Darkness` shows light-only restriction for Blessed.
8. `Growth/Shrink` shows shrink-only for Mad Scientist and growth-only for Shaman.
9. `Deflection` supports Additional Recipients variable PP spending.
10. `Beast Friend`, `Growth/Shrink`, `Shape Change`, and `Summon Ally` do not assume fixed-cost casting only.

## Suggested file/module names for implementation

```txt
src/power-catalog.js
src/power-validation.js
src/power-spending.js
```

Or, if the project keeps all catalogs in one file:

```txt
src/catalogs.js
```

Add exports like:

```js
export const POWER_CATALOG = [];
export const ARCANE_BACKGROUND_POWER_PROFILES = {};
```

## Acceptance criteria for the future Codex implementation

- App loads without console errors.
- Selecting an Arcane Background limits power choices correctly.
- Mandatory starting powers are added or clearly prompted.
- Players can add valid known powers from a catalog.
- Players can remove powers for corrections or Marshal-approved retraining.
- Invalid powers show warnings but can be overridden.
- Hucksters can see Known Powers and Available Deal with the Devil powers separately.
- Variable PP spending works for Deflection and at least one other power.
- Active duration powers can be marked active and ended.
- Imported powers are preserved even if they do not match the catalog exactly.
