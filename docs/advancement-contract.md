# Advancement Ledger Contract

## Purpose

Advancement records how a confirmed character grows after starting play.

Character Setup owns the starting build. The normal Character Sheet is a
reference view. The Characters panel owns identity/profile edits and character
management. Advancement owns post-creation character growth.

The explainability model is:

```text
Creation baseline + Advancement ledger + GM exceptions/corrections = Current character
```

This contract describes the canonical Advancement ledger model and the current
implementation boundaries.

## Current Data Shape

The current app stores character data directly on the active character object.

- Attributes live in `character.attributes` as an object keyed by lower-case
  attribute keys such as `agility`, `smarts`, `spirit`, `strength`, and `vigor`,
  with die strings such as `d6`.
- Skills live in `character.skills` as an array of records with `name`, `die`
  or legacy `value`, optional `linkedAttribute`, optional `notes`, and optional
  `core`.
- Edges live in `character.edges` as normalized records with `id`, `name`,
  `type`, `category`, `rank`, `requirements`, `shortSummary`, `notes`, `source`,
  optional `subchoice`, and optional `isCustom`.
- Hindrances live in `character.hindrances` as normalized records with `id`,
  `name`, `type`, `severity`, `shortSummary`, `notes`, `source`, and optional
  `isCustom`.
- Powers live in `character.powers` as normalized records with `id`,
  `catalogId`, `name`, `rank`, Power Point cost fields, range/duration text,
  `source`, `arcaneBackground`, `trapping`, summaries, restrictions, active
  state, `createdByAdvanceId`, `addedReason`, and `isCustom`.
- Rank is stored as `character.rank`. Advancement summary code also derives rank
  from the number of recorded advances using current thresholds: 0-3 Novice,
  4-7 Seasoned, 8-11 Veteran, 12-15 Heroic, and 16+ Legendary.
- Existing advancement history lives in `character.advances`.
- Creation baseline data currently lives in `character.creationBaseline` for
  created-character starting `attributes` and `skills`.
- There is no dedicated GM exception/correction ledger yet. Current related
  signals are legacy advancement `source` values such as `marshal-override`,
  `Other / Marshal-approved` advance type, import notes, setup warnings, and
  manual/custom entry sources.

### Current Canonical App-Owned `character.advances` Shape

The app-owned Advancement implementation now normalizes newly saved advances
into canonical records using these fields as the source of truth:

- `id`
- `type`
- `label`
- `source`
- `advanceNumber`
- `rankAtTime`
- `createdAt`
- `changes`
- `notes`

Canonical `changes` entries use:

- `path`
- `before`
- `after`
- `displayLabel`

Optional change metadata may include `targetId`, `targetName`, `targetType`,
`operation`, and `metadata` when useful for display or safe undo.

The app may temporarily read old pre-release app-owned fields during
normalization only where needed to keep the migration incremental:

- `number`
- `rank`
- `summary`
- `dateAdded`
- `appliedChanges`

These old fields are not the long-term source of truth and should not be
expanded into a permanent bridge. Old pre-release app-owned advancement
compatibility is intentionally not guaranteed.

Current app-owned records may also carry transitional control fields used by
the existing UI and safe-undo flow:

- `targetName`
- `targetType`
- `targetId`
- `catalogId`
- `targets`
- `applied`
- `appliedByApp`
- `appliedAt`

Those fields are not the canonical ledger identity. They should be reduced or
re-scoped only in focused follow-up work.

Current supported applied UI labels map to canonical types:

- `New Edge` -> `edge-gain`
- `Increase Skill` -> `skill-increase`
- `Increase Two Skills` -> `two-skills-increase`
- `Increase Attribute` -> `attribute-increase`
- `New Powers` -> `power-gain`
- `Power Points` -> `power-points-increase`
- `Other / Marshal-approved` -> `gm-exception` or `manual-history`
- Imported Savaged.us history -> `imported-history`

Savaged.us import support remains in scope. Imported Savaged.us advancement
history should be preserved as imported history when present, but it should not
be treated as trusted undoable before/after data unless the export provides
reliable before/after values.

## Current Implementation Audit

The current Advancement system is not unimplemented. It already has a legacy
history shape, adaptive editor fields, optional auto-application, persistence,
import/export round-tripping, and safe-undo checks for app-applied changes.
This audit documents the current behavior so the canonical ledger work can be
implemented as a deliberate migration instead of treating Advancement as blank
slate work.

