/**
 * Deadlands-specific player bookkeeping models.
 *
 * These records track player-owned facts and reminders for setting-specific
 * mechanics. They intentionally do not adjudicate Marshal-facing outcomes,
 * malfunction tables, organization favors, or secret Harrowed state.
 */
const MAD_SCIENCE_DEVICE_STATUS_OPTIONS = [
  { value: "ready", label: "Ready" },
  { value: "active", label: "Active" },
  { value: "damaged", label: "Damaged" },
  { value: "needs-repair", label: "Needs Repair" },
  { value: "lost", label: "Lost" },
  { value: "retired", label: "Retired" },
];

const MAD_SCIENCE_DEVICE_KIND_OPTIONS = [
  { value: "power-device", label: "Power Device" },
  { value: "infernal-device", label: "Infernal Device" },
  { value: "elixir", label: "Elixir" },
  { value: "gizmo", label: "Gizmo" },
  { value: "other", label: "Other" },
];

const DEADLANDS_ORGANIZATION_NAMES = [
  "Agency",
  "Territorial Rangers",
  "Other Organization",
];

function bookkeepingText(value) {
  return String(value || "").trim();
}

function bookkeepingSlug(value) {
  if (typeof slugify === "function") return slugify(value);
  return bookkeepingText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizedBookkeepingName(value) {
  if (typeof plainEntryName === "function") return plainEntryName(value);
  return bookkeepingText(value).toLowerCase();
}

function uniqueBookkeepingRecordId(baseId, used) {
  const base = bookkeepingSlug(baseId || "record") || "record";
  let id = base;
  let suffix = 2;
  while (used.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  used.add(id);
  return id;
}

function normalizedMadScienceDeviceStatus(value) {
  const status = bookkeepingText(value).toLowerCase();
  return MAD_SCIENCE_DEVICE_STATUS_OPTIONS.some(
    (option) => option.value === status,
  )
    ? status
    : "ready";
}

function normalizedMadScienceDeviceKind(value) {
  const kind = bookkeepingText(value).toLowerCase();
  return MAD_SCIENCE_DEVICE_KIND_OPTIONS.some((option) => option.value === kind)
    ? kind
    : "power-device";
}

function knownPowerForDevice(source, powers = []) {
  const linkedPowerId = bookkeepingText(
    source?.linkedPowerId || source?.powerId || source?.knownPowerId,
  );
  if (!linkedPowerId) return null;
  return powers.find((power) => bookkeepingText(power.id) === linkedPowerId);
}

function normalizeMadScienceDeviceRecord(source, index = 0, powers = []) {
  const record = source && typeof source === "object" ? source : {};
  const linkedPower = knownPowerForDevice(record, powers);
  const linkedPowerId = bookkeepingText(
    record.linkedPowerId ||
      record.powerId ||
      record.knownPowerId ||
      linkedPower?.id,
  );
  const linkedPowerName = bookkeepingText(
    record.linkedPowerName || record.powerName || linkedPower?.name,
  );
  const name =
    bookkeepingText(record.name || record.deviceName) ||
    bookkeepingText(record.trappingNotes || record.trapping) ||
    linkedPowerName ||
    "Mad Science Device";

  return {
    ...record,
    id: bookkeepingText(record.id) || `mad-science-device-${index + 1}`,
    name,
    kind: normalizedMadScienceDeviceKind(record.kind),
    status: normalizedMadScienceDeviceStatus(record.status),
    linkedPowerId,
    linkedPowerName,
    trappingNotes: bookkeepingText(record.trappingNotes || record.trapping),
    malfunctionReminder: record.malfunctionReminder !== false,
    repairNotes: bookkeepingText(record.repairNotes),
    fuelNotes: bookkeepingText(record.fuelNotes),
    notes: bookkeepingText(record.notes),
    source: bookkeepingText(record.source) || "Mad Scientist bookkeeping",
    createdAt: bookkeepingText(record.createdAt),
    updatedAt: bookkeepingText(record.updatedAt),
  };
}

function normalizeMadScienceDevices(records, currentCharacter = {}) {
  const used = new Set();
  return (Array.isArray(records) ? records : []).map((record, index) => {
    const normalized = normalizeMadScienceDeviceRecord(
      record,
      index,
      currentCharacter.powers || [],
    );
    normalized.id = uniqueBookkeepingRecordId(normalized.id, used);
    return normalized;
  });
}

function makeMadScienceDeviceRecord(power = null) {
  const now = new Date().toISOString();
  const linkedPowerName = bookkeepingText(power?.name);
  return normalizeMadScienceDeviceRecord(
    {
      id: `mad-science-device-${Date.now()}`,
      name:
        bookkeepingText(power?.trapping) ||
        (linkedPowerName ? `${linkedPowerName} Device` : "Mad Science Device"),
      kind: linkedPowerName ? "power-device" : "infernal-device",
      status: "ready",
      linkedPowerId: bookkeepingText(power?.id),
      linkedPowerName,
      trappingNotes: bookkeepingText(power?.trapping),
      malfunctionReminder: true,
      repairNotes: "",
      fuelNotes: "",
      notes: "",
      source: "Mad Scientist bookkeeping",
      createdAt: now,
      updatedAt: now,
    },
    0,
    power ? [power] : [],
  );
}

function characterHasNamedEdge(currentCharacter, names) {
  const wanted = new Set(names.map(normalizedBookkeepingName));
  return (currentCharacter?.edges || []).some((edge) =>
    wanted.has(normalizedBookkeepingName(edge?.name)),
  );
}

function characterIsMadScientist(currentCharacter = character) {
  return (
    currentCharacter?.arcaneBackground?.key === "madScientist" ||
    normalizedBookkeepingName(currentCharacter?.arcaneBackground?.name) ===
      "mad scientist" ||
    characterHasNamedEdge(currentCharacter, [
      "Arcane Background (Mad Scientist)",
      "Arcane Background: Mad Scientist",
    ])
  );
}

function normalizedOrganizationName(value) {
  const name = bookkeepingText(value);
  const match = DEADLANDS_ORGANIZATION_NAMES.find(
    (option) =>
      normalizedBookkeepingName(option) === normalizedBookkeepingName(name),
  );
  return match || name || "Organization";
}

function normalizeOrganizationHistoryEntry(source, index = 0) {
  const entry = source && typeof source === "object" ? source : {};
  return {
    id: bookkeepingText(entry.id) || `organization-history-${index + 1}`,
    type: bookkeepingText(entry.type) || "note",
    amount: Math.floor(Number(entry.amount) || 0),
    note: bookkeepingText(entry.note),
    createdAt: bookkeepingText(entry.createdAt) || new Date().toISOString(),
  };
}

function normalizeOrganizationRecord(source, index = 0) {
  const record = source && typeof source === "object" ? source : {};
  const favorsMax = Math.max(0, Math.floor(Number(record.favorsMax) || 0));
  const rawCurrent = Math.max(0, Math.floor(Number(record.favorsCurrent) || 0));
  const favorsCurrent = favorsMax
    ? Math.min(rawCurrent, favorsMax)
    : rawCurrent;
  return {
    ...record,
    id: bookkeepingText(record.id) || `organization-${index + 1}`,
    name: normalizedOrganizationName(record.name || record.organizationName),
    rankLabel: bookkeepingText(record.rankLabel || record.rank || record.grade),
    favorsCurrent,
    favorsMax,
    source: bookkeepingText(record.source) || "Organization bookkeeping",
    edgeId: bookkeepingText(record.edgeId),
    grantedGearNotes: bookkeepingText(record.grantedGearNotes),
    payNotes: bookkeepingText(record.payNotes),
    notes: bookkeepingText(record.notes),
    history: (Array.isArray(record.history) ? record.history : []).map(
      normalizeOrganizationHistoryEntry,
    ),
  };
}

function normalizeDeadlandsOrganizations(records) {
  const used = new Set();
  return (Array.isArray(records) ? records : []).map((record, index) => {
    const normalized = normalizeOrganizationRecord(record, index);
    normalized.id = uniqueBookkeepingRecordId(normalized.id, used);
    return normalized;
  });
}

function organizationSuggestionsForCharacter(currentCharacter = character) {
  const edges = currentCharacter?.edges || [];
  const hasAgent = characterHasNamedEdge(currentCharacter, ["Agent"]);
  const hasGrade2 = characterHasNamedEdge(currentCharacter, ["Grade 2"]);
  const hasRanger = characterHasNamedEdge(currentCharacter, [
    "Territorial Ranger",
  ]);
  const hasLieutenant = characterHasNamedEdge(currentCharacter, ["Lieutenant"]);
  const suggestions = [];

  if (hasAgent || hasGrade2) {
    const edge = edges.find((item) =>
      characterHasNamedEdge({ edges: [item] }, [
        hasGrade2 ? "Grade 2" : "Agent",
      ]),
    );
    suggestions.push({
      name: "Agency",
      rankLabel: hasGrade2 ? "Grade 2" : "Agent",
      favorsCurrent: hasGrade2 ? 3 : 0,
      favorsMax: hasGrade2 ? 3 : 0,
      source: hasGrade2 ? "Grade 2 Edge" : "Agent Edge",
      edgeId: edge?.id || "",
      grantedGearNotes:
        "Record badge, organization gear, and Marshal-approved issue here.",
      payNotes: "Record pay, authority, and favor refresh notes here.",
    });
  }

  if (hasRanger || hasLieutenant) {
    const edge = edges.find((item) =>
      characterHasNamedEdge({ edges: [item] }, [
        hasLieutenant ? "Lieutenant" : "Territorial Ranger",
      ]),
    );
    suggestions.push({
      name: "Territorial Rangers",
      rankLabel: hasLieutenant ? "Lieutenant" : "Ranger",
      favorsCurrent: hasLieutenant ? 3 : 0,
      favorsMax: hasLieutenant ? 3 : 0,
      source: hasLieutenant ? "Lieutenant Edge" : "Territorial Ranger Edge",
      edgeId: edge?.id || "",
      grantedGearNotes:
        "Record badge, organization gear, and Marshal-approved issue here.",
      payNotes: "Record pay, authority, and favor refresh notes here.",
    });
  }

  return suggestions;
}

function organizationMatchesSuggestion(record, suggestion) {
  return (
    normalizedBookkeepingName(record?.name) ===
    normalizedBookkeepingName(suggestion?.name)
  );
}

function makeOrganizationRecord(suggestion = {}) {
  return normalizeOrganizationRecord({
    id: `organization-${bookkeepingSlug(suggestion.name || "record")}-${Date.now()}`,
    name: suggestion.name || "Organization",
    rankLabel: suggestion.rankLabel || "",
    favorsCurrent: suggestion.favorsCurrent || 0,
    favorsMax: suggestion.favorsMax || 0,
    source: suggestion.source || "Organization bookkeeping",
    edgeId: suggestion.edgeId || "",
    grantedGearNotes: suggestion.grantedGearNotes || "",
    payNotes: suggestion.payNotes || "",
    notes: suggestion.notes || "",
    history: [],
  });
}
