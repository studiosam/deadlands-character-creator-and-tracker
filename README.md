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

- Track wounds, fatigue, Bennies, Conviction, penalties, defenses, conditions,
  combat resources, powers, consumables, and reminders.
- Manage weapons, loaded rounds, reserve ammunition, armor by location, gear,
  vehicles, storage locations, carrying capacity, and encumbrance.
- Build a Deadlands/SWADE character draft, save it locally, export it, and
  finalize it into the tracker.
- Track Arcane Backgrounds, Power Points, known powers, active powers, and
  Huckster Dealing with the Devil helper state.
- Import Savaged.us JSON exports and preserve app-owned tracker data through
  localStorage and JSON export/import.
- Load demo/sample characters from the first-run panel without treating the
  bundled samples as a real campaign save.
- Review app version, schema version, privacy/legal notes, backup actions, and
  local data controls from the Settings tab.

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

- Combat tab during live play with wounds, Bennies, weapons, ammo, and
  conditions visible.
- Inventory tab showing storage locations and encumbrance.
- Arcane tab showing Power Points and known powers.
- Character creation final review.
- Savaged.us import flow with import warnings.

## Technical Highlights

- Static HTML/CSS/JavaScript app with no runtime backend.
- Split tracker modules under `src/tracker/` for rendering, storage, inventory,
  combat, advancement, arcane powers, and event handling.
- Explicit exported JSON `schemaVersion` with migration helpers for old raw
  saves, full app state, creation drafts, and tracker-character exports.
- Local-first persistence through `localStorage`; JSON export/import remains the
  portability and backup mechanism.
- App-styled dialogs and toasts replace native browser alerts/confirms.
- About/Settings panel centralizes app status, backup/export actions, privacy
  posture, and local data controls.
- Playwright smoke tests cover load, responsive tabs, sample loading, imports,
  export/import round trips, persistence, and core combat controls.

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
npm run format:check
```

Scripts:

- `npm run dev`: serve the static app with Vite.
- `npm run lint`: run static project checks.
- `npm test`: run static checks and Playwright smoke tests.
- `npm run format`: format project files with Prettier.

## Roadmap

- Add final screenshots/GIFs for the hosted demo.
- Continue converting manual rules-heavy checklist items into automated tests.
- Harden schema migrations as real breaking data changes appear.
- Improve onboarding copy and empty states from actual table feedback.
- If monetization becomes serious, split a generic tracker core from
  user-provided setting data and resolve licensing first.

## License

Code is available under the MIT License. See [LICENSE](LICENSE).
