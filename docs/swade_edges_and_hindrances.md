# SWADE Core Edges and Hindrances Reference

## Purpose

This file documents core *Savage Worlds Adventure Edition* Edges and Hindrances for the Deadlands character creator and tracker. It is meant to sit beside the Deadlands-specific reference file.

The app should eventually support both of these files:

```txt
docs/deadlands_edges_hindrances_catalog_with_summaries.md
docs/swade_core_edges_hindrances_reference.md
```

## Source notes

Primary source reviewed:

```txt
https://online.fliphtml5.com/xzazx/umaq/#p=1
```

Additional parsed reference reviewed:

```txt
https://anyflip.com/jbwjh/mals/basic/51-100
```

The AnyFlip version exposes the SWADE Hindrance and Edge summary tables in searchable text. This file uses short app-facing summaries rather than full rulebook text.

## Deadlands compatibility note

Most SWADE core Edges and Hindrances are compatible with *Deadlands: The Weird West*. However, Weird West uses its own Arcane Background Edges and does not use the generic SWADE `Arcane Background` Edge as a normal selectable Edge.

Weird West also excludes `Soul Drain`. For implementation, do not delete those SWADE entries, but mark them unavailable or hidden when the selected ruleset is Deadlands: The Weird West.

```js
{
  settingAvailability: {
    swadeCore: true,
    deadlandsWeirdWest: false,
    reason: "Deadlands replaces this with setting-specific Arcane Background rules."
  }
}
```

Use that same pattern for `Soul Drain`, with the reason that Deadlands specifically disallows it.

## Recommended catalog fields

```js
{
  id: "swade-edge-alertness",
  name: "Alertness",
  type: "edge",
  category: "Background",
  source: "Savage Worlds Adventure Edition",
  rank: "Novice",
  requirements: "Novice",
  shortSummary: "+2 to Notice rolls.",
  mechanicalTags: ["notice", "flat-bonus"],
  settingAvailability: {
    swadeCore: true,
    deadlandsWeirdWest: true
  }
}
```

For Hindrances:

```js
{
  id: "swade-hindrance-all-thumbs",
  name: "All Thumbs",
  type: "hindrance",
  source: "Savage Worlds Adventure Edition",
  severityOptions: ["Minor"],
  shortSummary: "-2 to use mechanical or electrical devices.",
  mechanicalTags: ["mechanical", "electrical", "repair-penalty"],
  settingAvailability: {
    swadeCore: true,
    deadlandsWeirdWest: true
  }
}
```

# Core Hindrances

