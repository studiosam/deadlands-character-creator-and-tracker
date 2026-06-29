# Mechanics Roadmap

This roadmap tracks the app's remaining rules-mechanics work against the current
Deadlands: The Weird West and Savage Worlds Adventure Edition scope. It is a
product roadmap, not a replacement for the official books.

Primary rulebook scope:

- Deadlands: The Weird West
- Savage Worlds Adventure Edition

The app should continue to avoid reproducing long rulebook text. Catalog and UI
copy should stay short, app-facing, and useful only to players who already own
the rules.

## Current Strengths

- Character tracking: wounds, fatigue, Bennies, Conviction, conditions,
  resources, notes, and table reminders.
- Inventory and load: weapons, loaded rounds, reserve ammunition, armor,
  general gear, consumables, vehicles, storage locations, containers, backpack
  load, combat load, carried load, and off-person storage.
- Catalogs: substantial Deadlands and SWADE Edges, Hindrances, Powers, Gear,
  Armor, Weapons, and Vehicles.
- Character Setup shell: Concept, Human ancestry review, Hindrances, Trait
  spending, partial starting Edge enforcement, starting Powers selection,
  Powers audit, starting Gear purchases, Gear audit, and Review.
- Advancement: canonical ledger entries for current supported advancement
  types, canonical changes, application, persistence, and safe undo model.
- Arcane support: Arcane Background profiles, Power Points, known powers,
  catalog power filtering, variable Power Point spending, and Huckster Deal with
  the Devil helper state.
- Data workflows: Savaged.us import, app JSON import/export, local character
  library, profile editing, and full-state backup.

## Major Mechanics Gaps

### Character Creation

- Starting Powers selection is partially implemented. The app can identify
  Arcane Background expectations, required starting powers, Power Points, and
  obvious mismatches, and created pre-advance characters can add/remove
  source-tagged setup starting powers and set source-tagged starting Power
  Points. Remaining work includes stronger Power legality validation and
  creation-baseline coverage.
- Starting Gear purchases are partially implemented. The app tracks equipment
  and load well, uses screenshot-aligned catalog data, and created pre-advance
  characters can buy source-tagged catalog gear from setup funds. Remaining work
  includes free gear, organization gear, and setup exception records.
- Creation baselines now snapshot finalized eligible created characters across
  Attributes, Skills, Hindrances, starting Edges, Powers, Gear, money, and setup
  source fields. Basic GM/table exception marking now stores metadata on the
  affected record and in `setupExceptions`. Remaining work is richer exception
  notes and free/source-granted gear modeling.
- Imported advanced characters are not reconstructed back to original creation
  state, and that should remain advisory rather than blocking.

### Edges And Hindrances

- Starting Edge enforcement is partial: catalog match, Rank, simple Trait die
  requirements, prerequisite Edge names, duplicate prevention, and slot counts.
- Complex Edge prerequisites, subchoices, conflicts, repeat limits, one-Arcane
  Background rules, and organization-specific bookkeeping are mostly not
  automated.
- Most Edge and Hindrance mechanical effects are reference-only. Examples that
  need future hooks include bonus/reroll effects, wound penalty changes,
  session resource changes, Fear modifiers, minimum Strength changes, social
  penalties, and combat options.
- Hindrance reduction/removal as Advancement is not implemented.

### Combat And Table Action

- Combat is currently a player-state cockpit, not a SWADE combat engine.
- Missing tactical systems include action deck initiative, Jokers, Hold/interrupt
  handling, Multi-Action Penalty helpers, Tests, Support, Soak, Incapacitation,
  Bleeding Out resolution, recovery rolls, attack resolution, damage resolution,
  cover, range, lighting, called shots, gang-up, prone interactions, and size
  modifiers.
- Weapon tracking handles loaded rounds and reserve ammunition, but does not
  automate attack rolls, damage rolls, rate-of-fire choices, recoil, innocent
  bystander handling, or special combat Edge actions.

### Powers And Arcane Backgrounds

- Known Powers and Power Point spending are functional, but most power effects
  are not mechanically applied to the character or targets.
- Active powers do not yet have full duration, maintenance, disruption, target,
  template, modifier, or effect-state tracking.
