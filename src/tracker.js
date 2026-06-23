let character = loadCharacter();
let saveTimer = null;

const $ = (selector) => document.querySelector(selector);

const els = {
  characterName: $("#characterName"),
  characterSubtitle: $("#characterSubtitle"),
  saveState: $("#saveState"),
  woundsValue: $("#woundsValue"),
  woundPenalty: $("#woundPenalty"),
  woundsNote: $("#woundsNote"),
  fatigueValue: $("#fatigueValue"),
  fatiguePenalty: $("#fatiguePenalty"),
  fatigueNote: $("#fatigueNote"),
  benniesValue: $("#benniesValue"),
  bennyStart: $("#bennyStart"),
  convictionValue: $("#convictionValue"),
  paceValue: $("#paceValue"),
  parryValue: $("#parryValue"),
  toughnessValue: $("#toughnessValue"),
  armorSelect: $("#armorSelect"),
  armorNote: $("#armorNote"),
  armorStrengthPill: $("#armorStrengthPill"),
  weaponStrengthPill: $("#weaponStrengthPill"),
  moneyDisplay: $("#moneyDisplay"),
  moneyInput: $("#moneyInput"),
  addMoneyBtn: $("#addMoneyBtn"),
  spendMoneyBtn: $("#spendMoneyBtn"),
  resourcesList: $("#resourcesList"),
  addManualPowerPointsBtn: $("#addManualPowerPointsBtn"),
  combatStatusResources: $("#combatStatusResources"),
  combatArmorLocations: $("#combatArmorLocations"),
  playPowerPointsCard: $("#playPowerPointsCard"),
  playPowerPointsList: $("#playPowerPointsList"),
  playResourcesCard: $("#playResourcesCard"),
  playResourcesList: $("#playResourcesList"),
  playActivePowersCard: $("#playActivePowersCard"),
  playActivePowersList: $("#playActivePowersList"),
  combatHucksterCard: $("#combatHucksterCard"),
  combatHucksterHelper: $("#combatHucksterHelper"),
  combatConsumablesCard: $("#combatConsumablesCard"),
  combatConsumablesList: $("#combatConsumablesList"),
  combatRemindersCard: $("#combatRemindersCard"),
  combatRemindersList: $("#combatRemindersList"),
  keyConditionsList: $("#keyConditionsList"),
  playWeaponList: $("#playWeaponList"),
  playAmmoReserves: $("#playAmmoReserves"),
  characterSummaryName: $("#characterSummaryName"),
  characterBasicsList: $("#characterBasicsList"),
  attributesList: $("#attributesList"),
  skillsList: $("#skillsList"),
  edgesList: $("#edgesList"),
  hindrancesList: $("#hindrancesList"),
  characterDerivedDetails: $("#characterDerivedDetails"),
  characterArcaneSummary: $("#characterArcaneSummary"),
  arcaneDetailSummary: $("#arcaneDetailSummary"),
  arcaneRemindersList: $("#arcaneRemindersList"),
  importWarningsList: $("#importWarningsList"),
  longFormNotesList: $("#longFormNotesList"),
  arcaneSummary: $("#arcaneSummary"),
  powersList: $("#powersList"),
  powerNameInput: $("#powerNameInput"),
  powerCostInput: $("#powerCostInput"),
  powerDurationInput: $("#powerDurationInput"),
  powerTrappingInput: $("#powerTrappingInput"),
  powerNotesInput: $("#powerNotesInput"),
  addPowerBtn: $("#addPowerBtn"),
  hucksterDealPanel: $("#hucksterDealPanel"),
  hucksterSelectedPower: $("#hucksterSelectedPower"),
  hucksterRequiredPowerPoints: $("#hucksterRequiredPowerPoints"),
  hucksterGamblingRollResult: $("#hucksterGamblingRollResult"),
  hucksterCardsDrawn: $("#hucksterCardsDrawn"),
  hucksterPokerHand: $("#hucksterPokerHand"),
  hucksterTemporaryPowerPoints: $("#hucksterTemporaryPowerPoints"),
  hucksterShortagePenalty: $("#hucksterShortagePenalty"),
  hucksterLeftoverPowerPoints: $("#hucksterLeftoverPowerPoints"),
  hucksterAnteBennySpent: $("#hucksterAnteBennySpent"),
  hucksterUsedJoker: $("#hucksterUsedJoker"),
  hucksterBackfireTriggered: $("#hucksterBackfireTriggered"),
  hucksterNotes: $("#hucksterNotes"),
  weaponList: $("#weaponList"),
  weaponCatalogSelect: $("#weaponCatalogSelect"),
  weaponNameInput: $("#weaponNameInput"),
  weaponQtyInput: $("#weaponQtyInput"),
  weaponDamageInput: $("#weaponDamageInput"),
  weaponRangeInput: $("#weaponRangeInput"),
  weaponApInput: $("#weaponApInput"),
  weaponRofInput: $("#weaponRofInput"),
  weaponCapacityInput: $("#weaponCapacityInput"),
  weaponAmmoTypeSelect: $("#weaponAmmoTypeSelect"),
  addWeaponBtn: $("#addWeaponBtn"),
  weaponCatalogPreview: $("#weaponCatalogPreview"),
  weaponTemplate: $("#weaponTemplate"),
  ammoReserves: $("#ammoReserves"),
  ammoGearSelect: $("#ammoGearSelect"),
  ammoLabelInput: $("#ammoLabelInput"),
  ammoCountInput: $("#ammoCountInput"),
  ammoNoteInput: $("#ammoNoteInput"),
  addAmmoBtn: $("#addAmmoBtn"),
  ammoGearPreview: $("#ammoGearPreview"),
  armorLocationList: $("#armorLocationList"),
  armorInventoryList: $("#armorInventoryList"),
  armorCatalogSelect: $("#armorCatalogSelect"),
  armorNameInput: $("#armorNameInput"),
  armorCountInput: $("#armorCountInput"),
  armorValueInput: $("#armorValueInput"),
  armorLocationSelect: $("#armorLocationSelect"),
  addArmorBtn: $("#addArmorBtn"),
  armorCatalogPreview: $("#armorCatalogPreview"),
  conditionsList: $("#conditionsList"),
  clearTempConditionsBtn: $("#clearTempConditionsBtn"),
  consumablesList: $("#consumablesList"),
  remindersList: $("#remindersList"),
  gearSelect: $("#gearSelect"),
  inventoryNameInput: $("#inventoryNameInput"),
  inventoryCountInput: $("#inventoryCountInput"),
  inventoryNoteInput: $("#inventoryNoteInput"),
  addInventoryBtn: $("#addInventoryBtn"),
  gearPreview: $("#gearPreview"),
  inventoryList: $("#inventoryList"),
  vehicleCatalogSelect: $("#vehicleCatalogSelect"),
  vehicleNameInput: $("#vehicleNameInput"),
  vehicleQtyInput: $("#vehicleQtyInput"),
  vehicleNoteInput: $("#vehicleNoteInput"),
  addVehicleBtn: $("#addVehicleBtn"),
  vehicleCatalogPreview: $("#vehicleCatalogPreview"),
  vehicleList: $("#vehicleList"),
  notesArea: $("#notesArea"),
  newSessionBtn: $("#newSessionBtn"),
  exportBtn: $("#exportBtn"),
  importFile: $("#importFile"),
  resetBtn: $("#resetBtn"),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );
}

function money(cents) {
  return `$${((Number(cents) || 0) / 100).toFixed(2)}`;
}

function wt(weight) {
  if (weight === undefined || weight === null || Number.isNaN(Number(weight)))
    return "—";
  return Number(weight).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char],
  );
}

function optionList(items, placeholder, detail) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items.map(
      (item) =>
        `<option value="${esc(item.id)}">${esc(item.name)} • ${esc(detail(item))}</option>`,
    ),
  ].join("");
}

