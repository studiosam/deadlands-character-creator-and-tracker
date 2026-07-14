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
  resources, notes, table reminders, and per-character undo/redo history.
- Inventory and load: weapons, loaded rounds, reserve ammunition, armor,
  general gear, consumables, vehicles, storage locations, containers, backpack
  load, combat load, carried load, and off-person storage.
- Catalogs: substantial Deadlands and SWADE Edges, Hindrances, Powers, Gear,
  Armor, Weapons, and Vehicles.
- Character Setup shell: Concept, Attributes, Skills, Edges, optional
  Hindrances with benefit spending, Powers setup, Gear purchases, setup source
  tracking, creation baseline snapshots, and Gear finalization.
- Advancement: canonical ledger entries for current supported advancement
  types, canonical changes, application, persistence, and safe undo model.
- Arcane support: Arcane Background profiles, Power Points, known powers,
  catalog power filtering, variable Power Point spending, and Huckster Deal with
  the Devil helper state.
- Data workflows: Savaged.us import, app JSON import/export, local character
  library, profile editing, full-state backup, and snapshot-based undo/redo.

## Major Mechanics Gaps

### Character Creation

- Character Setup is feature-complete for the current MVP scaffolding: created
  pre-advance characters can draft Concept, Attributes, Skills, Edges,
  optional Hindrances and benefits, Powers, Gear purchases, setup source fields,
  and finish setup from Gear.
- New SWADE / Deadlands setup characters use the current baseline skill model:
  Athletics, Common Knowledge, Notice, Persuasion, and Stealth start at `d4`;
  Language starts at `d8`; other default setup skills start Unskilled unless
  purchased or granted.
- Starting Powers selection identifies Arcane Background expectations, required
  starting powers, Power Points, and obvious mismatches. Eligible created
  pre-advance characters can add/remove source-tagged setup starting powers and
  set source-tagged starting Power Points.
- Starting Gear purchases use screenshot-aligned catalog data. Eligible created
  pre-advance characters can buy source-tagged catalog gear, ammunition, armor,
  weapons, and vehicles from setup funds, sell back eligible setup purchases,
  keep current inventory visible while buying, and prioritize ammo that matches
  purchased weapons.
- Creation baselines snapshot finalized eligible created characters across
  Attributes, Skills, Hindrances, starting Edges, Powers, Gear, money, and setup
  source fields.
- Remaining Character Setup work is polish or explicit backlog: richer
  exception notes, free/source-granted gear modeling, organization-granted gear,
  full Edge prerequisite validation, and stronger table-dependent Power
  validation.
- Imported advanced characters are not reconstructed back to original creation
  state, and that should remain advisory rather than blocking.

### Edges And Hindrances

- Starting Edge enforcement is partial: catalog match, Rank, simple Trait die
  requirements, prerequisite Edge names, duplicate prevention, and slot counts.
- Complex Edge prerequisites, subchoices, conflicts, repeat limits, one-Arcane
  Background rules, and organization-specific bookkeeping are mostly not
  automated.
- Many deterministic Edge and Hindrance hooks now produce passive math,
  resource changes, action-card reminders, Fear-check reminders, or explicit
  manual/table-only markers. Remaining gaps are mostly table-context effects,
  rerolls, attack/target choices, wealth/session models, and special combat
  options.

### Combat And Table Action

- Combat is currently a player-state cockpit, not a SWADE combat engine.
- The app has a player-entered Action Card model for Quick, Hesitant, Level
  Headed, and Improved Level Headed, but not a full action deck, Joker reward,
  turn order, or Hold/interrupt workflow.
- The live Tracker tab intentionally focuses on direct character-sheet
  bookkeeping instead of player intent declaration or combat action legality.
- The app intentionally does not need a full combat action legality engine if
  the table workflow is GM adjudication followed by quick player bookkeeping.
- Weapon tracking handles loaded rounds and reserve ammunition. Attack rolls,
  damage rolls, rate-of-fire choices, recoil, innocent bystander handling,
  target defenses, and special combat Edge actions remain table-adjudicated
  unless a future player-facing need is clearer.

### Powers And Arcane Backgrounds

- Known Powers, Power Point spending, variable spend breakdowns, and active
  Power runtime records are functional.
