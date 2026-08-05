/**
 * Effect hook registry assembly and derived mechanic helpers.
 *
 * Domain-specific Edge and Hindrance hook entries live in adjacent registry
 * files. This core keeps ordering stable and exposes the derived helpers used by
 * the tracker surfaces.
 */
const SESSION_EFFECT_HOOKS = [
  {
    registryOrder: 1000,
    id: "condition-liquid-courage",
    sourceType: "condition",
    matchName: "Liquid Courage",
    requiresEdge: "Liquid Courage",
    label: "Liquid Courage",
    summary:
      "Stiff drink active: Vigor increases one die type, Toughness +1, one Wound penalty level is ignored, and Agility/Smarts-linked rolls suffer -1. After 1 hour, take one Fatigue level for 4 hours.",
    effects: [
      {
        type: "die-step-modifier",
        target: "vigor",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Vigor +1 die type",
      },
      {
        type: "numeric-modifier",
        target: "toughness",
        value: 1,
        appliesTo: ["character", "combat"],
        displayLabel: "Toughness +1",
      },
      {
        type: "penalty-reduction",
        target: "wound-penalty",
        value: 1,
        appliesTo: ["combat"],
        displayLabel: "Ignore 1 Wound penalty",
      },
      {
        type: "roll-modifier",
        target: "agility-smarts-linked",
        trait: "Agility/Smarts",
        context: "Agility, Smarts, and linked skill rolls",
        value: -1,
        appliesTo: ["character", "combat"],
        displayLabel: "Agility/Smarts-linked rolls -1",
      },
      reminderEffect(
        "liquid-courage-fatigue",
        "After 1 hour: take 1 Fatigue for 4 hours",
      ),
    ],
  },
];

const EFFECT_HOOK_REGISTRY = [
  ...EDGE_EFFECT_HOOKS,
  ...HINDRANCE_EFFECT_HOOKS,
  ...SESSION_EFFECT_HOOKS,
]
  .sort((left, right) => left.registryOrder - right.registryOrder)
  .map(({ registryOrder, ...hook }) => hook);

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
  if (sourceType === "condition") {
    return Object.entries(currentCharacter.conditions || {})
      .filter(([, active]) => Boolean(active))
      .map(([key]) => ({
        key,
        name: displayNameFromKey(key),
      }));
  }
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

function characterHasCanonicalEdge(currentCharacter, edgeName) {
  const canonicalName = normalizeEffectHookName(edgeName);
  return (currentCharacter?.edges || []).some(
    (edge) => normalizeEffectHookName(edge?.name) === canonicalName,
  );
}

function characterFearCheckEdgeState(currentCharacter = character) {
  const hasGuts = characterHasCanonicalEdge(currentCharacter, "Guts");
  const hasGrit = characterHasCanonicalEdge(currentCharacter, "Grit");
  const hasTrueGrit = characterHasCanonicalEdge(currentCharacter, "True Grit");
  const reviewNotes = [];

  if (hasGrit && !hasGuts) {
    reviewNotes.push({
      id: "fear-edge-grit-without-guts",
      displayLabel: "Manual review: Grit recorded without Guts",
    });
  }

  if (hasTrueGrit && !hasGrit) {
    reviewNotes.push({
      id: "fear-edge-true-grit-without-grit",
      displayLabel: "Manual review: True Grit recorded without Grit",
    });
  }

  return {
    hasGuts,
    hasGrit,
    hasTrueGrit,
    reviewNotes,
  };
}

function activeEffectHooks(currentCharacter = character) {
  return EFFECT_HOOK_REGISTRY.map((hook) => {
    if (
      hook.requiresEdge &&
      !characterHasCanonicalEdge(currentCharacter, hook.requiresEdge)
    )
      return null;
    const record = effectHookRecordCollection(
      currentCharacter,
      hook.sourceType,
    ).find((item) => effectHookRecordMatches(hook, item));
    return record ? { ...hook, record } : null;
  }).filter(Boolean);
}