function armorLabel(id) {
  return (
    ARMOR_LOCATIONS.find((location) => location.id === id) || { label: id }
  ).label;
}

function isAmmo(item) {
  return /ammo|ammunition|shell|shot w\/powder|arrow|percussion cap/i.test(
    item.name,
  );
}

function isTrackedWeapon(weapon) {
  return Boolean(
    Number.isFinite(Number(weapon?.shotsMax)) &&
    Number(weapon.shotsMax) > 0 &&
    weapon.ammoType,
  );
}

function emptyState(text) {
  return `<p class="empty-state">${esc(text)}</p>`;
}

function displayNameFromKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

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

function normalize(data) {
  const defaults = clone(defaultCharacter);
  const normalized = data && typeof data === "object" ? data : defaults;

  normalized.name ||= defaults.name;
  normalized.rank ||= defaults.rank;
  normalized.ancestry ||= defaults.ancestry;
  normalized.archetype ||= defaults.archetype;
  normalized.bennies = { ...defaults.bennies, ...(normalized.bennies || {}) };
  normalized.damage = { ...defaults.damage, ...(normalized.damage || {}) };
  normalized.derived = { ...defaults.derived, ...(normalized.derived || {}) };
  normalized.conditions = {
    ...defaults.conditions,
    ...(normalized.conditions || {}),
  };
  normalized.temporaryConditions = Array.isArray(normalized.temporaryConditions)
    ? normalized.temporaryConditions
    : clone(defaults.temporaryConditions);
  normalized.selectedArmorLocation ||= "best";
  normalized.moneyCents = Math.round(Number(normalized.moneyCents) || 0);
  normalized.armorStrength ||=
    normalized.attributes?.strength || defaults.armorStrength || "d4";
  normalized.weaponStrength ||=
    normalized.attributes?.strength || defaults.weaponStrength || "d4";
  normalized.conviction = Math.max(
    0,
    Math.floor(Number(normalized.conviction) || 0),
  );
  normalized.arcaneBackground = normalized.arcaneBackground || null;
  if (normalized.arcaneBackground?.edgeName) {
    const config = arcaneBackgroundConfigFromEdge(
      normalized.arcaneBackground.edgeName,
    );
    normalized.arcaneBackground = config
      ? {
          ...makeArcaneBackgroundState(config),
          ...normalized.arcaneBackground,
        }
      : normalized.arcaneBackground;
  }

  normalized.ammo =
    normalized.ammo && typeof normalized.ammo === "object"
      ? normalized.ammo
      : {};
  Object.entries(defaults.ammo || {}).forEach(([key, ammo]) => {
    if (!normalized.ammo[key])
      normalized.ammo[key] = { ...clone(ammo), count: 0 };
  });
  Object.values(normalized.ammo).forEach((ammo) => {
    ammo.label ||= "Ammo";
    ammo.count = Math.max(0, Math.floor(Number(ammo.count) || 0));
  });

  normalized.weapons = Array.isArray(normalized.weapons)
    ? normalized.weapons
    : [];
  normalized.weapons = normalized.weapons.map((weapon, index) => {
    const item = { ...weapon };
    item.id ||= `${slugify(item.name || "weapon")}-${index}`;
    item.name ||= "Unnamed weapon";
    item.damage ||= "—";
    item.range ||= "—";
    item.ap = item.ap === "" || item.ap === undefined ? "—" : item.ap;
    item.rof = item.rof === "" || item.rof === undefined ? "—" : item.rof;

    if (!item.shotsMax || Number(item.shotsMax) <= 0) {
      item.shotsMax = null;
      item.shotsLoaded = null;
      item.ammoType = null;
    } else {
      item.shotsMax = Math.floor(Number(item.shotsMax));
      item.shotsLoaded = clamp(
        Math.floor(Number(item.shotsLoaded) || item.shotsMax),
        0,
        item.shotsMax,
      );
      if (!normalized.ammo[item.ammoType])
        item.ammoType = Object.keys(normalized.ammo)[0] || null;
    }

    return item;
  });

  normalized.armorInventory = Array.isArray(normalized.armorInventory)
    ? normalized.armorInventory
    : [];
  normalized.armorInventory = normalized.armorInventory.map((armor, index) => ({
    id: armor.id || `${slugify(armor.name || "armor")}-${index}`,
    name: armor.name || "Armor",
    count: Math.max(0, Math.floor(Number(armor.count) || 0)),
    armor: Math.max(0, Math.floor(Number(armor.armor) || 0)),
    weight: armor.weight,
    minStr: armor.minStr || "—",
    costCents: armor.costCents,
    book: armor.book || "Deadlands",
    location: ARMOR_LOCATIONS.some((location) => location.id === armor.location)
      ? armor.location
      : "torso",
    equipped: Boolean(armor.equipped),
    note: armor.note || "",
  }));

  normalized.resources = Array.isArray(normalized.resources)
    ? normalized.resources
    : [];
  normalized.resources = normalized.resources.map((resource, index) => ({
    id: resource.id || `${slugify(resource.name || "resource")}-${index}`,
    name: resource.name || "Resource",
    current: Math.max(0, Math.floor(Number(resource.current) || 0)),
    max: Math.max(0, Math.floor(Number(resource.max) || 0)),
    source: resource.source || "",
    note: resource.note || "",
  }));
  normalized.powers = Array.isArray(normalized.powers)
    ? normalized.powers.map((power, index) =>
        normalizePowerRecord(
          power,
          index,
          normalized.arcaneBackground?.edgeName,
        ),
      )
    : [];
  normalized.hucksterDeal = normalizeHucksterDeal(normalized.hucksterDeal);
  if (
    normalized.arcaneBackground?.key === "huckster" &&
    !normalized.hucksterDeal
  )
    normalized.hucksterDeal = makeHucksterDeal();

  normalized.inventory = Array.isArray(normalized.inventory)
    ? normalized.inventory
    : [];
  normalized.vehicles = Array.isArray(normalized.vehicles)
    ? normalized.vehicles
    : [];
  normalized.consumables = Array.isArray(normalized.consumables)
    ? normalized.consumables
    : [];
  normalized.reminders = Array.isArray(normalized.reminders)
    ? normalized.reminders
    : [];
  normalized.notes ||= "";

  return normalized;
}

function loadCharacter() {
  try {
    return normalize(
      JSON.parse(localStorage.getItem(STORAGE_KEY)) || clone(defaultCharacter),
    );
  } catch {
    return normalize(clone(defaultCharacter));
  }
}

function save() {
  if (!els.saveState) return;
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    els.saveState.textContent = "Saved";
  }, 120);
}

function ammoOptions(selected = "") {
  return [
    `<option value=""${!selected ? " selected" : ""}>No ammunition tracking</option>`,
    ...Object.entries(character.ammo).map(
      ([key, ammo]) =>
        `<option value="${esc(key)}"${key === selected ? " selected" : ""}>${esc(ammo.label)}</option>`,
    ),
  ].join("");
}

