# Deadlands Character Creator and Tracker

An unofficial browser-based table companion for Deadlands: The Weird West and
SWADE play. It combines a character tracker, character creation draft, combat
dashboard, inventory manager, arcane tools, notes, and Savaged.us JSON import
support in a static web app that can run from GitHub Pages or directly from the
project folder.

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
  combat resources, powers, consumables, and reminders.
- Manage weapons, loaded rounds, reserve ammunition, armor by location, gear,
  vehicles, storage locations, carrying capacity, and encumbrance.
- Build a Deadlands/SWADE character through Character Setup, confirm setup, and
  start play from the Combat tab.
- Review imported or newly created characters through the `setupStatus`
  lifecycle: characters start as `needsReview`, confirmed setup becomes
  `complete`, and Review Setup can intentionally reopen setup later.
- Use the Character tab as a reference-focused Character Sheet after setup is
  complete, while keeping the setup workflow hidden by default.
- Track Arcane Backgrounds, Power Points, known powers, active powers, and
  Huckster Dealing with the Devil helper state.
- Import Savaged.us JSON exports and preserve app-owned tracker data through
  localStorage and JSON export/import.
- Save, switch, rename, duplicate, delete, and export multiple local character
  slots from the Manage > Characters panel.
- Edit stable character profile fields from the Characters panel: name, player,
  profession or title, age, gender, description, and background.
- Review app version, schema version, privacy/legal notes, backup actions, and
  local data controls from the Settings tab.

## Current Scope

- Implemented: combat tracking, inventory/equipment management, local character
  library, JSON import/export, minimal landing page, read-only Sources &
  Rulesets, Character Setup review, confirmed Character Sheet mode, Characters
  panel profile editing, and automated browser/static checks.
- Partially implemented: created-character starting baselines, Hindrance
  benefit spending, starting Edge source tracking, Power and Gear setup audits,
  and Advancement data/forms.
- Planned next: keep post-confirmation character reference separate from setup,
  profile management, inventory, arcane tools, and future Advancement workflow.
- Deferred: full Edge prerequisite enforcement, full Power legality validation,
  starting gear purchase validation, imported advanced-character baseline
  reconstruction, and editable campaign/source configuration.

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
- Combat tab during live play with wounds, Bennies, weapons, ammo, and
  conditions visible.
- Inventory tab showing storage locations and encumbrance.
- Arcane tab showing Power Points and known powers.
- Character Setup review and confirmed Character Sheet mode.
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
- Character library state is stored separately from the legacy active tracker
  save, so older browser saves can migrate without losing the existing key.
- App-styled dialogs and toasts replace native browser alerts/confirms.
- Image-backed minimal landing page supports saved-character selection, creation,
  JSON import, sample loading, and read-only Sources & Rulesets access.
- `setupStatus` separates one-time Character Setup review from the normal
  confirmed Character Sheet.
- Characters panel profile editing keeps stable identity/profile updates out of
  casual Character Sheet reference use.
- About/Settings panel centralizes app status, backup/export actions, privacy
  posture, and local data controls.
- Playwright tests cover load, responsive tabs, sample loading, landing flows,
  setupStatus, profile editing, imports, export/import round trips, persistence,
  character-library isolation, inventory, and core combat controls.

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

See [NOTICE.md](NOTICE.md). Do not sell bundled Deadlands-specific rules/catalog
content unless licensing or written permission is resolved.

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
- `npm run test:browser:fast`: run the desktop Playwright project only.
- `npm test`: run static checks and the Playwright browser suite.
- `npm run format`: format project files with Prettier.
- `npm run format:check`: check formatting without rewriting files.

GitHub Actions runs `npm ci`, installs Playwright browsers, then runs
`npm run test:static`, `npm run format:check`, and `npm run test:browser` on
pushes and pull requests targeting `main`.

## Roadmap

- Add final screenshots/GIFs for the hosted demo.
- Continue converting manual rules-heavy checklist items into automated tests
  without expanding MVP scope.
- Keep Character Setup, Character Sheet reference, Characters profile editing,
  Inventory, Arcane, Combat, and future Advancement workflows clearly separated.
- Harden schema migrations as real breaking data changes appear.
- Improve onboarding copy and empty states from actual table feedback.
- If monetization becomes serious, split a generic tracker core from
  user-provided setting data and resolve licensing first.

## License

Code is available under the MIT License. See [LICENSE](LICENSE).
