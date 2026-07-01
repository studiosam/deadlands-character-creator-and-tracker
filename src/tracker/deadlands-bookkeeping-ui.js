/**
 * Deadlands-specific bookkeeping UI.
 *
 * These controls store player-owned device and organization notes. They do not
 * resolve malfunction tables, approve favors, or replace Marshal adjudication.
 */
function bookkeepingOptionMarkup(value, label, selected = false) {
  return `<option value="${esc(value)}" ${selected ? "selected" : ""}>${esc(label)}</option>`;
}

function madScienceDeviceStatusLabel(status) {
  return (
    MAD_SCIENCE_DEVICE_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label || "Ready"
  );
}

function madScienceDeviceKindLabel(kind) {
  return (
    MAD_SCIENCE_DEVICE_KIND_OPTIONS.find((option) => option.value === kind)
      ?.label || "Power Device"
  );
}

function madScienceDevicePowerOptions(selectedId = "") {
  const options = [
    bookkeepingOptionMarkup("", "Custom / unlinked device", !selectedId),
  ];
  (character.powers || []).forEach((power) => {
    options.push(
      bookkeepingOptionMarkup(
        power.id,
        `${power.name || "Unnamed Power"}${power.trapping ? ` — ${power.trapping}` : ""}`,
        selectedId === power.id,
      ),
    );
  });
  return options.join("");
}

function madScienceDeviceStatusOptions(selected = "ready") {
  return MAD_SCIENCE_DEVICE_STATUS_OPTIONS.map((option) =>
    bookkeepingOptionMarkup(
      option.value,
      option.label,
      option.value === selected,
    ),
  ).join("");
}

function madScienceDeviceKindOptions(selected = "power-device") {
  return MAD_SCIENCE_DEVICE_KIND_OPTIONS.map((option) =>
    bookkeepingOptionMarkup(
      option.value,
      option.label,
      option.value === selected,
    ),
  ).join("");
}

function updateMadScienceDeviceField(device, field, value) {
  if (field === "malfunctionReminder")
    device.malfunctionReminder = Boolean(value);
  else if (field === "status")
    device.status = normalizedMadScienceDeviceStatus(value);
  else if (field === "kind")
    device.kind = normalizedMadScienceDeviceKind(value);
  else if (field === "linkedPowerId") {
    const power = (character.powers || []).find((item) => item.id === value);
    device.linkedPowerId = power?.id || "";
    device.linkedPowerName = power?.name || "";
  } else device[field] = String(value || "").trim();
  device.updatedAt = new Date().toISOString();
  save();
}

function addMadScienceDeviceFromSelection() {
  const selectedPowerId = els.madScienceDevicePowerSelect?.value || "";
  const power = (character.powers || []).find(
    (item) => item.id === selectedPowerId,
  );
  if (!Array.isArray(character.madScienceDevices))
    character.madScienceDevices = [];
  character.madScienceDevices.push(makeMadScienceDeviceRecord(power));
  character.madScienceDevices = normalizeMadScienceDevices(
    character.madScienceDevices,
    character,
  );
  render();
  save();
}

function deleteMadScienceDevice(device) {
  character.madScienceDevices = (character.madScienceDevices || []).filter(
    (item) => item.id !== device.id,
  );
  render();
  save();
}

function renderMadScienceDeviceCard(device) {
  const article = document.createElement("article");
  article.className = `weapon-card power-card mad-science-device-card ${esc(device.status)}`;
  const linkedPower = device.linkedPowerName
    ? `<span>Linked power: ${esc(device.linkedPowerName)}</span>`
    : "<span>Unlinked custom device</span>";
  const malfunction = device.malfunctionReminder
    ? '<p class="entry-advisory"><strong>Critical Failure reminder:</strong> ask the Marshal for the infernal-device malfunction result.</p>'
    : "";
  article.innerHTML = `<div class="topline"><div><h3>${esc(device.name)}</h3><p class="meta">${esc(madScienceDeviceKindLabel(device.kind))} | ${esc(device.source)}</p>${linkedPower}</div><span class="loaded">${esc(madScienceDeviceStatusLabel(device.status))}</span></div>${malfunction}<div class="creator-grid active-power-fields"><label>Device name<input data-mad-device-field="name" value="${esc(device.name)}"></label><label>Kind<select data-mad-device-field="kind">${madScienceDeviceKindOptions(device.kind)}</select></label><label>Status<select data-mad-device-field="status">${madScienceDeviceStatusOptions(device.status)}</select></label><label>Linked power<select data-mad-device-field="linkedPowerId">${madScienceDevicePowerOptions(device.linkedPowerId)}</select></label><label class="checkline"><input data-mad-device-field="malfunctionReminder" type="checkbox" ${device.malfunctionReminder ? "checked" : ""}> Show malfunction reminder</label><label class="creator-wide">Trapping notes<textarea data-mad-device-field="trappingNotes">${esc(device.trappingNotes)}</textarea></label><label class="creator-wide">Fuel notes<textarea data-mad-device-field="fuelNotes">${esc(device.fuelNotes)}</textarea></label><label class="creator-wide">Repair/status notes<textarea data-mad-device-field="repairNotes">${esc(device.repairNotes)}</textarea></label><label class="creator-wide">General notes<textarea data-mad-device-field="notes">${esc(device.notes)}</textarea></label></div><div class="weapon-actions power-actions"><button class="delete-small" type="button" data-delete-mad-device>Delete</button></div>`;

  article.querySelectorAll("[data-mad-device-field]").forEach((input) => {
    const field = input.dataset.madDeviceField;
    const handler = () => {
      updateMadScienceDeviceField(
        device,
        field,
        input.type === "checkbox" ? input.checked : input.value,
      );
      if (
        ["kind", "status", "linkedPowerId", "malfunctionReminder"].includes(
          field,
        )
      )
        render();
    };
    if (input.type === "checkbox" || input.tagName === "SELECT")
      input.onchange = handler;
    else input.oninput = handler;
  });
  article.querySelector("[data-delete-mad-device]").onclick = () =>
    deleteMadScienceDevice(device);
  return article;
}

