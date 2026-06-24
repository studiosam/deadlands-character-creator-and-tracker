# Case Study: Deadlands Character Creator and Tracker

## Product Goal

The app is a local-first table companion for players who need faster live-state
tracking than a paper sheet provides. The primary use case is play at the table:
combat status, ammo, inventory, Power Points, active powers, and notes must be
visible and editable quickly on desktop or mobile.

## Architecture

The project is intentionally static. `index.html` defines the primary panels,
`styles.css` owns the responsive visual system, and `src/` contains plain
browser JavaScript loaded in dependency order. The tracker code is split by
behavior under `src/tracker/`: rendering, storage, events, inventory, combat,
equipment, arcane powers, advancement, notes, and helper utilities.

This keeps deployment simple for GitHub Pages and avoids introducing account,
server, or database concerns before the product needs them.

## Data Model and Persistence

The app keeps a local character library, one active tracker character, and one
creator draft in `localStorage`. The legacy `deadlands-tracker-v2` key still
mirrors the active character, while the multiple-character library lives behind
`deadlands-character-library-v1`. JSON export/import is the portability layer.
New exports include `schemaVersion`, `exportType`, `exportedAt`, and full-state
exports include the character library.

The persistence layer is deliberately small:

- Storage adapter functions isolate `localStorage`.
- Migration helpers stamp or upgrade tracker and creator payloads.
- Export helpers produce tracker-character, creation-draft, and full-state
  envelopes.
- Character library helpers save, switch, duplicate, rename, delete, and migrate
  local character slots without leaking storage details into the UI.

That structure leaves room for future cloud sync or shareable URLs without
rewriting feature modules around a new storage backend.

## Import Handling

Savaged.us JSON is treated as an external format, not as app-owned state. The
importer normalizes character basics, inventory, armor, weapons, ammo, powers,
resources, reminders, and warnings into the tracker model.

The app avoids over-inferring Deadlands arcane state. Explicit Arcane Background
data, explicit Power Points, or real Arcane Background Edges can enable Power
Point tracking; ambiguous flavor text becomes a warning instead of a silent
mechanical decision.

## UX Decisions

The first screen prioritizes table use over marketing. Combat is the default
tab, with high-frequency state controls near the top. Character creation remains
available but separate from live play.

Recent polish adds:

- First-run demo/sample loading.
- A demo-mode banner so sample data is not mistaken for a campaign save.
- App-styled dialogs and toasts for destructive actions, imports, exports, and
  validation feedback.
- Mobile-friendly grids for combat, inventory, arcane tools, notes, and dialogs.

## Tradeoffs

- Static app deployment keeps setup easy, but multi-device sync is manual via
  JSON export/import.
- The app includes practical catalog metadata, but it must not replace official
  rulebooks or reproduce long rules text.
- Plain JavaScript keeps the code easy to publish and inspect, but larger
  product ambitions may eventually justify routing, typed schemas, and a test
  harness around individual modules.

## Next Steps

- Publish a hosted demo and add screenshots/GIFs to the README.
- Expand automated tests around imports, migrations, and core table workflows.
- Gather user feedback from real sessions before investing in paid-product
  packaging.
- Resolve licensing before selling bundled Deadlands-specific content.
