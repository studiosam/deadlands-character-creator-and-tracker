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
- Missing tactical systems include Multi-Action Penalty helpers, Tests, Support,
  Soak, Incapacitation, Bleeding Out resolution, recovery rolls, attack
  resolution, damage resolution, cover, range, lighting, called shots, gang-up,
  prone interactions, and size modifiers.
- Weapon tracking handles loaded rounds and reserve ammunition, but does not
  automate attack rolls, damage rolls, rate-of-fire choices, recoil, innocent
  bystander handling, or special combat Edge actions.

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

### Advancement Backlog

Advancement work should stay separate from passive Edge and Hindrance effect
hooks because it mutates the character through the canonical ledger rather than
changing derived display math.

- Implement Hindrance reduction/removal as canonical Advancement entries.
- Support Minor Hindrance removal and Major Hindrance reduction as one
  Advancement entry.
- Model full Major Hindrance removal as either a two-Advance spend or an
  explicit GM/table exception path.
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
- Luck, Great Luck, and Bad Luck now modify computed starting Bennies through
  the session resource model, and Start Session resets current Bennies to that
  computed value.
- Quick, Hesitant, Level Headed, and Improved Level Headed now feed a Combat
  Action Cards model that records player-entered cards, checks Quick redraw
  eligibility, and displays the effective draw/keep instruction.
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
  should move to Phase 4 combat helper work.
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
action-context Edges and Hindrances should move through Phase 4 or later
specialized systems instead of expanding the passive hook model indefinitely.

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
- Maintenance state is surfaced prominently on Arcane and Combat active-power
  cards.
- A small runtime reminder registry surfaces high-confidence manual effect
  reminders for `Protection`, `Deflection`, `Boost/Lower Trait`, `Barrier`,
  `Burrow`, `Light/Darkness`, `Entangle`, `Fly`, `Invisibility`, `Sloth/Speed`,
  `Smite`, and `Wall Walker` while those powers are active. Ended active-power
  records are marked inactive instead of continuing to show active-effect
  reminders.
- Variable Power Point activation stores a structured `spendBreakdown` with base
  cost, selected modifier quantities, modifier costs, and total cost. Active
  power cards display the breakdown in Arcane and Combat.
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

Status: ready for first implementation slice.

Goal: add player-side table-speed helpers that clarify legal declarations,
GM-facing intent, and player-owned bookkeeping after GM adjudication. The app
should not resolve attacks, damage, enemy actions, or table-dependent outcomes.

Readiness audit:

- Already available: player-entered Action Card state, Quick redraw detection,
  Level Headed/Hesitant draw instructions, Bennies/session reset, wounds,
  fatigue, conditions, encumbrance, passive effect reminders, weapon/ammo cards,
  and active Power reminders.
- Partial only: conditions can represent Aim, Defend, On Hold, Wild Attack, and
  The Drop as flags, but there is no turn action state, action-count model, or
  explicit Multi-Action Penalty workflow.
- Missing: fuller Soak bookkeeping, Incapacitation result entry, Bleeding Out
  reminders, recovery-roll prompt flow, and special combat Edge declaration
  reminders.
- Risk boundary: Phase 4 should remain declaration-first. It should show
  reminders, track choices, and apply only player-entered GM-adjudicated
  results. It should not roll dice, choose targets, calculate enemy defenses, or
  silently decide table outcomes.

Recommended first slice:

1. Add a Combat Declaration panel for player intent, action count, optional
   weapon/item, target label, and freeform details.
2. Show common legal/limited action reminders from current character state such
   as Shaken, Stunned, Bound, Entangled, unloaded weapons, missing Power Points,
   and missing Bennies.
3. Generate short GM-facing declaration text and reminder-only Multi-Action
   Penalty text.
4. Let the player record and apply GM-adjudicated results such as Wound,
   Fatigue, Benny, condition, ammo, and freeform result notes.
5. Keep every field editable and overrideable; use warnings instead of hard
   blocks unless the player is directly applying a requested bookkeeping change.

Questions before implementation:

- Should declaration state clear manually, on a future "Next Turn" button, or
  only when the user starts a new session?
- Should Aim, Defend, Wild Attack, On Hold, and The Drop remain existing
  condition flags, or should they later gain declaration shortcuts?
- Should running remain reminder-only until movement tracking exists?
- Should Wild Attack stay reminder-only because attack context and duration are
  table-dependent?

Backlog after the first slice:

1. Extend the current Action Card model into fuller initiative, Joker reward,
   and Hold/interrupt tracking.
2. Add Multi-Action Penalty, running, aim, defend, Wild Attack, Test, and Support
   reminders.
3. Add Soak and Incapacitation helpers.
4. Add attack/damage helper scaffolds for weapon cards.
5. Add special combat Edge actions after their prerequisites and subchoices are
   reliable.
6. Revisit needs-action-context Edges such as Calculating, Dead Shot, Mighty
   Blow, Tactician, Master Tactician, Quick Draw, Fast as Lightning, Dodge,
   Improved Dodge, Double Tap, Marksman, Rapid Fire, Improved Rapid Fire,
   Assassin, Giant Killer, Martial Artist, Martial Warrior, and Champion.

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

Continue Phase 3 with active-power duration and maintenance helpers.

The slice should:

- Add lightweight active-power countdown or reminder fields without simulating
  full turn order.
- Surface maintenance reminders for active powers that require ongoing attention.
- Keep target labels and trapping notes player-entered.
- Add tests for duration and maintenance reminder behavior.

It should not:

- Add attack resolution.
- Automate full power effects.
- Add target stat blocks or multi-target VTT behavior.
- Add full Deal with the Devil resolution.

## Maintenance Notes

- Keep this roadmap aligned with `docs/character-setup-contract.md`,
  `docs/advancement-contract.md`, and `docs/manual-checklist.md`.
- When a roadmap item becomes implemented, update the relevant contract and add
  focused browser coverage.
- Prefer small, rules-focused slices over broad rewrites.
