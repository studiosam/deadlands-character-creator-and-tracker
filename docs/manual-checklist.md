# Power Catalog Workflow Test Checklist

## Automated coverage note

The core browser smoke tests now live in `tests/browser/app.spec.js` and cover
app load, tab switching, sample loading, Savaged.us paste import, export/import
round trip, persistence, and core combat controls across desktop and mobile
viewports. Keep this checklist for rules-heavy validation and table workflow
checks that are not yet practical to automate.

## Purpose

Manual test checklist for the Deadlands power catalog, Arcane Background power selection, and variable Power Point spending workflow.

## Basic load test

- [ ] App loads without console errors.
- [ ] Arcane tab opens without console errors.
- [ ] Existing saved character loads without losing powers.
- [ ] Sample/default character loads without losing powers.

## Arcane Background setup

### Blessed

- [ ] Select or load a Blessed character.
- [ ] App shows that Holy Symbol is required.
- [ ] App allows Holy Symbol to be added.
- [ ] App shows that Blessed needs two additional starting powers.
- [ ] Detect/Conceal Arcana shows Detect-only restriction.
- [ ] Light/Darkness shows Light-only restriction.

### Chi Master

- [ ] Select or load a Chi Master character.
- [ ] App shows that Deflection is required.
- [ ] App allows Deflection to be added.
- [ ] App shows that Chi Master needs two additional starting powers.
- [ ] Detect/Conceal Arcana shows Detect-only restriction.
- [ ] Chi Master range restriction notes are visible.

### Huckster

- [ ] Select or load a Huckster character.
- [ ] App shows three starting powers expected.
- [ ] Known Powers are separate from Deal with the Devil Available Powers.
- [ ] Deal with the Devil powers are not automatically added as Known Powers.

### Mad Scientist

- [ ] Select or load a Mad Scientist character.
- [ ] App shows two starting powers expected.
- [ ] Growth/Shrink shows Shrink-only restriction.
- [ ] Power notes mention devices/gizmos/inventions.

### Shaman

- [ ] Select or load a Shaman character.
- [ ] App shows two starting powers expected.
- [ ] Growth/Shrink shows Growth-only restriction.
- [ ] Shaman silence penalty reminder is visible if implemented.

## Catalog picker

- [ ] Search filters powers by name.
- [ ] Rank filter works.
- [ ] “Valid for current Arcane Background” filter works.
- [ ] Invalid powers show warnings.
- [ ] Marshal override allows invalid/manual choices.
- [ ] Catalog preview shows name, rank, PP, range, duration, summary, and notes.

## Variable Power Point spending

### Deflection

- [ ] Add Deflection.
- [ ] Variable Spend controls appear.
- [ ] Additional Recipients changes total PP.
- [ ] Spend button deducts the correct PP total.
- [ ] Spend button disables if current PP is too low.

### Arcane Protection

- [ ] Add Arcane Protection.
- [ ] Additional Recipients variable spend appears.
- [ ] Spend button deducts the correct PP total.

### Manual-cost powers

- [ ] Beast Friend does not show fake calculator controls.
- [ ] Growth/Shrink does not show fake calculator controls.
- [ ] Shape Change does not show fake calculator controls.
- [ ] Summon Ally does not show fake calculator controls.
- [ ] Manual-cost note is visible.

## Known Powers

- [ ] Added catalog powers appear in Known Powers.
- [ ] Known Powers show PP, range, duration, source, summary, and notes.
- [ ] Edit works without modifying the global catalog.
- [ ] Remove works and only removes the character’s known power.
- [ ] Custom/manual powers can still be added.

## Persistence

- [ ] Save/reload preserves catalog-added powers.
- [ ] Save/reload preserves custom powers.
- [ ] JSON export/import preserves catalog-added powers.
- [ ] JSON export/import preserves custom powers.
- [ ] Savaged.us imported powers still display.

## Notes / issues found

Use this section during testing.

-

# Advancement Tests

## Basic behavior