function renderMadScienceDevices() {
  if (!els.madScienceDevicesPanel) return;
  character.madScienceDevices = normalizeMadScienceDevices(
    character.madScienceDevices,
    character,
  );
  const shouldShow =
    characterIsMadScientist(character) ||
    character.madScienceDevices.length > 0;
  els.madScienceDevicesPanel.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) return;

  els.madScienceDevicePowerSelect.innerHTML = madScienceDevicePowerOptions("");
  els.addMadScienceDeviceBtn.onclick = addMadScienceDeviceFromSelection;
  els.madScienceDevicesList.innerHTML = "";
  if (!character.madScienceDevices.length) {
    els.madScienceDevicesList.innerHTML = emptyState(
      "No mad science devices tracked yet.",
    );
    return;
  }
  character.madScienceDevices.forEach((device) =>
    els.madScienceDevicesList.appendChild(renderMadScienceDeviceCard(device)),
  );
}

function organizationHistoryLabel(entry) {
  const typeLabels = {
    spend: "Spent favor",
    refresh: "Refreshed favors",
    note: "Note",
  };
  return typeLabels[entry.type] || "History";
}

function organizationHistoryMarkup(history = []) {
  if (!history.length)
    return '<p class="muted">No favor history recorded yet.</p>';
  return `<ul>${history
    .slice(-5)
    .reverse()
    .map((entry) => {
      const amount = entry.amount ? ` (${entry.amount})` : "";
      return `<li><strong>${esc(organizationHistoryLabel(entry))}${esc(amount)}:</strong> ${esc(entry.note || "No note")}</li>`;
    })
    .join("")}</ul>`;
}

function addOrganizationHistoryEntry(record, type, amount, note) {
  record.history = Array.isArray(record.history) ? record.history : [];
  record.history.push(
    normalizeOrganizationHistoryEntry({
      id: `organization-history-${Date.now()}`,
      type,
      amount,
      note,
      createdAt: new Date().toISOString(),
    }),
  );
}

function updateOrganizationField(record, field, value) {
  if (field === "favorsCurrent" || field === "favorsMax") {
    record[field] = Math.max(0, Math.floor(Number(value) || 0));
    if (record.favorsMax && record.favorsCurrent > record.favorsMax)
      record.favorsCurrent = record.favorsMax;
  } else record[field] = String(value || "").trim();
  save();
}

function addOrganizationRecordFromSuggestion(suggestion = null) {
  const resolvedSuggestion =
    suggestion ||
    organizationSuggestionsForCharacter(character).find(
      (item) =>
        !(character.organizations || []).some((record) =>
          organizationMatchesSuggestion(record, item),
        ),
    ) ||
    {};
  if (!Array.isArray(character.organizations)) character.organizations = [];
  character.organizations.push(makeOrganizationRecord(resolvedSuggestion));
  character.organizations = normalizeDeadlandsOrganizations(
    character.organizations,
  );
  render();
  save();
}

function deleteOrganizationRecord(record) {
  character.organizations = (character.organizations || []).filter(
    (item) => item.id !== record.id,
  );
  render();
  save();
}

async function addOrganizationManualNote(record) {
  const note = await appPrompt(
    "Record a GM-adjudicated organization note.",
    "",
    {
      title: "Organization Note",
      inputLabel: "Note",
      confirmText: "Add Note",
    },
  );
  if (note === null || !note.trim()) return;
  addOrganizationHistoryEntry(record, "note", 0, note);
  render();
  save();
}

function spendOrganizationFavor(record) {
  if (record.favorsCurrent <= 0) return;
  record.favorsCurrent = Math.max(0, record.favorsCurrent - 1);
  addOrganizationHistoryEntry(record, "spend", -1, "Favor spent.");
  render();
  save();
}

