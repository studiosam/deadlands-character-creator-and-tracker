# Deadlands Tracker

A browser-based Deadlands/SWADE character tracker built for table use. It tracks wounds, fatigue, Bennies, Conviction, money, resources, armor, weapons, ammunition, gear, vehicles, notes, Savaged.us imports, and character creation data while storing saves locally in the browser.

## Current Features

- Tracker for wounds, fatigue, Bennies, Conviction, money, and derived stats
- Armor tracking by body location
- Weapon tracking with loaded rounds and reserve ammunition
- Gear, armor, weapon, ammunition, and vehicle catalogs
- Character creation workflow for Deadlands/SWADE characters
- Arcane Background and Power Points support
- Powers tracking with cost, duration, trapping, active status, and notes
- Huckster Dealing with the Devil helper
- Savaged.us JSON import support
- Local browser saves using `localStorage`
- JSON export and import for app data

## How to Use

Open `index.html` in a browser, or publish the folder with GitHub Pages. No build step, server, or package installation is required.

The app saves data locally in the browser. That means saves are tied to the browser and device being used unless you export your data manually.

## Project Structure

```text
deadlands-tracker/
  index.html
  styles.css
  src/
    app.js
    arcane.js
    catalogs.js
    config.js
    creator.js
    default-character.js
    savaged-import.js
    tracker.js
  docs/
    Sample Characters/
    deadlands-power-points-arcane-backgrounds.md
```

## GitHub Pages

For GitHub Pages, publish from the `main` branch and the root folder `/`. The main page is `index.html`, so GitHub Pages should open the tracker automatically after deployment.

## Data and Privacy

Character data is stored in browser `localStorage`. Exported character files may contain private character notes, player names, session notes, or campaign information.

The files in `docs/Sample Characters/` are intended as sample imports. Personal character exports should generally stay out of the repository unless they are meant to be shared.

## Rules and Copyright Note

This project is a personal table tool for tracking Deadlands/SWADE character state. It is not a replacement for the official rulebooks, and it should avoid copying long rules text.

## Status

This is an active MVP. The tracker is usable for play, while some Deadlands-specific tools may still be expanded over time.
