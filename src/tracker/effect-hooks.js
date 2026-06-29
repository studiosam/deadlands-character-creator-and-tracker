/**
 * Deterministic passive effects and rule reminders.
 *
 * Effect hooks convert known Edges and Hindrances into safe app-visible effects:
 * numeric modifiers when the rule is deterministic, reminders when table context
 * is required, and status markers when player subchoices are still missing.
 */
function automationStatusEffect(
  status,
  target,
  displayLabel,
  appliesTo = ["character"],
) {
  return {
    type: "automation-status",
    status,
    target,
    appliesTo,
    displayLabel,
  };
}

function rollModifierEffect(
  target,
  trait,
  context,
  value,
  displayLabel,
  options = {},
) {
  return {
    type: "roll-modifier",
    target,
    trait,
    context,
    value,
    appliesTo: options.appliesTo || ["character", "combat"],
    displayLabel,
    ...(options.exclusiveGroup
      ? { exclusiveGroup: options.exclusiveGroup }
      : {}),
  };
}

function reminderEffect(target, displayLabel, options = {}) {
  return {
    type: "reminder",
    target,
    value: options.value,
    appliesTo: options.appliesTo || ["character", "combat"],
    displayLabel,
    ...(options.exclusiveGroup
      ? { exclusiveGroup: options.exclusiveGroup }
      : {}),
  };
}

function resourceRecoveryRateEffect(target, value, displayLabel, options = {}) {
  return {
    type: "resource-recovery-rate",
    target,
    value,
    appliesTo: options.appliesTo || ["character", "combat"],
    displayLabel,
    ...(options.exclusiveGroup
      ? { exclusiveGroup: options.exclusiveGroup }
      : {}),
  };
}

