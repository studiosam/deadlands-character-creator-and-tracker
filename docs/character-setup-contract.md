# Character Setup Contract

## Character Setup Shell

The first Character Setup implementation creates the shared setup and review shell, with these visible first-slice steps: Concept, Race / Ancestry, Hindrances, Traits, Edges, and Review.

Only Concept is fully functional in this slice. Concept edits map to the active character's `name`, `gender`, `age`, `archetype`, `player`, `description`, and `background` fields and save through the normal tracker persistence path. Rank is not edited in Concept; it is shown as recorded or derived advancement context elsewhere.

Race / Ancestry is read-only for the current Deadlands-focused profile. It records Human as the supported race or ancestry and flags imported non-Human values for review instead of offering editing controls.

Hindrances supports selecting and removing Hindrances from the existing catalog and tracks starting Hindrance points. The current expectation is at least one Hindrance, with Minor worth 1 point, Major worth 2 points, and a 4-point cap for default starting benefits. Taking more than 4 points is allowed and remains complete; the UI shows an informational note that extra rewards require a table or GM exception. Spending Hindrance points on attributes, skills, Edges, or money is deferred to later setup slices.

Traits is read-only and shows recorded Attributes plus a comprehensive skill list for the current Deadlands profile. Recorded skills use the character's die values, and missing skills are shown as untrained `d4-2`. Trait cards and skill chips expose short usage notes through hover/focus help. Advanced characters show an advisory that recorded trait values may include changes gained through Advances; a later setup editor should separate starting traits from current values. Edges remains an intentionally scaffolded placeholder. Review is a simple summary of available setup data and import warnings, not full rules validation.

## Sources & Rulesets

`Sources & Rulesets` is currently a read-only informational page. It records the default Deadlands-focused campaign profile used by the app and is not currently a campaign settings editor.

The current MVP should use one built-in profile and avoid making users configure source books before creating or importing characters. A future SWADE-wide or Pinnacle-facing version could expand this area into editable campaign profile configuration.
