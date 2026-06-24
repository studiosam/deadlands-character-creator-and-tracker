# Power Catalog Workflow Test Checklist

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
