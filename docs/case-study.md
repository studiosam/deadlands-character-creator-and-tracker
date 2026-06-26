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

The first screen is now a minimal application launcher rather than a marketing
page. It lets a returning player continue the active saved character, select a
saved character, create a character, import JSON, try the sample in the empty
state, or open the read-only Sources & Rulesets page. After the launcher,
Combat remains the default play tab, with high-frequency state controls near the
top.

Character Setup is treated as a one-time creation/import confirmation workflow.
Newly created and imported characters start with `setupStatus: "needsReview"`;
confirming setup changes that state to `complete`. Complete characters open the
Character tab as a reference-focused Character Sheet by default, while Review
Setup can intentionally reopen the setup workflow without changing persisted
status.

The Characters panel owns deliberate character management and stable profile
edits after setup: switching, renaming, duplicating, deleting, exporting, and
editing identity/profile text. Normal Character Sheet reference is kept separate
from profile management and from post-creation rules changes.

Recent polish adds:

- Minimal landing page with saved-character selection and docked JSON import.
- Read-only Sources & Rulesets page for the current Deadlands-focused profile.
- `setupStatus` separation between setup review and confirmed sheet reference.
- Characters panel profile editor.
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

- Add final screenshots/GIFs to the README.
- Expand automated tests around remaining manual rules-heavy workflows without
  broadening MVP scope.
- Keep Advancement paused until its workflow boundary is separated from the
  normal Character Sheet.
- Gather user feedback from real sessions before investing in paid-product
  packaging.
- Resolve licensing before selling bundled Deadlands-specific content.