const EFFECT_HOOK_REGISTRY = [
  {
    id: "edge-alertness",
    sourceType: "edge",
    matchName: "Alertness",
    label: "Alertness",
    summary: "+2 to Notice rolls.",
    effects: [
      {
        type: "roll-modifier",
        target: "notice",
        trait: "Notice",
        context: "all Notice rolls",
        value: 2,
        appliesTo: ["character", "combat"],
        displayLabel: "Notice +2",
      },
    ],
  },
  {
    id: "edge-arcane-resistance",
    sourceType: "edge",
    matchName: "Arcane Resistance",
    label: "Arcane Resistance",
    summary: "+2 to resist magical effects; magical damage reduced by 2.",
    effects: [
      rollModifierEffect(
        "resist-magical-effects",
        "Resist magic",
        "resisting magical effects",
        2,
        "Resist magical effects +2",
        { exclusiveGroup: "arcane-resistance-roll" },
      ),
      reminderEffect(
        "magical-damage-reduction",
        "Magical damage reduced by 2",
        { value: 2, exclusiveGroup: "arcane-resistance-damage" },
      ),
    ],
  },
  {
    id: "edge-improved-arcane-resistance",
    sourceType: "edge",
    matchName: "Improved Arcane Resistance",
    label: "Improved Arcane Resistance",
    summary: "+4 to resist magical effects; magical damage reduced by 4.",
    effects: [
      rollModifierEffect(
        "resist-magical-effects",
        "Resist magic",
        "resisting magical effects",
        4,
        "Resist magical effects +4",
        { exclusiveGroup: "arcane-resistance-roll" },
      ),
      reminderEffect(
        "magical-damage-reduction",
        "Magical damage reduced by 4",
        { value: 4, exclusiveGroup: "arcane-resistance-damage" },
      ),
    ],
  },
  {
    id: "edge-aristocrat",
    sourceType: "edge",
    matchName: "Aristocrat",
    label: "Aristocrat",
    summary: "+2 to Common Knowledge and networking with the upper class.",
    effects: [
      rollModifierEffect(
        "upper-class-common-knowledge",
        "Common Knowledge",
        "upper-class knowledge and networking",
        2,
        "Common Knowledge +2 with the upper class",
      ),
    ],
  },
  {
    id: "edge-attractive",
    sourceType: "edge",
    matchName: "Attractive",
    label: "Attractive",
    summary: "+1 to Performance and Persuasion when appearance matters.",
    effects: [
      rollModifierEffect(
        "appearance-performance",
        "Performance",
        "when appearance matters",
        1,
        "Performance +1 when appearance matters",
        { exclusiveGroup: "appearance-performance" },
      ),
      rollModifierEffect(
        "appearance-persuasion",
        "Persuasion",
        "when appearance matters",
        1,
        "Persuasion +1 when appearance matters",
        { exclusiveGroup: "appearance-persuasion" },
      ),
    ],
  },
  {
    id: "edge-very-attractive",
    sourceType: "edge",
    matchName: "Very Attractive",
    label: "Very Attractive",
    summary: "+2 to Performance and Persuasion when appearance matters.",
    effects: [
      rollModifierEffect(
        "appearance-performance",
        "Performance",
        "when appearance matters",
        2,
        "Performance +2 when appearance matters",
        { exclusiveGroup: "appearance-performance" },
      ),
      rollModifierEffect(
        "appearance-persuasion",
        "Persuasion",
        "when appearance matters",
        2,
        "Persuasion +2 when appearance matters",
        { exclusiveGroup: "appearance-persuasion" },
      ),
    ],
  },
  {
    id: "edge-brave",
    sourceType: "edge",
    matchName: "Brave",
    label: "Brave",
    summary: "+2 to Fear checks and -2 on Fear Table rolls.",
    effects: [
      {
        type: "roll-modifier",
        target: "fear-checks",
        trait: "Spirit",
        context: "Fear checks",
        value: 2,
        appliesTo: ["character", "combat"],
        displayLabel: "Fear checks +2",
      },
      {
        type: "roll-modifier",
        target: "fear-table",
        trait: "Fear Table",
        context: "Fear Table rolls",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Fear Table rolls -2",
      },
    ],
  },
  {
    id: "edge-brawny",
    sourceType: "edge",
    matchName: "Brawny",
    label: "Brawny",
    summary:
      "Size and Toughness +1; Strength counts one die higher for Encumbrance and Minimum Strength.",
    effects: [
      {
        type: "numeric-modifier",
        target: "size",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Size +1",
      },
      {
        type: "numeric-modifier",
        target: "toughness",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Toughness +1",
      },
      {
        type: "die-step-modifier",
        target: "strength",
        value: 1,
        appliesTo: ["encumbrance", "minimum-strength", "inventory"],
        displayLabel:
          "Strength counts one die higher for Encumbrance and Minimum Strength",
      },
    ],
  },
  {
    id: "edge-berserk",
    sourceType: "edge",
    matchName: "Berserk",
    label: "Berserk",
    summary:
      "Berserk changes require active rage state and table adjudication before automation is safe.",
    effects: [
      automationStatusEffect(
        "table-dependent",
        "berserk-state",
        "Manual/table: track Berserk state and uncontrolled attacks",
        ["character", "combat"],
      ),
    ],
  },
  {
    id: "edge-block",
    sourceType: "edge",
    matchName: "Block",
    label: "Block",
    summary: "+1 Parry and ignore 1 point of Gang Up bonus.",
    effects: [
      {
        type: "numeric-modifier",
        target: "parry",
        value: 1,
        exclusiveGroup: "block-parry",
        appliesTo: ["character", "combat"],
        displayLabel: "Parry +1",
      },
      {
        type: "reminder",
        target: "gang-up",
        exclusiveGroup: "block-gang-up",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Ignore 1 point of Gang Up bonus",
      },
    ],
  },
  {
    id: "edge-brawler",
    sourceType: "edge",
    matchName: "Brawler",
    label: "Brawler",
    summary: "+1 Toughness and improved unarmed damage.",
    effects: [
      {
        type: "numeric-modifier",
        target: "toughness",
        value: 1,
        requiresTrustedBaseline: true,
        appliesTo: ["character", "combat"],
        displayLabel: "Toughness +1",
      },
      {
        type: "reminder",
        target: "unarmed-damage",
        appliesTo: ["character", "combat"],
        displayLabel: "Improved unarmed damage",
      },
    ],
  },
  {
    id: "edge-fleet-footed",
    sourceType: "edge",
    matchName: "Fleet-Footed",
    label: "Fleet-Footed",
    summary: "Pace +2 and running die increases one step.",
    effects: [
      {
        type: "numeric-modifier",
        target: "pace",
        value: 2,
        appliesTo: ["character", "combat"],
        displayLabel: "Pace +2",
      },
      {
        type: "reminder",
        target: "running-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Running die increases one step",
      },
    ],
  },
  {
    id: "edge-danger-sense",
    sourceType: "edge",
    matchName: "Danger Sense",
    label: "Danger Sense",
    summary: "Notice roll at +2 to sense ambushes or similar danger.",
    effects: [
      {
        type: "roll-modifier",
        target: "notice-danger",
        trait: "Notice",
        context: "ambushes or similar danger",
        value: 2,
        appliesTo: ["character", "combat"],
        displayLabel: "Notice +2 to sense ambushes or similar danger",
      },
    ],
  },
  {
    id: "edge-elan",
    sourceType: "edge",
    matchName: "Elan",
    label: "Elan",
    summary: "+2 when spending a Benny to reroll a Trait roll.",
    effects: [
      rollModifierEffect(
        "benny-trait-reroll",
        "Trait",
        "Benny rerolls",
        2,
        "Trait rerolls with a Benny +2",
      ),
    ],
  },
  {
    id: "edge-fast-healer",
    sourceType: "edge",
    matchName: "Fast Healer",
    label: "Fast Healer",
    summary: "+2 to natural healing rolls and checks more often.",
    effects: [
      rollModifierEffect(
        "natural-healing",
        "Vigor",
        "natural healing rolls",
        2,
        "Natural healing rolls +2",
      ),
      reminderEffect(
        "natural-healing-frequency",
        "Natural healing checks occur more often",
      ),
    ],
  },
  {
    id: "edge-healer",
    sourceType: "edge",
    matchName: "Healer",
    label: "Healer",
    summary: "+2 to Healing rolls, magical or mundane.",
    effects: [
      rollModifierEffect(
        "healing-rolls",
        "Healing",
        "magical or mundane Healing rolls",
        2,
        "Healing rolls +2",
      ),
    ],
  },
  {
    id: "edge-improved-block",
    sourceType: "edge",
    matchName: "Improved Block",
    label: "Improved Block",
    summary: "+2 Parry and ignore 2 points of Gang Up bonus.",
    effects: [
      {
        type: "numeric-modifier",
        target: "parry",
        value: 2,
        exclusiveGroup: "block-parry",
        appliesTo: ["character", "combat"],
        displayLabel: "Parry +2",
      },
      {
        type: "reminder",
        target: "gang-up",
        exclusiveGroup: "block-gang-up",
        value: 2,
        appliesTo: ["character", "combat"],
        displayLabel: "Ignore 2 points of Gang Up bonus",
      },
    ],
  },
  {
    id: "edge-investigator",
    sourceType: "edge",
    matchName: "Investigator",
    label: "Investigator",
    summary: "+2 to Research and clue-related Notice rolls.",
    effects: [
      rollModifierEffect(
        "research",
        "Research",
        "Research rolls",
        2,
        "Research +2",
      ),
      rollModifierEffect(
        "clue-notice",
        "Notice",
        "clue-related Notice rolls",
        2,
        "Notice +2 for clues",
      ),
    ],
  },
  {
    id: "edge-iron-jaw",
    sourceType: "edge",
    matchName: "Iron Jaw",
    label: "Iron Jaw",
    summary: "+2 to Soak rolls and to avoid Knockout Blows.",
    effects: [
      rollModifierEffect("soak", "Vigor", "Soak rolls", 2, "Soak rolls +2"),
      rollModifierEffect(
        "avoid-knockout-blows",
        "Vigor",
        "avoiding Knockout Blows",
        2,
        "Avoid Knockout Blows +2",
      ),
    ],
  },
  {
    id: "edge-luck",
    sourceType: "edge",
    matchName: "Luck",
    label: "Luck",
    summary: "Starts each session with one additional Benny.",
    effects: [
      sessionBennyEffect(1, "Starting Bennies +1", {
        exclusiveGroup: "session-benny-luck",
      }),
    ],
  },
  {
    id: "edge-great-luck",
    sourceType: "edge",
    matchName: "Great Luck",
    label: "Great Luck",
    summary: "Starts each session with two additional Bennies.",
    effects: [
      sessionBennyEffect(2, "Starting Bennies +2", {
        exclusiveGroup: "session-benny-luck",
      }),
    ],
  },
  {
    id: "edge-quick",
    sourceType: "edge",
    matchName: "Quick",
    label: "Quick",
    summary: "May discard and redraw Action Cards of 5 or lower.",
    effects: [
      actionCardRuleEffect(
        "quick-redraw",
        "Action Cards of 5 or lower may be redrawn",
      ),
    ],
  },
  {
    id: "edge-rapid-recharge",
    sourceType: "edge",
    matchName: "Rapid Recharge",
    label: "Rapid Recharge",
    summary: "Recover 10 Power Points per hour.",
    effects: [
      resourceRecoveryRateEffect(
        "power-points-per-hour",
        10,
        "Power Points recover 10 per hour",
        {
          exclusiveGroup: "power-points-recovery-rate",
        },
      ),
    ],
  },
  {
    id: "edge-improved-rapid-recharge",
    sourceType: "edge",
    matchName: "Improved Rapid Recharge",
    label: "Improved Rapid Recharge",
    summary: "Recover 20 Power Points per hour.",
    effects: [
      resourceRecoveryRateEffect(
        "power-points-per-hour",
        20,
        "Power Points recover 20 per hour",
        {
          exclusiveGroup: "power-points-recovery-rate",
        },
      ),
    ],
  },
  {
    id: "edge-level-headed",
    sourceType: "edge",
    matchName: "Level Headed",
    label: "Level Headed",
    summary:
      "Draw an additional Action Card each round and choose which to use.",
    effects: [
      actionCardRuleEffect(
        "level-headed-draw",
        "Draw one additional Action Card and choose which to use",
        {
          value: 1,
          exclusiveGroup: "level-headed-action-card-draw",
        },
      ),
    ],
  },
  {
    id: "edge-improved-level-headed",
    sourceType: "edge",
    matchName: "Improved Level Headed",
    label: "Improved Level Headed",
    summary:
      "Draw two additional Action Cards each round and choose which to use.",
    effects: [
      actionCardRuleEffect(
        "level-headed-draw",
        "Draw two additional Action Cards and choose which to use",
        {
          value: 2,
          exclusiveGroup: "level-headed-action-card-draw",
        },
      ),
    ],
  },
  {
    id: "edge-menacing",
    sourceType: "edge",
    matchName: "Menacing",
    label: "Menacing",
    summary: "+2 to Intimidation using bad looks or attitude.",
    effects: [
      rollModifierEffect(
        "menacing-intimidation",
        "Intimidation",
        "using bad looks or attitude",
        2,
        "Intimidation +2 using bad looks or attitude",
      ),
    ],
  },
  {
    id: "edge-mr-fix-it",
    sourceType: "edge",
    matchName: "Mr. Fix It",
    label: "Mr. Fix It",
    summary: "+2 to Repair rolls; repairs take less time with a raise.",
    effects: [
      rollModifierEffect("repair", "Repair", "Repair rolls", 2, "Repair +2"),
      reminderEffect("repair-time", "Repairs take less time with a raise"),
    ],
  },
  {
    id: "edge-improved-nerves-of-steel",
    sourceType: "edge",
    matchName: "Improved Nerves of Steel",
    label: "Improved Nerves of Steel",
    summary: "Ignore up to two levels of Wound penalties.",
    effects: [
      {
        type: "penalty-reduction",
        target: "wound-penalty",
        value: 2,
        exclusiveGroup: "wound-penalty-reduction",
        appliesTo: ["character", "combat"],
        displayLabel: "Ignore up to 2 Wound penalty levels",
      },
    ],
  },
  {
    id: "edge-nerves-of-steel",
    sourceType: "edge",
    matchName: "Nerves of Steel",
    label: "Nerves of Steel",
    summary: "Ignore one level of Wound penalties.",
    effects: [
      {
        type: "penalty-reduction",
        target: "wound-penalty",
        value: 1,
        exclusiveGroup: "wound-penalty-reduction",
        appliesTo: ["character", "combat"],
        displayLabel: "Ignore 1 Wound penalty level",
      },
    ],
  },
  {
    id: "edge-soldier",
    sourceType: "edge",
    matchName: "Soldier",
    label: "Soldier",
    summary:
      "Strength counts one die higher for Encumbrance and Minimum Strength; remember Vigor rerolls against environmental Hazards if using the SWADE Edge.",
    effects: [
      {
        type: "die-step-modifier",
        target: "strength",
        value: 1,
        appliesTo: ["encumbrance", "minimum-strength", "inventory"],
        displayLabel:
          "Strength counts one die higher for Encumbrance and Minimum Strength",
      },
      {
        type: "reminder",
        target: "environmental-hazards",
        appliesTo: ["combat"],
        displayLabel:
          "Remember Soldier Vigor rerolls against environmental Hazards when applicable",
      },
    ],
  },
  {
    id: "edge-streetwise",
    sourceType: "edge",
    matchName: "Streetwise",
    label: "Streetwise",
    summary: "+2 to Common Knowledge and criminal networking.",
    effects: [
      rollModifierEffect(
        "streetwise-common-knowledge",
        "Common Knowledge",
        "criminal networking",
        2,
        "Common Knowledge +2 for criminal networking",
      ),
    ],
  },
  {
    id: "edge-strong-willed",
    sourceType: "edge",
    matchName: "Strong Willed",
    label: "Strong Willed",
    summary: "+2 to resist Smarts or Spirit-based Tests.",
    effects: [
      rollModifierEffect(
        "resist-smarts-spirit-tests",
        "Smarts/Spirit",
        "resisting Smarts or Spirit-based Tests",
        2,
        "Resist Smarts or Spirit-based Tests +2",
        { exclusiveGroup: "test-resistance" },
      ),
    ],
  },
  {
    id: "edge-iron-will",
    sourceType: "edge",
    matchName: "Iron Will",
    label: "Iron Will",
    summary: "+4 to resist Smarts or Spirit-based Tests.",
    effects: [
      rollModifierEffect(
        "resist-smarts-spirit-tests",
        "Smarts/Spirit",
        "resisting Smarts or Spirit-based Tests",
        4,
        "Resist Smarts or Spirit-based Tests +4",
        { exclusiveGroup: "test-resistance" },
      ),
    ],
  },
  {
    id: "edge-thief",
    sourceType: "edge",
    matchName: "Thief",
    label: "Thief",
    summary: "+1 to Thievery, climbing Athletics, and urban Stealth.",
    effects: [
      rollModifierEffect(
        "thievery",
        "Thievery",
        "Thievery rolls",
        1,
        "Thievery +1",
      ),
      rollModifierEffect(
        "climbing-athletics",
        "Athletics",
        "climbing",
        1,
        "Athletics +1 when climbing",
      ),
      rollModifierEffect(
        "urban-stealth",
        "Stealth",
        "urban areas",
        1,
        "Stealth +1 in urban areas",
      ),
    ],
  },
  {
    id: "edge-trademark-weapon",
    sourceType: "edge",
    matchName: "Trademark Weapon",
    label: "Trademark Weapon",
    summary: "Attack and Parry bonus applies to one specific chosen weapon.",
    effects: [
      automationStatusEffect(
        "subchoice-required",
        "chosen-weapon",
        "Subchoice required: choose the specific weapon before attack/Parry bonus can be automated",
        ["character", "combat"],
      ),
    ],
  },
  {
    id: "edge-woodsman",
    sourceType: "edge",
    matchName: "Woodsman",
    label: "Woodsman",
    summary: "+2 to Survival and wilderness Stealth.",
    effects: [
      rollModifierEffect(
        "survival",
        "Survival",
        "Survival rolls",
        2,
        "Survival +2",
      ),
      rollModifierEffect(
        "wilderness-stealth",
        "Stealth",
        "wilderness areas",
        2,
        "Stealth +2 in the wilderness",
      ),
    ],
  },
  {
    id: "edge-tough-as-nails",
    sourceType: "edge",
    matchName: "Tough as Nails",
    label: "Tough as Nails",
    summary: "Can take four Wounds before Incapacitation.",
    effects: [
      {
        type: "numeric-modifier",
        target: "max-wounds",
        value: 1,
        exclusiveGroup: "wound-capacity",
        requiresTrustedBaseline: true,
        appliesTo: ["character", "combat"],
        displayLabel: "Maximum Wounds +1; can take four Wounds",
      },
    ],
  },
  {
    id: "edge-tougher-than-nails",
    sourceType: "edge",
    matchName: "Tougher than Nails",
    label: "Tougher than Nails",
    summary: "Can take five Wounds before Incapacitation.",
    effects: [
      {
        type: "numeric-modifier",
        target: "max-wounds",
        value: 2,
        exclusiveGroup: "wound-capacity",
        requiresTrustedBaseline: true,
        appliesTo: ["character", "combat"],
        displayLabel: "Maximum Wounds +2; can take five Wounds",
      },
    ],
  },
  {
    id: "edge-weapon-master",
    sourceType: "edge",
    matchName: "Weapon Master",
    label: "Weapon Master",
    summary: "Parry +1 and Fighting bonus damage die becomes d8.",
    effects: [
      {
        type: "numeric-modifier",
        target: "parry",
        value: 1,
        exclusiveGroup: "weapon-master-parry",
        appliesTo: ["character", "combat"],
        displayLabel: "Parry +1",
      },
      {
        type: "reminder",
        target: "fighting-bonus-damage",
        value: 8,
        exclusiveGroup: "weapon-master-damage-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Fighting bonus damage die becomes d8",
      },
    ],
  },
  {
    id: "edge-master-of-arms",
    sourceType: "edge",
    matchName: "Master of Arms",
    label: "Master of Arms",
    summary: "Parry +2 and Fighting bonus damage die becomes d10.",
    effects: [
      {
        type: "numeric-modifier",
        target: "parry",
        value: 2,
        exclusiveGroup: "weapon-master-parry",
        appliesTo: ["character", "combat"],
        displayLabel: "Parry +2",
      },
      {
        type: "reminder",
        target: "fighting-bonus-damage",
        value: 10,
        exclusiveGroup: "weapon-master-damage-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Fighting bonus damage die becomes d10",
      },
    ],
  },
  {
    id: "hindrance-all-thumbs",
    sourceType: "hindrance",
    matchName: "All Thumbs",
    label: "All Thumbs",
    summary: "-2 to use mechanical or electrical devices.",
    effects: [
      {
        type: "roll-modifier",
        target: "mechanical-electrical-devices",
        trait: "Mechanical/electrical device use",
        context: "mechanical or electrical devices",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Mechanical or electrical device rolls -2",
      },
    ],
  },
  {
    id: "hindrance-anemic",
    sourceType: "hindrance",
    matchName: "Anemic",
    label: "Anemic",
    summary: "-2 Vigor when resisting Fatigue.",
    effects: [
      {
        type: "roll-modifier",
        target: "resist-fatigue",
        trait: "Vigor",
        context: "resisting Fatigue",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Vigor to resist Fatigue -2",
      },
    ],
  },
  {
    id: "hindrance-bad-luck",
    sourceType: "hindrance",
    matchName: "Bad Luck",
    label: "Bad Luck",
    summary: "Starts each session with one fewer Benny.",
    effects: [sessionBennyEffect(-1, "Starting Bennies -1")],
  },
  {
    id: "hindrance-clueless",
    sourceType: "hindrance",
    matchName: "Clueless",
    label: "Clueless",
    summary: "-1 to Common Knowledge and Notice.",
    effects: [
      rollModifierEffect(
        "common-knowledge",
        "Common Knowledge",
        "Common Knowledge rolls",
        -1,
        "Common Knowledge -1",
      ),
      rollModifierEffect("notice", "Notice", "Notice rolls", -1, "Notice -1"),
    ],
  },
  {
    id: "hindrance-clumsy",
    sourceType: "hindrance",
    matchName: "Clumsy",
    label: "Clumsy",
    summary: "-2 to Athletics and Stealth.",
    effects: [
      rollModifierEffect(
        "athletics",
        "Athletics",
        "Athletics rolls",
        -2,
        "Athletics -2",
      ),
      rollModifierEffect(
        "stealth",
        "Stealth",
        "Stealth rolls",
        -2,
        "Stealth -2",
      ),
    ],
  },
  {
    id: "hindrance-hesitant",
    sourceType: "hindrance",
    matchName: "Hesitant",
    label: "Hesitant",
    summary: "Draws two Action Cards and keeps the lowest, except Jokers.",
    effects: [
      actionCardRuleEffect(
        "hesitant-draw",
        "Draw two Action Cards and keep the lowest, except Jokers",
      ),
    ],
  },
  {
    id: "hindrance-mean",
    sourceType: "hindrance",
    matchName: "Mean",
    label: "Mean",
    summary: "-1 to Persuasion rolls.",
    effects: [
      {
        type: "roll-modifier",
        target: "persuasion",
        trait: "Persuasion",
        context: "social rolls",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Persuasion -1",
      },
    ],
  },
  {
    id: "hindrance-mild-mannered",
    sourceType: "hindrance",
    matchName: "Mild Mannered",
    label: "Mild Mannered",
    summary: "-2 to Intimidation rolls.",
    effects: [
      {
        type: "roll-modifier",
        target: "intimidation",
        trait: "Intimidation",
        context: "Intimidation rolls",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Intimidation -2",
      },
    ],
  },
  {
    id: "hindrance-one-eye",
    sourceType: "hindrance",
    matchName: "One Eye",
    label: "One Eye",
    summary: "-2 to actions at 5 inches / 10 yards or more.",
    effects: [
      rollModifierEffect(
        "distance-actions",
        "Actions",
        "actions at 5 inches / 10 yards or more",
        -2,
        "Actions at 5 inches / 10 yards or more -2",
      ),
    ],
  },
  {
    id: "hindrance-small",
    sourceType: "hindrance",
    matchName: "Small",
    label: "Small",
    summary: "Size and Toughness -1.",
    effects: [
      {
        type: "numeric-modifier",
        target: "size",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Size -1",
      },
      {
        type: "numeric-modifier",
        target: "toughness",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Toughness -1",
      },
    ],
  },
  {
    id: "hindrance-slow-minor",
    sourceType: "hindrance",
    matchName: "Slow",
    severity: "minor",
    label: "Slow (Minor)",
    summary: "Pace -1 and running die d4.",
    effects: [
      {
        type: "numeric-modifier",
        target: "pace",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Pace -1",
      },
      {
        type: "reminder",
        target: "running-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Running die is d4",
      },
    ],
  },
  {
    id: "hindrance-slow-major",
    sourceType: "hindrance",
    matchName: "Slow",
    severity: "major",
    label: "Slow (Major)",
    summary:
      "Pace -2, running die d4, and Athletics or resisting Athletics -2.",
    effects: [
      {
        type: "numeric-modifier",
        target: "pace",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Pace -2",
      },
      {
        type: "reminder",
        target: "running-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Running die is d4",
      },
      {
        type: "reminder",
        target: "athletics",
        appliesTo: ["character", "combat"],
        displayLabel: "Athletics and rolls to resist Athletics -2",
      },
    ],
  },
  {
    id: "hindrance-tongue-tied",
    sourceType: "hindrance",
    matchName: "Tongue-Tied",
    label: "Tongue-Tied",
    summary:
      "-1 to speech-based Intimidation, Performance, Persuasion, and Taunt.",
    effects: [
      rollModifierEffect(
        "speech-intimidation",
        "Intimidation",
        "speech-based Intimidation rolls",
        -1,
        "Speech-based Intimidation -1",
      ),
      rollModifierEffect(
        "speech-performance",
        "Performance",
        "speech-based Performance rolls",
        -1,
        "Speech-based Performance -1",
      ),
      rollModifierEffect(
        "speech-persuasion",
        "Persuasion",
        "speech-based Persuasion rolls",
        -1,
        "Speech-based Persuasion -1",
      ),
      rollModifierEffect(
        "speech-taunt",
        "Taunt",
        "speech-based Taunt rolls",
        -1,
        "Speech-based Taunt -1",
      ),
    ],
  },
  {
    id: "hindrance-yellow",
    sourceType: "hindrance",
    matchName: "Yellow",
    label: "Yellow",
    summary: "-2 to Fear checks and resisting Intimidation.",
    effects: [
      {
        type: "roll-modifier",
        target: "fear-checks",
        trait: "Spirit",
        context: "Fear checks",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Fear checks -2",
      },
      {
        type: "roll-modifier",
        target: "resist-intimidation",
        trait: "Spirit",
        context: "resisting Intimidation",
        value: -2,
        appliesTo: ["character", "combat"],
        displayLabel: "Resist Intimidation -2",
      },
    ],
  },
  {
    id: "edge-reputation",
    sourceType: "edge",
    matchName: "Reputation",
    label: "Reputation",
    summary:
      "Good or bad reputation subchoice determines social automation behavior.",
    effects: [
      automationStatusEffect(
        "subchoice-required",
        "reputation-choice",
        "Subchoice required: choose good or bad reputation before social effect can be automated",
      ),
    ],
  },
  {
    id: "hindrance-obese",
    sourceType: "hindrance",
    matchName: "Obese",
    label: "Obese",
    summary:
      "Size +1, Pace -1, running die d4, and Strength counts one die lower for Minimum Strength.",
    effects: [
      {
        type: "numeric-modifier",
        target: "size",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Size +1",
      },
      {
        type: "numeric-modifier",
        target: "toughness",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Toughness +1 from Size",
      },
      {
        type: "numeric-modifier",
        target: "pace",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Pace -1",
      },
      {
        type: "die-step-modifier",
        target: "strength",
        value: -1,
        appliesTo: ["minimum-strength", "inventory"],
        displayLabel: "Strength counts one die lower for Minimum Strength",
      },
      {
        type: "reminder",
        target: "running-die",
        appliesTo: ["character", "combat"],
        displayLabel: "Running die is d4",
      },
    ],
  },
];