| Hindrance       | Severity       | Short summary                                                                               | Tags / hooks                                  |
| --------------- | -------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| All Thumbs      | Minor          | -2 to use mechanical or electrical devices.                                                 | mechanical, electrical, repair-penalty        |
| Anemic          | Minor          | -2 Vigor when resisting Fatigue.                                                            | fatigue, vigor-penalty                        |
| Arrogant        | Major          | Tries to dominate rivals and challenge the strongest foe.                                   | roleplay, combat-complication                 |
| Bad Eyes        | Minor or Major | Penalty to Trait rolls dependent on vision; eyewear can negate but may break.               | vision, trait-penalty, severity               |
| Bad Luck        | Major          | Starts each session with one fewer Benny.                                                   | bennies, session-resource                     |
| Big Mouth       | Minor          | Cannot keep secrets and tends to reveal private information.                                | social, roleplay                              |
| Blind           | Major          | Severe penalty to vision-based tasks; grants a free Edge to offset.                         | vision, free-edge                             |
| Bloodthirsty    | Major          | Does not take prisoners and tends toward lethal solutions.                                  | roleplay, violence                            |
| Can't Swim      | Minor          | Penalty to swimming rolls and extremely limited swimming Pace.                              | athletics, swimming, movement                 |
| Cautious        | Minor          | Overplans and avoids rash decisions.                                                        | roleplay, planning                            |
| Clueless        | Major          | Penalty to Common Knowledge and Notice.                                                     | common-knowledge, notice, penalty             |
| Clumsy          | Major          | Penalty to Athletics and Stealth.                                                           | athletics, stealth, penalty                   |
| Code of Honor   | Major          | Keeps their word and acts according to a strict honorable code.                             | roleplay, moral-code                          |
| Curious         | Major          | Compelled to investigate mysteries and unknowns.                                            | roleplay, curiosity                           |
| Death Wish      | Minor          | Wants to die after or while completing an epic goal.                                        | roleplay, risky                               |
| Delusional      | Minor or Major | Believes something false or strange that causes trouble.                                    | roleplay, severity                            |
| Doubting Thomas | Minor          | Does not believe in the supernatural and takes unnecessary risks around it.                 | supernatural, roleplay                        |
| Driven          | Minor or Major | Has a major goal or belief that drives choices.                                             | goal, roleplay, severity                      |
| Elderly         | Major          | Physical penalties but extra skill points at creation.                                      | pace-penalty, attribute-penalty, skill-points |
| Enemy           | Minor or Major | Has a recurring nemesis or hostile group.                                                   | story, enemy, severity                        |
| Greedy          | Minor or Major | Obsessed with wealth or possessions.                                                        | roleplay, wealth, severity                    |
| Habit           | Minor or Major | Addiction or dependency; deprivation can cause Fatigue.                                     | fatigue, addiction, severity                  |
| Hard of Hearing | Minor or Major | Penalty to Notice sounds, or automatic failure if deaf.                                     | hearing, notice, severity                     |
| Heroic          | Major          | Always helps those in need, even at personal risk.                                          | roleplay, self-sacrifice                      |
| Hesitant        | Minor          | Draws two Action Cards and takes the lowest, except Jokers.                                 | initiative, action-card                       |
| Illiterate      | Minor          | Cannot read or write.                                                                       | literacy, roleplay                            |
| Impulsive       | Major          | Acts before thinking and jumps into danger.                                                 | roleplay, risky                               |
| Jealous         | Minor or Major | Covets what others have.                                                                    | roleplay, severity                            |
| Loyal           | Minor          | Loyal to friends and allies, even when costly.                                              | roleplay, allies                              |
| Mean            | Minor          | -1 to Persuasion rolls.                                                                     | persuasion, social-penalty                    |
| Mild Mannered   | Minor          | -2 to Intimidation rolls.                                                                   | intimidation, social-penalty                  |
| Mute            | Major          | Cannot speak.                                                                               | communication                                 |
| Obese           | Minor          | Size +1, Pace -1, running die d4, and lower effective Strength for Minimum Strength checks. | size, toughness, pace-penalty, min-strength   |
| Obligation      | Minor or Major | Owes regular weekly time or service to someone or something.                                | time-obligation, story, severity              |
| One Arm         | Major          | -4 to tasks requiring two hands.                                                            | limb-loss, two-hand-penalty                   |
| One Eye         | Major          | -2 to actions at 5 inches / 10 yards or more.                                               | vision, ranged-penalty                        |
| Outsider        | Minor or Major | Does not fit local society; Persuasion penalty and possible legal/social limits.            | social, persuasion-penalty, severity          |
| Overconfident   | Major          | Believes they can handle anything.                                                          | roleplay, risky                               |
| Pacifist        | Minor or Major | Minor fights only in self-defense; Major will not fight at all.                             | combat-restriction, severity                  |
| Phobia          | Minor or Major | Trait penalty in the presence of the feared thing.                                          | fear, trait-penalty, severity                 |
| Poverty         | Minor          | Half starting funds and tends to stay broke.                                                | money, starting-funds                         |
| Quirk           | Minor          | Persistent minor foible that annoys or complicates things.                                  | roleplay                                      |
| Ruthless        | Minor or Major | Does what it takes to get their way.                                                        | roleplay, morality, severity                  |
| Secret          | Minor or Major | Has a dark secret that can cause trouble if revealed.                                       | story, secret, severity                       |
| Shamed          | Minor or Major | Haunted by a past tragedy or failure.                                                       | roleplay, backstory, severity                 |
| Slow            | Minor or Major | Reduced Pace and running die; Major also penalizes Athletics and resisting Athletics.       | movement, athletics, severity                 |
| Small           | Minor          | Size and Toughness reduced by 1.                                                            | size, toughness-penalty                       |
| Stubborn        | Minor          | Insists on their own way and rarely admits mistakes.                                        | roleplay                                      |
| Suspicious      | Minor or Major | Paranoid; Major penalizes Support rolls to aid them.                                        | support, social, severity                     |
| Thin Skinned    | Minor or Major | Penalty when resisting Taunt attacks.                                                       | taunt, resistance-penalty, severity           |
| Tongue-Tied     | Major          | Penalty to speech-based Intimidation, Performance, Persuasion, and Taunt.                   | speech, social-penalty                        |
| Ugly            | Minor or Major | Penalty to Persuasion due to appearance.                                                    | persuasion, social-penalty, severity          |
| Vengeful        | Minor or Major | Seeks payback; Major escalates to physical harm.                                            | roleplay, revenge, severity                   |
| Vow             | Minor or Major | Sworn oath or cause that creates obligations and risk.                                      | roleplay, vow, severity                       |
| Wanted          | Minor or Major | Wanted by authorities or enemies.                                                           | law, story, severity                          |
| Yellow          | Major          | -2 to Fear checks and resisting Intimidation.                                               | fear, intimidation, penalty                   |
| Young           | Minor or Major | Reduced starting attribute/skill points but extra Bennies.                                  | character-creation, bennies, severity         |

