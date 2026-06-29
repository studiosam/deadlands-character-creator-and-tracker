const DEFAULT_ACTION_CARD_STATE = {
  current: "",
  secondary: "",
  notes: "",
};

function normalizeActionCardState(value) {
  const state =
    value && typeof value === "object" ? value : DEFAULT_ACTION_CARD_STATE;
  return {
    current: String(state.current || "").trim(),
    secondary: String(state.secondary || "").trim(),
    notes: String(state.notes || "").trim(),
  };
}

function sessionBennyEffect(value, displayLabel, options = {}) {
  return {
    type: "session-resource-modifier",
    target: "starting-bennies",
    value,
    appliesTo: options.appliesTo || ["character"],
    displayLabel,
    ...(options.exclusiveGroup
      ? { exclusiveGroup: options.exclusiveGroup }
      : {}),
  };
}

function actionCardRuleEffect(target, displayLabel, options = {}) {
  return {
    type: "action-card-rule",
    target,
    value: options.value,
    appliesTo: options.appliesTo || ["character", "combat"],
    displayLabel,
    ...(options.exclusiveGroup
      ? { exclusiveGroup: options.exclusiveGroup }
      : {}),
  };
}

function characterStartingBennyModifier(currentCharacter = character) {
  return effectHookModifierTotal(currentCharacter, {
    type: "session-resource-modifier",
    target: "starting-bennies",
    scope: "character",
  });
}

function characterNormalStartingBennies(currentCharacter = character) {
  const normalStarting = Number(currentCharacter?.bennies?.normalStarting);
  if (Number.isFinite(normalStarting) && normalStarting >= 0)
    return Math.floor(normalStarting);

  const starting = Number(currentCharacter?.bennies?.starting);
  if (Number.isFinite(starting) && starting >= 0) return Math.floor(starting);

  return 3;
}

function characterStartingBennies(currentCharacter = character) {
  return Math.max(
    0,
    characterNormalStartingBennies(currentCharacter) +
      characterStartingBennyModifier(currentCharacter),
  );
}

function syncCharacterStartingBennies(currentCharacter = character) {
  if (!currentCharacter.bennies) currentCharacter.bennies = {};
  currentCharacter.bennies.normalStarting =
    characterNormalStartingBennies(currentCharacter);
  currentCharacter.bennies.starting =
    characterStartingBennies(currentCharacter);
  currentCharacter.bennies.current = Math.max(
    0,
    Math.floor(Number(currentCharacter.bennies.current) || 0),
  );
  return currentCharacter.bennies.starting;
}

function actionCardRuleSummaries(currentCharacter = character) {
  return effectHookSummariesForSurface(currentCharacter, "combat").filter(
    (effect) => effect.type === "action-card-rule",
  );
}

function actionCardCapabilities(currentCharacter = character) {
  const effects = actionCardRuleSummaries(currentCharacter);
  const hasTarget = (target) =>
    effects.some((effect) => effect.target === target);
  return {
    effects,
    quick: hasTarget("quick-redraw"),
    hesitant: hasTarget("hesitant-draw"),
    levelHeaded: hasTarget("level-headed-draw"),
    recordsMultipleCards:
      hasTarget("hesitant-draw") || hasTarget("level-headed-draw"),
  };
}

function actionCardIsJoker(value) {
  return /\bjokers?\b/i.test(String(value || ""));
}

function actionCardRankValue(value) {
  const text = String(value || "")
    .trim()
    .toLowerCase();
  if (!text || actionCardIsJoker(text)) return null;

  const rank = text.match(
    /^(10|ace|king|queen|jack|[2-9]|a|k|q|j)(?:\b|[cdhs♣♦♥♠])/,
  )?.[1];
  if (!rank) return null;
  if (rank === "a" || rank === "ace") return 14;
  if (rank === "k" || rank === "king") return 13;
  if (rank === "q" || rank === "queen") return 12;
  if (rank === "j" || rank === "jack") return 11;
  return Number(rank);
}

function quickRedrawStatus(currentCharacter = character) {
  const capabilities = actionCardCapabilities(currentCharacter);
  const state = normalizeActionCardState(currentCharacter?.actionCards);

  if (!capabilities.quick) {
    return { applies: false, available: false, label: "" };
  }
  if (!state.current) {
    return {
      applies: true,
      available: false,
      label: "Quick: record an Action Card to check redraw.",
    };
  }
  if (actionCardIsJoker(state.current)) {
    return {
      applies: true,
      available: false,
      label: "Quick: Joker is not redrawn.",
    };
  }

  const rank = actionCardRankValue(state.current);
  if (rank !== null && rank <= 5) {
    return {
      applies: true,
      available: true,
      label: "Quick redraw available for this card.",
    };
  }
  if (rank !== null) {
    return {
      applies: true,
      available: false,
      label: "Quick: no redraw for this card.",
    };
  }
  return {
    applies: true,
    available: false,
    label: "Quick: card rank not recognized.",
  };
}