function catalogs() {
  els.gearSelect.innerHTML = optionList(
    GEAR_CATALOG,
    "Choose gear from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.ammoGearSelect.innerHTML = optionList(
    GEAR_CATALOG.filter(isAmmo),
    "Choose ammunition from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.armorCatalogSelect.innerHTML = optionList(
    ARMOR_CATALOG,
    "Choose armor from catalog…",
    (item) =>
      `+${item.armor} • ${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.weaponCatalogSelect.innerHTML = optionList(
    WEAPON_CATALOG,
    "Choose weapon from catalog…",
    (item) => `${wt(item.weight)} lb • ${money(item.costCents)}`,
  );
  els.vehicleCatalogSelect.innerHTML = optionList(
    VEHICLE_CATALOG,
    "Choose vehicle from catalog…",
    (item) => money(item.costCents),
  );
  els.armorLocationSelect.innerHTML = ARMOR_LOCATIONS.map(
    (location) =>
      `<option value="${esc(location.id)}">${esc(location.label)}</option>`,
  ).join("");
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

function updatePreviews() {
  const gear = chosen(GEAR_CATALOG, els.gearSelect.value);
  els.gearPreview.textContent = gear
    ? `${gear.name} • Weight ${wt(gear.weight)} • Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const ammo = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  els.ammoGearPreview.textContent = ammo
    ? `${ammo.name} • Weight ${wt(ammo.weight)} • Cost ${money(ammo.costCents)} each`
    : "Choose ammunition from the catalog or type custom ammo.";

  const armor = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  els.armorCatalogPreview.textContent = armor
    ? `${armor.name} • +${armor.armor} armor • ${armorLabel(armor.location)} • Min Str ${armor.minStr} • ${money(armor.costCents)}`
    : "Choose armor from the catalog or type custom armor.";
  if (armor) {
    els.armorValueInput.value = armor.armor;
    els.armorLocationSelect.value = armor.location;
  }

  const weapon = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  els.weaponCatalogPreview.textContent = weapon
    ? `${weapon.name} • Min Str ${weapon.minStr} • Weight ${wt(weapon.weight)} • Cost ${money(weapon.costCents)}. Fill blank combat stats manually.`
    : "Choose a weapon from the catalog or type custom weapon.";
  if (weapon) {
    els.weaponDamageInput.value = weapon.damage || "";
    els.weaponRangeInput.value = weapon.range || "";
    els.weaponApInput.value = weapon.ap !== undefined ? weapon.ap : "";
    els.weaponRofInput.value = weapon.rof || "";
    els.weaponCapacityInput.value = weapon.shotsMax || "";
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(weapon.ammoType || "");
  }

  const vehicle = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  els.vehicleCatalogPreview.textContent = vehicle
    ? `${vehicle.name} • Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}

function armorValue(location) {
  return character.armorInventory
    .filter(
      (armor) =>
        armor.equipped &&
        armor.count > 0 &&
        (location === "best" || armor.location === location),
    )
    .reduce((max, armor) => Math.max(max, Number(armor.armor) || 0), 0);
}

function render() {
  els.characterName.textContent = character.name;
  els.characterSubtitle.textContent = [
    character.rank,
    character.ancestry,
    character.archetype,
  ]
    .filter(Boolean)
    .join(" ");
  els.woundsValue.textContent = character.damage.wounds;
  const woundPenalty = Math.min(character.damage.wounds, character.damage.maxWounds);
  els.woundPenalty.textContent = woundPenalty ? `Penalty -${woundPenalty}` : "";
  els.woundPenalty.classList.toggle("hidden", !woundPenalty);
  els.woundsNote.textContent = character.damage.wounds
    ? "Apply wound penalty to affected trait rolls."
    : "Healthy";
  els.fatigueValue.textContent = character.damage.fatigue;
  const fatiguePenalty = Math.min(character.damage.fatigue, character.damage.maxFatigue);
  els.fatiguePenalty.textContent = fatiguePenalty ? `Penalty -${fatiguePenalty}` : "";
  els.fatiguePenalty.classList.toggle("hidden", !fatiguePenalty);
  els.fatigueNote.textContent = character.damage.fatigue
    ? "Apply fatigue penalty to affected trait rolls."
    : "Fresh";
  els.benniesValue.textContent = character.bennies.current;
  els.bennyStart.textContent = `Start ${character.bennies.starting}`;
  els.convictionValue.textContent = character.conviction;

  const location = "best";
  character.selectedArmorLocation = "best";
  const armor = armorValue(location);
  character.derived.armor = armor;
  character.derived.toughness =
    (Number(character.derived.baseToughness) || 0) + armor;
  els.paceValue.textContent = character.derived.pace;
  els.parryValue.textContent = character.derived.parry;
  els.toughnessValue.textContent = `${character.derived.toughness} (+${armor})`;
  els.armorSelect.innerHTML = `<option value="best">All equipped armor</option>`;
  els.armorSelect.value = location;
  els.armorNote.textContent = `Armor bonus: +${armor}`;
  els.combatArmorLocations.innerHTML = ARMOR_LOCATIONS.filter(
    (item) => !["best", "shield"].includes(item.id),
  )
    .map(
      (item) =>
        `<span><strong>${esc(item.label)}:</strong> +${armorValue(item.id)}</span>`,
    )
    .join("");
  els.armorStrengthPill.textContent = `Strength ${character.armorStrength}`;
  els.weaponStrengthPill.textContent = `Strength ${character.weaponStrength}`;
  els.moneyDisplay.textContent = money(character.moneyCents);

  renderCharacterSummary();
  renderArmor();
  renderWeapons();
  renderAmmo();
  renderResources();
  renderPowers();
  renderHucksterDeal();
  renderKeyConditions();
  renderConditions();
  renderConsumables();
  renderInventory();
  renderVehicles();
  renderReminders();
  renderPlaySummary();
  renderArcaneSummary();
  renderNotesSummary();

  if (document.activeElement !== els.notesArea)
    els.notesArea.value = character.notes || "";
}

function renderCharacterSummary() {
  els.characterSummaryName.textContent = character.name;
  els.characterBasicsList.innerHTML = [
    ["Rank", character.rank],
    ["Ancestry", character.ancestry],
    ["Concept", character.archetype],
    ["Source", character.source || "Tracker"],
  ]
    .map(
      ([label, value]) =>
        `<div><span>${label}</span><strong>${esc(value || "—")}</strong></div>`,
    )
    .join("");

  const attributes = Object.entries(character.attributes || {}).map(
    ([name, die]) => ({
      name: displayNameFromKey(name),
      meta: die,
    }),
  );
  els.attributesList.innerHTML = traitListMarkup(
    attributes,
    "No attributes recorded.",
  );

  const skills = (character.skills || []).map((skill) => ({
    name: skill.name,
    meta: skill.die || skill.value || "",
    note: skill.notes || skill.linkedAttribute || "",
  }));
  els.skillsList.innerHTML = traitListMarkup(skills, "No skills recorded.");

  const edges = (character.edges || [])
    .filter((edge) => edge.name)
    .map((edge) => ({
      name: edge.name,
      meta: edge.source || edge.requirements || "",
      note: edge.notes || edge.text || "",
    }));
  els.edgesList.innerHTML = traitListMarkup(edges, "No Edges recorded.");

  const hindrances = (character.hindrances || [])
    .filter((hindrance) => hindrance.name)
    .map((hindrance) => ({
      name: hindrance.name,
      meta: hindrance.severity || hindrance.points || "",
      note: hindrance.notes || hindrance.text || "",
    }));
  els.hindrancesList.innerHTML = traitListMarkup(
    hindrances,
    "No Hindrances recorded.",
  );

  els.characterDerivedDetails.innerHTML = [
    ["Pace", character.derived.pace],
    ["Parry", character.derived.parry],
    ["Base Toughness", character.derived.baseToughness],
    ["Armor", character.derived.armor],
    ["Total Toughness", character.derived.toughness],
  ]
    .map(
      ([label, value]) =>
        `<div><span>${label}</span><strong>${esc(value ?? "—")}</strong></div>`,
    )
    .join("");

  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.characterArcaneSummary.innerHTML = background
    ? `<div class="row"><div><strong>${esc(background.name)}</strong><span>${esc(background.edgeName)} • ${esc(background.arcaneSkill)} (${esc(background.linkedAttribute)})</span>${powerPoints ? `<span>Power Points ${powerPoints.current} / ${powerPoints.max}</span>` : ""}</div></div>`
    : powerPoints
      ? `<div class="row"><div><strong>Manual Power Points</strong><span>${powerPoints.current} / ${powerPoints.max}</span><span>${esc(powerPoints.note || "")}</span></div></div>`
      : emptyState("No Arcane Background or Power Points configured.");
}

function renderKeyConditions() {
  const keys = [
    "shaken",
    "distracted",
    "vulnerable",
    "stunned",
    "prone",
    "bound",
    "entangled",
    "aiming",
    "defending",
    "theDrop",
    "onHold",
    "wildAttack",
  ].filter((key) => key in character.conditions);
  els.keyConditionsList.innerHTML = "";
  keys.forEach((key) => {
    const label = document.createElement("label");
    label.className = `condition${character.conditions[key] ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${character.conditions[key] ? "checked" : ""}><span>${esc(displayNameFromKey(key))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.keyConditionsList.appendChild(label);
  });
}

function renderPlaySummary() {
  renderCombatWeapons();
  renderCombatStatusResources();
  renderCombatPowerPoints();

  const activeResources = character.resources.filter(
    (resource) =>
      resource.id !== "power-points" &&
      (resource.max > 0 || resource.current > 0),
  );
  els.playResourcesCard.classList.toggle("hidden", !activeResources.length);
  renderResourceControls(els.playResourcesList, activeResources);

  const showPowers = character.powers.length > 0;
  els.playActivePowersCard.classList.toggle("hidden", !showPowers);
  if (showPowers) renderCombatPowers();

  renderCombatHuckster();
  renderCombatConsumables();
  renderCombatReminders();
}

function renderResourceControls(container, resources) {
  container.innerHTML = "";
  if (!resources.length) {
    container.innerHTML = emptyState("No active combat resources.");
    return;
  }

  resources.forEach((resource) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      resource.current = Math.max(0, resource.current - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      resource.current = resource.max
        ? Math.min(resource.max, resource.current + 1)
        : resource.current + 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      resource.current = resource.max;
      render();
      save();
    };
    container.appendChild(row);
  });
}