## Hindrance implementation notes

Hindrances with `Minor or Major` severity need a severity selector. Character creation should preserve custom notes for Hindrances like `Enemy`, `Vow`, `Obligation`, `Secret`, `Phobia`, and `Driven`.

`Blind` grants a free Edge to offset the drawback. The app should warn or track that as a character creation note.

`Elderly`, `Young`, and `Obese` modify derived or creation values and should eventually get automation. `Obese` affects Minimum Strength calculations and should be considered by weapon/armor warning helpers.

`Bad Luck`, `Hesitant`, and `Yellow` are high-value automation targets because they affect Bennies, Action Cards, and Fear checks. `Slow` conflicts with `Fleet-Footed`.

`Mean`, `Mild Mannered`, `Ugly`, `Thin Skinned`, and `Outsider` are easy to display as roll modifiers. These can be handled as warning tags before they become fully automated effects.

# Core Edges

## Background Edges

| Edge                       | Requirements                    | Short summary                                                                                                          | Tags / hooks                                             |
| -------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Alertness                  | Novice                          | +2 to Notice rolls.                                                                                                    | notice, flat-bonus                                       |
| Ambidextrous               | Novice, Agility d8+             | Ignore the off-hand penalty when making Trait rolls.                                                                   | off-hand, dual-wield                                     |
| Arcane Background          | Novice                          | Allows access to an Arcane Background from the core rules.                                                             | arcane-background, setting-dependent, deadlands-replaced |
| Arcane Resistance          | Novice, Spirit d8+              | +2 to resist magical effects; magical damage reduced by 2.                                                             | arcane-defense, resistance                               |
| Improved Arcane Resistance | Novice, Arcane Resistance       | +4 to resist magical effects; magical damage reduced by 4.                                                             | arcane-defense, improved-edge                            |
| Aristocrat                 | Novice                          | +2 to Common Knowledge and networking with the upper class.                                                            | common-knowledge, networking, social                     |
| Attractive                 | Novice, Vigor d6+               | +1 to Performance and Persuasion when appearance matters.                                                              | performance, persuasion, social-bonus                    |
| Very Attractive            | Novice, Attractive              | +2 to Performance and Persuasion when appearance matters.                                                              | performance, persuasion, improved-edge                   |
| Berserk                    | Novice                          | After being Shaken or Wounded, enters a rage with stronger melee offense and toughness but risks uncontrolled attacks. | rage, melee, toughness, fatigue-risk                     |
| Brave                      | Novice, Spirit d6+              | +2 to Fear checks and -2 on Fear Table rolls.                                                                          | fear, resistance                                         |
| Brawny                     | Novice, Strength d6+, Vigor d6+ | Size and Toughness +1; Strength counts one die higher for Encumbrance and Minimum Strength.                            | size, toughness, encumbrance, min-strength               |
| Brute                      | Novice, Strength d6+, Vigor d6+ | Athletics links to Strength instead of Agility and thrown ranges improve.                                              | athletics, strength, thrown-weapons                      |
| Charismatic                | Novice, Spirit d8+              | Free reroll when using Persuasion.                                                                                     | persuasion, reroll                                       |
| Elan                       | Novice, Spirit d8+              | +2 when spending a Benny to reroll a Trait roll.                                                                       | benny, reroll, trait-bonus                               |
| Fame                       | Novice                          | +1 Persuasion when recognized and better Performance pay.                                                              | fame, persuasion, performance                            |
| Famous                     | Seasoned, Fame                  | +2 Persuasion when recognized and much better Performance pay.                                                         | fame, persuasion, improved-edge                          |
| Fast Healer                | Novice, Vigor d8+               | +2 to natural healing rolls and checks more often.                                                                     | healing, vigor                                           |
| Fleet-Footed               | Novice, Agility d6+             | Pace +2 and running die increases one step.                                                                            | movement, pace                                           |
| Linguist                   | Novice, Smarts d6+              | Knows extra languages based on Smarts.                                                                                 | languages                                                |
| Luck                       | Novice                          | +1 Benny at the start of each session.                                                                                 | bennies                                                  |
| Great Luck                 | Novice, Luck                    | +2 Bennies at the start of each session.                                                                               | bennies, improved-edge                                   |
| Quick                      | Novice, Agility d8+             | May discard and redraw Action Cards of 5 or lower.                                                                     | initiative, action-card                                  |
| Rich                       | Novice                          | Starts with triple funds and a strong income.                                                                          | money, starting-funds                                    |
| Filthy Rich                | Novice, Rich                    | Starts with five times funds and a much higher income.                                                                 | money, starting-funds, improved-edge                     |