function normalizeEffectHookName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2019']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function effectHookRecordCollection(currentCharacter, sourceType) {
  if (sourceType === "edge") return currentCharacter.edges || [];
  if (sourceType === "hindrance") return currentCharacter.hindrances || [];
  return [];
}

function effectHookRecordMatches(hook, record) {
  if (
    normalizeEffectHookName(record?.name) !==
    normalizeEffectHookName(hook.matchName)
  )
    return false;
  if (hook.sourceType === "hindrance" && hook.severity) {
    return hindranceMatchesSeverity(record, hook.severity);
  }
  return true;
}

function activeEffectHooks(currentCharacter = character) {
  return EFFECT_HOOK_REGISTRY.map((hook) => {
    const record = effectHookRecordCollection(
      currentCharacter,
      hook.sourceType,
    ).find((item) => effectHookRecordMatches(hook, item));
    return record ? { ...hook, record } : null;
  }).filter(Boolean);
}

function effectAppliesTo(effect, scope = "") {
  return !scope || (effect.appliesTo || []).includes(scope);
}

function trustedDerivedBaseline(currentCharacter, target) {
  if (target === "toughness" || target === "max-wounds") {
    return Boolean(
      currentCharacter?.source === "created" ||
      currentCharacter?.creationBaseline ||
      currentCharacter?.creation?.finalized ||
      currentCharacter?.damage?.baseMaxWounds,
    );
  }
  return true;
}

