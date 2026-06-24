const APP_EXPORT_NAME = "deadlands-character-tracker";

function plainClone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

const storageAdapter = {
  has(key) {
    return localStorage.getItem(key) !== null;
  },
  readJson(key, fallback = null) {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? fallback : JSON.parse(stored);
    } catch {
      return fallback;
    }
  },
  writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  readFlag(key) {
    return localStorage.getItem(key) === "true";
  },
  writeFlag(key, value) {
    if (value) localStorage.setItem(key, "true");
    else localStorage.removeItem(key);
  },
};

function migrationBase(data, exportType) {
  const migrated = data && typeof data === "object" ? plainClone(data) : {};
  const incomingVersion = Math.max(
    0,
    Math.floor(Number(migrated.schemaVersion) || 0),
  );
  migrated.schemaVersion = APP_SCHEMA_VERSION;
  migrated.migratedFromSchemaVersion = incomingVersion;
  if (exportType && !migrated.exportType) migrated.exportType = exportType;
  return migrated;
}

function migrateCharacterPayload(data) {
  return migrationBase(data, "tracker-character");
}

function migrateCreationDraftPayload(data) {
  return migrationBase(data, "creation-draft");
}

function serializeCharacterForStorage(data) {
  const stored = migrateCharacterPayload(data);
  delete stored.exportedAt;
  delete stored.exportType;
  return stored;
}

function serializeCreationDraftForStorage(data) {
  const stored = migrateCreationDraftPayload(data);
  delete stored.exportedAt;
  delete stored.exportType;
  return stored;
}

function serializeTrackerExport(data) {
  return {
    ...migrateCharacterPayload(data),
    app: APP_EXPORT_NAME,
    exportType: "tracker-character",
    exportedAt: new Date().toISOString(),
  };
}

function serializeCreationDraftExport(data) {
  return {
    app: APP_EXPORT_NAME,
    exportType: "creation-draft",
    schemaVersion: APP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    creationDraft: migrateCreationDraftPayload(data),
  };
}

function serializeFullStateExport(activeCharacter, creationDraft) {
  return {
    app: APP_EXPORT_NAME,
    exportType: "full-state",
    schemaVersion: APP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    activeCharacter: migrateCharacterPayload(activeCharacter),
    creationDraft: migrateCreationDraftPayload(creationDraft),
  };
}

function unwrapImportPayload(data) {
  if (data?.activeCharacter) {
    return {
      type: "full-state",
      activeCharacter: migrateCharacterPayload(data.activeCharacter),
      creationDraft: data.creationDraft
        ? migrateCreationDraftPayload(data.creationDraft)
        : null,
    };
  }
  if (data?.creationDraft) {
    return {
      type: "creation-draft",
      creationDraft: migrateCreationDraftPayload(data.creationDraft),
    };
  }
  return {
    type: "tracker-character",
    activeCharacter: migrateCharacterPayload(data),
  };
}

function downloadJsonFile(name, data) {
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
