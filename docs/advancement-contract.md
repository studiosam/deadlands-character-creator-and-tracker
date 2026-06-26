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

This contract is planning documentation only. It does not describe newly
implemented UI behavior.

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

### Current `character.advances` Compatibility Shape

Existing advances normalize into records with these fields:

- `id`
- `number`
- `rank`
- `type`
- `summary`
- `targetName`
- `targetType`
- `targetId`
- `catalogId`
- `targets`
- `notes`
- `dateAdded`
- `source`
- `applied`
- `appliedByApp`
- `appliedAt`
- `appliedChanges`

Current supported applied types are `New Edge`, `Increase Skill`,
`Increase Two Skills`, `Increase Attribute`, `New Powers`, and `Power Points`.
Current legacy/manual type support also includes `Other / Marshal-approved`.

`appliedChanges` is a legacy change-capture shape. It records kind-specific
objects such as `edge-added`, `power-added`, `skill-increased`,
`attribute-increased`, and `power-points-increased`. Some imported or legacy
entries may have no reliable `appliedChanges`.

Do not destructively migrate this shape until a dedicated migration is planned.
The first ledger implementation should preserve existing saved advances and
round-trip imported/exported data.

## Current Implementation Audit

The current Advancement system is not unimplemented. It already has a legacy
history shape, adaptive editor fields, optional auto-application, persistence,
import/export round-tripping, and safe-undo checks for app-applied changes.
This audit documents the current behavior so the canonical ledger work can be
added as a compatibility bridge instead of a replacement.

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

| Type | Current classification | Current behavior |
| --- | --- | --- |
| `Increase Skill` | Implemented and auto-applied; Needs tests | Uses a generated skill target, validates an existing eligible trained skill equal to or greater than its linked attribute, increases one die step, writes one `skill-increased` `appliedChanges` entry, and can safely undo when the current die still matches the recorded `after` value. |
| `Increase Two Skills` | Implemented and auto-applied; Needs tests | Uses two generated skill targets, validates two different eligible skills below their linked attributes, applies both skill increases as one advance, writes two `skill-increased` `appliedChanges` entries, and can safely undo both when current values still match. This already matches the official one-advance/two-skill model. |
| `Increase Attribute` | Implemented and auto-applied; Partially implemented; Needs tests; Needs redesign later | Uses a generated attribute target, increases one attribute die step, updates Strength-dependent armor/weapon strength when Strength changes, writes one `attribute-increased` `appliedChanges` entry, and can safely undo when the current die still matches. It does not yet track the official once-per-Rank limit or the Legendary every-other-Advance cadence. |
| `New Edge` | Implemented and auto-applied; Partially implemented; Needs tests; Needs redesign later | Adds a catalog or custom Edge with `source: "advancement"` and `createdByAdvanceId`, writes one `edge-added` `appliedChanges` entry, and can safely undo by removing the same created Edge. Full Rank and requirements enforcement remains deferred. |
| `New Powers` | Implemented and auto-applied; Partially implemented; Needs tests; Needs redesign later | Adds one or more catalog/custom powers with `source: "advancement"`, `addedReason: "advancement"`, and `createdByAdvanceId`, writes `power-added` `appliedChanges`, and can safely undo by removing created powers. Power eligibility and starting-vs-advance separation remain deferred. |
| `Power Points` | Implemented and auto-applied; Partially implemented; Needs tests; Needs redesign later | Increases the max Power Points resource by the selected amount, creates a Power Points resource if missing, writes one `power-points-increased` `appliedChanges` entry, and can safely undo when the current max still matches. Whether this belongs in Advancement, Arcane, or a GM exception model remains an open design issue. |
| `Other / Marshal-approved` | Implemented as manual/history only; Needs tests; Needs redesign later | Records manual history with target, summary, notes, source, and date fields. It is not in `ADVANCE_APPLY_TYPES`, so the app does not auto-apply or undo character mutations for this type. |
| Reduce or Remove Hindrance | Legacy compatibility only through `Other / Marshal-approved`; Needs redesign later | There is no dedicated advancement type for reducing or removing Hindrances. The current app can record a manual history entry, but it does not apply a Minor removal, Major reduction, two-Advance Major removal spend, or GM-approved exception path. |

### Official Rules Alignment

The canonical ledger should describe the official advancement options separately
from the current legacy UI labels:

