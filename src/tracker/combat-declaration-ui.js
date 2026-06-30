/**
 * Combat Declaration panel rendering and result application.
 *
 * This file keeps the declaration UI separate from the broader combat dashboard
 * while still relying on the shared tracker globals used by the browser app.
 */
function combatDeclarationOptionMarkup(value, label, selected = false) {
  return `<option value="${esc(value)}" ${selected ? "selected" : ""}>${esc(label)}</option>`;
}

function syncCombatDeclarationInput(input, value) {
  if (!input || document.activeElement === input) return;
  input.value = value;
}

function updateCombatDeclarationField(field, value) {
  character.combatDeclaration = normalizeCombatDeclarationState(
    character.combatDeclaration,
  );
  character.combatDeclaration[field] = value;
  character.combatDeclaration = normalizeCombatDeclarationState(
    character.combatDeclaration,
  );
  render();
  save();
}

function clearCombatDeclaration({ keepLog = true } = {}) {
  const current = normalizeCombatDeclarationState(character.combatDeclaration);
  character.combatDeclaration = normalizeCombatDeclarationState({
    resultLog: keepLog ? current.resultLog : [],
  });
  render();
  save();
}

function combatDeclarationResultTimestamp() {
  return new Date().toISOString();
}

function combatDeclarationResultTimeLabel(value) {
  if (!value) return "Recorded result";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recorded result";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function applyCombatDeclarationResult() {
  const state = normalizeCombatDeclarationState(character.combatDeclaration);
  const applied = [];

  if (state.resultWounds) {
    const before = character.damage.wounds;
    character.damage.wounds = clamp(
      character.damage.wounds + state.resultWounds,
      0,
      character.damage.maxWounds,
    );
    applied.push(`Wounds ${before} -> ${character.damage.wounds}`);
  }

  if (state.resultFatigue) {
    const before = character.damage.fatigue;
    character.damage.fatigue = clamp(
      character.damage.fatigue + state.resultFatigue,
      0,
      character.damage.maxFatigue,
    );
    applied.push(`Fatigue ${before} -> ${character.damage.fatigue}`);
  }

  if (state.resultBennies) {
    const before = character.bennies.current;
    character.bennies.current = Math.max(
      0,
      character.bennies.current + state.resultBennies,
    );
    applied.push(`Bennies ${before} -> ${character.bennies.current}`);
  }

  if (state.resultCondition && state.resultCondition in character.conditions) {
    character.conditions[state.resultCondition] =
      state.resultConditionMode !== "clear";
    applied.push(
      `${displayNameFromKey(state.resultCondition)} ${state.resultConditionMode === "clear" ? "cleared" : "set"}`,
    );
  }

  const selectedWeapon = combatDeclarationSelectedWeapon(character, state);
  if (state.resultAmmoSpent) {
    if (selectedWeapon && combatDeclarationWeaponIsTracked(selectedWeapon)) {
      const before = Number(selectedWeapon.shotsLoaded) || 0;
      selectedWeapon.shotsLoaded = Math.max(0, before - state.resultAmmoSpent);
      applied.push(
        `${selectedWeapon.name} ammo ${before} -> ${selectedWeapon.shotsLoaded}`,
      );
    } else {
      applied.push("Ammo not changed: no tracked selected weapon");
    }
  }

  const resultText = state.gmResult || "";
  if (!resultText && !applied.length) return;

  character.combatDeclaration = normalizeCombatDeclarationState({
    ...state,
    gmResult: "",
    resultWounds: 0,
    resultFatigue: 0,
    resultBennies: 0,
    resultCondition: "",
    resultConditionMode: "set",
    resultAmmoSpent: 0,
    resultLog: [
      {
        id: `combat-result-${Date.now()}`,
        createdAt: combatDeclarationResultTimestamp(),
        declaration: combatDeclarationText(character),
        result: resultText,
        applied,
      },
      ...state.resultLog,
    ],
  });

  render();
  save();
}