- [ ] App loads without console errors.
- [ ] Existing character with no advances still loads.
- [ ] Character tab shows Advancement section.
- [ ] Total Advances count displays.
- [ ] Derived Rank displays from advance count.

## Add/edit/remove

- [ ] Add an advance.
- [ ] Edit an advance.
- [ ] Remove an advance.
- [ ] Removing an advance does not remove the Edge/Power/Skill from the character.
- [ ] Duplicate advance numbers show a warning.
- [ ] Missing type shows a warning.
- [ ] Missing target name for relevant advance types shows a warning.

## Persistence

- [ ] Save/reload preserves advances.
- [ ] JSON export/import preserves advances.
- [ ] Existing JSON with no advances imports as `advances: []`.
- [ ] JSON with two advances imports both advances exactly once.
- [ ] Imported advances with missing IDs receive generated IDs.
- [ ] Imported advances with unknown fields preserve those fields.

## Non-goals

- [ ] Adding an advance does not automatically modify skills.
- [ ] Adding an advance does not automatically add Edges.
- [ ] Adding an advance does not automatically add powers.

# Advancement Application Tests

## Apply behavior

- [ ] Add New Edge advance with Apply to character checked.
- [ ] Confirm the Edge appears in the character’s Edge list.
- [ ] Confirm the advance shows as applied.
- [ ] Add New Powers advance with Apply to character checked.
- [ ] Confirm the selected powers appear in Known Powers.
- [ ] Add Power Points advance with Apply to character checked.
- [ ] Confirm max Power Points increases.
- [ ] Add Increase Skill advance with Apply to character checked.
- [ ] Confirm the selected skill increases one die step.
- [ ] Add Increase Two Skills advance with Apply to character checked.
- [ ] Confirm both selected skills increase one die step.
- [ ] Add Increase Attribute advance with Apply to character checked.
- [ ] Confirm the selected attribute increases one die step.

## Remove behavior

- [ ] Remove unapplied advance removes only the advance record.
- [ ] Remove app-applied New Edge advance offers remove-only or remove-and-undo.
- [ ] Remove-and-undo for New Edge removes the app-created Edge.
- [ ] Remove app-applied New Powers advance offers remove-only or remove-and-undo.
- [ ] Remove-and-undo for New Powers removes the app-created powers.
- [ ] Remove app-applied skill increase reverts only if the current skill still equals the recorded after value.
- [ ] Remove app-applied attribute increase reverts only if the current attribute still equals the recorded after value.
- [ ] Remove app-applied Power Points increase reverts only if the current max Power Points still equals the recorded after value.
- [ ] Imported advance without appliedChanges removes history only and does not alter the character sheet.

## Persistence

- [ ] Save/reload preserves applied advances.
- [ ] Save/reload preserves appliedChanges.
- [ ] JSON export/import preserves applied advances.
- [ ] JSON export/import preserves appliedChanges.
- [ ] Existing characters without applied fields still load.
- [ ] Imported advances without appliedChanges still load.

## Non-goals

- [ ] The app does not perform full Edge prerequisite validation.
- [ ] The app does not perform full power legality validation.
- [ ] The app does not perform full character creation economy validation.
- [ ] The app does not silently undo imported advances.

# Advancement Adaptive Form Tests

## New Edge

- [ ] Select `New Edge`.
- [ ] Edge dropdown appears.
- [ ] Selecting an Edge fills the generated summary.
- [ ] Applying the advance adds the selected Edge.
- [ ] Removing with undo removes the app-created Edge.

## Increase Skill

- [ ] Select `Increase Skill`.
- [ ] Skill dropdown appears.
- [ ] Current and after die values display.
- [ ] Applying the advance increases the selected skill by one die step.
- [ ] Skill at d12 shows a warning and does not increase.

## Increase Two Skills

- [ ] Select `Increase Two Skills`.
- [ ] Two skill dropdowns appear.
- [ ] Current and after die values display for both.
- [ ] Selecting the same skill twice shows a warning.
- [ ] Applying the advance increases both selected skills by one die step.
- [ ] If one selected skill cannot increase, neither skill is partially applied.

## Increase Attribute