Inspected files:

- `docs/advancement-contract.md`
- `src/tracker/advancement-core.js`
- `src/tracker/character-advancement.js`
- `src/tracker/render.js`
- `src/tracker/events.js`
- `src/tracker/storage.js`
- `src/tracker/constants.js`
- `src/persistence.js`
- `tests/browser/app.spec.js`

### Supported Type Classification

| Type                       | Current classification                                                                                      | Current behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Increase Skill`           | Implemented and auto-applied                                                                                | Uses a generated skill target, validates an existing eligible trained skill equal to or greater than its linked attribute, increases one die step, writes canonical `type: "skill-increase"` with one skill `changes` item, and can safely undo when the current die still matches the recorded `after` value.                                                                                                                                                                     |
| `Increase Two Skills`      | Implemented and auto-applied                                                                                | Uses two generated skill targets, validates two different eligible skills below their linked attributes, applies both skill increases as one advance, writes canonical `type: "two-skills-increase"` with two skill `changes` items, and can safely undo both when current values still match. This matches the official one-advance/two-skill model.                                                                                                                              |
| `Increase Attribute`       | Implemented and auto-applied; Covered by focused browser tests; Partially implemented; Needs redesign later | Uses a generated attribute target, increases one attribute die step, updates Strength-dependent armor/weapon strength when Strength changes, writes canonical `type: "attribute-increase"` with one attribute `changes` item, blocks a second Attribute increase in the same non-Legendary Rank, applies the Legendary every-other-Advance cadence based on distance since the last reliable Legendary Attribute increase, and can safely undo when the current die still matches. |
| `New Edge`                 | Implemented and auto-applied; Covered by focused browser tests; Needs redesign later                        | Adds a catalog or custom Edge with `source: "advancement"` and `createdByAdvanceId`, writes canonical `type: "edge-gain"` with one add `changes` item, and can safely undo by removing the same created Edge. Full Rank and requirements enforcement remains deferred.                                                                                                                                                                                                             |
| `New Powers`               | Implemented and auto-applied; Covered by focused browser tests; Needs redesign later                        | Adds one or more catalog/custom powers with `source: "advancement"`, `addedReason: "advancement"`, and `createdByAdvanceId`, writes canonical `type: "power-gain"` with one add `changes` item per power, and can safely undo by removing created powers. Power eligibility and starting-vs-advance separation remain deferred.                                                                                                                                                    |
| `Power Points`             | Implemented and auto-applied; Covered by focused browser tests; Needs redesign later                        | Increases the max Power Points resource by the selected amount, creates a Power Points resource if missing, writes canonical `type: "power-points-increase"` with one resource `changes` item, and can safely undo when the current max still matches. Whether this belongs in Advancement, Arcane, or a GM exception model remains an open design issue.                                                                                                                          |
| `Other / Marshal-approved` | Implemented as manual/history only; Covered by focused browser tests; Needs redesign later                  | Records manual history as canonical `manual-history` or `gm-exception` with `changes: []` unless the UI applies a reliable mutation. It does not auto-apply or undo character mutations.                                                                                                                                                                                                                                                                                           |
| Reduce or Remove Hindrance | Needs redesign later                                                                                        | There is no dedicated advancement type for reducing or removing Hindrances. The current app can record a manual history entry, but it does not apply a Minor removal, Major reduction, two-Advance Major removal spend, or GM-approved exception path.                                                                                                                                                                                                                             |

### Official Rules Alignment

The canonical ledger should describe the official advancement options separately
from the current legacy UI labels:

| Advancement option         | Rule requirement                                                                                                                                                                    | App implementation meaning                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gain a New Edge            | Character gains one Edge and must meet that Edge's Rank and requirements.                                                                                                           | Add one Edge record, source it from an advancement, and record the before/after change in the ledger. The legacy UI label is `New Edge`; migration should replace it with a canonical Edge-gain type later. |
| Increase One Skill         | Increase one skill by one die type when that skill is equal to or greater than its linked attribute.                                                                                | One advance entry, one skill target, one `changes` item. Canonical `type` should be `skill-increase`.                                                                                                       |
| Increase Two Skills        | Increase two different skills by one die type each when each skill is lower than its linked attribute. This can include new skills the character does not have yet, added at `d4`.  | One advance entry, two skill targets, two `changes` items. Canonical `type` should be `two-skills-increase`, not two separate advances.                                                                     |
| Increase One Attribute     | Increase one attribute by one die type. This option may be taken only once per Rank. Legendary characters may raise an attribute every other Advance, up to the applicable maximum. | One advance entry, one attribute target, one `changes` item. Track Rank usage so the app can block or warn if already used this Rank.                                                                       |
| Reduce or Remove Hindrance | Remove a Minor Hindrance, or reduce a Major Hindrance to Minor if that Hindrance can reasonably be reduced. With GM permission, two saved Advances may remove a Major Hindrance.    | One advance entry for Minor removal or Major reduction. Major full removal needs either a two-advance spend model or a GM-approved exception path.                                                          |

### Attribute Increase Cadence Model

Before Legendary, the app should allow at most one reliable
`attribute-increase` entry per Rank bucket:

- Novice
- Seasoned
- Veteran
- Heroic

At Legendary, the app should allow one Attribute increase every other Advance.
This must be modeled as distance since the last reliable Legendary Attribute
increase, not fixed even-numbered or odd-numbered Legendary Advances.

The app rule should be:

- If the current Rank is not Legendary, allow the Attribute increase only when
  no reliable Attribute increase already exists in that same Rank bucket.
- If the current Rank is Legendary and there is no previous reliable Legendary
  Attribute increase, allow it.
- If the current Rank is Legendary and a previous reliable Legendary Attribute
  increase exists, allow it only when
  `currentAdvanceNumber - lastLegendaryAttributeIncreaseAdvanceNumber >= 2`.

This means the Legendary cadence starts fresh at Legendary. A Heroic Attribute
increase at Advance 15 should not block the first Legendary Attribute increase
at Advance 16. If a player skips the Attribute increase at Advance 16, they
should still be allowed to take it at Advance 17; the model is based on the last
reliable Legendary Attribute increase, not fixed parity.

Examples:

- Advance 12: Heroic Attribute increase is allowed if no other Heroic Attribute
  increase exists.
- Advance 15: Heroic Attribute increase is allowed if no other Heroic Attribute
  increase exists.
- Advance 16: first Legendary Attribute increase is allowed.
- Advance 17: blocked if Advance 16 was a Legendary Attribute increase.
- Advance 18: allowed if Advance 16 was the last Legendary Attribute increase.
- Advance 19: blocked if Advance 18 was a Legendary Attribute increase.
- Advance 20: allowed if Advance 18 was the last Legendary Attribute increase.
- Advance 16: Edge, Advance 17: Attribute increase allowed, Advance 18:
  blocked, Advance 19: allowed.

Only reliable Attribute increases should count toward this cadence:

- Count canonical `type: "attribute-increase"` entries with a reliable
  `advanceNumber`.
- Count entries from `source: "advancement"`, `source: "manual"`, or
  `source: "marshal-override"` only when they actually changed an Attribute.
- Count entries with a reliable canonical change path such as
  `attributes.strength`.
- Do not count `imported-history` with `changes: []`.
- Do not count `manual-history` with no mutation.
- Do not count `gm-exception` with no reliable Attribute change.
- Do not count old vague imported advancement labels.

Recommended helper shape:

```js
function canTakeAttributeIncrease(advances, currentAdvanceNumber) {
  const currentRank = rankForAdvanceNumber(currentAdvanceNumber);

  if (currentRank !== "Legendary") {
    return !hasAttributeIncreaseInRank(advances, currentRank);
  }

  const lastLegendaryAttributeAdvance = findLastReliableAttributeIncreaseAtRank(
    advances,
    "Legendary",
  );

  if (!lastLegendaryAttributeAdvance) return true;

  return (
    currentAdvanceNumber - lastLegendaryAttributeAdvance.advanceNumber >= 2
  );
}
```

Recommended user-facing warnings:

- Non-Legendary duplicate: "You have already increased an Attribute this Rank."
- Legendary cadence: "Legendary characters may increase an Attribute every
  other Advance. Take a different Advance before increasing another Attribute."

### Current Application Model

New advance drafts are built by `advanceDraftFromForm()`. For supported apply
types, the editor defaults the "apply to character" checkbox on for new entries.
When that checkbox is selected, `saveAdvanceEditor()` calls
`applyAdvanceToCharacter()`, mutates the current character, then stores the
advance with:

- `applied: true`
- `appliedByApp: true`
- `appliedAt: new Date().toISOString()`
- canonical `changes: [...]`

When a supported type is saved without application, or when
`Other / Marshal-approved` is saved, the entry remains history-only with:

- `applied: false`
- `appliedByApp: false`
- `appliedAt: ""`
- `changes: []`

Undo behavior is based on canonical `changes`. Removing an applied advance
offers history-only removal when undo is unsafe, or remove-and-undo when every
recorded `after` value still matches the current character state.

### Increase Skill Modeling

`Increase Skill` is currently modeled as one canonical advance with one skill
target. The generated entry uses:

- `type: "skill-increase"`
- `label` like `Increase Skill: Shooting d6 -> d8`
- `targetType: "skill"`
- `targetName` set to the selected skill name
- `targets[0]` with `targetType`, `targetName`, `targetId`, `before`, `after`,
  linked-attribute metadata, and eligibility flags
- `changes[0]` with `path`, `before`, `after`, and `displayLabel`

Application calls `increaseSkillForAdvance()` once. It reads the current skill
die from `character.skills`, computes the next die step, mutates `skill.die`,
and records:

```js
const change = {
  kind: "skill-increased",
  skillName,
  before,
  after,
};
```

The UI validation requires the selected skill to be trained, not already `d12`,
and equal to or higher than its linked attribute. Skills below their linked
attribute are routed to `Increase Two Skills`.

### Increase Two Skills Modeling

`Increase Two Skills` is currently modeled as one canonical advance containing two
skill targets. The generated entry uses:

- `type: "two-skills-increase"`
- `label` like `Increase Two Skills: Academics unskilled 1d4-2 -> d4, Battle unskilled 1d4-2 -> d4`
- `targetType: "skill"`
- `targetName` as a comma-separated list of the two selected skills
- `targets` with two target records, each carrying `before`, `after`,
  linked-attribute metadata, unskilled state, and eligibility flags
- `changes` with two canonical skill changes

Application validates exactly two different targets, then calls
`increaseSkillForAdvance()` once for each target. The resulting saved advance
has one `changes` array with two skill changes. This preserves the
one-advance/multiple-change model.

### Legacy Shape Compared To Canonical Ledger Shape

The current app-owned shape now writes canonical ledger fields for newly saved
advances. Normalization may still read legacy fields as migration inputs:

Old app-owned fields are no longer the long-term source of truth:

- `number`
- `rank`
- `summary`
- `dateAdded`
- `appliedChanges`

These old fields may be temporarily read during migration only where needed to
avoid breaking current code during the transition. They should not be expanded,
mirrored indefinitely, or preserved as a permanent transition model.

The migration can derive canonical fields from legacy fields while replacing
the internal source of truth:

- `summary` can mirror to `label`.
- `number` can mirror to `advanceNumber`.
- `rank` can mirror to `rankAtTime`.
- `dateAdded` or `appliedAt` can mirror to `createdAt`.
- `appliedChanges` can become canonical `changes` only when the target path,
  before value, after value, and display label are reliable.

New app-owned records should not depend on legacy fields. Export/import of this
app's new records should preserve canonical fields.

### Canonical Advancement Model Migration

Implemented migration direction:

- Replace the app-owned legacy advancement shape with the canonical ledger
  shape as the app's single internal model.
- Newly created app-owned advancement entries should use canonical fields as
  the source of truth: `id`, `type`, `label`, `source`, `advanceNumber`,
  `rankAtTime`, `createdAt`, `changes`, and `notes`.
- Each canonical change should use `path`, `before`, `after`, and
  `displayLabel`.
- Old pre-release app-owned advancement compatibility is intentionally not
  guaranteed.
- Old fields such as `number`, `rank`, `summary`, `dateAdded`, and
  `appliedChanges` may be read temporarily during migration only where needed
  to keep the transition incremental. They should not be expanded or preserved
  as a permanent transition model.
- Safe undo is based on canonical `changes`, not legacy `appliedChanges`.
- Imported Savaged.us advancement history should become canonical
  imported-history entries where practical:
  - `type: "imported-history"`
  - `source: "imported"`
  - `label` based on the imported advancement text
  - `changes: []` unless reliable before/after values exist
  - not treated as trusted undoable data

The migration should be focused. It should not rewrite Advancement from
scratch, add new advancement types, or start Edge prerequisite enforcement,
Power validation, Hindrance reduction/removal, or imported advancement
reconstruction.

### Recommended Test Plan

- `Increase Skill` creates one canonical ledger entry with one canonical
  `changes` item and updates the selected skill die.
- `Increase Two Skills` creates one canonical ledger entry with two canonical
  `changes` items and updates both selected skill dice.
- Canonical `two-skills-increase` remains one advance with two `changes` items,
  not two separate advances.
- `Increase Attribute`, `New Edge`, `New Powers`, and `Power Points` create
  canonical ledger entries with focused before/after or add changes and persist
  through reload.
- `Other / Marshal-approved` persists as canonical `manual-history` or
  `gm-exception` history without mutating the character.
- Persistence and reload preserve canonical app-owned advancement entries.
- The Character Sheet reflects applied Advancement updates after saving and
  reloading.
- Safe undo uses canonical `changes` if implemented in the first slice.
- If undo is deferred, canonical advances do not expose unsafe legacy undo.
- Attribute once-per-Rank blocking and Legendary every-other-Advance cadence
  are covered by focused browser tests.
- Reduce/remove Hindrance behavior is tested when that dedicated advancement
  type is designed.
- Imported Savaged.us advancement history is represented as imported history
  without trusted undoable changes unless reliable before/after data exists.

## Proposed Ledger Model

The initial ledger should continue to live on the character as
`character.advances` unless a later migration proves a separate key is needed.
New app-owned entries should use the canonical ledger shape as the internal
source of truth.

Recommended canonical entry shape:

```js
{
  id: "advance-6-skill-shooting",
  type: "skill-increase",
  label: "Increase Skill: Shooting d6 -> d8",
  source: "advancement",
  advanceNumber: 6,
  rankAtTime: "Seasoned",
  createdAt: "2026-06-25T00:00:00.000Z",
  changes: [
    {
      path: "skills[Shooting].die",
      before: "d6",
      after: "d8",
      displayLabel: "Shooting"
    }
  ],
  notes: ""
}
```

### Entry Fields

- `id`: stable unique entry ID. It must not change when the entry is rendered,
  edited, exported, or imported.
- `type`: machine-readable advancement type. Prefer stable kebab-case values
  such as `skill-increase`.
- `label`: user-facing summary generated from the selected change, suitable for
  the ledger list and export review.
- `source`: where the entry came from, such as `advancement`, `imported`,
  `manual`, or `marshal-override`.
- `advanceNumber`: one-based advance number used to order normal Advances.
- `rankAtTime`: rank when the advance was recorded, if provided or derivable
  from `advanceNumber`.
- `createdAt`: ISO timestamp when the app recorded the ledger entry.
- `changes`: array of before/after current-character mutations applied by this
  ledger entry.
- `notes`: optional player or Marshal note.

Old pre-release app-owned fields such as `number`, `rank`, `summary`,
`dateAdded`, and `appliedChanges` are not the long-term source of truth. They
may be read temporarily during migration only where needed to keep current code
working while canonical rendering, application, persistence, and undo are moved
onto the new shape.

## Change Shape

Each change records one current-character mutation:

```js
{
  path: "attributes.agility",
  before: "d6",
  after: "d8",
  displayLabel: "Agility"
}
```

Required fields:

- `path`: stable path to the changed character value. It should identify the
  semantic target, not just an array index that may drift after sorting.
- `before`: value immediately before applying the entry.
- `after`: value immediately after applying the entry.
- `displayLabel`: human-readable label for the changed trait, Edge, Power, or
  exception.

Optional future fields may include `targetId`, `targetName`, `targetType`,
`operation`, or `metadata`, but the first implementation should stay small.

## Supported Future Advancement Types

The ledger should support these post-creation growth categories:

- Gain a New Edge as canonical `type: "edge-gain"`.
- Increase One Skill as canonical `type: "skill-increase"`.
- Increase Two Skills as canonical `type: "two-skills-increase"`, represented
  by one advance entry with two skill changes.
- Increase One Attribute as canonical `type: "attribute-increase"`, with
  once-per-Rank blocking and Legendary every-other-Advance handling defined by
  the Attribute Increase Cadence Model.
- Reduce or Remove Hindrance.
- New Power as canonical `type: "power-gain"` when granted through an Edge or
  table-approved advancement path.
- Power Points as canonical `type: "power-points-increase"` while the app keeps
  the current behavior.
- Other table-approved change or GM exception as canonical
  `type: "manual-history"` or `type: "gm-exception"`.

Migration note: current UI labels remain user-facing labels. Internally,
newly saved app-owned records use canonical machine-readable type names.

## First Implementation Slice

Canonicalize current app-owned Advancement records.

The slice should:

- Map all currently supported app-owned advancement types to canonical type
  names at the data-shape level.
- Replace app-owned `Increase Skill` records with canonical
  `type: "skill-increase"` entries.
- Replace app-owned `Increase Two Skills` records with canonical
  `type: "two-skills-increase"` entries.
- Represent `New Edge` as `type: "edge-gain"`.
- Represent `Increase Attribute` as `type: "attribute-increase"`.
- Represent `New Powers` as `type: "power-gain"`.
- Represent `Power Points` as `type: "power-points-increase"`.
- Represent `Other / Marshal-approved` as `type: "manual-history"` or
  `type: "gm-exception"` with `changes: []` unless a reliable mutation exists.
- Keep `Increase Two Skills` as one advance entry with two skill changes.
- Store canonical fields: `id`, `type`, `label`, `source`, `advanceNumber`,
  `rankAtTime`, `createdAt`, `changes`, and `notes`.
- Store canonical `changes` using `path`, `before`, `after`, and
  `displayLabel`.
- Persist canonical app-owned advances through save and reload.
- Update the Character Sheet immediately after applying canonical advances.
- Keep existing applied behavior for current types and avoid expanding the
  legacy shape.
- Focus the deepest first-pass behavioral tests on `Increase Skill` and
  `Increase Two Skills` because they have the cleanest before/after data.

The slice should not include:

- Edge prerequisite enforcement.
- Imported advancement reconstruction.
- Hindrance reduction/removal.
- Power validation.

This slice should be first because:

- `Increase Skill` and `Increase Two Skills` already have working application
  behavior that should be preserved at the user-facing level.
- Skill advancement has simple, reliable before/after values.
- Canonical skill changes provide the clearest proof that the ledger model
  works before stricter rule-enforcement features are added.

## Imported Character Handling

Imported values should be treated as the current truth at the point of import.

The Advancement ledger should start tracking changes from the point of import
forward. Existing imported `advances` may be preserved as history, but they
should not be treated as reliable before/after mutations unless the app has
enough source data to prove them.

Full reconstruction of imported advanced characters is deferred. Savaged.us
imports may include advancement labels and counts, but they do not necessarily
include enough information to reconstruct the original creation baseline or
safe before/after changes.

If a source provides partial advancement history, represent it as imported
history with:

- `type: "imported-history"`
- `source: "imported"`
- `label` based on the imported advancement text
- `changes: []` unless reliable before/after values exist

Imported history should not be treated as trusted undoable data unless the
export provides reliable before/after values or a future import-specific
reconstruction process verifies the data.

## Boundaries

Advancement should not handle:

- Identity/profile edits.
- Gear changes.
- Combat state.
- Power activation.
- Character Setup confirmation.
- Campaign profile settings.

Those responsibilities remain with Characters, Inventory, Combat, Arcane,
Character Setup, and Sources & Rulesets respectively.

## Undo and Corrections

Undo is based on canonical `changes`, not legacy `appliedChanges`. Safe undo is
available only when the current character still matches the recorded `after`
value for every change in the advance.

If the current character no longer matches a recorded `after` value, the app
should not silently reverse the entry.

Preferred future direction:

- Safe undo may be offered only when the current value still matches the
  recorded `after` value.
- Unsafe undo should be blocked or recorded as a new correction entry rather
  than silently mutating data.
- GM exceptions/corrections should remain explainable in the same ledger model.

## Open Questions

- Should undo be supported immediately, or deferred?
- Should unsafe undo be blocked or recorded as a correction?
- How should rank be derived from advancement count?
- Should GM exceptions be a separate ledger type or a flag on any advance?
- How should imported advancement history be represented if the source provides
  partial data?
- What canonical type name should Gain a New Edge use?
- How should the app represent a two-Advance spend to fully remove a Major
  Hindrance?
- Should Power Point increases be modeled as Advancement, Arcane resource
  changes, or a specific GM exception/correction type?
