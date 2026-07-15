# Deadlands Character Tracker

An unofficial, local-first character setup tool and interactive character sheet
for **Deadlands: The Weird West** and **Savage Worlds Adventure Edition
(SWADE)**.

The app is designed for table use after character creation. It keeps frequently
changing player information—wounds, Fatigue, Bennies, ammunition, inventory,
Power Points, active powers, notes, and advancement history—in one responsive
browser app. It is an interactive sheet and bookkeeping aid, not a combat
simulator, VTT, or replacement for the official rules.

**Current version:** `1.0.0`

**Current status:** First stable browser and Windows desktop release. Continued
table testing will inform patch releases and visual polish.

## Features

### Character Setup

- Seven guided steps: Concept, Attributes, Skills, Edges, Hindrances, Powers,
  and Gear.
- Per-step validation, budget meters, warnings, and catalog browsing.
- Concept randomizer backed by `docs/deadlands_weird_west_names.json`; player
  name and gender remain manual choices.
- Optional Hindrances and correct handling for characters without an Arcane
  Background.
- Finalization from Gear with a compact blocker list and jump links to any step
  that needs attention.
- Creation-baseline snapshots for eligible newly created characters.

### Live Character Sheet

- **Combat:** wounds, Fatigue, Bennies, Conviction, concise roll modifiers,
  defenses, weapon use, ammunition, consumables, and power casting.
- **Character:** traits, skilled and unskilled skills, Edges, Hindrances,
  advancement history, and character reference information.
- **Inventory:** equipped and carried gear, backpack load, off-body storage,
  vehicles and mounts, weapon-specific ammunition, money, and tiered
  encumbrance thresholds.
- **Arcane:** available only when the character has arcane content; manages
  Power Points, known powers, active-power records, reminders, and variable
  Power Point options.
- **Notes:** player notes and Deadlands-specific bookkeeping records.

### App and Data Management

- Multiple local character slots with create, rename, duplicate, delete,
  import, and export actions.
- Savaged.us JSON import plus app-owned character, draft, and full-state JSON
  formats.
- Local snapshot-based undo and redo for tracker changes.
- Persistent visual themes selectable from the main menu or tracker header.
- Read-only catalogs and source/ruleset references.
- Local Data, Privacy & Legal, and Sources & Rulesets pages kept outside the
  live tracker workflow.

## Intended Workflow

1. Open the main menu and choose, create, or import a character.
2. Complete Character Setup when required.
3. Finish setup from the Gear step by selecting **Finish Setup & Start
   Playing**. Setup is never finalized silently.
4. Use the read-only Character Sheet and live tracker tabs during play.
5. Return to Character Setup only when setup information needs deliberate
   correction.

The tracker header keeps only table-relevant controls: Main Menu, Undo, Redo,
Characters, and the standalone theme picker. Broader data and app management
remain on the main menu.

## Quick Start

Try the hosted app:

```text
https://studiosam.github.io/deadlands-character-creator-and-tracker/
```

Or run it locally:

```sh
npm install
npm run dev
```

Then open the local URL printed by Vite. The app can also be opened directly
from `index.html`, but the local development server gives more consistent
browser behavior.

### Desktop App

The same static app can run in its Electron desktop shell:

```sh
npm install
npm run desktop
```

Desktop shortcuts:

- `F11`: enter or leave full screen.
- `Ctrl`/`Cmd` + `+` or `-`: zoom in or out.
- `Ctrl`/`Cmd` + `0`: reset zoom.
- `Ctrl`/`Cmd` + `Z`: undo the last tracker change when focus is outside an
  editable field.
- `Ctrl`/`Cmd` + `Shift` + `Z` or `Ctrl` + `Y`: redo the last tracker change.

Text fields retain their normal native undo behavior while being edited. The
Electron app uses its own local browser profile, so browser and desktop data do
not automatically share `localStorage`; JSON export/import can move characters
between them.

Build the Windows installer with:

```sh
npm run desktop:package
```

The Squirrel installer and its release metadata are written to `release/`. The
minimal installer displays the animated Studio Sam artwork from
`assets/studiosam.gif` while it installs the app for the current Windows user.
The asset build creates the installer icon, re-encodes the animation, and
verifies both with the same Windows WPF decoder used by Squirrel before
packaging.
The build runs in a temporary directory, replaces superseded release artifacts
only after a successful package, and removes its temporary output afterward.
If Windows locks a build directory, the cleanup helper retries it in the
background; run `npm run cleanup:after-vscode` to schedule another cleanup after
VS Code closes. The installer is currently unsigned, so Windows may show a
SmartScreen warning.

### Publishing a GitHub Release

The release workflow builds the Windows installer on a GitHub-hosted Windows
runner whenever a semantic version tag is pushed. The tag must exactly match
the version in `package.json`, prefixed with `v`.

```sh
git push origin main
git tag v1.0.0
git push origin v1.0.0
```