- Arcane Background consequences are mostly reminders. Future work should cover
  Blessed sin/backlash notes, Chi Master restrictions, Huckster Deal with the
  Devil outcomes, Mad Scientist malfunction, Shaman restrictions, and Power
  Points recovery modifiers.
- Huckster available powers are separated from Known Powers, but full Deal with
  the Devil resolution is not automated.

### Deadlands Setting Rules

- Deadlands setting rules are mostly not automated. High-value future areas
  include Fear levels and Fear results, formal duels, Harrowed/manitou rules,
  infernal devices, ghost rock, superstitions, hangings, stampedes, travel
  hazards, organization favors/ranks, and tale-telling effects.
- Marshal-facing systems such as encounter generation, Fear Level management,
  adventure generation, and creature/NPC stat blocks are outside the current
  player tracker but may become a separate mode later.

### Ruleset Configuration

- Sources & Rulesets is read-only. There is no editable campaign profile.
- The current default should remain a built-in Deadlands profile. Editable
  source configuration should wait until the player-facing mechanics are more
  complete.

## Roadmap Phases

### Phase 1: Finish Character Setup Mechanics

Goal: make app-created characters explainable from creation baseline plus
Advancement.

1. Harden starting Powers setup selection and validation.
2. Validate Arcane Background power lists, required starting powers, starting
   power counts, and starting Power Points.
3. Harden starting Gear purchase validation and source tracking.
4. Extend creation baselines to Hindrances, starting Edges, Powers, Gear, and
   money. Completed for eligible finalized created characters.
5. Add explicit GM or table exception records for setup-time deviations.
   Basic metadata marking is implemented; richer notes remain follow-up work.

Completion criteria:

- A newly created character can be finalized with a recorded creation baseline
  that explains starting Attributes, Skills, Hindrances, starting Edges, Powers,
  Gear, and money.
- Created pre-advance characters can choose legal starting Powers from the
  matched Arcane Background profile, including required starting powers.
- Created pre-advance characters can record starting Gear purchases against
  starting funds and explain free or source-granted gear separately.
- Setup status reflects missing required choices, overspending, invalid
  source-tracked choices, and explicit GM exceptions consistently.
- Imported and advanced characters remain audit-only unless the app has reliable
  creation-time data.
- Browser tests cover starting Powers selection, starting Gear purchase
  validation, creation baseline persistence, setup source persistence, setup
  exception persistence, and reload/export/import behavior.

Phase 1 is not complete until the app can answer: "What did this character
start with, what rule or source granted it, and what later changed?"

### Phase 2: Edge And Hindrance Effect Hooks

Goal: move from reference-only entries to explainable mechanical modifiers where
safe.

Current implementation:

- `src/tracker/effect-hooks.js` defines a small deterministic metadata registry
  for passive character-local hooks.
- Brawny, Small, and Obese now adjust displayed Size and Toughness where
  applicable.
- Fleet-Footed and Obese now adjust displayed Pace and show running-die
  reminders.
- Brawny and Soldier now share the same registry path for effective Strength
  used by Encumbrance and Minimum Strength checks.
- Obese uses the same registry path to lower effective Strength for Minimum
  Strength checks without lowering Encumbrance capacity.
- Hindrance severity now has helper-level matching for `minor`, `major`, and
  `unknown`; Slow uses this to apply different Minor and Major passive effects.
- Structured `roll-modifier` effects now render as passive Character and Combat
  reminders for Alertness, Brave, Danger Sense, All Thumbs, Anemic, Mean, Mild
  Mannered, and Yellow.
- Block and Improved Block now apply baseline-aware Parry math when a trusted
  `baseParry` is available or the character is app-created; imported characters
  without a baseline keep recorded Parry and show the passive effect as a
  reminder only.
- Brawler now applies baseline-aware Toughness math for trusted created
  characters and remains reminder-only for imported characters without trusted
  derived baselines.
- Nerves of Steel and Improved Nerves of Steel now reduce displayed active
  wound penalties, with Improved Nerves replacing rather than stacking with the
  base Edge.
