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

## Current Implementation Status

This document is the source of truth for Character Setup lifecycle, the boundary between Character Setup and the normal Character Sheet, Characters panel responsibility, creation baseline planning, and future Advancement boundaries.

### Implemented now

- Minimal landing page with Continue, Create Character, Import JSON, saved-character selection, empty-state sample loading, local-storage note, and `Sources & Rulesets` access.
- Read-only `Sources & Rulesets` page for the current Deadlands-focused profile.
- Character Setup shell for created and imported characters, with `setupStatus` deciding whether setup review is needed.
- `setupStatus` lifecycle: created and imported characters default to `needsReview`; confirmed setup becomes `complete`; legacy/sample saves without a value normalize to `complete`.
- Confirmed Character Sheet mode: complete characters open the Character tab as a reference-focused sheet by default.
- `Review Setup` reopening: users can deliberately reopen setup review without changing persisted `setupStatus`.
- Characters panel management: switch, rename, duplicate, delete, export, and save active character slots.
- Characters panel profile editor for stable identity/profile text fields.
- Created-character Hindrance benefit spending, Trait point spending, and starting Edge source tracking for eligible pre-advance characters.

### Partially implemented

- Creation baseline tracking exists for created-character starting Attributes and Skills and should be extended carefully to other setup-time choices.
- Character Setup Powers and Gear are audit-first. They review current/imported data but do not yet provide full starting-power selection, starting-purchase validation, or source tracking.
- Advancement has data storage, adaptive forms, application helpers, and validation, but the product direction is paused. Do not treat the current Character-tab Advancement area as the final long-term workflow.

### Planned next

- Keep the Character tab reference-focused after setup is complete.
- Move or contain remaining Advancement history/workflow so it no longer competes with normal Character Sheet reference use when Advancement work resumes.
- Define a deliberate GM exception/correction workflow before allowing broad post-confirmation rules edits.

### Deferred

- Full Edge prerequisite validation.
- Full Power legality validation and starting-power selection.
- Starting cash purchase validation and gear-source tracking.
- Reconstruction of original creation baselines for advanced imported characters.
- Editable campaign/source configuration in `Sources & Rulesets`.

### Explicitly out of scope for the current MVP

- Cloud sync, accounts, or shared campaign storage.
- A full campaign settings editor.
- Selling bundled Deadlands-specific rules/catalog content without resolving licensing.

## Character Tab Cleanup Plan

The Character tab historically combined three different jobs: one-time Character Setup, the long-term Character Sheet, and Advancement/history management. The current cleanup separates setup review from the confirmed Character Sheet through `setupStatus`; remaining long-term cleanup should continue separating Advancement/history without removing existing data or changing persistence behavior.

### Post-Confirmation Editing Model

Character Setup is a one-time confirmation workflow used after character creation or import. It exists to confirm the initial build, resolve import/setup warnings, and establish what belongs to the character's starting baseline.

After setup is confirmed, the Character tab should default to a normal Character Sheet: a clean, read-only or mostly read-only reference view for identity, core stats, traits, Edges, Hindrances, and short notes. The normal sheet should show character data clearly, but it should not expose every setup control by default.

The Characters panel is the deliberate place to manage characters and edit stable character profile information after confirmation. This keeps ordinary sheet reference separate from higher-intent character-management actions.

The Characters panel currently handles:

- Switch character.
- Rename character.
- Duplicate character.
- Delete character.
- Export character.
- Edit character identity/profile fields.

It may eventually also handle:

- Reopen Setup Review.
- View or change setup status when appropriate.

Character identity/profile fields include:

- Name.
- Player.
- Profession or title.
- Archetype or concept.
- Age.
- Gender.
- Background.
- Description.
- Source/import status.
- Setup status.

The Characters panel should not become the normal place for casual rules edits after play starts. Post-confirmation editing boundaries should be:

- Advancement edits character growth.
- Inventory edits possessions.
- Arcane edits powers and arcane resources.
- Combat edits temporary play state.
- Setup edits initial build confirmation.
- Characters edits identity and character management.

Direct changes to Attributes, Skills, Edges, Hindrances, Powers, or Gear after setup should be handled through Advancement, Inventory, Arcane, or a deliberate GM exception/correction workflow rather than casual inline editing on the normal Character Sheet. Users should still be able to intentionally reopen setup review later, but reopening setup should be a deliberate review action, not the default Character tab state.

`creation.finalized` and `setupStatus` remain distinct. `creation.finalized` means the character was allowed to start play, while `setupStatus` decides whether setup review is still needed or complete. Reopening setup review is a temporary UI state and does not by itself change either persisted value.

