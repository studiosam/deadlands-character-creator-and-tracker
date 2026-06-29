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
    id: "edge-luck",
    sourceType: "edge",
    matchName: "Luck",
    label: "Luck",
    summary: "Starts each session with one additional Benny.",
    effects: [
      automationStatusEffect(
        "resource-model-needed",
        "session-bennies",
        "Resource model needed: +1 session Benny not auto-applied",
        ["character", "combat"],
      ),
    ],
  },
  {
    id: "edge-great-luck",
    sourceType: "edge",
    matchName: "Great Luck",
    label: "Great Luck",
    summary: "Starts each session with two additional Bennies.",
    effects: [
      automationStatusEffect(
        "resource-model-needed",
        "session-bennies",
        "Resource model needed: +2 session Bennies not auto-applied",
        ["character", "combat"],
      ),
    ],
  },
  {
    id: "edge-quick",
    sourceType: "edge",
    matchName: "Quick",
    label: "Quick",
    summary: "May discard and redraw Action Cards of 5 or lower.",
    effects: [
      automationStatusEffect(
        "action-state-needed",
        "action-card-redraw",
        "Action state needed: redraw Action Cards of 5 or lower",
        ["character", "combat"],
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
      automationStatusEffect(
        "action-state-needed",
        "action-card-draw",
        "Action state needed: draw an additional Action Card",
        ["character", "combat"],
      ),
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
    effects: [
      automationStatusEffect(
        "resource-model-needed",
        "session-bennies",
        "Resource model needed: -1 session Benny not auto-applied",
        ["character", "combat"],
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
      automationStatusEffect(
        "action-state-needed",
        "action-card-draw",
        "Action state needed: draw two Action Cards and keep the lowest",
        ["character", "combat"],
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
  if (target === "toughness") {
    return Boolean(
      currentCharacter?.source === "created" ||
      currentCharacter?.creationBaseline ||
      currentCharacter?.creation?.finalized,
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
          status: effect.status,
          exclusiveGroup: effect.exclusiveGroup,
          displayLabel: effect.displayLabel,
          summary: hook.summary,
        })),
    ),
  );
}
