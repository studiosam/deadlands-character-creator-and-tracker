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
  spending, partial starting Edge enforcement, Powers audit, Gear audit, and
  Review.
- Advancement: canonical ledger entries for current supported advancement
  types, canonical changes, application, persistence, and safe undo model.
- Arcane support: Arcane Background profiles, Power Points, known powers,
  catalog power filtering, variable Power Point spending, and Huckster Deal with
  the Devil helper state.
- Data workflows: Savaged.us import, app JSON import/export, local character
  library, profile editing, and full-state backup.

## Major Mechanics Gaps

### Character Creation

- Starting Powers are audit-first. The app can identify Arcane Background
  expectations, required starting powers, Power Points, and obvious mismatches,
  but it does not yet provide a complete setup-time power selection workflow.
- Starting Gear is audit-first. The app tracks equipment and load well, but it
  does not yet validate starting cash, purchases, free gear, organization gear,
  or gear source.
- Creation baselines exist for Attributes and Skills only. They should expand
  to Hindrances, Edges, Powers, Gear, money, and explicit table exceptions.
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

1. Add starting Powers setup selection.
2. Validate Arcane Background power lists, required starting powers, starting
   power counts, and starting Power Points.
3. Add starting Gear purchase validation and source tracking.
4. Extend creation baselines to Hindrances, starting Edges, Powers, Gear, and
   money.
5. Add explicit GM or table exception records for setup-time deviations.

### Phase 2: Edge And Hindrance Effect Hooks

Goal: move from reference-only entries to explainable mechanical modifiers where
safe.

1. Add structured effect metadata for high-impact Edges and Hindrances.
2. Apply passive effects that are unambiguous and character-local.
3. Add warnings, not hard blocks, for complex requirements and table-dependent
   cases.
4. Add subchoice storage for Edges that require a selected Trait, weapon, style,
   contact, reputation type, or supernatural option.
5. Implement Hindrance reduction/removal Advancement.

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