function recoverResource(resource, amount) {
  resource.current = resource.max
    ? Math.min(resource.max, resource.current + amount)
    : resource.current + amount;
  render();
  save();
}

function appendPowerPointControls(
  container,
  resource,
  { showName = false } = {},
) {
  const row = document.createElement("div");
  row.className = "row";
  const max = resource.max || "—";
  const value = `${resource.current} / ${max}`;
  row.innerHTML = `<div><strong>${showName ? esc(resource.name) : value}</strong>${showName ? `<span>${value}</span>` : "<span>Current / Max</span>"}${resource.source ? `<span>${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls resource-recovery-actions"><button data-recover="5" type="button">Rest +5</button><button data-recover="10" type="button">Rest +10</button><button data-recover="15" type="button">Rest +15</button><button data-recover="max" type="button">Max</button></div>`;
  row.querySelectorAll("[data-recover]").forEach((button) => {
    const atMax = Boolean(resource.max && resource.current >= resource.max);
    button.disabled = atMax || (button.dataset.recover === "max" && !resource.max);
    button.onclick = () => {
      if (button.dataset.recover === "max") {
        if (resource.max) {
          resource.current = resource.max;
          render();
          save();
        }
        return;
      }
      recoverResource(resource, Number(button.dataset.recover));
    };
  });
  container.appendChild(row);
}

function renderCombatStatusResources() {
  const statuses = [
    {
      name: "Bleeding Out",
      text: character.conditions.bleedingOut ? "Active" : "Clear",
      active: character.conditions.bleedingOut,
    },
  ].filter((status) => status.active);

  els.combatStatusResources.classList.toggle("hidden", !statuses.length);
  els.combatStatusResources.innerHTML = [
    ...statuses.map(
      (status) =>
        `<div class="row"><div><strong>${esc(status.name)}</strong><span>${esc(status.text)}</span></div></div>`,
    ),
  ].join("");
}

function renderCombatPowerPoints() {
  const resources = character.resources.filter(
    (resource) => resource.id === "power-points",
  );
  els.playPowerPointsCard.classList.toggle("hidden", !resources.length);
  if (!resources.length) {
    els.playPowerPointsList.innerHTML = "";
    return;
  }
  els.playPowerPointsList.innerHTML = "";
  resources.forEach((resource) =>
    appendPowerPointControls(els.playPowerPointsList, resource),
  );
}

function renderCombatWeapons() {
  els.playWeaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.playWeaponList.innerHTML = emptyState("No weapons tracked.");
    return;
  }

  [...character.weapons]
    .sort(
      (left, right) =>
        Number(isTrackedWeapon(right)) - Number(isTrackedWeapon(left)),
    )
    .forEach((weapon) => {
      const reserve = weapon.ammoType ? character.ammo[weapon.ammoType] : null;
      const tracked = isTrackedWeapon(weapon);
      const article = document.createElement("article");
      article.className = "weapon-card";
      article.innerHTML = `<div class="topline"><div><h3>${esc(weapon.name)}</h3><p class="meta">Damage ${esc(weapon.damage || "—")} • Range ${esc(weapon.range || "—")} • AP ${esc(weapon.ap ?? "—")} • ROF ${esc(weapon.rof ?? "—")}</p></div><span class="loaded">${tracked ? `${weapon.shotsLoaded} / ${weapon.shotsMax}` : "No ammo"}</span></div>${tracked ? `<p class="muted">${esc(reserve?.label || "Ammo")} reserve: ${reserve?.count || 0}</p>` : '<p class="muted">Melee / no ammo tracking.</p>'}${weapon.notes ? `<p class="muted">${esc(weapon.notes)}</p>` : ""}${tracked ? '<div class="weapon-actions"><button class="fire-btn" type="button">Fire</button><button class="load-btn" type="button">Load +1</button><button class="reload-btn" type="button">Fill</button><button class="unload-btn" type="button">Unload</button></div>' : ""}`;

      if (tracked) {
        const [fire, load, reload, unload] = article.querySelectorAll("button");
        const reserveCount = reserve?.count || 0;
        fire.disabled = weapon.shotsLoaded <= 0;
        load.disabled =
          weapon.shotsLoaded >= weapon.shotsMax || reserveCount <= 0;
        reload.disabled = load.disabled;
        unload.disabled = weapon.shotsLoaded <= 0;
        fire.onclick = () => {
          weapon.shotsLoaded -= 1;
          render();
          save();
        };
        load.onclick = () => {
          weapon.shotsLoaded += 1;
          reserve.count -= 1;
          render();
          save();
        };
        reload.onclick = () => {
          const amount = Math.min(
            weapon.shotsMax - weapon.shotsLoaded,
            reserve.count,
          );
          weapon.shotsLoaded += amount;
          reserve.count -= amount;
          render();
          save();
        };
        unload.onclick = () => {
          reserve.count += weapon.shotsLoaded;
          weapon.shotsLoaded = 0;
          render();
          save();
        };
      }

      els.playWeaponList.appendChild(article);
    });
}

function powerCost(power) {
  const match = String(power.baseCost || "").match(/\d+/);
  const cost = match ? Math.floor(Number(match[0]) || 0) : 0;
  return Math.max(0, cost);
}

function parsePowerModifier(modifier) {
  if (typeof modifier === "string") {
    const match = modifier.match(/^\s*(.+?)\s*\(\s*([^)]+)\s*\)\s*:?\s*(.*)$/);
    const costs = match
      ? (match[2].match(/[+-]?\d+/g) || []).map((cost) =>
          Math.max(0, Math.floor(Number(cost) || 0)),
        )
      : [];
    return {
      name: match ? match[1].trim() : modifier.trim(),
      cost: costs[0] || 0,
      costs,
      description: match ? match[3].trim() : "",
    };
  }
  const cost = Math.max(
    0,
    Math.floor(Number(modifier.cost ?? modifier.powerPoints ?? 0) || 0),
  );
  return {
    name: modifier.name || "Modifier",
    cost,
    costs: [cost],
    description: modifier.description || modifier.notes || "",
  };
}

