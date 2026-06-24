function ammoOptions(selected = "") {
  const ammoMap = character?.ammo || {};
  const selectedMissing = selected && !ammoMap[selected];
  return [
    `<option value=""${!selected ? " selected" : ""}>No ammunition tracking</option>`,
    selectedMissing
      ? `<option value="${esc(selected)}" selected>${esc(ammoReserveForKey(selected).label)} (no reserve)</option>`
      : "",
    ...Object.entries(ammoMap).map(
      ([key, ammo]) =>
        `<option value="${esc(key)}"${key === selected ? " selected" : ""}>${esc(ammo.label)}</option>`,
    ),
  ].join("");
}

function caliberOptionsForAmmo(item, selected = "") {
  const options = AMMO_CALIBERS_BY_CATALOG_ID[item?.id] || [];
  if (!options.length) {
    return '<option value="">No caliber selection</option>';
  }
  const selectedCaliber =
    normalizeCaliber(selected) ||
    caliberFromText(els.ammoLabelInput.value) ||
    LEGACY_AMMO_KEY_DEFAULTS[item.id]?.caliber ||
    options[0];
  return options
    .map(
      (caliber) =>
        `<option value="${esc(caliber)}"${caliber === selectedCaliber ? " selected" : ""}>${esc(caliber)}</option>`,
    )
    .join("");
}

function entryCatalogOptions(items, placeholder) {
  return [
    `<option value="">${placeholder}</option>`,
    ...items
      .map(
        (item) =>
          `<option value="${esc(item.id)}">${esc(item.name)}${item.rank ? ` • ${esc(item.rank)}` : ""}${item.severity ? ` • ${esc(item.severity)}` : ""}${item.source ? ` • ${esc(item.source)}` : ""}</option>`,
      )
      .join(""),
  ].join("");
}

function catalogs() {
  els.gearSelect.innerHTML = optionList(
    byName(GEAR_CATALOG),
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
  els.edgeCatalogSelect.innerHTML = entryCatalogOptions(
    EDGE_CATALOG,
    "Manual Edge or choose from catalog…",
  );
  els.hindranceCatalogSelect.innerHTML = entryCatalogOptions(
    HINDRANCE_CATALOG,
    "Manual Hindrance or choose from catalog…",
  );
  els.armorLocationSelect.innerHTML = ARMOR_LOCATIONS.map(
    (location) =>
      `<option value="${esc(location.id)}">${esc(location.label)}</option>`,
  ).join("");
  els.weaponAmmoTypeSelect.innerHTML = ammoOptions();
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
}

function chosen(items, id) {
  return items.find((item) => item.id === id);
}

function updatePreviews() {
  if (typeof renderInventoryLocationOptions === "function")
    renderInventoryLocationOptions();
  const gear = chosen(GEAR_CATALOG, els.gearSelect.value);
  const consumableConversion = consumableConversionForGear(gear);
  els.inventoryUnitsField.classList.toggle(
    "hidden",
    !consumableConversion?.unitsLabel,
  );
  if (consumableConversion?.unitsLabel) {
    els.inventoryUnitsLabel.textContent = consumableConversion.unitsLabel;
    els.inventoryUnitsInput.placeholder = String(consumableConversion.multiplier);
  } else {
    els.inventoryUnitsInput.value = "";
  }
  const packageCount = Math.max(
    1,
    Math.floor(Number(els.inventoryCountInput.value) || 1),
  );
  const unitsPerPackage = Math.max(
    1,
    Math.floor(
      Number(els.inventoryUnitsInput.value) ||
        consumableConversion?.multiplier ||
        1,
    ),
  );
  els.gearPreview.textContent = gear
    ? consumableConversion
      ? `${gear.name} • Adds ${packageCount * unitsPerPackage} ${consumableConversion.unit} to Consumables`
      : `${gear.name} • Weight ${wt(gear.weight)} • Cost ${money(gear.costCents)} each`
    : "Choose gear from the catalog or type custom gear.";

  const ammo = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  els.ammoGearPreview.textContent = ammo
    ? `${ammo.name} • Weight ${wt(ammo.weight)} • Cost ${money(ammo.costCents)} each`
    : "Choose ammunition from the catalog or type custom ammo.";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo(
    ammo,
    els.ammoCaliberSelect.value,
  );
  els.ammoCaliberSelect.disabled = !(
    ammo && AMMO_CALIBERS_BY_CATALOG_ID[ammo.id]
  );

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
    els.weaponAmmoTypeSelect.innerHTML = ammoOptions(
      exactAmmoTypeForWeapon(weapon),
    );
  }

  const vehicle = chosen(VEHICLE_CATALOG, els.vehicleCatalogSelect.value);
  els.vehicleCatalogPreview.textContent = vehicle
    ? `${vehicle.name} • Cost ${money(vehicle.costCents)} each`
    : "Choose a vehicle from the catalog or type a custom vehicle.";
}
