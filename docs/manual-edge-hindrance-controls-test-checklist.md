# Manual Edge and Hindrance Controls Test Checklist

Use this checklist when changing the Character tab Edge/Hindrance editor.

- Load the app and confirm the Character tab shows Add Edge and Add Hindrance.
- Open Add Edge and confirm the catalog dropdown includes Deadlands Edges.
- Open Add Hindrance and confirm the catalog dropdown includes Deadlands Hindrances.
- Confirm the catalog dropdown includes compatible SWADE Core Edges and Hindrances.
- Confirm SWADE Core Arcane Background and Soul Drain do not appear in the Deadlands Edge dropdown.
- Choose a catalog Edge and confirm the editor prefills name, category, rank, requirements, summary, and source.
- Choose a catalog Hindrance and confirm the editor prefills name, severity, summary, and source.
- Choose a SWADE catalog Edge and Hindrance and confirm they save with `source: "Savage Worlds Adventure Edition"`.
- Import a Savaged.us character and confirm imported Edges and Hindrances still display.
- Add a manual Edge, reload the page, and confirm it persists.
- Add a catalog Edge, reload the page, and confirm it persists with `catalogId` and `isCustom: false`.
- Edit that Edge and confirm the changed fields persist after reload.
- Remove that Edge and confirm only that entry is removed.
- Add a manual Hindrance, reload the page, and confirm it persists.
- Add a catalog Hindrance, reload the page, and confirm it persists with `catalogId` and `isCustom: false`.
- Edit that Hindrance and confirm the changed fields persist after reload.
- Remove that Hindrance and confirm only that entry is removed.
- Import older JSON with string-only `edges` and `hindrances` and confirm each becomes editable.
- Import an Edge object with an unknown field and confirm export preserves the unknown field.
- Add a blank Edge and confirm the warning appears, then confirm Save Anyway works.
- Add a blank Hindrance or one with Unknown severity and confirm the warning appears, then confirm Save Anyway works.
- Add a second Arcane Background Edge and confirm the warning appears, then confirm Save Anyway works.
- Add Tenderfoot while Don’t Get ’im Riled! is present, or the reverse, and confirm the conflict warning appears.
- Export the character JSON and re-import it, then confirm manual fields, IDs, and unknown imported fields are preserved.
- Check the browser console for runtime errors after add, edit, remove, import, export, save, and reload.