- Tough as Nails and Tougher than Nails now apply baseline-aware Wound capacity
  math. They raise maximum Wounds to four or five before Incapacitation; they
  do not alter Toughness.
- Explicit `automation-status` markers now surface entries that are known but
  not safely automated yet, including manual/table-only, resource-model,
  action-state, and subchoice-required effects.
- Trademark Weapon and Reputation now store explicit subchoice metadata; their
  status markers change from `subchoice-required` to `subchoice-selected` once
  the chosen weapon or reputation type is recorded.
- Character, Combat, and Inventory surfaces show passive-effect explanations
  instead of relying only on catalog text.

Effect Hook Candidate Audit:

- Already implemented: Alertness, Block, Brave, Brawler, Brawny, Danger Sense,
  Improved Block, Improved Nerves of Steel, Soldier, Fleet-Footed, All Thumbs,
  Anemic, Mean, Mild Mannered, Nerves of Steel, Small, Slow, Tough as Nails,
  Tougher than Nails, Yellow, and Obese.
- Explicitly marked but not fully automated: Berserk, Luck, Great Luck, Bad
  Luck, Quick, Hesitant, Level Headed, unresolved Trademark Weapon, and
  unresolved Reputation.
- Subchoice storage implemented: Trademark Weapon chosen weapon and Reputation
  good/bad type.
- Passive math, high confidence: Weapon Master and Master of Arms. These should
  be baseline-aware before they mutate derived values so imported totals are not
  double-counted.
- Roll modifier reminders, high confidence: Clueless, Clumsy, One Eye,
  Tongue-Tied, Arcane Resistance, Improved Arcane Resistance, Aristocrat,
  Attractive, Very Attractive, Elan, Fast Healer, Healer, Iron Jaw,
  Investigator, Mr. Fix It, Streetwise, Strong Willed, Thief, Woodsman,
  Menacing, Guts, Grit, True Grit, and Whateley Blood. These should use
  structured `roll-modifier` or reminder metadata before deeper roll automation
  exists.
- Initiative and Action Card reminders: Bad Luck, Hesitant, Luck, Great Luck,
  Quick, Level Headed, Improved Level Headed, Calculating, Dead Shot, Mighty
  Blow, Tactician, Master Tactician, Quick Draw, and Fast as Lightning. These
  should remain reminders until Combat has action-card state.
- Resource or session-start effects: Bad Luck, Luck, Great Luck, Power Points,
  Rapid Recharge, Improved Rapid Recharge, Power Surge, Soul Drain, and Behold
  a Pale Horse. These need source-tracked resource/session handling rather than
  one-time silent mutations.
- Subchoice or target-required effects: Scholar, Trademark Weapon, Improved
  Trademark Weapon, Reputation, Martial Artist, Martial Warrior, Chi, Champion,
  Assassin, Giant Killer, Double Tap, Dodge, Improved Dodge, Marksman, Rapid
  Fire, Improved Rapid Fire, Rich, Filthy Rich, and Arcane Background. These
  need stored choices or action context before reliable automation.
- Severity-dependent Hindrances after Slow: Ailin', Bad Eyes, Enemy, Habit,
  Hard of Hearing, Obligation, Outsider, Pacifist, Phobia, Ruthless, Secret,
  Shamed, Suspicious, Thin Skinned, Ugly, Vengeful, Vow, Wanted, Young,
  Talisman, and Trouble Magnet. Most should begin as reminders until the app has
  the relevant roll/resource/creation model.
- Manual or table-only for now: Berserk, Cursed, Grim Servant o' Death, Old
  Ways Oath, Tenderfoot, Tale-Teller, organization rank/favor Edges, Harrowed
  powers, Mad Scientist device Edges, Shaman restriction Edges, Behold a Pale
  Horse, and most story or Marshal-facing effects.
- Next safest code slice: either add session/action-card resource models for
  marked entries such as Luck and Quick, expand `roll-modifier` coverage to the
  remaining high-confidence reminders, or add subchoice storage for the next
  target-required Edge group.

1. Add structured effect metadata for high-impact Edges and Hindrances.
2. Apply passive effects that are unambiguous and character-local.
3. Add warnings, not hard blocks, for complex requirements and table-dependent
   cases.