- [ ] Select `Increase Attribute`.
- [ ] Attribute dropdown appears.
- [ ] Current and after die values display.
- [ ] Applying the advance increases the selected attribute by one die step.
- [ ] Attribute at d12 shows a warning and does not increase.

## New Powers

- [ ] Select `New Powers`.
- [ ] Power selector appears.
- [ ] User can select one or more powers.
- [ ] Selected powers appear in a selected powers list.
- [ ] Generated summary lists selected powers.
- [ ] Applying the advance adds selected powers to Known Powers.
- [ ] Removing with undo removes the app-created Known Powers.

## Power Points

- [ ] Select `Power Points`.
- [ ] Power Point amount field appears.
- [ ] Default amount is +5.
- [ ] Generated summary shows the amount.
- [ ] Applying the advance increases max Power Points.

## Other / Marshal-approved

- [ ] Select `Other / Marshal-approved`.
- [ ] Manual summary and target fields remain available.
- [ ] Apply-to-character is disabled or ignored.
- [ ] Saving records history only.

## Persistence

- [ ] Save/reload preserves structured `targets`.
- [ ] JSON export/import preserves structured `targets`.
- [ ] Existing advances without `targets` still load.
- [ ] Existing imported advances still load.
- [ ] Applied advances still preserve `appliedChanges`.

# Advancement Form Cleanup Tests

## UI cleanup

- [ ] Non-critical browser alerts have been replaced with inline messages.
- [ ] Apply-to-character control is clearly labeled and positioned inside the form.
- [ ] Notes are hidden by default on the add form.
- [ ] Manual target and summary fields are hidden for supported adaptive advance types.
- [ ] Generated summary preview appears for supported adaptive advance types.
- [ ] Custom skill fields are not shown by default.

## Increase Skill rules

- [ ] A skill equal to its linked attribute is valid for Increase Skill.
- [ ] A skill higher than its linked attribute is valid for Increase Skill.
- [ ] A skill lower than its linked attribute is not valid for Increase Skill.
- [ ] A skill at d12 cannot be increased.
- [ ] Invalid Increase Skill choices show an inline warning.
- [ ] Invalid Increase Skill choices cannot be applied.

## Increase Two Skills rules

- [ ] Two different skills below their linked attributes are valid.
- [ ] Selecting the same skill twice shows an inline warning.
- [ ] A skill equal to its linked attribute is not valid for Increase Two Skills.
- [ ] A skill higher than its linked attribute is not valid for Increase Two Skills.
- [ ] If either selected skill is invalid, neither skill is applied.
- [ ] Invalid Increase Two Skills choices show an inline warning.
- [ ] Invalid Increase Two Skills choices cannot be applied.

## Attribute rules

- [ ] Attribute dropdown still appears for Increase Attribute.
- [ ] Attribute before/after preview displays.
- [ ] Attribute at d12 cannot be increased.

## Persistence

- [ ] Save/reload preserves cleaned adaptive advance entries.
- [ ] JSON export/import preserves cleaned adaptive advance entries.
- [ ] Existing old advances still load.
- [ ] Existing applied advances still preserve `appliedChanges`.

# Advancement Skill Dropdown Filtering Tests

- [ ] With Agility d8 and Shooting d8, Shooting appears under Increase Skill.
- [ ] With Agility d8 and Shooting d10, Shooting appears under Increase Skill.
- [ ] With Agility d8 and Shooting d6, Shooting does not appear under Increase Skill.
- [ ] With Agility d8 and Shooting d4, Shooting appears under Increase Two Skills.
- [ ] With Agility d8 and Shooting d6, Shooting appears under Increase Two Skills.
- [ ] With Agility d8 and Shooting d8, Shooting does not appear under Increase Two Skills.
- [ ] With Agility d8 and Shooting d10, Shooting does not appear under Increase Two Skills.
- [ ] Ineligible skills are not shown as disabled options; they are absent from the dropdown.
- [ ] Increase Two Skills does not allow the same skill to be selected twice.
- [ ] Existing application-time blocking still prevents invalid skill advancement if invalid data somehow gets through.
