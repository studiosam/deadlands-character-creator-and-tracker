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
    const entry = { type: "consumable", id: item.id, label: item.name, item };
    row.innerHTML = `<div><strong>${esc(item.name)}</strong><span>${item.count} ${esc(item.unit || "available")} • ${esc(physicalItemLocationLabel(entry))} • Weight ${formatWeightPounds(physicalItemWeight(entry))}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls consumable-use-actions"><input class="tiny" type="number" min="1" step="1" value="1" aria-label="Number of ${esc(item.name)} to adjust"><button type="button">Use</button><button type="button">Add</button>${physicalMoveControl("consumable", item.id)}<button class="delete-small" type="button">×</button></div>`;
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
    bindPhysicalMoveControls(row);
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
  renderInventoryLocationOptions();
  renderStorageLocations();
  els.inventoryList.innerHTML = "";
  if (!character.inventory.length) {
    els.inventoryList.innerHTML = emptyState("No inventory tracked yet.");
    return;
  }
  character.inventory.forEach((item) => renderInventoryItemRow(item));
}

function inventoryMoveOptions(currentItem) {
  const containers = flattenInventory()
    .map(({ item }) => item)
    .filter((item) => item.id !== currentItem.id && item.isContainer);
  const storageOptions = allStorageLocations()
    .map(
      (location) =>
        `<option value="stored:${esc(location.id)}">Store: ${esc(location.name)}</option>`,
    )
    .join("");
  const containerOptions = containers
    .map(
      (container) =>
        `<option value="container:${esc(container.id)}">Inside: ${esc(container.name)}</option>`,
    )
    .join("");
  return [
    '<option value="">Move...</option>',
    '<option value="carried">On Body</option>',
    '<option value="equipped">Equipped / Worn</option>',
    '<option value="dropped">Dropped</option>',
    storageOptions,
    containerOptions,
  ].join("");
}

function physicalMoveOptions(type, id) {
  const containers = flattenInventory()
    .map(({ item }) => item)
    .filter((item) => item.isContainer);
  const storageOptions = allStorageLocations()
    .map(
      (location) =>
        `<option value="stored:${esc(location.id)}">Store: ${esc(location.name)}</option>`,
    )
    .join("");
  const containerOptions = containers
    .map(
      (container) =>
        `<option value="container:${esc(container.id)}">Inside: ${esc(container.name)}</option>`,
    )
    .join("");
  return [
    '<option value="">Move...</option>',
    '<option value="carried">On Body</option>',
    '<option value="equipped">Equipped / Worn</option>',
    '<option value="dropped">Dropped</option>',
    storageOptions,
    containerOptions,
  ].join("");
}

function physicalMoveControl(type, id) {
  return `<select data-physical-move="${esc(type)}:${esc(id)}" aria-label="Move item">${physicalMoveOptions(type, id)}</select>`;
}

function bindPhysicalMoveControls(root = document) {
  root.querySelectorAll("[data-physical-move]").forEach((select) => {
    select.onchange = () => {
      const [type, id] = select.dataset.physicalMove.split(":");
      const [destination, destinationId = ""] = select.value.split(":");
      if (!destination) return;
      movePhysicalItem(type, id, destination, destinationId);
      render();
      save();
    };
  });
}

function renderPhysicalNestedRow(entry, depth = 1, parent = null) {
  const row = document.createElement("div");
  row.className = `row inventory-row physical-row depth-${Math.min(depth, 4)}`;
  const weight = physicalItemWeight(entry);
  const location = parent ? `Inside ${parent.name}` : physicalItemLocationLabel(entry);
  row.innerHTML = `<div class="inventory-item-main" style="--depth:${depth}"><strong>${esc(entry.label)}</strong><span>${esc(location)} • ${esc(entry.type)} • Weight ${formatWeightPounds(weight)}</span></div><div class="controls inventory-actions">${physicalMoveControl(entry.type, entry.id)}</div>`;
  bindPhysicalMoveControls(row);
  els.inventoryList.appendChild(row);
}

