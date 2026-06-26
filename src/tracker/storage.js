function normalizeSetupStatus(value, fallback = "complete") {
  return value === "needsReview" || value === "complete" ? value : fallback;
}

function normalize(data, options = {}) {
  const defaults = clone(defaultCharacter);
  const normalized =
    data && typeof data === "object"
      ? migrateCharacterPayload(data)
      : migrateCharacterPayload(defaults);

  normalized.schemaVersion = APP_SCHEMA_VERSION;
  normalized.name ||= defaults.name;
  normalized.rank ||= defaults.rank;
  normalized.ancestry ||= defaults.ancestry;
  normalized.archetype ||= defaults.archetype;
  normalized.gender ||= defaults.gender || "";
  normalized.age ||= defaults.age || "";
  normalized.player ||= defaults.player || "";
  normalized.description ||= defaults.description || "";
  normalized.background ||= defaults.background || "";
  normalized.setupStatus = normalizeSetupStatus(
    normalized.setupStatus,
    options.defaultSetupStatus || "complete",
  );
  normalized.bennies = { ...defaults.bennies, ...(normalized.bennies || {}) };
  normalized.damage = { ...defaults.damage, ...(normalized.damage || {}) };
  normalized.derived = { ...defaults.derived, ...(normalized.derived || {}) };
  normalized.attributes =
    normalized.attributes && typeof normalized.attributes === "object"
      ? normalized.attributes
      : {};
  normalized.skills = Array.isArray(normalized.skills) ? normalized.skills : [];
  normalized.creation =
    normalized.creation && typeof normalized.creation === "object"
      ? normalized.creation
      : null;
  normalized.creationBaseline =
    normalized.creationBaseline && typeof normalized.creationBaseline === "object"
      ? normalized.creationBaseline
      : null;
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
  normalized.advances = normalizeAdvances(normalized.advances);
  if (
    normalized.source === "created" &&
    !normalized.creationBaseline &&
    !normalized.advances.length
  ) {
    normalized.creationBaseline = {
      attributes: clone(normalized.attributes),
      skills: clone(normalized.skills),
    };
  }
  if (normalized.creationBaseline) {
    normalized.creationBaseline.attributes =
      normalized.creationBaseline.attributes &&
      typeof normalized.creationBaseline.attributes === "object"
        ? normalized.creationBaseline.attributes
        : {};
    normalized.creationBaseline.skills = Array.isArray(
      normalized.creationBaseline.skills,
    )
      ? normalized.creationBaseline.skills
      : [];
  }

  normalized.ammo =
    normalized.ammo && typeof normalized.ammo === "object"
      ? normalized.ammo
      : {};
  normalized.ammo = Object.entries(normalized.ammo).reduce(
    (ammoMap, [key, ammo]) => {
      const migrated = migrateAmmoEntry(key, ammo);
      if (!ammoMap[migrated.key]) ammoMap[migrated.key] = migrated.ammo;
      else ammoMap[migrated.key].count += Number(migrated.ammo.count) || 0;
      return ammoMap;
    },
    {},
  );
  Object.values(normalized.ammo).forEach((ammo) => {
    ammo.label ||= "Ammo";
    ammo.count = Math.max(0, Math.floor(Number(ammo.count) || 0));
  });

  normalized.weapons = Array.isArray(normalized.weapons)
    ? normalized.weapons
    : [];
  normalized.weapons = normalized.weapons.map((weapon, index) => {
    const item = { ...weapon };
    const catalogItem = catalogWeaponForRecord(item);
    item.id ||= `${slugify(item.name || "weapon")}-${index}`;
    item.name ||= "Unnamed weapon";
    item.damage ||= "—";
    item.range ||= "—";
    item.ap = item.ap === "" || item.ap === undefined ? "—" : item.ap;
    item.rof = item.rof === "" || item.rof === undefined ? "—" : item.rof;
    if ((!item.shotsMax || Number(item.shotsMax) <= 0) && catalogItem?.shotsMax)
      item.shotsMax = catalogItem.shotsMax;
    if (!item.ammoType && catalogItem?.ammoType)
      item.ammoType = catalogItem.ammoType;

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
      item.ammoType = exactAmmoTypeForWeapon(item);
      if (!item.ammoType) {
        item.shotsMax = null;
        item.shotsLoaded = null;
      } else if (!normalized.ammo[item.ammoType]) {
        normalized.ammo[item.ammoType] = ammoReserveForKey(item.ammoType);
      }
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

  normalized.edges = normalizeEdges(normalized.edges);
  normalized.hindrances = normalizeHindrances(normalized.hindrances);
  normalized.inventory = Array.isArray(normalized.inventory)
    ? normalized.inventory
    : [];
  normalizeInventoryState(normalized);
  normalized.vehicles = Array.isArray(normalized.vehicles)
    ? normalized.vehicles
    : [];
  normalized.consumables = Array.isArray(normalized.consumables)
    ? normalized.consumables
    : [];
  normalizePhysicalInventoryState(normalized);
  normalized.reminders = Array.isArray(normalized.reminders)
    ? normalized.reminders
    : [];
  normalized.notes ||= "";

  return normalized;
}

function emptyCharacterLibrary() {
  return {
    schemaVersion: APP_SCHEMA_VERSION,
    activeCharacterId: "",
    charactersById: {},
  };
}

function characterLibraryEntries() {
  return Object.values(characterLibrary?.charactersById || {})
    .map((entry, index) => ({ entry, index }))
    .sort(
      (left, right) =>
        String(left.entry.createdAt || "").localeCompare(
          String(right.entry.createdAt || ""),
        ) || left.index - right.index,
    )
    .map(({ entry }) => entry);
}

function uniqueCharacterSlotId(
  name,
  preferredId = "",
  charactersById = characterLibrary?.charactersById || {},
) {
  const base = slugify(preferredId || name || "character") || "character";
  let id = base;
  let suffix = 2;
  while (charactersById[id]) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function characterSlotFromCharacter(data, existing = {}, metadata = {}) {
  const now = new Date().toISOString();
  const storedCharacter = serializeCharacterForStorage(data);
  const id =
    existing.id ||
    metadata.id ||
    uniqueCharacterSlotId(storedCharacter.name, metadata.preferredId);
  return {
    id,
    name: metadata.name || storedCharacter.name || "Unnamed Character",
    rank: storedCharacter.rank || "",
    archetype: storedCharacter.archetype || "",
    source: metadata.source || storedCharacter.source || existing.source || "local",
    isDemo: Boolean(metadata.isDemo ?? existing.isDemo),
    sampleId: metadata.sampleId || existing.sampleId || "",
    createdAt: existing.createdAt || metadata.createdAt || now,
    updatedAt: metadata.updatedAt || now,
    character: storedCharacter,
  };
}

function normalizeCharacterLibrary(raw) {
  const library = emptyCharacterLibrary();
  const sourceEntries = raw?.charactersById
    ? Object.values(raw.charactersById)
    : Array.isArray(raw?.characters)
      ? raw.characters
      : [];

  sourceEntries.forEach((entry) => {
    const payload = entry?.character || entry?.activeCharacter || entry;
    if (!payload || typeof payload !== "object") return;
    const normalizedCharacter = normalize(payload);
    const id = uniqueCharacterSlotId(
      normalizedCharacter.name,
      entry.id || "",
      library.charactersById,
    );
    library.charactersById[id] = characterSlotFromCharacter(
      normalizedCharacter,
      {
        ...entry,
        id,
      },
      {
        source: entry.source,
        isDemo: entry.isDemo,
        sampleId: entry.sampleId,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    );
  });

  library.activeCharacterId =
    raw?.activeCharacterId && library.charactersById[raw.activeCharacterId]
      ? raw.activeCharacterId
      : Object.keys(library.charactersById)[0] || "";
  return library;
}

function persistCharacterLibrary() {
  if (!characterLibrary) return;
  characterLibrary.schemaVersion = APP_SCHEMA_VERSION;
  storageAdapter.writeJson(CHARACTER_LIBRARY_KEY, characterLibrary);
}

function loadCharacterLibrary() {
  const stored = storageAdapter.readJson(CHARACTER_LIBRARY_KEY, null);
  if (stored) return normalizeCharacterLibrary(stored);

  const legacy = storageAdapter.readJson(STORAGE_KEY, null);
  if (!legacy) return emptyCharacterLibrary();

  const migratedCharacter = normalize(legacy);
  const library = emptyCharacterLibrary();
  const entry = characterSlotFromCharacter(migratedCharacter, {}, {
    source: migratedCharacter.source || "migrated",
  });
  library.charactersById[entry.id] = entry;
  library.activeCharacterId = entry.id;
  characterLibrary = library;
  persistCharacterLibrary();
  return library;
}

function activeCharacterSlot() {
  return (
    characterLibrary?.charactersById?.[characterLibrary.activeCharacterId] || null
  );
}

function isUnsavedCharacterDraft() {
  return Boolean(characterDraftMode);
}

function placeholderSetupCharacterName(name = character?.name || "") {
  return String(name || "").trim().toLowerCase() === "untitled character";
}

function draftCharacterSaveName() {
  const name = String(character?.name || "").trim();
  return name && !placeholderSetupCharacterName(name) ? name : "";
}

function setSaveState(message) {
  if (!els.saveState) return;
  els.saveState.textContent = message;
}

function saveCharacterSlot(data = character, metadata = {}) {
  if (!data) return null;
  if (isUnsavedCharacterDraft() && data === character && !metadata.forceDraftSave)
    return null;
  if (data === character) characterDraftMode = false;
  if (!characterLibrary) characterLibrary = emptyCharacterLibrary();
  const activeId = metadata.id || characterLibrary.activeCharacterId;
  const existing = activeId ? characterLibrary.charactersById[activeId] : null;
  const entry = characterSlotFromCharacter(data, existing || {}, {
    ...metadata,
    id: existing?.id || metadata.id,
  });
  characterLibrary.charactersById[entry.id] = entry;
  characterLibrary.activeCharacterId = entry.id;
  persistCharacterLibrary();
  storageAdapter.writeJson(STORAGE_KEY, entry.character);
  return entry;
}

async function saveUnsavedCharacterDraft() {
  if (!isUnsavedCharacterDraft()) {
    saveCharacterSlot(character);
    return activeCharacterSlot();
  }

  let name = draftCharacterSaveName();
  if (!name) {
    const prompted = await appPrompt(
      "Name this character before saving the draft to your local character library.",
      "",
      {
        title: "Save Character Draft",
        confirmText: "Save Draft",
        inputLabel: "Character name",
      },
    );
    if (prompted === null) return null;
    name = prompted.trim();
  }

  if (!name || placeholderSetupCharacterName(name)) {
    appToast("A character name is required before saving this draft.", "danger");
    return null;
  }

  character.name = name;
  const entry = addCharacterSlot(character, {
    source: "created",
    forceDraftSave: true,
  });
  character = normalize(entry.character);
  characterDraftMode = false;
  setSaveState("Saved");
  return entry;
}

function discardUnsavedCharacterDraft() {
  if (!isUnsavedCharacterDraft()) return false;
  characterDraftMode = false;
  const active = activeCharacterSlot();
  if (active) {
    activateCharacterSlot(active.id);
    return true;
  }
  character = normalize(clone(defaultCharacter));
  storageAdapter.remove(STORAGE_KEY);
  return false;
}

async function resolveUnsavedCharacterDraft(message) {
  if (!isUnsavedCharacterDraft()) return true;
  const choice = await appChoice(
    message ||
      "This character draft has not been saved to your local character library.",
    [
      { value: "save", label: "Save Draft" },
      { value: "discard", label: "Discard Draft", danger: true },
      { value: "cancel", label: "Stay Here", ghost: true },
    ],
    {
      title: "Unsaved Character Draft",
      cancelText: "Stay Here",
    },
  );

  if (choice === "save") return Boolean(await saveUnsavedCharacterDraft());
  if (choice === "discard") {
    discardUnsavedCharacterDraft();
    return true;
  }
  return false;
}

function addCharacterSlot(data, metadata = {}) {
  characterDraftMode = false;
  if (typeof characterSetupReviewOpen !== "undefined")
    characterSetupReviewOpen = false;
  if (!characterLibrary) characterLibrary = emptyCharacterLibrary();
  const preferredId = metadata.preferredId || "";
  const existingId = metadata.replacePreferred
    ? Object.values(characterLibrary.charactersById).find(
        (entry) => entry.sampleId && entry.sampleId === metadata.sampleId,
      )?.id || ""
    : "";
  const id = existingId || uniqueCharacterSlotId(data?.name, preferredId);
  const existing = existingId ? characterLibrary.charactersById[existingId] : {};
  const entry = characterSlotFromCharacter(normalize(data), existing, {
    ...metadata,
    id,
  });
  characterLibrary.charactersById[entry.id] = entry;
  characterLibrary.activeCharacterId = entry.id;
  persistCharacterLibrary();
  storageAdapter.writeJson(STORAGE_KEY, entry.character);
  return entry;
}

function activateCharacterSlot(id) {
  const entry = characterLibrary?.charactersById?.[id];
  if (!entry) return false;
  characterDraftMode = false;
  if (typeof characterSetupReviewOpen !== "undefined")
    characterSetupReviewOpen = false;
  characterLibrary.activeCharacterId = id;
  character = normalize(entry.character);
  persistCharacterLibrary();
  storageAdapter.writeJson(STORAGE_KEY, serializeCharacterForStorage(character));
  return true;
}

function removeCharacterSlot(id) {
  if (!characterLibrary?.charactersById?.[id]) return false;
  const removingActive = characterLibrary.activeCharacterId === id;
  delete characterLibrary.charactersById[id];
  if (removingActive) {
    if (typeof characterSetupReviewOpen !== "undefined")
      characterSetupReviewOpen = false;
    const next = characterLibraryEntries()[0];
    characterLibrary.activeCharacterId = next?.id || "";
    if (!isUnsavedCharacterDraft())
      character = next ? normalize(next.character) : normalize(clone(defaultCharacter));
  }
  persistCharacterLibrary();
  if (characterLibrary.activeCharacterId && !isUnsavedCharacterDraft())
    storageAdapter.writeJson(STORAGE_KEY, serializeCharacterForStorage(character));
  else if (!isUnsavedCharacterDraft()) storageAdapter.remove(STORAGE_KEY);
  return true;
}

function renameCharacterSlot(id, name) {
  const entry = characterLibrary?.charactersById?.[id];
  const nextName = String(name || "").trim();
  if (!entry || !nextName) return false;
  entry.name = nextName;
  entry.character.name = nextName;
  entry.updatedAt = new Date().toISOString();
  if (characterLibrary.activeCharacterId === id) character.name = nextName;
  persistCharacterLibrary();
  if (characterLibrary.activeCharacterId === id)
    storageAdapter.writeJson(STORAGE_KEY, serializeCharacterForStorage(character));
  return true;
}

function duplicateCharacterSlot(id) {
  const entry = characterLibrary?.charactersById?.[id];
  if (!entry) return null;
  const copy = normalize({
    ...clone(entry.character),
    name: `${entry.name || "Character"} Copy`,
    source: "duplicated",
  });
  return addCharacterSlot(copy, { source: "duplicated" });
}

function loadCharacter() {
  characterLibrary = loadCharacterLibrary();
  const active = activeCharacterSlot();
  return active ? normalize(active.character) : normalize(clone(defaultCharacter));
}

function save() {
  if (isUnsavedCharacterDraft()) {
    setSaveState("Draft not saved");
    return;
  }
  saveCharacterSlot(character);
  if (!els.saveState) return;
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    els.saveState.textContent = "Saved";
  }, 120);
}

character = loadCharacter();
