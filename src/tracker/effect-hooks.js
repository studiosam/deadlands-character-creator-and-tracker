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

function effectHookModifierTotal(
  currentCharacter,
  { type = "", target = "", scope = "" } = {},
) {
  return activeEffectHooks(currentCharacter).reduce((sum, hook) => {
    const hookTotal = (hook.effects || [])
      .filter(
        (effect) =>
          (!type || effect.type === type) &&
          (!target || effect.target === target) &&
          effectAppliesTo(effect, scope),
      )
      .reduce(
        (effectSum, effect) => effectSum + (Number(effect.value) || 0),
        0,
      );
    return sum + hookTotal;
  }, 0);
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

function effectHookSummariesForSurface(
  currentCharacter = character,
  surface = "character",
) {
  return activeEffectHooks(currentCharacter).flatMap((hook) =>
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
        displayLabel: effect.displayLabel,
        summary: hook.summary,
      })),
  );
}