function dominantEffectValue(currentValue, nextValue) {
  if (currentValue === undefined) return nextValue;
  const currentMagnitude = Math.abs(Number(currentValue) || 0);
  const nextMagnitude = Math.abs(Number(nextValue) || 0);
  if (nextMagnitude > currentMagnitude) return nextValue;
  if (nextMagnitude === currentMagnitude)
    return Math.max(currentValue, nextValue);
  return currentValue;
}

/**
 * Sum matching deterministic effects, respecting exclusive groups.
 *
 * Improved Edges often replace lower-tier versions instead of stacking. The
 * exclusiveGroup mechanism keeps the strongest applicable value while allowing
 * unrelated modifiers to stack normally.
 */
function effectHookModifierTotal(
  currentCharacter,
  { type = "", target = "", scope = "" } = {},
) {
  const groupedTotals = {};
  const ungroupedTotal = activeEffectHooks(currentCharacter)
    .flatMap((hook) => hook.effects || [])
    .filter(
      (effect) =>
        (!type || effect.type === type) &&
        (!target || effect.target === target) &&
        effectAppliesTo(effect, scope) &&
        (!effect.requiresTrustedBaseline ||
          trustedDerivedBaseline(currentCharacter, effect.target)),
    )
    .reduce((effectSum, effect) => {
      const value = Number(effect.value) || 0;
      if (!effect.exclusiveGroup) return effectSum + value;
      groupedTotals[effect.exclusiveGroup] = dominantEffectValue(
        groupedTotals[effect.exclusiveGroup],
        value,
      );
      return effectSum;
    }, 0);
  return (
    ungroupedTotal +
    Object.values(groupedTotals).reduce(
      (groupSum, value) => groupSum + value,
      0,
    )
  );
}

function characterSizeModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "numeric-modifier",
    target: "size",
    scope: "character",
  });
}

function characterToughnessModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "numeric-modifier",
    target: "toughness",
    scope: "character",
  });
}

function characterPaceModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "numeric-modifier",
    target: "pace",
    scope: "character",
  });
}

function characterParryModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "numeric-modifier",
    target: "parry",
    scope: "character",
  });
}

function characterMaxWoundsModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "numeric-modifier",
    target: "max-wounds",
    scope: "character",
  });
}

function characterPendingToughnessModifier(currentCharacter = character) {
  return activeEffectHooks(currentCharacter)
    .flatMap((hook) => hook.effects || [])
    .filter(
      (effect) =>
        effect.type === "numeric-modifier" &&
        effect.target === "toughness" &&
        effect.requiresTrustedBaseline &&
        !trustedDerivedBaseline(currentCharacter, effect.target) &&
        effectAppliesTo(effect, "character"),
    )
    .reduce((sum, effect) => sum + (Number(effect.value) || 0), 0);
}

function characterPendingMaxWoundsModifier(currentCharacter = character) {
  const groupedTotals = {};
  const ungroupedTotal = activeEffectHooks(currentCharacter)
    .flatMap((hook) => hook.effects || [])
    .filter(
      (effect) =>
        effect.type === "numeric-modifier" &&
        effect.target === "max-wounds" &&
        effect.requiresTrustedBaseline &&
        !trustedDerivedBaseline(currentCharacter, effect.target) &&
        effectAppliesTo(effect, "character"),
    )
    .reduce((sum, effect) => {
      const value = Number(effect.value) || 0;
      if (!effect.exclusiveGroup) return sum + value;
      groupedTotals[effect.exclusiveGroup] = dominantEffectValue(
        groupedTotals[effect.exclusiveGroup],
        value,
      );
      return sum;
    }, 0);
  return (
    ungroupedTotal +
    Object.values(groupedTotals).reduce((sum, value) => sum + value, 0)
  );
}

