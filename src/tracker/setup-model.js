// Shared Character Setup status, validation, and audit helpers.

function characterSetupStatus(stepId) {
  if (stepId === "concept") {
    return character.name && character.archetype ? "Complete" : "Incomplete";
  }
  if (stepId === "ancestry") {
    return isHumanAncestry(character.ancestry) ? "Complete" : "Needs review";
  }
  if (stepId === "hindrances") {
    const stats = hindrancePointStats();
    const spending = setupHindranceBenefitSpending(stats);
    if (!stats.count) return "Incomplete";
    if (stats.unknownCount || spending.spent > spending.available)
      return "Needs review";
    return "Complete";
  }
  if (stepId === "attributesSkills") {
    if (!ATTRIBUTE_ORDER.every((key) => character.attributes?.[key]))
      return "Incomplete";
    if (!setupTraitsEditable()) return "Complete";
    const attributes = setupAttributePointStats();
    const skills = setupSkillPointStats();
    if (
      attributes.spent > attributes.available ||
      skills.spent > skills.available
    )
      return "Needs review";
    return attributes.spent === attributes.available &&
      skills.spent === skills.available
      ? "Complete"
      : "Incomplete";
  }
  if (stepId === "edges") {
    return setupEdgeSelectionStatus();
  }
  if (stepId === "powers") {
    return setupPowerAuditReport().status;
  }
  if (stepId === "gear") {
    return setupGearAuditReport().status;
  }
  if (stepId === "review") return "Needs review";
  return "Planned";
}
function setupPowerAuditContext() {
  const arcaneEdges = (character.edges || []).filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  );
  const edgeConfig = arcaneEdges
    .map((edge) => arcaneBackgroundConfigFromEdge(edge.name))
    .find(Boolean);
  const stateConfig = arcaneBackgroundConfigFromEdge(
    character.arcaneBackground?.edgeName ||
      character.arcaneBackground?.name ||
      "",
  );
  return {
    arcaneEdges,
    arcaneConfig: stateConfig || edgeConfig || null,
    powerPoints: powerPointResource(),
    powers: [...(character.powers || [])].filter((power) => power.name),
  };
}
function setupPowerProfileFromText(value) {
  if (
    typeof arcanePowerProfileKey !== "function" ||
    typeof ARCANE_BACKGROUND_POWER_PROFILES !== "object"
  )
    return null;
  const key = arcanePowerProfileKey(value);
  return key ? ARCANE_BACKGROUND_POWER_PROFILES[key] || null : null;
}
function setupPowerProfileForEdge(edge) {
  return setupPowerProfileFromText(edge?.name || edge?.edgeName || "");
}
function setupPowerProfileForState() {
  return setupPowerProfileFromText(
    character.arcaneBackground?.edgeName ||
      character.arcaneBackground?.name ||
      character.arcaneBackground?.key ||
      "",
  );
}
function setupPowerStartingCount(profile, arcaneConfig = null) {
  return Math.max(
    0,
    Number(
      profile?.startingPowerCount ??
        arcaneConfig?.startingPowersCount ??
        arcaneConfig?.startingPowerCount ??
        0,
    ) || 0,
  );
}
function setupKnownPowerCatalogEntry(power) {
  const byId =
    typeof findPowerCatalogEntryById === "function"
      ? findPowerCatalogEntryById(power.catalogId || power.id)
      : null;
  if (byId) return byId;
  return typeof findPowerCatalogEntryByName === "function"
    ? findPowerCatalogEntryByName(power.name)
    : null;
}
function setupKnownPowerMatchesCatalog(power, catalog) {
  if (!catalog) return false;
  if (power.catalogId || power.id) {
    return [power.catalogId, power.id].includes(catalog.id);
  }
  return plainEntryName(power.name) === plainEntryName(catalog.name);
}
function setupArcaneSkillAudit(profile) {
  if (!profile) return null;
  const expectedSkill = profile.arcaneSkill || "";
  const expectedAttribute = profile.arcaneSkillAttribute || "";
  const skill = findCharacterSkillByName(character, expectedSkill);
  const die = skill?.die || skill?.value || "";
  const linkedAttribute = skillLinkedAttribute(skill);
  const messages = [];
  const incomplete = [];

  if (!skill || getDieStepIndex(die) < getDieStepIndex("d4")) {
    incomplete.push(`Missing ${expectedSkill} d4+ for ${profile.name}.`);
  } else if (
    expectedAttribute &&
    plainEntryName(linkedAttribute) !== plainEntryName(expectedAttribute)
  ) {
    messages.push(
      `${expectedSkill} should be linked to ${expectedAttribute}; recorded linked attribute is ${linkedAttribute || "unknown"}.`,
    );
  }

  return {
    expectedSkill,
    expectedAttribute,
    skill,
    die,
    linkedAttribute,
    recorded: Boolean(skill),
    complete: Boolean(skill) && getDieStepIndex(die) >= getDieStepIndex("d4"),
    messages,
    incomplete,
    statusText: skill
      ? `${expectedSkill} ${die || "—"}${linkedAttribute ? ` linked to ${linkedAttribute}` : ""}`
      : `Missing ${expectedSkill} d4+`,
  };
}
function setupPowerPointsAudit(profile, powerPoints) {
  if (!profile) return null;
  const expected = Math.max(0, Number(profile.startingPowerPoints) || 0);
  const max = Number(powerPoints?.max);
  const current = Number(powerPoints?.current);
  const messages = [];
  const incomplete = [];

  if (!powerPoints) {
    incomplete.push(
      `Expected ${expected} Power Points; none recorded.`,
    );
  } else {
    if (!Number.isFinite(max) || max <= 0) {
      messages.push("Power Points max is missing or invalid.");
    } else if (max !== expected) {
      messages.push(`Expected ${expected} Power Points; recorded max is ${max}.`);
    }

    if (!Number.isFinite(current) || current < 0) {
      messages.push("Current Power Points value is missing or invalid.");
    } else if (Number.isFinite(max) && current > max) {
      messages.push(
        `Current Power Points (${current}) exceeds recorded max (${max}).`,
      );
    }
  }

  return {
    expected,
    powerPoints,
    messages,
    incomplete,
    statusText: powerPoints
      ? `${powerPoints.current} / ${powerPoints.max || "—"}`
      : "Not recorded",
  };
}
function setupRequiredStartingPowerAudits(profile, powerAudits) {
  const knownPowers = powerAudits.map((audit) => audit.power);
  return (profile?.requiredStartingPowers || []).map((id) => {
    const catalog =
      typeof findPowerCatalogEntryById === "function"
        ? findPowerCatalogEntryById(id)
        : null;
    const recorded = knownPowers.some((power) =>
      setupKnownPowerMatchesCatalog(power, catalog || { id, name: id }),
    );
    return {
      id,
      catalog,
      label: catalog?.name || displayNameFromKey(id.replace(/^power-/, "")),
      recorded,
    };
  });
}
function setupPowerAuditReport() {
  const context = setupPowerAuditContext();
  const { arcaneEdges, arcaneConfig, powerPoints, powers } = context;
  const editable = setupTraitsEditable();
  const edgeProfiles = arcaneEdges
    .map((edge) => ({ edge, profile: setupPowerProfileForEdge(edge) }))
    .filter((item) => item.profile);
  const stateProfile = setupPowerProfileForState();
  const profile = edgeProfiles[0]?.profile || stateProfile || null;
  const backgroundName =
    profile?.name ||
    arcaneConfig?.displayName ||
    character.arcaneBackground?.name ||
    arcaneEdges[0]?.name ||
    "";
  const powerAudits = powers.map((power) => {
    const catalog = setupKnownPowerCatalogEntry(power);
    const allowed = Boolean(
      profile && catalog && profile.allowedPowerIds?.includes(catalog.id),
    );
    const required = Boolean(
      profile &&
        catalog &&
        profile.requiredStartingPowers?.includes(catalog.id),
    );
    const messages = [];
    if (!catalog) {
      messages.push("Unknown custom power; verify manually.");
    } else if (profile && !allowed) {
      messages.push(
        `${catalog.name} is not in the ${profile.name} allowed power list.`,
      );
    }
    return {
      power,
      catalog,
      allowed,
      required,
      messages,
    };
  });
  const requiredPowerAudits = setupRequiredStartingPowerAudits(
    profile,
    powerAudits,
  );
  const startingPowerCount = setupPowerStartingCount(profile, arcaneConfig);
  const skillAudit = setupArcaneSkillAudit(profile);
  const powerPointsAudit = setupPowerPointsAudit(profile, powerPoints);
  const incompleteItems = [
    ...(skillAudit?.incomplete || []),
    ...(powerPointsAudit?.incomplete || []),
  ];
  const warnings = [
    ...(skillAudit?.messages || []),
    ...(powerPointsAudit?.messages || []),
    ...powerAudits.flatMap((audit) => audit.messages),
  ];

  if (arcaneEdges.length > 1) {
    warnings.push("More than one Arcane Background Edge is recorded.");
  }

  const hasArcaneSignal =
    arcaneEdges.length ||
    stateProfile ||
    character.arcaneBackground ||
    powerPoints ||
    powers.length;
  if (hasArcaneSignal && !profile) {
    warnings.push(
      "Arcane Background is recorded, but no matching power profile was found.",
    );
  }

  if (!arcaneEdges.length && !stateProfile && (powerPoints || powers.length)) {
    warnings.push(
      "Power Points or known powers are recorded without an Arcane Background.",
    );
  }

  if (profile && powers.length < startingPowerCount) {
    incompleteItems.push(
      `Expected ${startingPowerCount} starting powers; ${powers.length} recorded.`,
    );
  }

  requiredPowerAudits
    .filter((item) => !item.recorded)
    .forEach((item) => {
      incompleteItems.push(
        `${item.label} is required for ${profile.name} and is missing.`,
      );
    });

  const status = !hasArcaneSignal
    ? "Not applicable"
    : warnings.length
      ? "Needs review"
      : incompleteItems.length
        ? editable
          ? "Incomplete"
          : "Needs review"
        : "Complete";

  return {
    ...context,
    editable,
    profile,
    backgroundName,
    expectedArcaneSkill: profile?.arcaneSkill || "",
    expectedLinkedAttribute: profile?.arcaneSkillAttribute || "",
    expectedPowerPoints: profile?.startingPowerPoints || 0,
    startingPowerCount,
    skillAudit,
    powerPointsAudit,
    powerAudits,
    requiredPowerAudits,
    incompleteItems,
    warnings,
    status,
  };
}
function setupGearAuditCounts() {
  const ammoPools = Object.values(character.ammo || {}).filter(
    (ammo) => Number(ammo?.count) > 0,
  );
  const vehicles = (character.vehicles || []).filter(
    (vehicle) => Number(vehicle?.count ?? 1) > 0,
  );
  const counts = {
    moneyCents: Math.max(0, Number(character.moneyCents) || 0),
    weapons: (character.weapons || []).filter((weapon) => weapon.name).length,
    armor: (character.armorInventory || []).filter(
      (armor) => Number(armor?.count ?? 1) > 0,
    ).length,
    inventory: (character.inventory || []).filter(
      (item) => Number(item?.count ?? 1) > 0,
    ).length,
    consumables: (character.consumables || []).filter(
      (item) => Number(item?.count ?? 1) > 0,
    ).length,
    ammo: ammoPools.length,
    vehicles: vehicles.length,
  };
  counts.totalItems =
    counts.weapons +
    counts.armor +
    counts.inventory +
    counts.consumables +
    counts.ammo +
    counts.vehicles;
  return counts;
}
function setupGearCatalogMatch(entry) {
  const item = entry.item || {};
  const name = normalizeRuleName(entry.label || item.name || item.label);
  const matchesName = (catalogItem) => normalizeRuleName(catalogItem.name) === name;
  if (entry.type === "weapon") {
    return (
      WEAPON_CATALOG.find(
        (catalogItem) =>
          catalogItem.id === item.catalogId ||
          catalogItem.id === item.id ||
          matchesName(catalogItem),
      ) || null
    );
  }
  if (entry.type === "armor") {
    return (
      ARMOR_CATALOG.find(
        (catalogItem) =>
          catalogItem.id === item.catalogId ||
          catalogItem.id === item.id ||
          matchesName(catalogItem),
      ) || null
    );
  }
  if (entry.type === "ammo") return catalogAmmoForKey(entry.id, item);
  if (entry.type === "vehicle") {
    return (
      VEHICLE_CATALOG.find(
        (catalogItem) =>
          catalogItem.id === item.catalogId ||
          catalogItem.id === item.id ||
          matchesName(catalogItem),
      ) || null
    );
  }
  return (
    GEAR_CATALOG.find(
      (catalogItem) =>
        catalogItem.id === item.catalogId ||
        catalogItem.id === item.id ||
        matchesName(catalogItem),
    ) || null
  );
}
function setupInventoryAuditEntries() {
  return flattenInventory().map(({ item, parent }) => ({
    type: "gear",
    id: item.id,
    label: item.name || "Unnamed gear",
    item,
    parent,
    location: parent ? "container" : item.location || "",
    storageId: item.storageId || "",
    containerId: parent?.id || item.containerId || "",
    weight: inventoryItemTotalWeight(item),
    count: Number(item.count ?? item.quantity ?? 1),
  }));
}
function setupPhysicalAuditEntries() {
  return physicalItems().map((entry) => ({
    ...entry,
    location: entry.item.itemLocation || "",
    storageId: entry.item.storageId || "",
    containerId: entry.item.containerId || "",
    weight: physicalItemWeight(entry),
    count: Number(entry.item.count ?? entry.item.quantity ?? 1),
  }));
}
function setupVehicleAuditEntries() {
  return (character.vehicles || [])
    .filter((vehicle) => Number(vehicle.count ?? 1) > 0)
    .map((vehicle) => ({
      type: "vehicle",
      id: vehicle.id,
      label: vehicle.name || "Unnamed vehicle",
      item: vehicle,
      location: "vehicle",
      storageId: "",
      containerId: "",
      weight: 0,
      count: Number(vehicle.count ?? 1),
    }));
}
function setupGearEntryLocationLabel(entry) {
  if (entry.type === "vehicle") return "Vehicle";
  if (entry.parent) return `Inside ${entry.parent.name || "Container"}`;
  if (entry.location === "container") {
    const parent = findInventoryEntry(entry.containerId)?.item;
    return parent ? `Inside ${parent.name}` : "Inside Container";
  }
  return locationLabel(entry.location || "carried", entry.storageId);
}
function setupGearEntryWarnings(entry, catalog) {
  const item = entry.item || {};
  const warnings = [];
  const rawName = String(item.name || item.label || "").trim();
  const rawLocation = String(entry.location || item.location || item.itemLocation || "").trim();
  const count = Number(item.count ?? item.quantity ?? item.qty ?? 1);
  const locationKnown =
    entry.type === "vehicle" ||
    INVENTORY_LOCATIONS.includes(rawLocation || "carried");
  const hasExplicitWeight =
    parseWeightNumber(item.weight) !== null ||
    parseWeightNumber(item.unitWeight) !== null ||
    parseWeightNumber(item.totalWeight) !== null ||
    parseWeightNumber(item.containerOwnWeight) !== null ||
    catalog?.weight !== undefined;

  if (!rawName) warnings.push("Missing item name.");
  if (!locationKnown) warnings.push("Unknown or missing location.");
  if (!Number.isFinite(count) || count < 0) warnings.push("Suspicious count value.");
  if (entry.type !== "vehicle" && !hasExplicitWeight)
    warnings.push("Weight is unknown; verify manually.");
  if (
    entry.type !== "vehicle" &&
    item.costCents === undefined &&
    catalog?.costCents === undefined
  )
    warnings.push("Cost is unknown; purchase validation is deferred.");

  return warnings;
}
function setupGearLocationGroups(entries) {
  return {
    equipped: entries.filter((entry) => entry.location === "equipped"),
    carried: entries.filter(
      (entry) =>
        !entry.parent &&
        ["", "carried"].includes(entry.location) &&
        entry.type !== "vehicle",
    ),
    containers: entries.filter((entry) => entry.location === "container" || entry.parent),
    dropped: entries.filter((entry) => entry.location === "dropped"),
    stored: entries.filter((entry) => entry.location === "stored"),
    vehicles: entries.filter((entry) => entry.type === "vehicle"),
  };
}
function setupContainerAudits(entries) {
  return setupInventoryAuditEntries()
    .filter((entry) => entry.item.isContainer)
    .map((entry) => {
      const contents = entries.filter(
        (item) =>
          item.containerId === entry.id ||
          item.parent?.id === entry.id,
      );
      return {
        ...entry,
        contents,
        ownWeight: inventoryItemOwnWeight(entry.item),
        contentsWeight: inventoryItemContentsWeight(entry.item),
        totalWeight: inventoryItemTotalWeight(entry.item),
      };
    });
}
function setupGearAuditReport() {
  const counts = setupGearAuditCounts();
  const normal = calculateEncumbrance(character);
  const combat = calculateEncumbrance(character, { combat: true });
  const entries = [
    ...setupInventoryAuditEntries(),
    ...setupPhysicalAuditEntries(),
    ...setupVehicleAuditEntries(),
  ].map((entry) => {
    const catalog = setupGearCatalogMatch(entry);
    return {
      ...entry,
      catalog,
      warnings: setupGearEntryWarnings(entry, catalog),
      locationLabel: setupGearEntryLocationLabel(entry),
    };
  });
  const warnings = entries.flatMap((entry) =>
    entry.warnings.map((warning) => `${entry.label}: ${warning}`),
  );
  const incompleteItems = [];
  if (!counts.moneyCents) incompleteItems.push("Money is missing or zero.");
  if (!counts.totalItems) incompleteItems.push("No gear is recorded.");

  return {
    editable: setupTraitsEditable(),
    counts,
    moneyCents: counts.moneyCents,
    normal,
    combat,
    entries,
    locationGroups: setupGearLocationGroups(entries),
    containers: setupContainerAudits(entries),
    warnings,
    incompleteItems,
    status: warnings.length
      ? "Needs review"
      : incompleteItems.length
        ? "Incomplete"
        : "Complete",
  };
}
function setupCharacterIsCreated() {
  return String(character.source || "").toLowerCase() === "created";
}
function setupTraitsEditable() {
  return setupCharacterIsCreated() && !(character.advances || []).length;
}