- Active powers support duration countdowns where numeric, manual duration
  reminders, maintenance marking, target labels, raise/mode fields, trapping
  notes, status transitions, recast choices, and concise runtime reminders.
- Most power effects are still not mechanically applied to the character or
  targets. That remains intentional unless a future slice has explicit target,
  raise, mode, and stacking data.
- Arcane Background consequences are mostly reminders. Future work should cover
  Blessed sin/backlash notes, Chi Master restrictions, Huckster Deal with the
  Devil outcomes, Mad Scientist malfunction, Shaman restrictions, and remaining
  Power Point event modifiers such as Power Surge and Soul Drain. Rapid
  Recharge and Improved Rapid Recharge are handled by the passive effect hook
  model.
- Huckster available powers are separated from Known Powers, but full Deal with
  the Devil resolution is not automated.

### Deadlands Setting Rules

- Deadlands setting rules are mostly handled as player-owned bookkeeping and
  reminders, not automation. Implemented focused slices include Huckster helper
  state, Mad Scientist device records, and Agent/Ranger organization records.
- High-value future areas, if actual table use justifies them, include
  Harrowed player-state reminders, formal duel notes, ghost rock,
  superstitions, tale-telling hooks, and travel/resource reminders.
- Marshal-facing systems such as encounter generation, Fear Level management,
  adventure generation, and creature/NPC stat blocks are outside the current
  player tracker but may become a separate mode later.

### Ruleset Configuration

- Sources & Rulesets is read-only. There is no editable campaign profile.
- The current default should remain a built-in Deadlands profile. Editable
  source configuration should wait until the player-facing mechanics are more
  complete.

## Roadmap Phases

### Phase 1: Character Setup Mechanics

Status: complete for current MVP setup scaffolding.

Goal: make app-created characters explainable from creation baseline plus
Advancement.

Completed scope:

1. Starting Powers setup selection and validation for eligible created
   pre-advance characters.
2. Arcane Background profile checks for required starting powers, starting
   power counts, and starting Power Points.
3. Starting Gear purchase validation and source tracking for catalog gear,
   ammunition, armor, weapons, and vehicles, including setup sell-back and
   useful-ammo prioritization.
4. Creation baselines for finalized eligible created characters across
   Attributes, Skills, Hindrances, starting Edges, Powers, Gear, money, and
   setup source fields.
5. Optional Hindrance flow: players may take no Hindrances, but benefits can
   only be spent from earned counted Hindrance points.

Completion criteria:

- A newly created character can be finalized with a recorded creation baseline
  that explains starting Attributes, Skills, Hindrances, starting Edges, Powers,
  Gear, and money.
- Created pre-advance characters can choose legal starting Powers from the
  matched Arcane Background profile, including required starting powers.
- Created pre-advance characters can record starting Gear purchases against
  starting funds and explain free or source-granted gear separately.
- Setup status reflects missing required choices, overspending, and invalid
  source-tracked choices consistently.
- Imported and advanced characters remain audit-only unless the app has reliable
  creation-time data.
- Browser tests cover starting Powers selection, starting Gear purchase
  validation, creation baseline persistence, setup source persistence, and
  reload/export/import behavior.

Phase 1 is complete for the current MVP setup/source-tracking scope. Remaining
work belongs to follow-up backlog slices rather than blocking the live tracker:
free/source-granted gear modeling, organization-granted gear, full Edge
prerequisite validation, and imported advanced-character baseline
reconstruction.

### Advancement Backlog

Advancement work should stay separate from passive Edge and Hindrance effect
hooks because it mutates the character through the canonical ledger rather than
changing derived display math.

- Implement Hindrance reduction/removal as canonical Advancement entries.
- Support Minor Hindrance removal and Major Hindrance reduction as one
  Advancement entry.
- Model full Major Hindrance removal as a supported table ruling path.
- Preserve imported advancement history as history unless reliable before/after
  mutation data exists.

### Phase 2: Edge And Hindrance Effect Hooks

Status: complete for passive math, reminder, and marker scope.

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
  reminders for common high-confidence Edge and Hindrance modifiers, including
  social, healing, resistance, knowledge, stealth, repair, and Test-resistance
  cases.
