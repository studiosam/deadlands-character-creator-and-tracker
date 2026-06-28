// Canonical Character Setup source and creation-baseline helpers.

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

function applySetupSourceFields(record, creationSource, detail = {}) {
  if (!record || typeof record !== "object") return record;
  const token = normalizeSetupSourceToken(creationSource);
  if (!token) return record;
  record.creationSource = token;
  record.sourceDetail = setupSourceDetail(token, detail);
  record.source = setupSourceRecordLabel(token, record.sourceDetail);
  return record;
}

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

  if (!assumeCurrentRecordsAreSetup) return currentCharacter;

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

  return currentCharacter;
}

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

function setupAuditRecord(type, label, record, options = {}) {
  const descriptor = setupSourceDescriptor(record);
  const explained = Boolean(descriptor.creationSource);
  return {
    type,
    label,
    collection: options.collection || "",
    recordId: options.recordId || record?.id || "",
    creationSource: descriptor.creationSource,
    sourceLabel: descriptor.label,
    needsException: Boolean(options.requiresSource && !explained),
  };
}

function setupSourceAuditReport(currentCharacter = character) {
  const records = [];
  (currentCharacter.hindrances || []).forEach((hindrance) =>
    records.push(
      setupAuditRecord("Hindrance", hindrance.name || "Unnamed", hindrance, {
        collection: "hindrances",
        recordId: hindrance.id,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.edges || []).forEach((edge) =>
    records.push(
      setupAuditRecord("Edge", edge.name || "Unnamed", edge, {
        collection: "edges",
        recordId: edge.id,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.powers || []).forEach((power) =>
    records.push(
      setupAuditRecord("Power", power.name || "Unnamed", power, {
        collection: "powers",
        recordId: power.id,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.resources || []).forEach((resource) =>
    records.push(
      setupAuditRecord("Resource", resource.name || "Unnamed", resource, {
        collection: "resources",
        recordId: resource.id,
        requiresSource: resource.name === "Power Points",
      }),
    ),
  );
  flattenInventory(currentCharacter.inventory || []).forEach(({ item }) =>
    records.push(
      setupAuditRecord("Gear", item.name || "Gear", item, {
        collection: "inventory",
        recordId: item.id,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.weapons || []).forEach((weapon) =>
    records.push(
      setupAuditRecord("Weapon", weapon.name || "Weapon", weapon, {
        collection: "weapons",
        recordId: weapon.id,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.armorInventory || []).forEach((armor) =>
    records.push(
      setupAuditRecord("Armor", armor.name || "Armor", armor, {
        collection: "armorInventory",
        recordId: armor.id,
        requiresSource: true,
      }),
    ),
  );
  Object.entries(currentCharacter.ammo || {}).forEach(([key, ammo]) =>
    records.push(
      setupAuditRecord("Ammo", ammo.label || "Ammo", ammo, {
        collection: "ammo",
        recordId: key,
        requiresSource: true,
      }),
    ),
  );
  (currentCharacter.vehicles || []).forEach((vehicle) =>
    records.push(
      setupAuditRecord("Vehicle", vehicle.name || "Vehicle", vehicle, {
        collection: "vehicles",
        recordId: vehicle.id,
        requiresSource: true,
      }),
    ),
  );

  const needsExceptions = records.filter((record) => record.needsException);
  return {
    records,
    explained: records.filter((record) => !record.needsException),
    needsExceptions,
  };
}
