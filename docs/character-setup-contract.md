# Character Setup Contract

## Character Setup Shell

The first Character Setup implementation creates the shared setup and review shell, with these visible first-slice steps: Concept, Race / Ancestry, Hindrances, Traits, Edges, Powers, Gear, and Review.

The normal `Create Character` entry points now create a new `source: "created"` character slot and route directly to Character Setup at Concept. The older all-in-one creator screen is no longer exposed through normal navigation; it remains only as legacy fallback code for older creation-draft imports until that compatibility path is removed or migrated.

Concept edits map to the active character's `name`, `gender`, `age`, `archetype`, `player`, `description`, and `background` fields and save through the normal tracker persistence path. Rank is not edited in Concept; it is shown as recorded or derived advancement context elsewhere. Hindrances, Traits, and starting Edge selection now have functional setup controls for eligible characters. Powers, Gear, and Review are still audit-first slices.

Race / Ancestry is read-only for the current Deadlands-focused profile. It records Human as the supported race or ancestry and flags imported non-Human values for review instead of offering editing controls.

Hindrances supports selecting and removing Hindrances from the existing catalog, tracks starting Hindrance points, and spends counted benefit points on Attribute raises, extra starting Edge slots, Skill points, or extra starting money. The current expectation is at least one Hindrance, with Minor worth 1 point, Major worth 2 points, and a 4-point cap for default starting benefits. Taking more than 4 points is allowed and remains complete; the UI shows an informational note that extra rewards require a table or GM exception. Benefit spending cannot exceed counted points, and spending reductions are blocked when the current starting build still depends on those points.

Traits is editable for characters created in this tool that do not yet have recorded Advances. It tracks the normal 5 Attribute points, 12 Skill points, Hindrance-granted extras, core skills at free `d4`, and unskilled values at `d4-2`. Trait edits update both the current character values and the stored creation baseline. Imported characters and advanced characters remain read-only audit views; recorded skills use the character's die values, and missing skills are shown as unskilled `d4-2`. Trait cards and skill chips expose short usage notes through hover/focus help.

Edges audits recorded Edges against the current catalog and, for characters created in this tool with no recorded Advances, supports selecting the Human free Edge and any Edge slots bought with Hindrance benefit points. Starting Edge choices are source-tagged as `human-free-edge` or `hindrance-benefit` so they remain distinct from later Advances. Imported and advanced characters remain audit-only. Catalog-matched Edges show category, rank, requirements, and summary text. Arcane Background Edges are called out, and more than one Arcane Background Edge is flagged for review. Full Edge prerequisite enforcement and GM exception bookkeeping are deferred to later setup slices.

Powers is read-only and follows Edges because Arcane Background Edges determine whether Powers are required. It audits the recorded Arcane Background, Arcane Skill, Power Points, known powers, expected starting power count, and fixed starting powers where the profile defines them. Non-arcane characters show this step as not applicable. Full power selection, starting-power validation, and separation of creation powers from powers gained through Advances are deferred to later setup slices.

Gear is read-only and follows Powers. It audits recorded money, weapons, armor, gear, consumables, ammunition, vehicles, active load, and load limit. Imported/current equipment may include post-creation purchases, loot, or table adjustments. Starting cash, purchase validation, and gear-source tracking are deferred to later setup slices.

Review is a simple summary of available setup data and import warnings, not full rules validation.

Finish Setup & Start Playing saves the current setup character, marks `creation.finalized` as `true`, and opens Combat. Finishing setup warns about incomplete core setup sections, including source-tracked starting Edges, but allows the player to start playing and return to Character Setup later.

## Project Goal: Creation Baseline and Current Character

Characters created in this tool should track starting character creation choices separately from later character growth. The app now stores a creation baseline for starting Attributes and Skills on finalized created characters, and should extend that baseline model to Hindrances, Edges, Gear, Powers, and other creation-time choices. Later changes should be tracked through an advancement ledger. Current character values should be explainable from the creation baseline plus applied Advances and explicit table or GM exceptions.

This is the priority model for character creation. The app should make characters created here easy to audit: what the character started with, what came from Hindrance benefits, what came from racial or profile grants such as the Human free Edge, what came from special Hindrances such as Elderly, what came from Advances, and what came from a recorded GM exception.

Imported advanced characters are a separate backlog problem. Savaged.us imports may provide current or recorded values plus Advances, but they may not provide enough information to safely reconstruct original creation stats. Future import tooling may attempt an inferred starting-build reconstruction from Advances, Hindrances, and imported data, but that inference should be advisory and should not block the primary goal of making newly-created app characters track correctly from the beginning.

## Sources & Rulesets

`Sources & Rulesets` is currently a read-only informational page. It records the default Deadlands-focused campaign profile used by the app and is not currently a campaign settings editor.

The current MVP should use one built-in profile and avoid making users configure source books before creating or importing characters. A future SWADE-wide or Pinnacle-facing version could expand this area into editable campaign profile configuration.