- Block and Improved Block now apply baseline-aware Parry math when a trusted
  `baseParry` is available or the character is app-created; imported characters
  without a baseline keep recorded Parry and show the passive effect as a
  reminder only.
- Weapon Master and Master of Arms now apply baseline-aware Parry math using a
  separate exclusive group from Block, so Master of Arms replaces Weapon Master
  while still stacking with Block. Their Fighting bonus damage die reminders
  also replace correctly.
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
  not safely automated yet, including manual/table-only and subchoice-required
  effects.
- Rapid Recharge and Improved Rapid Recharge now set the computed Power Point
  recovery rate, with Improved Rapid Recharge replacing the base Edge.
- Luck, Great Luck, and Bad Luck modify computed starting Bennies through the
  session resource model.
- Quick, Hesitant, Level Headed, and Improved Level Headed remain represented as
  character effect reminders and underlying model data, but the normal Tracker
  UI no longer includes a player-entered Action Card workflow.
- Trademark Weapon and Reputation now store explicit subchoice metadata; their
  status markers change from `subchoice-required` to `subchoice-selected` once
  the chosen weapon or reputation type is recorded.
- Character, Combat, and Inventory surfaces show passive-effect explanations
  instead of relying only on catalog text.

Effect Hook Candidate Audit:

- Already implemented: Alertness, Block, Brave, Brawler, Brawny, Danger Sense,
  Great Luck, Improved Block, Improved Level Headed, Improved Nerves of Steel,
  Soldier, Fleet-Footed, All Thumbs, Anemic, Arcane Resistance, Improved Arcane
  Resistance, Aristocrat, Attractive, Very Attractive, Bad Luck, Clueless,
  Clumsy, Elan, Fast Healer, Healer, Hesitant, Investigator, Iron Jaw, Iron
  Will, Level Headed, Luck, Mean, Menacing, Mild Mannered, Mr. Fix It, Nerves
  of Steel, One Eye, Quick, Small, Slow, Streetwise, Strong Willed, Thief,
  Tongue-Tied, Tough as Nails, Tougher than Nails, Weapon Master, Master of
  Arms, Woodsman, Yellow, Obese, Rapid Recharge, and Improved Rapid Recharge.
- Tiny Fear-check reminder implemented: Guts, Grit, and True Grit are detected
  by canonical Edge name; suspicious chains such as Grit without Guts or True
  Grit without Grit are flagged for manual review.
- Explicitly marked but not fully automated: Berserk, unresolved Trademark
  Weapon, and unresolved Reputation.
- Subchoice storage implemented: Trademark Weapon chosen weapon and Reputation
  good/bad type.
- Passive math, high confidence: the current small deterministic set is covered
  for the Phase 2 audit. Future passive math should be added only when the
  baseline and stacking rules are equally clear.
- Roll modifier reminders, remaining high-confidence audit items: Whateley
  Blood and other setting-specific entries whose exact numeric value or resource
  impact needs a narrower rules pass before automation.
- Needs action context, not Phase 2 passive hooks: Calculating, Dead Shot,
  Mighty Blow, Tactician, Master Tactician, Quick Draw, Fast as Lightning,
  Dodge, Improved Dodge, Double Tap, Marksman, Rapid Fire, Improved Rapid Fire,
  Assassin, Giant Killer, Martial Artist, Martial Warrior, Champion, and similar
  combat Edges. These require turn, Joker, attack, weapon, or target context and
  should remain deferred unless a specific player-facing table-use need appears.
- Resource or session-start effects: Luck, Great Luck, Bad Luck, Rapid
  Recharge, and Improved Rapid Recharge are implemented. Power Surge, Soul
  Drain, and Behold a Pale Horse remain deferred because they need event,
  resource-spend, mount, or session context rather than one-time silent
  mutations.
- Subchoice or target-required effects: Scholar, Trademark Weapon, Improved
  Trademark Weapon, Reputation, Chi, Rich, Filthy Rich, and Arcane Background.
  These need stored choices, wealth/session models, or Arcane Background
  bookkeeping before reliable automation.
- Severity-dependent Hindrances after Slow: Ailin', Bad Eyes, Enemy, Habit,
  Hard of Hearing, Obligation, Outsider, Pacifist, Phobia, Ruthless, Secret,
  Shamed, Suspicious, Thin Skinned, Ugly, Vengeful, Vow, Wanted, Young,
  Talisman, and Trouble Magnet. Most should begin as reminders until the app has
  the relevant roll/resource/creation model.