const SETUP_HINDRANCE_BENEFITS = [
  {
    key: "extraAttributeRaisesFromHindrances",
    label: "Attribute Raise",
    pluralLabel: "Attribute Raises",
    cost: 2,
    effect: "+1 Attribute point",
  },
  {
    key: "extraEdgesFromHindrances",
    label: "Edge",
    pluralLabel: "Edges",
    cost: 2,
    effect: "+1 starting Edge slot",
  },
  {
    key: "extraSkillPointsFromHindrances",
    label: "Skill Point",
    pluralLabel: "Skill Points",
    cost: 1,
    effect: "+1 Skill point",
  },
  {
    key: "extraMoneyFromHindrances",
    label: "Money",
    pluralLabel: "Money",
    cost: 1,
    effect: "+$500 starting funds",
  },
];
function setupCreationRules() {
  const creation = character.creation || {};
  return {
    normalAttributePoints: Math.max(
      0,
      Number(creation.normalAttributePointsAvailable) || 5,
    ),
    extraAttributeRaises: Math.max(
      0,
      Number(creation.extraAttributeRaisesFromHindrances) || 0,
    ),
    normalSkillPoints: Math.max(
      0,
      Number(creation.normalSkillPointsAvailable) || 12,
    ),
    extraSkillPoints: Math.max(
      0,
      Number(creation.extraSkillPointsFromHindrances) || 0,
    ),
  };
}
function setupCreationBenefitValue(key) {
  return Math.max(0, Number(character.creation?.[key]) || 0);
}
function setupHindranceBenefitSpending(stats = hindrancePointStats()) {
  const items = SETUP_HINDRANCE_BENEFITS.map((definition) => {
    const count = setupCreationBenefitValue(definition.key);
    return {
      ...definition,
      count,
      spent: count * definition.cost,
    };
  });
  const spent = items.reduce((sum, item) => sum + item.spent, 0);
  const available = stats.benefitPoints;
  return {
    items,
    spent,
    available,
    remaining: available - spent,
  };
}
function setupHindranceBenefitItem(key) {
  return SETUP_HINDRANCE_BENEFITS.find((item) => item.key === key) || null;
}
function setupAttributePointStats() {
  const rules = setupCreationRules();
  const spent = ATTRIBUTE_ORDER.reduce(
    (sum, key) =>
      sum + Math.max(0, getDieStepIndex(character.attributes?.[key])),
    0,
  );
  const available = rules.normalAttributePoints + rules.extraAttributeRaises;
  return {
    ...rules,
    spent,
    available,
    remaining: available - spent,
  };
}
function setupSkillIsCoreName(name) {
  return [
    "Athletics",
    "Common Knowledge",
    "Notice",
    "Persuasion",
    "Stealth",
  ].includes(skillReferenceName(name));
}
function setupSkillPointCost(skill) {
  const skillIndex = getDieStepIndex(skill?.die || skill?.value);
  if (skillIndex < 0) return 0;
  const linkedAttribute = setupSkillAttributeKey(skillLinkedAttribute(skill));
  const attributeIndex = Math.max(
    0,
    getDieStepIndex(character.attributes?.[linkedAttribute] || "d4"),
  );
  const baseIndex = skill?.core || setupSkillIsCoreName(skill?.name) ? 0 : -1;
  let cost = 0;
  for (let index = baseIndex + 1; index <= skillIndex; index += 1)
    cost += index > attributeIndex ? 2 : 1;
  return Math.max(0, cost);
}
function setupSkillPointStats() {
  const rules = setupCreationRules();
  const spent = (character.skills || []).reduce(
    (sum, skill) => sum + setupSkillPointCost(skill),
    0,
  );
  const available = rules.normalSkillPoints + rules.extraSkillPoints;
  return {
    ...rules,
    spent,
    available,
    remaining: available - spent,
  };
}
function edgeCatalogEntry(edge) {
  const edgeId = String(edge?.id || "");
  const catalogId =
    edge?.catalogId || (edgeId.startsWith("dl-edge-") ? edgeId : "");
  const catalog = catalogId
    ? EDGE_CATALOG.find((item) => item.id === catalogId)
    : null;
  if (catalog) return catalog;

  const text = plainEntryName(edge?.name);
  if (!text) return null;
  return (
    EDGE_CATALOG.find((item) => plainEntryName(item.name) === text) || null
  );
}
function setupEdgeCreationSource(edge) {
  const explicit = plainEntryName(edge?.creationSource);
  if (explicit === "human free edge" || explicit === "human-free-edge")
    return "human-free-edge";
  if (
    explicit === "hindrance benefit edge" ||
    explicit === "hindrance-benefit" ||
    explicit === "hindrance purchased edge"
  )
    return "hindrance-benefit";

  const source = plainEntryName(edge?.source);
  if (source === "human free edge") return "human-free-edge";
  if (
    source === "hindrance benefit edge" ||
    source === "hindrance purchased edge"
  )
    return "hindrance-benefit";
  return "";
}
function setupHumanFreeEdges() {
  return (character.edges || []).filter(
    (edge) => setupEdgeCreationSource(edge) === "human-free-edge",
  );
}
function setupExpectedHumanFreeEdges() {
  return isHumanAncestry(character.ancestry) ? 1 : 0;
}
function setupHindranceBenefitEdges() {
  return (character.edges || []).filter(
    (edge) => setupEdgeCreationSource(edge) === "hindrance-benefit",
  );
}
function setupStartingEdgeSlotCount(source) {
  if (source === "human-free-edge") return setupExpectedHumanFreeEdges();
  if (source === "hindrance-benefit")
    return setupCreationBenefitValue("extraEdgesFromHindrances");
  return 0;
}
function setupStartingEdgeSourceLabel(source) {
  if (source === "human-free-edge") return "Human free Edge";
  if (source === "hindrance-benefit") return "Hindrance benefit Edge";
  return "Starting Edge";
}
function setupSourceTrackedStartingEdges() {
  return (character.edges || []).filter((edge) =>
    ["human-free-edge", "hindrance-benefit"].includes(
      setupEdgeCreationSource(edge),
    ),
  );
}
function setupStartingEdgeDuplicateNames() {
  const counts = new Map();
  setupSourceTrackedStartingEdges().forEach((edge) => {
    const name = plainEntryName(edge.name);
    if (!name) return;
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name),
  );
}
function validateSetupStartingEdge(edge, options = {}) {
  const source = options.creationSource || setupEdgeCreationSource(edge);
  const sourceLabel = setupStartingEdgeSourceLabel(source);
  const messages = [];

  if (!["human-free-edge", "hindrance-benefit"].includes(source)) {
    return { valid: true, messages, source, sourceLabel, catalog: null };
  }

  const catalog = edgeCatalogEntry(edge);
  if (!catalog) {
    messages.push(
      `${sourceLabel} no longer satisfies starting Edge eligibility: catalog match not found.`,
    );
  } else {
    const eligibility = setupEdgeEligibility(catalog);
    if (!eligibility.eligible) {
      messages.push(
        `${sourceLabel} no longer satisfies starting Edge eligibility: ${
          eligibility.reason || "requirements are not met"
        }.`,
      );
    }
  }

  const edgeName = plainEntryName(edge.name || catalog?.name);
  const duplicate = edgeName
    ? (character.edges || []).some(
        (item) =>
          item.id !== edge.id && plainEntryName(item.name) === edgeName,
      )
    : false;
  if (duplicate) {
    messages.push(
      `${sourceLabel} duplicates another selected starting Edge.`,
    );
  }

  const slotCount = setupStartingEdgeSlotCount(source);
  const sameSource = source === "human-free-edge"
    ? setupHumanFreeEdges()
    : setupHindranceBenefitEdges();
  const position = sameSource.findIndex((item) => item.id === edge.id);
  if (position >= 0 && position >= slotCount) {
    messages.push(
      `${sourceLabel} is above the available starting Edge slot count.`,
    );
  }

  return {
    valid: messages.length === 0,
    messages,
    source,
    sourceLabel,
    catalog,
  };
}
function setupStartingEdgeValidationReport() {
  const editable = setupTraitsEditable();
  const expectedHumanEdges = setupExpectedHumanFreeEdges();
  const humanFreeEdges = setupHumanFreeEdges();
  const hindranceEdgeSlots = setupCreationBenefitValue(
    "extraEdgesFromHindrances",
  );
  const hindranceBenefitEdges = setupHindranceBenefitEdges();
  const invalidEdges = [];

  if (editable) {
    setupSourceTrackedStartingEdges().forEach((edge) => {
      const validation = validateSetupStartingEdge(edge);
      if (!validation.valid) invalidEdges.push({ edge, validation });
    });
  }

  return {
    editable,
    expectedHumanEdges,
    humanFreeEdges,
    hindranceEdgeSlots,
    hindranceBenefitEdges,
    missingHumanFreeEdges: Math.max(
      0,
      expectedHumanEdges - humanFreeEdges.length,
    ),
    missingHindranceBenefitEdges: Math.max(
      0,
      hindranceEdgeSlots - hindranceBenefitEdges.length,
    ),
    tooManyHumanFreeEdges: Math.max(
      0,
      humanFreeEdges.length - expectedHumanEdges,
    ),
    tooManyHindranceBenefitEdges: Math.max(
      0,
      hindranceBenefitEdges.length - hindranceEdgeSlots,
    ),
    duplicateStartingEdgeNames: setupStartingEdgeDuplicateNames(),
    invalidEdges,
    ambiguousManualReviewEdges: editable
      ? []
      : setupSourceTrackedStartingEdges(),
  };
}
function setupEdgeSelectionStatus() {
  const edges = character.edges || [];
  const arcaneEdgeCount = edges.filter((edge) =>
    isArcaneBackgroundEdge(edge.name),
  ).length;
  if (!setupTraitsEditable()) {
    if (!edges.length) return "Incomplete";
    return arcaneEdgeCount > 1 ? "Needs review" : "Complete";
  }
  const report = setupStartingEdgeValidationReport();
  const humanEdges = report.humanFreeEdges.length;
  const hindranceEdges = report.hindranceBenefitEdges.length;

  if (
    arcaneEdgeCount > 1 ||
    report.tooManyHumanFreeEdges ||
    report.tooManyHindranceBenefitEdges ||
    report.invalidEdges.length
  )
    return "Needs review";
  if (report.missingHumanFreeEdges) return "Incomplete";
  if (report.missingHindranceBenefitEdges) return "Incomplete";
  return edges.length ? "Complete" : "Incomplete";
}
const SETUP_EDGE_RANKS = [
  "novice",
  "seasoned",
  "veteran",
  "heroic",
  "legendary",
];
function setupEdgeRankValue(rank) {
  const text = plainEntryName(rank || "Novice");
  const index = SETUP_EDGE_RANKS.indexOf(text);
  return index < 0 ? 0 : index;
}
function setupCurrentRankValue() {
  return setupEdgeRankValue(character.rank || "Novice");
}
function setupHasEdgeNamed(name) {
  const text = plainEntryName(name);
  return (character.edges || []).some(
    (edge) => plainEntryName(edge.name) === text,
  );
}
function setupEdgeRequirementTraitDie(traitName) {
  const attributeDie = getAttributeDie(character, traitName);
  if (attributeDie) return attributeDie;
  return getSkillDie(character, traitName);
}
function setupDieRequirementMet(traitName, requiredDie) {
  const die = setupEdgeRequirementTraitDie(traitName);
  return getDieStepIndex(die) >= getDieStepIndex(requiredDie);
}
function setupRequirementTextIsRankOnly(text) {
  if (!text) return true;
  if (text === "novice" || text === "wild card") return true;
  if (text === "none beyond rank" || text === "rank") return true;
  return SETUP_EDGE_RANKS.includes(text);
}
function setupEdgeRequirementPartMet(part) {
  const text = String(part || "").trim();
  const normalized = plainEntryName(text);
  if (setupRequirementTextIsRankOnly(normalized)) return true;

  const dieMatch = text.match(/^(.+?)\s+d(4|6|8|10|12)\+$/i);
  if (dieMatch) {
    const [, traitText, sides] = dieMatch;
    const requiredDie = `d${sides}`;
    const options = traitText
      .split(/\s+(?:or)\s+|\/|;/i)
      .map((item) => item.trim())
      .filter(Boolean);
    return options.some((name) => setupDieRequirementMet(name, requiredDie));
  }

  const edgeRequirement = EDGE_CATALOG.find(
    (edge) => plainEntryName(edge.name) === normalized,
  );
  if (edgeRequirement) return setupHasEdgeNamed(edgeRequirement.name);

  return false;
}
function setupEdgeEligibility(edge) {
  const rank = edge?.rank || "Novice";
  if (setupEdgeRankValue(rank) > setupCurrentRankValue()) {
    return {
      eligible: false,
      reason: `${rank} Edge; starting characters can only choose rank-legal Edges.`,
    };
  }

  const requirements = String(edge?.requirements || "").trim();
  if (!requirements) return { eligible: true, reason: "" };
  const unmet = requirements
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !setupEdgeRequirementPartMet(part));

  return {
    eligible: unmet.length === 0,
    reason: unmet.length ? `Missing requirement: ${unmet.join(", ")}` : "",
  };
}
function setupEligibleStartingEdges() {
  const selectedNames = new Set(
    (character.edges || [])
      .filter((edge) => edge.name)
      .map((edge) => plainEntryName(edge.name)),
  );
  return EDGE_CATALOG.filter(
    (edge) =>
      !selectedNames.has(plainEntryName(edge.name)) &&
      setupEdgeEligibility(edge).eligible,
  );
}