function characterWoundPenaltyReduction(
  currentCharacter = character,
  scope = "combat",
) {
  return Math.max(
    0,
    effectHookModifierTotal(currentCharacter, {
      type: "penalty-reduction",
      target: "wound-penalty",
      scope,
    }),
  );
}

function characterPowerPointRecoveryPerHour(
  currentCharacter = character,
  scope = "combat",
) {
  const recoveryRate = effectHookModifierTotal(currentCharacter, {
    type: "resource-recovery-rate",
    target: "power-points-per-hour",
    scope,
  });
  return recoveryRate > 0 ? recoveryRate : 5;
}

function effectHookDieStepIndex(die) {
  const text = String(die || "")
    .trim()
    .toLowerCase();
  const extended = text.match(/^d12\s*\+\s*(\d+)$/);
  if (extended) return STRENGTH_DIE_STEPS.indexOf("d12") + Number(extended[1]);
  return STRENGTH_DIE_STEPS.indexOf(text);
}

function effectHookDieStepLabel(step) {
  const safeStep = Math.max(0, Math.floor(Number(step) || 0));
  if (safeStep < STRENGTH_DIE_STEPS.length) return STRENGTH_DIE_STEPS[safeStep];
  return `d12+${safeStep - STRENGTH_DIE_STEPS.indexOf("d12")}`;
}

