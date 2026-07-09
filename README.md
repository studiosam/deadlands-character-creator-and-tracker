# Deadlands Character Tracker

An unofficial browser-based table companion for Deadlands: The Weird West and
SWADE play. It is primarily a local-first live campaign tracker and player
dashboard for use after character creation: combat state, inventory, arcane
resources, active powers, notes, advancement history, and table reminders live
in one static web app that can run from GitHub Pages or directly from the
project folder.

Character Setup is included as setup scaffolding and validation support for this
prototype, but the app is not a replacement for Savaged.us, Pinnacle products,
the official books, or a full VTT. In a real official integration, Savaged.us or
another licensed builder would remain the source of truth for official
character creation and complete catalogs.

This project is portfolio-first: it demonstrates product thinking, stateful
front-end architecture without a framework, import normalization, local data
persistence, responsive table-use UX, and practical test coverage around a
rules-heavy hobby tool.

## Problem and Audience

Deadlands/SWADE character sheets collect a lot of short-lived table state:
wounds, fatigue, Bennies, Conviction, loaded rounds, ammo reserves, armor
locations, active powers, Power Points, carried gear, notes, and reminders. A
paper sheet or static PDF can track the permanent character, but live play often
needs a faster cockpit.

This app targets players who already own and use the official rulebooks and
want a local, private, session-focused tracker at the table.

## Current Workflows

- Start from a minimal landing page that can continue the active saved
  character, choose a saved character, create a character, import JSON, try the
  sample when no characters exist, or open the read-only Sources & Rulesets
  page.
- Track wounds, fatigue, Bennies, Conviction, penalties, defenses, conditions,
  combat resources, powers, consumables, reminders, and GM-facing combat
  declarations.
- Manage weapons, loaded rounds, reserve ammunition, armor by location, gear,
  vehicles, storage locations, carrying capacity, and encumbrance.
- Build or review a Deadlands/SWADE character through Character Setup, finish
  setup from Gear, and start play from the live tracker.
- Review imported or newly created characters through the `setupStatus`
  lifecycle: characters start as `needsReview`, confirmed setup becomes
  `complete`, and Review Setup can intentionally reopen setup later.
- Use the Character tab as a reference-focused Character Sheet after setup is
  complete, while keeping the setup workflow hidden by default.
- Browse a read-only Catalog reference for Edges, Hindrances, and Powers.
- Track Arcane Backgrounds, Power Points, known powers, active powers, variable
  Power Point spending, and Huckster Dealing with the Devil helper state.
- Track Deadlands-specific player bookkeeping for Mad Scientist devices,
  Huckster state, and Agent/Ranger organization records without automating
  Marshal-facing outcomes.
- Import Savaged.us JSON exports and preserve app-owned tracker data through
  localStorage and JSON export/import.
- Undo or redo recent per-character tracker changes with snapshot history that
  persists through reload.
- Save, switch, rename, duplicate, delete, and export multiple local character
  slots from the Manage > Characters panel.
- Choose a visual theme from the landing page or Manage menu; theme preferences
  persist in the browser.
- Edit stable character profile fields from the Characters panel: name, player,
  profession or title, age, gender, description, and background.
- Review app version, schema version, backup actions, and local data controls
  from Local Data. Privacy/legal notes and source-book assumptions live on their
  own pages.

## Current Scope

- Implemented: combat tracking, Combat Declaration, inventory/equipment
  management, active powers, local character library, JSON import/export,
  minimal landing page, read-only Sources & Rulesets, Character Setup validation,
  confirmed Character Sheet mode, Characters panel profile editing, global
  undo/redo, Deadlands bookkeeping records, and automated browser/static checks.
- Implemented setup scaffolding: concept, Attributes, Skills, Edges,
  optional Hindrances with benefit spending, Powers setup, Gear purchases,
  setup sell-back, useful-ammo prioritization, setup source tracking, Gear
  finalization, and creation baseline snapshots for eligible created pre-advance
  characters.
- Implemented Advancement baseline: canonical app-owned Advancement entries,
  supported application for existing advancement types, persistence,
  import-history handling, and safe undo checks where reliable before/after
  data exists.
- Deferred: full Edge prerequisite enforcement, full Power effect automation,
  free/source-granted starting gear modeling, imported advanced-character
  baseline reconstruction, editable campaign/source configuration, and any
  system that would replace Marshal adjudication.

## Versioning

Current app version: `0.2.0`.

Use semantic versioning from this point forward:

- Patch releases (`0.2.1`, `0.2.2`, etc.) are for bug fixes, small visual
  polish, docs, tests, and other low-risk corrections.
- Minor releases (`0.3.0`, `0.4.0`, etc.) are for meaningful workflow or feature
  milestones, such as the next live Character Tracker cleanup pass.
- Major release `1.0.0` is reserved for a broadly table-ready app with both
  Character Setup and the live tracker stabilized.

`0.2.0` marks the Character Setup MVP milestone.

## Known Limitations

- The app does not replace official books, licensed catalogs, Savaged.us, or a
  VTT.
- The app uses short app-facing summaries and reminders; it does not include
  full rules text or rulebook tables.
- The app does not automate full combat resolution, attack/damage outcomes,
  Fear tables, duels, travel systems, or Marshal-facing decisions.
- There is no cloud sync, account system, shared campaign storage, telemetry, or
  analytics. Data stays in browser local storage unless the user exports or
  imports JSON backups.
- Imported or already-advanced characters may require review because external
  exports do not always contain enough information to reconstruct original
  creation choices or safe before/after advancement data.

## Demo and Screenshots

Try the hosted demo:

```text
https://studiosam.github.io/deadlands-character-creator-and-tracker/
```

Open `index.html` directly in a browser, or serve the folder locally:

```sh
npm install
npm run dev
```

The app is published from GitHub Pages and can also be served from the
repository root.

Recommended portfolio screenshots/GIFs:

- Minimal landing page with saved-character selection.
- Combat tab during live play with wounds, Bennies, weapons, ammo, conditions,
  Combat Declaration, and Undo/Redo visible.
- Inventory tab showing storage locations and encumbrance.
- Encumbrance separates Current Load from Combat Load: Current Load is what the
  character normally carries, Combat Load assumes droppable backpack/container
  load is dropped, Carrying Capacity is the base penalty threshold, and Maximum
  Normal Carry is only a separate out-of-combat allowance when shown.
- Arcane tab showing Power Points, known powers, active powers, runtime
  reminders, and variable Power Point spend details.
- Character Setup Gear finalization, confirmed Character Sheet mode, and
  creation baseline audit.
- Characters panel profile editor.
- Read-only Sources & Rulesets page.
- Savaged.us import flow with import warnings.

## Technical Highlights

- Static HTML/CSS/JavaScript app with no runtime backend.
- Split tracker modules under `src/tracker/` for rendering, storage, inventory,
  combat, advancement, arcane powers, and event handling.
- Explicit exported JSON `schemaVersion` with migration helpers for old raw
  saves, full app state, creation drafts, and tracker-character exports.
- Local-first persistence through `localStorage`; JSON export/import remains the
  portability and backup mechanism.
- Per-character snapshot undo/redo history is stored separately from exported
  character JSON so table mistakes can be recovered locally without changing
  backup format.
- Character library state is stored separately from the legacy active tracker
  save, so older browser saves can migrate without losing the existing key.
- App-styled dialogs and toasts replace native browser alerts/confirms.
- Image-backed minimal landing page supports saved-character selection, creation,
  JSON import, sample loading, and read-only Sources & Rulesets access.
- `setupStatus` separates one-time Character Setup validation/finalization from
  the normal confirmed Character Sheet.
- Characters panel profile editing keeps stable identity/profile updates out of
  casual Character Sheet reference use.
- Local Data centralizes app status, backup/export actions, and browser storage
  controls. Privacy & Legal and Sources & Rulesets are separate informational
  pages.
- Playwright tests cover load, responsive tabs, sample loading, landing flows,
  setupStatus, profile editing, imports, export/import round trips, persistence,
  character-library isolation, inventory, setup flows, active powers,
  Advancement, Deadlands bookkeeping, global undo/redo, Combat Declaration, and
  core combat controls.

## Import and Export Formats

Supported imports:

- Tracker character JSON exported by this app.
- Full app state JSON exported by this app.
- Character creation draft JSON exported by this app.
- Older raw tracker or creator JSON from before `schemaVersion`.
- Savaged.us character JSON exports.

New app exports include:

- `schemaVersion`: current app schema version.
- `exportType`: `tracker-character`, `creation-draft`, or `full-state`.
- `exportedAt`: ISO timestamp for exported files.

The existing browser save key remains `deadlands-tracker-v2` for backward
compatibility.
Multiple-character library saves use `deadlands-character-library-v1`, while
the legacy key continues to mirror the active character for older exports and
existing persistence paths.

## Privacy