- Manual or table-only for now: Berserk, Cursed, Grim Servant o' Death, Old
  Ways Oath, Tenderfoot, Tale-Teller, organization rank/favor Edges, Harrowed
  powers, Mad Scientist device Edges, Shaman restriction Edges, most story or
  Marshal-facing effects, and vague imported/history-only records.

1. Add structured effect metadata for high-impact Edges and Hindrances.
2. Apply passive effects that are unambiguous and character-local.
3. Add warnings, not hard blocks, for complex requirements and table-dependent
   cases.
4. Add subchoice storage for Edges that require a selected Trait, weapon, style,
   contact, reputation type, or supernatural option.

Completion criteria:

- Catalog entries that affect current character math have structured,
  machine-readable effect metadata instead of only text summaries.
- Passive, character-local effects update relevant displayed values or warnings
  without requiring users to manually remember them.
- Edge subchoices are stored on the character and survive reload/export/import.
- Requirement validation distinguishes reliable checks, partial checks,
  GM-overridable warnings, and unsupported complex requirements.
- Browser tests cover at least one representative passive Edge, one Hindrance
  effect or warning, one subchoice Edge, one complex-prerequisite warning, and
  at least one explicit manual/table-only or needs-action-context marker.

Phase 2 is complete at the passive math, reminder, and marker scope. Remaining
action-context Edges and Hindrances should stay out of the passive hook model
unless a later focused subsystem has a clear player-facing need for them.

### Phase 3: Power Runtime Improvements

Status: complete for runtime and reminder tracking.

Goal: support powers during play without turning the app into a full VTT.

Completed scope:

- Known Powers can be activated from Arcane or Combat power cards into
  normalized `activePowers` runtime records.
- Active Power records track source power, Power Point cost, base duration,
  numeric `durationRemaining` when available, duration reminder text,
  maintenance state, structured target label, optional effect mode, raise marker,
  trapping notes, runtime notes, activation time, end time, and status.
- Numeric round durations can be ticked down one round at a time and expire at
  zero. Non-numeric durations remain manual reminders.
- Maintenance state is surfaced prominently on Arcane active-power cards.
- Combat stays focused on casting known powers; current effects, maintenance,
  targets, and active-power history are managed from Arcane.
- A small runtime reminder registry surfaces high-confidence manual effect
  reminders for `Protection`, `Deflection`, `Boost/Lower Trait`, `Barrier`,
  `Burrow`, `Light/Darkness`, `Entangle`, `Fly`, `Invisibility`, `Sloth/Speed`,
  `Smite`, and `Wall Walker` while those powers are active. Ended active-power
  records are marked inactive instead of continuing to show active-effect
  reminders.
- Variable Power Point activation stores a structured `spendBreakdown` with base
  cost, selected modifier quantities, modifier costs, and total cost. Combat
  shows the selected casting cost before activation, while Arcane active-power
  records preserve the completed spend breakdown.
- Structured runtime fields let players mark target, raise state, and mode for
  paired powers such as `Boost/Lower Trait`, `Light/Darkness`, and
  `Sloth/Speed`. These fields improve reminders and card clarity only; they do
  not apply stat changes automatically.
- Active Powers can be marked dismissed, expired, or disrupted without deleting
  the underlying Known Power.
- Ended active-power records show status transition notes with the ended time.
  Expired records state that effect reminders no longer apply; disrupted
  records tell the player to confirm maintained-power consequences manually.
- Recasting a power that already has an active record opens a choice dialog so
  the player can create another record, expire the old record first, or dismiss
  the old record first.
- Active Power records persist through reload and tracker JSON export/import.
- Power effect automation is intentionally deferred; active records currently
  display concise manual-effect reminders.

Deferred out of Phase 3:

- Automatic stat changes for active powers, including armor, defense penalties,
  Trait boosts, movement changes, visibility state, and other target-dependent
  effects.
- Full target, area, opposed-roll, resistance, recovery, template, and Marshal
  adjudication workflows.
- Arcane Background-specific consequence automation beyond existing reminder
  and Huckster Deal with the Devil helper state.
- Additional lower-priority catalog reminders that do not improve common table
  use.