function renderCombatDeclaration() {
  if (!els.combatDeclarationCard) return;

  character.combatDeclaration = normalizeCombatDeclarationState(
    character.combatDeclaration,
  );
  const state = character.combatDeclaration;
  const reminders = combatDeclarationReminders(character);
  const limitedCount = reminders.filter(
    (reminder) => reminder.severity === "limited",
  ).length;
  const hints = combatDeclarationActionHints(character);
  const declarationText = combatDeclarationText(character);
  const mapReminder = combatDeclarationMapReminder(state);

  els.combatDeclarationStatusPill.textContent = limitedCount
    ? "Review"
    : state.actionType
      ? "Ready"
      : "Editable";
  els.combatDeclarationActionHints.innerHTML = hints
    .map(
      (hint) =>
        `<span class="combat-action-hint ${esc(hint.status)}">${esc(hint.label)}</span>`,
    )
    .join("");
  els.combatDeclarationReminders.innerHTML = reminders.length
    ? reminders
        .map(
          (reminder) =>
            `<p class="${reminder.severity === "limited" ? "entry-warning" : "entry-advisory"}"><strong>${reminder.severity === "limited" ? "Limited:" : "Reminder:"}</strong> ${esc(reminder.text)}</p>`,
        )
        .join("")
    : "";

  els.combatDeclarationActionInput.innerHTML = COMBAT_DECLARATION_ACTIONS.map(
    (action) =>
      combatDeclarationOptionMarkup(
        action.id,
        action.label,
        action.id === state.actionType,
      ),
  ).join("");
  els.combatDeclarationCountInput.innerHTML = [1, 2, 3, 4]
    .map((count) =>
      combatDeclarationOptionMarkup(
        String(count),
        count === 1 ? "1 action" : `${count} actions`,
        count === state.actionCount,
      ),
    )
    .join("");
  els.combatDeclarationWeaponInput.innerHTML = [
    combatDeclarationOptionMarkup("", "No specific weapon", !state.weaponId),
    ...(character.weapons || []).map((weapon) =>
      combatDeclarationOptionMarkup(
        weapon.id,
        combatDeclarationWeaponLabel(weapon),
        weapon.id === state.weaponId,
      ),
    ),
  ].join("");
  els.combatDeclarationConditionInput.innerHTML =
    COMBAT_DECLARATION_RESULT_CONDITIONS.map((condition) =>
      combatDeclarationOptionMarkup(
        condition,
        condition ? displayNameFromKey(condition) : "No condition change",
        condition === state.resultCondition,
      ),
    ).join("");

  syncCombatDeclarationInput(
    els.combatDeclarationTargetInput,
    state.targetLabel,
  );
  syncCombatDeclarationInput(els.combatDeclarationDetailsInput, state.details);
  syncCombatDeclarationInput(els.combatDeclarationResultInput, state.gmResult);
  syncCombatDeclarationInput(
    els.combatDeclarationWoundsInput,
    String(state.resultWounds),
  );
  syncCombatDeclarationInput(
    els.combatDeclarationFatigueInput,
    String(state.resultFatigue),
  );
  syncCombatDeclarationInput(
    els.combatDeclarationBenniesInput,
    String(state.resultBennies),
  );
  syncCombatDeclarationInput(
    els.combatDeclarationConditionModeInput,
    state.resultConditionMode,
  );
  syncCombatDeclarationInput(
    els.combatDeclarationAmmoInput,
    String(state.resultAmmoSpent),
  );

  els.combatDeclarationPreview.innerHTML = `<strong>Declaration:</strong><p>${esc(declarationText)}</p><p>${esc(mapReminder)}</p>`;

  els.combatDeclarationActionInput.onchange = () =>
    updateCombatDeclarationField(
      "actionType",
      els.combatDeclarationActionInput.value,
    );
  els.combatDeclarationCountInput.onchange = () =>
    updateCombatDeclarationField(
      "actionCount",
      Number(els.combatDeclarationCountInput.value),
    );
  els.combatDeclarationWeaponInput.onchange = () =>
    updateCombatDeclarationField(
      "weaponId",
      els.combatDeclarationWeaponInput.value,
    );
  els.combatDeclarationTargetInput.oninput = () =>
    updateCombatDeclarationField(
      "targetLabel",
      els.combatDeclarationTargetInput.value,
    );
  els.combatDeclarationDetailsInput.oninput = () =>
    updateCombatDeclarationField(
      "details",
      els.combatDeclarationDetailsInput.value,
    );
  els.combatDeclarationResultInput.oninput = () =>
    updateCombatDeclarationField(
      "gmResult",
      els.combatDeclarationResultInput.value,
    );
  els.combatDeclarationWoundsInput.oninput = () =>
    updateCombatDeclarationField(
      "resultWounds",
      Number(els.combatDeclarationWoundsInput.value),
    );
  els.combatDeclarationFatigueInput.oninput = () =>
    updateCombatDeclarationField(
      "resultFatigue",
      Number(els.combatDeclarationFatigueInput.value),
    );
  els.combatDeclarationBenniesInput.oninput = () =>
    updateCombatDeclarationField(
      "resultBennies",
      Number(els.combatDeclarationBenniesInput.value),
    );
  els.combatDeclarationConditionInput.onchange = () =>
    updateCombatDeclarationField(
      "resultCondition",
      els.combatDeclarationConditionInput.value,
    );
  els.combatDeclarationConditionModeInput.onchange = () =>
    updateCombatDeclarationField(
      "resultConditionMode",
      els.combatDeclarationConditionModeInput.value,
    );
  els.combatDeclarationAmmoInput.oninput = () =>
    updateCombatDeclarationField(
      "resultAmmoSpent",
      Number(els.combatDeclarationAmmoInput.value),
    );
  els.applyCombatDeclarationResultBtn.onclick = applyCombatDeclarationResult;
  els.clearCombatDeclarationBtn.onclick = () => clearCombatDeclaration();
  els.clearCombatDeclarationLogBtn.onclick = () =>
    clearCombatDeclaration({ keepLog: false });

  els.combatDeclarationResultLog.innerHTML = state.resultLog.length
    ? [
        "<h3>Recorded GM Results</h3>",
        ...state.resultLog.map((entry) => {
          const applied = entry.applied.length
            ? `<span>Applied: ${esc(entry.applied.join("; "))}</span>`
            : "";
          const result = entry.result
            ? `<span>${esc(entry.result)}</span>`
            : "";
          return `<div class="row"><div><strong>${esc(combatDeclarationResultTimeLabel(entry.createdAt))}</strong><span>${esc(entry.declaration)}</span>${result}${applied}</div></div>`;
        }),
      ].join("")
    : emptyState("No GM results recorded yet.");
}
