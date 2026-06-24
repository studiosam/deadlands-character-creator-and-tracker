# Privacy

This app is local-first.

- Character data is stored in browser `localStorage`.
- JSON exports are created only when the user chooses to export.
- There is no backend server, account login, analytics, telemetry, or cloud sync
  in the current project.
- Exported JSON files may contain private player names, character notes,
  campaign notes, secrets, or session information.

For a public hosted demo, users should treat sample characters as disposable and
should avoid importing private campaign data unless they trust the hosting
environment.