4. Add subchoice storage for Edges that require a selected Trait, weapon, style,
   contact, reputation type, or supernatural option.
5. Implement Hindrance reduction/removal Advancement.

Completion criteria:

- Catalog entries that affect current character math have structured,
  machine-readable effect metadata instead of only text summaries.
- Passive, character-local effects update relevant displayed values or warnings
  without requiring users to manually remember them.
- Edge subchoices are stored on the character and survive reload/export/import.
- Requirement validation distinguishes reliable checks, partial checks,
  GM-overridable warnings, and unsupported complex requirements.
- Hindrance reduction/removal is represented in the canonical Advancement
  ledger and updates the character safely.
- Browser tests cover at least one representative passive Edge, one Hindrance
  effect or warning, one subchoice Edge, one complex-prerequisite warning, and
  Hindrance reduction/removal.

Phase 2 is not complete until common Edges and Hindrances are more than labels:
they either affect the sheet, produce a specific warning, or are explicitly
marked as manual/table-only.

### Phase 3: Power Runtime Improvements

Goal: support powers during play without turning the app into a full VTT.

1. Track active powers with duration, maintenance, targets, trapping notes, and
   Power Point cost.
2. Add Disruption and expiration reminders.
3. Add common character-local power effects such as armor, defense penalties,
   Trait boosts, movement changes, and visibility state.
4. Expand variable Power Point controls for powers with safe, structured
   options.
5. Improve Arcane Background-specific consequence helpers.

Completion criteria:

- Known Powers can be activated into explicit active-power records with caster,
  target label, duration, maintenance state, cost paid, trapping notes, and
  optional modifier choices.
- Active powers can expire, be dismissed, or be marked disrupted without losing
  the underlying Known Power.
- Common character-local power effects appear in Combat and Character Sheet
  summaries where the app can safely model them.
- Variable Power Point controls distinguish structured spend from manual-cost
  powers and prevent impossible current-PP spending.
- Arcane Background-specific warnings or helper states appear for the major
  Deadlands Arcane Backgrounds without forcing full automation.
- Browser tests cover activation, maintenance/expiration, PP spending,
  reload/export/import, and at least one Arcane Background-specific restriction.

Phase 3 is not complete until the app can track "this power is active right now,
what it cost, when it ends, and what character-local effect it has."

### Phase 4: Combat Helper Systems

Goal: add table-speed helpers while keeping final dice interpretation with the
player and Marshal.

1. Add action card and Joker tracking.
2. Add Multi-Action Penalty, running, aim, defend, Wild Attack, Test, and Support
   reminders.
3. Add Soak and Incapacitation helpers.
4. Add attack/damage helper scaffolds for weapon cards.
5. Add special combat Edge actions after their prerequisites and subchoices are
   reliable.

Completion criteria:

- The app can track the current combat round state needed by a player: action
  card, Joker status, On Hold, action count, and key action modifiers.
- Combat cards show computed reminder stacks for wounds, fatigue, encumbrance,
  conditions, MAP, stance/action choices, and relevant passive effects.
- Soak and Incapacitation helpers guide the user through bookkeeping without
  silently deciding table outcomes that require player or Marshal judgment.
- Weapon cards can produce an attack/damage helper summary from weapon stats,
  ammo state, selected action options, and relevant character-local modifiers.
- Special combat Edge actions are available only when the app can reliably
  identify the Edge, required subchoice, and eligible weapon or Trait.
- Browser tests cover round-state persistence, action modifiers, Soak helper
  state, Incapacitation helper state, and one weapon action helper.

Phase 4 is not complete until Combat can act as a reliable turn assistant, while
still leaving final roll interpretation with the table.

### Phase 5: Deadlands-Specific Subsystems

Goal: support the setting mechanics that make Deadlands different from generic
SWADE.

1. Add Fear Level and Fear check helpers.
2. Add formal duel support.
3. Add Harrowed tracking and manitou complication helpers.
4. Add Mad Scientist malfunction and infernal device helpers.
5. Add organization favors/ranks for Agents and Territorial Rangers.
6. Add travel, ghost rock, superstition, and tale-telling reminders where they
   help player-side table use.

