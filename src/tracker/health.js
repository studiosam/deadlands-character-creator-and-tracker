/**
 * Shared Wound and Fatigue track rules.
 *
 * The normal maximum is the last penalty-bearing level. One additional level
 * records incapacitation so the tracker can distinguish a full track from an
 * exceeded track without inventing a separate persistent condition.
 */
function damageTrackState(value, maximum) {
  const normalizedValue = Math.max(0, Math.floor(Number(value) || 0));
  const normalizedMaximum = Math.max(0, Math.floor(Number(maximum) || 0));

  return {
    value: normalizedValue,
    maximum: normalizedMaximum,
    penalty: Math.min(normalizedValue, normalizedMaximum),
    incapacitated: normalizedValue > normalizedMaximum,
    incapacitationValue: normalizedMaximum + 1,
  };
}

function adjustDamageTrackValue(value, maximum, delta) {
  const state = damageTrackState(value, maximum);
  const adjustment = Math.trunc(Number(delta) || 0);
  const nextValue = state.value + adjustment;

  if (adjustment > 0) {
    return Math.min(nextValue, state.incapacitationValue);
  }
  return Math.max(0, nextValue);
}

function characterDamageStatus(target = character) {
  const damage = target?.damage || {};
  const wounds = damageTrackState(damage.wounds, damage.maxWounds);
  const fatigue = damageTrackState(damage.fatigue, damage.maxFatigue);
  const sources = [
    ["Wounds", wounds],
    ["Fatigue", fatigue],
  ]
    .filter(([, state]) => state.incapacitated)
    .map(([label, state]) => ({ label, ...state }));

  return {
    wounds,
    fatigue,
    sources,
    incapacitated: sources.length > 0,
  };
}