## Combat Edges

| Edge                      | Requirements                                 | Short summary                                                                                           | Tags / hooks                           |
| ------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Block                     | Seasoned, Fighting d8+                       | +1 Parry and ignore 1 point of Gang Up bonus.                                                           | parry, gang-up                         |
| Improved Block            | Veteran, Block                               | +2 Parry and ignore 2 points of Gang Up bonus.                                                          | parry, gang-up, improved-edge          |
| Brawler                   | Novice, Strength d8+, Vigor d8+              | +1 Toughness and improved unarmed damage.                                                               | unarmed, toughness                     |
| Bruiser                   | Seasoned, Brawler                            | Further improves unarmed damage and Toughness.                                                          | unarmed, toughness, improved-edge      |
| Calculating               | Novice, Smarts d8+                           | Ignore up to 2 points of penalties on one action with low Action Card.                                  | initiative, penalty-reduction          |
| Combat Reflexes           | Seasoned                                     | +2 Spirit to recover from being Shaken or Stunned.                                                      | shaken, stunned, recovery              |
| Counterattack             | Seasoned, Fighting d8+                       | Free attack against one foe per turn who failed a Fighting roll.                                        | reaction, fighting                     |
| Improved Counterattack    | Veteran, Counterattack                       | Counterattack works against up to three foes per turn.                                                  | reaction, fighting, improved-edge      |
| Dead Shot                 | Wild Card, Novice, Athletics or Shooting d8+ | Once per turn, double ranged or thrown damage when dealt a Joker.                                       | joker, shooting, athletics, damage     |
| Dodge                     | Seasoned, Agility d8+                        | -2 to be hit by ranged attacks.                                                                         | defense, ranged                        |
| Improved Dodge            | Seasoned, Dodge                              | +2 to Evasion totals.                                                                                   | evasion, improved-edge                 |
| Double Tap                | Seasoned, Shooting d6+                       | +1 to hit and damage when firing no more than RoF 1 per action.                                         | shooting, damage-bonus                 |
| Extraction                | Novice, Agility d8+                          | One adjacent foe does not get a free attack when you withdraw.                                          | withdraw, melee                        |
| Improved Extraction       | Seasoned, Extraction                         | Up to three adjacent foes do not get free attacks when you withdraw.                                    | withdraw, melee, improved-edge         |
| Feint                     | Novice, Fighting d8+                         | May make a Fighting Test resisted by Smarts instead of Agility.                                         | test, fighting                         |
| First Strike              | Novice, Agility d8+                          | Free Fighting attack once per round when a foe moves into Reach.                                        | reaction, fighting                     |
| Improved First Strike     | Heroic, First Strike                         | Free Fighting attack against up to three foes moving into Reach.                                        | reaction, fighting, improved-edge      |
| Free Runner               | Novice, Agility d8+                          | Ignore Difficult Ground and gain bonuses in foot chases and climbing.                                   | movement, athletics, chase             |
| Frenzy                    | Seasoned, Fighting d8+                       | Roll a second Fighting die for one melee attack as a limited action.                                    | melee, extra-die                       |
| Improved Frenzy           | Veteran, Frenzy                              | Roll a third Fighting die for one melee attack.                                                         | melee, extra-die, improved-edge        |
| Giant Killer              | Veteran                                      | +1d6 damage against creatures three Sizes larger.                                                       | damage-bonus, size                     |
| Hard to Kill              | Novice, Spirit d8+                           | Ignore Wound penalties on Vigor rolls to avoid Bleeding Out.                                            | incapacitation, bleeding-out           |
| Harder to Kill            | Veteran, Hard to Kill                        | If the character dies, a die roll may let them survive somehow.                                         | death-save, story                      |
| Improved Level Headed     | Seasoned, Level Headed                       | Draw two additional Action Cards each round and choose which to use.                                    | initiative, action-card, improved-edge |
| Improved Nerves of Steel  | Novice, Nerves of Steel                      | Ignore up to two levels of Wound penalties.                                                             | wound-penalty, improved-edge           |
| Improved Rapid Fire       | Veteran, Rapid Fire                          | Increase RoF by 1 for up to two Shooting attacks per turn.                                              | shooting, rate-of-fire, improved-edge  |
| Improvisational Fighter   | Seasoned, Smarts d6+                         | Ignore the improvised weapon penalty.                                                                   | improvised-weapons                     |
| Iron Jaw                  | Novice, Vigor d8+                            | +2 to Soak rolls and to avoid Knockout Blows.                                                           | soak, vigor                            |
| Killer Instinct           | Seasoned                                     | Free reroll in opposed Tests initiated by the hero.                                                     | test, reroll                           |
| Level Headed              | Seasoned, Smarts d8+                         | Draw an additional Action Card each round and choose which to use.                                      | initiative, action-card                |
| Marksman                  | Seasoned, Shooting d8+                       | Ignore up to 2 points of Range, Cover, or Called Shot penalties with RoF 1 weapons.                     | shooting, penalty-reduction            |
| Martial Artist            | Novice, Fighting d6+                         | Unarmed Fighting +1; fists and feet count as Natural Weapons and add damage.                            | unarmed, fighting                      |
| Martial Warrior           | Seasoned, Martial Artist                     | Unarmed Fighting +2 and further improves unarmed damage.                                                | unarmed, fighting, improved-edge       |
| Mighty Blow               | Wild Card, Novice, Fighting d8+              | Once per turn, double Fighting damage when dealt a Joker.                                               | joker, fighting, damage                |
| Nerves of Steel           | Novice, Vigor d8+                            | Ignore one level of Wound penalties.                                                                    | wound-penalty                          |
| No Mercy                  | Seasoned                                     | +2 damage when spending a Benny to reroll damage.                                                       | benny, damage-reroll                   |
| Rapid Fire                | Seasoned, Shooting d6+                       | Increase RoF by 1 for one Shooting attack per turn.                                                     | shooting, rate-of-fire                 |
| Rock and Roll!            | Seasoned, Shooting d8+                       | Ignore Recoil penalty when firing weapons with RoF 2 or more.                                           | shooting, recoil                       |
| Steady Hands              | Novice, Agility d8+                          | Ignore Unstable Platform penalty and reduce running penalty.                                            | shooting, unstable-platform, running   |
| Sweep                     | Novice, Strength d8+, Fighting d8+           | Fighting roll at -2 to hit all targets in weapon Reach once per turn.                                   | melee, area-attack                     |
| Improved Sweep            | Veteran, Sweep                               | Sweep without the -2 penalty.                                                                           | melee, area-attack, improved-edge      |
| Trademark Weapon          | Novice, relevant weapon skill d8             | +1 attack and Parry with a specific weapon.                                                             | chosen-weapon, attack-bonus, parry     |
| Improved Trademark Weapon | Seasoned, Trademark Weapon                   | Trademark Weapon bonus increases to +2.                                                                 | chosen-weapon, improved-edge           |
| Two-Fisted                | Novice, Agility d8+                          | Extra Fighting roll with a second melee weapon in the off-hand at no Multi-Action penalty.              | dual-wield, fighting                   |
| Two-Gun Kid               | Novice, Agility d8+                          | Extra Shooting or throwing roll with a second ranged weapon in the off-hand at no Multi-Action penalty. | dual-wield, shooting, throwing         |

