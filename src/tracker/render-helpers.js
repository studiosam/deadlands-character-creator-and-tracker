/**
 * Shared markup helpers.
 *
 * These helpers produce small, escaped HTML fragments used across renderers.
 * Keep them presentation-focused; rule calculations and state mutations belong
 * in feature modules.
 */
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
  if (isUnsavedCharacterDraft()) return "Unsaved draft";
  const source = compactText(character.source || "Tracker", "Tracker");
  if (source.toLowerCase() === "savaged.us") return "Savaged.us import";
  if (source.toLowerCase() === "created") return "Created in tracker";
  return source;
}

function statusPipMarkup(label, value, note = "") {
  return `<div class="status-pip"><span>${esc(label)}</span><strong>${esc(value)}</strong>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
}

function passiveEffectSummaryItems(surface, currentCharacter = character) {
  return effectHookSummariesForSurface(currentCharacter, surface).map(
    (effect) => `${effect.sourceName}: ${effect.displayLabel}`,
  );
}

function passiveEffectSummaryText(surface, emptyText = "None") {
  const items = passiveEffectSummaryItems(surface);
  return items.length ? items.join("; ") : emptyText;
}

function passiveEffectDerivedCards(surface) {
  return effectHookSummariesForSurface(character, surface)
    .map(
      (effect) =>
        `<div class="derived-scan-card passive-effect-card"><span>${esc(effect.sourceName)}</span><strong>${esc(effect.displayLabel)}</strong><small>${esc(`${displayNameFromKey(effect.sourceType)} effect`)}</small></div>`,
    )
    .join("");
}

function tagCardMarkup(item, kind = "") {
  const controls = item.id
    ? `<div class="tag-actions"><button class="ghost tag-action" type="button" data-entry-type="${esc(kind)}" data-entry-action="edit" data-entry-id="${esc(item.id)}">Edit</button><button class="ghost tag-action danger-lite" type="button" data-entry-type="${esc(kind)}" data-entry-action="remove" data-entry-id="${esc(item.id)}">Remove</button></div>`
    : "";
  return `<article class="dossier-tag ${kind}"><div class="dossier-tag-head"><div><strong>${esc(item.name)}</strong>${item.meta ? `<span>${esc(item.meta)}</span>` : ""}</div>${controls}</div>${item.summary ? `<p>${esc(item.summary)}</p>` : ""}${item.note ? `<p class="tag-note">${esc(item.note)}</p>` : ""}${item.sourceMeta ? `<small>${esc(item.sourceMeta)}</small>` : ""}</article>`;
}

function skillReferenceName(name) {
  const text = String(name || "").trim();
  if (SKILL_USE_NOTES[text]) return text;
  const withoutParenthetical = text.replace(/\s*\(.+\)\s*$/, "");
  if (SKILL_USE_NOTES[withoutParenthetical]) return withoutParenthetical;
  return text;
}

function isUserFacingSkillName(name) {
  const referenceName = skillReferenceName(name);
  return !USER_FACING_HIDDEN_SKILL_NAMES.includes(referenceName);
}

function isUserFacingSkill(skill) {
  return isUserFacingSkillName(typeof skill === "string" ? skill : skill?.name);
}

function referencesHiddenSkillText(value) {
  const text = String(value || "").toLowerCase();
  return USER_FACING_HIDDEN_SKILL_NAMES.some((name) =>
    text.includes(String(name).toLowerCase()),
  );
}

function isUserFacingEdgeCatalogEntry(edge) {
  return !referencesHiddenSkillText(
    [edge?.name, edge?.requirements, edge?.shortSummary, edge?.subchoice].join(
      " ",
    ),
  );
}

function attributeUseNote(name) {
  return ATTRIBUTE_USE_NOTES[String(name || "").toLowerCase()] || "";
}

function skillUseNote(name) {
  return SKILL_USE_NOTES[skillReferenceName(name)] || "";
}

function skillLinkedAttribute(skill) {
  const referenceName = skillReferenceName(skill?.name);
  return (
    skill?.linkedAttribute ||
    SKILL_LINKED_ATTRIBUTES[referenceName] ||
    SKILL_LINKED_ATTRIBUTES[String(skill?.name || "")]
  );
}

function traitLabel(value) {
  const text = String(value || "").trim();
  return text ? displayNameFromKey(text.toLowerCase()) : "";
}

function attributeCardMarkup(name, die) {
  const label = traitLabel(name);
  const note = attributeUseNote(name);
  const display =
    typeof liquidCourageAttributeDisplay === "function"
      ? liquidCourageAttributeDisplay(character, name, die)
      : { value: die || "—", note: "" };
  return `<div class="attribute-die-card${display.note ? " temporary-modified" : ""}" aria-label="${esc(`${label} ${display.value}`)}">${typeof attributeHelpMarkup === "function" ? attributeHelpMarkup(label, note) : ""}<span>${esc(label)}</span><strong>${esc(display.value)}</strong>${display.note ? `<small>${esc(display.note)}</small>` : ""}</div>`;
}

function skillChipMarkup(skill) {
  const display =
    typeof liquidCourageSkillDisplay === "function"
      ? liquidCourageSkillDisplay(character, skill)
      : { value: skill.die || skill.value || "—", note: "" };
  const meta = display.value;
  const linkedAttribute = skillLinkedAttribute(skill);
  const displayNote =
    [display.note, skill.notes]
      .filter(Boolean)
      .join(" • ") ||
    [traitLabel(linkedAttribute), skill.isUnskilled ? "Unskilled" : ""]
      .filter(Boolean)
      .join(" • ");
  const useNote = skillUseNote(skill.name);
  const linkedText = linkedAttribute
    ? `Linked attribute: ${traitLabel(linkedAttribute)}.`
    : "";
  const unskilledText = skill.isUnskilled ? "Unskilled roll: d4-2." : "";
  const title = [skill.name || "Skill", useNote, linkedText, unskilledText]
    .filter(Boolean)
    .join(" ");
  const help = [useNote, linkedText, unskilledText].filter(Boolean).join(" ");
  return `<div class="skill-chip trait-help-target${skill.isUnskilled ? " unskilled" : ""}" tabindex="0" title="${esc(title)}" aria-label="${esc(`${skill.name || "Skill"} ${meta}. ${help}`)}"><strong>${esc(skill.name || "Skill")}</strong><span>${esc(meta)}${displayNote ? ` • ${esc(displayNote)}` : ""}</span>${help ? `<small class="trait-help" role="tooltip">${esc(help)}</small>` : ""}</div>`;
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
