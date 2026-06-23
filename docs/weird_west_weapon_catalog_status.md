# Codex Note: Weird West Weapon Catalog Status and Maintenance

## Current status

The official Deadlands: The Weird West weapon catalog has already been integrated into the app. This file is no longer an import prompt and should not tell Codex to replace the weapon catalog from scratch.

The live weapon data is maintained in:

```txt
src/catalogs.js
```

The app should use the exported/live `WEAPON_CATALOG` from that source file. Do not duplicate the full catalog array in this document unless the project intentionally needs an audit reference.

## Scope

This project should use official Deadlands: The Weird West weapon data only.

Do not add:

- Deadlands: Hell on Earth weapon data
- Greywolf house-rule gear data
- HoE-only fields such as `speed`
- Fan-made replacement stats unless they are clearly marked as custom/homebrew

The official Weird West weapon model uses SWADE-style fields:

```txt
Range
Damage
AP
RoF
Shots
Min. Str
Wt
Cost
Notes / special behavior
```

## Expected runtime fields

Weapon catalog entries should preserve these fields when available:

```js
{
  id: "string",
  name: "string",
  book: "Deadlands: The Weird West",
  category: "string",
  damage: "string",
  range: "string",
  ap: "string",
  rof: "string",
  shotsMax: number | null,
  shotsText: "string",
  minStr: "d4" | "d6" | "d8" | "d10" | "d12" | "",
  weight: number | null,
  weightText: "string",
  costCents: number | null,
  costText: "string",
  ammoType: "string",
  caliber: "string",
  modeOf: "string",
  notes: "string"
}
```

Runtime entries do not need a `sourceUrl` field unless the app intentionally displays or audits source links. Documentation may mention sources, but the app does not need source URLs attached to every weapon object.

## Maintenance tasks

Use this file as guidance for future cleanup and verification, not as a data import script.

### 1. Verify the live catalog

Check `src/catalogs.js` and confirm that the current `WEAPON_CATALOG` still includes the official Weird West weapon entries.

Spot-check these examples:

- `Colt Peacemaker (.45)`: damage `2d6+1`, range `12/24/48`, AP `1`, RoF `1`, shots `6`
- `Winchester '73 (.44-40)`: damage `2d8-1`, range `24/48/96`, AP `2`, RoF `1`, shots `15`
- `Double-Barrel Shotgun`: damage `1-3d6`, range `12/24/48`, RoF `1`, shots `2`
- `Gatling Rifle (.45)`: damage `2d8`, range `24/48/96`, AP `2`, RoF `2`, shots `30`
- `Steam Gatling`: damage `2d8`, range `24/48/96`, AP `2`, RoF `4`, shots `100`

If those values are already correct, do not re-import the catalog. Fix only mismatches, missing fields, broken IDs, or display bugs.

### 2. Verify weapon selection behavior

Selecting a catalog weapon should populate:

- Damage
- Range
- AP
- RoF
- Shots / loaded capacity
- Minimum Strength
- Weight
- Cost
- Ammo type
- Caliber
- Mode notes
- Special notes

The app should not ask users to manually fill official combat stats for normal catalog weapons.

### 3. Clean up stale UI language

Search for stale text such as:

```txt
Fill blank combat stats manually
blank combat stats
manual stats
placeholder weapon data
```

Replace it with something like:

```txt
Choose a catalog weapon to fill its official Weird West stats, or create a custom weapon manually.
```

### 4. Preserve custom weapons

Do not remove custom weapon support. The user should still be able to enter manual weapon stats for homebrew, NPC gear, temporary items, and edge cases.

Custom weapons should still support:

- Name
- Damage
- Range
- AP
- RoF
- Shots
- Minimum Strength
- Weight
- Cost
- Ammo type
- Notes

### 5. Preserve saved character compatibility

Do not break existing browser saves or imported characters.

If older saves use old IDs, add or preserve normalization instead of deleting support. Older IDs might include examples like:

```txt
colt-peacemaker
knife
lariat
winchester-73-44-40
```

These should either load safely as custom/current weapons or migrate to the current `ww-` catalog IDs when possible.

### 6. Verify ammo behavior

Ammo controls should appear for weapons with real loaded-round behavior and should stay hidden or disabled for non-ammo weapons.

Manual cases to check:

- `Colt Peacemaker (.45)`: 6-shot revolver behavior
- `Winchester '73 (.44-40)`: 15-shot rifle behavior
- `Double-Barrel Shotgun`: 2-shot shotgun behavior
- `Gatling Rifle (.45)`: 30-shot Gatling drum behavior
- `Gatling Shotgun`: 15-shot Gatling shotgun drum behavior
- `Dynamite/Nitro` entries: no normal firearm loaded-round controls
- Melee weapons: no ammo controls

### 7. Verify minimum Strength behavior

Keep the existing minimum Strength warning behavior.

Expected behavior:

- Ranged weapons below minimum Strength show `-1` per die step short.
- Melee and thrown weapons below minimum Strength show a damage die cap warning.
- Low Strength should not block adding, equipping, firing, editing, or saving the weapon.

Manual cases to check:

- Strength `d4` using `Gatling Rifle (.45)`, minStr `d8`, should show a ranged penalty of `-2`.
- Strength `d4` using `Club, War (Bladed)`, minStr `d8`, should show damage capped at `d4`.
- Strength `d8` using `Gatling Rifle (.45)`, minStr `d8`, should show no warning.

## Acceptance criteria

- The app loads without console errors.
- The current live catalog remains in `src/catalogs.js`.
- Official Weird West weapons populate combat stats without requiring manual entry.
- This document no longer tells Codex to replace the catalog from scratch.
- Stale UI copy about blank weapon stats is removed or revised.
- Ammo tracking works for firearms and does not appear for non-ammo weapons.
- Minimum Strength warnings still work.
- Existing saves and custom weapons still normalize safely.

## Do not delete these app files

Do not delete:

```txt
src/catalogs.js
src/tracker.js
src/default-character.js
src/savaged-import.js
index.html
styles.css
```

Those files are part of the live app. Edit them only if a specific bug or stale UI copy needs to be fixed.

## File cleanup recommendation

Keep this file as the weapon catalog maintenance note:

```txt
docs/codex_weird_west_official_weapons_only.md
```

Delete older duplicate Codex handoff files if they exist locally or in the repo, especially files named like:

```txt
codex_deadlands_hoe_weapon_catalog_update.md
codex_weird_west_weapon_catalog_final_update.md
codex_weird_west_weapon_catalog_cleanup_verify.md
```

Those were intermediate handoff files and can confuse Codex by giving it outdated or duplicate instructions.