function characterHasLiquidCourage(currentCharacter = character) {
  return characterHasCanonicalEdge(currentCharacter, "Liquid Courage");
}

function liquidCourageIsActive(currentCharacter = character) {
  return Boolean(
    characterHasLiquidCourage(currentCharacter) &&
      currentCharacter?.conditions?.liquidCourage,
  );
}

function liquidCourageLinkedRollModifier(currentCharacter, linkedAttribute) {
  if (!liquidCourageIsActive(currentCharacter)) return 0;
  const key = normalizeEffectHookName(linkedAttribute);
  return key === "agility" || key === "smarts" ? -1 : 0;
}

function effectHookParseTraitRoll(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase();
  const match = text.match(/^(d(?:4|6|8|10|12))\s*([+-]\s*\d+)?$/);
  if (!match) return null;
  return {
    die: match[1],
    modifier: match[2] ? Number(match[2].replace(/\s+/g, "")) || 0 : 0,
  };
}

function effectHookTraitRollLabelWithModifier(value, modifier) {
  const parsed = effectHookParseTraitRoll(value);
  if (!parsed) {
    const text = String(value || "—").trim();
    if (!modifier) return text;
    return `${text}${modifier > 0 ? `+${modifier}` : modifier}`;
  }
  const total = parsed.modifier + modifier;
  if (!total) return parsed.die;
  return `${parsed.die}${total > 0 ? `+${total}` : total}`;
}

function effectHookIncreaseTraitDieLabel(value, steps = 1) {
  const parsed = effectHookParseTraitRoll(value);
  const baseDie = parsed?.die || value;
  const baseStep = effectHookDieStepIndex(baseDie);
  if (baseStep < 0) return value || "—";
  const next = effectHookDieStepLabel(baseStep + steps);
  const modifier = parsed?.modifier || 0;
  return modifier ? `${next}${modifier > 0 ? `+${modifier}` : modifier}` : next;
}

function liquidCourageAttributeDisplay(currentCharacter, attributeKey, die) {
  if (!liquidCourageIsActive(currentCharacter))
    return { value: die || "—", note: "" };
  const key = normalizeEffectHookName(attributeKey);
  if (key === "vigor") {
    const value = effectHookIncreaseTraitDieLabel(die, 1);
    return { value, note: `Liquid Courage: base ${die || "—"}` };
  }
  const modifier = liquidCourageLinkedRollModifier(currentCharacter, key);
  return {
    value: modifier
      ? effectHookTraitRollLabelWithModifier(die || "—", modifier)
      : die || "—",
    note: modifier ? "Liquid Courage" : "",
  };
}

function liquidCourageSkillDisplay(currentCharacter, skill) {
  const die = skill?.die || skill?.value || "—";
  const linkedAttribute =
    typeof skillLinkedAttribute === "function"
      ? skillLinkedAttribute(skill)
      : skill?.linkedAttribute;
  const modifier = liquidCourageLinkedRollModifier(
    currentCharacter,
    linkedAttribute,
  );
  return {
    value: modifier ? effectHookTraitRollLabelWithModifier(die, modifier) : die,
    note: modifier ? "Liquid Courage" : "",
  };
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

function fearCheckAuditSummaryEntries(currentCharacter, surface) {
  if (surface !== "character") return [];
  return characterFearCheckEdgeState(currentCharacter).reviewNotes.map(
    (note) => ({
      id: note.id,
      sourceType: "edge",
      sourceName: "Fear check reminder",
      target: "fear-check-edge-chain",
      type: "automation-status",
      status: "manual-review",
      displayLabel: note.displayLabel,
      summary: "Fear Edge chain audit note.",
    }),
  );
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
  return dominantEffectSummaryEntries([
    ...activeEffectHooks(currentCharacter).flatMap((hook) =>
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
    ...fearCheckAuditSummaryEntries(currentCharacter, surface),
  ]);
}
