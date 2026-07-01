const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const vm = require("node:vm");

const root = process.cwd();
const failures = [];
const allowedDuplicateNames = {
  EDGE_CATALOG: new Set([
    // SWADE has a generic Soldier Edge; Deadlands adds a setting-specific
    // Soldier Edge with the same display name and different organization rules.
    "soldier",
  ]),
};

function loadClassicScript(file, expression) {
  const source = readFileSync(join(root, file), "utf8");
  return vm.runInNewContext(`${source}\n;(${expression});`, {
    window: {},
  });
}

const catalogs = loadClassicScript(
  "src/catalogs.js",
  `{
    HINDRANCE_CATALOG,
    EDGE_CATALOG,
    GEAR_CATALOG,
    ARMOR_CATALOG,
    WEAPON_CATALOG,
    VEHICLE_CATALOG
  }`,
);

const powerCatalogs = loadClassicScript(
  "src/power-catalog.js",
  `{
    ARCANE_BACKGROUND_POWER_PROFILES,
    POWER_CATALOG
  }`,
);

function fail(message) {
  failures.push(message);
}

function labelFor(collectionName, item, index) {
  return `${collectionName}[${index}] ${item?.id || item?.name || "<unnamed>"}`;
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function expectString(
  item,
  field,
  collectionName,
  index,
  { allowEmpty = false } = {},
) {
  if (typeof item[field] !== "string") {
    fail(`${labelFor(collectionName, item, index)} missing string ${field}.`);
    return;
  }
  if (!allowEmpty && !item[field].trim()) {
    fail(`${labelFor(collectionName, item, index)} has empty ${field}.`);
  }
}

function expectArray(item, field, collectionName, index) {
  if (!Array.isArray(item[field])) {
    fail(`${labelFor(collectionName, item, index)} missing array ${field}.`);
  }
}

function expectFiniteNumber(
  item,
  field,
  collectionName,
  index,
  { integer = false } = {},
) {
  const value = item[field];
  if (!Number.isFinite(value) || value < 0) {
    fail(`${labelFor(collectionName, item, index)} has invalid ${field}.`);
    return;
  }
  if (integer && !Number.isInteger(value)) {
    fail(
      `${labelFor(collectionName, item, index)} ${field} must be an integer.`,
    );
  }
}

function validateCommonCatalogFields(collection, collectionName) {
  const ids = new Map();
  const names = new Map();

  collection.forEach((item, index) => {
    expectString(item, "id", collectionName, index);
    expectString(item, "name", collectionName, index);

    if (typeof item.id === "string" && item.id.trim()) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id)) {
        fail(`${labelFor(collectionName, item, index)} id is not slug-shaped.`);
      }
      const priorId = ids.get(item.id);
      if (priorId !== undefined) {
        fail(
          `${collectionName} duplicate id "${item.id}" at indexes ${priorId} and ${index}.`,
        );
      }
      ids.set(item.id, index);
    }

    const normalizedName = normalizeName(item.name);
    if (normalizedName) {
      const priorName = names.get(normalizedName);
      if (
        priorName !== undefined &&
        !allowedDuplicateNames[collectionName]?.has(normalizedName)
      ) {
        fail(
          `${collectionName} duplicate name "${item.name}" at indexes ${priorName} and ${index}.`,
        );
      }
      names.set(normalizedName, index);
    }
  });
}

function validatePricedWeightedCatalog(collection, collectionName) {
  collection.forEach((item, index) => {
    expectFiniteNumber(item, "costCents", collectionName, index, {
      integer: true,
    });
    expectFiniteNumber(item, "weight", collectionName, index);
  });
}

function expectFiniteNumberOrText(
  item,
  field,
  textField,
  collectionName,
  index,
  { integer = false } = {},
) {
  if (
    item[field] === null &&
    typeof item[textField] === "string" &&
    item[textField].trim()
  ) {
    return;
  }
  expectFiniteNumber(item, field, collectionName, index, { integer });
}