### Section Classification

| Current area                                  | Classification                                                     | Cleanup direction                                                                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Character Dossier header                      | Keep on normal Character Sheet                                     | Keep as the Character Sheet identity header. It should show name, rank, ancestry, archetype, player-facing source/status, and a compact status strip only if those values help reference the character.                              |
| Character Setup shell and stepper             | Keep only in Character Setup                                       | Do not show the full setup workflow by default once setup is complete. It should be prominent only when the character needs setup review or when the user intentionally reopens setup review.                                        |
| Concept fields                                | Keep only in Character Setup                                       | Keep editable concept fields in setup review. The normal Character Sheet should show identity values read-only, with any future editing exposed deliberately rather than inline with setup.                                          |
| Race / Ancestry                               | Keep on normal Character Sheet and keep only in Character Setup    | Show current ancestry on the sheet as identity/reference data. Keep ancestry validation and profile warnings in setup review.                                                                                                        |
| Hindrances                                    | Keep on normal Character Sheet and keep only in Character Setup    | Show selected Hindrances on the sheet as normal reference. Keep starting Hindrance selection, point accounting, and benefit spending in setup review.                                                                                |
| Traits / Attributes                           | Keep on normal Character Sheet and keep only in Character Setup    | Show final Attributes on the sheet. Keep point-spending controls and creation-baseline audit in setup review.                                                                                                                        |
| Skills                                        | Keep on normal Character Sheet and keep only in Character Setup    | Show final Skills on the sheet. Keep unskilled/full-profile setup audit and starting Skill point spending in setup review.                                                                                                           |
| Edges                                         | Keep on normal Character Sheet and keep only in Character Setup    | Show current Edges on the sheet. Keep Human free Edge and Hindrance benefit Edge source tracking in setup review. Manual add/edit should not compete with setup in the completed sheet.                                              |
| Derived stats                                 | Keep on normal Character Sheet and move primarily to Combat        | Keep Pace, Parry, Toughness, Size, and Armor on the sheet as reference. Combat remains the primary active-use location for Pace, Parry, Toughness, Wounds, Fatigue, and status.                                                      |
| Import warnings                               | Move to Notes                                                      | Keep a small setup warning if review is needed, but detailed import warnings belong in Notes or a review/details area rather than permanently occupying normal Character Sheet space.                                                |
| Arcane snapshot                               | Move primarily to Arcane                                           | Keep a short Arcane Background / Power Points summary on the sheet if relevant. Full Power Points controls, powers, active powers, backlash/reminders, and arcane setup belong in Arcane.                                            |
| Equipped summary                              | Move primarily to Combat and Inventory                             | Combat should show current weapons, armor impact, ammo, and active-use equipment. Inventory should own equipment management. The sheet can keep a small read-only equipment summary or omit it if Combat/Inventory already cover it. |
| Gear summary                                  | Move primarily to Inventory                                        | Full gear, money, ammo, armor, weapons, vehicles, carried state, and add-item forms belong in Inventory. Character Setup Gear remains audit-only until a dedicated starting-purchase slice exists.                                   |
| Background / Import Notes                     | Move to Notes                                                      | Character background can appear as a short sheet note or excerpt, but long-form background, import notes, reminders, and session notes belong in Notes.                                                                              |
| Advancement panel and add-advance form        | Move primarily to Advancement later                                | Advancement work is paused. Existing advancement UI should not remain embedded in the normal Character Sheet long term. It should move to a dedicated Advancement workflow later.                                                    |
| Manual Edge and Hindrance add/edit forms      | Hide or postpone                                                   | These are useful escape hatches but should not be prominent in the completed Character Sheet. Prefer setup-source workflows for creation choices and a later Advancement workflow for post-creation changes.                         |
| Enable Manual Power Points control            | Move primarily to Arcane                                           | Manual Power Points are arcane/resource setup. The normal sheet may show whether Power Points exist, but the control belongs in Arcane or setup review.                                                                              |
| Source badge and save/setup status indicators | Keep on normal Character Sheet and move to Settings or global menu | Keep a small source/setup-status indicator on the sheet. Detailed local save, import/export, and library management remain Settings/global menu responsibilities.                                                                    |

### Proposed Future Character Tab Structure

#### State A: Character needs setup review