## Leadership Edges

| Edge             | Requirements                              | Short summary                                                           | Tags / hooks                           |
| ---------------- | ----------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------- |
| Command          | Novice, Smarts d6+                        | +1 to Extras' Shaken recovery rolls in Command Range.                   | leadership, extras, shaken             |
| Command Presence | Seasoned, Command                         | Command Range increases to 10 inches / 20 yards.                        | leadership, command-range              |
| Fervor           | Veteran, Spirit d8+, Command              | +1 to Extras' Fighting rolls in Command Range.                          | leadership, extras, fighting           |
| Hold the Line!   | Seasoned, Smarts d8+, Command             | +1 Toughness to Extras in Command Range.                                | leadership, extras, toughness          |
| Inspire          | Seasoned, Command                         | Battle roll Supports a chosen Trait roll for everyone in Command Range. | leadership, battle, support            |
| Natural Leader   | Seasoned, Spirit d8+, Command             | Leadership Edges apply to Wild Cards as well as Extras.                 | leadership, wild-cards                 |
| Tactician        | Seasoned, Smarts d8+, Command, Battle d6+ | Draw an extra Action Card each turn and assign it to an allied Extra.   | leadership, action-card                |
| Master Tactician | Veteran, Tactician                        | Draw and distribute two extra Action Cards instead of one.              | leadership, action-card, improved-edge |