function comparePowerCosts(left, right) {
  return (
    left.cost - right.cost ||
    Number(!left.base) - Number(!right.base) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function comparePowers(left, right) {
  return (
    powerCost(left) - powerCost(right) ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
}

function powerCastOptions(power) {
  const baseCost = powerCost(power);
  const baseName = power.modifiers?.length ? "Basic" : "Cast";
  const options = [
    {
      name: baseName,
      cost: baseCost,
      description: power.notes || "",
      base: true,
    },
  ];
  (power.modifiers || []).forEach((modifier) => {
    const parsed = parsePowerModifier(modifier);
    const costs = parsed.costs.length ? parsed.costs : [parsed.cost];
    costs.forEach((cost) => {
      options.push({
        ...parsed,
        name: parsed.name,
        cost: baseCost + cost,
        modifierCost: cost,
      });
    });
  });
  return options.sort(comparePowerCosts);
}

function powerOptionButtonMarkup(option, index, powerPoints) {
  return `<button class="cast-option-btn" type="button" data-power-option="${index}">${esc(option.name)}${powerPoints || option.cost ? ` (${option.cost} PP)` : ""}</button>`;
}

function powerDescriptionMarkup(power, castOptions, powerPoints) {
  const parts = [];
  if (power.notes) {
    parts.push(`<p>${esc(power.notes)}</p>`);
  } else {
    parts.push(
      '<p class="muted">No description imported yet. Add what this power does in the Arcane tab notes.</p>',
    );
  }
  if (power.trapping) {
    parts.push(
      `<p class="muted"><strong>Trapping:</strong> ${esc(power.trapping)}</p>`,
    );
  }
  const baseOption = castOptions[0];
  const modifierOptions = castOptions.slice(1);
  if (baseOption) {
    parts.push(
      `<div class="power-primary-option${modifierOptions.length ? " has-following-options" : ""}">${powerOptionButtonMarkup(baseOption, 0, powerPoints)}</div>`,
    );
  }
  if (modifierOptions.length) {
    const modifiers = modifierOptions
      .map(
        (option, index) =>
          `<li>${powerOptionButtonMarkup(option, index + 1, powerPoints)}${option.description ? `<span>${esc(option.description)}</span>` : ""}</li>`,
      )
      .join("");
    parts.push(`<ul class="power-modifiers">${modifiers}</ul>`);
  }
  return `<div class="power-description">${parts.join("")}</div>`;
}

function renderPowerCard(power, { includeDelete = false } = {}) {
  const powerPoints = powerPointResource();
  const castOptions = powerCastOptions(power);
  const article = document.createElement("article");
  article.className = `weapon-card power-card${power.active ? " active" : ""}`;
  const rankMeta = power.rank ? ` | Rank ${esc(power.rank)}` : "";
  const deleteButtonMarkup = includeDelete
    ? '<button class="delete-small delete-power-btn" type="button">×</button>'
    : "";
  const managementButtonsMarkup = deleteButtonMarkup;
  const managementMarkup = deleteButtonMarkup
    ? `<div class="weapon-actions power-actions">${managementButtonsMarkup}</div>`
    : "";
  article.innerHTML = `<div class="topline"><div><h3>${esc(power.name || "Unnamed power")}</h3><p class="meta">Cost ${esc(power.baseCost || "—")} | Duration ${esc(power.duration || "—")}${rankMeta}</p></div><span class="loaded">${power.active ? "Active" : "Ready"}</span></div>${powerDescriptionMarkup(power, castOptions, powerPoints)}${managementMarkup}`;

  const optionButtons = article.querySelectorAll(".cast-option-btn");
  const deleteButton = article.querySelector(".delete-power-btn");

  optionButtons.forEach((button) => {
    const option = castOptions[Number(button.dataset.powerOption)];
    button.disabled = Boolean(powerPoints && option.cost > powerPoints.current);
    button.title =
      powerPoints && option.cost > powerPoints.current
        ? "Not enough Power Points"
        : option.description || `Spend ${option.cost} Power Points`;
    button.onclick = () => {
      if (powerPoints && option.cost) {
        powerPoints.current = Math.max(0, powerPoints.current - option.cost);
      }
      render();
      save();
    };
  });

  if (deleteButton) {
    deleteButton.onclick = () => {
      character.powers = character.powers.filter(
        (item) => item.id !== power.id,
      );
      render();
      save();
    };
  }

  return article;
}

function renderCombatPowers() {
  els.playActivePowersList.innerHTML = "";
  if (!character.powers.length) {
    els.playActivePowersList.innerHTML = emptyState("No known powers.");
    return;
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.playActivePowersList.appendChild(renderPowerCard(power));
  });
}

function renderCombatHuckster() {
  const deal = character.hucksterDeal;
  els.combatHucksterCard.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const fields = [
    ["selectedPower", "Selected power", "text"],
    ["requiredPowerPoints", "Required PP", "number"],
    ["anteBennySpent", "Ante Benny spent", "checkbox"],
    ["gamblingRollResult", "Gambling result", "text"],
    ["cardsDrawn", "Cards drawn", "number"],
    ["pokerHand", "Poker hand", "text"],
    ["temporaryPowerPoints", "Temporary PP", "number"],
    ["shortagePenalty", "Shortage penalty", "number"],
    ["leftoverPowerPoints", "Leftover PP", "number"],
    ["backfireTriggered", "Backfire", "checkbox"],
    ["notes", "Notes", "text"],
  ];
  els.combatHucksterHelper.innerHTML = fields
    .map(([field, label, type]) => {
      if (type === "checkbox") {
        return `<label class="checkline"><input type="checkbox" data-combat-huckster="${field}" ${deal[field] ? "checked" : ""}> ${label}</label>`;
      }
      return `<label>${label}<input data-combat-huckster="${field}" type="${type}" min="0" value="${esc(deal[field] ?? "")}"></label>`;
    })
    .join("");
  els.combatHucksterHelper
    .querySelectorAll("[data-combat-huckster]")
    .forEach((input) => {
      input.oninput = input.onchange = () => {
        const field = input.dataset.combatHuckster;
        updateHucksterDealField(
          field,
          input.type === "checkbox"
            ? input.checked
            : input.type === "number"
              ? Math.max(0, Math.floor(Number(input.value) || 0))
              : input.value,
        );
      };
    });
}

function isCombatConsumable(item) {
  if (/backpack|pack|bag|sack|pouch|container/i.test(item.name || ""))
    return false;
  if (item.combatUsable || item.pinToCombat) return true;
  return /healing|unguent|elixir|restoration|dynamite|explosive|grenade|bomb|oil|tonic|potion/i.test(
    `${item.name || ""} ${item.unit || ""}`,
  );
}

function renderCombatConsumables() {
  const consumables = character.consumables
    .filter((item) => item.count > 0 && isCombatConsumable(item))
    .map((item) => ({ item, source: character.consumables }));
  const inventory = character.inventory
    .filter((item) => item.count > 0 && isCombatConsumable(item))
    .map((item) => ({ item, source: character.inventory }));
  const entries = [...consumables, ...inventory];

  els.combatConsumablesCard.classList.toggle("hidden", !entries.length);
  els.combatConsumablesList.innerHTML = "";
  if (!entries.length) return;

  entries.forEach(({ item }) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls"><button>Use</button></div>`;
    row.querySelector("button").onclick = () => {
      item.count = Math.max(0, item.count - 1);
      render();
      save();
    };
    els.combatConsumablesList.appendChild(row);
  });
}

function renderCombatReminders() {
  const reminders = [];
  character.powers
    .filter((power) => power.active && power.notes)
    .forEach((power) =>
      reminders.push({
        type: "Active Power",
        name: power.name || "Power",
        text: power.notes,
      }),
    );
  Object.entries(character.conditions)
    .filter(([, active]) => active)
    .forEach(([key]) =>
      reminders.push({
        type: "Condition",
        name: displayNameFromKey(key),
        text: "Remember current condition effects.",
      }),
    );
  character.reminders
    .filter((reminder) =>
      /arcane|backlash|malfunction|huckster|backfire|combat|weapon|power/i.test(
        `${reminder.type} ${reminder.name} ${reminder.text}`,
      ),
    )
    .forEach((reminder) => reminders.push(reminder));
  if (character.hucksterDeal?.backfireTriggered) {
    reminders.push({
      type: "Huckster",
      name: "Backfire",
      text: "Backfire is marked on the current deal.",
    });
  }

  els.combatRemindersCard.classList.toggle("hidden", !reminders.length);
  els.combatRemindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : "";
}

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

function renderArmor() {
  els.armorLocationList.innerHTML = ARMOR_LOCATIONS.filter(
    (location) => location.id !== "shield",
  )
    .map((location) => {
      const equipped = character.armorInventory.filter(
        (armor) =>
          armor.equipped && armor.count > 0 && armor.location === location.id,
      );
      return `<div class="loc-card"><strong>${esc(location.label)} (${armorValue(location.id)})</strong><span>${equipped.map((armor) => `${esc(armor.name)} (+${armor.armor})`).join("<br>") || "—"}</span></div>`;
    })
    .join("");

  els.armorInventoryList.innerHTML = "";
  if (!character.armorInventory.length) {
    els.armorInventoryList.innerHTML = emptyState("No armor tracked yet.");
    return;
  }

  character.armorInventory.forEach((armor) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(armor.name)}</strong><span>+${armor.armor} • ${armorLabel(armor.location)} • Min Str ${esc(armor.minStr)} • Weight ${wt(armor.weight)} • Cost ${armor.costCents !== undefined ? money(armor.costCents) : "—"} each</span>${armor.note ? `<span>${esc(armor.note)}</span>` : ""}</div><div class="controls"><button>${armor.equipped ? "Equipped" : "Equip"}</button><button>&minus;</button><strong>${armor.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      armor.equipped = !armor.equipped;
      render();
      save();
    };
    buttons[1].onclick = () => {
      armor.count = Math.max(0, armor.count - 1);
      if (!armor.count) armor.equipped = false;
      render();
      save();
    };
    buttons[2].onclick = () => {
      armor.count += 1;
      render();
      save();
    };
    buttons[3].onclick = () => {
      character.armorInventory = character.armorInventory.filter(
        (item) => item.id !== armor.id,
      );
      render();
      save();
    };
    els.armorInventoryList.appendChild(row);
  });
}