- Show Character Setup prominently at the top of the Character tab.
- Show a compact identity summary above setup: name, rank, ancestry, archetype, source, and setup status.
- Show clear setup actions: save draft/current character, finish or confirm setup, and return to play when ready.
- Keep the normal Character Sheet secondary or collapsed so setup does not compete with onboarding.
- Show warnings for incomplete setup sections and import review issues near the setup workflow.

#### State B: Character setup is complete

- Show a clean Character Sheet by default.
- Show identity, derived stats, Attributes, Skills, Edges, Hindrances, and short notes.
- Show a deliberate `Review Setup` or `Reopen Setup Review` action.
- Do not show the full setup workflow by default.
- Keep active combat, inventory management, arcane controls, long-form notes, and future Advancement workflows in their own tabs or dedicated panels.

### `setupStatus` Lifecycle

- `setupStatus` is persisted on character data as either `needsReview` or `complete`.
- Imported characters default to `needsReview`.
- Newly created characters default to `needsReview`.
- Existing legacy, sample, or saved characters without `setupStatus` normalize to `complete` so current users do not unexpectedly re-enter setup review.
- Confirmed setup changes `setupStatus` to `complete`.
- Users can intentionally reopen setup review later without changing the persisted setup status unless they confirm setup again.
- `setupStatus` is explicit and separate from `creation.finalized`, because finalized means "ready to start playing" rather than "all setup review is permanently hidden."

### Do Not Do Yet

- Do not implement more Advancement behavior.
- Do not make Gear editable from Character Setup.
- Do not make Powers editable from Character Setup.
- Do not enforce full Edge prerequisites yet.
- Do not build a full campaign settings editor.
- Do not refactor the whole renderer yet.

### Implemented First Slice

Add `setupStatus` and use it to decide whether the Character tab opens in Setup Review mode or normal Character Sheet mode.

This first slice preserves all current setup sections and sheet sections, but changes their default visibility:

- `needsReview`: Character tab opens with setup review prominent.
- `complete`: Character tab opens with the normal Character Sheet prominent and setup collapsed behind `Review Setup`.
- Reopened review: user can intentionally return to setup without losing the completed sheet state.

### Implemented Characters Panel Profile Slice

The Characters panel now includes a deliberate Character Profile editor for stable identity/profile fields on the active character. Editable fields are:

- Name.
- Player.
- Profession or title, stored in the existing `archetype` field.
- Age.
- Gender.
- Description.
- Background.

Saving profile edits updates the active character, the active saved character slot, the tracker header, and the normal Character Sheet reference display. It preserves `setupStatus` and `creation.finalized`.

This editor is intentionally limited to profile text. It does not edit Attributes, Skills, Edges, Hindrances, Gear, Powers, Advancement, setup-source tracking, or campaign settings. Those remain in Character Setup, Advancement, Inventory, Arcane, or future deliberate correction workflows as appropriate.

The older slot Rename control remains available alongside the Name field for now. This is duplicated UX: Rename is still a quick saved-slot name action, while Character Profile is the broader identity editor.

### Implemented Confirmed Character Sheet Cleanup Slice

Confirmed characters now open the Character tab as a reference-focused Character Sheet by default. The confirmed sheet owns:

- Identity summary, source/setup status, race or ancestry, rank, archetype or concept, and profile metadata.
- Derived stats for reference.
- Attributes and Skills.
- Current Edges and Hindrances as read-only reference lists.
- Short background, description, and compact import/source notes.
- A deliberate `Review Setup` action.
- A deliberate `Manage Character` action that opens the Characters panel profile editor and character-management controls.

The confirmed Character Sheet hides setup/editing workflows by default:

- Character Setup stepper and concept/setup forms.
- Hindrance benefit spending controls.
- Trait point-spending controls.
- Starting Edge selection controls.
- Manual Edge and Hindrance add/edit escape hatches.
- Advancement add forms.
- Manual Power Points setup controls.

Ownership boundaries after confirmation:

- Characters panel owns identity/profile editing and character management.
- Combat owns wounds, fatigue, Bennies, temporary combat state, current weapons, and active-use combat controls.
- Inventory owns gear, money, possessions, ammo, armor, vehicles, and storage.
- Arcane owns powers, Power Points, and arcane-resource controls.
- Notes owns long-form notes, reminders, and import-warning details.
- Advancement later owns character growth.

Reopening setup review intentionally shows the setup workflow without changing persisted `setupStatus`.

### Recommended Next Implementation Slice

Keep the confirmed Character Sheet reference-focused and move the remaining Advancement history/add workflow behind a more deliberate Advancement entry point when Advancement work resumes. Do not add more Advancement rules behavior until that workflow boundary is settled.
