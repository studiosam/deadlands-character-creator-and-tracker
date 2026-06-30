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

function activePowerRoundsRemainingText(durationRemaining) {
  return `${durationRemaining} round${durationRemaining === 1 ? "" : "s"} left`;
}

function activePowerRuntimeReminderMarkup(activePower) {
  const reminders = activePowerRuntimeReminders(activePower, character.powers);
  if (reminders.length) {
    const items = reminders
      .map((reminder) => `<li>${esc(reminder)}</li>`)
      .join("");
    return `<div class="entry-advisory"><strong>Effect reminder:</strong><ul>${items}</ul></div>`;
  }
  if (activePowerHasRuntimeReminder(activePower, character.powers)) {
    return '<p class="entry-advisory"><strong>Effect inactive:</strong> active reminders no longer apply.</p>';
  }
  return "";
}

function activePowerSpendBreakdownMarkup(activePower) {
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
  return `<div class="entry-advisory"><strong>Power Point spend:</strong><p>Base ${breakdown.baseCost} PP; total ${breakdown.totalCost} PP.</p><ul>${items}</ul></div>`;
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
  const endedMarkup = endedText ? `<span>Ended: ${esc(endedText)}</span>` : "";
  const statusNotes = {
    dismissed: "Dismissed: active effect reminders no longer apply.",
    expired: "Expired: effect reminders no longer apply.",
    disrupted: "Disrupted: confirm maintained power consequences manually.",
  };
  return `<p class="entry-advisory"><strong>Status note:</strong> ${esc(statusNotes[status] || "Inactive.")}${endedMarkup}</p>`;
}

function activePowerTrackingSummaryMarkup(activePower) {
  const parts = [
    activePower.targetLabel ? `Target: ${activePower.targetLabel}` : "",
    activePower.effectMode ? `Mode: ${activePower.effectMode}` : "",
    activePower.raiseMarked ? "Raise marked" : "",
  ].filter(Boolean);
  if (!parts.length) return "";
  return `<p class="entry-advisory"><strong>Structured tracking:</strong> ${esc(parts.join(" | "))}</p>`;
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
  const durationRemaining = numericActivePowerDuration(
    activePower.durationRemaining,
  );
  return [
    activePower.cost ? `Cost ${activePower.cost} PP` : "Cost 0 PP",
    activePower.duration ? `Duration ${activePower.duration}` : "Duration —",
    durationRemaining !== null
      ? activePowerRoundsRemainingText(durationRemaining)
      : "",
    activePower.targetLabel ? `Target ${activePower.targetLabel}` : "",
    activePower.effectMode ? `Mode ${activePower.effectMode}` : "",
    activePower.raiseMarked ? "Raise marked" : "",
    activePower.optionName ? `Option ${activePower.optionName}` : "",
    activePower.maintenance ? "Maintenance marked" : "No maintenance marked",
  ]
    .filter(Boolean)
    .join(" | ");
}

function renderActivePowerCard(activePower) {
  const article = document.createElement("article");
  const status = normalizeActivePowerStatus(activePower.status);
  const current = status === "active";
  const numericDuration = numericActivePowerDuration(
    activePower.durationRemaining,
  );
  const durationReminder = activePowerDurationReminder(activePower);
  const durationValue = numericDuration === null ? "" : String(numericDuration);
  const runtimeReminderMarkup = activePowerRuntimeReminderMarkup(activePower);
  const statusNoteMarkup = activePowerStatusNoteMarkup(activePower);
  const spendBreakdownMarkup = activePowerSpendBreakdownMarkup(activePower);
  const trackingSummaryMarkup = activePowerTrackingSummaryMarkup(activePower);
  const effectModeFieldMarkup = activePowerEffectModeFieldMarkup(activePower);
  article.className = `weapon-card power-card active-power-card ${status}`;
  article.innerHTML = `<div class="topline"><div><h3>${esc(activePower.name || "Unnamed power")}</h3><p class="meta">${esc(activePowerDetailText(activePower))}</p></div><span class="loaded">${esc(activePowerStatusLabel(status))}</span></div><p class="muted">Power effect reminder only: apply table effects manually.</p>${runtimeReminderMarkup}${statusNoteMarkup}${trackingSummaryMarkup}${spendBreakdownMarkup}<p class="entry-advisory"><strong>Duration reminder:</strong> ${esc(durationReminder)}</p>${activePower.maintenance ? '<p class="entry-advisory"><strong>Maintenance marked:</strong> remember ongoing Power Point or action requirements.</p>' : ""}<div class="creator-grid active-power-fields"><label>Target label<input data-active-power-field="targetLabel" value="${esc(activePower.targetLabel)}" placeholder="Self, ally, target, group"></label>${effectModeFieldMarkup}<label>Base duration<input data-active-power-field="duration" value="${esc(activePower.duration)}" placeholder="Duration from power"></label><label>Rounds remaining<input data-active-power-field="durationRemaining" type="number" min="0" step="1" value="${esc(durationValue)}" placeholder="Manual unless numeric"></label><label class="checkline"><input data-active-power-field="raiseMarked" type="checkbox" ${activePower.raiseMarked ? "checked" : ""}> Raise marked</label><label class="checkline"><input data-active-power-field="maintenance" type="checkbox" ${activePower.maintenance ? "checked" : ""}> Maintenance marked</label><label class="creator-wide">Trapping notes<textarea data-active-power-field="trappingNotes">${esc(activePower.trappingNotes)}</textarea></label><label class="creator-wide">Runtime notes<textarea data-active-power-field="notes">${esc(activePower.notes)}</textarea></label></div><div class="weapon-actions power-actions">${numericDuration === null ? "" : `<button class="ghost" type="button" data-active-power-tick ${current ? "" : "disabled"}>Tick down 1 round</button>`}<button class="ghost" type="button" data-active-power-status="dismissed" ${current ? "" : "disabled"}>Dismiss</button><button class="ghost" type="button" data-active-power-status="expired" ${current ? "" : "disabled"}>Expire</button><button class="delete-small" type="button" data-active-power-status="disrupted" ${current ? "" : "disabled"}>Disrupt</button></div>`;

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
  [...activePowers]
    .sort(compareActivePowers)
    .forEach((activePower) =>
      container.appendChild(renderActivePowerCard(activePower)),
    );
}
