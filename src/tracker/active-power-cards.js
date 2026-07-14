/**
 * Active power record card rendering and interaction handlers.
 *
 * These helpers display tracked power activations without automating their
 * mechanical effects, leaving adjudicated outcomes under player/GM control.
 */
function activePowerStatusLabel(status) {
  if (status === "dismissed") return "Dismissed";
  if (status === "expired") return "Expired";
  if (status === "disrupted") return "Disrupted";
  return "Active";
}

function compareActivePowers(left, right) {
  return (
    Number(activePowerIsCurrent(right)) - Number(activePowerIsCurrent(left)) ||
    String(right.activatedAt || "").localeCompare(
      String(left.activatedAt || ""),
    ) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function updateActivePowerField(activePower, field, value) {
  if (field === "maintenance") activePower.maintenance = Boolean(value);
  else if (field === "raiseMarked") activePower.raiseMarked = Boolean(value);
  else if (field === "durationRemaining") {
    activePower.durationRemaining = numericActivePowerDuration(value);
    activePower.durationReminder = activePowerDurationReminder(activePower);
  } else {
    activePower[field] = String(value || "").trim();
    if (field === "duration") {
      activePower.durationReminder = activePowerDurationReminder(activePower);
    }
  }
  save();
}

function activePowerFieldRerendersCard(field) {
  return ["effectMode", "maintenance", "raiseMarked"].includes(field);
}

function tickActivePowerDuration(activePower) {
  const remaining = numericActivePowerDuration(activePower.durationRemaining);
  if (remaining === null || !activePowerIsCurrent(activePower)) return;

  activePower.durationRemaining = Math.max(0, remaining - 1);
  activePower.durationReminder = activePowerDurationReminder(activePower);
  if (activePower.durationRemaining <= 0) {
    activePower.status = "expired";
    activePower.endedAt = new Date().toISOString();
  }
  render();
  save();
}

function activePowerRuntimeReminderMarkup(activePower) {
  const reminders = activePowerRuntimeReminders(activePower, character.powers);
  if (reminders.length) {
    const items = reminders
      .map((reminder) => `<li>${esc(reminder)}</li>`)
      .join("");
    return `<section class="active-power-reminder" aria-label="Effect reminder"><strong>Remember</strong><ul>${items}</ul></section>`;
  }
  return "";
}

function activePowerSpendBreakdownBodyMarkup(activePower) {
  const breakdown = activePower.spendBreakdown;
  if (!breakdown?.modifiers?.length) return "";
  const items = breakdown.modifiers
    .map((modifier) => {
      const quantityLabel = modifier.quantityLabel || "use";
      const costText = modifier.manualCost
        ? "manual PP"
        : `+${modifier.totalCost} PP`;
      return `<li>${esc(modifier.label)} × ${modifier.quantity} ${esc(quantityLabel)}: ${esc(costText)}</li>`;
    })
    .join("");
  return `<div class="active-power-spend-breakdown"><p>Base ${breakdown.baseCost} PP; total ${breakdown.totalCost} PP.</p><ul>${items}</ul></div>`;
}

function activePowerSpendBreakdownMarkup(activePower) {
  const body = activePowerSpendBreakdownBodyMarkup(activePower);
  if (!body) return "";
  return `<details class="active-power-record-details"><summary>Activation details <span>${activePower.spendBreakdown.totalCost} PP spent</span></summary>${body}</details>`;
}

function activePowerEndedAtText(activePower) {
  if (!activePower.endedAt) return "";
  const endedAt = new Date(activePower.endedAt);
  if (Number.isNaN(endedAt.getTime())) return String(activePower.endedAt);
  return endedAt.toLocaleString();
}

function activePowerStatusNoteMarkup(activePower) {
  const status = normalizeActivePowerStatus(activePower.status);
  if (status === "active") return "";
  const endedText = activePowerEndedAtText(activePower);
  return endedText
    ? `<p class="active-power-ended"><strong>Ended</strong> ${esc(endedText)}</p>`
    : "";
}

function activePowerTrackingSummaryMarkup(activePower) {
  const parts = [
    activePower.targetLabel ? `Target: ${activePower.targetLabel}` : "",
    activePower.effectMode ? `Mode: ${activePower.effectMode}` : "",
    activePower.raiseMarked ? "Raise marked" : "",
  ].filter(Boolean);
  if (!parts.length) return "";
  return `<div class="active-power-tracking-facts" aria-label="Tracked effect details">${parts
    .map((part) => `<span>${esc(part)}</span>`)
    .join("")}</div>`;
}

function activePowerEffectModeFieldMarkup(activePower) {
  const options = activePowerEffectModeOptions(activePower, character.powers);
  if (!options.length && !activePower.effectMode) return "";
  if (!options.length) {
    return `<label>Effect mode<input data-active-power-field="effectMode" value="${esc(activePower.effectMode)}" placeholder="Optional mode"></label>`;
  }
  const selected = String(activePower.effectMode || "");
  const optionMarkup = options
    .map(
      (option) =>
        `<option value="${esc(option)}" ${selected === option ? "selected" : ""}>${esc(option)}</option>`,
    )
    .join("");
  return `<label>Effect mode<select data-active-power-field="effectMode"><option value="">Choose mode</option>${optionMarkup}</select></label>`;
}

function finishActivePower(activePower, status) {
  activePower.status = normalizeActivePowerStatus(status);
  activePower.endedAt = new Date().toISOString();
  render();
  save();
}

function activePowerDetailText(activePower) {
  return [
    activePower.cost ? `Cost ${activePower.cost} PP` : "Cost 0 PP",
    activePower.duration ? `Duration ${activePower.duration}` : "Duration —",
  ]
    .filter(Boolean)
    .join(" | ");
}

function bindActivePowerCardControls(article, activePower) {
  article.querySelectorAll("[data-active-power-field]").forEach((input) => {
    const field = input.dataset.activePowerField;
    const handler = () => {
      updateActivePowerField(
        activePower,
        field,
        input.type === "checkbox" ? input.checked : input.value,
      );
      if (activePowerFieldRerendersCard(field)) render();
    };
    if (input.type === "checkbox" || input.tagName === "SELECT") {
      input.onchange = handler;
    } else {
      input.oninput = handler;
    }
  });

  article.querySelectorAll("[data-active-power-status]").forEach((button) => {
    button.onclick = () =>
      finishActivePower(activePower, button.dataset.activePowerStatus);
  });

  const tickButton = article.querySelector("[data-active-power-tick]");
  if (tickButton) {
    tickButton.onclick = () => tickActivePowerDuration(activePower);
  }
}

function activePowerHistoryNotesMarkup(activePower) {
  const notes = [
    activePower.trappingNotes
      ? `<div><strong>Trapping</strong><p>${esc(activePower.trappingNotes)}</p></div>`
      : "",
    activePower.notes
      ? `<div><strong>Notes</strong><p>${esc(activePower.notes)}</p></div>`
      : "",
  ].filter(Boolean);
  return notes.length
    ? `<div class="active-power-history-notes">${notes.join("")}</div>`
    : "";
}

function renderInactivePowerCard(activePower) {
  const article = document.createElement("article");
  const status = normalizeActivePowerStatus(activePower.status);
  const recordBody = [
    activePowerTrackingSummaryMarkup(activePower),
    activePowerSpendBreakdownBodyMarkup(activePower),
    activePowerHistoryNotesMarkup(activePower),
  ]
    .filter(Boolean)
    .join("");

  article.className = `weapon-card power-card active-power-card active-power-history-card ${status}`;
  article.innerHTML = `<div class="topline active-power-history-heading"><div><h3>${esc(activePower.name || "Unnamed power")}</h3><p class="meta">${esc(activePowerDetailText(activePower))}</p></div><span class="loaded active-power-status">${esc(activePowerStatusLabel(status))}</span></div>${activePowerStatusNoteMarkup(activePower)}${recordBody ? `<details class="active-power-record-details active-power-history-details"><summary>View record</summary><div class="active-power-record-body">${recordBody}</div></details>` : ""}`;
  return article;
}

function renderActivePowerCard(activePower) {
  const article = document.createElement("article");
  const status = normalizeActivePowerStatus(activePower.status);
  const current = status === "active";
  if (!current) return renderInactivePowerCard(activePower);

  const numericDuration = numericActivePowerDuration(
    activePower.durationRemaining,
  );
  const durationReminder = activePowerDurationReminder(activePower);
  const durationValue = numericDuration === null ? "" : String(numericDuration);
  const runtimeReminderMarkup = activePowerRuntimeReminderMarkup(activePower);
  const spendBreakdownMarkup = activePowerSpendBreakdownMarkup(activePower);
  const trackingSummaryMarkup = activePowerTrackingSummaryMarkup(activePower);
  const effectModeFieldMarkup = activePowerEffectModeFieldMarkup(activePower);
  article.className = `weapon-card power-card active-power-card ${status}`;
  article.innerHTML = `<div class="topline"><div><h3>${esc(activePower.name || "Unnamed power")}</h3><p class="meta">${esc(activePowerDetailText(activePower))}</p></div><span class="loaded active-power-status">${esc(activePowerStatusLabel(status))}</span></div>${runtimeReminderMarkup}${trackingSummaryMarkup}<div class="active-power-state-facts"><span>${esc(durationReminder)}</span>${activePower.maintenance ? "<span>Maintenance marked</span>" : ""}</div>${spendBreakdownMarkup}<div class="creator-grid active-power-fields"><label>Target label<input data-active-power-field="targetLabel" value="${esc(activePower.targetLabel)}" placeholder="Self, ally, target, group"></label>${effectModeFieldMarkup}<label>Base duration<input data-active-power-field="duration" value="${esc(activePower.duration)}" placeholder="Duration from power"></label><label>Rounds remaining<input data-active-power-field="durationRemaining" type="number" min="0" step="1" value="${esc(durationValue)}" placeholder="Manual unless numeric"></label><label class="checkline"><input data-active-power-field="raiseMarked" type="checkbox" ${activePower.raiseMarked ? "checked" : ""}> Raise marked</label><label class="checkline"><input data-active-power-field="maintenance" type="checkbox" ${activePower.maintenance ? "checked" : ""}> Maintenance marked</label><label class="creator-wide">Trapping notes<textarea data-active-power-field="trappingNotes">${esc(activePower.trappingNotes)}</textarea></label><label class="creator-wide">Runtime notes<textarea data-active-power-field="notes">${esc(activePower.notes)}</textarea></label></div><div class="weapon-actions power-actions">${numericDuration === null ? "" : '<button class="ghost" type="button" data-active-power-tick>Tick down 1 round</button>'}<button class="ghost" type="button" data-active-power-status="dismissed">Dismiss</button><button class="ghost" type="button" data-active-power-status="expired">Expire</button><button class="delete-small" type="button" data-active-power-status="disrupted">Disrupt</button></div>`;

  bindActivePowerCardControls(article, activePower);
  return article;
}

function renderActivePowersList(container, emptyText = "No active powers.") {
  container.innerHTML = "";
  const activePowers = Array.isArray(character.activePowers)
    ? character.activePowers
    : [];
  if (!activePowers.length) {
    container.innerHTML = emptyState(emptyText);
    return;
  }
  const sortedPowers = [...activePowers].sort(compareActivePowers);
  const currentPowers = sortedPowers.filter(activePowerIsCurrent);
  const historyPowers = sortedPowers.filter(
    (activePower) => !activePowerIsCurrent(activePower),
  );

  if (currentPowers.length) {
    const currentStack = document.createElement("section");
    currentStack.className = "active-power-stack active-power-current-stack";
    currentStack.innerHTML =
      '<h3 class="active-power-section-title">Current Effects</h3><div class="active-power-current-list"></div>';
    const currentList = currentStack.querySelector(
      ".active-power-current-list",
    );
    currentPowers.forEach((activePower) =>
      currentList.appendChild(renderActivePowerCard(activePower)),
    );
    container.appendChild(currentStack);
  }

  if (historyPowers.length) {
    const historyGroup = document.createElement("details");
    historyGroup.className = "active-power-history-group";
    historyGroup.innerHTML = `<summary>History <span>${historyPowers.length}</span></summary><div class="active-power-history-list"></div>`;
    const historyList = historyGroup.querySelector(
      ".active-power-history-list",
    );
    historyPowers.forEach((activePower) =>
      historyList.appendChild(renderInactivePowerCard(activePower)),
    );
    container.appendChild(historyGroup);
  }
}