function renderWeapons() {
  els.weaponList.innerHTML = "";
  if (!character.weapons.length) {
    els.weaponList.innerHTML = emptyState("No weapons tracked yet.");
    return;
  }

  character.weapons.forEach((weapon) => {
    const fragment = els.weaponTemplate.content.cloneNode(true);
    const query = (selector) => fragment.querySelector(selector);
    query(".weapon-name").textContent = weapon.name;
    query(".weapon-details").textContent =
      `Damage ${weapon.damage || "—"} • Range ${weapon.range || "—"} • AP ${weapon.ap ?? "—"} • ROF ${weapon.rof ?? "—"} • Weight ${wt(weapon.weight)} • Min Str ${weapon.minStr || "—"} • Cost ${weapon.costCents !== undefined ? money(weapon.costCents) : "—"}`;

    const fire = query(".fire-btn");
    const load = query(".load-btn");
    const reload = query(".reload-btn");
    const unload = query(".unload-btn");
    const remove = query(".remove-btn");

    if (isTrackedWeapon(weapon)) {
      const reserve = character.ammo[weapon.ammoType]?.count || 0;
      query(".loaded").textContent =
        `Loaded ${weapon.shotsLoaded} / ${weapon.shotsMax}`;
      query(".weapon-notes").textContent =
        `${character.ammo[weapon.ammoType]?.label || "Ammo"} reserve: ${reserve}.`;
      fire.disabled = weapon.shotsLoaded <= 0;
      load.disabled = weapon.shotsLoaded >= weapon.shotsMax || reserve <= 0;
      reload.disabled = load.disabled;
      unload.disabled = weapon.shotsLoaded <= 0;
      fire.onclick = () => {
        weapon.shotsLoaded -= 1;
        render();
        save();
      };
      load.onclick = () => {
        weapon.shotsLoaded += 1;
        character.ammo[weapon.ammoType].count -= 1;
        render();
        save();
      };
      reload.onclick = () => {
        const amount = Math.min(
          weapon.shotsMax - weapon.shotsLoaded,
          character.ammo[weapon.ammoType].count,
        );
        weapon.shotsLoaded += amount;
        character.ammo[weapon.ammoType].count -= amount;
        render();
        save();
      };
      unload.onclick = () => {
        character.ammo[weapon.ammoType].count += weapon.shotsLoaded;
        weapon.shotsLoaded = 0;
        render();
        save();
      };
    } else {
      query(".loaded").textContent = "No ammo";
      query(".weapon-notes").textContent =
        weapon.notes || "No ammunition tracking.";
      [fire, load, reload, unload].forEach(
        (button) => (button.disabled = true),
      );
    }

    remove.onclick = () => {
      if (isTrackedWeapon(weapon) && weapon.shotsLoaded > 0)
        character.ammo[weapon.ammoType].count += weapon.shotsLoaded;
      character.weapons = character.weapons.filter(
        (item) => item.id !== weapon.id,
      );
      render();
      save();
    };
    els.weaponList.appendChild(fragment);
  });
}

function renderAmmo() {
  els.ammoReserves.innerHTML = "";
  Object.entries(character.ammo).forEach(([key, ammo]) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${ammo.count}</strong><span>${esc(ammo.label)}</span></div><div class="controls"><button>&minus;</button><button>+</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      ammo.count = Math.max(0, ammo.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      ammo.count += 1;
      render();
      save();
    };
    els.ammoReserves.appendChild(row);
  });
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
    els.weaponAmmoTypeSelect.value,
  );
}

function renderResources() {
  els.resourcesList.innerHTML = "";
  if (!character.resources.length) {
    els.resourcesList.innerHTML = emptyState("No special resources.");
    return;
  }

  character.resources.forEach((resource) => {
    if (resource.id === "power-points") {
      appendPowerPointControls(els.resourcesList, resource, { showName: true });
      return;
    }

    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(resource.name)}</strong><span>${resource.current} / ${resource.max || "—"}</span>${resource.source ? `<span>Source: ${esc(resource.source)}</span>` : ""}${resource.note ? `<span>${esc(resource.note)}</span>` : ""}</div><div class="controls"><button>&minus;</button><button>+</button><button>Reset</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      resource.current = Math.max(0, resource.current - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      resource.current = resource.max
        ? Math.min(resource.max, resource.current + 1)
        : resource.current + 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      resource.current = resource.max;
      render();
      save();
    };
    els.resourcesList.appendChild(row);
  });
}

function powerPointResource() {
  return character.resources.find((resource) => resource.id === "power-points");
}

function renderPowers() {
  const background = character.arcaneBackground;
  const powerPoints = powerPointResource();
  els.arcaneSummary.textContent = background
    ? `${background.name} • ${background.arcaneSkill}`
    : powerPoints
      ? "Manual Power Points"
      : "No Arcane Background";
  els.powersList.innerHTML = "";
  if (!character.powers.length) {
    els.powersList.innerHTML = emptyState("No powers tracked yet.");
    return;
  }

  [...character.powers].sort(comparePowers).forEach((power) => {
    els.powersList.appendChild(renderPowerCard(power, { includeDelete: true }));
  });
}

