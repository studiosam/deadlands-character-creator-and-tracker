// src/config.js
const STORAGE_KEY = "deadlands-tracker-v2";

// src/catalogs.js
const DEADLANDS_HINDRANCE_CATALOG = [
  ["dl-hindrance-ailin", "Ailin’", "Minor or Major", "Penalty to rolls made to resist Fatigue. Minor is worse than normal by 1; Major by 2. A Critical Failure can worsen the condition or create a terminal story moment at Major severity."],
  ["dl-hindrance-cursed", "Cursed", "Major", "For each player character with this Hindrance, the Marshal starts with one additional Benny."],
  ["dl-hindrance-grim-servant-o-death", "Grim Servant o’ Death", "Major", "Wild Card only. Adds +1 to all damage rolls, but a Critical Failure on an attack hits the nearest ally with a raise."],
  ["dl-hindrance-heavy-sleeper", "Heavy Sleeper", "Minor", "Takes a large penalty to wake up and to stay awake."],
  ["dl-hindrance-lyin-eyes", "Lyin’ Eyes", "Minor", "Penalty to social rolls that require lying; also penalizes bluffing in poker or faro."],
  ["dl-hindrance-night-terrors", "Night Terrors", "Major", "Constant nightmares weaken resolve, causing a penalty to all Spirit rolls."],
  ["dl-hindrance-old-ways-oath", "Old Ways Oath", "Minor", "Character rejects modern technology. If faithful, gains a free reroll on Spirit rolls. Violating the oath suppresses the benefit temporarily, longer for ghost-rock use."],
  ["dl-hindrance-talisman", "Talisman", "Minor or Major", "Arcane character suffers an arcane skill penalty without their talisman. Minor and Major differ by penalty size. Mad scientists are not eligible."],
  ["dl-hindrance-tenderfoot", "Tenderfoot", "Major", "If wounded, suffers an extra action penalty. Cannot take Don’t Get ’im Riled!"],
  ["dl-hindrance-trouble-magnet", "Trouble Magnet", "Minor or Major", "Minor makes Critical Failure consequences worse. Major causes random negative targeting to hit this character."],
].map(([id, name, severity, shortSummary]) => ({
  id,
  name,
  type: "hindrance",
  severity,
  shortSummary,
  source: "Deadlands: The Weird West",
  isCustom: false,
}));

const DEADLANDS_EDGE_CATALOG = [
  ["dl-edge-arcane-background-blessed", "Arcane Background (Blessed)", "Background", "Novice", "Spirit d6+, Faith d4+", "Grants Blessed casting: Faith arcane skill, 15 Power Points, holy symbol plus two chosen starting powers, Blessed power list, divine sin/backlash rules.", "Required"],
  ["dl-edge-arcane-background-chi-master", "Arcane Background (Chi Master)", "Background", "Novice", "Agility d6+, Spirit d6+, Martial Artist, Focus d4+", "Grants Chi Master casting: Focus arcane skill, 15 Power Points, deflection plus two chosen starting powers, internal/self-focused casting limitations.", "Required"],
  ["dl-edge-arcane-background-huckster", "Arcane Background (Huckster)", "Background", "Novice", "Gambling d6+, Spellcasting d4+", "Grants Huckster casting: Spellcasting arcane skill, 10 Power Points, three starting powers, Deal with the Devil rules, huckster backlash.", ""],
  ["dl-edge-arcane-background-mad-scientist", "Arcane Background (Mad Scientist)", "Background", "Novice", "Smarts d8+, Science d6+, Weird Science d4+", "Grants Mad Scientist casting: Weird Science arcane skill, 15 Power Points, two starting powers, gizmo/invention framing, malfunction rules.", ""],
  ["dl-edge-arcane-background-shaman", "Arcane Background (Shaman)", "Background", "Novice", "Spirit d8+, Faith d4+", "Grants Shaman casting: Faith arcane skill, 15 Power Points, two starting powers, Shaman power list, nature-spirit backlash and Old Ways context.", ""],
  ["dl-edge-gallows-humor", "Gallows Humor", "Background", "Novice", "Taunt d6+", "Allows Taunt instead of Spirit for Fear checks. A raise can support allies facing the same Fear check.", ""],
  ["dl-edge-veteran-o-the-weird-west", "Veteran o’ the Weird West", "Background", "Novice", "Wild Card, Spirit d6+, Occult d6+", "Starts at Seasoned or one Rank higher than the posse, gaining four Advances, but draws for a serious Weird West complication.", ""],
  ["dl-edge-dont-get-im-riled", "Don’t Get ’im Riled!", "Combat", "Novice", "None beyond Rank", "Adds current Wound levels to melee damage rolls.", ""],
  ["dl-edge-duelist", "Duelist", "Combat", "Novice", "Shooting d6+", "Grants two extra Hole Cards at the start of a formal duel.", ""],
  ["dl-edge-fan-the-hammer", "Fan the Hammer", "Combat", "Seasoned", "Agility d8+, Shooting d8+", "With a fully loaded single-action revolver, fire up to six shots as one action. Each shot suffers a Shooting penalty.", ""],
  ["dl-edge-improved-fan-the-hammer", "Improved Fan the Hammer", "Combat", "Heroic", "Agility d10+, Fan the Hammer, Shooting d10+", "Same as Fan the Hammer, but with a smaller Shooting penalty.", ""],
  ["dl-edge-quick-draw", "Quick Draw", "Combat", "Novice", "Agility d8+", "When spending a Benny for an extra Action Card, draw two and choose from available options. Also improves Athletics rolls to interrupt or resist interruption.", "Required"],
  ["dl-edge-agent", "Agent", "Professional", "Novice", "Smarts d8+, Fighting d6+, Occult d6+, Research d6+, Shooting d6+", "Makes the character a U.S. Agent. Grants organization status, starting gear, pay, badge benefits, and access to Agent favors/rank advancement.", ""],
  ["dl-edge-born-in-the-saddle", "Born in the Saddle", "Professional", "Novice", "Agility d8+, Riding d6+", "Free reroll on Riding rolls. Also improves the character’s horse movement.", ""],
  ["dl-edge-card-sharp", "Card Sharp", "Professional", "Novice", "Gambling d6+", "Free reroll on Gambling rolls, including Huckster Deal with the Devil Gambling rolls.", ""],
  ["dl-edge-guts", "Guts", "Professional", "Novice", "Spirit d6+", "Free reroll on Fear checks.", ""],
  ["dl-edge-scout", "Scout", "Professional", "Seasoned", "Woodsman", "Improves wilderness travel awareness, tracking, and route knowledge. Can detect travel encounters before they hit the posse.", ""],
  ["dl-edge-soldier", "Soldier", "Professional", "Novice", "Strength d6+, Vigor d6+", "Military-service Edge. Gives rank/pay/Obligation context if still serving. Higher starting rank is possible but increases Obligation and has extra expectations.", ""],
  ["dl-edge-tale-teller", "Tale-Teller", "Professional", "Novice", "Performance or Persuasion d8+", "Helps lower local Fear Levels. On a strong success, the tale-teller and supporters can earn Conviction.", ""],
  ["dl-edge-territorial-ranger", "Territorial Ranger", "Professional", "Novice", "Vigor d6+, Fighting d6+, Intimidation d6+, Riding d6+, Shooting d6+, Survival d4+", "Makes the character a Territorial Ranger. Grants organization status, starting gear, badge benefits, pay/favor context, and access to Ranger advancement.", ""],
  ["dl-edge-reputation", "Reputation", "Social", "Veteran", "None beyond Rank", "Choose good or bad reputation. Good reputation gives a Persuasion reroll with people who know the character; bad reputation gives an Intimidation bonus with people who know the character.", "Required"],
  ["dl-edge-grit", "Grit", "Weird", "Veteran", "Spirit d8+, Guts", "Reduces Fear check penalties and stacks with Brave.", ""],
  ["dl-edge-harrowed", "Harrowed", "Weird", "Novice", "Wild Card, Spirit d6+", "Character begins play as undead Harrowed. Grants Harrowed rules package and access to Harrowed Edges. Character-creation-only unless the Marshal says otherwise.", ""],
  ["dl-edge-knack", "Knack", "Weird", "Novice", "None beyond Rank", "Character chooses one folklore-based birth omen that grants a specific supernatural trick. Needs a subchoice.", "Required"],
  ["dl-edge-behold-a-pale-horse", "Behold a Pale Horse…", "Legendary", "Legendary", "None beyond Rank", "Grants a special war horse that is Fearless, has Danger Sense, is a Wild Card, and starts each session with its own Bennies.", ""],
  ["dl-edge-damned", "Damned", "Legendary", "Legendary", "Wild Card, Spirit d6+, Reputation", "If killed, the character automatically returns as Harrowed. After returning, this Edge can become an additional Harrowed Edge.", ""],
  ["dl-edge-fast-as-lightning", "Fast as Lightning", "Legendary", "Legendary", "Agility d10+, Quick", "Character can take a fourth action. Maximum Multi-Action Penalty increases accordingly.", ""],
  ["dl-edge-right-hand-of-the-devil", "Right Hand of the Devil", "Legendary", "Legendary", "Trademark Weapon, Shooting/Fighting/Athletics d10+", "Chosen favored weapon becomes a relic and deals one extra damage die. The benefit is tied to the weapon.", "Required"],
  ["dl-edge-true-grit", "True Grit", "Legendary", "Legendary", "Spirit d10+, Grit", "Ignores Fear check penalties and may reroll on the Fear Effects Table after failing.", ""],
  ["dl-edge-grade-2", "Grade 2", "Organization", "Seasoned", "Agent", "Character is already an Agent Grade 2. Grants mnemomizer, possible Gatling upgrade, three Favors, and broader supernatural knowledge.", ""],
  ["dl-edge-man-of-a-thousand-faces", "Man of a Thousand Faces", "Organization", "Seasoned", "Agent, Performance d8+", "Improves Performance rolls to impersonate a general type; more specific impersonations still carry penalties. Disguise kit helps offset penalties.", ""],
  ["dl-edge-true-believer", "True Believer", "Arcane", "Novice", "Spirit d10+, Arcane Background (Blessed), Faith d6+", "Free reroll on Faith rolls.", ""],
  ["dl-edge-flock", "Flock", "Arcane", "Veteran", "Arcane Background (Blessed), Persuasion d8+", "Grants five follower Allies using Townsfolk-style stats. Lost followers are replaced over time. Can be taken repeatedly at Legendary.", "Required"],
  ["dl-edge-superior-kung-fu", "Superior Kung Fu", "Arcane", "Novice", "Spirit d6+, Arcane Background (Chi Master), Fighting d8+", "Choose one kung fu style each time the Edge is taken. The character can assume one known style as a free action at the start of their turn.", "Required"],
  ["dl-edge-celestial-kung-fu", "Celestial Kung Fu", "Arcane", "Veteran", "Spirit d8+, Superior Kung Fu, Fighting d10+", "Grants another Superior Kung Fu style and allows two styles to be active at once.", "Required"],
  ["dl-edge-cat-eyes", "Cat Eyes", "Arcane", "Novice", "Harrowed", "Ignores Dim and Dark lighting penalties.", ""],
  ["dl-edge-improved-cat-eyes", "Improved Cat Eyes", "Arcane", "Seasoned", "Cat Eyes, Harrowed", "Ignores all lighting penalties.", ""],
  ["dl-edge-chill-o-the-grave", "Chill o’ the Grave", "Arcane", "Seasoned", "Harrowed", "Spend a Benny and an action to make living creatures in a Large Blast Template centered on the Harrowed Vulnerable unless protected from cold.", ""],
  ["dl-edge-claws", "Claws", "Arcane", "Novice", "Harrowed", "Gains retractable claws dealing Str+d6. Extending or retracting is a free action.", ""],
  ["dl-edge-improved-claws", "Improved Claws", "Arcane", "Veteran", "Claws, Harrowed", "Claws improve to Str+d8 with AP 2.", ""],
  ["dl-edge-ghost", "Ghost", "Arcane", "Heroic", "Harrowed", "Can become incorporeal at the start of turn as a free action. While ghosted, visible but intangible, Distracted, and still affected by magic.", ""],
  ["dl-edge-hellfire", "Hellfire", "Arcane", "Heroic", "Harrowed", "Once per turn, use an action to attack with Athletics in a Cone Template for fire damage; targets may Evade.", ""],
  ["dl-edge-implacable", "Implacable", "Arcane", "Heroic", "Harrowed", "Can take one extra Wound before Incapacitation. Stacks with Tough as Nails style Edges.", "Required"],
  ["dl-edge-infest", "Infest", "Arcane", "Novice", "Harrowed", "Spend a Benny and an action to control an existing nearby insect swarm for about five minutes.", ""],
  ["dl-edge-soul-eater", "Soul Eater", "Arcane", "Veteran", "Harrowed", "After causing a Wound with a barehanded/claw Fighting attack, make a Spirit roll at a penalty to heal one Wound or one Fatigue.", ""],
  ["dl-edge-spook", "Spook", "Arcane", "Novice", "Harrowed", "As an action, force one visible/nearby target to make a penalized Fear check. Can take Fatigue to affect all targets within 12 inches.", ""],
  ["dl-edge-stitchin", "Stitchin’", "Arcane", "Novice", "Harrowed", "Natural healing rolls happen daily instead of every five days if the Harrowed consumes meat for each attempt.", ""],
  ["dl-edge-improved-stitchin", "Improved Stitchin’", "Arcane", "Veteran", "Harrowed, Stitchin’", "Natural healing rolls happen hourly instead of daily.", ""],
  ["dl-edge-supernatural-attribute", "Supernatural Attribute", "Arcane", "Novice", "Harrowed", "Raises one chosen attribute by two die types and increases that Trait’s limit, including linked skills. Can be taken once per attribute.", "Required"],
  ["dl-edge-wither", "Wither", "Arcane", "Novice", "Harrowed", "Touch attack with opposed Spirit. On success, lowers target Strength for one hour; raise also lowers Vigor. Does not stack on same target.", ""],
  ["dl-edge-hexslinging", "Hexslinging", "Arcane", "Seasoned", "Arcane Background (Huckster), Shooting d8+", "Grants ammo whammy and lets the huckster make rune-carved hex guns. Certain powers can be cast on/with the hex gun without Multi-Action penalty.", ""],
  ["dl-edge-high-roller", "High Roller", "Arcane", "Seasoned", "Spirit d8+, Arcane Background (Huckster), Spellcasting d6+", "Draw one extra card when Dealing with the Devil.", ""],
  ["dl-edge-improved-high-roller", "Improved High Roller", "Arcane", "Veteran", "High Roller", "Draw two extra cards total when Dealing with the Devil.", ""],
  ["dl-edge-old-hand", "Old Hand", "Arcane", "Heroic", "Arcane Background (Huckster), Spellcasting d10+", "After forming a five-card poker hand for Deal with the Devil, discard up to three cards and redraw.", ""],
  ["dl-edge-whateley-blood", "Whateley Blood", "Arcane", "Novice", "Arcane Background (Huckster)", "Has an unsettling bloodline: social penalty to Persuasion. Can suffer Fatigue for 5 Power Points or a Wound for 10 Power Points as a free action.", ""],
  ["dl-edge-alchemy", "Alchemy", "Arcane", "Seasoned", "Arcane Background (Mad Scientist), Weird Science d8+", "Creates up to three short-lived potions/elixirs, each tying up one Power Point and costing reagents. Potion options cover healing, Trait boost, or Fatigue relief.", ""],
  ["dl-edge-iron-bound", "Iron Bound", "Arcane", "Novice", "Arcane Background (Mad Scientist)", "Starts with a large budget in infernal devices or vehicles and gets a discount from the relevant source later.", ""],
  ["dl-edge-ore-eater", "Ore Eater", "Arcane", "Novice", "Arcane Background (Mad Scientist), Weird Science d6+", "Gains 5 Power Points. Malfunction result 13 becomes ghost rock fever instead of the normal result.", ""],
  ["dl-edge-true-genius", "True Genius", "Arcane", "Novice", "Smarts d8+, Arcane Background (Mad Scientist)", "Spend Bennies to reroll Madness or infernal-device Malfunction Table results, choosing the preferred result.", ""],
  ["dl-edge-fetish", "Fetish", "Arcane", "Novice", "Arcane Background (Shaman), Faith d8+", "Free reroll on Faith rolls while the fetish is available. Replacement can be created with a ritual.", ""],
  ["dl-edge-spirits-favor", "Spirit’s Favor", "Arcane", "Seasoned", "Arcane Background (Shaman), Faith d8+", "Choose one Shaman power each time this Edge is taken. That power can be cast as an action without Multi-Action penalty, once per turn.", "Required"],
  ["dl-edge-lieutenant", "Lieutenant", "Organization", "Seasoned", "Territorial Ranger", "Character is already a Ranger Lieutenant with Chapter 13 knowledge and three Favors.", ""],
  ["dl-edge-like-an-oak", "Like an Oak", "Organization", "Veteran", "Grit, Territorial Ranger", "Allies near the Ranger reduce Fear penalties if the Ranger holds steady. Ranger checks first when the group checks together.", ""],
].map(([id, name, category, rank, requirements, shortSummary, subchoice]) => ({
  id,
  name,
  type: "edge",
  category,
  rank,
  requirements,
  shortSummary,
  source: "Deadlands: The Weird West",
  subchoice,
  isCustom: false,
}));


const SWADE_CORE_HINDRANCE_CATALOG = [
  ["swade-hindrance-all-thumbs","All Thumbs","Minor","-2 to use mechanical or electrical devices."],
  ["swade-hindrance-anemic","Anemic","Minor","-2 Vigor when resisting Fatigue."],
  ["swade-hindrance-arrogant","Arrogant","Major","Tries to dominate rivals and challenge the strongest foe."],
  ["swade-hindrance-bad-eyes","Bad Eyes","Minor or Major","Penalty to Trait rolls dependent on vision; eyewear can negate but may break."],
  ["swade-hindrance-bad-luck","Bad Luck","Major","Starts each session with one fewer Benny."],
  ["swade-hindrance-big-mouth","Big Mouth","Minor","Cannot keep secrets and tends to reveal private information."],
  ["swade-hindrance-blind","Blind","Major","Severe penalty to vision-based tasks; grants a free Edge to offset."],
  ["swade-hindrance-bloodthirsty","Bloodthirsty","Major","Does not take prisoners and tends toward lethal solutions."],
  ["swade-hindrance-cant-swim","Can't Swim","Minor","Penalty to swimming rolls and extremely limited swimming Pace."],
  ["swade-hindrance-cautious","Cautious","Minor","Overplans and avoids rash decisions."],
  ["swade-hindrance-clueless","Clueless","Major","Penalty to Common Knowledge and Notice."],
  ["swade-hindrance-clumsy","Clumsy","Major","Penalty to Athletics and Stealth."],
  ["swade-hindrance-code-of-honor","Code of Honor","Major","Keeps their word and acts according to a strict honorable code."],
  ["swade-hindrance-curious","Curious","Major","Compelled to investigate mysteries and unknowns."],
  ["swade-hindrance-death-wish","Death Wish","Minor","Wants to die after or while completing an epic goal."],
  ["swade-hindrance-delusional","Delusional","Minor or Major","Believes something false or strange that causes trouble."],
  ["swade-hindrance-doubting-thomas","Doubting Thomas","Minor","Does not believe in the supernatural and takes unnecessary risks around it."],
  ["swade-hindrance-driven","Driven","Minor or Major","Has a major goal or belief that drives choices."],
  ["swade-hindrance-elderly","Elderly","Major","Physical penalties but extra skill points at creation."],
  ["swade-hindrance-enemy","Enemy","Minor or Major","Has a recurring nemesis or hostile group."],
  ["swade-hindrance-greedy","Greedy","Minor or Major","Obsessed with wealth or possessions."],
  ["swade-hindrance-habit","Habit","Minor or Major","Addiction or dependency; deprivation can cause Fatigue."],
  ["swade-hindrance-hard-of-hearing","Hard of Hearing","Minor or Major","Penalty to Notice sounds, or automatic failure if deaf."],
  ["swade-hindrance-heroic","Heroic","Major","Always helps those in need, even at personal risk."],
  ["swade-hindrance-hesitant","Hesitant","Minor","Draws two Action Cards and takes the lowest, except Jokers."],
  ["swade-hindrance-illiterate","Illiterate","Minor","Cannot read or write."],
  ["swade-hindrance-impulsive","Impulsive","Major","Acts before thinking and jumps into danger."],
  ["swade-hindrance-jealous","Jealous","Minor or Major","Covets what others have."],
  ["swade-hindrance-loyal","Loyal","Minor","Loyal to friends and allies, even when costly."],
  ["swade-hindrance-mean","Mean","Minor","-1 to Persuasion rolls."],
  ["swade-hindrance-mild-mannered","Mild Mannered","Minor","-2 to Intimidation rolls."],
  ["swade-hindrance-mute","Mute","Major","Cannot speak."],
  ["swade-hindrance-obese","Obese","Minor","Size +1, Pace -1, running die d4, and lower effective Strength for Minimum Strength checks."],
  ["swade-hindrance-obligation","Obligation","Minor or Major","Owes regular weekly time or service to someone or something."],
  ["swade-hindrance-one-arm","One Arm","Major","-4 to tasks requiring two hands."],
  ["swade-hindrance-one-eye","One Eye","Major","-2 to actions at 5 inches / 10 yards or more."],
  ["swade-hindrance-outsider","Outsider","Minor or Major","Does not fit local society; Persuasion penalty and possible legal/social limits."],
  ["swade-hindrance-overconfident","Overconfident","Major","Believes they can handle anything."],
  ["swade-hindrance-pacifist","Pacifist","Minor or Major","Minor fights only in self-defense; Major will not fight at all."],
  ["swade-hindrance-phobia","Phobia","Minor or Major","Trait penalty in the presence of the feared thing."],
  ["swade-hindrance-poverty","Poverty","Minor","Half starting funds and tends to stay broke."],
  ["swade-hindrance-quirk","Quirk","Minor","Persistent minor foible that annoys or complicates things."],
  ["swade-hindrance-ruthless","Ruthless","Minor or Major","Does what it takes to get their way."],
  ["swade-hindrance-secret","Secret","Minor or Major","Has a dark secret that can cause trouble if revealed."],
  ["swade-hindrance-shamed","Shamed","Minor or Major","Haunted by a past tragedy or failure."],
  ["swade-hindrance-slow","Slow","Minor or Major","Reduced Pace and running die; Major also penalizes Athletics and resisting Athletics."],
  ["swade-hindrance-small","Small","Minor","Size and Toughness reduced by 1."],
  ["swade-hindrance-stubborn","Stubborn","Minor","Insists on their own way and rarely admits mistakes."],
  ["swade-hindrance-suspicious","Suspicious","Minor or Major","Paranoid; Major penalizes Support rolls to aid them."],
  ["swade-hindrance-thin-skinned","Thin Skinned","Minor or Major","Penalty when resisting Taunt attacks."],
  ["swade-hindrance-tongue-tied","Tongue-Tied","Major","Penalty to speech-based Intimidation, Performance, Persuasion, and Taunt."],
  ["swade-hindrance-ugly","Ugly","Minor or Major","Penalty to Persuasion due to appearance."],
  ["swade-hindrance-vengeful","Vengeful","Minor or Major","Seeks payback; Major escalates to physical harm."],
  ["swade-hindrance-vow","Vow","Minor or Major","Sworn oath or cause that creates obligations and risk."],
  ["swade-hindrance-wanted","Wanted","Minor or Major","Wanted by authorities or enemies."],
  ["swade-hindrance-yellow","Yellow","Major","-2 to Fear checks and resisting Intimidation."],
  ["swade-hindrance-young","Young","Minor or Major","Reduced starting attribute/skill points but extra Bennies."]
].map(([id, name, severity, shortSummary]) => ({
  id,
  name,
  type: "hindrance",
  severity,
  shortSummary,
  source: "Savage Worlds Adventure Edition",
  isCustom: false,
  settingAvailability: { swadeCore: true, deadlandsWeirdWest: true },
}));

const SWADE_CORE_EDGE_CATALOG = [
  ["swade-edge-alertness","Alertness","Background","Novice","Novice","+2 to Notice rolls.","",true],
  ["swade-edge-ambidextrous","Ambidextrous","Background","Novice","Novice, Agility d8+","Ignore the off-hand penalty when making Trait rolls.","",true],
  ["swade-edge-arcane-background","Arcane Background","Background","Novice","Novice","Allows access to an Arcane Background from the core rules.","",false],
  ["swade-edge-arcane-resistance","Arcane Resistance","Background","Novice","Novice, Spirit d8+","+2 to resist magical effects; magical damage reduced by 2.","",true],
  ["swade-edge-improved-arcane-resistance","Improved Arcane Resistance","Background","Novice","Novice, Arcane Resistance","+4 to resist magical effects; magical damage reduced by 4.","",true],
  ["swade-edge-aristocrat","Aristocrat","Background","Novice","Novice","+2 to Common Knowledge and networking with the upper class.","",true],
  ["swade-edge-attractive","Attractive","Background","Novice","Novice, Vigor d6+","+1 to Performance and Persuasion when appearance matters.","",true],
  ["swade-edge-very-attractive","Very Attractive","Background","Novice","Novice, Attractive","+2 to Performance and Persuasion when appearance matters.","",true],
  ["swade-edge-berserk","Berserk","Background","Novice","Novice","After being Shaken or Wounded, enters a rage with stronger melee offense and toughness but risks uncontrolled attacks.","",true],
  ["swade-edge-brave","Brave","Background","Novice","Novice, Spirit d6+","+2 to Fear checks and -2 on Fear Table rolls.","",true],
  ["swade-edge-brawny","Brawny","Background","Novice","Novice, Strength d6+, Vigor d6+","Size and Toughness +1; Strength counts one die higher for Encumbrance and Minimum Strength.","",true],
  ["swade-edge-brute","Brute","Background","Novice","Novice, Strength d6+, Vigor d6+","Athletics links to Strength instead of Agility and thrown ranges improve.","",true],
  ["swade-edge-charismatic","Charismatic","Background","Novice","Novice, Spirit d8+","Free reroll when using Persuasion.","",true],
  ["swade-edge-elan","Elan","Background","Novice","Novice, Spirit d8+","+2 when spending a Benny to reroll a Trait roll.","",true],
  ["swade-edge-fame","Fame","Background","Novice","Novice","+1 Persuasion when recognized and better Performance pay.","",true],
  ["swade-edge-famous","Famous","Background","Seasoned","Seasoned, Fame","+2 Persuasion when recognized and much better Performance pay.","",true],
  ["swade-edge-fast-healer","Fast Healer","Background","Novice","Novice, Vigor d8+","+2 to natural healing rolls and checks more often.","",true],
  ["swade-edge-fleet-footed","Fleet-Footed","Background","Novice","Novice, Agility d6+","Pace +2 and running die increases one step.","",true],
  ["swade-edge-linguist","Linguist","Background","Novice","Novice, Smarts d6+","Knows extra languages based on Smarts.","",true],
  ["swade-edge-luck","Luck","Background","Novice","Novice","+1 Benny at the start of each session.","",true],
  ["swade-edge-great-luck","Great Luck","Background","Novice","Novice, Luck","+2 Bennies at the start of each session.","",true],
  ["swade-edge-quick","Quick","Background","Novice","Novice, Agility d8+","May discard and redraw Action Cards of 5 or lower.","",true],
  ["swade-edge-rich","Rich","Background","Novice","Novice","Starts with triple funds and a strong income.","",true],
  ["swade-edge-filthy-rich","Filthy Rich","Background","Novice","Novice, Rich","Starts with five times funds and a much higher income.","",true],
  ["swade-edge-block","Block","Combat","Seasoned","Seasoned, Fighting d8+","+1 Parry and ignore 1 point of Gang Up bonus.","",true],
  ["swade-edge-improved-block","Improved Block","Combat","Veteran","Veteran, Block","+2 Parry and ignore 2 points of Gang Up bonus.","",true],
  ["swade-edge-brawler","Brawler","Combat","Novice","Novice, Strength d8+, Vigor d8+","+1 Toughness and improved unarmed damage.","",true],
  ["swade-edge-bruiser","Bruiser","Combat","Seasoned","Seasoned, Brawler","Further improves unarmed damage and Toughness.","",true],
  ["swade-edge-calculating","Calculating","Combat","Novice","Novice, Smarts d8+","Ignore up to 2 points of penalties on one action with low Action Card.","",true],
  ["swade-edge-combat-reflexes","Combat Reflexes","Combat","Seasoned","Seasoned","+2 Spirit to recover from being Shaken or Stunned.","",true],
  ["swade-edge-counterattack","Counterattack","Combat","Seasoned","Seasoned, Fighting d8+","Free attack against one foe per turn who failed a Fighting roll.","",true],
  ["swade-edge-improved-counterattack","Improved Counterattack","Combat","Veteran","Veteran, Counterattack","Counterattack works against up to three foes per turn.","",true],
  ["swade-edge-dead-shot","Dead Shot","Combat","Novice","Wild Card, Novice, Athletics or Shooting d8+","Once per turn, double ranged or thrown damage when dealt a Joker.","",true],
  ["swade-edge-dodge","Dodge","Combat","Seasoned","Seasoned, Agility d8+","-2 to be hit by ranged attacks.","",true],
  ["swade-edge-improved-dodge","Improved Dodge","Combat","Seasoned","Seasoned, Dodge","+2 to Evasion totals.","",true],
  ["swade-edge-double-tap","Double Tap","Combat","Seasoned","Seasoned, Shooting d6+","+1 to hit and damage when firing no more than RoF 1 per action.","",true],
  ["swade-edge-extraction","Extraction","Combat","Novice","Novice, Agility d8+","One adjacent foe does not get a free attack when you withdraw.","",true],
  ["swade-edge-improved-extraction","Improved Extraction","Combat","Seasoned","Seasoned, Extraction","Up to three adjacent foes do not get free attacks when you withdraw.","",true],
  ["swade-edge-feint","Feint","Combat","Novice","Novice, Fighting d8+","May make a Fighting Test resisted by Smarts instead of Agility.","",true],
  ["swade-edge-first-strike","First Strike","Combat","Novice","Novice, Agility d8+","Free Fighting attack once per round when a foe moves into Reach.","",true],
  ["swade-edge-improved-first-strike","Improved First Strike","Combat","Heroic","Heroic, First Strike","Free Fighting attack against up to three foes moving into Reach.","",true],
  ["swade-edge-free-runner","Free Runner","Combat","Novice","Novice, Agility d8+","Ignore Difficult Ground and gain bonuses in foot chases and climbing.","",true],
  ["swade-edge-frenzy","Frenzy","Combat","Seasoned","Seasoned, Fighting d8+","Roll a second Fighting die for one melee attack as a limited action.","",true],
  ["swade-edge-improved-frenzy","Improved Frenzy","Combat","Veteran","Veteran, Frenzy","Roll a third Fighting die for one melee attack.","",true],
  ["swade-edge-giant-killer","Giant Killer","Combat","Veteran","Veteran","+1d6 damage against creatures three Sizes larger.","",true],
  ["swade-edge-hard-to-kill","Hard to Kill","Combat","Novice","Novice, Spirit d8+","Ignore Wound penalties on Vigor rolls to avoid Bleeding Out.","",true],
  ["swade-edge-harder-to-kill","Harder to Kill","Combat","Veteran","Veteran, Hard to Kill","If the character dies, a die roll may let them survive somehow.","",true],
  ["swade-edge-improved-level-headed","Improved Level Headed","Combat","Seasoned","Seasoned, Level Headed","Draw two additional Action Cards each round and choose which to use.","",true],
  ["swade-edge-improved-nerves-of-steel","Improved Nerves of Steel","Combat","Novice","Novice, Nerves of Steel","Ignore up to two levels of Wound penalties.","",true],
  ["swade-edge-improved-rapid-fire","Improved Rapid Fire","Combat","Veteran","Veteran, Rapid Fire","Increase RoF by 1 for up to two Shooting attacks per turn.","",true],
  ["swade-edge-improvisational-fighter","Improvisational Fighter","Combat","Seasoned","Seasoned, Smarts d6+","Ignore the improvised weapon penalty.","",true],
  ["swade-edge-iron-jaw","Iron Jaw","Combat","Novice","Novice, Vigor d8+","+2 to Soak rolls and to avoid Knockout Blows.","",true],
  ["swade-edge-killer-instinct","Killer Instinct","Combat","Seasoned","Seasoned","Free reroll in opposed Tests initiated by the hero.","",true],
  ["swade-edge-level-headed","Level Headed","Combat","Seasoned","Seasoned, Smarts d8+","Draw an additional Action Card each round and choose which to use.","",true],
  ["swade-edge-marksman","Marksman","Combat","Seasoned","Seasoned, Shooting d8+","Ignore up to 2 points of Range, Cover, or Called Shot penalties with RoF 1 weapons.","",true],
  ["swade-edge-martial-artist","Martial Artist","Combat","Novice","Novice, Fighting d6+","Unarmed Fighting +1; fists and feet count as Natural Weapons and add damage.","",true],
  ["swade-edge-martial-warrior","Martial Warrior","Combat","Seasoned","Seasoned, Martial Artist","Unarmed Fighting +2 and further improves unarmed damage.","",true],
  ["swade-edge-mighty-blow","Mighty Blow","Combat","Novice","Wild Card, Novice, Fighting d8+","Once per turn, double Fighting damage when dealt a Joker.","",true],
  ["swade-edge-nerves-of-steel","Nerves of Steel","Combat","Novice","Novice, Vigor d8+","Ignore one level of Wound penalties.","",true],
  ["swade-edge-no-mercy","No Mercy","Combat","Seasoned","Seasoned","+2 damage when spending a Benny to reroll damage.","",true],
  ["swade-edge-rapid-fire","Rapid Fire","Combat","Seasoned","Seasoned, Shooting d6+","Increase RoF by 1 for one Shooting attack per turn.","",true],
  ["swade-edge-rock-and-roll","Rock and Roll!","Combat","Seasoned","Seasoned, Shooting d8+","Ignore Recoil penalty when firing weapons with RoF 2 or more.","",true],
  ["swade-edge-steady-hands","Steady Hands","Combat","Novice","Novice, Agility d8+","Ignore Unstable Platform penalty and reduce running penalty.","",true],
  ["swade-edge-sweep","Sweep","Combat","Novice","Novice, Strength d8+, Fighting d8+","Fighting roll at -2 to hit all targets in weapon Reach once per turn.","",true],
  ["swade-edge-improved-sweep","Improved Sweep","Combat","Veteran","Veteran, Sweep","Sweep without the -2 penalty.","",true],
  ["swade-edge-trademark-weapon","Trademark Weapon","Combat","Novice","Novice, relevant weapon skill d8","+1 attack and Parry with a specific weapon.","",true],
  ["swade-edge-improved-trademark-weapon","Improved Trademark Weapon","Combat","Seasoned","Seasoned, Trademark Weapon","Trademark Weapon bonus increases to +2.","",true],
  ["swade-edge-two-fisted","Two-Fisted","Combat","Novice","Novice, Agility d8+","Extra Fighting roll with a second melee weapon in the off-hand at no Multi-Action penalty.","",true],
  ["swade-edge-two-gun-kid","Two-Gun Kid","Combat","Novice","Novice, Agility d8+","Extra Shooting or throwing roll with a second ranged weapon in the off-hand at no Multi-Action penalty.","",true],
  ["swade-edge-command","Command","Leadership","Novice","Novice, Smarts d6+","+1 to Extras' Shaken recovery rolls in Command Range.","",true],
  ["swade-edge-command-presence","Command Presence","Leadership","Seasoned","Seasoned, Command","Command Range increases to 10 inches / 20 yards.","",true],
  ["swade-edge-fervor","Fervor","Leadership","Veteran","Veteran, Spirit d8+, Command","+1 to Extras' Fighting rolls in Command Range.","",true],
  ["swade-edge-hold-the-line","Hold the Line!","Leadership","Seasoned","Seasoned, Smarts d8+, Command","+1 Toughness to Extras in Command Range.","",true],
  ["swade-edge-inspire","Inspire","Leadership","Seasoned","Seasoned, Command","Battle roll Supports a chosen Trait roll for everyone in Command Range.","",true],
  ["swade-edge-natural-leader","Natural Leader","Leadership","Seasoned","Seasoned, Spirit d8+, Command","Leadership Edges apply to Wild Cards as well as Extras.","",true],
  ["swade-edge-tactician","Tactician","Leadership","Seasoned","Seasoned, Smarts d8+, Command, Battle d6+","Draw an extra Action Card each turn and assign it to an allied Extra.","",true],
  ["swade-edge-master-tactician","Master Tactician","Leadership","Veteran","Veteran, Tactician","Draw and distribute two extra Action Cards instead of one.","",true],
  ["swade-edge-artificer","Artificer","Arcane","Seasoned","Seasoned, Arcane Background","Allows creation of Arcane Devices.","",true],
  ["swade-edge-channeling","Channeling","Arcane","Seasoned","Seasoned, Arcane Background","Reduce Power Point cost by 1 with a raise on activation.","",true],
  ["swade-edge-concentration","Concentration","Arcane","Seasoned","Seasoned, Arcane Background","Shaken results do not cause Disruption; Stun or Wounds still can.","",true],
  ["swade-edge-extra-effort","Extra Effort","Arcane","Seasoned","Seasoned, Arcane Background (Gifted), Focus d6+","Spend Power Points to temporarily increase Focus.","",true],
  ["swade-edge-gadgeteer","Gadgeteer","Arcane","Seasoned","Seasoned, Arcane Background (Weird Science), Weird Science d6+","Spend 3 Power Points to create a device that replicates another power.","",true],
  ["swade-edge-holy-unholy-warrior","Holy/Unholy Warrior","Arcane","Seasoned","Seasoned, Arcane Background (Miracles), Faith d6+","Spend Power Points for a Soak bonus.","",true],
  ["swade-edge-mentalist","Mentalist","Arcane","Seasoned","Seasoned, Arcane Background (Psionics), Psionics d6+","+2 to opposed Psionics rolls.","",true],
  ["swade-edge-new-powers","New Powers","Arcane","Novice","Novice, Arcane Background","Learn two new powers.","",true],
  ["swade-edge-power-points","Power Points","Arcane","Novice","Novice, Arcane Background","Gain 5 additional Power Points, no more than once per Rank.","",true],
  ["swade-edge-power-surge","Power Surge","Arcane","Novice","Wild Card, Novice, Arcane Background, arcane skill d8+","Recover 10 Power Points when dealt a Joker in combat.","",true],
  ["swade-edge-rapid-recharge","Rapid Recharge","Arcane","Seasoned","Seasoned, Spirit d6+, Arcane Background","Recover 10 Power Points per hour.","",true],
  ["swade-edge-improved-rapid-recharge","Improved Rapid Recharge","Arcane","Veteran","Veteran, Rapid Recharge","Recover 20 Power Points per hour.","",true],
  ["swade-edge-soul-drain","Soul Drain","Arcane","Seasoned","Seasoned, Arcane Background, arcane skill d10+","Recover 5 Power Points for a level of Fatigue.","",false],
  ["swade-edge-wizard","Wizard","Arcane","Seasoned","Seasoned, Arcane Background (Magic), Spellcasting d6+","Spend 1 extra Power Point to change a spell's Trapping.","",true],
  ["swade-edge-ace","Ace","Professional","Novice","Novice, Agility d8+","Spend Bennies to Soak vehicle damage and ignore up to 2 points of vehicle operation penalties.","",true],
  ["swade-edge-acrobat","Acrobat","Professional","Novice","Novice, Agility d8+, Athletics d8+","Free reroll on acrobatic Athletics attempts.","",true],
  ["swade-edge-combat-acrobat","Combat Acrobat","Professional","Seasoned","Seasoned, Acrobat","Attacks against the character suffer -1 when they can move freely.","",true],
  ["swade-edge-assassin","Assassin","Professional","Novice","Novice, Agility d8+, Fighting d6+, Stealth d8+","+2 damage against Vulnerable foes or when the assassin has The Drop.","",true],
  ["swade-edge-investigator","Investigator","Professional","Novice","Novice, Smarts d8+, Research d8+","+2 to Research and clue-related Notice rolls.","",true],
  ["swade-edge-jack-of-all-trades","Jack-of-All-Trades","Professional","Novice","Novice, Smarts d10+","Temporarily gains d4 in an untrained Smarts-based skill, or d6 with a raise.","",true],
  ["swade-edge-mcgyver","McGyver","Professional","Novice","Novice, Smarts d6+, Repair d6+, Notice d8+","Quickly creates improvised devices from available scraps.","",true],
  ["swade-edge-mr-fix-it","Mr. Fix It","Professional","Novice","Novice, Repair d8+","+2 to Repair rolls; repairs take less time with a raise.","",true],
  ["swade-edge-scholar","Scholar","Professional","Novice","Novice, Research d8+","+2 to one knowledge-related skill.","",true],
  ["swade-edge-soldier","Soldier","Professional","Novice","Novice, Strength d6+, Vigor d6+","Strength counts one die higher for Encumbrance and Minimum Strength; reroll Vigor against environmental Hazards.","",true],
  ["swade-edge-thief","Thief","Professional","Novice","Novice, Agility d8+, Stealth d6+, Thievery d6+","+1 to Thievery, climbing Athletics, and urban Stealth.","",true],
  ["swade-edge-woodsman","Woodsman","Professional","Novice","Novice, Spirit d6+, Survival d8+","+2 to Survival and wilderness Stealth.","",true],
  ["swade-edge-bolster","Bolster","Social","Novice","Novice, Spirit d8+","After a successful Test, remove Distracted or Vulnerable from an ally.","",true],
  ["swade-edge-common-bond","Common Bond","Social","Novice","Wild Card, Novice, Spirit d8+","May freely give Bennies to other characters.","",true],
  ["swade-edge-connections","Connections","Social","Novice","Novice","Has contacts who can provide aid or favors once per session.","",true],
  ["swade-edge-humiliate","Humiliate","Social","Novice","Novice, Taunt d8+","Free reroll when making Taunt Tests.","",true],
  ["swade-edge-menacing","Menacing","Social","Novice","Novice, Bloodthirsty / Mean / Ruthless / Ugly","+2 to Intimidation using bad looks or attitude.","",true],
  ["swade-edge-provoke","Provoke","Social","Novice","Novice, Taunt d6+","With a raise on Taunt, make the target worse at affecting others.","",true],
  ["swade-edge-rabble-rouser","Rabble-Rouser","Social","Seasoned","Seasoned, Spirit d8+","Intimidation or Taunt Test against all foes in a Medium Blast Template once per turn.","",true],
  ["swade-edge-reliable","Reliable","Social","Novice","Novice, Spirit d8+","Free reroll when making Support rolls.","",true],
  ["swade-edge-retort","Retort","Social","Novice","Novice, Taunt d6+","A raise when resisting Taunt or Intimidation makes the foe Distracted.","",true],
  ["swade-edge-streetwise","Streetwise","Social","Novice","Novice, Smarts d6+","+2 to Common Knowledge and criminal networking.","",true],
  ["swade-edge-strong-willed","Strong Willed","Social","Novice","Novice, Spirit d8+","+2 to resist Smarts or Spirit-based Tests.","",true],
  ["swade-edge-iron-will","Iron Will","Social","Novice","Novice, Strong Willed","+4 to resist Smarts or Spirit-based Tests.","",true],
  ["swade-edge-work-the-room","Work the Room","Social","Novice","Novice, Spirit d8+","Roll a second die when Supporting via Performance or Persuasion and apply it to another ally.","",true],
  ["swade-edge-work-the-crowd","Work the Crowd","Social","Seasoned","Seasoned, Work the Room","Work the Room can apply to up to two additional allies.","",true],
  ["swade-edge-beast-bond","Beast Bond","Weird","Novice","Novice","May spend Bennies for animals under the hero's control.","",true],
  ["swade-edge-beast-master","Beast Master","Weird","Novice","Novice, Spirit d8+","Animals like the hero and the hero has a pet, subject to GM approval.","",true],
  ["swade-edge-champion","Champion","Weird","Novice","Novice, Spirit d8+, Fighting d6+","+2 damage versus supernaturally evil creatures.","",true],
  ["swade-edge-chi","Chi","Weird","Veteran","Veteran, Martial Warrior","Once per combat, use a Chi Point to reroll an attack, force an enemy attack reroll, or add damage to an unarmed attack.","",true],
  ["swade-edge-danger-sense","Danger Sense","Weird","Novice","Novice","Notice roll at +2 to sense ambushes or similar danger.","",true],
  ["swade-edge-healer","Healer","Weird","Novice","Novice, Spirit d8+","+2 to Healing rolls, magical or mundane.","",true],
  ["swade-edge-liquid-courage","Liquid Courage","Weird","Novice","Novice, Vigor d8+","Alcohol boosts Vigor and ignores one Wound penalty level, but penalizes Agility, Smarts, and linked skills.","",true],
  ["swade-edge-scavenger","Scavenger","Weird","Novice","Novice, Luck","Once per encounter, find or remember a needed item or resource.","",true],
  ["swade-edge-followers","Followers","Legendary","Legendary","Wild Card, Legendary","Gain five loyal followers.","",true],
  ["swade-edge-professional","Professional","Legendary","Legendary","Legendary, d12 in Trait","Chosen Trait and its limit increase one step.","",true],
  ["swade-edge-expert","Expert","Legendary","Legendary","Legendary, Professional in Trait","Chosen Trait and its limit increase one additional step.","",true],
  ["swade-edge-master","Master","Legendary","Legendary","Wild Card, Legendary, Expert in Trait","Wild Die becomes d10 with the chosen Trait.","",true],
  ["swade-edge-sidekick","Sidekick","Legendary","Legendary","Wild Card, Legendary","Gain a Novice Rank Wild Card sidekick.","",true],
  ["swade-edge-tough-as-nails","Tough as Nails","Legendary","Legendary","Legendary, Vigor d8+","Can take four Wounds before Incapacitation.","",true],
  ["swade-edge-tougher-than-nails","Tougher than Nails","Legendary","Legendary","Legendary, Tough as Nails, Vigor d12+","Can take five Wounds before Incapacitation.","",true],
  ["swade-edge-weapon-master","Weapon Master","Legendary","Legendary","Legendary, Fighting d12+","Parry +1 and Fighting bonus damage die becomes d8.","",true],
  ["swade-edge-master-of-arms","Master of Arms","Legendary","Legendary","Legendary, Weapon Master","Additional Parry +1 and Fighting bonus damage die becomes d10.","",true]
].map(
  ([id, name, category, rank, requirements, shortSummary, subchoice, deadlandsWeirdWest]) => ({
    id,
    name,
    type: "edge",
    category,
    rank,
    requirements,
    shortSummary,
    source: "Savage Worlds Adventure Edition",
    subchoice,
    isCustom: false,
    settingAvailability: {
      swadeCore: true,
      deadlandsWeirdWest,
      reason: deadlandsWeirdWest
        ? ""
        : name === "Soul Drain"
          ? "Deadlands specifically excludes Soul Drain."
          : "Deadlands replaces this with setting-specific Arcane Background rules.",
    },
  }),
);

const HINDRANCE_CATALOG = [
  ...SWADE_CORE_HINDRANCE_CATALOG,
  ...DEADLANDS_HINDRANCE_CATALOG,
];

const EDGE_CATALOG = [
  ...SWADE_CORE_EDGE_CATALOG.filter(
    (edge) => edge.settingAvailability?.deadlandsWeirdWest !== false,
  ),
  ...DEADLANDS_EDGE_CATALOG,
];

const GEAR_CATALOG = [
  {
    id: "winter-coat",
    name: "Winter coat",
    book: "Deadlands",
    weight: 3,
    costCents: 1500,
  },
  {
    id: "watch-standard",
    name: "Watch, standard",
    book: "Deadlands",
    weight: 0.5,
    costCents: 250,
  },
  {
    id: "watch-gold",
    name: "Watch, gold",
    book: "Deadlands",
    weight: 0.5,
    costCents: 1000,
  },
  {
    id: "vocal-unction-elixir",
    name: "Vocal unction elixir",
    book: "Deadlands",
    weight: 0,
    costCents: 5000,
  },
  {
    id: "vapor-mask",
    name: "Vapor mask",
    book: "Deadlands",
    weight: 0.5,
    costCents: 10000,
  },
  {
    id: "trousers-skirt",
    name: "Trousers/skirt",
    book: "Deadlands",
    weight: 2,
    costCents: 200,
  },
  {
    id: "trail-rations-per-day",
    name: "Trail Rations (per day)",
    book: "Deadlands",
    weight: 3,
    costCents: 50,
  },
  {
    id: "tool-kit-weird-science",
    name: "Tool Kit (Weird Science)",
    book: "Deadlands",
    weight: 5,
    costCents: 5000,
  },
  {
    id: "tool-kit",
    name: "Tool kit",
    book: "Deadlands",
    weight: 5,
    costCents: 2500,
  },
  {
    id: "tobacco-smoking-pouch",
    name: "Tobacco, smoking (pouch)",
    book: "Deadlands",
    weight: 1,
    costCents: 50,
  },
  {
    id: "tobacco-chewing-tin",
    name: "Tobacco, chewing (tin)",
    book: "Deadlands",
    weight: 1,
    costCents: 50,
  },
  {
    id: "tactile-desensitizer",
    name: "Tactile desensitizer",
    book: "Deadlands",
    weight: 0,
    costCents: 3000,
  },
  {
    id: "suit-fancy-dress",
    name: "Suit/fancy dress",
    book: "Deadlands",
    weight: 6,
    costCents: 1500,
  },
  {
    id: "stetson",
    name: "Stetson",
    book: "Deadlands",
    weight: 0,
    costCents: 500,
  },
  {
    id: "spring-boots",
    name: "Spring Boots",
    book: "Deadlands",
    weight: 2,
    costCents: 40000,
  },
  {
    id: "speed-load-cylinder",
    name: "Speed-load cylinder",
    book: "Deadlands",
    weight: 0.25,
    costCents: 300,
  },
  {
    id: "spectacles",
    name: "Spectacles",
    book: "Deadlands",
    weight: 0,
    costCents: 500,
  },
  {
    id: "sombrero",
    name: "Sombrero",
    book: "Deadlands",
    weight: 0,
    costCents: 350,
  },
  {
    id: "silver-ore",
    name: "Silver ore",
    book: "Deadlands",
    weight: 1,
    costCents: 2400,
  },
  {
    id: "silk-stockings",
    name: "Silk Stockings",
    book: "Deadlands",
    weight: 0,
    costCents: 100,
  },
  {
    id: "shovel",
    name: "Shovel",
    book: "Deadlands",
    weight: 5,
    costCents: 150,
  },
  {
    id: "shotgun-thong",
    name: "Shotgun thong",
    book: "Deadlands",
    weight: 0,
    costCents: 25,
  },
  {
    id: "shotgun-shells",
    name: "Shotgun shells",
    book: "Deadlands",
    weight: 0.1,
    costCents: 10,
  },
  {
    id: "shot-w-powder",
    name: "Shot w/powder",
    book: "Deadlands",
    weight: 0.2,
    costCents: 5,
  },
  {
    id: "shoes",
    name: "Shoes",
    book: "Deadlands",
    weight: 1,
    costCents: 200,
  },
  {
    id: "shirt-blouse-work",
    name: "Shirt/blouse, work",
    book: "Deadlands",
    weight: 1,
    costCents: 100,
  },
  {
    id: "shirt-blouse-dress",
    name: "Shirt/blouse, dress",
    book: "Deadlands",
    weight: 1,
    costCents: 300,
  },
  {
    id: "scope",
    name: "Scope",
    book: "Deadlands",
    weight: 2,
    costCents: 3000,
  },
  {
    id: "samson-s-elixir",
    name: "Samson's elixir",
    book: "Deadlands",
    weight: 0,
    costCents: 6000,
  },
  {
    id: "saddlebags",
    name: "Saddlebags",
    book: "Deadlands",
    weight: 5,
    costCents: 500,
  },
  {
    id: "saddle",
    name: "Saddle",
    book: "Deadlands",
    weight: 30,
    costCents: 2500,
  },
  {
    id: "rope-10",
    name: 'Rope (10")',
    book: "Deadlands",
    weight: 8,
    costCents: 500,
  },
  {
    id: "rifle-boot",
    name: "Rifle Boot",
    book: "Deadlands",
    weight: 0.5,
    costCents: 300,
  },
  {
    id: "rifle-ammunition-small-38-44-caliber",
    name: "Rifle Ammunition (Small, .38-.44 caliber)",
    book: "Deadlands",
    weight: 0.12,
    costCents: 8,
  },
  {
    id: "rifle-ammunition-large-50-caliber",
    name: "Rifle Ammunition (Large, .50+ caliber)",
    book: "Deadlands",
    weight: 0.16,
    costCents: 10,
  },
  {
    id: "restoration-elixir",
    name: "Restoration elixir",
    book: "Deadlands",
    weight: 0,
    costCents: 10000,
  },
  {
    id: "refined-ghost-rock",
    name: "Refined Ghost Rock",
    book: "Deadlands",
    weight: 1,
    costCents: 15000,
  },
  {
    id: "rattler-detector",
    name: "Rattler detector",
    book: "Deadlands",
    weight: 5,
    costCents: 10000,
  },
  {
    id: "quick-draw-holster",
    name: "Quick-draw holster",
    book: "Deadlands",
    weight: 1,
    costCents: 1100,
  },
  {
    id: "powered-de-moler",
    name: "Powered De-Moler",
    book: "Deadlands",
    weight: 5,
    costCents: 12000,
  },
  {
    id: "playing-cards",
    name: "Playing cards",
    book: "Deadlands",
    weight: 0,
    costCents: 25,
  },
  {
    id: "pistol-ammunition-small-22-38-caliber",
    name: "Pistol Ammunition (Small, .22-.38 caliber)",
    book: "Deadlands",
    weight: 0.06,
    costCents: 4,
  },
  {
    id: "pistol-ammunition-large-40-50-caliber",
    name: "Pistol Ammunition (Large, .40-.50 caliber)",
    book: "Deadlands",
    weight: 0.1,
    costCents: 6,
  },
  {
    id: "pipe",
    name: "Pipe",
    book: "Deadlands",
    weight: 0.75,
    costCents: 200,
  },
  {
    id: "pick",
    name: "Pick",
    book: "Deadlands",
    weight: 12,
    costCents: 200,
  },
  {
    id: "percussion-caps",
    name: "Percussion caps",
    book: "Deadlands",
    weight: 0.17,
    costCents: 1,
  },
  {
    id: "owl-eye-goggles",
    name: "Owl-eye goggles",
    book: "Deadlands",
    weight: 1,
    costCents: 60000,
  },
  {
    id: "noiseless-shoes",
    name: "Noiseless Shoes",
    book: "Deadlands",
    weight: 0,
    costCents: 50000,
  },
  {
    id: "mule",
    name: "Mule",
    book: "Deadlands",
    weight: 0,
    costCents: 5000,
  },
  {
    id: "mess-kit",
    name: "Mess kit",
    book: "Deadlands",
    weight: 3,
    costCents: 200,
  },
  {
    id: "mechanical-mule",
    name: "Mechanical mule",
    book: "Deadlands",
    weight: 800,
    costCents: 150000,
  },
  {
    id: "matches-box-100",
    name: "Matches (box 100)",
    book: "Deadlands",
    weight: 0.25,
    costCents: 50,
  },
  {
    id: "longjohns",
    name: "Longjohns",
    book: "Deadlands",
    weight: 2,
    costCents: 200,
  },
  {
    id: "lockpicks",
    name: "Lockpicks",
    book: "Deadlands",
    weight: 1,
    costCents: 500,
  },
  {
    id: "liquid-courage",
    name: "Liquid courage",
    book: "Deadlands",
    weight: 0,
    costCents: 3000,
  },
  {
    id: "lantern-oil-per-gallon",
    name: "Lantern oil (per gallon)",
    book: "Deadlands",
    weight: 6,
    costCents: 10,
  },
  {
    id: "lantern",
    name: "Lantern",
    book: "Deadlands",
    weight: 4,
    costCents: 250,
  },
  {
    id: "iron-skillet",
    name: "Iron Skillet",
    book: "Deadlands",
    weight: 5,
    costCents: 50,
  },
  {
    id: "horse",
    name: "Horse",
    book: "Deadlands",
    weight: 0,
    costCents: 15000,
  },
  {
    id: "holster",
    name: "Holster",
    book: "Deadlands",
    weight: 1,
    costCents: 300,
  },
  {
    id: "healing-unguent",
    name: "Healing unguent",
    book: "Deadlands",
    weight: 0,
    costCents: 8000,
  },
  {
    id: "hatchet",
    name: "Hatchet",
    book: "Deadlands",
    weight: 2.5,
    costCents: 100,
  },
  {
    id: "hat-periscope",
    name: "Hat Periscope",
    book: "Deadlands",
    weight: 12,
    costCents: 20000,
  },
  {
    id: "harmonica",
    name: "Harmonica",
    book: "Deadlands",
    weight: 0,
    costCents: 50,
  },
  {
    id: "handcuffs",
    name: "Handcuffs",
    book: "Deadlands",
    weight: 3,
    costCents: 350,
  },
  {
    id: "hammer",
    name: "Hammer",
    book: "Deadlands",
    weight: 2,
    costCents: 50,
  },
  {
    id: "gun-belt",
    name: "Gun belt",
    book: "Deadlands",
    weight: 1,
    costCents: 200,
  },
  {
    id: "guitar",
    name: "Guitar",
    book: "Deadlands",
    weight: 6,
    costCents: 800,
  },
  {
    id: "greased-lightning-pill",
    name: "Greased lightning pill",
    book: "Deadlands",
    weight: 0,
    costCents: 7500,
  },
  {
    id: "gold-ore",
    name: "Gold ore",
    book: "Deadlands",
    weight: 1,
    costCents: 32000,
  },
  {
    id: "ghost-rock-ore",
    name: "Ghost rock ore",
    book: "Deadlands",
    weight: 1,
    costCents: 10000,
  },
  {
    id: "gatling-shotgun-ammo-drum",
    name: "Gatling Shotgun Ammo Drum",
    book: "Deadlands",
    weight: 3.5,
    costCents: 500,
  },
  {
    id: "gatling-rifle-ammo-drum",
    name: "Gatling Rifle Ammo Drum",
    book: "Deadlands",
    weight: 7,
    costCents: 500,
  },
  {
    id: "gatling-pistol-ammo-drum",
    name: "Gatling Pistol Ammo Drum",
    book: "Deadlands",
    weight: 3,
    costCents: 200,
  },
  {
    id: "gatling-carbine-ammo-drum",
    name: "Gatling Carbine Ammo Drum",
    book: "Deadlands",
    weight: 7,
    costCents: 500,
  },
  {
    id: "fuse-per-foot",
    name: "Fuse (per foot)",
    book: "Deadlands",
    weight: 0.1,
    costCents: 5,
  },
  {
    id: "file",
    name: "File",
    book: "Deadlands",
    weight: 1,
    costCents: 25,
  },
  {
    id: "fedora",
    name: "Fedora",
    book: "Deadlands",
    weight: 0,
    costCents: 300,
  },
  {
    id: "epitaph-camera",
    name: "Epitaph camera",
    book: "Deadlands",
    weight: 7,
    costCents: 160000,
  },
  {
    id: "electrostatic-belt",
    name: "Electrostatic belt",
    book: "Deadlands",
    weight: 7,
    costCents: 150000,
  },
  {
    id: "dynamite-plinger-3",
    name: "Dynamite Plinger (3)",
    book: "Deadlands",
    weight: 0,
    costCents: 2000,
  },
  {
    id: "duster",
    name: "Duster",
    book: "Deadlands",
    weight: 4,
    costCents: 1000,
  },
  {
    id: "drill",
    name: "Drill",
    book: "Deadlands",
    weight: 2,
    costCents: 200,
  },
  {
    id: "doctor-s-bag",
    name: "Doctor's Bag",
    book: "Deadlands",
    weight: 6,
    costCents: 1000,
  },
  {
    id: "diving-suit",
    name: "Diving Suit",
    book: "Deadlands",
    weight: 45,
    costCents: 200000,
  },
  {
    id: "disguise-kit",
    name: "Disguise kit",
    book: "Deadlands",
    weight: 8,
    costCents: 1000,
  },
  {
    id: "detonator-plunger",
    name: "Detonator, plunger",
    book: "Deadlands",
    weight: 10,
    costCents: 1000,
  },
  {
    id: "detonation-wire-per-50",
    name: "Detonation wire (per 50\u2019)",
    book: "Deadlands",
    weight: 1,
    costCents: 250,
  },
  {
    id: "derby",
    name: "Derby",
    book: "Deadlands",
    weight: 0,
    costCents: 150,
  },
  {
    id: "dehydrated-air-tablet",
    name: "Dehydrated air tablet",
    book: "Deadlands",
    weight: 0,
    costCents: 3000,
  },
  {
    id: "coffee-per-lb",
    name: "Coffee (per lb)",
    book: "Deadlands",
    weight: 1,
    costCents: 25,
  },
  {
    id: "cigar",
    name: "Cigar",
    book: "Deadlands",
    weight: 0,
    costCents: 5,
  },
  {
    id: "canteen",
    name: "Canteen",
    book: "Deadlands",
    weight: 5,
    costCents: 100,
  },
  {
    id: "camera",
    name: "Camera",
    book: "Deadlands",
    weight: 5,
    costCents: 300,
  },
  {
    id: "boots",
    name: "Boots",
    book: "Deadlands",
    weight: 4,
    costCents: 800,
  },
  {
    id: "bonnet",
    name: "Bonnet",
    book: "Deadlands",
    weight: 0,
    costCents: 200,
  },
  {
    id: "blasting-cap",
    name: "Blasting Cap",
    book: "Deadlands",
    weight: 0,
    costCents: 100,
  },
  {
    id: "bedroll",
    name: "Bedroll",
    book: "Deadlands",
    weight: 10,
    costCents: 400,
  },
  {
    id: "barbed-wire-per-yard",
    name: "Barbed wire (per yard)",
    book: "Deadlands",
    weight: 3,
    costCents: 200,
  },
  {
    id: "bacon-per-lb",
    name: "Bacon (per lb)",
    book: "Deadlands",
    weight: 1,
    costCents: 15,
  },
  {
    id: "backpack",
    name: "Backpack",
    book: "Deadlands",
    weight: 3,
    costCents: 200,
  },
  {
    id: "ax-wood",
    name: "Ax, wood",
    book: "Deadlands",
    weight: 5,
    costCents: 200,
  },
  {
    id: "arrow",
    name: "Arrow",
    book: "Deadlands",
    weight: 0.2,
    costCents: 10,
  },
  {
    id: "adrenal-booster",
    name: "Adrenal booster",
    book: "Deadlands",
    weight: 0,
    costCents: 20000,
  },
];
const ARMOR_LOCATIONS = [
  { id: "head", label: "Head" },
  { id: "face", label: "Face" },
  { id: "torso", label: "Torso" },
  { id: "arms", label: "Arms" },
  { id: "legs", label: "Legs" },
  { id: "shield", label: "Shield / carried" },
];
const ARMOR_CATALOG = [
  {
    id: "native-shield-small",
    name: "Native Shield (Small)",
    book: "Deadlands",
    armor: 1,
    weight: 3,
    minStr: "d4",
    costCents: 200,
    location: "shield",
  },
  {
    id: "native-shield-medium",
    name: "Native Shield (Medium)",
    book: "Deadlands",
    armor: 2,
    weight: 5,
    minStr: "d4",
    costCents: 300,
    location: "shield",
  },
  {
    id: "native-armor",
    name: "Native Armor",
    book: "Deadlands",
    armor: 1,
    weight: 3,
    minStr: "d4",
    costCents: 200,
    location: "torso",
  },
  {
    id: "inventors-apron",
    name: "Inventor’s apron",
    book: "Deadlands",
    armor: 1,
    weight: 4,
    minStr: "d4",
    costCents: 4000,
    location: "torso",
  },
  {
    id: "chaps",
    name: "Chaps",
    book: "Deadlands",
    armor: 1,
    weight: 6,
    minStr: "d4",
    costCents: 400,
    location: "legs",
  },
  {
    id: "armored-vest-corset-light",
    name: "Armored vest/corset (light)",
    book: "Deadlands",
    armor: 1,
    weight: 5,
    minStr: "d4",
    costCents: 10000,
    location: "torso",
  },
  {
    id: "armored-vest-corset-heavy",
    name: "Armored vest/corset (heavy)",
    book: "Deadlands",
    armor: 2,
    weight: 20,
    minStr: "d6",
    costCents: 50000,
    location: "torso",
  },
  {
    id: "armored-hat-light",
    name: "Armored hat (light)",
    book: "Deadlands",
    armor: 1,
    weight: 2,
    minStr: "d4",
    costCents: 4000,
    location: "head",
  },
  {
    id: "armored-hat-heavy",
    name: "Armored hat (heavy)",
    book: "Deadlands",
    armor: 2,
    weight: 4,
    minStr: "d4",
    costCents: 8000,
    location: "head",
  },
  {
    id: "armored-duster-light",
    name: "Armored duster (light)",
    book: "Deadlands",
    armor: 1,
    weight: 10,
    minStr: "d6",
    costCents: 20000,
    location: "torso",
  },
  {
    id: "armored-duster-heavy",
    name: "Armored duster (heavy)",
    book: "Deadlands",
    armor: 2,
    weight: 20,
    minStr: "d8",
    costCents: 40000,
    location: "torso",
  },
];
const WEAPON_CATALOG = [
  {
    "id": "ww-brass-knuckles",
    "name": "Brass Knuckles",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 100,
    "costText": "$1",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Does not count as a weapon for Unarmed Defender."
  },
  {
    "id": "ww-bayonet",
    "name": "Bayonet",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 500,
    "costText": "$5",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Str+d6 and Parry +1 if attached to a rifle; Reach 1; two hands."
  },
  {
    "id": "ww-club",
    "name": "Club",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 100,
    "costText": "$1",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-club-war",
    "name": "Club, War",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d6",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 3,
    "weightText": "3",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-club-war-bladed",
    "name": "Club, War (Bladed)",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d8",
    "range": "",
    "ap": "2",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d8",
    "weight": 6,
    "weightText": "6",
    "costCents": 800,
    "costText": "$8",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Parry -1; two hands."
  },
  {
    "id": "ww-knife",
    "name": "Knife",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 200,
    "costText": "$2",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-knife-bowie",
    "name": "Knife, Bowie",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4+1",
    "range": "",
    "ap": "1",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 400,
    "costText": "$4",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-lance-plains-indian",
    "name": "Lance (Plains Indian)",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d6",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 2000,
    "costText": "$20",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Reach 2; mounted combat only."
  },
  {
    "id": "ww-lariat",
    "name": "Lariat",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 3,
    "weightText": "3",
    "costCents": 400,
    "costText": "$4",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Parry -1; Reach 2. Used to initiate a Test with Fighting. Target is Entangled on success, Bound on a raise."
  },
  {
    "id": "ww-saber",
    "name": "Saber",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d6",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 1500,
    "costText": "$15",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Typically used by cavalry."
  },
  {
    "id": "ww-spear",
    "name": "Spear",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d6",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 5,
    "weightText": "5",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Parry +1; Reach 1; two hands."
  },
  {
    "id": "ww-tomahawk",
    "name": "Tomahawk",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d6",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-whip",
    "name": "Whip",
    "book": "Deadlands: The Weird West",
    "category": "Melee Weapons",
    "damage": "Str+d4",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 1000,
    "costText": "$10",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Parry -1; Reach 2. With a raise on the attack roll, the victim is Entangled instead of taking bonus d6 damage."
  },
  {
    "id": "ww-gatling-pistol-36",
    "name": "Gatling Pistol (.36)",
    "book": "Deadlands: The Weird West",
    "category": "Personal Gatling Weapons",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "3",
    "shotsMax": 30,
    "shotsText": "30",
    "minStr": "d4",
    "weight": 5,
    "weightText": "5",
    "costCents": 40000,
    "costText": "$400",
    "ammoType": "gatling-pistol-drum",
    "caliber": ".36",
    "modeOf": "",
    "notes": "Gatling weapons cannot fire single shots and must fire their full Rate of Fire. On a Critical Failure, the weapon jams and needs a Repair roll as an action. Pistol drums can be replaced in one action."
  },
  {
    "id": "ww-gatling-carbine-45",
    "name": "Gatling Carbine (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Personal Gatling Weapons",
    "damage": "2d8",
    "range": "20/40/80",
    "ap": "2",
    "rof": "2",
    "shotsMax": 30,
    "shotsText": "30",
    "minStr": "d6",
    "weight": 12,
    "weightText": "12",
    "costCents": 75000,
    "costText": "$750",
    "ammoType": "gatling-rifle-carbine-drum",
    "caliber": ".45",
    "modeOf": "",
    "notes": "Gatling weapons cannot fire single shots and must fire their full Rate of Fire. On a Critical Failure, the weapon jams and needs a Repair roll as an action. Carbine drums can be replaced in one action."
  },
  {
    "id": "ww-gatling-rifle-45",
    "name": "Gatling Rifle (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Personal Gatling Weapons",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "2",
    "shotsMax": 30,
    "shotsText": "30",
    "minStr": "d8",
    "weight": 17,
    "weightText": "17",
    "costCents": 100000,
    "costText": "$1,000",
    "ammoType": "gatling-rifle-carbine-drum",
    "caliber": ".45",
    "modeOf": "",
    "notes": "Gatling weapons cannot fire single shots and must fire their full Rate of Fire. On a Critical Failure, the weapon jams and needs a Repair roll as an action. Rifle drums can be replaced in one action."
  },
  {
    "id": "ww-gatling-shotgun",
    "name": "Gatling Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Personal Gatling Weapons",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "2",
    "shotsMax": 15,
    "shotsText": "15",
    "minStr": "d8",
    "weight": 15,
    "weightText": "15",
    "costCents": 100000,
    "costText": "$1,000",
    "ammoType": "gatling-shotgun-drum",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Gatling weapons cannot fire single shots and must fire their full Rate of Fire. On a Critical Failure, the weapon jams and needs a Repair roll as an action. Shotgun drums can be replaced in one action. Shotgun damage varies by range band."
  },
  {
    "id": "ww-gatling-gun-45",
    "name": "Gatling Gun (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Gatling Guns",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "3",
    "shotsMax": 100,
    "shotsText": "100",
    "minStr": "d6",
    "weight": 40,
    "weightText": "40",
    "costCents": 150000,
    "costText": "$1,500",
    "ammoType": "gatling-gun-45",
    "caliber": ".45",
    "modeOf": "",
    "notes": "Mounted on carriage or pintle mount, negating Recoil but possibly restricting firing arc. Early models use a 20-round stick; later models use a 100-round belt. Loading a stick takes one action. Loading a belt takes two actions. Gatling weapons cannot fire single shots and must fire their full Rate of Fire. On a Critical Failure, the weapon jams and needs a Repair roll as an action."
  },
  {
    "id": "ww-derringer-41",
    "name": "Derringer (.41)",
    "book": "Deadlands: The Weird West",
    "category": "Derringers & Pepperboxes",
    "damage": "2d4",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": 2,
    "shotsText": "2",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 500,
    "costText": "$5",
    "ammoType": "pistol-large",
    "caliber": ".41",
    "modeOf": "",
    "notes": "-2 to be Noticed if hidden."
  },
  {
    "id": "ww-english-1840-model-36",
    "name": "English 1840 Model (.36)",
    "book": "Deadlands: The Weird West",
    "category": "Derringers & Pepperboxes",
    "damage": "2d6-1",
    "range": "5/10/20",
    "ap": "1",
    "rof": "1",
    "shotsMax": 8,
    "shotsText": "8",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 500,
    "costText": "$5",
    "ammoType": "pistol-small",
    "caliber": ".36",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-rupertus-pepperbox-22",
    "name": "Rupertus Pepperbox (.22)",
    "book": "Deadlands: The Weird West",
    "category": "Derringers & Pepperboxes",
    "damage": "2d4",
    "range": "5/10/20",
    "ap": "",
    "rof": "1",
    "shotsMax": 8,
    "shotsText": "8",
    "minStr": "d6",
    "weight": 1,
    "weightText": "1",
    "costCents": 600,
    "costText": "$6",
    "ammoType": "pistol-small",
    "caliber": ".22",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-wesson-dagger-pistol-41",
    "name": "Wesson Dagger-Pistol (.41)",
    "book": "Deadlands: The Weird West",
    "category": "Derringers & Pepperboxes",
    "damage": "2d4",
    "range": "5/10/20",
    "ap": "",
    "rof": "1",
    "shotsMax": 2,
    "shotsText": "2",
    "minStr": "d6",
    "weight": 1,
    "weightText": "1",
    "costCents": 600,
    "costText": "$6",
    "ammoType": "pistol-large",
    "caliber": ".41",
    "modeOf": "",
    "notes": "A knife blade dealing Str+d4 damage juts out from between the barrels."
  },
  {
    "id": "ww-colt-army-44",
    "name": "Colt Army (.44)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6+1",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 1200,
    "costText": "$12",
    "ammoType": "pistol-large",
    "caliber": ".44",
    "modeOf": "",
    "notes": "Older versions are cap and ball weapons with Reload 3 and cost $10."
  },
  {
    "id": "ww-colt-buntline-special-45",
    "name": "Colt Buntline Special (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6+1",
    "range": "15/30/60",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d6",
    "weight": 3,
    "weightText": "3",
    "costCents": 50000,
    "costText": "$500",
    "ammoType": "pistol-large",
    "caliber": ".45",
    "modeOf": "",
    "notes": "16-inch barrel and detachable shoulder stock. Must be ordered direct from Colt. Does not benefit from quick-draw holsters."
  },
  {
    "id": "ww-colt-dragoon-44",
    "name": "Colt Dragoon (.44)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6+1",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 4,
    "weightText": "4",
    "costCents": 1100,
    "costText": "$11",
    "ammoType": "pistol-large",
    "caliber": ".44",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-colt-navy-36",
    "name": "Colt Navy (.36)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 3,
    "weightText": "3",
    "costCents": 1000,
    "costText": "$10",
    "ammoType": "pistol-small",
    "caliber": ".36",
    "modeOf": "",
    "notes": "Older versions are cap and ball weapons with Reload 3 and cost $8."
  },
  {
    "id": "ww-colt-peacemaker-45",
    "name": "Colt Peacemaker (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6+1",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 4,
    "weightText": "4",
    "costCents": 1500,
    "costText": "$15",
    "ammoType": "pistol-large",
    "caliber": ".45",
    "modeOf": "",
    "notes": "Also known as the Colt Single-Action Army."
  },
  {
    "id": "ww-lemat-revolver-40",
    "name": "LeMat Revolver (.40)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 9,
    "shotsText": "9",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "pistol-large",
    "caliber": ".40",
    "modeOf": "",
    "notes": "Includes a 20-gauge shotgun barrel mounted under the pistol. Switching between revolver and shotgun mode is a free action."
  },
  {
    "id": "ww-lemat-revolver-shotgun-barrel-20-ga",
    "name": "LeMat Revolver Shotgun Barrel (20-ga)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Single-Action",
    "damage": "1-3d6",
    "range": "5/10/20",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "shotgun-20ga",
    "caliber": "20-ga",
    "modeOf": "LeMat Revolver (.40)",
    "notes": "Alternate mode of the LeMat Revolver. Switching between revolver and shotgun mode is a free action. Shotgun damage varies by range band."
  },
  {
    "id": "ww-colt-frontier-44-40",
    "name": "Colt Frontier (.44-40)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Double-Action",
    "damage": "2d6+1",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 1500,
    "costText": "$15",
    "ammoType": "44-40",
    "caliber": ".44-40",
    "modeOf": "",
    "notes": "Also known as the Double-Action Army. Ammunition may be shared with the Winchester '73."
  },
  {
    "id": "ww-colt-lightning-38",
    "name": "Colt Lightning (.38)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Double-Action",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 1300,
    "costText": "$13",
    "ammoType": "pistol-small",
    "caliber": ".38",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-colt-rainmaker-32",
    "name": "Colt Rainmaker (.32)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Double-Action",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 800,
    "costText": "$8",
    "ammoType": "pistol-small",
    "caliber": ".32",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-colt-thunderer-41",
    "name": "Colt Thunderer (.41)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Double-Action",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 1400,
    "costText": "$14",
    "ammoType": "pistol-large",
    "caliber": ".41",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-starr-revolver-44",
    "name": "Starr Revolver (.44)",
    "book": "Deadlands: The Weird West",
    "category": "Revolvers, Double-Action",
    "damage": "2d6+1",
    "range": "12/24/48",
    "ap": "1",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 900,
    "costText": "$9",
    "ammoType": "pistol-large",
    "caliber": ".44",
    "modeOf": "",
    "notes": "Older versions are cap and ball weapons with Reload 3 and cost $7."
  },
  {
    "id": "ww-sharps-55-57",
    "name": "Sharps '55 (.57)",
    "book": "Deadlands: The Weird West",
    "category": "Carbines",
    "damage": "2d8",
    "range": "20/40/80",
    "ap": "2",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 8,
    "weightText": "8",
    "costCents": 1800,
    "costText": "$18",
    "ammoType": "rifle-large",
    "caliber": ".57",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-spencer-56",
    "name": "Spencer (.56)",
    "book": "Deadlands: The Weird West",
    "category": "Carbines",
    "damage": "2d8",
    "range": "20/40/80",
    "ap": "2",
    "rof": "1",
    "shotsMax": 7,
    "shotsText": "7",
    "minStr": "d4",
    "weight": 8,
    "weightText": "8",
    "costCents": 1500,
    "costText": "$15",
    "ammoType": "rifle-large",
    "caliber": ".56",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-lemat-carbine-42",
    "name": "LeMat Carbine (.42)",
    "book": "Deadlands: The Weird West",
    "category": "Carbines",
    "damage": "2d8",
    "range": "20/40/80",
    "ap": "1",
    "rof": "1",
    "shotsMax": 9,
    "shotsText": "9",
    "minStr": "d6",
    "weight": 9,
    "weightText": "9",
    "costCents": 3500,
    "costText": "$35",
    "ammoType": "rifle-small",
    "caliber": ".42",
    "modeOf": "",
    "notes": "Includes a 20-gauge shotgun barrel mounted under the rifle. Switching between carbine and shotgun mode is a free action. Carbine and shotgun are cap and ball weapons with Reload 3."
  },
  {
    "id": "ww-lemat-carbine-shotgun-barrel-20-ga",
    "name": "LeMat Carbine Shotgun Barrel (20-ga)",
    "book": "Deadlands: The Weird West",
    "category": "Carbines",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 9,
    "weightText": "9",
    "costCents": 3500,
    "costText": "$35",
    "ammoType": "shotgun-20ga",
    "caliber": "20-ga",
    "modeOf": "LeMat Carbine (.42)",
    "notes": "Alternate mode of the LeMat Carbine. Switching between carbine and shotgun mode is a free action. Carbine and shotgun are cap and ball weapons with Reload 3. Shotgun damage varies by range band."
  },
  {
    "id": "ww-ballard-72-56",
    "name": "Ballard '72 (.56)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 11,
    "weightText": "11",
    "costCents": 2400,
    "costText": "$24",
    "ammoType": "rifle-large",
    "caliber": ".56",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-bullard-express-50",
    "name": "Bullard Express (.50)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d10",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 11,
    "shotsText": "11",
    "minStr": "d8",
    "weight": 11,
    "weightText": "11",
    "costCents": 3000,
    "costText": "$30",
    "ammoType": "rifle-large",
    "caliber": ".50",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-colt-paterson-model-36-69",
    "name": "Colt-Paterson Model '36 (.69)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d10",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 7,
    "shotsText": "7",
    "minStr": "d8",
    "weight": 12,
    "weightText": "12",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "rifle-large",
    "caliber": ".69",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-enfield-musket-58",
    "name": "Enfield Musket (.58)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8",
    "range": "12/24/48",
    "ap": "2",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 9,
    "weightText": "9",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "rifle-large",
    "caliber": ".58",
    "modeOf": "",
    "notes": "Reload 3; black powder weapon."
  },
  {
    "id": "ww-evans-old-model-sporter-44",
    "name": "Evans Old Model Sporter (.44)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 34,
    "shotsText": "34",
    "minStr": "d6",
    "weight": 12,
    "weightText": "12",
    "costCents": 3000,
    "costText": "$30",
    "ammoType": "rifle-small",
    "caliber": ".44",
    "modeOf": "",
    "notes": "Uses special .44-caliber ammunition made only by the manufacturer. Delivery takes about three weeks if ordered directly."
  },
  {
    "id": "ww-sawed-off-winchester-44-40",
    "name": "Sawed-Off Winchester (.44-40)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8-1",
    "range": "12/24/48",
    "ap": "2",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d4",
    "weight": 4,
    "weightText": "4",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "44-40",
    "caliber": ".44-40",
    "modeOf": "",
    "notes": "Commonly known as a mare's leg. About as easy to conceal as a pistol."
  },
  {
    "id": "ww-sharps-big-50-50",
    "name": "Sharp's Big 50 (.50)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d10",
    "range": "30/60/120",
    "ap": "2",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d8",
    "weight": 11,
    "weightText": "11",
    "costCents": 5000,
    "costText": "$50",
    "ammoType": "rifle-large",
    "caliber": ".50",
    "modeOf": "",
    "notes": "Snapfire; cap and ball firearm; Reload 3."
  },
  {
    "id": "ww-springfield-rifled-musket-58",
    "name": "Springfield Rifled Musket (.58)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8",
    "range": "15/30/60",
    "ap": "",
    "rof": "1",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d6",
    "weight": 11,
    "weightText": "11",
    "costCents": 800,
    "costText": "$8",
    "ammoType": "rifle-large",
    "caliber": ".58",
    "modeOf": "",
    "notes": "Shots are listed as blank in the source table. Reload 3; black powder weapon."
  },
  {
    "id": "ww-winchester-73-44-40",
    "name": "Winchester '73 (.44-40)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8-1",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 15,
    "shotsText": "15",
    "minStr": "d6",
    "weight": 10,
    "weightText": "10",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "44-40",
    "caliber": ".44-40",
    "modeOf": "",
    "notes": "Ammunition may be shared with Colt Frontier (.44-40)."
  },
  {
    "id": "ww-winchester-76-45",
    "name": "Winchester '76 (.45)",
    "book": "Deadlands: The Weird West",
    "category": "Rifles",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "1",
    "shotsMax": 15,
    "shotsText": "15",
    "minStr": "d4",
    "weight": 7,
    "weightText": "7",
    "costCents": 4000,
    "costText": "$40",
    "ammoType": "rifle-large",
    "caliber": ".45",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-colt-revolving-shotgun",
    "name": "Colt Revolving Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Shotguns",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 5,
    "shotsText": "5",
    "minStr": "d6",
    "weight": 10,
    "weightText": "10",
    "costCents": 4500,
    "costText": "$45",
    "ammoType": "shotgun-shells",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Shotguns get +2 Shooting. Damage is 3d6 at Short Range, 2d6 at Medium Range, and 1d6 at Long Range. Cap and ball weapon; Reload 3."
  },
  {
    "id": "ww-double-barrel-shotgun",
    "name": "Double-Barrel Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Shotguns",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 2,
    "shotsText": "2",
    "minStr": "d6",
    "weight": 11,
    "weightText": "11",
    "costCents": 3500,
    "costText": "$35",
    "ammoType": "shotgun-shells",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Shotguns get +2 Shooting. Damage is 3d6 at Short Range, 2d6 at Medium Range, and 1d6 at Long Range. If both barrels are fired at the same target, roll damage once and add +4."
  },
  {
    "id": "ww-sawed-off-double-barrel-shotgun",
    "name": "Sawed-Off Double-Barrel Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Shotguns",
    "damage": "1-3d6",
    "range": "5/10/20",
    "ap": "",
    "rof": "1",
    "shotsMax": 2,
    "shotsText": "2",
    "minStr": "d4",
    "weight": 6,
    "weightText": "6",
    "costCents": 3500,
    "costText": "$35",
    "ammoType": "shotgun-shells",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Shotguns get +2 Shooting. Damage is 3d6 at Short Range, 2d6 at Medium Range, and 1d6 at Long Range. As double-barrel. May be fired in melee using the Savage Worlds ranged weapons in melee rule."
  },
  {
    "id": "ww-single-barrel-shotgun",
    "name": "Single-Barrel Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Shotguns",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d4",
    "weight": 6,
    "weightText": "6",
    "costCents": 2500,
    "costText": "$25",
    "ammoType": "shotgun-shells",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Shotguns get +2 Shooting. Damage is 3d6 at Short Range, 2d6 at Medium Range, and 1d6 at Long Range."
  },
  {
    "id": "ww-winchester-lever-action-shotgun",
    "name": "Winchester Lever-Action Shotgun",
    "book": "Deadlands: The Weird West",
    "category": "Shotguns",
    "damage": "1-3d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 4,
    "shotsText": "4",
    "minStr": "d6",
    "weight": 8,
    "weightText": "8",
    "costCents": 3500,
    "costText": "$35",
    "ammoType": "shotgun-shells",
    "caliber": "12-ga",
    "modeOf": "",
    "notes": "Shotguns get +2 Shooting. Damage is 3d6 at Short Range, 2d6 at Medium Range, and 1d6 at Long Range."
  },
  {
    "id": "ww-bola",
    "name": "Bola",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+1",
    "range": "4/8/16",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d4",
    "weight": 0.5,
    "weightText": "0.5",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "With a raise on the attack roll, the victim is Entangled instead of taking bonus d6 damage."
  },
  {
    "id": "ww-bow",
    "name": "Bow",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "2d6",
    "range": "12/24/48",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 2,
    "weightText": "2",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "arrow",
    "caliber": "",
    "modeOf": "",
    "notes": ""
  },
  {
    "id": "ww-knife-thrown",
    "name": "Knife, Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d4",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d4",
    "weight": 1,
    "weightText": "1",
    "costCents": 200,
    "costText": "$2",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Thrown profile for Knife."
  },
  {
    "id": "ww-knife-bowie-thrown",
    "name": "Knife, Bowie, Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d4+1",
    "range": "2/4/8",
    "ap": "1",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d4",
    "weight": 2,
    "weightText": "2",
    "costCents": 400,
    "costText": "$4",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Thrown profile for Knife, Bowie."
  },
  {
    "id": "ww-lance-plains-indian-thrown",
    "name": "Lance (Plains Indian), Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d6",
    "range": "2/4/8",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 4,
    "weightText": "4",
    "costCents": 2000,
    "costText": "$20",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Reach 2; mounted combat only; may only be thrown from horseback."
  },
  {
    "id": "ww-spear-thrown",
    "name": "Spear, Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d6",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 5,
    "weightText": "5",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Thrown profile for Spear."
  },
  {
    "id": "ww-tomahawk-thrown",
    "name": "Tomahawk, Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d6",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 3,
    "weightText": "3",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Thrown profile for Tomahawk."
  },
  {
    "id": "ww-war-club-thrown",
    "name": "War Club, Thrown",
    "book": "Deadlands: The Weird West",
    "category": "Other Ranged Weapons",
    "damage": "Str+d6",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": 1,
    "shotsText": "1",
    "minStr": "d6",
    "weight": 3,
    "weightText": "3",
    "costCents": 300,
    "costText": "$3",
    "ammoType": "thrown",
    "caliber": "",
    "modeOf": "",
    "notes": "Thrown profile for War Club."
  },
  {
    "id": "ww-dynamite-nitro-1-2-sticks-or-pints",
    "name": "Dynamite/Nitro, 1-2 sticks or pints",
    "book": "Deadlands: The Weird West",
    "category": "Dynamite & Nitroglycerine",
    "damage": "2d6",
    "range": "4/8/16",
    "ap": "",
    "rof": "1",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "",
    "weight": null,
    "weightText": "0.5/1",
    "costCents": null,
    "costText": "$3 per stick or pint",
    "ammoType": "explosive",
    "caliber": "",
    "modeOf": "",
    "notes": "Dynamite and nitroglycerine are Heavy Weapons. Throwing uses Athletics; setting uses Repair. Dynamite costs $3 per stick. Each pint of nitroglycerine acts as one stick of dynamite. Medium Blast Template; +2 damage for 2 sticks or pints."
  },
  {
    "id": "ww-dynamite-nitro-3-4-sticks-or-pints",
    "name": "Dynamite/Nitro, 3-4 sticks or pints",
    "book": "Deadlands: The Weird West",
    "category": "Dynamite & Nitroglycerine",
    "damage": "3d6",
    "range": "3/6/12",
    "ap": "",
    "rof": "1",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "",
    "weight": null,
    "weightText": "1.5/2",
    "costCents": null,
    "costText": "$3 per stick or pint",
    "ammoType": "explosive",
    "caliber": "",
    "modeOf": "",
    "notes": "Dynamite and nitroglycerine are Heavy Weapons. Throwing uses Athletics; setting uses Repair. Dynamite costs $3 per stick. Each pint of nitroglycerine acts as one stick of dynamite. Large Blast Template; +2 damage for 4 sticks or pints."
  },
  {
    "id": "ww-dynamite-nitro-5-6-sticks-or-pints",
    "name": "Dynamite/Nitro, 5-6 sticks or pints",
    "book": "Deadlands: The Weird West",
    "category": "Dynamite & Nitroglycerine",
    "damage": "4d6",
    "range": "2/4/8",
    "ap": "",
    "rof": "1",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "",
    "weight": null,
    "weightText": "2.5/3",
    "costCents": null,
    "costText": "$3 per stick or pint",
    "ammoType": "explosive",
    "caliber": "",
    "modeOf": "",
    "notes": "Dynamite and nitroglycerine are Heavy Weapons. Throwing uses Athletics; setting uses Repair. Dynamite costs $3 per stick. Each pint of nitroglycerine acts as one stick of dynamite. 6-inch radius; +2 damage for 6 sticks or pints."
  },
  {
    "id": "ww-dynamite-nitro-each-additional-stick-or-pint",
    "name": "Dynamite/Nitro, each additional stick or pint",
    "book": "Deadlands: The Weird West",
    "category": "Dynamite & Nitroglycerine",
    "damage": "+2",
    "range": "",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "",
    "weight": null,
    "weightText": "+0.5/1",
    "costCents": null,
    "costText": "$3 per stick or pint",
    "ammoType": "explosive",
    "caliber": "",
    "modeOf": "",
    "notes": "Dynamite and nitroglycerine are Heavy Weapons. Throwing uses Athletics; setting uses Repair. Dynamite costs $3 per stick. Each pint of nitroglycerine acts as one stick of dynamite. Add +0.5 inch radius per additional stick or pint."
  },
  {
    "id": "ww-flamethrower",
    "name": "Flamethrower",
    "book": "Deadlands: The Weird West",
    "category": "Infernal Device Weapons",
    "damage": "3d6",
    "range": "Cone Template",
    "ap": "",
    "rof": "1",
    "shotsMax": 6,
    "shotsText": "6",
    "minStr": "d6",
    "weight": 15,
    "weightText": "15",
    "costCents": 70000,
    "costText": "$700",
    "ammoType": "ghost-rock-fuel",
    "caliber": "",
    "modeOf": "",
    "notes": "Heavy Weapon. Attack may be Evaded. Flammable targets may catch fire. Uses a one-pound chunk of ghost rock as fuel."
  },
  {
    "id": "ww-steam-saw",
    "name": "Steam Saw",
    "book": "Deadlands: The Weird West",
    "category": "Infernal Device Weapons",
    "damage": "2d6+4",
    "range": "Melee",
    "ap": "",
    "rof": "",
    "shotsMax": null,
    "shotsText": "",
    "minStr": "d8",
    "weight": 20,
    "weightText": "20",
    "costCents": 80000,
    "costText": "$800",
    "ammoType": "",
    "caliber": "",
    "modeOf": "",
    "notes": "Steam-powered saw. On a Critical Failure Malfunction, it hits the user instead. Boiler is usually ground-mounted via 20-foot hose; worn boiler weighs 30 pounds and requires ghost steel backpack protection."
  },
  {
    "id": "ww-steam-gatling",
    "name": "Steam Gatling",
    "book": "Deadlands: The Weird West",
    "category": "Infernal Device Weapons",
    "damage": "2d8",
    "range": "24/48/96",
    "ap": "2",
    "rof": "4",
    "shotsMax": 100,
    "shotsText": "100",
    "minStr": "d6",
    "weight": 50,
    "weightText": "50",
    "costCents": 300000,
    "costText": "$3,000",
    "ammoType": "gatling-gun-45",
    "caliber": ".45",
    "modeOf": "",
    "notes": "Standard Gatling gun attached to a high-pressure steam boiler. Gatlings must fire their full Rate of Fire. On a Critical Failure, it jams and needs a Repair roll as an action."
  }
];
const VEHICLE_CATALOG = [
  {
    id: "whirligig-personal",
    name: "Whirligig (Personal)",
    book: "Deadlands",
    costCents: 100000,
  },
  { id: "wagon", name: "Wagon", book: "Deadlands", costCents: 20000 },
  {
    id: "velocipede",
    name: "Velocipede",
    book: "Deadlands",
    costCents: 100000,
  },
  { id: "train-car", name: "Train Car", book: "Deadlands", costCents: 800000 },
  {
    id: "super-gyro",
    name: "Super Gyro",
    book: "Deadlands",
    costCents: 400000,
  },
  {
    id: "submersible-boat",
    name: "Submersible boat",
    book: "Deadlands",
    costCents: 2000000,
  },
  {
    id: "steam-wagon",
    name: "Steam Wagon",
    book: "Deadlands",
    costCents: 150000,
  },
  { id: "steam-cart", name: "Steam Cart", book: "Deadlands", costCents: 80000 },
  { id: "stagecoach", name: "Stagecoach", book: "Deadlands", costCents: 30000 },
  {
    id: "rocket-pack",
    name: "Rocket Pack",
    book: "Deadlands",
    costCents: 210000,
  },
  {
    id: "rail-runner",
    name: "Rail Runner",
    book: "Deadlands",
    costCents: 250000,
  },
  {
    id: "powered-ornithopter",
    name: "Powered Ornithopter",
    book: "Deadlands",
    costCents: 300000,
  },
  {
    id: "paddlewheeler-large",
    name: "Paddlewheeler, Large",
    book: "Deadlands",
    costCents: 5000000,
  },
  {
    id: "paddlewheel-small",
    name: "Paddlewheel, Small",
    book: "Deadlands",
    costCents: 2000000,
  },
  {
    id: "maze-runner",
    name: "Maze Runner",
    book: "Deadlands",
    costCents: 1500000,
  },
  {
    id: "locomotive",
    name: "Locomotive",
    book: "Deadlands",
    costCents: 1500000,
  },
  { id: "carriage", name: "Carriage", book: "Deadlands", costCents: 20000 },
  {
    id: "buckboard-buggy",
    name: "Buckboard/buggy",
    book: "Deadlands",
    costCents: 7500,
  },
  { id: "bateaux", name: "Bateaux", book: "Deadlands", costCents: 5000 },
  { id: "auto-gyro", name: "Auto-Gyro", book: "Deadlands", costCents: 150000 },
  {
    id: "air-carriage",
    name: "Air Carriage",
    book: "Deadlands",
    costCents: 500000,
  },
];

// src/power-catalog.js
// Catalog-backed Deadlands powers. Generated from docs/deadlands_weird_west_powers_catalog.md and kept as classic-script globals.
const ARCANE_BACKGROUND_POWER_PROFILES = {
  "blessed": {
    "id": "blessed",
    "name": "Blessed",
    "arcaneSkill": "Faith",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 3,
    "requiredStartingPowers": [
      "power-holy-symbol"
    ],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-banish",
      "power-barrier",
      "power-beast-friend",
      "power-blind",
      "power-boost-lower-trait",
      "power-confusion",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-dispel",
      "power-divination",
      "power-elemental-manipulation",
      "power-empathy",
      "power-environmental-protection",
      "power-havoc",
      "power-healing",
      "power-holy-symbol",
      "power-light-darkness",
      "power-protection",
      "power-relief",
      "power-resurrection",
      "power-sanctify",
      "power-sloth-speed",
      "power-smite",
      "power-speak-language",
      "power-stun",
      "power-warrior-s-gift"
    ],
    "notes": "Blessed requires Holy Symbol and two more starting powers. Critical Failure on Faith causes Fatigue and ends active powers. Sinnin’ can penalize or remove powers temporarily.",
    "restrictions": {
      "power-detect-conceal-arcana": "Detect only; conceal is not available.",
      "power-light-darkness": "Light only; darkness is not available."
    }
  },
  "chiMaster": {
    "id": "chi-master",
    "name": "Chi Master",
    "arcaneSkill": "Focus",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 3,
    "requiredStartingPowers": [
      "power-deflection"
    ],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-boost-lower-trait",
      "power-burrow",
      "power-curse",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-empathy",
      "power-environmental-protection",
      "power-farsight",
      "power-healing",
      "power-numb",
      "power-protection",
      "power-relief",
      "power-sloth-speed",
      "power-smite",
      "power-wall-walker",
      "power-warrior-s-gift"
    ],
    "notes": "Chi Master requires Deflection and two more starting powers. Beneficial powers become Self range; detrimental powers become Touch range. These range reductions do not grant Limitation discounts.",
    "restrictions": {
      "power-detect-conceal-arcana": "Detect only; conceal is not available.",
      "power-smite": "Hands and feet count as weapons for this power."
    }
  },
  "huckster": {
    "id": "huckster",
    "name": "Huckster",
    "arcaneSkill": "Spellcasting",
    "arcaneSkillAttribute": "Smarts",
    "startingPowerPoints": 10,
    "startingPowerCount": 3,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-ammo-whammy",
      "power-arcane-protection",
      "power-barrier",
      "power-beast-friend",
      "power-blind",
      "power-bolt",
      "power-boost-lower-trait",
      "power-burst",
      "power-confusion",
      "power-damage-field",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-divination",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-havoc",
      "power-illusion",
      "power-intangibility",
      "power-invisibility",
      "power-light-darkness",
      "power-numb",
      "power-object-reading",
      "power-protection",
      "power-puppet",
      "power-sloth-speed",
      "power-slumber",
      "power-sound-silence",
      "power-speak-language",
      "power-stun",
      "power-summon-ally",
      "power-telekinesis",
      "power-teleport",
      "power-trinkets",
      "power-wall-walker"
    ],
    "notes": "Huckster chooses three starting powers. Deal with the Devil can use available powers that are not known powers. Hucksters cannot Short or spend Bennies for Power Points.",
    "restrictions": {}
  },
  "madScientist": {
    "id": "mad-scientist",
    "name": "Mad Scientist",
    "arcaneSkill": "Weird Science",
    "arcaneSkillAttribute": "Smarts",
    "startingPowerPoints": 15,
    "startingPowerCount": 2,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-barrier",
      "power-beast-friend",
      "power-blast",
      "power-blind",
      "power-bolt",
      "power-boost-lower-trait",
      "power-burrow",
      "power-burst",
      "power-confusion",
      "power-damage-field",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-drain-power-points",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-fly",
      "power-growth-shrink",
      "power-havoc",
      "power-healing",
      "power-illusion",
      "power-intangibility",
      "power-invisibility",
      "power-light-darkness",
      "power-mind-wipe",
      "power-numb",
      "power-protection",
      "power-puppet",
      "power-relief",
      "power-sloth-speed",
      "power-slumber",
      "power-smite",
      "power-sound-silence",
      "power-speak-language",
      "power-stun",
      "power-telekinesis",
      "power-teleport",
      "power-wall-walker",
      "power-warrior-s-gift",
      "power-zombie"
    ],
    "notes": "Mad Scientist chooses two starting powers. Name powers as devices, gizmos, elixirs, or inventions. Critical Failure triggers Infernal Device Malfunction.",
    "restrictions": {
      "power-growth-shrink": "Shrink only; growth is not available."
    }
  },
  "shaman": {
    "id": "shaman",
    "name": "Shaman",
    "arcaneSkill": "Faith",
    "arcaneSkillAttribute": "Spirit",
    "startingPowerPoints": 15,
    "startingPowerCount": 2,
    "requiredStartingPowers": [],
    "allowedPowerIds": [
      "power-arcane-protection",
      "power-banish",
      "power-beast-friend",
      "power-blind",
      "power-boost-lower-trait",
      "power-burrow",
      "power-confusion",
      "power-curse",
      "power-darksight",
      "power-deflection",
      "power-detect-conceal-arcana",
      "power-disguise",
      "power-dispel",
      "power-divination",
      "power-drain-power-points",
      "power-elemental-manipulation",
      "power-empathy",
      "power-entangle",
      "power-environmental-protection",
      "power-farsight",
      "power-fear",
      "power-growth-shrink",
      "power-havoc",
      "power-healing",
      "power-holy-symbol",
      "power-intangibility",
      "power-numb",
      "power-protection",
      "power-relief",
      "power-resurrection",
      "power-sanctify",
      "power-shape-change",
      "power-sloth-speed",
      "power-slumber",
      "power-smite",
      "power-speak-language",
      "power-summon-ally",
      "power-teleport",
      "power-wall-walker",
      "power-warrior-s-gift",
      "power-wilderness-walk"
    ],
    "notes": "Shaman chooses two starting powers. If silenced, subtract 2 from Faith rolls.",
    "restrictions": {
      "power-growth-shrink": "Growth only; shrink is not available."
    }
  }
};

const POWER_CATALOG = [
  {
    "id": "power-ammo-whammy",
    "name": "Ammo Whammy",
    "source": "Deadlands",
    "rank": "Seasoned",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Huckster": "Requires Hexslinging Edge."
    },
    "shortSummary": "Hexslinger empowers shots from a hex gun with special shot effects.",
    "variableCostNotes": "Requires Huckster + Hexslinging. Special shot effects are selected per shot; raise can allow two effects. This is effect selection, not variable PP spending.",
    "tags": [
      "huckster",
      "hexslinging",
      "weapon-buff",
      "effect-selection",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Special shot effects are selected per shot. Raise may allow two effects. This is effect selection, not variable PP spending.",
    "manualVariableSpend": false
  },
  {
    "id": "power-arcane-protection",
    "name": "Arcane Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Enemy casters take a penalty to affect the target; damaging powers are reduced by the same amount.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "defense",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-banish",
    "name": "Banish",
    "source": "SWADE Core + Deadlands note",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll to banish extraplanar or similar entities. In Deadlands, Harrowed manitous are made inert temporarily, not destroyed.",
    "variableCostNotes": "Deadlands Harrowed handling.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-barrier",
    "name": "Barrier",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates a short Hardness 10 wall or barrier.",
    "variableCostNotes": "Has power modifiers such as Damage, Hardened, Shaped, and Size, but exact calculator options need manual table verification.",
    "tags": [
      "defense",
      "utility",
      "barrier",
      "manual-cost",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Manual variable spend: verify modifier costs at the table before deducting PP.",
    "manualVariableSpend": true
  },
  {
    "id": "power-beast-friend",
    "name": "Beast Friend",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Communicate with and guide natural animals; cost depends on controlled creatures’ Size.",
    "variableCostNotes": "Variable cost by creature Size and count. Manual table-choice cost; do not use calculator-style variable spend until exact cost options are implemented.",
    "tags": [
      "utility",
      "animal",
      "manual-cost",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Manual variable spend: choose final PP cost from the rulebook/table.",
    "manualVariableSpend": true
  },
  {
    "id": "power-blast",
    "name": "Blast",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts ×2",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Area attack, usually Medium Blast Template, for energy or matter damage.",
    "variableCostNotes": "Area Effect and Damage modifiers.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-blind",
    "name": "Blind",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Inflicts sight penalties that the victim can recover from over turns.",
    "variableCostNotes": "Potential strong/area handling; automate later.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-bolt",
    "name": "Bolt",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts ×2",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Ranged arcane attack for 2d6 damage, 3d6 with a raise.",
    "variableCostNotes": "Damage +2; attack penalties apply normally.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-boost-lower-trait",
    "name": "Boost/Lower Trait",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5 boost / Instant lower",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Boost raises an ally’s Trait temporarily; lower reduces an enemy’s Trait and allows recovery attempts.",
    "variableCostNotes": "Additional Recipients for boost; Strong for lower.",
    "tags": [
      "buff",
      "debuff",
      "trait",
      "additional-recipients",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "Paired power: Boost has duration 5 and Additional Recipients; Lower is hostile/instant and may use Strong.",
    "manualVariableSpend": false
  },
  {
    "id": "power-burrow",
    "name": "Burrow",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target tunnels through earth or similar material and may emerge later.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-burst",
    "name": "Burst",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Cone Template",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Cone-shaped attack for 2d6 damage, 3d6 with a raise.",
    "variableCostNotes": "Damage +2.",
    "tags": [
      "attack"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-confusion",
    "name": "Confusion",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Makes targets Distracted, Vulnerable, or worse depending on result.",
    "variableCostNotes": "Area/Strong modifiers may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-curse",
    "name": "Curse",
    "source": "Deadlands",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Touch",
    "duration": "Permanent",
    "allowedBackgrounds": [
      "Chi Master",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll; victim suffers recurring Fatigue and possible death unless curse is lifted.",
    "variableCostNotes": "Dispel can remove, but each helper gets only one attempt.",
    "tags": [
      "curse",
      "debuff",
      "fatigue",
      "hostile",
      "permanent"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "Permanent hostile curse. Track as an active effect if needed, but it does not use normal maintenance.",
    "manualVariableSpend": false
  },
  {
    "id": "power-damage-field",
    "name": "Damage Field",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates a damaging aura that harms adjacent beings at the end of their turns.",
    "variableCostNotes": "Damage +2.",
    "tags": [
      "attack",
      "damage",
      "aura",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "damage",
        "label": "Damage",
        "costPer": 2,
        "quantityLabel": "damage boost"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-darksight",
    "name": "Darksight",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Allows target to ignore darkness or illumination penalties.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-deflection",
    "name": "Deflection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [
      "Chi Master"
    ],
    "restrictionsByBackground": {},
    "shortSummary": "Foes subtract from attacks against the protected target; raise improves the penalty.",
    "variableCostNotes": "Additional Recipients +1. Main target-count UI test case. Catalog keeps base PP at 3 per the local powers reference; verify at the table if using a different printing or house rule.",
    "tags": [
      "defense",
      "buff",
      "additional-recipients",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-detect-conceal-arcana",
    "name": "Detect/Conceal Arcana",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5 detect / 1 hour conceal",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Blessed": "Detect only; conceal is not available.",
      "Chi Master": "Detect only; conceal is not available."
    },
    "shortSummary": "Detect reveals supernatural beings, objects, and effects. Conceal hides arcane nature.",
    "variableCostNotes": "Additional Recipients +1; Conceal Area Effect and Strong. Blessed and Chi Master are detect-only.",
    "tags": [
      "detection",
      "stealth",
      "utility",
      "additional-recipients",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      },
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "Paired power. Blessed and Chi Master are Detect-only in Deadlands.",
    "manualVariableSpend": false
  },
  {
    "id": "power-disguise",
    "name": "Disguise",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target appears to be someone else; observers may see through it.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-dispel",
    "name": "Dispel",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Negates active powers or magical effects.",
    "variableCostNotes": "Automate as active-power remover later.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-divination",
    "name": "Divination",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Self",
    "duration": "5 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Ask questions of supernatural entities or forces.",
    "variableCostNotes": "Manual notes/questions first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-drain-power-points",
    "name": "Drain Power Points",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed arcane roll drains Power Points from another caster.",
    "variableCostNotes": "Track drained PP and target pool.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-elemental-manipulation",
    "name": "Elemental Manipulation",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Minor manipulation of air, earth, fire, or water.",
    "variableCostNotes": "Utility/manual effect.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-empathy",
    "name": "Empathy",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Read or influence emotions; helps social interaction or animals depending on use.",
    "variableCostNotes": "Social bonus/reminder.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-entangle",
    "name": "Entangle",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Binds or Entangles foes until they break free.",
    "variableCostNotes": "Track Entangled/Bound state later.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-environmental-protection",
    "name": "Environmental Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Touch",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Protects against environmental hazards and similar damaging sources.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "defense",
      "buff",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-farsight",
    "name": "Farsight",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "See far details; raise helps reduce ranged penalties.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-fear",
    "name": "Fear",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Targets make Fear checks; raise worsens result.",
    "variableCostNotes": "Area Effect +2/+3.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-fly",
    "name": "Fly",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target flies at high Pace; raise improves flight speed.",
    "variableCostNotes": "Additional Recipients +2.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 2,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-growth-shrink",
    "name": "Growth/Shrink",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Mad Scientist": "Shrink only; growth is not available.",
      "Shaman": "Growth only; shrink is not available."
    },
    "shortSummary": "Increase or reduce Size by spending Power Points.",
    "variableCostNotes": "Variable cost by Size change. Mad Scientist is shrink-only; Shaman is growth-only. Manual table-choice cost; do not use calculator-style variable spend until exact cost options are implemented.",
    "tags": [
      "buff",
      "size-change",
      "manual-cost",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Manual variable spend: choose final PP cost from the rulebook/table. Mad Scientist is Shrink-only; Shaman is Growth-only in Deadlands.",
    "manualVariableSpend": true
  },
  {
    "id": "power-havoc",
    "name": "Havoc",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Targets in an area are Distracted and may be hurled.",
    "variableCostNotes": "Template/opposed handling manual first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-healing",
    "name": "Healing",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Restores recent Wounds and may handle other recovery with modifiers/timing.",
    "variableCostNotes": "Connect to wound tracker later.",
    "tags": [
      "healing",
      "wounds",
      "recovery"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-holy-symbol",
    "name": "Holy Symbol",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [
      "Blessed"
    ],
    "restrictionsByBackground": {},
    "shortSummary": "Supernaturally evil creatures must pass Spirit to directly physically attack the bearer.",
    "variableCostNotes": "Area Effect +2/+3; Strong +1. Blessed required starting power.",
    "tags": [
      "defense",
      "ward",
      "blessed",
      "area-effect",
      "strong",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      },
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-illusion",
    "name": "Illusion",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates imaginary images or sensory effects.",
    "variableCostNotes": "Size/area manual first.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-intangibility",
    "name": "Intangibility",
    "source": "SWADE Core",
    "rank": "Heroic",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target becomes incorporeal.",
    "variableCostNotes": "Active toggle recommended.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-invisibility",
    "name": "Invisibility",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target becomes difficult to detect and affect.",
    "variableCostNotes": "Additional recipients may be supported depending on source.",
    "tags": [
      "utility",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-light-darkness",
    "name": "Light/Darkness",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Blessed": "Light only; darkness is not available."
    },
    "shortSummary": "Creates or dispels illumination or darkness.",
    "variableCostNotes": "Blessed is light-only.",
    "tags": [
      "utility",
      "light",
      "darkness",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Paired power. Blessed is Light-only in Deadlands.",
    "manualVariableSpend": false
  },
  {
    "id": "power-mind-wipe",
    "name": "Mind Wipe",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Removes or alters memories.",
    "variableCostNotes": "Mad Scientist only among reviewed Deadlands player lists.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-numb",
    "name": "Numb",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Spirit",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster and nearby allies ignore some Wound or Fatigue penalties; raise improves amount and suppresses temporary injuries.",
    "variableCostNotes": "Area is based on caster Spirit in tabletop inches.",
    "tags": [
      "buff",
      "wound-penalty",
      "fatigue",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-object-reading",
    "name": "Object Reading",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Reads psychic impressions from an object’s history.",
    "variableCostNotes": "Huckster only among reviewed Deadlands player lists.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-protection",
    "name": "Protection",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Grants Armor +2, or +4 with a raise.",
    "variableCostNotes": "Additional Recipients +1; More Armor may apply depending on source.",
    "tags": [
      "defense",
      "armor",
      "buff",
      "additional-recipients",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-puppet",
    "name": "Puppet",
    "source": "SWADE Core + Deadlands modifier",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Opposed roll to control a target’s actions.",
    "variableCostNotes": "Deadlands adds Mind Rider +1 modifier.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-relief",
    "name": "Relief",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Removes Fatigue or Shaken; raise can remove Stunned.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "healing",
      "fatigue",
      "shaken",
      "stunned",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-resurrection",
    "name": "Resurrection",
    "source": "SWADE Core",
    "rank": "Heroic",
    "powerPoints": "30",
    "basePowerPoints": 30,
    "range": "Touch",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Brings the dead back to life under strict limits.",
    "variableCostNotes": "High-cost, Marshal-sensitive power.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-sanctify",
    "name": "Sanctify",
    "source": "Deadlands",
    "rank": "Veteran",
    "powerPoints": "10",
    "basePowerPoints": 10,
    "range": "Special",
    "duration": "Until next sunset",
    "allowedBackgrounds": [
      "Blessed",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Long ritual creates sacred ground that harms or deters supernaturally evil creatures entering it.",
    "variableCostNotes": "Four-hour ritual; noncombat location effect.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-shape-change",
    "name": "Shape Change",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Self",
    "duration": "5",
    "allowedBackgrounds": [
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster takes on animal or creature form depending on cost and Rank.",
    "variableCostNotes": "Variable cost by form. Manual table-choice cost; do not use calculator-style variable spend until exact cost options are implemented.",
    "tags": [
      "utility",
      "transformation",
      "manual-cost",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Manual variable spend: choose final PP cost from the rulebook/table.",
    "manualVariableSpend": true
  },
  {
    "id": "power-sloth-speed",
    "name": "Sloth/Speed",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant sloth / 5 speed",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Sloth reduces movement/actions; Speed increases movement/actions.",
    "variableCostNotes": "Track chosen mode.",
    "tags": [
      "buff",
      "debuff",
      "movement",
      "mode-selection"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "Paired power. Track whether Sloth or Speed is being cast.",
    "manualVariableSpend": false
  },
  {
    "id": "power-slumber",
    "name": "Slumber",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts ×5",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Puts targets to sleep if they fail resistance.",
    "variableCostNotes": "Area/Strong may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "strong",
        "label": "Strong",
        "costPer": 1,
        "quantityLabel": "use"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-smite",
    "name": "Smite",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {
      "Chi Master": "Hands and feet count as weapons for this power."
    },
    "shortSummary": "Increases a weapon’s damage by +2, or +4 with a raise.",
    "variableCostNotes": "Additional Recipients +1. Chi Master hands/feet count as weapons.",
    "tags": [
      "buff",
      "weapon-buff",
      "damage",
      "additional-recipients",
      "active-duration"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-sound-silence",
    "name": "Sound/Silence",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "Instant sound / 5 silence",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Creates sound or mutes sound in an area or target.",
    "variableCostNotes": "Track chosen mode.",
    "tags": [
      "utility",
      "sound",
      "silence",
      "mode-selection"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "Paired power. Track whether Sound or Silence is being cast.",
    "manualVariableSpend": false
  },
  {
    "id": "power-speak-language",
    "name": "Speak Language",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "1",
    "basePowerPoints": 1,
    "range": "Smarts",
    "duration": "10 minutes",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Caster can speak and understand languages.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "utility",
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-stun",
    "name": "Stun",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Blessed",
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target is Stunned on failed resistance.",
    "variableCostNotes": "Area Effect may be useful.",
    "tags": [],
    "supportsVariableSpend": true,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [
      {
        "id": "area-effect",
        "label": "Area Effect",
        "costPer": 2,
        "quantityLabel": "template step"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-summon-ally",
    "name": "Summon Ally",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "Special",
    "basePowerPoints": null,
    "range": "Smarts ×2",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Conjures an allied creature; cost depends on ally strength.",
    "variableCostNotes": "Variable cost by ally type. Manual table-choice cost; do not use calculator-style variable spend until exact cost options are implemented.",
    "tags": [
      "summoning",
      "ally",
      "manual-cost",
      "active-duration"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "Manual variable spend: choose final PP cost from the rulebook/table.",
    "manualVariableSpend": true
  },
  {
    "id": "power-telekinesis",
    "name": "Telekinesis",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "5",
    "basePowerPoints": 5,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Moves objects with high effective Strength; raise improves Strength.",
    "variableCostNotes": "Track target/object manually first.",
    "tags": [],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-teleport",
    "name": "Teleport",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "Instant",
    "allowedBackgrounds": [
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Teleports the character a short distance.",
    "variableCostNotes": "Distance/recipients manual first.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": false,
    "supportsMaintenance": false,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-trinkets",
    "name": "Trinkets",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Huckster"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Huckster creates a small mundane item under one pound; fades when duration ends.",
    "variableCostNotes": "Complete +1; Weight +2. Raise changes duration scale to minutes.",
    "tags": [
      "utility"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "complete",
        "label": "Complete",
        "costPer": 1,
        "quantityLabel": "use"
      },
      {
        "id": "weight",
        "label": "Weight",
        "costPer": 2,
        "quantityLabel": "use"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-wall-walker",
    "name": "Wall Walker",
    "source": "SWADE Core",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Chi Master",
      "Huckster",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Target walks on walls or ceilings.",
    "variableCostNotes": "Additional Recipients +1.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-warrior-s-gift",
    "name": "Warrior’s Gift",
    "source": "SWADE Core",
    "rank": "Seasoned",
    "powerPoints": "4",
    "basePowerPoints": 4,
    "range": "Smarts",
    "duration": "5",
    "allowedBackgrounds": [
      "Blessed",
      "Chi Master",
      "Mad Scientist",
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Temporarily grants a Combat Edge.",
    "variableCostNotes": "Requires Edge selection; good subchoice test.",
    "tags": [
      "buff"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-wilderness-walk",
    "name": "Wilderness Walk",
    "source": "Deadlands",
    "rank": "Novice",
    "powerPoints": "2",
    "basePowerPoints": 2,
    "range": "Self",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Shaman"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Shaman shortens long overland travel and hides tracks after walking at least one mile.",
    "variableCostNotes": "Additional Recipients +1; raise improves travel compression.",
    "tags": [
      "additional-recipients"
    ],
    "supportsVariableSpend": true,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [
      {
        "id": "additional-recipients",
        "label": "Additional Recipients",
        "costPer": 1,
        "quantityLabel": "extra target"
      }
    ],
    "notes": "",
    "manualVariableSpend": false
  },
  {
    "id": "power-zombie",
    "name": "Zombie",
    "source": "SWADE Core",
    "rank": "Veteran",
    "powerPoints": "3",
    "basePowerPoints": 3,
    "range": "Smarts",
    "duration": "One hour",
    "allowedBackgrounds": [
      "Mad Scientist"
    ],
    "requiredForBackgrounds": [],
    "restrictionsByBackground": {},
    "shortSummary": "Raises and controls undead from available corpses.",
    "variableCostNotes": "Additional Zombies, Armed, Armor, Mind Rider.",
    "tags": [
      "defense"
    ],
    "supportsVariableSpend": false,
    "supportsActiveToggle": true,
    "supportsMaintenance": true,
    "variableSpendOptions": [],
    "notes": "",
    "manualVariableSpend": false
  }
];

function normalizePowerCatalogText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function powerCatalogSlug(value) {
  return normalizePowerCatalogText(value).replace(/\s+/g, "-");
}

function findPowerCatalogEntryById(id) {
  if (!id) return null;
  const normalizedId = String(id);
  return (
    POWER_CATALOG.find(
      (power) =>
        power.id === normalizedId || power.id.replace(/^power-/, "") === normalizedId,
    ) || null
  );
}

function findPowerCatalogEntryByName(name) {
  const text = normalizePowerCatalogText(name);
  if (!text) return null;
  return (
    POWER_CATALOG.find(
      (power) => normalizePowerCatalogText(power.name) === text,
    ) || null
  );
}

function arcanePowerProfileKey(value) {
  const text = normalizePowerCatalogText(value);
  if (!text) return "";
  if (text.includes("chi master")) return "chiMaster";
  if (text.includes("mad scientist")) return "madScientist";
  if (text.includes("huckster")) return "huckster";
  if (text.includes("shaman")) return "shaman";
  if (text.includes("blessed")) return "blessed";
  return "";
}

function getArcaneBackgroundProfile(character) {
  const background = character?.arcaneBackground;
  const key = arcanePowerProfileKey(
    background?.name || background?.edgeName || background?.key || background,
  );
  return ARCANE_BACKGROUND_POWER_PROFILES[key] || null;
}

function getAllowedPowersForCharacter(character) {
  const profile = getArcaneBackgroundProfile(character);
  if (!profile) return [];
  return POWER_CATALOG.filter((power) => profile.allowedPowerIds.includes(power.id));
}

function powerRankValue(rank) {
  return RANK_ORDER[rank] ?? 0;
}

function rankAllowsPower(characterRank, powerRank) {
  if (!characterRank || !powerRank) return true;
  return powerRankValue(characterRank) >= powerRankValue(powerRank);
}

function powerRestrictionForProfile(power, profile) {
  if (!power || !profile) return "";
  return (
    power.restrictionsByBackground?.[profile.name] ||
    profile.restrictions?.[power.id] ||
    ""
  );
}

function createKnownPowerFromCatalog(catalogPower, character, options = {}) {
  const profile = getArcaneBackgroundProfile(character);
  const restriction = powerRestrictionForProfile(catalogPower, profile);
  const chiMasterSelfRange =
    profile?.id === "chi-master" &&
    /defense|buff|healing/.test((catalogPower.tags || []).join(" "));
  return {
    id: options.id || "character-" + catalogPower.id + "-" + Date.now(),
    catalogId: catalogPower.id,
    name: catalogPower.name,
    source: catalogPower.source,
    arcaneBackground: profile?.name || character?.arcaneBackground?.name || "",
    rank: catalogPower.rank,
    basePowerPoints: catalogPower.basePowerPoints,
    baseCost: catalogPower.powerPoints,
    powerPoints: catalogPower.powerPoints,
    range: chiMasterSelfRange ? "Self" : catalogPower.range,
    originalRange: chiMasterSelfRange ? catalogPower.range : "",
    duration: catalogPower.duration,
    trapping: options.trapping || "",
    shortSummary: catalogPower.shortSummary,
    variableCostNotes: catalogPower.variableCostNotes,
    supportsVariableSpend: Boolean(catalogPower.supportsVariableSpend),
    variableSpendOptions: catalogPower.variableSpendOptions || [],
    modifiers: options.modifiers || [],
    restrictions: restriction,
    notes: options.notes || restriction || "",
    active: Boolean(options.active || options.isActive),
    isActive: Boolean(options.active || options.isActive),
    activeTargets: Array.isArray(options.activeTargets) ? options.activeTargets : [],
    addedReason: options.addedReason || "new-powers-edge",
    isCustom: false,
  };
}

window.ARCANE_BACKGROUND_POWER_PROFILES = ARCANE_BACKGROUND_POWER_PROFILES;
window.POWER_CATALOG = POWER_CATALOG;

// src/arcane.js
const ARCANE_BACKGROUNDS = {
  blessed: {
    key: "blessed",
    edgeName: "Arcane Background: Blessed",
    displayName: "Blessed",
    requirementsText: "Novice, Spirit d6+, Faith d4+",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d6" },
      skills: { Faith: "d4" },
    },
    arcaneSkill: "Faith",
    linkedAttribute: "Spirit",
    startingPowersCount: 3,
    fixedStartingPowers: ["holy symbol"],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Miracles",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Track sins, vows, or belief violations as reminders, not automated penalties.",
      "Do not infer Blessed from religious profession text alone.",
    ],
  },
  chiMaster: {
    key: "chiMaster",
    edgeName: "Arcane Background: Chi Master",
    displayName: "Chi Master",
    requirementsText:
      "Novice, Agility d6+, Spirit d6+, Martial Artist, Focus d4+",
    requirements: {
      rank: "Novice",
      attributes: { agility: "d6", spirit: "d6" },
      edges: ["Martial Artist"],
      skills: { Focus: "d4" },
    },
    arcaneSkill: "Focus",
    linkedAttribute: "Spirit",
    startingPowersCount: 3,
    fixedStartingPowers: ["deflection"],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Gifted",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Beneficial powers are usually self-focused.",
      "Detrimental powers may need touch-range handling.",
    ],
  },
  huckster: {
    key: "huckster",
    edgeName: "Arcane Background: Huckster",
    displayName: "Huckster",
    requirementsText: "Novice, Gambling d6+, Spellcasting d4+",
    requirements: {
      rank: "Novice",
      skills: { Gambling: "d6", Spellcasting: "d4" },
    },
    arcaneSkill: "Spellcasting",
    linkedAttribute: "Smarts",
    startingPowersCount: 3,
    fixedStartingPowers: [],
    playerChoicePowers: 3,
    startingPowerPoints: 10,
    edgeFamily: "Magic",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Keep Dealing with the Devil temporary points separate from normal Power Points.",
      "Hucksters cannot use normal Shorting or Benny-for-Power-Points flow.",
    ],
  },
  madScientist: {
    key: "madScientist",
    edgeName: "Arcane Background: Mad Scientist",
    displayName: "Mad Scientist",
    requirementsText: "Novice, Smarts d8+, Science d6+, Weird Science d4+",
    requirements: {
      rank: "Novice",
      attributes: { smarts: "d8" },
      skills: { Science: "d6", "Weird Science": "d4" },
    },
    arcaneSkill: "Weird Science",
    linkedAttribute: "Smarts",
    startingPowersCount: 2,
    fixedStartingPowers: [],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Weird Science",
    criticalFailure: {
      type: "malfunction",
      effect: "Marshal rolls on the Malfunction Table.",
    },
    notes: [
      "Name powers as devices, gizmos, elixirs, or inventions.",
      "Do not apply normal Fatigue backlash unless your table says to.",
    ],
  },
  shaman: {
    key: "shaman",
    edgeName: "Arcane Background: Shaman",
    displayName: "Shaman",
    requirementsText: "Novice, Spirit d8+, Faith d4+",
    requirements: {
      rank: "Novice",
      attributes: { spirit: "d8" },
      skills: { Faith: "d4" },
    },
    arcaneSkill: "Faith",
    linkedAttribute: "Spirit",
    startingPowersCount: 2,
    fixedStartingPowers: [],
    playerChoicePowers: 2,
    startingPowerPoints: 15,
    edgeFamily: "Miracles",
    criticalFailure: {
      type: "backlash",
      effect: "Gain 1 Fatigue and terminate currently active powers.",
    },
    notes: [
      "Track Old Ways separately as an oath or reminder.",
      "If silenced, remember Faith rolls may be penalized.",
    ],
  },
};

const ARCANE_BACKGROUND_LIST = Object.values(ARCANE_BACKGROUNDS);
const ARCANE_SKILLS = [
  "Faith",
  "Focus",
  "Spellcasting",
  "Weird Science",
  "Psionics",
];

function normalizeArcaneText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function arcaneBackgroundKeyFromText(value) {
  const text = normalizeArcaneText(value);
  if (!text) return "";
  if (text.includes("chi master")) return "chiMaster";
  if (text.includes("mad scientist")) return "madScientist";
  if (text.includes("huckster")) return "huckster";
  if (text.includes("shaman")) return "shaman";
  if (text.includes("blessed")) return "blessed";
  return "";
}

function arcaneBackgroundKeyFromEdgeName(edgeName) {
  const text = normalizeArcaneText(edgeName);
  if (!text) return "";
  if (text.includes("arcane background"))
    return arcaneBackgroundKeyFromText(text);
  return arcaneBackgroundKeyFromText(text);
}

function arcaneBackgroundConfigFromEdge(edgeName) {
  return ARCANE_BACKGROUNDS[arcaneBackgroundKeyFromEdgeName(edgeName)] || null;
}

function isArcaneBackgroundEdge(edgeName) {
  return Boolean(arcaneBackgroundConfigFromEdge(edgeName));
}

function makeArcaneBackgroundState(config) {
  if (!config) return null;
  return {
    key: config.key,
    name: config.displayName,
    edgeName: config.edgeName,
    arcaneSkill: config.arcaneSkill,
    linkedAttribute: config.linkedAttribute,
    edgeFamily: config.edgeFamily,
    requirementsText: config.requirementsText,
  };
}

function makePowerPointResource(config, overrides = {}) {
  const max = Math.max(
    0,
    Math.floor(Number(overrides.max ?? config?.startingPowerPoints ?? 0) || 0),
  );
  const current = Math.max(
    0,
    Math.floor(Number(overrides.current ?? max) || 0),
  );
  return {
    id: "power-points",
    name: "Power Points",
    current: Math.min(current, max || current),
    max,
    source: overrides.source || config?.edgeName || "Manual setup",
    note:
      overrides.note ||
      (config ? `${config.displayName} uses ${config.arcaneSkill}.` : ""),
  };
}

function makeStartingPowers(config) {
  if (!config) return [];
  return [
    ...config.fixedStartingPowers.map((name) => ({
      id: `${config.key}-${normalizeArcaneText(name).replace(/\s+/g, "-")}`,
      name,
      rank: "Novice",
      baseCost: "",
      duration: "",
      active: false,
      source: config.edgeName,
      trapping: "",
      notes: "Fixed starting power.",
      modifiers: [],
      fixed: true,
    })),
    ...Array.from({ length: config.playerChoicePowers }, (_, index) => ({
      id: `${config.key}-choice-${index + 1}`,
      name: "",
      rank: "Novice",
      baseCost: "",
      duration: "",
      active: false,
      source: config.edgeName,
      trapping: "",
      notes: `Player choice ${index + 1}.`,
      modifiers: [],
      fixed: false,
    })),
  ];
}

function makeArcaneReminder(config) {
  if (!config) return null;
  return {
    type: "Arcane Background",
    name: config.displayName,
    text: `${config.criticalFailure.effect} ${config.notes.join(" ")}`,
  };
}

function makeHucksterDeal() {
  return {
    enabled: true,
    anteBennySpent: false,
    selectedPower: "",
    requiredPowerPoints: 0,
    gamblingRollResult: "",
    cardsDrawn: 5,
    pokerHand: "",
    temporaryPowerPoints: 0,
    shortagePenalty: 0,
    leftoverPowerPoints: 0,
    usedJoker: false,
    backfireTriggered: false,
    notes: "",
  };
}

function normalizePowerRecord(power, index = 0, fallbackSource = "") {
  if (typeof power === "string") power = { name: power };
  if (!power || typeof power !== "object") power = {};
  const findCatalogById =
    typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById
      : () => null;
  const findCatalogByName =
    typeof findPowerCatalogEntryByName === "function"
      ? findPowerCatalogEntryByName
      : () => null;
  const catalogEntry =
    findCatalogById(power.catalogId) || findCatalogByName(power.name);
  const basePowerPoints =
    power.basePowerPoints ??
    (Number.isFinite(Number(power.baseCost))
      ? Number(power.baseCost)
      : catalogEntry?.basePowerPoints);
  const source = power.source || catalogEntry?.source || fallbackSource;
  const range = power.range || catalogEntry?.range || "";
  const duration = power.duration || catalogEntry?.duration || "";
  const shortSummary =
    power.shortSummary || power.summary || catalogEntry?.shortSummary || "";
  const variableCostNotes =
    power.variableCostNotes || catalogEntry?.variableCostNotes || "";
  const restrictions =
    power.restrictions ||
    (catalogEntry
      ? Object.values(catalogEntry.restrictionsByBackground || {}).join(" ")
      : "");
  return {
    id: power.id || power.uuid || `power-${index + 1}`,
    catalogId: power.catalogId || catalogEntry?.id || "",
    name: power.name || catalogEntry?.name || "",
    rank: power.rank || catalogEntry?.rank || "Novice",
    basePowerPoints,
    baseCost:
      power.baseCost ?? power.cost ?? power.powerPoints ?? catalogEntry?.powerPoints ?? "",
    powerPoints:
      power.powerPoints ?? power.baseCost ?? power.cost ?? catalogEntry?.powerPoints ?? "",
    range,
    originalRange: power.originalRange || "",
    duration,
    active: Boolean(power.active || power.isActive),
    isActive: Boolean(power.active || power.isActive),
    source,
    arcaneBackground: power.arcaneBackground || "",
    trapping: power.trapping || power.trappings || power.deviceName || "",
    shortSummary,
    variableCostNotes,
    restrictions,
    supportsVariableSpend: Boolean(
      power.supportsVariableSpend || catalogEntry?.supportsVariableSpend,
    ),
    variableSpendOptions: Array.isArray(power.variableSpendOptions)
      ? power.variableSpendOptions
      : catalogEntry?.variableSpendOptions || [],
    notes: power.notes || power.description || "",
    modifiers: Array.isArray(power.modifiers)
      ? power.modifiers
      : Array.isArray(power.powerModifiers)
        ? power.powerModifiers
        : [],
    activeTargets: Array.isArray(power.activeTargets) ? power.activeTargets : [],
    addedReason:
      power.addedReason || (catalogEntry ? "imported" : "custom-homebrew"),
    isCustom: Boolean(power.isCustom || !catalogEntry),
    fixed: Boolean(power.fixed),
  };
}

function normalizeHucksterDeal(deal) {
  if (!deal) return null;
  return {
    ...makeHucksterDeal(),
    ...deal,
    anteBennySpent: Boolean(deal.anteBennySpent),
    cardsDrawn: Math.max(0, Math.floor(Number(deal.cardsDrawn) || 0)),
    requiredPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.requiredPowerPoints) || 0),
    ),
    temporaryPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.temporaryPowerPoints) || 0),
    ),
    shortagePenalty: Math.max(0, Math.floor(Number(deal.shortagePenalty) || 0)),
    leftoverPowerPoints: Math.max(
      0,
      Math.floor(Number(deal.leftoverPowerPoints) || 0),
    ),
    usedJoker: Boolean(deal.usedJoker),
    backfireTriggered: Boolean(deal.backfireTriggered),
  };
}

// src/default-character.js
const defaultCharacter = {
  name: "Dusty McCaw",
  rank: "Novice",
  ancestry: "Human",
  archetype: "Drifter",
  bennies: { current: 2, starting: 2, normalStarting: 3 },
  conviction: 0,
  damage: { wounds: 0, maxWounds: 3, fatigue: 0, maxFatigue: 2 },
  derived: { pace: 5, parry: 4, baseToughness: 6, toughness: 7, armor: 1 },
  armorStrength: "d6",
  weaponStrength: "d6",
  selectedArmorLocation: "best",
  arcaneBackground: null,
  powers: [],
  hucksterDeal: null,
  moneyCents: 2122,
  ammo: {
    "pistol-44-ammo": {
      label: "Pistol ammo (.44)",
      count: 8,
      caliber: ".44",
      kind: "pistol",
    },
    "rifle-44-ammo": {
      label: "Rifle ammo (.44)",
      count: 10,
      caliber: ".44",
      kind: "rifle",
    },
  },
  weapons: [
    {
      id: "colt-army-44",
      name: "Colt Army (.44)",
      damage: "2d6+1",
      range: "12/24/48",
      ap: 1,
      rof: "1",
      shotsMax: 6,
      shotsLoaded: 6,
      ammoType: "pistol-44-ammo",
      notes: "Sidearm. Reload from .44 pistol ammo reserve.",
      weight: 2,
      costCents: 1200,
      minStr: "d4",
      book: "Deadlands",
    },
    {
      id: "knife",
      name: "Knife",
      damage: "Str+d4",
      range: "Melee",
      ap: 0,
      rof: "-",
      shotsMax: null,
      shotsLoaded: null,
      ammoType: null,
      notes: "Melee weapon. No ammunition tracking.",
      weight: 1,
      costCents: 200,
      minStr: "d4",
      book: "Deadlands",
    },
    {
      id: "lariat",
      name: "Lariat",
      damage: "Str",
      range: "Melee",
      ap: 0,
      rof: "-",
      shotsMax: null,
      shotsLoaded: null,
      ammoType: null,
      notes: "-1 Parry, Reach 2. Used to initiate a Fighting Test.",
      weight: 3,
      costCents: 400,
      minStr: "d4",
      book: "Deadlands",
    },
    {
      id: "winchester-73-44-40",
      name: "Winchester ‘73 (.44–40)",
      damage: "2d8-1",
      range: "24/48/96",
      ap: 2,
      rof: "1",
      shotsMax: 15,
      shotsLoaded: 15,
      ammoType: "rifle-44-ammo",
      notes: "Long gun. Reload from .44 rifle ammo reserve.",
      weight: 10,
      costCents: 2500,
      minStr: "d6",
      book: "Deadlands",
    },
  ],
  armorInventory: [
    {
      id: "armored-hat-light-cheap",
      name: "Armored hat (light) (cheap)",
      count: 1,
      armor: 1,
      weight: 2,
      minStr: "d4",
      costCents: 4000,
      book: "Deadlands",
      location: "head",
      equipped: true,
      note: "Starting armor.",
    },
    {
      id: "chaps-cheap",
      name: "Chaps (cheap)",
      count: 1,
      armor: 1,
      weight: 6,
      minStr: "d4",
      costCents: 400,
      book: "Deadlands",
      location: "legs",
      equipped: true,
      note: "Starting armor.",
    },
    {
      id: "native-armor",
      name: "Native Armor",
      count: 1,
      armor: 1,
      weight: 3,
      minStr: "d4",
      costCents: 200,
      book: "Deadlands",
      location: "torso",
      equipped: true,
      note: "Starting armor.",
    },
  ],
  conditions: {
    shaken: false,
    distracted: false,
    vulnerable: false,
    stunned: false,
    prone: false,
    bound: false,
    entangled: false,
    aiming: false,
    defending: false,
    theDrop: false,
    bleedingOut: false,
    diseased: false,
    poisoned: false,
    onHold: false,
    wildAttack: false,
  },
  temporaryConditions: [
    "shaken",
    "distracted",
    "vulnerable",
    "stunned",
    "prone",
    "bound",
    "entangled",
    "aiming",
    "defending",
    "theDrop",
    "onHold",
    "wildAttack",
  ],
  consumables: [
    { id: "trail-rations", name: "Trail rations", count: 4, unit: "days" },
    { id: "matches", name: "Matches", count: 100, unit: "matches" },
    {
      id: "restoration-elixir",
      name: "Restoration elixir",
      count: 1,
      unit: "dose",
    },
    { id: "lantern-oil", name: "Lantern oil", count: 0, unit: "uses" },
    { id: "tobacco", name: "Smoking tobacco", count: 1, unit: "pouch" },
  ],
  inventory: [
    {
      id: "backpack-cheap",
      name: "Backpack (cheap)",
      count: 1,
      note: "Dropped in combat. Contains bedroll, doctor's bag, lantern, rations, canteen, matches, elixir, tobacco, and pipe.",
      weight: 42,
      costCents: 200,
      book: "Deadlands",
    },
    {
      id: "boots-cheap",
      name: "Boots (cheap)",
      count: 1,
      note: "Equipped.",
      weight: 4,
      costCents: 800,
      book: "Deadlands",
    },
    {
      id: "holster",
      name: "Holster",
      count: 1,
      note: "Equipped.",
      weight: 1,
      costCents: 300,
      book: "Deadlands",
    },
    {
      id: "shirt-work-cheap",
      name: "Shirt/blouse, work (cheap)",
      count: 1,
      note: "Equipped.",
      weight: 1,
      costCents: 100,
      book: "Deadlands",
    },
    {
      id: "trousers-cheap",
      name: "Trousers/skirt (cheap)",
      count: 1,
      note: "Equipped.",
      weight: 2,
      costCents: 200,
      book: "Deadlands",
    },
  ],
  vehicles: [],
  reminders: [
    {
      type: "Hindrance",
      name: "Bad Luck",
      text: "Starts each session with one less Benny.",
    },
    {
      type: "Hindrance",
      name: "Cursed",
      text: "GM starts with an extra Benny.",
    },
    {
      type: "Hindrance",
      name: "Elderly",
      text: "Pace -1, and Agility, Strength, and Vigor rolls are at -1.",
    },
    { type: "Edge", name: "Healer", text: "+2 to Healing rolls." },
  ],
  notes: "",
};

// src/tracker.js
const AMMO_CALIBERS_BY_CATALOG_ID = {
  "pistol-ammunition-small-22-38-caliber": [".22", ".32", ".36", ".38"],
  "pistol-ammunition-large-40-50-caliber": [".40", ".41", ".44", ".45", ".50"],
  "rifle-ammunition-small-38-44-caliber": [".38", ".40", ".44", ".45"],
  "rifle-ammunition-large-50-caliber": [".50", ".56", ".57", ".58"],
};

const AMMO_KIND_BY_CATALOG_ID = {
  "pistol-ammunition-small-22-38-caliber": "pistol",
  "pistol-ammunition-large-40-50-caliber": "pistol",
  "rifle-ammunition-small-38-44-caliber": "rifle",
  "rifle-ammunition-large-50-caliber": "rifle",
};

const LEGACY_AMMO_KEY_DEFAULTS = {
  pistolLarge: { kind: "pistol", caliber: ".44" },
  "pistol-ammunition-large-40-50-caliber": { kind: "pistol", caliber: ".44" },
  "pistol-ammunition-small-22-38-caliber": { kind: "pistol", caliber: ".38" },
  rifleSmall: { kind: "rifle", caliber: ".44" },
  "rifle-ammunition-small-38-44-caliber": { kind: "rifle", caliber: ".44" },
  "rifle-ammunition-large-50-caliber": { kind: "rifle", caliber: ".50" },
};

const STRENGTH_DIE_STEPS = ["d4", "d6", "d8", "d10", "d12"];
const ATTRIBUTE_ORDER = ["agility", "smarts", "spirit", "strength", "vigor"];
const EDGE_CATEGORIES = [
  "Background",
  "Combat",
  "Leadership",
  "Professional",
  "Social",
  "Weird",
  "Legendary",
  "Arcane",
  "Organization",
  "Custom",
  "Unknown",
];
const EDGE_RANKS = [
  "Novice",
  "Seasoned",
  "Veteran",
  "Heroic",
  "Legendary",
  "Custom",
  "Unknown",
];
const HINDRANCE_SEVERITIES = [
  "Minor",
  "Major",
  "Minor or Major",
  "Custom",
  "Unknown",
];

const CONSUMABLE_GEAR_CONVERSIONS = {
  "matches-box-100": {
    id: "matches",
    name: "Matches",
    unit: "matches",
    multiplier: 100,
    unitsLabel: "Matches per box",
  },
  "trail-rations-per-day": {
    id: "trail-rations",
    name: "Trail rations",
    unit: "days",
    multiplier: 1,
  },
  "lantern-oil-per-gallon": {
    id: "lantern-oil",
    name: "Lantern oil",
    unit: "uses",
    multiplier: 1,
  },
  "restoration-elixir": {
    id: "restoration-elixir",
    name: "Restoration elixir",
    unit: "dose",
    multiplier: 1,
  },
  "tobacco-smoking-pouch": {
    id: "tobacco-smoking",
    name: "Smoking tobacco",
    unit: "pouches",
    multiplier: 1,
  },
  "tobacco-chewing-tin": {
    id: "tobacco-chewing",
    name: "Chewing tobacco",
    unit: "tins",
    multiplier: 1,
  },
  "liquid-courage": {
    id: "liquid-courage",
    name: "Liquid courage",
    unit: "dose",
    multiplier: 1,
  },
};

let character = loadCharacter();
let saveTimer = null;
let edgeEditingId = "";
let hindranceEditingId = "";
let powerEditingId = "";

const $ = (selector) => document.querySelector(selector);

const els = {
  characterName: $("#characterName"),
  characterSubtitle: $("#characterSubtitle"),
  saveState: $("#saveState"),
  woundsValue: $("#woundsValue"),
  woundPenalty: $("#woundPenalty"),
  woundsNote: $("#woundsNote"),
  fatigueValue: $("#fatigueValue"),
  fatiguePenalty: $("#fatiguePenalty"),
  fatigueNote: $("#fatigueNote"),
  benniesValue: $("#benniesValue"),
  bennyStart: $("#bennyStart"),
  convictionValue: $("#convictionValue"),
  paceValue: $("#paceValue"),
  parryValue: $("#parryValue"),
  toughnessValue: $("#toughnessValue"),
  armorSelect: $("#armorSelect"),
  armorNote: $("#armorNote"),
  armorStrengthPill: $("#armorStrengthPill"),
  weaponStrengthPill: $("#weaponStrengthPill"),
  moneyDisplay: $("#moneyDisplay"),
  moneyInput: $("#moneyInput"),
  addMoneyBtn: $("#addMoneyBtn"),
  spendMoneyBtn: $("#spendMoneyBtn"),
  resourcesList: $("#resourcesList"),
  addManualPowerPointsBtn: $("#addManualPowerPointsBtn"),
  combatStatusResources: $("#combatStatusResources"),
  combatArmorLocations: $("#combatArmorLocations"),
  combatPenaltyTotal: $("#combatPenaltyTotal"),
  combatPenaltySummary: $("#combatPenaltySummary"),
  combatPenaltyBreakdown: $("#combatPenaltyBreakdown"),
  playPowerPointsCard: $("#playPowerPointsCard"),
  playPowerPointsList: $("#playPowerPointsList"),
  playResourcesCard: $("#playResourcesCard"),
  playResourcesList: $("#playResourcesList"),
  playActivePowersCard: $("#playActivePowersCard"),
  playActivePowersList: $("#playActivePowersList"),
  combatHucksterCard: $("#combatHucksterCard"),
  combatHucksterHelper: $("#combatHucksterHelper"),
  combatConsumablesCard: $("#combatConsumablesCard"),
  combatConsumablesList: $("#combatConsumablesList"),
  combatRemindersCard: $("#combatRemindersCard"),
  combatRemindersList: $("#combatRemindersList"),
  keyConditionsList: $("#keyConditionsList"),
  playWeaponList: $("#playWeaponList"),
  playAmmoReserves: $("#playAmmoReserves"),
  characterSummaryName: $("#characterSummaryName"),
  characterDossierSubtitle: $("#characterDossierSubtitle"),
  characterSourceBadge: $("#characterSourceBadge"),
  characterStatusStrip: $("#characterStatusStrip"),
  characterBasicsList: $("#characterBasicsList"),
  attributesList: $("#attributesList"),
  skillsList: $("#skillsList"),
  edgesList: $("#edgesList"),
  hindrancesList: $("#hindrancesList"),
  characterDerivedDetails: $("#characterDerivedDetails"),
  characterArcaneSummary: $("#characterArcaneSummary"),
  characterEquippedSummary: $("#characterEquippedSummary"),
  characterBackgroundSummary: $("#characterBackgroundSummary"),
  showEdgeFormBtn: $("#showEdgeFormBtn"),
  edgeEditorPanel: $("#edgeEditorPanel"),
  edgeEditorTitle: $("#edgeEditorTitle"),
  edgeCatalogSelect: $("#edgeCatalogSelect"),
  edgeNameInput: $("#edgeNameInput"),
  edgeCategoryInput: $("#edgeCategoryInput"),
  edgeRankInput: $("#edgeRankInput"),
  edgeSourceInput: $("#edgeSourceInput"),
  edgeRequirementsInput: $("#edgeRequirementsInput"),
  edgeSubchoiceInput: $("#edgeSubchoiceInput"),
  edgeSummaryInput: $("#edgeSummaryInput"),
  edgeNotesInput: $("#edgeNotesInput"),
  edgeWarningText: $("#edgeWarningText"),
  saveEdgeBtn: $("#saveEdgeBtn"),
  cancelEdgeEditBtn: $("#cancelEdgeEditBtn"),
  showHindranceFormBtn: $("#showHindranceFormBtn"),
  hindranceEditorPanel: $("#hindranceEditorPanel"),
  hindranceEditorTitle: $("#hindranceEditorTitle"),
  hindranceCatalogSelect: $("#hindranceCatalogSelect"),
  hindranceNameInput: $("#hindranceNameInput"),
  hindranceSeverityInput: $("#hindranceSeverityInput"),
  hindranceSourceInput: $("#hindranceSourceInput"),
  hindranceSummaryInput: $("#hindranceSummaryInput"),
  hindranceNotesInput: $("#hindranceNotesInput"),
  hindranceWarningText: $("#hindranceWarningText"),
  saveHindranceBtn: $("#saveHindranceBtn"),
  cancelHindranceEditBtn: $("#cancelHindranceEditBtn"),
  arcaneDetailSummary: $("#arcaneDetailSummary"),
  arcaneRemindersList: $("#arcaneRemindersList"),
  importWarningsList: $("#importWarningsList"),
  longFormNotesList: $("#longFormNotesList"),
  arcaneSummary: $("#arcaneSummary"),
  powersList: $("#powersList"),
  powerSetupNotice: $("#powerSetupNotice"),
  powerCatalogSearch: $("#powerCatalogSearch"),
  powerRankFilter: $("#powerRankFilter"),
  powerValidOnlyInput: $("#powerValidOnlyInput"),
  powerMarshalOverrideInput: $("#powerMarshalOverrideInput"),
  powerCatalogSelect: $("#powerCatalogSelect"),
  powerCatalogWarning: $("#powerCatalogWarning"),
  powerCatalogPreview: $("#powerCatalogPreview"),
  addCatalogPowerBtn: $("#addCatalogPowerBtn"),
  addRequiredPowerBtn: $("#addRequiredPowerBtn"),
  hucksterAvailablePowers: $("#hucksterAvailablePowers"),
  powerNameInput: $("#powerNameInput"),
  powerCostInput: $("#powerCostInput"),
  powerRangeInput: $("#powerRangeInput"),
  powerDurationInput: $("#powerDurationInput"),
  powerSourceInput: $("#powerSourceInput"),
  powerTrappingInput: $("#powerTrappingInput"),
  powerSummaryInput: $("#powerSummaryInput"),
  powerNotesInput: $("#powerNotesInput"),
  addPowerBtn: $("#addPowerBtn"),
  hucksterDealPanel: $("#hucksterDealPanel"),
  hucksterSelectedPower: $("#hucksterSelectedPower"),
  hucksterRequiredPowerPoints: $("#hucksterRequiredPowerPoints"),
  hucksterGamblingRollResult: $("#hucksterGamblingRollResult"),
  hucksterCardsDrawn: $("#hucksterCardsDrawn"),
  hucksterPokerHand: $("#hucksterPokerHand"),
  hucksterTemporaryPowerPoints: $("#hucksterTemporaryPowerPoints"),
  hucksterShortagePenalty: $("#hucksterShortagePenalty"),
  hucksterLeftoverPowerPoints: $("#hucksterLeftoverPowerPoints"),
  hucksterAnteBennySpent: $("#hucksterAnteBennySpent"),
  hucksterUsedJoker: $("#hucksterUsedJoker"),
  hucksterBackfireTriggered: $("#hucksterBackfireTriggered"),
  hucksterNotes: $("#hucksterNotes"),
  weaponList: $("#weaponList"),
  weaponCatalogSelect: $("#weaponCatalogSelect"),
  weaponNameInput: $("#weaponNameInput"),
  weaponQtyInput: $("#weaponQtyInput"),
  weaponDamageInput: $("#weaponDamageInput"),
  weaponRangeInput: $("#weaponRangeInput"),
  weaponApInput: $("#weaponApInput"),
  weaponRofInput: $("#weaponRofInput"),
  weaponCapacityInput: $("#weaponCapacityInput"),
  weaponAmmoTypeSelect: $("#weaponAmmoTypeSelect"),
  weaponAddForm: $("#weaponAddForm"),
  addWeaponBtn: $("#addWeaponBtn"),
  cancelWeaponAddBtn: $("#cancelWeaponAddBtn"),
  weaponCatalogPreview: $("#weaponCatalogPreview"),
  weaponTemplate: $("#weaponTemplate"),
  ammoReserves: $("#ammoReserves"),
  ammoGearSelect: $("#ammoGearSelect"),
  ammoLabelInput: $("#ammoLabelInput"),
  ammoCountInput: $("#ammoCountInput"),
  ammoCaliberSelect: $("#ammoCaliberSelect"),
  ammoNoteInput: $("#ammoNoteInput"),
  ammoAddForm: $("#ammoAddForm"),
  addAmmoBtn: $("#addAmmoBtn"),
  cancelAmmoAddBtn: $("#cancelAmmoAddBtn"),
  ammoGearPreview: $("#ammoGearPreview"),
  armorLocationList: $("#armorLocationList"),
  armorInventoryList: $("#armorInventoryList"),
  armorCatalogSelect: $("#armorCatalogSelect"),
  armorNameInput: $("#armorNameInput"),
  armorCountInput: $("#armorCountInput"),
  armorValueInput: $("#armorValueInput"),
  armorLocationSelect: $("#armorLocationSelect"),
  armorAddForm: $("#armorAddForm"),
  addArmorBtn: $("#addArmorBtn"),
  cancelArmorAddBtn: $("#cancelArmorAddBtn"),
  armorCatalogPreview: $("#armorCatalogPreview"),
  conditionsList: $("#conditionsList"),
  clearTempConditionsBtn: $("#clearTempConditionsBtn"),
  consumablesList: $("#consumablesList"),
  remindersList: $("#remindersList"),
  gearSelect: $("#gearSelect"),
  inventoryNameInput: $("#inventoryNameInput"),
  inventoryCountInput: $("#inventoryCountInput"),
  inventoryUnitsField: $("#inventoryUnitsField"),
  inventoryUnitsLabel: $("#inventoryUnitsLabel"),
  inventoryUnitsInput: $("#inventoryUnitsInput"),
  inventoryNoteInput: $("#inventoryNoteInput"),
  gearAddForm: $("#gearAddForm"),
  addInventoryBtn: $("#addInventoryBtn"),
  cancelInventoryAddBtn: $("#cancelInventoryAddBtn"),
  gearPreview: $("#gearPreview"),
  inventoryList: $("#inventoryList"),
  vehicleCatalogSelect: $("#vehicleCatalogSelect"),
  vehicleNameInput: $("#vehicleNameInput"),
  vehicleQtyInput: $("#vehicleQtyInput"),
  vehicleNoteInput: $("#vehicleNoteInput"),
  vehicleAddForm: $("#vehicleAddForm"),
  addVehicleBtn: $("#addVehicleBtn"),
  cancelVehicleAddBtn: $("#cancelVehicleAddBtn"),
  vehicleCatalogPreview: $("#vehicleCatalogPreview"),
  vehicleList: $("#vehicleList"),
  notesArea: $("#notesArea"),
  newSessionBtn: $("#newSessionBtn"),
  headerToolsMenu: $("#headerToolsMenu"),
  exportBtn: $("#exportBtn"),
  importFile: $("#importFile"),
  pasteImportBtn: $("#pasteImportBtn"),
  pasteImportPanel: $("#pasteImportPanel"),
  importJsonText: $("#importJsonText"),
  confirmPasteImportBtn: $("#confirmPasteImportBtn"),
  cancelPasteImportBtn: $("#cancelPasteImportBtn"),
  resetBtn: $("#resetBtn"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}

function money(cents) {
  return `$${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function wt(weight) {
  if (weight === undefined || weight === null || Number.isNaN(Number(weight)))
    return "—";
  return Number(weight).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
}

function optionList(items, placeholder, detail) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items.map(
      (item) =>
        `<option value="${esc(item.id)}">${esc(item.name)} • ${esc(detail(item))}</option>`,
    ),
  ].join("");
}

function byName(items) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function armorLabel(id) {
  return (
    ARMOR_LOCATIONS.find((location) => location.id === id) || { label: id }
  ).label;
}

function isAmmo(item) {
  return /ammo|ammunition|shell|shot w\/powder|arrow|percussion cap/i.test(
    item.name,
  );
}

function isTrackedWeapon(weapon) {
  return Boolean(
    Number.isFinite(Number(weapon?.shotsMax)) &&
    Number(weapon.shotsMax) > 0 &&
    weapon.ammoType,
  );
}

function getDieStep(die) {
  return STRENGTH_DIE_STEPS.indexOf(String(die || "").trim().toLowerCase());
}

function getStrengthShortfall(characterStrength, minStr) {
  const characterStep = getDieStep(characterStrength);
  const requiredStep = getDieStep(minStr);

  if (characterStep < 0 || requiredStep < 0) return 0;
  return Math.max(0, requiredStep - characterStep);
}

function classifyWeaponUsageType(weapon) {
  const category = String(weapon?.category || "").toLowerCase();
  const name = String(weapon?.name || "").toLowerCase();
  const notes = String(weapon?.notes || "").toLowerCase();
  const range = String(weapon?.range || "").trim();
  const text = `${name} ${notes}`;

  if (category.includes("thrown") || /\bthrown\b|, thrown|throwing/.test(text))
    return "thrown";
  if (category.includes("melee")) return "melee";
  if (
    /firearm|revolver|derringer|rifle|carbine|musket|shotgun|gatling|bow|explosive|infernal|ranged/.test(
      category,
    ) ||
    /revolver|derringer|rifle|carbine|musket|shotgun|gatling|bow|dynamite|nitro|flamethrower/.test(
      text,
    )
  )
    return "ranged";
  if (range) return "ranged";
  return "unknown";
}

function getWeaponStrengthUsageInfo(characterStrength, weapon) {
  const shortfall = getStrengthShortfall(characterStrength, weapon?.minStr);

  if (!shortfall) {
    return {
      isUnderStrength: false,
      shortfall: 0,
      attackPenalty: 0,
      damageCap: "",
      message: "",
    };
  }

  const type = classifyWeaponUsageType(weapon);

  if (type === "melee" || type === "thrown") {
    return {
      isUnderStrength: true,
      shortfall,
      attackPenalty: 0,
      damageCap: characterStrength,
      message: `Strength too low: damage die capped at ${characterStrength}. Positive weapon qualities do not apply, but penalties still apply.`,
    };
  }

  if (type === "ranged") {
    return {
      isUnderStrength: true,
      shortfall,
      attackPenalty: -shortfall,
      damageCap: "",
      message: `Strength too low: ranged attacks suffer -${shortfall}.`,
    };
  }

  return {
    isUnderStrength: true,
    shortfall,
    attackPenalty: 0,
    damageCap: "",
    message: "Strength too low for this weapon.",
  };
}

function weaponStrengthWarningMarkup(weapon) {
  const info = getWeaponStrengthUsageInfo(character.weaponStrength, weapon);
  return info.message
    ? `<p class="weapon-warning">${esc(info.message)}</p>`
    : "";
}

function emptyState(text) {
  return `<p class="empty-state">${esc(text)}</p>`;
}

function displayNameFromKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

function normalizeCaliber(value) {
  const match = String(value || "").match(/\.?\d{2}/);
  if (!match) return "";
  return `.${match[0].replace(".", "")}`;
}

function caliberFromText(text) {
  const matches = String(text || "").match(/\.\d{2}/g) || [];
  const unique = [...new Set(matches.map(normalizeCaliber))];
  if (unique.length === 1) return unique[0];
  if (matches.length > 2) return normalizeCaliber(matches[matches.length - 1]);
  return matches.length === 1 ? normalizeCaliber(matches[0]) : "";
}

function ammoKey(kind, caliber) {
  const normalized = normalizeCaliber(caliber);
  return kind && normalized ? `${kind}-${normalized.slice(1)}-ammo` : "";
}

function ammoLabel(kind, caliber) {
  const label = kind === "rifle" ? "Rifle" : "Pistol";
  return `${label} ammo (${normalizeCaliber(caliber)})`;
}

function ammoKindFromWeapon(weapon) {
  const category = String(weapon?.category || "").toLowerCase();
  if (/revolver|pistol/.test(category)) return "pistol";
  if (/rifle|carbine|musket/.test(category)) return "rifle";

  const text = `${weapon?.name || ""} ${weapon?.notes || ""}`.toLowerCase();
  if (
    /pistol|revolver|colt|lemat|starr|peacemaker|dragoon|derringer/.test(text)
  )
    return "pistol";
  if (
    /rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(
      text,
    )
  )
    return "rifle";
  return "";
}

function exactAmmoTypeForWeapon(weapon) {
  const type = weapon?.ammoType || "";
  if (!type || ["shotgun-shells", "arrow", "percussion-caps"].includes(type))
    return type;
  if (/^(pistol|rifle)-\d{2}-ammo$/.test(type)) return type;

  const legacy = LEGACY_AMMO_KEY_DEFAULTS[type];
  const kind = legacy?.kind || ammoKindFromWeapon(weapon);
  const caliber =
    caliberFromText(`${weapon?.name || ""} ${weapon?.notes || ""}`) ||
    legacy?.caliber ||
    "";
  return ammoKey(kind, caliber) || type;
}

function exactAmmoTypeForCatalogAmmo(item, selectedCaliber = "") {
  if (!item) return "";
  const kind = AMMO_KIND_BY_CATALOG_ID[item.id];
  if (!kind) return item.id;
  const caliber =
    normalizeCaliber(selectedCaliber) ||
    caliberFromText(item.name) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber;
  return ammoKey(kind, caliber);
}

function migrateAmmoEntry(key, ammo) {
  const legacy = LEGACY_AMMO_KEY_DEFAULTS[key];
  if (!legacy) return { key, ammo };
  const caliber = caliberFromText(ammo?.label) || legacy.caliber;
  const migratedKey = ammoKey(legacy.kind, caliber);
  return {
    key: migratedKey,
    ammo: {
      ...ammo,
      label: ammoLabel(legacy.kind, caliber),
      caliber,
      kind: legacy.kind,
    },
  };
}

function ammoReserveForKey(key, fallback = {}) {
  const match = key.match(/^(pistol|rifle)-(\d{2})-ammo$/);
  return {
    ...fallback,
    label: match
      ? ammoLabel(match[1], `.${match[2]}`)
      : fallback.label || "Ammo",
    count: fallback.count ?? 0,
  };
}

function ensureAmmoReserve(key, fallback = {}) {
  if (!key || character.ammo[key]) return;
  character.ammo[key] = ammoReserveForKey(key, fallback);
}

function catalogWeaponForRecord(weapon) {
  return WEAPON_CATALOG.find(
    (item) =>
      item.id === weapon?.catalogId ||
      item.id === weapon?.id ||
      item.name.toLowerCase() === String(weapon?.name || "").toLowerCase(),
  );
}

function reminderMarkup(reminder) {
  return `<article class="reminder"><div class="topline"><h3>${esc(reminder.name)}</h3><small>${esc(reminder.type)}</small></div><p>${esc(reminder.text)}</p></article>`;
}

function traitListMarkup(items, emptyText) {
  return items.length
    ? items
        .map(
          (item) =>
            `<div class="row"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}${item.note ? `<span>${esc(item.note)}</span>` : ""}</div></div>`,
        )
        .join("")
    : emptyState(emptyText);
}

function compactText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function sourceLabel() {
  const source = compactText(character.source || "Tracker", "Tracker");
  if (source.toLowerCase() === "savaged.us") return "Savaged.us import";
  if (source.toLowerCase() === "created") return "Created in tracker";
  return source;
}

function statusPipMarkup(label, value, note = "") {
  return `<div class="status-pip"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
}

function tagCardMarkup(item, kind = "") {
  const controls = item.id
    ? `<div class="tag-actions"><button class="ghost tag-action" type="button" data-entry-type="${esc(kind)}" data-entry-action="edit" data-entry-id="${esc(item.id)}">Edit</button><button class="ghost tag-action danger-lite" type="button" data-entry-type="${esc(kind)}" data-entry-action="remove" data-entry-id="${esc(item.id)}">Remove</button></div>`
    : "";
  return `<article class="dossier-tag ${kind}"><div class="dossier-tag-head"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}</div>${controls}</div>${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.note ? `<p class="tag-note">${esc(item.note)}</p>` : ""}${item.sourceMeta ? `<small>${esc(item.sourceMeta)}</small>` : ""}</article>`;
}

function attributeCardMarkup(name, die) {
  return `<div class="attribute-die-card"><span>${esc(displayNameFromKey(name))}</span><strong>${esc(die || "—")}</strong></div>`;
}

function skillChipMarkup(skill) {
  const meta = skill.die || skill.value || "—";
  const note = skill.notes || skill.linkedAttribute || "";
  return `<div class="skill-chip"><strong>${esc(skill.name || "Skill")}</strong><span>${esc(meta)}${note ? ` • ${esc(note)}` : ""}</span></div>`;
}

function equippedArmorSummaryMarkup() {
  const equipped = character.armorInventory.filter(
    (armor) => armor.equipped && armor.count > 0,
  );
  if (!equipped.length) return emptyState("No equipped armor recorded.");

  return equipped
    .map(
      (armor) =>
        `<div class="equipment-line"><strong>${esc(armor.name)}</strong><span>+${esc(armor.armor)} ${esc(armorLabel(armor.location))}${armor.minStr ? ` • Min Str ${esc(armor.minStr)}` : ""}</span></div>`,
    )
    .join("");
}

function equippedWeaponSummaryMarkup() {
  const weapons = character.weapons.filter((weapon) => weapon.name).slice(0, 4);
  if (!weapons.length) return emptyState("No weapons recorded.");

  return weapons
    .map((weapon) => {
      const loaded = isTrackedWeapon(weapon)
        ? ` • ${weapon.shotsLoaded} / ${weapon.shotsMax}`
        : "";
      return `<div class="equipment-line"><strong>${esc(weapon.name)}</strong><span>Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")}${loaded}</span></div>`;
    })
    .join("");
}

function characterNotesSummaryMarkup() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  const notes = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);

  const parts = [];
  if (character.sourceId) {
    parts.push(
      `<article class="dossier-note"><strong>Import ID</strong><p>${esc(character.sourceId)}</p></article>`,
    );
  }
  notes.slice(0, 3).forEach(([label, value]) => {
    parts.push(
      `<article class="dossier-note"><strong>${esc(label)}</strong><p>${esc(value)}</p></article>`,
    );
  });
  importWarnings.slice(0, 3).forEach((warning) => {
    parts.push(
      `<article class="dossier-note warning"><strong>${esc(warning.name)}</strong><p>${esc(warning.text)}</p></article>`,
    );
  });

  return parts.length
    ? parts.join("")
    : emptyState("No background or import notes recorded.");
}

function generateStableEntryId(type, name) {
  return `${type}-${slugify(name || type)}`;
}

function uniqueEntryId(id, used) {
  const base = id || "entry";
  let candidate = base;
  let index = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }
  used.add(candidate);
  return candidate;
}

function normalizeEdgeEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("edge", entry),
      name: entry,
      type: "edge",
      category: "Unknown",
      rank: "Unknown",
      requirements: "",
      shortSummary: "",
      notes: "",
      source: "Imported",
      subchoice: "",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id: source.id || generateStableEntryId("edge", source.name || "edge"),
    name: source.name || "Unnamed Edge",
    type: source.type || "edge",
    category: source.category || "Unknown",
    rank: source.rank || "Unknown",
    requirements: source.requirements || "",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    subchoice: source.subchoice || "",
    isCustom: Boolean(source.isCustom),
  };
}

function normalizeHindranceEntry(entry) {
  if (typeof entry === "string") {
    return {
      id: generateStableEntryId("hindrance", entry),
      name: entry,
      type: "hindrance",
      severity: "Unknown",
      shortSummary: "",
      notes: "",
      source: "Imported",
      isCustom: false,
    };
  }

  const source = entry && typeof entry === "object" ? entry : {};
  return {
    ...source,
    id:
      source.id || generateStableEntryId("hindrance", source.name || "hindrance"),
    name: source.name || "Unnamed Hindrance",
    type: source.type || "hindrance",
    severity: source.severity || "Unknown",
    shortSummary: source.shortSummary || source.summary || "",
    notes: source.notes || source.text || "",
    source: source.source || "Imported",
    isCustom: Boolean(source.isCustom),
  };
}

function normalizeEdges(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeEdgeEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function normalizeHindrances(entries) {
  const used = new Set();
  return (Array.isArray(entries) ? entries : []).map((entry) => {
    const normalized = normalizeHindranceEntry(entry);
    normalized.id = uniqueEntryId(normalized.id, used);
    return normalized;
  });
}

function plainEntryName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function entryTextValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function selectKnownValue(select, value, fallback) {
  const text = compactText(value, fallback);
  select.value = [...select.options].some((option) => option.value === text)
    ? text
    : fallback;
}

function edgeDisplayMeta(edge) {
  return [
    edge.rank && edge.rank !== "Unknown" ? edge.rank : "",
    edge.category && edge.category !== "Unknown" ? edge.category : "",
    edge.requirements ? `Req: ${entryTextValue(edge.requirements)}` : "",
    edge.subchoice ? `Choice: ${edge.subchoice}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function hindranceDisplayMeta(hindrance) {
  return hindrance.severity && hindrance.severity !== "Unknown"
    ? hindrance.severity
    : "";
}

function sourceMeta(entry) {
  if (!entry.source || entry.source === "Manual") return "";
  return `Source: ${entry.source}`;
}

function getEdgeWarnings(currentCharacter, draftEdge, editingId = "") {
  const warnings = [];
  if (!draftEdge.name.trim()) warnings.push("Edge name is blank.");

  if (isArcaneBackgroundEdge(draftEdge.name)) {
    const hasOtherArcaneBackground = currentCharacter.edges.some(
      (edge) => edge.id !== editingId && isArcaneBackgroundEdge(edge.name),
    );
    if (hasOtherArcaneBackground)
      warnings.push("This character already has an Arcane Background Edge.");
  }

  const draftName = plainEntryName(draftEdge.name);
  const hasTenderfoot = currentCharacter.hindrances.some(
    (hindrance) => plainEntryName(hindrance.name) === "tenderfoot",
  );
  if (draftName === "dont get im riled" && hasTenderfoot) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function getHindranceWarnings(currentCharacter, draftHindrance, editingId = "") {
  const warnings = [];
  if (!draftHindrance.name.trim()) warnings.push("Hindrance name is blank.");
  if (!draftHindrance.severity || draftHindrance.severity === "Unknown")
    warnings.push("Hindrance severity is not selected.");

  const draftName = plainEntryName(draftHindrance.name);
  const hasRiled = currentCharacter.edges.some(
    (edge) => plainEntryName(edge.name) === "dont get im riled",
  );
  if (draftName === "tenderfoot" && hasRiled) {
    warnings.push("Tenderfoot conflicts with Don’t Get ’im Riled!.");
  }

  return warnings;
}

function upsertEdge(currentCharacter, edge) {
  const normalized = normalizeEdgeEntry(edge);
  const index = currentCharacter.edges.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.edges[index] = normalized;
  else currentCharacter.edges.push(normalized);
  currentCharacter.edges = normalizeEdges(currentCharacter.edges);
}

function removeEdge(currentCharacter, edgeId) {
  currentCharacter.edges = currentCharacter.edges.filter(
    (edge) => edge.id !== edgeId,
  );
}

function upsertHindrance(currentCharacter, hindrance) {
  const normalized = normalizeHindranceEntry(hindrance);
  const index = currentCharacter.hindrances.findIndex(
    (item) => item.id === normalized.id,
  );
  if (index >= 0) currentCharacter.hindrances[index] = normalized;
  else currentCharacter.hindrances.push(normalized);
  currentCharacter.hindrances = normalizeHindrances(currentCharacter.hindrances);
}

function removeHindrance(currentCharacter, hindranceId) {
  currentCharacter.hindrances = currentCharacter.hindrances.filter(
    (hindrance) => hindrance.id !== hindranceId,
  );
}

function normalize(data) {
  const defaults = clone(defaultCharacter);
  const normalized = data && typeof data === "object" ? data : defaults;

  normalized.name ||= defaults.name;
  normalized.rank ||= defaults.rank;
  normalized.ancestry ||= defaults.ancestry;
  normalized.archetype ||= defaults.archetype;
  normalized.bennies = { ...defaults.bennies, ...(normalized.bennies || {}) };
  normalized.damage = { ...defaults.damage, ...(normalized.damage || {}) };
  normalized.derived = { ...defaults.derived, ...(normalized.derived || {}) };
  normalized.conditions = {
    ...defaults.conditions,
    ...(normalized.conditions || {}),
  };
  normalized.temporaryConditions = Array.isArray(normalized.temporaryConditions)
    ? normalized.temporaryConditions
    : clone(defaults.temporaryConditions);
  normalized.selectedArmorLocation ||= "best";
  normalized.moneyCents = Math.round(Number(normalized.moneyCents) || 0);
  normalized.armorStrength ||=
    normalized.attributes?.strength || defaults.armorStrength || "d4";
  normalized.weaponStrength ||=
    normalized.attributes?.strength || defaults.weaponStrength || "d4";
  normalized.conviction = Math.max(
    0,
    Math.floor(Number(normalized.conviction) || 0),
  );
  normalized.arcaneBackground = normalized.arcaneBackground || null;
  if (normalized.arcaneBackground?.edgeName) {
    const config = arcaneBackgroundConfigFromEdge(
      normalized.arcaneBackground.edgeName,
    );
    normalized.arcaneBackground = config
      ? {
          ...makeArcaneBackgroundState(config),
          ...normalized.arcaneBackground,
        }
      : normalized.arcaneBackground;
  }

  normalized.ammo =
    normalized.ammo && typeof normalized.ammo === "object"
      ? normalized.ammo
      : {};
  normalized.ammo = Object.entries(normalized.ammo).reduce(
    (ammoMap, [key, ammo]) => {
      const migrated = migrateAmmoEntry(key, ammo);
      if (!ammoMap[migrated.key]) ammoMap[migrated.key] = migrated.ammo;
      else ammoMap[migrated.key].count += Number(migrated.ammo.count) || 0;
      return ammoMap;
    },
    {},
  );
  Object.entries(defaults.ammo || {}).forEach(([key, ammo]) => {
    const migrated = migrateAmmoEntry(key, clone(ammo));
    if (!normalized.ammo[migrated.key])
      normalized.ammo[migrated.key] = { ...migrated.ammo, count: 0 };
  });
  Object.values(normalized.ammo).forEach((ammo) => {
    ammo.label ||= "Ammo";
    ammo.count = Math.max(0, Math.floor(Number(ammo.count) || 0));
  });

  normalized.weapons = Array.isArray(normalized.weapons)
    ? normalized.weapons
    : [];
  normalized.weapons = normalized.weapons.map((weapon, index) => {
    const item = { ...weapon };
    const catalogItem = catalogWeaponForRecord(item);
    item.id ||= `${slugify(item.name || "weapon")}-${index}`;
    item.name ||= "Unnamed weapon";
    item.damage ||= "—";
    item.range ||= "—";
    item.ap = item.ap === "" || item.ap === undefined ? "—" : item.ap;
    item.rof = item.rof === "" || item.rof === undefined ? "—" : item.rof;
    if ((!item.shotsMax || Number(item.shotsMax) <= 0) && catalogItem?.shotsMax)
      item.shotsMax = catalogItem.shotsMax;
    if (!item.ammoType && catalogItem?.ammoType)
      item.ammoType = catalogItem.ammoType;

    if (!item.shotsMax || Number(item.shotsMax) <= 0) {
      item.shotsMax = null;
      item.shotsLoaded = null;
      item.ammoType = null;
    } else {
      item.shotsMax = Math.floor(Number(item.shotsMax));
      item.shotsLoaded = clamp(
        Math.floor(Number(item.shotsLoaded) || item.shotsMax),
        0,
        item.shotsMax,
      );
      item.ammoType = exactAmmoTypeForWeapon(item);
      if (!item.ammoType) {
        item.shotsMax = null;
        item.shotsLoaded = null;
      } else if (!normalized.ammo[item.ammoType]) {
        normalized.ammo[item.ammoType] = ammoReserveForKey(item.ammoType);
      }
    }

    return item;
  });

  normalized.armorInventory = Array.isArray(normalized.armorInventory)
    ? normalized.armorInventory
    : [];
  normalized.armorInventory = normalized.armorInventory.map((armor, index) => ({
    id: armor.id || `${slugify(armor.name || "armor")}-${index}`,
    name: armor.name || "Armor",
    count: Math.max(0, Math.floor(Number(armor.count) || 0)),
    armor: Math.max(0, Math.floor(Number(armor.armor) || 0)),
    weight: armor.weight,
    minStr: armor.minStr || "—",
    costCents: armor.costCents,
    book: armor.book || "Deadlands",
    location: ARMOR_LOCATIONS.some((location) => location.id === armor.location)
      ? armor.location
      : "torso",
    equipped: Boolean(armor.equipped),
    note: armor.note || "",
  }));

  normalized.resources = Array.isArray(normalized.resources)
    ? normalized.resources
    : [];
  normalized.resources = normalized.resources.map((resource, index) => ({
    id: resource.id || `${slugify(resource.name || "resource")}-${index}`,
    name: resource.name || "Resource",
    current: Math.max(0, Math.floor(Number(resource.current) || 0)),
    max: Math.max(0, Math.floor(Number(resource.max) || 0)),
    source: resource.source || "",
    note: resource.note || "",
  }));
  normalized.powers = Array.isArray(normalized.powers)
    ? normalized.powers.map((power, index) =>
        normalizePowerRecord(
          power,
          index,
          normalized.arcaneBackground?.edgeName,
        ),
      )
    : [];
  normalized.hucksterDeal = normalizeHucksterDeal(normalized.hucksterDeal);
  if (
    normalized.arcaneBackground?.key === "huckster" &&
    !normalized.hucksterDeal
  )
    normalized.hucksterDeal = makeHucksterDeal();

  normalized.edges = normalizeEdges(normalized.edges);
  normalized.hindrances = normalizeHindrances(normalized.hindrances);
  normalized.inventory = Array.isArray(normalized.inventory)
    ? normalized.inventory
    : [];
  normalized.vehicles = Array.isArray(normalized.vehicles)
    ? normalized.vehicles
    : [];
  normalized.consumables = Array.isArray(normalized.consumables)
    ? normalized.consumables
    : [];
  normalized.reminders = Array.isArray(normalized.reminders)
    ? normalized.reminders
    : [];
  normalized.notes ||= "";

  return normalized;
}

function loadCharacter() {
  try {
    return normalize(
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultCharacter),
    );
  } catch {
    return normalize(clone(defaultCharacter));
  }
}

function save() {
  if (!els.saveState) return;
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    els.saveState.textContent = "Saved";
  }, 120);
}

function ammoOptions(selected = "") {
  const selectedMissing = selected && !character.ammo[selected];
  return [
    `<option value=""${!selected ? " selected" : ""}>No ammunition tracking</option>`,
    selectedMissing
      ? `<option value="${esc(selected)}" selected>${esc(ammoReserveForKey(selected).label)} (no reserve)</option>`
      : "",
    ...Object.entries(character.ammo).map(
      ([key, ammo]) =>
        `<option value="${esc(key)}"${key === selected ? " selected" : ""}>${esc(ammo.label)}</option>`,
    ),
  ].join("");
}

function caliberOptionsForAmmo(item, selected = "") {
  const options = AMMO_CALIBERS_BY_CATALOG_ID[item?.id] || [];
  if (!options.length) {
    return '<option value="">No caliber selection</option>';
  }
  const selectedCaliber =
    normalizeCaliber(selected) ||
    caliberFromText(els.ammoLabelInput.value) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber ||
    options[0];
  return options
    .map(
      (caliber) =>
        `<option value="${esc(caliber)}"${caliber === selectedCaliber ? " selected" : ""}>${esc(caliber)}</option>`,
    )
    .join("");
}

function entryCatalogOptions(items, placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items
      .map(
        (item) =>
          `<option value="${esc(item.id)}">${esc(item.name)}${item.rank ? ` • ${esc(item.rank)}` : ""}${item.severity ? ` • ${esc(item.severity)}` : ""}${item.source ? ` • ${esc(item.source)}` : ""}</option>`,
      )
      .join(""),
  ].join("");
}

function catalogs() {
  els.gearSelect.innerHTML = optionList(
    byName(GEAR_CATALOG),
    "Choose gear from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.ammoGearSelect.innerHTML = optionList(
    GEAR_CATALOG.filter(isAmmo),
    "Choose ammunition from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.armorCatalogSelect.innerHTML = optionList(
    ARMOR_CATALOG,
    "Choose armor from catalog…",
    (item) =>
      `+${item.armor} • ${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.weaponCatalogSelect.innerHTML = optionList(
    WEAPON_CATALOG,
    "Choose weapon from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.vehicleCatalogSelect.innerHTML = optionList(
    VEHICLE_CATALOG,
    "Choose vehicle from catalog…",
    (item) => money(item.costCents),
  );
  els.edgeCatalogSelect.innerHTML = entryCatalogOptions(
    EDGE_CATALOG,
    "Manual Edge or choose from catalog…",
  );
  els.hindranceCatalogSelect.innerHTML = entryCatalogOptions(
    HINDRANCE_CATALOG,
    "Manual Hindrance or choose from catalog…",
  );
  els.armorLocationSelect.innerHTML = ARMOR_LOCATIONS.map(
    (location) =>
      `<option value="${esc(location.id)}">${esc(location.label)}</option>`,
  ).join("");
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

function updatePreviews() {
  const gear = chosen(GEAR_CATALOG, els.gearSelect.value);
  const consumableConversion = consumableConversionForGear(gear);
  els.inventoryUnitsField.classList.toggle(
    "hidden",
    !consumableConversion?.unitsLabel,
  );
  if (consumableConversion?.unitsLabel) {
    els.inventoryUnitsLabel.textContent = consumableConversion.unitsLabel;
    els.inventoryUnitsInput.placeholder = String(consumableConversion.multiplier);
  } else {
    els.inventoryUnitsInput.value = "";
  }
  const packageCount = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const unitsPerPackage = Math.max(
    1,
    Math.floor(
      Number(els.inventoryUnitsInput.value) ||
        consumableConversion?.multiplier ||
        1,
    ),
  );
  els.gearPreview.textContent = gear
    ? consumableConversion
      ? `${gear.name} • Adds ${packageCount * unitsPerPackage} ${consumableConversion.unit} to Consumables`
      : `${gear.name} • Weight ${wt(gear.weight)} • Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const ammo = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  els.ammoGearPreview.textContent = ammo
    ? `${ammo.name} • Weight ${wt(ammo.weight)} • Cost ${money(ammo.costCents)} each`
    : "Choose ammunition from the catalog or type custom ammo.";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo(
    ammo,
    els.ammoCaliberSelect.value,
  );
  els.ammoCaliberSelect.disabled = !(
    ammo && AMMO_CALIBERS_BY_CATALOG_ID[ammo.id]
  );

  const armor = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  els.armorCatalogPreview.textContent = armor
    ? `${armor.name} • +${armor.armor} armor • ${armorLabel(armor.location)} • Min Str ${armor.minStr} • ${money(armor.costCents)}`
    : "Choose armor from the catalog or type custom armor.";
  if (armor) {
    els.armorValueInput.value = armor.armor;
    els.armorLocationSelect.value = armor.location;
  }

  const weapon = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  els.weaponCatalogPreview.textContent = weapon
    ? `${weapon.name} • Min Str ${weapon.minStr} • Weight ${wt(weapon.weight)} • Cost ${money(weapon.costCents)}. Fill blank combat stats manually.`
    : "Choose a weapon from the catalog or type custom weapon.";
  if (weapon) {
    els.weaponDamageInput.value = weapon.damage || "";
    els.weaponRangeInput.value = weapon.range || "";
    els.weaponApInput.value = weapon.ap !== undefined ? weapon.ap : "";
    els.weaponRofInput.value = weapon.rof || "";
    els.weaponCapacityInput.value = weapon.shotsMax || "";
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      exactAmmoTypeForWeapon(weapon),
    );
  }

  const vehicle = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  els.vehicleCatalogPreview.textContent = vehicle
    ? `${vehicle.name} • Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}

function armorValue(location) {
  return character.armorInventory
    .filter(
      (armor) =>
        armor.equipped &&
        armor.count > 0 &&
        (location === "best" || armor.location === location),
    )
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}

function render() {
  els.characterName.textContent = character.name;
  els.characterSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" ");
  els.woundsValue.textContent = character.damage.wounds;
  const woundPenalty = Math.min(character.damage.wounds, character.damage.maxWounds);
  els.woundPenalty.textContent = woundPenalty ? `Penalty -${woundPenalty}` : "";
  els.woundPenalty.classList.toggle("hidden", !woundPenalty);
  els.woundsNote.textContent = character.damage.wounds
    ? "Apply wound penalty to affected trait rolls."
    : "Healthy";
  els.fatigueValue.textContent = character.damage.fatigue;
  const fatiguePenalty = Math.min(character.damage.fatigue, character.damage.maxFatigue);
  els.fatiguePenalty.textContent = fatiguePenalty ? `Penalty -${fatiguePenalty}` : "";
  els.fatiguePenalty.classList.toggle("hidden", !fatiguePenalty);
  els.fatigueNote.textContent = character.damage.fatigue
    ? "Apply fatigue penalty to affected trait rolls."
    : "Fresh";
  els.benniesValue.textContent = character.bennies.current;
  els.bennyStart.textContent = `Start ${character.bennies.starting}`;
  els.convictionValue.textContent = character.conviction;

  const location = "best";
  character.selectedArmorLocation = "best";
  const armor = armorValue(location);
  character.derived.armor = armor;
  character.derived.toughness =
    (Number(character.derived.baseToughness) || 0) + armor;
  els.paceValue.textContent = character.derived.pace;
  els.parryValue.textContent = character.derived.parry;
  els.toughnessValue.textContent = `${character.derived.toughness} (+${armor})`;
  els.armorSelect.innerHTML = `<option value="best">All equipped armor</option>`;
  els.armorSelect.value = location;
  els.armorNote.textContent = `Armor bonus: +${armor}`;
  els.combatArmorLocations.innerHTML = ARMOR_LOCATIONS.filter(
    (item) => !["best", "shield"].includes(item.id),
  )
    .map(
      (item) =>
        `<span><strong>${esc(item.label)}:</strong> +${armorValue(item.id)}</span>`,
    )
    .join("");
  els.armorStrengthPill.textContent = `Strength ${character.armorStrength}`;
  els.weaponStrengthPill.textContent = `Strength ${character.weaponStrength}`;
  els.moneyDisplay.textContent = money(character.moneyCents);

  renderCharacterSummary();
  renderArmor();
  renderWeapons();
  renderAmmo();
  renderResources();
  renderPowers();
  renderHucksterDeal();
  renderKeyConditions();
  renderConditions();
  renderCombatPenalties();
  renderConsumables();
  renderInventory();
  renderVehicles();
  renderReminders();
  renderPlaySummary();
  renderArcaneSummary();
  renderNotesSummary();

  if (document.activeElement !== els.notesArea)
    els.notesArea.value = character.notes || "";
}

function renderCharacterSummary() {
  els.characterSummaryName.textContent = character.name;
  els.characterDossierSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" • ");
  els.characterSourceBadge.textContent = sourceLabel();
  els.characterBasicsList.innerHTML = [
    ["Rank", character.rank],
    ["Ancestry", character.ancestry],
    ["Concept", character.archetype],
    ["Source", sourceLabel()],
  ]
    .map(
      ([label, value]) =>
        `<div class="dossier-meta-item"><span>${label}</span><strong>${esc(value || "—")}</strong></div>`,
    )
    .join("");

  const powerPoints = powerPointResource();
  els.characterStatusStrip.innerHTML = [
    statusPipMarkup(
      "Wounds",
      `${character.damage.wounds} / ${character.damage.maxWounds}`,
    ),
    statusPipMarkup(
      "Fatigue",
      `${character.damage.fatigue} / ${character.damage.maxFatigue}`,
    ),
    statusPipMarkup("Bennies", character.bennies.current, `Start ${character.bennies.starting}`),
    statusPipMarkup("Conviction", character.conviction),
    powerPoints
      ? statusPipMarkup(
          "Power Points",
          `${powerPoints.current} / ${powerPoints.max}`,
          powerPoints.source,
        )
      : "",
  ]
    .filter(Boolean)
    .join("");
  els.addManualPowerPointsBtn.classList.toggle("hidden", Boolean(powerPoints));

  const attributeEntries = Object.entries(character.attributes || {}).sort(
    ([left], [right]) => {
      const leftIndex = ATTRIBUTE_ORDER.indexOf(left);
      const rightIndex = ATTRIBUTE_ORDER.indexOf(right);
      return (
        (leftIndex < 0 ? 99 : leftIndex) -
          (rightIndex < 0 ? 99 : rightIndex) ||
        displayNameFromKey(left).localeCompare(displayNameFromKey(right))
      );
    },
  );
  els.attributesList.innerHTML = attributeEntries.length
    ? attributeEntries
        .map(([name, die]) => attributeCardMarkup(name, die))
        .join("")
    : emptyState("No attributes recorded.");

  const skills = [...(character.skills || [])].sort((left, right) =>
    String(left.name || "").localeCompare(String(right.name || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
  els.skillsList.innerHTML = skills.length
    ? skills.map(skillChipMarkup).join("")
    : emptyState("No skills recorded.");

  const edges = (character.edges || [])
    .filter((edge) => edge.name)
    .map((edge) => ({
      id: edge.id,
      name: edge.name,
      meta: edgeDisplayMeta(edge),
      summary: edge.shortSummary || edge.summary || "",
      note: edge.notes || edge.text || "",
      sourceMeta: sourceMeta(edge),
    }));
  els.edgesList.innerHTML = edges.length
    ? edges.map((edge) => tagCardMarkup(edge, "edge")).join("")
    : emptyState("No Edges added yet.");

  const hindrances = (character.hindrances || [])
    .filter((hindrance) => hindrance.name)
    .map((hindrance) => ({
      id: hindrance.id,
      name: hindrance.name,
      meta: hindranceDisplayMeta(hindrance),
      summary: hindrance.shortSummary || hindrance.summary || "",
      note: hindrance.notes || hindrance.text || "",
      sourceMeta: sourceMeta(hindrance),
    }));
  els.hindrancesList.innerHTML = hindrances.length
    ? hindrances
        .map((hindrance) => tagCardMarkup(hindrance, "hindrance"))
        .join("")
    : emptyState("No Hindrances added yet.");

  els.characterDerivedDetails.innerHTML = [
    ["Pace", character.derived.pace, ""],
    ["Parry", character.derived.parry, ""],
    [
      "Toughness",
      character.derived.toughness,
      `Base ${compactText(character.derived.baseToughness)} + Armor ${compactText(character.derived.armor, "0")}`,
    ],
    ["Size", character.derived.size ?? character.size, ""],
    ["Armor", `+${compactText(character.derived.armor, "0")}`, "Best equipped"],
  ]
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(
      ([label, value, note]) =>
        `<div class="derived-scan-card"><span>${esc(label)}</span><strong>${esc(value ?? "—")}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`,
    )
    .join("");

  const background = character.arcaneBackground;
  els.characterArcaneSummary.innerHTML = background
    ? `<div class="arcane-snapshot-grid">${[
        ["Background", background.name || background.edgeName],
        ["Edge", background.edgeName],
        [
          "Arcane Skill",
          background.arcaneSkill
            ? `${background.arcaneSkill}${background.linkedAttribute ? ` (${background.linkedAttribute})` : ""}`
            : "",
        ],
        [
          "Power Points",
          powerPoints ? `${powerPoints.current} / ${powerPoints.max}` : "—",
        ],
        ["Known Powers", character.powers.length],
      ]
        .map(
          ([label, value]) =>
            `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
        )
        .join("")}</div>`
    : powerPoints
      ? `<div class="arcane-snapshot-grid">${[
          ["Background", "Manual Power Points"],
          ["Power Points", `${powerPoints.current} / ${powerPoints.max}`],
          ["Known Powers", character.powers.length],
          ["Notes", powerPoints.note || "Manual post-import setup"],
        ]
          .map(
            ([label, value]) =>
              `<div><span>${esc(label)}</span><strong>${esc(compactText(value))}</strong></div>`,
          )
          .join("")}</div>`
      : emptyState("No Arcane Background or Power Points configured.");

  els.characterEquippedSummary.innerHTML = `<div class="equipment-group"><h3>Weapons</h3>${equippedWeaponSummaryMarkup()}</div><div class="equipment-group"><h3>Armor</h3>${equippedArmorSummaryMarkup()}</div><div class="equipment-line secondary"><strong>Cash</strong><span>${money(character.moneyCents)} • Inventory tracks money and gear details.</span></div>`;
  els.characterBackgroundSummary.innerHTML = characterNotesSummaryMarkup();
}

function renderKeyConditions() {
  const keys = [
    "shaken",
    "distracted",
    "vulnerable",
    "stunned",
    "prone",
    "bound",
    "entangled",
    "aiming",
    "defending",
    "theDrop",
    "onHold",
    "wildAttack",
  ].filter((key) => key in character.conditions);
  els.keyConditionsList.innerHTML = "";
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = `condition${character.conditions[key] ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${character.conditions[key] ? "checked" : ""}><span>${esc(displayNameFromKey(key))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.keyConditionsList.appendChild(label);
  });
}

function renderPlaySummary() {
  renderCombatWeapons();
  renderCombatStatusResources();
  renderCombatPowerPoints();

  const activeResources = character.resources.filter(
    (resource) =>
      resource.id !== "power-points" &&
      (resource.max > 0 || resource.current > 0),
  );
  els.playResourcesCard.classList.toggle("hidden", !activeResources.length);
  renderResourceControls(els.playResourcesList, activeResources);

  const showPowers = character.powers.length > 0;
  els.playActivePowersCard.classList.toggle("hidden", !showPowers);
  if (showPowers) renderCombatPowers();

  renderCombatHuckster();
  renderCombatConsumables();
  renderCombatReminders();
}

function renderResourceControls(container, resources) {
  container.innerHTML = "";
  if (!resources.length) {
    container.innerHTML = emptyState("No active combat resources.");
    return;
  }

  resources.forEach((resource) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      resource.current = Math.max(0, resource.current - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      resource.current = resource.max
        ? Math.min(resource.max, resource.current + 1)
        : resource.current + 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      resource.current = resource.max;
      render();
      save();
    };
    container.appendChild(row);
  });
}

function recoverResource(resource, amount) {
  resource.current = resource.max
    ? Math.min(resource.max, resource.current + amount)
    : resource.current + amount;
  render();
  save();
}

function appendPowerPointControls(
  container,
  resource,
  { showName = false } = {},
) {
  const row = document.createElement("div");
  row.className = "row";
  const max = resource.max || "—";
  const value = `${resource.current} / ${max}`;
  row.innerHTML = `<div><strong>${showName ? esc(resource.name) : value}</strong>${showName ? `<span>${value}</span>` : "<span>Current / Max</span>"}${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls resource-recovery-actions"><button data-recover="5" type="button">Rest +5</button><button data-recover="10" type="button">Rest +10</button><button data-recover="15" type="button">Rest +15</button><button data-recover="max" type="button">Max</button></div>`;
  row.querySelectorAll("[data-recover]").forEach((button) => {
    const atMax = Boolean(resource.max && resource.current >= resource.max);
    button.disabled = atMax || (button.dataset.recover === "max" && !resource.max);
    button.onclick = () => {
      if (button.dataset.recover === "max") {
        if (resource.max) {
          resource.current = resource.max;
          render();
          save();
        }
        return;
      }
      recoverResource(resource, Number(button.dataset.recover));
    };
  });
  container.appendChild(row);
}

function renderCombatStatusResources() {
  const statuses = [
    {
      name: "Bleeding Out",
      text: character.conditions.bleedingOut ? "Active" : "Clear",
      active: character.conditions.bleedingOut,
    },
  ].filter((status) => status.active);

  els.combatStatusResources.classList.toggle("hidden", !statuses.length);
  els.combatStatusResources.innerHTML = [
    ...statuses.map(
      (status) =>
        `<div class="row"><div><strong>${esc(status.name)}</strong><span>${esc(status.text)}</span></div></div>`,
    ),
  ].join("");
}

function combatPenaltyInfo() {
  const woundPenalty = Math.min(
    character.damage.wounds,
    character.damage.maxWounds,
  );
  const fatiguePenalty = Math.min(
    character.damage.fatigue,
    character.damage.maxFatigue,
  );
  const traitPenalties = [];
  const modifiers = [];

  if (woundPenalty)
    traitPenalties.push({ label: "Wounds", value: -woundPenalty });
  if (fatiguePenalty)
    traitPenalties.push({ label: "Fatigue", value: -fatiguePenalty });
  if (character.conditions.distracted)
    traitPenalties.push({ label: "Distracted", value: -2 });

  const conditionNotes = [
    ["shaken", "Shaken: limited actions"],
    ["vulnerable", "Vulnerable: +2 attacks vs you"],
    ["stunned", "Stunned: cannot act; attacks vs you +2"],
    ["prone", "Prone: -2 attacks; close attacks vs you +2"],
    ["bound", "Bound: can't move; likely Distracted/Vulnerable"],
    ["entangled", "Entangled: can't move; likely Distracted"],
    ["aiming", "Aiming: +2 ranged attack"],
    ["defending", "Defending: +4 Parry"],
    ["theDrop", "The Drop: +4 attack/damage"],
    ["onHold", "On Hold: interrupt ready"],
    ["wildAttack", "Wild Attack: +2 Fighting/damage; -2 Parry"],
    ["bleedingOut", "Bleeding Out: incapacitated"],
    ["diseased", "Diseased: check disease effects"],
    ["poisoned", "Poisoned: check poison effects"],
  ];

  conditionNotes.forEach(([key, text]) => {
    if (character.conditions[key]) modifiers.push(text);
  });

  const total = traitPenalties.reduce(
    (sum, penalty) => sum + Math.abs(penalty.value),
    0,
  );

  return { total, traitPenalties, modifiers };
}

function renderCombatPenalties() {
  const { total, traitPenalties, modifiers } = combatPenaltyInfo();
  const entries = [
    ...traitPenalties.map(
      (penalty) => `${penalty.label} ${penalty.value}`,
    ),
    ...modifiers,
  ];

  els.combatPenaltyTotal.textContent = total ? `-${total}` : "0";
  els.combatPenaltySummary.textContent = total
    ? "Trait penalty total"
    : "No trait penalties";
  els.combatPenaltyBreakdown.innerHTML = entries.length
    ? entries
        .map((entry) => `<span>${esc(entry)}</span>`)
        .join("")
    : '<span>No active penalty causes.</span>';
}

function renderCombatPowerPoints() {
  const resources = character.resources.filter(
    (resource) => resource.id === "power-points",
  );
  els.playPowerPointsCard.classList.toggle("hidden", !resources.length);
  if (!resources.length) {
    els.playPowerPointsList.innerHTML = "";
    return;
  }
  els.playPowerPointsList.innerHTML = "";
  resources.forEach((resource) =>
    appendPowerPointControls(els.playPowerPointsList, resource),
  );
}

function renderCombatWeapons() {
  els.playWeaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.playWeaponList.innerHTML = emptyState("No weapons tracked.");
    return;
  }

  [...character.weapons]
    .sort(
      (left, right) =>
        Number(isTrackedWeapon(right)) - Number(isTrackedWeapon(left)),
    )
    .forEach((weapon) => {
      const reserve = weapon.ammoType ? character.ammo[weapon.ammoType] : null;
      const tracked = isTrackedWeapon(weapon);
      const strengthWarning = weaponStrengthWarningMarkup(weapon);
      const article = document.createElement("article");
      article.className = "weapon-card";
      article.innerHTML = `<div class="topline"><div><h3>${esc(weapon.name)}</h3><p class="meta">Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")} • AP ${esc(weapon.ap ?? "—")} • ROF ${esc(weapon.rof ?? "—")} • Min Str ${esc(weapon.minStr || "—")}</p></div><span class="loaded">${tracked ? `${weapon.shotsLoaded} / ${weapon.shotsMax}` : "No ammo"}</span></div>${tracked ? `<p class="muted">${esc(reserve?.label || "Ammo")} reserve: ${reserve?.count || 0}</p>` : '<p class="muted">Melee / no ammo tracking.</p>'}${strengthWarning}${weapon.notes ? `<p class="muted">${esc(weapon.notes)}</p>` : ""}${tracked ? '<div class="weapon-actions"><button class="fire-btn" type="button">Fire</button><button class="load-btn" type="button">Load +1</button><button class="reload-btn" type="button">Fill</button><button class="unload-btn" type="button">Unload</button></div>' : ""}`;

      if (tracked) {
        const [fire, load, reload, unload] = article.querySelectorAll("button");
        const reserveCount = reserve?.count || 0;
        fire.disabled = weapon.shotsLoaded <= 0;
        load.disabled =
          weapon.shotsLoaded >= weapon.shotsMax || reserveCount <= 0;
        reload.disabled = load.disabled;
        unload.disabled = weapon.shotsLoaded <= 0;
        fire.onclick = () => {
          weapon.shotsLoaded -= 1;
          render();
          save();
        };
        load.onclick = () => {
          if (!reserve) return;
          weapon.shotsLoaded += 1;
          reserve.count -= 1;
          render();
          save();
        };
        reload.onclick = () => {
          if (!reserve) return;
          const amount = Math.min(
            weapon.shotsMax - weapon.shotsLoaded,
            reserve.count,
          );
          weapon.shotsLoaded += amount;
          reserve.count -= amount;
          render();
          save();
        };
        unload.onclick = () => {
          if (!reserve) return;
          reserve.count += weapon.shotsLoaded;
          weapon.shotsLoaded = 0;
          render();
          save();
        };
      }

      els.playWeaponList.appendChild(article);
    });
}

function powerCost(power) {
  if (Number.isFinite(Number(power.basePowerPoints)))
    return Math.max(0, Math.floor(Number(power.basePowerPoints)));
  const match = String(power.baseCost || power.powerPoints || "").match(/\d+/);
  const cost = match ? Math.floor(Number(match[0]) || 0) : 0;
  return Math.max(0, cost);
}

function parsePowerModifier(modifier) {
  if (typeof modifier === "string") {
    const match = modifier.match(/^\s*(.+?)\s*\(\s*([^)]+)\s*\)\s*:?\s*(.*)$/);
    const costs = match
      ? (match[2].match(/[+-]?\d+/g) || []).map((cost) =>
          Math.max(0, Math.floor(Number(cost) || 0)),
        )
      : [];
    return {
      name: match ? match[1].trim() : modifier.trim(),
      cost: costs[0] || 0,
      costs,
      description: match ? match[3].trim() : "",
    };
  }
  const cost = Math.max(
    0,
    Math.floor(Number(modifier.cost ?? modifier.powerPoints ?? 0) || 0),
  );
  return {
    name: modifier.name || "Modifier",
    cost,
    costs: [cost],
    description: modifier.description || modifier.notes || "",
  };
}

function comparePowerCosts(left, right) {
  return (
    left.cost - right.cost ||
    Number(!left.base) - Number(!right.base) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function comparePowers(left, right) {
  return (
    powerCost(left) - powerCost(right) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function powerCastOptions(power) {
  const baseCost = powerCost(power);
  const baseName = power.modifiers?.length ? "Basic" : "Cast";
  const options = [
    {
      name: baseName,
      cost: baseCost,
      description: power.notes || "",
      base: true,
    },
  ];
  (power.modifiers || []).forEach((modifier) => {
    const parsed = parsePowerModifier(modifier);
    const costs = parsed.costs.length ? parsed.costs : [parsed.cost];
    costs.forEach((cost) => {
      options.push({
        ...parsed,
        name: parsed.name,
        cost: baseCost + cost,
        modifierCost: cost,
      });
    });
  });
  return options.sort(comparePowerCosts);
}

function powerOptionButtonMarkup(option, index, powerPoints) {
  return `<button class="cast-option-btn" type="button" data-power-option="${index}">${esc(option.name)}${powerPoints || option.cost ? ` (${option.cost} PP)` : ""}</button>`;
}

function variableSpendOptionsForPower(power) {
  const catalogPower =
    hasPowerCatalog() && power.catalogId
      ? findPowerCatalogEntryById(power.catalogId)
      : null;
  const supportsVariableSpend = Boolean(
    power.supportsVariableSpend || catalogPower?.supportsVariableSpend,
  );
  const options = Array.isArray(power.variableSpendOptions)
    ? power.variableSpendOptions
    : catalogPower?.variableSpendOptions || [];
  return supportsVariableSpend ? options : [];
}

function variableSpendMarkup(power) {
  const options = variableSpendOptionsForPower(power);
  if (!options.length) return "";
  const rows = options
    .map((option, index) => {
      const hasCost = Number.isFinite(Number(option.costPer));
      const unit = hasCost
        ? `+${Number(option.costPer)} PP / ${esc(option.quantityLabel || "use")}`
        : "manual PP";
      return `<label class="variable-spend-row"><span><strong>${esc(option.label)}</strong><small>${unit}</small></span><input data-variable-spend="${index}" type="number" min="0" step="1" value="0" aria-label="${esc(option.label)} quantity"></label>`;
    })
    .join("");
  return `<div class="variable-spend-controls"><div class="topline"><h3>Variable Spend</h3><small>Base ${powerCost(power)} PP</small></div>${rows}<button class="variable-spend-btn" type="button">Spend ${powerCost(power)} PP</button></div>`;
}

function variableSpendTotal(power, article) {
  const baseCost = powerCost(power);
  const options = variableSpendOptionsForPower(power);
  return Array.from(article.querySelectorAll("[data-variable-spend]")).reduce(
    (total, input) => {
      const option = options[Number(input.dataset.variableSpend)];
      const quantity = Math.max(0, Math.floor(Number(input.value) || 0));
      const costPer = Number.isFinite(Number(option?.costPer))
        ? Number(option.costPer)
        : 1;
      return total + quantity * costPer;
    },
    baseCost,
  );
}

function updateVariableSpendButton(power, article, powerPoints) {
  const button = article.querySelector(".variable-spend-btn");
  if (!button) return;
  const total = variableSpendTotal(power, article);
  button.textContent = `Spend ${total} PP`;
  button.disabled = Boolean(powerPoints && total > powerPoints.current);
  button.title =
    powerPoints && total > powerPoints.current
      ? "Not enough Power Points"
      : `Spend ${total} Power Points`;
}

function powerDescriptionMarkup(power, castOptions, powerPoints) {
  const parts = [];
  if (power.shortSummary || power.notes) {
    parts.push(`<p>${esc(power.shortSummary || power.notes)}</p>`);
  } else {
    parts.push(
      '<p class="muted">No description imported yet. Add what this power does in the Arcane tab notes.</p>',
    );
  }
  if (power.restrictions) {
    parts.push(
      `<p class="catalog-warning"><strong>Restriction:</strong> ${esc(power.restrictions)}</p>`,
    );
  }
  if (power.variableCostNotes) {
    parts.push(
      `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>`,
    );
  }
  if (power.trapping) {
    parts.push(
      `<p class="muted"><strong>Trapping:</strong> ${esc(power.trapping)}</p>`,
    );
  }
  const baseOption = castOptions[0];
  const modifierOptions = castOptions.slice(1);
  if (baseOption) {
    parts.push(
      `<div class="power-primary-option${modifierOptions.length ? " has-following-options" : ""}">${powerOptionButtonMarkup(baseOption, 0, powerPoints)}</div>`,
    );
  }
  if (modifierOptions.length) {
    const modifiers = modifierOptions
      .map(
        (option, index) =>
          `<li>${powerOptionButtonMarkup(option, index + 1, powerPoints)}${option.description ? `<span>${esc(option.description)}</span>` : ""}</li>`,
      )
      .join("");
    parts.push(`<ul class="power-modifiers">${modifiers}</ul>`);
  }
  parts.push(variableSpendMarkup(power));
  return `<div class="power-description">${parts.join("")}</div>`;
}

function renderPowerCard(power, { includeDelete = false } = {}) {
  const powerPoints = powerPointResource();
  const castOptions = powerCastOptions(power);
  const article = document.createElement("article");
  article.className = `weapon-card power-card${power.active ? " active" : ""}`;
  const rankMeta = power.rank ? `Rank ${esc(power.rank)}` : "";
  const rangeMeta = power.range ? ` | Range ${esc(power.range)}` : "";
  const sourceMeta = power.source ? ` | ${esc(power.source)}` : "";
  const deleteButtonMarkup = includeDelete
    ? '<button class="edit-power-btn ghost" type="button">Edit</button><button class="delete-small delete-power-btn" type="button">×</button>'
    : "";
  const managementButtonsMarkup = deleteButtonMarkup;
  const managementMarkup = deleteButtonMarkup
    ? `<div class="weapon-actions power-actions">${managementButtonsMarkup}</div>`
    : "";
  article.innerHTML = `<div class="topline"><div><h3>${esc(power.name || "Unnamed power")}</h3><p class="meta">${rankMeta} | ${esc(power.baseCost || power.powerPoints || "—")} PP${rangeMeta} | Duration ${esc(power.duration || "—")}${sourceMeta}</p></div><span class="loaded">${power.active ? "Active" : "Ready"}</span></div>${powerDescriptionMarkup(power, castOptions, powerPoints)}${managementMarkup}`;

  const optionButtons = article.querySelectorAll(".cast-option-btn");
  const variableInputs = article.querySelectorAll("[data-variable-spend]");
  const variableSpendButton = article.querySelector(".variable-spend-btn");
  const editButton = article.querySelector(".edit-power-btn");
  const deleteButton = article.querySelector(".delete-power-btn");

  optionButtons.forEach((button) => {
    const option = castOptions[Number(button.dataset.powerOption)];
    button.disabled = Boolean(powerPoints && option.cost > powerPoints.current);
    button.title =
      powerPoints && option.cost > powerPoints.current
        ? "Not enough Power Points"
        : option.description || `Spend ${option.cost} Power Points`;
    button.onclick = () => {
      if (powerPoints && option.cost) {
        powerPoints.current = Math.max(0, powerPoints.current - option.cost);
      }
      render();
      save();
    };
  });

  variableInputs.forEach((input) => {
    input.oninput = () => updateVariableSpendButton(power, article, powerPoints);
  });
  if (variableSpendButton) {
    updateVariableSpendButton(power, article, powerPoints);
    variableSpendButton.onclick = () => {
      const total = variableSpendTotal(power, article);
      if (powerPoints && total) {
        powerPoints.current = Math.max(0, powerPoints.current - total);
      }
      render();
      save();
    };
  }

  if (editButton) {
    editButton.onclick = () => openPowerEditor(power);
  }

  if (deleteButton) {
    deleteButton.onclick = () => {
      character.powers = character.powers.filter(
        (item) => item.id !== power.id,
      );
      render();
      save();
    };
  }

  return article;
}

function renderCombatPowers() {
  els.playActivePowersList.innerHTML = "";
  if (!character.powers.length) {
    els.playActivePowersList.innerHTML = emptyState("No known powers.");
    return;
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.playActivePowersList.appendChild(renderPowerCard(power));
  });
}

function renderCombatHuckster() {
  const deal = character.hucksterDeal;
  els.combatHucksterCard.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const fields = [
    ["selectedPower", "Selected power", "text"],
    ["requiredPowerPoints", "Required PP", "number"],
    ["anteBennySpent", "Ante Benny spent", "checkbox"],
    ["gamblingRollResult", "Gambling result", "text"],
    ["cardsDrawn", "Cards drawn", "number"],
    ["pokerHand", "Poker hand", "text"],
    ["temporaryPowerPoints", "Temporary PP", "number"],
    ["shortagePenalty", "Shortage penalty", "number"],
    ["leftoverPowerPoints", "Leftover PP", "number"],
    ["backfireTriggered", "Backfire", "checkbox"],
    ["notes", "Notes", "text"],
  ];
  els.combatHucksterHelper.innerHTML = fields
    .map(([field, label, type]) => {
      if (type === "checkbox") {
        return `<label class="checkline"><input type="checkbox" data-combat-huckster="${field}" ${deal[field] ? "checked" : ""}> ${label}</label>`;
      }
      return `<label>${label}<input data-combat-huckster="${field}" type="${type}" min="0" value="${esc(deal[field] ?? "")}"></label>`;
    })
    .join("");
  els.combatHucksterHelper
    .querySelectorAll("[data-combat-huckster]")
    .forEach((input) => {
      input.oninput = input.onchange = () => {
        const field = input.dataset.combatHuckster;
        updateHucksterDealField(
          field,
          input.type === "checkbox"
            ? input.checked
            : input.type === "number"
              ? Math.max(0, Math.floor(Number(input.value) || 0))
              : input.value,
        );
      };
    });
}

function isCombatConsumable(item) {
  if (/backpack|pack|bag|sack|pouch|container/i.test(item.name || ""))
    return false;
  if (item.combatUsable || item.pinToCombat) return true;
  return /healing|unguent|elixir|restoration|dynamite|explosive|grenade|bomb|oil|tonic|potion/i.test(
    `${item.name || ""} ${item.unit || ""}`,
  );
}

function consumableConversionForGear(item) {
  if (!item) return null;
  return CONSUMABLE_GEAR_CONVERSIONS[item.id] || null;
}

function addConsumableFromGear(item, packageCount, unitsPerPackage) {
  const conversion = consumableConversionForGear(item);
  if (!conversion) return false;
  const count =
    Math.max(1, Math.floor(Number(packageCount) || 1)) *
    Math.max(
      1,
      Math.floor(Number(unitsPerPackage) || conversion.multiplier || 1),
    );
  addConsumableCount(
    conversion.id,
    conversion.name,
    conversion.unit,
    count,
    `Converted from ${item.name}.`,
  );
  return true;
}

function addConsumableCount(id, name, unit, amount, note = "") {
  const existing = character.consumables.find(
    (consumable) =>
      consumable.id === id ||
      consumable.name.toLowerCase() === String(name).toLowerCase(),
  );
  if (existing) {
    existing.count =
      Math.max(0, Math.floor(Number(existing.count) || 0)) +
      Math.max(1, Math.floor(Number(amount) || 1));
    existing.unit = unit;
    if (note && !existing.note) existing.note = note;
  } else {
    character.consumables.push({
      id,
      name,
      count: Math.max(1, Math.floor(Number(amount) || 1)),
      unit,
      note,
    });
  }
}

function consumeItem(source, item, amount) {
  item.count = Math.max(0, item.count - amount);
  if (!item.count) {
    const index = source.indexOf(item);
    if (index >= 0) source.splice(index, 1);
  }
}

function renderCombatConsumables() {
  const consumables = character.consumables
    .filter((item) => item.count > 0 && isCombatConsumable(item))
    .map((item) => ({ item, source: character.consumables }));
  const inventory = character.inventory
    .filter((item) => item.count > 0 && isCombatConsumable(item))
    .map((item) => ({ item, source: character.inventory }));
  const entries = [...consumables, ...inventory];

  els.combatConsumablesCard.classList.toggle("hidden", !entries.length);
  els.combatConsumablesList.innerHTML = "";
  if (!entries.length) return;

  entries.forEach(({ item, source }) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button></div>`;
    const input = row.querySelector("input");
    const [use, add] = row.querySelectorAll("button");
    use.onclick = () => {
      const amount = clamp(
        Math.floor(Number(input.value) || 1),
        1,
        item.count,
      );
      consumeItem(source, item, amount);
      render();
      save();
    };
    add.onclick = () => {
      item.count += Math.max(1, Math.floor(Number(input.value) || 1));
      render();
      save();
    };
    els.combatConsumablesList.appendChild(row);
  });
}

function renderCombatReminders() {
  const reminders = [];
  character.powers
    .filter((power) => power.active && power.notes)
    .forEach((power) =>
      reminders.push({
        type: "Active Power",
        name: power.name || "Power",
        text: power.notes,
      }),
    );
  Object.entries(character.conditions)
    .filter(([, active]) => active)
    .forEach(([key]) =>
      reminders.push({
        type: "Condition",
        name: displayNameFromKey(key),
        text: "Remember current condition effects.",
      }),
    );
  character.reminders
    .filter((reminder) =>
      /arcane|backlash|malfunction|huckster|backfire|combat|weapon|power/i.test(
        `${reminder.type} ${reminder.name} ${reminder.text}`,
      ),
    )
    .forEach((reminder) => reminders.push(reminder));
  if (character.hucksterDeal?.backfireTriggered) {
    reminders.push({
      type: "Huckster",
      name: "Backfire",
      text: "Backfire is marked on the current deal.",
    });
  }

  els.combatRemindersCard.classList.toggle("hidden", !reminders.length);
  els.combatRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : "";
}

function renderArcaneSummary() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneDetailSummary.innerHTML = background
    ? `<div class="row"><div><strong>${esc(background.name)}</strong><span>${esc(background.edgeName)} • ${esc(background.arcaneSkill)} (${esc(background.linkedAttribute)})</span><span>${esc(background.edgeFamily || "")}</span></div></div>`
    : powerPoints
      ? `<div class="row"><div><strong>Manual Power Points</strong><span>${powerPoints.current} / ${powerPoints.max}</span><span>${esc(powerPoints.note || "")}</span></div></div>`
      : emptyState("No arcane tools configured for this character.");

  const reminders = character.reminders.filter((reminder) =>
    /arcane|backlash|malfunction|huckster|power/i.test(
      `${reminder.type} ${reminder.name} ${reminder.text}`,
    ),
  );
  els.arcaneRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No arcane reminders.");
}

function renderNotesSummary() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  els.importWarningsList.innerHTML = importWarnings.length
    ? importWarnings.map(reminderMarkup).join("")
    : emptyState("No import warnings.");

  const longForm = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);
  els.longFormNotesList.innerHTML = longForm.length
    ? longForm
        .map(
          ([label, value]) =>
            `<article class="reminder"><div class="topline"><h3>${esc(label)}</h3></div><p>${esc(value)}</p></article>`,
        )
        .join("")
    : emptyState("No long-form character text recorded.");
}

function renderArmor() {
  els.armorLocationList.innerHTML = ARMOR_LOCATIONS.filter(
    (location) => location.id !== "shield",
  )
    .map((location) => {
      const equipped = character.armorInventory.filter(
        (armor) =>
          armor.equipped && armor.count > 0 && armor.location === location.id,
      );
      return `<div class="loc-card"><strong>${esc(location.label)} (${armorValue(location.id)})</strong><span>${equipped.map((armor) => `${esc(armor.name)} (+${armor.armor})`).join("<br>") || "—"}</span></div>`;
    })
    .join("");

  els.armorInventoryList.innerHTML = "";
  if (!character.armorInventory.length) {
    els.armorInventoryList.innerHTML = emptyState("No armor tracked yet.");
    return;
  }

  character.armorInventory.forEach((armor) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(armor.name)}</strong><span>+${armor.armor} • ${armorLabel(armor.location)} • Min Str ${esc(armor.minStr)} • Weight ${wt(armor.weight)} • Cost ${armor.costCents !== undefined ? money(armor.costCents) : "—"} each</span>${armor.note ? `<span>${esc(armor.note)}</span>` : ""}</div><div class="controls"><button>${armor.equipped ? "Equipped" : "Equip"}</button><button>&minus;</button><strong>${armor.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      armor.equipped = !armor.equipped;
      render();
      save();
    };
    buttons[1].onclick = () => {
      armor.count = Math.max(0, armor.count - 1);
      if (!armor.count) armor.equipped = false;
      render();
      save();
    };
    buttons[2].onclick = () => {
      armor.count += 1;
      render();
      save();
    };
    buttons[3].onclick = () => {
      character.armorInventory = character.armorInventory.filter(
        (item) => item.id !== armor.id,
      );
      render();
      save();
    };
    els.armorInventoryList.appendChild(row);
  });
}

function renderWeapons() {
  els.weaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.weaponList.innerHTML = emptyState("No weapons tracked yet.");
    return;
  }

  character.weapons.forEach((weapon) => {
    const fragment = els.weaponTemplate.content.cloneNode(true);
    const query = (selector) => fragment.querySelector(selector);
    query(".weapon-name").textContent = weapon.name;
    query(".weapon-details").textContent =
      `Damage ${weapon.damage || "—"} • Range ${weapon.range || "—"} • AP ${weapon.ap ?? "—"} • ROF ${weapon.rof ?? "—"} • Weight ${wt(weapon.weight)} • Min Str ${weapon.minStr || "—"} • Cost ${weapon.costCents !== undefined ? money(weapon.costCents) : "—"}`;

    const fire = query(".fire-btn");
    const load = query(".load-btn");
    const reload = query(".reload-btn");
    const unload = query(".unload-btn");
    const remove = query(".remove-btn");
    const strengthInfo = getWeaponStrengthUsageInfo(
      character.weaponStrength,
      weapon,
    );
    const warning = query(".weapon-warning");
    warning.textContent = strengthInfo.message;
    warning.classList.toggle("hidden", !strengthInfo.message);

    if (isTrackedWeapon(weapon)) {
      const reserve = character.ammo[weapon.ammoType];
      const reserveCount = reserve?.count || 0;
      query(".loaded").textContent =
        `Loaded ${weapon.shotsLoaded} / ${weapon.shotsMax}`;
      query(".weapon-notes").textContent =
        `${reserve?.label || "Ammo"} reserve: ${reserveCount}.`;
      fire.disabled = weapon.shotsLoaded <= 0;
      load.disabled =
        weapon.shotsLoaded >= weapon.shotsMax || reserveCount <= 0;
      reload.disabled = load.disabled;
      unload.disabled = weapon.shotsLoaded <= 0;
      fire.onclick = () => {
        weapon.shotsLoaded -= 1;
        render();
        save();
      };
      load.onclick = () => {
        if (!reserve) return;
        weapon.shotsLoaded += 1;
        reserve.count -= 1;
        render();
        save();
      };
      reload.onclick = () => {
        if (!reserve) return;
        const amount = Math.min(
          weapon.shotsMax - weapon.shotsLoaded,
          reserve.count,
        );
        weapon.shotsLoaded += amount;
        reserve.count -= amount;
        render();
        save();
      };
      unload.onclick = () => {
        if (!reserve) return;
        reserve.count += weapon.shotsLoaded;
        weapon.shotsLoaded = 0;
        render();
        save();
      };
    } else {
      query(".loaded").textContent = "No ammo";
      query(".weapon-notes").textContent =
        weapon.notes || "No ammunition tracking.";
      [fire, load, reload, unload].forEach(
        (button) => (button.disabled = true),
      );
    }

    remove.onclick = () => {
      if (isTrackedWeapon(weapon) && weapon.shotsLoaded > 0) {
        ensureAmmoReserve(weapon.ammoType);
        character.ammo[weapon.ammoType].count += weapon.shotsLoaded;
      }
      character.weapons = character.weapons.filter(
        (item) => item.id !== weapon.id,
      );
      render();
      save();
    };
    els.weaponList.appendChild(fragment);
  });
}

function renderAmmo() {
  els.ammoReserves.innerHTML = "";
  Object.entries(character.ammo).forEach(([key, ammo]) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${ammo.count}</strong><span>${esc(ammo.label)}</span></div><div class="controls"><button>&minus;</button><button>+</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      ammo.count = Math.max(0, ammo.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      ammo.count += 1;
      render();
      save();
    };
    els.ammoReserves.appendChild(row);
  });
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
    els.weaponAmmoTypeSelect.value,
  );
}

function renderResources() {
  els.resourcesList.innerHTML = "";
  if (!character.resources.length) {
    els.resourcesList.innerHTML = emptyState("No special resources.");
    return;
  }

  character.resources.forEach((resource) => {
    if (resource.id === "power-points") {
      appendPowerPointControls(els.resourcesList, resource, { showName: true });
      return;
    }

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>Source: ${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      resource.current = Math.max(0, resource.current - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      resource.current = resource.max
        ? Math.min(resource.max, resource.current + 1)
        : resource.current + 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      resource.current = resource.max;
      render();
      save();
    };
    els.resourcesList.appendChild(row);
  });
}

function powerPointResource() {
  return character.resources.find((resource) => resource.id === "power-points");
}

function hasPowerCatalog() {
  return (
    Array.isArray(window.POWER_CATALOG) &&
    typeof getArcaneBackgroundProfile === "function" &&
    typeof findPowerCatalogEntryById === "function"
  );
}

function powerCatalogEntries() {
  return hasPowerCatalog() ? window.POWER_CATALOG : [];
}

function knownPowerCatalogIds() {
  return new Set(character.powers.map((power) => power.catalogId).filter(Boolean));
}

function missingRequiredPower(profile) {
  if (!profile) return null;
  const knownIds = knownPowerCatalogIds();
  return (profile.requiredStartingPowers || [])
    .map((id) => findPowerCatalogEntryById(id))
    .find((power) => power && !knownIds.has(power.id));
}

function filteredCatalogPowers() {
  if (!hasPowerCatalog() || !els.powerCatalogSearch) return [];
  const profile = getArcaneBackgroundProfile(character);
  const query = normalizePowerCatalogText(els.powerCatalogSearch.value);
  const rank = els.powerRankFilter.value;
  const validOnly = els.powerValidOnlyInput.checked;
  const allowedIds = new Set(profile?.allowedPowerIds || []);
  return powerCatalogEntries().filter((power) => {
    if (validOnly && profile && !allowedIds.has(power.id)) return false;
    if (rank && power.rank !== rank) return false;
    if (
      query &&
      !normalizePowerCatalogText(
        `${power.name} ${power.shortSummary} ${power.variableCostNotes}`,
      ).includes(query)
    )
      return false;
    return true;
  }).sort(
    (left, right) =>
      powerRankValue(left.rank) - powerRankValue(right.rank) ||
      (left.basePowerPoints ?? 999) - (right.basePowerPoints ?? 999) ||
      left.name.localeCompare(right.name),
  );
}

function selectedCatalogPower() {
  if (!hasPowerCatalog() || !els.powerCatalogSelect) return null;
  return findPowerCatalogEntryById(els.powerCatalogSelect.value);
}

function getKnownPowerWarnings(character, power) {
  const warnings = [];
  const profile = hasPowerCatalog() ? getArcaneBackgroundProfile(character) : null;
  if (!profile) {
    warnings.push("No Arcane Background is selected.");
    return warnings;
  }
  if (!profile.allowedPowerIds.includes(power.id))
    warnings.push(`${power.name} is not normally allowed for ${profile.name}.`);
  if (!rankAllowsPower(character.rank, power.rank))
    warnings.push(`${power.name} requires ${power.rank} rank.`);
  if (character.powers.some((known) => known.catalogId === power.id))
    warnings.push(`${power.name} is already a known power.`);
  const restriction = powerRestrictionForProfile(power, profile);
  if (restriction) warnings.push(restriction);
  return warnings;
}

function catalogPowerPreviewMarkup(power) {
  if (!power) return emptyState("Choose a catalog power.");
  const profile = getArcaneBackgroundProfile(character);
  const restriction = powerRestrictionForProfile(power, profile);
  return `<div class="catalog-preview-card"><div class="topline"><div><h3>${esc(power.name)}</h3><p class="meta">${esc(power.rank)} • ${esc(power.powerPoints)} PP • Range ${esc(power.range)} • Duration ${esc(power.duration)}</p></div><span class="pill">${esc(power.source)}</span></div><p>${esc(power.shortSummary)}</p>${power.variableCostNotes ? `<p class="muted"><strong>Variable PP:</strong> ${esc(power.variableCostNotes)}</p>` : ""}${restriction ? `<p class="catalog-warning"><strong>Restriction:</strong> ${esc(restriction)}</p>` : ""}<p class="muted">Allowed: ${esc(power.allowedBackgrounds.join(", "))}</p></div>`;
}

function renderPowerSetupNotice() {
  if (!els.powerSetupNotice || !els.addRequiredPowerBtn) return;
  const profile = hasPowerCatalog() ? getArcaneBackgroundProfile(character) : null;
  if (!profile) {
    els.powerSetupNotice.classList.remove("hidden");
    els.powerSetupNotice.textContent =
      "Select an Arcane Background before choosing catalog powers. Marshal override still allows custom additions.";
    els.addRequiredPowerBtn.classList.add("hidden");
    return;
  }
  const missing = missingRequiredPower(profile);
  els.powerSetupNotice.classList.remove("hidden");
  els.powerSetupNotice.textContent = `${profile.notes} Known powers: ${character.powers.length} / ${profile.startingPowerCount} starting powers.`;
  els.addRequiredPowerBtn.classList.toggle("hidden", !missing);
  if (missing) els.addRequiredPowerBtn.textContent = `Add Required Power: ${missing.name}`;
}

function renderPowerCatalogPicker() {
  if (
    !els.powerCatalogSelect ||
    !els.powerCatalogPreview ||
    !els.powerCatalogWarning
  )
    return;
  if (!hasPowerCatalog()) {
    els.powerCatalogSelect.innerHTML =
      '<option value="">Power catalog unavailable</option>';
    els.powerCatalogPreview.innerHTML = emptyState(
      "Power catalog is unavailable. Manual powers still work.",
    );
    return;
  }
  renderPowerSetupNotice();
  const powers = filteredCatalogPowers();
  const previous = els.powerCatalogSelect.value;
  els.powerCatalogSelect.innerHTML = powers.length
    ? powers
        .map(
          (power) =>
            `<option value="${esc(power.id)}">${esc(power.name)} • ${esc(power.rank)} • ${esc(power.powerPoints)} PP</option>`,
        )
        .join("")
    : '<option value="">No matching powers</option>';
  if (powers.some((power) => power.id === previous))
    els.powerCatalogSelect.value = previous;
  const selected = selectedCatalogPower();
  const warnings = selected ? getKnownPowerWarnings(character, selected) : [];
  els.powerCatalogWarning.innerHTML = warnings.length
    ? warnings.map((warning) => `<p>${esc(warning)}</p>`).join("")
    : "";
  els.powerCatalogPreview.innerHTML = catalogPowerPreviewMarkup(selected);
  renderHucksterAvailablePowers();
}

function renderHucksterAvailablePowers() {
  if (!els.hucksterAvailablePowers || !hasPowerCatalog()) return;
  const profile = getArcaneBackgroundProfile(character);
  els.hucksterAvailablePowers.classList.toggle(
    "hidden",
    profile?.id !== "huckster",
  );
  if (profile?.id !== "huckster") return;
  const knownIds = knownPowerCatalogIds();
  const available = getAllowedPowersForCharacter(character)
    .filter((power) => !knownIds.has(power.id))
    .slice(0, 60);
  els.hucksterAvailablePowers.innerHTML = `<h3>Deal with the Devil Available Powers</h3><p class="muted">These are available to Hucksters through Deal with the Devil. They are not automatically Known Powers.</p><div class="catalog-chip-list">${available.map((power) => `<span>${esc(power.name)}</span>`).join("")}</div>`;
}

function renderPowers() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneSummary.textContent = background
    ? `${background.name} • ${background.arcaneSkill}`
    : powerPoints
      ? "Manual Power Points"
      : "No Arcane Background";
  renderPowerCatalogPicker();
  els.powersList.innerHTML = "";
  if (!character.powers.length) {
    els.powersList.innerHTML = emptyState("No powers tracked yet.");
    return;
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.powersList.appendChild(renderPowerCard(power, { includeDelete: true }));
  });
}

function renderHucksterDeal() {
  const deal = character.hucksterDeal;
  els.hucksterDealPanel.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const values = {
    hucksterSelectedPower: deal.selectedPower,
    hucksterRequiredPowerPoints: deal.requiredPowerPoints,
    hucksterGamblingRollResult: deal.gamblingRollResult,
    hucksterCardsDrawn: deal.cardsDrawn,
    hucksterPokerHand: deal.pokerHand,
    hucksterTemporaryPowerPoints: deal.temporaryPowerPoints,
    hucksterShortagePenalty: deal.shortagePenalty,
    hucksterLeftoverPowerPoints: deal.leftoverPowerPoints,
    hucksterNotes: deal.notes,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (document.activeElement !== els[key]) els[key].value = value ?? "";
  });
  els.hucksterAnteBennySpent.checked = Boolean(deal.anteBennySpent);
  els.hucksterUsedJoker.checked = Boolean(deal.usedJoker);
  els.hucksterBackfireTriggered.checked = Boolean(deal.backfireTriggered);
}

function renderConditions() {
  if (!els.conditionsList) return;
  els.conditionsList.innerHTML = "";
  Object.entries(character.conditions).forEach(([key, value]) => {
    const label = document.createElement("label");
    label.className = `condition${value ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${value ? "checked" : ""}><span>${esc(key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.conditionsList.appendChild(label);
  });
}

function counterList(container, items, unitFn, emptyText) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = emptyState(emptyText);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong>${unitFn(item)}</div><div class="controls"><button>&minus;</button><strong>${item.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      item.count = Math.max(0, item.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      item.count += 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      items.splice(items.indexOf(item), 1);
      render();
      save();
    };
    container.appendChild(row);
  });
}

function renderConsumables() {
  els.consumablesList.innerHTML = "";
  const consumables = character.consumables.filter((item) => item.count > 0);
  const hasMatches = consumables.some(
    (item) => item.id === "matches" || /^matches$/i.test(item.name || ""),
  );
  if (!consumables.length) {
    els.consumablesList.innerHTML = emptyState("No consumables tracked.");
  }

  consumables.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button><button class="delete-small" type="button">×</button></div>`;
    const input = row.querySelector("input");
    const [use, add, remove] = row.querySelectorAll("button");
    use.onclick = () => {
      const amount = clamp(
        Math.floor(Number(input.value) || 1),
        1,
        item.count,
      );
      consumeItem(character.consumables, item, amount);
      render();
      save();
    };
    add.onclick = () => {
      item.count += Math.max(1, Math.floor(Number(input.value) || 1));
      render();
      save();
    };
    remove.onclick = () => {
      character.consumables.splice(character.consumables.indexOf(item), 1);
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  });

  if (!hasMatches) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>Matches</strong><span>0 matches</span></div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of matches to add"><button type="button">Add</button></div>`;
    const input = row.querySelector("input");
    row.querySelector("button").onclick = () => {
      addConsumableCount(
        "matches",
        "Matches",
        "matches",
        Math.max(1, Math.floor(Number(input.value) || 1)),
      );
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  }
}

function renderInventory() {
  counterList(
    els.inventoryList,
    character.inventory,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Weight ${wt(item.weight)} each • Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No inventory tracked yet.",
  );
}

function renderVehicles() {
  counterList(
    els.vehicleList,
    character.vehicles,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No vehicles tracked yet.",
  );
}

function renderReminders() {
  const reminders = character.reminders.filter(
    (reminder) => reminder.type !== "Import Warning",
  );
  els.remindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No reminders recorded.");
}

function addInventory() {
  const catalogItem = chosen(GEAR_CATALOG, els.gearSelect.value);
  const name = els.inventoryNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const conversion = consumableConversionForGear(catalogItem);
  const unitsPerPackage = conversion?.unitsLabel
    ? Math.max(
        1,
        Math.floor(
          Number(els.inventoryUnitsInput.value) || conversion.multiplier || 1,
        ),
      )
    : conversion?.multiplier;
  const addedConsumable = addConsumableFromGear(
    catalogItem,
    count,
    unitsPerPackage,
  );
  if (addedConsumable) {
    els.gearSelect.value = "";
    els.inventoryNameInput.value = "";
    els.inventoryCountInput.value = "";
    els.inventoryUnitsInput.value = "";
    els.inventoryNoteInput.value = "";
    els.gearAddForm.classList.add("hidden");
    updatePreviews();
    render();
    save();
    return;
  }
  const id = catalogItem?.id || slugify(name);
  const existing = character.inventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.inventory.push({
      id,
      name,
      count,
      note: els.inventoryNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book,
    });
  els.gearSelect.value = "";
  els.inventoryNameInput.value = "";
  els.inventoryCountInput.value = "";
  els.inventoryUnitsInput.value = "";
  els.inventoryNoteInput.value = "";
  els.gearAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addVehicle() {
  const catalogItem = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  const name = els.vehicleNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(1, Math.floor(Number(els.vehicleQtyInput.value) || 1));
  const id = catalogItem?.id || slugify(name);
  const existing = character.vehicles.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.vehicles.push({
      id,
      name,
      count,
      note: els.vehicleNoteInput.value.trim(),
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
    });
  els.vehicleCatalogSelect.value = "";
  els.vehicleNameInput.value = "";
  els.vehicleQtyInput.value = "";
  els.vehicleNoteInput.value = "";
  els.vehicleAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addAmmo() {
  const catalogItem = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  const label = els.ammoLabelInput.value.trim() || catalogItem?.name;
  if (!label) return;
  const selectedCaliber = normalizeCaliber(els.ammoCaliberSelect.value);
  const exactKey = exactAmmoTypeForCatalogAmmo(catalogItem, selectedCaliber);
  const key = exactKey || catalogItem?.id || slugify(label);
  const count = Math.max(1, Math.floor(Number(els.ammoCountInput.value) || 1));
  if (character.ammo[key]) character.ammo[key].count += count;
  else
    character.ammo[key] = {
      label:
        AMMO_KIND_BY_CATALOG_ID[catalogItem?.id] && selectedCaliber
          ? ammoLabel(AMMO_KIND_BY_CATALOG_ID[catalogItem.id], selectedCaliber)
          : label,
      count,
      caliber: selectedCaliber || undefined,
      kind: AMMO_KIND_BY_CATALOG_ID[catalogItem?.id],
      note: els.ammoNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
    };
  els.ammoGearSelect.value = "";
  els.ammoLabelInput.value = "";
  els.ammoCountInput.value = "";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
  els.ammoNoteInput.value = "";
  els.ammoAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addArmor() {
  const catalogItem = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  const name = els.armorNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const id = catalogItem?.id || slugify(name);
  const existing = character.armorInventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  const count = Math.max(1, Math.floor(Number(els.armorCountInput.value) || 1));
  const armor = Math.max(
    0,
    Math.floor(Number(els.armorValueInput.value || catalogItem?.armor || 1)),
  );
  if (existing) {
    existing.count += count;
    existing.armor = armor;
    existing.location = els.armorLocationSelect.value;
    existing.equipped = true;
  } else {
    character.armorInventory.push({
      id,
      name,
      count,
      armor,
      location:
        els.armorLocationSelect.value || catalogItem?.location || "torso",
      equipped: true,
      weight: catalogItem?.weight,
      minStr: catalogItem?.minStr,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
      note: "Purchased armor.",
    });
  }
  els.armorCatalogSelect.value = "";
  els.armorNameInput.value = "";
  els.armorCountInput.value = "";
  els.armorValueInput.value = "";
  els.armorAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addWeapon() {
  const catalogItem = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  const name = els.weaponNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const quantity = Math.max(
    1,
    Math.floor(Number(els.weaponQtyInput.value) || 1),
  );
  const capacity = Math.max(
    0,
    Math.floor(Number(els.weaponCapacityInput.value) || 0),
  );
  const selectedAmmoType = capacity > 0 ? els.weaponAmmoTypeSelect.value : "";
  const ammoType = selectedAmmoType
    ? exactAmmoTypeForWeapon({ ...catalogItem, ammoType: selectedAmmoType })
    : "";
  if (ammoType) ensureAmmoReserve(ammoType);
  for (let index = 0; index < quantity; index += 1) {
    character.weapons.push({
      id: `${catalogItem?.id || slugify(name)}-${Date.now()}-${index}`,
      catalogId: catalogItem?.id,
      name,
      damage: els.weaponDamageInput.value.trim() || catalogItem?.damage || "—",
      range: els.weaponRangeInput.value.trim() || catalogItem?.range || "—",
      ap:
        els.weaponApInput.value === ""
          ? catalogItem?.ap || "—"
          : Number(els.weaponApInput.value),
      rof: els.weaponRofInput.value.trim() || catalogItem?.rof || "—",
      shotsMax: capacity && ammoType ? capacity : null,
      shotsLoaded: capacity && ammoType ? capacity : null,
      ammoType: capacity && ammoType ? ammoType : null,
      notes: catalogItem?.notes || "",
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      minStr: catalogItem?.minStr,
      book: catalogItem?.book || "Deadlands",
    });
  }
  els.weaponCatalogSelect.value = "";
  els.weaponNameInput.value = "";
  els.weaponQtyInput.value = "";
  els.weaponDamageInput.value = "";
  els.weaponRangeInput.value = "";
  els.weaponApInput.value = "";
  els.weaponRofInput.value = "";
  els.weaponCapacityInput.value = "";
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  els.weaponAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addPower() {
  const name = els.powerNameInput.value.trim();
  if (!name) return;
  const existing = powerEditingId
    ? character.powers.find((power) => power.id === powerEditingId)
    : character.powers.find(
        (power) => power.name.toLowerCase() === name.toLowerCase(),
      );
  const data = {
    name,
    baseCost: els.powerCostInput.value.trim(),
    powerPoints: els.powerCostInput.value.trim(),
    range: els.powerRangeInput.value.trim(),
    duration: els.powerDurationInput.value.trim(),
    source: els.powerSourceInput.value.trim() || "Manual power",
    trapping: els.powerTrappingInput.value.trim(),
    shortSummary: els.powerSummaryInput.value.trim(),
    notes: els.powerNotesInput.value.trim(),
    arcaneBackground: character.arcaneBackground?.name || "",
    addedReason: "custom-homebrew",
    isCustom: true,
  };
  if (existing) Object.assign(existing, data);
  else
    character.powers.push(
      normalizePowerRecord(
        {
          id: `${slugify(name)}-${Date.now()}`,
          rank: "Novice",
          active: false,
          modifiers: [],
          ...data,
        },
        character.powers.length,
        data.source,
      ),
    );

  els.powerNameInput.value = "";
  els.powerCostInput.value = "";
  els.powerRangeInput.value = "";
  els.powerDurationInput.value = "";
  els.powerSourceInput.value = "";
  els.powerTrappingInput.value = "";
  els.powerSummaryInput.value = "";
  els.powerNotesInput.value = "";
  powerEditingId = "";
  render();
  save();
}

function addCatalogPower(power = selectedCatalogPower(), options = {}) {
  if (!hasPowerCatalog() || !power) return;
  const warnings = getKnownPowerWarnings(character, power);
  const duplicate = character.powers.some(
    (known) => known.catalogId === power.id,
  );
  let marshalOverride = Boolean(els.powerMarshalOverrideInput?.checked);
  if (
    duplicate &&
    !marshalOverride &&
    !confirm(`${power.name} is already known. Add another copy anyway?`)
  )
    return;
  if (warnings.length && !marshalOverride) {
    const proceed = confirm(
      `${warnings.join("\n")}\n\nAdd anyway as a Marshal override?`,
    );
    if (!proceed) return;
    marshalOverride = true;
  }
  character.powers.push(
    normalizePowerRecord(
      createKnownPowerFromCatalog(power, character, {
        addedReason:
          options.addedReason ||
          (marshalOverride ? "marshal-override" : "new-powers-edge"),
      }),
      character.powers.length,
      character.arcaneBackground?.edgeName,
    ),
  );
  render();
  save();
}

function addRequiredPower() {
  const missing = missingRequiredPower(getArcaneBackgroundProfile(character));
  if (missing) addCatalogPower(missing, { addedReason: "starting-power" });
}

function openPowerEditor(power) {
  powerEditingId = power.id;
  els.powerNameInput.value = power.name || "";
  els.powerCostInput.value = power.baseCost || power.powerPoints || "";
  els.powerRangeInput.value = power.range || "";
  els.powerDurationInput.value = power.duration || "";
  els.powerSourceInput.value = power.source || "";
  els.powerTrappingInput.value = power.trapping || "";
  els.powerSummaryInput.value = power.shortSummary || "";
  els.powerNotesInput.value = power.notes || "";
  els.powerAddForm.classList.remove("hidden");
  els.powerNameInput.focus();
}

function addManualPowerPoints() {
  if (powerPointResource()) return;
  const max = Math.max(
    0,
    Math.floor(Number(prompt("Maximum Power Points?", "15")) || 0),
  );
  character.resources.push(
    makePowerPointResource(null, {
      current: max,
      max,
      source: "Manual setup",
      note: "House rule, custom character, or manual post-import setup.",
    }),
  );
  render();
  save();
}

function setEntryWarning(element, warnings) {
  element.textContent = warnings.join(" ");
  element.classList.toggle("hidden", !warnings.length);
}

function applyEdgeCatalogSelection(edge) {
  els.edgeCatalogSelect.value = edge.catalogId || "";
  els.edgeNameInput.value = edge.name || "";
  selectKnownValue(els.edgeCategoryInput, edge.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge.rank, "Unknown");
  els.edgeSourceInput.value = edge.source || "Deadlands: The Weird West";
  els.edgeRequirementsInput.value = entryTextValue(edge.requirements);
  els.edgeSubchoiceInput.value = edge.subchoice || "";
  els.edgeSummaryInput.value = edge.shortSummary || edge.summary || "";
  els.edgeNotesInput.value = edge.notes || "";
  setEntryWarning(els.edgeWarningText, []);
}

function applyHindranceCatalogSelection(hindrance) {
  els.hindranceCatalogSelect.value = hindrance.catalogId || "";
  els.hindranceNameInput.value = hindrance.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance.severity, "Unknown");
  els.hindranceSourceInput.value =
    hindrance.source || "Deadlands: The Weird West";
  els.hindranceSummaryInput.value =
    hindrance.shortSummary || hindrance.summary || "";
  els.hindranceNotesInput.value = hindrance.notes || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function chooseEdgeCatalogEntry() {
  const entry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  if (!entry) return;
  applyEdgeCatalogSelection({ ...entry, catalogId: entry.id });
}

function chooseHindranceCatalogEntry() {
  const entry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  if (!entry) return;
  applyHindranceCatalogSelection({ ...entry, catalogId: entry.id });
}

function resetEdgeEditor(edge = null) {
  edgeEditingId = edge?.id || "";
  els.edgeEditorTitle.textContent = edge ? "Edit Edge" : "Add Edge";
  els.saveEdgeBtn.textContent = edge ? "Save Edge" : "Add Edge";
  els.edgeCatalogSelect.value = edge?.catalogId || "";
  els.edgeNameInput.value = edge?.name || "";
  selectKnownValue(els.edgeCategoryInput, edge?.category, "Unknown");
  selectKnownValue(els.edgeRankInput, edge?.rank, "Unknown");
  els.edgeSourceInput.value = edge?.source || "Manual";
  els.edgeRequirementsInput.value = entryTextValue(edge?.requirements);
  els.edgeSubchoiceInput.value = edge?.subchoice || "";
  els.edgeSummaryInput.value = edge?.shortSummary || edge?.summary || "";
  els.edgeNotesInput.value = edge?.notes || edge?.text || "";
  setEntryWarning(els.edgeWarningText, []);
}

function openEdgeEditor(edge = null) {
  resetEdgeEditor(edge);
  els.edgeEditorPanel.classList.remove("hidden");
  els.edgeNameInput.focus();
}

function closeEdgeEditor() {
  edgeEditingId = "";
  els.edgeEditorPanel.classList.add("hidden");
  setEntryWarning(els.edgeWarningText, []);
}

function edgeDraftFromForm() {
  const existing = character.edges.find((edge) => edge.id === edgeEditingId);
  const catalogEntry = chosen(EDGE_CATALOG, els.edgeCatalogSelect.value);
  const id = edgeEditingId || uniqueEntryId(
    generateStableEntryId("edge", els.edgeNameInput.value.trim() || "edge"),
    new Set(character.edges.map((edge) => edge.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.edgeNameInput.value.trim(),
    type: "edge",
    category: els.edgeCategoryInput.value || "Unknown",
    rank: els.edgeRankInput.value || "Unknown",
    requirements: els.edgeRequirementsInput.value.trim(),
    shortSummary: els.edgeSummaryInput.value.trim(),
    notes: els.edgeNotesInput.value.trim(),
    source: els.edgeSourceInput.value.trim() || "Manual",
    subchoice: els.edgeSubchoiceInput.value.trim(),
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

function saveEdgeEditor() {
  const draft = edgeDraftFromForm();
  const warnings = getEdgeWarnings(character, draft, edgeEditingId);
  setEntryWarning(els.edgeWarningText, warnings);
  if (
    warnings.length &&
    !confirm(`${warnings.join("\n")}\n\nSave this Edge anyway?`)
  )
    return;
  upsertEdge(character, draft);
  closeEdgeEditor();
  render();
  save();
}

function resetHindranceEditor(hindrance = null) {
  hindranceEditingId = hindrance?.id || "";
  els.hindranceEditorTitle.textContent = hindrance
    ? "Edit Hindrance"
    : "Add Hindrance";
  els.saveHindranceBtn.textContent = hindrance
    ? "Save Hindrance"
    : "Add Hindrance";
  els.hindranceCatalogSelect.value = hindrance?.catalogId || "";
  els.hindranceNameInput.value = hindrance?.name || "";
  selectKnownValue(els.hindranceSeverityInput, hindrance?.severity, "Unknown");
  els.hindranceSourceInput.value = hindrance?.source || "Manual";
  els.hindranceSummaryInput.value =
    hindrance?.shortSummary || hindrance?.summary || "";
  els.hindranceNotesInput.value = hindrance?.notes || hindrance?.text || "";
  setEntryWarning(els.hindranceWarningText, []);
}

function openHindranceEditor(hindrance = null) {
  resetHindranceEditor(hindrance);
  els.hindranceEditorPanel.classList.remove("hidden");
  els.hindranceNameInput.focus();
}

function closeHindranceEditor() {
  hindranceEditingId = "";
  els.hindranceEditorPanel.classList.add("hidden");
  setEntryWarning(els.hindranceWarningText, []);
}

function hindranceDraftFromForm() {
  const existing = character.hindrances.find(
    (hindrance) => hindrance.id === hindranceEditingId,
  );
  const catalogEntry = chosen(HINDRANCE_CATALOG, els.hindranceCatalogSelect.value);
  const id = hindranceEditingId || uniqueEntryId(
    generateStableEntryId(
      "hindrance",
      els.hindranceNameInput.value.trim() || "hindrance",
    ),
    new Set(character.hindrances.map((hindrance) => hindrance.id)),
  );
  return {
    ...(existing || {}),
    id,
    name: els.hindranceNameInput.value.trim(),
    type: "hindrance",
    severity: els.hindranceSeverityInput.value || "Unknown",
    shortSummary: els.hindranceSummaryInput.value.trim(),
    notes: els.hindranceNotesInput.value.trim(),
    source: els.hindranceSourceInput.value.trim() || "Manual",
    catalogId: catalogEntry?.id || existing?.catalogId || "",
    isCustom: catalogEntry ? false : existing ? Boolean(existing.isCustom) : true,
  };
}

function saveHindranceEditor() {
  const draft = hindranceDraftFromForm();
  const warnings = getHindranceWarnings(character, draft, hindranceEditingId);
  setEntryWarning(els.hindranceWarningText, warnings);
  if (
    warnings.length &&
    !confirm(`${warnings.join("\n")}\n\nSave this Hindrance anyway?`)
  )
    return;
  upsertHindrance(character, draft);
  closeHindranceEditor();
  render();
  save();
}

function handleEntryAction(target) {
  const actionName = target.dataset.entryAction;
  const type = target.dataset.entryType;
  const id = target.dataset.entryId;
  if (type === "edge") {
    const edge = character.edges.find((item) => item.id === id);
    if (!edge) return;
    if (actionName === "edit") openEdgeEditor(edge);
    if (
      actionName === "remove" &&
      confirm(`Remove Edge "${edge.name || "Unnamed Edge"}"?`)
    ) {
      removeEdge(character, id);
      render();
      save();
    }
  }
  if (type === "hindrance") {
    const hindrance = character.hindrances.find((item) => item.id === id);
    if (!hindrance) return;
    if (actionName === "edit") openHindranceEditor(hindrance);
    if (
      actionName === "remove" &&
      confirm(`Remove Hindrance "${hindrance.name || "Unnamed Hindrance"}"?`)
    ) {
      removeHindrance(character, id);
      render();
      save();
    }
  }
}

function updateHucksterDealField(field, value) {
  if (!character.hucksterDeal) character.hucksterDeal = makeHucksterDeal();
  character.hucksterDeal[field] = value;
  character.hucksterDeal = normalizeHucksterDeal(character.hucksterDeal);
  save();
}

function action(type) {
  switch (type) {
    case "incWounds":
      character.damage.wounds = clamp(
        character.damage.wounds + 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "decWounds":
      character.damage.wounds = clamp(
        character.damage.wounds - 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "incFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue + 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "decFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue - 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "incBennies":
      character.bennies.current += 1;
      break;
    case "decBennies":
      character.bennies.current = Math.max(0, character.bennies.current - 1);
      break;
    case "incConviction":
      character.conviction += 1;
      break;
    case "decConviction":
      character.conviction = Math.max(0, character.conviction - 1);
      break;
    default:
      return;
  }
  render();
  save();
}

function exportJson(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJsonText(text) {
  const data = JSON.parse(text);
  if (data.activeCharacter) {
    character = normalize(data.activeCharacter);
    if (data.creationDraft) {
      creationDraft = normalizeDraft(data.creationDraft);
      saveCreationDraft();
    }
  } else if (data.creationDraft) {
    creationDraft = normalizeDraft(data.creationDraft);
    saveCreationDraft();
    setCreatorMode(true);
  } else {
    character = isSavagedUsExport(data) ? fromSavagedUs(data) : normalize(data);
  }
  render();
  save();
}

function alertInvalidImport() {
  alert(
    "That was not valid tracker, full app state, creation draft, or Savaged.us character JSON.",
  );
}

function closeHeaderMenu() {
  els.headerToolsMenu.open = false;
}

document.addEventListener("click", (event) => {
  if (event.target?.dataset?.action) action(event.target.dataset.action);
  const entryAction = event.target?.closest?.("[data-entry-action]");
  if (entryAction) handleEntryAction(entryAction);
  if (event.target?.dataset?.toggleForm) {
    const form = document.getElementById(event.target.dataset.toggleForm);
    form?.classList.toggle("hidden");
  }
  if (event.target?.closest?.(".header-actions button")) closeHeaderMenu();
  if (!event.target?.closest?.(".header-tools")) closeHeaderMenu();
});

els.armorSelect.onchange = () => {
  character.selectedArmorLocation = els.armorSelect.value;
  render();
  save();
};
els.addMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents += centsValue;
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.spendMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents = Math.max(0, character.moneyCents - centsValue);
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.addInventoryBtn.onclick = addInventory;
els.cancelInventoryAddBtn.onclick = () => {
  els.inventoryUnitsInput.value = "";
  updatePreviews();
  els.gearAddForm.classList.add("hidden");
};
els.addVehicleBtn.onclick = addVehicle;
els.cancelVehicleAddBtn.onclick = () => {
  els.vehicleAddForm.classList.add("hidden");
};
els.addAmmoBtn.onclick = addAmmo;
els.cancelAmmoAddBtn.onclick = () => {
  els.ammoAddForm.classList.add("hidden");
};
els.addArmorBtn.onclick = addArmor;
els.cancelArmorAddBtn.onclick = () => {
  els.armorAddForm.classList.add("hidden");
};
els.addWeaponBtn.onclick = addWeapon;
els.cancelWeaponAddBtn.onclick = () => {
  els.weaponAddForm.classList.add("hidden");
};
els.addPowerBtn.onclick = addPower;
if (els.addCatalogPowerBtn) els.addCatalogPowerBtn.onclick = () => addCatalogPower();
if (els.addRequiredPowerBtn) els.addRequiredPowerBtn.onclick = addRequiredPower;
[
  els.powerCatalogSearch,
  els.powerRankFilter,
  els.powerValidOnlyInput,
  els.powerCatalogSelect,
].filter(Boolean).forEach((input) => {
  input.oninput = renderPowerCatalogPicker;
  input.onchange = renderPowerCatalogPicker;
});
els.addManualPowerPointsBtn.onclick = addManualPowerPoints;
els.showEdgeFormBtn.onclick = () => openEdgeEditor();
els.edgeCatalogSelect.onchange = chooseEdgeCatalogEntry;
els.saveEdgeBtn.onclick = saveEdgeEditor;
els.cancelEdgeEditBtn.onclick = closeEdgeEditor;
els.showHindranceFormBtn.onclick = () => openHindranceEditor();
els.hindranceCatalogSelect.onchange = chooseHindranceCatalogEntry;
els.saveHindranceBtn.onclick = saveHindranceEditor;
els.cancelHindranceEditBtn.onclick = closeHindranceEditor;
[
  els.gearSelect,
  els.ammoGearSelect,
  els.ammoCaliberSelect,
  els.armorCatalogSelect,
  els.weaponCatalogSelect,
  els.vehicleCatalogSelect,
].forEach((select) => {
  select.onchange = updatePreviews;
});
[els.inventoryCountInput, els.inventoryUnitsInput].forEach((input) => {
  input.oninput = updatePreviews;
});
els.notesArea.oninput = () => {
  character.notes = els.notesArea.value;
  save();
};
els.clearTempConditionsBtn.onclick = () => {
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
[
  ["hucksterSelectedPower", "selectedPower", "text"],
  ["hucksterRequiredPowerPoints", "requiredPowerPoints", "number"],
  ["hucksterGamblingRollResult", "gamblingRollResult", "text"],
  ["hucksterCardsDrawn", "cardsDrawn", "number"],
  ["hucksterPokerHand", "pokerHand", "text"],
  ["hucksterTemporaryPowerPoints", "temporaryPowerPoints", "number"],
  ["hucksterShortagePenalty", "shortagePenalty", "number"],
  ["hucksterLeftoverPowerPoints", "leftoverPowerPoints", "number"],
  ["hucksterNotes", "notes", "text"],
].forEach(([elementKey, field, type]) => {
  els[elementKey].oninput = () => {
    const raw = els[elementKey].value;
    updateHucksterDealField(
      field,
      type === "number" ? Math.max(0, Math.floor(Number(raw) || 0)) : raw,
    );
  };
});
[
  ["hucksterAnteBennySpent", "anteBennySpent"],
  ["hucksterUsedJoker", "usedJoker"],
  ["hucksterBackfireTriggered", "backfireTriggered"],
].forEach(([elementKey, field]) => {
  els[elementKey].onchange = () => {
    updateHucksterDealField(field, els[elementKey].checked);
  };
});
els.newSessionBtn.onclick = () => {
  if (
    !confirm(
      "Start a new play session? This resets bennies to starting, clears conviction, refills resources, and clears temporary conditions.",
    )
  )
    return;
  character.bennies.current = character.bennies.starting;
  character.conviction = 0;
  character.resources.forEach((resource) => (resource.current = resource.max));
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
els.resetBtn.onclick = () => {
  if (confirm("Reset tracker to defaults?")) {
    character = normalize(clone(defaultCharacter));
    localStorage.removeItem(STORAGE_KEY);
    render();
    save();
  }
};
els.exportBtn.onclick = () => {
  exportJson(
    `${slugify(character.name || "character")}-tracker.json`,
    character,
  );
};
els.importFile.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importJsonText(reader.result);
      els.importFile.value = "";
      closeHeaderMenu();
    } catch {
      alertInvalidImport();
    }
  };
  reader.readAsText(file);
};
els.pasteImportBtn.onclick = () => {
  els.pasteImportPanel.classList.toggle("hidden");
  if (!els.pasteImportPanel.classList.contains("hidden"))
    els.importJsonText.focus();
};
els.cancelPasteImportBtn.onclick = () => {
  els.importJsonText.value = "";
  els.pasteImportPanel.classList.add("hidden");
};
els.confirmPasteImportBtn.onclick = () => {
  try {
    importJsonText(els.importJsonText.value.trim());
    els.importJsonText.value = "";
    els.pasteImportPanel.classList.add("hidden");
  } catch {
    alertInvalidImport();
  }
};

// src/savaged-import.js
function arr(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function cents(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 100) : undefined;
}

function savagedMoney(data) {
  if (Number.isFinite(Number(data.wealth))) return cents(data.wealth);

  const parsed = Number(
    String(data.wealthFormatted || "").replace(/[^0-9.-]/g, ""),
  );
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}

function savagedBook(item) {
  return item.bookName && item.bookName !== "Custom"
    ? item.bookName
    : "Deadlands";
}

function savagedAmmoKey(item) {
  const text = `${item?.name || ""} ${item?.notes || ""}`.toLowerCase();
  if (/shotgun|shell/.test(text)) return "shotgun-shells";
  if (/arrow/.test(text)) return "arrow";
  if (/cap/.test(text)) return "percussion-caps";
  if (/rifle.*small/.test(text))
    return ammoKey("rifle", caliberFromText(text) || ".44");
  if (/rifle.*large/.test(text))
    return ammoKey("rifle", caliberFromText(text) || ".50");
  if (/pistol.*large/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".44");
  if (/pistol.*small/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".38");
  return slugify(item?.name || "ammo");
}

function isSavagedAmmo(item) {
  return /ammunition|ammo|shell|arrow|percussion cap/i.test(
    `${item?.name || ""} ${item?.notes || ""}`,
  );
}

function savagedWeaponAmmo(weapon) {
  const text = `${weapon?.name || ""} ${weapon?.notes || ""}`.toLowerCase();
  if (/shotgun|scattergun/.test(text)) return "shotgun-shells";
  if (/bow/.test(text)) return "arrow";
  if (/\.22|\.32|\.36|\.38/.test(text))
    return ammoKey("pistol", caliberFromText(text) || ".38");
  if (
    /\.40|\.41|\.44|\.45|\.50|44-40/.test(text) &&
    !/rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(text)
  )
    return ammoKey("pistol", caliberFromText(text) || ".44");
  if (
    /rifle|winchester|sharps|spencer|ballard|bullard|musket|carbine/.test(text)
  ) {
    if (/\.50|\.56|\.57|\.58/.test(text))
      return ammoKey("rifle", caliberFromText(text) || ".50");
    return ammoKey("rifle", caliberFromText(text) || ".44");
  }
  return "";
}

function armorLocationFromSavaged(armor) {
  const checks = [
    ["head", "coversHead"],
    ["face", "coversFace"],
    ["torso", "coversTorso"],
    ["arms", "coversArms"],
    ["legs", "coversLegs"],
  ];
  const match = checks.find(([, key]) => armor?.[key]);
  return match ? match[0] : "torso";
}

function flattenSavagedGear(items, path = "", output = []) {
  arr(items).forEach((gear) => {
    output.push({ ...gear, containerPath: path });
    const nextPath = path ? `${path} > ${gear.name}` : gear.name;
    flattenSavagedGear(gear?.contains?.gear, nextPath, output);
  });
  return output;
}

function savagedReminder(type, item) {
  return {
    type,
    name: item.name || type,
    text: item.description || item.summary || item.notes || "",
  };
}

function savagedPowerNotes(arcaneBackground) {
  const powers = arr(arcaneBackground.powers)
    .map(
      (power) =>
        `${power.name}${Number.isFinite(Number(power.powerPoints)) ? ` (${power.powerPoints} PP)` : ""}`,
    )
    .join(", ");

  return [
    `${arcaneBackground.name || "Arcane Background"}${arcaneBackground.arcaneSkill ? ` • ${arcaneBackground.arcaneSkill}` : ""}`,
    powers ? `Powers: ${powers}` : "",
  ]
    .filter(Boolean)
    .join(". ");
}

function savagedArcaneBackgroundConfig(data) {
  const candidates = [
    ...arr(data.abs).map(
      (background) => background.name || background.edgeName,
    ),
    ...arr(data.edges).map((edge) => edge.name),
  ];
  const key = candidates.map(arcaneBackgroundKeyFromText).find(Boolean);
  return key ? ARCANE_BACKGROUNDS[key] : null;
}

function savagedHasArcaneBackgroundObject(data) {
  return arr(data.abs).some(
    (background) =>
      background?.name ||
      background?.hasPowerPointPool ||
      arr(background?.powers).length,
  );
}

function savagedHasArcaneBackgroundEdge(data) {
  return arr(data.edges).some((edge) => isArcaneBackgroundEdge(edge.name));
}

function savagedExplicitPowerPointValue(data) {
  const explicit = Number(
    data.powerPoints ?? data.powerPointsMax ?? data.pp ?? data.ppMax,
  );
  if (Number.isFinite(explicit) && explicit > 0) {
    return {
      current: Number(data.powerPoints) || explicit,
      max: Number(data.powerPointsMax) || explicit,
      note: "Imported from Savaged.us.",
    };
  }

  const abilityText = arr(data.abilities)
    .map((ability) => `${ability.name || ""} ${ability.description || ""}`)
    .join(" ");
  const match = abilityText.match(/Power Points:\s*(\d+)/i);
  if (match) {
    return {
      current: Number(match[1]),
      max: Number(match[1]),
      note: "Imported from Savaged.us abilities.",
    };
  }

  return null;
}

function shouldEnablePowerPointsFromImport(data) {
  return Boolean(
    savagedHasArcaneBackgroundEdge(data) ||
    savagedExplicitPowerPointValue(data) ||
    savagedHasArcaneBackgroundObject(data),
  );
}

function savagedResources(data) {
  const resources = [];
  const importConfig = savagedArcaneBackgroundConfig(data);

  arr(data.abs)
    .filter(
      (arcaneBackground) =>
        arcaneBackground.hasPowerPointPool ||
        Number(arcaneBackground.powerPointsMax) > 0 ||
        Number(arcaneBackground.powerPointsCurrent) > 0,
    )
    .forEach((arcaneBackground, index) => {
      const max =
        Number(arcaneBackground.powerPointsMax) ||
        Number(arcaneBackground.powerPointsCurrent) ||
        0;
      const current = Number(arcaneBackground.powerPointsCurrent);
      resources.push({
        id: index ? `power-points-${index}` : "power-points",
        name: arcaneBackground.powerPointsName || "Power Points",
        current: Number.isFinite(current) ? current : max,
        max,
        source:
          arcaneBackgroundConfigFromEdge(arcaneBackground.name)?.edgeName ||
          importConfig?.edgeName ||
          arcaneBackground.name ||
          "Savaged.us Arcane Background",
        note: savagedPowerNotes(arcaneBackground),
      });
    });

  if (data.usesSanity) {
    resources.push({
      id: "sanity",
      name: "Sanity",
      current: Number(data.sanity) || 0,
      max: Number(data.sanity) || 0,
      note: "Imported from Savaged.us.",
    });
  }
  if (data.usesStrain) {
    resources.push({
      id: "strain",
      name: "Strain",
      current: Number(data.strainCurrent) || 0,
      max: Number(data.strainMax) || 0,
      note: "Imported from Savaged.us.",
    });
  }
  if (data.usesRippersReason) {
    resources.push({
      id: "rippers-reason",
      name: "Reason",
      current: Number(data.ripperReason) || 0,
      max: Number(data.ripperReason) || 0,
      note: "Rippers resource imported from Savaged.us.",
    });
  }
  if (data.usesRippersStatus) {
    resources.push({
      id: "rippers-status",
      name: "Status",
      current: Number(data.ripperStatus) || 0,
      max: Number(data.ripperStatus) || 0,
      note: "Rippers resource imported from Savaged.us.",
    });
  }

  const explicit = savagedExplicitPowerPointValue(data);
  if (
    !resources.some((resource) => resource.id === "power-points") &&
    explicit
  ) {
    resources.push({
      ...makePowerPointResource(importConfig, {
        ...explicit,
        source: importConfig?.edgeName || "Savaged.us explicit Power Points",
      }),
    });
  }

  if (
    !resources.some((resource) => resource.id === "power-points") &&
    importConfig &&
    shouldEnablePowerPointsFromImport(data)
  ) {
    resources.push(makePowerPointResource(importConfig));
  }

  return resources;
}

function savagedDieSides(value) {
  return Number(String(value || "").match(/\d+/)?.[0]) || 0;
}

function savagedHasTrainedArcaneSkill(data) {
  return arr(data.skills).some(
    (skill) =>
      ARCANE_SKILLS.includes(skill.name) && savagedDieSides(skill.value) >= 4,
  );
}

function savagedPowers(data, config) {
  const imported = arr(data.abs).flatMap((background) =>
    arr(background.powers).map((power, index) =>
      normalizePowerRecord(
        {
          id: power.uuid || power.id || `${background.name}-power-${index}`,
          name: power.name || power.bookPowerName || power.aspectOnlyName || "",
          rank: power.rank || "Novice",
          baseCost: power.powerPoints || "",
          duration: power.duration || "",
          active: false,
          source:
            arcaneBackgroundConfigFromEdge(background.name)?.edgeName ||
            config?.edgeName ||
            background.name ||
            "Savaged.us Arcane Background",
          trapping: power.trappings || "",
          notes: power.summary || power.description || "",
          modifiers: power.powerModifiers || [],
        },
        index,
        config?.edgeName,
      ),
    ),
  );
  if (imported.length) return imported;
  return config && shouldEnablePowerPointsFromImport(data)
    ? makeStartingPowers(config)
    : [];
}

function savagedImportWarnings(data, resources, config) {
  const warnings = [];
  const fallbackText =
    `${data.name || ""} ${data.professionOrTitle || ""} ${data.raceGenderAndProfession || ""}`.toLowerCase();
  const hasPowerPoints = resources.some(
    (resource) => resource.id === "power-points",
  );

  if (
    !hasPowerPoints &&
    !data.noPowerPoints &&
    (savagedHasTrainedArcaneSkill(data) ||
      /(melchizedek|priesthood|preacher|elder|blessed|miracle|miracles|shaman)/.test(
        fallbackText,
      ))
  ) {
    warnings.push({
      type: "Import Warning",
      name: "Possible Power Points",
      text: "This character looks like it may be intended as an arcane character, but the imported JSON does not include an Arcane Background, powers, or Power Points. Confirm manually before enabling Power Points.",
    });
  }
  if (!hasPowerPoints && /harrowed/i.test(fallbackText)) {
    warnings.push({
      type: "Import Warning",
      name: "Harrowed",
      text: "Harrowed are not Power Point Arcane Background characters. Track Dominion and Harrowed-specific rules separately.",
    });
  }
  if (config && hasPowerPoints) warnings.push(makeArcaneReminder(config));

  return warnings;
}

function fromSavagedUs(data) {
  const strength =
    arr(data.attributes).find((attribute) => attribute.name === "strength")
      ?.value || "d4";
  const gear = flattenSavagedGear(data.gear);
  const ammo = {};
  const inventory = [];
  const consumables = [];

  gear.forEach((item) => {
    const count = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const note = [
      item.notes || item.summary || "",
      item.containerPath ? `Inside: ${item.containerPath}` : "",
      item.container ? "Container." : "",
    ]
      .filter(Boolean)
      .join(" ");

    if (isSavagedAmmo(item)) {
      const key = savagedAmmoKey(item);
      if (!ammo[key])
        ammo[key] = {
          label: ammoReserveForKey(key, { label: item.name || "Ammo" }).label,
          count: 0,
          weight: item.weight,
          costCents: cents(item.costBuy ?? item.cost),
        };
      ammo[key].count += count;
      return;
    }

    if (/ration/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        name: item.name,
        count,
        unit: "days",
      });
    else if (/match/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        name: "Matches",
        count: count * (/100/.test(item.name) ? 100 : 1),
        unit: "matches",
      });
    else if (/elixir|oil|tobacco/i.test(item.name))
      consumables.push({
        id: slugify(item.uuid || item.name),
        name: item.name,
        count,
        unit: /oil/i.test(item.name)
          ? "uses"
          : /tobacco/i.test(item.name)
            ? "pouch"
            : "dose",
      });
    else
      inventory.push({
        id: slugify(item.uuid || item.name),
        name: item.name || "Gear",
        count,
        note,
        weight: item.weight,
        costCents: cents(item.costBuy ?? item.cost),
        book: savagedBook(item),
      });
  });

  const weapons = [];
  arr(data.weapons)
    .filter(
      (weapon) => !weapon.innate && weapon.name && weapon.name !== "Unarmed",
    )
    .forEach((weapon, weaponIndex) => {
      const quantity = Math.max(1, Math.floor(Number(weapon.quantity) || 1));
      for (let index = 0; index < quantity; index += 1) {
        const capacity = Math.max(0, Math.floor(Number(weapon.shots) || 0));
        const ammoType = capacity ? savagedWeaponAmmo(weapon) : "";
        weapons.push({
          id: slugify(weapon.uuid || `${weapon.name}-${weaponIndex}-${index}`),
          name: weapon.name,
          damage: weapon.damage || weapon.damageWithBrackets || "—",
          range: weapon.range || "—",
          ap: weapon.ap ?? "—",
          rof: weapon.rof || weapon.rof === 0 ? String(weapon.rof) : "—",
          shotsMax: capacity && ammoType ? capacity : null,
          shotsLoaded: capacity && ammoType ? capacity : null,
          ammoType: capacity && ammoType ? ammoType : null,
          notes: weapon.notes || "",
          weight: weapon.weight,
          costCents: cents(weapon.costBuy ?? weapon.cost),
          minStr: weapon.minStr || "—",
          book: savagedBook(weapon),
        });
      }
    });

  weapons.forEach((weapon) => {
    if (weapon.ammoType && !ammo[weapon.ammoType]) {
      ammo[weapon.ammoType] = {
        ...ammoReserveForKey(weapon.ammoType),
        count: 0,
      };
    }
  });

  const armorInventory = arr(data.armor)
    .filter(
      (armor) =>
        armor.name &&
        armor.name !== "(Unarmored)" &&
        (Number(armor.armor) || 0) > 0,
    )
    .map((armor, index) => ({
      id: slugify(armor.uuid || `${armor.name}-${index}`),
      name: armor.name,
      count: Math.max(1, Math.floor(Number(armor.quantity) || 1)),
      armor: Math.max(0, Math.floor(Number(armor.armor) || 0)),
      weight: armor.weight,
      minStr: armor.minStr || strength,
      costCents: cents(armor.costBuy ?? armor.cost),
      book: savagedBook(armor),
      location: armorLocationFromSavaged(armor),
      equipped: Boolean(armor.equipped),
      note: armor.notes || "",
    }));

  arr(data.shields)
    .filter((shield) => shield.name)
    .forEach((shield, index) => {
      armorInventory.push({
        id: slugify(shield.uuid || `${shield.name}-${index}`),
        name: shield.name,
        count: Math.max(1, Math.floor(Number(shield.quantity) || 1)),
        armor: Math.max(0, Math.floor(Number(shield.armor) || 0)),
        weight: shield.weight,
        minStr: shield.minStr || strength,
        costCents: cents(shield.costBuy ?? shield.cost),
        book: savagedBook(shield),
        location: "shield",
        equipped: Boolean(shield.equipped),
        note: shield.notes || "Shield / carried.",
      });
    });

  const attrs = arr(data.attributes).map(
    (attribute) =>
      `${attribute.label || attribute.name}: ${attribute.value}${attribute.mod ? ` (${attribute.mod > 0 ? "+" : ""}${attribute.mod})` : ""}`,
  );
  const skills = arr(data.skills)
    .filter((skill) => skill.name && skill.name !== "(Unskilled)")
    .map((skill) => `${skill.name} ${skill.value}`);
  const notes = [
    data.playerName ? `Player: ${data.playerName}` : "",
    data.savagedUsShareURL ? `Savaged.us: ${data.savagedUsShareURL}` : "",
    `Load: ${data.load ?? 0} / ${data.loadLimit ?? "—"}`,
    attrs.length ? `Attributes: ${attrs.join(", ")}` : "",
    skills.length ? `Skills: ${skills.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const arcaneConfig = savagedArcaneBackgroundConfig(data);
  const resources = savagedResources(data);
  const powers = savagedPowers(data, arcaneConfig);

  return normalize({
    source: "savaged.us",
    sourceId: data.uuid || data.id || data.saveID,
    name: data.name || "Imported Character",
    rank: data.rankName || data.rank || "Novice",
    ancestry: data.race || "—",
    archetype: data.professionOrTitle || "",
    attributes: Object.fromEntries(
      arr(data.attributes)
        .filter((attribute) => attribute.name && attribute.value)
        .map((attribute) => [attribute.name, attribute.value]),
    ),
    skills: arr(data.skills)
      .filter((skill) => skill.name && skill.name !== "(Unskilled)")
      .map((skill) => ({
        name: skill.name,
        die: skill.value,
        linkedAttribute: skill.attribute || skill.linkedAttribute || "",
        notes: skill.mod ? `Modifier ${skill.mod}` : "",
      })),
    hindrances: arr(data.hindrances).map((hindrance) => ({
      name: hindrance.name || "Hindrance",
      severity: hindrance.severity || "",
      notes:
        hindrance.description || hindrance.summary || hindrance.notes || "",
    })),
    edges: arr(data.edges).map((edge) => ({
      name: edge.name || "Edge",
      source: savagedBook(edge),
      notes: edge.description || edge.summary || edge.notes || "",
    })),
    bennies: {
      current: Number(data.bennies) || Number(data.benniesMax) || 3,
      starting: Number(data.benniesMax) || Number(data.bennies) || 3,
      normalStarting: 3,
    },
    conviction: 0,
    damage: {
      wounds: Number(data.wounds) || 0,
      maxWounds: Number(data.woundsMax) || 3,
      fatigue: Number(data.fatigue) || 0,
      maxFatigue: Number(data.fatigueMax) || 2,
    },
    derived: {
      pace: Number(data.paceTotal) || 6,
      parry: Number(data.parryTotal) || 2,
      baseToughness:
        Number(data.toughnessTotalNoArmor) || Number(data.toughnessBase) || 0,
      toughness:
        Number(data.toughnessTotal) || Number(data.toughnessTotalNoArmor) || 0,
      armor: Math.max(
        0,
        (Number(data.toughnessTotal) || 0) -
          (Number(data.toughnessTotalNoArmor) || 0),
      ),
    },
    armorStrength: strength,
    weaponStrength: strength,
    selectedArmorLocation: "best",
    moneyCents: savagedMoney(data),
    ammo,
    weapons,
    armorInventory,
    arcaneBackground: arcaneConfig
      ? makeArcaneBackgroundState(arcaneConfig)
      : null,
    resources,
    powers,
    hucksterDeal: arcaneConfig?.key === "huckster" ? makeHucksterDeal() : null,
    conditions: clone(defaultCharacter.conditions),
    temporaryConditions: clone(defaultCharacter.temporaryConditions),
    consumables,
    inventory,
    vehicles: arr(data.vehicles).map((vehicle, index) => ({
      id: slugify(vehicle.uuid || `${vehicle.name || "vehicle"}-${index}`),
      name: vehicle.name || "Vehicle",
      count: Math.max(1, Math.floor(Number(vehicle.quantity) || 1)),
      note: vehicle.notes || vehicle.summary || "",
      costCents: cents(vehicle.costBuy ?? vehicle.cost),
      book: savagedBook(vehicle),
    })),
    reminders: [
      ...savagedImportWarnings(data, resources, arcaneConfig),
      ...arr(data.hindrances).map((item) => savagedReminder("Hindrance", item)),
      ...arr(data.edges).map((item) => savagedReminder("Edge", item)),
    ],
    notes,
  });
}

function isSavagedUsExport(data) {
  return Boolean(
    data &&
    typeof data === "object" &&
    ("appVersion" in data || "savagedUsShareURL" in data) &&
    "attributes" in data &&
    "skills" in data,
  );
}

// src/creator.js
const CREATION_KEY = "deadlands-creation-draft-v1";
const DICE = [4, 6, 8, 10, 12];
const CONCEPTS = [
  "Blessed",
  "Bounty Hunter",
  "Chi Master",
  "Common Folk",
  "Deserter",
  "Drifter",
  "Escort",
  "Explorer",
  "Grifter",
  "Huckster",
  "Immigrant",
  "Indian Shaman",
  "Indian Warrior",
  "Law Dog",
  "Mad Scientist",
  "Muckraker",
  "Outlaw",
  "Prospector",
  "Soldier",
  "Custom",
];
const HINDRANCE_PRESETS = [
  "Bad Luck",
  "Cursed",
  "Elderly",
  "Heroic",
  "Small",
  "Vow",
  "Code of Honor",
  "Curious",
  "Greedy",
  "Mean",
  "Overconfident",
  "Outsider",
  "Poverty",
  "Quirk",
  "Stubborn",
  "Yellow",
  "Custom",
];
const EDGE_PRESETS = [
  "Alertness",
  "Ambidextrous",
  "Attractive",
  "Brawny",
  "Brave",
  "Charismatic",
  "Command",
  "Healer",
  "Investigator",
  "Luck",
  "Quick",
  "Rich",
  ...ARCANE_BACKGROUND_LIST.map((background) => background.edgeName),
  "Custom",
];
const AB_SKILLS = Object.fromEntries(
  ARCANE_BACKGROUND_LIST.map((background) => [
    background.edgeName,
    background.arcaneSkill,
  ]),
);
const SKILL_DEFS = [
  ["Academics", "smarts"],
  ["Athletics", "agility", true],
  ["Battle", "smarts"],
  ["Boating", "agility"],
  ["Common Knowledge", "smarts", true],
  ["Driving", "agility"],
  ["Faith", "spirit"],
  ["Fighting", "agility"],
  ["Focus", "spirit"],
  ["Gambling", "smarts"],
  ["Healing", "smarts"],
  ["Intimidation", "spirit"],
  ["Language", "smarts"],
  ["Notice", "smarts", true],
  ["Occult", "smarts"],
  ["Performance", "spirit"],
  ["Persuasion", "spirit", true],
  ["Piloting", "agility"],
  ["Psionics", "smarts"],
  ["Repair", "smarts"],
  ["Research", "smarts"],
  ["Riding", "agility"],
  ["Science", "smarts"],
  ["Shooting", "agility"],
  ["Spellcasting", "smarts"],
  ["Stealth", "agility", true],
  ["Survival", "smarts"],
  ["Taunt", "smarts"],
  ["Thievery", "agility"],
  ["Trade", "smarts"],
  ["Weird Science", "smarts"],
];

var creationDraft = loadCreationDraft();

function dieIndex(die) {
  return DICE.indexOf(Number(String(die || "").replace("d", "")));
}

function dieFromIndex(index) {
  return index >= 0 ? `d${DICE[clamp(index, 0, DICE.length - 1)]}` : "";
}

function dieSides(die) {
  return DICE[Math.max(0, dieIndex(die))] || 0;
}

function emptyDraft() {
  return {
    mode: "creation",
    name: "",
    player: "",
    rank: "Novice",
    ancestry: "Human",
    concept: "Drifter",
    customConcept: "",
    description: "",
    background: "",
    worstNightmare: "",
    attributes: {
      agility: "d4",
      smarts: "d4",
      spirit: "d4",
      strength: "d4",
      vigor: "d4",
    },
    skills: SKILL_DEFS.filter((skill) => skill[2])
      .map((skill) => ({
        name: skill[0],
        die: "d4",
        linkedAttribute: skill[1],
        notes: "",
        core: true,
      }))
      .concat([
        {
          name: "Language (English)",
          die: "d4",
          linkedAttribute: "smarts",
          notes: "Default language",
          core: false,
          language: true,
        },
      ]),
    hindrances: [],
    edges: [],
    creation: {
      normalAttributePointsAvailable: 5,
      normalSkillPointsAvailable: 12,
      extraSkillPointsFromHindrances: 0,
      extraMoneyFromHindrances: 0,
      extraAttributeRaisesFromHindrances: 0,
      extraEdgesFromHindrances: 0,
      finalized: false,
      allowIncomplete: false,
      allowDebt: false,
    },
    arcaneBackground: null,
    powerPoints: { enabled: false, current: 0, max: 0, source: "", notes: "" },
    powers: [],
    hucksterDeal: null,
    inventory: [
      {
        id: "clothing",
        name: "Clothing",
        count: 1,
        note: "Starting clothing.",
        weight: 0,
        costCents: 0,
        book: "Deadlands",
      },
    ],
    weapons: [],
    ammo: {},
    armorInventory: [],
    vehicles: [],
    notes: "",
  };
}

function normalizeDraft(data) {
  const defaults = emptyDraft();
  const draft = { ...defaults, ...(data || {}) };
  draft.attributes = { ...defaults.attributes, ...(draft.attributes || {}) };
  draft.creation = { ...defaults.creation, ...(draft.creation || {}) };
  [
    "skills",
    "hindrances",
    "edges",
    "inventory",
    "weapons",
    "armorInventory",
    "vehicles",
    "powers",
  ].forEach((key) => {
    if (!Array.isArray(draft[key])) draft[key] = defaults[key];
  });
  if (!draft.ammo || typeof draft.ammo !== "object") draft.ammo = {};
  if (!draft.powerPoints) draft.powerPoints = clone(defaults.powerPoints);
  const arcaneEdge = draft.edges.find((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const arcaneConfig = arcaneEdge
    ? arcaneBackgroundConfigFromEdge(arcaneEdge.name)
    : null;
  draft.arcaneBackground =
    draft.arcaneBackground ||
    (arcaneConfig ? makeArcaneBackgroundState(arcaneConfig) : null);
  if (arcaneConfig && !draft.powerPoints.enabled) {
    draft.powerPoints = {
      enabled: true,
      current: arcaneConfig.startingPowerPoints,
      max: arcaneConfig.startingPowerPoints,
      source: arcaneConfig.edgeName,
      notes: `${arcaneConfig.displayName} uses ${arcaneConfig.arcaneSkill}.`,
    };
  }
  draft.powers = draft.powers.map((power, index) =>
    normalizePowerRecord(power, index, draft.arcaneBackground?.edgeName),
  );
  if (arcaneConfig && !draft.powers.length)
    draft.powers = makeStartingPowers(arcaneConfig);
  draft.hucksterDeal = normalizeHucksterDeal(draft.hucksterDeal);
  if (arcaneConfig?.key === "huckster" && !draft.hucksterDeal)
    draft.hucksterDeal = makeHucksterDeal();
  draft.ancestry = "Human";
  return draft;
}

function loadCreationDraft() {
  try {
    return normalizeDraft(
      JSON.parse(localStorage.getItem(CREATION_KEY)) || emptyDraft(),
    );
  } catch {
    return normalizeDraft(emptyDraft());
  }
}

function saveCreationDraft() {
  localStorage.setItem(CREATION_KEY, JSON.stringify(creationDraft));
}

function hindranceStats() {
  const total = creationDraft.hindrances.reduce(
    (sum, hindrance) => sum + (hindrance.severity === "Major" ? 2 : 1),
    0,
  );
  const spendable = Math.min(4, total);
  const spent =
    creationDraft.creation.extraAttributeRaisesFromHindrances * 2 +
    creationDraft.creation.extraEdgesFromHindrances * 2 +
    creationDraft.creation.extraSkillPointsFromHindrances +
    creationDraft.creation.extraMoneyFromHindrances;
  return { total, spendable, spent, remaining: spendable - spent };
}

function attrSpent() {
  return Object.values(creationDraft.attributes).reduce(
    (sum, die) => sum + Math.max(0, dieIndex(die)),
    0,
  );
}

function skillCost(skill) {
  const definition =
    SKILL_DEFS.find((item) => item[0] === skill.name) ||
    SKILL_DEFS.find((item) => skill.name.startsWith(`${item[0]} (`));
  const linkedAttribute = skill.linkedAttribute || definition?.[1] || "smarts";
  const attribute = dieSides(creationDraft.attributes[linkedAttribute]);
  const target = dieIndex(skill.die);
  const base = skill.core ? 0 : -1;
  let cost = 0;
  for (let index = base + 1; index <= target; index += 1)
    cost += DICE[index] > attribute ? 2 : 1;
  return Math.max(0, cost);
}

function skillStats() {
  const spent = creationDraft.skills.reduce(
    (sum, skill) => sum + skillCost(skill),
    0,
  );
  const available =
    creationDraft.creation.normalSkillPointsAvailable +
    creationDraft.creation.extraSkillPointsFromHindrances;
  return { spent, avail: available, remaining: available - spent };
}

function creationArmorBonus() {
  return creationDraft.armorInventory
    .filter((armor) => armor.equipped && armor.count > 0)
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}

function creationDerived() {
  const fighting = creationDraft.skills.find(
    (skill) => skill.name === "Fighting",
  );
  const vigor = dieSides(creationDraft.attributes.vigor);
  const fightingDie = fighting ? dieSides(fighting.die) : 0;
  const armor = creationArmorBonus();
  return {
    pace: 6,
    parry: 2 + Math.floor(fightingDie / 2),
    baseToughness: 2 + Math.floor(vigor / 2),
    armor,
    toughness: 2 + Math.floor(vigor / 2) + armor,
  };
}

function draftArcaneConfig() {
  const edge = creationDraft.edges.find((item) =>
    isArcaneBackgroundEdge(item.name),
  );
  return edge ? arcaneBackgroundConfigFromEdge(edge.name) : null;
}

function skillDefinition(name) {
  return SKILL_DEFS.find((skill) => skill[0] === name);
}

function ensureDraftSkill(name) {
  if (creationDraft.skills.some((skill) => skill.name === name)) return;
  const definition = skillDefinition(name);
  creationDraft.skills.push({
    name,
    die: "d4",
    linkedAttribute: definition?.[1] || "smarts",
    notes: "Added for Arcane Background.",
    core: false,
  });
}

function applyArcaneBackgroundToDraft(edgeName, source, notes) {
  const config = arcaneBackgroundConfigFromEdge(edgeName);
  if (!config) return false;

  creationDraft.edges = creationDraft.edges.filter(
    (edge) => !isArcaneBackgroundEdge(edge.name),
  );
  creationDraft.edges.push({
    name: config.edgeName,
    source,
    notes: notes || config.requirementsText,
    requirements: config.requirementsText,
  });
  creationDraft.arcaneBackground = makeArcaneBackgroundState(config);
  creationDraft.powerPoints = {
    enabled: true,
    current: config.startingPowerPoints,
    max: config.startingPowerPoints,
    source: config.edgeName,
    notes: `${config.displayName} uses ${config.arcaneSkill}.`,
  };
  creationDraft.powers = makeStartingPowers(config);
  creationDraft.hucksterDeal =
    config.key === "huckster" ? makeHucksterDeal() : null;
  ensureDraftSkill(config.arcaneSkill);
  return true;
}

function clearDraftArcaneBackground() {
  creationDraft.arcaneBackground = null;
  creationDraft.powerPoints = {
    enabled: false,
    current: 0,
    max: 0,
    source: "",
    notes: "",
  };
  creationDraft.powers = [];
  creationDraft.hucksterDeal = null;
}

function draftSkillDie(name) {
  return creationDraft.skills.find((skill) => skill.name === name)?.die || "";
}

function meetsDie(actual, required) {
  return dieIndex(actual) >= dieIndex(required);
}

function arcaneRequirementItems(config) {
  if (!config) return [];
  const items = [
    {
      ok: creationDraft.powerPoints.enabled,
      text: `${config.displayName} Power Points enabled.`,
      blocking: false,
    },
    {
      ok:
        Number(creationDraft.powerPoints.max) === config.startingPowerPoints ||
        creationDraft.creation.allowIncomplete,
      text: `${config.displayName} starts with ${config.startingPowerPoints} Power Points.`,
      blocking: false,
    },
    {
      ok: creationDraft.powers.length === config.startingPowersCount,
      text: `${config.displayName} has ${config.startingPowersCount} starting power slots.`,
      blocking: false,
    },
  ];

  Object.entries(config.requirements.attributes || {}).forEach(
    ([attribute, die]) => {
      items.push({
        ok: meetsDie(creationDraft.attributes[attribute], die),
        text: `${config.displayName} requirement: ${attribute} ${die}+.`,
        blocking: false,
      });
    },
  );
  Object.entries(config.requirements.skills || {}).forEach(([skill, die]) => {
    items.push({
      ok: meetsDie(draftSkillDie(skill), die),
      text: `${config.displayName} requirement: ${skill} ${die}+.`,
      blocking: false,
    });
  });
  (config.requirements.edges || []).forEach((edgeName) => {
    items.push({
      ok: creationDraft.edges.some((edge) => edge.name === edgeName),
      text: `${config.displayName} requirement: ${edgeName} Edge.`,
      blocking: false,
    });
  });
  if (config.key === "huckster") {
    items.push({
      ok: Boolean(creationDraft.hucksterDeal?.enabled),
      text: "Huckster Dealing with the Devil helper enabled.",
      blocking: false,
    });
  }
  return items;
}

function optionTags(items, selected = "") {
  return items
    .map(
      (item) =>
        `<option value="${esc(item)}"${item === selected ? " selected" : ""}>${esc(item)}</option>`,
    )
    .join("");
}

function catalogOptions(items) {
  return `<option value="">Choose…</option>${items.map((item) => `<option value="${esc(item.id)}">${esc(item.name)} — ${money(item.costCents)}</option>`).join("")}`;
}

function catalogByName(items) {
  return [...items].sort((left, right) =>
    left.name.localeCompare(right.name, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
}

function setAppTab(tabName) {
  const panelMap = {
    play: "#playPanel",
    character: "#characterPanel",
    inventory: "#inventoryPanel",
    arcane: "#arcanePanel",
    notes: "#notesPanel",
    creation: "#creationPanel",
  };
  const nextTab = panelMap[tabName] ? tabName : "play";

  document.querySelectorAll("[data-app-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.appTab === nextTab);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.add("hidden");
    panel.classList.remove("active");
  });

  const panel = $(panelMap[nextTab]);
  panel.classList.remove("hidden");
  panel.classList.add("active");
  if (nextTab === "creation") renderCreator();
}

function setCreatorMode(on) {
  setAppTab(on ? "creation" : "play");
}

function statusPill(ok, warn = false) {
  const className = ok ? "ok" : warn ? "warn" : "err";
  const text = ok ? "Valid" : warn ? "Warning" : "Invalid";
  return `<span class="creator-status ${className}">${text}</span>`;
}

function renderCreator() {
  const panel = $("#creationPanel");
  const hindrances = hindranceStats();
  const skills = skillStats();
  const derived = creationDerived();
  const attributesSpent = attrSpent();
  const attributesAvailable =
    5 + creationDraft.creation.extraAttributeRaisesFromHindrances;
  const concept =
    creationDraft.concept === "Custom"
      ? creationDraft.customConcept
      : creationDraft.concept;
  const gearSpent = creationGearSpent();
  const moneyAvailable =
    25000 + creationDraft.creation.extraMoneyFromHindrances * 50000;
  const remaining = moneyAvailable - gearSpent;
  const checks = creationChecks();

  panel.innerHTML = `
    <section class="creator-section creator-wide">
      <div class="section-title">
        <div>
          <h2>Character Creation</h2>
          <p>Build a Deadlands character, save a draft, then finalize into the tracker.</p>
        </div>
        <span class="pill">Human ancestry locked: one free Novice Edge</span>
      </div>
      <div class="creator-actions">
        <button data-cc="saveDraft">Save Draft</button>
        <button data-cc="finalize" class="ghost">Finalize Character</button>
        <button data-cc="resetDraft" class="danger">Reset Character Creation</button>
        <button data-cc="exportDraft">Export Character JSON</button>
        <label class="ghost file-label" for="creatorImportFile">Import Character JSON</label>
        <input id="creatorImportFile" class="creator-file" type="file" accept="application/json">
        <button data-cc="exportFull">Export Full App State</button>
      </div>
    </section>
    ${renderBasics(concept)}
    ${renderHindrances(hindrances)}
    ${renderAttributes(attributesSpent, attributesAvailable)}
    ${renderSkills(skills)}
    ${renderEdges()}
    ${renderGear(moneyAvailable, gearSpent, remaining)}
    ${renderReview(checks, derived, remaining)}
  `;
  bindCreatorInputs();
}

function renderBasics(concept) {
  return `
    <section class="creator-section">
      <h2>1. Character Basics ${statusPill(Boolean(creationDraft.name), true)}</h2>
      <div class="creator-grid">
        <label>Character name<input data-cf="name" value="${esc(creationDraft.name)}"></label>
        <label>Player name<input data-cf="player" value="${esc(creationDraft.player)}"></label>
        <label>Rank<input data-cf="rank" value="${esc(creationDraft.rank)}"></label>
        <label>Race / ancestry<input value="Human" disabled></label>
        <label>Concept<select data-cf="concept">${optionTags(CONCEPTS, creationDraft.concept)}</select></label>
        <label>Custom concept<input data-cf="customConcept" value="${esc(creationDraft.customConcept)}" ${creationDraft.concept === "Custom" ? "" : "disabled"}></label>
        <label class="creator-wide">Short description<textarea data-cf="description">${esc(creationDraft.description)}</textarea></label>
        <label class="creator-wide">Background notes<textarea data-cf="background">${esc(creationDraft.background)}</textarea></label>
        <label class="creator-wide">Worst nightmare<textarea data-cf="worstNightmare">${esc(creationDraft.worstNightmare)}</textarea></label>
      </div>
      <p class="creator-note">Current concept: ${esc(concept || "—")}</p>
    </section>`;
}

function renderHindrances(stats) {
  return `
    <section class="creator-section">
      <h2>2. Hindrances ${statusPill(stats.remaining >= 0, stats.total > 0)}</h2>
      <div class="creator-points">
        <span class="pill">Selected ${stats.total}</span>
        <span class="pill">Spendable ${stats.spendable} / 4</span>
        <span class="pill">Spent ${stats.spent}</span>
        <span class="pill">Remaining ${stats.remaining}</span>
      </div>
      ${stats.total > 4 ? '<p class="creator-note">More than 4 Hindrance points selected; only 4 count for benefits.</p>' : ""}
      <div class="creator-grid">
        <select id="ccHindranceName">${optionTags(HINDRANCE_PRESETS)}</select>
        <select id="ccHindranceSeverity"><option>Minor</option><option>Major</option></select>
        <input id="ccHindranceNotes" placeholder="Notes">
        <button data-cc="addHindrance">Add Hindrance</button>
      </div>
      <div class="creator-grid">
        <label>Attribute raises (2 pts each)<input class="creator-small" type="number" min="0" data-cn="extraAttributeRaisesFromHindrances" value="${creationDraft.creation.extraAttributeRaisesFromHindrances}"></label>
        <label>Extra Edges (2 pts each)<input class="creator-small" type="number" min="0" data-cn="extraEdgesFromHindrances" value="${creationDraft.creation.extraEdgesFromHindrances}"></label>
        <label>Extra skill points (1 pt each)<input class="creator-small" type="number" min="0" data-cn="extraSkillPointsFromHindrances" value="${creationDraft.creation.extraSkillPointsFromHindrances}"></label>
        <label>+$500 money buys (1 pt each)<input class="creator-small" type="number" min="0" data-cn="extraMoneyFromHindrances" value="${creationDraft.creation.extraMoneyFromHindrances}"></label>
      </div>
      <div class="creator-list">
        ${
          creationDraft.hindrances
            .map(
              (hindrance, index) =>
                `<div class="creator-row"><div><strong>${esc(hindrance.name)}</strong><span class="meta">${hindrance.severity} • ${hindrance.severity === "Major" ? 2 : 1} point(s)</span>${hindrance.notes ? `<p class="creator-note">${esc(hindrance.notes)}</p>` : ""}</div><button data-cc="removeHindrance" data-i="${index}" class="delete-small">×</button></div>`,
            )
            .join("") || '<p class="empty-state">No Hindrances selected.</p>'
        }
      </div>
    </section>`;
}

function renderAttributes(spent, available) {
  return `
    <section class="creator-section">
      <h2>3. Attributes ${statusPill(spent === available, spent <= available)}</h2>
      <div class="creator-points"><span class="pill">Normal 5</span><span class="pill">Extra ${creationDraft.creation.extraAttributeRaisesFromHindrances}</span><span class="pill">Spent ${spent} / ${available}</span></div>
      <div class="creator-list">
        ${Object.entries(creationDraft.attributes)
          .map(
            ([key, value]) =>
              `<div class="creator-row"><div><strong>${key[0].toUpperCase() + key.slice(1)}</strong><span class="meta">${value}</span></div><div class="creator-actions"><button data-cc="decAttr" data-k="${key}">−</button><button data-cc="incAttr" data-k="${key}">+</button></div></div>`,
          )
          .join("")}
      </div>
    </section>`;
}

function renderSkills(stats) {
  const available = SKILL_DEFS.filter(
    (definition) =>
      !creationDraft.skills.some(
        (skill) =>
          skill.name === definition[0] ||
          skill.name.startsWith(`${definition[0]} (`),
      ),
  );
  return `
    <section class="creator-section">
      <h2>4. Skills ${statusPill(stats.spent <= stats.avail, stats.remaining >= 0)}</h2>
      <div class="creator-points"><span class="pill">Normal 12</span><span class="pill">Extra ${creationDraft.creation.extraSkillPointsFromHindrances}</span><span class="pill">Spent ${stats.spent} / ${stats.avail}</span><span class="pill">Remaining ${stats.remaining}</span></div>
      <div class="creator-grid">
        <select id="ccSkillName">${available.map((skill) => `<option value="${esc(skill[0])}">${esc(skill[0])} (${skill[1]})</option>`).join("")}</select>
        <input id="ccSkillNotes" placeholder="Specialty, e.g. Trade: Mining or Language">
        <button data-cc="addSkill">Add Skill</button>
      </div>
      <div class="creator-list">
        ${creationDraft.skills
          .map(
            (skill, index) =>
              `<div class="creator-row"><div><strong>${esc(skill.name)}</strong><span class="meta">${skill.die} • ${skill.linkedAttribute} • cost ${skillCost(skill)}</span>${skill.notes ? `<p class="creator-note">${esc(skill.notes)}</p>` : ""}</div><div class="creator-actions"><button data-cc="decSkill" data-i="${index}">−</button><button data-cc="incSkill" data-i="${index}">+</button>${skill.core ? '<span class="pill">Core</span>' : `<button data-cc="removeSkill" data-i="${index}" class="delete-small">×</button>`}</div></div>`,
          )
          .join("")}
      </div>
    </section>`;
}

function renderCreationPowers(config) {
  return `
    <div class="creator-list">
      <h3>Starting Powers</h3>
      ${
        creationDraft.powers
          .map(
            (power, index) =>
              `<div class="creator-row power-editor"><div><strong>${esc(power.name || "Player choice power")}</strong><span class="meta">${esc(power.source || config.edgeName)}</span></div><div class="creator-grid creator-wide"><label>Name<input data-cp="${index}" data-cpf="name" value="${esc(power.name)}" ${power.fixed ? "readonly" : ""}></label><label>Base cost<input data-cp="${index}" data-cpf="baseCost" value="${esc(power.baseCost)}"></label><label>Duration<input data-cp="${index}" data-cpf="duration" value="${esc(power.duration)}"></label><label>Trapping / device<input data-cp="${index}" data-cpf="trapping" value="${esc(power.trapping)}"></label><label class="creator-wide">Notes<input data-cp="${index}" data-cpf="notes" value="${esc(power.notes)}"></label><label class="checkline"><input type="checkbox" data-cp="${index}" data-cpf="active" ${power.active ? "checked" : ""}> Starts active</label></div></div>`,
          )
          .join("") || '<p class="empty-state">No powers configured.</p>'
      }
    </div>`;
}

function renderCreationHuckster(config) {
  if (config.key !== "huckster") return "";
  const deal = creationDraft.hucksterDeal || makeHucksterDeal();
  return `
    <div class="add-panel">
      <h3>Dealing with the Devil Helper</h3>
      <p class="creator-note">This records temporary deal points separately from the normal 10-point Huckster pool.</p>
      <div class="creator-grid">
        <label>Selected power<input data-hd="selectedPower" value="${esc(deal.selectedPower)}"></label>
        <label>Required PP<input type="number" min="0" data-hd="requiredPowerPoints" value="${deal.requiredPowerPoints}"></label>
        <label>Gambling result<input data-hd="gamblingRollResult" value="${esc(deal.gamblingRollResult)}"></label>
        <label>Cards drawn<input type="number" min="0" data-hd="cardsDrawn" value="${deal.cardsDrawn}"></label>
        <label>Poker hand<input data-hd="pokerHand" value="${esc(deal.pokerHand)}"></label>
        <label>Temporary PP<input type="number" min="0" data-hd="temporaryPowerPoints" value="${deal.temporaryPowerPoints}"></label>
        <label>Shortage penalty<input type="number" min="0" data-hd="shortagePenalty" value="${deal.shortagePenalty}"></label>
        <label>Leftover PP<input type="number" min="0" data-hd="leftoverPowerPoints" value="${deal.leftoverPowerPoints}"></label>
        <label class="checkline"><input type="checkbox" data-hd="anteBennySpent" ${deal.anteBennySpent ? "checked" : ""}> Ante Benny spent</label>
        <label class="checkline"><input type="checkbox" data-hd="usedJoker" ${deal.usedJoker ? "checked" : ""}> Joker used</label>
        <label class="checkline"><input type="checkbox" data-hd="backfireTriggered" ${deal.backfireTriggered ? "checked" : ""}> Backfire triggered</label>
        <label class="creator-wide">Notes<textarea data-hd="notes">${esc(deal.notes)}</textarea></label>
      </div>
    </div>`;
}

function renderEdges() {
  const arcaneConfig = draftArcaneConfig();
  return `
    <section class="creator-section">
      <h2>5. Edges ${statusPill(creationDraft.edges.length > 0, true)}</h2>
      <p class="creator-note">Humans receive one free Novice Edge. Prerequisites are warnings, not full rules enforcement.</p>
      <div class="creator-grid">
        <select id="ccEdgeName">${optionTags(EDGE_PRESETS)}</select>
        <select id="ccEdgeSource"><option>Human free Edge</option><option>Hindrance purchased Edge</option><option>Later Advance</option></select>
        <input id="ccEdgeNotes" placeholder="Notes or requirements">
        <button data-cc="addEdge">Add Edge</button>
      </div>
      ${
        arcaneConfig
          ? `<div class="add-panel"><strong>Arcane Background: ${esc(arcaneConfig.displayName)}</strong><p class="creator-note">${esc(arcaneConfig.requirementsText)}. ${esc(arcaneConfig.displayName)} uses ${esc(arcaneConfig.arcaneSkill)} (${esc(arcaneConfig.linkedAttribute)}), starts with ${arcaneConfig.startingPowerPoints} Power Points, and has ${arcaneConfig.startingPowersCount} starting powers.</p><div class="creator-grid"><label>Power Points max<input type="number" min="0" data-pp="max" value="${creationDraft.powerPoints.max}"></label><label>Power Points current<input type="number" min="0" data-pp="current" value="${creationDraft.powerPoints.current}"></label><label class="creator-wide">Notes<input data-pp="notes" value="${esc(creationDraft.powerPoints.notes)}"></label></div>${renderCreationPowers(arcaneConfig)}${renderCreationHuckster(arcaneConfig)}</div>`
          : '<p class="creator-note">Select one Arcane Background Edge to enable Power Points.</p>'
      }
      <div class="creator-list">
        ${
          creationDraft.edges
            .map(
              (edge, index) =>
                `<div class="creator-row"><div><strong>${esc(edge.name)}</strong><span class="meta">${esc(edge.source)}</span>${edge.notes ? `<p class="creator-note">${esc(edge.notes)}</p>` : ""}</div><button data-cc="removeEdge" data-i="${index}" class="delete-small">×</button></div>`,
            )
            .join("") || '<p class="empty-state">No Edges selected.</p>'
        }
      </div>
    </section>`;
}

function creationGearSpent() {
  const gear = [
    ...creationDraft.inventory,
    ...creationDraft.weapons,
    ...creationDraft.armorInventory,
    ...creationDraft.vehicles,
  ].reduce(
    (sum, item) =>
      sum + (Number(item.costCents) || 0) * (Number(item.count) || 1),
    0,
  );
  const ammo = Object.values(creationDraft.ammo).reduce(
    (sum, item) =>
      sum + (Number(item.costCents) || 0) * (Number(item.count) || 0),
    0,
  );
  return gear + ammo;
}

function renderGear(available, spent, remaining) {
  return `
    <section class="creator-section">
      <h2>6. Gear and Starting Money ${statusPill(remaining >= 0 || creationDraft.creation.allowDebt, remaining < 0)}</h2>
      <div class="creator-points"><span class="pill">Starting ${money(25000)}</span><span class="pill">Hindrance money ${money(creationDraft.creation.extraMoneyFromHindrances * 50000)}</span><span class="pill">Spent ${money(spent)}</span><span class="pill">Remaining ${money(remaining)}</span></div>
      <label class="checkline"><input type="checkbox" data-cb="allowDebt" ${creationDraft.creation.allowDebt ? "checked" : ""}> Allow debt/overspending</label>
      <div class="add-panel">
        <h3>Buy Starting Equipment</h3>
        <div class="creator-grid"><select id="ccGearType"><option value="gear">Gear</option><option value="weapon">Weapon</option><option value="ammo">Ammunition</option><option value="armor">Armor</option><option value="vehicle">Vehicle</option></select><select id="ccGearId"></select><input id="ccGearQty" class="creator-small" type="number" min="1" value="1"><button data-cc="buyGear">Buy</button></div>
      </div>
      <div class="creator-list">${renderPurchased("Weapons", creationDraft.weapons)}${renderPurchased("Armor", creationDraft.armorInventory)}${renderAmmoPurchased()}${renderPurchased("Inventory", creationDraft.inventory)}${renderPurchased("Vehicles", creationDraft.vehicles)}</div>
    </section>`;
}

function renderPurchased(label, items) {
  return `<div><h3>${label}</h3>${items.map((item, index) => `<div class="creator-row"><div><strong>${esc(item.name)}</strong><span class="meta">Qty ${item.count || 1} • ${money(item.costCents || 0)} each</span>${item.note ? `<p class="creator-note">${esc(item.note)}</p>` : ""}</div><button data-cc="removePurchase" data-list="${label}" data-i="${index}" class="delete-small">×</button></div>`).join("") || '<p class="empty-state">None.</p>'}</div>`;
}

function renderAmmoPurchased() {
  const rows = Object.entries(creationDraft.ammo)
    .map(
      ([key, ammo]) =>
        `<div class="creator-row"><div><strong>${esc(ammo.label)}</strong><span class="meta">Reserve ${ammo.count} • ${money(ammo.costCents || 0)} each</span></div><button data-cc="removeAmmoPurchase" data-k="${esc(key)}" class="delete-small">×</button></div>`,
    )
    .join("");
  return `<div><h3>Ammunition</h3>${rows || '<p class="empty-state">None.</p>'}</div>`;
}

function renderReview(checks, derived) {
  return `
    <section class="creator-section creator-wide">
      <h2>7. Final Review ${statusPill(checks.valid, checks.warnings.length && !checks.errors.length)}</h2>
      <div class="creator-points"><span class="pill">Pace ${derived.pace}</span><span class="pill">Parry ${derived.parry}</span><span class="pill">Toughness ${derived.baseToughness}${derived.armor ? ` + ${derived.armor} armor = ${derived.toughness}` : ""}</span></div>
      <div class="creator-review">${checks.items.map((check) => `<div>${check.ok ? "✓" : "⚠"} ${esc(check.text)}</div>`).join("")}</div>
      <label class="checkline"><input type="checkbox" data-cb="allowIncomplete" ${creationDraft.creation.allowIncomplete ? "checked" : ""}> Allow incomplete character finalization</label>
      <div class="creator-actions"><button data-cc="finalize" ${checks.valid || creationDraft.creation.allowIncomplete ? "" : "disabled"}>Finalize Character</button><button data-cc="saveDraft">Save Draft</button></div>
    </section>`;
}

function creationChecks() {
  const hindrances = hindranceStats();
  const skills = skillStats();
  const attributesSpent = attrSpent();
  const attributesAvailable =
    5 + creationDraft.creation.extraAttributeRaisesFromHindrances;
  const arcaneBackgrounds = creationDraft.edges.filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const arcaneConfig = draftArcaneConfig();
  const derived = creationDerived();
  const remainingMoney =
    25000 +
    creationDraft.creation.extraMoneyFromHindrances * 50000 -
    creationGearSpent();
  const purchasedEdges = creationDraft.edges.filter(
    (edge) => edge.source === "Hindrance purchased Edge",
  ).length;
  const freeEdges = creationDraft.edges.filter(
    (edge) => edge.source === "Human free Edge",
  ).length;
  const items = [
    { ok: Boolean(creationDraft.name), text: "Character has a name." },
    { ok: creationDraft.ancestry === "Human", text: "Race is Human." },
    {
      ok:
        attributesSpent === attributesAvailable ||
        creationDraft.creation.allowIncomplete,
      text: `Attributes spend ${attributesSpent} / ${attributesAvailable}.`,
    },
    {
      ok: skills.spent <= skills.avail,
      text: `Skills spend ${skills.spent} / ${skills.avail}.`,
    },
    {
      ok: hindrances.spent <= hindrances.spendable,
      text: `Hindrance benefits spend ${hindrances.spent} / ${hindrances.spendable}.`,
    },
    { ok: freeEdges <= 1, text: "No more than one Human free Edge selected." },
    {
      ok: purchasedEdges <= creationDraft.creation.extraEdgesFromHindrances,
      text: `Hindrance-purchased Edges ${purchasedEdges} / ${creationDraft.creation.extraEdgesFromHindrances}.`,
    },
    {
      ok: arcaneBackgrounds.length <= 1,
      text: "Only one Arcane Background selected.",
    },
    {
      ok:
        !arcaneBackgrounds[0] ||
        creationDraft.skills.some(
          (skill) =>
            skill.name ===
            arcaneBackgroundConfigFromEdge(arcaneBackgrounds[0].name)
              ?.arcaneSkill,
        ),
      text: arcaneBackgrounds[0]
        ? `${arcaneBackgroundConfigFromEdge(arcaneBackgrounds[0].name)?.arcaneSkill} skill present for ${arcaneBackgrounds[0].name}.`
        : "No Arcane Background selected.",
      blocking: false,
    },
    ...arcaneRequirementItems(arcaneConfig),
    {
      ok: remainingMoney >= 0 || creationDraft.creation.allowDebt,
      text: "Gear spending within available money or debt allowed.",
    },
    {
      ok: derived.parry > 0 && derived.baseToughness > 0,
      text: "Derived stats calculated.",
    },
  ];
  const errors = items.filter(
    (item) =>
      !item.ok &&
      !creationDraft.creation.allowIncomplete &&
      item.blocking !== false,
  );
  const warnings = items.filter((item) => !item.ok);
  return { items, errors, warnings, valid: errors.length === 0 };
}

function bindCreatorInputs() {
  document.querySelectorAll("[data-cf]").forEach((input) => {
    input.oninput = () => {
      creationDraft[input.dataset.cf] = input.value;
      if (input.dataset.cf === "concept") renderCreator();
      saveCreationDraft();
    };
  });
  document.querySelectorAll("[data-cn]").forEach((input) => {
    input.oninput = () => {
      const previous = creationDraft.creation[input.dataset.cn];
      creationDraft.creation[input.dataset.cn] = Math.max(
        0,
        Math.floor(Number(input.value) || 0),
      );
      if (hindranceStats().remaining < 0)
        creationDraft.creation[input.dataset.cn] = previous;
      saveCreationDraft();
      renderCreator();
    };
  });
  document.querySelectorAll("[data-cb]").forEach((input) => {
    input.onchange = () => {
      creationDraft.creation[input.dataset.cb] = input.checked;
      saveCreationDraft();
      renderCreator();
    };
  });
  document.querySelectorAll("[data-pp]").forEach((input) => {
    input.oninput = () => {
      const key = input.dataset.pp;
      creationDraft.powerPoints[key] =
        key === "notes"
          ? input.value
          : Math.max(0, Math.floor(Number(input.value) || 0));
      if (
        key === "max" &&
        creationDraft.powerPoints.current > creationDraft.powerPoints.max
      )
        creationDraft.powerPoints.current = creationDraft.powerPoints.max;
      saveCreationDraft();
    };
  });
  document.querySelectorAll("[data-cp]").forEach((input) => {
    const apply = () => {
      const power = creationDraft.powers[Number(input.dataset.cp)];
      if (!power) return;
      const field = input.dataset.cpf;
      power[field] = input.type === "checkbox" ? input.checked : input.value;
      saveCreationDraft();
      if (field === "name" || field === "active") renderCreator();
    };
    input.oninput = apply;
    input.onchange = apply;
  });
  document.querySelectorAll("[data-hd]").forEach((input) => {
    const apply = () => {
      if (!creationDraft.hucksterDeal)
        creationDraft.hucksterDeal = makeHucksterDeal();
      const field = input.dataset.hd;
      creationDraft.hucksterDeal[field] =
        input.type === "checkbox"
          ? input.checked
          : input.type === "number"
            ? Math.max(0, Math.floor(Number(input.value) || 0))
            : input.value;
      creationDraft.hucksterDeal = normalizeHucksterDeal(
        creationDraft.hucksterDeal,
      );
      saveCreationDraft();
    };
    input.oninput = apply;
    input.onchange = apply;
  });

  const typeSelect = $("#ccGearType");
  const itemSelect = $("#ccGearId");
  if (typeSelect && itemSelect) {
    const fill = () => {
      const type = typeSelect.value;
      const items =
        type === "weapon"
          ? WEAPON_CATALOG
          : type === "ammo"
            ? GEAR_CATALOG.filter(isAmmo)
            : type === "armor"
              ? ARMOR_CATALOG
              : type === "vehicle"
                ? VEHICLE_CATALOG
                : catalogByName(GEAR_CATALOG);
      itemSelect.innerHTML = catalogOptions(items);
    };
    typeSelect.onchange = fill;
    fill();
  }

  const file = $("#creatorImportFile");
  if (file) {
    file.onchange = (event) => {
      const imported = event.target.files[0];
      if (!imported) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          creationDraft = normalizeDraft(data.creationDraft || data);
          saveCreationDraft();
          renderCreator();
        } catch {
          alert("That file was not valid character creation JSON.");
        }
      };
      reader.readAsText(imported);
    };
  }
}

function creatorBuy() {
  const type = $("#ccGearType").value;
  const id = $("#ccGearId").value;
  const quantity = Math.max(1, Math.floor(Number($("#ccGearQty").value) || 1));
  if (!id) return;

  const source =
    type === "weapon"
      ? WEAPON_CATALOG
      : type === "ammo"
        ? GEAR_CATALOG.filter(isAmmo)
        : type === "armor"
          ? ARMOR_CATALOG
          : type === "vehicle"
            ? VEHICLE_CATALOG
            : GEAR_CATALOG;
  const item = source.find((entry) => entry.id === id);
  if (!item) return;

  if (type === "weapon") {
    for (let index = 0; index < quantity; index += 1) {
      creationDraft.weapons.push({
        id: `${item.id}-${Date.now()}-${index}`,
        name: item.name,
        count: 1,
        damage: item.damage || "—",
        range: item.range || "—",
        ap: item.ap || 0,
        rof: item.rof || "—",
        shotsMax: item.shotsMax || null,
        shotsLoaded: 0,
        ammoType: item.ammoType || null,
        notes: item.notes || "",
        weight: item.weight,
        costCents: item.costCents,
        minStr: item.minStr,
        book: item.book || "Deadlands",
      });
    }
  } else if (type === "ammo") {
    const key = savagedAmmoKey(item);
    if (!creationDraft.ammo[key])
      creationDraft.ammo[key] = {
        label: item.name,
        count: 0,
        weight: item.weight,
        costCents: item.costCents,
      };
    creationDraft.ammo[key].count += quantity;
  } else if (type === "armor") {
    creationDraft.armorInventory.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      armor: item.armor || 0,
      weight: item.weight,
      minStr: item.minStr,
      costCents: item.costCents,
      book: item.book || "Deadlands",
      location: item.location || "torso",
      equipped: true,
      note: "Starting armor.",
    });
  } else if (type === "vehicle") {
    creationDraft.vehicles.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      note: "Starting vehicle.",
      costCents: item.costCents,
      book: item.book || "Deadlands",
    });
  } else {
    creationDraft.inventory.push({
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      count: quantity,
      note: "Starting gear.",
      weight: item.weight,
      costCents: item.costCents,
      book: item.book || "Deadlands",
    });
  }

  saveCreationDraft();
  renderCreator();
}

function finalizeCreation() {
  const checks = creationChecks();
  if (!checks.valid && !creationDraft.creation.allowIncomplete) {
    alert(
      "Character is not valid yet. Check the final review or enable incomplete finalization.",
    );
    return;
  }

  const derived = creationDerived();
  const concept =
    creationDraft.concept === "Custom"
      ? creationDraft.customConcept
      : creationDraft.concept;
  const arcaneConfig = draftArcaneConfig();
  const resources = creationDraft.powerPoints.enabled
    ? [
        {
          id: "power-points",
          name: "Power Points",
          current: creationDraft.powerPoints.current,
          max: creationDraft.powerPoints.max,
          source: creationDraft.powerPoints.source || "Arcane Background",
          note: creationDraft.powerPoints.notes || "Imported from creator.",
        },
      ]
    : [];
  const reminders = [
    ...creationDraft.hindrances.map((hindrance) => ({
      type: "Hindrance",
      name: hindrance.name,
      text: hindrance.notes || hindrance.severity,
    })),
    ...creationDraft.edges.map((edge) => ({
      type: "Edge",
      name: edge.name,
      text: edge.notes || edge.source,
    })),
    ...(arcaneConfig ? [makeArcaneReminder(arcaneConfig)] : []),
  ];
  const notes = [
    creationDraft.description,
    creationDraft.background ? `Background: ${creationDraft.background}` : "",
    creationDraft.worstNightmare
      ? `Worst nightmare: ${creationDraft.worstNightmare}`
      : "",
    `Player: ${creationDraft.player || "—"}`,
    `Attributes: ${Object.entries(creationDraft.attributes)
      .map(([key, value]) => `${key} ${value}`)
      .join(", ")}`,
    `Skills: ${creationDraft.skills.map((skill) => `${skill.name} ${skill.die}`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  character = normalize({
    ...clone(defaultCharacter),
    source: "created",
    name: creationDraft.name,
    player: creationDraft.player,
    rank: creationDraft.rank || "Novice",
    ancestry: "Human",
    archetype: concept || "",
    description: creationDraft.description,
    background: creationDraft.background,
    worstNightmare: creationDraft.worstNightmare,
    attributes: clone(creationDraft.attributes),
    skills: clone(creationDraft.skills),
    hindrances: clone(creationDraft.hindrances),
    edges: clone(creationDraft.edges),
    creation: { ...clone(creationDraft.creation), finalized: true },
    arcaneBackground: creationDraft.arcaneBackground
      ? clone(creationDraft.arcaneBackground)
      : arcaneConfig
        ? makeArcaneBackgroundState(arcaneConfig)
        : null,
    powerPoints: clone(creationDraft.powerPoints),
    powers: clone(creationDraft.powers),
    hucksterDeal: clone(creationDraft.hucksterDeal),
    resources,
    damage: { wounds: 0, maxWounds: 3, fatigue: 0, maxFatigue: 2 },
    bennies: { current: 3, starting: 3, normalStarting: 3 },
    derived: {
      pace: derived.pace,
      parry: derived.parry,
      baseToughness: derived.baseToughness,
      toughness: derived.toughness,
      armor: derived.armor,
    },
    armorStrength: creationDraft.attributes.strength,
    weaponStrength: creationDraft.attributes.strength,
    selectedArmorLocation: "best",
    moneyCents:
      25000 +
      creationDraft.creation.extraMoneyFromHindrances * 50000 -
      creationGearSpent(),
    ammo: clone(creationDraft.ammo),
    weapons: clone(creationDraft.weapons),
    armorInventory: clone(creationDraft.armorInventory),
    inventory: clone(creationDraft.inventory),
    vehicles: clone(creationDraft.vehicles),
    reminders,
    notes,
  });
  save();
  render();
  setCreatorMode(false);
}

function creatorAction(actionName, target) {
  if (actionName === "saveDraft") {
    saveCreationDraft();
    alert("Character creation draft saved.");
  } else if (actionName === "finalize") {
    finalizeCreation();
  } else if (actionName === "resetDraft") {
    if (confirm("Reset character creation draft?")) {
      creationDraft = emptyDraft();
      saveCreationDraft();
      renderCreator();
    }
  } else if (actionName === "exportDraft") {
    exportJson(
      `${slugify(creationDraft.name || "character")}-creation-draft.json`,
      creationDraft,
    );
  } else if (actionName === "exportFull") {
    exportJson("deadlands-tracker-full-state.json", {
      activeCharacter: character,
      creationDraft,
    });
  } else if (actionName === "addHindrance") {
    const severity = $("#ccHindranceSeverity").value;
    creationDraft.hindrances.push({
      name: $("#ccHindranceName").value,
      severity,
      points: severity === "Major" ? 2 : 1,
      notes: $("#ccHindranceNotes").value,
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeHindrance") {
    creationDraft.hindrances.splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "incAttr" || actionName === "decAttr") {
    const key = target.dataset.k;
    const index = dieIndex(creationDraft.attributes[key]);
    if (
      actionName === "incAttr" &&
      index < 4 &&
      attrSpent() <
        5 + creationDraft.creation.extraAttributeRaisesFromHindrances
    )
      creationDraft.attributes[key] = dieFromIndex(index + 1);
    if (actionName === "decAttr" && index > 0)
      creationDraft.attributes[key] = dieFromIndex(index - 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "addSkill") {
    const name = $("#ccSkillName").value;
    const definition = SKILL_DEFS.find((skill) => skill[0] === name);
    const notes = $("#ccSkillNotes").value;
    const finalName =
      name === "Language" && notes
        ? `Language (${notes})`
        : name === "Trade" && notes
          ? `Trade (${notes})`
          : name;
    creationDraft.skills.push({
      name: finalName,
      die: "d4",
      linkedAttribute: definition?.[1] || "smarts",
      notes,
      core: false,
      language: name === "Language",
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "incSkill" || actionName === "decSkill") {
    const skill = creationDraft.skills[Number(target.dataset.i)];
    const index = dieIndex(skill.die);
    if (actionName === "incSkill" && index < 4)
      skill.die = dieFromIndex(index + 1);
    if (actionName === "decSkill" && index > 0)
      skill.die = dieFromIndex(index - 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeSkill") {
    creationDraft.skills.splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "addEdge") {
    let name = $("#ccEdgeName").value;
    if (name === "Custom") name = $("#ccEdgeNotes").value || "Custom Edge";
    if (
      isArcaneBackgroundEdge(name) &&
      creationDraft.edges.some((edge) => isArcaneBackgroundEdge(edge.name))
    ) {
      alert("Only one Arcane Background can be selected.");
      return;
    }
    if (isArcaneBackgroundEdge(name)) {
      applyArcaneBackgroundToDraft(
        name,
        $("#ccEdgeSource").value,
        $("#ccEdgeNotes").value,
      );
      saveCreationDraft();
      renderCreator();
      return;
    }
    creationDraft.edges.push({
      name,
      source: $("#ccEdgeSource").value,
      notes: $("#ccEdgeNotes").value,
      requirements: "",
    });
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeEdge") {
    const edge = creationDraft.edges.splice(Number(target.dataset.i), 1)[0];
    if (edge && isArcaneBackgroundEdge(edge.name)) clearDraftArcaneBackground();
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "buyGear") {
    creatorBuy();
  } else if (actionName === "removePurchase") {
    const map = {
      Weapons: "weapons",
      Armor: "armorInventory",
      Inventory: "inventory",
      Vehicles: "vehicles",
    };
    creationDraft[map[target.dataset.list]].splice(Number(target.dataset.i), 1);
    saveCreationDraft();
    renderCreator();
  } else if (actionName === "removeAmmoPurchase") {
    delete creationDraft.ammo[target.dataset.k];
    saveCreationDraft();
    renderCreator();
  }
}

document.addEventListener("click", (event) => {
  const actionName = event.target?.dataset?.cc;
  if (actionName) creatorAction(actionName, event.target);
});

document.querySelectorAll("[data-app-tab]").forEach((button) => {
  button.onclick = () => setAppTab(button.dataset.appTab);
});
$("#loadSampleBtn").onclick = () => {
  if (confirm("Load Dusty McCaw sample into the tracker?")) {
    character = normalize(clone(defaultCharacter));
    localStorage.removeItem(STORAGE_KEY);
    render();
    save();
    setCreatorMode(false);
  }
};

// src/app.js
catalogs();
updatePreviews();
render();
save();