Completion criteria:

- Fear helper state tracks Fear Level context, character-relevant modifiers, and
  the resulting reminder or table-follow-up without reproducing full tables.
- Duel support tracks the formal duel state the player needs: participants,
  hole-card count/modifiers, draw state, and relevant Edge reminders.
- Harrowed characters can record Harrowed status, manitou-related state, and
  Harrowed-specific Edges or complications without conflating them with normal
  living-character rules.
- Mad Scientist and infernal device helpers track device identity, malfunction
  reminders, and ghost-rock-related notes where relevant.
- Organization mechanics track character-facing favors, rank, source, and
  refresh/spend notes for Agents and Territorial Rangers.
- Browser tests cover one representative player-facing workflow from Fear,
  duels, Harrowed, Mad Scientist devices, and organization favors.

Phase 5 is not complete until the app supports the major Weird West-only
mechanics players repeatedly need at the table.

### Phase 6: Ruleset Configuration And Marshal Tools

Goal: only expand beyond the player tracker after the player mechanics are
stable.

1. Convert Sources & Rulesets from read-only reference to campaign profile
   configuration.
2. Support hiding or enabling source-specific catalog entries by profile.
3. Add campaign-level rule toggles where the books or table practice commonly
   vary.
4. Consider a separate Marshal mode for encounter, Fear Level, creature, and
   adventure-generator support.

Completion criteria:

- Sources & Rulesets can define an active campaign profile without breaking
  existing Deadlands-focused saves.
- Catalog filtering, setup validation, power lists, and advancement choices use
  the active profile consistently.
- Optional rules and table rulings are represented as explicit profile toggles
  or GM exceptions, not hidden assumptions.
- Player-facing mode remains clean when Marshal tools are disabled.
- Marshal mode, if added, has a separate information architecture from the
  player character tracker.
- Browser tests cover profile persistence, source filtering, profile-sensitive
  setup validation, and compatibility with existing saved characters.

Phase 6 is not complete until ruleset configuration is reliable enough that a
user can tell which source profile produced each available choice.

## Recommended Next Slice

Implement starting Powers setup selection.

This should come before deeper combat automation because the app already has:

- Arcane Background profiles.
- Power catalog data.
- required starting power metadata.
- known-power creation helpers.
- setup audit tests.

The slice should:

- Keep Powers inside Character Setup.
- Let eligible created pre-advance characters add and remove setup-selected
  starting powers.
- Distinguish setup-selected starting powers from later Advancement powers.
- Enforce required starting powers and starting power count with warnings or
  blocking only where the app has reliable data.
- Preserve imported and advanced characters as audit-only.
- Persist the starting power choices and update setup status.

Completion criteria:

- A created pre-advance character with an Arcane Background sees a setup Powers
  picker limited to the matched Arcane Background's allowed powers by default.
- Required starting powers are shown clearly and can be added without creating
  duplicate Known Powers.
- The setup Powers step distinguishes missing required powers, missing optional
  starting power slots, complete starting power selection, and audit-only states.
- Setup-selected starting powers are tagged with a source that distinguishes
  them from powers gained by Advancement.
- Removing a setup-selected starting power is allowed only while the character
  is still eligible for setup mutation.
- Imported characters, advanced characters, and characters with unreliable
  Arcane Background data keep the current audit-only behavior.
- Save/reload and export/import preserve setup-selected starting power metadata.
- Browser tests cover Blessed or Chi Master required-power selection, a
  no-required-power Arcane Background, duplicate prevention, source tagging,
  audit-only imported behavior, and setup status changes.

It should not:

- Rebuild Arcane Backgrounds from scratch.
- Automate all power effects.
- Add combat power targeting.
- Add full Deal with the Devil resolution.
- Add editable campaign rulesets.

## Maintenance Notes

- Keep this roadmap aligned with `docs/character-setup-contract.md`,
  `docs/advancement-contract.md`, and `docs/manual-checklist.md`.
- When a roadmap item becomes implemented, update the relevant contract and add
  focused browser coverage.
- Prefer small, rules-focused slices over broad rewrites.
