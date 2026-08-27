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
    ...(options.attributeOnly ? { attributeOnly: true } : {}),
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
