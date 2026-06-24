function renderArcaneSummary() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneDetailSummary.innerHTML = background
    ? `<div class="row"><div><strong>${esc(background.name)}</strong><span>${esc(background.edgeName)} • ${esc(background.arcaneSkill)} (${esc(background.linkedAttribute)})</span><span>${esc(background.edgeFamily || "")}</span></div></div>`
    : powerPoints
      ? `<div class="row"><div><strong>Manual Power Points</strong><span>${powerPoints.current} / ${powerPoints.max}</span><span>${esc(powerPoints.note || "")}</span></div></div>`
      : emptyState("No arcane tools configured for this character.");

  const reminders = character.reminders.filter((reminder) =>
    /arcane|backlash|malfunction|huckster|power/i.test(
      `${reminder.type} ${reminder.name} ${reminder.text}`,
    ),
  );
  els.arcaneRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No arcane reminders.");
}

function renderNotesSummary() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  els.importWarningsList.innerHTML = importWarnings.length
    ? importWarnings.map(reminderMarkup).join("")
    : emptyState("No import warnings.");

  const longForm = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);
  els.longFormNotesList.innerHTML = longForm.length
    ? longForm
        .map(
          ([label, value]) =>
            `<article class="reminder"><div class="topline"><h3>${esc(label)}</h3></div><p>${esc(value)}</p></article>`,
        )
        .join("")
    : emptyState("No long-form character text recorded.");
}