function validateCatalogs() {
  const {
    HINDRANCE_CATALOG,
    EDGE_CATALOG,
    GEAR_CATALOG,
    ARMOR_CATALOG,
    WEAPON_CATALOG,
    VEHICLE_CATALOG,
  } = catalogs;
  const { ARCANE_BACKGROUND_POWER_PROFILES, POWER_CATALOG } = powerCatalogs;

  [
    ["HINDRANCE_CATALOG", HINDRANCE_CATALOG],
    ["EDGE_CATALOG", EDGE_CATALOG],
    ["GEAR_CATALOG", GEAR_CATALOG],
    ["ARMOR_CATALOG", ARMOR_CATALOG],
    ["WEAPON_CATALOG", WEAPON_CATALOG],
    ["VEHICLE_CATALOG", VEHICLE_CATALOG],
    ["POWER_CATALOG", POWER_CATALOG],
  ].forEach(([collectionName, collection]) => {
    if (!Array.isArray(collection)) {
      fail(`${collectionName} must be an array.`);
      return;
    }
    validateCommonCatalogFields(collection, collectionName);
  });

  HINDRANCE_CATALOG.forEach((item, index) => {
    expectString(item, "type", "HINDRANCE_CATALOG", index);
    expectString(item, "severity", "HINDRANCE_CATALOG", index);
    expectString(item, "shortSummary", "HINDRANCE_CATALOG", index);
  });

  EDGE_CATALOG.forEach((item, index) => {
    expectString(item, "type", "EDGE_CATALOG", index);
    expectString(item, "category", "EDGE_CATALOG", index);
    expectString(item, "rank", "EDGE_CATALOG", index);
    expectString(item, "requirements", "EDGE_CATALOG", index);
    expectString(item, "shortSummary", "EDGE_CATALOG", index);
  });

  validatePricedWeightedCatalog(GEAR_CATALOG, "GEAR_CATALOG");
  validatePricedWeightedCatalog(ARMOR_CATALOG, "ARMOR_CATALOG");
  WEAPON_CATALOG.forEach((item, index) => {
    expectFiniteNumberOrText(
      item,
      "costCents",
      "costText",
      "WEAPON_CATALOG",
      index,
      {
        integer: true,
      },
    );
    expectFiniteNumberOrText(
      item,
      "weight",
      "weightText",
      "WEAPON_CATALOG",
      index,
    );
  });

  ARMOR_CATALOG.forEach((item, index) => {
    expectFiniteNumber(item, "armor", "ARMOR_CATALOG", index);
    expectString(item, "minStr", "ARMOR_CATALOG", index);
    expectString(item, "location", "ARMOR_CATALOG", index);
  });

  WEAPON_CATALOG.forEach((item, index) => {
    expectString(item, "category", "WEAPON_CATALOG", index);
    expectString(item, "damage", "WEAPON_CATALOG", index, {
      allowEmpty: true,
    });
    expectString(item, "costText", "WEAPON_CATALOG", index);
    if (item.shotsMax !== null && item.shotsMax !== undefined) {
      expectFiniteNumber(item, "shotsMax", "WEAPON_CATALOG", index, {
        integer: true,
      });
    }
  });

  VEHICLE_CATALOG.forEach((item, index) => {
    expectString(item, "category", "VEHICLE_CATALOG", index);
    expectString(item, "size", "VEHICLE_CATALOG", index);
    expectString(item, "handling", "VEHICLE_CATALOG", index, {
      allowEmpty: true,
    });
    expectFiniteNumber(item, "topSpeed", "VEHICLE_CATALOG", index);
    expectString(item, "toughness", "VEHICLE_CATALOG", index);
    expectString(item, "crew", "VEHICLE_CATALOG", index);
    expectFiniteNumber(item, "costCents", "VEHICLE_CATALOG", index, {
      integer: true,
    });
  });

  POWER_CATALOG.forEach((item, index) => {
    expectString(item, "source", "POWER_CATALOG", index);
    expectString(item, "rank", "POWER_CATALOG", index);
    expectString(item, "powerPoints", "POWER_CATALOG", index);
    if (item.basePowerPoints === null && item.manualVariableSpend) {
      expectString(item, "powerPoints", "POWER_CATALOG", index);
    } else {
      expectFiniteNumber(item, "basePowerPoints", "POWER_CATALOG", index, {
        integer: true,
      });
    }
    expectString(item, "range", "POWER_CATALOG", index);
    expectString(item, "duration", "POWER_CATALOG", index);
    expectArray(item, "allowedBackgrounds", "POWER_CATALOG", index);
    expectArray(item, "requiredForBackgrounds", "POWER_CATALOG", index);
    expectArray(item, "variableSpendOptions", "POWER_CATALOG", index);

    (item.variableSpendOptions || []).forEach((option, optionIndex) => {
      expectString(
        option,
        "id",
        `${labelFor("POWER_CATALOG", item, index)} variableSpendOptions`,
        optionIndex,
      );
      expectString(
        option,
        "label",
        `${labelFor("POWER_CATALOG", item, index)} variableSpendOptions`,
        optionIndex,
      );
      if (option.costPer !== undefined) {
        expectFiniteNumber(
          option,
          "costPer",
          `${labelFor("POWER_CATALOG", item, index)} variableSpendOptions`,
          optionIndex,
        );
      }
    });
  });

  const powerIds = new Set(POWER_CATALOG.map((power) => power.id));
  Object.entries(ARCANE_BACKGROUND_POWER_PROFILES).forEach(([key, profile]) => {
    expectString(profile, "id", "ARCANE_BACKGROUND_POWER_PROFILES", key);
    expectString(profile, "name", "ARCANE_BACKGROUND_POWER_PROFILES", key);
    expectString(
      profile,
      "arcaneSkill",
      "ARCANE_BACKGROUND_POWER_PROFILES",
      key,
    );
    expectFiniteNumber(
      profile,
      "startingPowerPoints",
      "ARCANE_BACKGROUND_POWER_PROFILES",
      key,
      { integer: true },
    );
    expectFiniteNumber(
      profile,
      "startingPowerCount",
      "ARCANE_BACKGROUND_POWER_PROFILES",
      key,
      { integer: true },
    );
    expectArray(
      profile,
      "allowedPowerIds",
      "ARCANE_BACKGROUND_POWER_PROFILES",
      key,
    );
    expectArray(
      profile,
      "requiredStartingPowers",
      "ARCANE_BACKGROUND_POWER_PROFILES",
      key,
    );

    [...profile.allowedPowerIds, ...profile.requiredStartingPowers].forEach(
      (powerId) => {
        if (!powerIds.has(powerId)) {
          fail(
            `ARCANE_BACKGROUND_POWER_PROFILES.${key} references missing power "${powerId}".`,
          );
        }
      },
    );
  });
}

validateCatalogs();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Catalog validation checks passed.");
