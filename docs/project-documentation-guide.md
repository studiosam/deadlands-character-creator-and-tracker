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
  session reset, setup finalization, import replacement, global undo/redo,
  advancement undo, and inventory/source migration.
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
- `src/tracker/undo-history.js`: snapshot history ownership, grouping
  boundaries, redo invalidation, and why undo state stays outside exported
  character JSON.
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
- `src/tracker/combat.js`, `src/tracker/combat-declaration-model.js`, and
  `src/tracker/session-action-model.js`: live play state, player-facing
  declaration support, action-card helpers, and boundaries that prevent the app
  from replacing GM adjudication.

## Module Boundaries and Load Order

The tracker is currently a classic-script single-page app. Files share browser
globals, so `index.html` script order is part of the architecture and should be
changed deliberately.

Keep the load order grouped by dependency:

1. App configuration and persistence primitives:
   `src/config.js`, `src/persistence.js`.
2. Catalog data and catalog-backed rule helpers:
   `src/catalogs.js`, `src/power-catalog.js`, `src/arcane.js`,
   `src/default-character.js`.
3. Tracker state, rule models, and deterministic mechanic registries:
   `src/tracker/constants.js`, `src/tracker/state-dom.js`,
   `src/tracker/session-action-model.js`,
   `src/tracker/effect-hook-factories.js`,
   `src/tracker/effect-hooks-edges.js`,
   `src/tracker/effect-hooks-hindrances.js`,
   `src/tracker/effect-hooks.js`.
4. Shared UI utilities and data-model helpers:
   `src/app-ui.js`, `src/tracker/utils.js`,
   `src/tracker/equipment-helpers.js`,
   `src/tracker/inventory-model.js`,
   `src/tracker/combat-declaration-model.js`,
   `src/tracker/encumbrance.js`, `src/tracker/render-helpers.js`,
   `src/tracker/advancement-core.js`, `src/tracker/entries.js`,
   `src/tracker/setup-source.js`.
5. Persistence and cross-cutting services:
   `src/tracker/storage.js`, `src/tracker/undo-history.js`.
6. Domain render/action modules:
   `src/tracker/catalog-ui.js`, setup modules, `src/tracker/render.js`,
   `src/tracker/combat-declaration-ui.js`,
   `src/tracker/active-power-cards.js`, `src/tracker/combat.js`, notes,
   equipment, Arcane, inventory, power editing, advancement, import/export, and
   library actions.
7. Event wiring and app startup:
   `src/tracker/events.js`, `src/savaged-import.js`, `src/creator.js`,
   `src/app.js`.

Boundary rules:

- Model files should normalize or calculate state and avoid direct DOM writes.
- Render/UI files may build markup and attach element-local handlers, but should
  not own persistence formats.
- Action files may mutate character state through existing save/render
  patterns, but should not duplicate normalization rules.
- Catalog files are data sources. Static validation protects IDs, required
  fields, price/weight shapes, duplicate names, and power-profile references.
- `events.js` should remain wiring-focused: global event listeners and
  `els.*.onclick` assignments belong there; feature behavior belongs in domain
  action modules.

## Browser Test Organization

Browser specs are split by player-facing domain:

- Core navigation and read-only surfaces belong in `tests/browser/core.spec.js`.
- Character setup should stay in setup-specific specs, grouped by core setup,
  Edge/Hindrance selection, Powers setup, and Gear setup.
- Inventory and encumbrance tests should stay focused on carried load,
  containers, item storage, and inventory persistence.
- Advancement tests should cover ledger creation, application behavior, and
  import-history treatment.
- Effect-hook tests should be split by passive math, roll/reminder surfaces, and
  session/action-card hooks.
- Arcane active-power tests should cover activation records, active-card
  reminders, duration tracking, and variable Power Point spend.
- Import/export/library tests should cover profile slots, landing import flows,
  duplicated character independence, and JSON round trips.

Shared Playwright helpers live in `tests/browser/helpers.js`. Each spec must
call `useAppTestHooks()` so local storage cleanup and browser runtime-error
collection are registered per file.

## Documentation Workflow

- Add or update comments in the same slice that changes the underlying rule
  model.
- If a feature introduces a new app-owned data shape, document it in the
  relevant contract or roadmap before expanding implementation.
- Run `npm run format` and `npm run format:check` after documentation-only or
  comment-only edits.
- Run `npm run test:static` when JavaScript, package scripts, schema/version
  docs, or static-check-covered documentation change.