| Advancement option | Rule requirement | App implementation meaning |
| --- | --- | --- |
| Gain a New Edge | Character gains one Edge and must meet that Edge's Rank and requirements. | Add one Edge record, source it from an advancement, and record the before/after change in the ledger. The legacy UI label is `New Edge`; the bridge can map it to a canonical Edge-gain type later. |
| Increase One Skill | Increase one skill by one die type when that skill is equal to or greater than its linked attribute. | One advance entry, one skill target, one `changes` item. Canonical `type` should be `skill-increase`. |
| Increase Two Skills | Increase two different skills by one die type each when each skill is lower than its linked attribute. This can include new skills the character does not have yet, added at `d4`. | One advance entry, two skill targets, two `changes` items. Canonical `type` should be `two-skills-increase`, not two separate advances. |
| Increase One Attribute | Increase one attribute by one die type. This option may be taken only once per Rank. Legendary characters may raise an attribute every other Advance, up to the applicable maximum. | One advance entry, one attribute target, one `changes` item. Track Rank usage so the app can block or warn if already used this Rank. |
| Reduce or Remove Hindrance | Remove a Minor Hindrance, or reduce a Major Hindrance to Minor if that Hindrance can reasonably be reduced. With GM permission, two saved Advances may remove a Major Hindrance. | One advance entry for Minor removal or Major reduction. Major full removal needs either a two-advance spend model or a GM-approved exception path. |

### Current Application Model

New advance drafts are built by `advanceDraftFromForm()`. For supported apply
types, the editor defaults the "apply to character" checkbox on for new entries.
When that checkbox is selected, `saveAdvanceEditor()` calls
`applyAdvanceToCharacter()`, mutates the current character, then stores the
advance with:

- `applied: true`
- `appliedByApp: true`
- `appliedAt: new Date().toISOString()`
- `appliedChanges: [...]`

When a supported type is saved without application, or when
`Other / Marshal-approved` is saved, the entry remains history-only with:

- `applied: false`
- `appliedByApp: false`
- `appliedAt: ""`
- `appliedChanges: []`

Undo behavior is tied to legacy `appliedChanges`. Removing an applied advance
offers history-only removal when undo is unsafe, or remove-and-undo when every
recorded change still matches the current character state. This behavior should
not be removed during ledger compatibility work.

### Increase Skill Modeling

`Increase Skill` is currently modeled as one legacy advance with one skill
target. The generated entry uses:

- `type: "Increase Skill"`
- `targetType: "skill"`
- `targetName` set to the selected skill name
- `targets[0]` with `targetType`, `targetName`, `targetId`, `before`, `after`,
  linked-attribute metadata, and eligibility flags
- `summary` like `Increase Skill: Shooting d6 -> d8`

Application calls `increaseSkillForAdvance()` once. It reads the current skill
die from `character.skills`, computes the next die step, mutates `skill.die`,
and records:

```js
{
  kind: "skill-increased",
  skillName,
  before,
  after
}
```

The UI validation requires the selected skill to be trained, not already `d12`,
and equal to or higher than its linked attribute. Skills below their linked
attribute are routed to `Increase Two Skills`.

### Increase Two Skills Modeling

`Increase Two Skills` is currently modeled as one legacy advance containing two
skill targets. The generated entry uses:

- `type: "Increase Two Skills"`
- `targetType: "skill"`
- `targetName` as a comma-separated list of the two selected skills
- `targets` with two target records, each carrying `before`, `after`,
  linked-attribute metadata, unskilled state, and eligibility flags
- `summary` like `Increase Two Skills: Academics unskilled 1d4-2 -> d4, Battle unskilled 1d4-2 -> d4`

Application validates exactly two different targets, then calls
`increaseSkillForAdvance()` once for each target. The resulting saved advance
has one `appliedChanges` array with two `skill-increased` entries. This is
already close to the proposed ledger direction of one advance with multiple
skill changes and should be preserved.

### Legacy Shape Compared To Canonical Ledger Shape

The current app writes and depends on the legacy fields listed above. New
entries do not currently write the canonical ledger fields. Imported or manually
constructed records may preserve unknown canonical-like fields because
normalization starts by spreading the raw advance object, but the app does not
generate those fields or use them as the source of truth.

Canonical fields missing from newly created advancement entries:

- `label`
- `advanceNumber`
- `rankAtTime`
- `createdAt`
- `changes`

Legacy fields that should continue to be preserved:

- `number`
- `rank`
- `summary`
- `targetName`
- `targetType`
- `targets`
- `dateAdded`
- `applied`
- `appliedByApp`
- `appliedAt`
- `appliedChanges`

Additional legacy fields currently used or preserved include `id`, `type`,
`targetId`, `catalogId`, `powerPointAmount`, `notes`, and `source`.

The current legacy fields map naturally to canonical fields:

- `summary` can mirror to `label`.
- `number` can mirror to `advanceNumber`.
- `rank` can mirror to `rankAtTime`.
- `dateAdded` or `appliedAt` can mirror to `createdAt`.
- `appliedChanges` can be converted into canonical `changes` where the target
  path, before value, after value, and display label are reliable.

### Ledger Compatibility Bridge

Recommended next implementation plan:

- Keep existing legacy fields and continue normalizing old saves without
  destructive migration.
- For newly applied advances, also add canonical fields where possible.
- Map legacy `Increase Skill` entries to canonical `type: "skill-increase"` for
  new bridged records.
