function reminderMarkup(reminder) {
  return `<article class="reminder"><div class="topline"><h3>${esc(reminder.name)}</h3><small>${esc(reminder.type)}</small></div><p>${esc(reminder.text)}</p></article>`;
}

function traitListMarkup(items, emptyText) {
  return items.length
    ? items
        .map(
          (item) =>
            `<div class="row"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}${item.note ? `<span>${esc(item.note)}</span>` : ""}</div></div>`,
        )
        .join("")
    : emptyState(emptyText);
}

function compactText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function sourceLabel() {
  const source = compactText(character.source || "Tracker", "Tracker");
  if (source.toLowerCase() === "savaged.us") return "Savaged.us import";
  if (source.toLowerCase() === "created") return "Created in tracker";
  return source;
}

function statusPipMarkup(label, value, note = "") {
  return `<div class="status-pip"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
}

function tagCardMarkup(item, kind = "") {
  const controls = item.id
    ? `<div class="tag-actions"><button class="ghost tag-action" type="button" data-entry-type="${esc(kind)}" data-entry-action="edit" data-entry-id="${esc(item.id)}">Edit</button><button class="ghost tag-action danger-lite" type="button" data-entry-type="${esc(kind)}" data-entry-action="remove" data-entry-id="${esc(item.id)}">Remove</button></div>`
    : "";
  return `<article class="dossier-tag ${kind}"><div class="dossier-tag-head"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}</div>${controls}</div>${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.note ? `<p class="tag-note">${esc(item.note)}</p>` : ""}${item.sourceMeta ? `<small>${esc(item.sourceMeta)}</small>` : ""}</article>`;
}

function attributeCardMarkup(name, die) {
  return `<div class="attribute-die-card"><span>${esc(displayNameFromKey(name))}</span><strong>${esc(die || "—")}</strong></div>`;
}

function skillChipMarkup(skill) {
  const meta = skill.die || skill.value || "—";
  const note = skill.notes || skill.linkedAttribute || "";
  return `<div class="skill-chip"><strong>${esc(skill.name || "Skill")}</strong><span>${esc(meta)}${note ? ` • ${esc(note)}` : ""}</span></div>`;
}

function equippedArmorSummaryMarkup() {
  const equipped = character.armorInventory.filter(
    (armor) => armor.equipped && armor.count > 0,
  );
  if (!equipped.length) return emptyState("No equipped armor recorded.");

  return equipped
    .map(
      (armor) =>
        `<div class="equipment-line"><strong>${esc(armor.name)}</strong><span>+${esc(armor.armor)} ${esc(armorLabel(armor.location))}${armor.minStr ? ` • Min Str ${esc(armor.minStr)}` : ""}</span></div>`,
    )
    .join("");
}

function equippedWeaponSummaryMarkup() {
  const weapons = character.weapons.filter((weapon) => weapon.name).slice(0, 4);
  if (!weapons.length) return emptyState("No weapons recorded.");

  return weapons
    .map((weapon) => {
      const loaded = isTrackedWeapon(weapon)
        ? ` • ${weapon.shotsLoaded} / ${weapon.shotsMax}`
        : "";
      return `<div class="equipment-line"><strong>${esc(weapon.name)}</strong><span>Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")}${loaded}</span></div>`;
    })
    .join("");
}

function characterNotesSummaryMarkup() {
  const importWarnings = character.reminders.filter(
    (reminder) => reminder.type === "Import Warning",
  );
  const notes = [
    ["Description", character.description],
    ["Background", character.background],
    ["Worst Nightmare", character.worstNightmare],
  ].filter(([, value]) => value);

  const parts = [];
  if (character.sourceId) {
    parts.push(
      `<article class="dossier-note"><strong>Import ID</strong><p>${esc(character.sourceId)}</p></article>`,
    );
  }
  notes.slice(0, 3).forEach(([label, value]) => {
    parts.push(
      `<article class="dossier-note"><strong>${esc(label)}</strong><p>${esc(value)}</p></article>`,
    );
  });
  importWarnings.slice(0, 3).forEach((warning) => {
    parts.push(
      `<article class="dossier-note warning"><strong>${esc(warning.name)}</strong><p>${esc(warning.text)}</p></article>`,
    );
  });

  return parts.length
    ? parts.join("")
    : emptyState("No background or import notes recorded.");
}