## Power Edges

| Edge                    | Requirements                                                   | Short summary                                                          | Tags / hooks                                      |
| ----------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Artificer               | Seasoned, Arcane Background                                    | Allows creation of Arcane Devices.                                     | arcane, crafting                                  |
| Channeling              | Seasoned, Arcane Background                                    | Reduce Power Point cost by 1 with a raise on activation.               | arcane, power-points, cost-reduction              |
| Concentration           | Seasoned, Arcane Background                                    | Shaken results do not cause Disruption; Stun or Wounds still can.      | arcane, concentration, disruption                 |
| Extra Effort            | Seasoned, Arcane Background (Gifted), Focus d6+                | Spend Power Points to temporarily increase Focus.                      | gifted, focus, power-points                       |
| Gadgeteer               | Seasoned, Arcane Background (Weird Science), Weird Science d6+ | Spend 3 Power Points to create a device that replicates another power. | weird-science, gadget, power-points               |
| Holy/Unholy Warrior     | Seasoned, Arcane Background (Miracles), Faith d6+              | Spend Power Points for a Soak bonus.                                   | miracles, faith, soak, power-points               |
| Mentalist               | Seasoned, Arcane Background (Psionics), Psionics d6+           | +2 to opposed Psionics rolls.                                          | psionics, opposed-roll                            |
| New Powers              | Novice, Arcane Background                                      | Learn two new powers.                                                  | arcane, powers-known                              |
| Power Points            | Novice, Arcane Background                                      | Gain 5 additional Power Points, no more than once per Rank.            | arcane, power-points                              |
| Power Surge             | Wild Card, Novice, Arcane Background, arcane skill d8+         | Recover 10 Power Points when dealt a Joker in combat.                  | arcane, joker, power-points                       |
| Rapid Recharge          | Seasoned, Spirit d6+, Arcane Background                        | Recover 10 Power Points per hour.                                      | arcane, power-point-recovery                      |
| Improved Rapid Recharge | Veteran, Rapid Recharge                                        | Recover 20 Power Points per hour.                                      | arcane, power-point-recovery, improved-edge       |
| Soul Drain              | Seasoned, Arcane Background, arcane skill d10+                 | Recover 5 Power Points for a level of Fatigue.                         | arcane, power-points, fatigue, deadlands-excluded |
| Wizard                  | Seasoned, Arcane Background (Magic), Spellcasting d6+          | Spend 1 extra Power Point to change a spell's Trapping.                | magic, trapping, power-points                     |

## Professional Edges

| Edge               | Requirements                                   | Short summary                                                                                                    | Tags / hooks                             |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Ace                | Novice, Agility d8+                            | Spend Bennies to Soak vehicle damage and ignore up to 2 points of vehicle operation penalties.                   | vehicles, soak, piloting-driving-boating |
| Acrobat            | Novice, Agility d8+, Athletics d8+             | Free reroll on acrobatic Athletics attempts.                                                                     | athletics, reroll                        |
| Combat Acrobat     | Seasoned, Acrobat                              | Attacks against the character suffer -1 when they can move freely.                                               | defense, movement                        |
| Assassin           | Novice, Agility d8+, Fighting d6+, Stealth d8+ | +2 damage against Vulnerable foes or when the assassin has The Drop.                                             | stealth, vulnerable, damage-bonus        |
| Investigator       | Novice, Smarts d8+, Research d8+               | +2 to Research and clue-related Notice rolls.                                                                    | research, notice, investigation          |
| Jack-of-All-Trades | Novice, Smarts d10+                            | Temporarily gains d4 in an untrained Smarts-based skill, or d6 with a raise.                                     | skills, smarts                           |
| McGyver            | Novice, Smarts d6+, Repair d6+, Notice d8+     | Quickly creates improvised devices from available scraps.                                                        | repair, improvised-device                |
| Mr. Fix It         | Novice, Repair d8+                             | +2 to Repair rolls; repairs take less time with a raise.                                                         | repair, time-reduction                   |
| Scholar            | Novice, Research d8+                           | +2 to one knowledge-related skill.                                                                               | knowledge, chosen-skill                  |
| Soldier            | Novice, Strength d6+, Vigor d6+                | Strength counts one die higher for Encumbrance and Minimum Strength; reroll Vigor against environmental Hazards. | encumbrance, min-strength, hazard        |
| Thief              | Novice, Agility d8+, Stealth d6+, Thievery d6+ | +1 to Thievery, climbing Athletics, and urban Stealth.                                                           | thievery, stealth, athletics             |
| Woodsman           | Novice, Spirit d6+, Survival d8+               | +2 to Survival and wilderness Stealth.                                                                           | survival, stealth, wilderness            |