function strengthStepModifierForScope(currentCharacter, scope) {
  return effectHookModifierTotal(currentCharacter, {
    type: "die-step-modifier",
    target: "strength",
    scope,
  });
}

function effectiveStrengthForScope(
  currentCharacter,
  baseStrength = "d4",
  scope = "encumbrance",
) {
  const baseStep = effectHookDieStepIndex(baseStrength);
  const modifier = strengthStepModifierForScope(currentCharacter, scope);
  return effectHookDieStepLabel(
    Math.max(0, baseStep < 0 ? 0 : baseStep) + modifier,
  );
}

function dominantEffectSummaryEntries(entries) {
  const groupedIndexes = {};
  const result = [];
  entries.forEach((entry) => {
    if (!entry.exclusiveGroup) {
      result.push(entry);
      return;
    }
    const groupedIndex = groupedIndexes[entry.exclusiveGroup];
    if (groupedIndex === undefined) {
      groupedIndexes[entry.exclusiveGroup] = result.length;
      result.push(entry);
      return;
    }
    const current = result[groupedIndex];
    const dominantValue = dominantEffectValue(current.value, entry.value);
    if (dominantValue === entry.value) result[groupedIndex] = entry;
  });
  return result;
}

function effectHookSubchoiceDetail(record) {
  if (!record || typeof record !== "object") return null;
  if (typeof normalizeEdgeSubchoiceDetail === "function") {
    return normalizeEdgeSubchoiceDetail(record);
  }
  const label = String(record.subchoice || "").trim();
  return label ? { label, value: label } : null;
}

