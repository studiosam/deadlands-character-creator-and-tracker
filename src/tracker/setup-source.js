/**
 * Character Setup source tracking and creation-baseline helpers.
 *
 * Source metadata explains why a starting record exists and whether the app can
 * trust it. Creation baselines capture the finished starting state so later
 * advancement and audit logic can distinguish setup from play changes.
 */

const SETUP_SOURCE_DEFINITIONS = {
  "setup-starting-hindrance": {
    label: "Starting Hindrance",
    kind: "starting-hindrance",
  },
  "human-free-edge": {
    label: "Human free Edge",
    kind: "ancestry-grant",
  },
  "hindrance-benefit": {
    label: "Hindrance benefit Edge",
    kind: "hindrance-benefit",
  },
  "setup-starting-power": {
    label: "Starting Power",
    kind: "arcane-background-power",
  },
  "setup-arcane-background": {
    label: "Arcane Background granted",
    kind: "arcane-background-grant",
  },
  "setup-starting-gear": {
    label: "Starting Gear Purchase",
    kind: "starting-funds",
  },
  "setup-starting-funds": {
    label: "Starting Funds",
    kind: "starting-funds",
  },
  "setup-gm-exception": {
    label: "GM / table exception",
    kind: "setup-exception",
  },
};

function normalizeSetupSourceToken(value) {
  const text =
    typeof plainEntryName === "function"
      ? plainEntryName(value)
      : String(value || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim();
  if (!text) return "";

  const compact = text.replace(/\s+/g, "-");
  if (SETUP_SOURCE_DEFINITIONS[compact]) return compact;

  if (text === "starting hindrance") return "setup-starting-hindrance";
  if (text === "human free edge") return "human-free-edge";
  if (text === "hindrance benefit edge" || text === "hindrance purchased edge")
    return "hindrance-benefit";
  if (text === "starting power" || text === "setup starting power")
    return "setup-starting-power";
  if (
    text === "arcane background granted" ||
    text.startsWith("setup arcane background")
  )
    return "setup-arcane-background";
  if (text === "starting gear purchase" || text === "setup starting gear")
    return "setup-starting-gear";
  if (text === "starting funds") return "setup-starting-funds";
  if (
    text === "gm table exception" ||
    text === "table gm exception" ||
    text === "setup gm exception"
  )
    return "setup-gm-exception";
  return "";
}

function setupSourceDefinition(creationSource) {
  const token = normalizeSetupSourceToken(creationSource);
  return token ? SETUP_SOURCE_DEFINITIONS[token] || null : null;
}

function setupSourceLabel(creationSource) {
  return setupSourceDefinition(creationSource)?.label || "";
}

function setupSourceRecordLabel(creationSource, detail = {}) {
  const token = normalizeSetupSourceToken(creationSource);
  if (token === "setup-arcane-background" && detail?.arcaneBackground) {
    return `Setup: Arcane Background (${detail.arcaneBackground})`;
  }
  return setupSourceLabel(token);
}

function setupArcaneBackgroundSourceName(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const config =
    typeof arcaneBackgroundConfigFromEdge === "function"
      ? arcaneBackgroundConfigFromEdge(text)
      : null;
  if (config?.displayName) return config.displayName;
  return text
    .replace(/^Arcane Background\s*:\s*/i, "")
    .replace(/^Arcane Background\s*\((.+)\)$/i, "$1")
    .trim();
}

function setupSourceDetail(creationSource, detail = {}) {
  const token = normalizeSetupSourceToken(creationSource);
  const definition = setupSourceDefinition(token);
  const sourceDetail = {
    kind: definition?.kind || token || "setup-source",
    ...(detail && typeof detail === "object" ? detail : {}),
  };
  if (sourceDetail.arcaneBackground) {
    sourceDetail.arcaneBackground = setupArcaneBackgroundSourceName(
      sourceDetail.arcaneBackground,
    );
  }
  return sourceDetail;
}

function inferSetupCreationSource(record) {
  if (!record || typeof record !== "object") return "";
  return (
    normalizeSetupSourceToken(record.creationSource) ||
    normalizeSetupSourceToken(record.source) ||
    normalizeSetupSourceToken(record.addedReason)
  );
}

/**
 * Apply canonical setup source fields to a setup-created record.
 *
 * The source contract uses:
 * - creationSource: compact machine token, such as setup-starting-gear
 * - source: user-facing label for lists and audits
 * - sourceDetail: structured metadata that explains the grant or purchase
 */
function applySetupSourceFields(record, creationSource, detail = {}) {
  if (!record || typeof record !== "object") return record;
  const token = normalizeSetupSourceToken(creationSource);
  if (!token) return record;
  record.creationSource = token;
  record.sourceDetail = setupSourceDetail(token, detail);
  record.source = setupSourceRecordLabel(token, record.sourceDetail);
  return record;
}

/**
 * Normalize existing setup source metadata without overwriting useful detail.
 *
 * This is used for current records, imports, and older local saves. It upgrades
 * recognizable source strings into the canonical source fields while leaving
 * unknown records available for setup audit and GM exception notes.
 */
function normalizeSetupSourceFields(
  record,
  fallbackCreationSource = "",
  detail = {},
) {
  if (!record || typeof record !== "object") return record;
  const token =
    inferSetupCreationSource(record) ||
    normalizeSetupSourceToken(fallbackCreationSource);
  if (!token) return record;

  const existingDetail =
    record.sourceDetail && typeof record.sourceDetail === "object"
      ? record.sourceDetail
      : {};
  const sourceDetail = setupSourceDetail(token, {
    ...existingDetail,
    ...(detail && typeof detail === "object" ? detail : {}),
  });
  record.creationSource = token;
  record.source = setupSourceRecordLabel(token, sourceDetail);
  record.sourceDetail = sourceDetail;
  return record;
}

function setupSourceLabelForRecord(record) {
  return setupSourceLabel(inferSetupCreationSource(record));
}

function setupSourceTracked(record) {
  return Boolean(inferSetupCreationSource(record));
}

function setupSourceDescriptor(record, fallbackLabel = "") {
  const token = inferSetupCreationSource(record);
  const label = setupSourceLabel(token);
  return {
    creationSource: token,
    label: label || record?.source || fallbackLabel || "Source unknown",
    sourceDetail:
      record?.sourceDetail && typeof record.sourceDetail === "object"
        ? record.sourceDetail
        : null,
  };
}

function setupMoneySourceDetail(currentCharacter = character) {
  const creation = currentCharacter.creation || {};
  const hindranceBonusCents =
    Math.max(0, Number(creation.extraMoneyFromHindrances) || 0) * 50000;
  return setupSourceDetail("setup-starting-funds", {
    baseCents: 25000,
    hindranceBonusCents,
    currentCents: Math.round(Number(currentCharacter.moneyCents) || 0),
  });
}

function setupRecordSnapshot(records) {
  return clone(Array.isArray(records) ? records : []);
}

function setupMapSnapshot(recordMap) {
  return clone(recordMap && typeof recordMap === "object" ? recordMap : {});
}

function normalizeSetupSourceRecords(
  records,
  fallbackCreationSource = "",
  detail = {},
) {
  (Array.isArray(records) ? records : []).forEach((record) => {
    normalizeSetupSourceFields(record, fallbackCreationSource, detail);
  });
}

function setupGearRecordDetail(record, purchaseType = "gear") {
  return {
    purchaseType,
    catalogId: record?.catalogId || record?.id || "",
    costCents: Math.max(0, Number(record?.costCents) || 0),
    quantity: Math.max(1, Number(record?.count) || 1),
  };
}

function setupStartingGearStackCount(record) {
  return Math.max(
    1,
    Math.floor(Number(record?.count ?? record?.quantity ?? 1) || 1),
  );
}

function setupStartingGearRecordId(record, purchaseType, index) {
  const baseId = record?.id || record?.catalogId || purchaseType || "gear";
  return `${baseId}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSingleSetupStartingGearRecord(record, purchaseType, index) {
  const normalized = index === 0 ? record : clone(record);
  if (index > 0)
    normalized.id = setupStartingGearRecordId(record, purchaseType, index);
  normalized.catalogId ||= record?.catalogId || record?.id || "";
  normalized.count = 1;
  delete normalized.quantity;
  if (normalized.sourceDetail && typeof normalized.sourceDetail === "object") {
    normalized.sourceDetail = {
      ...normalized.sourceDetail,
      purchaseType,
      catalogId: normalized.catalogId || normalized.id || "",
      quantity: 1,
    };
  }
  normalizeSetupSourceFields(
    normalized,
    "setup-starting-gear",
    setupGearRecordDetail(normalized, purchaseType),
  );
  return normalized;
}

function normalizeSetupStartingGearStackedRecords(
  records,
  purchaseType = "gear",
) {
  if (!Array.isArray(records)) return [];
  const normalizedRecords = [];
  records.forEach((record) => {
    if (!record || typeof record !== "object") return;
    if (Array.isArray(record.contents)) {
      record.contents = normalizeSetupStartingGearStackedRecords(
        record.contents,
        "gear",
      );
    }
    const count = setupStartingGearStackCount(record);
    const isSetupStartingGear =
      normalizeSetupSourceToken(record.creationSource) ===
      "setup-starting-gear";
    if (!isSetupStartingGear || count <= 1) {
      normalizedRecords.push(record);
      return;
    }
    for (let index = 0; index < count; index += 1) {
      normalizedRecords.push(
        normalizeSingleSetupStartingGearRecord(record, purchaseType, index),
      );
    }
  });
  return normalizedRecords;
}

function normalizeSetupStartingGearStacks(currentCharacter = character) {
  currentCharacter.inventory = normalizeSetupStartingGearStackedRecords(
    currentCharacter.inventory,
    "gear",
  );
  currentCharacter.weapons = normalizeSetupStartingGearStackedRecords(
    currentCharacter.weapons,
    "weapon",
  );
  currentCharacter.armorInventory = normalizeSetupStartingGearStackedRecords(
    currentCharacter.armorInventory,
    "armor",
  );
  currentCharacter.vehicles = normalizeSetupStartingGearStackedRecords(
    currentCharacter.vehicles,
    "vehicle",
  );
  currentCharacter.consumables = normalizeSetupStartingGearStackedRecords(
    currentCharacter.consumables,
    "consumable",
  );
}

/**
 * Normalize setup source tracking across every setup-owned collection.
 *
 * When assumeCurrentRecordsAreSetup is true, current records are treated as the
 * finalized starting package and receive setup source tags. Imported or advanced
 * characters should usually call this without that option so unexplained records
 * remain visible to audits instead of being silently trusted.
 */
function normalizeSetupSourceTracking(
  currentCharacter = character,
  options = {},
) {
  const assumeCurrentRecordsAreSetup = Boolean(
    options.assumeCurrentRecordsAreSetup,
  );

  normalizeSetupSourceRecords(
    currentCharacter.hindrances,
    assumeCurrentRecordsAreSetup ? "setup-starting-hindrance" : "",
  );
  normalizeSetupSourceRecords(currentCharacter.edges);
  normalizeSetupSourceRecords(currentCharacter.powers);
  normalizeSetupSourceRecords(currentCharacter.resources);
  flattenInventory(currentCharacter.inventory || []).forEach(({ item }) =>
    normalizeSetupSourceFields(item),
  );
  normalizeSetupSourceRecords(currentCharacter.weapons);
  normalizeSetupSourceRecords(currentCharacter.armorInventory);
  normalizeSetupSourceRecords(currentCharacter.vehicles);
  normalizeSetupSourceRecords(currentCharacter.consumables);
  Object.values(currentCharacter.ammo || {}).forEach((ammo) =>
    normalizeSetupSourceFields(ammo),
  );

  if (!assumeCurrentRecordsAreSetup) {
    normalizeSetupStartingGearStacks(currentCharacter);
    return currentCharacter;
  }

  (currentCharacter.powers || []).forEach((power) =>
    normalizeSetupSourceFields(power, "setup-starting-power", {
      catalogId: power.catalogId || power.id || "",
      arcaneBackground:
        power.arcaneBackground ||
        currentCharacter.arcaneBackground?.edgeName ||
        currentCharacter.arcaneBackground?.name ||
        "",
    }),
  );
  (currentCharacter.resources || []).forEach((resource) => {
    if (resource.name !== "Power Points") return;
    normalizeSetupSourceFields(resource, "setup-arcane-background", {
      arcaneBackground:
        currentCharacter.arcaneBackground?.edgeName ||
        currentCharacter.arcaneBackground?.name ||
        "",
      startingPowerPoints: Math.max(0, Number(resource.max) || 0),
    });
  });
  flattenInventory(currentCharacter.inventory || []).forEach(({ item }) =>
    normalizeSetupSourceFields(
      item,
      "setup-starting-gear",
      setupGearRecordDetail(item, "gear"),
    ),
  );
  (currentCharacter.weapons || []).forEach((weapon) =>
    normalizeSetupSourceFields(
      weapon,
      "setup-starting-gear",
      setupGearRecordDetail(weapon, "weapon"),
    ),
  );
  (currentCharacter.armorInventory || []).forEach((armor) =>
    normalizeSetupSourceFields(
      armor,
      "setup-starting-gear",
      setupGearRecordDetail(armor, "armor"),
    ),
  );
  (currentCharacter.vehicles || []).forEach((vehicle) =>
    normalizeSetupSourceFields(
      vehicle,
      "setup-starting-gear",
      setupGearRecordDetail(vehicle, "vehicle"),
    ),
  );
  Object.values(currentCharacter.ammo || {}).forEach((ammo) =>
    normalizeSetupSourceFields(
      ammo,
      "setup-starting-gear",
      setupGearRecordDetail(ammo, "ammo"),
    ),
  );

  normalizeSetupStartingGearStacks(currentCharacter);
  return currentCharacter;
}

/**
 * Snapshot the finalized starting state.
 *
 * The baseline is the app's reference point for distinguishing setup-created
 * records from play-time changes and future advancement. Store full records,
 * money source detail, setup exceptions, and core traits so later audits can
 * explain what was known at confirmation time.
 */
function buildCreationBaselineSnapshot(currentCharacter = character) {
  const now = new Date().toISOString();
  return {
    version: 1,
    capturedAt: now,
    source: "setup",
    attributes: clone(currentCharacter.attributes || {}),
    skills: setupRecordSnapshot(currentCharacter.skills),
    hindrances: setupRecordSnapshot(currentCharacter.hindrances),
    edges: setupRecordSnapshot(currentCharacter.edges),
    powers: setupRecordSnapshot(currentCharacter.powers),
    resources: setupRecordSnapshot(currentCharacter.resources),
    gear: {
      inventory: setupRecordSnapshot(currentCharacter.inventory),
      weapons: setupRecordSnapshot(currentCharacter.weapons),
      armorInventory: setupRecordSnapshot(currentCharacter.armorInventory),
      ammo: setupMapSnapshot(currentCharacter.ammo),
      vehicles: setupRecordSnapshot(currentCharacter.vehicles),
      consumables: setupRecordSnapshot(currentCharacter.consumables),
    },
    money: {
      cents: Math.round(Number(currentCharacter.moneyCents) || 0),
      creationSource: "setup-starting-funds",
      source: setupSourceLabel("setup-starting-funds"),
      sourceDetail: setupMoneySourceDetail(currentCharacter),
    },
    creation: clone(currentCharacter.creation || {}),
    setupExceptions: setupRecordSnapshot(currentCharacter.setupExceptions),
  };
}

function normalizeCreationBaselineShape(currentCharacter = character) {
  const baseline =
    currentCharacter.creationBaseline &&
    typeof currentCharacter.creationBaseline === "object"
      ? currentCharacter.creationBaseline
      : {};

  baseline.version = Math.max(1, Math.floor(Number(baseline.version) || 1));
  baseline.source = baseline.source || "setup";
  baseline.capturedAt = baseline.capturedAt || "";
  baseline.attributes =
    baseline.attributes && typeof baseline.attributes === "object"
      ? baseline.attributes
      : {};
  baseline.skills = Array.isArray(baseline.skills) ? baseline.skills : [];
  baseline.hindrances = Array.isArray(baseline.hindrances)
    ? baseline.hindrances
    : [];
  baseline.edges = Array.isArray(baseline.edges) ? baseline.edges : [];
  baseline.powers = Array.isArray(baseline.powers) ? baseline.powers : [];
  baseline.resources = Array.isArray(baseline.resources)
    ? baseline.resources
    : [];
  baseline.gear =
    baseline.gear && typeof baseline.gear === "object" ? baseline.gear : {};
  baseline.gear.inventory = Array.isArray(baseline.gear.inventory)
    ? baseline.gear.inventory
    : [];
  baseline.gear.weapons = Array.isArray(baseline.gear.weapons)
    ? baseline.gear.weapons
    : [];
  baseline.gear.armorInventory = Array.isArray(baseline.gear.armorInventory)
    ? baseline.gear.armorInventory
    : [];
  baseline.gear.ammo =
    baseline.gear.ammo && typeof baseline.gear.ammo === "object"
      ? baseline.gear.ammo
      : {};
  baseline.gear.vehicles = Array.isArray(baseline.gear.vehicles)
    ? baseline.gear.vehicles
    : [];
  baseline.gear.consumables = Array.isArray(baseline.gear.consumables)
    ? baseline.gear.consumables
    : [];
  baseline.money =
    baseline.money && typeof baseline.money === "object"
      ? baseline.money
      : {
          cents: Math.round(Number(currentCharacter.moneyCents) || 0),
          creationSource: "setup-starting-funds",
          source: setupSourceLabel("setup-starting-funds"),
          sourceDetail: setupMoneySourceDetail(currentCharacter),
        };
  baseline.money.creationSource = "setup-starting-funds";
  baseline.money.source = setupSourceLabel("setup-starting-funds");
  baseline.money.sourceDetail =
    baseline.money.sourceDetail &&
    typeof baseline.money.sourceDetail === "object"
      ? baseline.money.sourceDetail
      : setupMoneySourceDetail(currentCharacter);
  baseline.creation =
    baseline.creation && typeof baseline.creation === "object"
      ? baseline.creation
      : {};
  baseline.setupExceptions = Array.isArray(baseline.setupExceptions)
    ? baseline.setupExceptions
    : [];

  currentCharacter.creationBaseline = baseline;
  return baseline;
}

function snapshotCreationBaseline(currentCharacter = character) {
  normalizeSetupSourceTracking(currentCharacter, {
    assumeCurrentRecordsAreSetup: true,
  });
  currentCharacter.creationBaseline =
    buildCreationBaselineSnapshot(currentCharacter);
  return currentCharacter.creationBaseline;
}