## Social Edges

| Edge           | Requirements                                  | Short summary                                                                                 | Tags / hooks                                    |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Bolster        | Novice, Spirit d8+                            | After a successful Test, remove Distracted or Vulnerable from an ally.                        | test, support, condition-removal                |
| Common Bond    | Wild Card, Novice, Spirit d8+                 | May freely give Bennies to other characters.                                                  | bennies, support                                |
| Connections    | Novice                                        | Has contacts who can provide aid or favors once per session.                                  | contacts, favor, session                        |
| Humiliate      | Novice, Taunt d8+                             | Free reroll when making Taunt Tests.                                                          | taunt, test, reroll                             |
| Menacing       | Novice, Bloodthirsty / Mean / Ruthless / Ugly | +2 to Intimidation using bad looks or attitude.                                               | intimidation, social-bonus                      |
| Provoke        | Novice, Taunt d6+                             | With a raise on Taunt, make the target worse at affecting others.                             | taunt, test, control                            |
| Rabble-Rouser  | Seasoned, Spirit d8+                          | Intimidation or Taunt Test against all foes in a Medium Blast Template once per turn.         | taunt, intimidation, area-test                  |
| Reliable       | Novice, Spirit d8+                            | Free reroll when making Support rolls.                                                        | support, reroll                                 |
| Retort         | Novice, Taunt d6+                             | A raise when resisting Taunt or Intimidation makes the foe Distracted.                        | taunt, intimidation, reaction                   |
| Streetwise     | Novice, Smarts d6+                            | +2 to Common Knowledge and criminal networking.                                               | common-knowledge, criminal, networking          |
| Strong Willed  | Novice, Spirit d8+                            | +2 to resist Smarts or Spirit-based Tests.                                                    | test-resistance                                 |
| Iron Will      | Novice, Strong Willed                         | +4 to resist Smarts or Spirit-based Tests.                                                    | test-resistance, improved-edge                  |
| Work the Room  | Novice, Spirit d8+                            | Roll a second die when Supporting via Performance or Persuasion and apply it to another ally. | support, performance, persuasion                |
| Work the Crowd | Seasoned, Work the Room                       | Work the Room can apply to up to two additional allies.                                       | support, performance, persuasion, improved-edge |

## Weird Edges

| Edge           | Requirements                     | Short summary                                                                                                           | Tags / hooks                            |
| -------------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Beast Bond     | Novice                           | May spend Bennies for animals under the hero's control.                                                                 | animals, bennies                        |
| Beast Master   | Novice, Spirit d8+               | Animals like the hero and the hero has a pet, subject to GM approval.                                                   | animals, companion                      |
| Champion       | Novice, Spirit d8+, Fighting d6+ | +2 damage versus supernaturally evil creatures.                                                                         | supernatural, evil, damage-bonus        |
| Chi            | Veteran, Martial Warrior         | Once per combat, use a Chi Point to reroll an attack, force an enemy attack reroll, or add damage to an unarmed attack. | chi, martial-arts, once-per-combat      |
| Danger Sense   | Novice                           | Notice roll at +2 to sense ambushes or similar danger.                                                                  | notice, ambush                          |
| Healer         | Novice, Spirit d8+               | +2 to Healing rolls, magical or mundane.                                                                                | healing                                 |
| Liquid Courage | Novice, Vigor d8+                | Alcohol boosts Vigor and ignores one Wound penalty level, but penalizes Agility, Smarts, and linked skills.             | alcohol, vigor, wound-penalty, drawback |
| Scavenger      | Novice, Luck                     | Once per encounter, find or remember a needed item or resource.                                                         | item-finding, encounter                 |

## Legendary Edges