- Map legacy `Increase Two Skills` entries to canonical
  `type: "two-skills-increase"` for new bridged records, preserving one advance
  with two skill changes.
- Map legacy `Increase Attribute` entries to a canonical attribute-increase type
  and add Rank-use metadata when the attribute Rank-limit work is implemented.
- Mirror `summary` to `label`.
- Mirror `number` to `advanceNumber`.
- Mirror `rank` to `rankAtTime`.
- Mirror `dateAdded` or `appliedAt` to `createdAt`.
- Convert `appliedChanges` into a canonical `changes` array when the path and
  before/after values are reliable.
- Preserve `appliedChanges` for undo compatibility.
- Leave existing saved advances untouched unless a later migration is explicitly
  designed and tested.

The bridge should be a small additive layer around normalization or advance
application. It should not rewrite Advancement from scratch, remove existing
applied behavior, or change Edge, Power, Attribute, or Power Point semantics as
part of the compatibility task.

### Recommended Test Plan

- Existing `Increase Skill` still applies and updates the selected skill die.
- Existing `Increase Two Skills` still applies as one advance with two skill
  changes.
- Canonical `two-skills-increase` remains one advance with two `changes` items,
  not two separate advances.
- Attribute increases warn or block once the same Rank has already used its
  attribute increase allowance.
- Reduce/remove Hindrance behavior is tested when that dedicated advancement
  type is designed.
- Newly applied advances preserve legacy `appliedChanges`.
- Newly applied advances also include canonical `changes` if the bridge is
  implemented later.
- Export/import round-trips both legacy and canonical fields.

## Proposed Ledger Model

The initial ledger should continue to live on the character as
`character.advances` unless a later migration proves a separate key is needed.
New entries should use a canonical ledger shape while preserving legacy fields
for compatibility during transition.

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

During transition, new records may also mirror legacy fields:

- `number` mirrors `advanceNumber`.
- `rank` mirrors `rankAtTime`.
- `summary` mirrors `label`.
- `dateAdded` mirrors `createdAt`.
- `appliedChanges` can mirror or be derived from `changes` until undo behavior
  is redesigned.

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

- Gain a New Edge.
- Increase One Skill as canonical `type: "skill-increase"`.
- Increase Two Skills as canonical `type: "two-skills-increase"`, represented
  by one advance entry with two skill changes.
- Increase One Attribute, including once-per-Rank tracking and Legendary
  every-other-Advance handling.
- Reduce or Remove Hindrance.
- New Power when granted through an Edge or table-approved advancement path.
- Other table-approved change or GM exception.

Compatibility note: existing saved data and current UI code also mention
`Increase Two Skills`, `New Powers`, and `Power Points`. Preserve those records
as legacy advancement history. Do not make them the first new implementation
slice unless the bridge is explicitly scoped to preserve current behavior.

## First Implementation Slice

Implement the Ledger Compatibility Bridge for newly applied advances.

The slice should:

- Preserve existing legacy advancement behavior and fields.
- Preserve existing application behavior for `Increase Skill` and
  `Increase Two Skills`.
- Preserve existing application behavior for `New Edge`, `Increase Attribute`,
  `New Powers`, and `Power Points`.
- Preserve existing safe-undo behavior through `appliedChanges`.
- Add canonical fields to newly applied advances where possible: `label`,
  `advanceNumber`, `rankAtTime`, `createdAt`, and `changes`.
- Mirror `summary` to `label`, `number` to `advanceNumber`, `rank` to
  `rankAtTime`, and `dateAdded` or `appliedAt` to `createdAt`.
- Convert legacy `appliedChanges` into canonical `changes` without removing or
  replacing `appliedChanges`.
- Map legacy `Increase Skill` to canonical `type: "skill-increase"` while
  keeping legacy `type: "Increase Skill"` if needed for compatibility.
- Map legacy `Increase Two Skills` to canonical
  `type: "two-skills-increase"` as one advance with two skill changes, while
  keeping legacy `type: "Increase Two Skills"` if needed for compatibility.
- Persist through the existing save/export/import paths.
- Avoid changing Gear, Edge prerequisites, Power selection rules, Attribute
  Rank-limit enforcement, Hindrance reduction/removal, or full Advancement UI
  scope.

The bridge should be first because:

- The current app already applies multiple advancement types.
- `Increase Skill` and `Increase Two Skills` already have working behavior that
  should not be reimplemented from scratch.
- Canonical fields can be added additively to new entries without destructively
  migrating saved advances.
- It makes future ledger work possible while preserving undo compatibility.

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
history with `source: "imported"` and no trusted `changes` unless a future
import-specific reconstruction process verifies the data.

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

Undo is not required for the first ledger slice.

The current app has legacy safe-undo checks for some `appliedChanges`, but the
ledger contract should not depend on unsafe automatic undo. If the current
character no longer matches a recorded `after` value, the app should not silently
reverse the entry.

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