function renderInventoryItemRow(item, depth = 0, parent = null) {
  const row = document.createElement("div");
  row.className = `row inventory-row depth-${Math.min(depth, 4)}`;
  const ownWeight = inventoryItemOwnWeight(item);
  const contentsWeight = inventoryItemContentsWeight(item);
  const totalWeight = inventoryItemTotalWeight(item);
  const location = parent
    ? `Inside ${parent.name}`
    : locationLabel(item.location, item.storageId);
  const contentSummary = item.isContainer
    ? ` • Empty ${formatWeightPounds(ownWeight)} • Contents ${formatWeightPounds(contentsWeight)} • Total ${formatWeightPounds(totalWeight)}`
    : ` • Weight ${formatWeightPounds(totalWeight)}`;
  row.innerHTML = `<div class="inventory-item-main" style="--depth:${depth}"><strong>${esc(item.name)}</strong><span>${esc(location)} • Qty ${item.count}${contentSummary}${item.book ? ` • Book ${esc(item.book)}` : ""}${item.costCents !== undefined ? ` • Cost ${money(item.costCents)}` : ""}</span>${item.note ? `<span>${esc(item.note)}</span>` : ""}</div><div class="controls inventory-actions"><button type="button">&minus;</button><strong>${item.count}</strong><button type="button">+</button><select aria-label="Move ${esc(item.name)}">${inventoryMoveOptions(item)}</select>${parent ? '<button type="button">Out</button>' : ""}<button class="delete-small" type="button">×</button></div>`;

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
  const moveSelect = row.querySelector("select");
  moveSelect.onchange = () => {
    const [destination, destinationId = ""] = moveSelect.value.split(":");
    if (!destination) return;
    moveInventoryItem(item.id, destination, destinationId);
    render();
    save();
  };
  let deleteIndex = 2;
  if (parent) {
    buttons[2].onclick = () => {
      moveInventoryItem(item.id, parent.location || "carried", parent.storageId || "");
      render();
      save();
    };
    deleteIndex = 3;
  }
  buttons[deleteIndex].onclick = () => {
    removeInventoryItem(item.id);
    render();
    save();
  };
  els.inventoryList.appendChild(row);
  (item.contents || []).forEach((child) =>
    renderInventoryItemRow(child, depth + 1, item),
  );
  physicalItemsInContainer(item.id).forEach((entry) =>
    renderPhysicalNestedRow(entry, depth + 1, item),
  );
}

function renderInventoryLocationOptions() {
  if (!els.inventoryLocationSelect) return;
  els.inventoryLocationSelect.innerHTML = [
    '<option value="carried">On Body</option>',
    '<option value="equipped">Equipped / Worn</option>',
    '<option value="dropped">Dropped</option>',
    ...allStorageLocations().map(
      (location) =>
        `<option value="stored:${esc(location.id)}">Store: ${esc(location.name)}</option>`,
    ),
    ...flattenInventory()
      .map(({ item }) => item)
      .filter((item) => item.isContainer)
      .map(
        (item) =>
          `<option value="container:${esc(item.id)}">Inside: ${esc(item.name)}</option>`,
      ),
  ].join("");
}

function renderStorageLocations() {
  if (!els.storageLocationList) return;
  const custom = character.storageLocations || [];
  const builtin = BUILT_IN_STORAGE_LOCATIONS.map((location) => ({
    ...location,
    builtin: true,
  }));
  const locations = [...builtin, ...custom.map((location) => ({ ...location }))];
  els.storageLocationList.innerHTML = "";
  locations.forEach((location) => {
    const storedGear = (character.inventory || []).filter(
      (item) => item.location === "stored" && item.storageId === location.id,
    );
    const storedPhysical = physicalItemsInStorage(location.id);
    const weight =
      storedGear.reduce((sum, item) => sum + inventoryItemTotalWeight(item), 0) +
      storedPhysical.reduce((sum, entry) => sum + physicalItemWeight(entry), 0);
    const itemNames = [
      ...storedGear.map((item) => item.name),
      ...storedPhysical.map((entry) => entry.label),
    ];
    const row = document.createElement("div");
    row.className = "row";
    row.innerHTML = `<div><strong>${esc(location.name)}</strong><span>${formatWeightPounds(weight)} stored here</span>${itemNames.length ? `<span>${esc(itemNames.join(", "))}</span>` : ""}</div><div class="controls">${location.builtin ? "" : `<input value="${esc(location.name)}" aria-label="Rename ${esc(location.name)}"><button type="button">Rename</button><button class="delete-small" type="button">×</button>`}</div>`;
    if (!location.builtin) {
      const input = row.querySelector("input");
      const buttons = row.querySelectorAll("button");
      buttons[0].onclick = () => {
        renameStorageLocation(location.id, input.value);
        render();
        save();
      };
      buttons[1].onclick = () => {
        if (!deleteStorageLocation(location.id)) {
          alert("Storage location must be empty before deleting it.");
          return;
        }
        render();
        save();
      };
    }
    els.storageLocationList.appendChild(row);
  });
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
  else {
    const item = normalizeInventoryItem(
      {
      id,
      name,
      count,
      note: els.inventoryNoteInput.value.trim(),
      weight: catalogItem?.weight,
      costCents: catalogItem?.costCents,
      book: catalogItem?.book,
      },
      character.inventory.length,
      new Set(flattenInventory().map(({ item }) => item.id)),
    );
    const [destination, destinationId = ""] = (
      els.inventoryLocationSelect.value || "carried"
    ).split(":");
    if (destination === "container") {
      character.inventory.push(item);
      moveInventoryItem(item.id, "container", destinationId);
    } else {
      setInventoryItemLocation(item, destination || "carried", destinationId);
      character.inventory.push(item);
    }
  }
  els.gearSelect.value = "";
  els.inventoryNameInput.value = "";
  els.inventoryCountInput.value = "";
  els.inventoryUnitsInput.value = "";
  els.inventoryLocationSelect.value = "carried";
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
      itemLocation: "carried",
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
    existing.itemLocation = "equipped";
  } else {
    character.armorInventory.push({
      id,
      name,
      count,
      armor,
      location:
        els.armorLocationSelect.value || catalogItem?.location || "torso",
      equipped: true,
      itemLocation: "equipped",
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
      itemLocation: "carried",
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