| Edge               | Requirements                          | Short summary                                                  | Tags / hooks                           |
| ------------------ | ------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| Followers          | Wild Card, Legendary                  | Gain five loyal followers.                                     | followers, allies                      |
| Professional       | Legendary, d12 in Trait               | Chosen Trait and its limit increase one step.                  | trait-boost, repeatable                |
| Expert             | Legendary, Professional in Trait      | Chosen Trait and its limit increase one additional step.       | trait-boost, improved-edge             |
| Master             | Wild Card, Legendary, Expert in Trait | Wild Die becomes d10 with the chosen Trait.                    | trait-mastery, wild-die                |
| Sidekick           | Wild Card, Legendary                  | Gain a Novice Rank Wild Card sidekick.                         | sidekick, ally, wild-card              |
| Tough as Nails     | Legendary, Vigor d8+                  | Can take four Wounds before Incapacitation.                    | wounds, toughness                      |
| Tougher than Nails | Legendary, Tough as Nails, Vigor d12+ | Can take five Wounds before Incapacitation.                    | wounds, improved-edge                  |
| Weapon Master      | Legendary, Fighting d12+              | Parry +1 and Fighting bonus damage die becomes d8.             | fighting, parry, damage                |
| Master of Arms     | Legendary, Weapon Master              | Additional Parry +1 and Fighting bonus damage die becomes d10. | fighting, parry, damage, improved-edge |

# Deadlands Weird West availability overrides

Use these overrides when the app is in Deadlands mode.

| Entry             | Type | SWADE Core availability | Deadlands: The Weird West availability | Reason                                                                                                                    |
| ----------------- | ---- | ----------------------: | -------------------------------------: | ------------------------------------------------------------------------------------------------------------------------- |
| Arcane Background | Edge |                     Yes |                                     No | Deadlands uses setting-specific Arcane Background Edges such as Blessed, Huckster, Mad Scientist, Shaman, and Chi Master. |
| Soul Drain        | Edge |                     Yes |                                     No | Deadlands specifically excludes Soul Drain.                                                                               |

Do not remove these from the SWADE catalog. Just mark them unavailable or hidden when the selected ruleset is Deadlands: The Weird West.

# Suggested implementation plan

## 1. Add source-aware catalogs

Add or extend catalog exports:

```js
export const SWADE_CORE_EDGE_CATALOG = [];
export const SWADE_CORE_HINDRANCE_CATALOG = [];
export const DEADLANDS_EDGE_CATALOG = [];
export const DEADLANDS_HINDRANCE_CATALOG = [];
```

Then combine them for the active ruleset:

```js
function getAvailableEdgesForRuleset(ruleset) {}
function getAvailableHindrancesForRuleset(ruleset) {}
```

## 2. Add filtering

Useful filters:

* Valid for current ruleset
* Rank
* Category
* Requirements met
* Requirements unmet
* Has automation support
* Has subchoice
* Source: SWADE Core or Deadlands

## 3. Add warning-first validation

Do not hard-block selections. Show warnings and allow Marshal override.

Warnings should include:

* Missing Rank
* Missing required attribute
* Missing required skill
* Missing prerequisite Edge
* Setting-incompatible Edge
* Conflict with existing Hindrance or Edge
* Subchoice required

## 4. Add high-value automation later

Prioritize effects that directly improve table use:

| Entry                                                                 | Suggested automation                           |
| --------------------------------------------------------------------- | ---------------------------------------------- |
| Bad Luck                                                              | Adjust starting/session Bennies.               |
| Luck / Great Luck                                                     | Adjust starting/session Bennies.               |
| Hesitant                                                              | Initiative warning or card draw reminder.      |
| Quick / Level Headed / Improved Level Headed                          | Initiative/card draw reminder.                 |
| Nerves of Steel / Improved Nerves of Steel                            | Wound penalty display.                         |
| Brawny / Soldier / Obese                                              | Minimum Strength and encumbrance calculations. |
| Fleet-Footed / Slow                                                   | Pace and running die display.                  |
| Power Points / Rapid Recharge / Improved Rapid Recharge / Power Surge | Power Point controls.                          |
| Martial Artist / Martial Warrior / Chi                                | Unarmed combat display.                        |
| Fear-related Edges and Hindrances                                     | Fear check modifier display.                   |

## 5. Avoid duplicate display names causing logic bugs

Several entries have improved versions. Store stable IDs rather than relying only on names:

```txt
swade-edge-block
swade-edge-improved-block
swade-edge-rapid-recharge
swade-edge-improved-rapid-recharge
```

## Quick counts

| Catalog section    | Count |
| ------------------ | ----: |
| Core Hindrances    |    56 |
| Core Edges         |   134 |
| Background Edges   |    24 |
| Combat Edges       |    44 |
| Leadership Edges   |     8 |
| Power Edges        |    14 |
| Professional Edges |    12 |
| Social Edges       |    14 |
| Weird Edges        |     8 |
| Legendary Edges    |     9 |

Note: Counts represent app catalog entries in this document. Improved versions are separate entries because the app should treat them as separate choices.
