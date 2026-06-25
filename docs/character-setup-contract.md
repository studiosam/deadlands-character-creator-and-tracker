# Character Setup Contract

## Character Setup Shell

The first Character Setup implementation creates the shared setup and review shell, with these visible first-slice steps: Concept, Race / Ancestry, Hindrances, Attributes and Skills, Edges, and Review.

Only Concept is fully functional in this slice. Concept edits map to the active character's `name`, `gender`, `age`, `archetype`, `player`, `description`, and `background` fields and save through the normal tracker persistence path. Rank is not edited in Concept; it is shown as recorded or derived advancement context elsewhere.

Race / Ancestry is read-only for the current Deadlands-focused profile. It records Human as the supported race or ancestry and flags imported non-Human values for review instead of offering editing controls.

Hindrances, Attributes and Skills, and Edges are intentionally scaffolded placeholders. They may show existing character data for context, but they are not complete setup editors yet. Review is a simple summary of available setup data and import warnings, not full rules validation.

## Sources & Rulesets

`Sources & Rulesets` is currently a read-only informational page. It records the default Deadlands-focused campaign profile used by the app and is not currently a campaign settings editor.

The current MVP should use one built-in profile and avoid making users configure source books before creating or importing characters. A future SWADE-wide or Pinnacle-facing version could expand this area into editable campaign profile configuration.
