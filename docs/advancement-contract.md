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

- Attribute increase.
- Skill increase.
- New Edge.
- New Power.
- Other table-approved change or GM exception.

Compatibility note: existing saved data and current UI code also mention
`Increase Two Skills` and `Power Points`. Preserve those records as legacy
advancement history. Do not make them the first new implementation slice.

## First Implementation Slice

Add a skill-increase advancement for confirmed characters.

The slice should:

- Require `setupStatus: "complete"`.
- Let the user select one eligible existing skill.
- Capture `before` and `after` die values before mutating the character.
- Append a ledger entry with a single `changes` item.
- Update the current skill die so the Character Sheet visibly changes.
- Persist through the existing save/export/import paths.
- Avoid changing Gear, Powers, Edge prerequisites, or full Advancement UI scope.

Skill increase should be first because:

- It is simpler than Edge prerequisite validation.
- It tests before/after change tracking.
- It visibly updates the Character Sheet.
- It avoids Gear, Powers, and full prerequisite enforcement.

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
- Should `Increase Two Skills` remain a first-class type, or should it become a
  single entry with two `skill-increase` changes?
- Should Power Point increases be modeled as Advancement, Arcane resource
  changes, or a specific GM exception/correction type?
