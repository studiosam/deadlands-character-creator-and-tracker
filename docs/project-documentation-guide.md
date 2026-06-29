# Project Documentation Guide

This project should be documented like a maintainable product codebase, not a
commented transcript of every implementation step. Comments should explain
intent, invariants, data ownership, and rules-model decisions that are easy to
break during later feature work.

## Commenting Standard

- Prefer module comments at the top of each feature file. State what the module
  owns, what it must not own, and which neighboring modules it coordinates with.
- Prefer comments that explain why a rule or boundary exists. Avoid comments
  that only repeat what the next line of code says.
- Document non-obvious Savage Worlds / Deadlands mechanics where the app model
  intentionally simplifies or separates player choice, table adjudication, and
  deterministic automation.
- Document persistence and import assumptions near normalization boundaries.
  These are the places where old saves, Savaged.us imports, and app-owned
  records meet.
- Document safety invariants near destructive or state-reset actions, such as
  session reset, setup finalization, import replacement, advancement undo, and
  inventory/source migration.
- Keep UI comments focused on workflow boundaries and state ownership. Markup
  structure should remain readable without comment noise.
- When a TODO is necessary, make it specific and testable. Avoid open-ended
  TODOs that become stale backlog clutter.

## Source Comment Layers

Use three layers of source comments:

1. **Module comments**: one short block at the top of each module describing the
   file's responsibility and boundaries.
2. **Function comments**: only for exported/shared helpers, persistence
   normalizers, rule-model helpers, and calculations with important edge cases.
3. **Inline comments**: only for local invariants or table-rule exceptions that
   are not obvious from the code.

## High-Value Documentation Targets

- `src/tracker/storage.js`: schema normalization, migration tolerance, and
  persistence boundaries.
- `src/tracker/effect-hooks.js`: deterministic passive effects versus reminders
  and table-dependent markers.
- `src/tracker/advancement-core.js` and
  `src/tracker/character-advancement.js`: canonical ledger entries,
  application behavior, and undo safety.
- `src/tracker/setup-model.js`, `src/tracker/setup-actions.js`,
  `src/tracker/setup-render.js`, and `src/tracker/setup-source.js`: setup audit
  ownership, source tracking, and creation-baseline rules.
- `src/tracker/inventory-model.js`, `src/tracker/encumbrance.js`,
  `src/tracker/inventory.js`, and `src/tracker/equipment.js`: physical item
  location, containers, backpack/combat load, and catalog-purchase assumptions.
- `src/tracker/combat.js` and `src/tracker/session-action-model.js`: live play
  state that changes during a session and should not mutate permanent character
  records unless explicitly saved.

## Documentation Workflow

- Add or update comments in the same slice that changes the underlying rule
  model.
- If a feature introduces a new app-owned data shape, document it in the
  relevant contract or roadmap before expanding implementation.
- Run `npm run format` and `npm run format:check` after documentation-only or
  comment-only edits.
- Run `npm run test:static` when JavaScript, package scripts, schema/version
  docs, or static-check-covered documentation change.