Completion criteria:

- Known Powers can be activated into explicit active-power records with caster,
  target label, effect mode where relevant, raise marker, duration, maintenance
  state, cost paid, trapping notes, and optional modifier choices.
- Active powers can expire, be dismissed, or be marked disrupted without losing
  the underlying Known Power.
- Active and ended power cards clearly distinguish active reminders from expired,
  dismissed, or disrupted records.
- Variable Power Point controls distinguish structured spend from manual-cost
  powers and prevent impossible current-PP spending.
- Browser tests cover activation, maintenance/expiration, PP spending,
  structured target/raise/mode fields, reminder rendering, status transitions,
  recast choices, and reload/export/import.

Phase 3 is complete at the runtime/reminder scope. Future power work should be
driven by specific table-use gaps, not by expanding into a full power rules
engine by default.

### Phase 4: Combat Helper Systems

Status: intentionally minimal and complete at the current player-tracker scope.

Goal: keep Combat fast for player-owned state changes after GM adjudication.
The app should prioritize direct controls, concise reminders, and undoable
bookkeeping over action legality modeling.

Completed scope:

- The live Tracker provides direct controls for Wounds, Fatigue, Bennies,
  conditions, ammunition, Power Points, active powers, and notes.
- The live Tracker shows state the app already knows, including Wound penalties,
  conditions, encumbrance, passive effect reminders, active Power reminders,
  and loaded/reserve ammunition.
- Snapshot-based global undo/redo protects mistakes across Tracker, Inventory,
  Arcane, Character Setup, Advancement, notes, and profile edits.

Deferred unless a real table-use need appears:

- Full initiative, Joker reward, Hold/interrupt, Soak, Incapacitation, attack
  resolution, damage resolution, Test, Support, cover, range, lighting, called
  shot, gang-up, prone, and special combat Edge workflows.
- Combat action legality enforcement or blocking.
- Any system that makes the player fill out extra paperwork when direct Wound,
  Fatigue, Benny, ammo, condition, or Power Point controls are faster.

Completion criteria:

- The live Tracker provides direct, undoable controls for player-owned state.
- The live Tracker surfaces concise reminders from state the app already knows.
- Browser tests cover direct combat bookkeeping, active-power reminders,
  conditions, ammo/resource changes, and undo/redo.

Phase 4 is complete at the current tracker scope. Future combat work should be
bugfix, speed, clarity, or table-proven reminder work rather than a planned
rules-engine expansion.

### Phase 5: Deadlands-Specific Player Subsystems

Status: complete for current MVP bookkeeping scope.

Goal: support the Weird West mechanics that players repeatedly need to track or
remember without replacing the Marshal, reproducing full tables, or building a
general VTT.

Candidate slices:

1. Existing Fear reminders: keep the current passive reminders and audit notes
   for Brave, Yellow, Guts, Grit, and True Grit, but do not add a dedicated
   Fear workflow unless table use proves the current reminders are insufficient.
2. Formal duel support: participants, hole-card count/modifiers, draw state,
   and relevant Edge reminders.
3. Harrowed tracking: Harrowed status, Dominion/manitou notes, Harrowed Edge
   reminders, and complication notes without automating Marshal secrets.
4. Mad Scientist and infernal devices: implemented baseline device identity,
   malfunction reminder state, ghost-rock fuel notes, and repair/status
   tracking.
5. Organization bookkeeping: implemented baseline Agent and Territorial Ranger
   rank, favors, source, spend/refresh notes, and granted gear/pay reminders.
6. Weird West travel/resource reminders: ghost rock, superstitions, tale-telling
   hooks, and travel hazards where they affect the player character.

Phase 5 audit findings:

1. Fear does not need a new dedicated panel right now. The app already detects
   Brave, Yellow, Guts, Grit, and True Grit, and it already renders concise
   Fear-check reminders and suspicious Edge-chain audit notes. Direct manual
   controls are enough for recording Marshal-adjudicated results.
2. Mad Scientist and infernal-device support now has baseline bookkeeping
   through player-owned device records. It stays focused on device identity,
   status, malfunction reminders, repair notes, and ghost-rock fuel notes rather
   than a malfunction rules engine.
