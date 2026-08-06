/**
 * Notes and summary rendering for secondary tracker panels.
 *
 * These renderers collect already-normalized character data into readable
 * summaries. They should avoid introducing new state mutations beyond explicit
 * notes editing handled by events.js.
 */
function isArcaneReminder(reminder) {
  const text =
    `${reminder?.type || ""} ${reminder?.name || ""} ${reminder?.text || ""}`
      .replace(/\bnon[-\s]?arcane\b/gi, "")
      .toLowerCase();
  return /\b(arcane|backlash|malfunction|huckster|powers?)\b/i.test(text);
}

function renderArcaneSummary() {
  if (!characterHasArcaneTrackerContent(character)) {
    els.arcaneRemindersPanel?.classList.add("hidden");
    if (els.arcaneRemindersList) els.arcaneRemindersList.innerHTML = "";
    return;
  }

  const reminders = character.reminders.filter(isArcaneReminder);
  els.arcaneRemindersPanel?.classList.toggle("hidden", !reminders.length);
  els.arcaneRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : "";
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
