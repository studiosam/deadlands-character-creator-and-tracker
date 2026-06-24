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
  els.consumablesList.innerHTML = "";
  const consumables = character.consumables.filter((item) => item.count > 0);
  const hasMatches = consumables.some(
    (item) => item.id === "matches" || /^matches$/i.test(item.name || ""),
  );
  if (!consumables.length) {
    els.consumablesList.innerHTML = emptyState("No consumables tracked.");
  }

  consumables.forEach((item) => {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button><button class="delete-small" type="button">×</button></div>`;
    const input = row.querySelector("input");
    const [use, add, remove] = row.querySelectorAll("button");
    use.onclick = () => {
      const amount = clamp(
        Math.floor(Number(input.value) || 1),
        1,
        item.count,
      );
      consumeItem(character.consumables, item, amount);
      render();
      save();
    };
    add.onclick = () => {
      item.count += Math.max(1, Math.floor(Number(input.value) || 1));
      render();
      save();
    };
    remove.onclick = () => {
      character.consumables.splice(character.consumables.indexOf(item), 1);
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  });

  if (!hasMatches) {
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>Matches</strong><span>0 matches</span></div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of matches to add"><button type="button">Add</button></div>`;
    const input = row.querySelector("input");
    row.querySelector("button").onclick = () => {
      addConsumableCount(
        "matches",
        "Matches",
        "matches",
        Math.max(1, Math.floor(Number(input.value) || 1)),
      );
      render();
      save();
    };
    els.consumablesList.appendChild(row);
  }
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
  const conversion = consumableConversionForGear(catalogItem);
  const unitsPerPackage = conversion?.unitsLabel
    ? Math.max(
        1,
        Math.floor(
          Number(els.inventoryUnitsInput.value) || conversion.multiplier || 1,
        ),
      )
    : conversion?.multiplier;
  const addedConsumable = addConsumableFromGear(
    catalogItem,
    count,
    unitsPerPackage,
  );
  if (addedConsumable) {
    els.gearSelect.value = "";
    els.inventoryNameInput.value = "";
    els.inventoryCountInput.value = "";
    els.inventoryUnitsInput.value = "";
    els.inventoryNoteInput.value = "";
    els.gearAddForm.classList.add("hidden");
    updatePreviews();
    render();
    save();
    return;
  }
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
  els.inventoryUnitsInput.value = "";
  els.inventoryNoteInput.value = "";
  els.gearAddForm.classList.add("hidden");
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
  els.vehicleAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}

function addAmmo() {
  const catalogItem = chosen(GEAR_CATALOG, els.ammoGearSelect.value);
  const label = els.ammoLabelInput.value.trim() || catalogItem?.name;
  if (!label) return;
  const selectedCaliber = normalizeCaliber(els.ammoCaliberSelect.value);
  const exactKey = exactAmmoTypeForCatalogAmmo(catalogItem, selectedCaliber);
  const key = exactKey || catalogItem?.id || slugify(label);
  const count = Math.max(1, Math.floor(Number(els.ammoCountInput.value) || 1));
  if (character.ammo[key]) character.ammo[key].count += count;
  else
    character.ammo[key] = {
      label:
        AMMO_KIND_BY_CATALOG_ID[catalogItem?.id] && selectedCaliber
          ? ammoLabel(AMMO_KIND_BY_CATALOG_ID[catalogItem.id], selectedCaliber)
          : label,
      count,
      caliber: selectedCaliber || undefined,
      kind: AMMO_KIND_BY_CATALOG_ID[catalogItem?.id],
      note: els.ammoNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
    };
  els.ammoGearSelect.value = "";
  els.ammoLabelInput.value = "";
  els.ammoCountInput.value = "";
  els.ammoCaliberSelect.innerHTML = caliberOptionsForAmmo();
  els.ammoNoteInput.value = "";
  els.ammoAddForm.classList.add("hidden");
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
  els.armorAddForm.classList.add("hidden");
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
  const selectedAmmoType = capacity > 0 ? els.weaponAmmoTypeSelect.value : "";
  const ammoType = selectedAmmoType
    ? exactAmmoTypeForWeapon({ ...catalogItem, ammoType: selectedAmmoType })
    : "";
  if (ammoType) ensureAmmoReserve(ammoType);
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
  els.weaponAddForm.classList.add("hidden");
  updatePreviews();
  render();
  save();
}
