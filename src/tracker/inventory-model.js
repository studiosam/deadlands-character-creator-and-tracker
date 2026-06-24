const INVENTORY_LOCATIONS = ["equipped", "carried", "dropped", "stored"];
const BUILT_IN_STORAGE_LOCATIONS = [
  { id: "cart", name: "Cart" },
  { id: "horse", name: "Horse" },
  { id: "home", name: "Home" },
  { id: "camp", name: "Camp" },
];

function locationLabel(location, storageId = "") {
  if (location === "equipped") return "Equipped / Worn";
  if (location === "carried") return "On Body";
  if (location === "dropped") return "Dropped";
  if (location === "stored") {
    return storageLocationName(storageId) || "Storage";
  }
  return "Inside Container";
}

function allStorageLocations() {
  const custom = Array.isArray(character?.storageLocations)
    ? character.storageLocations
    : [];
  const byId = new Map();
  [...BUILT_IN_STORAGE_LOCATIONS, ...custom].forEach((location) => {
    if (!location?.id || !location?.name) return;
    byId.set(location.id, { id: location.id, name: location.name });
  });
  return [...byId.values()];
}

function storageLocationName(id) {
  return allStorageLocations().find((location) => location.id === id)?.name || "";
}

function normalizeInventoryLocation(value) {
  return INVENTORY_LOCATIONS.includes(value) ? value : "carried";
}

function knownEmptyContainerWeight(item) {
  const name = normalizeRuleName(item?.name);
  const catalog = GEAR_CATALOG.find(
    (gear) =>
      normalizeRuleName(gear.name) === name ||
      (name.includes("backpack") && normalizeRuleName(gear.name) === "backpack"),
  );
  return parseWeightNumber(catalog?.weight);
}

function normalizeItemWeightFields(item, count, children) {
  const source = String(item.source || "").toLowerCase();
  const importedTotal = parseWeightNumber(item.totalWeight ?? item.weight);
  const explicitUnit = parseWeightNumber(item.unitWeight);
  const explicitOwn = parseWeightNumber(item.containerOwnWeight);
  const childTotal = children.reduce(
    (sum, child) => sum + inventoryItemTotalWeight(child),
    0,
  );

  if (children.length || item.isContainer || item.container) {
    const knownEmpty = knownEmptyContainerWeight(item);
    const derivedEmpty =
      importedTotal === null ? null : Math.max(0, importedTotal - childTotal);
    const own =
      explicitOwn ??
      (knownEmpty !== null &&
      derivedEmpty !== null &&
      Math.abs(knownEmpty - derivedEmpty) <= 0.25
        ? knownEmpty
        : derivedEmpty ?? knownEmpty ?? explicitUnit ?? parseWeight(item.weight));
    return {
      unitWeight: own,
      containerOwnWeight: own,
      totalWeight:
        importedTotal !== null ? importedTotal : own * count + childTotal,
      isContainer: true,
    };
  }

  if (explicitUnit !== null) {
    return {
      unitWeight: explicitUnit,
      totalWeight: explicitUnit * count,
      isContainer: false,
    };
  }

  if (source === "savaged.us" && importedTotal !== null) {
    return {
      unitWeight: count ? importedTotal / count : importedTotal,
      totalWeight: importedTotal,
      isContainer: false,
    };
  }

  const unitWeight = parseWeight(item.weight);
  return {
    unitWeight,
    totalWeight: unitWeight * count,
    isContainer: false,
  };
}