The workflow creates or updates the matching GitHub Release and uploads the
Squirrel Setup EXE, full NuGet package, `RELEASES` manifest, and SHA-256 checksum
file. An existing tag can also be rebuilt from the workflow's manual
`workflow_dispatch` action.

## Data and Privacy

Character data is stored in the browser with `localStorage`. There is no cloud
sync, account system, telemetry, analytics, or remote character database.

Use JSON export for backups or moving characters between browsers. Supported
imports include:

- Character JSON exported by this app.
- Full app-state JSON exported by this app.
- Character creation draft JSON exported by this app.
- Older tracker/creator JSON handled by schema migrations.
- Savaged.us character JSON exports.

App exports include a `schemaVersion`, `exportType`, and `exportedAt` timestamp.
The legacy `deadlands-tracker-v2` key remains supported for compatibility, and
the multi-character library uses `deadlands-character-library-v1`.

Exported files may contain player names, notes, campaign information, or other
private table data. See [PRIVACY.md](PRIVACY.md) for the public privacy summary.

## Scope and Limitations

The app intentionally does not automate:

- Full attack, damage, combat, duel, Fear, travel, or encounter resolution.
- Marshal-facing decisions or secret outcomes.
- Complete Edge prerequisite enforcement.
- Every Power effect or rules interaction.
- A complete licensed character catalog.
- Cloud sync or shared campaign state.

Still-deferred data work includes free/source-granted starting gear, reliable
creation-baseline reconstruction for imported advanced characters, and editable
campaign/source configuration. The official books and Marshal remain the
source of truth.

## Development

Install dependencies once:

```sh
npm install
```

Common commands:

```sh
npm run dev                  # Start Vite
npm run desktop              # Start the Electron desktop app
npm run desktop:package      # Build the Squirrel installer and release metadata
npm run cleanup:after-vscode # Remove locked temporary builds after VS Code closes
npm run lint                 # Run project lint checks
npm run test:static          # Parse, lint, and validate catalogs
npm run test:browser:fast    # Desktop Playwright suite
npm run test:setup:desktop   # Focused Character Setup tests
npm run test:inventory       # Inventory tests on configured projects
npm run test:powers          # Arcane and Power tests
npm run test:combat          # Combat-focused tests
npm run test:import          # Import/export tests
npm run test:undo            # Undo/redo tests
npm test                     # Static checks and full browser suite
npm run format               # Format supported project files
npm run format:check         # Verify formatting without changes
```

Recommended workflow:

1. Run the smallest relevant desktop test while iterating.
2. Run the full targeted feature group before committing.
3. Run `npm test` before a release or broad handoff when practical.

GitHub Actions runs static checks, formatting validation, and the Playwright
browser suite for pushes and pull requests targeting `main`.

## Project Structure

```text
deadlands-character-creator-and-tracker/
  index.html                 Main application shell
  styles.css                 Shared layout and theme styles
  assets/                    Images and animated installer artwork
  favicon/                   Browser icons
  electron/
    main.cjs                 Secure desktop window and native shortcuts
  forge.config.cjs           Forge/Squirrel packaging configuration
  scripts/                   Desktop asset, packaging, and cleanup helpers
  src/
    config.js                Version and shared configuration
    persistence.js           App-level persistence and migrations
    app-ui.js                Main-menu and shared UI behavior
    app.js                   Application bootstrap
    creator.js               Character Setup behavior
    savaged-import.js        Savaged.us normalization
    tracker.js               Tracker bootstrap
    tracker/                 Tracker feature modules
  docs/                      Contracts, roadmap, rules notes, and checklists
  tests/
    browser/                 Playwright behavior tests
    static/                  Parse, lint, and catalog validation
```

## Documentation

- [Character Setup contract](docs/character-setup-contract.md)
- [Advancement contract](docs/advancement-contract.md)
- [Mechanics roadmap](docs/mechanics-roadmap.md)
- [Manual checklist](docs/manual-checklist.md)
- [Case study](docs/case-study.md)
- [Project documentation guide](docs/project-documentation-guide.md)

## Versioning

The project uses semantic versioning:

- Patch releases (`1.0.1`, `1.0.2`, etc.) cover bug fixes, visual polish,
  documentation, tests, and other low-risk corrections.
- Minor releases (`1.1.0`, `1.2.0`, etc.) mark meaningful workflow or feature
  milestones.

`0.2.0` marked the Character Setup MVP milestone. `1.0.0` is the first stable
browser and installable Windows desktop release.

## Legal

This is an unofficial fan tool and portfolio project. It is not affiliated
with, endorsed by, sponsored by, or approved by Pinnacle Entertainment Group.
Users need the official books to play. Catalog summaries are app metadata, not
a substitute for published rules text.

See [NOTICE.md](NOTICE.md) for attribution and legal notices.

## License

This repository is source-available under the custom non-commercial terms in
[LICENSE](LICENSE). It is not licensed under MIT, Apache, GPL, or another
open-source license. Third-party Deadlands, Savage Worlds, SWADE, and related
names or setting material remain the property of their respective rights
holders.