function renderHucksterDeal() {
  const deal = character.hucksterDeal;
  els.hucksterDealPanel.classList.toggle("hidden", !deal?.enabled);
  if (!deal?.enabled) return;

  const values = {
    hucksterSelectedPower: deal.selectedPower,
    hucksterRequiredPowerPoints: deal.requiredPowerPoints,
    hucksterGamblingRollResult: deal.gamblingRollResult,
    hucksterCardsDrawn: deal.cardsDrawn,
    hucksterPokerHand: deal.pokerHand,
    hucksterTemporaryPowerPoints: deal.temporaryPowerPoints,
    hucksterShortagePenalty: deal.shortagePenalty,
    hucksterLeftoverPowerPoints: deal.leftoverPowerPoints,
    hucksterNotes: deal.notes,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (document.activeElement !== els[key]) els[key].value = value ?? "";
  });
  els.hucksterAnteBennySpent.checked = Boolean(deal.anteBennySpent);
  els.hucksterUsedJoker.checked = Boolean(deal.usedJoker);
  els.hucksterBackfireTriggered.checked = Boolean(deal.backfireTriggered);
}

function renderConditions() {
  if (!els.conditionsList) return;
  els.conditionsList.innerHTML = "";
  Object.entries(character.conditions).forEach(([key, value]) => {
    const label = document.createElement("label");
    label.className = `condition${value ? " active" : ""}`;
    label.innerHTML = `<input type="checkbox" ${value ? "checked" : ""}><span>${esc(key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()))}</span>`;
    label.querySelector("input").onchange = (event) => {
      character.conditions[key] = event.target.checked;
      render();
      save();
    };
    els.conditionsList.appendChild(label);
  });
}