function normalizeInventoryItem(item, index, usedIds, parentLocation = "") {
  const source = item && typeof item === "object" ? { ...item } : {};
  const count = Math.max(
    0,
    Math.floor(Number(source.count ?? source.quantity ?? 1) || 0),
  );
  const children = (Array.isArray(source.contents)
    ? source.contents
    : Array.isArray(source.contains?.gear)
      ? source.contains.gear
      : []
  ).map((child, childIndex) =>
    normalizeInventoryItem(child, childIndex, usedIds, "container"),
  );
  const idBase = source.id || source.uuid || source.name || `item-${index}`;
  let id = slugify(idBase);
  let suffix = 2;
  while (usedIds.has(id)) {
    id = `${slugify(idBase)}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(id);

  const weightFields = normalizeItemWeightFields(source, count, children);
  const location = parentLocation
    ? "container"
    : normalizeInventoryLocation(source.location);
  const storageId =
    location === "stored" ? source.storageId || source.storageLocationId || "" : "";

  return {
    ...source,
    id,
    uuid: source.uuid,
    name: source.name || "Gear",
    count,
    location,
    storageId,
    isContainer: weightFields.isContainer,
    unitWeight: weightFields.unitWeight,
    totalWeight: weightFields.totalWeight,
    containerOwnWeight: weightFields.containerOwnWeight,
    contents: children,
    note: source.note || source.notes || source.summary || "",
  };
}

function normalizeStorageLocations(locations) {
  const used = new Set(BUILT_IN_STORAGE_LOCATIONS.map((location) => location.id));
  return (Array.isArray(locations) ? locations : [])
    .map((location) => {
      const name = String(location?.name || "").trim();
      if (!name) return null;
      let id = slugify(location.id || name);
      let suffix = 2;
      while (used.has(id)) {
        id = `${slugify(location.id || name)}-${suffix}`;
        suffix += 1;
      }
      used.add(id);
      return { id, name };
    })
    .filter(Boolean);
}

function normalizeInventoryState(currentCharacter) {
  currentCharacter.storageLocations = normalizeStorageLocations(
    currentCharacter.storageLocations,
  );
  const usedIds = new Set();
  currentCharacter.inventory = (Array.isArray(currentCharacter.inventory)
    ? currentCharacter.inventory
    : []
  ).map((item, index) => normalizeInventoryItem(item, index, usedIds));
}

function inventoryItemOwnWeight(item) {
  const count = carriedQuantity(item);
  if (item?.isContainer)
    return parseWeight(item.containerOwnWeight ?? item.unitWeight) * count;
  if (parseWeightNumber(item?.unitWeight) !== null)
    return parseWeight(item.unitWeight) * count;
  if (parseWeightNumber(item?.totalWeight) !== null) return parseWeight(item.totalWeight);
  return parseWeight(item?.weight) * count;
}

function inventoryItemContentsWeight(item) {
  return (item?.contents || []).reduce(
    (sum, child) => sum + inventoryItemTotalWeight(child),
    0,
  );
}

function inventoryItemTotalWeight(item) {
  return inventoryItemOwnWeight(item) + inventoryItemContentsWeight(item);
}

function flattenInventory(items = character.inventory, parent = null, output = []) {
  items.forEach((item) => {
    output.push({ item, parent });
    flattenInventory(item.contents || [], item, output);
  });
  return output;
}

function findInventoryEntry(id, items = character.inventory, parent = null) {
  for (const item of items) {
    if (item.id === id) return { item, parent, siblings: items };
    const child = findInventoryEntry(id, item.contents || [], item);
    if (child) return child;
  }
  return null;
}

function removeInventoryItem(id) {
  const entry = findInventoryEntry(id);
  if (!entry) return null;
  const index = entry.siblings.indexOf(entry.item);
  if (index >= 0) entry.siblings.splice(index, 1);
  return entry.item;
}

function setInventoryItemLocation(item, location, storageId = "") {
  item.location = normalizeInventoryLocation(location);
  item.storageId = item.location === "stored" ? storageId : "";
}

function moveInventoryItem(id, destination, destinationId = "") {
  const moving = removeInventoryItem(id);
  if (!moving) return;

  if (destination === "container") {
    const target = findInventoryEntry(destinationId);
    if (!target || target.item.id === moving.id) {
      character.inventory.push(moving);
      return;
    }
    moving.location = "container";
    moving.storageId = "";
    target.item.isContainer = true;
    target.item.contents ||= [];
    target.item.contents.push(moving);
    return;
  }

  setInventoryItemLocation(moving, destination, destinationId);
  character.inventory.push(moving);
}

function addStorageLocation(name) {
  const cleanName = String(name || "").trim();
  if (!cleanName) return;
  character.storageLocations ||= [];
  const idBase = slugify(cleanName);
  const used = new Set(allStorageLocations().map((location) => location.id));
  let id = idBase;
  let suffix = 2;
  while (used.has(id)) {
    id = `${idBase}-${suffix}`;
    suffix += 1;
  }
  character.storageLocations.push({ id, name: cleanName });
}

function renameStorageLocation(id, name) {
  const location = character.storageLocations?.find((item) => item.id === id);
  if (location && String(name || "").trim()) location.name = String(name).trim();
}

function deleteStorageLocation(id) {
  const custom = character.storageLocations?.find((item) => item.id === id);
  if (!custom) return false;
  const hasItems = flattenInventory().some(
    ({ item, parent }) => !parent && item.location === "stored" && item.storageId === id,
  );
  if (hasItems) return false;
  character.storageLocations = character.storageLocations.filter(
    (item) => item.id !== id,
  );
  return true;
}

function inventoryWeightBreakdown(currentCharacter) {
  const totals = {
    activeLoad: 0,
    containerLoad: 0,
    droppedLoad: 0,
    storedLoad: 0,
    ownedWeight: 0,
  };

  (currentCharacter.inventory || []).forEach((item) => {
    const total = inventoryItemTotalWeight(item);
    totals.ownedWeight += total;
    if (item.isContainer) totals.containerLoad += total;
    if (item.location === "dropped") totals.droppedLoad += total;
    else if (item.location === "stored") totals.storedLoad += total;
    else totals.activeLoad += total;
  });

  return totals;
}