All character data is stored locally in the browser unless the user exports a
JSON file. Exported files may contain player names, campaign notes, secrets,
session notes, or other private table information. There is no backend sync,
analytics, account system, or remote storage in the current app.

See [PRIVACY.md](PRIVACY.md) for the short public privacy note.

## Legal and IP Posture

This is an unofficial fan tool and portfolio project. It is not affiliated with,
endorsed by, sponsored by, or approved by Pinnacle Entertainment Group. Users
need the official books to play. The app should avoid reproducing long rules
text and should treat catalog summaries as practical app metadata, not a
replacement for the rulebooks.

See [NOTICE.md](NOTICE.md). The repository is source-available for
non-commercial use only, and bundled Deadlands/SWADE-specific rules/catalog
metadata is not licensed for sale or commercial redistribution.

## Project Structure

```text
deadlands-character-creator-and-tracker/
  index.html
  styles.css
  src/
    config.js
    persistence.js
    app-ui.js
    app.js
    creator.js
    savaged-import.js
    tracker/
      storage.js
      events.js
      render.js
      combat.js
      inventory.js
      equipment.js
      character-advancement.js
      ...
  docs/
    case-study.md
    project-documentation-guide.md
    manual-checklist.md
    Sample Characters/
  tests/
    browser/
    static/
```

## Development

```sh
npm install
npm run dev
npm run lint
npm test
npm run test:browser:fast
npm run format:check
```

Scripts:

- `npm run dev`: serve the static app with Vite.
- `npm run lint`: run static project checks.
- `npm run test:static`: run static parse and lint checks.
- `npm run test:browser`: run the Playwright browser suite.
- `npm run test:browser:desktop`: run the full browser suite on the desktop
  Playwright project only.
- `npm run test:browser:mobile`: run the full browser suite on the mobile
  Playwright project only.
- `npm run test:browser:fast`: alias for the desktop browser suite.
- `npm run test:setup`, `npm run test:advancement`,
  `npm run test:inventory`, `npm run test:powers`, `npm run test:combat`,
  `npm run test:deadlands`, `npm run test:import`, and `npm run test:undo`:
  run targeted feature batches across configured browser projects.
- `npm run test:setup:desktop`: run setup tests on desktop only for faster
  local iteration.
- `npm test`: run static checks and the Playwright browser suite.
- `npm run format`: format project files with Prettier.
- `npm run format:check`: check formatting without rewriting files.

Recommended local workflow:

1. While developing, run the smallest relevant targeted desktop command, such
   as `npm run test:setup:desktop` or `npx playwright test --project=desktop
tests/browser/setup-edges.spec.js`.
2. Before committing, run the full targeted feature group, such as
   `npm run test:setup`, `npm run test:powers`, or `npm run test:inventory`.
3. Before pushing, release, or broader handoff, run `npm test` as the final
   safety gate.

See [docs/project-documentation-guide.md](docs/project-documentation-guide.md)
for the source comment and project documentation standard.

GitHub Actions runs `npm ci`, installs Playwright browsers, then runs
`npm run test:static`, `npm run format:check`, and `npm run test:browser` on
pushes and pull requests targeting `main`.

## Roadmap

- See [Mechanics Roadmap](docs/mechanics-roadmap.md) for the rules-mechanics
  gap analysis and phased implementation plan.
- Add final screenshots/GIFs for the hosted demo.
- Continue converting manual rules-heavy checklist items into automated tests
  without expanding MVP scope.
- Keep Character Setup, Character Sheet reference, Characters profile editing,
  Inventory, Arcane, Combat, and the existing Advancement workflow clearly
  separated.
- Finish Character Setup UX polish before adding new mechanics.
- Refactor the largest setup modules after the current Gear workflow stabilizes.
- Harden schema migrations as real breaking data changes appear.
- Improve onboarding copy and empty states from actual table feedback.
- If monetization becomes serious, split a generic tracker core from
  user-provided setting data and resolve licensing first.

## License

This repository is source-available under a custom non-commercial license. It
is not licensed under MIT, Apache, GPL, or another open-source license.

The license allows personal non-commercial use, educational or portfolio review,
private non-commercial modification, and non-commercial patches or forks that
preserve the project notices. Selling, paid hosting, commercial bundling,
commercial distribution, or commercial derivative use requires prior written
permission from the copyright holder.

See [LICENSE](LICENSE) for the project-specific terms. Third-party Deadlands,
Savage Worlds, SWADE, and related names or setting material remain owned by
their respective rights holders and are not licensed by this project.