function counterList(container, items, unitFn, emptyText) {
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = emptyState(emptyText);
    return;
  }
  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong>${unitFn(item)}</div><div class="controls"><button>&minus;</button><strong>${item.count}</strong><button>+</button><button class="delete-small">×</button></div>`;
    const buttons = row.querySelectorAll("button");
    buttons[0].onclick = () => {
      item.count = Math.max(0, item.count - 1);
      render();
      save();
    };
    buttons[1].onclick = () => {
      item.count += 1;
      render();
      save();
    };
    buttons[2].onclick = () => {
      items.splice(items.indexOf(item), 1);
      render();
      save();
    };
    container.appendChild(row);
  });
}

function renderConsumables() {
  counterList(
    els.consumablesList,
    character.consumables,
    (item) => `<span>${esc(item.unit)}</span>`,
    "No consumables tracked.",
  );
}

function renderInventory() {
  counterList(
    els.inventoryList,
    character.inventory,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Weight ${wt(item.weight)} each • Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No inventory tracked yet.",
  );
}

function renderVehicles() {
  counterList(
    els.vehicleList,
    character.vehicles,
    (item) =>
      `<span>${item.book ? `Book ${esc(item.book)} • ` : ""}Cost ${item.costCents !== undefined ? money(item.costCents) : "—"} each</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}`,
    "No vehicles tracked yet.",
  );
}

function renderReminders() {
  const reminders = character.reminders.filter(
    (reminder) => reminder.type !== "Import Warning",
  );
  els.remindersList.innerHTML = reminders.length
    ? reminders.map(reminderMarkup).join("")
    : emptyState("No reminders recorded.");
}

function addInventory() {
  const catalogItem = chosen(GEAR_CATALOG, els.gearSelect.value);
  const name = els.inventoryNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const id = catalogItem?.id || slugify(name);
  const existing = character.inventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.inventory.push({
      id,
      name,
      count,
      note: els.inventoryNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book,
    });
  els.gearSelect.value = "";
  els.inventoryNameInput.value = "";
  els.inventoryCountInput.value = "";
  els.inventoryNoteInput.value = "";
  updatePreviews();
  render();
  save();
}

function addVehicle() {
  const catalogItem = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  const name = els.vehicleNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const count = Math.max(1, Math.floor(Number(els.vehicleQtyInput.value) || 1));
  const id = catalogItem?.id || slugify(name);
  const existing = character.vehicles.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) existing.count += count;
  else
    character.vehicles.push({
      id,
      name,
      count,
      note: els.vehicleNoteInput.value.trim(),
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
    });
  els.vehicleCatalogSelect.value = "";
  els.vehicleNameInput.value = "";
  els.vehicleQtyInput.value = "";
  els.vehicleNoteInput.value = "";
  updatePreviews();
  render();
  save();
}

function addAmmo() {
  const catalogItem = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  const label = els.ammoLabelInput.value.trim() || catalogItem?.name;
  if (!label) return;
  const map = {
    "pistol-ammunition-large-40-50-caliber": "pistolLarge",
    "rifle-ammunition-small-38-44-caliber": "rifleSmall",
  };
  const key = map[catalogItem?.id] || catalogItem?.id || slugify(label);
  const count = Math.max(1, Math.floor(Number(els.ammoCountInput.value) || 1));
  if (character.ammo[key]) character.ammo[key].count += count;
  else
    character.ammo[key] = {
      label: els.ammoNoteInput.value.trim()
        ? `${label} (${els.ammoNoteInput.value.trim()})`
        : label,
      count,
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
    };
  els.ammoGearSelect.value = "";
  els.ammoLabelInput.value = "";
  els.ammoCountInput.value = "";
  els.ammoNoteInput.value = "";
  updatePreviews();
  render();
  save();
}

function addArmor() {
  const catalogItem = chosen(ARMOR_CATALOG, els.armorCatalogSelect.value);
  const name = els.armorNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const id = catalogItem?.id || slugify(name);
  const existing = character.armorInventory.find(
    (item) => item.id === id || item.name.toLowerCase() === name.toLowerCase(),
  );
  const count = Math.max(1, Math.floor(Number(els.armorCountInput.value) || 1));
  const armor = Math.max(
    0,
    Math.floor(Number(els.armorValueInput.value || catalogItem?.armor || 1)),
  );
  if (existing) {
    existing.count += count;
    existing.armor = armor;
    existing.location = els.armorLocationSelect.value;
    existing.equipped = true;
  } else {
    character.armorInventory.push({
      id,
      name,
      count,
      armor,
      location:
        els.armorLocationSelect.value || catalogItem?.location || "torso",
      equipped: true,
      weight: catalogItem?.weight,
      minStr: catalogItem?.minStr,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book || "Deadlands",
      note: "Purchased armor.",
    });
  }
  els.armorCatalogSelect.value = "";
  els.armorNameInput.value = "";
  els.armorCountInput.value = "";
  els.armorValueInput.value = "";
  updatePreviews();
  render();
  save();
}

function addWeapon() {
  const catalogItem = chosen(WEAPON_CATALOG, els.weaponCatalogSelect.value);
  const name = els.weaponNameInput.value.trim() || catalogItem?.name;
  if (!name) return;
  const quantity = Math.max(
    1,
    Math.floor(Number(els.weaponQtyInput.value) || 1),
  );
  const capacity = Math.max(
    0,
    Math.floor(Number(els.weaponCapacityInput.value) || 0),
  );
  const ammoType = capacity > 0 ? els.weaponAmmoTypeSelect.value : "";
  for (let index = 0; index < quantity; index += 1) {
    character.weapons.push({
      id: `${catalogItem?.id || slugify(name)}-${Date.now()}-${index}`,
      catalogId: catalogItem?.id,
      name,
      damage: els.weaponDamageInput.value.trim() || catalogItem?.damage || "—",
      range: els.weaponRangeInput.value.trim() || catalogItem?.range || "—",
      ap:
        els.weaponApInput.value === ""
          ? catalogItem?.ap || "—"
          : Number(els.weaponApInput.value),
      rof: els.weaponRofInput.value.trim() || catalogItem?.rof || "—",
      shotsMax: capacity && ammoType ? capacity : null,
      shotsLoaded: capacity && ammoType ? capacity : null,
      ammoType: capacity && ammoType ? ammoType : null,
      notes: catalogItem?.notes || "",
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      minStr: catalogItem?.minStr,
      book: catalogItem?.book || "Deadlands",
    });
  }
  els.weaponCatalogSelect.value = "";
  els.weaponNameInput.value = "";
  els.weaponQtyInput.value = "";
  els.weaponDamageInput.value = "";
  els.weaponRangeInput.value = "";
  els.weaponApInput.value = "";
  els.weaponRofInput.value = "";
  els.weaponCapacityInput.value = "";
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  updatePreviews();
  render();
  save();
}

function addPower() {
  const name = els.powerNameInput.value.trim();
  if (!name) return;
  const existing = character.powers.find(
    (power) => power.name.toLowerCase() === name.toLowerCase(),
  );
  const data = {
    name,
    baseCost: els.powerCostInput.value.trim(),
    duration: els.powerDurationInput.value.trim(),
    trapping: els.powerTrappingInput.value.trim(),
    notes: els.powerNotesInput.value.trim(),
    source: character.arcaneBackground?.edgeName || "Manual power",
  };
  if (existing) Object.assign(existing, data);
  else
    character.powers.push(
      normalizePowerRecord(
        {
          id: `${slugify(name)}-${Date.now()}`,
          rank: "Novice",
          active: false,
          modifiers: [],
          ...data,
        },
        character.powers.length,
        data.source,
      ),
    );

  els.powerNameInput.value = "";
  els.powerCostInput.value = "";
  els.powerDurationInput.value = "";
  els.powerTrappingInput.value = "";
  els.powerNotesInput.value = "";
  render();
  save();
}

function addManualPowerPoints() {
  if (powerPointResource()) return;
  const max = Math.max(
    0,
    Math.floor(Number(prompt("Maximum Power Points?", "15")) || 0),
  );
  character.resources.push(
    makePowerPointResource(null, {
      current: max,
      max,
      source: "Manual setup",
      note: "House rule, custom character, or manual post-import setup.",
    }),
  );
  render();
  save();
}

function updateHucksterDealField(field, value) {
  if (!character.hucksterDeal) character.hucksterDeal = makeHucksterDeal();
  character.hucksterDeal[field] = value;
  character.hucksterDeal = normalizeHucksterDeal(character.hucksterDeal);
  save();
}

function action(type) {
  switch (type) {
    case "incWounds":
      character.damage.wounds = clamp(
        character.damage.wounds + 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "decWounds":
      character.damage.wounds = clamp(
        character.damage.wounds - 1,
        0,
        character.damage.maxWounds,
      );
      break;
    case "incFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue + 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "decFatigue":
      character.damage.fatigue = clamp(
        character.damage.fatigue - 1,
        0,
        character.damage.maxFatigue,
      );
      break;
    case "incBennies":
      character.bennies.current += 1;
      break;
    case "decBennies":
      character.bennies.current = Math.max(0, character.bennies.current - 1);
      break;
    case "incConviction":
      character.conviction += 1;
      break;
    case "decConviction":
      character.conviction = Math.max(0, character.conviction - 1);
      break;
    default:
      return;
  }
  render();
  save();
}

function exportJson(name, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("click", (event) => {
  if (event.target?.dataset?.action) action(event.target.dataset.action);
  if (event.target?.dataset?.toggleForm) {
    const form = document.getElementById(event.target.dataset.toggleForm);
    form?.classList.toggle("hidden");
  }
});

els.armorSelect.onchange = () => {
  character.selectedArmorLocation = els.armorSelect.value;
  render();
  save();
};
els.addMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents += centsValue;
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.spendMoneyBtn.onclick = () => {
  const centsValue = Math.round((Number(els.moneyInput.value) || 0) * 100);
  if (centsValue > 0) {
    character.moneyCents = Math.max(0, character.moneyCents - centsValue);
    els.moneyInput.value = "";
    render();
    save();
  }
};
els.addInventoryBtn.onclick = addInventory;
els.addVehicleBtn.onclick = addVehicle;
els.addAmmoBtn.onclick = addAmmo;
els.addArmorBtn.onclick = addArmor;
els.addWeaponBtn.onclick = addWeapon;
els.addPowerBtn.onclick = addPower;
els.addManualPowerPointsBtn.onclick = addManualPowerPoints;
[
  els.gearSelect,
  els.ammoGearSelect,
  els.armorCatalogSelect,
  els.weaponCatalogSelect,
  els.vehicleCatalogSelect,
].forEach((select) => {
  select.onchange = updatePreviews;
});
els.notesArea.oninput = () => {
  character.notes = els.notesArea.value;
  save();
};
els.clearTempConditionsBtn.onclick = () => {
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
[
  ["hucksterSelectedPower", "selectedPower", "text"],
  ["hucksterRequiredPowerPoints", "requiredPowerPoints", "number"],
  ["hucksterGamblingRollResult", "gamblingRollResult", "text"],
  ["hucksterCardsDrawn", "cardsDrawn", "number"],
  ["hucksterPokerHand", "pokerHand", "text"],
  ["hucksterTemporaryPowerPoints", "temporaryPowerPoints", "number"],
  ["hucksterShortagePenalty", "shortagePenalty", "number"],
  ["hucksterLeftoverPowerPoints", "leftoverPowerPoints", "number"],
  ["hucksterNotes", "notes", "text"],
].forEach(([elementKey, field, type]) => {
  els[elementKey].oninput = () => {
    const raw = els[elementKey].value;
    updateHucksterDealField(
      field,
      type === "number" ? Math.max(0, Math.floor(Number(raw) || 0)) : raw,
    );
  };
});
[
  ["hucksterAnteBennySpent", "anteBennySpent"],
  ["hucksterUsedJoker", "usedJoker"],
  ["hucksterBackfireTriggered", "backfireTriggered"],
].forEach(([elementKey, field]) => {
  els[elementKey].onchange = () => {
    updateHucksterDealField(field, els[elementKey].checked);
  };
});
els.newSessionBtn.onclick = () => {
  character.bennies.current = character.bennies.starting;
  character.conviction = 0;
  character.resources.forEach((resource) => (resource.current = resource.max));
  character.temporaryConditions.forEach(
    (key) => (character.conditions[key] = false),
  );
  render();
  save();
};
els.resetBtn.onclick = () => {
  if (confirm("Reset tracker to defaults?")) {
    character = normalize(clone(defaultCharacter));
    localStorage.removeItem(STORAGE_KEY);
    render();
    save();
  }
};
els.exportBtn.onclick = () => {
  exportJson(
    `${slugify(character.name || "character")}-tracker.json`,
    character,
  );
};
els.importFile.onchange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data.activeCharacter) {
        character = normalize(data.activeCharacter);
        if (data.creationDraft) {
          creationDraft = normalizeDraft(data.creationDraft);
          saveCreationDraft();
        }
      } else if (data.creationDraft) {
        creationDraft = normalizeDraft(data.creationDraft);
        saveCreationDraft();
        setCreatorMode(true);
      } else {
        character = isSavagedUsExport(data)
          ? fromSavagedUs(data)
          : normalize(data);
      }
      render();
      save();
      els.importFile.value = "";
    } catch {
      alert(
        "That file was not valid tracker, full app state, creation draft, or Savaged.us character JSON.",
      );
    }
  };
  reader.readAsText(file);
};