function effectHookResolvedSubchoiceLabel(record, target) {
  const detail = effectHookSubchoiceDetail(record);
  if (!detail?.label) return "";
  if (target === "chosen-weapon") {
    return `Chosen weapon: ${detail.label}; apply attack/Parry bonus manually until attack context exists`;
  }
  if (target === "reputation-choice") {
    if (detail.value === "good") {
      return "Good reputation selected: Persuasion reroll reminder";
    }
    if (detail.value === "bad") {
      return "Bad reputation selected: Intimidation bonus reminder";
    }
  }
  return "";
}

function effectHookDisplayLabel(effect, hook) {
  return (
    effectHookResolvedSubchoiceLabel(hook.record, effect.target) ||
    effect.displayLabel
  );
}

function effectHookStatus(effect, hook) {
  if (effect.status !== "subchoice-required") return effect.status;
  return effectHookResolvedSubchoiceLabel(hook.record, effect.target)
    ? "subchoice-selected"
    : effect.status;
}

function effectHookSummariesForSurface(
  currentCharacter = character,
  surface = "character",
) {
  return dominantEffectSummaryEntries(
    activeEffectHooks(currentCharacter).flatMap((hook) =>
      (hook.effects || [])
        .filter((effect) => effectAppliesTo(effect, surface))
        .map((effect) => ({
          id: `${hook.id}-${effect.target || effect.type}`,
          sourceType: hook.sourceType,
          sourceName: hook.label,
          target: effect.target,
          trait: effect.trait,
          context: effect.context,
          value: effect.value,
          type: effect.type,
          status: effectHookStatus(effect, hook),
          exclusiveGroup: effect.exclusiveGroup,
          displayLabel: effectHookDisplayLabel(effect, hook),
          summary: hook.summary,
        })),
    ),
  );
}