3. Agent and Territorial Ranger organization bookkeeping now has baseline
   player-owned records for rank, favors, granted-gear notes, pay/source notes,
   and manual refresh/spend history.
4. Harrowed support has high setting value but needs careful boundaries.
   Dominion, manitou behavior, and some consequences are table- or Marshal-owned
   information, so Harrowed should wait until smaller player-owned Phase 5
   bookkeeping slices are proven.
5. Formal duel support is setting-specific but lower frequency. It should remain
   behind Mad Scientist and organization bookkeeping unless an active table
   needs duels immediately.
6. Ghost-rock, travel, tale-telling, and superstition support should be
   reminder/resource slices only. They should not become a travel simulator or
   Marshal-facing hazard engine.

Implemented Phase 5 bookkeeping slices:

- Mad Scientist Devices: add a small player-owned device model for powers and
  infernal gear with device name, status, trapping notes, malfunction reminder,
  repair notes, ghost-rock fuel notes where relevant, reload/export/import
  persistence, and card display.
- Agent/Ranger Organizations: add a small player-owned organization model with
  organization name, rank or grade, favors, granted-gear notes, pay/source notes,
  manual spend/refresh history, reload/export/import persistence, and character
  sheet display.
- Further expansion should be based on table use, not speculative automation.

Completion criteria:

- Each implemented subsystem records only player-owned state or concise
  reminders.
- Marshal-only adjudication remains manual and table-facing.
- No subsystem requires extra tracking when a faster existing control is enough.
- Browser tests cover persistence, reload, export/import where relevant, and one
  representative player-facing workflow per implemented subsystem.

Phase 5 is complete for the current player-owned bookkeeping scope. Further
Deadlands setting work should be based on observed table use, not speculative
automation.

### Future / Backlog Systems

These systems are not part of the current MVP unless table use proves a clear
player-facing need:

- Full Fear table automation or Fear Level tracking.
- Formal duel engine.
- Harrowed Dominion/manitou engine.
- Full combat engine, attack automation, damage automation, Soak automation, or
  Marshal-facing outcome decisions.
- Travel simulator, hazard generator, or campaign-resource engine.
- Organization favor adjudication beyond player-owned favor/rank notes.
- Infernal-device malfunction rules engine beyond reminders and status notes.

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

## Recommended Next Work

The mechanics roadmap is at feature-complete MVP scope for a player-owned live
tracker. The next work should be UX readiness, table-use polish, documentation,
bug fixes, and focused tests rather than another speculative mechanics phase.

Current top-to-bottom audit findings:

1. Feature progression should pause on new mechanics. Phases 1-5 are complete
   at the current player-owned tracker scope, and Phase 6 should wait for manual
   source/profile investigation.
2. The highest product value now is Character Setup UX polish, especially Gear
   finalization clarity, because that is where new users still spend the most
   decision-heavy time.
3. The highest maintainability value is a mechanical refactor of the largest
   setup files after the current Gear UX stabilizes. `src/tracker/setup-render.js`
   and `src/tracker/setup-actions.js` are the next obvious split candidates.
4. Reference/catalog docs remain useful as implementation inputs, but the live
   product docs should stay focused on actual supported workflows and explicit
   non-goals.
5. Final portfolio readiness still needs screenshots/GIFs, a table-use pass on
   mobile spacing, and one final full `npm test` gate before release/push.

Future mechanics slices should be accepted only when they:

- Store player-owned facts, reminders, or GM-adjudicated notes.
- Persist and round-trip through reload/export/import.
- Show concise reminders without forcing unnecessary workflow.
- Improve an observed table-use problem that direct controls do not already
  solve.
- Add focused browser tests for creation, editing, reload, export/import, and
  rendering.

They should not:

- Build a full Fear subsystem, duel engine, Harrowed Dominion engine,
  infernal-device rules engine, organization favor adjudicator, combat engine,
  or travel system.
- Copy rulebook tables or long rule text.
- Add GM-facing automation that does not improve the player tracker.

## Maintenance Notes

- Keep this roadmap aligned with `docs/character-setup-contract.md`,
  `docs/advancement-contract.md`, and `docs/manual-checklist.md`.
- When a roadmap item becomes implemented, update the relevant contract and add
  focused browser coverage.
- Prefer small, rules-focused slices over broad rewrites.