function refreshOrganizationFavors(record) {
  if (record.favorsMax <= 0) return;
  record.favorsCurrent = record.favorsMax;
  addOrganizationHistoryEntry(
    record,
    "refresh",
    record.favorsMax,
    "Favors refreshed.",
  );
  render();
  save();
}

function renderOrganizationSuggestions(suggestions) {
  const missing = suggestions.filter(
    (suggestion) =>
      !(character.organizations || []).some((record) =>
        organizationMatchesSuggestion(record, suggestion),
      ),
  );
  if (!missing.length) {
    els.organizationSuggestionList.innerHTML = "";
    return;
  }
  els.organizationSuggestionList.innerHTML = `<div class="catalog-warning">${missing
    .map(
      (suggestion) =>
        `<p>Detected ${esc(suggestion.source)}. <button class="ghost small-action" type="button" data-add-organization="${esc(suggestion.name)}">Add ${esc(suggestion.name)}</button></p>`,
    )
    .join("")}</div>`;
  els.organizationSuggestionList
    .querySelectorAll("[data-add-organization]")
    .forEach((button) => {
      button.onclick = () => {
        const suggestion = missing.find(
          (item) => item.name === button.dataset.addOrganization,
        );
        addOrganizationRecordFromSuggestion(suggestion);
      };
    });
}

function renderOrganizationRecordCard(record) {
  const article = document.createElement("article");
  article.className = "tag-card organization-card";
  article.innerHTML = `<div class="topline"><div><h3>${esc(record.name)}</h3><p class="meta">${esc(record.rankLabel || "Rank/grade not set")} | Favors ${record.favorsCurrent} / ${record.favorsMax || "—"} | ${esc(record.source)}</p></div><span class="pill">Player notes</span></div><div class="creator-grid active-power-fields"><label>Organization<input data-organization-field="name" value="${esc(record.name)}" list="organizationNameOptions"></label><label>Rank / grade<input data-organization-field="rankLabel" value="${esc(record.rankLabel)}"></label><label>Favors current<input data-organization-field="favorsCurrent" type="number" min="0" step="1" value="${esc(record.favorsCurrent)}"></label><label>Favors max<input data-organization-field="favorsMax" type="number" min="0" step="1" value="${esc(record.favorsMax)}"></label><label class="creator-wide">Granted gear / issue notes<textarea data-organization-field="grantedGearNotes">${esc(record.grantedGearNotes)}</textarea></label><label class="creator-wide">Pay / authority / source notes<textarea data-organization-field="payNotes">${esc(record.payNotes)}</textarea></label><label class="creator-wide">General notes<textarea data-organization-field="notes">${esc(record.notes)}</textarea></label></div><div class="entry-advisory"><strong>Favor history:</strong>${organizationHistoryMarkup(record.history)}</div><div class="weapon-actions power-actions"><button class="ghost" type="button" data-organization-action="spend" ${record.favorsCurrent > 0 ? "" : "disabled"}>Spend Favor</button><button class="ghost" type="button" data-organization-action="refresh" ${record.favorsMax > 0 ? "" : "disabled"}>Refresh Favors</button><button class="ghost" type="button" data-organization-action="note">Add Note</button><button class="delete-small" type="button" data-organization-action="delete">Delete</button></div>`;

  article.querySelectorAll("[data-organization-field]").forEach((input) => {
    const field = input.dataset.organizationField;
    input.oninput = () => updateOrganizationField(record, field, input.value);
  });
  article.querySelectorAll("[data-organization-action]").forEach((button) => {
    const action = button.dataset.organizationAction;
    button.onclick = () => {
      if (action === "spend") spendOrganizationFavor(record);
      else if (action === "refresh") refreshOrganizationFavors(record);
      else if (action === "note") addOrganizationManualNote(record);
      else if (action === "delete") deleteOrganizationRecord(record);
    };
  });
  return article;
}

function renderDeadlandsOrganizations() {
  if (!els.organizationBookkeepingPanel) return;
  character.organizations = normalizeDeadlandsOrganizations(
    character.organizations,
  );
  const suggestions = organizationSuggestionsForCharacter(character);
  const shouldShow =
    suggestions.length > 0 || character.organizations.length > 0;
  els.organizationBookkeepingPanel.classList.toggle("hidden", !shouldShow);
  if (!shouldShow) return;

  els.addOrganizationRecordBtn.onclick = () =>
    addOrganizationRecordFromSuggestion();
  renderOrganizationSuggestions(suggestions);
  els.organizationBookkeepingList.innerHTML = "";
  if (!character.organizations.length) {
    els.organizationBookkeepingList.innerHTML = emptyState(
      "No organization records yet.",
    );
    return;
  }
  character.organizations.forEach((record) =>
    els.organizationBookkeepingList.appendChild(
      renderOrganizationRecordCard(record),
    ),
  );
}
